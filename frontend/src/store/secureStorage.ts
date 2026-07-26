/**
 * Storage seguro cross-platform.
 *
 * - En iOS/Android: usa expo-secure-store (Keychain / KeyStore encriptado).
 * - En web: usa localStorage (no encriptado, pero suficiente para dev/demo).
 *
 * Para produccion web deberiamos migrar a cookies httpOnly desde el backend,
 * pero para MVP alcanza.
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        globalThis.localStorage?.setItem(key, value);
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
        globalThis.localStorage?.removeItem(key);
      } catch {
        /* noop */
      }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};
