/**
 * Checkbox: control de seleccion multiple / booleana.
 *
 * TASK-066: styles a nivel de modulo para valores estaticos;
 * colores dinamicos (checked, theme) via inline styles.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface CheckboxProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  checked: boolean;
}

// -- Estilos estaticos (modulo-level) -----------------------------------------

const S = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", minHeight: 44 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radii.rSm - 2,
    borderWidth: 2,
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
    borderRadius: 1,
    left: 2,
    top: 4,
    transform: [{ rotate: "45deg" }],
  },
  tickLong: {
    position: "absolute",
    width: 2,
    height: 10,
    borderRadius: 1,
    left: 7,
    top: 1,
    transform: [{ rotate: "135deg" }],
  },
  label: { fontSize: 16, flexShrink: 1 },
  disabled: { opacity: 0.5 },
});

// -- Componente ---------------------------------------------------------------

export function Checkbox({ label, checked, disabled, ...rest }: CheckboxProps) {
  const c = useThemeColors();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      style={[S.row, disabled && S.disabled]}
    >
      <View
        style={[
          S.box,
          {
            borderColor: checked ? c.primary : c.textTertiary,
            backgroundColor: checked ? c.primary : "transparent",
          },
        ]}
      >
        {checked ? (
          <View style={S.tickWrap}>
            <View style={[S.tickShort, { backgroundColor: c.textOnPrimary }]} />
            <View style={[S.tickLong,  { backgroundColor: c.textOnPrimary }]} />
          </View>
        ) : null}
      </View>
      <Text style={[S.label, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}
