/**
 * Coach marks — copy literal desde `design-exploration/onboarding-copy.html`.
 *
 * Cada pantalla clave dispara UN tour la primera vez que el usuario entra.
 * Un tour tiene 1..N pasos secuenciales; al completar (o saltar) se marca como
 * visto en el store y no se vuelve a mostrar. Reactivable desde Config -> Ayuda.
 *
 * Fuente de verdad de i18n: si mañana se traduce, este archivo se vuelve un
 * mapping por locale, pero la forma de los datos no cambia.
 */

export type TourId = "home" | "cuestionario" | "resultados" | "comparador";

/** Un paso individual dentro de un tour. */
export interface CoachStep {
  /** ID canónico (coincide con el ID del HTML de copy: "coach-1a", etc.). */
  id: string;
  /** Título corto — máx. 6 palabras. */
  title: string;
  /** Descripción — máx. 20 palabras (2 líneas mobile). */
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
      id: "coach-1a",
      title: "Aquí están tus elecciones",
      description:
        "Cada tarjeta muestra el progreso de tu cuestionario, los días que faltan y el match del candidato más compatible.",
      highlight: "Primera election card",
    },
    {
      id: "coach-1b",
      title: "Activa más elecciones",
      description:
        "Puedes seguir varias a la vez: la presidencial, tu alcalde, el congreso. Cada una es independiente.",
      highlight: "Botón «+ Activar» o card empty",
    },
  ],
};

const CUESTIONARIO: CoachTour = {
  id: "cuestionario",
  steps: [
    {
      id: "coach-2",
      title: "Profundiza cuando quieras",
      description:
        "Toca este ícono para leer el contexto de la pregunta y ver cómo afecta al país en diferentes áreas.",
      highlight: "Link «Saber más» bajo la pregunta",
    },
  ],
};

const RESULTADOS: CoachTour = {
  id: "resultados",
  steps: [
    {
      id: "coach-3",
      title: "Así se compara tu perfil",
      description:
        "El radar muestra qué tan cerca estás del candidato en cada eje temático. Cuanto más se superponen las formas, más coinciden.",
      highlight: "Radar chart",
    },
    {
      id: "coach-4",
      title: "Qué tan confiable es el match",
      description:
        "La barrita indica cuántas de tus preguntas tienen respuesta del candidato. Más barritas, más certeza en el porcentaje de match.",
      highlight: "Barrita de cobertura (X/12)",
    },
    {
      id: "coach-5",
      title: "Nivel de confianza del match",
      description:
        "Verde: tenemos datos verificados de casi todas las preguntas. Amarillo: faltan algunas. Rojo: pocas coincidencias, resultado tentativo.",
      highlight: "Chip «Confianza alta»",
    },
  ],
};

const COMPARADOR: CoachTour = {
  id: "comparador",
  steps: [
    {
      id: "coach-6",
      title: "Enfócate en lo que separa",
      description:
        "Actívalo para ocultar los temas donde ambos candidatos coinciden y ver solo lo que realmente los distingue.",
      highlight: "Toggle «Solo diferencias»",
    },
  ],
};

/** Registro completo de tours disponibles. */
export const COACH_TOURS: Record<TourId, CoachTour> = {
  home: HOME,
  cuestionario: CUESTIONARIO,
  resultados: RESULTADOS,
  comparador: COMPARADOR,
};
