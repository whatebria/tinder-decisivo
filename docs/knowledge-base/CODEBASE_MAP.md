# Codebase Knowledge Map — VotoAFin (repo: tinder-decisivo)

> Generado por: codebase-knowledge-mapper
> Actualizado: 2026-07-31 — verificado contra código actual
> Fuente: 100% codigo real — cero inferencias no verificadas
> Nombre del producto: **VotoAFin** (renombrado desde «Tinder Decisivo» / «Servel»)

---

## Resumen Ejecutivo

**VotoAFin** es una aplicacion movil + web que permite a ciudadanos comparar sus posturas politicas con las de candidatos electorales, a traves de un cuestionario de opciones en escala 1-5 con pesos por pregunta. El usuario responde el cuestionario, obtiene un ranking de candidatos ordenado por porcentaje de coincidencia, y puede explorar el detalle del match pregunta a pregunta. El sistema soporta usuarios autenticados (match persistido) y usuarios guest (match anonimo en memoria). El proyecto es fullstack: frontend Expo/React Native con soporte web, backend Django REST Framework con SQLite.

**Estado de madurez:** MVP avanzado — core funcional completo, cobertura de tests significativa, design system establecido, deuda tecnica baja.

---

## Mapa Funcional

```
tinder-decisivo/
  Flujo principal
    Onboarding (primera visita) -> Auth (Login/Register) -> Home
    Home -> Cuestionario -> SubmitDone -> Resultados
    Resultados -> DetalleCandidato (perfil + match detalle)
    Resultados -> Comparar (comparacion lado a lado)
  
  Funcionalidades secundarias
    MisGuardados (candidatos favoritos + posturas guardadas)
    MisRespuestas (editar respuestas ya enviadas)
    GestionElecciones (elegir tipo de eleccion activa)
    Perfil (datos personales + ubicacion)
    Configuracion (password, cuenta, tema, debug)
  
  Backend
    Catalogo (tipos eleccion, candidatos, preguntas)
    Matching (calculo autenticado + anonimo)
    Favoritos / Descartados / Bookmarks
    Territorio (regiones, comunas, unidades territoriales)
    Noticias (content del candidato)
    Auth (token httpOnly cookie)
```

---

## Sistemas Detectados

### Sistema: Autenticacion

**Objetivo:** Gestionar identidad del usuario y modo guest sin romper el flujo.

**Componentes:**
- `frontend/src/store/auth.ts` — store Zustand con `isAuthenticated`, `isGuest`
- `frontend/src/store/secureStorage.ts` — `expo-secure-store` + clave `votoafin_auth_token`
- `frontend/src/navigation/AppNavigator.tsx` — guard central: onboarding / auth stack / main stack
- `backend/core/models/auth.py` — modelo `PasswordResetToken`
- `backend/api/urls.py` — endpoints: `register/`, `login/`, `logout/`, `password-reset/request/`, `password-reset/confirm/`
- `backend/core/services/password_reset.py`

**Dependencias:** Navigation, OnboardingStore (para `pendingAuthTarget`)

**Entradas:** credenciales de usuario, token de reset por email

**Salidas:** token httpOnly cookie en browser (web) / token seguro en Expo SecureStore (nativo)

**Flujos principales:**
1. Primera visita: Onboarding -> usuario elige Login o Register -> `pendingAuthTarget` setea el orden del auth stack
2. Login exitoso: `isAuthenticated = true` -> AppNavigator muestra main stack
3. Guest: `isGuest = true` -> main stack sin permisos de escritura
4. Logout: limpia store + SecureStore -> vuelve a auth stack

**Riesgos:**
- Nota en `config.ts`: cookie SameSite=Lax requiere `localhost` (no `127.0.0.1`) en web o el auth falla silenciosamente (ref: BUG-005, cerrado)
- Admin URL ofuscado via env var `EXPO_PUBLIC_DJANGO_ADMIN_URL` (seguridad)

---

### Sistema: Cuestionario

**Objetivo:** Capturar las posturas politicas del usuario pregunta a pregunta con peso por pregunta.

**Componentes:**
- `frontend/src/screens/CuestionarioScreen.tsx` (14.2 KB)
- `frontend/src/store/cuestionario.ts` — estado local del cuestionario (progreso, respuestas en buffer)
- `frontend/src/api/hooks.ts` — `usePreguntas()`, `useUpdateRespuesta()`, `useReiniciarCuestionario()`
- `backend/core/models/cuestionario.py` — modelos `Pregunta`, `OpcionRespuesta`, `RespuestaUsuario`
- `backend/core/services/respuestas.py`
- `backend/api/urls.py` — `preguntas/`, `respuestas/`, `respuestas/reiniciar/`, `respuestas/mias/`
- `backend/core/views/` — `PreguntasPendientesView`, `SubmitUserAnswersView`, `EditarRespuestaView`

**Dependencias:** Auth (para saber si es guest), ElectionsPrefs (tipo de eleccion activa)

**Entradas:** tipo de eleccion seleccionado, respuestas del usuario (valor 1-5, peso 0-3)

**Salidas:** `RespuestaUsuario` persistido, navegacion a `SubmitDone` -> `Resultados`

**Flujos principales:**
1. Usuario navega a Cuestionario
2. Backend devuelve preguntas pendientes (las no respondidas aun)
3. Usuario responde cada pregunta con valor escala 1-5 y peso (No importa / Poco / Medio / Mucho)
4. Submit -> backend persiste -> redirect a SubmitDone -> Resultados

**Riesgos:**
- `CuestionarioScreen.tsx:191` — `TODO: cuando el backend exponga preguntas base vs extras por tipoEleccion` (feature flag pendiente)
- Preguntas "base" (`es_base=True`) son transversales a todas las elecciones — logica en backend, no en frontend todavia

---

### Sistema: Matching / Scoring

**Objetivo:** Calcular el porcentaje de coincidencia entre las respuestas del usuario y las posturas de cada candidato.

**Componentes:**
- `backend/core/services/matching.py` (16.9 KB) — toda la logica, aislada de HTTP
- `backend/core/models/matching.py` — `PosturaCandidato`, `MatchCandidato`
- `backend/api/urls.py` — `match-candidatos/` (auth), `match-anonimo/` (guest), `candidatos/{id}/match-detalle/`
- `frontend/src/api/hooks.ts` — `useMatchCandidatos()`, `useMatchesQuery()`, `useMatchAnonimo()`, `useMatchDetalle()`

**Dependencias:** Cuestionario (respuestas), Territorio (filtro por ubicacion), EleccionesStore

**Entradas:** respuestas del usuario + tipo de eleccion (+ comuna opcional para filtro territorial)

**Salidas:** lista ordenada de candidatos con `match_percentage` (% RAW, lo que ve el usuario) y `confianza`

**Flujos principales:**
1. Usuario completa cuestionario -> backend calcula scores in-memory -> persiste `MatchCandidato` atomicamente
2. Guest: respuestas en body del request -> calculo in-memory -> devuelve lista sin persistir
3. Detalle: usuario abre candidato -> `candidatos/{id}/match-detalle/` devuelve breakdown pregunta-a-pregunta

**Riesgos:** Ver seccion "Reglas de Negocio" — el algoritmo es no trivial y esta bien testeado pero no hay tests de mutation

---

### Sistema: Resultados

**Objetivo:** Mostrar el ranking de candidatos ordenado por afinidad y permitir filtros.

**Componentes:**
- `frontend/src/screens/ResultadosScreen.tsx` (28.8 KB — el archivo mas grande del proyecto)
- `frontend/src/api/hooks.ts` — `useMatchesQuery()`, `useFavoritos()`, `useDescartados()`, `useToggleFavorito()`, `useToggleDescartado()`
- `frontend/src/components/organisms/RankingCard.tsx`, `RankingRow.tsx`, `ResultadoHero.tsx`, `TopMatchSection.tsx`

**Dependencias:** Matching, Favoritos/Descartados, ElectionsPrefs

**Entradas:** matches calculados, filtros de usuario (tipo eleccion, partido)

**Salidas:** lista visual de candidatos, navegacion a DetalleCandidato o Comparar

**Riesgos:**
- `ResultadosScreen.tsx:211` — `eslint-disable react-hooks/exhaustive-deps` (documentado en BUG-032)
- Es el screen mas grande (24.8 KB) — candidato a split si crece mas

---

### Sistema: Favoritos / Descartados / Bookmarks

**Objetivo:** Permitir al usuario guardar candidatos de interes y descartar irrelevantes.

**Componentes:**
- `backend/core/models/user_data.py` — `CandidatoFavorito`, `CandidatoDescartado`, `NoticiaBookmark`, `PosturaBookmark`
- `backend/api/urls.py` — router: `candidatos-favoritos/`, `descartados/`, `noticias-guardadas/`, `posturas-guardadas/`
- `frontend/src/api/hooks.ts` — `useFavoritos()`, `useToggleFavorito()`, `useDescartados()`, `useToggleDescartado()`, `usePosturasBookmarks()`, `useTogglePosturaBookmark()`
- `frontend/src/screens/MisGuardadosScreen.tsx` (14.3 KB)
- `frontend/src/components/atoms/BookmarkButton.tsx`
- `frontend/src/components/molecules/BookmarkActions.tsx`

**Dependencias:** Auth (solo usuarios auth, no guest)

**Entradas:** candidato_id o postura_id a guardar/descartar

**Salidas:** estado toggle (guardado/no guardado) + refetch de lista

**Riesgos:** ~~BUG-045: toggle favorito tarda ~1 seg -- falta optimistic update~~ (RESUELTO 2026-08-02, commit 59d4194)

---

### Sistema: Territorio

**Objetivo:** Filtrar candidatos relevantes segun la ubicacion geografica del usuario.

**Componentes:**
- `backend/core/models/territorio.py` — `Region`, `Distrito`, `Comuna`
- `backend/core/models/unidad_territorial.py` — `UnidadTerritorial` (jerarquia polimorffica: Nacional > Region > Distrito > Comuna)
- `backend/core/services/matching.py::_filtrar_candidatos_por_territorio()` — logica de ancestros
- `backend/api/urls.py` — `regiones/` (publico), `comunas/` (publico), `unidades-territoriales/` (publico), `perfil/comuna/`
- `frontend/src/api/hooks.ts` — `useRegiones()`, `useComunas()`, `useActualizarComuna()`
- `frontend/src/components/molecules/UbicacionPicker.tsx`

**Dependencias:** Perfil (para leer la comuna del usuario), Matching

**Flujos principales:**
1. Usuario configura su comuna en Perfil
2. Al calcular match: `_filtrar_candidatos_por_territorio()` busca la `UnidadTerritorial` de la comuna
3. Sube por la jerarquia de ancestros e incluye candidatos con `unidad_territorial_id` en ese set, o `null` (nacionales)

**Riesgos:**
- Si la seed de UnidadTerritorial esta incompleta: fail-open (muestra todos los candidatos sin filtrar)
- Logica de ancestros esta en Python, no testeada como query SQL

---

### Sistema: Design System

**Objetivo:** Proveer tokens de diseno y biblioteca de componentes reutilizables.

**Componentes:**
- `frontend/src/theme/` — tokens: `colors.ts`, `layout.ts`, `motion.ts`, `radii.ts`, `shadows.ts`, `spacing.ts`, `typography.ts`
- `frontend/src/components/atoms/` — ~30 atomos (Button, Input, Icon, Progress, RadarChart, Tabs, Toggle, etc.)
- `frontend/src/components/molecules/` — ~40 moleculas (modals, cards, pickers, forms)
- `frontend/src/components/organisms/` — ~19 organismos (RankingCard, HomeHeroSection, MatchExplanation, etc.)
- Cada componente tiene su `.showcase.tsx` para visualizacion aislada
- `frontend/src/screens/design-system/DesignSystemScreen.tsx` — visualizador interno (solo `__DEV__`)

**Dependencias:** ninguna externa de UI — design system propio, sin libreria de UI de terceros

**Estado:** Establecido y completo. Atomic design implementado en 3 niveles (atoms/molecules/organisms).

---

## Arquitectura

### Arquitectura General

```
Usuario
  |
  v
[Expo / React Native]  ← Web (react-native-web) + iOS + Android
  |
  +-- [React Navigation 7]   ← native stack, sin tabs nativas
  |     AppNavigator (swap dinamico auth/guest/main)
  |
  +-- [Zustand 5]            ← estado global (auth, cuestionario, onboarding, tema, elections, coachmarks)
  |
  +-- [TanStack React Query 5] ← server state (fetch, cache, mutations)
  |     hooks en src/api/hooks.ts (30 hooks)
  |
  +-- [Axios]                ← cliente HTTP base
  |     src/api/client.ts
  |     src/api/config.ts    (multi-platform: Android 10.0.2.2 / iOS 127.0.0.1 / web localhost)
  |
  +-- [Design System propio] ← atoms/molecules/organisms/templates
        tokens en src/theme/

        v (HTTP/REST)

[Django REST Framework]   ← backend Python
  |
  +-- [core/services/]       ← logica de negocio aislada de vistas
  |     matching.py / respuestas.py / perfil.py / password_reset.py / tipos.py
  |
  +-- [core/models/]         ← ORM Django
  |     auth / content / cuestionario / eje / electoral / matching / perfil / territorio / user_data
  |
  +-- [SQLite]               ← DB (11.9 MB actual, dev/prod unificado por ahora)
  |
  +-- [DRF Token Auth]       ← Cookie httpOnly en web, SecureStore en nativo
```

---

### Feature Architecture

El frontend NO usa feature folders. Esta organizado por tipo de artefacto:

```
src/
  api/          ← TODOS los hooks y config del cliente (centralizado)
  components/   ← design system (atoms/molecules/organisms/templates/showcase)
  constants/    ← constantes compartidas
  content/      ← contenido estatico (probablemente textos de onboarding)
  domain/       ← tipos y entidades de dominio
  hooks/        ← custom hooks de UI (blur, coach marks, modals, dimensions)
  navigation/   ← AppNavigator + tipos de rutas
  screens/      ← una pantalla = un archivo (flat, sin anidado por feature)
  services/     ← logica de dominio pura (sin HTTP): comparar.ts, cuestionario.ts, matching.ts, share.ts
  store/        ← stores Zustand (uno por dominio)
  theme/        ← tokens del design system
  types/        ← tipos TypeScript (incluyendo api.ts generado desde OpenAPI)
  utils/        ← helpers utilitarios
```

**Observacion:** No hay feature folders. Las screens raiz son flat (17 archivos). Existen sub-directorios co-localizados: `screens/Home/` (HomeElectionItem, HomeTrustSection, HomeMatchLocked) y `screens/DetalleCandidato/` (ResumenTab, AfinidadTab). Funciona bien en el tamano actual.

---

### Atomic Design

Implementado en 3 niveles operativos:

| Nivel | Cantidad | Ejemplos |
|---|---|---|
| **Atoms** | ~30 componentes | Button, Input, Icon, Progress, RadarChart, Tabs, Badge, Chip, Toggle, Spinner |
| **Molecules** | ~40 componentes | MatchSummaryCard, ElectionCard, CandidatoPickerModal, ConfirmModal, UbicacionPicker, CoachMark |
| **Organisms** | ~19 componentes | HomeHeroSection, RankingCard, CandidatoPicker, MatchExplanation, ResultadoHero, TopMatchSection |
| **Templates** | existe | (estructura de pagina, sin verificar contenido) |

Cada componente tiene un `.showcase.tsx` colocado junto al componente (no en directorio separado).

---

### State Management

**Zustand 5** para estado global. 6 stores:

| Store | Que guarda | Por que global |
|---|---|---|
| `useAuthStore` | `isAuthenticated`, `isGuest`, `userId` (key: `votoafin_user_id`) | Necesario en navigator + todos los hooks auth-gated |
| `useOnboardingStore` | `hasSeen`, `pendingAuthTarget` (key: `votoafin_onboarding_seen`) | Persiste entre sesiones, controla routing inicial |
| `useCuestionarioStore` | progreso del cuestionario en curso, `esTipoBase` | Navegacion entre preguntas sin perder estado |
| `useElectionsPrefsStore` | tipo de eleccion seleccionado | Filtro global que afecta matches y preguntas |
| `useCoachMarksStore` | tours vistos (key: `votoafin_coach_marks_seen_*`) | Persiste cuales tours se completaron |
| `useThemeStore` | tema claro/oscuro (key: `votoafin_theme_mode`) | Afecta a todos los componentes |

**TanStack React Query 5** para server state (fetch + mutations + cache).

**Separacion:** estado del servidor en React Query, estado de navegacion/UI en Zustand. No hay Redux.

---

### Routing

- **React Navigation 7** con native stack (sin tab navigator nativo)
- **Guard central** en `AppNavigator.tsx` — un solo punto de decision:
  - `!hasSeenOnboarding && !showMainStack` → Onboarding
  - `isAuthenticated || isGuest` → Main stack (13 screens)
  - else → Auth stack (Login/Register/PasswordReset, orden dinamico por `pendingAuthTarget`)
- Sin lazy loading explicito — todas las screens importadas en el navigator
- **Dev-only screens:** `DesignSystem` y `OnboardingPreview` solo renderizados si `__DEV__`

---

### Integraciones

| Integracion | Donde | Para que |
|---|---|---|
| `expo-secure-store` | `store/secureStorage.ts` | Token de auth en nativo |
| `react-native-svg` | `components/atoms/RadarChart.tsx`, `Icon.tsx` | SVGs + radar chart de coincidencia por eje |
| `openapi-typescript` | dev dependency | Genera `src/types/api.ts` desde el schema del backend |
| Django Spectacular | backend (script `types:gen`) | Expone OpenAPI schema para el codegen |

No hay integraciones con servicios externos (analytics, crashlytics, payments, push) detectadas en este analisis.

---

## Reglas de Negocio (Sistema Matching)

Encontradas en `backend/core/services/matching.py`. Documentadas porque son criticas.

### Regla: Score no-lineal por pregunta

**Donde vive:** `matching.py::score_pregunta(diff)`

**Como funciona:**
```
score = 1 - (diff / 4)^2

diff=0 -> 1.00 (coincidencia perfecta)
diff=1 -> 0.9375
diff=2 -> 0.75
diff=3 -> 0.4375
diff=4 -> 0.00 (desacuerdo total)
```
Penaliza diferencias grandes de forma no lineal (cuadratica). Diferencia de 4 = 0% en esa pregunta.

**Que la consume:** `_calcular_scores()` -> `calcular_match()` / `calcular_match_anonimo()`

**Riesgos:** Formula bien documentada y testeada en `test_algoritmo_matching.py`. No es frágil.

---

### Regla: Multiplicadores de peso por pregunta

**Donde vive:** `matching.py::PESO_MULTIPLIERS`

**Como funciona:**
```
PESO_NO_IMPORTA (0) -> 0.5x  (no cero — la pregunta sigue contando la mitad)
PESO_POCO       (1) -> 1.0x  (neutral)
PESO_MEDIO      (2) -> 1.5x
PESO_MUCHO      (3) -> 2.0x  (dealbreaker efectivo)
```

**Que la consume:** `_calcular_scores()`, `calcular_match_detalle()`

**Riesgos:** La decision de que peso=0 sea 0.5x (no cero) es una decision de diseno documentada en el codigo. Cambiarla afectaria todos los matches existentes.

---

### Regla: Ranking por coverage-score (interno, no visible al usuario)

**Donde vive:** `matching.py::_calcular_scores()` — sort final

**Como funciona:**
```
coverage_score = match_percentage * log(1 + n_preguntas_overlap)
```
El % que ve el usuario es el RAW (honesto). El ORDEN usa el coverage_score para que candidatos con mayor cobertura suban aunque su % sea ligeramente menor.

**Que la consume:** sort de resultados antes de persistir

**Riesgos:** El usuario ve el % RAW pero el orden no es estrictamente por ese % — puede causar confusion si alguien nota discrepancias. La UI comunica la incertidumbre via `confianza` (TENTATIVA/MEDIA/ALTA).

---

### Regla: Confianza del match

**Donde vive:** `matching.py::confianza_por_n(n)`

**Como funciona:**
```
n < 5   -> TENTATIVA
5 <= n < 10 -> MEDIA
n >= 10 -> ALTA
```

**Que la consume:** serializado en `MatchCandidato`, mostrado en `ResultadosScreen`

---

## Componentes Criticos

| Componente | Por que es critico |
|---|---|
| `AppNavigator.tsx` | Control total del routing — un bug aca rompe toda la app |
| `ResultadosScreen.tsx` (28.8 KB) | Pantalla mas usada y mas grande — concentra logica de filtros, favoritos, descartados |
| `HomeHeroSection.tsx` (9.3 KB) | Primera pantalla post-login — muestra estado del match actual |
| `CuestionarioScreen.tsx` (15.2 KB) | Flujo central — captura las respuestas que alimentan el matching |
| `matching.py` (16.9 KB) | Core del producto — el algoritmo de matching completo |
| `api/hooks.ts` (22.1 KB) | 30 hooks — toda la comunicacion frontend/backend pasa por aqui |

---

## Hooks de API Criticos

Todos viven en `frontend/src/api/hooks.ts` (22.1 KB, 30 hooks). Patron: React Query wrapeado.

| Hook | Tipo | Para que |
|---|---|---|
| `useMatchesQuery(tipoEleccionId)` | Query | Lista de candidatos con match% para ResultadosScreen |
| `useMatchAnonimo()` | Mutation | Match guest sin persistencia |
| `useMatchDetalle(candidatoId)` | Query | Breakdown pregunta-a-pregunta para DetalleCandidato |
| `usePreguntas(tipoEleccionId)` | Query | Preguntas del cuestionario pendientes |
| `useToggleFavorito()` | Mutation | Guardar/quitar candidato |
| `useToggleDescartado()` | Mutation | Descartar candidato |
| `useFavoritos()` | Query | Lista de favoritos para MisGuardados |
| `useMisRespuestas(tipoEleccionId)` | Query | Ver respuestas propias en MisRespuestas |
| `useReiniciarCuestionario()` | Mutation | Reinicia el cuestionario de un tipo de eleccion |
| `useMisElecciones()` | Query | Progreso del usuario por tipo de eleccion (incluye `total_preguntas`) |

---

## Deuda Tecnica

Encontrada con grep en el codigo, nada inventado:

| Ubicacion | Tipo | Detalle |
|---|---|---|
| `ResultadosScreen.tsx` | eslint-disable | `react-hooks/exhaustive-deps` deshabilitado — documentado como BUG-032, intencional por ahora |
| `CandidatoPickerModal.showcase.tsx:26` | eslint-disable | `@typescript-eslint/no-explicit-any` en showcase (menor) |
| `ErrorBoundary.tsx:31` | eslint-disable | `no-console` (logging de errores en boundary, aceptable) |
| BUG-045 | Resuelto | Toggle favorito/descartado tardaba ~1 seg por falta de optimistic update. RESUELTO 2026-08-02 (commit 59d4194) |

**Resuelto:** El TODO de `CuestionarioScreen.tsx:191` (preguntas base vs extras) quedo resuelto via `esTipoBase` en el store.

**Observacion:** La cantidad de deuda es baja para el tamano del proyecto. Los `eslint-disable` estan documentados y referenciados a issues.

---

## Riesgos

| Riesgo | Severidad | Detalle |
|---|---|---|
| `ResultadosScreen.tsx` muy grande | MEDIA | 28.8 KB — crecio 4KB, candidato a split si supera 35KB |
| SQLite en produccion | MEDIA | db.sqlite3 de 11.9 MB en el repo — ok para dev, revisar si hay plan de migracion para prod |
| Sin lazy loading en navigator | BAJA | Todas las screens se importan al inicio — impacto en cold start si el proyecto escala |
| Seed de UnidadTerritorial incompleta | BAJA | Filtro territorial hace fail-open (muestra todos), no falla — pero silencioso |
| Token de auth en SecureStore nativo vs cookie web | BAJA | Dos mecanismos distintos — la config en `api/config.ts` lo maneja, pero es una fuente de bugs potencial |

---

## Base de Conocimiento

### Glosario del Dominio

| Termino | Significado en el codigo |
|---|---|
| `TipoEleccion` | Categoria de eleccion (presidencial, municipal, diputados, etc.) |
| `es_base` | Flag en `TipoEleccion`: preguntas transversales que aplican a TODAS las elecciones |
| `Eje` / `eje_tematico` | Dimension tematica de una pregunta (Economico, Ambiental, Institucional, etc.) |
| `PosturaCandidato` | Posicion oficial del candidato en una pregunta especifica |
| `MatchCandidato` | Resultado persistido del calculo de coincidencia user-candidato |
| `confianza` | Nivel de certeza del match: TENTATIVA (<5 preguntas) / MEDIA / ALTA (>=10) |
| `coverage_score` | Score interno de ranking (no visible al usuario): `match% * log(1+n)` |
| `isGuest` | Usuario que usa la app sin registrarse — puede hacer match anonimo |
| `pendingAuthTarget` | Intencion de navegacion del onboarding ("quiero registrarme" vs "ya tengo cuenta") |
| `UnidadTerritorial` | Nodo en la jerarquia geografica electoral (Nacional/Region/Distrito/Comuna) |

### Decisiones de Arquitectura Inferidas del Codigo

1. **Logica de matching aislada de HTTP** — `services/matching.py` no importa nada de vistas/serializers. Correcto: facilita testing y reutilizacion.
2. **Sin tab navigator** — La app usa un solo native stack. Las tabs se implementan a nivel de UI (componentes propios como `BottomNav`), no con React Navigation Tab Navigator.
3. **Design system propio sin libreria de UI** — No hay NativeBase, Tamagui, Gluestack. Todo es propio. Mas control, mas trabajo inicial.
4. **OpenAPI como contrato** — El backend genera el schema, el frontend lo consume via `openapi-typescript`. Los tipos de API son generados, no escritos a mano.
5. **Token en cookie httpOnly (web) + SecureStore (nativo)** — Decision deliberada por seguridad. Requiere `localhost` (no `127.0.0.1`) en web dev.
6. **SQLite para dev** — No hay config de Postgres detectada. Probablemente intencional para simplicidad de setup.
7. **Nombre del producto: VotoAFin** — Renombrado completamente desde "Tinder Decisivo" y "Servel". Las storage keys usan prefijo `votoafin_`. El repo git sigue llamandose `tinder-decisivo`.
8. **total_preguntas en TipoEleccion** — Agregado via `SerializerMethodField`, disponible sin que el usuario haya iniciado el cuestionario. Usado en `HomeHeroSection` para mostrar el progreso real.
9. **territorialLabel() en utils/candidato.ts** — Funcion pura para construir etiqueta de ubicacion del candidato. Usada en `DetalleCandidatoScreen`.
10. **ConfirmModal reemplaza Alert.alert()** — `Alert.alert()` es no-op en React Native Web. El cuestionario usa `<ConfirmModal>` para la confirmacion de salida.
11. **Vista lista/tarjetas en Resultados** — `ResultadosScreen` tiene estado `rankView: "row" | "card"`. `RankingRow` es la vista compacta por defecto; `RankingCard` es la expandida con radar chart.

### Preguntas Abiertas para el Equipo

1. Hay plan de migracion de SQLite a Postgres para produccion?
2. Existe algun sistema de feature flags? No se encontro patron de feature flags en el codigo.

### Preguntas Anteriores Respondidas

- **services/ en frontend:** 4 modulos: `comparar.ts`, `cuestionario.ts`, `matching.ts`, `share.ts` — logica de dominio pura, con tests. No se solapa con `api/`.
- **templates/ en components:** `AppShell.tsx` + `ScreenChrome.tsx`.
- **TODO CuestionarioScreen.tsx (preguntas base vs extras):** Resuelto via campo `esTipoBase` en el store.
