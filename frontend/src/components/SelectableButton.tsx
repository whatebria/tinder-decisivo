/**
 * SelectableButton: boton toggle-style para opciones Likert / chips. Reactivo al tema.
 * Outlined cuando NO esta seleccionado, solido cuando esta activo. WCAG target 44px+.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { useThemeColors } from "../theme/useTheme";

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
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: { borderRadius: 8, borderWidth: 1.5, justifyContent: "center" },
        regular: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 48 },
        compact: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 40 },
        selected: { backgroundColor: c.primary, borderColor: c.primary },
        unselected: { backgroundColor: c.bg, borderColor: c.border },
        pressed: { opacity: 0.75 },
        disabled: { opacity: 0.5 },
        text: { fontSize: 15, fontWeight: "600" },
        textSelected: { color: c.textOnPrimary },
        textUnselected: { color: c.text },
      }),
    [c]
  );

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
