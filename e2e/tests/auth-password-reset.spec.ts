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
 *
 * NOTA sobre selectores: usamos `vLabel`/`vRole` de helpers/ui.ts que filtran
 * por visibilidad. RN Stack Navigator monta TODOS los screens en el DOM
 * (Login/Register/Reset/Confirm) y sin filter caemos en strict-mode violation
 * (ej. hay 2 inputs "Email" en el DOM al mismo tiempo).
 */

import { test, expect } from "@playwright/test";

import { apiRegister, apiRequestPasswordReset } from "../helpers/api";
import {
  gotoApp,
  gotoPasswordReset,
  uiLogin,
  vLabel,
  vRole,
} from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Auth › Password reset", () => {
  test("flujo completo: request -> confirm -> login con nueva pass", async ({
    page,
  }) => {
    const user = makeTestUser("reset_ok");
    await apiRegister(user);

    // 1) Pedir el link via API (mismo endpoint que el UI, pero saltamos el UI del email)
    const { token } = await apiRequestPasswordReset(user.email);

    // 2) Ir al Request screen, disparar el envio y navegar al Confirm por el
    //    link "Ya tengo un token" (que aparece en la pantalla "Revisa tu email").
    await gotoApp(page);
    await gotoPasswordReset(page);
    await vLabel(page, "Email", { exact: true }).fill(user.email);
    await vRole(page, "button", { name: /enviar link/i }).click();

    await expect(
      vRole(page, "heading", { name: /revisa tu email/i, level: 1 })
    ).toBeVisible({ timeout: 8_000 });
    await vRole(page, "link", { name: /ya tengo un token/i }).click();

    // 3) Estamos en PasswordResetConfirm
    const newPassword = `NewPass${Date.now()}!`;
    await vLabel(page, "Token").fill(token);
    await vLabel(page, "Nueva contraseña", { exact: true }).fill(newPassword);
    await vLabel(page, /confirmar nueva contraseña/i).fill(newPassword);
    await vRole(page, "button", { name: /cambiar contrase/i }).click();

    // 4) Toast de exito + navegacion a Login (heading "Servel" level 1)
    await expect(
      page.getByText(/contraseña actualizada/i).filter({ visible: true })
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      vRole(page, "heading", { name: "Servel", level: 1 })
    ).toBeVisible({ timeout: 8_000 });

    // 5) Login con la nueva password funciona
    await uiLogin(page, { username: user.username, password: newPassword });
    await expect(
      vRole(page, "heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });
  });

  test("token invalido muestra error", async ({ page }) => {
    await gotoApp(page);
    await gotoPasswordReset(page);
    await vLabel(page, "Email", { exact: true }).fill("noimporta@e2e.local");
    await vRole(page, "button", { name: /enviar link/i }).click();
    await vRole(page, "link", { name: /ya tengo un token/i }).click();

    const newPassword = "AlgoValido123!";
    await vLabel(page, "Token").fill("token-invalido-xxx");
    await vLabel(page, "Nueva contraseña", { exact: true }).fill(newPassword);
    await vLabel(page, /confirmar nueva contraseña/i).fill(newPassword);
    await vRole(page, "button", { name: /cambiar contrase/i }).click();

    await expect(
      page.getByText(/token.*inválido|no pudimos/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("password < 10 caracteres deja el boton disabled", async ({ page }) => {
    await gotoApp(page);
    await gotoPasswordReset(page);
    await vLabel(page, "Email", { exact: true }).fill("noimporta@e2e.local");
    await vRole(page, "button", { name: /enviar link/i }).click();
    await vRole(page, "link", { name: /ya tengo un token/i }).click();

    await vLabel(page, "Token").fill("cualquier-token");
    await vLabel(page, "Nueva contraseña", { exact: true }).fill("short");
    await vLabel(page, /confirmar nueva contraseña/i).fill("short");

    const submitBtn = vRole(page, "button", { name: /cambiar contrase/i });
    await expect(submitBtn).toBeDisabled();
  });
});
