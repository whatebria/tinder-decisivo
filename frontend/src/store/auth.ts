/**
 * Auth store: token + user info persistido en SecureStore.
 *
 * Uso:
 *   const { token, isAuthenticated, login, logout } = useAuthStore();
 */

import { create } from "zustand";

import { secureStorage } from "./secureStorage";

const TOKEN_KEY = "servel_auth_token";
const USER_ID_KEY = "servel_user_id";
const EMAIL_KEY = "servel_email";

interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  isHydrated: boolean;
  isAuthenticated: boolean;

  hydrate: () => Promise<void>;
  setSession: (token: string, userId: number, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  email: null,
  isHydrated: false,
  isAuthenticated: false,

  hydrate: async () => {
    const [token, userIdStr, email] = await Promise.all([
      secureStorage.getItem(TOKEN_KEY),
      secureStorage.getItem(USER_ID_KEY),
      secureStorage.getItem(EMAIL_KEY),
    ]);
    set({
      token,
      userId: userIdStr ? Number(userIdStr) : null,
      email,
      isHydrated: true,
      isAuthenticated: Boolean(token),
    });
  },

  setSession: async (token, userId, email) => {
    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, token),
      secureStorage.setItem(USER_ID_KEY, String(userId)),
      secureStorage.setItem(EMAIL_KEY, email),
    ]);
    set({ token, userId, email, isAuthenticated: true });
  },

  logout: async () => {
    await Promise.all([
      secureStorage.removeItem(TOKEN_KEY),
      secureStorage.removeItem(USER_ID_KEY),
      secureStorage.removeItem(EMAIL_KEY),
    ]);
    set({ token: null, userId: null, email: null, isAuthenticated: false });
  },
}));
