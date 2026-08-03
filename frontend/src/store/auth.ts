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

import { Platform } from "react-native";
import { create } from "zustand";

import { secureStorage, AUTH_TOKEN_STORAGE_KEY } from "./secureStorage";

const isWeb = Platform.OS === "web";

const TOKEN_KEY = AUTH_TOKEN_STORAGE_KEY; // re-export alias para claridad interna
const USER_ID_KEY = "votoafin_user_id";

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
    const userId = userIdStr ? Number(userIdStr) : null;
    /**
     * En web, el token vive en una cookie httpOnly — secureStorage.getItem
     * retorna null siempre (no-op intencional, ver secureStorage.ts).
     * Usamos `userId !== null` como proxy: si el user se logueo en esta
     * sesion, el userId esta en sessionStorage Y la cookie httpOnly sigue
     * activa. El primer request que falle con 401 limpiara el estado.
     *
     * En nativo, usamos el token directamente.
     */
    const isAuthenticated = isWeb ? userId !== null : Boolean(token);
    set({ token, userId, isHydrated: true, isAuthenticated });
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
