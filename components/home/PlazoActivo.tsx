"use client";

import { useEffect, useState } from "react";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { DIAS, diaRelativo, horaCorta } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosInicio } from "./textosInicio";

// Frecuencia, hora y próxima confirmación del aviso encendido (E-02 Activo). Se calcula en el
// navegador: la hora del servidor puede ser otra zona horaria.
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default function PlazoActivo({
  t,
  fireAt,
  frecuencia,
  dias,
}: {
  t: TextosInicio;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
}) {
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  if (!listo) return <div aria-hidden="true" className="min-h-24" />;

  const plazo = new Date(fireAt);
  const desde = new Date(plazo.getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
  const cuando =
    frecuencia === "daily"
      ? t.frecuenciaDiaria
      : frecuencia === "weekly"
        ? DIAS.filter((d) => dias.includes(d.valor))
            .map((d) => d.nombre)
            .join(", ")
            .replace(/^./, (c) => c.toUpperCase())
        : t.frecuenciaHoy;
  const dia = diaRelativo(plazo);
  const diaTexto = (dia === "hoy" ? "Hoy" : dia === "ayer" ? "Ayer" : dia).replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="space-y-3">
      <p className="text-text-muted">
        {cuando} · {rellenar(t.regreso, { hora: horaCorta(hhmm(plazo)) })}
      </p>
      <div>
        <p className="font-semibold">{t.proximaConfirmacion}</p>
        <p className="text-text-muted">
          {rellenar(t.ventana, { dia: diaTexto, desde: horaCorta(hhmm(desde)), hasta: horaCorta(hhmm(plazo)) })}
        </p>
      </div>
    </div>
  );
}
