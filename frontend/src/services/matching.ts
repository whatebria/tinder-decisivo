/**
 * Lógica pura del sistema de matching.
 *
 * Aca vive todo lo que NO depende de React ni de la UI:
 * - clasificacion de matches en tiers (alto/medio/bajo)
 * - mapeo de tier a color/label
 * - ordenamiento defensivo de resultados
 *
 * Se testea sin necesidad de renderizar componentes.
 */
import { colors } from "../theme/colors";
import type { MatchResult } from "../api/endpoints";

// -- Match tier --------------------------------------------------------------

export type MatchTier = "alto" | "medio" | "bajo";

const TIER_THRESHOLDS = { alto: 75, medio: 50 } as const;

export function getMatchTier(pct: number): MatchTier {
  if (pct >= TIER_THRESHOLDS.alto) return "alto";
  if (pct >= TIER_THRESHOLDS.medio) return "medio";
  return "bajo";
}

export function getMatchColor(pct: number): string {
  const tier = getMatchTier(pct);
  return {
    alto: colors.matchHigh,
    medio: colors.matchMedium,
    bajo: colors.matchLow,
  }[tier];
}

export function formatMatchPercentage(pct: number): string {
  return `${pct.toFixed(0)}%`;
}

// -- Confianza ---------------------------------------------------------------

export type ConfianzaLevel = "ALTA" | "MEDIA" | "TENTATIVA";
export interface ConfianzaBadge {
  label: string;
  color: string;
}

const CONFIANZA_BADGES: Record<ConfianzaLevel, ConfianzaBadge> = {
  ALTA: { label: "Alta confianza", color: colors.success },
  MEDIA: { label: "Confianza media", color: colors.warning },
  TENTATIVA: { label: "Confianza tentativa", color: colors.danger },
};

export function getConfianzaBadge(confianza: string | undefined): ConfianzaBadge {
  const key = (confianza ?? "TENTATIVA").toUpperCase() as ConfianzaLevel;
  return CONFIANZA_BADGES[key] ?? CONFIANZA_BADGES.TENTATIVA;
}

// -- Ordenamiento defensivo --------------------------------------------------

/**
 * Ordena por match_percentage descendente.
 * El backend ya deberia ordenarlos, pero no confiamos ciegamente.
 */
export function sortByMatchDesc(results: MatchResult[]): MatchResult[] {
  return [...results].sort(
    (a, b) => Number(b.match_percentage) - Number(a.match_percentage)
  );
}
