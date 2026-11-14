import { Badge, Encabezado, Tarjeta } from "@/components/emisor/ui";
import Toast from "@/components/emisor/Toast";
import { rellenar } from "@/components/aviso/textos";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import BarraNavegacion from "./BarraNavegacion";
import ControlAviso from "./ControlAviso";
import PlazoActivo from "./PlazoActivo";
import type { TextosInicio } from "./textosInicio";

// E-02 · Inicio con el aviso encendido y sin alerta. "Estoy bien" (confirmar) es otra tarea del
// flujo y todavía no está: aquí solo se ve el plazo, el interruptor y "Editar" (apaga primero).
export default function InicioActivo({
  t,
  app,
  nombre,
  plazo,
  encendidoAhora,
}: {
  t: TextosInicio;
  app: string;
  nombre: string;
  plazo: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
  encendidoAhora: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface-muted">
      <main className="flex-1 space-y-4 p-4">
        {encendidoAhora && <Toast texto={t.encendido} quitarParametro="encendido" />}
        <Encabezado nombre={app} />
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        <Tarjeta>
          <div>
            <Badge>{t.activo}</Badge>
          </div>
          <h2 className="text-lg font-semibold">{t.tuAviso}</h2>
          <PlazoActivo t={t} fireAt={plazo.fireAt} frecuencia={plazo.frecuencia} dias={plazo.dias} />
          <ControlAviso t={t} encendido fireAt={plazo.fireAt} frecuencia={plazo.frecuencia} dias={plazo.dias} conEditar />
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
