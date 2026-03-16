import { NextRequest, NextResponse } from "next/server";
import { parseCertificate, validateIssuer } from "@/lib/certificate";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("certificate") as File | null;
    const password = (formData.get("password") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["p12", "pfx"].includes(ext || "")) {
      return NextResponse.json(
        { error: "El archivo debe ser un certificado .p12 o .pfx" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const certData = await parseCertificate(buffer, password);

    if (!certData.isValid) {
      return NextResponse.json(
        { error: "El certificado ha caducado o no es válido aún" },
        { status: 400 }
      );
    }

    const issuerCheck = validateIssuer(certData.issuer);
    if (!issuerCheck.valid) {
      return NextResponse.json(
        { error: "El certificado no ha sido emitido por una entidad reconocida (FNMT, DNIe, etc.)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: certData.commonName,
        dni: certData.dni,
        issuer: issuerCheck.entity,
        validTo: certData.validTo,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar el certificado" },
      { status: 400 }
    );
  }
}
