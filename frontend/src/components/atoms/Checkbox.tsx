/**
 * Checkbox: control de seleccion multiple / booleana.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface CheckboxProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  checked: boolean;
}

export function Checkbox({ label, checked, disabled, ...rest }: CheckboxProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: "row", alignItems: "center", minHeight: 44 },
        box: {
          width: 20,
          height: 20,
          borderRadius: radii.rSm - 2,
          borderWidth: 2,
          borderColor: checked ? c.primary : c.textTertiary,
          backgroundColor: checked ? c.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.sp3,
        },
        // Tick vectorial: dos rectangulos rotados forman un check mark.
        // Evita depender de fuentes/emoji y renderiza igual en todas las plataformas.
        tickWrap: {
          width: 12,
          height: 12,
          justifyContent: "center",
          alignItems: "center",
        },
        tickShort: {
          position: "absolute",
          width: 2,
          height: 6,
          backgroundColor: c.textOnPrimary,
          borderRadius: 1,
          left: 2,
          top: 4,
          transform: [{ rotate: "45deg" }],
        },
        tickLong: {
          position: "absolute",
          width: 2,
          height: 10,
          backgroundColor: c.textOnPrimary,
          borderRadius: 1,
          left: 7,
          top: 1,
          transform: [{ rotate: "135deg" }],
        },
        label: { fontSize: 16, color: c.text, flexShrink: 1 },
        disabled: { opacity: 0.5 },
      }),
    [c, checked],
  );

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={styles.box}>
        {checked ? (
          <View style={styles.tickWrap}>
            <View style={styles.tickShort} />
            <View style={styles.tickLong} />
          </View>
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
