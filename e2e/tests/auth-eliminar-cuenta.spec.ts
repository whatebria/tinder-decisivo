/**
 * Flujo: Eliminar cuenta (destructivo, con doble confirmacion).
 *
 * Escenarios:
 * 1. Sin escribir "ELIMINAR" el boton queda disabled.
 * 2. Confirmacion completa borra la cuenta y no permite login posterior.
 */

import { test, expect } from "@playwright/test";

import { apiLogin, apiRegister } from "../helpers/api";
import { gotoApp, uiLogin } from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Auth › Eliminar cuenta", () => {
  test("boton disabled sin la palabra magica ELIMINAR", async ({ page }) => {
    const user = makeTestUser("del_disabled");
    await apiRegister(user);

    await gotoApp(page);
    await uiLogin(page, user);
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });

    // Ir a Configuracion
    await page
      .getByRole("button", { name: /configuraci[oó]n|config|perfil/i })
      .first()
      .click();

    // Abrir modal eliminar cuenta
    await page.getByRole("button", { name: /eliminar (mi )?cuenta/i }).click();

    // Solo password, sin la palabra magica
    await page.getByLabel("Tu contrasena").fill(user.password);

    const btn = page.getByRole("button", { name: /si.*eliminar mi cuenta/i });
    await expect(btn).toBeDisabled();

    // Escribir mal la palabra magica -> aun disabled
    await page.getByLabel(/escribe eliminar/i).fill("eliminar"); // lowercase
    await expect(btn).toBeDisabled();

    // Escribirla bien -> enabled
    await page.getByLabel(/escribe eliminar/i).fill("ELIMINAR");
    await expect(btn).toBeEnabled();
  });

  test("eliminacion completa borra la cuenta", async ({ page }) => {
    const user = makeTestUser("del_ok");
    await apiRegister(user);

    await gotoApp(page);
    await uiLogin(page, user);
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeHidden({ timeout: 10_000 });

    await page
      .getByRole("button", { name: /configuraci[oó]n|config|perfil/i })
      .first()
      .click();

    await page.getByRole("button", { name: /eliminar (mi )?cuenta/i }).click();

    await page.getByLabel("Tu contrasena").fill(user.password);
    await page.getByLabel(/escribe eliminar/i).fill("ELIMINAR");
    await page
      .getByRole("button", { name: /si.*eliminar mi cuenta/i })
      .click();

    // Vuelve al login
    await expect(
      page.getByRole("heading", { name: "Servel", level: 1 })
    ).toBeVisible({ timeout: 10_000 });

    // Login con esas credenciales ya no funciona (via API para ir rapido)
    await expect(apiLogin(user)).rejects.toThrow(/Login failed 400/);
  });
});
