/**
 * CandidateCard: fila de resultado. Avatar + info (nombre, partido, MatchTier)
 * + % grande + chevron para ir al detalle.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "../atoms/Avatar";
import { Icon } from "../atoms/Icon";
import { MatchTier } from "../molecules/MatchTier";
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp4,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          padding: spacing.sp4,
          ...shadows.shSm,
        },
        info: { flex: 1, gap: spacing.sp1 },
        name: { fontSize: 16, fontWeight: "600", color: c.text },
        partido: { fontSize: 13, color: c.textSecondary },
        sublabel: { fontSize: 12, color: c.textTertiary },
        tierWrap: { marginTop: spacing.sp1 },
        pct: { fontSize: 22, fontWeight: "700", color: c.primary, marginHorizontal: spacing.sp3 },
        pressed: { opacity: 0.85 },
      }),
    [c, shadows],
  );

  const content = (
    <>
      <Avatar initials={initials} backgroundColor={avatarColor} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.partido}>{partido}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
        {matchPercent !== null ? (
          <View style={styles.tierWrap}>
            <MatchTier percent={matchPercent} showPercent={false} />
          </View>
        ) : null}
      </View>
      {matchPercent !== null ? (
        <Text style={styles.pct}>{Math.round(matchPercent)}%</Text>
      ) : null}
      {onPress ? <Icon name="chevron-right" color={c.textSecondary} size={20} /> : null}
    </>
  );

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
        style={(s) => [styles.card, s.pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{content}</View>;
}
