/**
 * Link: texto interactivo estilo hyperlink. Color primary por default.
 *
 * Dos modos:
 *  - inline (default): paddingVertical 4, alignSelf flex-start. Ideal para
 *    "aprende mas" dentro de un parrafo.
 *  - block (opt-in): paddingVertical 12, minHeight 44, alignSelf stretch,
 *    textAlign center. Ideal para acciones tipo "Volver" / "Cancelar" que
 *    antes usaban el legacy Link.
 *
 * Reemplaza tanto a atoms/Link antiguo como al legacy Link.
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
} from "react-native";

import { useThemeColors } from "../../theme/useTheme";
import { useBlurringPress } from "../../hooks/useBlurringPress";

export interface LinkProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  /** Subraya el texto. Default: false (equivalente a Link). */
  underline?: boolean;
  /** Color custom. Default: primary del tema. */
  color?: string;
  /** Modo bloque: tap-area grande, stretch, centrado. Default: false (inline). */
  block?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

const styles = StyleSheet.create({
  inline: { alignSelf: "flex-start", paddingVertical: 4 },
  block: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.6 },
});

export function Link({
  children,
  underline = false,
  color,
  block = false,
  disabled,
  textStyle: textStyleProp,
  onPress,
  ...rest
}: LinkProps) {
  const c = useThemeColors();
  const finalColor = color ?? c.primary;
  // Blur antes de navegar/cerrar overlays -> evita warning aria-hidden WCAG 2.4.3
  const handlePress = useBlurringPress(onPress);

  // All text properties are prop-derived — computed plain object (not StyleSheet)
  const computedTextStyle = {
    color: finalColor,
    fontSize: block ? 15 : 16,
    fontWeight: (block ? "600" : "500") as "600" | "500",
    textDecorationLine: (underline ? "underline" : "none") as "underline" | "none",
    textAlign: (block ? "center" : "left") as "center" | "left",
  };

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="link"
      style={(s) => [
        block ? styles.block : styles.inline,
        s.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[computedTextStyle, textStyleProp]}>{children}</Text>
    </Pressable>
  );
}
