/**
 * Escala de espaciado base 4px.
 * Uso: usar sp3 (12px) o sp4 (16px) como default para gaps.
 * Padding generoso (sp6 / sp7) en superficies interactivas grandes.
 */
export const spacing = {
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 16,
  sp5: 20,
  sp6: 24,
  sp7: 32,
  sp8: 40,
  sp9: 56,
} as const;

export type SpacingKey = keyof typeof spacing;
