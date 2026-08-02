/**
 * MatchTier: badge de nivel de match entre usuario y candidato.
 * Alto (>=80%) verde, medio (40-79%) mostaza, bajo (<40%) mostaza.
 *
 * Delega los thresholds en getMatchTier() del service (fuente unica de verdad).
 * Antes tenia su propio tierFromPercent() con thresholds distintos (BUG: TASK-018).
 */

import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { getMatchTier } from "../../services/matching";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

export type MatchTierKind = "high" | "mid" | "low";

export interface MatchTierProps {
  /** Porcentaje 0-100. Si se pasa, se calcula el tier automaticamente. */
  percent?: number;
  /** Tier explicito. Sobrescribe el calculado por percent. */
  tier?: MatchTierKind;
  /** Texto custom. Default: "Match alto/medio/bajo · X%". */
  label?: string;
  /** Si se muestra el % junto al label. Default: true cuando hay percent. */
  showPercent?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TIER_LABEL: Record<MatchTierKind, string> = {
  high: "Alta coincidencia",
  mid: "Coincidencia media",
  low: "Baja coincidencia",
};

/**
 * Convierte el porcentaje al tier de 3 niveles del badge.
 * Delega en getMatchTier() para que los thresholds sean consistentes
 * con el resto de la app (TASK-018 / TASK-019).
 */
function tierFromPercent(p: number): MatchTierKind {
  const t = getMatchTier(p); // "aff5"|"aff4"|"aff3"|"aff2"|"aff1"
  if (t === "aff5" || t === "aff4") return "high"; // >=60%
  if (t === "aff3") return "mid";                  // 40-59%
  return "low";                                    // <40%
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    flexDirection: "row",
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
    borderRadius: radii.rFull,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: "600" },
});

type TierColors = { bg: string; fg: string; border: string };

export function MatchTier({ percent, tier, label, showPercent, style }: MatchTierProps) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const resolvedTier: MatchTierKind =
    tier ?? (percent !== undefined ? tierFromPercent(percent) : "mid");
  const displayPercent = showPercent ?? percent !== undefined;

  // Tier medio y bajo usan warning (mostaza) en lugar de info (azul).
  // El azul ya tiene significado en la app (= el usuario en el radar chart)
  // y en Chile el azul tiene connotacion partidaria. (TASK-018)
  const darkPalette: Record<MatchTierKind, TierColors> = {
    high: { bg: c.success800, fg: c.success100, border: c.success600 },
    mid:  { bg: c.warning800, fg: c.warning100, border: c.warning600 },
    low:  { bg: c.warning800, fg: c.warning100, border: c.warning600 },
  };
  const lightPalette: Record<MatchTierKind, TierColors> = {
    high: { bg: c.success100, fg: c.success700, border: c.success500 },
    mid:  { bg: c.warning100, fg: c.warning700, border: c.warning500 },
    low:  { bg: c.warning100, fg: c.warning700, border: c.warning500 },
  };
  const p = (isDark ? darkPalette : lightPalette)[resolvedTier];

  const finalLabel =
    label ??
    (displayPercent && percent !== undefined
      ? `${TIER_LABEL[resolvedTier]} · ${Math.round(percent)}%`
      : TIER_LABEL[resolvedTier]);

  return (
    <View
      accessibilityRole="text"
      style={[styles.base, { backgroundColor: p.bg, borderColor: p.border }, style]}
    >
      <Text style={[styles.text, { color: p.fg }]}>{finalLabel}</Text>
    </View>
  );
}
