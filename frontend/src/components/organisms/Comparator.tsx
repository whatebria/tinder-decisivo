/**
 * Comparator: 2 columnas lado a lado para comparar candidatos.
 * Si solo hay 1 candidato, la segunda columna es un add-slot.
 */

import React, { useMemo } from "react";
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

export function Comparator({ slots, onRemove, onAdd, style }: ComparatorProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: "row", gap: spacing.sp3 },
        col: {
          flex: 1,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          padding: spacing.sp4,
          ...shadows.shSm,
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
        name: { fontSize: 15, fontWeight: "600", color: c.text },
        partido: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
        pct: { fontSize: 20, fontWeight: "700", color: c.primary },
        chartWrap: { minHeight: 160, alignItems: "center", justifyContent: "center" },
        addSlot: {
          flex: 1,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: c.border,
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
          backgroundColor: c.accent2,
          alignItems: "center",
          justifyContent: "center",
        },
        addTitle: { fontSize: 14, fontWeight: "600", color: c.text },
        addHint: {
          fontSize: 12,
          color: c.textSecondary,
          textAlign: "center",
          marginTop: 2,
          maxWidth: 180,
        },
        pressed: { opacity: 0.85 },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.row, style]}>
      {slots.map((slot, i) => (
        <View key={`${slot.name}-${i}`} style={styles.col}>
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
              <Text style={styles.name}>{slot.name}</Text>
              <Text style={styles.partido}>{slot.partido}</Text>
            </View>
            <Text style={styles.pct}>{Math.round(slot.matchPercent)}%</Text>
          </View>
          {slot.chart ? <View style={styles.chartWrap}>{slot.chart}</View> : null}
        </View>
      ))}
      {slots.length === 1 && onAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Agregar candidato para comparar"
          style={(s) => [styles.addSlot, s.pressed && styles.pressed]}
        >
          <View style={styles.addPlus}>
            <Icon name="plus" color={c.primary} size={24} />
          </View>
          <Text style={styles.addTitle}>Agregar candidato</Text>
          <Text style={styles.addHint}>Compara con otro para tomar decisiones</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
