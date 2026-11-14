"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encenderAviso, apagarAviso } from "@/app/aviso/encender";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { horaCorta, proximoPlazo } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import { clases } from "@/components/emisor/ui";
import Spinner from "@/components/emisor/Spinner";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosInicio } from "./textosInicio";

// Interruptor para encender y apagar el aviso (E-02 Apagado y Activo, E-12 y E-14 del wireflow).
// Encender: sin diálogo (nota del flujo). Apagar: pide confirmar. "Editar" no vive aquí: es un botón
// aparte que está desactivado con el aviso encendido y se activa al apagarlo (decisión de Mariola 14/11).
// Los errores no se esconden: "Reintentar".

function horaDe(d: Date) {
  return horaCorta(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

type Fase = "reposo" | "enviando" | "error" | "confirmando";

export default function ControlAviso({
  t,
  encendido,
  fireAt,
  frecuencia,
  dias,
  estado,
  detalle,
  notaEditar,
}: {
  // Aviso bajo el interruptor ("Para editarlo, apaga primero"). No sale mientras no se puede apagar.
  notaEditar?: string;
  // Con estado, el interruptor va a la derecha de un bloque con el estado y su explicación (Inicio apagado).
  estado?: string;
  detalle?: string;
  t: TextosInicio;
  encendido: boolean;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
}) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("reposo");
  const [error, setError] = useState<string | null>(null);
  const [, empezar] = useTransition();
  const [bloqueado, setBloqueado] = useState(false);
  const aviso = useRef<HTMLDivElement>(null);
  const pregunta = useRef<HTMLParagraphElement>(null);

  // Mientras se espera la confirmación no se puede apagar (ventana antes de la hora y tiempo de gracia).
  useEffect(() => {
    const calcula = () => setBloqueado(encendido && Date.now() >= new Date(fireAt).getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
    calcula();
    const id = setInterval(calcula, 30_000);
    return () => clearInterval(id);
  }, [encendido, fireAt]);

  useEffect(() => {
    if (fase === "confirmando") pregunta.current?.focus();
    if (fase === "error") aviso.current?.focus();
  }, [fase]);

  function encender() {
    setFase("enviando");
    setError(null);
    // El plazo se calcula aquí, con la zona horaria de la persona. Si el guardado sigue vigente se respeta.
    let plazo = new Date(fireAt);
    if (plazo.getTime() - Date.now() < 60_000) {
      const d = new Date(fireAt);
      const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const siguiente = proximoPlazo(hhmm, frecuencia, dias);
      if (!siguiente) {
        setError(t.encender.horaPasada);
        setFase("error");
        return;
      }
      plazo = siguiente;
    }
    empezar(async () => {
      const r = await encenderAviso(plazo.toISOString()).catch(() => ({ ok: false as const, error: t.encender.error }));
      if (r.ok) {
        router.replace("/home?encendido=1");
        router.refresh();
      } else {
        setError(r.error);
        setFase("error");
      }
    });
  }

  function apagar() {
    setFase("enviando");
    setError(null);
    empezar(async () => {
      const r = await apagarAviso().catch(() => ({ ok: false as const, error: t.apagar.error }));
      if (r.ok) {
        router.replace("/home?apagado=1");
        router.refresh();
      } else {
        setError(r.error);
        setFase("error");
      }
    });
  }

  function alternar() {
    if (!encendido) encender();
    else setFase("confirmando");
  }

  const ocupado = fase === "enviando";
  const etiqueta = encendido ? t.tocaApagar : t.tocaEncender;
  const dialogo = fase === "confirmando";

  return (
    <div className="space-y-3">
      {(ocupado || fase === "error") && (
        <div
          ref={aviso}
          tabIndex={-1}
          role={fase === "error" ? "alert" : "status"}
          className={`space-y-1 rounded-lg bg-surface-muted p-3 ${fase === "error" ? "border-2 border-danger" : ""}`}
        >
          {ocupado ? (
            <>
              <p className="inline-flex items-center gap-2 font-semibold"><Spinner />{encendido ? t.apagando : t.encendiendo}</p>
              <p className="text-sm text-text-muted">{t.unMomento}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">{encendido ? t.noPudimosApagar : t.noPudimosEncender}</p>
              <p className="text-sm text-text-muted">{error ?? t.revisaConexion}</p>
              {/hora/.test(error ?? "") && !encendido && (
                // La hora ya pasó: el camino es editar el aviso, así que va un botón directo.
                <Link href="/aviso" className={clases.enlace}>
                  {t.cambiarHora}
                </Link>
              )}
              {!/hora|alerta|confirm|aceptó/.test(error ?? "") && (
                <button type="button" className={clases.enlace} onClick={() => (encendido ? apagar() : encender())}>
                  {t.reintentar}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {dialogo && (
        <div className="space-y-2 rounded-lg border-2 border-border bg-surface-muted p-3" role="group" aria-labelledby="pregunta-apagar">
          <p id="pregunta-apagar" ref={pregunta} tabIndex={-1} className="font-semibold">
            {t.apagarPregunta}
          </p>
          <p className="text-sm text-text-muted">{t.apagarTexto}</p>
          <div className="flex flex-col gap-2">
            <button type="button" className={clases.principal} onClick={apagar}>
              {t.apagarBoton}
            </button>
            <button type="button" className={clases.secundario} onClick={() => setFase("reposo")}>
              {t.dejarActivo}
            </button>
          </div>
        </div>
      )}

      {!dialogo && (
        <>
          {(() => {
            const interruptor = (
              <button
                type="button"
                role="switch"
                aria-checked={encendido}
                aria-describedby={bloqueado ? "no-se-puede-apagar" : undefined}
                disabled={ocupado || bloqueado}
                onClick={alternar}
                className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-text bg-surface transition-colors disabled:opacity-60 aria-checked:bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <span aria-hidden="true" className={`size-5 rounded-full transition-transform ${encendido ? "translate-x-7 bg-surface" : "translate-x-1 bg-text"}`} />
                <span className="sr-only">{etiqueta}</span>
              </button>
            );
            return estado ? (
              <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-muted p-3">
                <div className="min-w-0">
                  <p className="font-semibold">{estado}</p>
                  {detalle && <p className="text-sm text-text-muted">{detalle}</p>}
                </div>
                {interruptor}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {interruptor}
                {!bloqueado && <span className="text-sm">{etiqueta}</span>}
              </div>
            );
          })()}
          {bloqueado ? (
            <div id="no-se-puede-apagar" className="space-y-1 rounded-lg bg-surface-muted p-3">
              <p className="font-semibold">{t.noSePuedeTitulo}</p>
              <p className="text-sm text-text-muted">{rellenar(t.noSePuedeTexto, { hasta: horaDe(new Date(fireAt)) })}</p>
            </div>
          ) : (
            notaEditar && <p className="text-sm text-text-muted">{notaEditar}</p>
          )}
        </>
      )}
    </div>
  );
}
