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

import React, { useMemo } from "react";
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: spacing.sp4,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
          gap: spacing.sp3,
        },
        cardVertical: { alignItems: "center" },
        kicker: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: c.textSecondary,
          fontWeight: "600",
        },
        // Layout HORIZONTAL: split en dos columnas.
        splitRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp4,
        },
        splitCol: {
          flex: 1,
          gap: spacing.sp2,
          alignItems: "center",
        },
        splitColLeft: {
          // La info del candidato se centra horizontalmente dentro de su columna,
          // pero el CTA se estira full-width para tap target grande.
          alignItems: "center",
        },
        // Textos compartidos.
        nombre: {
          fontSize: 20,
          fontWeight: "700",
          color: c.text,
          textAlign: "center",
        },
        partido: {
          fontSize: 13,
          color: c.textSecondary,
          textAlign: "center",
        },
        pct: {
          fontSize: 44,
          fontWeight: "800",
          color: scoreColor,
          lineHeight: 48,
        },
        confianzaRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          flexWrap: "wrap",
          justifyContent: "center",
        },
        confianzaSub: {
          fontSize: 11,
          color: c.textSecondary,
        },
        ctaWrapperStretch: { alignSelf: "stretch", marginTop: spacing.sp2 },
      }),
    [c, scoreColor],
  );

  // Label accesible comun a ambos layouts
  const a11yLabel = `Tu mejor match: ${nombreCompleto}, ${Math.round(matchPct)}% de afinidad`;

  const infoBlock = (
    <>
      <Avatar size="xl" initials={initials} imageUrl={imageUrl ?? undefined} />
      <Text style={styles.nombre} numberOfLines={2}>
        {nombreCompleto}
      </Text>
      {partido ? <Text style={styles.partido}>{partido}</Text> : null}
      <Text style={styles.pct}>{Math.round(matchPct)}%</Text>
      {confianzaLabel ? (
        <View style={styles.confianzaRow}>
          <Badge variant={confianzaVariant}>{confianzaLabel}</Badge>
          {confianzaSubtext ? (
            <Text style={styles.confianzaSub}>{confianzaSubtext}</Text>
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
      size={isHorizontal ? 220 : 200}
      color={scoreColor}
      showLabels
    />
  ) : null;

  // HORIZONTAL: kicker arriba full-width, luego split 2 cols con info | radar.
  if (isHorizontal) {
    return (
      <View
        style={[styles.card, style]}
        accessibilityRole="summary"
        accessibilityLabel={a11yLabel}
      >
        <Text style={styles.kicker}>Tu match</Text>
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
      style={[styles.card, styles.cardVertical, style]}
      accessibilityRole="summary"
      accessibilityLabel={a11yLabel}
    >
      <Text style={styles.kicker}>Tu match</Text>
      <Avatar size="xl" initials={initials} imageUrl={imageUrl ?? undefined} />
      <Text style={styles.nombre} numberOfLines={2}>
        {nombreCompleto}
      </Text>
      {partido ? <Text style={styles.partido}>{partido}</Text> : null}
      {radarBlock}
      <Text style={styles.pct}>{Math.round(matchPct)}%</Text>
      {confianzaLabel ? (
        <View style={styles.confianzaRow}>
          <Badge variant={confianzaVariant}>{confianzaLabel}</Badge>
          {confianzaSubtext ? (
            <Text style={styles.confianzaSub}>{confianzaSubtext}</Text>
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
