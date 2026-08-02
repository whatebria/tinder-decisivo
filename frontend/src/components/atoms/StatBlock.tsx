/**
 * StatBlock: metrica destacada con numero grande + label pequeno. Reactivo al tema.
 */

import React from "react";
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

// TASK-066: valores estaticos a nivel de modulo.
const s = StyleSheet.create({
  container: {
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
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  delta: { fontSize: 12, marginTop: 2 },
});

export function StatBlock({
  value,
  label,
  variant = "default",
  delta,
  style,
}: StatBlockProps) {
  const c = useThemeColors();

  const VALUE_COLORS: Record<StatVariant, string> = {
    default: c.text,
    primary: c.primary,
    success: c.success600,
    warning: c.warning600,
  };

  return (
    <View style={[s.container, { backgroundColor: c.card, borderColor: c.border }, style]}>
      <Text style={[s.value, { color: VALUE_COLORS[variant] }]}>{value}</Text>
      <Text style={[s.label, { color: c.textSecondary }]}>{label}</Text>
      {delta ? <Text style={[s.delta, { color: c.textTertiary }]}>{delta}</Text> : null}
    </View>
  );
}
