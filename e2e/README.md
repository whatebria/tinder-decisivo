# Servel E2E — Playwright

Tests end-to-end para Servel (Tinder Decisivo). Aislados del frontend/backend
para no contaminar sus deps.

## Requisitos

- Backend Django corriendo o disponible en :8010 con `DEBUG=True`.
  El flag `DEBUG=True` es **crítico** para password reset: el backend expone
  `reset_link` en la response, evitando que los tests tengan que leer emails.
- Frontend Expo web disponible en :8081.
- Node 18+.

## Setup (primera vez)

```bash
cd e2e
npm install
npx playwright install chromium
```

Los servers se levantan automáticamente por `playwright.config.ts.webServer`.
Si ya están corriendo, Playwright los reutiliza (`reuseExistingServer: true`).

## Correr tests

```bash
npm test                 # headless, todos los flujos
npm run test:headed      # con browser visible (debug visual)
npm run test:ui          # UI mode interactivo (recomendado en dev)
npm run test:auth        # solo tests de auth
npm run test:debug       # con Playwright inspector
npm run codegen          # grabar acciones en un browser -> genera código
npm run report           # abrir el HTML report del último run
```

## Estructura

```
e2e/
├── playwright.config.ts    # config global (webServer, browsers, timeouts)
├── helpers/
│   ├── users.ts            # factory de test users únicos
│   ├── api.ts              # llamadas directas al backend (setup rápido)
│   └── ui.ts               # locators/acciones comunes (login, register)
└── tests/
    ├── auth-register.spec.ts        # 4 tests
    ├── auth-login.spec.ts           # 4 tests
    ├── auth-password-reset.spec.ts  # 3 tests
    ├── auth-cambiar-password.spec.ts # 2 tests
    └── auth-eliminar-cuenta.spec.ts # 2 tests
```

## Flujos cubiertos

| Flujo | Estado |
|---|---|
| **Auth** (register, login, password reset, cambiar/eliminar cuenta) |  parcial |
| Cuestionario | ⏳ |
| Resultados / Match / Comparar | ⏳ |
| Bookmarks (favoritos + descartados) | ⏳ |
| Noticias | ⏳ |
| Perfil territorial | ⏳ |
| Config / Gestión de elecciones | ⏳ |

## Estado actual del run

Ultimo run (2026-07-29): **13 pass, 2 skip, 0 fail** en ~57s.

### Pasando (13)
- Login: 3/4 (exito, error, regresion "email en campo username").
- Register: 3/4 (exito, boton disabled, username duplicado).
- Cambiar password: 2/2 (Fix A) — cambio exitoso + error con pass actual invalida.
- Eliminar cuenta: 2/2 (Fix A) — palabra magica ELIMINAR + eliminacion completa.
- **Password reset: 3/3 (Fix B aplicado)** — flujo completo, token invalido, boton disabled.

### Skippeado (2) — pendientes

**Fix D — Register trim** (1 test: `auth-register.spec.ts` > `trim de espacios...`)

Timeout esperando que "Crear cuenta" desaparezca. Causa exacta pendiente de debug
con `trace.zip`. Hipotesis: register falla silent (el test no chequea toast de error)
o `UserAttributeSimilarityValidator` de Django rechaza el password (similitud
marginal 0.67 vs threshold 0.7, potencialmente flaky).

**Fix C — Logout** (1 test, `auth-login.spec.ts` > `logout desde perfil...`)

Ahora que existe `goToPerfil(page)`, el fix es click a "Cerrar sesion" (NavRow
en PerfilScreen) + assert de volver al heading "Servel" del Login.

### Fixes aplicados 2026-07-29

**Fix B — Password reset** (`auth-password-reset.spec.ts`):
- Migrados TODOS los `page.getBy*` a `vLabel`/`vRole` de `helpers/ui.ts` que
  filtran por visibilidad. Sin filter, el Stack Navigator monta multiples
  screens con inputs "Email" o "Nueva contrasena" simultaneos — strict-mode
  violation garantizado.
- Assertions de toast usan `getByText(...).filter({ visible: true })` porque
  el toast atom puede tener multiples instancias en el DOM (stack de toasts).
- Heading "Revisa tu email" y "Servel" verificados via `vRole("heading")` con
  `level: 1` — esto ya funciona post Fix 3 del atom `<Heading>`.

**Fix A — Cambiar/Eliminar cuenta**:
1. **Coach mark tour bloqueaba clicks**: los tests hacian click al tab Config pero
   `<CoachMarkTour />` (agregado post-login por otro puppy) interceptaba con un
   backdrop `aria-label="Cerrar coach mark"`. Fix: helper `dismissCoachMarks(page)`
   en `helpers/ui.ts` que cierra el tour defensivamente (no-op si no hay).
   Se llama en `uiLogin`, `goToConfigTab`, y `goToPerfil`.
2. **Tab Config es role="tab", no "button"**: helper `goToConfigTab(page)` usa
   `vRole(page, "tab", { name: "Config" })`.
3. **Cambiar/eliminar cuenta viven en PerfilScreen, no ConfiguracionScreen**:
   helper `goToPerfil(page)` compone `goToConfigTab` + click a "Editar perfil".
4. **Regex del NavRow "Cambiar mi contrasena"**: `/cambiar mi contrase/i` en vez
   de `/cambiar contrase/i` (el prefijo "mi" es parte del label real).
5. **Strict-mode violation en `getByLabel("Contrasena actual")`**: el Stack
   Navigator monta multiples screens; assertion cambiado a
   `toHaveCount(0, {timeout})` con `.filter({ visible: true })`.
6. **Backend bug lateral (fixeado en working tree)**: `DRF_THROTTLE_DISABLED=1`
   vaciaba `DEFAULT_THROTTLE_RATES` pero las views tienen `ScopedRateThrottle`
   hardcodeado > `ImproperlyConfigured: No default throttle rate set for 'register'`.
   Fix en `backend/api/settings.py`: cuando disabled, dejar rates enormes
   (100000/hour) para todos los scopes.

---

Traces navegables en `test-results/*/trace.zip`:

```bash
npx playwright show-trace test-results/<carpeta>/trace.zip
```

## Convenciones

- **Users únicos por test**: `makeTestUser(prefix)` genera `e2e_<timestamp><rand>`.
  Nada de DB reset — cada test se crea su propio user y no colisiona con reruns.
- **Setup rápido vía API**: si el test necesita un user ya autenticado, se crea
  vía `apiRegister()` y luego login vía UI (o `apiLogin()` si solo se necesita
  el token, ej. tests destructivos).
- **Locators por accesibilidad**: `getByLabel`, `getByRole`. Nada de selectores
  CSS frágiles ni test-ids inventados. Esto valida al mismo tiempo que la app
  es a11y-compliant.
- **Serial (workers=1)**: SQLite local + Django DEV server no soporta paralelismo
  bien. Cuando migremos a Postgres se puede subir.

## Debugging

Cuando un test falla, Playwright guarda:
- Screenshot en `test-results/`
- Video de la sesión completa
- Trace navegable — abrir con `npx playwright show-trace <trace.zip>`

Trace viewer es un timeline con DOM snapshots, network requests y screenshots
por cada acción. La forma más rápida de entender un fallo.
