import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { BreakdownPorEje } from "../api/endpoints";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
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
  MiDecision: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
