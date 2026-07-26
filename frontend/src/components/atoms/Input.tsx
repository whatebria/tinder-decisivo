/**
 * Input / Textarea: TextInput con estilos WCAG-friendly, tema reactivo,
 * variante error y soporte multiline (usa multiline={true} para textarea).
 *
 * Reemplaza a _legacy/FormInput.
 */

import React, { useMemo } from "react";
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

export function Input({ hasError, style, multiline, ...rest }: InputProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          backgroundColor: c.card,
          borderWidth: 1.5,
          borderColor: hasError ? c.danger : c.border,
          borderRadius: radii.rMd,
          paddingHorizontal: spacing.sp4,
          paddingVertical: spacing.sp3,
          fontSize: 16,
          color: c.text,
          minHeight: 48,
        },
        multiline: {
          minHeight: 96,
          textAlignVertical: "top",
          paddingTop: spacing.sp3,
        },
      }),
    [c, hasError],
  );

  return (
    <TextInput
      {...rest}
      multiline={multiline}
      placeholderTextColor={c.textTertiary}
      style={[styles.base, multiline && styles.multiline, style]}
    />
  );
}
