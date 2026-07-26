/**
 * Radio: control de seleccion unica.
 *
 * Uso tipicamente dentro de una molecule RadioGroup, pero es reusable
 * standalone. `selected` es la fuente de verdad; el `onPress` sube al parent.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface RadioProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  selected: boolean;
}

export function Radio({ label, selected, disabled, ...rest }: RadioProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          minHeight: 44,
        },
        dot: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? c.primary : c.textTertiary,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.sp3,
        },
        inner: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: c.primary,
        },
        label: { fontSize: 16, color: c.text, flexShrink: 1 },
        disabled: { opacity: 0.5 },
      }),
    [c, selected],
  );

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !!disabled }}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={styles.dot}>{selected ? <View style={styles.inner} /> : null}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
