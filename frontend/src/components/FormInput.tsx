/**
 * FormInput: TextInput de React Native puro con estilos WCAG-friendly.
 *
 * Existe porque el <Input> de Tamagui v2.5 tiene issues de renderizado en web.
 * Envolver TextInput de RN es 100% portable (iOS/Android/web) y suficiente
 * para los formularios del MVP.
 */

import React, { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { colors } from "../theme/colors";

export interface FormInputProps extends TextInputProps {
  hasError?: boolean;
}

export function FormInput({ hasError, style, ...props }: FormInputProps) {
  const [focused, setFocused] = useState(false);
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
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.base,
        focused && styles.focused,
        hasError && styles.error,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
    minHeight: 48, // WCAG 2.2 target size
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.danger,
  },
});
