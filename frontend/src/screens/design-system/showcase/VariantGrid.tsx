/**
 * VariantGrid: layout tipo grid con las variantes visuales del componente.
 *
 * Cada variante tiene un label + el render. Se distribuye en filas responsive
 * (columnas segun ancho disponible).
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors } from "../../../theme/useTheme";
import type { VariantEntry } from "./types";

interface VariantGridProps {
  variants: VariantEntry[];
}

export function VariantGrid({ variants }: VariantGridProps) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();

  // Columnas responsive: 1 col < 500, 2 cols < 900, 3 cols >= 900
  const cols = width < 500 ? 1 : width < 900 ? 2 : 3;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -spacing.sp2,
        },
        cell: {
          padding: spacing.sp2,
          width: `${100 / cols}%`,
        },
        cellInner: {
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          overflow: "hidden",
          backgroundColor: c.card,
        },
        cellHeader: {
          paddingVertical: 6,
          paddingHorizontal: spacing.sp3,
          borderBottomWidth: 1,
          borderBottomColor: c.border2,
          backgroundColor: c.accent2,
        },
        label: {
          fontSize: 11,
          fontWeight: "600",
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        },
        renderArea: {
          padding: spacing.sp4,
          minHeight: 80,
          justifyContent: "center",
          alignItems: "flex-start",
          gap: spacing.sp2,
        },
        renderAreaBg: {
          backgroundColor: c.bg,
        },
      }),
    [c, cols],
  );

  return (
    <View style={styles.grid}>
      {variants.map((v, i) => (
        <View key={`${v.label}-${i}`} style={styles.cell}>
          <View style={styles.cellInner}>
            <View style={styles.cellHeader}>
              <Text style={styles.label}>{v.label}</Text>
            </View>
            <View style={[styles.renderArea, v.surface === "bg" && styles.renderAreaBg]}>
              {v.render()}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
