/**
 * Progress: barra de progreso horizontal. Verde salvia (secondary) para
 * sensacion organica de avance. `value` va de 0 a 1.
 */

import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useThemeColors } from "../../theme/useTheme";

export interface ProgressProps {
  /** Valor entre 0 y 1. Se clampea automaticamente. */
  value: number;
  /** Alto de la barra en px. Default 8. */
  height?: number;
  /** Descripcion para VoiceOver / TalkBack. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Progress({ value, height = 8, accessibilityLabel, style }: ProgressProps) {
  const c = useThemeColors();
  const pct = Math.min(1, Math.max(0, value)) * 100;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          width: "100%",
          height,
          borderRadius: radii.rSm,
          backgroundColor: c.border2,
          overflow: "hidden",
        },
        fill: {
          height: "100%",
          backgroundColor: c.secondary,
          borderRadius: radii.rSm,
        },
      }),
    [c, height],
  );

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, style]}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}
