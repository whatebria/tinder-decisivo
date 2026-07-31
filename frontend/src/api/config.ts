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

// IMPORTANTE: En web, usar `localhost` (NO `127.0.0.1`) para que la cookie
// httpOnly de autenticacion sea same-site con el origen del frontend.
// Con SameSite=Lax, el browser NO envia cookies de `127.0.0.1` en requests
// XHR desde `localhost` — son sitios distintos a pesar de resolverse igual.
// Ref: BUG-005 (glitch post-login: 401 en mi-progreso y perfil).
const DEFAULT_BASE = Platform.select({
  android: "http://10.0.2.2:8010/api/v1",
  ios: "http://127.0.0.1:8010/api/v1",
  default: "http://localhost:8010/api/v1", // web: localhost == same-site con frontend
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE ?? DEFAULT_BASE!;

export const API_TIMEOUT_MS = 10_000;

/**
 * URL absoluta al Django admin del backend. Se deriva del API_BASE_URL
 * quitando el sufijo `/api/vN/` y agregando `/admin/`. Util para links
 * del app hacia el panel administrativo (dev-only).
 */
export const ADMIN_URL =
  API_BASE_URL.replace(/\/api\/v[0-9]+\/?$/, "") + "/admin/";
