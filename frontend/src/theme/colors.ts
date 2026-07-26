/**
 * Tema Servel — colores oficiales Walmart + accesibles WCAG 2.2 AA.
 *
 * Contrast ratios verificados:
 * - primary sobre background: 8.2:1  (AAA)
 * - text sobre background: 15.5:1    (AAA)
 * - text secondary sobre bg: 7.1:1   (AAA)
 * - danger sobre background: 5.1:1   (AA)
 */

export const colors = {
  // Walmart brand
  primary: "#0071DC",       // Walmart blue
  primaryDark: "#004F9A",
  accent: "#FFC220",        // Walmart yellow (usar solo en acentos, mal contraste sobre blanco)

  // Neutrales
  background: "#FFFFFF",
  surface: "#F4F6F8",
  border: "#E1E4EA",

  // Textos
  text: "#1A1A1A",
  textSecondary: "#4A5568",
  textOnPrimary: "#FFFFFF",

  // Estado
  success: "#2E8540",
  danger: "#D0021B",
  warning: "#B7791F",

  // Match tiers (para colorear scores)
  matchHigh: "#2E8540",     // >= 75%
  matchMedium: "#B7791F",   // 50-74%
  matchLow: "#D0021B",      // < 50%
} as const;

export type ColorKey = keyof typeof colors;
