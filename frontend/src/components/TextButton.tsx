/**
 * TextButton: boton link-style (transparente, solo texto).
 *
 * Existe porque <Button chromeless> de Tamagui v2.5 crashea en web.
 * Usa Pressable de RN, 100% portable.
 */

import React from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors } from "../theme/colors";

export interface TextButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  color?: string;
}

export function TextButton({ children, color, style, ...props }: TextButtonProps) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.base,
        { opacity: state.pressed ? 0.6 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Text style={[styles.text, color ? { color } : null]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44, // WCAG 2.2 touch target
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "600",
  },
});
