import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { BreakdownPorEje } from "../api/endpoints";

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  PasswordResetRequest: undefined;
  PasswordResetConfirm: { token: string } | undefined;
  Home: undefined;
  Cuestionario: undefined;
  /**
   * mode: "base" para cuestionarios de tipos con es_base=true (Preguntas generales).
   *   Cambia el copy y el destino del CTA (no ofrece Resultados, redirige a activar eleccion o a la primera especifica).
   * mode: "eleccion" (default) para cuestionarios de una eleccion especifica.
   */
  SubmitDone: { mode?: "base" | "eleccion" } | undefined;
  Resultados: undefined;
  DetalleCandidato: {
    candidatoId: number;
    breakdown: BreakdownPorEje | null;
    /** null cuando el user aun no tiene match calculado (guest sin cuestionario, o navegado desde una lista sin score). */
    matchPct: number | null;
    /** null cuando el user aun no tiene match calculado. */
    confianza: string | null;
  };
  MisGuardados: undefined;
  MisRespuestas: undefined;
  Comparar: undefined;
  Noticias: undefined;
  Candidatos: undefined;
  Perfil: undefined;
  Configuracion: undefined;
  GestionElecciones: undefined;
  /**
   * Design System visualizador interno. Solo se registra en el navigator
   * cuando __DEV__ es true (dev builds). No accesible en produccion.
   */
  DesignSystem: undefined;
  /**
   * Preview del onboarding desde Configuracion > Debug.
   * Solo disponible en dev builds. Los CTAs finales hacen goBack()
   * en vez de swapear stacks — sin side effects sobre auth o store.
   */
  OnboardingPreview: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
