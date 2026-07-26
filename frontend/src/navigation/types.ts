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
  SubmitDone: undefined;
  Resultados: undefined;
  DetalleCandidato: {
    candidatoId: number;
    breakdown: BreakdownPorEje | null;
    /** null cuando el user aun no tiene match calculado (guest sin cuestionario, o navegado desde una lista sin score). */
    matchPct: number | null;
    /** null cuando el user aun no tiene match calculado. */
    confianza: string | null;
  };
  /**
   * @deprecated Ruta legacy que apunta al mismo screen que `MisGuardados`
   * (Mis guardados unifica favoritos + descartados + posturas + noticias
   * en tabs). Se mantiene registrada mientras `SwipeScreen` la referencia;
   * cuando SwipeScreen resurja, migrar su link y borrar esta linea.
   */
  MisFavoritos: undefined;
  MisGuardados: undefined;
  MisRespuestas: undefined;
  MiDecision: undefined;
  Comparar: undefined;
  Noticias: undefined;
  Swipe: undefined;
  Perfil: undefined;
  Configuracion: undefined;
  GestionElecciones: undefined;
  /**
   * Design System visualizador interno. Solo se registra en el navigator
   * cuando __DEV__ es true (dev builds). No accesible en produccion.
   */
  DesignSystem: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
