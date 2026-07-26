/**
 * BottomNav: barra de navegacion inferior fija con 5 tabs.
 *
 * Basado en design-system-lowfi.html \u00b7 wf-bottomnav (pattern estandar).
 * Tabs: Home / Guardados / Comparar / Noticias / Config.
 *
 * Screens que SI lo usan (segun el wireframe):
 *   Home HUB, Gestion Elecciones, Resultados, Mis Guardados, Mis Respuestas,
 *   Noticias, Perfil candidato, Perfil empty, Comparador, Config, Editar perfil.
 *
 * Screens que NO lo usan (full-focus o pre-app):
 *   Splash, Onboarding, Ubicacion, Login, Signup, Cuestionario, Share modal.
 *
 * Encapsula toda la logica de navegacion: solo recibe la key `active` y el
 * prop `navigation`. Los iconos vienen del Icon atom (Feather-style).
 */

import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { TabBarItem } from "../atoms/TabBarItem";

export type BottomNavTab =
  | "home"
  | "guardados"
  | "comparar"
  | "noticias"
  | "config";

/** Handler minimo para navegar sin acoplar al tipo especifico de RN Navigation. */
export interface BottomNavNavigator {
  navigate: (routeName: string) => void;
}

export interface BottomNavProps {
  /**
   * Tab actualmente activa. Usa `null` para screens "polimórficas"
   * (ej. Perfil de candidato) que pueden accederse desde cualquier tab.
   */
  active: BottomNavTab | null;
  navigation: BottomNavNavigator;
}

interface TabDef {
  key: BottomNavTab;
  route: string;
  icon: "home" | "heart" | "compare" | "newspaper" | "settings";
  label: string;
}

const TABS: readonly TabDef[] = [
  { key: "home", route: "Home", icon: "home", label: "Home" },
  { key: "guardados", route: "MisGuardados", icon: "heart", label: "Guardados" },
  { key: "comparar", route: "Comparar", icon: "compare", label: "Comparar" },
  { key: "noticias", route: "Noticias", icon: "newspaper", label: "Noticias" },
  { key: "config", route: "Configuracion", icon: "settings", label: "Config" },
];

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
          paddingBottom: Platform.OS === "ios" ? spacing.sp3 : 0,
          paddingHorizontal: spacing.sp1,
        },
      }),
    [c],
  );

  function handlePress(tab: TabDef) {
    if (tab.key === active) return;
    navigation.navigate(tab.route);
  }

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {TABS.map((t) => (
        <TabBarItem
          key={t.key}
          icon={t.icon}
          label={t.label}
          active={t.key === active}
          onPress={() => handlePress(t)}
        />
      ))}
    </View>
  );
}
