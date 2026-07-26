/**
 * PropsTable: tabla de props documentada manualmente por cada entry del catalogo.
 *
 * Diseno tipo storybook: columnas nombre / tipo / default / descripcion.
 * En viewport chico, se apila verticalmente (cada prop es una row de key-value).
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors } from "../../../theme/useTheme";
import type { PropEntry } from "./types";

interface PropsTableProps {
  props: PropEntry[];
}

const NARROW_BREAKPOINT = 700;

export function PropsTable({ props: propList }: PropsTableProps) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const isNarrow = width < NARROW_BREAKPOINT;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: radii.rMd,
          overflow: "hidden",
          backgroundColor: c.card,
        },
        headerRow: {
          flexDirection: "row",
          backgroundColor: c.accent2,
          paddingVertical: spacing.sp2,
          paddingHorizontal: spacing.sp3,
        },
        headerCell: {
          fontSize: 11,
          fontWeight: "600",
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        },
        row: {
          flexDirection: "row",
          paddingVertical: spacing.sp3,
          paddingHorizontal: spacing.sp3,
          borderTopWidth: 1,
          borderTopColor: c.border2,
        },
        cellName: {
          flex: 1.2,
          fontSize: 13,
          fontFamily: "monospace",
          color: c.text,
          fontWeight: "600",
        },
        cellType: {
          flex: 1.5,
          fontSize: 12,
          fontFamily: "monospace",
          color: c.textSecondary,
          paddingLeft: spacing.sp2,
        },
        cellDefault: {
          flex: 1,
          fontSize: 12,
          fontFamily: "monospace",
          color: c.textTertiary,
          paddingLeft: spacing.sp2,
        },
        cellDesc: {
          flex: 2.5,
          fontSize: 12,
          color: c.textSecondary,
          paddingLeft: spacing.sp2,
          lineHeight: 18,
        },
        requiredBadge: {
          color: c.danger,
          fontSize: 10,
          fontWeight: "700",
          marginLeft: 4,
        },
        // Narrow layout
        narrowRow: {
          padding: spacing.sp3,
          borderTopWidth: 1,
          borderTopColor: c.border2,
        },
        narrowName: {
          fontSize: 14,
          fontFamily: "monospace",
          color: c.text,
          fontWeight: "700",
          marginBottom: 4,
        },
        narrowMeta: {
          fontSize: 11,
          fontFamily: "monospace",
          color: c.textSecondary,
          marginBottom: 2,
        },
        narrowDesc: {
          fontSize: 12,
          color: c.textSecondary,
          marginTop: 4,
          lineHeight: 18,
        },
        empty: {
          padding: spacing.sp4,
          textAlign: "center",
          color: c.textTertiary,
          fontSize: 13,
          fontStyle: "italic",
        },
      }),
    [c],
  );

  if (propList.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.empty}>Sin props (componente sin API publica).</Text>
      </View>
    );
  }

  if (isNarrow) {
    return (
      <View style={styles.wrap}>
        {propList.map((p, i) => (
          <View key={p.name} style={[styles.narrowRow, i === 0 && { borderTopWidth: 0 }]}>
            <Text style={styles.narrowName}>
              {p.name}
              {p.required ? <Text style={styles.requiredBadge}>REQ</Text> : null}
            </Text>
            <Text style={styles.narrowMeta}>{p.type}</Text>
            {p.defaultValue ? (
              <Text style={styles.narrowMeta}>default: {p.defaultValue}</Text>
            ) : null}
            {p.description ? <Text style={styles.narrowDesc}>{p.description}</Text> : null}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Nombre</Text>
        <Text style={[styles.headerCell, { flex: 1.5, paddingLeft: spacing.sp2 }]}>Tipo</Text>
        <Text style={[styles.headerCell, { flex: 1, paddingLeft: spacing.sp2 }]}>Default</Text>
        <Text style={[styles.headerCell, { flex: 2.5, paddingLeft: spacing.sp2 }]}>Descripcion</Text>
      </View>
      {propList.map((p) => (
        <View key={p.name} style={styles.row}>
          <Text style={styles.cellName}>
            {p.name}
            {p.required ? <Text style={styles.requiredBadge}>REQ</Text> : null}
          </Text>
          <Text style={styles.cellType}>{p.type}</Text>
          <Text style={styles.cellDefault}>{p.defaultValue ?? "\u2014"}</Text>
          <Text style={styles.cellDesc}>{p.description ?? "\u2014"}</Text>
        </View>
      ))}
    </View>
  );
}
