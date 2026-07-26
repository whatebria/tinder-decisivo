# Historial del proyecto por sprints

> Registro cronologico de todo el trabajo hecho sobre Tinder Decisivo.
> Cada sprint corresponde a una sesion (o bloque de sesiones) de trabajo con un objetivo claro.
> No son sprints en el sentido Scrum estricto — son iteraciones de valor entregado.

---

## Sprint 0 — Levantamiento del proyecto original

**Objetivo**: extraer el ZIP original del ramo de Apps Moviles y ponerlo en marcha.

**Entregables**:
- Extraccion de `servel-main.zip` a `puppy_workspace/servel_extract/`
- Setup del backend Django + DRF con `uv`, migraciones aplicadas
- Setup del frontend Expo con `npm install --legacy-peer-deps`
- Backend corriendo en `:8010` (el puerto `:8000` estaba tomado por otro proyecto OneDrive)
- Metro bundler corriendo en `:8081`
- Superuser `admin` creado
- 46 tests backend pasando

**Hallazgo**: el proyecto original tenia arquitectura funcional pero el flujo end-to-end fallaba porque **no habia posturas de candidatos cargadas en la DB**. Los matches devolvian 0% para todos.

---

## Sprint 1 — Integridad de datos (posturas de candidatos)

**Objetivo**: resolver el problema de matches vacios.

**Contexto**: en un intento inicial, el asistente cargo posturas basadas en estereotipos ideologicos ("Kast es de derecha entonces vota X en aborto"). La usuaria detecto el problema y exigio verificacion o marcado explicito de baja confianza.

**Decisiones**:
- Se eliminaron las 72 posturas inventadas y los matches viejos
- Se creo un management command `import_posturas.py` con validaciones estrictas:
  - `justificacion` minimo 20 caracteres
  - `fuente_url` debe empezar con `http://` o `https://`
  - `valor` entre 1 y 5 (Likert)
  - Transaccion atomica con `--dry-run` y `--update`
- Se genero `fixtures/posturas_template.csv` como plantilla vacia (72 filas: 6 candidatos × 12 preguntas)
- Se genero `fixtures/posturas_draft_verificar.csv` con **72 posturas marcadas con nivel de confianza** (`ALTA` / `MEDIA` / `BAJA`) en el campo `justificacion`, y URLs canonicas conocidas
- Distribucion: 14 alta, 23 media, 35 baja (Parisi y Sichel casi todo baja por falta de data publica)

**Entregables**:
- `backend/core/management/commands/import_posturas.py`
- `backend/fixtures/posturas_template.csv`
- `backend/fixtures/posturas_draft_verificar.csv` (72 filas)
- `backend/fixtures/README.md` con fuentes aceptables y no aceptables

**Validacion E2E**: se importaron las 72 posturas y se verifico via curl que el endpoint `POST /api/v1/match-candidatos/` devuelve matches entre 55% y 84%, con 11 preguntas consideradas y confianza `ALTA` para todos los candidatos.

**Aprendizaje clave**: nunca inventar datos. Si no se puede verificar, marcarlo explicitamente y dejar al usuario decidir si quiere usarlos.

---

## Sprint 2 — Refactor Fase 1: capa de servicios (frontend)

**Objetivo**: extraer logica pura de las screens para que sea testeable sin React.

**Problema**: el mismo helper `scoreColor` estaba duplicado en `ResultadosScreen` y `DetalleCandidatoScreen`. La logica de pesos, opciones y validacion vivia dentro de los componentes.

**Entregables**:
- `frontend/src/services/matching.ts`
  - `getMatchTier` — clasifica un porcentaje en tiers (`excellent` / `good` / `moderate` / `low`)
  - `getMatchColor` — devuelve el color asociado al tier
  - `formatMatchPercentage` — formatea numero como string
  - `getConfianzaBadge` — badge legible por nivel de confianza
  - `sortByMatchDesc` — orden descendente
- `frontend/src/services/cuestionario.ts`
  - `PESOS` — constante con los 4 pesos disponibles
  - `separarOpciones` — divide opciones en regulares vs "No se"
  - `debeMostrarPeso` — logica para decidir cuando mostrar el selector de peso
  - `calcularProgreso` — porcentaje de avance
  - `esUltimaPregunta`, `esPrimeraPregunta`, `puedeEnviar` — predicados de navegacion
- Refactor de `ResultadosScreen`, `CuestionarioScreen`, `DetalleCandidatoScreen` para usar los servicios

**Beneficios**:
- **DRY**: cero duplicacion de scoring/colores
- **Testeable**: los servicios son funciones puras, se testean sin renderizar
- **Cohesion**: las screens quedaron thin — solo renderizan y despachan

**Validacion**: `tsc --noEmit` limpio.

---

## Sprint 3 — Refactor Fase 2: TanStack Query

**Objetivo**: eliminar el patron `useState + useEffect + fetch` repetido en cada screen.

**Problema**: cada screen que necesitaba data del backend hacia:
```ts
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => { fetch(...).then(setData).catch(setError).finally(() => setLoading(false)); }, []);
```
Sin cache, sin retry, sin dedup. Cada navegacion re-fetcheaba todo.

**Decisiones**:
- Se instalo `@tanstack/react-query@5.101.4` con `--legacy-peer-deps` (conflicto de peer con `openapi-typescript`, sin impacto real)
- Se creo un `queryClient` centralizado con defaults sensatos:
  - `staleTime: 60_000` (1 minuto de cache tibio)
  - `retry: 1`
  - `refetchOnWindowFocus: false` (mobile-friendly)
- Se centralizaron los `queryKeys` en un solo objeto para futuras invalidaciones

**Entregables**:
- `frontend/src/api/queryClient.ts`
- `frontend/src/api/hooks.ts` con 6 hooks:
  - `useTiposEleccion`, `usePreguntas`, `useCandidatos`, `useCandidato`, `useNoticiasCandidato` (queries)
  - `useMatchCandidatos` (mutation)
- `App.tsx` envuelto en `QueryClientProvider`
- Refactor de `HomeScreen`, `ResultadosScreen`, `DetalleCandidatoScreen` para usar los hooks

**Beneficios gratis**:
- Cache automatico
- Deduplication de requests simultaneas
- Retry en errores de red
- Estado `isLoading` / `isError` sin boilerplate

**Fix menores durante el sprint**: se agrego `export type OpcionRespuesta` en `endpoints.ts`, se renombro `listPreguntas` a `preguntasPendientes`.

**Validacion**: `tsc --noEmit` limpio.

---

## Sprint 4 — Refactor Fase 3: error handling global

**Objetivo**: reemplazar `Alert.alert()` que no funciona en RN Web + agregar error boundary global.

**Problema**: `Alert.alert()` de React Native es un no-op silencioso en la web. El usuario metia mal la contrasena y no veia nada. Peor: un error de render en produccion crasheaba la app entera sin fallback.

**Entregables**:
- `frontend/src/components/Toast.tsx` — sistema de toasts pure RN (funciona en web y nativo):
  - `ToastProvider` como root
  - `useToast()` hook con `success` / `error` / `info`
  - Auto-dismiss en 4s, tap-to-close, safe-area aware, stackable
- `frontend/src/components/ErrorBoundary.tsx` — class component con fallback UI + boton reset
- `App.tsx` envuelto con `<ErrorBoundary><QueryClientProvider>...<ToastProvider>`
- Reemplazo de 6 `Alert.alert()` en 5 screens (Login, Register, Home, Cuestionario, Resultados, DetalleCandidato) por `toast.error()`

**Beneficios**:
- Los errores ahora son visibles en web
- Errores de render no crashean la app entera
- Base para toasts de exito en el futuro (ej. "Tu match se guardo")

**Validacion**: `tsc --noEmit` limpio.

---

## Sprint 5 — Version control + push a GitHub

**Objetivo**: poner el proyecto bajo control de versiones y publicarlo.

**Contexto**: el proyecto se venia trabajando sin git (extraccion directa del ZIP). Se decidio arrancar el versionado sin intentar reconstruir historia falsa por fase de refactor.

**Pasos**:
1. Se encontro git en `C:\Users\vn5ai5n\AppData\Local\Programs\Git\bin\git.exe` (no estaba en PATH default)
2. `git init` + branch `main`
3. Se actualizo `.gitignore` con `*_log.txt` (colaban logs de metro y django)
4. Auditoria de secretos: cero secretos hardcodeados, cero PII, `.env` real no staged (solo `.env.example`)
5. Commit inicial `2f4da29` (108 archivos)
6. Se creo el repo remoto `whatebria/tinder-decisivo` (Jenifer lo creo en el browser)
7. `git remote add origin` + `git push -u origin main`

**Decision de branding**: el repo original tenia nombre generico `servel`. Se cambio a `tinder-decisivo` — mucho mas descriptivo del proposito real.

**Entregables**:
- Repo en `https://github.com/whatebria/tinder-decisivo`
- Tracking `main -> origin/main`

---

## Sprint 6 — Reposicionamiento a producto

**Objetivo**: reescribir el README de "proyecto academico" a "producto con brand".

**Decisiones de dirreccion**:
- Positioning: producto/SaaS con brand propio (Tinder Decisivo)
- Alcance: solo Chile
- Idioma: bilingue (README.md en ingles + README.es.md en espanol)

**Entregables**:
- `README.md` — inglés, primary GitHub. Estructura:
  - Header con brand, tagline, badges
  - Why this exists (motivacion civica)
  - What it does (features)
  - Screenshots (placeholder)
  - Tech stack con rationale
  - Architecture diagram (ASCII)
  - Getting started con puerto 8010 y seed completo
  - Environment variables
  - Data disclaimer (posturas draft)
  - Roadmap v0.1 → v1.0
  - Contributing con 4 asks concretos
  - Status (MVP, no production-ready)
  - Licencia AGPL-3.0
- `README.es.md` — mirror en espanol neutro (tuteo)

**Commit**: `c9a6ce7` — 371 insertions, 56 deletions.

---

## Sprint 7 — Explicabilidad: contexto educativo de las preguntas

**Objetivo**: agregar contexto neutral en cada pregunta para que un votante entienda que esta en juego y las repercusiones en 5 dimensiones.

**Dimensiones elegidas**: Economico, Social, Cultural, Ambiental, Institucional.

**Ubicacion del dato**: en la DB (modelo `Pregunta`), editable desde el admin de Django.

**UI**: modal al tocar el icono `?` junto al enunciado.

**Entregables**:
- Backend:
  - Nuevos campos en `Pregunta`: `explicacion` (TextField) y `repercusiones` (JSONField con las 5 keys)
  - Migration `0022_pregunta_explicacion_pregunta_repercusiones`
  - Serializer actualizado
  - Command `seed_explicaciones_preguntas` con **72 textos educativos** (12 preguntas × 6 = explicacion + 5 dimensiones)
- Frontend:
  - OpenAPI schema + tipos TypeScript regenerados
  - `PreguntaInfoModal.tsx` — modal RN puro con 5 tarjetas coloreadas por dimension
  - Integracion en `CuestionarioScreen` con icono `?` en el header

**Contenido**: textos escritos en tono neutral y educativo. Evitan lenguaje partisano ("critico argumentan", "el debate incluye", "puede aumentar"). Van con disclaimer "en revision con especialistas".

**Validacion**: 46/46 tests backend pasan. `tsc --noEmit` limpio.

---

## Sprint 8 — Documentacion

**Objetivo**: dejar la documentacion del proyecto lista para audiencia externa.

**Entregables** (este mismo sprint):
- `docs/sprints.md` — este archivo, cronologia completa
- `docs/algoritmo-tecnico.md` — deep dive del algoritmo de matching, fórmulas, API contract, complejidad
- `docs/algoritmo-simple.md` — el mismo algoritmo explicado sin matematica, para audiencia no tecnica

---

## Metricas acumuladas al final del sprint 8

| Metrica | Valor |
|---|---:|
| Commits en `main` | 2 |
| Tests backend | 46/46 |
| Endpoints REST v1 | 11 |
| Modelos Django | 8 |
| Screens frontend | 7 |
| Componentes UI reutilizables | 7 |
| Servicios (logica pura) | 2 |
| Hooks React Query | 6 |
| Preguntas seed | 12 |
| Candidatos seed | 6 |
| Posturas seed | 72 (draft, pending verification) |
| Textos educativos seed | 72 (12 × 6) |
| Migrations | 22 |
| Management commands | 5 |
| Idiomas del README | 2 (en / es) |

---

## Backlog de proximos sprints

**Sprint 9 — Verificacion de posturas**
- Revisar cada una de las 72 posturas contra fuentes primarias
- Empezar por las 14 marcadas `ALTA` (deberian ser rapidas de confirmar)
- Publicar changelog publico de posturas verificadas

**Sprint 10 — Preguntas actualizadas 2025-2026**
- Algunas de las 12 preguntas son contexto 2021-2023 (nueva Constitucion post-Convencion 2022)
- Revisar y agregar preguntas de coyuntura actual

**Sprint 11 — Internationalizacion (i18n)**
- Integrar `react-i18next`
- Extraer todos los strings hardcoded
- Preparar para Mapuzugun / Aymara / ingles (v1.0 del roadmap)

**Sprint 12 — Tests unitarios frontend**
- Jest + React Native Testing Library
- Testear `services/` primero (funciones puras, easy win)
- Testear hooks con `@testing-library/react-hooks`
- Testear screens principales

**Sprint 13 — Deploy**
- Backend: AI Innovation Lab (Django on Kubernetes o similar)
- Frontend web: build de Expo + hosting estatico
- Dominio: `tinder-decisivo.cl` (~$8.000 CLP/año en NIC.cl)
- CI/CD con GitHub Actions

**Sprint 14 — Explicabilidad de matches**
- Mostrar en Resultados que preguntas hicieron subir/bajar el match
- Simulador "cambia tu respuesta" para ver sensibilidad
- Share card PNG del match

---

_Ultima actualizacion: 2026-07-25 (post sprint 7)._
