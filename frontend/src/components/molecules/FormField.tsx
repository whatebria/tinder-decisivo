/**
 * FormField: label + Input + helper (o mensaje de error).
 * El bloque completo se anuncia junto en screen readers.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

import { Input, type InputProps } from "../atoms/Input";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface FormFieldProps extends Omit<InputProps, "hasError"> {
  /** Texto del label (obligatorio). */
  label: string;
  /** Texto de ayuda cuando no hay error. */
  helper?: string;
  /** Mensaje de error. Si esta presente, el Input se muestra en danger. */
  error?: string;
  /** Estilo del contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Estilo del label. */
  labelStyle?: StyleProp<TextStyle>;
}

export function FormField({
  label,
  helper,
  error,
  containerStyle,
  labelStyle,
  ...inputProps
}: FormFieldProps) {
  const c = useThemeColors();
  const hasError = !!error;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { marginBottom: spacing.sp4 },
        label: { fontSize: 14, fontWeight: "500", color: c.text, marginBottom: spacing.sp2 },
        helper: { fontSize: 12, color: c.textSecondary, marginTop: spacing.sp1 },
        error: { fontSize: 12, color: c.danger, marginTop: spacing.sp1 },
      }),
    [c],
  );

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Input hasError={hasError} accessibilityLabel={label} {...inputProps} />
      {hasError ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}
