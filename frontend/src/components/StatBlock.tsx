/**
 * StatBlock: metrica destacada con numero grande + label pequeno.
 * 4 variantes semanticas de color para el numero (default | primary | success | warning).
 */

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

export type StatVariant = "default" | "primary" | "success" | "warning";

export interface StatBlockProps {
  value: string | number;
  label: string;
  variant?: StatVariant;
  delta?: string;
  style?: ViewStyle;
}

const VALUE_COLORS: Record<StatVariant, string> = {
  default: colors.text,
  primary: colors.primary,
  success: colors.success600,
  warning: colors.warning600,
};

export function StatBlock({ value, label, variant = "default", delta, style }: StatBlockProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.value, { color: VALUE_COLORS[variant] }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {delta ? <Text style={styles.delta}>{delta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.rMd,
    paddingVertical: spacing.sp4,
    paddingHorizontal: spacing.sp5,
    gap: 4,
  },
  value: { fontSize: 24, fontWeight: "700", lineHeight: 28 },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  delta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
});
