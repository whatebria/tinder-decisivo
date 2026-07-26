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
import { DesignSystemScreen } from "../screens/design-system/DesignSystemScreen";
import { DetalleCandidatoScreen } from "../screens/DetalleCandidatoScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MiDecisionScreen } from "../screens/MiDecisionScreen";
import { MisGuardadosScreen } from "../screens/MisGuardadosScreen";
import { MisRespuestasScreen } from "../screens/MisRespuestasScreen";
import { CompararScreen } from "../screens/CompararScreen";
import { ConfiguracionScreen } from "../screens/ConfiguracionScreen";
import { GestionEleccionesScreen } from "../screens/GestionEleccionesScreen";
import { NoticiasScreen } from "../screens/NoticiasScreen";
import { SwipeScreen } from "../screens/SwipeScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PasswordResetConfirmScreen } from "../screens/PasswordResetConfirmScreen";
import { PasswordResetRequestScreen } from "../screens/PasswordResetRequestScreen";
import { PerfilScreen } from "../screens/PerfilScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ResultadosScreen } from "../screens/ResultadosScreen";
import { SubmitDoneScreen } from "../screens/SubmitDoneScreen";
import { useAuthStore } from "../store/auth";
import { useOnboardingStore } from "../store/onboarding";
import type { RootStackParamList, RootStackScreenProps } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Alias legacy: monta MisGuardadosScreen bajo la ruta "MisFavoritos".
 * Existe solo porque SwipeScreen tiene un link a MisFavoritos. Cuando
 * SwipeScreen resurja y migre su link a MisGuardados, borrar esto.
 */
function MisFavoritosAlias(
  props: RootStackScreenProps<"MisFavoritos">,
) {
  return (
    <MisGuardadosScreen
      {...(props as unknown as RootStackScreenProps<"MisGuardados">)}
    />
  );
}

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
          {/* MisFavoritos: alias legacy -> MisGuardadosScreen. Ver comment en
              navigation/types.ts. Cuando SwipeScreen resurja, migrar link
              y borrar esta linea. */}
          <Stack.Screen name="MisFavoritos" component={MisFavoritosAlias} />
          <Stack.Screen name="MisGuardados" component={MisGuardadosScreen} />
          <Stack.Screen name="MisRespuestas" component={MisRespuestasScreen} />
            <Stack.Screen name="Noticias" component={NoticiasScreen} />
            <Stack.Screen name="Comparar" component={CompararScreen} />
            <Stack.Screen name="Swipe" component={SwipeScreen} />
          <Stack.Screen name="MiDecision" component={MiDecisionScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
            <Stack.Screen name="GestionElecciones" component={GestionEleccionesScreen} />
          {/* Design System visualizador interno: solo en dev builds.
              El __DEV__ flag lo remueve automaticamente en produccion. */}
          {__DEV__ ? (
            <Stack.Screen name="DesignSystem" component={DesignSystemScreen} />
          ) : null}
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
