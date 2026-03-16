/**
 * security-cleanup.ts
 * Verificaciones de seguridad y gestión de limpieza del sistema SafeRide.
 * Se ejecuta automáticamente cada hora.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Configuración ────────────────────────────────────────────────────────────

const CONFIG = {
  // Sesiones inactivas más de N horas se invalidan
  SESSION_EXPIRY_HOURS: 24,
  // Viajes no completados en más de N horas pasan a "expirado"
  RIDE_EXPIRY_HOURS: 2,
  // Intentos de login fallidos antes de bloquear la cuenta
  MAX_FAILED_LOGINS: 5,
  // Logs de auditoría más antiguos de N días se archivan
  AUDIT_LOG_RETENTION_DAYS: 90,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SecurityReport {
  timestamp: string;
  checks: {
    name: string;
    status: "ok" | "warning" | "error";
    detail: string;
    affected?: number;
  }[];
}

// ─── Verificaciones de seguridad ─────────────────────────────────────────────

/**
 * Invalida sesiones expiradas o sospechosas.
 */
async function checkExpiredSessions(): Promise<SecurityReport["checks"][0]> {
  try {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() - CONFIG.SESSION_EXPIRY_HOURS);

    const { count, error } = await supabase
      .from("sessions")
      .update({ active: false, invalidated_at: new Date().toISOString() }, { count: "exact" })
      .lt("last_activity", expiryTime.toISOString())
      .eq("active", true);

    if (error) throw error;

    return {
      name: "Sesiones expiradas",
      status: "ok",
      detail: `Sesiones invalidadas correctamente`,
      affected: count ?? 0,
    };
  } catch (err) {
    return {
      name: "Sesiones expiradas",
      status: "error",
      detail: `Error al invalidar sesiones: ${err}`,
    };
  }
}

/**
 * Detecta cuentas con demasiados intentos de login fallidos y las bloquea.
 */
async function checkFailedLogins(): Promise<SecurityReport["checks"][0]> {
  try {
    const { data, error } = await supabase
      .from("login_attempts")
      .select("user_id, count")
      .gte("count", CONFIG.MAX_FAILED_LOGINS)
      .eq("resolved", false);

    if (error) throw error;

    const blocked = data?.length ?? 0;

    if (blocked > 0) {
      const userIds = data!.map((r) => r.user_id);
      await supabase
        .from("users")
        .update({ blocked: true, blocked_at: new Date().toISOString() })
        .in("id", userIds);
    }

    return {
      name: "Intentos de login fallidos",
      status: blocked > 0 ? "warning" : "ok",
      detail:
        blocked > 0
          ? `${blocked} cuenta(s) bloqueada(s) por exceso de intentos`
          : "Sin actividad sospechosa detectada",
      affected: blocked,
    };
  } catch (err) {
    return {
      name: "Intentos de login fallidos",
      status: "error",
      detail: `Error en verificación: ${err}`,
    };
  }
}

/**
 * Marca como expirados los viajes que llevan demasiado tiempo en estado pendiente.
 */
async function checkStaleRides(): Promise<SecurityReport["checks"][0]> {
  try {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() - CONFIG.RIDE_EXPIRY_HOURS);

    const { count, error } = await supabase
      .from("rides")
      .update({ status: "expired", updated_at: new Date().toISOString() }, { count: "exact" })
      .in("status", ["pending", "searching"])
      .lt("created_at", expiryTime.toISOString());

    if (error) throw error;

    return {
      name: "Viajes bloqueados",
      status: "ok",
      detail: `Viajes expirados resueltos`,
      affected: count ?? 0,
    };
  } catch (err) {
    return {
      name: "Viajes bloqueados",
      status: "error",
      detail: `Error al limpiar viajes: ${err}`,
    };
  }
}

/**
 * Archiva logs de auditoría antiguos para no sobrecargar la base de datos.
 */
async function archiveOldAuditLogs(): Promise<SecurityReport["checks"][0]> {
  try {
    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() - CONFIG.AUDIT_LOG_RETENTION_DAYS
    );

    const { count, error } = await supabase
      .from("audit_logs")
      .update({ archived: true }, { count: "exact" })
      .lt("created_at", retentionDate.toISOString())
      .eq("archived", false);

    if (error) throw error;

    return {
      name: "Archivo de logs",
      status: "ok",
      detail: `Logs archivados correctamente`,
      affected: count ?? 0,
    };
  } catch (err) {
    return {
      name: "Archivo de logs",
      status: "error",
      detail: `Error al archivar logs: ${err}`,
    };
  }
}

/**
 * Verifica que los certificados digitales de conductoras siguen siendo válidos.
 */
async function checkExpiredCertificates(): Promise<SecurityReport["checks"][0]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("role", "driver")
      .eq("active", true)
      .lt("certificate_expires_at", now);

    if (error) throw error;

    const expired = data?.length ?? 0;

    if (expired > 0) {
      const userIds = data!.map((u) => u.id);
      await supabase
        .from("users")
        .update({
          active: false,
          deactivated_reason: "certificate_expired",
          deactivated_at: now,
        })
        .in("id", userIds);
    }

    return {
      name: "Certificados digitales",
      status: expired > 0 ? "warning" : "ok",
      detail:
        expired > 0
          ? `${expired} conductora(s) desactivada(s) por certificado caducado`
          : "Todos los certificados están vigentes",
      affected: expired,
    };
  } catch (err) {
    return {
      name: "Certificados digitales",
      status: "error",
      detail: `Error al verificar certificados: ${err}`,
    };
  }
}

// ─── Ejecución principal ──────────────────────────────────────────────────────

export async function runSecurityCleanup(): Promise<SecurityReport> {
  console.log(`[SafeRide Security] Iniciando verificación: ${new Date().toISOString()}`);

  const [sessions, logins, rides, logs, certificates] = await Promise.all([
    checkExpiredSessions(),
    checkFailedLogins(),
    checkStaleRides(),
    archiveOldAuditLogs(),
    checkExpiredCertificates(),
  ]);

  const report: SecurityReport = {
    timestamp: new Date().toISOString(),
    checks: [sessions, logins, rides, logs, certificates],
  };

  // Mostrar resumen en consola
  report.checks.forEach((check) => {
    const icon = check.status === "ok" ? "✅" : check.status === "warning" ? "⚠️" : "❌";
    console.log(`${icon} ${check.name}: ${check.detail}${check.affected !== undefined ? ` (${check.affected} registros)` : ""}`);
  });

  const hasErrors = report.checks.some((c) => c.status === "error");
  console.log(
    `[SafeRide Security] Verificación completada. Estado: ${hasErrors ? "CON ERRORES" : "OK"}`
  );

  return report;
}

// Permite ejecutar directamente con: npx ts-node scripts/security-cleanup.ts
if (require.main === module) {
  runSecurityCleanup().catch(console.error);
}
