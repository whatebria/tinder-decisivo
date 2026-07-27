/**
 * Badge: chip compacto para status. 5 variantes semanticas.
 * Reactivo al tema (light/dark).
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

export type BadgeVariant = "neutral" | "success" | "warning" | "info" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = "neutral", style }: BadgeProps) {
  const c = useThemeColors();
  const isDark = useIsDark();

  const s = useMemo(() => {
    const VARIANTS = isDark
      ? {
          neutral: { bg: c.gray800, fg: c.gray100 },
          success: { bg: c.success800, fg: c.success100 },
          warning: { bg: c.warning800, fg: c.warning100 },
          info: { bg: c.info800, fg: c.info100 },
          danger: { bg: c.danger800, fg: c.danger100 },
        }
      : ({
          neutral: { bg: c.border2, fg: c.textSecondary },
          success: { bg: c.success100, fg: c.success700 },
          warning: { bg: c.warning100, fg: c.warning700 },
          info: { bg: c.info100, fg: c.info700 },
          danger: { bg: c.danger100, fg: c.danger700 },
        } as const);
    const v = VARIANTS[variant];
    return StyleSheet.create({
      container: {
        backgroundColor: v.bg,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: radii.rFull,
        alignSelf: "flex-start",
      },
      text: { color: v.fg, fontSize: 12, fontWeight: "500", lineHeight: 16 },
    });
  }, [c, isDark, variant]);

  return (
    <View style={[s.container, style]}>
      <Text style={s.text}>{children}</Text>
    </View>
  );
}
