/**
 * Endpoints tipados de la API Servel.
 *
 * Cada funcion aca es un wrapper thin sobre apiClient con tipos derivados
 * del schema OpenAPI (src/types/api.ts).
 */

import { apiClient } from "./client";
import type { components } from "../types/api";

// Aliases utiles derivados del schema
type Schemas = components["schemas"];

export type Candidato = Schemas["Candidato"];
export type TipoEleccion = Schemas["TipoEleccion"];
export type Pregunta = Schemas["Pregunta"];
export type OpcionRespuesta = Schemas["OpcionRespuesta"];
export type MatchResult = Schemas["MatchCandidatoResult"];
export type Noticia = Schemas["Noticia"];
export type EjeTematico = Schemas["EjeTematicoEnum"];

/**
 * Shape del campo `breakdown_por_eje` (JSONField del backend).
 * El schema lo declara como `unknown`; aca lo tipamos para el frontend.
 */
export type BreakdownPorEje = Partial<
  Record<EjeTematico, { porcentaje: number; preguntas: number }>
>;

/**
 * Convierte el breakdown al formato que espera RadarChart: eje -> percentage.
 */
export function breakdownToChartData(
  breakdown: BreakdownPorEje | null | undefined
): Record<string, number> {
  if (!breakdown) return {};
  const result: Record<string, number> = {};
  for (const [eje, data] of Object.entries(breakdown)) {
    if (data) result[eje] = data.porcentaje;
  }
  return result;
}

// ============================================================
// Auth
// ============================================================
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/register/", input);
  return data;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/login/", input);
  return data;
}

// ============================================================
// Catalogos
// ============================================================
export async function listTiposEleccion(): Promise<TipoEleccion[]> {
  const { data } = await apiClient.get<TipoEleccion[]>("/tipos-eleccion/");
  return data;
}

export async function listCandidatos(): Promise<Candidato[]> {
  const { data } = await apiClient.get<Candidato[]>("/candidatos/");
  return data;
}

// ============================================================
// Preguntas y respuestas
// ============================================================
export async function preguntasPendientes(
  tipoEleccionId: number
): Promise<Pregunta[]> {
  const { data } = await apiClient.get<Pregunta[]>("/preguntas/", {
    params: { tipo_eleccion_id: tipoEleccionId },
  });
  return data;
}

export interface RespuestaInput {
  pregunta: number;
  opcion_elegida: number;
  peso?: 0 | 1 | 2 | 3;
}

export async function submitRespuestas(
  respuestas: RespuestaInput[]
): Promise<void> {
  await apiClient.post("/respuestas/", respuestas);
}

// ============================================================
// Matching
// ============================================================
export async function matchCandidatos(
  tipoEleccionId: number
): Promise<MatchResult[]> {
  const { data } = await apiClient.post<MatchResult[]>("/match-candidatos/", {
    tipo_eleccion_id: tipoEleccionId,
  });
  return data;
}

// ============================================================
// Noticias
// ============================================================
export async function noticiasPorCandidato(
  candidatoId: number
): Promise<Noticia[]> {
  const { data } = await apiClient.get<Noticia[]>(
    `/candidatos/${candidatoId}/noticias/`
  );
  return data;
}

// ============================================================
// Bookmarking: favoritos, descartados, decision final
// ============================================================
export type CandidatoFavorito = Schemas["CandidatoFavorito"];
export type CandidatoDescartado = Schemas["CandidatoDescartado"];
export type DecisionFinal = Schemas["DecisionFinal"];

// -- Favoritos --------------------------------------------------------------
export async function listFavoritos(): Promise<CandidatoFavorito[]> {
  const { data } = await apiClient.get<CandidatoFavorito[]>(
    "/candidatos-favoritos/"
  );
  return data;
}

export async function addFavorito(candidatoId: number): Promise<CandidatoFavorito> {
  const { data } = await apiClient.post<CandidatoFavorito>(
    "/candidatos-favoritos/",
    { candidato: candidatoId }
  );
  return data;
}

export async function deleteFavorito(favoritoId: number): Promise<void> {
  await apiClient.delete(`/candidatos-favoritos/${favoritoId}/`);
}

// -- Descartados ------------------------------------------------------------
export async function listDescartados(): Promise<CandidatoDescartado[]> {
  const { data } = await apiClient.get<CandidatoDescartado[]>("/descartados/");
  return data;
}

export async function addDescartado(
  candidatoId: number
): Promise<CandidatoDescartado> {
  const { data } = await apiClient.post<CandidatoDescartado>("/descartados/", {
    candidato: candidatoId,
  });
  return data;
}

export async function deleteDescartado(descartadoId: number): Promise<void> {
  await apiClient.delete(`/descartados/${descartadoId}/`);
}

// -- Decision final ---------------------------------------------------------
export async function listDecisiones(): Promise<DecisionFinal[]> {
  const { data } = await apiClient.get<DecisionFinal[]>("/decision-final/");
  return data;
}

export interface SaveDecisionInput {
  candidatoId: number;
  tipoEleccionId: number;
}

export async function saveDecision(input: SaveDecisionInput): Promise<DecisionFinal> {
  // El backend usa update_or_create sobre (user, tipo_eleccion), asi que
  // POST es idempotente para cambiar de opinion.
  const { data } = await apiClient.post<DecisionFinal>("/decision-final/", {
    candidato_elegido: input.candidatoId,
    tipo_eleccion: input.tipoEleccionId,
  });
  return data;
}

export async function deleteDecision(decisionId: number): Promise<void> {
  await apiClient.delete(`/decision-final/${decisionId}/`);
}
