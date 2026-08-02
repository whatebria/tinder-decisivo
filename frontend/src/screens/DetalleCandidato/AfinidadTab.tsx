/**
 * AfinidadTab — tab "Afinidad" del perfil de candidato.
 *
 * UX-059: eleva el contenido de match a jerarquia de tab propia.
 * Antes estaba embebido en ResumenTab como bloques secundarios.
 *
 * Muestra (en orden):
 *   1. Resumen global: match% + numero de preguntas consideradas (opcional)
 *   2. RadarChart: afinidad por eje tematico (si hay >= 3 ejes)
 *   3. MatchExplanation: detalle dimension a dimension (solo autenticados)
 *
 * Co-located con DetalleCandidatoScreen en screens/DetalleCandidato/.
 * Sin estado propio: todos los datos llegan por props.
 *
 * WCAG 2.2 AA:
 *   - RadarChart genera accessibilityLabel textual automatico.
 *   - Porcentaje con accessibilityLabel descriptivo.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MatchExplanation, RadarChart } from "../../components";
import { formatMatchPercentage } from "../../services/matching";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface AfinidadTabProps {
  /** ID del candidato (para MatchExplanation). */
  candidatoId: number;
  /**
   * Record<ejeKey, percentage 0-100> del breakdown por eje.
   * Si tiene menos de 3 ejes, el RadarChart no se renderiza.
   */
  chartData: Record<string, number>;
  /** Color del match (verde/amarillo/rojo segun porcentaje). */
  scoreCol: string;
  /** Porcentaje de match global (0-100). */
  matchPct: number;
  /** El usuario NO es guest: puede ver MatchExplanation. */
  isAuthenticated: boolean;
}

export function AfinidadTab({
  candidatoId,
  chartData,
  scoreCol,
  matchPct,
  isAuthenticated,
}: AfinidadTabProps) {
  const c = useThemeColors();
  const hasRadar = Object.keys(chartData).length >= 3;

  return (
    <View style={styles.tabBody}>
      {/* 1. Resumen global del match */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          Afinidad global
        </Text>
        <Text
          style={[styles.matchPct, { color: scoreCol }]}
          accessibilityLabel={`Afinidad con este candidato: ${formatMatchPercentage(matchPct)} por ciento`}
          accessibilityRole="text"
        >
          {formatMatchPercentage(matchPct)}%
        </Text>
        <Text style={[styles.matchSub, { color: c.textSecondary }]}>
          Basado en tus respuestas y las posiciones del candidato
        </Text>
      </View>

      {/* 2. Radar chart por eje */}
      {hasRadar ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Afinidad por eje tematico
          </Text>
          <View style={styles.radarWrap}>
            <RadarChart data={chartData} size={260} color={scoreCol} />
          </View>
        </View>
      ) : null}

      {/* 3. Detalle dimension a dimension */}
      {isAuthenticated ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Detalle por dimension
          </Text>
          <MatchExplanation candidatoId={candidatoId} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBody: { gap: spacing.sp4, marginTop: spacing.sp1 },
  section: { gap: spacing.sp2 },
  sectionLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  matchPct: {
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 56,
  },
  matchSub: { ...typography.small },
  radarWrap: {
    alignItems: "center",
    paddingVertical: spacing.sp2,
  },
});
