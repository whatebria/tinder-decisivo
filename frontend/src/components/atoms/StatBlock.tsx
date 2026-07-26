/**
 * StatBlock: metrica destacada con numero grande + label pequeno. Reactivo al tema.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export type StatVariant = "default" | "primary" | "success" | "warning";

export interface StatBlockProps {
  value: string | number;
  label: string;
  variant?: StatVariant;
  delta?: string;
  style?: ViewStyle;
}

export function StatBlock({
  value,
  label,
  variant = "default",
  delta,
  style,
}: StatBlockProps) {
  const c = useThemeColors();

  const s = useMemo(() => {
    const VALUE_COLORS: Record<StatVariant, string> = {
      default: c.text,
      primary: c.primary,
      success: c.success600,
      warning: c.warning600,
    };
    return StyleSheet.create({
      container: {
        backgroundColor: c.card,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: radii.rMd,
        paddingVertical: spacing.sp4,
        paddingHorizontal: spacing.sp5,
        gap: 4,
      },
      value: {
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 28,
        color: VALUE_COLORS[variant],
      },
      label: {
        fontSize: 11,
        fontWeight: "500",
        color: c.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      delta: { fontSize: 12, color: c.textTertiary, marginTop: 2 },
    });
  }, [c, variant]);

  return (
    <View style={[s.container, style]}>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
      {delta ? <Text style={s.delta}>{delta}</Text> : null}
    </View>
  );
}
