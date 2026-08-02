/**
 * TopNav: header minimalista. Brand + progreso opcional + accion opcional.
 * Uso ideal en flujos multi-paso (cuestionario) o pantallas de detalle.
 */

import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Button } from "../atoms/Button";
import { Progress } from "../atoms/Progress";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface TopNavProps {
  brand: string;
  /** Progreso 0-1. Si se pasa, se muestra la barra al medio. */
  progress?: number;
  /** Label del boton de accion. Si se omite, no se renderiza. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp4,
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp3,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  brand: { fontSize: 16, fontWeight: "700" },
  progressWrap: { flex: 1, maxWidth: 240 },
  spacer: { flex: 1 },
});

export function TopNav({ brand, progress, actionLabel, onAction, style }: TopNavProps) {
  const c = useThemeColors();

  return (
    <View
      style={[styles.bar, { backgroundColor: c.card, borderBottomColor: c.border2 }, style]}
      accessibilityRole="header"
    >
      <Text style={[styles.brand, { color: c.text }]}>{brand}</Text>
      {progress !== undefined ? (
        <View style={styles.progressWrap}>
          <Progress value={progress} />
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
      {actionLabel && onAction ? (
        <Button variant="ghost" size="sm" fullWidth={false} onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
