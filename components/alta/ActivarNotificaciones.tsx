"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, BarraTitulo, EnlaceBoton, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import Spinner from "@/components/emisor/Spinner";
import { suscribirYGuardar } from "@/lib/pwa/suscribir";
import type { TextosAlta } from "./textos";

// Paso 1 del onboarding. Usa el mismo endpoint que el PushButton del núcleo (/api/push/subscribe).
// Solo muestra "Notificaciones activas" cuando el servidor guardó la suscripción.

type Fase = "inicio" | "activando" | "activas" | "no-activo";

// enAlta: paso 1 del onboarding. Si no, se llega desde Ajustes y se vuelve allí.
export default function ActivarNotificaciones({ t, enAlta }: { t: TextosAlta["notificaciones"]; enAlta: boolean }) {
  const SIGUIENTE = enAlta ? "/contactos/nuevo" : "/ajustes";
  const [fase, setFase] = useState<Fase>("inicio");
  const [detalle, setDetalle] = useState<string | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // Al cambiar de estado, el foco va al título nuevo para el lector de pantalla.
  useEffect(() => {
    if (fase !== "inicio" && fase !== "activando") titulo.current?.focus();
  }, [fase]);

  async function activar() {
    setDetalle(null);
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !key) {
      setDetalle(t.noCompatible);
      return setFase("no-activo");
    }
    setFase("activando");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        if (permiso === "denied") setDetalle(t.bloqueado);
        fetch("/api/push/diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paso: "permiso", error: `respuesta ${permiso}`, permiso, agente: navigator.userAgent }),
        }).catch(() => {});
        return setFase("no-activo");
      }
      const r = await suscribirYGuardar();
      if (!r.ok) {
        // Temporal, para las pruebas: se muestra el paso y el error real, que antes quedaba tapado.
        setDetalle(`${t.errorGuardar} (${r.paso} · ${r.error})`);
        fetch("/api/push/diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paso: r.paso, error: r.error, permiso: Notification.permission, agente: navigator.userAgent }),
        }).catch(() => {});
        return setFase("no-activo");
      }
      setFase("activas");
    } catch {
      setDetalle(t.errorGuardar);
      setFase("no-activo");
    }
  }

  const cabecera = enAlta ? <Progreso actual={1} total={3} siguiente={t.siguiente} /> : <BarraTitulo titulo={t.tituloCorto} volverHref="/ajustes" />;
  // Con barra de título ya hay un h1: el título de la tarjeta baja a h2.
  const Titulo = enAlta ? "h1" : "h2";

  if (fase === "activas") {
    return (
      <Pantalla pie={<EnlaceBoton href={SIGUIENTE}>{enAlta ? t.continuar : t.volverAjustes}</EnlaceBoton>}>
        {cabecera}
        <Tarjeta>
          <Badge>{t.activasBadge}</Badge>
          <Titulo ref={titulo} tabIndex={-1} className="text-xl font-semibold">
            {t.activasTitulo}
          </Titulo>
          <p className="text-text-muted">{t.activasTexto}</p>
        </Tarjeta>
      </Pantalla>
    );
  }

  if (fase === "no-activo") {
    return (
      <Pantalla
        pie={
          <>
            <button type="button" onClick={activar} className={clases.principal}>
              {t.reintentar}
            </button>
            <EnlaceBoton href={SIGUIENTE} tipo="secundario">
              {enAlta ? t.continuarSin : t.volverAjustes}
            </EnlaceBoton>
          </>
        }
      >
        {cabecera}
        <Tarjeta>
          <Titulo ref={titulo} tabIndex={-1} className="text-xl font-semibold">
            {t.noTitulo}
          </Titulo>
          <p>{t.noTexto}</p>
          {detalle && (
            <p role="status" className="text-sm font-medium">
              {detalle}
            </p>
          )}
        </Tarjeta>
        {enAlta && <p className="text-sm text-text-muted">{t.noNota}</p>}
      </Pantalla>
    );
  }

  return (
    <Pantalla
      pie={
        <>
          <button type="button" onClick={activar} disabled={fase === "activando"} className={clases.principal}>
            {fase === "activando" ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                {t.activando}
              </span>
            ) : (
              t.activar
            )}
          </button>
          <button
            type="button"
            onClick={() => setFase("no-activo")}
            disabled={fase === "activando"}
            className={clases.secundario}
          >
            {t.ahoraNo}
          </button>
        </>
      }
    >
      {cabecera}
      <Tarjeta>
        <Titulo className="text-xl font-semibold">{t.titulo}</Titulo>
        <p className="text-text-muted">{t.texto}</p>
      </Tarjeta>
    </Pantalla>
  );
}
