/**
 * RankCard: tarjeta compacta 140px de ancho para el rank-strip del Home.
 * Vertical: pos (#N) + avatar 48px + name + match%. Pressable.
 *
 * Ref: design-exploration/design-system.html \u00b7 .rank-card
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "./Avatar";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface RankCardProps {
  /** Posici\u00f3n 1-N \u2014 se prefixa con #. */
  position: number;
  /** Iniciales para el Avatar (1-3 chars). */
  initials: string;
  name: string;
  /** Porcentaje 0-100. */
  matchPercent: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function RankCard({ position, initials, name, matchPercent, onPress, style }: RankCardProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: 140,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border2,
          borderRadius: radii.rMd,
          padding: spacing.sp3,
          alignItems: "center",
          gap: 6,
        },
        pressed: { opacity: 0.9, borderColor: c.primary },
        pos: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: c.textTertiary,
          fontWeight: "600",
        },
        avatarBg: { backgroundColor: c.accent2 },
        name: {
          fontSize: 13,
          fontWeight: "600",
          color: c.text,
          textAlign: "center",
        },
        match: {
          fontSize: 14,
          fontWeight: "700",
          color: c.primary,
        },
      }),
    [c],
  );

  const content = (
    <>
      <Text style={styles.pos}>#{position}</Text>
      <Avatar
        initials={initials}
        size="md"
        backgroundColor={c.accent2}
        color={c.primary}
      />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.match}>{Math.round(matchPercent)}%</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Puesto ${position}: ${name}, ${Math.round(matchPercent)}% de match`}
        style={(s) => [styles.card, s.pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{content}</View>;
}
