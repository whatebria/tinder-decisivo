/**
 * Flujo: Candidatos.
 *
 * Screen publico (guest ok). Testeamos:
 *   1. Guest ve el feed de candidatos con contador.
 *   2. Filtro por busqueda cambia el contador.
 *   3. Click en CandidateCard navega al detalle.
 *
 * CandidateCard: role=button, label `{name}, {partido}, match {N}%` o
 * simplemente `{name}, {partido}` cuando no hay match.
 */

import { test, expect } from "@playwright/test";

import {
  dismissCoachMarks,
  enterGuestMode,
  gotoApp,
  vLabel,
  vRole,
} from "../helpers/ui";

async function goToCandidatos(page) {
  const tab = vRole(page, "tab", { name: "Candidatos" });
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

test.describe("Candidatos > Feed publico", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await enterGuestMode(page);
    await goToCandidatos(page);
  });

  test("feed carga con contador y al menos 1 candidato", async ({ page }) => {
    // HomeTopBar brand="Candidatos" + H1 en la screen.
    await expect(
      vRole(page, "heading", { name: /candidatos/i }).first()
    ).toBeVisible({ timeout: 10_000 });

    // Contador "N candidato(s)" (no "resultados" como en Noticias).
    await expect(
      page.getByText(/\d+ candidatos?/i).filter({ visible: true }).first()
    ).toBeVisible({ timeout: 10_000 });

    // Al menos 1 CandidateCard visible. Card = button con label
    // "Nombre, Partido[, match N%]" (accessibilityLabel). Uso getByRole
    // con `name:` porque `filter({ hasText })` mira TEXTO VISIBLE (sin coma),
    // no accessible name.
    await expect(
      page.getByRole("button", { name: /, / }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("filtro por busqueda cambia el contador", async ({ page }) => {
    await vRole(page, "button", { name: /^filtros/i }).click();
    await vLabel(page, "Buscar candidatos").fill("zzz_no_matchea_nada_qqq");
    await vRole(page, "button", { name: /^aplicar/i }).click();

    // Empty state con la copy del EmptyState
    await expect(
      page.getByText(/no hay candidatos que coincidan/i).filter({ visible: true })
    ).toBeVisible({ timeout: 8_000 });
  });

  test("click en CandidateCard navega al detalle", async ({ page }) => {
    // Esperar a que cargue el contador ANTES de buscar cards (evita race con loading).
    await expect(
      page.getByText(/\d+ candidatos?/i).filter({ visible: true }).first()
    ).toBeVisible({ timeout: 10_000 });

    // Card = button con accessibleName "Nombre, Partido[, match N%]"
    // (accessibilityLabel). Ojo: filter({ hasText }) mira texto visible;
    // usar getByRole con `name:` para matchear el accessible name.
    const primeraCard = page
      .getByRole("button", { name: /, / })
      .filter({ visible: true })
      .first();
    await expect(primeraCard).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 5; i++) {
      await dismissCoachMarks(page);
      try {
        await primeraCard.click({ timeout: 3_000 });
        break;
      } catch (e) {
        if (i === 4) throw e;
      }
    }

    // DetalleCandidatoScreen: chequeo que el contador de la lista ya NO se ve.
    await expect(
      page.getByText(/\d+ candidatos?/i).filter({ visible: true })
    ).toBeHidden({ timeout: 8_000 });
  });
});
