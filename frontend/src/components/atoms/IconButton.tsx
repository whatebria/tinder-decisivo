/**
 * IconButton: pastilla circular con icono. 3 variantes + 3 tamanos. Reactivo al tema.
 */

import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { radii } from "../../theme/radii";
import { useThemeColors } from "../../theme/useTheme";

export type IconButtonVariant = "soft" | "ghost" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
} as const;

export function IconButton({
  children,
  variant = "soft",
  size = "md",
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const c = useThemeColors();

  const styles = useMemo(() => {
    const VARIANTS = {
      soft: { backgroundColor: c.accent2 },
      ghost: { backgroundColor: "transparent" },
      solid: { backgroundColor: c.primary },
    } as const;
    return StyleSheet.create({
      base: {
        borderRadius: radii.rFull,
        alignItems: "center",
        justifyContent: "center",
        ...VARIANTS[variant],
      },
      pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
      disabled: { opacity: 0.4 },
    });
  }, [c, variant]);

  const sizeStyle = SIZES[size];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
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
