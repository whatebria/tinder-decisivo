/**
 * ResultadoHero: card hero centrada para el top match del ranking.
 *
 * Basado en design-system-lowfi.html · Resultados > hero card.
 * Estructura vertical centrada:
 *   [Tu match label]
 *   [Avatar XL]
 *   [Nombre y apellido]
 *   [Partido / subtitulo]
 *   [80% big number]
 *   [Row: Badge confianza + texto 'N preguntas coinciden']
 *   [Compatibilidad label]
 *   [Radar chart 180]
 *   [Button: Ver perfil completo]
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Avatar } from "../atoms/Avatar";
import { Badge, type BadgeVariant } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { RadarChart } from "../atoms/RadarChart";

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
  style,
}: ResultadoHeroProps) {
  const c = useThemeColors();
  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.trim() || "?";
  const scoreColor = matchColor ?? c.primary;
  const hasRadar = ejeScores && Object.keys(ejeScores).length >= 3;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: spacing.sp4,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
          alignItems: "center",
          gap: spacing.sp2,
        },
        kicker: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: c.textSecondary,
          fontWeight: "600",
        },
        nombre: {
          fontSize: 20,
          fontWeight: "700",
          color: c.text,
          textAlign: "center",
        },
        partido: {
          fontSize: 13,
          color: c.textSecondary,
        },
        pct: {
          fontSize: 40,
          fontWeight: "800",
          color: scoreColor,
          marginTop: spacing.sp1,
          lineHeight: 44,
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
        compat: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: c.text,
          fontWeight: "600",
        },
        ctaWrapper: { alignSelf: "stretch", marginTop: spacing.sp3 },
      }),
    [c, scoreColor],
  );

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.kicker}>Tu match</Text>
      <Avatar size="xl" initials={initials} imageUrl={imageUrl ?? undefined} />
      <Text style={styles.nombre} numberOfLines={2}>
        {nombre}{apellido ? ` ${apellido}` : ""}
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

      <Text style={styles.compat}>Compatibilidad</Text>

      {hasRadar ? (
        <RadarChart data={ejeScores!} size={180} color={scoreColor} showLabels />
      ) : null}

      {onCta ? (
        <View style={styles.ctaWrapper}>
          <Button onPress={onCta}>{ctaLabel}</Button>
        </View>
      ) : null}
    </View>
  );
}
