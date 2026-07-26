/**
 * Toggle: switch on/off tipo pill. Alternativa a Checkbox para preferencias.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, type PressableProps } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

const TRACK_W = 44;
const TRACK_H = 26;
const KNOB = 22;

export interface ToggleProps extends Omit<PressableProps, "children" | "style"> {
  value: boolean;
  accessibilityLabel: string;
}

export function Toggle({ value, disabled, accessibilityLabel, ...rest }: ToggleProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: value ? c.primary : c.border,
          padding: 2,
          justifyContent: "center",
        },
        knob: {
          width: KNOB,
          height: KNOB,
          borderRadius: KNOB / 2,
          backgroundColor: c.card,
          transform: [{ translateX: value ? TRACK_W - KNOB - 4 : 0 }],
        },
        disabled: { opacity: 0.5 },
      }),
    [c, value],
  );

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[styles.track, disabled && styles.disabled]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}
