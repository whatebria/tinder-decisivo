/**
 * Cliente HTTP tipado para la API Servel.
 *
 * - Base URL configurable via EXPO_PUBLIC_API_BASE.
 * - Autenticacion dual (TASK-003):
 *     Web:    cookie httpOnly `auth_token` (el browser la envia solo, withCredentials).
 *     Mobile: Bearer token via `Authorization` header (SecureStore).
 * - 401 dispara logout automatico.
 * - Timeout 10s por default.
 */

import { Platform } from "react-native";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "../store/auth";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";

const isWeb = Platform.OS === "web";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  // withCredentials=true: el browser envia la cookie httpOnly en requests
  // cross-origin (necesario en dev donde app y API son origenes distintos).
  // En mobile, withCredentials=true no afecta nada (no hay cookies manejadas
  // por el browser nativo).
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: inyecta Authorization header SOLO en mobile.
// En web, el browser envia la cookie httpOnly automaticamente (TASK-003).
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isWeb) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set("Authorization", `Token ${token}`);
    }
  }
  return config;
});

// Response interceptor: 401 -> logout, PERO solo si estabamos autenticados.
// En modo guest un 401 solo significa "esta ruta requiere auth", no hay sesion
// que expirar. Sin este guard, entrar a Resultados como guest disparaba
// logout() al primer query de bookmarking (401) y te tiraba al Login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const state = useAuthStore.getState();
      if (state.token) {
        state.logout();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normaliza errores de axios a mensajes leibles por humano.
 * DRF devuelve `{detail: "..."}` o `{campo: ["error1", ...]}`.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string; [k: string]: unknown }
      | undefined;
    if (data?.detail) return data.detail;
    if (data && typeof data === "object") {
      const first = Object.entries(data)[0];
      if (first) {
        const [field, errs] = first;
        const msg = Array.isArray(errs) ? errs[0] : String(errs);
        return `${field}: ${msg}`;
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Error desconocido";
}
