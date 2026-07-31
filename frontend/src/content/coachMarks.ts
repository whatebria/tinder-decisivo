/**
 * Coach marks — copy alineado con la app real (post-recorrido 2026-07-27).
 *
 * Cada pantalla clave dispara UN tour la primera vez que el usuario entra.
 * Un tour tiene 1..N pasos secuenciales; al completar (o saltar) se marca como
 * visto en el store y no se vuelve a mostrar. Reactivable desde Config -> Ayuda.
 *
 * Tono: pensado para alguien no técnico que no conoce la app.
 * Regla: cada tour explica QUÉ es la funcionalidad y CÓMO se usa.
 *
 * Fuente de verdad de i18n: si mañana se traduce, este archivo se vuelve un
 * mapping por locale, pero la forma de los datos no cambia.
 */

export type TourId =
  | "home"
  | "cuestionario"
  | "resultados"
  | "comparador"
  | "guardados"
  | "gestionElecciones"
  | "perfilCandidato"
  | "noticias";

/** Un paso individual dentro de un tour. */
export interface CoachStep {
  /** ID canónico, útil para tracking/analytics. */
  id: string;
  /** Título corto — máx. 6 palabras. */
  title: string;
  /** Descripción — máx. 30 palabras (2-3 líneas mobile). */
  description: string;
  /** Texto referencial del elemento resaltado. NO es un ref visual (spotlight). */
  highlight: string;
}

/** Agrupación de pasos consecutivos que se muestran en una misma pantalla. */
export interface CoachTour {
  id: TourId;
  steps: CoachStep[];
}

// -- Definiciones ------------------------------------------------------------

const HOME: CoachTour = {
  id: "home",
  steps: [
    {
      id: "home-1",
      title: "Estas son tus elecciones",
      description:
        "Cada tarjeta muestra una elección que estás siguiendo, cómo vas con las preguntas y qué candidato se parece más a ti hasta ahora.",
      highlight: "Tarjetas de elecciones activas",
    },
    {
      id: "home-2",
      title: "Agrega o quita elecciones cuando quieras",
      description:
        "Toca el + para elegir cuáles seguir: por ejemplo tu alcalde, tu diputado o la presidencial.",
      highlight: "Botón + o card de agregar",
    },
  ],
};

const CUESTIONARIO: CoachTour = {
  id: "cuestionario",
  steps: [
    {
      id: "cuestionario-1",
      title: "¿Tienes dudas con la pregunta?",
      description:
        "Toca el signo de pregunta (?) para leer una explicación corta, sin tomar partido, y ver por qué importa.",
      highlight: "Ícono ? junto a la pregunta",
    },
  ],
};

const RESULTADOS: CoachTour = {
  id: "resultados",
  steps: [
    {
      id: "resultados-1",
      title: "Estos se parecen más a ti",
      description:
        "Los candidatos aparecen ordenados: primero los que coinciden más contigo, según lo que respondiste.",
      highlight: "Ranking de candidatos",
    },
    {
      id: "resultados-2",
      title: "Guarda los que te interesan",
      description:
        "Toca la estrella en un candidato para hacerlo favorito, o la X para ocultar a los que no te convencen.",
      highlight: "Botones de favorito y descartar",
    },
  ],
};

const COMPARADOR: CoachTour = {
  id: "comparador",
  steps: [
    {
      id: "comparador-1",
      title: "Pon dos candidatos lado a lado",
      description:
        "Aquí puedes ver a dos candidatos al mismo tiempo y revisar qué piensan sobre cada tema.",
      highlight: "Comparador de candidatos",
    },
    {
      id: "comparador-2",
      title: "Elige a los dos que quieres comparar",
      description:
        "Toca cada espacio de arriba y busca al candidato que quieras. Puedes cambiarlos cuando quieras.",
      highlight: "Slots de candidato A y B",
    },
    {
      id: "comparador-3",
      title: "Ve solo lo que los diferencia",
      description:
        "Activa este botón para esconder los temas donde ambos piensan igual y enfocarte en dónde no coinciden.",
      highlight: "Botón «Solo diferencias»",
    },
  ],
};

const GUARDADOS: CoachTour = {
  id: "guardados",
  steps: [
    {
      id: "guardados-1",
      title: "Aquí guardamos todo lo que te interesó",
      description:
        "Candidatos que marcaste como favoritos y posturas que quieres recordar. Cambia entre pestañas arriba para verlos.",
      highlight: "Pestañas Favoritos / Posturas",
    },
    {
      id: "guardados-2",
      title: "¿Cómo guardo cosas?",
      description:
        "Toca la estrella en un candidato para hacerlo favorito, o el marcador en una postura o noticia para guardarla. Aparecerán acá al toque.",
      highlight: "Botones estrella y marcador",
    },
  ],
};

const GESTION_ELECCIONES: CoachTour = {
  id: "gestionElecciones",
  steps: [
    {
      id: "gestion-1",
      title: "Elige qué elecciones te importan",
      description:
        "Aquí decides cuáles seguir: la presidencial, tu alcalde, tu diputado. Las que actives aparecerán en el Home con sus preguntas y candidatos.",
      highlight: "Listado de elecciones",
    },
    {
      id: "gestion-2",
      title: "Activa o desactiva cuando quieras",
      description:
        "Toca el interruptor para agregar o sacar una elección. Puedes cambiar de opinión en cualquier momento.",
      highlight: "Interruptor por elección",
    },
  ],
};

const PERFIL_CANDIDATO: CoachTour = {
  id: "perfilCandidato",
  steps: [
    {
      id: "perfil-1",
      title: "Cuánto coinciden, tema por tema",
      description:
        "Cada punta es un tema (economía, seguridad, ambiente...). Cuanto más lejos del centro llega la figura, más coinciden ustedes en ese tema.",
      highlight: "Gráfico circular por temas",
    },
    {
      id: "perfil-2",
      title: "Qué son las posturas",
      description:
        "Son las respuestas del candidato a las mismas preguntas que respondiste tú. Están agrupadas por tema y las comparamos con lo que dijiste.",
      highlight: "Sección Posturas",
    },
    {
      id: "perfil-3",
      title: "Noticias sobre este candidato",
      description:
        "Aquí solo aparecen artículos donde se menciona a este candidato. Buenos o malos, todos: nosotros no elegimos cuáles mostrar.",
      highlight: "Sección Noticias del candidato",
    },
    {
      id: "perfil-4",
      title: "Qué tan seguros estamos del resultado",
      description:
        "Verde: sabemos harto de este candidato. Amarillo: sabemos algo. Rojo: sabemos poco y el resultado es una estimación.",
      highlight: "Etiqueta de confianza",
    },
  ],
};

const NOTICIAS: CoachTour = {
  id: "noticias",
  steps: [
    {
      id: "noticias-1",
      title: "Noticias sobre política y candidatos",
      description:
        "Aquí encuentras artículos de distintos medios. Te mostramos todo lo que hay disponible.",
      highlight: "Feed de noticias",
    },
    {
      id: "noticias-2",
      title: "Filtra para encontrar lo que buscas",
      description:
        "Puedes filtrar por candidato mencionado, por medio, por fecha o buscar por palabra. También puedes guardar las que quieras leer después.",
      highlight: "Barra de filtros",
    },
  ],
};

/** Registro completo de tours disponibles. */
export const COACH_TOURS: Record<TourId, CoachTour> = {
  home: HOME,
  cuestionario: CUESTIONARIO,
  resultados: RESULTADOS,
  comparador: COMPARADOR,
  guardados: GUARDADOS,
  gestionElecciones: GESTION_ELECCIONES,
  perfilCandidato: PERFIL_CANDIDATO,
  noticias: NOTICIAS,
};
