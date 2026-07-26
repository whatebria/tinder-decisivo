/**
 * Root de la app Servel.
 *
 * Wraps:
 * - SafeAreaProvider (necesario para react-navigation)
 * - TamaguiProvider (theme system dinamico segun store)
 * - NavigationContainer (react-navigation)
 * - Hydrata auth + onboarding + theme stores desde storage al arrancar.
 */

import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Spinner, TamaguiProvider, Theme, YStack } from "tamagui";

import { queryClient } from "./src/api/queryClient";
import { ErrorBoundary } from "./src/components";
import { ToastProvider } from "./src/components";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/auth";
import { useOnboardingStore } from "./src/store/onboarding";
import { useThemeStore } from "./src/store/theme";
import { colors, colorsDark } from "./src/theme/colors";
import tamaguiConfig from "./tamagui.config";

export default function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const onboardingHydrated = useOnboardingStore((s) => s.isHydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const themeHydrated = useThemeStore((s) => s.isHydrated);
  const effective = useThemeStore((s) => s.effective);

  useEffect(() => {
    hydrateAuth();
    hydrateOnboarding();
    hydrateTheme();
  }, [hydrateAuth, hydrateOnboarding, hydrateTheme]);

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
  }, [effective]);

  const ready = authHydrated && onboardingHydrated && themeHydrated;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={effective}>
          <Theme name={effective}>
            <SafeAreaProvider>
              <ToastProvider>
                <StatusBar style={effective === "dark" ? "light" : "dark"} />
                {ready ? (
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                ) : (
                  <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
                    <Spinner size="large" />
                  </YStack>
                )}
              </ToastProvider>
            </SafeAreaProvider>
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
