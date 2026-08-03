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
import { colors, affinity } from "../theme/colors";
import type { MatchResult } from "../api/endpoints";

// -- Match tier (DS-08: 5 tiers de afinidad) --------------------------------

/**
 * 5 niveles de afinidad electoral (DS-08):
 *   aff5: 80-100%  verde vibrante (brandAccent)
 *   aff4: 60-79%   verde bosque   (success)
 *   aff3: 40-59%   mostaza        (warning)
 *   aff2: 20-39%   terracota suave (danger300)
 *   aff1: 0-19%    terracota      (danger)
 */
export type MatchTier = "aff5" | "aff4" | "aff3" | "aff2" | "aff1";

const TIER_THRESHOLDS = { t5: 80, t4: 60, t3: 40, t2: 20 } as const;

/** Sub-set de la paleta que necesitamos para colorear confianza. */
export interface MatchPalette {
  success: string;
  warning: string;
  danger: string;
}

export function getMatchTier(pct: number): MatchTier {
  if (pct >= TIER_THRESHOLDS.t5) return "aff5";
  if (pct >= TIER_THRESHOLDS.t4) return "aff4";
  if (pct >= TIER_THRESHOLDS.t3) return "aff3";
  if (pct >= TIER_THRESHOLDS.t2) return "aff2";
  return "aff1";
}

/**
 * Devuelve el color hex del tier de afinidad para un porcentaje dado.
 * Usa tokens DS-08 (affinity) directamente -- theme-agnostic.
 * Para dark mode, usa `affinityDark` desde theme/colors.
 */
export function getMatchColor(pct: number): string {
  return affinity[getMatchTier(pct)];
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
    MEDIA: { label: "Media confianza", color: palette.warning },
    TENTATIVA: { label: "Baja confianza", color: palette.danger },
  };
  return badges[key] ?? badges.TENTATIVA;
}

/**
 * Variante de Badge para nivel de confianza -- para uso con el componente
 * <Badge variant={...}>. Testeable de forma aislada.
 * Centralizado aqui para evitar duplicacion en pantallas (DRY, TASK-013).
 */
export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

export function getConfianzaBadgeVariant(confianza?: string): BadgeVariant {
  const key = (confianza ?? "TENTATIVA").toUpperCase();
  if (key === "ALTA")  return "success";
  if (key === "MEDIA") return "warning";
  return "danger";
}

/**
 * True si el nivel de confianza es TENTATIVA o desconocido (valor por defecto
 * cuando el backend no devuelve confianza). Centralizado para que si aparecen
 * nuevos niveles ("PARCIAL", "INSUFICIENTE") el cambio sea en un solo lugar.
 */
export function isConfianzaTentativa(confianza?: string): boolean {
  // Usa || en lugar de ?? para que string vacio tambien defaultee a TENTATIVA.
  // Un string vacio es tan ambiguo como undefined: sin dato = tentativa.
  return (confianza || "TENTATIVA").toUpperCase() === "TENTATIVA";
}

// -- Likert stance color -----------------------------------------------------

/**
 * Subset del tema necesario para colorear posturas en escala Likert de 5 niveles.
 * Es compatible con el objeto que devuelve `useThemeColors()` (contiene todos los tints).
 */
export interface LikertColorPalette {
  success200: string;   // verde claro — extremo positivo en dark bg
  success:    string;   // verde base  — positivo moderado (tema-dependiente)
  success600: string;   // verde oscuro — extremo positivo en light bg
  textSecondary: string;
  danger200: string;    // rojo claro  — extremo negativo en dark bg
  danger:    string;    // rojo base   — negativo moderado (tema-dependiente)
  danger600: string;    // rojo oscuro — extremo negativo en light bg
}

/**
 * Devuelve el color del texto de una postura segun su valor Likert (1-5).
 *
 * Escala:
 *   5 (Muy de acuerdo)    — verde fuerte
 *   4 (De acuerdo)        — verde suave
 *   3 (Neutral)           — textSecondary
 *   2 (En desacuerdo)     — rojo suave
 *   1 (Muy en desacuerdo) — rojo fuerte
 *
 * @param valor   opcion_respuesta_valor del backend (1-5)
 * @param palette useThemeColors() — incluye todos los tints + semanticos
 * @param isDark  useIsDark() — selecciona tint claro u oscuro segun bg
 */
export function getLikertColor(
  valor: number,
  palette: LikertColorPalette,
  isDark: boolean,
): string {
  switch (valor) {
    case 5: return isDark ? palette.success200 : palette.success600;
    case 4: return palette.success;
    case 3: return palette.textSecondary;
    case 2: return palette.danger;
    case 1: return isDark ? palette.danger200 : palette.danger600;
    default: return palette.textSecondary;
  }
}

// -- Confianza tier ----------------------------------------------------------

/** Mapa de nivel de confianza (backend) -> tier visual. */
const CONFIANZA_MAP: Record<string, ConfianzaTier> = {
  ALTA:  "high",
  MEDIA: "mid",
  BAJA:  "low",
};

/** Tier visual de un nivel de confianza ("high" | "mid" | "low"). */
export type ConfianzaTier = "high" | "mid" | "low";

/**
 * Convierte el nivel de confianza del backend a un tier visual.
 *
 * - null / string vacío -> "mid" (dato ausente = medio, defensivo)
 * - "ALTA" -> "high", "MEDIA" -> "mid", "BAJA" -> "low"
 * - Valor desconocido -> "mid" + warn en DEV (TASK-035)
 */
export function confianzaToTier(confianza: string | null): ConfianzaTier {
  if (!confianza) return "mid";
  const tier = CONFIANZA_MAP[confianza.toUpperCase()];
  if (!tier) {
    if (__DEV__) {
      console.warn(`[confianzaToTier] valor inesperado: "${confianza}"`);
    }
    return "mid";
  }
  return tier;
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
