/**
 * Flujo: Login de usuario existente.
 *
 * Discriminador de screen: usamos el subtitle unico de cada uno.
 * - Login:    "Ingresa a tu cuenta para encontrar tu candidato ideal."
 * - Register: contiene "Crear cuenta"
 * En RN Web no tenemos <h1>, todo es <div>, entonces heading{level:1}
 * no matchea.
 */

import { test, expect } from "@playwright/test";

import { apiRegister } from "../helpers/api";
import { gotoApp, uiLogin } from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

const LOGIN_SUBTITLE = /ingresa a tu cuenta para encontrar tu candidato/i;

test.describe("Auth › Login", () => {
  test("login exitoso lleva al home", async ({ page }) => {
    const user = makeTestUser("login_ok");
    await apiRegister(user);

    await gotoApp(page);
    // Estamos en Login
    await expect(
      page.getByText(LOGIN_SUBTITLE).filter({ visible: true })
    ).toBeVisible();

    await uiLogin(page, user);

    // Post-login: ya no vemos el Login subtitle
    await expect(
      page.getByText(LOGIN_SUBTITLE).filter({ visible: true })
    ).toBeHidden({ timeout: 10_000 });
  });

  test("credenciales invalidas muestran toast de error", async ({ page }) => {
    const user = makeTestUser("login_bad");
    await apiRegister(user);

    await gotoApp(page);
    await uiLogin(page, {
      username: user.username,
      password: "password-incorrecta-xxx",
    });

    // Toast de error y seguimos en Login
    await expect(page.getByText(/no pudimos iniciar sesi[oó]n/i)).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByText(LOGIN_SUBTITLE).filter({ visible: true })
    ).toBeVisible();
  });

  test("login con email en campo username falla (regresion bug jul-2026)", async ({
    page,
  }) => {
    const user = makeTestUser("login_email");
    await apiRegister(user);

    await gotoApp(page);
    // Intento clasico: usar el email como si fuera el username
    await uiLogin(page, { username: user.email, password: user.password });

    await expect(page.getByText(/no pudimos iniciar sesi[oó]n/i)).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByText(LOGIN_SUBTITLE).filter({ visible: true })
    ).toBeVisible();
  });

  // TODO: logout desde perfil. Requiere localizar el TabBar y el boton de
  // Cerrar sesion en ConfiguracionScreen. Habilitar cuando definamos los
  // accessibilityLabel del TabBar.
  test.skip("logout desde perfil vuelve a login", async () => {});
});
