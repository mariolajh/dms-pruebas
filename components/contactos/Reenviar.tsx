"use client";

import { useActionState, useRef } from "react";
import Toast from "@/components/emisor/Toast";
import { reenviarInvitacion, type EstadoReenviar } from "@/app/contactos/actions";
import { clases } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// E5 · Reenviar (decidido el 2/11). Solo dice "reenviada" si el correo salió.
export default function Reenviar({ contactId, nombre, t }: { contactId: string; nombre: string; t: TextosContactos["lista"] }) {
  const [estado, accion, enviando] = useActionState<EstadoReenviar, FormData>(reenviarInvitacion, {});
  // Cada respuesta nueva reinicia el toast (sale otra vez aunque pulses dos veces).
  const ultimo = useRef(estado);
  const envios = useRef(0);
  if (ultimo.current !== estado) {
    ultimo.current = estado;
    envios.current += 1;
  }
  return (
    <form action={accion}>
      <input type="hidden" name="contact_id" value={contactId} />
      <button type="submit" disabled={enviando} className={clases.enlace} aria-label={`${t.reenviar} a ${nombre}`}>
        {enviando ? t.reenviando : t.reenviar}
      </button>
      {/* Éxito: toast temporal. Error: texto fijo, porque pide una acción. La clave reinicia el toast en cada envío. */}
      {estado.ok && <Toast key={envios.current} texto={t.reenviada} />}
      {estado.error && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
    </form>
  );
}
