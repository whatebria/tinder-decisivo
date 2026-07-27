/**
 * ChipActivo: chip "activo" removible del filter bar.
 *
 * Muestra el valor del filtro con un icono X a la derecha. Al presionar,
 * quita el filtro sin abrir el modal. Usado en el filter bar horizontal
 * de NoticiasScreen y CandidatosScreen (y cualquier screen con filtros
 * multiples).
 */

import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

export interface ChipActivoProps {
  label: string;
  onRemove: () => void;
}

export function ChipActivo({ label, onRemove }: ChipActivoProps) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`Quitar filtro ${label}`}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: c.primary, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.text, { color: c.textOnPrimary }]}>{label}</Text>
      <Icon name="close" size={14} color={c.textOnPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp1,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
    borderRadius: radii.rFull,
  },
  text: {
    ...typography.overline,
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: 0,
  },
});
