/**
 * Helpers de navegacion + acciones comunes en la UI.
 *
 * Se apoyan en accessibilityLabel/aria-label que setea nuestro DS (Button,
 * FormField, Link). Si el DS cambia, aca centralizamos el impacto.
 *
 * NOTA IMPORTANTE sobre react-navigation en web:
 * El Stack.Navigator monta TODOS los screens simultaneamente en el DOM y
 * los oculta con CSS. Esto significa que `getByLabel("Contraseña")` puede
 * matchear el input de Login Y el de Register al mismo tiempo -> "strict
 * mode violation". Solucion: siempre filtrar por visibilidad con .filter({
 * visible: true }).
 *
 * Usa los helpers `vLabel` y `vRole` en los tests para evitar boilerplate.
 */

import type { Locator, Page } from "@playwright/test";
import type { TestUser } from "./users";

/** getByLabel filtrado por visibilidad (esconde screens inactivos). */
export function vLabel(
  page: Page,
  label: string | RegExp,
  options?: { exact?: boolean }
): Locator {
  return page.getByLabel(label, options).filter({ visible: true });
}

/** getByRole filtrado por visibilidad. */
export function vRole(
  page: Page,
  role: Parameters<Page["getByRole"]>[0],
  options?: Parameters<Page["getByRole"]>[1]
): Locator {
  return page.getByRole(role, options).filter({ visible: true });
}

/**
 * Va al home de la app. Si aparece el onboarding de 5 slides (primera visita),
 * lo skipea automaticamente para llegar al Login.
 */
export async function gotoApp(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Si aparece el onboarding, saltarlo. Si no, ya estamos en Login/Home.
  const skipLink = page.getByRole("link", { name: /saltar introducci[oó]n/i });
  if (await skipLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await skipLink.click();
    await skipLink.waitFor({ state: "hidden", timeout: 5_000 });
  }
}

/**
 * Realiza login desde la UI. Asume estar en /Login.
 *
 * Post-login, dismissa automáticamente cualquier coach mark que aparezca.
 * Los tours de coach marks NO se persisten (ver store/coachMarks.ts), asi
 * que cada usuario fresh en tests dispara el tour completo la primera vez
 * que entra al screen destino. En tests eso sólo estorba: el modal bloquea
 * clicks al contenido debajo.
 */
export async function uiLogin(
  page: Page,
  user: { username: string; password: string }
): Promise<void> {
  await vLabel(page, "Nombre de usuario", { exact: true }).fill(user.username);
  await vLabel(page, "Contraseña", { exact: true }).fill(user.password);
  await vRole(page, "button", { name: /iniciar sesi[oó]n/i }).click();
  await dismissCoachMarks(page);
}

/**
 * Realiza registro desde la UI. Asume estar en /Register.
 */
export async function uiRegister(page: Page, user: TestUser): Promise<void> {
  await vLabel(page, "Nombre de usuario", { exact: true }).fill(user.username);
  await vLabel(page, "Email", { exact: true }).fill(user.email);
  await vLabel(page, "Contraseña", { exact: true }).fill(user.password);
  await vRole(page, "button", { name: /registrarme/i }).click();
}

/**
 * Navega a Register desde Login clickeando el link.
 * accessibilityLabel="Ir a registro" (texto visible es "No tengo cuenta — Registrarme").
 */
export async function gotoRegister(page: Page): Promise<void> {
  await vRole(page, "link", { name: /ir a registro/i }).click();
}

/**
 * Navega a PasswordResetRequest desde Login.
 * accessibilityLabel="Recuperar contraseña".
 */
export async function gotoPasswordReset(page: Page): Promise<void> {
  await vRole(page, "link", { name: /recuperar contrase/i }).click();
}

/**
 * Click en el tab "Config" del BottomNav (autenticado).
 * TabBarItem usa accessibilityRole="tab" + accessibilityLabel=label,
 * y el label del APP_TABS es exactamente "Config" (no "Configuración").
 *
 * Defensivo: intenta dismissar coach marks antes por si aparecio uno nuevo
 * al aterrizar en Home (los tours no se persisten entre sesiones).
 */
export async function goToConfigTab(page: Page): Promise<void> {
  // Retry loop porque los coach marks pueden aparecer async post-login
  // y taparse el tab bar. Ver dismissCoachMarks + issue documentado en
  // LEARNINGS.md "Race con coach marks post-login".
  const tab = vRole(page, "tab", { name: "Config" });
  for (let i = 0; i < 5; i++) {
    await dismissCoachMarks(page);
    try {
      await tab.click({ timeout: 3_000 });
      return;
    } catch (e) {
      if (i === 4) throw e;
    }
  }
}

/**
 * Navega a PerfilScreen desde cualquier lugar autenticado:
 * Tab Config -> boton "Editar perfil". Ahí viven los NavRows para cambiar
 * contrasena, eliminar cuenta y cerrar sesion.
 *
 * Dismisses coach marks entre cada navegacion (cada screen puede tener su
 * tour propio la primera vez).
 */
export async function goToPerfil(page: Page): Promise<void> {
  await goToConfigTab(page);
  await dismissCoachMarks(page);
  const editarBtn = vRole(page, "button", { name: "Editar perfil" });
  for (let i = 0; i < 5; i++) {
    await dismissCoachMarks(page);
    try {
      await editarBtn.click({ timeout: 3_000 });
      break;
    } catch (e) {
      if (i === 4) throw e;
    }
  }
  await dismissCoachMarks(page);
}

/**
 * Entra al MainStack en modo invitado desde el Login screen.
 * Link con accessibilityLabel="Probar sin cuenta" (texto visible
 * "Probar sin cuenta →"). Skippea el paso de auth para tests de flows
 * publicos (Noticias, Candidatos, Comparar).
 */
export async function enterGuestMode(page: Page): Promise<void> {
  await vRole(page, "link", { name: /probar sin cuenta/i }).click();
  await dismissCoachMarks(page);
}

/**
 * Navega a NoticiasScreen desde cualquier lugar autenticado o guest.
 * NoticiasScreen es publica (guest ok) y tiene su tab en el BottomNav.
 * TabBarItem usa accessibilityRole="tab" + accessibilityLabel="Noticias".
 *
 * Dismisses coach marks al aterrizar (tourId="noticias" existe).
 *
 * Race condition conocida (autenticado): el coach mark del Home aparece
 * async post-login y puede interceptar el click al tab. Solucion: retry
 * loop con dismiss + click hasta 5 veces.
 */
export async function goToNoticias(page: Page): Promise<void> {
  const tab = vRole(page, "tab", { name: "Noticias" });
  for (let i = 0; i < 5; i++) {
    await dismissCoachMarks(page);
    try {
      await tab.click({ timeout: 3_000 });
      break;
    } catch (e) {
      if (i === 4) throw e;
      // Otro coach mark intercepto o el tab todavia no aparecio; reintenta.
    }
  }
  await dismissCoachMarks(page);
}

/**
 * Cierra cualquier coach mark visible haciendo click en el backdrop
 * (que a su vez dispara skip/next segun sea single o multi-step).
 *
 * No-op si no hay coach mark. Timeout inicial de 3s: los tours aparecen
 * asincronamente cuando la screen termina de montarse, y con backend/UI
 * lentos pueden tardar en llegar. Cada retry adicional usa timeouts cortos.
 */
export async function dismissCoachMarks(page: Page): Promise<void> {
  const backdrop = page.getByLabel("Cerrar coach mark").first();
  const appeared = await backdrop
    .isVisible({ timeout: 3_000 })
    .catch(() => false);
  if (!appeared) return;

  // Puede haber tours multi-step: click hasta que desaparezca (con budget).
  for (let i = 0; i < 8; i++) {
    const stillThere = await backdrop
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (!stillThere) return;
    await backdrop.click({ timeout: 2_000 }).catch(() => {});
  }
}
