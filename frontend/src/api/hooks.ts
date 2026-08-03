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
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  actualizarComuna,
  addDescartado,
  addFavorito,
  addPosturaBookmark,
  cambiarPassword,
  confirmPasswordReset,
  deleteDescartado,
  deleteFavorito,
  deletePosturaBookmark,
  eliminarCuenta,
  getMatchDetalle,
  getMiProgreso,
  getPerfil,
  listCandidatos,
  listComunas,
  listDescartados,
  listFavoritos,
  listMisRespuestas,
  listPosturasBookmarks,
  listPosturasCandidato,
  listRegiones,
  listTiposEleccion,
  matchAnonimo,
  matchCandidatos,
  preguntasPendientes,
  reiniciarCuestionario,
  requestPasswordReset,
  updateRespuesta,
  type AnonRespuestaInput,
  type Candidato,
  type CandidatoDescartado,
  type CandidatoFavorito,
  type ComunaInline,
  type EditarRespuestaResponse,
  type MatchResult,
  type MatchDetalle,
  type MiProgresoItem,
  type MiRespuesta,
  type PasswordResetRequestResponse,
  type Perfil,
  type PosturaBookmark,
  type PosturaCandidatoDetalle,
  type Pregunta,
  type Region,
  type ReiniciarCuestionarioResponse,
  type TipoEleccion,
} from "./endpoints";
import { queryKeys } from "./queryClient";
import { useAuthStore } from "../store/auth";

// -- Tipos de eleccion (Home) -----------------------------------------------

/**
 * Lista de tipos de eleccion visibles en el UI.
 *
 * IMPORTANTE: filtramos los tipos con es_base=true (Preguntas generales) porque
 * son transversales — sus respuestas se aplican al match de todas las elecciones,
 * pero no tienen candidatos propios. Exponerlos como cuestionario separado
 * confundia al usuario (aterrizaba en un empty state "no hay candidatos").
 *
 * Los tipos base siguen existiendo en el backend y las respuestas del user siguen
 * enriqueciendo sus matches; simplemente no aparecen como cards seleccionables.
 *
 * Si en el futuro se decide re-exponerlos con UI diferenciada, remover el select.
 */
export function useTiposEleccion() {
  return useQuery<TipoEleccion[], Error, TipoEleccion[]>({
    queryKey: queryKeys.tiposEleccion,
    queryFn: listTiposEleccion,
    select: (data) => data.filter((t) => !t.es_base),
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
 * Detalle de un candidato. Reusa el cache de `useCandidatos()` cuando esta
 * disponible (evita un round-trip completo al backend por cada mount). Si
 * el cache esta vacio o stale, hace fetch de la lista y filtra en memoria
 * porque el backend no expone /candidatos/{id}/ suelto.
 *
 * Si crece a >100 candidatos, agregar endpoint dedicado y cambiar este hook
 * (sin tocar screens).
 */
export function useCandidato(id: number) {
  const qc = useQueryClient();
  return useQuery<Candidato | null>({
    queryKey: queryKeys.candidato(id),
    queryFn: async () => {
      const cached = qc.getQueryData<Candidato[]>(queryKeys.candidatos);
      if (cached && cached.length > 0) {
        return cached.find((c) => c.id === id) ?? null;
      }
      const all = await listCandidatos();
      return all.find((c) => c.id === id) ?? null;
    },
  });
}

// -- Match (mutation, porque es POST y cambia server state) -----------------

export function useMatchCandidatos() {
  const qc = useQueryClient();
  return useMutation<MatchResult[], Error, number>({
    mutationFn: matchCandidatos,
    onSuccess: (data, tipoEleccionId) => {
      // Alimenta el cache de useMatchesQuery para que HomeScreen y otros
      // consumers vean el ranking fresco al toque, sin esperar el staleTime
      // de 60s. Fix del bug "eleccion aparece como no completada aunque
      // recien complete el cuestionario": HomeScreen deriva isCompleted de
      // matches.length > 0, entonces mientras el cache siga vacio la card
      // se ve como pendiente.
      qc.setQueryData(queryKeys.matches(tipoEleccionId), data);
      // Y el resumen del Home HUB tambien: ahora tiene top_match nuevo.
      qc.invalidateQueries({ queryKey: queryKeys.miProgreso });
    },
  });
}

/**
 * Version cacheada de matchCandidatos, para el Home donde queremos leer
 * el ranking sin re-calcular a cada mount. Retry deshabilitado porque un
 * 400 ("no respondiste preguntas") no se resuelve reintentando.
 *
 * IMPORTANTE: se dispara SOLO si el user esta autenticado. Los guests
 * usan `useMatchAnonimo` con respuestas in-memory — llamar este endpoint
 * en modo guest tira 401 automatico (POST persiste, requiere Token auth).
 */
export function useMatchesQuery(tipoEleccionId: number | null | undefined) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<MatchResult[]>({
    queryKey: queryKeys.matches(tipoEleccionId),
    queryFn: async () => {
      try {
        return await matchCandidatos(tipoEleccionId as number);
      } catch (err) {
        // 400 = el backend responde "no hay respuestas registradas todavia".
        // Es un estado valido (el user no hizo el cuestionario aun),
        // no un error que deba propagarse. Retornamos lista vacia.
        if (axios.isAxiosError(err) && err.response?.status === 400) return [];
        throw err;
      }
    },
    enabled: tipoEleccionId != null && isAuth,
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

// -- Home HUB: resumen agregado de todas las elecciones --------------------

/**
 * Resumen del progreso del user en todas las elecciones no-base.
 *
 * Reemplaza el patron N+M de la HomeScreen (useMatchesQuery + usePreguntas
 * por cada tipo activo) con 1 request. Cada item trae total/respondidas/
 * completa + top_match ya resuelto, listo para pintar.
 *
 * enabled solo cuando el user esta autenticado — el endpoint requiere
 * IsAuthenticated; en modo guest la HomeScreen usa otro flujo (respuestas
 * in-memory + useMatchAnonimo).
 */
export function useMisElecciones() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<MiProgresoItem[]>({
    queryKey: queryKeys.miProgreso,
    queryFn: getMiProgreso,
    enabled: isAuth,
    staleTime: 60_000,
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
    queryKey: queryKeys.misRespuestas(tipoEleccionId),
    queryFn: () => listMisRespuestas(tipoEleccionId as number),
    enabled: isAuth && !!tipoEleccionId,
  });
}

/**
 * Fetch de respuestas para MULTIPLES tipos de eleccion en paralelo.
 * Devuelve un array alineado 1:1 con `tipoIds`, cada elemento con
 * `{ tipoEleccionId, data, isLoading, error }`.
 *
 * Uso tipico: MisRespuestasScreen (hub) que muestra respuestas agrupadas
 * por (tipo x eje) sin tener un endpoint agregado en el backend.
 */
export function useMisRespuestasMultiple(tipoIds: number[]) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const results = useQueries({
    queries: tipoIds.map((tipoId) => ({
      queryKey: queryKeys.misRespuestas(tipoId),
      queryFn: () => listMisRespuestas(tipoId),
      enabled: isAuth,
    })),
  });
  return results.map((r, i) => ({
    tipoEleccionId: tipoIds[i],
    data: r.data as MiRespuesta[] | undefined,
    isLoading: r.isLoading,
    error: r.error as Error | null,
  }));
}

export function useUpdateRespuesta() {
  const qc = useQueryClient();
  return useMutation<
    EditarRespuestaResponse,
    Error,
    { respuestaId: number; opcionId: number; peso: number }
  >({
    mutationFn: ({ respuestaId, opcionId, peso }) =>
      updateRespuesta(respuestaId, opcionId, peso),
    onSuccess: () => {
      // Invalida por prefix: cubre tanto el caso single-tipo como el hub
      // multi-tipo (MisRespuestasScreen) sin necesitar el id exacto.
      qc.invalidateQueries({ queryKey: queryKeys.misRespuestasAll });
      // Los matches se invalidaron en el backend; forzamos refetch al pedirlos.
      qc.invalidateQueries({ queryKey: queryKeys.matchesAll });
      // Editar una respuesta cambia top_match y respondidas del resumen.
      qc.invalidateQueries({ queryKey: queryKeys.miProgreso });
    },
  });
}

// -- Match detalle ----------------------------------------------------------

export function useMatchDetalle(candidatoId: number | undefined) {
  return useQuery<MatchDetalle>({
    queryKey: queryKeys.matchDetalle(candidatoId),
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
    queryKey: queryKeys.posturas(candidatoId, tipoEleccionId),
    queryFn: () =>
      listPosturasCandidato(candidatoId as number, tipoEleccionId),
    enabled: !!candidatoId,
  });
}

// -- Perfil -----------------------------------------------------------------

export function usePerfil() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<Perfil>({
    queryKey: queryKeys.perfil,
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

// -- Territorio (regiones + comunas para el picker) -------------------------

export function useRegiones() {
  return useQuery<Region[]>({
    queryKey: queryKeys.regiones,
    queryFn: listRegiones,
    staleTime: 24 * 60 * 60 * 1000, // 24h: catalogo super estable
  });
}

export function useComunas(regionId?: number | null, q?: string) {
  return useQuery<ComunaInline[]>({
    queryKey: queryKeys.comunas(regionId, q),
    queryFn: () => listComunas(regionId ?? undefined, q),
    enabled: !!regionId, // no cargar 346 comunas si no hay region
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useActualizarComuna() {
  const qc = useQueryClient();
  return useMutation<ComunaInline | null, Error, number | null>({
    mutationFn: actualizarComuna,
    onSuccess: () => {
      // El perfil trae comuna inline; invalidamos para refrescar UI.
      // Los matches del user dependen del filtro territorial, tambien se invalidan.
      qc.invalidateQueries({ queryKey: queryKeys.perfil });
      // Los matches del user dependen del filtro territorial; invalidamos
      // "matches" (list) y "match-detalle" (detail) para que se recalculen.
      qc.invalidateQueries({ queryKey: queryKeys.matchesAll });
      qc.invalidateQueries({ queryKey: queryKeys.matchDetalleAll });
      // El resumen del Home tambien depende del top_match territorial.
      qc.invalidateQueries({ queryKey: queryKeys.miProgreso });
    },
  });
}

// ============================================================
// Bookmarking: favoritos, descartados
// ============================================================

// -- Favoritos --------------------------------------------------------------
// TASK-047: opts.enabled para activar el fetch solo cuando el tab esta visible.
export function useFavoritos(opts?: { enabled?: boolean }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<CandidatoFavorito[]>({
    queryKey: queryKeys.favoritos,
    queryFn: listFavoritos,
    enabled: isAuth && (opts?.enabled ?? true),
  });
}

/**
 * Toggle idempotente: si el candidato ya es favorito, lo saca. Sino, lo agrega.
 * BUG-039: antes de agregar a favoritos, limpia el estado de descartado si existe.
 * BUG-045: optimistic update -- el cache se actualiza ANTES de la respuesta del
 * servidor. Si falla, se revierte al snapshot previo.
 *
 * El caller DEBE pasar existingFavId/existingDescId para que mutationFn no lea
 * el cache (que ya fue modificado por onMutate) y tome la accion correcta.
 */
export type FavToggleVars = {
  candidatoId: number;
  /** id del CandidatoFavorito a borrar. undefined = agregar. */
  existingFavId: number | undefined;
  /** id del CandidatoDescartado a limpiar (BUG-039). undefined = no hay. */
  existingDescId: number | undefined;
};
type FavToggleCtx = {
  prevFavoritos: CandidatoFavorito[] | undefined;
  prevDescartados: CandidatoDescartado[] | undefined;
};
export function useToggleFavorito() {
  const qc = useQueryClient();
  return useMutation<CandidatoFavorito | null, Error, FavToggleVars, FavToggleCtx>({
    mutationFn: async ({ candidatoId, existingFavId, existingDescId }) => {
      if (existingFavId !== undefined) {
        await deleteFavorito(existingFavId);
        return null; // eliminado -- onSuccess no necesita reconciliar
      }
      // BUG-039: limpiar descartado existente antes de agregar.
      if (existingDescId !== undefined) await deleteDescartado(existingDescId);
      return addFavorito(candidatoId); // retorna el entry real con id del servidor
    },
    onMutate: async ({ candidatoId, existingFavId, existingDescId }) => {
      // Cancelar refetches en curso para que no pisoteen el estado optimista.
      await qc.cancelQueries({ queryKey: queryKeys.favoritos });
      await qc.cancelQueries({ queryKey: queryKeys.descartados });
      const prevFavoritos = qc.getQueryData<CandidatoFavorito[]>(queryKeys.favoritos);
      const prevDescartados = qc.getQueryData<CandidatoDescartado[]>(queryKeys.descartados);
      if (existingFavId !== undefined) {
        // Optimistic remove
        qc.setQueryData<CandidatoFavorito[]>(queryKeys.favoritos,
          (old) => (old ?? []).filter((f) => f.candidato !== candidatoId));
      } else {
        // Optimistic add (placeholder sin id real -- onSuccess lo reemplaza)
        qc.setQueryData<CandidatoFavorito[]>(queryKeys.favoritos,
          (old) => [...(old ?? []).filter((f) => f.candidato !== candidatoId),
            { id: -1, candidato: candidatoId, fecha_agregado: "", candidato_data: {} as never }]);
        // BUG-039: limpiar desc del cache inmediatamente si lo habia
        if (existingDescId !== undefined) {
          qc.setQueryData<CandidatoDescartado[]>(queryKeys.descartados,
            (old) => (old ?? []).filter((d) => d.candidato !== candidatoId));
        }
      }
      return { prevFavoritos, prevDescartados };
    },
    onSuccess: (nuevo, { candidatoId }) => {
      if (nuevo) {
        // Reemplazar el placeholder optimista con el entry real del servidor.
        qc.setQueryData<CandidatoFavorito[]>(queryKeys.favoritos,
          (old) => [...(old ?? []).filter((f) => f.candidato !== candidatoId), nuevo]);
      }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevFavoritos !== undefined) qc.setQueryData(queryKeys.favoritos, ctx.prevFavoritos);
      if (ctx?.prevDescartados !== undefined) qc.setQueryData(queryKeys.descartados, ctx.prevDescartados);
    },
  });
}

// -- Descartados ------------------------------------------------------------
// TASK-047: opts.enabled para activar el fetch solo cuando el tab esta visible.
export function useDescartados(opts?: { enabled?: boolean }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<CandidatoDescartado[]>({
    queryKey: queryKeys.descartados,
    queryFn: listDescartados,
    enabled: isAuth && (opts?.enabled ?? true),
  });
}

// BUG-045: mismo patron optimistic que useToggleFavorito.
export type DescToggleVars = {
  candidatoId: number;
  existingDescId: number | undefined;
  existingFavId: number | undefined;
};
type DescToggleCtx = {
  prevFavoritos: CandidatoFavorito[] | undefined;
  prevDescartados: CandidatoDescartado[] | undefined;
};
export function useToggleDescartado() {
  const qc = useQueryClient();
  return useMutation<CandidatoDescartado | null, Error, DescToggleVars, DescToggleCtx>({
    mutationFn: async ({ candidatoId, existingDescId, existingFavId }) => {
      if (existingDescId !== undefined) {
        await deleteDescartado(existingDescId);
        return null;
      }
      if (existingFavId !== undefined) await deleteFavorito(existingFavId);
      return addDescartado(candidatoId);
    },
    onMutate: async ({ candidatoId, existingDescId, existingFavId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.favoritos });
      await qc.cancelQueries({ queryKey: queryKeys.descartados });
      const prevFavoritos = qc.getQueryData<CandidatoFavorito[]>(queryKeys.favoritos);
      const prevDescartados = qc.getQueryData<CandidatoDescartado[]>(queryKeys.descartados);
      if (existingDescId !== undefined) {
        qc.setQueryData<CandidatoDescartado[]>(queryKeys.descartados,
          (old) => (old ?? []).filter((d) => d.candidato !== candidatoId));
      } else {
        qc.setQueryData<CandidatoDescartado[]>(queryKeys.descartados,
          (old) => [...(old ?? []).filter((d) => d.candidato !== candidatoId),
            { id: -1, candidato: candidatoId, fecha_descartado: "", candidato_data: {} as never }]);
        if (existingFavId !== undefined) {
          qc.setQueryData<CandidatoFavorito[]>(queryKeys.favoritos,
            (old) => (old ?? []).filter((f) => f.candidato !== candidatoId));
        }
      }
      return { prevFavoritos, prevDescartados };
    },
    onSuccess: (nuevo, { candidatoId }) => {
      if (nuevo) {
        qc.setQueryData<CandidatoDescartado[]>(queryKeys.descartados,
          (old) => [...(old ?? []).filter((d) => d.candidato !== candidatoId), nuevo]);
      }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevFavoritos !== undefined) qc.setQueryData(queryKeys.favoritos, ctx.prevFavoritos);
      if (ctx?.prevDescartados !== undefined) qc.setQueryData(queryKeys.descartados, ctx.prevDescartados);
    },
  });
}

// TASK-047: opts.enabled para activar el fetch solo cuando el tab esta visible.
export function usePosturasBookmarks(opts?: { enabled?: boolean }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery<PosturaBookmark[]>({
    queryKey: queryKeys.posturasBookmarks,
    queryFn: listPosturasBookmarks,
    enabled: isAuth && (opts?.enabled ?? true),
  });
}

export function useTogglePosturaBookmark() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (posturaId: number) => {
      const list = qc.getQueryData<PosturaBookmark[]>(queryKeys.posturasBookmarks) ?? [];
      const existing = list.find((b) => b.postura === posturaId);
      if (existing) {
        await deletePosturaBookmark(existing.id);
      } else {
        await addPosturaBookmark(posturaId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posturasBookmarks });
    },
  });
}
