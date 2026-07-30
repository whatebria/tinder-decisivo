/**
 * DemoText: <Text> con color del theme, para usar en los renders de showcases.
 *
 * Sin este helper, cada showcase que use <Text> raw se ve NEGRO en dark mode
 * (porque React Native web mete color negro por default cuando no se especifica).
 *
 * Vive dentro de `src/components/showcase/` para que los `.showcase.tsx` colocated
 * no tengan que importar desde `src/screens/design-system/` (dependencia inversa).
 */

import React from "react";
import { Text, type TextProps } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

interface DemoTextProps extends TextProps {
  /** "primary" (default) para texto principal, "secondary" para meta. */
  tone?: "primary" | "secondary" | "tertiary";
}

export function DemoText({ tone = "primary", style, children, ...rest }: DemoTextProps) {
  const c = useThemeColors();
  const color = tone === "secondary" ? c.textSecondary : tone === "tertiary" ? c.textTertiary : c.text;
  return (
    <Text {...rest} style={[{ color, fontSize: 14 }, style]}>
      {children}
    </Text>
  );
}
