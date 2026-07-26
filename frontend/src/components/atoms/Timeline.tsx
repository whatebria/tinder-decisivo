/**
 * Timeline: trayectoria vertical con dots + linea. Estado "past" para
 * eventos historicos, default (primary) para actual/relevante.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface TimelineItem {
  /** Anho o rango (ej. "2024 - Actual", "2018 - 2022"). */
  year: string;
  /** Descripcion del evento. */
  desc: string;
  /** Si es un evento pasado (dot y texto atenuados). */
  past?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  style?: StyleProp<ViewStyle>;
}

const DOT = 12;
const LINE_X = 5; // centrado en el dot

export function Timeline({ items, style }: TimelineProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { position: "relative", paddingLeft: DOT + spacing.sp4 },
        line: {
          position: "absolute",
          left: LINE_X,
          top: DOT / 2,
          bottom: DOT / 2,
          width: 2,
          backgroundColor: c.border,
        },
        item: { marginBottom: spacing.sp5 },
        dot: {
          position: "absolute",
          left: -(DOT + spacing.sp4),
          top: 4,
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
        },
        year: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
        desc: { fontSize: 14, lineHeight: 20 },
      }),
    [c],
  );

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.line} />
      {items.map((it, i) => (
        <View key={`${it.year}-${i}`} style={[styles.item, i === items.length - 1 && { marginBottom: 0 }]}>
          <View style={[styles.dot, { backgroundColor: it.past ? c.textTertiary : c.primary }]} />
          <Text style={[styles.year, { color: it.past ? c.textSecondary : c.text }]}>{it.year}</Text>
          <Text style={[styles.desc, { color: it.past ? c.textSecondary : c.text }]}>{it.desc}</Text>
        </View>
      ))}
    </View>
  );
}
