/**
 * Storage seguro cross-platform.
 *
 * - En iOS/Android: usa expo-secure-store (Keychain / KeyStore encriptado).
 * - En web (TASK-003): el token de auth vive en la cookie httpOnly `auth_token`
 *   que setea el backend al hacer login. JavaScript no puede leer ni escribir
 *   esa cookie (httpOnly). El store solo persiste userId en sessionStorage
 *   para detectar si hay sesion activa sin releer la cookie.
 *
 * Por eso, en web, las operaciones de storage son no-op para AUTH_TOKEN_STORAGE_KEY.
 * Cualquier otra clave (ej. userId) sigue usando sessionStorage como antes.
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

/** Clave del token de autenticacion. En web, ops son no-op (cookie httpOnly). */
export const AUTH_TOKEN_STORAGE_KEY = "servel_auth_token";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      // El token vive en la cookie httpOnly -> ilegible desde JS.
      // Cualquier otra clave (userId, etc.) va en sessionStorage.
      if (key === AUTH_TOKEN_STORAGE_KEY) return null;
      try {
        return globalThis.sessionStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      // Token -> no-op. El backend lo seto como cookie httpOnly en el login.
      if (key === AUTH_TOKEN_STORAGE_KEY) return;
      try {
        globalThis.sessionStorage?.setItem(key, value);
      } catch {
        /* noop */
      }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      // Token -> no-op. El backend lo borra via Set-Cookie en el logout.
      if (key === AUTH_TOKEN_STORAGE_KEY) return;
      try {
        globalThis.sessionStorage?.removeItem(key);
      } catch {
        /* noop */
      }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};
