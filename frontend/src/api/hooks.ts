/**
 * Hooks React Query para todos los GETs del backend.
 *
 * Reemplazan el patron useState + useEffect + fetch en las screens.
 * Beneficios: cache automatico, retry, dedup de requests concurrentes,
 * loading/error states consistentes.
 *
 * Para POSTs (submit, login) seguimos usando los stores (Zustand)
 * porque involucran side-effects mas complejos (navegar, resetear form).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addDescartado,
  addFavorito,
  cambiarPassword,
  confirmPasswordReset,
  deleteDecision,
  deleteDescartado,
  deleteFavorito,
  eliminarCuenta,
  getMatchDetalle,
  getPerfil,
  listCandidatos,
  listDecisiones,
  listDescartados,
  listFavoritos,
  listMisRespuestas,
  listNoticias,
  listPosturasCandidato,
  listTiposEleccion,
  matchAnonimo,
  matchCandidatos,
  noticiasPorCandidato,
  preguntasPendientes,
  reiniciarCuestionario,
  requestPasswordReset,
  saveDecision,
  updateRespuesta,
  type AnonRespuestaInput,
  type Candidato,
  type CandidatoDescartado,
  type CandidatoFavorito,
  type DecisionFinal,
  type EditarRespuestaResponse,
  type MatchResult,
  type MatchDetalle,
  type MiRespuesta,
  type Noticia,
  type NoticiaFeedFilters,
  type PasswordResetRequestResponse,
  type Perfil,
  type PosturaCandidatoDetalle,
  type Pregunta,
  type ReiniciarCuestionarioResponse,
  type SaveDecisionInput,
  type TipoEleccion,
} from "./endpoints";
import { queryKeys } from "./queryClient";
import { useAuthStore } from "../store/auth";

// -- Tipos de eleccion (Home) -----------------------------------------------

export function useTiposEleccion() {
  return useQuery<TipoEleccion[]>({
    queryKey: queryKeys.tiposEleccion,
    queryFn: listTiposEleccion,
  });
}

// -- Preguntas de un cuestionario -------------------------------------------

export function usePreguntas(tipoEleccionId: number | null | undefined) {
  return useQuery<Pregunta[]>({
    queryKey: tipoEleccionId ? queryKeys.preguntas(tipoEleccionId) : ["preguntas", "none"],
    queryFn: () => preguntasPendientes(tipoEleccionId as number),
    enabled: tipoEleccionId != null,
  });
}

// -- Candidatos -------------------------------------------------------------

export function useCandidatos() {
  return useQuery<Candidato[]>({
    queryKey: queryKeys.candidatos,
    queryFn: listCandidatos,
  });
}

/**
 * Detalle de un candidato. Reusa el list y filtra en memoria porque el
 * backend no expone /candidatos/{id}/ suelto. Si crece a >100 candidatos,
 * agregar endpoint dedicado y cambiar este hook (sin tocar screens).
 */
export function useCandidato(id: number) {
  return useQuery<Candidato | null>({
    queryKey: queryKeys.candidato(id),
    queryFn: async () => {
      const all = await listCandidatos();
      return all.find((c) => c.id === id) ?? null;
    },
  });
}

// -- Noticias por candidato -------------------------------------------------

export function useNoticiasCandidato(id: number) {
  return useQuery<Noticia[]>({
    queryKey: queryKeys.noticiasCandidato(id),
    queryFn: () => noticiasPorCandidato(id),
    // Si no hay noticias, no reintentar (es normal cuando aun no corriste fetch_noticias)
    retry: 0,
  });
}

// -- Match (mutation, porque es POST y cambia server state) -----------------

export function useMatchCandidatos() {
  return useMutation<MatchResult[], Error, number>({
    mutationFn: matchCandidatos,
  });
}

/**
 * Version cacheada de matchCandidatos, para el Home donde queremos leer
 * el ranking sin re-calcular a cada mount. Retry deshabilitado porque un
 * 400 ("no respondiste preguntas") no se resuelve reintentando.
 */
export function useMatchesQuery(tipoEleccionId: number | null | undefined) {
  return useQuery<MatchResult[]>({
    queryKey: ["matches", tipoEleccionId ?? null],
    queryFn: () => matchCandidatos(tipoEleccionId as number),
    enabled: tipoEleccionId != null,
    staleTime: 60_000,
    retry: 0,
  });
}

/**
 * Match para guests: recibe respuestas in-memory y llama a /match-anonimo/.
 * No persiste nada en el backend.
 */
export function useMatchAnonimo() {
  return useMutation<
    MatchResult[],
    Error,
    { tipoEleccionId: number; respuestas: AnonRespuestaInput[] }
  >({
    mutationFn: ({ tipoEleccionId, respuestas }) =>
      matchAnonimo(tipoEleccionId, respuestas),
  });
}

// -- Password reset ---------------------------------------------------------

export function useRequestPasswordReset() {
  return useMutation<PasswordResetRequestResponse, Error, string>({
    mutationFn: requestPasswordReset,
  });
}

export function useConfirmPasswordReset() {
  return useMutation<
    { message: string },
    Error,
    { token: string; newPassword: string }
  >({
    mutationFn: ({ token, newPassword }) =>
      confirmPasswordReset(token, newPassword),
  });
}

// -- Reset cuestionario -----------------------------------------------------

export function useReiniciarCuestionario() {
  const qc = useQueryClient();
  return useMutation<ReiniciarCuestionarioResponse, Error, number>({
    mutationFn: reiniciarCuestionario,
    onSuccess: () => {
      // Invalida todo lo que puede haber cambiado: respuestas ya no existen,
      // matches se recalcularan proximo submit. Bookmarks NO se tocan.
      qc.invalidateQueries();
    },
  });
}

// -- Mis respuestas (list + edit) -------------------------------------------

export function useMisRespuestas(tipoEleccionId: number | null | undefined) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<MiRespuesta[]>({
    queryKey: ["misRespuestas", tipoEleccionId],
    queryFn: () => listMisRespuestas(tipoEleccionId as number),
    enabled: isAuth && !!tipoEleccionId,
  });
}

export function useUpdateRespuesta(tipoEleccionId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation<
    EditarRespuestaResponse,
    Error,
    { respuestaId: number; opcionId: number; peso: number }
  >({
    mutationFn: ({ respuestaId, opcionId, peso }) =>
      updateRespuesta(respuestaId, opcionId, peso),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["misRespuestas", tipoEleccionId] });
      // Los matches se invalidaron en el backend; forzamos refetch al pedirlos.
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

// -- Noticias feed global ---------------------------------------------------

export function useNoticiasFeed(filters: NoticiaFeedFilters = {}) {
  return useQuery<Noticia[]>({
    queryKey: [
      "noticias",
      filters.candidatoId ?? null,
      filters.fuente ?? null,
      filters.dias ?? null,
      filters.q ?? null,
    ],
    queryFn: () => listNoticias(filters),
    staleTime: 60_000,
  });
}

// -- Match detalle ----------------------------------------------------------

export function useMatchDetalle(candidatoId: number | undefined) {
  return useQuery<MatchDetalle>({
    queryKey: ["match-detalle", candidatoId ?? null],
    queryFn: () => getMatchDetalle(candidatoId!),
    enabled: candidatoId != null,
    staleTime: 60_000,
  });
}

// -- Posturas de candidato --------------------------------------------------

export function usePosturasCandidato(
  candidatoId: number | null | undefined,
  tipoEleccionId?: number | null
) {
  return useQuery<PosturaCandidatoDetalle[]>({
    queryKey: ["posturas", candidatoId, tipoEleccionId ?? null],
    queryFn: () =>
      listPosturasCandidato(candidatoId as number, tipoEleccionId),
    enabled: !!candidatoId,
  });
}

// -- Perfil -----------------------------------------------------------------

export function usePerfil() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<Perfil>({
    queryKey: ["perfil"],
    queryFn: getPerfil,
    enabled: isAuth,
  });
}

export function useCambiarPassword() {
  return useMutation<
    { message: string },
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: ({ currentPassword, newPassword }) =>
      cambiarPassword(currentPassword, newPassword),
  });
}

export function useEliminarCuenta() {
  return useMutation<void, Error, string>({
    mutationFn: eliminarCuenta,
  });
}

// ============================================================
// Bookmarking: favoritos, descartados, decision final
// ============================================================

// -- Favoritos --------------------------------------------------------------
export function useFavoritos() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<CandidatoFavorito[]>({
    queryKey: queryKeys.favoritos,
    queryFn: listFavoritos,
    enabled: isAuth, // Guest no tiene sesion -> no dispara 401.
  });
}

/**
 * Toggle idempotente: si el candidato ya es favorito, lo saca. Sino, lo agrega.
 * Consulta el cache actual para decidir el side de la mutation.
 * Invalida el cache al final para que las UIs se actualicen.
 */
export function useToggleFavorito() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (candidatoId: number) => {
      const favoritos = qc.getQueryData<CandidatoFavorito[]>(queryKeys.favoritos) ?? [];
      const existing = favoritos.find((f) => f.candidato === candidatoId);
      if (existing) {
        await deleteFavorito(existing.id!);
      } else {
        await addFavorito(candidatoId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favoritos });
    },
  });
}

// -- Descartados ------------------------------------------------------------
export function useDescartados() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<CandidatoDescartado[]>({
    queryKey: queryKeys.descartados,
    queryFn: listDescartados,
    enabled: isAuth,
  });
}

export function useToggleDescartado() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (candidatoId: number) => {
      const descartados =
        qc.getQueryData<CandidatoDescartado[]>(queryKeys.descartados) ?? [];
      const existing = descartados.find((d) => d.candidato === candidatoId);
      if (existing) {
        await deleteDescartado(existing.id!);
      } else {
        await addDescartado(candidatoId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.descartados });
    },
  });
}

// -- Decision final ---------------------------------------------------------
export function useDecisiones() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<DecisionFinal[]>({
    queryKey: queryKeys.decisiones,
    queryFn: listDecisiones,
    enabled: isAuth,
  });
}

/**
 * Devuelve la decision guardada para un tipo de eleccion, o undefined.
 * Usa el mismo cache que useDecisiones para evitar N requests.
 */
export function useDecisionActual(tipoEleccionId: number | null | undefined) {
  const { data, ...rest } = useDecisiones();
  const decision = data?.find((d) => d.tipo_eleccion === tipoEleccionId);
  return { data: decision, ...rest };
}

export function useSaveDecision() {
  const qc = useQueryClient();
  return useMutation<DecisionFinal, Error, SaveDecisionInput>({
    mutationFn: saveDecision,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decisiones });
    },
  });
}

export function useDeleteDecision() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteDecision,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decisiones });
    },
  });
}
