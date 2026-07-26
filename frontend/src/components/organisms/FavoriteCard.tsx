/**
 * FavoriteCard: fila para lista de favoritos. Icon corazon + meta + timestamp
 * + accion "quitar". Border-left verde para reforzar sentimiento positivo.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { MatchTier } from "../molecules/MatchTier";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface FavoriteCardProps {
  name: string;
  partido: string;
  matchPercent: number;
  /** Timestamp ya formateado (ej. "Agregado hace 2h"). */
  addedAt: string;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FavoriteCard({
  name,
  partido,
  matchPercent,
  addedAt,
  onRemove,
  style,
}: FavoriteCardProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          padding: spacing.sp4,
          borderLeftWidth: 4,
          borderLeftColor: c.success,
          ...shadows.shSm,
        },
        heart: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: c.accent2,
          alignItems: "center",
          justifyContent: "center",
        },
        meta: { flex: 1, gap: 2 },
        row: { flexDirection: "row", alignItems: "center", gap: spacing.sp2, flexWrap: "wrap" },
        name: { fontSize: 15, fontWeight: "600", color: c.text },
        sub: { fontSize: 13, color: c.textSecondary },
        stamp: { fontSize: 11, color: c.textTertiary, marginTop: 2 },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.heart}>
        <Icon name="heart" color={c.success} size={18} fill={c.success} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.row}>
          <Text style={styles.sub}>{partido}</Text>
          <MatchTier percent={matchPercent} />
        </View>
        <Text style={styles.stamp}>{addedAt}</Text>
      </View>
      {onRemove ? (
        <IconButton
          onPress={onRemove}
          accessibilityLabel="Quitar de favoritos"
          variant="ghost"
          size="sm"
        >
          <Icon name="close" color={c.textSecondary} size={18} />
        </IconButton>
      ) : null}
    </View>
  );
}
