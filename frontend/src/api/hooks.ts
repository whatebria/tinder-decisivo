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
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  listCandidatos,
  listTiposEleccion,
  matchCandidatos,
  noticiasPorCandidato,
  preguntasPendientes,
  type Candidato,
  type MatchResult,
  type Noticia,
  type Pregunta,
  type TipoEleccion,
} from "./endpoints";
import { queryKeys } from "./queryClient";

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
