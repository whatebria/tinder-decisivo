/**
 * MatchTier: badge de nivel de match entre usuario y candidato.
 * Alto (>=70%) verde, medio (40-69%) info, bajo (<40%) warning.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

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
  const isDark = useIsDark();
  const resolvedTier: MatchTierKind =
    tier ?? (percent !== undefined ? tierFromPercent(percent) : "mid");
  const displayPercent = showPercent ?? percent !== undefined;

  const styles = useMemo(() => {
    const palette: Record<MatchTierKind, { bg: string; fg: string; border: string }> = isDark
      ? {
          high: { bg: c.success800, fg: c.success100, border: c.success600 },
          mid: { bg: c.info800, fg: c.info100, border: c.info600 },
          low: { bg: c.warning800, fg: c.warning100, border: c.warning600 },
        }
      : {
          high: { bg: c.success100, fg: c.success700, border: c.success500 },
          mid: { bg: c.info100, fg: c.info700, border: c.info500 },
          low: { bg: c.warning100, fg: c.warning700, border: c.warning500 },
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
        borderColor: palette[resolvedTier].border,
      },
      text: {
        color: palette[resolvedTier].fg,
        fontSize: 12,
        fontWeight: "600" as const,
      },
    };
  }, [c, isDark, resolvedTier]);

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
