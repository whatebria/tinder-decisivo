/**
 * Logica pura del sistema de matching.
 *
 * Aca vive todo lo que NO depende de React ni de la UI:
 * - clasificacion de matches en tiers (alto/medio/bajo)
 * - mapeo de tier a color/label (acepta paleta como parametro, theme-agnostic)
 * - ordenamiento defensivo de resultados
 *
 * Se testea sin necesidad de renderizar componentes.
 */
import { colors } from "../theme/colors";
import type { MatchResult } from "../api/endpoints";

// -- Match tier --------------------------------------------------------------

export type MatchTier = "alto" | "medio" | "bajo";

const TIER_THRESHOLDS = { alto: 75, medio: 50 } as const;

/** Sub-set de la paleta que necesitamos para colorear matches. */
export interface MatchPalette {
  success: string;
  warning: string;
  danger: string;
}

export function getMatchTier(pct: number): MatchTier {
  if (pct >= TIER_THRESHOLDS.alto) return "alto";
  if (pct >= TIER_THRESHOLDS.medio) return "medio";
  return "bajo";
}

/**
 * Devuelve el color hex correspondiente al tier del match.
 * @param pct porcentaje del match (0-100)
 * @param palette paleta a usar. Default: `colors` (light theme). En componentes
 *   reactivos al tema, pasar `useThemeColors()`.
 */
export function getMatchColor(pct: number, palette: MatchPalette = colors): string {
  const tier = getMatchTier(pct);
  return {
    alto: palette.success,
    medio: palette.warning,
    bajo: palette.danger,
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

/**
 * Badge con label + color segun nivel de confianza.
 * @param palette default light theme; pasar `useThemeColors()` en UI reactiva.
 */
export function getConfianzaBadge(
  confianza: string | undefined,
  palette: MatchPalette = colors
): ConfianzaBadge {
  const key = (confianza ?? "TENTATIVA").toUpperCase() as ConfianzaLevel;
  const badges: Record<ConfianzaLevel, ConfianzaBadge> = {
    ALTA: { label: "Alta confianza", color: palette.success },
    MEDIA: { label: "Confianza media", color: palette.warning },
    TENTATIVA: { label: "Confianza tentativa", color: palette.danger },
  };
  return badges[key] ?? badges.TENTATIVA;
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
