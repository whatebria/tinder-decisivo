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
import { PasswordResetConfirmScreen } from "../screens/PasswordResetConfirmScreen";
import { PasswordResetRequestScreen } from "../screens/PasswordResetRequestScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ResultadosScreen } from "../screens/ResultadosScreen";
import { SubmitDoneScreen } from "../screens/SubmitDoneScreen";
import { useAuthStore } from "../store/auth";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const showMainStack = isAuthenticated || isGuest;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showMainStack ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cuestionario" component={CuestionarioScreen} />
          <Stack.Screen name="SubmitDone" component={SubmitDoneScreen} />
          <Stack.Screen name="Resultados" component={ResultadosScreen} />
          <Stack.Screen name="DetalleCandidato" component={DetalleCandidatoScreen} />
          <Stack.Screen name="MisDescartados" component={MisDescartadosScreen} />
          <Stack.Screen name="MisFavoritos" component={MisFavoritosScreen} />
          <Stack.Screen name="MiDecision" component={MiDecisionScreen} />
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
