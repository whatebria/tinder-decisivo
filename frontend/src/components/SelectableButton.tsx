/**
 * SelectableButton: boton toggle-style para opciones de una escala Likert / chips.
 *
 * Es un Pressable de RN puro. Se ve outlined cuando NO esta seleccionado
 * y solido cuando esta activo. Portable, WCAG target 44px.
 */

import React from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors } from "../theme/colors";

export interface SelectableButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  selected?: boolean;
  align?: "left" | "center";
  compact?: boolean;
}

export function SelectableButton({
  children,
  selected = false,
  align = "left",
  compact = false,
  style,
  disabled,
  ...props
}: SelectableButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        selected ? styles.selected : styles.unselected,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { textAlign: align },
          selected ? styles.textSelected : styles.textUnselected,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  regular: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48, // WCAG 2.2
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  textSelected: {
    color: "#FFFFFF",
  },
  textUnselected: {
    color: colors.text,
  },
});
