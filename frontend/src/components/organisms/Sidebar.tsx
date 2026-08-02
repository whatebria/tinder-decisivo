/**
 * Sidebar: barra de navegacion vertical (variante desktop / tablet landscape).
 *
 * Renderiza los mismos 5 tabs que BottomNav pero como columna izquierda.
 * Se usa como parte del template AppShell cuando el ancho de ventana es
 * >=900px.
 *
 * Estilos oficiales del DS (design-system.html "ORGANISM: BottomNav / Sidebar"):
 *   .app-nav.side { padding: 16px 8px, bg card, border-right, gap 4px,
 *                   min-width: 96px }
 *   .app-nav.side .app-nav-item { padding: 12px 8px, radius: r-lg }
 *   .app-nav.side .active { background: 10% primary }
 */

import React from "react";
import { StyleSheet, View } from "react-native";

import {
  APP_TABS,
  type AppTab,
  type AppTabDef,
  type AppTabNavigator,
} from "../../navigation/tabs";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { TabBarItem } from "../atoms/TabBarItem";

export interface SidebarProps {
  active: AppTab | null;
  navigation: AppTabNavigator;
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    borderRightWidth: 1,
    paddingVertical: spacing.sp4,
    paddingHorizontal: spacing.sp2,
    gap: spacing.sp1,
    minWidth: 96,
  },
});

export function Sidebar({ active, navigation }: SidebarProps) {
  const c = useThemeColors();

  function handlePress(tab: AppTabDef) {
    if (tab.key === active) return;
    navigation.navigate(tab.route);
  }

  return (
    <View
      style={[styles.column, { backgroundColor: c.card, borderRightColor: c.border2 }]}
      accessibilityRole="tablist"
    >
      {APP_TABS.map((t) => (
        <TabBarItem
          key={t.key}
          icon={t.icon}
          label={t.label}
          active={t.key === active}
          onPress={() => handlePress(t)}
          variant="side"
          accessibilityLabel={t.a11yLabel ?? t.label}
        />
      ))}
    </View>
  );
}
