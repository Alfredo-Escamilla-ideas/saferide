import { NextRequest, NextResponse } from "next/server";
import { parseCertificate, validateIssuer } from "@/lib/certificate";
import { createSession } from "@/lib/session";
import pool from "@/lib/mysql";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("certificate") as File | null;
    const password = (formData.get("password") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado el certificado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const certData = await parseCertificate(buffer, password);

    if (!certData.isValid) {
      return NextResponse.json({ error: "El certificado ha caducado" }, { status: 400 });
    }

    const issuerCheck = validateIssuer(certData.issuer);
    if (!issuerCheck.valid) {
      return NextResponse.json({ error: "Certificado no reconocido" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, name, role, active, blocked FROM users WHERE dni = ?",
        [certData.dni]
      ) as any[];

      const user = rows[0] || null;

      if (!user) {
        return NextResponse.json(
          { error: "No existe ninguna cuenta con este certificado. ¿Quieres registrarte?" },
          { status: 404 }
        );
      }

      if (user.blocked) {
        return NextResponse.json({ error: "Tu cuenta ha sido bloqueada. Contacta con soporte." }, { status: 403 });
      }

      if (!user.active) {
        return NextResponse.json({ error: "Tu cuenta está desactivada." }, { status: 403 });
      }

      await conn.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

      const token = await createSession({
        userId: user.id,
        dni: certData.dni,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({ success: true, name: user.name, role: user.role });
      response.cookies.set("saferide_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    } finally {
      conn.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
