/**
 * Flujo: Password reset via email.
 *
 * Escenarios:
 * 1. Request -> obtener reset_link (backend DEBUG=True) -> confirm -> login con nueva.
 * 2. Confirm con token invalido muestra error.
 * 3. Password nueva < 8 caracteres deja el boton disabled.
 *
 * NOTA: el backend en DEBUG=True devuelve reset_link en el response del request.
 * En prod el link va por email real. Los tests usan la ruta de dev.
 */

import { test, expect } from "@playwright/test";

import { apiRegister, apiRequestPasswordReset } from "../helpers/api";
import { gotoApp, gotoPasswordReset, uiLogin } from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Auth › Password reset", () => {
  test("flujo completo: request -> confirm -> login con nueva pass", async ({
    page,
  }) => {
    const user = makeTestUser("reset_ok");
    await apiRegister(user);

    // 1) Pedir el link via API (mismo endpoint que el UI, pero saltamos el UI del email)
    const { token } = await apiRequestPasswordReset(user.email);

    // 2) Ir directo al confirm screen. Sin linking config el frontend no
    //    maneja /reset-password?token=xxx, asi que vamos por UI: click en
    //    "Ya tengo un token" desde la pantalla de "Revisa tu email".
    await gotoApp(page);
    await gotoPasswordReset(page);
    await page.getByLabel("Email").fill(user.email);
    await page.getByRole("button", { name: /enviar link/i }).click();
    // Aparece la pantalla "Revisa tu email"
    await expect(page.getByText(/revisa tu email/i)).toBeVisible({
      timeout: 8_000,
    });
    await page.getByRole("link", { name: /ya tengo un token/i }).click();

    // 3) Estamos en PasswordResetConfirm
    const newPassword = `NewPass${Date.now()}!`;
    await page.getByLabel("Token").fill(token);
    await page.getByLabel("Nueva contrasena", { exact: true }).fill(newPassword);
    await page
      .getByLabel(/confirmar nueva contrasena/i)
      .fill(newPassword);
    await page.getByRole("button", { name: /cambiar contrase/i }).click();

    // 4) Toast de exito + navegacion a Login
    await expect(page.getByText(/contrase.a actualizada/i)).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeVisible({ timeout: 8_000 });

    // 5) Login con la nueva password funciona
    await uiLogin(page, { username: user.username, password: newPassword });
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });
  });

  test("token invalido muestra error", async ({ page }) => {
    await gotoApp(page);
    await gotoPasswordReset(page);
    await page.getByLabel("Email").fill("noimporta@e2e.local");
    await page.getByRole("button", { name: /enviar link/i }).click();
    await page.getByRole("link", { name: /ya tengo un token/i }).click();

    const newPassword = "AlgoValido123!";
    await page.getByLabel("Token").fill("token-invalido-xxx");
    await page.getByLabel("Nueva contrasena", { exact: true }).fill(newPassword);
    await page.getByLabel(/confirmar nueva contrasena/i).fill(newPassword);
    await page.getByRole("button", { name: /cambiar contrase/i }).click();

    await expect(page.getByText(/no pudimos cambiar/i)).toBeVisible({
      timeout: 8_000,
    });
  });

  test("password < 8 caracteres deja el boton disabled", async ({ page }) => {
    await gotoApp(page);
    await gotoPasswordReset(page);
    await page.getByLabel("Email").fill("noimporta@e2e.local");
    await page.getByRole("button", { name: /enviar link/i }).click();
    await page.getByRole("link", { name: /ya tengo un token/i }).click();

    await page.getByLabel("Token").fill("cualquier-token");
    await page.getByLabel("Nueva contrasena", { exact: true }).fill("short");
    await page.getByLabel(/confirmar nueva contrasena/i).fill("short");

    const submitBtn = page.getByRole("button", { name: /cambiar contrase/i });
    await expect(submitBtn).toBeDisabled();
  });
});
