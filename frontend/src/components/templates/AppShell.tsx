/**
 * AppShell: layout responsive que envuelve las screens post-auth.
 *
 * Alineado a design-system.html "ORGANISM: BottomNav / Sidebar":
 *   - width <900px  -> BottomNav abajo (columna: children arriba, nav abajo)
 *   - width >=900px -> Sidebar a la izquierda (fila: nav izq, children der)
 *
 * Los children ocupan flex:1 en ambos casos (scrollean internamente).
 *
 * Screens que USAN AppShell:
 *   Home HUB, Gestion Elecciones, Resultados, Mis Guardados, Mis Respuestas,
 *   Perfil candidato, Perfil empty, Comparador, Config, Editar perfil.
 *
 * Screens que NO (full-focus o pre-app, sin nav visible):
 *   Splash, Onboarding, Ubicacion, Login, Signup, Cuestionario, Share modal.
 */

import React, { type ReactNode } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { BottomNav } from "../organisms/BottomNav";
import { Sidebar } from "../organisms/Sidebar";
import type { AppTab, AppTabNavigator } from "../../navigation/tabs";
import { useThemeColors } from "../../theme/useTheme";

/** Breakpoint oficial del DS para intercambiar bottom nav <-> sidebar. */
export const SIDEBAR_BREAKPOINT = 900;

export interface AppShellProps {
  /** Tab activa. `null` para screens polimorficas (ej. Perfil de candidato). */
  active: AppTab | null;
  navigation: AppTabNavigator;
  children: ReactNode;
  /** Estilo opcional para el contenedor de children (raro, escape hatch). */
  contentStyle?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  rootColumn: { flex: 1, flexDirection: "column" },
  rootRow: { flex: 1, flexDirection: "row" },
  content: { flex: 1 },
});

export function AppShell({
  active,
  navigation,
  children,
  contentStyle,
}: AppShellProps) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  if (isWide) {
    return (
      <View style={[styles.rootRow, { backgroundColor: c.bg }]}>
        <Sidebar active={active} navigation={navigation} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.rootColumn, { backgroundColor: c.bg }]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
      <BottomNav active={active} navigation={navigation} />
    </View>
  );
}
