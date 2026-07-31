/**
 * Auth store: token + user info persistido en SecureStore.
 *
 * Soporta 3 estados:
 * - unauthenticated: sin token, no es guest -> pantalla de login
 * - guest:           sin token, isGuest=true -> puede navegar sin cuenta (read-only)
 * - authenticated:   con token -> acceso completo
 *
 * `isGuest` NO se persiste: al reiniciar la app vuelve a login (feature intencional,
 * el guest es efimero).
 *
 * F18: `email` fue removido de este store. El email se obtiene via
 * GET /api/v1/perfil/ (hook usePerfil) y se consume donde se necesita,
 * sin persistirlo en secureStorage junto al token.
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const TOKEN_KEY = "servel_auth_token";
const USER_ID_KEY = "servel_user_id";

interface AuthState {
  token: string | null;
  userId: number | null;
  isGuest: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;

  hydrate: () => Promise<void>;
  setSession: (token: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isGuest: false,
  isHydrated: false,
  isAuthenticated: false,

  hydrate: async () => {
    const [token, userIdStr] = await Promise.all([
      secureStorage.getItem(TOKEN_KEY),
      secureStorage.getItem(USER_ID_KEY),
    ]);
    set({
      token,
      userId: userIdStr ? Number(userIdStr) : null,
      isHydrated: true,
      isAuthenticated: Boolean(token),
    });
  },

  setSession: async (token, userId) => {
    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, token),
      secureStorage.setItem(USER_ID_KEY, String(userId)),
    ]);
    // Al loguearse, salimos del modo guest automaticamente.
    set({ token, userId, isAuthenticated: true, isGuest: false });
  },

  logout: async () => {
    await Promise.all([
      secureStorage.removeItem(TOKEN_KEY),
      secureStorage.removeItem(USER_ID_KEY),
    ]);
    set({
      token: null,
      userId: null,
      isAuthenticated: false,
      isGuest: false,
    });
  },

  enterGuestMode: () => set({ isGuest: true }),
  exitGuestMode: () => set({ isGuest: false }),
}));
