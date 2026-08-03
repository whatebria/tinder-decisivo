/**
 * ResultadoHero: card hero para el top match del ranking.
 *
 * Responsive layout (opcion C del rediseno):
 *   - Mobile (<720px):  layout VERTICAL estilo RankingCard XL. Header con
 *     avatar + nombre + partido, luego radar grande centrado, luego footer
 *     con %match + confianza + cobertura, luego CTA. Mantiene consistencia
 *     visual con las tarjetas del ranking.
 *   - Desktop/tablet (>=720px): layout HORIZONTAL split en 2 columnas.
 *     Izquierda: info + %match + confianza + CTA. Derecha: radar 220px con
 *     labels. Aprovecha el ancho disponible sin desperdiciar horizontal.
 *
 * Por que responsive interno (no dos componentes separados):
 *   - Los datos son identicos (mismo padre pasa mismos props).
 *   - El breakpoint es unico y se comparte con ResultadosScreen (720px).
 *   - Extraer 2 componentes duplicaria el manejo de confianza/CTA sin ganancia.
 *
 * Basado en design-system-lowfi.html - Resultados hero (variantes mobile/desktop).
 */

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Avatar } from "../atoms/Avatar";
import { Badge, type BadgeVariant } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { RadarChart } from "../atoms/RadarChart";

/** Breakpoint donde el hero pasa de vertical a split. Compartido con
 *  ResultadosScreen (rankingCols) para que la transicion sea coherente. */
const SPLIT_BREAKPOINT = 720;

export interface ResultadoHeroProps {
  nombre: string;
  apellido?: string;
  partido?: string;
  imageUrl?: string | null;
  matchPct: number;
  matchColor?: string;
  ejeScores?: Record<string, number>;
  /** Label del chip de confianza. Ej: "Confianza alta". */
  confianzaLabel?: string;
  confianzaVariant?: BadgeVariant;
  /** Texto contextual al lado del chip. Ej: "10 preguntas coinciden". */
  confianzaSubtext?: string;
  ctaLabel?: string;
  onCta?: () => void;
  /** Fuerza un layout especifico. Default "auto" (usa window width).
   *  Util para showcases o contextos con ancho controlado. */
  layout?: "auto" | "vertical" | "horizontal";
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sp4,
    borderRadius: radii.rLg,
    borderWidth: 1,
    gap: spacing.sp3,
  },
  cardVertical: { alignItems: "center" },
  kicker: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  // Layout HORIZONTAL: split en dos columnas.
  splitRow: { flexDirection: "row", alignItems: "center", gap: spacing.sp4 },
  splitCol: { flex: 1, gap: spacing.sp2, alignItems: "center" },
  splitColLeft: { alignItems: "center" },
  // Textos compartidos.
  nombre: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  partido: { fontSize: 13, textAlign: "center" },
  pct: { fontSize: 44, fontWeight: "800", lineHeight: 48 },
  confianzaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  confianzaSub: { fontSize: 11 },
  ctaWrapperStretch: { alignSelf: "stretch", marginTop: spacing.sp2 },
});

export function ResultadoHero({
  nombre,
  apellido,
  partido,
  imageUrl,
  matchPct,
  matchColor,
  ejeScores,
  confianzaLabel,
  confianzaVariant = "neutral",
  confianzaSubtext,
  ctaLabel = "Ver perfil completo",
  onCta,
  layout = "auto",
  style,
}: ResultadoHeroProps) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const isHorizontal =
    layout === "horizontal" ||
    (layout === "auto" && width >= SPLIT_BREAKPOINT);
  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.trim() || "?";
  const scoreColor = matchColor ?? c.primary;
  const hasRadar = ejeScores && Object.keys(ejeScores).length >= 3;
  const nombreCompleto = `${nombre}${apellido ? ` ${apellido}` : ""}`;

  // Label accesible comun a ambos layouts
  const a11yLabel = `Tu mejor match: ${nombreCompleto}, ${Math.round(matchPct)}% de afinidad`;

  const infoBlock = (
    <>
      <Avatar size="xl" initials={initials} imageUrl={imageUrl ?? undefined} />
      <Text style={[styles.nombre, { color: c.text }]} numberOfLines={2}>
        {nombreCompleto}
      </Text>
      {partido ? <Text style={[styles.partido, { color: c.textSecondary }]}>{partido}</Text> : null}
      <Text style={[styles.pct, { color: scoreColor }]}>{Math.round(matchPct)}%</Text>
      {confianzaLabel ? (
        <View style={styles.confianzaRow}>
          <Badge variant={confianzaVariant}>{confianzaLabel}</Badge>
          {confianzaSubtext ? (
            <Text style={[styles.confianzaSub, { color: c.textSecondary }]}>{confianzaSubtext}</Text>
          ) : null}
        </View>
      ) : null}
      {onCta ? (
        <View style={styles.ctaWrapperStretch}>
          <Button onPress={onCta}>{ctaLabel}</Button>
        </View>
      ) : null}
    </>
  );

  const radarBlock = hasRadar ? (
    <RadarChart
      data={ejeScores!}
      size={isHorizontal ? 260 : 240}
      color={scoreColor}
      showLabels
    />
  ) : null;

  const cardTheme = { backgroundColor: c.card, borderColor: c.border2 };

  // HORIZONTAL: kicker arriba full-width, luego split 2 cols con info | radar.
  if (isHorizontal) {
    return (
      <View
        style={[styles.card, cardTheme, style]}
        accessibilityRole="summary"
        accessibilityLabel={a11yLabel}
      >
        <Text style={[styles.kicker, { color: c.textSecondary }]}>Tu match</Text>
        <View style={styles.splitRow}>
          <View style={[styles.splitCol, styles.splitColLeft]}>
            {infoBlock}
          </View>
          {radarBlock ? <View style={styles.splitCol}>{radarBlock}</View> : null}
        </View>
      </View>
    );
  }

  // VERTICAL (mobile): estilo RankingCard XL. Radar entre info y footer.
  return (
    <View
      style={[styles.card, styles.cardVertical, cardTheme, style]}
      accessibilityRole="summary"
      accessibilityLabel={a11yLabel}
    >
      <Text style={[styles.kicker, { color: c.textSecondary }]}>Tu match</Text>
      <Avatar size="xl" initials={initials} imageUrl={imageUrl ?? undefined} />
      <Text style={[styles.nombre, { color: c.text }]} numberOfLines={2}>
        {nombreCompleto}
      </Text>
      {partido ? <Text style={[styles.partido, { color: c.textSecondary }]}>{partido}</Text> : null}
      {radarBlock}
      <Text style={[styles.pct, { color: scoreColor }]}>{Math.round(matchPct)}%</Text>
      {confianzaLabel ? (
        <View style={styles.confianzaRow}>
          <Badge variant={confianzaVariant}>{confianzaLabel}</Badge>
          {confianzaSubtext ? (
            <Text style={[styles.confianzaSub, { color: c.textSecondary }]}>{confianzaSubtext}</Text>
          ) : null}
        </View>
      ) : null}
      {onCta ? (
        <View style={styles.ctaWrapperStretch}>
          <Button onPress={onCta}>{ctaLabel}</Button>
        </View>
      ) : null}
    </View>
  );
}
