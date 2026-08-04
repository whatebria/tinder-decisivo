/**
 * affinity.ts — Tier de afinidad politica.
 *
 * Convierte un porcentaje de match (0-100) al token de color correcto
 * segun el sistema DS-08 (Affinity Tiers). Funciones puras, sin deps React.
 *
 * FIX C-01 (auditoría visual 2026-08-04): eliminada la duplicación DRY.
 * AFFINITY_LIGHT y AFFINITY_DARK ya no replican hexadecimales aqui.
 * Se importan directamente desde theme/colors.ts como fuente única de verdad.
 *
 * ANTES (violacion DRY): este archivo mantenia sus propias tablas de 10 hex
 * que duplicaban los tokens affinity/affinityDark de theme/colors.ts.
 * Un cambio en la paleta requeria editar DOS archivos con riesgo de desync.
 *
 * AHORA: un cambio en theme/colors.ts propaga automaticamente aqui.
 */

import { affinity, affinityDark } from "../theme/colors";

export type AffinityTier = 1 | 2 | 3 | 4 | 5;

// Mapa tier numerico → key del token de afinidad.
// Los tokens usan keys "aff1"-"aff5"; el tier es el numero directamente.
const TIER_KEY: Record<AffinityTier, keyof typeof affinity> = {
  5: "aff5",
  4: "aff4",
  3: "aff3",
  2: "aff2",
  1: "aff1",
} as const;

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
 * Lee directamente desde los tokens de theme/colors.ts (single source of truth).
 *
 * @param pct    — 0 a 100.
 * @param isDark — si true, retorna la variante dark mode.
 */
export function getAffinityColor(pct: number, isDark = false): string {
  const tier = getAffinityTier(pct);
  const key = TIER_KEY[tier];
  return isDark ? affinityDark[key] : affinity[key];
}
