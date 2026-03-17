import { NextRequest, NextResponse } from "next/server";
import { parseCertificate, validateIssuer } from "@/lib/certificate";
import { createSession } from "@/lib/session";
import getDB from "@/lib/db";

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

    // Comprobar si ya existe
    const existing = await getDB()`SELECT id FROM users WHERE dni = ${certData.dni}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este certificado digital" },
        { status: 409 }
      );
    }

    // Crear usuaria
    const [newUser] = await getDB()`
      INSERT INTO users (name, dni, phone, role, certificate_issuer, certificate_expires_at)
      VALUES (${certData.commonName}, ${certData.dni}, ${phone}, ${role}, ${issuerCheck.entity}, ${certData.validTo})
      RETURNING id
    `;

    if (role === "driver" && vehicleBrand && vehicleModel && vehiclePlate) {
      await getDB()`
        INSERT INTO vehicles (user_id, brand, model, plate)
        VALUES (${newUser.id}, ${vehicleBrand}, ${vehicleModel}, ${vehiclePlate.toUpperCase()})
      `;
    }

    const token = await createSession({
      userId: newUser.id,
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
