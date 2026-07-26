/**
 * EjeBar: fila de "eje tem\u00e1tico" con label + valor + barra de progreso coloreada.
 * 4 colores sem\u00e1nticos: primary (default) / info / success / warning / danger.
 *
 * Ref: design-exploration/design-system.html \u00b7 .eje-bar
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useThemeColors } from "../../theme/useTheme";

export type EjeBarTone = "primary" | "info" | "success" | "warning" | "danger";

export interface EjeBarProps {
  label: string;
  /** Texto descriptivo del valor. Ej: "Muy importante". */
  valueLabel: string;
  /** Porcentaje 0-100 para el fill. */
  percent: number;
  tone?: EjeBarTone;
  style?: StyleProp<ViewStyle>;
}

export function EjeBar({ label, valueLabel, percent, tone = "primary", style }: EjeBarProps) {
  const c = useThemeColors();

  const styles = useMemo(() => {
    const toneColor: Record<EjeBarTone, string> = {
      primary: c.primary,
      info: c.info,
      success: c.success,
      warning: c.warning,
      danger: c.danger,
    };
    return StyleSheet.create({
      wrap: { gap: 4 },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
      },
      label: { fontSize: 14, color: c.text, fontWeight: "500" },
      val: { fontSize: 11, color: c.textTertiary },
      track: {
        height: 6,
        backgroundColor: c.border2,
        borderRadius: radii.rFull,
        overflow: "hidden",
      },
      fill: {
        height: "100%",
        backgroundColor: toneColor[tone],
        borderRadius: radii.rFull,
      },
    });
  }, [c, tone]);

  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${valueLabel}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.val}>{valueLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}
