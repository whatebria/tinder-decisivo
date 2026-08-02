/**
 * PageDots: indicador de posicion multi-paso. Reactivo al tema.
 * Dot activo se expande a pill. Los pasos hechos van en verde salvia.
 */

import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useThemeColors } from "../../theme/useTheme";

export interface PageDotsProps {
  total: number;
  current: number;
  style?: ViewStyle;
}

// TASK-066: layout estatico a nivel de modulo. Colores dinamicos inline.
const s = StyleSheet.create({
  container: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: radii.rFull },
  dotActive: { width: 24 },
});

export function PageDots({ total, current, style }: PageDotsProps) {
  const c = useThemeColors();

  return (
    <View style={[s.container, style]} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const bg = isActive ? c.primary : isDone ? c.secondary : c.border;
        return (
          <View
            key={i}
            style={[s.dot, isActive && s.dotActive, { backgroundColor: bg }]}
          />
        );
      })}
    </View>
  );
}
