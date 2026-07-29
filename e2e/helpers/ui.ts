/**
 * Helpers de navegacion + acciones comunes en la UI.
 *
 * Se apoyan en accessibilityLabel/aria-label que setea nuestro DS (Button,
 * FormField, Link). Si el DS cambia, aca centralizamos el impacto.
 *
 * NOTA IMPORTANTE sobre react-navigation en web:
 * El Stack.Navigator monta TODOS los screens simultaneamente en el DOM y
 * los oculta con CSS. Esto significa que `getByLabel("Contraseña")` puede
 * matchear el input de Login Y el de Register al mismo tiempo -> "strict
 * mode violation". Solucion: siempre filtrar por visibilidad con .filter({
 * visible: true }).
 *
 * Usa los helpers `vLabel` y `vRole` en los tests para evitar boilerplate.
 */

import type { Locator, Page } from "@playwright/test";
import type { TestUser } from "./users";

/** getByLabel filtrado por visibilidad (esconde screens inactivos). */
export function vLabel(
  page: Page,
  label: string | RegExp,
  options?: { exact?: boolean }
): Locator {
  return page.getByLabel(label, options).filter({ visible: true });
}

/** getByRole filtrado por visibilidad. */
export function vRole(
  page: Page,
  role: Parameters<Page["getByRole"]>[0],
  options?: Parameters<Page["getByRole"]>[1]
): Locator {
  return page.getByRole(role, options).filter({ visible: true });
}

/**
 * Va al home de la app. Si aparece el onboarding de 5 slides (primera visita),
 * lo skipea automaticamente para llegar al Login.
 */
export async function gotoApp(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Si aparece el onboarding, saltarlo. Si no, ya estamos en Login/Home.
  const skipLink = page.getByRole("link", { name: /saltar introducci[oó]n/i });
  if (await skipLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await skipLink.click();
    await skipLink.waitFor({ state: "hidden", timeout: 5_000 });
  }
}

/**
 * Realiza login desde la UI. Asume estar en /Login.
 */
export async function uiLogin(
  page: Page,
  user: { username: string; password: string }
): Promise<void> {
  await vLabel(page, "Nombre de usuario", { exact: true }).fill(user.username);
  await vLabel(page, "Contraseña", { exact: true }).fill(user.password);
  await vRole(page, "button", { name: /iniciar sesi[oó]n/i }).click();
}

/**
 * Realiza registro desde la UI. Asume estar en /Register.
 */
export async function uiRegister(page: Page, user: TestUser): Promise<void> {
  await vLabel(page, "Nombre de usuario", { exact: true }).fill(user.username);
  await vLabel(page, "Email", { exact: true }).fill(user.email);
  await vLabel(page, "Contraseña", { exact: true }).fill(user.password);
  await vRole(page, "button", { name: /registrarme/i }).click();
}

/**
 * Navega a Register desde Login clickeando el link.
 * accessibilityLabel="Ir a registro" (texto visible es "No tengo cuenta — Registrarme").
 */
export async function gotoRegister(page: Page): Promise<void> {
  await vRole(page, "link", { name: /ir a registro/i }).click();
}

/**
 * Navega a PasswordResetRequest desde Login.
 * accessibilityLabel="Recuperar contraseña".
 */
export async function gotoPasswordReset(page: Page): Promise<void> {
  await vRole(page, "link", { name: /recuperar contrase/i }).click();
}
