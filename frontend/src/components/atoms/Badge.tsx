/**
 * Badge: chip compacto para status. 5 variantes semanticas.
 * Reactivo al tema (light/dark).
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useThemeColors } from "../../theme/useTheme";

export type BadgeVariant = "neutral" | "success" | "warning" | "info" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = "neutral", style }: BadgeProps) {
  const c = useThemeColors();

  const s = useMemo(() => {
    const VARIANTS = {
      neutral: { bg: c.border2, fg: c.textSecondary },
      success: { bg: c.success100, fg: c.success700 },
      warning: { bg: c.warning100, fg: c.warning700 },
      info: { bg: c.info100, fg: c.info700 },
      danger: { bg: c.danger100, fg: c.danger700 },
    } as const;
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
  }, [c, variant]);

  return (
    <View style={[s.container, style]}>
      <Text style={s.text}>{children}</Text>
    </View>
  );
}
