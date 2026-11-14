import Link from "next/link";
import { Badge, Encabezado, EnlaceBoton, Tarjeta, clases } from "@/components/emisor/ui";
import Toast from "@/components/emisor/Toast";
import { listaNombres } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { rellenar } from "@/components/aviso/textos";
import BarraNavegacion from "./BarraNavegacion";
import ControlAviso from "./ControlAviso";
import type { TextosInicio } from "./textosInicio";

// E-02 · Inicio con el aviso apagado: "Esperando contactos" (nadie aceptó) o "Apagado" con el
// interruptor para encenderlo (hay al menos un contacto aceptado). También "Tu aviso se apagó"
// cuando se fue el último contacto aceptado (E-22).
export default function InicioApagado({
  t,
  app,
  nombre,
  pendientes,
  rechazados,
  sinEnviar,
  vacio,
  aceptados,
  seApago,
  plazo,
  apagadoAhora,
}: {
  t: TextosInicio;
  app: string;
  nombre: string;
  pendientes: string[];
  rechazados: string[];
  sinEnviar: string[];
  vacio: boolean;
  aceptados: string[];
  seApago: boolean;
  plazo: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
  apagadoAhora: boolean;
}) {
  const hayAceptado = aceptados.length > 0;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface-muted">
      <main className="flex-1 space-y-4 p-4">
        {apagadoAhora && <Toast texto={t.apagadoListo} quitarParametro="apagado" />}
        <Encabezado nombre={app} />
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        {seApago && !hayAceptado && (
          <section role="status" className="space-y-1 rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold">{t.seApago}</h2>
            <p className="text-text-muted">{t.seApagoTexto}</p>
          </section>
        )}
        <Tarjeta>
          {/* Orden de lectura: primero el estado y el título, después "Editar". */}
          <div className="flex items-center justify-between gap-2">
            <Badge>{hayAceptado ? t.apagado : t.esperando}</Badge>
            <Link href="/aviso" className={clases.enlace} aria-label={t.editarAria}>
              {t.editar}
            </Link>
          </div>
          <h2 className="text-lg font-semibold">{t.tuAviso}</h2>
          {vacio && <p className="font-medium">{t.avisoSinContactos}</p>}
          {hayAceptado && <p className="text-text-muted">{rellenar(t.enciendelo, { nombres: listaNombres(aceptados) })}</p>}
          {!hayAceptado && !vacio && (
            <p className="text-text-muted">
              {t.podras}{" "}
              {pendientes.length > 0 &&
                rellenar(pendientes.length === 1 ? t.aunNoUno : t.aunNoVarios, { nombres: listaNombres(pendientes) })}
            </p>
          )}
          {sinEnviar.length > 0 && (
            <p className="font-medium">{rellenar(sinEnviar.length === 1 ? t.noEnviadaUno : t.noEnviadaVarios, { nombres: listaNombres(sinEnviar) })}</p>
          )}
          {rechazados.length > 0 && (
            <p className="font-medium">{rellenar(rechazados.length === 1 ? t.rechazoUno : t.rechazoVarios, { nombres: listaNombres(rechazados) })}</p>
          )}
          {hayAceptado ? (
            <ControlAviso t={t} encendido={false} fireAt={plazo.fireAt} frecuencia={plazo.frecuencia} dias={plazo.dias} />
          ) : (
            <EnlaceBoton href="/contactos" tipo="secundario">
              {t.verContactos}
            </EnlaceBoton>
          )}
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
