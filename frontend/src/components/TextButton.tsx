/**
 * TextButton: boton link-style (transparente, solo texto). Reactivo al tema.
 *
 * Existe porque <Button chromeless> de Tamagui v2.5 crashea en web.
 * Usa Pressable de RN, 100% portable.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { useThemeColors } from "../theme/useTheme";

export interface TextButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  color?: string;
}

export function TextButton({ children, color, style, ...props }: TextButtonProps) {
  const c = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
        },
        text: { fontSize: 15, color: c.primary, fontWeight: "600" },
      }),
    [c]
  );

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
