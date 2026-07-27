/**
 * QueryClient configurado con defaults sensatos para esta app.
 *
 * - staleTime 60s: no refetchear cada mount, tampoco cachear para siempre
 * - retry 1: 1 reintento en fallos de red, no 3 que es demasiado ansioso
 * - refetchOnWindowFocus false: en web (Metro) evita re-fetch al alt-tab
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Claves centralizadas para invalidacion inteligente.
 *
 * REGLA: toda entrada nueva de React Query DEBE registrarse aca. Nunca
 * pases un array literal como `queryKey` en un `useQuery`/`invalidate`,
 * porque perdes typing y typos silenciosos (ej: `["match"]` vs
 * `["matches"]`) rompen la invalidacion sin warning.
 *
 * CONVENCION de namespaces (evita colisiones por prefix cuando invalidamos):
 *   ["noticias", "feed", ...filtros]      -> feed global
 *   ["noticias", "porCandidato", id]      -> noticias de UN candidato
 *   ["matches", tipoEleccionId]           -> ranking del user
 *   ["match-detalle", candidatoId]        -> explicacion pregunta-a-pregunta
 */
export const queryKeys = {
  // Catalogos ---------------------------------------------------------------
  tiposEleccion: ["tiposEleccion"] as const,
  preguntas: (tipoEleccionId: number) => ["preguntas", tipoEleccionId] as const,
  candidatos: ["candidatos"] as const,
  candidato: (id: number) => ["candidato", id] as const,

  // Territorio (regiones + comunas) ----------------------------------------
  regiones: ["regiones"] as const,
  comunas: (regionId: number | null | undefined, q: string | undefined) =>
    ["comunas", regionId ?? null, q ?? ""] as const,

  // Perfil ------------------------------------------------------------------
  perfil: ["perfil"] as const,

  // Cuestionario ------------------------------------------------------------
  misRespuestas: (tipoEleccionId: number | null | undefined) =>
    ["misRespuestas", tipoEleccionId ?? null] as const,
  /** Prefix para invalidar TODAS las variantes por tipo. */
  misRespuestasAll: ["misRespuestas"] as const,

  // Matching ----------------------------------------------------------------
  matches: (tipoEleccionId: number | null | undefined) =>
    ["matches", tipoEleccionId ?? null] as const,
  /** Prefix para invalidar todos los matches (ej: al cambiar comuna). */
  matchesAll: ["matches"] as const,
  matchDetalle: (candidatoId: number | null | undefined) =>
    ["match-detalle", candidatoId ?? null] as const,
  /** Prefix para invalidar todos los detalles. */
  matchDetalleAll: ["match-detalle"] as const,

  // Posturas ----------------------------------------------------------------
  posturas: (
    candidatoId: number | null | undefined,
    tipoEleccionId: number | null | undefined,
  ) => ["posturas", candidatoId ?? null, tipoEleccionId ?? null] as const,

  // Noticias ----------------------------------------------------------------
  /** Feed global con filtros. Namespace separado de las de candidato. */
  noticiasFeed: (filters: {
    candidatoId?: number | null;
    fuente?: string | null;
    dias?: number | null;
    q?: string | null;
  }) =>
    [
      "noticias",
      "feed",
      filters.candidatoId ?? null,
      filters.fuente ?? null,
      filters.dias ?? null,
      filters.q ?? null,
    ] as const,
  noticiasCandidato: (id: number) =>
    ["noticias", "porCandidato", id] as const,

  // Bookmarking -------------------------------------------------------------
  favoritos: ["favoritos"] as const,
  descartados: ["descartados"] as const,
  noticiasBookmarks: ["noticias-bookmarks"] as const,
  posturasBookmarks: ["posturas-bookmarks"] as const,
};
