# Frontend Servel (React Native + Expo + Tamagui)

App movil-web para el matching votante/candidato de Servel. Cross-platform
(iOS / Android / web) desde un solo codebase Expo.

Nombre en curso: **tinder-decisivo** (working title).

## Stack

- **Expo SDK 57** (React Native 0.86, React 19.2)
- **TypeScript** strict
- **Tamagui 2.5** (theming + primitivos, con tokens propios)
- **React Navigation 7** (native stack)
- **Zustand 5** (state management global)
- **@tanstack/react-query 5** (server state + cache)
- **Axios 1.18** (HTTP)
- **Expo SecureStore** (persistencia del token de auth)

## Setup

```bash
# 1. Instalar deps
npm install --legacy-peer-deps

# 2. Levantar el backend (en otra terminal, desde ../backend)
cd ../backend && uv run python manage.py runserver 0.0.0.0:8010

# 3. Regenerar tipos TS del backend (opcional, ya vienen commiteados)
npm run types:gen

# 4. Levantar Expo
npm start
```

Escanea el QR con **Expo Go** en tu telefono, o presiona `a` (Android
emulator), `i` (iOS simulator, solo macOS), `w` (browser).

## Base URL del API

Por default el frontend apunta a **puerto 8010** en local:

- **Android emulator**: `http://10.0.2.2:8010/api/v1`
- **iOS simulator / web**: `http://127.0.0.1:8010/api/v1`
- **Device fisico via Expo Go**: setea la env var con la IP LAN de tu maquina:

  ```bash
  EXPO_PUBLIC_API_BASE=http://192.168.1.42:8010/api/v1 npm start
  ```

Ver `src/api/config.ts` para el detalle.

## Comandos utiles

```bash
npm run typecheck    # tsc --noEmit
npm run types:gen    # regenera src/types/api.ts desde el OpenAPI del backend
npm test             # jest (services/ tienen cobertura, resto pendiente)
npm run test:watch   # jest --watch
npm run test:coverage
npm start            # expo start (interactivo)
npm run android      # abre en Android emulator
npm run ios          # abre en iOS simulator (solo macOS)
npm run web          # abre en el browser
```

## Modos de uso

La app soporta tres estados de auth (`src/store/auth.ts`):

1. **Unauthenticated** — pantalla inicial (Landing / Login / Register).
2. **Guest** — usuario que respondio el cuestionario SIN registrarse. Puede
   ver matches, comparar candidatos y navegar noticias, pero no guarda
   bookmarks ni sincroniza entre dispositivos. `isGuest` NO se persiste
   (a proposito).
3. **Authenticated** — token en SecureStore, features completas (bookmarks,
   perfil territorial, historial de respuestas por eleccion).

## Estructura

```
frontend/
| App.tsx                 Root: ErrorBoundary > QueryClient > Tamagui > Nav
| index.ts                Entry point Expo
| babel.config.js         Babel + tamagui plugin
| tamagui.config.ts       Config de Tamagui (usa tokens de src/theme/)
| schema.yml              OpenAPI del backend (input de types:gen)
| jest.config.js          Config de tests
| AGENTS.md               Reglas para agentes AI que tocan este codebase
+- src/
   +- api/
   |  +- client.ts           Axios + auth interceptor (guard anti-logout-guest)
   |  +- config.ts           Base URL (platform-aware), timeout
   |  +- endpoints.ts        Wrappers tipados de cada endpoint
   |  +- hooks.ts            31 hooks React Query (queries + mutations)
   |  +- queryClient.ts      queryClient + helper `queryKeys` centralizado
   +- components/
   |  +- atoms/              28 primitivos (Button, Badge, Avatar, Chip, ...)
   |  +- molecules/          ~29 combinaciones (NewsCard, Modal, BottomSheet, ...)
   |  +- organisms/          18 bloques complejos (ProfileHero, RankingRow, ...)
   |  +- templates/          2 layouts base
   +- navigation/
   |  +- types.ts            RootStackParamList (typed navigation)
   |  +- AppNavigator.tsx    Stack (auth-aware routing)
   +- screens/               ~15 screens de usuario + catalogo del DS
   |  +- design-system/      Design System catalog navegable (gated __DEV__)
   +- store/                 Zustand stores (auth, cuestionario, theme, ...)
   +- theme/
   |  +- colors.ts           Paleta A azul-verde, escalas 50-900, WCAG AA
   |  +- radii.ts            Tokens rSm..rXl + rFull
   |  +- spacing.ts          Tokens sp1..sp9 (base 4)
   |  +- typography.ts       display/h1..h3/lead/body/small/overline
   |  +- useTheme.ts         Hooks REACTIVOS al store (useThemeColors, ...)
   +- services/              Logica de negocio pura (matching, share, ...)
   +- utils/                 Helpers puros (candidato, noticia, ...)
   +- types/
      +- api.ts              AUTOGENERADO desde OpenAPI - NO EDITAR
```

## Design System

El proyecto tiene un **catalogo navegable** con todos los components, gated
por `__DEV__`. Para entrar: navega a `DesignSystem` desde el stack de dev.
Incluye toolbar, sidebar filtrable, search, snippets copiables y estados
(hover / pressed / disabled / dark) por component.

Toda la UI usa tokens del theme (nunca literales hardcoded). Los helpers
`useThemeColors()`, `useThemeShadows()`, `useIsDark()` son reactivos al
store de theme, asi que dark mode toggle funciona sin remount.

## Contrato con el backend

Los tipos en `src/types/api.ts` estan **autogenerados** desde el schema
OpenAPI del backend via `drf-spectacular`. **Nunca edites ese archivo a
mano.** Si cambias un serializer en el backend, corre:

```bash
npm run types:gen
```

TypeScript te avisa si algun uso queda roto.

## Estado del proyecto

- [x] **Fase 1** — Scaffolding + Login/Register
- [x] **Fase 2** — Onboarding + cuestionario paso-a-paso + submit respuestas
- [x] **Fase 3** — Resultados con radar chart + detalle de candidato
- [x] **Fase 4** — Bookmarks (candidatos, noticias, posturas) + comparador
- [x] **Fase 5** — Multi-eleccion (presidencial, senadores, diputados, alcaldes)
  con hub de Mis Respuestas, filtro territorial (region/comuna) para
  matches locales, y refactor a atomic design con tokens de theme
- [ ] **Post-Fase 5** — refactor de screens grandes, migracion de modales
  legacy a `<Modal>` molecule, expansion de cobertura de tests

Ver `docs/audit-2026-07-26.html` para el reporte de auditoria tecnica mas
reciente (bugs latentes, deuda tecnica, roadmap de refactor priorizado).

## Notas de accesibilidad

Toda la UI apunta a **WCAG 2.2 nivel AA**:

- Contrast ratios documentados en `src/theme/colors.ts`
- 40+ `accessibilityLabel` / `accessibilityRole` / `accessibilityHint`
  distribuidos en atoms, molecules, organisms y screens
- Focus visible en pressables
- Textos jamas con font hardcoded, siempre por token
