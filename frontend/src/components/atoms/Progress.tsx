/**
 * Progress: barra de progreso horizontal. Verde salvia (secondary) para
 * sensacion organica de avance. `value` va de 0 a 1.
 *
 * TASK-066: track/fill estaticos a nivel de modulo; colores y height prop
 * via inline styles donde son dinamicos.
 */

import React from "react";
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

// -- Estilos estaticos (modulo-level) -----------------------------------------

const S = StyleSheet.create({
  track: {
    width: "100%",
    borderRadius: radii.rSm,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.rSm,
  },
});

// -- Componente ---------------------------------------------------------------

export function Progress({ value, height = 8, accessibilityLabel, style }: ProgressProps) {
  const c = useThemeColors();
  const pct = Math.min(1, Math.max(0, value)) * 100;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[S.track, { height, backgroundColor: c.border2 }, style]}
    >
      <View style={[S.fill, { width: `${pct}%`, backgroundColor: c.secondary }]} />
    </View>
  );
}
