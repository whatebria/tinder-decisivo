/**
 * Flujo: Onboarding welcome tour (5 slides).
 *
 * Aparece solo la primera vez (flag persisted en `useOnboardingStore`).
 * Como los tests corren en context fresh (sin storage), el onboarding
 * aparece siempre al goto("/").
 *
 * NOTA: usamos `page.goto("/")` directamente en vez de `gotoApp` porque
 * este ultimo auto-skippea el onboarding.
 *
 * Testeamos:
 *   1. Slide 1 renderiza con titulo esperado.
 *   2. Ultimo slide muestra los 3 CTAs (Crear cuenta, Ya tengo cuenta,
 *      Explorar sin cuenta).
 *   3. Click en "Saltar introduccion" navega al Login.
 */

import { test, expect } from "@playwright/test";

import { vRole } from "../helpers/ui";

test.describe("Onboarding > Welcome tour", () => {
  test("primer slide visible con titulo correcto", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .getByText(/encuentra a tu candidato ideal/i)
        .filter({ visible: true })
    ).toBeVisible({ timeout: 10_000 });

    // Link "Saltar introduccion" visible
    await expect(
      vRole(page, "link", { name: /saltar introducci[oó]n/i })
    ).toBeVisible();
  });

  test("saltar introduccion navega al Login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await vRole(page, "link", { name: /saltar introducci[oó]n/i }).click();

    // Post-skip: Login screen. Uso el textbox "Nombre de usuario" como proxy
    // (el label es explicitamente "Nombre de usuario", no "Email").
    await expect(
      page.getByLabel(/nombre de usuario/i).filter({ visible: true }).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("ultimo slide muestra 3 CTAs finales", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Todos los slides estan en el DOM simultaneamente (ScrollView
    // horizontal), asi que assertions por texto de slides intermedios no
    // sirven para saber si avanzamos. En vez, clickeamos "Siguiente" hasta
    // que desaparezca (isLastSlide=true rompe el conditional render).
    const siguiente = vRole(page, "button", { name: /^siguiente$/i });
    for (let i = 0; i < 6; i++) {
      if (!(await siguiente.isVisible().catch(() => false))) break;
      await siguiente.click();
      // Pequeno wait para dar chance al re-render.
      await page.waitForTimeout(200);
    }

    // Ultimo slide: 3 CTAs
    await expect(
      vRole(page, "button", { name: /^crear cuenta$/i })
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      vRole(page, "link", { name: /^ya tengo cuenta$/i })
    ).toBeVisible();
    await expect(
      vRole(page, "link", { name: /^explorar sin cuenta$/i })
    ).toBeVisible();
  });
});
