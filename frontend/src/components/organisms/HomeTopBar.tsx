/**
 * HomeTopBar: barra superior del Home. Brand con AppIcon (radar+persona) + notif button.
 * Distinta a TopNav (que es para flujos multi-paso con progress).
 *
 * Ref: design-exploration/design-system.html · .topnav (dentro de Template Home)
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AppIcon } from "../atoms/AppIcon";
import { Icon } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface HomeTopBarProps {
  brand: string;
  /** Handler del botón de notificaciones. Si se omite, no se renderiza. */
  onNotifications?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function HomeTopBar({ brand, onNotifications, style }: HomeTopBarProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
          backgroundColor: c.card,
          paddingHorizontal: spacing.sp4,
          paddingVertical: spacing.sp3,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border2,
          minHeight: 56,
          ...shadows.shSm,
        },
        brand: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          flex: 1,
        },
        brandText: {
          fontSize: 16,
          fontWeight: "700",
          color: c.text,
        },
        iconBtn: {
          width: 40,
          height: 40,
          borderRadius: radii.rSm,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        },
        iconBtnPressed: {
          backgroundColor: c.border2,
        },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.bar, style]} accessibilityRole="header">
      <View style={styles.brand}>
        <AppIcon size={22} />
        <Text style={styles.brandText}>{brand}</Text>
      </View>
      {onNotifications ? (
        <Pressable
          onPress={onNotifications}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <Icon name="bell" size={20} color={c.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
