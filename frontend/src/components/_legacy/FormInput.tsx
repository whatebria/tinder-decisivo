/**
 * FormInput: TextInput de RN puro con estilos WCAG-friendly. Reactivo al tema.
 *
 * Envolver TextInput de RN es 100% portable (iOS/Android/web) y suficiente
 * para los formularios del MVP.
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export interface FormInputProps extends TextInputProps {
  hasError?: boolean;
}

export function FormInput({ hasError, style, ...props }: FormInputProps) {
  const c = useThemeColors();
  const [focused, setFocused] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: c.text,
          backgroundColor: c.card,
          minHeight: 48,
        },
        focused: { borderColor: c.primary, borderWidth: 2 },
        error: { borderColor: c.danger },
      }),
    [c]
  );

  return (
    <TextInput
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      placeholderTextColor={c.textTertiary}
      style={[styles.base, focused && styles.focused, hasError && styles.error, style]}
    />
  );
}
