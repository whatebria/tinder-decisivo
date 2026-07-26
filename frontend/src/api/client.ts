/**
 * Cliente HTTP tipado para la API Servel.
 *
 * - Base URL configurable via EXPO_PUBLIC_API_BASE.
 * - Bearer token inyectado desde SecureStore (via auth store).
 * - 401 dispara logout automatico.
 * - Timeout 10s por default.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "../store/auth";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: inyecta token si existe
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set("Authorization", `Token ${token}`);
  }
  return config;
});

// Response interceptor: 401 -> logout
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
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
