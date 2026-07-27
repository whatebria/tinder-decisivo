/**
 * ScreenChrome: envoltorio minimo para screens que NO usan AppShell.
 *
 * Casos de uso:
 *   - Cuestionario (full-focus, sin bottom nav)
 *   - DetalleCandidato (polimorfico, accesible desde 4 origenes)
 *   - Potencialmente Onboarding / Login / Splash si en el futuro las unificamos
 *
 * Que hace:
 *   1. Aplica safe-area top (respeta notch en iOS, status bar en Android)
 *   2. Setea backgroundColor del theme
 *   3. flex:1 para ocupar viewport completo
 *
 * Que NO hace:
 *   - NO aplica padding horizontal: es responsabilidad del content container
 *     de la screen (idem AppShell). Cada screen sigue definiendo su sp4 en
 *     el ScrollView contentContainerStyle.
 *   - NO renderiza nav ni chrome visible: es solo un layout invisible.
 *
 * Cuando usar AppShell vs ScreenChrome:
 *   - AppShell: screens post-auth que forman parte de la navegacion principal
 *     y necesitan BottomNav/Sidebar (Home, Resultados, Perfil, etc).
 *   - ScreenChrome: screens post-auth full-focus o detail, sin nav lateral.
 */

import React, { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useThemeColors } from "../../theme/useTheme";

export interface ScreenChromeProps {
  children: ReactNode;
  /** Edges de safe-area a respetar. Default ["top"] — el bottom queda para BottomNav si aplica. */
  edges?: Edge[];
  /** Color de fondo. Default: theme bg. */
  bg?: string;
}

export function ScreenChrome({
  children,
  edges = ["top"],
  bg,
}: ScreenChromeProps) {
  const c = useThemeColors();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: bg ?? c.bg }]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
