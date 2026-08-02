/**
 * Button: 5 variantes x 3 tamanos. Reactivo al tema (light/dark).
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

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { useBlurringPress } from "../../hooks/useBlurringPress";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "accent";
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

// TASK-066: valores completamente estaticos a nivel de modulo.
// Layout base, estados y dimensiones no dependen del tema.
const s = StyleSheet.create({
  base: { borderRadius: radii.rMd, alignItems: "center", justifyContent: "center" },
  fullWidth: { alignSelf: "stretch" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  inner: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "600", textAlign: "center" },
});

// Dimensiones (spacing tokens) son estaticas -- no dependen del tema.
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

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth = true,
  leftIcon,
  rightIcon,
  disabled,
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const c = useThemeColors();
  const isDisabled = disabled || loading;
  // Blur en web antes de invocar onPress -> evita warning aria-hidden WCAG
  // 2.4.3 cuando el press dispara navigate() o cierre de modal. Ver
  // hooks/useBlurringPress.
  const handlePress = useBlurringPress(onPress);

  // Colores del tema: objetos planos (sin StyleSheet.create -- ya tienen las
  // props en formato correcto para el style prop de RN).
  const VARIANTS = {
    primary: {
      container: { backgroundColor: c.primary, borderColor: c.primary, borderWidth: 1.5 },
      text: { color: c.textOnPrimary },
    },
    secondary: {
      container: { backgroundColor: "transparent", borderColor: c.primary, borderWidth: 1.5 },
      text: { color: c.primary },
    },
    ghost: {
      container: { backgroundColor: "transparent", borderColor: c.border, borderWidth: 1 },
      text: { color: c.textSecondary },
    },
    danger: {
      container: { backgroundColor: c.danger, borderColor: c.danger, borderWidth: 1.5 },
      text: { color: c.textOnPrimary },
    },
    success: {
      container: { backgroundColor: c.success, borderColor: c.success, borderWidth: 1.5 },
      text: { color: c.textOnPrimary },
    },
    accent: {
      // DS-11: CTA hero Home, lock overlay, compartir. Max 3x por viewport.
      // Usa brandAccent (#3A9E7A light / #5BCEA0 dark) en vez de c.accent
      // que es solo el tint de hover (#A8C5B5).
      container: { backgroundColor: c.brandAccent, borderColor: c.brandAccent, borderWidth: 1.5 },
      text: { color: "#FFFFFF" },
    },
  } as const;

  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={(state) => [
        s.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && s.fullWidth,
        state.pressed && !isDisabled && s.pressed,
        isDisabled && s.disabled,
        style,
      ]}
    >
      <View style={s.inner}>
        {loading ? (
          <ActivityIndicator
            color={variantStyle.text.color}
            style={{ marginRight: spacing.sp2 }}
            size="small"
          />
        ) : leftIcon ? (
          <View style={{ marginRight: spacing.sp2 }}>{leftIcon}</View>
        ) : null}
        <Text style={[s.text, variantStyle.text, sizeStyle.text]}>{children}</Text>
        {rightIcon ? <View style={{ marginLeft: spacing.sp2 }}>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}
