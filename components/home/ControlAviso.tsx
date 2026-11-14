"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { encenderAviso, apagarAviso } from "@/app/aviso/encender";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { proximoPlazo } from "@/app/aviso/_datos/formato";
import { clases } from "@/components/emisor/ui";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosInicio } from "./textosInicio";

// Interruptor para encender y apagar el aviso (E-02 Apagado y Activo, E-12 y E-14 del wireflow).
// Encender: sin diálogo (nota del flujo). Apagar: pide confirmar. "Editar" con el aviso encendido
// pide apagarlo primero (solo se edita apagado). Los errores no se esconden: "Reintentar".

type Fase = "reposo" | "enviando" | "error" | "confirmando" | "confirmandoEditar";

export default function ControlAviso({
  t,
  encendido,
  fireAt,
  frecuencia,
  dias,
  conEditar = false,
}: {
  t: TextosInicio;
  encendido: boolean;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
  conEditar?: boolean;
}) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("reposo");
  const [error, setError] = useState<string | null>(null);
  const [, empezar] = useTransition();
  const [bloqueado, setBloqueado] = useState(false);
  const aviso = useRef<HTMLDivElement>(null);
  const pregunta = useRef<HTMLParagraphElement>(null);
  const [irAEditar, setIrAEditar] = useState(false);

  // Mientras se espera la confirmación no se puede apagar (ventana antes de la hora y tiempo de gracia).
  useEffect(() => {
    const calcula = () => setBloqueado(encendido && Date.now() >= new Date(fireAt).getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
    calcula();
    const id = setInterval(calcula, 30_000);
    return () => clearInterval(id);
  }, [encendido, fireAt]);

  useEffect(() => {
    if (fase === "confirmando" || fase === "confirmandoEditar") pregunta.current?.focus();
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
    const paraEditar = irAEditar;
    empezar(async () => {
      const r = await apagarAviso().catch(() => ({ ok: false as const, error: t.apagar.error }));
      if (r.ok) {
        if (paraEditar) router.push("/aviso");
        else {
          router.replace("/home?apagado=1");
          router.refresh();
        }
      } else {
        setError(r.error);
        setFase("error");
      }
    });
  }

  function alternar() {
    if (!encendido) encender();
    else {
      setIrAEditar(false);
      setFase("confirmando");
    }
  }

  const ocupado = fase === "enviando";
  const etiqueta = encendido ? t.tocaApagar : t.tocaEncender;
  const dialogo = fase === "confirmando" || fase === "confirmandoEditar";
  const paraEditar = fase === "confirmandoEditar";

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
              <p className="font-semibold">{encendido ? t.apagando : t.encendiendo}</p>
              <p className="text-sm text-text-muted">{t.unMomento}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">{encendido ? t.noPudimosApagar : t.noPudimosEncender}</p>
              <p className="text-sm text-text-muted">{error ?? t.revisaConexion}</p>
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
            {paraEditar ? t.apagarEditarPregunta : t.apagarPregunta}
          </p>
          <p className="text-sm text-text-muted">{paraEditar ? t.apagarEditarTexto : t.apagarTexto}</p>
          <div className="flex flex-col gap-2">
            <button type="button" className={clases.principal} onClick={apagar}>
              {paraEditar ? t.apagarEditarBoton : t.apagarBoton}
            </button>
            <button type="button" className={clases.secundario} onClick={() => setFase("reposo")}>
              {t.dejarActivo}
            </button>
          </div>
        </div>
      )}

      {!dialogo && (
        <>
          <div className="flex items-center gap-3">
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
            <span className="text-sm">{etiqueta}</span>
          </div>
          {bloqueado && (
            <p id="no-se-puede-apagar" className="text-sm text-text-muted">
              {t.noSePuedeApagar}
            </p>
          )}
          {encendido && conEditar && !bloqueado && (
            <button
              type="button"
              className={clases.enlace}
              onClick={() => {
                setIrAEditar(true);
                setFase("confirmandoEditar");
              }}
            >
              {t.editar}
            </button>
          )}
        </>
      )}
    </div>
  );
}
