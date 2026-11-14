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
