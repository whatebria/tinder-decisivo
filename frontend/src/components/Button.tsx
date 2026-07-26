/**
 * Button: version expandida de PrimaryButton con 4 variantes y 3 tamanos.
 *
 * Variantes: primary | secondary | ghost | danger
 * Tamanos:   sm | md | lg
 *
 * Reemplaza a PrimaryButton, que queda deprecado (dejamos el archivo por si
 * hay imports viejos, pero nuevo codigo debe usar este).
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator
            color={variantStyle.text.color}
            style={{ marginRight: spacing.sp2 }}
            size="small"
          />
        ) : leftIcon ? (
          <View style={{ marginRight: spacing.sp2 }}>{leftIcon}</View>
        ) : null}
        <Text style={[styles.text, variantStyle.text, sizeStyle.text]}>{children}</Text>
        {rightIcon ? <View style={{ marginLeft: spacing.sp2 }}>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1.5 },
    text: { color: "#FFFFFF" as const },
  },
  secondary: {
    container: { backgroundColor: "transparent", borderColor: colors.primary, borderWidth: 1.5 },
    text: { color: colors.primary },
  },
  ghost: {
    container: { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 },
    text: { color: colors.textSecondary },
  },
  danger: {
    container: { backgroundColor: colors.danger, borderColor: colors.danger, borderWidth: 1.5 },
    text: { color: "#FFFFFF" as const },
  },
} as const;

const SIZES = {
  sm: {
    container: { paddingVertical: spacing.sp2, paddingHorizontal: spacing.sp4, minHeight: 36 },
    text: { fontSize: 14 },
  },
  md: {
    container: { paddingVertical: spacing.sp3, paddingHorizontal: spacing.sp5, minHeight: 48 },
    text: { fontSize: 16 },
  },
  lg: {
    container: { paddingVertical: spacing.sp4, paddingHorizontal: spacing.sp6, minHeight: 56 },
    text: { fontSize: 18 },
  },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.rMd,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  inner: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "600", textAlign: "center" },
});
