/**
 * CoachMarks store: registra qué tours ya vio el usuario **en esta sesión**.
 *
 * NO se persiste a storage a propósito:
 *
 * - El propósito de los coach marks es educar al usuario cuando abre la app.
 *   Si Jenny reinicia la app o el user cambia (logout / entrar como invitado),
 *   los tours vuelven a aparecer una vez por pantalla.
 * - Modo invitado se comporta igual: como no tiene identidad, no hay nada
 *   especial que hacer — el reset automático al reiniciar el proceso cubre
 *   el caso "cada vez que entro como invitado vuelvo a ver los tours".
 * - Si el user quiere re-verlos en la misma sesión, Config → Ayuda →
 *   "Ver tours de nuevo" llama `resetAll()`.
 *
 * Si algún día se decide persistir por usuario, agregar hydrate/persist
 * bindings a `secureStorage` con `${userId}` en la key y limpiar en logout.
 */

import { create } from "zustand";

import type { TourId } from "../content/coachMarks";

/** Mapa tourId -> visto (true). Los no-vistos simplemente no aparecen. */
type SeenMap = Partial<Record<TourId, true>>;

interface CoachMarksState {
  seen: SeenMap;

  hasSeen: (tourId: TourId) => boolean;
  markSeen: (tourId: TourId) => void;
  /** Reactiva todos los tours (Config -> Ayuda, o al cambiar de sesión). */
  resetAll: () => void;
}

export const useCoachMarksStore = create<CoachMarksState>((set, get) => ({
  seen: {},

  hasSeen: (tourId) => get().seen[tourId] === true,

  markSeen: (tourId) => {
    if (get().seen[tourId]) return;
    set({ seen: { ...get().seen, [tourId]: true } });
  },

  resetAll: () => set({ seen: {} }),
}));
