import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { GRUPOS } from "./pantallas";

// Índice de /muestra: pantallas del flujo de quien emite, en abierto y con datos de ejemplo.
export const metadata = { title: "Pantallas de muestra", robots: { index: false, follow: false } };

export default function Muestra() {
  const marca = getBrand();
  return (
    <main className="mx-auto min-h-dvh max-w-md space-y-6 bg-surface-muted p-4 pb-8">
      <header className="space-y-2">
        <p className="font-semibold">{marca.name}</p>
        <h1 className="text-2xl font-semibold">Pantallas de quien emite</h1>
        <p className="text-text-muted">
          Esto es una copia de pruebas de quien emite, no la app del proyecto. Las pantallas llevan datos de ejemplo. No hace falta cuenta. Solo se miran: nada se guarda ni se envía.
        </p>
      </header>
      {GRUPOS.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`t-${g.id}`} className="space-y-3 rounded-xl bg-surface p-4">
          <h2 id={`t-${g.id}`} className="text-lg font-semibold">
            {g.titulo}
          </h2>
          <p className="text-text-muted">{g.texto}</p>
          <ul className="space-y-2">
            {g.pantallas.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/muestra/${p.id}`}
                  className="block rounded-lg border border-border/50 p-3 focus-visible:outline-2 focus-visible:outline-brand-primary"
                >
                  <span className="block font-semibold underline underline-offset-4">{p.titulo}</span>
                  <span className="block text-sm text-text-muted">{p.nota}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
