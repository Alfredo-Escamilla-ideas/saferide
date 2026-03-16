import { NextResponse } from "next/server";
import { runSecurityCleanup } from "@/lib/security-cleanup";

// Vercel Cron: ejecutar cada hora
// vercel.json → "crons": [{ "path": "/api/cron/security", "schedule": "0 * * * *" }]

export async function GET(request: Request) {
  // Proteger el endpoint con una clave secreta
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runSecurityCleanup();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("[Cron Security] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
