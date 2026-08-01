/**
 * OnboardingResultadosDemo: demo del ranking para slide 4 del welcome tour.
 *
 * Usa el componente real `RankingCard` con datos ficticios para que el
 * usuario reconozca el patron visual cuando llegue a ResultadosScreen.
 * Sin ejeScores -> sin radar, version compacta de la card que cabe en 2
 * columnas dentro del slide sin requerir scroll (constraint UX-011).
 *
 * BUG-007: reemplaza la implementacion custom anterior (barra horizontal
 * propietaria) por el componente real del design system.
 */

import React from "react";
import { View } from "react-native";

import { RankingCard } from "../organisms/RankingCard";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { getMatchColor } from "../../services/matching";

interface DemoCandidato {
  rank: number;
  nombre: string;
  apellido: string;
  partido: string;
  matchPct: number;
}

/** Datos ficticios, claramente anonimizados. */
const DEMO_CANDIDATOS: readonly DemoCandidato[] = [
  { rank: 1, nombre: "Candidata", apellido: "A", partido: "Partido Ejemplo", matchPct: 87 },
  { rank: 2, nombre: "Candidato", apellido: "B", partido: "Otro Partido",    matchPct: 61 },
];

export function OnboardingResultadosDemo() {
  const c = useThemeColors();

  return (
    <View
      style={{ flexDirection: "row", gap: spacing.sp2, width: "100%", maxWidth: 360 }}
      accessibilityRole="none"
      accessibilityLabel="Ejemplo de ranking de candidatos"
    >
      {DEMO_CANDIDATOS.map((cand) => (
        <RankingCard
          key={cand.rank}
          rank={cand.rank}
          nombre={cand.nombre}
          apellido={cand.apellido}
          partido={cand.partido}
          matchPct={cand.matchPct}
              matchColor={getMatchColor(cand.matchPct)}
          style={{ flex: 1, minWidth: 0 }}
        />
      ))}
    </View>
  );
}
