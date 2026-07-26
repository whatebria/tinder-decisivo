/**
 * Avatar: circulo con iniciales. Tres tamanos + color customizable.
 * Sin imagen por ahora (YAGNI): agregar prop `source` cuando haga falta.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export type AvatarSize = "sm" | "md" | "lg";

const DIM: Record<AvatarSize, { size: number; fontSize: number }> = {
  sm: { size: 32, fontSize: 12 },
  md: { size: 44, fontSize: 16 },
  lg: { size: 64, fontSize: 22 },
};

export interface AvatarProps {
  /** Iniciales — se cortan a 3 caracteres y se pasan a mayusculas. */
  initials: string;
  size?: AvatarSize;
  /** Color del fondo. Default: secondary. */
  backgroundColor?: string;
  /** Color del texto. Default: textOnPrimary. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ initials, size = "md", backgroundColor, color, style }: AvatarProps) {
  const c = useThemeColors();
  const dim = DIM[size];
  const bg = backgroundColor ?? c.secondary;
  const fg = color ?? c.textOnPrimary;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: dim.size,
          height: dim.size,
          borderRadius: dim.size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
        text: { color: fg, fontSize: dim.fontSize, fontWeight: "600" },
      }),
    [dim, bg, fg],
  );

  const shown = initials.slice(0, 3).toUpperCase();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar ${shown}`}
      style={[styles.base, style]}
    >
      <Text style={styles.text}>{shown}</Text>
    </View>
  );
}
