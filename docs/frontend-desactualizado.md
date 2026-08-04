> **DOCUMENTO DESACTUALIZADO** - Foto historica; puede no reflejar el estado actual del codigo. Ver `docs/knowledge-base/FRONTEND_EXHAUSTIVE.md` y `docs/knowledge-base/CODEBASE_MAP.md` para la version actualizada.

# Documentación técnica del Frontend — VotoAFin

> Referencia técnica completa del cliente móvil/web de la app VotoAFin (repo `servel-main`).
> Todo lo descrito aquí se deriva estrictamente del código fuente en `frontend/`.

---

## Tabla de contenidos

1. [Overview](#1-overview)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de directorios](#3-estructura-de-directorios)
4. [Arquitectura de alto nivel](#4-arquitectura-de-alto-nivel)
5. [Entry point: `App.tsx`](#5-entry-point-apptsx)
6. [Navegación](#6-navegación)
7. [Capa API](#7-capa-api)
8. [Stores (Zustand)](#8-stores-zustand)
9. [Theme y design tokens](#9-theme-y-design-tokens)
10. [Capa de dominio](#10-capa-de-dominio)
11. [Services (lógica pura)](#11-services-lógica-pura)
12. [Componentes (Atomic Design)](#12-componentes-atomic-design)
13. [Hooks custom](#13-hooks-custom)
14. [Content (coach marks, welcome tour)](#14-content-coach-marks-welcome-tour)
15. [Screens](#15-screens)
16. [Design System interno](#16-design-system-interno)
17. [Modos de uso: unauth / guest / auth](#17-modos-de-uso-unauth--guest--auth)
18. [Testing](#18-testing)
19. [Convenciones y reglas para IA (AGENTS.md)](#19-convenciones-y-reglas-para-ia-agentsmd)
20. [Drift conocido y áreas no exploradas](#20-drift-conocido-y-áreas-no-exploradas)

---

## 1. Overview

El frontend es una aplicación **Expo / React Native** con soporte simultáneo para
**iOS, Android y Web**. Es el cliente de la API Django REST que vive en `backend/`.
Su función principal es guiar al usuario por un flujo tipo "cuestionario político"
que responde preguntas de la papeleta electoral chilena y le devuelve un ranking de
candidatos ordenado por afinidad (matching).

Soporta tres modos de uso:

* **Unauthenticated**: pantalla de login/registro (o password reset).
* **Guest**: navega sin cuenta, respuestas viven solo en memoria, matching se calcula
  vía endpoint anónimo (`/match-anonimo/`).
* **Authenticated**: token bearer persistido en `SecureStore`, respuestas guardadas
  en el backend, matching persistido y editable.

La aplicación cubre auth, cuestionario, matching, perfil de candidato, comparador,
noticias y home HUB como dashboard central.

Target de accesibilidad: **WCAG 2.2 nivel AA** (regla escrita en `frontend/AGENTS.md` §9).

---

## 2. Stack tecnológico

Fuente: `frontend/package.json`.

### Runtime

* **Expo SDK 57** (`expo@~54.0.13`) — plataforma cross-platform sobre React Native.
* **React 19.2.3** + **React Native 0.86**.
* **TypeScript 6.0.3** (strict, con `types:gen` para regenerar tipos del schema OpenAPI).

### Navegación

* `@react-navigation/native` v7 + `@react-navigation/native-stack` v7.
* `react-native-screens` y `react-native-safe-area-context` como dependencias nativas.

### Data fetching / estado servidor

* **`@tanstack/react-query` v5** — cache, retry, dedup de queries, invalidaciones granulares.
* **`axios` v1.18** — cliente HTTP con interceptores (token bearer, 401 handler).

### Estado cliente

* **`zustand` v5** — 6 stores independientes (auth, cuestionario, theme, electionsPrefs,
  onboarding, coachMarks) + un módulo `secureStorage` compartido.
* **`expo-secure-store` v57** — Keychain iOS / KeyStore Android; wrapper cross-platform
  que en web cae a `localStorage`.

### UI / animaciones / gestos

* `react-native-reanimated` v4 (declarativo, worklets).
* `react-native-gesture-handler` v2.
* `react-native-svg` v15 (radar charts, iconos vectoriales).
* `expo-blur`, `expo-image`, `expo-clipboard`, `expo-image-picker`, `expo-notifications`.

### Testing

* **jest 29** + **jest-expo 54** — runner preconfigurado para RN/Expo.
* `@testing-library/react-native` (implícito por convención en `.test.ts(x)`).

### Scripts declarados

```
start        expo start
android      expo start --android
ios          expo start --ios
web          expo start --web
typecheck    tsc --noEmit
types:gen    openapi-typescript ../backend/openapi.yaml -o src/types/api.ts
test         jest
test:watch   jest --watch
```

---

## 3. Estructura de directorios

```
frontend/
├── App.tsx                    ← root component (providers, hydration)
├── index.ts                   ← Expo entry (registerRootComponent)
├── package.json
├── tsconfig.json
├── jest.config.js
├── schema.yml                 ← OpenAPI schema (source of truth para types)
├── README.md                  ← guía rápida y explicación de fases
├── AGENTS.md                  ← reglas duras para IA / devs
├── assets/                    ← splash, icons, etc. (assets Expo)
├── design-exploration/        ← HTML low-fi / design-system html referencia
└── src/
    ├── api/                   ← cliente HTTP + endpoints + hooks
    │   ├── client.ts
    │   ├── config.ts
    │   ├── endpoints.ts       ← todas las funciones tipadas de la API
    │   ├── hooks.ts           ← React Query wrappers
    │   ├── queryClient.ts     ← config del QueryClient + queryKeys
    │   └── __tests__/         ← tests de client/hooks
    │
    ├── components/            ← Atomic Design
    │   ├── atoms/             ← 28 archivos (Button, Input, Chip, ...)
    │   ├── molecules/         ← 33 archivos (Modal, Toast, FormField, ...)
    │   ├── organisms/         ← 17 archivos (TopNav, Comparator, ...)
    │   ├── templates/         ← 2 archivos (AppShell, ScreenChrome)
    │   └── index.ts           ← barrel raíz
    │
    ├── content/               ← copy estático largo (i18n embryo)
    │   ├── coachMarks.ts      ← 8 tours con steps
    │   └── welcomeTour.ts     ← slides del onboarding
    │
    ├── domain/                ← lógica pura de dominio, sin React
    │   ├── eleccion.ts
    │   ├── eleccion.test.ts
    │   ├── dimensiones.ts
    │   └── dimensiones.test.ts
    │
    ├── hooks/                 ← hooks compartidos (no de API)
    │   ├── blurActiveElement.ts       ← helper puro para blur en web
    │   ├── useBlurBeforeClose.ts
    │   ├── useBlurringPress.ts        ← wrap onPress con blur automatico
    │   ├── useCoachMarkTour.ts
    │   ├── useDimensionColors.ts
    │   └── useModalDimensions.ts
    │
    ├── utils/                 ← utilidades globales (no React)
    │   └── installAriaHiddenFocusGuard.ts  ← monkey-patch setAttribute (web)
    │
    ├── navigation/
    │   ├── AppNavigator.tsx   ← stacks + swap auth/main
    │   ├── tabs.ts            ← configuración de las 5 tabs
    │   └── types.ts           ← RootStackParamList tipado
    │
    ├── screens/               ← 18 pantallas + subfolder design-system
    │   ├── HomeScreen.tsx
    │   ├── CuestionarioScreen.tsx
    │   ├── SubmitDoneScreen.tsx
    │   ├── ResultadosScreen.tsx
    │   ├── DetalleCandidatoScreen.tsx
    │   ├── MisGuardadosScreen.tsx
    │   ├── MisRespuestasScreen.tsx
    │   ├── NoticiasScreen.tsx
    │   ├── CandidatosScreen.tsx
    │   ├── CompararScreen.tsx
    │   ├── PerfilScreen.tsx
    │   ├── ConfiguracionScreen.tsx
    │   ├── GestionEleccionesScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── PasswordResetRequestScreen.tsx
    │   ├── PasswordResetConfirmScreen.tsx
    │   └── design-system/
    │       ├── DesignSystemScreen.tsx    ← catálogo interno DEV-only
    │       ├── catalog/
    │       └── showcase/
    │
    ├── services/              ← lógica de negocio pura
    │   ├── comparar.ts (+ test)
    │   ├── cuestionario.ts (+ test)
    │   ├── matching.ts (+ test)
    │   └── share.ts (+ test)
    │
    ├── store/                 ← estado cliente (Zustand)
    │   ├── auth.ts
    │   ├── coachMarks.ts
    │   ├── cuestionario.ts
    │   ├── electionsPrefs.ts
    │   ├── onboarding.ts
    │   ├── secureStorage.ts   ← wrapper cross-platform (Keychain / localStorage)
    │   └── theme.ts
    │
    ├── theme/                 ← design tokens (single source of truth)
    │   ├── colors.ts
    │   ├── spacing.ts
    │   ├── typography.ts
    │   ├── radii.ts
    │   ├── shadows.ts
    │   ├── motion.ts
    │   ├── layout.ts
    │   ├── useTheme.ts        ← hooks reactivos al modo light/dark
    │   └── index.ts           ← barrel
    │
    ├── types/
    │   └── api.ts             ← autogenerado con openapi-typescript (~77KB)
    │
    └── utils/
        ├── candidato.ts
        ├── noticia.ts
        └── text.ts            ← sanitizeSnippet y helpers de string
```

---

## 4. Arquitectura de alto nivel

Diagrama de las capas y el flujo de datos:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                    │
│  ErrorBoundary > QueryClientProvider > SafeAreaProvider > ToastProv.    │
│                   > NavigationContainer > AppNavigator                  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
        ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼────────┐
        │ Auth Stack    │  │  Main Stack   │  │  Onboarding    │
        │ Login/Reg/... │  │ Home/Cuest/...│  │  Splash + tour │
        └───────────────┘  └───────┬───────┘  └────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
             ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
             │  Screens    ││   Stores    ││   Hooks     │
             │ (18 total)  ││  (Zustand)  ││ (custom +   │
             │             ││             ││  React Q)   │
             └──────┬──────┘└──────┬──────┘└──────┬──────┘
                    │              │              │
                    │              │              │
             ┌──────▼──────────────▼──────────────▼──────┐
             │            Components (Atomic DS)          │
             │  atoms  →  molecules  →  organisms  →      │
             │           templates (AppShell/ScreenChrome)│
             └──────┬─────────────────────────────────────┘
                    │
             ┌──────▼──────┐  ┌──────────────┐  ┌────────┐
             │  Services   │  │    Theme     │  │ Domain │
             │ (puros)     │  │  (tokens)    │  │ (puros)│
             └──────┬──────┘  └──────────────┘  └────────┘
                    │
             ┌──────▼──────┐
             │   API layer │
             │ (axios +    │
             │  React Q)   │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │  Backend    │  Django REST @ /api/v1/...
             │  (fuera de  │
             │  este doc)  │
             └─────────────┘
```

**Reglas de dependencia** (respetadas en todo el código, no hay violaciones a la vista):

* `theme/`, `domain/`, `services/` → **no** importan de `components/`, `screens/`, `api/` ni `store/`.
* `components/atoms/` → sólo importan de `theme/` y RN.
* `components/molecules/` → pueden importar atoms + theme.
* `components/organisms/` → pueden importar molecules + atoms + theme + domain/services (para lógica pura).
* `components/templates/` → importan organisms.
* `screens/` → pueden importar de todo lo anterior + navigation + api/hooks + stores.
* `api/hooks.ts` → puede importar de `api/endpoints.ts`, `api/queryClient.ts` y `store/auth.ts` (para el flag `isAuthenticated`).

---

## 5. Entry point: `App.tsx`

Es el nodo raíz del bundle. Responsabilidades:

1. **Composición de providers** (orden crítico):
   ```
   ErrorBoundary
     └── QueryClientProvider
           └── SafeAreaProvider
                 └── ToastProvider
                       └── NavigationContainer
                             └── AppNavigator
   ```

2. **Hidratación de stores** (en `useEffect` al montar):
   * `useAuthStore.hydrate()` — lee token + userId + email de `SecureStore`.
   * `useOnboardingStore.hydrate()` — flag `hasSeen`.
   * `useElectionsPrefsStore.hydrate()` — set de tipos activos.
   * `useThemeStore.hydrate()` — modo persistido (light/dark/system).

   Mientras alguno de los tres primeros (`isHydrated === false`) no complete, renderiza un
   `Spinner` a pantalla completa. El theme se hidrata en paralelo, pero no bloquea render
   (arranca en modo "system" por default).

3. **Coach marks reset por identidad**: `useEffect` observa `[authIdentity, isGuest]` y
   ejecuta `useCoachMarksStore.resetAll()` cuando la identidad efectiva cambia
   (logout, login, entrar como invitado). Así cada sesión "nueva" ve los tours desde cero.

4. **Web dark-mode sync**: en `Platform.OS === "web"`, sincroniza el `background-color`
   del `<body>` y `<html>` con el color efectivo del theme. Evita el flash blanco
   al entrar en dark mode y respeta el modo "system".

5. **`index.ts`** solo hace `registerRootComponent(App)` — patrón estándar de Expo.

---

## 6. Navegación

### 6.1. Estructura de stacks

`src/navigation/AppNavigator.tsx` decide qué stack montar según el estado de auth y onboarding:

```
                        ┌────────────────────────────┐
                        │ AppNavigator (Root)        │
                        │  ┌──────────────────────┐  │
                        │  │ isAuthenticated ||   │  │
                        │  │ isGuest             │  │
                        │  └──────────┬───────────┘  │
                        │             │              │
                        │        ┌────┴─────┐        │
                        │        │          │        │
                        │      true       false      │
                        │        │          │        │
                        │  ┌─────▼─────┐  ┌─▼──────┐ │
                        │  │Main Stack │  │Show    │ │
                        │  │           │  │Onb.?   │ │
                        │  └───────────┘  └─┬──────┘ │
                        │                   │        │
                        │              ┌────┴─────┐  │
                        │              │hasSeen?  │  │
                        │              └────┬─────┘  │
                        │                   │        │
                        │              ┌────┴─────┐  │
                        │              │          │  │
                        │           false      true  │
                        │              │          │  │
                        │        ┌─────▼──┐  ┌────▼──┐
                        │        │Onboard │  │Auth   │
                        │        │Screen  │  │Stack  │
                        │        └────────┘  └───────┘
                        └────────────────────────────┘
```

### 6.2. Screens registradas en el Main Stack

Definidas en `RootStackParamList` (`navigation/types.ts`):

| Screen | Params | Nota |
|---|---|---|
| `Home` | `undefined` | Home HUB (dashboard central) |
| `Cuestionario` | `undefined` | Vive con el tipo seleccionado en el store |
| `SubmitDone` | `{ mode?: "base" \| "eleccion" }` | Post-submit celebración |
| `Resultados` | `undefined` | Ranking del último tipo del store |
| `DetalleCandidato` | `{ candidatoId, breakdown, matchPct, confianza }` | Perfil de un candidato |
| `MisGuardados` | `undefined` | Tabs favoritos / posturas / noticias guardadas |
| `MisRespuestas` | `undefined` | Hub multi-tipo, respuestas agrupadas por eje |
| `Comparar` | `undefined` | Comparador de 2 candidatos |
| `Noticias` | `undefined` | Feed global con filtros |
| `Candidatos` | `undefined` | Listado con búsqueda |
| `Perfil` | `undefined` | Perfil del usuario |
| `Configuracion` | `undefined` | Preferencias (theme, ayuda, logout) |
| `GestionElecciones` | `undefined` | Activar/desactivar tipos de elección |
| `DesignSystem` | `undefined` | **DEV-only** — se registra solo si `__DEV__` |

### 6.3. Auth Stack

Ordena Register-first cuando `pendingAuthTarget === "Register"` (viene del onboarding),
si no ordena Login-first. Screens: `Login`, `Register`, `PasswordResetRequest`,
`PasswordResetConfirm`.

### 6.4. Tabs (`navigation/tabs.ts`)

Cinco tabs fijos compartidos por `BottomNav` (mobile, `<900px`) y `Sidebar` (`>=900px`):

```
┌───────┬───────────┬─────────┬──────────┬────────┐
│ home  │ candidatos│ comparar│ noticias │ config │
└───────┴───────────┴─────────┴──────────┴────────┘
```

El template `AppShell` decide cuál renderizar según `useWindowDimensions().width`.
Breakpoint expuesto como constante `SIDEBAR_BREAKPOINT = 900`.

---

## 7. Capa API

### 7.1. `api/config.ts`

Base URL platform-aware:

| Platform | Default |
|---|---|
| Android | `http://10.0.2.2:8010/api/v1` (10.0.2.2 = alias del host en emulador) |
| iOS | `http://127.0.0.1:8010/api/v1` |
| Web / default | `http://127.0.0.1:8010/api/v1` |

Overridable con `process.env.EXPO_PUBLIC_API_BASE`.
Timeout: `10_000 ms`.
`ADMIN_URL` se deriva stripping del sufijo `/api/vN/` y agregando `/admin/`.

### 7.2. `api/client.ts`

Instancia axios única. Dos interceptores:

* **Request**: inyecta `Authorization: Token <token>` si `useAuthStore.getState().token`
  existe.
* **Response**: en 401, ejecuta `logout()` **sólo si había token** (guard defensivo
  para no romper el modo guest). Re-throw el error.

Expone `getErrorMessage(err)` — normaliza el shape de errores DRF (`{detail}`,
`{field: [msg]}`, `{non_field_errors: [msg]}`) a un `string` para toasts.

### 7.3. `api/queryClient.ts`

QueryClient con defaults:

```ts
{
  queries: {
    staleTime: 60_000,           // 60s
    retry: 1,
    refetchOnWindowFocus: false, // molesta en desktop
  },
  mutations: { retry: 0 },
}
```

**`queryKeys` centralizado** — objeto helper con todos los keys namespaceados. Uso:

```ts
queryKeys.tiposEleccion               // ["tipos-eleccion"]
queryKeys.preguntas(tipoId)           // ["preguntas", tipoId]
queryKeys.matches(tipoId)             // ["matches", tipoId]
queryKeys.matchesAll                  // ["matches"] — para invalidar por prefix
queryKeys.miProgreso                  // ["mi-progreso"]
queryKeys.perfil                      // ["perfil"]
queryKeys.regiones                    // ["regiones"]
queryKeys.comunas(regionId, q)        // ["comunas", regionId, q]
queryKeys.candidatos                  // ["candidatos"]
queryKeys.candidato(id)               // ["candidatos", id]
queryKeys.noticiasFeed(filters)       // ["noticias", filters]
queryKeys.noticiasCandidato(id)       // ["noticias", "candidato", id]
queryKeys.matchDetalle(id)            // ["match-detalle", id]
queryKeys.matchDetalleAll             // ["match-detalle"]
queryKeys.posturas(candId, tipoId)    // ["posturas", candId, tipoId]
queryKeys.favoritos                   // ["favoritos"]
queryKeys.descartados                 // ["descartados"]
queryKeys.noticiasBookmarks           // ["noticias-bookmarks"]
queryKeys.posturasBookmarks           // ["posturas-bookmarks"]
queryKeys.misRespuestas(tipoId)       // ["mis-respuestas", tipoId]
queryKeys.misRespuestasAll            // ["mis-respuestas"]
```

Regla escrita en `AGENTS.md`: **nunca construir keys inline** en un `useQuery`;
siempre pasar por `queryKeys.X`. Así cualquier refactor de nombre queda en un solo lugar.

### 7.4. `api/endpoints.ts` — funciones tipadas

Tipos derivados de `src/types/api.ts` (autogenerado desde OpenAPI).
Aliases exportados:

```
Candidato, TipoEleccion, Pregunta, OpcionRespuesta, MatchResult,
MiProgresoItem, MiProgresoTopMatch, Noticia, EjeTematico,
CandidatoFavorito, CandidatoDescartado, NoticiaBookmark, PosturaBookmark,
PerfilContadores, Perfil, ComunaInline, PosturaCandidatoDetalle,
OpcionSimple, MiRespuesta
```

Además define localmente (no vienen del schema o sufren drift):

* `LoginResponse` `{token, user_id, email}` — el schema declara solo `{token}`;
  el backend responde los 3 pero no está anotado con `@extend_schema`.
* `Region` — endpoint `/regiones/` no incluido en drf-spectacular.
* `BreakdownPorEje` — el schema lo declara `unknown` (JSONField); se tipa acá.
* `MatchDetalle`, `MatchDetalleItem`, `EditarRespuestaResponse`,
  `ReiniciarCuestionarioResponse`, `PasswordResetRequestResponse`,
  `NoticiaFeedFilters`, `AnonRespuestaInput`, `RespuestaInput`, `RegisterInput`,
  `RegisterResponse`, `LoginInput`.

Todos los endpoints (agrupados por área):

**Auth**
```
POST   /register/               → register(input)
POST   /login/                  → login(input)
POST   /password-reset/request/ → requestPasswordReset(email)
POST   /password-reset/confirm/ → confirmPasswordReset(token, newPassword)
```

**Catálogos**
```
GET    /tipos-eleccion/         → listTiposEleccion()
GET    /candidatos/             → listCandidatos()
GET    /regiones/               → listRegiones()
GET    /comunas/?region_id&q    → listComunas(regionId?, q?)
```

**Cuestionario**
```
GET    /preguntas/?tipo_eleccion_id → preguntasPendientes(tipoEleccionId)
POST   /respuestas/                 → submitRespuestas(RespuestaInput[])
GET    /respuestas/mias/?tipo_eleccion_id → listMisRespuestas(tipoId)
PATCH  /respuestas/mias/{id}/       → updateRespuesta(id, opcionId, peso)
POST   /respuestas/reiniciar/       → reiniciarCuestionario(tipoId)
```

**Matching**
```
POST   /match-candidatos/           → matchCandidatos(tipoEleccionId)
POST   /match-anonimo/              → matchAnonimo(tipoId, respuestas)
GET    /candidatos/{id}/match-detalle/ → getMatchDetalle(candidatoId)
GET    /mi-progreso/                → getMiProgreso()  ← nuevo (refactor Home HUB)
```

**Contenido**
```
GET    /candidatos/{id}/posturas/?tipo_eleccion_id → listPosturasCandidato(id, tipoId?)
GET    /candidatos/{id}/noticias/  → noticiasPorCandidato(id)
GET    /noticias/?candidato_id&fuente&dias&q → listNoticias(filters)  [paginado, results extraído]
```

**Perfil**
```
GET    /perfil/                     → getPerfil()
PATCH  /perfil/comuna/              → actualizarComuna(comunaId)
POST   /perfil/cambiar-password/    → cambiarPassword(current, new)
DELETE /perfil/                     → eliminarCuenta(password)
```

**Bookmarks**
```
GET    /candidatos-favoritos/       → listFavoritos()
POST   /candidatos-favoritos/       → addFavorito(candidatoId)
DELETE /candidatos-favoritos/{id}/  → deleteFavorito(id)
GET    /descartados/                → listDescartados()
POST   /descartados/                → addDescartado(id)
DELETE /descartados/{id}/           → deleteDescartado(id)
GET    /noticias-guardadas/         → listNoticiasBookmarks()
POST   /noticias-guardadas/         → addNoticiaBookmark(noticiaId)
DELETE /noticias-guardadas/{id}/    → deleteNoticiaBookmark(id)
GET    /posturas-guardadas/         → listPosturasBookmarks()
POST   /posturas-guardadas/         → addPosturaBookmark(id)
DELETE /posturas-guardadas/{id}/    → deletePosturaBookmark(id)
```

**Helpers no-HTTP declarados en el mismo archivo:**

* `breakdownToChartData(breakdown)` — transforma `BreakdownPorEje` (mapa `eje → {porcentaje, preguntas}`)
  al shape que espera `RadarChart` (mapa `eje → porcentaje`).

### 7.5. `api/hooks.ts` — React Query wrappers

Un hook por cada GET. Los POSTs con side-effects complejos (submit del cuestionario,
login) siguen viviendo en stores; los POSTs "simples" (toggle bookmark) usan `useMutation`.

**Convenciones**:

* Todos los hooks con auth-required declaran `enabled: isAuth` para no disparar 401 en
  modo guest.
* `staleTime: 24h` para catálogos muy estables (`useRegiones`, `useComunas`).
* `staleTime: 60_000` para datos que cambian de vez en cuando (`useMisElecciones`,
  `useMatchesQuery`, `useMatchDetalle`, `useNoticiasFeed`).
* `retry: 0` cuando un 400 no se resuelve reintentando (ej. `useMatchesQuery`
  falla con "no respondiste preguntas").

**Hooks expuestos**:

```ts
useTiposEleccion()           // filtra es_base=true (transversales, sin candidatos)
usePreguntas(tipoId)
useCandidatos()
useCandidato(id)             // reusa cache de useCandidatos si está lleno
useNoticiasCandidato(id)     // retry: 0 (empty state legítimo)
useMatchCandidatos()         // mutation POST, invalida miProgreso, alimenta matches cache
useMatchesQuery(tipoId)      // GET cacheado, enabled solo si isAuth
useMatchAnonimo()            // mutation para guests
useMisElecciones()           // GET /mi-progreso/ — usada por HomeScreen
useRequestPasswordReset()
useConfirmPasswordReset()
useReiniciarCuestionario()   // onSuccess: invalidateQueries() (nuke)
useMisRespuestas(tipoId)
useMisRespuestasMultiple(tipoIds[])  // useQueries paralelo
useUpdateRespuesta()         // invalida misRespuestasAll + matchesAll + miProgreso
useNoticiasFeed(filters)
useMatchDetalle(candidatoId)
usePosturasCandidato(candId, tipoId?)
usePerfil()
useCambiarPassword()
useEliminarCuenta()
useRegiones()                // staleTime 24h
useComunas(regionId?, q?)    // staleTime 24h, enabled si hay regionId
useActualizarComuna()        // invalida perfil + matches + matchDetalle + miProgreso
useFavoritos()
useToggleFavorito()          // idempotente: consulta cache y decide add/delete
useDescartados()
useToggleDescartado()
useNoticiasBookmarks()
useToggleNoticiaBookmark()
usePosturasBookmarks()
useTogglePosturaBookmark()
```

**Patrón toggle idempotente** (usado 4 veces para bookmarks):

```ts
mutationFn: async (candidatoId) => {
  const list = qc.getQueryData<Favorito[]>(queryKeys.favoritos) ?? [];
  const existing = list.find(f => f.candidato === candidatoId);
  if (existing) await deleteFavorito(existing.id);
  else await addFavorito(candidatoId);
}
```

Esto evita callsites duplicados en cada botón; con un solo `mutate(id)` se agrega o quita.

---

## 8. Stores (Zustand)

Ubicación: `src/store/`. Cada uno es independiente, con su propia hidratación asíncrona
si aplica. La hidratación se dispara desde `App.tsx` al montar.

### 8.1. `secureStorage.ts` — wrapper cross-platform

API: `{ getItem, setItem, removeItem }`. Async en todas las plataformas.

* **iOS/Android**: `expo-secure-store` (Keychain / KeyStore encriptado).
* **Web**: `globalThis.localStorage` con try/catch defensivo.

Comentario del código: en producción web habría que migrar a cookies httpOnly desde
el backend, pero para MVP alcanza.

### 8.2. `auth.ts`

Tres estados posibles:

| Estado | `token` | `isGuest` | Comportamiento |
|---|---|---|---|
| Unauthenticated | `null` | `false` | Aparece pantalla de login |
| Guest | `null` | `true` | Navega sin cuenta, read-only |
| Authenticated | `string` | `false` | Acceso completo |

`isGuest` **no se persiste** deliberadamente — al reiniciar la app el user vuelve a login.
El guest es efímero por diseño.

Keys en SecureStore: `servel_auth_token`, `servel_user_id`, `servel_email`.

API:
```
hydrate()                                 lee token+userId+email
setSession(token, userId, email)          persiste y sale de guest mode
logout()                                  borra los 3 keys
enterGuestMode() / exitGuestMode()        toggle in-memory
```

### 8.3. `cuestionario.ts`

Estado del cuestionario **en curso** para un tipo de elección:

```
tipoEleccionId: number | null
preguntas: Pregunta[]
currentIndex: number
respuestas: Record<preguntaId, { preguntaId, opcionElegidaId, peso }>
loading: submitting: booleans
```

`peso` es un valor `0 | 1 | 2 | 3` (No me importa / Poco / Medio / Mucho).
`DEFAULT_PESO = 1` en el store (nota: en `services/cuestionario.ts` el default para nuevas
respuestas UI es `2` — leve inconsistencia, ver §20).

Métodos:
```
loadForTipoEleccion(tipoId)   fetch preguntas + reset state
setTipoEleccion(tipoId)       solo setea el id (para ir directo a Resultados)
setRespuesta(preguntaId, opcionId, peso?)
setPeso(preguntaId, peso)
next() / prev() / reset()
submit({skipServer?})         guest mode: skipServer=true → no persiste
getRespuestasParaAnonimo()    shape del /match-anonimo/
```

### 8.4. `theme.ts`

Modo `light | dark | system`. Persistido en `secureStorage` con key `servel_theme_mode`.
Default: `system` (respeta OS).

`effective: "light" | "dark"` — resuelto (nunca "system"). Los consumidores leen `effective`.
Se suscribe a `Appearance.addChangeListener` para que el modo "system" reaccione en vivo al
cambio del OS.

### 8.5. `electionsPrefs.ts`

Set de tipos de elección "activados" por el usuario (client-side, backend no lo modela).
Persistido con key `tinder_decisivo_active_elections`.

* `activeIds: null` → aún no configurado, la UI trata **todos** como activos.
* `activeIds: number[]` → solo esos tipos aparecen en el Home.

API: `hydrate`, `toggle(tipoId, allIds)`, `activate`, `deactivate`, `reset`.

Helper puro exportado:
```ts
partitionTipos<T>(tipos, activeIds) → { activas: T[], disponibles: T[] }
```
Usado por `HomeScreen` y `GestionEleccionesScreen`.

### 8.6. `onboarding.ts`

* `hasSeen: boolean` — persistido, key `servel_onboarding_seen`. Los slides se ven una vez
  por device.
* `pendingAuthTarget: "Login" | "Register" | null` — **transient**, sobrevive al swap de
  stacks pero se pierde al reload. Permite que "Crear cuenta" desde el onboarding aterrice
  en Register en vez de Login.
* `consumePendingAuthTarget()` — devuelve el valor actual y lo resetea.

### 8.7. `coachMarks.ts`

Registra qué tours ya vio el usuario **en la sesión actual**. **No se persiste** a propósito:
al reiniciar el proceso o cambiar de identidad los tours vuelven a mostrarse.

```
seen: Partial<Record<TourId, true>>
hasSeen(tourId)
markSeen(tourId)
resetAll()   → llamado desde App.tsx al cambiar identidad, y desde Config→Ayuda
```

---

## 9. Theme y design tokens

Paleta A del design system (referencia visual en `frontend/design-exploration/design-system.html`).
Los tokens son **valores literales**; los componentes están prohibidos de usar strings de color
inline (regla AGENTS.md §2).

### 9.1. `colors.ts`

Estructura light + dark, con tres grupos:

* **Semánticos** (`bg, card, accent, primary, text, border, success, warning, danger, info, ...`).
* **Grays** (`gray50` → `gray900`).
* **Tints** (`primary50..900, secondary, success, warning, danger, info` — 6 familias × 10 stops).

Contrastes verificados en el comment del archivo:

```
primary sobre bg:       5.5:1  (AA)
text sobre bg:          14.2:1 (AAA)
textSecondary sobre bg: 6.1:1  (AA)
success sobre bg:       3.4:1  (AA para texto grande / UI)
```

Colores dark: se aclaran los semánticos brand (`primary #2E5F7E → #7BB5D4`) y se invierten
los grays (`gray50` pasa a ser el más oscuro). Los tints **no** se invierten (son absolutos).

### 9.2. `spacing.ts`

Escala base 4px:
```
sp1=4  sp2=8  sp3=12  sp4=16  sp5=20  sp6=24  sp7=32  sp8=40  sp9=56
```

### 9.3. `typography.ts`

System font stack (cero dependencias externas). Line-height 1.65 en `body` para lectura larga.

```
display   34 / 700 / 1.3
h1        28 / 700 / 1.3
h2        24 / 600 / 1.3
h3        20 / 600 / 1.4
lead      18 / 500 / 1.5
body      16 / 400 / 1.65
small     14 / 400 / 1.5
overline  12 / 400 / 1.5 + uppercase + letterSpacing 0.96
```

### 9.4. `radii.ts`

```
rSm=6  rMd=10  rLg=14  rXl=20  rFull=9999
```

### 9.5. `shadows.ts`

Tres niveles: `shSm, shMd, shLg`. Formato adaptativo:

* **Native**: `shadowColor + shadowOffset + shadowOpacity + shadowRadius + elevation`.
* **Web**: `boxShadow` CSS (los `shadow*` props están deprecados en RN Web).

`shadowsDark` mismos niveles pero con `color: #000` y opacidades mayores (`0.3/0.4/0.5`)
para compensar el fondo oscuro.

Función interna `buildShadow(spec)` usa `Platform.select` para devolver el shape correcto.
Convierte hex+opacity → rgba con `hexToRgba` local.

### 9.6. `motion.ts`

```
durFast = 120ms   durBase = 180ms   durSlow = 320ms
easeBezier = [0.4, 0, 0.2, 1]      ← Material standard
```

### 9.7. `layout.ts`

Tokens de overlays flotantes (modal / bottom sheet), consumidos por `useModalDimensions()`:

```ts
modalLayout = {
  maxWidth: 480,           // patrón industry-standard para dialogs
  maxHeightRatio: 0.9,     // deja ~5% de aire arriba y abajo
  maxHeightAbsolute: 720,  // cap para desktop
}
sheetLayout = {
  maxHeightRatio: 0.85,    // bottom sheets dejan más aire arriba
}
```

### 9.8. `useTheme.ts` — hooks reactivos

Los `import { colors }` a nivel módulo capturan el theme light UNA vez al bundling.
Para que un componente reaccione al cambio de modo:

```ts
const c = useThemeColors();     // Record<ColorKey, string> del theme activo
const s = useThemeShadows();    // shadows con opacidad ajustada
const isDark = useIsDark();     // boolean
```

Todos internamente hacen `useThemeStore(s => s.effective)`, así los componentes se
re-renderean automáticamente al toggle.

---

## 10. Capa de dominio

Funciones puras, sin React, sin API, sin store. 100% testeables. Live en `src/domain/`.

### 10.1. `eleccion.ts`

Reglas de negocio del cuestionario y cuenta regresiva.

```ts
type EleccionEstado = "sin_empezar" | "en_curso" | "completa";

deriveEleccionEstado({respondidas, total}) → EleccionEstado
formatProgresoLabel(respondidas, total)     → "6 de 12 preguntas"
computeProgresoRatio(respondidas, total)    → [0, 1]
computeDiasRestantes(fechaIso, now?)        → number | null
formatDiasRestantesChip(fechaIso, now?)     → "42d" | "hoy" | "cerrada" | null
```

Notas del código:

* `completa` se calcula con `>=` (defensivo ante drift backend/frontend).
* `formatProgresoLabel` clampa `respondidas` a `[0, total]` para no mostrar "13 de 12".
* `now` inyectable en las funciones de cuenta regresiva → tests puros sin mockear `Date.now`.

Cobertura: `eleccion.test.ts` con 21 tests.

### 10.2. `dimensiones.ts`

Catálogo de las 5 dimensiones temáticas del dominio:

```
economico     $   teal-700 (bg chip) / teal-300 (dark text)
social        *   amber-800 (light) / amber-300 (dark)
cultural      ~   violet-600 / violet-300
ambiental     ^   green-800 / green-300
institucional #   blue-800 / blue-300
```

Cada dimensión tiene `{key, label, icon, badge, text: {light, dark}, border: {light, dark}}`.

Por qué **no** viven en `theme/colors.ts`: son tokens de **dominio** (semánticamente "verde = ambiental"),
no de UI. Se mantienen igual entre modos, solo se ajusta luminancia del text/border para cumplir contraste.

API:
```
getDimension(key)                → definición completa
getDimensionColors(key, isDark) → {badge, text, border} resolvidos
```

Test `dimensiones.test.ts`: verifica que cada color de texto/border cumple ratio ≥ 4.5:1 sobre
`gray100` del theme correspondiente (WCAG AA texto normal).

---

## 11. Services (lógica pura)

Ubicación: `src/services/`. Sin React, sin store, sin API — puro transform de data.
Todos con test suite gemela.

### 11.1. `cuestionario.ts`

```ts
type PesoValue = 0 | 1 | 2 | 3;

PESOS = [                          // catálogo de opciones para el selector
  {value: 0, label: "No me importa"},
  {value: 1, label: "Poco"},
  {value: 2, label: "Medio"},
  {value: 3, label: "Mucho"},
]
DEFAULT_PESO = 2                    // ← ojo: 2 acá vs 1 en el store

separarOpciones(opciones) → {regulares, noSe}    // "No sé" tiene tratamiento aparte
debeMostrarPeso(opciones, opcionId) → boolean    // no se muestra si eligió "No sé"
calcularProgreso(currentIndex, total) → 0-100
esUltimaPregunta(i, total) / esPrimeraPregunta(i)
puedeEnviar(preguntas, respuestas) → boolean     // todas deben estar respondidas
```

### 11.2. `matching.ts`

```ts
type MatchTier = "alto" | "medio" | "bajo";
TIER_THRESHOLDS = {alto: 75, medio: 50}          // <50 → bajo

getMatchTier(pct)                    → tier
getMatchColor(pct, palette?)         → hex (default light palette)
formatMatchPercentage(pct)           → "68%"
sortByMatchDesc(results)             → sorted (defensivo, backend ya sortea)

getConfianzaBadge(confianza, palette?) → {label, color}
  ALTA      → "Alta confianza"        (success)
  MEDIA     → "Confianza media"       (warning)
  TENTATIVA → "Confianza tentativa"   (danger)
```

La paleta es parámetro opcional para permitir que las UIs reactivas pasen `useThemeColors()`
en vez del light default.

### 11.3. `comparar.ts`

Compara posturas de dos candidatos en el comparador side-by-side.

```ts
type NivelCoincidencia = "identica" | "cercana" | "opuesta" | "solo_uno" | "ninguno";

compararPosturas(posturasA, posturasB) → GrupoComparacion[]
  agrupa por eje temático
  ordena items por pregunta_orden

calcularResumen(grupos) → {
  total, identicas, cercanas, opuestas, soloUno, ninguno,
  porcentajeCoincidencia  // (identica + cercana) / (identica + cercana + opuesta)
}
```

Reglas de nivel (basado en `Math.abs(a.valor - b.valor)` de la escala Likert 1..5):

* `0` → `identica`
* `1` → `cercana`
* `2` → `cercana` (tibio pero cercano)
* `≥3` → `opuesta`
* Uno vacío → `solo_uno`
* Ambos vacíos → `ninguno`

### 11.4. `share.ts`

Arma el texto para compartir top matches + wrappers de plataforma.

```ts
APP_URL = "https://VotoAFin.cl"    // constante de módulo
TOP_N = 5                                  // matches incluidos

buildShareText({tipoNombre, matches}) → string   // formato WhatsApp/mail-friendly
fromMatchResults(matches) → ShareableMatch[]     // adapter del MatchResult del API

canShareNative()                     → boolean   // navigator.share existe
shareNative(text, title?)            → Promise<boolean>
copyToClipboard(text)                → Promise<boolean>
```

Formato del texto (deliberadamente sin markdown, sin emojis):
```
Mis matches en VotoAFin - Presidencial 2025:

1. Ana Perez (Partido A) - 75%
2. Bea Lopez (Partido B) - 68%
3. Carla Rios (Partido C) - 52%

Encuentra tu match en https://VotoAFin.cl
```

---

## 12. Componentes (Atomic Design)

Barrel raíz: `src/components/index.ts` re-exporta todo — se puede consumir desde
`@/components` sin conocer la capa. Los tests y refactors internos usan imports
directos por capa (`@/components/atoms`).

### 12.1. Atoms (28 componentes)

Bloques indivisibles. Todos aceptan tokens del theme.

**Controles interactivos:**
* `Button` — variantes + tamaños, con `ButtonVariant` y `ButtonSize` exportados.
* `IconButton` — botón cuadrado con icono.
* `ActionButton` — botón grande con icono, expone `useActionColors()`.
* `Link` — texto clickeable con estilo link.

**Form primitives:**
* `Input, Radio, Checkbox, Toggle` — inputs primitivos.
* `ThemeToggle` — switch light/dark/system.

**Display:**
* `Badge` — pill con `BadgeVariant`.
* `Chip` — chip filtro/label.
* `SentimentBadge` — chip con `Sentiment: positive|neutral|negative`.
* `StatBlock` — bloque numérico con label, variantes.
* `Avatar` — con `AvatarSize`.
* `Divider` — línea horizontal.
* `Tooltip` — hover/press tooltip.
* `Icon` — sistema de iconos con `IconName` union tipada.

**Progreso y navegación:**
* `Progress` — barra lineal.
* `Spinner` — con `size` prop (`small|large`).
* `PageDots` — paginación de dots (onboarding, coach marks).
* `Tabs` — segmented control horizontal.
* `Timeline` — con `TimelineItem[]`.

**Visualización:**
* `RadarChart` — chart de 5 ejes (usa react-native-svg).

**Home HUB:**
* `ElectionCard` — card horizontal de una elección (`ElectionCardVariant: active|secondary|pending`).
* `ElectionCardAdd` — card CTA "+ Agregar elección".
* `BookmarkButton` — icono bookmark toggleable.
* `TabBarItem` — item del BottomNav / Sidebar.

**Dimensiones (dominio):**
* `DimensionBadge` — chip circular con icono (`DimensionBadgeSize`).

### 12.2. Molecules (33 componentes)

Composiciones de atoms con **una** responsabilidad.

**Overlays y feedback global:**
* `ToastProvider` + `useToast()` + `ToastVariant` — sistema global de toasts.
* `Modal` — modal genérico centrado.
* `BottomSheet` — sheet desde abajo (usa `useModalDimensions`).
* `ConfirmModal` — sí/no con `variant` para destructive.

**Modales especializados:**
* `PreguntaInfoModal` — modal informativo del cuestionario.
* `ShareModal` — modal con canales de compartir.
* `CambiarPasswordModal`, `EliminarCuentaModal`, `EditarRespuestaModal`.
* `NoticiaDetailSheet` — bottom sheet con `NoticiaDetail` + `NoticiaCandidatoMencion[]`.

**Formularios:**
* `FormField` — label + input + error message.
* `RadioGroup` — grupo de radios con `RadioOption[]`.
* `WeightSelector` — selector de peso 0/1/2/3 del cuestionario.

**Progreso y navegación interna:**
* `ProgressStepper` — con `StepperStep[]`.
* `ProgressSplit` — barra de progreso segmentada.
* `ScreenTopBar` — top bar simple para screens sin `AppShell`.
* `NavRow` — fila con label + chevron (`NavRowVariant`).
* `SectionTitle` — con `actionLabel` + `onAction` opcional.

**Matching y contenido:**
* `MatchTier` — pill con label del tier + color (`MatchTierKind`).
* `MatchSummaryCard` — card horizontal de "top match" por elección.
  Incluye helper `deriveIniciales(nombre)` con tests dedicados.
* `NewsCard` — card horizontal con imagen (`NewsCardMention` para menciones).
* `PosturaItem` — item de postura con match visual (`PosturaMatch`).
* `BookmarkActions` — grupo de botones de bookmark.

**Home HUB:**
* `HomeGreeting` — title + subtitle del saludo.
* `NovedadItem` — item del feed (`NovedadKind: noticia | action | mention`).

**Perfil territorial:**
* `ListPickerModal` — modal con `ListPickerItem[]` searchable.
* `UbicacionPicker` — región + comuna, encadenados.

**Filtros:**
* `ChipActivo` — chip filtro con estado activo/inactivo.
* `CollapsibleFilterSection` — sección collapse con label.

**Onboarding contextual:**
* `CoachMark` — overlay con spotlight + step actual.
* `CoachMarkTour` — orquestador que consume `useCoachMarkTour(tourId)`.

**Dimensiones:**
* `DimensionCard` — card completa con borde izquierdo + header + body coloreados.

### 12.3. Organisms (17 componentes)

Piezas complejas que resuelven un caso de uso.

**Infraestructura:**
* `ErrorBoundary` — clase de React que envuelve el árbol; ver §5.

**Cuestionario y candidatos:**
* `QuestionCard` — card completa de una pregunta con opciones + selector de peso.
* `CandidateCard` — card de candidato en listados (con foto, partido, match si aplica).
* `CandidatoPosturas` — sección de posturas de un candidato agrupadas por eje.
* `ProfileHero` — hero del perfil del candidato con `HeroStat[]` y `HeroTilt`.
* `MatchExplanation` — explicación pregunta-a-pregunta del match (consume `useMatchDetalle`).

**Comparador y share:**
* `Comparator` — matriz side-by-side con `ComparatorSlot`.
* `ShareOptions` — grid de `ShareChannel[]`.

**Layout global:**
* `TopNav` — barra superior con back button + título + acciones.
* `EmptyState` — pantalla vacía con ilustración + CTA.
* `BottomNav` — bottom tab bar (`BottomNavTab[]`) para mobile.
* `Sidebar` — sidebar vertical para desktop (`≥900px`).

**Home HUB:**
* `HomeTopBar` — barra superior específica del Home con brand + notif.
* `ElectionsStrip` — strip horizontal scrolleable de `ElectionCard`s.
* `NovedadesFeed` — feed vertical de `NovedadFeedItem[]`.

**Resultados:**
* `ResultadoHero` — card hero para el top match. **Responsive**: en mobile (<720px) es un layout vertical estilo `RankingCard` XL (info + radar 200px + %match + confianza + CTA en columna); en tablet/desktop (>=720px) se abre a un **split 2 columnas** (info + CTA a la izquierda, radar 220px a la derecha). Prop `layout="auto" | "vertical" | "horizontal"` para forzar uno en showcases o contextos con ancho controlado.
* `RankingRow` — fila horizontal del ranking (posición + candidato + radar mini + match%). Contexto denso.
* `RankingCard` — card vertical del ranking optimizada para grid 2-col (radar 140px con labels + %match grande + cobertura). Se usa en `ResultadosScreen` para dar visibilidad al breakdown por eje.

### 12.4. Templates (2 componentes)

Layouts reutilizables.

**`AppShell`** — layout responsive post-auth. Renderiza:

```
width < 900px:                        width >= 900px:
┌──────────────────────┐             ┌────┬─────────────────┐
│                      │             │    │                 │
│      children        │             │ SB │    children     │
│      (scrolean)      │             │ (S)│    (scroll)     │
│                      │             │    │                 │
├──────────────────────┤             │    │                 │
│      BottomNav       │             │    │                 │
└──────────────────────┘             └────┴─────────────────┘
```

Props: `active: AppTab | null, navigation, children, contentStyle?`.

**Screens que USAN AppShell**: Home HUB, Gestión Elecciones, Resultados, Mis Guardados,
Mis Respuestas, Noticias, Perfil candidato, Comparador, Config, Editar perfil.

**Screens que NO**: Splash, Onboarding, Ubicación, Login, Signup, Cuestionario, Share modal
(full-focus o pre-app).

**`ScreenChrome`** — chrome estándar para screens sin AppShell (top bar + safe area + scroll).

Exporta también la constante `SIDEBAR_BREAKPOINT = 900`.

---

## 13. Hooks custom

Ubicación: `src/hooks/` (los hooks de la API viven en `src/api/hooks.ts`, ver §7.5).

### 13.1. Focus management en overlays (`blurActiveElement` + `useBlurBeforeClose` + `useBlurringPress`)

Trilogia de helpers para evitar el warning WCAG 2.4.3 ("Blocked aria-hidden
on an element because its descendant retained focus") cuando se cierran
modals o se navega entre screens en web.

Ver `docs/accesibilidad.md` §10 para el contrato completo, patron y
checklist de PR. Resumen tecnico:

| Helper | Uso |
|---|---|
| `blurActiveElement()` | Helper puro. Llamalo inline en callbacks manuales (`handleConfirm`, `handleSubmit`) que van a disparar cierre de overlay. |
| `useBlurBeforeClose(onClose)` | Hook que envuelve el `onClose` de un modal. 6 tests. Consumido por `Modal` y `BottomSheet`. |
| `useBlurringPress(onPress)` | Hook que envuelve el `onPress` de un `Pressable` para blurear antes del handler. 4 tests. Consumido por `Button`, `Link`, `IconButton`, `NavRow`, `TabBarItem`. |

Complemento no-React: `src/utils/installAriaHiddenFocusGuard.ts` — se
instala una vez desde `App.tsx` (solo web) y actua como safety net global
via monkey-patch de `Element.prototype.setAttribute`. Atrapa cualquier
caso que se escape a los hooks.

**Regla de PR**: todo `<Pressable>` directo en un atomo nuevo debe
usar `useBlurringPress`, salvo toggles con estado (Radio/Checkbox/Toggle).

### 13.2. `useCoachMarkTour(tourId)`

Máquina de estado del tour de coach marks. Consumido por `<CoachMarkTour />`.

```ts
{
  visible: boolean,          // se muestra si no está en el store `seen`
  step: CoachStep | null,    // paso actual (null si visible=false)
  currentIndex: number,      // 0-based
  total: number,             // pasos del tour
  next(),                    // avanza; si es el último llama markSeen
  back(),                    // no-op en el primer paso
  skip(),                    // markSeen sin completar
}
```

### 13.3. `useDimensionColors(key)`

Wrapper reactivo sobre `getDimensionColors(key, isDark)`. Consume `useIsDark()` para
resolver el modo activo automáticamente.

### 13.4. `useModalDimensions()`

Calcula el tamaño efectivo de un modal según `useWindowDimensions()` y los tokens
`modalLayout`. Tiene 9 tests (6 de modal + 3 de sheet). Consumido por `Modal` y `BottomSheet`.

---

## 14. Content (coach marks, welcome tour)

Ubicación: `src/content/`. Copy estático largo separado de los componentes (embryo de i18n:
si mañana se traduce, se vuelve un mapping por locale).

### 14.1. `coachMarks.ts`

8 tours definidos, cada uno con 1..4 pasos:

```
home           2 pasos   (tarjetas de elecciones, botón +)
cuestionario   1 paso    (ícono ? de info de pregunta)
resultados     2 pasos   (ranking, favoritos/descartar)
comparador     3 pasos   (slots, comparar, solo diferencias)
guardados      2 pasos   (tabs de tipos, cómo guardar)
gestionEleccio 2 pasos   (listado, interruptor)
perfilCandida  4 pasos   (radar, posturas, noticias, confianza)
noticias       2 pasos   (feed, filtros)
```

Tono: pensado para alguien no técnico. Cada paso tiene `id, title (≤6 palabras),
description (≤30 palabras), highlight (texto referencial del elemento resaltado)`.

Tipos: `TourId, CoachStep, CoachTour`. Registry: `COACH_TOURS: Record<TourId, CoachTour>`.

### 14.2. `welcomeTour.ts`

Slides del `OnboardingScreen` (se muestran una vez por device, ver §8.6).

---

## 15. Screens

18 screens de usuario + 1 catálogo interno DEV. Cada archivo respeta el límite de 600 líneas
declarado en AGENTS.md §8.

### 15.1. `HomeScreen.tsx` (Home HUB)

Dashboard central de la app.

Estructura vertical:

```
┌─────────────────────────────────────────┐
│ HomeTopBar   [brand]         [notif]    │
├─────────────────────────────────────────┤
│ HomeGreeting                            │
│   "Buenos días, jenny"                  │
│   "Explora las elecciones activas."     │
├─────────────────────────────────────────┤
│ SectionTitle "Tus elecciones (N)"       │
│   [Gestionar]                           │
│ ← scroll horizontal →                   │
│ [ElectionCard][ElectionCard][+ Agregar] │
├─────────────────────────────────────────┤
│ SectionTitle "Tus mejores matches"      │
│ ← scroll horizontal →                   │
│ [MatchSummaryCard][MatchSummaryCard]... │
├─────────────────────────────────────────┤
│ ───── divider ─────                     │
├─────────────────────────────────────────┤
│ SectionTitle "Novedades" [Ver todas]    │
│ NovedadesFeed:                          │
│   [action: Responde el cuestionario…]   │
│   [noticia][noticia][noticia][noticia]  │
└─────────────────────────────────────────┘
+ ConfirmModal (reiniciar cuestionario)
+ NoticiaDetailSheet
+ CoachMarkTour tourId="home"
```

**Data model**: una sola query agregada `useMisElecciones()` → `GET /mi-progreso/` que
trae `{tipo_eleccion_id, tipo_eleccion_nombre, total_preguntas, respondidas, completa,
top_match: {...breakdown_por_eje...}}` por cada tipo activo. Cubre todos los tipos en
un único request.

**Filtro "Tus mejores matches"**: se muestran solo items con `completa === true && top_match !== null`. El backend ya filtra `top_match` por completitud (ver `views/mi_progreso.py`), pero la UI repite el chequeo como *defense in depth* contra futuros cambios del endpoint que pudieran reintroducir "matches fantasma" (candidato en M2M con varios tipos leakeando su match hacia tipos no contestados).

**Modo guest**: no llama `useMisElecciones` (enabled sólo si isAuth). Muestra catálogo +
CTA para responder + match anónimo.

**Lógica de destino al tocar una card**:
* Auth + completa → carga preguntas y navega directo a `Resultados` (evita cuestionario vacío).
* Guest o incompleta → carga preguntas y navega a `Cuestionario`.

Uso de `partitionTipos(tipos, electionsActiveIds)` para filtrar solo activas.

Helpers locales: `greetingByHour()`, `whenLabel(dateIso)` para relative time,
`indexProgresoByTipo(items)` para lookup O(1).

### 15.2. `CuestionarioScreen.tsx`

Wizard de preguntas — una pregunta a la vez. Va envuelto en `ScreenChrome` (NO `AppShell`, porque el flujo es full-focus). Consume `useCuestionarioStore` y renderiza:

* `ScreenTopBar` con back + subtitle `"N de M · base"` + botón info.
* `ProgressSplit` con `baseDone/baseTotal` (extras aún no expuestas por el backend, se pasan como `0`).
* Enunciado inline: eje temático (overline) + texto de la pregunta (h2).
* Opciones vía `RadioGroup<number>` construido desde `separarOpciones()` (regulares + "No sé").
* Selector de peso vía `Chip` iterando sobre `PESOS`, mostrado solo si `debeMostrarPeso(...)` devuelve true.
* Footer: botón `Atrás` (deshabilitado según `esPrimeraPregunta`) + `Siguiente` o `Enviar` (según `esUltimaPregunta`).
* Submit: llama `submit({ skipServer: isGuest })` — guest salta el POST al backend, auth persiste. En ambos casos navega a `SubmitDone` con `mode: esTipoBase ? "base" : "eleccion"` (los tipos `es_base=true` no tienen candidatos propios, por eso el mode cambia el copy del destino).
* `PreguntaInfoModal` para el botón info del topbar.
* `CoachMarkTour tourId="cuestionario"`.

### 15.3. `SubmitDoneScreen.tsx`

Pantalla de celebración post-submit. Recibe param `mode`:
* `"eleccion"` (default) → CTA "Ver resultados" → navega a `Resultados`.
* `"base"` → CTA "Activar una elección" o "Ir a…" (tipos base no tienen candidatos propios).

### 15.4. `ResultadosScreen.tsx`

Ranking de candidatos ordenados por match desc.

* `ResultadoHero` con el top match. **Responsive interno**: layout vertical estilo card en mobile (<720px), split 2-col en tablet/desktop (>=720px). El breakpoint 720 se comparte con el grid del ranking para transicionar coherentemente.
* Ranking en **grid responsive** de `RankingCard` (radar 140px con labels + %match + cobertura). Breakpoints: 1 col en <400px, 2 col en <720px, 3 col en <1000px, 4 col arriba. El grid usa `flexWrap` + `flexBasis` calculado con `useWindowDimensions().width`.
* Botones favorito / descartar (usa `useToggleFavorito`, `useToggleDescartado`).
* En guest, dispara `useMatchAnonimo` con respuestas del store.
* En auth, consume `useMatchesQuery(tipoId)`.
* Share button → abre `ShareOptions` con texto de `buildShareText()`.
* `CoachMarkTour tourId="resultados"`.

### 15.5. `DetalleCandidatoScreen.tsx`

Perfil completo de un candidato. Recibe params `{candidatoId, breakdown, matchPct, confianza}`.

Secciones:
* `ProfileHero` con foto, partido, `HeroStat[]`, badge de confianza.
* `RadarChart` con `breakdownToChartData(breakdown)`.
* `MatchExplanation` (organism) con detalle pregunta a pregunta (`useMatchDetalle`).
* `CandidatoPosturas` con posturas agrupadas por eje (`usePosturasCandidato`).
* Noticias del candidato (`useNoticiasCandidato`) — NewsCards clickeables.
* Botones favorito / descartar / compartir.
* `CoachMarkTour tourId="perfilCandidato"`.

Si `matchPct === null` (guest sin cuestionario) esconde radar + confianza.

### 15.6. `MisGuardadosScreen.tsx`

Hub de bookmarks con Tabs superiores:
* **Favoritos** — `useFavoritos()`, lista de `CandidateCard`.
* **Posturas** — `usePosturasBookmarks()`, lista de `PosturaItem`.
* **Noticias** — `useNoticiasBookmarks()`, lista de `NewsCard`.

Empty states con `EmptyState` con CTA relevante ("Explorar candidatos", etc.).
`CoachMarkTour tourId="guardados"`.

### 15.7. `MisRespuestasScreen.tsx`

Hub multi-tipo de respuestas del usuario, agrupadas por (tipo × eje).
Consume `useMisRespuestasMultiple(tipoIds)` que ejecuta N `useQuery` en paralelo.
Cada respuesta editable via `EditarRespuestaModal` que invoca `useUpdateRespuesta`.

### 15.8. `NoticiasScreen.tsx`

Feed global paginado (extrae `results`). Filtros:
* Candidato mencionado (`ChipActivo`).
* Fuente (`CollapsibleFilterSection`).
* Días atrás.
* Búsqueda full text (`q`).

Botón bookmark en cada noticia (`useToggleNoticiaBookmark`).
Al tocar una noticia abre `NoticiaDetailSheet`.
`CoachMarkTour tourId="noticias"`.

### 15.9. `CandidatosScreen.tsx`

Listado global de candidatos con búsqueda cliente-side. `CandidateCard`s clickeables
que navegan a `DetalleCandidato` con `matchPct: null` (no hay contexto de match).

### 15.10. `CompararScreen.tsx`

Comparador side-by-side de 2 candidatos.

* Dos `ComparatorSlot`s en la parte superior — cada uno abre un `ListPickerModal` para
  elegir el candidato.
* Toggle "Solo diferencias" que filtra `GrupoComparacion.items` a los que NO coinciden.
* Sección resumen: `porcentajeCoincidencia`, contadores por nivel.
* Grid con posturas de ambos por pregunta (usa `compararPosturas` + `calcularResumen`).
* `CoachMarkTour tourId="comparador"`.

### 15.11. `PerfilScreen.tsx`

Perfil del usuario. Consume `usePerfil()`.
* Sección datos (email, username).
* Sección territorial (`UbicacionPicker` → `useActualizarComuna`).
* Contadores agregados (matches completos, favoritos, etc.).
* Botones: cambiar password (`CambiarPasswordModal`), eliminar cuenta (`EliminarCuentaModal`).

### 15.12. `ConfiguracionScreen.tsx`

Tabla de `NavRow`s: theme (`ThemeToggle`), Ayuda (reset coach marks, ver tours),
Perfil (navega), Sobre la app, Logout.

### 15.13. `GestionEleccionesScreen.tsx`

Listado de todos los tipos de elección con un `Toggle` cada uno. Usa
`useElectionsPrefsStore.toggle(tipoId, allTipoIds)` para persistir.
`CoachMarkTour tourId="gestionElecciones"`.

### 15.14. `LoginScreen.tsx`

Form con email + password. Botones: "Ingresar" → `login()` + `setSession()`,
"Crear cuenta" → navega a `Register`, "Olvidé contraseña" → `PasswordResetRequest`,
"Continuar como invitado" → `enterGuestMode()`.

### 15.15. `RegisterScreen.tsx`

Form con username + email + password. Al éxito llama `setSession` con la respuesta.

### 15.16. `OnboardingScreen.tsx`

Slides con `PageDots`. Al terminar llama `markSeen()` + opcionalmente
`setPendingAuthTarget("Register" | "Login")` para direccionar el auth stack.
También tiene botón "Continuar como invitado".

### 15.17. `PasswordResetRequestScreen.tsx`

Form con email. Llama `useRequestPasswordReset`. En DEBUG del backend el response
incluye `reset_link` que se muestra en pantalla para dev.

### 15.18. `PasswordResetConfirmScreen.tsx`

Recibe param `{token}` (deep link). Form con nueva contraseña + confirmación.
`useConfirmPasswordReset` → toast + navega a Login.

---

## 16. Design System interno

`src/screens/design-system/` es un catálogo visual **DEV-only**. Se registra en el
navigator solo si `__DEV__ === true` (bundling en dev). Estructura:

```
design-system/
├── DesignSystemScreen.tsx    ← index + sidebar de secciones
├── catalog/                  ← catalog entries por componente
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── tokens/               ← paleta, spacing, typography visualizados
└── showcase/                 ← ejemplos compuestos (pantallas fake)
```

Sirve como Storybook light-weight. Cada componente del design system tiene su entry
(atoms, molecules, organisms, templates y tokens).

---

## 17. Modos de uso: unauth / guest / auth

Diagrama de decisión en el `AppNavigator`:

```
                     App inicia
                          │
                          ▼
                    hidratar stores
                          │
                    ┌─────┴──────┐
                    │            │
                token?         no token
                    │            │
                    ▼            ▼
                MAIN         hasSeen onboarding?
                             ┌─────┴─────┐
                            no          yes
                             │            │
                             ▼         isGuest?
                       ONBOARDING     ┌───┴───┐
                                     no      yes
                                      │       │
                                      ▼       ▼
                                    AUTH     MAIN
                                             (guest mode)
```

**Diferencias funcionales**:

| Feature | Unauth | Guest | Auth |
|---|---|---|---|
| Ver catálogo de tipos |  |  |  |
| Responder cuestionario |  |  (in-memory) |  (persistido) |
| Ver ranking de matches |  |  (anónimo) |  (persistido) |
| Ver detalle de candidato |  |  (sin match) |  (con radar + match) |
| Comparar candidatos |  |  |  |
| Ver noticias |  |  |  |
| Guardar favoritos / bookmarks |  |  |  |
| Home HUB "Tus mejores matches" |  |  |  (requiere `/mi-progreso/`) |
| Editar respuestas |  |  |  |
| Perfil territorial |  |  |  |
| Password reset |  | — | — |

Regla de código: los hooks con `enabled: isAuth` protegen los endpoints que requieren auth
para no disparar 401 en modo guest.

---

## 18. Testing

Runner: **Jest 29 + jest-expo 54**. Config en `jest.config.js`.

Tests actualmente en el repo:

* `src/api/__tests__/` — client, hooks.
* `src/domain/eleccion.test.ts` — 21 tests.
* `src/domain/dimensiones.test.ts` — verifica contraste WCAG.
* `src/services/*.test.ts` — comparar, cuestionario, matching, share (4 archivos).
* `src/hooks/blurActiveElement.test.ts` — 4 tests del helper puro.
* `src/hooks/useBlurBeforeClose.test.ts` — 6 tests.
* `src/hooks/useModalDimensions.test.ts` — 9 tests (6 de modal + 3 de sheet).
* Tests puntuales de helpers en `components/molecules/` (ej. `deriveIniciales` en
  `MatchSummaryCard` con 6 tests).

Regla de AGENTS.md §10: tests co-localizados con el módulo que testean (no en un `__tests__`
paralelo, salvo en `api/`).

Gate pre-commit (AGENTS.md §11): correr `tsc --noEmit` y `jest` antes de push.

---

## 19. Convenciones y reglas para IA (`AGENTS.md`)

Fuente: `frontend/AGENTS.md`. Reglas duras que aplican a cualquier PR / agente:

1. **Versión de Expo/RN**: no upgradar sin coordinar. Cambios en `package.json` requieren
   testear los 3 targets (iOS, Android, Web).
2. **Design tokens**: prohibido usar strings de color o números de spacing inline.
   Siempre importar de `@/theme`.
3. **Query keys centralizados**: siempre usar `queryKeys.X`, nunca inline.
4. **Tipos autogenerados**: `src/types/api.ts` es autogenerado desde `schema.yml`.
   Correr `npm run types:gen` cuando cambia el schema del backend.
5. **DRY helpers**: si duplicás lógica pura → moverla a `services/` o `domain/`.
6. **Español neutro tuteo**: toda copy en la app en español chileno neutro con tuteo
   ("tú puedes", "haz", "escribe"). Nada de voseo ni de "vosotros".
7. **Auth guard preservation**: los interceptores del cliente axios no deben tirar
   logout en 401 si no había token (guard contra romper guest mode).
8. **600-line screen limit**: si un screen crece más allá de 600 líneas, refactor en
   organismos.
9. **Accesibilidad WCAG 2.2 AA obligatoria**: contrastes, targets ≥44×44px, labels
   accesibles, focus visible.
10. **Tests co-localizados**: tests viven al lado del módulo que testean.
11. **Pre-commit**: `tsc --noEmit && jest` verde antes de hacer commit.

---

## 20. Drift conocido y áreas no exploradas

### 20.1. Drift declarado en comentarios del código

* **`LoginResponse` extendido** — el backend responde `{token, user_id, email}` pero el
  schema OpenAPI declara solo `{token}` (heredado de DRF `ObtainAuthToken` sin
  `@extend_schema`). El frontend tipa localmente en `endpoints.ts`.

* **`Region`** — el endpoint `/regiones/` no está incluido en el schema OpenAPI. El tipo
  se declara localmente en `endpoints.ts`.

* **`BreakdownPorEje`** — schema lo declara `unknown` (JSONField). Tipado localmente
  como `Partial<Record<EjeTematico, {porcentaje, preguntas}>>`.

* **`DEFAULT_PESO` discrepancia**: `store/cuestionario.ts` usa `1` (Poco) como valor por
  defecto cuando se registra una respuesta sin peso explícito. `services/cuestionario.ts`
  exporta `DEFAULT_PESO = 2` (Medio) que consume la UI para el estado inicial del
  selector en una respuesta nueva. Los dos contextos son distintos y conviven, pero son
  valores diferentes para lo que semánticamente es "el peso default".

* **`APP_URL` hardcoded** — `services/share.ts` usa `"https://VotoAFin.cl"`
  como constante de módulo, sin fallback por env var.

* **`SecureStore` en web** — en `Platform.OS === "web"` el wrapper `secureStorage` cae a
  `localStorage` sin encripción. Solo aplica al target web.

* **Noticias feed paginado** — es el único endpoint con `PageNumberPagination`. El
  wrapper `listNoticias()` extrae `results` y descarta `next/previous`, sin scroll
  infinito.

* **`/mi-progreso/` en modo guest** — no está disponible (requiere auth). El Home HUB
  guest muestra solo el catálogo y el CTA, sin sección "Tus mejores matches".

* **Cuestionario submit batch** — el backend solo persiste al final del cuestionario
  (POST batch en `/respuestas/`), por lo que el estado `en_curso` de
  `deriveEleccionEstado()` no ocurre en la práctica. La función lo contempla igual como
  reserva para submit incremental.

* **`useCandidato(id)` fallback** — no existe endpoint `/candidatos/{id}/` suelto. El hook
  lee del cache de `useCandidatos()` y, si está vacío, hace fetch de la lista completa y
  filtra en memoria por `id`.

### 20.2. Áreas no exploradas en profundidad para este doc

Este documento cubre exhaustivamente la arquitectura, capas y contratos. Los siguientes
puntos existen en el código pero no se documentaron con detalle línea-por-línea:

* **Implementación específica de cada organism** (ej. animaciones internas de `RadarChart`
  con react-native-svg, mecánica de gestos del `Comparator`) — el contrato de props está
  documentado en §12, la implementación se puede leer en el archivo correspondiente.

* **Utils** (`utils/candidato.ts`, `utils/noticia.ts`, `utils/text.ts`) — helpers puros
  como `sanitizeSnippet`, `noticiaToDetail`. Se ven en imports de screens pero no se
  desglosan aquí porque son transformaciones triviales de data.

* **Contenido específico de `welcomeTour.ts`** — solo se documentó su propósito (§14.2)
  no el copy de cada slide.

* **Archivos de assets** (`assets/`) — íconos, splash, adaptive icons de Expo. No hay
  lógica.

* **`design-exploration/`** — HTML lo-fi de referencia para el design system.
  Es documentación visual, no ejecutable.

* **Estructura interna de `screens/design-system/catalog/` y `showcase/`** — son entries
  de catálogo y showcases fake, sirven como Storybook interno. No aportan a la app en
  producción.

* **Tests con detalle de cada caso** — se enumeraron los archivos y counts, no cada
  assertion.

* **Schema OpenAPI completo** (`src/types/api.ts` de ~77 KB) — es autogenerado. La fuente
  de verdad está en `backend/openapi.yaml`. Este doc documenta las funciones tipadas de
  `endpoints.ts` que consumen ese schema.

---

**Fin del documento.**
