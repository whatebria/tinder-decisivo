/**
 * DiscardedCard: fila para lista de descartados. Desaturado (opacity .72),
 * nombre tachado, icon X circular, y accion "restaurar" al final.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface DiscardedCardProps {
  name: string;
  partido: string;
  matchPercent: number;
  /** Razon del descarte. Opcional. */
  reason?: string;
  onRestore?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function DiscardedCard({
  name,
  partido,
  matchPercent,
  reason,
  onRestore,
  style,
}: DiscardedCardProps) {
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
          opacity: 0.72,
          ...shadows.shSm,
        },
        xIcon: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: c.border2,
          alignItems: "center",
          justifyContent: "center",
        },
        meta: { flex: 1, gap: 2 },
        name: {
          fontSize: 15,
          fontWeight: "600",
          color: c.text,
          textDecorationLine: "line-through",
        },
        sub: { fontSize: 13, color: c.textSecondary },
        reason: { fontSize: 12, color: c.textTertiary, fontStyle: "italic", marginTop: 2 },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.xIcon}>
        <Icon name="close" color={c.textSecondary} size={18} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>
          {partido} \u00b7 {Math.round(matchPercent)}% match
        </Text>
        {reason ? <Text style={styles.reason}>{reason}</Text> : null}
      </View>
      {onRestore ? (
        <IconButton
          onPress={onRestore}
          accessibilityLabel="Restaurar"
          variant="ghost"
          size="sm"
        >
          <Icon name="undo" color={c.textSecondary} size={18} />
        </IconButton>
      ) : null}
    </View>
  );
}
