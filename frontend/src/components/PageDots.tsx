/**
 * PageDots: indicador de posicion en flujos multi-paso (onboarding, tour).
 *
 * El dot activo se expande a pill horizontal para dar peso visual.
 * Los pasos anteriores (index < current) se marcan como "done" (verde salvia).
 */

import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";

export interface PageDotsProps {
  total: number;
  current: number;
  style?: ViewStyle;
}

export function PageDots({ total, current, style }: PageDotsProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              isActive && styles.dotActive,
              isDone && styles.dotDone,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.rFull,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotDone: {
    backgroundColor: colors.secondary,
  },
});
