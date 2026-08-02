/**
 * MatchSummaryCard: hero card horizontal para la seccion "Tus mejores matches"
 * del Home HUB.
 *
 * Basado en design-system-lowfi.html · Home HUB (rediseno 2026-07-28).
 *
 * Muestra por cada eleccion COMPLETADA el candidato con mayor afinidad:
 *   [Avatar] Nombre Apellido
 *            [Chip tipo eleccion]
 *
 *            87 %          <- porcentaje gigante
 *   coincides en 10 de 12 preguntas
 *
 *            [ Ver perfil ]
 *
 * Diferencia clave con `ElectionCard`:
 *   - ElectionCard = estado del cuestionario (progreso).
 *   - MatchSummaryCard = resultado politico (afinidad).
 * Antes vivian mezclados en la misma card y confundian dos ejes distintos.
 *
 * Molecule (no atom) porque compone Avatar + Chip + Button + logica de
 * layout no trivial. No maneja fetching — recibe props ya resueltas.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useIsDark } from "../../theme/useTheme";
import { getAffinityColor } from "../../domain/affinity";
import { Avatar } from "../atoms/Avatar";
import { Button } from "../atoms/Button";
import { Chip } from "../atoms/Chip";

export interface MatchSummaryCardProps {
  /** Nombre completo del candidato (ej: "Ada Perez"). */
  candidatoNombre: string;
  /** URL de foto opcional. Sin foto -> iniciales calculadas del nombre. */
  candidatoFotoUrl?: string | null;
  /** Nombre del tipo de eleccion (ej: "Presidencial"). Va en el chip. */
  tipoEleccionNombre: string;
  /** Porcentaje de afinidad 0-100. Se redondea al pintar. */
  matchPercent: number;
  /** Preguntas consideradas en el calculo del match. */
  preguntasConsideradas: number;
  /** Total de preguntas del tipo (para el sub-texto "de N"). */
  totalPreguntas: number;
  /** Handler del CTA "Ver perfil". Requerido — la card sin destino no aporta. */
  onVerPerfil: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  /**
   * UX-054: en layout vertical (ej: HomeScreen) la card debe ocupar el ancho
   * completo del contenedor. Sin esta prop mantiene el ancho fijo de 260px
   * (util en scrolls horizontales).
   */
  fullWidth?: boolean;
}

const CARD_WIDTH = 260;

/**
 * Deriva iniciales del nombre completo. "Ada Perez" -> "AP".
 * Funcion pura, sin side-effects. Exportada para testing directo.
 */
export function deriveIniciales(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sp3,
    borderRadius: radii.rLg,
    gap: spacing.sp3,
    borderWidth: 1,
    flexShrink: 0,
  },
  topRow: { flexDirection: "row", gap: spacing.sp3, alignItems: "flex-start" },
  infoCol: { flex: 1, gap: spacing.sp1 },
  nombre: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  pctRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "flex-end", gap: 2 },
  pctN: { fontSize: 40, fontWeight: "800", lineHeight: 44 },
  pctUnit: { fontSize: 18, fontWeight: "700" },
  contexto: { fontSize: 12, textAlign: "right" },
});

export function MatchSummaryCard({
  candidatoNombre,
  candidatoFotoUrl,
  tipoEleccionNombre,
  matchPercent,
  preguntasConsideradas,
  totalPreguntas,
  onVerPerfil,
  style,
  accessibilityLabel,
  fullWidth = false,
}: MatchSummaryCardProps) {
  const c = useThemeColors();
  const isDark = useIsDark();

  // Memoize iniciales (string computation from prop — legitimate)
  const iniciales = useMemo(
    () => deriveIniciales(candidatoNombre),
    [candidatoNombre],
  );
  const pctRedondeado = Math.round(matchPercent);
  /**
   * FIX C-03: el porcentaje de afinidad usa el tier color correcto del DS-08,
   * NO c.primary. Un 87% y un 31% ahora se ven distintos semanticamente.
   * Token: --c-aff5 (verde) a --c-aff1 (terracota) segun rango.
   */
  const affinityColor = getAffinityColor(pctRedondeado, isDark);

  return (
    <View
      style={[
        styles.card,
        { width: fullWidth ? "100%" : CARD_WIDTH, backgroundColor: c.card, borderColor: c.border2 },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={
        accessibilityLabel ??
        `Tu mejor match en ${tipoEleccionNombre} es ${candidatoNombre}, ${pctRedondeado} por ciento de afinidad, coincides en ${preguntasConsideradas} de ${totalPreguntas} preguntas`
      }
    >
      <View style={styles.topRow}>
        <Avatar
          initials={iniciales}
          imageUrl={candidatoFotoUrl}
          size="lg"
        />
        <View style={styles.infoCol}>
          <Text style={[styles.nombre, { color: c.text }]} numberOfLines={2}>
            {candidatoNombre}
          </Text>
          {/* Chip del tipo: se usa el chip inactivo (accent2) para no competir
              visualmente con el porcentaje, que es el hero visual real. */}
          <Chip>{tipoEleccionNombre}</Chip>
        </View>
      </View>

      <View style={styles.pctRow}>
        <Text style={[styles.pctN, { color: affinityColor }]}>{pctRedondeado}</Text>
        <Text style={[styles.pctUnit, { color: affinityColor }]}>%</Text>
      </View>

      <Text style={[styles.contexto, { color: c.textSecondary }]}>
        coincides en {preguntasConsideradas} de {totalPreguntas} preguntas
      </Text>

      <Button variant="secondary" size="sm" onPress={onVerPerfil}>
        Ver perfil
      </Button>
    </View>
  );
}
