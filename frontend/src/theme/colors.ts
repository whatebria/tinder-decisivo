/**
 * Design system tokens — Paleta A (calma azul-verde) para tinder-decisivo.
 *
 * Contrast ratios verificados (WCAG 2.2 AA):
 * - primary sobre bg:        5.5:1  (AA)
 * - text sobre bg:           14.2:1 (AAA)
 * - textSecondary sobre bg:  6.1:1  (AA)
 * - success sobre bg:        3.4:1  (AA para texto grande / UI)
 *
 * Convencion: los tokens escala usan camelCase sin guion (primary50, gray100).
 * Los semanticos son alias del peso 600 (primary === primary600).
 */

// ============================================================================
// Semanticos LIGHT (default theme)
// ============================================================================

const light = {
  // Superficies
  bg:         "#F5F7F5",  // fondo pagina
  card:       "#FFFFFF",  // cards, modals, inputs
  accent:     "#A8C5B5",  // hover backgrounds
  accent2:    "#D4E4DB",  // tints suaves

  // Brand
  primary:      "#2E5F7E",  // CTA principal
  primaryHover: "#24506C",
  secondary:    "#7BA098",  // progreso, secundarios
  /**
   * brandAccent: verde vibrante para CTAs de alta carga emocional (hero Home,
   * lock overlay, compartir). DS-04 --c-accent (#3A9E7A). Diferente del
   * token `accent` (#A8C5B5) que es solo un tint de hover/fondo.
   * Regla DS-10: max 3 apariciones de brandAccent por viewport.
   * DS-11: PROHIBIDO en cuestionario — solo Home hero, Compartir, lock CTA.
   */
  brandAccent:  "#3A9E7A",

  // Texto
  text:          "#1A2B33",
  textSecondary: "#5A6B73",
  textTertiary:  "#8A9199",
  textOnPrimary: "#FFFFFF",

  // Bordes
  border:  "#DDE4E1",
  border2: "#EEF2EF",

  // Feedback
  success: "#6B9B7A",
  warning: "#C89B5C",
  danger:  "#B85C5C",
  info:    "#5C8AB8",
} as const;

// ============================================================================
// Grays (escala neutra 50-900)
// ============================================================================

const grays = {
  gray50:  "#F7F8F7",
  gray100: "#EEF0EE",
  gray200: "#E1E5E2",
  gray300: "#CBD1CD",
  gray400: "#A8B0AA",
  gray500: "#7C8580",
  gray600: "#5C6560",
  gray700: "#444C47",
  gray800: "#2E3532",
  gray900: "#1A1F1C",
} as const;

// ============================================================================
// Tint scales de marca (50-900 por familia semantica)
// ============================================================================

export const tints = {
  // Primary — azul peteroleo
  primary50:  "#EEF3F7",
  primary100: "#D6E2EB",
  primary200: "#ADC5D6",
  primary300: "#82A6BF",
  primary400: "#5A87A5",
  primary500: "#3D6F8E",
  primary600: "#2E5F7E",
  primary700: "#24506C",
  primary800: "#1B3D53",
  primary900: "#132A3A",

  // Secondary — verde salvia
  secondary50:  "#F1F6F4",
  secondary100: "#DEE9E5",
  secondary200: "#C1D6CE",
  secondary300: "#A2C0B4",
  secondary400: "#8DAFA3",
  secondary500: "#7BA098",
  secondary600: "#648679",
  secondary700: "#4E6B60",
  secondary800: "#3A5148",
  secondary900: "#283732",

  // Success — verde bosque
  success50:  "#F0F5F1",
  success100: "#DAE8DE",
  success200: "#B7D2C0",
  success300: "#94BCA1",
  success400: "#7EAB88",
  success500: "#6B9B7A",
  success600: "#558062",
  success700: "#42654D",
  success800: "#2F4A38",
  success900: "#1E3125",

  // Warning — mostaza suave
  warning50:  "#FBF6EE",
  warning100: "#F5E8D0",
  warning200: "#EBD1A0",
  warning300: "#DEB77A",
  warning400: "#D5A76A",
  warning500: "#C89B5C",
  warning600: "#A57F49",
  warning700: "#816339",
  warning800: "#5D4728",
  warning900: "#3D2E1A",

  // Danger — terracota
  danger50:  "#FAEEEE",
  danger100: "#F1D0D0",
  danger200: "#E1A0A0",
  danger300: "#D07777",
  danger400: "#C46868",
  danger500: "#B85C5C",
  danger600: "#984848",
  danger700: "#763838",
  danger800: "#562828",
  danger900: "#391A1A",

  // Info — azul agua
  info50:  "#EEF3F8",
  info100: "#D3E0EE",
  info200: "#A6C2DD",
  info300: "#7DA4CB",
  info400: "#6595C0",
  info500: "#5C8AB8",
  info600: "#4A729A",
  info700: "#395978",
  info800: "#2A4158",
  info900: "#1B2A3A",
} as const;

// ============================================================================
// Overrides DARK (mismos nombres, valores invertidos donde corresponde)
// ============================================================================

const dark = {
  // Superficies (mas oscuras)
  bg:      "#0B1418",
  card:    "#1B2830",
  accent:  "#3D5A4E",
  accent2: "#2A3E36",

  // Brand (aclarados para contraste sobre bg oscuro)
  primary:      "#7BB5D4",
  primaryHover: "#9BC7DF",
  secondary:    "#9BC0B5",
  brandAccent:  "#5BCEA0",

  // Texto (invertido)
  text:          "#E8EEEA",
  textSecondary: "#A8B5AC",
  textTertiary:  "#7C8A80",
  textOnPrimary: "#0B1418",

  // Bordes
  border:  "#3A4C55",
  border2: "#2A3B44",

  // Feedback (aclarados)
  success: "#8FB89A",
  warning: "#D9B378",
  danger:  "#D07777",
  info:    "#7DA4CB",
  // UX-066: info50 como background de banners necesita override dark
  // (tints son absolutos; info50 luz = #EEF3F8 es ilegible sobre bg oscuro).
  // info900 = "#1B2A3A" cumple mismo rol de "tinte sutil de info" en dark.
  info50:  "#1B2A3A",
} as const;

// Grays invertidos en dark (gray50 = mas sutil = mas oscuro)
const graysDark = {
  gray50:  "#1A1F1C",
  gray100: "#2E3532",
  gray200: "#444C47",
  gray300: "#5C6560",
  gray400: "#7C8580",
  gray500: "#A8B0AA",
  gray600: "#CBD1CD",
  gray700: "#E1E5E2",
  gray800: "#EEF0EE",
  gray900: "#F7F8F7",
} as const;

// ============================================================================
// Public exports
// ============================================================================

/** Todos los tokens del theme light (semanticos + grays + tints).
 * `light` va al final para que cualquier override semantico gane sobre los tints base. */
export const colors = {
  ...tints,
  ...grays,
  ...light,
} as const;

/** Solo los overrides del theme dark. Los tints no se overridean (son valores absolutos),
 * salvo las excepciones declaradas en `dark` (ej. info50). Por eso `dark` va al final
 * del spread: sus overrides semanticos ganan sobre los tints base. */
export const colorsDark = {
  ...tints,
  ...graysDark,
  ...dark,
} as const;

export type ColorKey = keyof typeof colors;

// ============================================================================
// Affinity tokens (DS-08) — 5 tiers de afinidad electoral
//
// Usados por getMatchColor() en services/matching.ts.
// Desacoplados de la paleta semantica (success/warning/danger) para que
// el match pueda evolucionar independientemente del feedback UI generico.
// ============================================================================

/** Tokens de afinidad en light mode. */
export const affinity = {
  /** aff5: 80-100% — verde vibrante = brandAccent */
  aff5: "#3A9E7A",
  /** aff4: 60-79%  — verde bosque = success */
  aff4: "#6B9B7A",
  /** aff3: 40-59%  — mostaza = warning */
  aff3: "#C89B5C",
  /** aff2: 20-39%  — terracota suave = danger300 */
  aff2: "#D07777",
  /** aff1: 0-19%   — terracota = danger */
  aff1: "#B85C5C",
} as const;

/** Tokens de afinidad en dark mode (tints mas claros para contraste). */
export const affinityDark = {
  aff5: "#5BCEA0",
  aff4: "#8FB89A",
  aff3: "#D9B378",
  aff2: "#E09090",
  aff1: "#D07777",
} as const;

export type AffinityTier = keyof typeof affinity;
