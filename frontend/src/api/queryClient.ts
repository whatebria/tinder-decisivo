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
 * Toca esto (y no las llamadas sueltas) cuando agregues nuevos endpoints.
 */
export const queryKeys = {
  tiposEleccion: ["tiposEleccion"] as const,
  preguntas: (tipoEleccionId: number) => ["preguntas", tipoEleccionId] as const,
  candidatos: ["candidatos"] as const,
  candidato: (id: number) => ["candidato", id] as const,
  noticiasCandidato: (id: number) => ["noticias", id] as const,
  favoritos: ["favoritos"] as const,
  descartados: ["descartados"] as const,
  noticiasBookmarks: ["noticias-bookmarks"] as const,
  posturasBookmarks: ["posturas-bookmarks"] as const,
};
