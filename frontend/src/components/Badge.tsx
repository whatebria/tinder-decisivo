/**
 * Badge: chip compacto para status. 5 variantes semanticas.
 */

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";

export type BadgeVariant = "neutral" | "success" | "warning" | "info" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = "neutral", style }: BadgeProps) {
  const s = VARIANTS[variant];
  return (
    <View style={[styles.base, s.container, style]}>
      <Text style={[styles.text, s.text]}>{children}</Text>
    </View>
  );
}

const VARIANTS = {
  neutral: {
    container: { backgroundColor: colors.border2 },
    text: { color: colors.textSecondary },
  },
  success: {
    container: { backgroundColor: colors.success100 },
    text: { color: colors.success700 },
  },
  warning: {
    container: { backgroundColor: colors.warning100 },
    text: { color: colors.warning700 },
  },
  info: {
    container: { backgroundColor: colors.info100 },
    text: { color: colors.info700 },
  },
  danger: {
    container: { backgroundColor: colors.danger100 },
    text: { color: colors.danger700 },
  },
} as const;

const styles = StyleSheet.create({
  base: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.rFull,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
});
