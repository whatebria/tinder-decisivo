/**
 * BottomNav: barra de navegacion inferior fija con 5 tabs (variante movil).
 *
 * Basado en design-system.html "ORGANISM: BottomNav / Sidebar" + wireframe
 * `.wf-bottomnav`. Se usa como parte del template AppShell cuando el ancho
 * de ventana es <900px.
 *
 * Screens que S1 usan AppShell (y por tanto tienen bottomnav):
 *   Home HUB, Gestion Elecciones, Candidatos, Resultados, Mis Respuestas,
 *   Noticias, Perfil candidato, Perfil empty, Comparador, Config, Editar perfil.
 *
 * Screens que NO (full-focus o pre-app, sin nav visible):
 *   Splash, Onboarding, Ubicacion, Login, Signup, Cuestionario, Share modal,
 *   Mis Guardados (pantalla secundaria, acceso via drill-down).
 *
 * Estilos oficiales del DS:
 *   .app-nav.bottom { grid, 5 col, bg card, border-top, padding 6px 4px 8px,
 *                     radius bottom lg }
 */

import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";

import {
  APP_TABS,
  type AppTab,
  type AppTabDef,
  type AppTabNavigator,
} from "../../navigation/tabs";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { TabBarItem } from "../atoms/TabBarItem";

/** Re-export para no romper imports existentes. */
export type BottomNavTab = AppTab;
export type BottomNavNavigator = AppTabNavigator;

export interface BottomNavProps {
  /**
   * Tab actualmente activa. Usa `null` para screens "polimorficas"
   * (ej. Perfil de candidato) que se acceden desde cualquier tab.
   */
  active: AppTab | null;
  navigation: AppTabNavigator;
}

export function BottomNav({ active, navigation }: BottomNavProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: "row",
          alignItems: "stretch",
          backgroundColor: c.card,
          borderTopWidth: 1,
          borderTopColor: c.border2,
          // DS: padding 6px 4px 8px. En iOS agregamos safe-area inset abajo.
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? spacing.sp3 : 8,
          paddingHorizontal: spacing.sp1,
        },
      }),
    [c],
  );

  function handlePress(tab: AppTabDef) {
    if (tab.key === active) return;
    navigation.navigate(tab.route);
  }

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {APP_TABS.map((t) => (
        <TabBarItem
          key={t.key}
          icon={t.icon}
          label={t.label}
          active={t.key === active}
          onPress={() => handlePress(t)}
          variant="bottom"
          accessibilityLabel={t.a11yLabel ?? t.label}
        />
      ))}
    </View>
  );
}
