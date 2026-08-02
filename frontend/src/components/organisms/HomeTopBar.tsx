/**
 * HomeTopBar: barra superior del Home. Brand con AppIcon (radar+persona) + notif button.
 * Distinta a TopNav (que es para flujos multi-paso con progress).
 *
 * Ref: design-exploration/design-system.html · .topnav (dentro de Template Home)
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { AppIcon } from "../atoms/AppIcon";
import { Icon } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface HomeTopBarProps {
  brand: string;
  /** Linea secundaria debajo del brand. Util para mostrar contador o contexto. */
  subtitle?: string;
  /** Handler del botón de notificaciones. Si se omite, no se renderiza. */
  onNotifications?: () => void;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp3,
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp3,
    borderRadius: radii.rLg,
    borderWidth: 1,
    minHeight: 56,
  },
  brandRow: {
    flexDirection: "row",
    gap: spacing.sp2,
    flex: 1,
  },
  brandText: { fontSize: 16, fontWeight: "700" },
  brandSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 1 },
  brandTextBlock: { flexDirection: "column", flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.rSm,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function HomeTopBar({ brand, subtitle, onNotifications, style }: HomeTopBarProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  return (
    <View
      style={[styles.bar, { backgroundColor: c.card, borderColor: c.border2, ...shadows.shSm }, style]}
      accessibilityRole="header"
    >
      <View style={[styles.brandRow, { alignItems: subtitle ? "flex-start" : "center" }]}>
        <AppIcon size={22} />
        <View style={styles.brandTextBlock}>
          <Text style={[styles.brandText, { color: c.text }]}>{brand}</Text>
          {subtitle ? (
            <Text style={[styles.brandSubtitle, { color: c.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {onNotifications ? (
        <Pressable
          onPress={onNotifications}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: pressed ? c.border2 : "transparent" },
          ]}
        >
          <Icon name="bell" size={20} color={c.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
