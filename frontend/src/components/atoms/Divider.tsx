/**
 * Divider: linea separadora. Horizontal (default) o vertical.
 */

import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  style?: StyleProp<ViewStyle>;
}

export function Divider({ orientation = "horizontal", style }: DividerProps) {
  const c = useThemeColors();
  const base =
    orientation === "horizontal"
      ? { height: StyleSheet.hairlineWidth, width: "100%" as const }
      : { width: StyleSheet.hairlineWidth, alignSelf: "stretch" as const };
  return <View accessibilityRole="none" style={[base, { backgroundColor: c.border }, style]} />;
}
