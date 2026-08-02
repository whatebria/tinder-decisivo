/**
 * ProgressSplit: dos barras de progreso lado a lado con proporción configurable.
 *
 * Basado en design-system-lowfi.html · Cuestionario > progress split.
 * Usada para mostrar "base" (compartida entre elecciones) vs "extras" (por elección).
 * Si `extrasTotal` es 0, la barra de extras queda opaca (visualmente muda).
 */

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Progress } from "../atoms/Progress";

export interface ProgressSplitProps {
  baseDone: number;
  baseTotal: number;
  extrasDone?: number;
  extrasTotal?: number;
  baseLabel?: string;
  extrasLabel?: string;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  col: { gap: 4 },
  row: { flexDirection: "row", gap: spacing.sp1, alignItems: "center" },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
});

export function ProgressSplit({
  baseDone,
  baseTotal,
  extrasDone = 0,
  extrasTotal = 0,
  baseLabel,
  extrasLabel,
  style,
}: ProgressSplitProps) {
  const c = useThemeColors();
  const baseFrac = baseTotal > 0 ? Math.min(1, baseDone / baseTotal) : 0;
  const extrasFrac = extrasTotal > 0 ? Math.min(1, extrasDone / extrasTotal) : 0;

  const basePct = Math.round(baseFrac * 100);
  const extrasPct = Math.round(extrasFrac * 100);
  const hasExtras = extrasTotal > 0;

  // Flex proporcional al peso relativo de cada segmento (mínimo 1 para no colapsar).
  const baseFlex = Math.max(1, baseTotal);
  const extrasFlex = Math.max(1, extrasTotal);

  return (
    <View style={[styles.col, style]}>
      <View style={styles.row}>
        <View style={{ flex: baseFlex }}>
          <Progress
            value={baseFrac}
            accessibilityLabel={`Progreso base: ${basePct} de 100`}
          />
        </View>
        {hasExtras ? (
          <View style={{ flex: extrasFlex }}>
            <Progress
              value={extrasFrac}
              accessibilityLabel={`Progreso extras: ${extrasPct} de 100`}
            />
          </View>
        ) : null}
      </View>
      {(baseLabel || (extrasLabel && hasExtras)) ? (
        <View style={styles.labels}>
          <Text style={[styles.label, { color: c.textSecondary }]}>
            {baseLabel ?? `Base (${baseTotal})`}
          </Text>
          {hasExtras ? (
            <Text style={[styles.label, { color: c.textSecondary }]}>
              {extrasLabel ?? `Extras (${extrasTotal})`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
