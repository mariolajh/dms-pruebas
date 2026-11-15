import { NextRequest, NextResponse } from "next/server";

// POST /api/push/diagnostico  { paso, error, permiso, agente }
// Temporal, solo para las pruebas: deja en los registros de Vercel por qué falló activar las notificaciones.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const limpio = (v: unknown) => String(v ?? "").slice(0, 300);
  console.error(
    "[push-diagnostico]",
    JSON.stringify({ paso: limpio(b?.paso), error: limpio(b?.error), permiso: limpio(b?.permiso), agente: limpio(b?.agente) })
  );
  return NextResponse.json({ ok: true });
}
