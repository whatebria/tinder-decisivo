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
    matchPct: number;
    confianza: string;
  };
  /**
   * @deprecated Ruta legacy que apunta al mismo screen que `MisGuardados`
   * (Mis guardados unifica favoritos + descartados + posturas + noticias
   * en tabs). Se mantiene registrada mientras `SwipeScreen` la referencia;
   * cuando SwipeScreen resurja, migrar su link y borrar esta linea.
   */
  MisFavoritos: undefined;
  MisGuardados: undefined;
  MisRespuestas: { tipoEleccionId: number };
  MiDecision: undefined;
  Comparar: undefined;
  Noticias: undefined;
  Swipe: undefined;
  Perfil: undefined;
  Configuracion: undefined;
  GestionElecciones: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
