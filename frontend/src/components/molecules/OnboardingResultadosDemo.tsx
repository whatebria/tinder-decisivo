/**
 * OnboardingResultadosDemo: demo del ranking para slide 4 del welcome tour
 * ("Te mostramos quién se parece a ti").
 *
 * Muestra 3 candidatos ficticios con barra de match%, visualmente similar
 * a RankingRow. 100% estatico — datos inventados, zero API calls.
 *
 * Paleta de match (alto → bajo): verde, ambar, rojo suave.
 * Los nombres son claramente ficticios para no confundir al usuario.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

interface DemoCandidato {
  id: string;
  iniciales: string;
  nombre: string;
  partido: string;
  matchPct: number;
  /** Color de la barra de match. */
  barColor: string;
}

/** Porcentajes espaciados para que la diferencia visual sea clara. */
const DEMO_CANDIDATOS: readonly DemoCandidato[] = [
  {
    id: "1",
    iniciales: "CA",
    nombre: "Candidata A",
    partido: "Partido Ejemplo",
    matchPct: 87,
    barColor: "#22c55e", // green-500
  },
  {
    id: "2",
    iniciales: "CB",
    nombre: "Candidato B",
    partido: "Otro Partido",
    matchPct: 61,
    barColor: "#f59e0b", // amber-500
  },
  {
    id: "3",
    iniciales: "CC",
    nombre: "Candidato C",
    partido: "Tercer Partido",
    matchPct: 34,
    barColor: "#ef4444", // red-500
  },
];

export function OnboardingResultadosDemo() {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.sp2, width: "100%", maxWidth: 360 },
        demoTag: {
          ...typography.overline,
          color: c.textSecondary,
          textAlign: "center",
          marginBottom: spacing.sp1,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: c.card,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          paddingHorizontal: spacing.sp3,
          paddingVertical: spacing.sp3,
          gap: spacing.sp3,
        },
        rank: {
          ...typography.overline,
          color: c.textSecondary,
          fontWeight: "700",
          width: 18,
          textAlign: "center",
        },
        info: { flex: 1, gap: 4 },
        nombre: {
          ...typography.body,
          fontWeight: "600",
          color: c.text,
        },
        partido: {
          ...typography.small,
          color: c.textSecondary,
        },
        barWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
        },
        barBg: {
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: c.border,
        },
        pctLabel: {
          ...typography.small,
          fontWeight: "700",
          minWidth: 36,
          textAlign: "right",
        },
      }),
    [c],
  );

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel="Ejemplo de ranking de candidatos"
    >
      <Text style={styles.demoTag} accessibilityElementsHidden>
        EJEMPLO — candidatos ficticios
      </Text>

      {DEMO_CANDIDATOS.map((cand, idx) => (
        <View key={cand.id} style={styles.row}>
          <Text style={styles.rank}>#{idx + 1}</Text>

          <Avatar
            initials={cand.iniciales}
            size="sm"
            accessibilityLabel={cand.nombre}
          />

          <View style={styles.info}>
            <Text style={styles.nombre}>{cand.nombre}</Text>
            <Text style={styles.partido}>{cand.partido}</Text>
            <View style={styles.barWrap}>
              <View style={styles.barBg}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${cand.matchPct}%`,
                    backgroundColor: cand.barColor,
                  }}
                />
              </View>
              <Text style={[styles.pctLabel, { color: cand.barColor }]}>
                {cand.matchPct}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
