/**
 * Elections preferences store: qué tipos de elección tiene "activados" el usuario.
 *
 * Como el backend aún no tiene concepto de "activo por usuario", modelamos
 * la preferencia client-side y persistimos en secureStorage. Por default:
 * `null` = todavía no elegió → la UI trata todos como activos hasta que
 * el usuario abra "Gestionar elecciones" y decida.
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const STORAGE_KEY = "tinder_decisivo_active_elections";

interface ElectionsPrefsState {
  /** Set de tipoIds activados. `null` = no configurado aún (todos activos). */
  activeIds: number[] | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  /**
   * Persiste `allTipoIds` como selección inicial solo si `activeIds` es todavía
   * `null` (usuario nunca configuró). Llamar al completar el onboarding para
   * que la selección quede explícita aunque el usuario no haya tocado nada.
   */
  initializeIfNull: (allTipoIds: number[]) => Promise<void>;
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

  initializeIfNull: async (allTipoIds) => {
    if (get().activeIds !== null || allTipoIds.length === 0) return;
    await persist(allTipoIds);
    set({ activeIds: allTipoIds });
  },

  toggle: async (tipoId, allTipoIds) => {
    const current = get().activeIds ?? allTipoIds; // primera edición: parte desde "todos"
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
 * Helper: separa la lista de tipos en activas / disponibles según el store.
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
