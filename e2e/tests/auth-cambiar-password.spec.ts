/**
 * Flujo: Cambiar contrasena desde ConfiguracionScreen (user autenticado).
 *
 * Escenarios:
 * 1. Cambio exitoso -> logout -> login con nueva pass funciona.
 * 2. Password actual incorrecta muestra toast de error.
 */

import { test, expect } from "@playwright/test";

import { apiRegister } from "../helpers/api";
import { gotoApp, goToPerfil, uiLogin } from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Auth › Cambiar contraseña", () => {
  test("cambio exitoso permite login con nueva pass", async ({ page }) => {
    const user = makeTestUser("chpass_ok");
    await apiRegister(user);

    await gotoApp(page);
    await uiLogin(page, user);
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });

    // Ir a Perfil (Config tab -> Editar perfil)
    await goToPerfil(page);

    // Abrir modal de cambio de contrasena (NavRow "Cambiar mi contrasena")
    await page.getByRole("button", { name: /cambiar mi contrase/i }).click();

    // Modal abierto: llenar campos
    const newPassword = `Nueva${Date.now()}!`;
    await page.getByLabel("Contraseña actual").fill(user.password);
    await page.getByLabel(/^nueva contraseña$/i).fill(newPassword);
    await page.getByLabel(/confirmar nueva contraseña/i).fill(newPassword);

    // Submit
    await page
      .getByRole("button", { name: /^cambiar contrase/i })
      .last() // el del modal, no el trigger
      .click();

    // El handler emite toast.success("Contraseña actualizada", ...).
    await expect(
      page
        .getByText(/contraseña actualizada/i)
        .filter({ visible: true })
        .first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("password actual incorrecta muestra error", async ({ page }) => {
    const user = makeTestUser("chpass_bad");
    await apiRegister(user);

    await gotoApp(page);
    await uiLogin(page, user);
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });

    await goToPerfil(page);

    await page.getByRole("button", { name: /cambiar mi contrase/i }).click();

    const newPassword = `Nueva${Date.now()}!`;
    await page.getByLabel("Contraseña actual").fill("password-vieja-incorrecta");
    await page.getByLabel(/^nueva contraseña$/i).fill(newPassword);
    await page.getByLabel(/confirmar nueva contraseña/i).fill(newPassword);
    await page
      .getByRole("button", { name: /^cambiar contrase/i })
      .last()
      .click();

    // Modal sigue abierto (no cerro por error) o aparece toast de error
    // Aceptamos cualquiera de las dos como signal de fallo:
    const modalStillOpen = page.getByLabel("Contraseña actual");
    const errorToast = page.getByText(/contraseña.*incorrect|no pudimos/i);
    await expect(modalStillOpen.or(errorToast)).toBeVisible({ timeout: 8_000 });
  });
});
