// Solo servidor. No es un archivo de acciones: no se puede llamar desde el navegador.
import { Client } from "@upstash/qstash";

// Borra el disparo programado de un aviso que se apaga. Si ya se disparó o no existe, no pasa nada:
// /api/alert ignora los avisos que no están activos.
export async function cancelarProgramado(messageId: string | null) {
  const token = process.env.QSTASH_TOKEN;
  if (!token || !messageId) return;
  try {
    await new Client({ token, baseUrl: process.env.QSTASH_URL }).messages.delete(messageId);
  } catch {
    // Se sigue: el aviso ya está apagado.
  }
}

// Sin QSTASH_TOKEN: en desarrollo se sigue sin programar (se avisa en el terminal); en producción falla.
export async function programar(noticeId: string, fire: Date): Promise<{ ok: true; messageId: string | null } | { ok: false }> {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!token || !appUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error("[qstash] faltan QSTASH_TOKEN o NEXT_PUBLIC_APP_URL");
      return { ok: false };
    }
    console.warn("[qstash] SIN QSTASH_TOKEN: el aviso queda encendido pero no se programó ningún disparo.");
    return { ok: true, messageId: null };
  }
  try {
    const qstash = new Client({ token, baseUrl: process.env.QSTASH_URL });
    const res = await qstash.publishJSON({
      url: `${appUrl}/api/alert`,
      body: { notice_id: noticeId },
      notBefore: Math.floor(fire.getTime() / 1000),
    });
    return { ok: true, messageId: "messageId" in res ? res.messageId : null };
  } catch (e) {
    console.error("[qstash] QStash falló:", e instanceof Error ? e.message : e);
    return { ok: false };
  }
}

