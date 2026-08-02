/**
 * RankingCard: card de un candidato en el ranking (posiciones 2+).
 *
 * Layout VERTICAL optimizado para grid 2-col (o mas en pantallas anchas).
 * Diferencia con RankingRow (layout horizontal):
 *   - Radar mediano (120px) con labels visibles, no un thumbnail.
 *   - %match y "N preguntas coinciden" prominentes al pie.
 *   - Foto + info arriba en una fila compacta.
 *   - Actions (favorito/descartar) opcionales al pie.
 *
 * Se usa en ResultadosScreen para dar visibilidad al breakdown por eje del
 * radar chart (ver docs/frontend.md seccion Resultados). RankingRow queda
 * disponible para otros contextos que prefieran layout horizontal denso.
 *
 * Contenedor esperado: un View con flex row + flexWrap + gap; cada
 * RankingCard usa flex 1 y minWidth para respetar el grid.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { Avatar } from "../atoms/Avatar";
import { RadarChart } from "../atoms/RadarChart";

export interface RankingCardProps {
  rank: number;
  nombre: string;
  apellido?: string;
  partido?: string;
  imageUrl?: string | null;
  matchPct: number;
  matchColor?: string;
  ejeScores?: Record<string, number>;
  /** Cantidad de preguntas del user que el candidato tambien respondio. */
  preguntasConsideradas?: number;
  onPress?: () => void;
  /** Slot para acciones (favorito, descartar, etc.) al pie del card. */
  actions?: React.ReactNode;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sp3,
    borderRadius: radii.rMd,
    borderWidth: 1,
    gap: spacing.sp2,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sp2 },
  rankText: { fontSize: 12, fontWeight: "700", minWidth: 24 },
  headerBody: { flex: 1, gap: 2, minWidth: 0 },
  nombre: { fontSize: 13, fontWeight: "600" },
  partido: { fontSize: 10 },
  radarWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sp1,
  },
  scoreFooter: { alignItems: "center", gap: 2 },
  pct: { fontSize: 28, fontWeight: "700", lineHeight: 32 },
  cobertura: {
    ...typography.overline,
    textTransform: "none",
    letterSpacing: 0,
  },
  actionsWrap: { borderTopWidth: 1, paddingTop: spacing.sp2 },
});

export function RankingCard({
  rank,
  nombre,
  apellido,
  partido,
  imageUrl,
  matchPct,
  matchColor,
  ejeScores,
  preguntasConsideradas,
  onPress,
  actions,
  style,
}: RankingCardProps) {
  const c = useThemeColors();
  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.trim() || "?";
  const scoreColor = matchColor ?? c.text;
  const hasRadar = ejeScores && Object.keys(ejeScores).length >= 3;
  const nombreCompleto = `${nombre}${apellido ? ` ${apellido}` : ""}`;

  const pressableContent = (
    <View style={{ gap: spacing.sp2 }}>
      <View style={styles.header}>
        <Text style={[styles.rankText, { color: c.textSecondary }]}>#{rank}</Text>
        <Avatar size="sm" initials={initials} imageUrl={imageUrl ?? undefined} />
        <View style={styles.headerBody}>
          <Text style={[styles.nombre, { color: c.text }]} numberOfLines={1}>
            {nombreCompleto}
          </Text>
          {partido ? (
            <Text style={[styles.partido, { color: c.textSecondary }]} numberOfLines={1}>
              {partido}
            </Text>
          ) : null}
        </View>
      </View>

      {hasRadar ? (
        <View style={styles.radarWrap}>
          <RadarChart
            data={ejeScores!}
            size={140}
            color={scoreColor}
            showLabels
          />
        </View>
      ) : null}

      <View style={styles.scoreFooter}>
        <Text style={[styles.pct, { color: scoreColor }]}>{Math.round(matchPct)}%</Text>
        {preguntasConsideradas != null && preguntasConsideradas > 0 ? (
          <Text style={[styles.cobertura, { color: c.textSecondary }]}>
            {preguntasConsideradas}{" "}
            {preguntasConsideradas === 1
              ? "pregunta coincide"
              : "preguntas coinciden"}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border2 }, style]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${nombreCompleto}, ${Math.round(matchPct)}% de match, posicion ${rank}`}
          style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
        >
          {pressableContent}
        </Pressable>
      ) : (
        pressableContent
      )}
      {actions ? (
        <View style={[styles.actionsWrap, { borderTopColor: c.border }]}>{actions}</View>
      ) : null}
    </View>
  );
}
