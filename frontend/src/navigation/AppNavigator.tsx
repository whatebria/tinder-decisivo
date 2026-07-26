/**
 * Root navigator: swap dinamico entre auth stack y main stack.
 *
 * Muestra el main stack cuando:
 * - isAuthenticated (usuario logueado)
 * - isGuest (usuario en modo invitado)
 *
 * En caso contrario, muestra el auth stack (Login + Register + Password reset).
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CuestionarioScreen } from "../screens/CuestionarioScreen";
import { DetalleCandidatoScreen } from "../screens/DetalleCandidatoScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MiDecisionScreen } from "../screens/MiDecisionScreen";
import { MisDescartadosScreen } from "../screens/MisDescartadosScreen";
import { MisFavoritosScreen } from "../screens/MisFavoritosScreen";
import { MisRespuestasScreen } from "../screens/MisRespuestasScreen";
import { NoticiasScreen } from "../screens/NoticiasScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PasswordResetConfirmScreen } from "../screens/PasswordResetConfirmScreen";
import { PasswordResetRequestScreen } from "../screens/PasswordResetRequestScreen";
import { PerfilScreen } from "../screens/PerfilScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ResultadosScreen } from "../screens/ResultadosScreen";
import { SubmitDoneScreen } from "../screens/SubmitDoneScreen";
import { useAuthStore } from "../store/auth";
import { useOnboardingStore } from "../store/onboarding";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeen);
  const showMainStack = isAuthenticated || isGuest;
  const showOnboarding = !hasSeenOnboarding && !showMainStack;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : showMainStack ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cuestionario" component={CuestionarioScreen} />
          <Stack.Screen name="SubmitDone" component={SubmitDoneScreen} />
          <Stack.Screen name="Resultados" component={ResultadosScreen} />
          <Stack.Screen name="DetalleCandidato" component={DetalleCandidatoScreen} />
          <Stack.Screen name="MisDescartados" component={MisDescartadosScreen} />
          <Stack.Screen name="MisFavoritos" component={MisFavoritosScreen} />
          <Stack.Screen name="MisRespuestas" component={MisRespuestasScreen} />
            <Stack.Screen name="Noticias" component={NoticiasScreen} />
          <Stack.Screen name="MiDecision" component={MiDecisionScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="PasswordResetRequest"
            component={PasswordResetRequestScreen}
          />
          <Stack.Screen
            name="PasswordResetConfirm"
            component={PasswordResetConfirmScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
