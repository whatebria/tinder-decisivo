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
  MisDescartados: undefined;
  MisFavoritos: undefined;
  MiDecision: undefined;
  Perfil: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
