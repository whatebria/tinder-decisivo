/**
 * CoachMarks store: registra qué tours ya vio el usuario, **persistido por
 * usuario** en secureStorage.
 *
 * Modelo:
 *   - Cada identidad (userId autenticado o "guest") tiene su propia lista de
 *     tours vistos, en la key `servel_coach_marks_seen_${userId|guest}`.
 *   - App.tsx llama `hydrateFor(userId)` al hidratar el auth y cada vez que
 *     cambia la identidad (login, logout, entrar/salir de guest).
 *   - `markSeen` escribe async a storage; `resetAll` borra la key y limpia
 *     memoria (usado por Config -> Ayuda -> "Ver tours de nuevo").
 *
 * Consecuencias:
 *   - Sobrevive refreshes del browser y reinicios de la app.
 *   - Cada usuario ve sus propios tours en su propio ritmo — si dos personas
 *     comparten device, cada una tiene su historial (asumiendo login).
 *   - Modo guest tiene una lista compartida por device (no hay identidad
 *     estable para separarlos).
 *   - Logout NO borra el historial: si el user vuelve a loguearse, sus tours
 *     vistos siguen ahi.
 *
 * Diseño async:
 *   secureStorage es async (SecureStore en native, promesa en web). Por eso
 *   `markSeen` y `resetAll` son async, y hay `isHydrated` como flag para que
 *   `useCoachMarkTour` no muestre tours antes de terminar el load.
 */

import { create } from "zustand";

import type { TourId } from "../content/coachMarks";
import { secureStorage } from "./secureStorage";

const KEY_PREFIX = "servel_coach_marks_seen_";
const GUEST_ID = "guest";

/** Mapa tourId -> visto (true). Los no-vistos simplemente no aparecen. */
type SeenMap = Partial<Record<TourId, true>>;

function keyFor(userId: number | null): string {
  return `${KEY_PREFIX}${userId ?? GUEST_ID}`;
}

interface CoachMarksState {
  seen: SeenMap;
  isHydrated: boolean;
  /** userId actual (null = guest o pre-hydrate). Se usa para armar la key. */
  currentUserId: number | null;

  hasSeen: (tourId: TourId) => boolean;
  markSeen: (tourId: TourId) => Promise<void>;
  /** Reactiva todos los tours de la identidad actual y borra la key en storage. */
  resetAll: () => Promise<void>;
  /**
   * Carga `seen` desde storage para el userId dado (null = guest) y actualiza
   * `currentUserId`. Llamado desde App.tsx cuando cambia la identidad.
   */
  hydrateFor: (userId: number | null) => Promise<void>;
}

export const useCoachMarksStore = create<CoachMarksState>((set, get) => ({
  seen: {},
  isHydrated: false,
  currentUserId: null,

  hasSeen: (tourId) => get().seen[tourId] === true,

  markSeen: async (tourId) => {
    if (get().seen[tourId]) return;
    const next: SeenMap = { ...get().seen, [tourId]: true };
    set({ seen: next });
    try {
      await secureStorage.setItem(keyFor(get().currentUserId), JSON.stringify(next));
    } catch {
      // Si falla el write, el user va a re-ver el tour la proxima vez.
      // Es preferible a crashear la app.
    }
  },

  resetAll: async () => {
    set({ seen: {} });
    try {
      await secureStorage.removeItem(keyFor(get().currentUserId));
    } catch {
      // Idem markSeen: no bloqueamos por un fallo de storage.
    }
  },

  hydrateFor: async (userId) => {
    let seen: SeenMap = {};
    try {
      const raw = await secureStorage.getItem(keyFor(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        // Guard: solo aceptamos objetos plain. Cualquier basura -> vacio.
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          seen = parsed as SeenMap;
        }
      }
    } catch {
      // Storage roto o JSON invalido -> arrancamos limpio.
    }
    set({ seen, currentUserId: userId, isHydrated: true });
  },
}));
