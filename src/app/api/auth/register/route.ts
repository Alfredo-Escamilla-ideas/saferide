import { NextRequest, NextResponse } from "next/server";
import { parseCertificate, validateIssuer } from "@/lib/certificate";
import { createSession } from "@/lib/session";
import { devDB } from "@/lib/db-dev";

const isDevMode = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://");

async function getDB() {
  if (isDevMode) return null;
  const { supabaseAdmin } = await import("@/lib/supabase");
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("certificate") as File | null;
    const password = (formData.get("password") as string) || "";
    const role = formData.get("role") as "driver" | "passenger";
    const phone = formData.get("phone") as string;
    const vehicleBrand = formData.get("vehicleBrand") as string | null;
    const vehicleModel = formData.get("vehicleModel") as string | null;
    const vehiclePlate = formData.get("vehiclePlate") as string | null;

    if (!file || !role || !phone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    if (!["driver", "passenger"].includes(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const certData = await parseCertificate(buffer, password);

    if (!certData.isValid) {
      return NextResponse.json({ error: "El certificado ha caducado" }, { status: 400 });
    }

    const issuerCheck = validateIssuer(certData.issuer);
    if (!issuerCheck.valid) {
      return NextResponse.json(
        { error: "Certificado no reconocido. Usa tu DNIe o certificado FNMT." },
        { status: 400 }
      );
    }

    let newUserId: string;

    if (isDevMode) {
      // ── Modo desarrollo: JSON local ──────────────────────────────────
      const existing = devDB.users.findByDNI(certData.dni);
      if (existing) {
        return NextResponse.json(
          { error: "Ya existe una cuenta registrada con este certificado digital" },
          { status: 409 }
        );
      }

      const newUser = devDB.users.insert({
        name: certData.commonName,
        dni: certData.dni,
        phone,
        role,
        certificate_issuer: issuerCheck.entity,
        certificate_expires_at: certData.validTo.toISOString(),
        active: true,
      });

      if (role === "driver" && vehicleBrand && vehicleModel && vehiclePlate) {
        devDB.vehicles.insert({
          user_id: newUser.id,
          brand: vehicleBrand,
          model: vehicleModel,
          plate: vehiclePlate.toUpperCase(),
          active: true,
        });
      }

      newUserId = newUser.id;
    } else {
      // ── Producción: Supabase ─────────────────────────────────────────
      const db = await getDB();

      const { data: existing } = await db!
        .from("users")
        .select("id")
        .eq("dni", certData.dni)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "Ya existe una cuenta registrada con este certificado digital" },
          { status: 409 }
        );
      }

      const { data: newUser, error: insertError } = await db!
        .from("users")
        .insert({
          name: certData.commonName,
          dni: certData.dni,
          phone,
          role,
          certificate_issuer: issuerCheck.entity,
          certificate_expires_at: certData.validTo.toISOString(),
          active: true,
        })
        .select("id")
        .single();

      if (insertError || !newUser) {
        console.error("Error al crear usuaria:", insertError);
        return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
      }

      if (role === "driver" && vehicleBrand && vehicleModel && vehiclePlate) {
        await db!.from("vehicles").insert({
          user_id: newUser.id,
          brand: vehicleBrand,
          model: vehicleModel,
          plate: vehiclePlate.toUpperCase(),
          active: true,
        });
      }

      newUserId = newUser.id;
    }

    const token = await createSession({
      userId: newUserId,
      dni: certData.dni,
      name: certData.commonName,
      role,
    });

    const response = NextResponse.json({ success: true, name: certData.commonName, role });
    response.cookies.set("saferide_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Error en registro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
