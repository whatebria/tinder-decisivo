/**
 * MatchTier: badge de nivel de match entre usuario y candidato.
 * Alto (>=70%) verde, medio (40-69%) info, bajo (<40%) warning.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

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
  high: "Match alto",
  mid: "Match medio",
  low: "Match bajo",
};

function tierFromPercent(p: number): MatchTierKind {
  if (p >= 70) return "high";
  if (p >= 40) return "mid";
  return "low";
}

export function MatchTier({ percent, tier, label, showPercent, style }: MatchTierProps) {
  const c = useThemeColors();
  const resolvedTier: MatchTierKind =
    tier ?? (percent !== undefined ? tierFromPercent(percent) : "mid");
  const displayPercent = showPercent ?? percent !== undefined;

  const styles = useMemo(() => {
    const palette: Record<MatchTierKind, { bg: string; fg: string }> = {
      high: { bg: c.accent2, fg: c.success },
      mid: { bg: c.card, fg: c.info },
      low: { bg: c.card, fg: c.warning },
    };
    return {
      base: {
        alignSelf: "flex-start" as const,
        flexDirection: "row" as const,
        paddingHorizontal: spacing.sp3,
        paddingVertical: spacing.sp1,
        borderRadius: radii.rFull,
        backgroundColor: palette[resolvedTier].bg,
        borderWidth: 1,
        borderColor: palette[resolvedTier].fg,
      },
      text: {
        color: palette[resolvedTier].fg,
        fontSize: 12,
        fontWeight: "600" as const,
      },
    };
  }, [c, resolvedTier]);

  const finalLabel =
    label ??
    (displayPercent && percent !== undefined
      ? `${TIER_LABEL[resolvedTier]} · ${Math.round(percent)}%`
      : TIER_LABEL[resolvedTier]);

  return (
    <View accessibilityRole="text" style={[styles.base, style]}>
      <Text style={styles.text}>{finalLabel}</Text>
    </View>
  );
}
