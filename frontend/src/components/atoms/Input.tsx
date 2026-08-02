/**
 * Input / Textarea: TextInput con estilos WCAG-friendly, tema reactivo,
 * variante error y soporte multiline (usa multiline={true} para textarea).
 */

import React from "react";
import {
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface InputProps extends TextInputProps {
  hasError?: boolean;
  style?: StyleProp<TextStyle>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: radii.rMd,
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp3,
    fontSize: 16,
    minHeight: 48,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: spacing.sp3,
  },
});

export function Input({ hasError, style, multiline, ...rest }: InputProps) {
  const c = useThemeColors();
  // borderColor depends on hasError prop — computed inline
  const borderColor = hasError ? c.danger : c.border;

  return (
    <TextInput
      {...rest}
      multiline={multiline}
      placeholderTextColor={c.textTertiary}
      style={[
        styles.base,
        { backgroundColor: c.card, borderColor, color: c.text },
        multiline && styles.multiline,
        style,
      ]}
    />
  );
}
