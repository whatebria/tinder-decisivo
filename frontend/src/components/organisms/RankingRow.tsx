/**
 * RankingRow: fila de un candidato en el ranking (posiciones 2+).
 *
 * Basado en design-system-lowfi.html · Resultados > ranking completo.
 * Layout horizontal:
 *   #N  [avatar sm]  [nombre / partido]  [mini radar 60]  [pct]
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Avatar } from "../atoms/Avatar";
import { RadarChart } from "../atoms/RadarChart";

export interface RankingRowProps {
  rank: number;
  nombre: string;
  apellido?: string;
  partido?: string;
  imageUrl?: string | null;
  matchPct: number;
  matchColor?: string;
  ejeScores?: Record<string, number>;
  onPress?: () => void;
  /** Slot para acciones (favorito, descartar, etc.) debajo de la fila. */
  actions?: React.ReactNode;
  style?: ViewStyle;
}

export function RankingRow({
  rank,
  nombre,
  apellido,
  partido,
  imageUrl,
  matchPct,
  matchColor,
  ejeScores,
  onPress,
  actions,
  style,
}: RankingRowProps) {
  const c = useThemeColors();
  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.trim() || "?";
  const scoreColor = matchColor ?? c.text;
  const hasRadar = ejeScores && Object.keys(ejeScores).length >= 3;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
          gap: spacing.sp2,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
        },
        rankText: {
          fontSize: 14,
          fontWeight: "700",
          color: c.textSecondary,
          minWidth: 28,
        },
        body: { flex: 1, gap: 2 },
        nombre: {
          fontSize: 14,
          fontWeight: "600",
          color: c.text,
        },
        partido: {
          fontSize: 11,
          color: c.textSecondary,
        },
        pct: {
          fontSize: 16,
          fontWeight: "700",
          color: scoreColor,
          minWidth: 44,
          textAlign: "right",
        },
      }),
    [c, scoreColor],
  );

  const inner = (
    <View style={styles.row}>
      <Text style={styles.rankText}>#{rank}</Text>
      <Avatar size="sm" initials={initials} imageUrl={imageUrl ?? undefined} />
      <View style={styles.body}>
        <Text style={styles.nombre} numberOfLines={1}>
          {nombre}{apellido ? ` ${apellido}` : ""}
        </Text>
        {partido ? (
          <Text style={styles.partido} numberOfLines={1}>
            {partido}
          </Text>
        ) : null}
      </View>
      {hasRadar ? (
        <RadarChart data={ejeScores!} size={56} color={scoreColor} showLabels={false} />
      ) : null}
      <Text style={styles.pct}>{Math.round(matchPct)}%</Text>
    </View>
  );

  return (
    <View style={[styles.card, style]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${nombre} ${apellido ?? ""}`}
          style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
        >
          {inner}
        </Pressable>
      ) : (
        inner
      )}
      {actions ? <View>{actions}</View> : null}
    </View>
  );
}
