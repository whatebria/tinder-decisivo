/**
 * Root navigator: swap dinámico entre auth stack y main stack.
 *
 * ## Code splitting (perf web)
 * Solo las primeras pantallas visibles al abrir la app se incluyen en el
 * bundle inicial (eager). El resto se carga bajo demanda con React.lazy,
 * reduciendo el bundle inicial de ~1.5 MB a ~300–400 KB.
 *
 *   Eager : HomeScreen | LoginScreen | OnboardingScreen
 *   Lazy  : todo lo demás
 *
 * Un <Suspense> envuelve el navigator y muestra un Spinner mientras un chunk
 * lazy se descarga. Solo ocurre la primera vez que el usuario navega a esa
 * pantalla; las siguientes son instantáneas (chunk ya cacheado por el browser).
 *
 * ### Regla para nuevas pantallas
 * - Primera pantalla que el usuario ve al abrir la app → import estático (eager).
 * - Cualquier otra pantalla → `lazyScreen(() => import("../screens/X"), "X")`.
 *
 * ## Lógica de stacks
 * Muestra main stack cuando:
 * - isAuthenticated (usuario logueado)
 * - isGuest (usuario en modo invitado)
 *
 * En caso contrario: auth stack (Login + Register + Password reset).
 */

import React, { Suspense } from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ---------------------------------------------------------------------------
// Eager: primeras pantallas visibles al abrir la app.
// Incluidas en el bundle inicial → cero delay en el primer render.
// ---------------------------------------------------------------------------
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";

import { Spinner } from "../components";
import { useAuthStore } from "../store/auth";
import { useOnboardingStore } from "../store/onboarding";
import type { RootStackParamList } from "./types";

// ---------------------------------------------------------------------------
// lazyScreen — helper tipado para React.lazy con exports nombrados.
//
// Evita el boilerplate `.then(m => ({ default: m.X }))` en cada pantalla.
// Los componentes se definen a nivel de módulo (fuera del render) para que
// React no los recree en cada re-render y para que el chunk se precargue
// una sola vez.
//
// Uso:
//   const MiScreen = lazyScreen(() => import("../screens/MiScreen"), "MiScreen");
// ---------------------------------------------------------------------------
function lazyScreen<T extends React.ComponentType<any>>(
  factory: () => Promise<Record<string, T>>,
  name: string,
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    factory().then((m) => ({ default: m[name] as T })),
  );
}

// ---------------------------------------------------------------------------
// Lazy screens — se descargan la primera vez que el usuario navega a ellas.
// ---------------------------------------------------------------------------
const CuestionarioScreen       = lazyScreen(() => import("../screens/CuestionarioScreen"),       "CuestionarioScreen");
const SubmitDoneScreen         = lazyScreen(() => import("../screens/SubmitDoneScreen"),          "SubmitDoneScreen");
const ResultadosScreen         = lazyScreen(() => import("../screens/ResultadosScreen"),          "ResultadosScreen");
const DetalleCandidatoScreen   = lazyScreen(() => import("../screens/DetalleCandidatoScreen"),    "DetalleCandidatoScreen");
const MisGuardadosScreen       = lazyScreen(() => import("../screens/MisGuardadosScreen"),        "MisGuardadosScreen");
const MisRespuestasScreen      = lazyScreen(() => import("../screens/MisRespuestasScreen"),       "MisRespuestasScreen");
const CandidatosScreen         = lazyScreen(() => import("../screens/CandidatosScreen"),          "CandidatosScreen");
const CompararScreen           = lazyScreen(() => import("../screens/CompararScreen"),            "CompararScreen");
const PerfilScreen             = lazyScreen(() => import("../screens/PerfilScreen"),              "PerfilScreen");
const ConfiguracionScreen      = lazyScreen(() => import("../screens/ConfiguracionScreen"),       "ConfiguracionScreen");
const GestionEleccionesScreen  = lazyScreen(() => import("../screens/GestionEleccionesScreen"),   "GestionEleccionesScreen");
const RegisterScreen           = lazyScreen(() => import("../screens/RegisterScreen"),            "RegisterScreen");
const PasswordResetRequestScreen = lazyScreen(() => import("../screens/PasswordResetRequestScreen"), "PasswordResetRequestScreen");
const PasswordResetConfirmScreen = lazyScreen(() => import("../screens/PasswordResetConfirmScreen"), "PasswordResetConfirmScreen");
// Design System solo existe en dev: tree-shaken automáticamente en producción.
const DesignSystemScreen       = lazyScreen(() => import("../screens/design-system/DesignSystemScreen"), "DesignSystemScreen");

// ---------------------------------------------------------------------------
// Navigator
// ---------------------------------------------------------------------------

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Spinner full-screen mostrado por el boundary Suspense mientras un chunk
 * lazy se descarga. Solo aparece en la primera navegación a cada pantalla.
 */
function LazyFallback() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Spinner size="large" />
    </View>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeen);
  const showMainStack = isAuthenticated || isGuest;
  // Onboarding solo aparece en la primera apertura: sin sesion y sin haberlo visto.
  // Es un flujo pre-auth, no post-registro. Ver BUG-009 (cerrado: by design).
  const showOnboarding = !hasSeenOnboarding && !showMainStack;

  // Consume la intención "quiero registrarme" que el OnboardingScreen setea
  // antes de terminar. Al mostrar el auth stack, arrancamos en la screen que
  // el usuario eligió. Cae a `undefined` (=> initialRouteName default = Login)
  // cuando no hay intención explícita o venimos de un logout normal.
  const authInitialRoute = useOnboardingStore((s) => s.pendingAuthTarget);

  return (
    <Suspense fallback={<LazyFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : showMainStack ? (
          <>
            <Stack.Screen name="Home"               component={HomeScreen} />
            <Stack.Screen name="Cuestionario"       component={CuestionarioScreen} />
            <Stack.Screen name="SubmitDone"         component={SubmitDoneScreen} />
            <Stack.Screen name="Resultados"         component={ResultadosScreen} />
            <Stack.Screen name="DetalleCandidato"   component={DetalleCandidatoScreen} />
            <Stack.Screen name="MisGuardados"       component={MisGuardadosScreen} />
            <Stack.Screen name="MisRespuestas"      component={MisRespuestasScreen} />
            <Stack.Screen name="Candidatos"         component={CandidatosScreen} />
            <Stack.Screen name="Comparar"           component={CompararScreen} />
            <Stack.Screen name="Perfil"             component={PerfilScreen} />
            <Stack.Screen name="Configuracion"      component={ConfiguracionScreen} />
            <Stack.Screen name="GestionElecciones"  component={GestionEleccionesScreen} />
            {/* Design System visualizador interno: solo en dev builds.
                El __DEV__ flag lo remueve automáticamente en producción. */}
            {__DEV__ ? (
              <Stack.Screen name="DesignSystem"       component={DesignSystemScreen} />
            ) : null}
            {/* Preview del onboarding desde Configuracion > Debug. */}
            {__DEV__ ? (
              <Stack.Screen name="OnboardingPreview"  component={OnboardingScreen} />
            ) : null}
          </>
        ) : (
          <Stack.Group
            navigationKey={authInitialRoute ?? "default"}
            screenOptions={{}}
          >
            {authInitialRoute === "Register" ? (
              <>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Login"    component={LoginScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login"    component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
            <Stack.Screen name="PasswordResetRequest" component={PasswordResetRequestScreen} />
            <Stack.Screen name="PasswordResetConfirm" component={PasswordResetConfirmScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </Suspense>
  );
}
