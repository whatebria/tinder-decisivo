/**
 * Welcome tour — 5 slides que se muestran la primera vez que el usuario
 * abre la app (antes del Login/Register). Copy alineado con la app real:
 * multi-elección, cuestionario ponderado, comparador, favoritos, guest mode.
 *
 * Tono: pensado para alguien no técnico que no conoce la app.
 *
 * Se persiste con `useOnboardingStore` (secureStorage) — a diferencia de
 * los coach marks, este SÍ es one-shot for-life (o hasta reset manual).
 */

/**
 * CTAs específicos del último slide. En el resto, la screen renderiza
 * "Saltar" + "Siguiente" de forma implícita.
 */
export interface WelcomeFinalCtas {
  /** Botón primario. Ej: "Crear cuenta". */
  primary: string;
  /** Link secundario. Ej: "Ya tengo cuenta". */
  secondary: string;
  /** Link terciario. Ej: "Explorar sin cuenta". */
  tertiary: string;
}

export interface WelcomeSlide {
  /** ID canónico, útil para tracking/analytics. */
  id: string;
  /** Título corto — máx. 6 palabras. */
  title: string;
  /** Cuerpo — máx. 25 palabras. */
  body: string;
  /** Si es el slide final, incluye los CTAs personalizados. */
  finalCtas?: WelcomeFinalCtas;
}

export const WELCOME_SLIDES: readonly WelcomeSlide[] = [
  {
    id: "welcome-1",
    title: "Encuentra a tu candidato ideal",
    body: "Aquí descubres qué candidatos piensan parecido a ti. Sin propaganda, sin sesgos, gratis y en privado.",
  },
  {
    id: "welcome-2",
    title: "Sigue las elecciones que te importan",
    body: "Presidente, alcalde, diputado. Elige cuáles quieres seguir; puedes activarlas o desactivarlas cuando quieras.",
  },
  {
    id: "welcome-3",
    title: "Responde preguntas simples",
    body: "Te preguntamos por temas reales: educación, salud, seguridad, pensiones. Marca qué te importa más y qué menos.",
  },
  {
    id: "welcome-4",
    title: "Te mostramos quién se parece a ti",
    body: "Ordenamos a los candidatos por qué tanto coinciden contigo. Puedes comparar dos y guardar los que te interesan.",
  },
  {
    id: "welcome-5",
    title: "¿Empezamos?",
    body: "Crea una cuenta para guardar tus respuestas, o entra sin cuenta si solo quieres mirar.",
    finalCtas: {
      primary: "Crear cuenta",
      secondary: "Ya tengo cuenta",
      tertiary: "Explorar sin cuenta",
    },
  },
];
