/**
 * Comparator: 2 columnas lado a lado para comparar candidatos.
 * Si solo hay 1 candidato, la segunda columna es un add-slot.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface ComparatorSlot {
  name: string;
  partido: string;
  initials: string;
  matchPercent: number;
  /** Contenido custom debajo del header (ej. radar chart). Opcional. */
  chart?: React.ReactNode;
}

export interface ComparatorProps {
  /** 1 o 2 slots. Si es 1, se muestra el add-slot. */
  slots: ReadonlyArray<ComparatorSlot>;
  onRemove?: (index: number) => void;
  onAdd?: () => void;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sp3 },
  col: {
    flex: 1,
    borderRadius: radii.rLg,
    padding: spacing.sp4,
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: spacing.sp2,
    right: spacing.sp2,
    zIndex: 1,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp3,
    marginTop: spacing.sp2,
    marginBottom: spacing.sp3,
  },
  headInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600" },
  partido: { fontSize: 12, marginTop: 2 },
  pct: { fontSize: 20, fontWeight: "700" },
  chartWrap: { minHeight: 160, alignItems: "center", justifyContent: "center" },
  addSlot: {
    flex: 1,
    borderRadius: radii.rLg,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: spacing.sp5,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sp2,
    minHeight: 200,
  },
  addPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: { fontSize: 14, fontWeight: "600" },
  addHint: { fontSize: 12, textAlign: "center", marginTop: 2, maxWidth: 180 },
  pressed: { opacity: 0.85 },
});

export function Comparator({ slots, onRemove, onAdd, style }: ComparatorProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  return (
    <View style={[styles.row, style]}>
      {slots.map((slot, i) => (
        <View key={`${slot.name}-${i}`} style={[styles.col, { backgroundColor: c.card, ...shadows.shSm }]}>
          {onRemove ? (
            <View style={styles.removeBtn}>
              <IconButton
                variant="ghost"
                size="sm"
                accessibilityLabel={`Quitar ${slot.name}`}
                onPress={() => onRemove(i)}
              >
                <Icon name="close" color={c.textSecondary} size={16} />
              </IconButton>
            </View>
          ) : null}
          <View style={styles.head}>
            <Avatar initials={slot.initials} size="sm" />
            <View style={styles.headInfo}>
              <Text style={[styles.name, { color: c.text }]}>{slot.name}</Text>
              <Text style={[styles.partido, { color: c.textSecondary }]}>{slot.partido}</Text>
            </View>
            <Text style={[styles.pct, { color: c.primary }]}>{Math.round(slot.matchPercent)}%</Text>
          </View>
          {slot.chart ? <View style={styles.chartWrap}>{slot.chart}</View> : null}
        </View>
      ))}
      {slots.length === 1 && onAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Agregar candidato para comparar"
          style={(s) => [
            styles.addSlot,
            { backgroundColor: c.card, borderColor: c.border },
            s.pressed && styles.pressed,
          ]}
        >
          <View style={[styles.addPlus, { backgroundColor: c.accent2 }]}>
            <Icon name="plus" color={c.primary} size={24} />
          </View>
          <Text style={[styles.addTitle, { color: c.text }]}>Agregar candidato</Text>
          <Text style={[styles.addHint, { color: c.textSecondary }]}>
            Compara con otro para tomar decisiones
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
