/**
 * Onboarding store: flag "ya vio la intro" persistido + destino intencional
 * post-onboarding (in-memory, no persistido).
 *
 * `hasSeen` es persistente: los slides se muestran una vez por device.
 * `pendingAuthTarget` es transient: sobrevive al swap de stacks del navigator
 * pero se pierde al reload. Se usa para que "Crear cuenta" aterrice en
 * Register directamente (en vez del Login default).
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const ONBOARDING_KEY = "votoafin_onboarding_seen";

/** Destino al que debe navegar el auth stack tras el swap. */
export type PendingAuthTarget = "Login" | "Register";

interface OnboardingState {
  hasSeen: boolean;
  isHydrated: boolean;
  /**
   * Screen inicial del auth stack tras completar onboarding.
   * `null` = default (Login). Se resetea al consumirse.
   */
  pendingAuthTarget: PendingAuthTarget | null;

  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
  setPendingAuthTarget: (target: PendingAuthTarget | null) => void;
  /** Consume el target y lo resetea. Devuelve el valor anterior. */
  consumePendingAuthTarget: () => PendingAuthTarget | null;
  /** Solo util para debug/reset. */
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeen: false,
  isHydrated: false,
  pendingAuthTarget: null,

  hydrate: async () => {
    const stored = await secureStorage.getItem(ONBOARDING_KEY);
    set({ hasSeen: stored === "true", isHydrated: true });
  },

  markSeen: async () => {
    await secureStorage.setItem(ONBOARDING_KEY, "true");
    set({ hasSeen: true });
  },

  setPendingAuthTarget: (target) => set({ pendingAuthTarget: target }),

  consumePendingAuthTarget: () => {
    const current = get().pendingAuthTarget;
    if (current !== null) set({ pendingAuthTarget: null });
    return current;
  },

  reset: async () => {
    await secureStorage.removeItem(ONBOARDING_KEY);
    set({ hasSeen: false, pendingAuthTarget: null });
  },
}));
