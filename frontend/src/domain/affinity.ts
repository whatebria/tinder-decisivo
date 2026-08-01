/**
 * affinity.ts — Tier de afinidad politica.
 *
 * Convierte un porcentaje de match (0-100) al token de color correcto
 * segun el sistema DS-08 (Affinity Tiers). Funciones puras, sin deps React.
 *
 * Tokens definidos en ds-shared.css:
 *   --c-aff5: #3A9E7A  (81-100%)  verde acento
 *   --c-aff4: #6B9B7A  (61-80%)   verde bosque (success)
 *   --c-aff3: #C89B5C  (41-60%)   mostaza (warning)
 *   --c-aff2: #D07777  (21-40%)   terracota media
 *   --c-aff1: #B85C5C  (0-20%)    terracota (danger)
 *
 * Dark mode: colores aclarados para contraste sobre bg oscuro.
 * Nota: aff5 light (#3A9E7A) == --c-accent del DS.
 */

export type AffinityTier = 1 | 2 | 3 | 4 | 5;

/** Hexadecimales exactos de ds-shared.css — no cambiar sin actualizar el DS. */
const AFFINITY_LIGHT: Record<AffinityTier, string> = {
  5: "#3A9E7A",
  4: "#6B9B7A",
  3: "#C89B5C",
  2: "#D07777",
  1: "#B85C5C",
};

/** Versiones aclaradas para dark mode (misma proporcion que success/warning/danger dark). */
const AFFINITY_DARK: Record<AffinityTier, string> = {
  5: "#5BCEA0",
  4: "#8FB89A",
  3: "#D9B378",
  2: "#D07777",
  1: "#D07777",
};

/**
 * Retorna el tier (1-5) de afinidad para un porcentaje dado.
 *
 * @param pct — 0 a 100. Se clampea automaticamente.
 */
export function getAffinityTier(pct: number): AffinityTier {
  const clamped = Math.min(100, Math.max(0, pct));
  if (clamped >= 81) return 5;
  if (clamped >= 61) return 4;
  if (clamped >= 41) return 3;
  if (clamped >= 21) return 2;
  return 1;
}

/**
 * Retorna el color hex del tier de afinidad para el porcentaje dado.
 *
 * @param pct — 0 a 100.
 * @param isDark — si true, retorna la variante dark mode.
 */
export function getAffinityColor(pct: number, isDark = false): string {
  const tier = getAffinityTier(pct);
  return isDark ? AFFINITY_DARK[tier] : AFFINITY_LIGHT[tier];
}
