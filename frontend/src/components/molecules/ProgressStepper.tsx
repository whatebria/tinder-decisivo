/**
 * ProgressStepper: pasos numerados horizontales con estado done/active/pending.
 * Para flujos multi-etapa (Cuestionario -> Pesos -> Resultados).
 */

import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface StepperStep {
  label: string;
}

export interface ProgressStepperProps {
  steps: ReadonlyArray<StepperStep>;
  /** Indice del paso actual (0-based). Los previos son "done", los siguientes "pending". */
  currentIndex: number;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  step: { flexDirection: "row", alignItems: "center", gap: spacing.sp2 },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  numText: { fontSize: 13, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "500" },
  divider: { flex: 1, height: 2, marginHorizontal: spacing.sp3 },
});

export function ProgressStepper({ steps, currentIndex, style }: ProgressStepperProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.row, style]} accessibilityRole="progressbar">
      {steps.map((s, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;

        const numBg = isDone ? c.success : isActive ? c.primary : "transparent";
        const numBorder = isDone ? c.success : isActive ? c.primary : c.border;
        const numTextColor = (isDone || isActive) ? c.textOnPrimary : c.textSecondary;
        const labelColor = isActive ? c.text : isDone ? c.textSecondary : c.textTertiary;

        return (
          <React.Fragment key={`${s.label}-${i}`}>
            <View style={styles.step}>
              <View style={[styles.num, { backgroundColor: numBg, borderColor: numBorder }]}>
                <Text style={[styles.numText, { color: numTextColor }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.label, { color: labelColor }]}>{s.label}</Text>
            </View>
            {i < steps.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: c.border }]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}
