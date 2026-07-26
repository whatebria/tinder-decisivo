/**
 * WeightSelector: 5 pills para elegir peso de una pregunta.
 * Pill activo en primary.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

/** Peso de una pregunta: 1 (Nada) a 5 (Mucho). */
export type Weight = 1 | 2 | 3 | 4 | 5;

const DEFAULT_LABELS: Record<Weight, string> = {
  1: "Nada",
  2: "Poco",
  3: "Medio",
  4: "Alto",
  5: "Mucho",
};

export interface WeightSelectorProps {
  value: Weight | null;
  onChange: (w: Weight) => void;
  /** Labels custom por peso (default: Nada/Poco/Medio/Alto/Mucho). */
  labels?: Record<Weight, string>;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const WEIGHTS: Weight[] = [1, 2, 3, 4, 5];

export function WeightSelector({
  value,
  onChange,
  labels = DEFAULT_LABELS,
  accessibilityLabel,
  style,
}: WeightSelectorProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: "row", gap: spacing.sp2 },
        pill: {
          flex: 1,
          minHeight: 44,
          borderRadius: radii.rFull,
          borderWidth: 1.5,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.sp2,
        },
        pillDefault: { borderColor: c.border, backgroundColor: c.card },
        pillSelected: { borderColor: c.primary, backgroundColor: c.primary },
        text: { fontSize: 13, fontWeight: "500" },
        textDefault: { color: c.text },
        textSelected: { color: c.textOnPrimary },
      }),
    [c],
  );

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel ?? "Selector de peso"}
      style={[styles.row, style]}
    >
      {WEIGHTS.map((w) => {
        const selected = value === w;
        return (
          <Pressable
            key={w}
            onPress={() => onChange(w)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${labels[w]}, peso ${w} de 5`}
            style={[styles.pill, selected ? styles.pillSelected : styles.pillDefault]}
          >
            <Text style={[styles.text, selected ? styles.textSelected : styles.textDefault]}>
              {labels[w]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
