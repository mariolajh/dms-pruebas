import { EnlaceBoton, Numero, Pantalla, Tarjeta } from "@/components/emisor/ui";
import type { TextosAlta } from "./textos";

// R-AV-E1 · Web · Onboarding · comienzo. Solo pinta: los datos los pone la página.
export default function Comienzo({ t, app }: { t: TextosAlta["comienzo"]; app: string }) {
  return (
    <Pantalla pie={<EnlaceBoton href="/alta/notificaciones">{t.empezar}</EnlaceBoton>}>
      <p className="pt-2 text-lg font-semibold">{app}</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t.titulo}</h1>
        <p className="text-text-muted">{t.intro}</p>
      </div>
      <Tarjeta>
        <ol className="space-y-4">
          {t.pasos.map((p, i) => (
            <li key={p.titulo} className="flex gap-3">
              <Numero n={i + 1} />
              <div>
                <p className="font-semibold">{p.titulo}</p>
                <p className="text-text-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </Tarjeta>
    </Pantalla>
  );
}
