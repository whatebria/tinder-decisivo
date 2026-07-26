/**
 * Link: texto interactivo estilo hyperlink. Color primary con underline.
 * Reemplaza a _legacy/TextButton para casos "aprende mas" / "ir a".
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export interface LinkProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  underline?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export function Link({ children, underline = true, disabled, textStyle, ...rest }: LinkProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pressable: { alignSelf: "flex-start", paddingVertical: 4 },
        text: {
          color: c.primary,
          fontSize: 16,
          fontWeight: "500",
          textDecorationLine: underline ? "underline" : "none",
        },
        disabled: { opacity: 0.5 },
        pressed: { opacity: 0.6 },
      }),
    [c, underline],
  );

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="link"
      style={(s) => [styles.pressable, s.pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </Pressable>
  );
}
