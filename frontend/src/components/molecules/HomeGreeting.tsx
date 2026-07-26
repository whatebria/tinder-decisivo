/**
 * HomeGreeting: H1 saludo + subtitulo con posible énfasis en un valor.
 *
 * Ref: design-exploration/design-system.html · .home-greeting
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface HomeGreetingProps {
  /** Ejemplo: "Buenos días, Jenny". */
  title: string;
  /** Ejemplo: "Faltan 42 días para las elecciones presidenciales." */
  subtitleBefore?: string;
  /** Segmento con énfasis (color primary). Ejemplo: "42 días". */
  emphasized?: string;
  subtitleAfter?: string;
  /** Subtitle sin énfasis (usar si no hay valor destacado). */
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function HomeGreeting({
  title,
  subtitle,
  subtitleBefore,
  emphasized,
  subtitleAfter,
  style,
}: HomeGreetingProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 4 },
        title: {
          fontSize: 24,
          fontWeight: "700",
          color: c.text,
          lineHeight: 24 * 1.2,
        },
        sub: { fontSize: 14, color: c.textSecondary },
        emphasis: { color: c.primary, fontWeight: "600" },
      }),
    [c],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.sub}>{subtitle}</Text>
      ) : (subtitleBefore || emphasized || subtitleAfter) ? (
        <Text style={styles.sub}>
          {subtitleBefore ?? ""}
          {emphasized ? <Text style={styles.emphasis}>{emphasized}</Text> : null}
          {subtitleAfter ?? ""}
        </Text>
      ) : null}
    </View>
  );
}
