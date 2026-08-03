/**
 * Theme store: modo claro / oscuro / system, persistido en storage.
 *
 * Al arrancar la app, `hydrate()` lee el modo guardado. Si nunca eligio,
 * default = "system" (respeta preferencia OS).
 */

import { create } from "zustand";
import { Appearance } from "react-native";

import { secureStorage } from "./secureStorage";

export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "votoafin_theme_mode";

interface ThemeState {
  mode: ThemeMode;
  /** Nombre efectivo del theme (resuelve "system" a "light" o "dark"). */
  effective: "light" | "dark";
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

function resolveSystem(): "light" | "dark" {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

function resolveEffective(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? resolveSystem() : mode;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  effective: resolveSystem(),
  isHydrated: false,

  hydrate: async () => {
    const stored = (await secureStorage.getItem(THEME_KEY)) as ThemeMode | null;
    const mode: ThemeMode = stored ?? "system";
    set({ mode, effective: resolveEffective(mode), isHydrated: true });
  },

  setMode: async (mode) => {
    await secureStorage.setItem(THEME_KEY, mode);
    set({ mode, effective: resolveEffective(mode) });
  },
}));

// Suscripcion a cambios del OS (solo afecta cuando mode === "system").
Appearance.addChangeListener(() => {
  const { mode } = useThemeStore.getState();
  if (mode === "system") {
    useThemeStore.setState({ effective: resolveSystem() });
  }
});
