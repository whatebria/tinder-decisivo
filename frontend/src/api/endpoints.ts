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
