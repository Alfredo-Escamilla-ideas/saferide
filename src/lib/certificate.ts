/**
 * certificate.ts
 * Utilidades para parsear y validar certificados digitales españoles.
 * Soporta DNIe y certificados FNMT (.p12 / .pfx).
 */

import forge from "node-forge";

export interface CertificateData {
  commonName: string;       // Nombre completo del titular
  dni: string;              // DNI/NIE extraído del certificado
  issuer: string;           // Entidad emisora (FNMT, DNIE, etc.)
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  isValid: boolean;
  rawSubject: string;
}

/**
 * Extrae el valor de un campo del subject/issuer del certificado.
 */
function getAttribute(obj: forge.pki.Certificate["subject"], field: string): string {
  const attr = obj.getField(field);
  return attr ? attr.value : "";
}

/**
 * Intenta extraer el DNI/NIE del certificado.
 * En los certificados españoles suele estar en el CN o en el serialNumber del subject.
 */
function extractDNI(cert: forge.pki.Certificate): string {
  // Intentar extraído del CN (formato habitual FNMT: "APELLIDO APELLIDO, NOMBRE - 12345678A")
  const cn = getAttribute(cert.subject, "CN");
  const dniFromCN = cn.match(/\b(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])\b/);
  if (dniFromCN) return dniFromCN[1];

  // Intentar desde el serialNumber del subject
  const sn = getAttribute(cert.subject, "serialNumber");
  if (sn) {
    const dniFromSN = sn.match(/^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/);
    if (dniFromSN) return dniFromSN[1];
    // Formato "IDCES-12345678A"
    const dniFromIDCES = sn.match(/IDCES-(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])/);
    if (dniFromIDCES) return dniFromIDCES[1];
  }

  return "";
}

/**
 * Extrae el nombre limpio del CN.
 * El CN de FNMT suele tener formato "APELLIDO APELLIDO, NOMBRE - DNI"
 */
function extractName(cn: string): string {
  // Quitar la parte del DNI si existe
  const withoutDNI = cn.replace(/\s*-\s*\d{8}[A-Z]/, "").replace(/\s*-\s*[XYZ]\d{7}[A-Z]/, "");
  // Reordenar de "APELLIDO, NOMBRE" a "NOMBRE APELLIDO" si hay coma
  if (withoutDNI.includes(",")) {
    const [apellidos, nombre] = withoutDNI.split(",").map((s) => s.trim());
    return `${nombre} ${apellidos}`;
  }
  return withoutDNI.trim();
}

/**
 * Parsea un certificado .p12/.pfx y devuelve los datos del titular.
 * @param p12Buffer - Buffer del archivo .p12/.pfx
 * @param password  - Contraseña del certificado (puede ser vacía "")
 */
export async function parseCertificate(
  p12Buffer: Buffer,
  password: string
): Promise<CertificateData> {
  try {
    const p12Der = p12Buffer.toString("binary");
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Extraer certificados del bag
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const bags = certBags[forge.pki.oids.certBag];

    if (!bags || bags.length === 0) {
      throw new Error("No se encontraron certificados en el archivo");
    }

    // Usar el primer certificado de usuario (no el de la CA)
    const cert = bags[0].cert!;

    const cn = getAttribute(cert.subject, "CN");
    const issuerCN = getAttribute(cert.issuer, "O") || getAttribute(cert.issuer, "CN");

    const now = new Date();
    const isValid = now >= cert.validity.notBefore && now <= cert.validity.notAfter;

    return {
      commonName: extractName(cn),
      dni: extractDNI(cert),
      issuer: issuerCN,
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
      serialNumber: cert.serialNumber,
      isValid,
      rawSubject: cn,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid password")) {
      throw new Error("Contraseña del certificado incorrecta");
    }
    throw new Error(`Error al leer el certificado: ${err instanceof Error ? err.message : "formato no reconocido"}`);
  }
}

/**
 * Simula la validación del certificado contra las CAs españolas reconocidas.
 * En producción real se haría una consulta OCSP o CRL.
 */
export function validateIssuer(issuer: string): { valid: boolean; entity: string } {
  const trustedIssuers = [
    { match: /FNMT|Fábrica Nacional/i, entity: "FNMT-RCM" },
    { match: /DNIE|Dirección General de la Policía|DGP/i, entity: "DNIe" },
    { match: /ACCV|Agencia de Tecnología/i, entity: "ACCV" },
    { match: /Camerfirma/i, entity: "Camerfirma" },
    { match: /IZENPE/i, entity: "Izenpe" },
  ];

  for (const { match, entity } of trustedIssuers) {
    if (match.test(issuer)) return { valid: true, entity };
  }

  // En desarrollo/demo, aceptamos cualquier emisor para poder probar
  if (process.env.NODE_ENV === "development" || process.env.DEMO_MODE === "true") {
    return { valid: true, entity: issuer || "Emisor de prueba" };
  }

  return { valid: false, entity: issuer };
}
