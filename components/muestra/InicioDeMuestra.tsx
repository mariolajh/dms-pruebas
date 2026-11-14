"use client";

import { useEffect, useState } from "react";
import InicioActivo from "@/components/home/InicioActivo";
import InicioApagado from "@/components/home/InicioApagado";
import type { TextosInicio } from "@/components/home/textosInicio";

// Inicio de /muestra. La hora del aviso de ejemplo (8:00 p. m.) se calcula en el navegador
// para que cada persona la vea en su hora local.
type Estado = "esperando" | "apagado" | "activo";

function proximasOcho() {
  const d = new Date();
  d.setHours(20, 0, 0, 0);
  // Si ya está cerca o pasó, mañana: la muestra enseña el aviso encendido en reposo.
  if (d.getTime() - Date.now() < 60 * 60_000) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export default function InicioDeMuestra({ t, app, estado }: { t: TextosInicio; app: string; estado: Estado }) {
  const [fireAt, setFireAt] = useState<string | null>(null);
  useEffect(() => setFireAt(proximasOcho()), []);
  if (!fireAt) return <div aria-hidden="true" className="min-h-dvh" />;

  const plazo = { fireAt, frecuencia: "daily" as const, dias: [] };
  if (estado === "activo") return <InicioActivo t={t} app={app} nombre="Mariana" plazo={plazo} encendidoAhora={false} />;
  return (
    <InicioApagado
      t={t}
      app={app}
      nombre="Mariana"
      aceptados={estado === "apagado" ? ["Ana"] : []}
      pendientes={estado === "apagado" ? ["Luis"] : ["Ana", "Luis"]}
      sinEnviar={[]}
      rechazados={[]}
      vacio={false}
      plazo={plazo}
      apagadoAhora={false}
    />
  );
}
