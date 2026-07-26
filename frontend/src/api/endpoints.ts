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
export interface NoticiaFeedFilters {
  candidatoId?: number | null;
  fuente?: string | null;
  dias?: number | null;
  q?: string | null;
}

export async function noticiasPorCandidato(
  candidatoId: number
): Promise<Noticia[]> {
  const { data } = await apiClient.get<Noticia[]>(
    `/candidatos/${candidatoId}/noticias/`
  );
  return data;
}

/** Feed global de noticias con filtros opcionales. */
export async function listNoticias(
  filters: NoticiaFeedFilters = {}
): Promise<Noticia[]> {
  const params: Record<string, string | number> = {};
  if (filters.candidatoId) params.candidato_id = filters.candidatoId;
  if (filters.fuente) params.fuente = filters.fuente;
  if (filters.dias) params.dias = filters.dias;
  if (filters.q && filters.q.trim()) params.q = filters.q.trim();
  const { data } = await apiClient.get<Noticia[]>("/noticias/", { params });
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

// ============================================================
// Perfil de usuario
// ============================================================
export interface PerfilContadores {
  respuestas: number;
  favoritos: number;
  descartados: number;
  decisiones: number;
}

export interface Perfil {
  id: number;
  username: string;
  email: string;
  fecha_registro: string;
  contadores: PerfilContadores;
}

export async function getPerfil(): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>("/perfil/");
  return data;
}

export async function cambiarPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/perfil/cambiar-password/",
    { current_password: currentPassword, new_password: newPassword }
  );
  return data;
}

export async function eliminarCuenta(password: string): Promise<void> {
  await apiClient.delete("/perfil/", { data: { password } });
}

// ============================================================
// Posturas de un candidato
// ============================================================
export interface PosturaCandidatoDetalle {
  id: number;
  candidato: number;
  pregunta: number;
  opcion_respuesta: number;
  justificacion: string | null;
  opcion_respuesta_texto: string;
  opcion_respuesta_valor: number;
  candidato_nombre_completo: string;
  pregunta_texto: string;
  pregunta_orden: number;
  eje_tematico: string;
  eje_tematico_display: string;
}

export async function listPosturasCandidato(
  candidatoId: number,
  tipoEleccionId?: number | null
): Promise<PosturaCandidatoDetalle[]> {
  const { data } = await apiClient.get<PosturaCandidatoDetalle[]>(
    `/candidatos/${candidatoId}/posturas/`,
    { params: tipoEleccionId ? { tipo_eleccion_id: tipoEleccionId } : {} }
  );
  return data;
}

// ============================================================
// Match detalle: explicacion pregunta-a-pregunta
// ============================================================
export interface MatchDetalleItem {
  pregunta_id: number;
  pregunta_texto: string;
  pregunta_orden: number;
  eje_tematico: string;
  eje_tematico_display: string;
  user_valor: number;
  user_texto: string;
  user_peso: number;
  user_peso_multiplicador: number;
  candidato_valor: number;
  candidato_texto: string;
  diff: number;
  score: number;
  contribucion: number;
  coincide: boolean;
}

export interface MatchDetalle {
  candidato_id: number;
  candidato_nombre: string;
  match_percentage: number;
  num_preguntas_consideradas: number;
  confianza: string;
  items: MatchDetalleItem[];
}

export async function getMatchDetalle(candidatoId: number): Promise<MatchDetalle> {
  const { data } = await apiClient.get<MatchDetalle>(
    `/candidatos/${candidatoId}/match-detalle/`
  );
  return data;
}

// ============================================================
// Mis respuestas (list + edit)
// ============================================================
export interface OpcionSimple {
  id: number;
  texto: string;
  valor: number;
}

export interface MiRespuesta {
  id: number;
  pregunta: number;
  pregunta_texto: string;
  eje_tematico: string;
  eje_tematico_display: string;
  opcion_elegida: number;
  peso: number;
  opciones: OpcionSimple[];
  fecha_respuesta: string;
}

export interface EditarRespuestaResponse extends MiRespuesta {
  matches_invalidados: number;
}

export async function listMisRespuestas(
  tipoEleccionId: number
): Promise<MiRespuesta[]> {
  const { data } = await apiClient.get<MiRespuesta[]>("/respuestas/mias/", {
    params: { tipo_eleccion_id: tipoEleccionId },
  });
  return data;
}

export async function updateRespuesta(
  respuestaId: number,
  opcionId: number,
  peso: number
): Promise<EditarRespuestaResponse> {
  const { data } = await apiClient.patch<EditarRespuestaResponse>(
    `/respuestas/mias/${respuestaId}/`,
    { opcion_elegida: opcionId, peso }
  );
  return data;
}

// ============================================================
// Reset de cuestionario
// ============================================================
export interface ReiniciarCuestionarioResponse {
  respuestas_borradas: number;
  matches_borrados: number;
}

export async function reiniciarCuestionario(
  tipoEleccionId: number
): Promise<ReiniciarCuestionarioResponse> {
  const { data } = await apiClient.post<ReiniciarCuestionarioResponse>(
    "/respuestas/reiniciar/",
    { tipo_eleccion_id: tipoEleccionId }
  );
  return data;
}

// ============================================================
// Password reset
// ============================================================
export interface PasswordResetRequestResponse {
  email_sent: boolean;
  reset_link?: string; // solo si backend en DEBUG=True
}

export async function requestPasswordReset(
  email: string
): Promise<PasswordResetRequestResponse> {
  const { data } = await apiClient.post<PasswordResetRequestResponse>(
    "/password-reset/request/",
    { email }
  );
  return data;
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/password-reset/confirm/",
    { token, new_password: newPassword }
  );
  return data;
}

// ============================================================
// Match anonimo (modo guest)
// ============================================================
export interface AnonRespuestaInput {
  pregunta_id: number;
  opcion_id: number;
  peso: number;
}

/**
 * Devuelve el mismo shape que matchCandidatos (MatchResult) para que las
 * screens puedan trabajar con un solo tipo.
 */
export async function matchAnonimo(
  tipoEleccionId: number,
  respuestas: AnonRespuestaInput[]
): Promise<MatchResult[]> {
  const { data } = await apiClient.post<MatchResult[]>("/match-anonimo/", {
    tipo_eleccion_id: tipoEleccionId,
    respuestas,
  });
  return data;
}
