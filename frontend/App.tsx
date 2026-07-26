/**
 * Root de la app Servel.
 *
 * Wraps:
 * - SafeAreaProvider (necesario para react-navigation)
 * - TamaguiProvider (theme system)
 * - NavigationContainer (react-navigation)
 * - Hydrata el auth store desde SecureStore al arrancar (splash mientras carga).
 */

import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Spinner, TamaguiProvider, Theme, YStack } from "tamagui";

import { queryClient } from "./src/api/queryClient";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { ToastProvider } from "./src/components/Toast";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/auth";
import tamaguiConfig from "./tamagui.config";

export default function App() {
  const { hydrate, isHydrated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
          <Theme name="light">
            <SafeAreaProvider>
              <ToastProvider>
                <StatusBar style="dark" />
                {isHydrated ? (
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
