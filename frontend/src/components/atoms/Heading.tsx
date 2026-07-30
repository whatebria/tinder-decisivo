/**
 * Heading: titulo semantico con role="heading" + aria-level correcto.
 *
 * Encapsula el patron `<Text style={typography.hN} accessibilityRole="header">`
 * para que TODA la app anuncie headings correctamente a screen readers y a
 * herramientas semanticas (queries por role, SEO, DOM inspection, tests).
 *
 * WCAG 2.4.6 (Headings and Labels) + 4.1.2 (Name, Role, Value).
 *
 * En RN Web:
 *   accessibilityRole="header" + aria-level={N}  ->  <h1..h6 role="heading">
 * En native:
 *   accessibilityRole="header" es anunciado por VoiceOver/TalkBack.
 *   aria-level se ignora silenciosamente (safe).
 *
 * Uso tipico:
 *   <Heading level={1}>Servel</Heading>
 *   <Heading level={2} color={c.success}>Enviado</Heading>
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export type HeadingLevel = 1 | 2 | 3;

export interface HeadingProps {
  /** Nivel semantico. Determina tanto el estilo como el aria-level. */
  level: HeadingLevel;
  children: React.ReactNode;
  /** Color custom. Default: c.text del tema. */
  color?: string;
  /** Escape hatch para overrides puntuales (alignment, margin, etc). */
  style?: StyleProp<TextStyle>;
  /** Cortar a N lineas con ellipsis. Passthrough al Text. */
  numberOfLines?: number;
}

const LEVEL_STYLES = {
  1: typography.h1,
  2: typography.h2,
  3: typography.h3,
} as const;

export function Heading({
  level,
  children,
  color,
  style,
  numberOfLines,
}: HeadingProps) {
  const c = useThemeColors();
  const finalColor = color ?? c.text;

  const baseStyle = useMemo(
    () =>
      StyleSheet.flatten([
        LEVEL_STYLES[level],
        { color: finalColor },
      ]) as TextStyle,
    [level, finalColor],
  );

  return (
    <Text
      accessibilityRole="header"
      aria-level={level}
      style={[baseStyle, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
