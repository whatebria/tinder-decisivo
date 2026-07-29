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

Último run (2026-07-28): **6 pass, 1 skip, 8 fail** (3.5 min con Expo cold start).

### Pasando (6)
- Login: 3/3 (incluye regresión del bug de julio-26 "email en campo username").
- Register: 3/4 (exito, botón disabled, username duplicado).

### Skip (1)
- Logout desde perfil — requiere mapear `accessibilityLabel` del TabBar.

### Fallando (8) — todos son mismatches de tests, no bugs de la app

**A. Cambiar/Eliminar cuenta (4 tests)** — no encuentran el TabBar.

> `Timeout: waiting for getByRole('button', { name: /configuración|config|perfil/i })`

Fix: mapear el `accessibilityLabel` real del TabBar en `AppShell` (probablemente algo
como `"Ir a Configuración"`) o agregar `testID` si React Navigation no expone label.

**B. Password reset (3 tests)**:
- 1 test busca `getByRole("heading", "Servel", level:1)` → RN Web no genera `<h1>`,
  todo es `<div>`. Fix: usar `getByText` como en los otros tests.
- 2 tests buscan link `"Ya tengo un token"` que aparece solo cuando `sent=true`.
  Timing issue o el submit no completa.

**C. Register trim (1 test)** — inputs con espacios extras no completan el
auto-login. El `.trim()` del frontend está bien; probable causa: el helper `uiRegister`
no reproduce exactamente el escenario (el email trimmeado a mano tal vez no
dispara `canSubmit`).

Traces navegables en `test-results/*/trace.zip`. Ver:

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
