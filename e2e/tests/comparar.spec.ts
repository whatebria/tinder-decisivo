/**
 * Flujo: Comparar candidatos.
 *
 * Screen publico (guest ok). Testeamos:
 *   1. Empty state "Elige ambos candidatos para ver la comparacion."
 *   2. Slots A y B como botones con label "Elegir candidato A/B".
 *   3. Click en slot A abre el picker modal con titulo "Elegir Candidato A".
 *
 * No probamos el flow completo de elegir 2 candidatos + ver comparacion:
 * el picker es un modal con lista larga y requiere seed data especifica.
 * Esto es smoke test del comparador.
 */

import { test, expect } from "@playwright/test";

import {
  dismissCoachMarks,
  enterGuestMode,
  gotoApp,
  vRole,
} from "../helpers/ui";

async function goToComparar(page) {
  const tab = vRole(page, "tab", { name: "Comparar" });
  for (let i = 0; i < 5; i++) {
    await dismissCoachMarks(page);
    try {
      await tab.click({ timeout: 3_000 });
      break;
    } catch (e) {
      if (i === 4) throw e;
    }
  }
  await dismissCoachMarks(page);
}

test.describe("Comparar > Estado inicial", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await enterGuestMode(page);
    await goToComparar(page);
  });

  test("empty state + slots vacios visibles", async ({ page }) => {
    // Empty state
    await expect(
      page
        .getByText(/elige ambos candidatos para ver la comparacion/i)
        .filter({ visible: true })
    ).toBeVisible({ timeout: 10_000 });

    // Slot A y B visibles como botones
    await expect(
      vRole(page, "button", { name: /elegir candidato a/i })
    ).toBeVisible();
    await expect(
      vRole(page, "button", { name: /elegir candidato b/i })
    ).toBeVisible();
  });

  test("click en slot A abre picker con titulo correcto", async ({ page }) => {
    const slotA = vRole(page, "button", { name: /elegir candidato a/i });

    for (let i = 0; i < 5; i++) {
      await dismissCoachMarks(page);
      try {
        await slotA.click({ timeout: 3_000 });
        break;
      } catch (e) {
        if (i === 4) throw e;
      }
    }

    // El picker es un BottomSheet con accessibilityLabel="Elegir Candidato A"
    // (sheet header prop). Puede haber varias apariciones (screen sigue
    // detras). Uso filter visible + first.
    await expect(
      page
        .getByText(/elegir candidato a/i)
        .filter({ visible: true })
        .first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
