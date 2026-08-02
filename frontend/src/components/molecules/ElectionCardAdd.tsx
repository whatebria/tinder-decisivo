/**
 * ElectionCardAdd: card dashed "+ Activar {tipo}" en el Home HUB.
 *
 * Basado en design-system-lowfi.html - Home HUB.
 * Aparece al final del strip para invitar a activar una eleccion nueva.
 *
 * Movido de atoms/ a molecules/ (TASK-060): agrupado con ElectionCard.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

export interface ElectionCardAddProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    minHeight: 100,
    padding: spacing.sp3,
    borderRadius: radii.rLg,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sp2,
    flexShrink: 0,
  },
  label: { fontSize: 11, textAlign: "center" },
});

export function ElectionCardAdd({
  label,
  onPress,
  style,
  accessibilityLabel,
}: ElectionCardAddProps) {
  const c = useThemeColors();

  const content = (
    <View style={[styles.card, { borderColor: c.border2 }, style]}>
      <Icon name="plus" size={28} color={c.textSecondary} />
      <Text style={[styles.label, { color: c.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      {content}
    </Pressable>
  );
}
