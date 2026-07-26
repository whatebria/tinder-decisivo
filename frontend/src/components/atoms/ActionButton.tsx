/**
 * ActionButton: circulos grandes tipo Tinder. Reactivo al tema.
 *
 * IMPORTANTE: ACTION_COLORS es un hook porque los colores dependen del tema.
 * Uso: const actionColors = useActionColors(); <Icon color={actionColors.like} />
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
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export type ActionButtonVariant = "like" | "dislike" | "undo" | "info";

export interface ActionButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  variant: ActionButtonVariant;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  like: 64,
  dislike: 64,
  undo: 48,
  info: 48,
} as const;

export function ActionButton({
  children,
  variant,
  disabled,
  style,
  ...rest
}: ActionButtonProps) {
  const c = useThemeColors();
  const sh = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          backgroundColor: c.card,
          borderRadius: radii.rFull,
          alignItems: "center",
          justifyContent: "center",
          ...sh.shMd,
        },
        pressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
        disabled: { opacity: 0.4 },
      }),
    [c, sh]
  );

  const size = SIZES[variant];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        { width: size, height: size },
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Hook para obtener los colores de icono correctos por variante segun el tema. */
export function useActionColors(): Record<ActionButtonVariant, string> {
  const c = useThemeColors();
  return {
    like: c.success600,
    dislike: c.danger500,
    undo: c.textSecondary,
    info: c.info500,
  };
}
