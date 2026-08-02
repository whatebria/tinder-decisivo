/**
 * BookmarkButton: chip pequeno para guardar/quitar de guardados.
 *
 * No usa iconos SVG (evita dependencia). Estado visual con color de borde
 * y texto claro. Idempotente: siempre muestra "Guardar" o "Guardado".
 */

import React from "react";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface BookmarkButtonProps {
  saved: boolean;
  onPress: () => void;
  loading?: boolean;
  /** Label accesible; el visual solo dice Guardar/Guardado. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sp1,
    paddingHorizontal: spacing.sp3,
    borderRadius: radii.rFull,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "600" },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});

export function BookmarkButton({
  saved,
  onPress,
  loading = false,
  accessibilityLabel,
  style,
}: BookmarkButtonProps) {
  const c = useThemeColors();

  const label = saved ? "Guardado" : "Guardar";
  const a11y = accessibilityLabel ?? label;

  const chipColors = saved
    ? { backgroundColor: c.accent2, borderColor: c.primary }
    : { backgroundColor: "transparent" as const, borderColor: c.border };
  const textColor = saved ? c.primary : c.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ selected: saved, disabled: loading }}
      hitSlop={8}
      style={(s) => [
        styles.chip,
        chipColors,
        s.pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}
