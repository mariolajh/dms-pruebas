"use client";

import { useEffect, useState } from "react";

// Aviso temporal. Se anuncia a lector de pantalla (role="status"), no roba el foco,
// se puede cerrar y dura 8 s (WCAG 2.2.1: tiempo suficiente). Al verse se limpia la
// dirección (?enviada=1) para que no reaparezca al recargar.
export default function Toast({ texto, quitarParametro, cerrar = "Cerrar aviso" }: { texto: string; quitarParametro?: string; cerrar?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (quitarParametro) {
      const url = new URL(window.location.href);
      url.searchParams.delete(quitarParametro);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    const id = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(id);
  }, [quitarParametro]);

  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-md justify-center px-4">
      <div role="status" className="pointer-events-auto flex items-center gap-3 rounded-lg bg-text px-4 py-3 text-surface shadow-lg">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-medium">{texto}</p>
        <button type="button" onClick={() => setVisible(false)} aria-label={cerrar} className="-mr-2 inline-flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-surface">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
