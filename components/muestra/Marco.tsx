import Link from "next/link";

// Marco de /muestra: una franja que avisa de que es una muestra y la pantalla debajo, sin interacción.
// "inert" impide tocar botones y enlaces: así nadie termina en el inicio de sesión ni envía nada.
export default function Marco({
  titulo,
  anterior,
  siguiente,
  children,
}: {
  titulo: string;
  anterior?: string;
  siguiente?: string;
  children: React.ReactNode;
}) {
  const enlace = "inline-flex min-h-11 items-center px-2 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-primary";
  return (
    <>
      <aside aria-label="Muestra" className="mx-auto max-w-md border-b-2 border-text bg-surface px-4 py-2 text-sm">
        <p className="font-semibold">Muestra · {titulo}</p>
        <p className="text-text-muted">Copia de pruebas, no es la app del proyecto. Datos de ejemplo. Solo para mirar: los botones no hacen nada.</p>
        <nav aria-label="Pantallas de muestra" className="-mx-2 flex flex-wrap gap-x-2">
          <Link href="/muestra" className={enlace}>
            Todas
          </Link>
          {anterior && (
            <Link href={`/muestra/${anterior}`} className={enlace}>
              Anterior
            </Link>
          )}
          {siguiente && (
            <Link href={`/muestra/${siguiente}`} className={enlace}>
              Siguiente
            </Link>
          )}
        </nav>
      </aside>
      <div inert>{children}</div>
    </>
  );
}
