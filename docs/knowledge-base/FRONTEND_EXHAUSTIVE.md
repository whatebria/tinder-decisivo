# Knowledge Base — Frontend Exhaustivo (VotoAFin)
> Generado por `codebase-knowledge-mapper` | focus: frontend + architecture + design-system + atomic-design + business-rules | depth: exhaustive
> Actualizado: 2026-07-31 — verificado contra código actual
> Nombre del producto: **VotoAFin** (repo: tinder-decisivo)

---

## Resumen Ejecutivo

**VotoAFin** es una aplicación mobile (React Native / Expo) + web (Expo Web) para matching político.
Permite a ciudadanos responder un cuestionario sobre sus posturas, y el sistema compara esas posturas
con las declaradas por los candidatos para cada elección activa.

**Stack frontend:**
- Expo ~57 · React Native 0.86 · React 19
- TypeScript ~6
- Zustand 5 (estado global)
- TanStack Query 5 (server state / caching)
- Axios (HTTP)
- expo-secure-store (persistencia nativa encriptada)
- sessionStorage (persistencia web)
- react-native-svg (RadarChart)
- Atomic Design estructurado (atoms/molecules/organisms/templates)
- Design System propio con tokens light/dark, affinity tier system, 7 dimensiones temáticas

**Modo de operación:** Native (iOS/Android) + Web. Autenticación dual:
- **Native:** Token Bearer en SecureStore (Keychain/KeyStore)
- **Web:** Cookie httpOnly desde backend + userId en sessionStorage como proxy

**3 modos de usuario:** `unauthenticated` → `guest` (efímero, read-only) → `authenticated`

---

## Mapa Funcional

```
tinder-decisivo/
├── Onboarding            → Slides informativos (1 vez por device)
├── Auth Stack
│   ├── Login                 → Autenticación con email/password
│   ├── Register              → Registro de nueva cuenta
│   ├── PasswordResetRequest  → Solicitar email de recuperación
│   └── PasswordResetConfirm  → Ingresar nueva contraseña con token
└── Main Stack (auth + guest) — flat native stack, sin Tab Navigator
    ├── Home              → HUB: hero + elecciones + top match
    ├── Cuestionario      → 1 pregunta por vez con peso de importancia
    ├── SubmitDone        → Confirmación post-envío
    ├── Resultados        → Ranking de candidatos con radar por eje
    ├── DetalleCandidato  → Perfil: tabs Resumen + Afinidad
    ├── Comparar          → Comparación lado a lado de candidatos
    ├── Candidatos        → Catálogo de candidatos por elección
    ├── MisGuardados      → Favoritos + descartados
    ├── MisRespuestas     → Ver y editar respuestas ya enviadas
    ├── Perfil            → Datos de usuario + ubicación
    ├── Configuracion     → Tema + tours + danger zone
    ├── GestionElecciones → Activar/desactivar tipos de elección
    └── DesignSystem      → Catálogo de componentes (solo __DEV__)

Nota: "Noticias" NO es una screen. Las noticias del candidato se muestran
en NoticiaDetailSheet (bottom sheet molecule) dentro de DetalleCandidatoScreen.
```

---

## Sistemas Detectados

### 1. Sistema de Autenticación

**Objetivo:** Gestionar identidad del usuario con soporte dual native/web y modo guest.

**Componentes:**
- `store/auth.ts` — `useAuthStore` (Zustand)
- `store/secureStorage.ts` — abstracción cross-platform
- `api/endpoints.ts` — `login()`, `register()`, `logout()`, `resetPassword*()`
- Screens: `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`

**3 estados:**
| Estado | Token | isGuest | Descripción |
|---|---|---|---|
| unauthenticated | null | false | → pantalla de Login |
| guest | null | true | → read-only, efímero (no persiste en restart) |
| authenticated | string | false | → acceso completo |

**Flujos de hidratación:**
- Native: lee token de SecureStore + userId → `isAuthenticated = Boolean(token)`
- Web: token invisible (httpOnly) → `isAuthenticated = userId !== null` (proxy)

**Invariantes:**
- `isGuest` NO se persiste → cada restart vuelve a login
- Al `setSession()` → `isGuest = false` automáticamente
- El email fue removido del store (F18) → se lee via `usePerfil()`

**Dependencias:** expo-secure-store, sessionStorage (web)

**Riesgos:**
- En web, si la cookie expira pero userId sigue en sessionStorage → aparente auth pero 401 en primer request. Se limpia automáticamente gracias al interceptor del cliente Axios.
- BUG-005: cookie SameSite documentado en `api/config.ts`

---

### 2. Sistema de Matching

**Objetivo:** Calcular afinidad porcentual entre las posturas del usuario y los candidatos.

**Componentes:**
- `backend/core/services/matching.py` — algoritmo principal
- `api/endpoints.ts` — `matchCandidatos()` (auth) + `matchAnonimo()` (guest)
- `api/hooks.ts` — `useMatchCandidatos()`, `useMatchAnonimo()`
- `services/matching.ts` — helpers de presentación (colores, tiers, badges)
- `domain/affinity.ts` — `AffinityTier` 1-5 con umbrales y colores

**Algoritmo (backend):**
```
score_pregunta = 1 - (diff / 4)²           # no lineal: penaliza diferencias grandes
peso_usuario ∈ {0, 1, 2, 3}               # 0=irrelevante, 1=algo, 2=importante, 3=esencial
peso_mult = {0: 0.5, 1: 1.0, 2: 1.5, 3: 2.0}
score_ponderado = score_pregunta × peso_mult

match_pct = Σ(score_ponderado) / Σ(peso_mult_max_posible)

# Ranking final — elimina sesgo de cobertura:
coverage_score = match_pct × log(1 + n_preguntas_consideradas)
```

**Niveles de confianza:**
- `TENTATIVA`: n_preguntas_consideradas < 5
- `MEDIA`: 5 ≤ n_preguntas_consideradas < 10
- `ALTA`: n_preguntas_consideradas ≥ 10

(Umbrales: `CONFIANZA_UMBRAL_MEDIA = 5`, `CONFIANZA_UMBRAL_ALTA = 10` en `services/matching.py`)

**Affinity Tiers (frontend):**
| Tier | Rango | Color light | Color dark |
|---|---|---|---|
| aff5 | 81-100% | #3A9E7A (brandAccent) | #5BCEA0 |
| aff4 | 61-80% | #6B9B7A (success) | #8FB89A |
| aff3 | 41-60% | #C89B5C (warning) | #D9B378 |
| aff2 | 21-40% | #D07777 (danger300) | #E09090 |
| aff1 | 0-20% | #B85C5C (danger) | #D07777 |

**Dependencias:** `useCuestionarioStore.tipoEleccionId`, `useAuthStore.isGuest`

**Riesgos:**
- El tipo base (`es_base=true`) retorna 400 en `/match-candidatos/` → guardia dedicado en `ResultadosScreen`
- Confianza TENTATIVA con < 10 respuestas puede generar rankings poco representativos

---

### 3. Sistema de Resultados

**Objetivo:** Presentar el ranking de candidatos rankeados por afinidad con opciones de filtrado, acción (favorito/descartar), comparación y compartir.

**Componentes:**
- `screens/ResultadosScreen.tsx` (≈ 530 líneas, pantalla más compleja)
- `components/organisms/TopMatchSection` — hero card con radar grande
- `components/organisms/RankingCard` — card con radar mediano (vista grilla)
- `components/organisms/RankingRow` — fila compacta (vista lista)
- `services/matching.ts` — `sortByMatchDesc()`, `getMatchColor()`
- `services/share.ts` — `buildShareText()`, `fromMatchResults()`

**Features:**
- Vista lista / grilla toggle (Chip)
- Responsive: 1 col < 600px | 2 cols < 720px | 3 cols < 1000px | 4 cols ≥ 1000px
- Filtro por partido (Chip → FilterBottomSheet)
- Candidatos descartados se ocultan del ranking (optimistic)
- Favorito/descartado con optimistic update + toast con undo en descartar (5s)
- Compartir ranking (ShareModal + Web Share API + clipboard fallback)
- Guest CTA para conversión a cuenta
- Banner de ubicación compacto (no bloquea hero)

**Dependencias:** `useCuestionarioStore`, `useAuthStore`, `useFavoritos()`, `useDescartados()`

---

### 4. Sistema de Favoritos y Descartados

**Objetivo:** Permitir al usuario marcar candidatos como favoritos o descartarlos para personalizar su experience.

**Componentes:**
- `api/hooks.ts` — `useToggleFavorito()`, `useToggleDescartado()`
- `api/hooks.ts` — `useFavoritos()`, `useDescartados()`
- `components/organisms/BookmarkActions` — botones de acción

**Reglas:**
- Favorito y descartado son mutuamente excluyentes: agregar uno limpia el otro (BUG-039)
- Optimistic update: cache se actualiza ANTES de respuesta del servidor (BUG-045)
- Modo guest: ambos sets son `Set<number>()` vacíos (sin persistencia)
- Descartar muestra toast de 5s con botón "Deshacer" (UX-084)

**Persistencia:** Backend (REST) — no local

---

### 5. Sistema de Cuestionario

**Objetivo:** Guiar al usuario pregunta por pregunta, registrar sus posturas y peso de importancia, y enviarlas al backend.

**Componentes:**
- `screens/CuestionarioScreen.tsx`
- `store/cuestionario.ts` — `useCuestionarioStore`
- `services/cuestionario.ts` — lógica pura de validación y presentación
- `api/endpoints.ts` — `preguntasPendientes()`, `submitRespuestas()`

**Flujo:**
```
Home → loadForTipoEleccion() → CuestionarioScreen
  └── pregunta a pregunta (con prev/next)
      ├── opción Likert (1-5) + opción "No sé"
      ├── selector de peso (si opción ≠ "No sé")
      └── isLast → "Enviar" → submit() → SubmitDone
                                └── skipServer=true (guest, no persiste)
```

**Preservación de progreso:** Si el usuario regresa al mismo tipo de elección con respuestas en progreso, NO se resetea el avance.

**Resultados parciales:** Disponible con ≥ 10 respuestas, solo en tipos no-base.

**Invalidación de cache post-submit:** `queryKeys.miProgreso` + `queryKeys.misRespuestasAll` se invalidan inmediatamente.

---

### 6. Sistema de Navegación

**Objetivo:** Gestionar el routing entre stacks (Onboarding → Auth → Main) con condicionamiento por estado de auth.

**Componentes:**
- `navigation/AppNavigator.tsx` — root navigator
- `navigation/tabs.ts` — tab bar items y labels de accesibilidad
- `navigation/types.ts` — tipos de parámetros por screen
- `store/onboarding.ts` — flag `hasSeen` + `pendingAuthTarget`

**Stacks:**
```
AppNavigator (createNativeStackNavigator — flat stack, sin Tab Navigator de React Navigation)
├── Onboarding Stack     → se muestra si !hasSeen
├── Auth Stack           → Login | Register | PasswordResetRequest | PasswordResetConfirm
└── Main Stack           → se muestra si isAuthenticated || isGuest
    ├── BottomNav/Sidebar (custom organisms, NO React Navigation tabs)
    │   └── 4 tabs: Home | Candidatos | Comparar | Config
    └── Screens del stack:
    └── Modal screens    → Cuestionario | Resultados | DetalleCandidato | etc.
```

**Dev-only screens:** `DesignSystem` registrado solo si `__DEV__ === true`

**Invariante:** El `DesignSystem` y `DjangoAdmin` nunca llegan a producción (gated por `__DEV__`).

---

### 7. Sistema de Elecciones

**Objetivo:** Modelar múltiples tipos de elección activos por usuario, con progreso independiente, y permitir gestión de cuáles están activadas.

**Componentes:**
- `store/electionsPrefs.ts` — `useElectionsPrefsStore`, `partitionTipos()`
- `domain/eleccion.ts` — lógica derivada (estado, progreso, countdown, filtro territorial)
- `api/hooks.ts` — `useTiposEleccion()`, `useMisElecciones()`

**Modelo de preferencias:**
- `activeIds: null` → nunca configurado, tratar todos como activos
- `activeIds: number[]` → lista explícita de IDs activados
- Se persiste en SecureStore (JSON serializado)
- `initializeIfNull()` se llama al completar onboarding para hacer explícita la selección

**Tipo base (`es_base=true`):**
- Sus preguntas aplican transversalmente a todos los matches
- No tiene candidatos propios → `/match-candidatos/` retorna 400
- El store propaga `esTipoBase` para que `ResultadosScreen` y `CuestionarioScreen` muestren UI diferenciada

**Detección de filtro territorial:**
```typescript
// domain/eleccion.ts
function requiereFiltroTerritorial(nombre: string): boolean {
  // Regex-based: excluye Presidencial, Plebiscito, etc.
  // Conservador: si no matchea → retorna true
}
```
 Riesgo: heurística por nombre. Si el backend cambia nombres o agrega nuevos tipos, el filtro territorial puede fallar silenciosamente.

---

### 8. Sistema de CoachMarks (Tours)

**Objetivo:** Mostrar tours contextuales la primera vez que el usuario visita cada pantalla, con historial persistido por identidad.

**Componentes:**
- `store/coachMarks.ts` — `useCoachMarksStore`
- `content/coachMarks.ts` — definición de tours (TourId + steps)
- `content/welcomeTour.ts` — tour de bienvenida
- `components/CoachMarkTour` — renderer del tour

**Modelo:** Cada userId (o "guest") tiene su propia SeenMap persistida en SecureStore.
- Logout NO borra el historial: el usuario retoma donde lo dejó.
- `resetAll()` tiene timestamp (`lastResetAt`) para evitar que tours ya montados vuelvan a aparecer hasta desmontarse.

---

## Funcionalidades Detectadas

### F-01: Cuestionario con peso de importancia
- **Objetivo:** Capturar postura (Likert 1-5 + "No sé") y peso subjetivo (0=irrelevante → 3=esencial)
- **Pantallas:** `CuestionarioScreen`
- **Reglas de negocio:**
  - Peso solo se muestra si la opción elegida NO es "No sé"
  - Default peso = 2 (Importante)
  - Mínimo 10 respuestas para poder ver resultados parciales
  - Última pregunta → botón "Enviar" en lugar de "Siguiente"
- **Estado de madurez:**  Maduro

### F-02: Resultados con ranking y radar por eje
- **Objetivo:** Ranking rankeado por afinidad con breakdown visual por eje temático
- **Pantallas:** `ResultadosScreen`
- **Reglas:** Descartados ocultos, filtro por partido, vistas lista/grilla
- **Estado de madurez:**  Maduro (algunos UX pendientes)

### F-03: Modo Invitado (Guest)
- **Objetivo:** Explorar sin cuenta, match anónimo sin persistencia
- **Pantallas:** Todas (con limitaciones)
- **Reglas:**
  - submit con `skipServer=true` (no llama al backend)
  - Favoritos/descartados: sets vacíos (no disponibles)
  - Al reiniciar la app → vuelve a login (no persiste)
- **Estado de madurez:**  Maduro

### F-04: Gestión de elecciones activas
- **Objetivo:** Usuario activa/desactiva qué tipos de elección quiere seguir
- **Pantallas:** `GestionEleccionesScreen`, `HomeScreen`
- **Reglas:** null = todos activos (primer uso), persistido en SecureStore
- **Estado de madurez:**  Maduro (BUG-021 **RESUELTO** 2026-07-30)

### F-05: Comparación de candidatos
- **Objetivo:** Comparar posturas de 2+ candidatos lado a lado
- **Pantallas:** `CompararScreen`
- **Reglas:** `NivelCoincidencia`: identica (diff=0) | cercana (diff≤2) | opuesta (diff≥3) | solo_uno | ninguno
- **Estado de madurez:**  Maduro (BUG-044 **RESUELTO** 2026-08-02 — FlatList + useMemo)

### F-06: Favoritos y guardados
- **Objetivo:** Marcar candidatos de interés para acceso rápido
- **Pantallas:** `MisGuardadosScreen`, `ResultadosScreen`, `DetalleCandidato`
- **Reglas:** Mutuamente excluyente con descartados, optimistic update
- **Estado de madurez:**  Maduro

### F-07: Compartir ranking
- **Objetivo:** Compartir resultado vía apps nativas o clipboard
- **Pantallas:** `ResultadosScreen` → `ShareModal`
- **F-07: Compartir ranking** — URL fallback: `"https://votoafin.cl"` (actualizado desde `tinder-decisivo.cl`)
- **Estado de madurez:**  Maduro

### F-08: Perfil de candidato con tabs
- **Objetivo:** Ver ficha completa: resumen estadístico + posturas + afinidad por eje
- **Pantallas:** `DetalleCandidatoScreen`, `AfinidadTab`, `ResumenTab`
- **Estado de madurez:**  UX-068/069/070 **RESUELTOS** 2026-08-02; UX-067 **BLOQUEADO** (ResumenTab oculta, pendiente redisenio)

### F-09: Coach Marks (tours)
- **Objetivo:** Onboarding contextual por pantalla, una vez por usuario
- **Tours definidos:** home, cuestionario, resultados (al menos)
- **Estado de madurez:**  Maduro

### F-10: Tema claro/oscuro
- **Objetivo:** Soporte de tema del sistema con toggle manual
- **Pantallas:** `ConfiguracionScreen`
- **Estado de madurez:**  Maduro

---

## Reglas de Negocio

### RN-01: Cálculo de matching
```
score = 1 - (|postura_usuario - postura_candidato| / 4)²
ponderado = score × peso_multiplicador
match_pct = Σponderado / Σpeso_max_teórico
ranking = match_pct × log(1 + n)  # favorece cobertura
```
**Dónde vive:** `backend/core/services/matching.py`
**Qué lo consume:** `POST /api/v1/match-candidatos/` (auth) + `POST /api/v1/match-anonimo/` (guest)
**Riesgo:** El log de cobertura puede favorecer candidatos con muchas respuestas pero match bajo sobre candidatos con pocas respuestas pero match alto en las que coinciden.

### RN-02: Pesos de importancia del usuario
| Valor | Label | Multiplicador |
|---|---|---|
| 0 | Sin importancia | 0.5× |
| 1 | Algo importante | 1.0× |
| 2 | Importante (default) | 1.5× |
| 3 | Muy importante | 2.0× |

**Dónde vive:** `services/cuestionario.ts` (PESOS, DEFAULT_PESO) + `backend/core/services/matching.py`
** Riesgo:** `DEFAULT_PESO=2` genera multiplicador 1.5× por defecto. Si el usuario no toca el peso, el score ya está inflado respecto a peso=1.

### RN-03: Mínimo de respuestas para resultados
`MIN_RESPUESTAS_PARA_RESULTADO = 10` (PRODUCT-001, subido de 5 el 2026-08-02)
**Dónde vive:** `services/cuestionario.ts`
**Qué lo consume:** `CuestionarioScreen` (botón "Ver resultados parciales") + backend (confianza TENTATIVA)

### RN-04: Comparación de posturas
```
diff = |postura_usuario - postura_candidato|
diff = 0 → identica
diff = 1 → cercana
diff = 2 → cercana
diff ≥ 3 → opuesta
solo_uno  → solo uno tiene postura
ninguno   → ninguno tiene postura
```
**Dónde vive:** `services/comparar.ts`

### RN-05: Affinity Tiers
| Tier | Rango | Interpretación |
|---|---|---|
| aff5 | 81-100% | Alta afinidad |
| aff4 | 61-80% | Buena afinidad |
| aff3 | 41-60% | Afinidad media |
| aff2 | 21-40% | Baja afinidad |
| aff1 | 0-20% | Muy baja afinidad |

**Dónde vive:** `domain/affinity.ts` + `theme/colors.ts` (affinity/affinityDark)

### RN-06: Mutuamente excluyente favorito/descartado
Al agregar a favoritos → se limpia el descartado existente (y viceversa).
Llamadas API disparadas en paralelo: primero se borra el contrario, luego se agrega el nuevo.
**Dónde vive:** `api/hooks.ts` — `useToggleFavorito`, `useToggleDescartado`

### RN-07: Validación de contraseña
`PASSWORD_MIN_LENGTH = 10` (debe coincidir con `MinimumLengthValidator` del backend Django)
**Dónde vive:** `constants/validation.ts`
** Riesgo:** Si el backend cambia el validador, hay que actualizar esta constante manualmente. No está conectado automáticamente.

### RN-08: Tipo base sin candidatos propios
Tipos con `es_base=true` no tienen candidatos → `/match-candidatos/` retorna 400 con code `tipo_base_sin_candidatos`.
La UI redirige a la primera elección específica activa o a GestionElecciones.
**Dónde vive:** Backend + guardia en `ResultadosScreen` + `CuestionarioScreen`

### RN-09: Filtro territorial en resultados
Solo tipos de elección "territoriales" (diputados, concejales, etc.) filtran por comuna del usuario.
La detección es por regex sobre el nombre del tipo (heurística, no flag del backend).
** Riesgo:** Heurística frágil. Si el backend agrega nuevos tipos, el filtro puede clasificar incorrectamente.

### RN-10: Guest mode es efímero
`isGuest` no se persiste en SecureStore. Al reiniciar la app, el usuario vuelve al stack de Auth.
El match anónimo tampoco se persiste (skipServer=true).

### RN-11: Saludos contextuales
```
h < 12  → "Buenos días"
h < 20  → "Buenas tardes"
h ≥ 20  → "Buenas noches"
```
**Dónde vive:** `utils/user.ts` — `greetingForHour(hour?)`
La hora se inyecta para facilitar testing unitario.

### RN-12: Top global match en Home
El hero del Home muestra el candidato con `match_percentage` más alto de TODAS las elecciones completas activas, no solo la primera de la lista (BUG-040).
```typescript
topGlobalMatch = mejoresMatches.reduce((best, curr) =>
  Number(curr.top_match.match_percentage) > Number(best.top_match.match_percentage) ? curr : best
)
```

---

## Arquitectura

### Arquitectura General

```
frontend/
├── src/
│   ├── api/            → HTTP layer (client, config, endpoints, hooks, queryClient)
│   ├── components/     → Atomic Design (atoms/molecules/organisms/templates)
│   ├── constants/      → Constantes compartidas (validation.ts)
│   ├── content/        → Contenido estático (coachMarks, welcomeTour)
│   ├── domain/         → Lógica de dominio pura (affinity, dimensiones, eleccion)
│   ├── hooks/          → Hooks custom cross-cutting
│   ├── navigation/     → Stack navigator + tab constants (tabs implementados como BottomNav/Sidebar custom)
│   ├── screens/        → Pantallas + sub-componentes co-localizados
│   ├── services/       → Lógica de presentación/transformación (matching, cuestionario, comparar, share)
│   ├── store/          → Estado global Zustand (auth, cuestionario, elections, onboarding, coachmarks, theme)
│   ├── theme/          → Design tokens (colors, typography, spacing, radii, utils)
│   ├── types/          → Tipos TypeScript (api.ts 80.4KB — generado de OpenAPI)
│   └── utils/          → Utilidades puras (candidato, user, text)
```

### Feature Architecture

**Capas de responsabilidad:**
```
Screens         → Orquestación, UX, navegación
│  └── co-localized sub-components (1 screen sólo)
│
Services/Domain → Lógica pura de presentación/transformación (sin React)
│
API Hooks       → Server state (TanStack Query mutations/queries)
│
Stores          → Client state persistido (Zustand)
│
Theme           → Design tokens
```

**Regla de co-localización:**
> Si un componente solo se usa en UNA pantalla → vive al lado de esa pantalla en `screens/MiPantalla/`
> Si 2+ screens → `molecules/` (sin fetch) o `organisms/` (con fetch/estado)

### Atomic Design

| Capa | Criterio | Ejemplos |
|---|---|---|
| atoms/ | Primitivos sin lógica de dominio | Button, Icon, Avatar, Badge, Chip, Toggle, Spinner |
| molecules/ | 2+ atoms, sin fetch, 2+ usos | ProgressSplit, MatchTier, RadioGroup, BookmarkActions |
| organisms/ | Con fetch/estado propio o muy complejo | CuestionarioHeader, TopMatchSection, RankingCard, CandidatoPosturas |
| templates/ | Layout wrappers | AppShell, ScreenChrome |
| showcase/ | Catálogo visual (dev) | `*.showcase.tsx` por cada componente |

**Regla de atoms:** Un átomo NO debe importar de `domain/`, `services/` ni `screens/`.

### Design System

**Tokens:**
- `theme/colors.ts` — light/dark semantics + tint scales (50-900) + affinity tokens
- `theme/typography.ts` — h1/h2/h3/body/small/overline + typo especial (`numericDisplay`)
- `theme/spacing.ts` — escala sp1–sp9 (incremental)
- `theme/radii.ts` — rSm/rMd/rLg/rFull
- `theme/utils.ts` — `withAlpha(color, alpha)`

**Paleta principal:**
- `primary`: #2E5F7E (azul petróleo) — CTAs principales
- `brandAccent`: #3A9E7A (verde vibrante) — máx 3 usos por viewport (DS-10)
- `secondary`: #7BA098 (verde salvia) — progreso, secundarios
- Danger zone DS-11: `brandAccent` PROHIBIDO en cuestionario

**Dark mode:** Overrides declarativos. Grays invertidos. Tints absolutos (no se invierten, salvo excepciones como `info50` en dark → usa `info900`).

**Accesibilidad:** Todos los ratios de contraste verificados WCAG 2.2 AA.

### State Management

**TanStack Query** (server state):
- Queries: `useTiposEleccion`, `usePerfil`, `useMisElecciones`, `useFavoritos`, `useDescartados`, etc.
- Mutations: `useMatchCandidatos`, `useMatchAnonimo`, `useToggleFavorito`, `useToggleDescartado`, `useReiniciarCuestionario`
- Optimistic updates implementados en: `useToggleFavorito`, `useToggleDescartado` (BUG-045)

**Zustand** (client state):
| Store | Persiste | Contenido |
|---|---|---|
| useAuthStore | SecureStore | token, userId, isGuest, isHydrated |
| useCuestionarioStore | No | preguntas, respuestas, currentIndex, submitting |
| useElectionsPrefsStore | SecureStore | activeIds (null = todos) |
| useOnboardingStore | SecureStore | hasSeen, pendingAuthTarget (transient) |
| useCoachMarksStore | SecureStore por userId | seen tours por identidad |
| useThemeStore | SecureStore | `mode: "light"|"dark"|"system"`, `effective: "light"|"dark"` resuelto, `setMode()` |

### Routing

```
AppNavigator (flat NativeStack — sin Tab Navigator)
  ├── Si !hasSeen → OnboardingScreen
  ├── Si !isAuthenticated && !isGuest → Auth Stack
  │     ├── Login (default o según pendingAuthTarget)
  │     ├── Register
  │     ├── PasswordResetRequest
  │     └── PasswordResetConfirm
  └── Si isAuthenticated || isGuest → Main Stack
        ├── Home
        ├── Candidatos
        ├── MisGuardados
        ├── MisRespuestas
        ├── Configuracion
        ├── Cuestionario
        ├── Resultados
        ├── SubmitDone
        ├── DetalleCandidato
        ├── Comparar
        ├── Perfil
        ├── GestionElecciones
        ├── DesignSystem (__DEV__ only)
        └── OnboardingPreview (__DEV__ only)

Nota: la bottom bar visible en el Main Stack es un componente UI propio
(BottomNav dentro de AppShell), NO un React Navigation Tab Navigator.
```

### API Layer

**cliente Axios** (`api/client.ts`):
- Base URL configurable via `EXPO_PUBLIC_API_BASE`
- Auth dual: Token header (native) | Cookie httpOnly (web)
- Interceptor de 401 → limpia sesión automáticamente

**Env vars:**
| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_API_BASE` | Base URL del backend |
| `EXPO_PUBLIC_DJANGO_ADMIN_URL` | URL del admin Django (dev) |
| `EXPO_PUBLIC_APP_URL` | URL pública para compartir |

---

## Componentes Críticos

### AppShell (`templates/AppShell.tsx`)
Wrapper de pantallas con bottom tab bar. Recibe `active: AppTab | null` para resaltar el tab activo (`AppTab` = `"home" | "candidatos" | "comparar" | "config"`).
Todas las pantallas principales pasan por él (excepto modales que usan `ScreenChrome`).

### ScreenChrome (`templates/ScreenChrome.tsx`)
Wrapper básico para pantallas modales (Cuestionario, SubmitDone). Sin bottom nav.

### HomeHeroSection (`organisms/`)
Hero oscuro (#1C3A52) con saludo, avatar, countdown ring, CTA accent y trust meta row.
CTA tiene lógica compleja: "Empezar" | "Continuar" | "Ver mis matches" | "Empezar [nombre]".
Regla DS-11: usa `brandAccent` (verde vibrante) — máx 3 usos por viewport.

### TopMatchSection (`organisms/`)
Card del candidato #1 en resultados: foto, nombre, porcentaje grande, RadarChart, acciones (favorito/descartar).

### RankingCard / RankingRow (`organisms/`)
Cards del ranking #2+. RankingCard tiene RadarChart mediano. RankingRow es compacta.
Responsive: `flexBasis` calculado en el componente padre (`ResultadosScreen`) para no recalcular por ítem.

### CuestionarioHeader (`organisms/`)
Header sticky fuera del ScrollView. Breadcrumb (N de M) + progress split + back + info.
Fuera del scroll = siempre visible sin importar cuánto scroll haya.

### CandidatoPosturas (`organisms/`)
Lista de posturas por eje de un candidato. Soporta UX-080 (bookmark de posturas individuales).
BUG-017: ítems sin justificación no son interactivos (no tienen expand).

### RadarChart (`atoms/RadarChart.tsx`)
SVG radar chart de afinidad por eje temático. Usa react-native-svg.
`breakdownToChartData()` en `api/endpoints.ts` transforma el payload del backend al formato del chart (`Record<string, number>`).

### BookmarkActions (`molecules/`)
Par de botones favorito/descartar. Recibe `isFavorito`, `isDescartado`, loading state.

### FilterBottomSheet (`organisms/`)
Bottom sheet para filtros (partido en Resultados, tipo en Candidatos). Patrón reutilizado.

### CoachMarkTour (`organisms/` o `molecules/`)
Renderiza el tour correspondiente al `tourId`. Solo si `!hasSeen(tourId)` y `isHydrated`.
Tiene guard de `mountedAt > lastResetAt` para evitar re-mostrar tours de pantallas ya montadas.

---

## Hooks Importantes (`api/hooks.ts`)

| Hook | Tipo | Descripcion |
|---|---|---|
| `useTiposEleccion()` | Query | Tipos de eleccion (filtra es_base=true por default) |
| `usePerfil()` | Query | Email, username, comuna, etc. del usuario |
| `useMisElecciones()` | Query | Progreso por eleccion + top_match por cada una |
| `useMatchCandidatos()` | Mutation | Match autenticado (persiste en backend) |
| `useMatchesQuery(tipoEleccionId)` | Query | Lista de candidatos con match% (usa cache) |
| `useMatchAnonimo()` | Mutation | Match anonimo (guest, no persiste) |
| `useMatchDetalle(candidatoId)` | Query | Breakdown pregunta-a-pregunta para DetalleCandidato |
| `usePreguntas(tipoEleccionId)` | Query | Preguntas pendientes del cuestionario |
| `useFavoritos(opts?)` | Query | Lista de candidatos favoritos. `opts.enabled` para tab-aware |
| `useDescartados(opts?)` | Query | Lista de candidatos descartados |
| `useToggleFavorito()` | Mutation | Agrega/elimina favorito con optimistic update |
| `useToggleDescartado()` | Mutation | Agrega/elimina descartado con optimistic update |
| `useReiniciarCuestionario()` | Mutation | Borra respuestas del tipo de eleccion |
| `useMisRespuestas(tipoEleccionId)` | Query | Respuestas propias por tipo |
| `useMisRespuestasMultiple(tipoIds)` | Query (parallel) | Respuestas propias para multiples tipos a la vez |
| `useUpdateRespuesta()` | Mutation | Editar una respuesta ya enviada |
| `useCandidatos()` | Query | Catalogo completo de candidatos |
| `useCandidato(id)` | Query | Candidato individual por ID |
| `usePosturasCandidato(candidatoId, tipoId)` | Query | Posturas de un candidato filtradas por tipo |
| `usePosturasBookmarks(opts?)` | Query | Posturas guardadas (bookmarks) |
| `useTogglePosturaBookmark()` | Mutation | Agregar/quitar bookmark de postura |
| `useCambiarPassword()` | Mutation | Cambiar password con verificacion |
| `useCambiarUsername()` | Mutation | Cambiar username con verificacion |
| `useCambiarEmail()` | Mutation | Cambiar email con verificacion |
| `useEliminarCuenta()` | Mutation | Eliminar cuenta (danger zone) |
| `useRegiones()` | Query | Lista de regiones de Chile |
| `useComunas(regionId?, q?)` | Query | Comunas, opcionalmente filtradas por region o texto |
| `useActualizarComuna()` | Mutation | Actualizar la comuna del perfil del usuario |
| `useRequestPasswordReset()` | Mutation | Solicitar email de reset |
| `useConfirmPasswordReset()` | Mutation | Confirmar reset con token + nueva password |

**Patron TASK-047:** Queries de favoritos/descartados/bookmarks tienen `opts.enabled` para activarse solo cuando el tab es visible.

---

## Servicios (Lógica Pura)

### `services/matching.ts`
- `getMatchTier(pct)` → MatchTier (aff1-aff5)
- `getMatchColor(pct)` → hex color para el porcentaje
- `getConfianzaBadge(confianza)` → label legible
- `getConfianzaBadgeVariant(confianza)` → variant del Badge
- `isConfianzaTentativa(confianza)` → boolean
- `getLikertColor(valor)` → color para valor Likert 1-5
- `confianzaToTier(confianza)` → ConfianzaTier (`"high"` | `"mid"` | `"low"`)
- `sortByMatchDesc(results)` → ordena por match_percentage DESC
- `formatMatchPercentage(pct)` → string (e.g. `"87%"`)

### `services/cuestionario.ts`
- `PESOS` → array de `{value, label, labelLargo}` para los 4 pesos
- `PESO_LABELS_DISPLAY` → Record<PesoValue, string> indexado por valor (labels largos)
- `DEFAULT_PESO = 2`
- `MIN_RESPUESTAS_PARA_RESULTADO = 10`
- `separarOpciones(opciones)` → `{regulares, noSe}` (opción "No sé" separada)
- `debeMostrarPeso(opciones, opcionElegidaId)` → boolean
- `calcularProgreso(currentIndex, total)` → number (0–100).  **NO** recibe respuestas ni devuelve objeto
- `puedeEnviar(preguntas, respuestas)` → boolean (valida TODAS las preguntas)
- `formatSubtitleCuestionario(idx, total, particion?)` → `"N de M · base|extras"`
- `esUltimaPregunta(currentIndex, total)` → boolean (función, no valor)
- `esPrimeraPregunta(currentIndex)` → boolean (función, no valor)

### `services/comparar.ts`
- `NivelCoincidencia` type: identica | cercana | opuesta | solo_uno | ninguno
- `compararPosturas(postura1, postura2)` → NivelCoincidencia
- `calcularResumen(comparaciones)` → {identicas, cercanas, opuestas, soloUno, ninguno}

### `services/share.ts`
- `APP_URL` → `EXPO_PUBLIC_APP_URL` o `"https://votoafin.cl"`
- `TOP_N = 5` → máximo de candidatos en el texto compartido
- `buildShareText({tipoNombre, matches})` → string formateado
- `fromMatchResults(results)` → transforma resultados al shape de `buildShareText`
- `canShareNative()` → booleano (Web Share API disponible)
- `shareNative(text)` / `copyToClipboard(text)`

### `domain/affinity.ts`
- `AffinityTier` type: 1-5
- `getAffinityTier(pct)` → AffinityTier (umbrales: 21/41/61/81)
- Colores light/dark por tier

### `domain/dimensiones.ts`
- `DimensionKey` type: 7 valores (`"economico"` | `"social"` | `"cultural"` | `"ambiental"` | `"institucional"` | `"pueblos_originarios"` | `"discapacidad"`)
- `DIMENSIONES` catalog: badge/text/border colors por tema light/dark
- `EJE_LABELS` → mapa ejeBackend (ECONOMIA, SOCIEDAD…) → label legible
- `EJE_TO_DIMENSION_KEY` → 4 mapeados (ECONOMIA, SOCIEDAD, AMBIENTE, INSTITUCIONAL), 4 `null` (SEGURIDAD, DDHH, INTERNACIONAL, OTRO)
- `getDimensionColorsForEje(eje, isDark)` → colores o null

### `domain/eleccion.ts`
- `EleccionEstado` type
- `deriveEleccionEstado(tipo, progreso)` → estado derivado
- `formatProgresoLabel(respondidas, total)` → "N de M"
- `computeProgresoRatio(respondidas, total)` → 0-1
- `computeDiasRestantes(fecha)` → número o null
- `formatDiasRestantesChip(dias)` → label legible
- `sortTiposByPriority(tipos)` → ordena por prioridad (heurística por nombre)
- `requiereFiltroTerritorial(nombre)` → boolean (regex-based)

### `utils/user.ts`
- `extractEmailPrefix(email)` → parte antes del @
- `deriveInitials(emailOrPrefix)` → "JV" (2 letras de segmentos por punto)
- `deriveDisplayName(emailOrPrefix)` → primer segmento
- `greetingForHour(hour?)` → saludo contextual

---

## Estado Global (Stores)

### `useAuthStore`
```typescript
{
  token: string | null,           // SecureStore
  userId: number | null,          // SecureStore
  isGuest: boolean,               // in-memory (NO persiste)
  isHydrated: boolean,
  isAuthenticated: boolean,       // derivado: isWeb ? userId != null : Boolean(token)
  hydrate(), setSession(), logout(), enterGuestMode(), exitGuestMode()
}
```

### `useCuestionarioStore`
```typescript
{
  tipoEleccionId: number | null,  // in-memory
  preguntas: Pregunta[],          // in-memory
  currentIndex: number,           // in-memory
  respuestas: Record<number, RespuestaLocal>,
  loading, submitting,
  hasEverCompletedCuestionario: boolean,  // in-memory (UX-056)
  esTipoBase: boolean,            // seteado por loadForTipoEleccion
  loadForTipoEleccion(), setTipoEleccion(), setRespuesta(), setPeso(),
  next(), prev(), reset(), submit(), getRespuestasParaAnonimo()
}
```

### `useElectionsPrefsStore`
```typescript
{
  activeIds: number[] | null,     // SecureStore key: votoafin_active_elections (null = todos activos)
  isHydrated: boolean,
  hydrate(), initializeIfNull(), toggle(), activate(), deactivate(), reset()
}
// helper: partitionTipos(tipos, activeIds) → {activas, disponibles}
```

### `useOnboardingStore`
```typescript
{
  hasSeen: boolean,               // SecureStore
  isHydrated: boolean,
  pendingAuthTarget: "Login" | "Register" | null,  // transient
  hydrate(), markSeen(), setPendingAuthTarget(), consumePendingAuthTarget(), reset()
}
```

### `useCoachMarksStore`
```typescript
{
  seen: Partial<Record<TourId, true>>,  // SecureStore por userId
  isHydrated: boolean,
  currentUserId: number | null,
  lastResetAt: number,            // timestamp del último resetAll()
  hasSeen(), markSeen(), resetAll(), hydrateFor()
}
```

---

## Flujos

### Flujo Principal: Cuestionario → Resultados

```
Home
  ├── [tap elección] → loadForTipoEleccion(id, esTipoBase)
  │     ├── Si ya completa → navigate("Resultados")
  │     └── Si incompleta → navigate("Cuestionario")
  │
  └── Cuestionario
        ├── Una pregunta por vez (next/prev)
        ├── Opción + peso
        ├── isLast → "Enviar" → submit()
        │     ├── isGuest: skipServer=true
        │     └── isAuth: POST /respuestas/ → invalida cache
        └── navigate("SubmitDone", {mode})
              └── navigate("Resultados")
                    ├── isGuest: POST /match-anonimo/ con respuestas locales
                    └── isAuth: POST /match-candidatos/ (usa backend cache)
```

### Flujo: Home → Detalle de Candidato

```
Home → "Ver perfil" en MatchSummaryCard
  └── navigate("DetalleCandidato", {
        candidatoId, breakdown, matchPct, confianza
      })
        ├── AfinidadTab (breakdown_por_eje como RadarChart) — tab por defecto si hay match
        └── ResumenTab (estadísticas) — oculta temporalmente (UX-070 resuelto; pendiente rediseño)
```

### Flujo: Resultados → Guardar/Descartar

```
ResultadosScreen
  ├── handleToggleFav(candidatoId)
  │     ├── optimistic: actualiza cache inmediatamente
  │     ├── POST /favoritos/ (si agregar) o DELETE (si quitar)
  │     └── toast.success/info
  └── handleToggleDesc(candidatoId)
        ├── optimistic: actualiza cache + oculta del ranking
        ├── POST /descartados/ (si agregar) o DELETE (si quitar)
        └── toast.info con "Deshacer" (5s) → re-POST /descartados/ si undo
```

### Flujo: Onboarding → Auth → Main

```
App.tsx → hydrate() (todos los stores)
  ├── !hasSeen → OnboardingScreen
  │     └── markSeen() → pendingAuthTarget = "Login" | "Register"
  │           └── swap a Auth Stack (consumePendingAuthTarget)
  ├── !isAuthenticated && !isGuest → Auth Stack
  │     ├── Login → setSession(token, userId) → swap a Main
  │     └── Register → (login automático o manual)
  └── isAuthenticated || isGuest → Main Stack
```

### Edge Cases documentados

| Situación | Comportamiento |
|---|---|
| Tipo base → Resultados | Guardia con CTA a primera elección específica activa |
| Sin respuestas → submit | No llama al backend, retorna inmediatamente |
| 401 del servidor | Interceptor Axios limpia sesión → vuelve a Login |
| Storage corrompido | try/catch → SeenMap vacío (CoachMarks) / token null (Auth) |
| Cookie expirada en web | Primer 401 → limpia userId de sessionStorage |
| Filtro partido elimina todos | Empty state específico con CTA "Ver todos" |
| Timer "Deshacer" expirado | Descartar es permanente hasta nueva acción |

---

## Dependencias

### Externas críticas

| Dependencia | Versión | Propósito |
|---|---|---|
| expo | ~57 | Runtime cross-platform |
| react-native | 0.86 | UI primitives |
| react | 19 | Component model |
| zustand | 5 | Client state |
| @tanstack/react-query | 5 | Server state + cache |
| axios | - | HTTP client |
| expo-secure-store | - | Almacenamiento encriptado |
| react-native-svg | - | RadarChart |
| @react-navigation/native | - | Routing |
| typescript | ~6 | Type system |

### Internas críticas

| Módulo | Consumidores |
|---|---|
| `store/auth.ts` | Casi todas las screens + hooks |
| `store/cuestionario.ts` | CuestionarioScreen, ResultadosScreen, HomeScreen |
| `store/electionsPrefs.ts` | HomeScreen, ResultadosScreen, GestionElecciones |
| `services/matching.ts` | ResultadosScreen, DetalleCandidato, RankingCard |
| `domain/dimensiones.ts` | CuestionarioScreen, RadarChart, DimensionBadge |
| `api/hooks.ts` | Casi todas las screens |
| `theme/colors.ts` | Todos los componentes via `useThemeColors()` |

---

## Hallazgos Relevantes

### Feature Flags implícitos
- `__DEV__`: controla acceso a DesignSystem + Django Admin en ConfiguracionScreen
- `is_base` flag en TipoEleccion: cambia completamente el flujo de Cuestionario y Resultados
- `isGuest`: alterna entre modo read-only y completo

### Constantes críticas con impacto en UX
- `MIN_RESPUESTAS_PARA_RESULTADO = 10` — umbral que el PM puede querer ajustar
- `DEFAULT_PESO = 2` — afecta scoring de todos los usuarios que no tocan el peso
- `TOP_N = 5` — máximo candidatos en texto compartido

### Patrones reutilizables identificados
- **Optimistic update pattern**: `useToggleFavorito` / `useToggleDescartado`
- **Co-location pattern**: `screens/DetalleCandidato/`, `screens/Home/`
- **opts.enabled pattern**: queries activadas solo cuando el tab está visible (TASK-047)
- **Dual storage pattern**: `secureStorage.ts` — native vs web transparente
- **Showcase pattern**: `*.showcase.tsx` por cada componente (dev catalog)
- **FilterBottomSheet pattern**: reutilizado en Resultados y Candidatos

### Configuración pendiente de estandarizar
- `EXPO_PUBLIC_API_BASE` debe coincidir con `ALLOWED_HOSTS` del backend
- `EXPO_PUBLIC_DJANGO_ADMIN_URL` oculto por seguridad (no hardcodear en producción)

---

## Deuda Técnica

### DT-01: Heurística de filtro territorial
`requiereFiltroTerritorial(nombre)` usa regex sobre el nombre del tipo de elección.
**Fix:** El backend debería exponer un flag `requiere_filtro_territorial: boolean` en `TipoEleccion`.

### DT-02: Mapeo EJE_TO_DIMENSION_KEY incompleto
Solo 4 de los 8 ejes están mapeados a `DimensionKey`. Los 4 restantes retornan `null`.
**Impacto:** Colores por dimensión no disponibles para esos ejes → fallback a `c.primary`.

### DT-03: Constante PASSWORD_MIN_LENGTH desacoplada del backend
Si Django cambia `MinimumLengthValidator`, hay que actualizar `constants/validation.ts` manualmente.
**Fix:** Endpoint `/api/v1/config/` que exponga reglas de validación.

### DT-04: sortTiposByPriority basado en heurística de nombre
El orden de prioridad de las elecciones se determina por regex sobre el nombre.
**Fix:** Campo `prioridad: number` en `TipoEleccion` del backend.

### DT-05: Tipos de api.ts generados (80.4KB)
`types/api.ts` es un archivo generado de OpenAPI. No editarlo manualmente.
Si el schema del backend cambia, regenerar con el generador correspondiente.
**Riesgo:** El archivo no incluye `es_no_se` en `OpcionRespuesta` (BUG-027) — workaround en el código.

### DT-06: StyleSheet.create en componentes con tema (inconsistencia)
Algunos componentes usan `useMemo([c])` para estilos dinámicos, otros usan el patrón correcto
de separar estilos estáticos a nivel de módulo y solo los dinámicos inline.
**Referencia:** `components/README.md` + TASK-066.

### DT-07: CandidatoPicker lento (BUG-044)
El picker de candidatos en CompararScreen es lento al abrir el modal y al filtrar.
**Estado:** RESUELTO 2026-08-02 — FlatList virtualizada + useMemo para candidatos filtrados. Ver `CandidatoPickerModal.tsx`.

### DT-08: ResumenTab en DetalleCandidato
UX-070: la tab Resumen debe ocultarse temporalmente; AfinidadTab debe ser la primera.
**Estado:** RESUELTO 2026-08-02 (commit ca70bc4) — ResumenTab oculta del Tabs nav; AfinidadTab es el default cuando hay match. Pendiente: rediseño de ResumenTab cuando se integren noticias.

---

## Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Cookie httpOnly expira en web (silent 401) | Alto | Media | Interceptor Axios limpia sesión automáticamente |
| Heurística filtro territorial falla con nuevos tipos | Medio | Alta | Backend debe exponer flag |
| DEFAULT_PESO=2 infla scores inconsistentemente | Medio | Baja | Documentar en onboarding/UX |
| MIN_RESPUESTAS_PARA_RESULTADO hardcoded | Bajo | Baja | Mover a constante de config |
| EJE_TO_DIMENSION_KEY incompleto | Bajo | Alta (al agregar ejes) | Completar mapeo + test |
| PASSWORD_MIN_LENGTH desacoplado | Medio | Baja | Endpoint de config |
| BUG-044: CandidatoPicker lento | Alto UX | Alta | Optimización de renderizado |
| api.ts (80.4KB generado) desactualizado | Alto | Media | CI que regenere en cada cambio de schema |

---

## Base de Conocimiento

### ¿Cómo funciona el matching?
Ver **RN-01** (regla de negocio). Algoritmo no lineal con pesos de usuario y cobertura logarítmica. El backend es la fuente de verdad; el frontend solo presenta los resultados.

### ¿Cómo agrego una nueva pantalla?
1. Crear `screens/MiPantalla.tsx` (o `screens/MiPantalla/MiPantalla.tsx` si tiene sub-componentes)
2. Registrar en `navigation/AppNavigator.tsx` en el stack correspondiente
3. Agregar tipos de parámetros en `navigation/types.ts`
4. Si es un tab: agregar en `navigation/tabs.ts` + AppShell
5. Agregar `<CoachMarkTour tourId="mi-pantalla" />` si aplica

### ¿Cómo agrego un nuevo átomo?
1. Crear `components/atoms/MiAtomo.tsx`
2. Crear `components/atoms/MiAtomo.showcase.tsx` con casos visuales
3. Exportar desde `components/index.ts`
4. No importar de `domain/`, `services/` ni `screens/`

### ¿Cómo agrego una nueva elección?
El backend gestiona los tipos de elección. El frontend los consume via `useTiposEleccion()`.
Si la nueva elección requiere filtro territorial, asegurarse de que `requiereFiltroTerritorial()` la detecte (o mejor: agregar el flag al backend).

### ¿Cómo funciona el modo guest?
- `enterGuestMode()` en `useAuthStore`
- Todas las queries funcionan normalmente (sin token)
- Favoritos/descartados: sets vacíos (UI deshabilitada)
- Submit del cuestionario: `skipServer=true` → no persiste
- Match: usa `useMatchAnonimo()` con respuestas del store local
- Al restart: vuelve a Login (isGuest no persiste)

### ¿Cómo funciona la persistencia cross-platform?
`store/secureStorage.ts` abstrae:
- **Native:** expo-secure-store (Keychain iOS / KeyStore Android)
- **Web:** sessionStorage (excepto el token de auth que vive en cookie httpOnly)
El token en web nunca es accesible desde JS (httpOnly). Se detecta auth via userId en sessionStorage.

### ¿Por qué hay dos sistemas de colores de afinidad?
- `theme/colors.ts` → `affinity` / `affinityDark`: tokens del design system
- `domain/affinity.ts` → `getAffinityTier()`: lógica de negocio de umbrales
- `services/matching.ts` → `getMatchColor()`: función de presentación que une ambos
Están desacoplados intencionalmente para que el design y el dominio evolucionen independientemente.

### ¿Qué es el tipo base?
Un `TipoEleccion` con `es_base=true` contiene preguntas transversales que aplican a todos los matches de elecciones específicas. No tiene candidatos propios. La UI muestra UI diferenciada en Cuestionario y Resultados cuando se detecta.

### Glosario de términos del dominio
| Término | Significado |
|---|---|
| Eje temático | Dimensión política (Economía, Territorio, Medio Ambiente, Institucional, Seguridad, Derechos Sociales, Igualdad) |
| Tipo base | Cuestionario transversal sin candidatos propios |
| Confianza | Nivel de cobertura del match: TENTATIVA / MEDIA / ALTA |
| Coverage score | Match ponderado por log del número de preguntas consideradas |
| Guest | Usuario sin cuenta, match efímero, read-only |
| Breakdown por eje | Scores del match desglosados por cada eje temático (datos del RadarChart) |
| Peso | Importancia subjetiva del usuario para cada pregunta (0-3) |
| Postura | Respuesta declarada (candidato o usuario) en escala Likert 1-5 |
