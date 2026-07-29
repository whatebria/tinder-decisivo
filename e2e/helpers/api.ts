/**
 * Cliente API directo al backend Django. Se usa para setup rapido de fixtures
 * (crear users, obtener reset tokens) sin pasar por la UI. La UI se testea
 * en los tests mismos.
 */

import { request, type APIRequestContext } from "@playwright/test";
import type { TestUser } from "./users";

export const BACKEND_URL = "http://localhost:8010";

/**
 * Crea un contexto de request desnudo (sin auth). Cada helper puede pedir el
 * suyo o recibirlo por parametro.
 */
async function ctx(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: BACKEND_URL });
}

/**
 * Registra un user via API. Devuelve { userId }.
 * Lanza si el registro falla (ej. username taken).
 */
export async function apiRegister(
  user: TestUser
): Promise<{ userId: number }> {
  const c = await ctx();
  const res = await c.post("/api/v1/register/", {
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
  });
  if (!res.ok()) {
    throw new Error(
      `Register failed ${res.status()}: ${await res.text()}`
    );
  }
  const body = await res.json();
  await c.dispose();
  return { userId: body.id };
}

/**
 * Login via API. Devuelve token.
 */
export async function apiLogin(user: {
  username: string;
  password: string;
}): Promise<string> {
  const c = await ctx();
  const res = await c.post("/api/v1/login/", {
    data: { username: user.username, password: user.password },
  });
  if (!res.ok()) {
    throw new Error(
      `Login failed ${res.status()}: ${await res.text()}`
    );
  }
  const body = await res.json();
  await c.dispose();
  return body.token as string;
}

/**
 * Solicita password reset. En DEBUG=True el backend devuelve el reset_link
 * directamente, asi los tests no dependen de leer emails.
 */
export async function apiRequestPasswordReset(
  email: string
): Promise<{ resetLink: string; token: string }> {
  const c = await ctx();
  const res = await c.post("/api/v1/password-reset/request/", {
    data: { email },
  });
  if (!res.ok()) {
    throw new Error(
      `Password reset request failed ${res.status()}: ${await res.text()}`
    );
  }
  const body = await res.json();
  await c.dispose();
  const link = body.reset_link as string | undefined;
  if (!link) {
    throw new Error(
      "reset_link no vino en la response. Backend en DEBUG=False?"
    );
  }
  const url = new URL(link);
  const token = url.searchParams.get("token");
  if (!token) throw new Error(`No hay ?token en el link: ${link}`);
  return { resetLink: link, token };
}

/**
 * Registra + hace login. Devuelve el token para tests que necesitan un user
 * autenticado ya listo (ej. cambiar-password, eliminar-cuenta).
 */
export async function apiCreateAuthenticatedUser(
  user: TestUser
): Promise<{ userId: number; token: string }> {
  const { userId } = await apiRegister(user);
  const token = await apiLogin(user);
  return { userId, token };
}
