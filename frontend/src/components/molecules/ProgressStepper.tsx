/**
 * ProgressStepper: pasos numerados horizontales con estado done/active/pending.
 * Para flujos multi-etapa (Cuestionario -> Pesos -> Resultados).
 */

import React, { useMemo } from "react";
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

export function ProgressStepper({ steps, currentIndex, style }: ProgressStepperProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        numDone: { backgroundColor: c.success, borderColor: c.success },
        numActive: { backgroundColor: c.primary, borderColor: c.primary },
        numPending: { backgroundColor: "transparent", borderColor: c.border },
        numText: { fontSize: 13, fontWeight: "600" },
        numTextOnBg: { color: c.textOnPrimary },
        numTextPending: { color: c.textSecondary },
        label: { fontSize: 13, fontWeight: "500" },
        labelActive: { color: c.text },
        labelDone: { color: c.textSecondary },
        labelPending: { color: c.textTertiary },
        divider: {
          flex: 1,
          height: 2,
          backgroundColor: c.border,
          marginHorizontal: spacing.sp3,
        },
      }),
    [c],
  );

  return (
    <View style={[styles.row, style]} accessibilityRole="progressbar">
      {steps.map((s, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const numStyle = isDone ? styles.numDone : isActive ? styles.numActive : styles.numPending;
        const numTextStyle =
          isDone || isActive ? styles.numTextOnBg : styles.numTextPending;
        const labelStyle = isActive
          ? styles.labelActive
          : isDone
            ? styles.labelDone
            : styles.labelPending;

        return (
          <React.Fragment key={`${s.label}-${i}`}>
            <View style={styles.step}>
              <View style={[styles.num, numStyle]}>
                <Text style={[styles.numText, numTextStyle]}>{i + 1}</Text>
              </View>
              <Text style={[styles.label, labelStyle]}>{s.label}</Text>
            </View>
            {i < steps.length - 1 ? <View style={styles.divider} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}
