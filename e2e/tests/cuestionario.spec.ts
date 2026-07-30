/**
 * Flujo: Cuestionario. Requiere user autenticado (o guest) y una eleccion
 * activada en Home. Testeamos que:
 *   1. Podemos entrar al cuestionario tocando una ElectionCard.
 *   2. Aparecen las opciones de respuesta.
 *   3. Al elegir una opcion, el boton Siguiente se habilita.
 *   4. Podemos avanzar a la pregunta siguiente.
 *
 * Corre en modo autenticado (los guests tambien pueden pero el flujo es
 * el mismo). Setup via API para skippear el UI de register.
 */

import { test, expect } from "@playwright/test";

import { apiRegister } from "../helpers/api";
import {
  dismissCoachMarks,
  gotoApp,
  uiLogin,
  vLabel,
  vRole,
} from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

test.describe("Cuestionario > Flow basico", () => {
  test("entrar al cuestionario y avanzar 1 pregunta", async ({ page }) => {
    const user = makeTestUser("cuest");
    await apiRegister(user);
    await gotoApp(page);
    await uiLogin(page, user);
    await dismissCoachMarks(page);

    // Home renderiza ElectionCards con accessibilityLabel `Eleccion {nombre}`.
    // Uso la primera visible (independiente del nombre exacto).
    const primeraCard = vRole(page, "button", {
      name: /^elecci[oó]n /i,
    }).first();
    await expect(primeraCard).toBeVisible({ timeout: 10_000 });

    // Click con retry por si el coach mark reaparece.
    for (let i = 0; i < 5; i++) {
      await dismissCoachMarks(page);
      try {
        await primeraCard.click({ timeout: 3_000 });
        break;
      } catch (e) {
        if (i === 4) throw e;
      }
    }
    await dismissCoachMarks(page);

    // Ya estamos en el Cuestionario. Aparece el RadioGroup con label
    // "Opciones de respuesta" (accessibilityLabel del componente).
    await expect(
      vLabel(page, "Opciones de respuesta")
    ).toBeVisible({ timeout: 10_000 });

    // Boton Siguiente arranca disabled (canAdvance = false hasta responder).
    const btnSiguiente = vRole(page, "button", { name: /^siguiente$/i });
    await expect(btnSiguiente).toBeDisabled();

    // RadioGroup renderiza opciones como role=radio segun DS. Elijo la primera.
    // Retry loop por el coach mark del Cuestionario que aparece post-nav.
    const primeraOpcion = page
      .getByRole("radio")
      .filter({ visible: true })
      .first();
    await expect(primeraOpcion).toBeVisible({ timeout: 5_000 });
    for (let i = 0; i < 5; i++) {
      await dismissCoachMarks(page);
      try {
        await primeraOpcion.click({ timeout: 3_000 });
        break;
      } catch (e) {
        if (i === 4) throw e;
      }
    }
    await dismissCoachMarks(page);

    // Post-seleccion: Siguiente habilitado.
    await expect(btnSiguiente).toBeEnabled({ timeout: 5_000 });

    // Avanzar a la siguiente pregunta.
    await btnSiguiente.click();

    // El TopBar del cuestionario muestra "N de M · base". Verifico que
    // paso de "1 de M" a "2 de M".
    await expect(
      page.getByText(/^2 de \d+/i).filter({ visible: true })
    ).toBeVisible({ timeout: 5_000 });
  });
});
