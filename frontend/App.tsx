/**
 * Root de la app Servel.
 *
 * Wraps:
 * - SafeAreaProvider (necesario para react-navigation)
 * - NavigationContainer (react-navigation)
 * - Hydrata auth + onboarding + theme stores desde storage al arrancar.
 *
 * Nota: Tamagui fue removido — la app usa el design system nativo
 * (atoms/molecules propios + tokens en src/theme/). Ver commit de purga.
 */

import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "./src/api/queryClient";
import { ErrorBoundary, Spinner, ToastProvider } from "./src/components";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/auth";
import { useCoachMarksStore } from "./src/store/coachMarks";
import { useElectionsPrefsStore } from "./src/store/electionsPrefs";
import { useOnboardingStore } from "./src/store/onboarding";
import { useThemeStore } from "./src/store/theme";
import { colors, colorsDark } from "./src/theme/colors";

export default function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const authToken = useAuthStore((s) => s.token);
  const authIsGuest = useAuthStore((s) => s.isGuest);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const onboardingHydrated = useOnboardingStore((s) => s.isHydrated);
  const resetCoachMarks = useCoachMarksStore((s) => s.resetAll);
  const hydrateElections = useElectionsPrefsStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const themeHydrated = useThemeStore((s) => s.isHydrated);
  const effective = useThemeStore((s) => s.effective);

  useEffect(() => {
    hydrateAuth();
    hydrateOnboarding();
    hydrateElections();
    hydrateTheme();
  }, [hydrateAuth, hydrateOnboarding, hydrateElections, hydrateTheme]);

  // Los coach marks están ligados a la sesión: cada vez que cambia la
  // identidad (login, logout, entrada/salida del modo invitado) volvemos a
  // mostrar los tours una vez por pantalla. En modo invitado esto significa
  // que cada nueva entrada como guest los ve de nuevo.
  useEffect(() => {
    resetCoachMarks();
  }, [authToken, authIsGuest, resetCoachMarks]);

  // Web: sincroniza el bg del <body> y <html> con el tema activo para evitar
  // que se vea blanco cuando el contenido es mas corto que el viewport.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const bg = effective === "dark" ? colorsDark.bg : colors.bg;
    const doc = typeof document !== "undefined" ? document : null;
    if (!doc) return;
    doc.documentElement.style.backgroundColor = bg;
    doc.body.style.backgroundColor = bg;
    doc.documentElement.style.colorScheme = effective;
    // Expo/RN Web envuelve la app en <div id="root">. Si no lo pintamos
    // explicitamente, se ve el bg blanco por debajo cuando el contenido
    // interno no llena el viewport (ej. modales, listas cortas).
    const root = doc.getElementById("root");
    if (root) root.style.backgroundColor = bg;

    // Inyecta CSS global que fuerza el bg del tema en TODOS los contenedores
    // que RN Web genera al bundlear. Sin esto, un ScrollView cuyo contenido
    // excede el viewport deja ver el color del contenedor padre (blanco por
    // default) al scrollear porque el contenedor interno con `flex:1` se colapsa
    // al viewport y no pinta mas alla.
    const STYLE_ID = "__servel_theme_bg__";
    let styleEl = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = STYLE_ID;
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      html, body, #root { background-color: ${bg} !important; min-height: 100vh; }
      #root > div { background-color: ${bg}; min-height: 100vh; }
    `;
  }, [effective]);

  // Theme para NavigationContainer — sobrescribe el default blanco hardcodeado
  // de React Navigation que causaba franjas blancas en modo dark.
  const navTheme = useMemo(() => {
    const base = effective === "dark" ? NavDarkTheme : NavLightTheme;
    const palette = effective === "dark" ? colorsDark : colors;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.bg,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        primary: palette.primary,
      },
    };
  }, [effective]);

  const ready = authHydrated && onboardingHydrated && themeHydrated;
  const loadingBg = effective === "dark" ? colorsDark.bg : colors.bg;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style={effective === "dark" ? "light" : "dark"} />
            {ready ? (
              <NavigationContainer theme={navTheme}>
                <AppNavigator />
              </NavigationContainer>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: loadingBg,
                }}
              >
                <Spinner size="large" />
              </View>
            )}
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
