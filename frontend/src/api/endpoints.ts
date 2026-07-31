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
export type MiProgresoItem = Schemas["MiProgresoItem"];
export type MiProgresoTopMatch = Schemas["MiProgresoTopMatch"];
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

/**
 * Response de POST /login/.
 *
 * F18: `email` fue removido (privacy minimization). El frontend ahora
 * obtiene el email via GET /api/v1/perfil/, que es la fuente autoritativa
 * para los datos del usuario. Ver usePerfil() en hooks.ts.
 */
export interface LoginResponse {
  token: string;
  user_id: number;
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

/**
 * Resumen agregado del progreso del user en todas las elecciones no-base.
 * Reemplaza el patron N+M (useMatchesQuery + usePreguntas por cada tipo)
 * de la HomeScreen con 1 solo request.
 */
export async function getMiProgreso(): Promise<MiProgresoItem[]> {
  const { data } = await apiClient.get<MiProgresoItem[]>("/mi-progreso/");
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

/**
 * Feed global de noticias con filtros opcionales.
 *
 * NOTA: /noticias/ es el unico endpoint paginado (PageNumberPagination).
 * Por ahora extraemos `results` y descartamos next/previous — la UI actual
 * muestra las primeras 4. Si en algun momento la Novedades feed necesita
 * scroll infinito, migrar a `useInfiniteQuery` y devolver el objeto entero.
 */
export async function listNoticias(
  filters: NoticiaFeedFilters = {}
): Promise<Noticia[]> {
  const params: Record<string, string | number> = {};
  if (filters.candidatoId) params.candidato_id = filters.candidatoId;
  if (filters.fuente) params.fuente = filters.fuente;
  if (filters.dias) params.dias = filters.dias;
  if (filters.q && filters.q.trim()) params.q = filters.q.trim();
  const { data } = await apiClient.get<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Noticia[];
  }>("/noticias/", { params });
  return data.results;
}

// ============================================================
// Bookmarking: favoritos, descartados
// ============================================================
export type CandidatoFavorito = Schemas["CandidatoFavorito"];
export type CandidatoDescartado = Schemas["CandidatoDescartado"];

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

// -- Bookmarks de contenido: noticias y posturas guardadas -----------------

/** Alias del schema: bookmark de una noticia (incluye la noticia embebida). */
export type NoticiaBookmark = Schemas["NoticiaBookmark"];

/** Alias del schema: bookmark de una postura (incluye la postura embebida). */
export type PosturaBookmark = Schemas["PosturaBookmark"];

export async function listNoticiasBookmarks(): Promise<NoticiaBookmark[]> {
  const { data } = await apiClient.get<NoticiaBookmark[]>("/noticias-guardadas/");
  return data;
}

export async function addNoticiaBookmark(noticiaId: number): Promise<NoticiaBookmark> {
  const { data } = await apiClient.post<NoticiaBookmark>(
    "/noticias-guardadas/",
    { noticia: noticiaId }
  );
  return data;
}

export async function deleteNoticiaBookmark(bookmarkId: number): Promise<void> {
  await apiClient.delete(`/noticias-guardadas/${bookmarkId}/`);
}

export async function listPosturasBookmarks(): Promise<PosturaBookmark[]> {
  const { data } = await apiClient.get<PosturaBookmark[]>("/posturas-guardadas/");
  return data;
}

export async function addPosturaBookmark(posturaId: number): Promise<PosturaBookmark> {
  const { data } = await apiClient.post<PosturaBookmark>(
    "/posturas-guardadas/",
    { postura: posturaId }
  );
  return data;
}

export async function deletePosturaBookmark(bookmarkId: number): Promise<void> {
  await apiClient.delete(`/posturas-guardadas/${bookmarkId}/`);
}

// ============================================================
// Perfil de usuario
// ============================================================

/** Alias del schema: contadores agregados de la seccion Perfil. */
export type PerfilContadores = Schemas["Contadores"];

/** Alias del schema: perfil completo del usuario autenticado. */
export type Perfil = Schemas["Perfil"];

/**
 * Region no esta en el schema OpenAPI (el endpoint /regiones/ no fue
 * incluido en drf-spectacular). Cuando el backend lo exponga, migrar
 * a `Schemas["Region"]`.
 */
export interface Region {
  id: number;
  numero_romano: string;
  codigo: string;
  nombre: string;
  nombre_corto: string;
  orden: number;
}

/** Alias del schema: comuna con datos minimos para pickers y perfil. */
export type ComunaInline = Schemas["ComunaInline"];

export async function getPerfil(): Promise<Perfil> {
  const { data } = await apiClient.get<Perfil>("/perfil/");
  return data;
}

export async function listRegiones(): Promise<Region[]> {
  const { data } = await apiClient.get<Region[]>("/regiones/");
  return data;
}

export async function listComunas(
  regionId?: number,
  q?: string,
): Promise<ComunaInline[]> {
  const params: Record<string, string | number> = {};
  if (regionId) params.region_id = regionId;
  if (q) params.q = q;
  const { data } = await apiClient.get<ComunaInline[]>("/comunas/", { params });
  return data;
}

export async function actualizarComuna(
  comunaId: number | null,
): Promise<ComunaInline | null> {
  const { data } = await apiClient.patch<ComunaInline | null>(
    "/perfil/comuna/",
    { comuna_id: comunaId },
  );
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

/**
 * Alias del schema: postura de un candidato sobre una pregunta especifica,
 * con los campos de display precomputados por el backend. El schema le
 * llama `PosturaCandidato`; le mantenemos el sufijo `Detalle` para no
 * romper los call sites.
 */
export type PosturaCandidatoDetalle = Schemas["PosturaCandidato"];

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

/** Alias del schema: opcion minima para poblar el editor de respuestas. */
export type OpcionSimple = Schemas["OpcionSimple"];

/**
 * Alias del schema: item del listado de mis respuestas por eleccion.
 *
 * NOTA: el schema declara `peso` como `PesoEnum` (0 | 1 | 2 | 3) — mas
 * estricto que el `number` anterior. Si algun consumer intenta asignar
 * un valor fuera de ese rango, `tsc` lo cacha (bug catcher gratis).
 */
export type MiRespuesta = Schemas["MisRespuestasItem"];

export interface EditarRespuestaResponse extends MiRespuesta {
  /**
   * Cantidad de MatchCandidato recalculados in-place (UPDATE, no delete+insert).
   * El backend recalcula sync al editar, asi los matches quedan siempre frescos.
   */
  matches_actualizados: number;
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
