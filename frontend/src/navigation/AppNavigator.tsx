/**
 * Root navigator: swap dinamico entre auth stack y main stack segun isAuthenticated.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CuestionarioScreen } from "../screens/CuestionarioScreen";
import { DetalleCandidatoScreen } from "../screens/DetalleCandidatoScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ResultadosScreen } from "../screens/ResultadosScreen";
import { SubmitDoneScreen } from "../screens/SubmitDoneScreen";
import { useAuthStore } from "../store/auth";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cuestionario" component={CuestionarioScreen} />
          <Stack.Screen name="SubmitDone" component={SubmitDoneScreen} />
          <Stack.Screen name="Resultados" component={ResultadosScreen} />
          <Stack.Screen name="DetalleCandidato" component={DetalleCandidatoScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
