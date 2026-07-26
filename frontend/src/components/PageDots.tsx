/**
 * PageDots: indicador de posicion multi-paso. Reactivo al tema.
 * Dot activo se expande a pill. Los pasos hechos van en verde salvia.
 */

import React, { useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { radii } from "../theme/radii";
import { useThemeColors } from "../theme/useTheme";

export interface PageDotsProps {
  total: number;
  current: number;
  style?: ViewStyle;
}

export function PageDots({ total, current, style }: PageDotsProps) {
  const c = useThemeColors();

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: "row", gap: 8, alignItems: "center" },
        dot: {
          width: 8,
          height: 8,
          borderRadius: radii.rFull,
          backgroundColor: c.border,
        },
        dotActive: { width: 24, backgroundColor: c.primary },
        dotDone: { backgroundColor: c.secondary },
      }),
    [c]
  );

  return (
    <View style={[s.container, style]} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <View
            key={i}
            style={[s.dot, isActive && s.dotActive, isDone && s.dotDone]}
          />
        );
      })}
    </View>
  );
}
