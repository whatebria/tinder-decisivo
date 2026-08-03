/**
 * Store del cuestionario en curso.
 *
 * Se hidrata al entrar a CuestionarioScreen con las preguntas del tipo elegido.
 * Se reinicia al enviar exitosamente o al elegir otro tipo de eleccion.
 */

import { create } from "zustand";

import { preguntasPendientes, submitRespuestas } from "../api/endpoints";
import type { AnonRespuestaInput, Pregunta, RespuestaInput } from "../api/endpoints";
import { DEFAULT_PESO } from "../services/cuestionario";

type Peso = 0 | 1 | 2 | 3;

export interface RespuestaLocal {
  preguntaId: number;
  opcionElegidaId: number;
  peso: Peso;
}

interface CuestionarioState {
  tipoEleccionId: number | null;
  preguntas: Pregunta[];
  currentIndex: number;
  respuestas: Record<number, RespuestaLocal>;
  loading: boolean;
  submitting: boolean;
  /**
   * UX-056: true una vez que el usuario completa y envia el cuestionario.
   * Nunca vuelve a false (ni en reset()) para que HomeTrustSection no
   * reaparezca al reiniciar para usuarios veteranos (misma sesion).
   */
  hasEverCompletedCuestionario: boolean;
  /**
   * BUG-026: true si el tipo cargado es es_base. Se setea en loadForTipoEleccion
   * (donde el caller ya tiene el TipoEleccion completo) para evitar la race
   * condition con useTiposEleccion() en CuestionarioScreen.
   */
  esTipoBase: boolean;

  loadForTipoEleccion: (tipoEleccionId: number, esTipoBase?: boolean) => Promise<void>;
  /** Setea solo el tipoEleccionId sin cargar preguntas (para ir directo a Resultados). */
  setTipoEleccion: (tipoEleccionId: number) => void;
  setRespuesta: (preguntaId: number, opcionElegidaId: number, peso?: Peso) => void;
  setPeso: (preguntaId: number, peso: Peso) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  submit: (options?: { skipServer?: boolean }) => Promise<void>;
  /** Serializa las respuestas al shape que espera /match-anonimo/. */
  getRespuestasParaAnonimo: () => AnonRespuestaInput[];
}


export const useCuestionarioStore = create<CuestionarioState>((set, get) => ({
  tipoEleccionId: null,
  preguntas: [],
  currentIndex: 0,
  respuestas: {},
  loading: false,
  submitting: false,
  hasEverCompletedCuestionario: false,
  esTipoBase: false,

  loadForTipoEleccion: async (tipoEleccionId, esTipoBase = false) => {
    // BUG-026: esTipoBase llega del caller (que ya tiene el TipoEleccion
    // completo en cache). Elimina la race condition con useTiposEleccion().
    //
    // Preservar progreso: si el usuario vuelve al mismo tipo con respuestas
    // en progreso, NO las reseteamos. Esto mantiene el avance si navegan
    // atras y regresan sin haber ido a otra eleccion.
    const state = get();
    const mismotipo = state.tipoEleccionId === tipoEleccionId;
    const tieneProgreso = mismotipo && Object.keys(state.respuestas).length > 0;
    set({
      loading: true,
      tipoEleccionId,
      esTipoBase,
      currentIndex: tieneProgreso ? state.currentIndex : 0,
      respuestas: tieneProgreso ? state.respuestas : {},
    });
    try {
      const preguntas = await preguntasPendientes(tipoEleccionId);
      set({ preguntas, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  setTipoEleccion: (tipoEleccionId) => {
    set({ tipoEleccionId });
  },

  setRespuesta: (preguntaId, opcionElegidaId, peso) => {
    set((state) => ({
      respuestas: {
        ...state.respuestas,
        [preguntaId]: {
          preguntaId,
          opcionElegidaId,
          peso: peso ?? state.respuestas[preguntaId]?.peso ?? DEFAULT_PESO,
        },
      },
    }));
  },

  setPeso: (preguntaId, peso) => {
    set((state) => {
      const prev = state.respuestas[preguntaId];
      if (!prev) return state;
      return {
        respuestas: {
          ...state.respuestas,
          [preguntaId]: { ...prev, peso },
        },
      };
    });
  },

  next: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.preguntas.length - 1),
    }));
  },

  prev: () => {
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    }));
  },

  reset: () => {
    set({
      tipoEleccionId: null,
      preguntas: [],
      currentIndex: 0,
      respuestas: {},
      loading: false,
      submitting: false,
    });
  },

  submit: async (options) => {
    const { respuestas } = get();
    const payload: RespuestaInput[] = Object.values(respuestas).map((r) => ({
      pregunta: r.preguntaId,
      opcion_elegida: r.opcionElegidaId,
      peso: r.peso,
    }));
    if (payload.length === 0) return;

    // Modo guest: no persistimos nada en el backend, solo marcamos UI state.
    if (options?.skipServer) {
      set({ submitting: true });
      set({ submitting: false });
      return;
    }

    set({ submitting: true });
    try {
      await submitRespuestas(payload);
      // UX-056: marcar que el usuario ya completo al menos una vez.
      set({ hasEverCompletedCuestionario: true });
    } finally {
      set({ submitting: false });
    }
  },

  getRespuestasParaAnonimo: () => {
    const { respuestas } = get();
    return Object.values(respuestas).map((r) => ({
      pregunta_id: r.preguntaId,
      opcion_id: r.opcionElegidaId,
      peso: r.peso,
    }));
  },
}));
