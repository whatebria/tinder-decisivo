import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config para Servel E2E.
 *
 * - Base URL: frontend Expo web en :8081.
 * - Backend Django en :8010 (DEBUG=True para leer reset_link en tests).
 * - webServer levanta ambos si no estan vivos (reuseExistingServer=true).
 * - Solo Chromium por ahora. Se agregara Firefox/WebKit cuando el smoke este verde.
 *
 * Correr:
 *   npm test              -> headless, todos los tests
 *   npm run test:headed   -> con browser visible
 *   npm run test:ui       -> UI mode interactivo (recomendado en dev)
 *   npm run test:auth     -> solo tests de auth
 *   npm run test:debug    -> con inspector paso a paso
 */

const FRONTEND_URL = "http://localhost:8081";
const BACKEND_URL = "http://localhost:8010";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // tests crean users en la misma DB SQLite; evitar collision
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // SQLite + throttling del backend -> serial
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000, // 30s por test es generoso; el bottleneck es Expo cold start
  expect: { timeout: 8_000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
    locale: "es-CL",
    timezoneId: "America/Santiago",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Forzar el binario chromium completo (no chrome-headless-shell).
        // Evita tener que descargar el headless-shell aparte en corp networks
        // con proxy lento. Costo: ~5% mas lento por test. Peanuts.
        channel: "chromium",
      },
    },
  ],

  webServer: [
    {
      // Backend Django. Requiere DEBUG=True para exponer reset_link.
      // DRF_THROTTLE_DISABLED=1 desactiva rate limiting (register 10/hour
      // en prod, imposible correr 15 tests de auth).
      name: "backend",
      command:
        'uv run python manage.py runserver 127.0.0.1:8010 --noreload',
      cwd: "../backend",
      url: `${BACKEND_URL}/api/v1/tipos-eleccion/`,
      timeout: 60_000,
      reuseExistingServer: true,
      env: {
        DRF_THROTTLE_DISABLED: "1",
        DEBUG: "1",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Frontend Expo web. Primer boot puede tardar 60s+.
      name: "frontend",
      command: "npx expo start --web --port 8081",
      cwd: "../frontend",
      url: FRONTEND_URL,
      timeout: 180_000,
      reuseExistingServer: true,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
