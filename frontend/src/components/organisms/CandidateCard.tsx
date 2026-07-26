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
  /** Porcentaje de match 0-100. */
  matchPercent: number;
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
        <View style={styles.tierWrap}>
          <MatchTier percent={matchPercent} showPercent={false} />
        </View>
      </View>
      <Text style={styles.pct}>{Math.round(matchPercent)}%</Text>
      {onPress ? <Icon name="chevron-right" color={c.textSecondary} size={20} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${partido}, match ${Math.round(matchPercent)}%`}
        style={(s) => [styles.card, s.pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{content}</View>;
}
