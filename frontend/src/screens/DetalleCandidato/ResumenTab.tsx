/**
 * ResumenTab — tab "Resumen" del perfil de candidato.
 *
 * Muestra (en orden):
 *   1. Bio del candidato (si existe)
 *   2. Propuesta electoral (si existe)
 *   3. Radar chart de afinidad por eje tematico (si hay match y datos)
 *   4. Posturas destacadas (hasta 3, con color semantico Likert)
 *   5. MatchExplanation (solo usuarios autenticados con match)
 *
 * Co-located con DetalleCandidatoScreen en screens/DetalleCandidato/.
 * Sin estado propio: todos los datos llegan por props.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Candidato, PosturaCandidatoDetalle } from "../../api/endpoints";
import { MatchExplanation, RadarChart } from "../../components";
import { getLikertColor } from "../../services/matching";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

export interface ResumenTabProps {
  candidato: Candidato;
  hasMatch: boolean;
  chartData: Record<string, number>;
  scoreCol: string;
  posturas: PosturaCandidatoDetalle[];
  isGuest: boolean;
  /**
   * UX-041: callback para navegar a la tab de posturas completa.
   * Al recibirlo, se muestra un CTA "Ver las N posturas" bajo el preview.
   */
  onVerTodasPosturas?: () => void;
}

export function ResumenTab({
  candidato,
  hasMatch,
  chartData,
  scoreCol,
  posturas,
  isGuest,
  onVerTodasPosturas,
}: ResumenTabProps) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const posturasDestacadas = posturas.slice(0, 3);

  return (
    <View style={styles.tabBody}>
      {candidato.bio ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Sobre el candidato
          </Text>
          <Text style={[styles.paragraph, { color: c.text }]}>
            {candidato.bio}
          </Text>
        </View>
      ) : null}

      {candidato.propuesta_electoral ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Propuesta electoral
          </Text>
          <Text style={[styles.paragraph, { color: c.text }]}>
            {candidato.propuesta_electoral}
          </Text>
        </View>
      ) : null}

      {hasMatch && Object.keys(chartData).length >= 3 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Afinidad por eje tematico
          </Text>
          <View style={styles.radarWrap}>
            <RadarChart data={chartData} size={260} color={scoreCol} />
          </View>
        </View>
      ) : null}

      {posturasDestacadas.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Posturas destacadas
          </Text>
          <View style={styles.posturasList}>
            {posturasDestacadas.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.posturaCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text
                  style={[styles.posturaPregunta, { color: c.text }]}
                  numberOfLines={2}
                >
                  {p.pregunta_texto ?? "Pregunta"}
                </Text>
                <Text
                  style={[styles.posturaRespuesta, {
                    color: getLikertColor(p.opcion_respuesta_valor, c, isDark),
                  }]}
                >
                  {p.opcion_respuesta_texto ?? ""}
                </Text>
              </View>
            ))}
          </View>
          {/* UX-041: CTA para descubrir el listado completo de posturas. */}
          {onVerTodasPosturas && (
            <Pressable
              onPress={onVerTodasPosturas}
              accessibilityRole="link"
              accessibilityLabel={`Ver las ${posturas.length} posturas del candidato`}
            >
              <Text style={[styles.verTodas, { color: c.primary }]}>
                {`Ver las ${posturas.length} posturas >`}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {!isGuest && hasMatch ? (
        <View style={styles.section}>
          <MatchExplanation candidatoId={candidato.id} />
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
  paragraph: { ...typography.small },
  radarWrap: {
    alignItems: "center",
    paddingVertical: spacing.sp2,
  },
  posturasList: { gap: spacing.sp4, marginTop: spacing.sp1 },
  posturaCard: {
    borderWidth: 1,
    borderRadius: radii.rMd,
    padding: spacing.sp3,
    gap: spacing.sp1,
  },
  posturaPregunta: {
    ...typography.small,
    fontWeight: "700",
  },
  posturaRespuesta: { ...typography.small },
  // UX-041: link discreto bajo las posturas destacadas.
  verTodas: {
    ...typography.small,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: spacing.sp2,
  },
});
