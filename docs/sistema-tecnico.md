# Sistema — documentacion tecnica

> Referencia de arquitectura del backend + frontend actuales.
> Audiencia: devs contribuidores, revisores tecnicos, DevOps.
> Para el algoritmo especifico de matching ver [`algoritmo-tecnico.md`](algoritmo-tecnico.md).

---

## Overview

Tinder Decisivo es un sistema cliente-servidor clasico:

```
+---------------------------+           +----------------------------+
|  Cliente: Expo / RN Web   |  HTTPS    |  Servidor: Django + DRF    |
|  - React 19 + TypeScript  | <-------> |  - Python 3.10+            |
|  - Tamagui UI             |  Token    |  - PostgreSQL (prod)       |
|  - TanStack Query 5       |  Auth     |  - SQLite (dev)            |
|  - Zustand                |           |  - drf-spectacular         |
+---------------------------+           +----------------------------+
```

**Contrato**: OpenAPI 3.1 generado por `drf-spectacular` en el backend y consumido por `openapi-typescript` en el frontend para tipos automaticos. **La verdad del contrato vive en el backend**; el frontend nunca inventa un shape.

**Puertos por defecto en dev**:
- Backend: `:8010`
- Frontend Metro: `:8081`

---

## Backend

### Stack

| Componente | Version | Rol |
|---|---|---|
| Python | 3.10+ | Runtime |
| Django | 5.2 | Framework web |
| Django REST Framework | 3.16 | APIs REST |
| djangorestframework-authtoken | (DRF) | Token auth |
| drf-spectacular | 0.28 | OpenAPI schema |
| django-cors-headers | 4.9 | CORS |
| python-decouple | 3.8 | `.env` loading |
| Pillow | 12 | ImageField |
| pytest + pytest-django | | Testing |
| uv | latest | Package + venv manager |

### Estructura de carpetas

```
backend/
├── api/                          # Django project (settings, wsgi, urls raiz)
│   ├── settings.py
│   ├── urls.py                   # incluye core.urls bajo /api/v1/
│   └── wsgi.py
├── core/                         # Unica app funcional
│   ├── models.py                 # 11 modelos
│   ├── views.py                  # views + viewsets + algoritmo matching
│   ├── serializers.py            # DRF serializers
│   ├── urls.py                   # rutas /api/v1/*
│   ├── admin.py                  # registro admin de todos los modelos
│   ├── management/commands/      # 5 comandos idempotentes
│   │   ├── import_preguntas.py
│   │   ├── import_candidatos.py
│   │   ├── import_posturas.py
│   │   ├── fetch_noticias.py
│   │   └── seed_explicaciones_preguntas.py
│   └── migrations/               # 22 migrations
├── fixtures/
│   ├── candidatos_ejemplo.csv
│   ├── preguntas_ejemplo.csv
│   ├── posturas_template.csv
│   ├── posturas_draft_verificar.csv    # 72 filas draft
│   └── README.md                 # fuentes aceptables / no aceptables
├── media/                        # ImageField uploads (gitignored)
├── tests/                        # 46 tests
├── .env.example
├── manage.py
└── pyproject.toml                # gestionado por uv
```

### Modelos (11 en total)

Agrupados por dominio:

**Catalogo electoral**:
- `TipoEleccion` — Presidencial, Parlamentaria, Regional, Municipal
- `Candidato` — nombre, apellido, partido, propuesta, foto, M2M con `TipoEleccion`
- `Pregunta` — texto, eje, orden, `explicacion`, `repercusiones` (5 dims)
- `OpcionRespuesta` — texto, valor Likert (1-5), `es_no_se` flag

**Interaccion del usuario**:
- `RespuestaUsuario` — user + pregunta + opcion elegida + peso (0-3)
- `PosturaCandidato` — candidato + pregunta + opcion + justificacion + fuente_url
- `MatchCandidato` — user + candidato + porcentaje + breakdown + confianza

**Bookmarking**:
- `CandidatoFavorito`
- `CandidatoDescartado`
- `DecisionFinal` — user + tipo_eleccion + candidato final (unique_together)

**Contenido asociado**:
- `Noticia` — titulo, url, fuente, M2M con `Candidato`

**Constraints clave**:
- `unique_together` en `RespuestaUsuario(user, pregunta)`: un usuario responde una pregunta una sola vez
- `unique_together` en `MatchCandidato(user, candidato)`: un match por par
- `unique_together` en `PosturaCandidato(candidato, pregunta)`: una postura por par
- `UniqueConstraint` condicional en `Noticia.url` cuando no es vacio

### Endpoints REST v1

Base: `/api/v1/`

| Verbo | Ruta | Auth | Descripcion |
|-------|------|------|-------------|
| POST | `register/` | publico | Crea usuario + devuelve token |
| POST | `login/` | publico | Devuelve token + user_id + email |
| GET | `tipos-eleccion/` | Token | Lista tipos disponibles |
| GET | `candidatos/` | Token | Lista candidatos (query `?tipo_eleccion_id=`) |
| GET | `candidatos/<pk>/` | Token | Detalle con posturas embebidas |
| GET | `candidatos/<id>/noticias/` | Token | Noticias del candidato |
| GET | `preguntas/` | Token | Preguntas del cuestionario (`?tipo_eleccion_id=`) |
| POST | `respuestas/` | Token | Bulk submit de respuestas del cuestionario |
| POST | `match-candidatos/` | Token | Recomputa y devuelve matches (ver `algoritmo-tecnico.md`) |
| GET | `noticias/` | publico | Lista noticias |
| POST | `noticias/` | admin | Crea noticia |
| GET/PUT/DELETE | `noticias/<pk>/` | mixed | Detalle/edicion |
| CRUD | `candidatos-favoritos/` | Token | Favoritos del user |
| CRUD | `descartados/` | Token | Descartados del user |
| CRUD | `decision-final/` | Token | Decision final (1 por tipo eleccion) |

**Schema OpenAPI**: disponible en `/api/schema/` (yaml) y `/api/schema/swagger-ui/`.

### Auth flow

1. `POST /api/v1/register/` con `{username, email, password}` → `{token, user_id, email}` (crea usuario + token en la misma transaccion)
2. `POST /api/v1/login/` con `{username, password}` → `{token, user_id, email}`
3. Todos los endpoints `Token` esperan header `Authorization: Token <valor>`

**Notas**:
- El token es persistente (no expira automaticamente)
- No hay refresh token — approach mobile-friendly, simple
- Frontend guarda el token en `expo-secure-store` (mobile) o `localStorage` (web via `secureStorage.ts` con fallback)

### Management commands (5)

Todos son **idempotentes** y aceptan `--dry-run`:

| Comando | Fuente | Uso |
|---------|--------|-----|
| `import_preguntas <csv>` | CSV con texto/eje/orden | Crea/actualiza preguntas + opciones Likert |
| `import_candidatos <csv>` | CSV con nombre/apellido/partido | Crea/actualiza candidatos |
| `import_posturas <csv>` | CSV con candidato/pregunta/valor/justificacion/fuente_url | Valida: min 20 chars justificacion, URL con http(s), valor 1-5 |
| `fetch_noticias` | Google News RSS | Trae noticias por candidato con dedup por URL |
| `seed_explicaciones_preguntas` | Hardcoded en el propio comando | Popula `explicacion` + `repercusiones` de las 12 seed |

### Configuracion

Variables de entorno en `.env` (ver `.env.example`):

| Variable | Requerida | Default | Notas |
|----------|-----------|---------|-------|
| `SECRET_KEY` | si | — | 50+ chars random |
| `DEBUG` | no | `False` | En True: CORS abierto, error pages |
| `ALLOWED_HOSTS` | no | `127.0.0.1,localhost` | Coma separada |
| `CORS_ALLOWED_ORIGINS` | no | vacia | Con `DEBUG=True` no aplica |

**CORS**: en `DEBUG=True` se usa `CORS_ALLOW_ALL_ORIGINS=True` (conveniencia dev, Expo mobile no manda `Origin` header).

### Tests

- **Framework**: pytest + pytest-django
- **Cobertura**: 46 tests
- **Areas cubiertas**: auth, CRUD basico, algoritmo matching (edge cases + happy paths), permisos por endpoint
- **Corrida**: `cd backend && uv run pytest -q` (~17s)

### Zonas conocidas por mejorar

- **N+1 potencial** en `CandidatoListView` cuando se piden posturas: revisar `prefetch_related`
- **`MatchCandidato.objects.update_or_create`** en loop → sustituir por `bulk_create` con `update_conflicts=True` si N candidatos crece a cientos
- **Rate limiting**: sin implementar. Considerar `django-ratelimit` para `/login/` y `/match-candidatos/`
- **Superuser hardcoded en dev**: no bloquear, pero documentar como cambiar en prod

---

## Frontend

### Stack

| Componente | Version | Rol |
|---|---|---|
| Expo SDK | 57 | Runtime cross-platform |
| React | 19.2 | Framework UI |
| React Native | 0.86 | Renderer nativo + web |
| React Native for Web | (via Expo) | Renderer web |
| TypeScript | 6.0 strict | Tipos |
| TanStack Query | 5.101 | Data fetching + cache |
| Zustand | 5.0 | State local (auth, form) |
| Tamagui | 2.5 | Design system (parcialmente reemplazado por RN puro post-refactor) |
| axios | 1.18 | HTTP client |
| React Navigation | 7 native-stack | Routing |
| expo-secure-store | 57 | Token storage nativo |
| react-native-svg | 15 | RadarChart |
| openapi-typescript | 7.13 | Types desde el backend |

### Estructura de carpetas

```
frontend/
├── App.tsx                       # root con providers
├── index.ts                      # entry Expo
├── src/
│   ├── api/                      # capa de comunicacion con backend
│   │   ├── client.ts             # axios instance + interceptors
│   │   ├── config.ts             # BASE_URL segun plataforma
│   │   ├── endpoints.ts          # funciones tipadas (login, listCandidatos, ...)
│   │   ├── hooks.ts              # 6 hooks de React Query
│   │   └── queryClient.ts        # QueryClient + queryKeys
│   ├── components/               # UI reutilizable (7)
│   │   ├── ErrorBoundary.tsx
│   │   ├── FormInput.tsx
│   │   ├── PreguntaInfoModal.tsx # modal educativo con 5 dimensiones
│   │   ├── PrimaryButton.tsx     # variants: primary / success / danger
│   │   ├── RadarChart.tsx        # SVG puro
│   │   ├── SelectableButton.tsx  # chip toggleable
│   │   ├── TextButton.tsx        # link-style
│   │   └── Toast.tsx             # sistema de toasts (Provider + useToast)
│   ├── navigation/
│   │   ├── AppNavigator.tsx      # stack navigator
│   │   └── types.ts              # RootStackParamList
│   ├── screens/                  # 7 pantallas
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx        # elige tipo eleccion
│   │   ├── CuestionarioScreen.tsx
│   │   ├── SubmitDoneScreen.tsx
│   │   ├── ResultadosScreen.tsx  # ranking + tiers
│   │   └── DetalleCandidatoScreen.tsx  # radar + noticias
│   ├── services/                 # logica pura (testeable sin React)
│   │   ├── matching.ts           # tiers, colores, badges, sort
│   │   └── cuestionario.ts       # PESOS, separacion opciones, progreso
│   ├── store/                    # Zustand
│   │   ├── auth.ts               # token + user info (persistente)
│   │   ├── cuestionario.ts       # form state + submit
│   │   └── secureStorage.ts      # abstraccion SecureStore/localStorage
│   ├── theme/
│   │   └── colors.ts             # paleta
│   └── types/
│       └── api.ts                # ← auto-generado, no editar
├── schema.yml                    # ← auto-generado desde backend
├── tamagui.config.ts
├── tsconfig.json
└── package.json
```

### Capas y responsabilidades

**`api/` (comunicacion)**
- `config.ts`: `BASE_URL` cambia segun plataforma. En web usa `localhost:8010`, en Android emulator `10.0.2.2:8010`, en device fisico requiere IP LAN
- `client.ts`: axios instance con interceptor que agrega `Authorization: Token X` automaticamente
- `endpoints.ts`: 1 funcion por endpoint, tipadas usando `Schemas` de `types/api.ts`
- `hooks.ts`: React Query wrappers sobre los endpoints (6 hooks)
- `queryClient.ts`: defaults (`staleTime: 60s`, `retry: 1`, `refetchOnWindowFocus: false`) + `queryKeys` centralizados

**`services/` (logica pura)**
- Funciones sin side effects, sin React, sin dependencias del framework
- Objetivo: **testables con Jest sin renderizar**
- Ejemplos: `getMatchTier(porcentaje)`, `sortByMatchDesc(matches)`, `debeMostrarPeso(opciones, elegidaId)`

**`store/` (estado del cliente)**
- Zustand para 2 dominios:
  - `auth`: token, user_id, email — persistente via `secureStorage`
  - `cuestionario`: preguntas cargadas, respuestas locales, pesos, submit
- Los stores **no fetchean directo**: reciben data desde screens que usan hooks

**`components/` (UI primitiva)**
- Post-refactor: **primitives son Pressable-based**, no `Button` de Tamagui (bugs en RN Web)
- Cada uno acepta variants + accessibility labels

**`screens/`**
- Thin: leen hooks, renderizan, despachan acciones al store
- No hacen fetch directo, no tienen logica de negocio pura (esta en `services/`)

### Navegacion

Stack navigator con las siguientes rutas (`RootStackParamList`):

```
Login → Register            (publico)
      ↓
    Home                    (autenticado)
      ↓
    Cuestionario            (recibe tipo_eleccion_id)
      ↓
    SubmitDone
      ↓
    Resultados              (recibe tipo_eleccion_id)
      ↓
    DetalleCandidato        (recibe candidato_id)
```

Gate de auth: `App.tsx` decide root screen segun `useAuthStore().token`.

### Componentes reutilizables

| Componente | Uso | Notas |
|------------|-----|-------|
| `PrimaryButton` | CTAs principales | variants: primary / success / danger, loading state |
| `SelectableButton` | Chips toggleables | Likert options + peso selector + filtros |
| `TextButton` | Link-style | Volver, Cancelar |
| `FormInput` | Text inputs | placeholder, secureTextEntry, keyboardType |
| `Toast` (via `useToast`) | Notificaciones no-modal | success/error/info, auto-dismiss 4s |
| `ErrorBoundary` | Catch de errores render | fallback UI con boton reset |
| `RadarChart` | Grafico eje x afinidad | SVG puro, no libs externas |
| `PreguntaInfoModal` | Modal educativo | 5 dimensiones con acento de color |

### React Query hooks

Todos definidos en `src/api/hooks.ts`:

| Hook | Tipo | Query key |
|------|------|-----------|
| `useTiposEleccion()` | query | `['tipos-eleccion']` |
| `usePreguntas(tipoId)` | query | `['preguntas', tipoId]` |
| `useCandidatos(tipoId)` | query | `['candidatos', tipoId]` |
| `useCandidato(id)` | query | `['candidato', id]` |
| `useNoticiasCandidato(id)` | query | `['noticias', 'candidato', id]` |
| `useMatchCandidatos()` | mutation | invalidates `['matches']` on success |

### Types auto-generados

Flow: `pyproject.toml` corre `spectacular` → genera `frontend/schema.yml` → `openapi-typescript` genera `src/types/api.ts`.

Comando: `npm run types:gen` (esta en scripts).

**Regla**: nunca editar `src/types/api.ts` a mano. Si el backend cambia el shape, regenerar.

### Cross-platform

Un solo codebase → 3 targets:
- **Web** (`npm run web`): Expo bundlea con Metro + react-native-web
- **iOS** (`npm run ios`): requiere Xcode + simulador
- **Android** (`npm run android`): requiere Android Studio + emulator

**Diferencias por plataforma manejadas**:
- Storage: `expo-secure-store` en nativo, `localStorage` en web (ver `store/secureStorage.ts`)
- Base URL: distinta segun plataforma (ver `api/config.ts`)
- Toasts: RN puro, funciona en todos
- Alert.alert: **evitar** (no-op en web) — usar `toast.error` en su lugar

### Convenciones de codigo

- **Strict TypeScript** habilitado (`tsconfig.json` con `"strict": true`)
- **Sin `any` implicito**
- **Cada screen** tiene un JSDoc corto al inicio describiendo su UX
- **Imports agrupados**: React → RN → Tamagui → local
- **Español** en textos visibles y comentarios de UX; ingles en identificadores de codigo

---

## Integracion backend ↔ frontend

### Flujo end-to-end de un match

```
1. User completa cuestionario en CuestionarioScreen
   → estado local en Zustand store (cuestionario)

2. User toca "Enviar"
   → store.submit() llama a submitAnswers(payload) [endpoints.ts]
   → POST /api/v1/respuestas/ (bulk)

3. Navegacion a Resultados
   → useMatchCandidatos().mutate({tipo_eleccion_id}) [hooks.ts]
   → POST /api/v1/match-candidatos/
   → backend corre _calcular_match() (ver algoritmo-tecnico.md)
   → response: lista ordenada de MatchCandidato

4. React Query cachea el resultado bajo ['matches', tipoId]
   → siguiente navegacion a Resultados en <60s: sin re-fetch

5. User toca un candidato
   → navega a DetalleCandidato con candidato_id
   → useCandidato(id) + useNoticiasCandidato(id) en paralelo
   → RadarChart consume breakdown_por_eje del match ya cacheado
```

### Contrato de tipos

Cambio en modelo backend → cambio en schema → cambio en types frontend:

```
1. Editar backend/core/models.py
2. python manage.py makemigrations && migrate
3. Actualizar serializer si el campo es nuevo/eliminado
4. cd frontend && npm run types:gen
5. Los errores de TypeScript te guian hacia los sitios a actualizar
```

---

## Operacion (dev)

### Levantar todo

```bash
# Terminal 1 — backend
cd backend
uv run python manage.py runserver 0.0.0.0:8010

# Terminal 2 — frontend
cd frontend
npx expo start --web --port 8081
```

### Debug tips

**Frontend blank en web**: chequear que el bundle termino (mira consola de Metro). Primer bundle: 40-60s.

**"Networking has been disabled"** en Metro: es un warning por proxy corporativo — el bundle igual funciona en offline mode.

**Backend 500 en `/match-candidatos/`**: revisar que el user tenga respuestas y que los candidatos tengan posturas sobre esas preguntas. Devuelve `[]` si no.

**CORS error en web**: en dev con `DEBUG=True` no deberia pasar. Si pasa, chequear `CORS_ALLOW_ALL_ORIGINS` en `settings.py`.

**Metro colgado**: matar procesos node + `npx expo start --clear` para resetear cache.

### Logs

- Backend: escribe a stdout (redirigido a `django_log.txt` en background)
- Metro: `metro_log.txt`
- Ambos ignorados por git (`*_log.txt`)

---

## Deploy (futuro)

Todavia no implementado. Approach recomendado:

**Backend**:
- AI Innovation Lab (Kubernetes) o Fly.io / Render / Railway
- PostgreSQL managed (no SQLite en prod)
- Static files servidos por WhiteNoise o CDN
- `SECRET_KEY`, `ALLOWED_HOSTS`, `DEBUG=False` via env vars

**Frontend web**:
- `npx expo export --platform web` → build estatico
- Servir desde Netlify / Cloudflare Pages / S3 + CloudFront
- CI: GitHub Actions con `npm run typecheck` + `npm run types:gen` diff check

**Frontend nativo** (v2+):
- EAS Build para binarios iOS/Android
- Distribucion via TestFlight + Play Console

---

_Ultima revision: 2026-07-25 (post sprint 7)._
