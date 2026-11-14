// Catálogo de /muestra: pantallas del flujo de quien emite que se enseñan en abierto,
// sin sesión y con datos de ejemplo (Mariana emite, Ana y Luis son sus contactos).
// Sirve para pasar la pantalla frontera a quien depende de este flujo. No guarda ni envía nada.

export type Pantalla = { id: string; titulo: string; nota: string };
export type Grupo = { id: string; titulo: string; texto: string; pantallas: Pantalla[] };

export const GRUPOS: Grupo[] = [
  {
    id: "alta",
    titulo: "Alta e instalación",
    texto: "El alta termina aquí: 1 notificaciones, 2 contactos, 3 aviso.",
    pantallas: [
      { id: "alta-comienzo", titulo: "Comienzo", nota: "Primera pantalla tras crear la cuenta." },
      { id: "alta-notificaciones", titulo: "Paso 1 · Activar notificaciones", nota: "Si no las activa, sigue igual y le llega por correo." },
      { id: "alta-primer-contacto", titulo: "Paso 2 · Primer contacto", nota: "Nombre y correo. Al enviar sale la invitación." },
      { id: "alta-contactos", titulo: "Paso 2 · Invitación enviada", nota: "Puede agregar otro o continuar al aviso." },
      { id: "alta-aviso", titulo: "Paso 3 · Configurar aviso", nota: "Hora, frecuencia y tiempo de gracia." },
    ],
  },
  {
    id: "invitacion",
    titulo: "Invitación y aceptación",
    texto: "Lo que ve quien emite antes y después de que el contacto responda.",
    pantallas: [
      { id: "agregar-contacto", titulo: "Agregar contacto", nota: "De aquí sale el correo de invitación." },
      { id: "contactos-en-espera", titulo: "Contactos · En espera", nota: "Invitación enviada, sin respuesta." },
      { id: "contactos-acepto", titulo: "Contactos · Aceptó", nota: "Ana aceptó. Luis sigue en espera." },
      { id: "contactos-no-acepto", titulo: "Contactos · No aceptó", nota: "Se propone invitar a otra persona." },
      { id: "inicio-esperando", titulo: "Inicio · Esperando contactos", nota: "Nadie aceptó todavía: el aviso no se puede encender." },
      { id: "inicio-apagado", titulo: "Inicio · Apagado, listo para encender", nota: "Así se entera quien emite de que Ana aceptó." },
    ],
  },
  {
    id: "confirmar",
    titulo: "Confirmar \"Estoy bien\" y cancelar la alerta",
    texto: "El aviso encendido. Aquí va \"Estoy bien\", 30 min antes de la hora.",
    pantallas: [
      { id: "inicio-activo", titulo: "Inicio · Aviso encendido", nota: "Hoy muestra el plazo y el interruptor para apagar." },
    ],
  },
  {
    id: "aviso",
    titulo: "Configurar el aviso",
    texto: "Los pasos del aviso fuera del alta.",
    pantallas: [
      { id: "aviso-hora", titulo: "Aviso · Hora", nota: "Hora, frecuencia y tiempo de gracia." },
      { id: "aviso-contactos", titulo: "Aviso · Contactos", nota: "A quién se avisa y en qué orden." },
      { id: "aviso-resumen", titulo: "Aviso · Resumen", nota: "Todo visible antes de guardar. Se guarda apagado." },
    ],
  },
];

export const PANTALLAS = GRUPOS.flatMap((g) => g.pantallas);
