/**
 * Onboarding store: flag "ya vio la intro" persistido.
 *
 * Solo se muestran los slides una vez por device. `markSeen()` se llama al
 * completar o saltar el flujo.
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const ONBOARDING_KEY = "servel_onboarding_seen";

interface OnboardingState {
  hasSeen: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
  /** Solo util para debug/reset. */
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeen: false,
  isHydrated: false,

  hydrate: async () => {
    const stored = await secureStorage.getItem(ONBOARDING_KEY);
    set({ hasSeen: stored === "true", isHydrated: true });
  },

  markSeen: async () => {
    await secureStorage.setItem(ONBOARDING_KEY, "true");
    set({ hasSeen: true });
  },

  reset: async () => {
    await secureStorage.removeItem(ONBOARDING_KEY);
    set({ hasSeen: false });
  },
}));
