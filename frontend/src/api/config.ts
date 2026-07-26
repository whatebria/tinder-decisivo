/**
 * Config runtime del cliente API.
 *
 * En dev, apunta a Django corriendo en localhost.
 * IMPORTANTE en emulador Android: usar 10.0.2.2 en vez de 127.0.0.1
 * (10.0.2.2 es el alias del host desde dentro del emulador).
 *
 * Para device fisico via Expo Go: usar la IP LAN de tu maquina (ej. 192.168.1.42).
 * Podes overridear con la env var EXPO_PUBLIC_API_BASE al arrancar Expo.
 */

import { Platform } from "react-native";

const DEFAULT_BASE = Platform.select({
  android: "http://10.0.2.2:8010/api/v1",
  ios: "http://127.0.0.1:8010/api/v1",
  default: "http://127.0.0.1:8010/api/v1",
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE ?? DEFAULT_BASE!;

export const API_TIMEOUT_MS = 10_000;
