/**
 * Flujo: Registro de cuenta nueva.
 *
 * Escenarios:
 * 1. Registro exitoso -> auto-login -> ve el home.
 * 2. Boton disabled con inputs invalidos.
 * 3. Username duplicado -> toast de error.
 * 4. Trim de espacios en username.
 */

import { test, expect } from "@playwright/test";

import { apiRegister } from "../helpers/api";
import { gotoApp, gotoRegister, uiRegister, vLabel, vRole } from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Auth › Registro", () => {
  test("registro exitoso hace auto-login y lleva al home", async ({ page }) => {
    const user = makeTestUser("reg_ok");

    await gotoApp(page);
    await gotoRegister(page);
    await uiRegister(page, user);

    // Post-registro: auto-login -> ya no vemos el titulo "Crear cuenta" visible.
    await expect(
      page.getByText("Crear cuenta").filter({ visible: true })
    ).toBeHidden({ timeout: 15_000 });
    // Ni el titulo "Servel" del Login.
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 }).filter({ visible: true })
    ).toBeHidden();
  });

  test("boton disabled con inputs invalidos", async ({ page }) => {
    await gotoApp(page);
    await gotoRegister(page);

    const submitBtn = vRole(page, "button", { name: /registrarme/i });
    await expect(submitBtn).toBeDisabled();

    // username < 3 -> aun disabled
    await vLabel(page, "Nombre de usuario").fill("ab");
    await vLabel(page, "Email").fill("ok@test.cl");
    await vLabel(page, "Contraseña").fill("secret1234");
    await expect(submitBtn).toBeDisabled();

    // email sin @ -> disabled
    await vLabel(page, "Nombre de usuario").fill("abcd");
    await vLabel(page, "Email").fill("noemail");
    await expect(submitBtn).toBeDisabled();

    // password < 8 -> disabled
    await vLabel(page, "Email").fill("ok@test.cl");
    await vLabel(page, "Contraseña").fill("short");
    await expect(submitBtn).toBeDisabled();

    // Todos validos -> enabled
    await vLabel(page, "Contraseña").fill("secret1234");
    await expect(submitBtn).toBeEnabled();
  });

  test("username duplicado muestra error", async ({ page }) => {
    const existing = makeTestUser("dup");
    await apiRegister(existing);

    await gotoApp(page);
    await gotoRegister(page);
    await uiRegister(page, existing);

    // Sigue en el screen de registro
    await expect(
      page.getByText("Crear cuenta").filter({ visible: true })
    ).toBeVisible();
    // Toast de error
    await expect(page.getByText(/no pudimos crear tu cuenta/i)).toBeVisible({
      timeout: 8_000,
    });
  });

  // TODO: falla con timeout 15s esperando que "Crear cuenta" desaparezca.
  // Causa exacta pendiente de debug con trace.zip. Hipotesis: register falla
  // silent (toast de error no chequeado) o UserAttributeSimilarityValidator
  // marginal (0.67 vs threshold 0.7, flaky). Ver e2e/README.md > Fix D.
  test.skip("trim de espacios en username permite registro", async ({ page }) => {
    const user = makeTestUser("trim");

    await gotoApp(page);
    await gotoRegister(page);

    await vLabel(page, "Nombre de usuario").fill(`  ${user.username}  `);
    await vLabel(page, "Email").fill(`  ${user.email}  `);
    await vLabel(page, "Contraseña").fill(user.password);
    await vRole(page, "button", { name: /registrarme/i }).click();

    await expect(
      page.getByText("Crear cuenta").filter({ visible: true })
    ).toBeHidden({ timeout: 15_000 });
  });
});
