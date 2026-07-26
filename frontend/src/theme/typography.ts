/**
 * Escala tipografica del design system (Paleta A).
 *
 * System font stack — cero dependencia externa, cero latencia.
 * Line-height 1.65 en cuerpo para lectura larga.
 *
 * Referencia: design-exploration/design-system.html section#typography.
 */

export const typography = {
  display: { fontSize: 34, fontWeight: "700", lineHeight: 34 * 1.3 },
  h1:      { fontSize: 28, fontWeight: "700", lineHeight: 28 * 1.3 },
  h2:      { fontSize: 24, fontWeight: "600", lineHeight: 24 * 1.3 },
  h3:      { fontSize: 20, fontWeight: "600", lineHeight: 20 * 1.4 },
  lead:    { fontSize: 18, fontWeight: "500", lineHeight: 18 * 1.5 },
  body:    { fontSize: 16, fontWeight: "400", lineHeight: 16 * 1.65 },
  small:   { fontSize: 14, fontWeight: "400", lineHeight: 14 * 1.5 },
  overline: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 12 * 1.5,
    letterSpacing: 0.96, // 0.08em de 12px
    textTransform: "uppercase" as const,
  },
} as const;

export type TypographyKey = keyof typeof typography;
