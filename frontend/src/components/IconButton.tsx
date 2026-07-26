/**
 * IconButton: pastilla circular con icono. 3 variantes + 3 tamanos.
 * El icono viene como children (SVG del consumidor).
 * Siempre requiere accessibilityLabel para lectores de pantalla.
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";

export type IconButtonVariant = "soft" | "ghost" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  children,
  variant = "soft",
  size = "md",
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        variantStyle,
        sizeStyle,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const VARIANTS = {
  soft: { backgroundColor: colors.accent2 },
  ghost: { backgroundColor: "transparent" },
  solid: { backgroundColor: colors.primary },
} as const;

const SIZES = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.rFull,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.4 },
});
