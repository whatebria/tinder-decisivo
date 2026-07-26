/**
 * HomeTile: tarjeta cuadrada para accesos rapidos del Home.
 * Icon tinted + label + count. Pressable.
 *
 * Ref: design-exploration/design-system.html \u00b7 .tile
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon, type IconName } from "./Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface HomeTileProps {
  icon: IconName;
  label: string;
  count: string;
  onPress?: () => void;
  /** Fill de icono (para heart en Favoritos). Default: none (stroke). */
  iconFilled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function HomeTile({ icon, label, count, onPress, iconFilled, style }: HomeTileProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tile: {
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border2,
          borderRadius: radii.rMd,
          padding: spacing.sp4,
          gap: spacing.sp2,
        },
        pressed: { opacity: 0.9, borderColor: c.primary },
        iconWrap: {
          width: 36,
          height: 36,
          borderRadius: radii.rSm,
          // ~12% opacity del primary sobre card
          backgroundColor: withAlpha(c.primary, 0.12),
          alignItems: "center",
          justifyContent: "center",
        },
        label: { fontSize: 14, fontWeight: "600", color: c.text },
        count: { fontSize: 11, color: c.textTertiary },
      }),
    [c],
  );

  const content = (
    <>
      <View style={styles.iconWrap}>
        <Icon
          name={icon}
          size={18}
          color={c.primary}
          fill={iconFilled ? c.primary : "none"}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${count}`}
        style={(s) => [styles.tile, s.pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.tile, style]}>{content}</View>;
}

// Aplica alpha a un color hex #RRGGBB \u2192 #RRGGBBAA
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
