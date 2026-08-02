/**
 * CandidateCard: fila de resultado. Avatar + info (nombre, partido, MatchTier)
 * + % grande + chevron para ir al detalle.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Icon } from "../atoms/Icon";
import { MatchTier } from "../molecules/MatchTier";
import { getMatchColor } from "../../services/matching";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface CandidateCardProps {
  name: string;
  partido: string;
  /** Iniciales del candidato (2-3 chars). */
  initials: string;
  /**
   * Porcentaje de match 0-100. Si es null, se oculta el % y el MatchTier
   * (util para vistas exploratorias sin cuestionario hecho).
   */
  matchPercent: number | null;
  /** Sublabel opcional debajo del partido (ej. "Presidencial" o "Alcaldia"). */
  sublabel?: string;
  /** Color del fondo del avatar. Opcional. */
  avatarColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp4,
    borderRadius: radii.rLg,
    padding: spacing.sp4,
  },
  info: { flex: 1, gap: spacing.sp1 },
  name: { fontSize: 16, fontWeight: "600" },
  partido: { fontSize: 13 },
  sublabel: { fontSize: 12 },
  tierWrap: { marginTop: spacing.sp1 },
  // DS-11 Pantalla 4: el % usa --color-affinity-N (mismo tier que el badge).
  // Calculado via getMatchColor() para consistencia con el service. (UX-026)
  pct: { fontSize: 22, fontWeight: "700", marginHorizontal: spacing.sp3 },
  pressed: { opacity: 0.85 },
});

export function CandidateCard({
  name,
  partido,
  initials,
  matchPercent,
  sublabel,
  avatarColor,
  onPress,
  style,
}: CandidateCardProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const matchColor = matchPercent != null ? getMatchColor(matchPercent) : c.primary;

  const content = (
    <>
      <Avatar initials={initials} backgroundColor={avatarColor} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.text }]}>{name}</Text>
        <Text style={[styles.partido, { color: c.textSecondary }]}>{partido}</Text>
        {sublabel ? <Text style={[styles.sublabel, { color: c.textTertiary }]}>{sublabel}</Text> : null}
        {matchPercent !== null ? (
          <View style={styles.tierWrap}>
            <MatchTier percent={matchPercent} showPercent={false} />
          </View>
        ) : null}
      </View>
      {matchPercent !== null ? (
        <Text style={[styles.pct, { color: matchColor }]}>{Math.round(matchPercent)}%</Text>
      ) : null}
      {onPress ? <Icon name="chevron-right" color={c.textSecondary} size={20} /> : null}
    </>
  );

  const cardStyle = [styles.card, { backgroundColor: c.card, ...shadows.shSm }, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          matchPercent !== null
            ? `${name}, ${partido}, match ${Math.round(matchPercent)}%`
            : `${name}, ${partido}`
        }
        style={(s) => [...cardStyle, s.pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{content}</View>;
}
