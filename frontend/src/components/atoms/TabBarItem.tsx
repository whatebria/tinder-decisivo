/**
 * TabBarItem: item individual del BottomNav.
 *
 * Compone Icon + label vertical, con estado activo destacado por color.
 * Feedback t\u00e1ctil m\u00ednimo (opacity). No trae layout propio de barra:
 * eso lo maneja el organism BottomNav.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon, type IconName } from "./Icon";

export interface TabBarItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function TabBarItem({
  icon,
  label,
  active,
  onPress,
  accessibilityLabel,
}: TabBarItemProps) {
  const c = useThemeColors();
  const tint = active ? c.primary : c.textSecondary;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          paddingVertical: spacing.sp2,
          minHeight: 48,
        },
        label: {
          fontSize: 10,
          fontWeight: active ? "700" : "500",
          color: tint,
        },
      }),
    [active, tint],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed ? { opacity: 0.6 } : null]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Icon name={icon} size={22} color={tint} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
