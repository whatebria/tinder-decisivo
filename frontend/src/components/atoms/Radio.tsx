/**
 * Radio: control de seleccion unica.
 *
 * Uso tipicamente dentro de una molecule RadioGroup, pero es reusable
 * standalone. `selected` es la fuente de verdad; el `onPress` sube al parent.
 *
 * TASK-066: styles a nivel de modulo para valores estaticos;
 * colores dinamicos (selected, theme) via inline styles.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface RadioProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  selected: boolean;
}

// -- Estilos estaticos (modulo-level) -----------------------------------------

const S = StyleSheet.create({
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sp3,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: { fontSize: 16, flexShrink: 1 },
  disabled: { opacity: 0.5 },
});

// -- Componente ---------------------------------------------------------------

export function Radio({ label, selected, disabled, ...rest }: RadioProps) {
  const c = useThemeColors();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !!disabled }}
      style={[S.row, disabled && S.disabled]}
    >
      <View
        style={[
          S.dot,
          { borderColor: selected ? c.primary : c.textTertiary },
        ]}
      >
        {selected ? (
          <View style={[S.inner, { backgroundColor: c.primary }]} />
        ) : null}
      </View>
      <Text style={[S.label, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}
