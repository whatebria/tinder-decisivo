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
import { useBlurringPress } from "../../hooks/useBlurringPress";

export type IconButtonVariant = "soft" | "ghost" | "solid" | "danger-solid";
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
  onPress,
  ...rest
}: IconButtonProps) {
  const c = useThemeColors();
  // Blur antes de disparar la accion -> evita warning aria-hidden WCAG 2.4.3
  // en web (comun en botones de cerrar modal). Ver hooks/useBlurringPress.
  const handlePress = useBlurringPress(onPress);

  const styles = useMemo(() => {
    const VARIANTS = {
      soft:         { backgroundColor: c.accent2 },
      ghost:        { backgroundColor: "transparent" },
      solid:        { backgroundColor: c.primary },
      // UX-040: variante destructiva — fondo danger (rojo) para estado activo
      // de descartar. El azul de "solid" comunica positivo; rojo comunica
      // descarte activo correctamente.
      "danger-solid": { backgroundColor: c.danger },
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
      onPress={handlePress}
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
