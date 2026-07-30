/**
 * Flujo: Resultados / Match ranking.
 *
 * Precondicion: user con cuestionario completo para un tipo de eleccion con
 * candidatos (ej. Presidencial 2025, id=10). Setup via API con
 * `apiCompletarCuestionario` para skippear el UI del cuestionario entero.
 *
 * Testea:
 *   1. Post-completar, tocar la card en Home navega directo a Resultados
 *      (no al Cuestionario).
 *   2. Aparece el subtitle "Tus resultados" y la seccion "Ranking completo".
 */

import { test, expect } from "@playwright/test";

import { apiCompletarCuestionario, apiRegister, apiLogin } from "../helpers/api";
import {
  dismissCoachMarks,
  gotoApp,
  uiLogin,
  vRole,
} from "../helpers/ui";
import { makeTestUser } from "../helpers/users";

// Presidencial 2025 tiene ~17 preguntas y candidatos con match.
const TIPO_PRESIDENCIAL_ID = 10;

test.describe("Resultados > Match ranking", () => {
  test("user con cuestionario completo ve ranking", async ({ page }) => {
    const user = makeTestUser("res");
    await apiRegister(user);
    const token = await apiLogin(user);

    // Setup: completa el cuestionario entero via API en ~1s.
    await apiCompletarCuestionario(token, TIPO_PRESIDENCIAL_ID);

    await gotoApp(page);
    await uiLogin(page, user);
    await dismissCoachMarks(page);

    // Tocar la card "Eleccion Presidencial 2025" con retry por coach marks.
    const card = vRole(page, "button", {
      name: /^elecci[oó]n presidencial 2025/i,
    });
    await expect(card).toBeVisible({ timeout: 10_000 });
    for (let i = 0; i < 5; i++) {
      await dismissCoachMarks(page);
      try {
        await card.click({ timeout: 3_000 });
        break;
      } catch (e) {
        if (i === 4) throw e;
      }
    }
    await dismissCoachMarks(page);

    // Deberia aterrizar en Resultados (no en Cuestionario) porque completa=true.
    // ScreenTopBar tiene subtitle "Tus resultados".
    await expect(
      page.getByText(/^tus resultados$/i).filter({ visible: true }).first()
    ).toBeVisible({ timeout: 15_000 });

    // Seccion "Ranking completo" aparece cuando hay matches calculados.
    await expect(
      page.getByText(/^ranking completo$/i).filter({ visible: true }).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
