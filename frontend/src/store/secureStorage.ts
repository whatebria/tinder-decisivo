/**
 * Storage seguro cross-platform.
 *
 * - En iOS/Android: usa expo-secure-store (Keychain / KeyStore encriptado).
 * - En web: usa sessionStorage (F12 security review).
 *   sessionStorage no sobrevive al cierre de tab ni entre sesiones del navegador,
 *   reduciendo la ventana de exposicion frente a XSS vs localStorage.
 *
 * Fix completo (TASK-003): migrar a cookies httpOnly desde el backend.
 * Requiere endpoint Django + CSRF protection en rutas autenticadas.
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
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
