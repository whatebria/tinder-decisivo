/**
 * ActionButton: circulos grandes tipo Tinder para acciones destructivas/constructivas.
 *
 * Variantes semanticas: like | dislike | undo | info
 * Los primeros dos son de 64px, los secundarios (undo, info) son de 48px.
 *
 * Cada uno viene con su color pre-configurado, el consumidor solo pasa el icono
 * (SVG) via children.
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
import { shadows } from "../theme/shadows";

export type ActionButtonVariant = "like" | "dislike" | "undo" | "info";

export interface ActionButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  variant: ActionButtonVariant;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton({
  children,
  variant,
  disabled,
  style,
  ...rest
}: ActionButtonProps) {
  const config = VARIANTS[variant];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        { width: config.size, height: config.size },
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Colores expuestos para que el consumidor coloree su icono con el color correcto. */
export const ACTION_COLORS: Record<ActionButtonVariant, string> = {
  like: colors.success600,
  dislike: colors.danger500,
  undo: colors.textSecondary,
  info: colors.info500,
};

const VARIANTS = {
  like: { size: 64 },
  dislike: { size: 64 },
  undo: { size: 48 },
  info: { size: 48 },
} as const;

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radii.rFull,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.shMd,
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
  disabled: { opacity: 0.4 },
});
