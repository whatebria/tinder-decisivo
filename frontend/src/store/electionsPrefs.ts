/**
 * Elections preferences store: qu\u00e9 tipos de elecci\u00f3n tiene "activados" el usuario.
 *
 * Como el backend a\u00fan no tiene concepto de "activo por usuario", modelamos
 * la preferencia client-side y persistimos en secureStorage. Por default:
 * `null` = todav\u00eda no elegi\u00f3 \u2192 la UI trata todos como activos hasta que
 * el usuario abra "Gestionar elecciones" y decida.
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const STORAGE_KEY = "tinder_decisivo_active_elections";

interface ElectionsPrefsState {
  /** Set de tipoIds activados. `null` = no configurado a\u00fan (todos activos). */
  activeIds: number[] | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  toggle: (tipoId: number, allTipoIds: number[]) => Promise<void>;
  activate: (tipoId: number, allTipoIds: number[]) => Promise<void>;
  deactivate: (tipoId: number, allTipoIds: number[]) => Promise<void>;
  reset: () => Promise<void>;
}

async function persist(ids: number[]): Promise<void> {
  await secureStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const useElectionsPrefsStore = create<ElectionsPrefsState>((set, get) => ({
  activeIds: null,
  isHydrated: false,

  hydrate: async () => {
    const raw = await secureStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ activeIds: null, isHydrated: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as number[];
      set({ activeIds: Array.isArray(parsed) ? parsed : null, isHydrated: true });
    } catch {
      set({ activeIds: null, isHydrated: true });
    }
  },

  toggle: async (tipoId, allTipoIds) => {
    const current = get().activeIds ?? allTipoIds; // primera edici\u00f3n: parte desde "todos"
    const next = current.includes(tipoId)
      ? current.filter((id) => id !== tipoId)
      : [...current, tipoId];
    await persist(next);
    set({ activeIds: next });
  },

  activate: async (tipoId, allTipoIds) => {
    const current = get().activeIds ?? allTipoIds;
    if (current.includes(tipoId)) return;
    const next = [...current, tipoId];
    await persist(next);
    set({ activeIds: next });
  },

  deactivate: async (tipoId, allTipoIds) => {
    const current = get().activeIds ?? allTipoIds;
    const next = current.filter((id) => id !== tipoId);
    await persist(next);
    set({ activeIds: next });
  },

  reset: async () => {
    await secureStorage.removeItem(STORAGE_KEY);
    set({ activeIds: null });
  },
}));

/**
 * Helper: separa la lista de tipos en activas / disponibles seg\u00fan el store.
 * Si `activeIds` es null, asume que todos son activos (primera visita).
 */
export function partitionTipos<T extends { id?: number | null }>(
  tipos: T[],
  activeIds: number[] | null,
): { activas: T[]; disponibles: T[] } {
  if (activeIds === null) {
    return { activas: tipos, disponibles: [] };
  }
  const activeSet = new Set(activeIds);
  const activas: T[] = [];
  const disponibles: T[] = [];
  for (const tipo of tipos) {
    if (tipo.id != null && activeSet.has(tipo.id)) activas.push(tipo);
    else disponibles.push(tipo);
  }
  return { activas, disponibles };
}
