/**
 * Catalogo de dimensiones tematicas del dominio.
 *
 * Cada pregunta del cuestionario puede tener repercusiones en 5 dimensiones
 * (economico, social, cultural, ambiental, institucional). Este archivo es
 * la unica fuente de verdad para:
 * - Los nombres/labels legibles
 * - El icono de la dimension
 * - La paleta de color (variante light + variante dark, contraste WCAG AA
 *   sobre las superficies internas de las cards del theme)
 *
 * Por que NO vive en `theme/colors.ts`:
 *   Los colores del theme son tokens de UI (bg, text, primary, danger).
 *   Los colores de dimension son tokens de DOMINIO — semanticamente
 *   representan una idea del negocio (ej: "verde = ambiental") y no deben
 *   invertirse arbitrariamente con el tema. Lo que si hacen es tener una
 *   version light y una version dark que MANTIENE el hue pero ajusta la
 *   luminancia para cumplir contraste sobre el fondo de la card interna.
 *
 * Consumidores:
 * - <DimensionBadge/> — el chip circular con icono
 * - <DimensionCard/>  — la card completa con borde izquierdo + header + body
 * - PreguntaInfoModal — arma las cards de repercusiones
 * - (futuro) RadarChart por eje, filtros por dimension, badges en comparador
 *
 * Blindaje: `dimensiones.test.ts` verifica que cada color cumpla ratio
 * >= 4.5 sobre el gray100 del theme correspondiente (WCAG AA texto normal).
 */

// ---- Types ----------------------------------------------------------------

export type DimensionKey =
  | "economico"
  | "social"
  | "cultural"
  | "ambiental"
  | "institucional"
  | "pueblos_originarios"
  | "discapacidad";

/**
 * Definicion completa de una dimension.
 *
 * - `badge`: color de fondo del chip circular. Se usa igual en light y dark
 *   porque el texto encima siempre es blanco (contraste ~7-10:1 en ambos).
 * - `text.{light,dark}`: color del label de texto. Se aclara en dark para
 *   cumplir AA sobre el gray100 oscuro.
 * - `border.{light,dark}`: color del borde izquierdo de la card. Menos
 *   critico (adorno visual, no texto) pero se ajusta por consistencia.
 */
export interface Dimension {
  key: DimensionKey;
  label: string;
  icon: string;
  badge: string;
  text: { light: string; dark: string };
  border: { light: string; dark: string };
}

export interface DimensionColors {
  badge: string;
  text: string;
  border: string;
}

// ---- Catalogo -------------------------------------------------------------

/**
 * Racional de los colores dark: se tomo el hue de cada version light y se
 * subio la luminancia ~3-4 stops de lescala Tailwind (ej: teal-700 →
 * teal-300). Verificado con `dimensiones.test.ts` que cumple AA sobre
 * `gray100` de ambos themes.
 */
export const DIMENSIONES: readonly Dimension[] = [
  {
    key: "economico",
    label: "Economico",
    icon: "$",
    // Movido de teal-700 (#0F766E, hue 174) a cyan-700 (#0E7490, hue 193).
    // Razon: el teal original colisionaba en hue con el accent verde (#3A9E7A,
    // hue 157) a solo 17deg de distancia. El cyan queda 36deg del accent y
    // 29deg del primary azul — aceptable dado que el badge (24px) y el CTA
    // (boton grande) son formas completamente distintas.
    badge: "#0E7490", // cyan-700
    text: { light: "#155E75", dark: "#67E8F9" }, // cyan-800 light, cyan-300 dark
    border: { light: "#155E75", dark: "#67E8F9" },
  },
  {
    key: "social",
    label: "Social",
    icon: "*",
    badge: "#B45309", // amber-700 (bg de chip, texto blanco encima cumple AA 5.2:1)
    // Nota: el amber-700 como texto sobre gray100 light da 4.38:1 (justo
    // debajo de AA). Se usa amber-800 (#92400E) para el label y el border,
    // que da 6.7:1. El chip mantiene amber-700 para no oscurecer el fondo.
    text: { light: "#92400E", dark: "#FCD34D" }, // amber-800 en light, amber-300 en dark
    border: { light: "#92400E", dark: "#FCD34D" },
  },
  {
    key: "cultural",
    label: "Cultural",
    icon: "~",
    badge: "#7C3AED", // violet-600
    text: { light: "#7C3AED", dark: "#C4B5FD" }, // violet-300 en dark
    border: { light: "#7C3AED", dark: "#C4B5FD" },
  },
  {
    key: "ambiental",
    label: "Ambiental",
    icon: "^",
    badge: "#166534", // green-800
    text: { light: "#166534", dark: "#86EFAC" }, // green-300 en dark
    border: { light: "#166534", dark: "#86EFAC" },
  },
  {
    key: "institucional",
    label: "Institucional",
    icon: "#",
    badge: "#1E40AF", // blue-800
    text: { light: "#1E40AF", dark: "#93C5FD" }, // blue-300 en dark
    border: { light: "#1E40AF", dark: "#93C5FD" },
  },
  {
    key: "pueblos_originarios",
    label: "Pueblos Originarios",
    icon: "P",
    // Deep rose (hue 336). Espacio completamente libre en el sistema:
    // 41deg de cultural (263), 41deg de discapacidad (295), 24deg del
    // danger terracota (0/360, diferente luminancia).
    badge: "#9D174D", // pink-800
    text: { light: "#9D174D", dark: "#F9A8D4" }, // pink-800 light, pink-300 dark
    border: { light: "#9D174D", dark: "#F9A8D4" },
  },
  {
    key: "discapacidad",
    label: "Discapacidad",
    icon: "D",
    // Fuchsia (hue 295). 32deg de cultural (263), 41deg de pueblos_originarios (336).
    // El magenta-fuchsia es el color utilizado por organizaciones de inclusion
    // y discapacidad a nivel internacional.
    badge: "#86198F", // fuchsia-800
    text: { light: "#86198F", dark: "#E879F9" }, // fuchsia-800 light, fuchsia-400 dark
    border: { light: "#86198F", dark: "#E879F9" },
  },
] as const;

// Index para lookup O(1) por key.
const DIM_BY_KEY: Record<DimensionKey, Dimension> = DIMENSIONES.reduce(
  (acc, d) => {
    acc[d.key] = d;
    return acc;
  },
  {} as Record<DimensionKey, Dimension>,
);

// ---- API publica ----------------------------------------------------------

/** Devuelve la definicion completa de una dimension. */
export function getDimension(key: DimensionKey): Dimension {
  return DIM_BY_KEY[key];
}

/**
 * Resuelve los 3 colores efectivos de una dimension segun el tema activo.
 * Funcion pura — el consumidor debe pasarle `isDark`. Para wiring
 * automatico usar el hook `useDimensionColors`.
 */
export function getDimensionColors(
  key: DimensionKey,
  isDark: boolean,
): DimensionColors {
  const d = DIM_BY_KEY[key];
  return {
    badge: d.badge,
    text: isDark ? d.text.dark : d.text.light,
    border: isDark ? d.border.dark : d.border.light,
  };
}

/**
 * TASK-033: labels legibles de los ejes tematicos que usa el backend
 * (codigos en mayusculas como "ECONOMIA", "SOCIEDAD").
 *
 * Unica fuente de verdad para etiquetas de ejes — RadarChart, buildA11yLabel
 * y cualquier futuro consumidor deben importar de aqui, NO duplicar.
 *
 * Nota: estos codigos son distintos a DimensionKey (que usa minusculas como
 * "economico"). Son el "EjeTematicoEnum" del backend (ver api.ts).
 */
export const EJE_LABELS: Record<string, string> = {
  ECONOMIA:      "Economia",
  SOCIEDAD:      "Sociedad",
  AMBIENTE:      "Ambiente",
  SEGURIDAD:     "Seguridad",
  DDHH:          "DDHH",
  INTERNACIONAL: "Internac.",
  INSTITUCIONAL: "Institucional",
  OTRO:          "Otro",
} as const;

/**
 * TASK-057: mapeo de EjeTematicoEnum del backend a DimensionKey.
 *
 * Los codigos del backend (ECONOMIA, SOCIEDAD...) no coinciden 1:1 con las
 * DimensionKey del DS (economico, social...). Las entradas sin correspondencia
 * directa usan la dimension conceptualmente mas cercana.
 * null = sin correspondencia valida (usar fallback de color).
 */
const EJE_TO_DIMENSION_KEY: Record<string, DimensionKey | null> = {
  ECONOMIA:      "economico",
  SOCIEDAD:      "social",
  AMBIENTE:      "ambiental",
  INSTITUCIONAL: "institucional",
  // Sin correspondencia directa en el DS actual:
  SEGURIDAD:     null,
  DDHH:          null,
  INTERNACIONAL: null,
  OTRO:          null,
};

/**
 * TASK-057: resuelve los colores de dimension para un codigo de eje del backend.
 *
 * A diferencia de `getDimensionColors`, acepta cualquier string y retorna
 * `null` cuando no hay correspondencia, permitiendo al consumidor usar
 * su propio fallback.
 */
export function getDimensionColorsForEje(
  ejeCode: string,
  isDark: boolean,
): DimensionColors | null {
  const key = EJE_TO_DIMENSION_KEY[ejeCode] ?? null;
  if (!key) return null;
  return getDimensionColors(key, isDark);
}
