<div align="center">

# Tinder Decisivo

**Encuentra tu candidato ideal. Desliza sobre posturas, no sobre caras.**

App web de matching electoral para Chile. Respondes 12 preguntas de politica publica y obtienes tu ranking de afinidad con 6 candidatos en 7 ejes tematicos.

[English](README.md) · [Demo](#) · [Reportar bug](https://github.com/whatebria/tinder-decisivo/issues)

![Estado](https://img.shields.io/badge/estado-MVP-orange) ![Licencia](https://img.shields.io/badge/licencia-AGPL--3.0-blue) ![Backend](https://img.shields.io/badge/backend-Django%205.2-092E20) ![Frontend](https://img.shields.io/badge/frontend-Expo%20SDK%2057-000020)

</div>

---

## Por que existe

Chile vota mucho. Entre plebiscitos, elecciones presidenciales, senadores, diputados y consejeros municipales, un votante promedio enfrenta miles de decisiones por decada, muchas veces con poco contexto sobre donde esta parado cada candidato.

Las guias electorales tradicionales fallan porque son **demasiado largas** (PDFs de 200 paginas que nadie lee) o **demasiado superficiales** (una linea por partido). Las herramientas de "match electoral" que existieron en Chile estan desactualizadas, sin mantencion, o con scoring opaco.

**Tinder Decisivo** es un matcher mobile-first y transparente: respondes 12 preguntas Likert ponderadas en 7 ejes tematicos, y la app rankea a los candidatos por afinidad medible, con puntaje de confianza y desglose por eje para que entiendas *por que* un match es alto o bajo.

## Que hace

- **12 preguntas** en 7 ejes (Economia, Sociedad, Ambiente, Seguridad, DDHH, Internacional, Institucional)
- **Respuestas ponderadas**: tu le dices a la app que preguntas te importan mas
- **Puntaje de confianza**: matches basados en 3 preguntas se marcan como tentativos, matches con 10+ preguntas se marcan como alta confianza
- **Radar de afinidad** por eje con cada candidato
- **Detalle de candidato** con noticias recientes, biografia y posturas por pregunta con justificacion
- **Multi-plataforma**: corre en web (PWA), iOS y Android desde una sola base de codigo

## Screenshots

_Proximamente — screenshots del MVP pendientes._

## Stack

Elegimos herramientas aburridas y probadas que se corren del camino:

| Capa | Elegimos | Por que |
|---|---|---|
| **Backend** | Django 5.2 + DRF | Battle-tested, admin gratis, DRF para APIs tipadas |
| **Auth** | DRF Token Auth | Simple, sin sesion, mobile-friendly |
| **DB** | SQLite (dev) / PostgreSQL (prod) | Cero config en dev, estandar en prod |
| **Contrato API** | OpenAPI 3.1 via drf-spectacular | Autogenera tipos TypeScript para el frontend |
| **Frontend** | Expo SDK 57 + React Native + Tamagui | Un codebase para web + iOS + Android |
| **Data fetching** | TanStack Query v5 | Cache, retry, dedup de fabrica |
| **Estado** | Zustand | Mas simple que Redux, sin boilerplate |
| **Tipos** | TypeScript strict + OpenAPI codegen | Contrato backend = verdad frontend |

## Arquitectura

```
                 +------------------+          +---------------------+
                 |  Expo Web / iOS  | <------> |  API REST Django    |
                 |  React Native    |  HTTPS   |  Token auth         |
                 |  UI Tamagui      |          |  DRF + spectacular  |
                 +------------------+          +---------------------+
                          |                             |
                          v                             v
                  +---------------+             +---------------+
                  |  IndexedDB /  |             |  PostgreSQL   |
                  |  SecureStore  |             |  (SQLite dev) |
                  +---------------+             +---------------+
```

**Capas frontend** (post-refactor):

- `src/api/` — endpoints tipados + hooks de React Query + query client
- `src/services/` — logica de negocio pura (matching, cuestionario) — sin React, totalmente testeable
- `src/store/` — Zustand para auth + estado del form del cuestionario
- `src/components/` — UI primitiva (basada en Pressable, sin abstracciones filtradas)
- `src/screens/` — thin: leen hooks, renderizan, dispatchean acciones

**Capas backend**:

- `core/models.py` — 8 modelos: `TipoEleccion`, `Candidato`, `Pregunta`, `OpcionRespuesta`, `RespuestaUsuario`, `PosturaCandidato`, `MatchCandidato`, `Noticia`
- `core/views.py` — DRF viewsets + `MatchCandidatoView` custom (el algoritmo real)
- `core/management/commands/` — 4 importers CSV idempotentes
- `fixtures/` — datos de ejemplo + templates CSV para candidatos, preguntas y posturas

## Como arrancar (dev)

### Requisitos

- **Python 3.10+** con [uv](https://github.com/astral-sh/uv)
- **Node.js 20.19.4+** (versiones mas viejas avisan pero pueden andar)
- **Git**

### Backend

```bash
cd backend
uv venv
uv sync
cp .env.example .env                        # genera un SECRET_KEY y pegalo
uv run python manage.py migrate
uv run python manage.py createsuperuser

# Seed de datos (idempotente, seguro re-correr)
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv
uv run python manage.py import_posturas   fixtures/posturas_draft_verificar.csv
uv run python manage.py fetch_noticias    # opcional: trae noticias recientes por candidato

uv run python manage.py runserver 0.0.0.0:8010
```

Backend en http://localhost:8010. Admin en http://localhost:8010/admin/.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npx expo start --web --port 8081
```

Abre http://localhost:8081. El primer bundle toma 40-60s.

Para iOS/Android: escanea el QR con la app Expo Go, o presiona `i` / `a` en la terminal.

### Variables de entorno

| Variable | Descripcion | Default (dev) |
|---|---|---|
| `SECRET_KEY` | Clave de firma de Django | **obligatoria** |
| `DEBUG` | Modo debug | `False` |
| `ALLOWED_HOSTS` | Separados por coma | `127.0.0.1,localhost` |
| `CORS_ALLOWED_ORIGINS` | Separados por coma | (vacio) |

## Aviso sobre los datos

Las posturas actuales de candidatos en `fixtures/posturas_draft_verificar.csv` son **datos borrador pendientes de verificacion de fuentes**. Cada fila lleva un nivel de confianza (`ALTA` / `MEDIA` / `BAJA`) anotado en su campo `justificacion`. Las filas marcadas como `BAJA` no deben usarse para decisiones de voto reales.

Las posturas verificadas requieren:

- Declaraciones publicas del candidato (entrevistas, notas de prensa)
- Votaciones registradas en el Congreso
- Leyes firmadas / vetadas
- Plataformas de campana oficiales

Se aceptan contribuciones con posturas verificadas y con fuente — ver [Contribuir](#contribuir).

## Roadmap

**v0.1 — MVP (actual)**
- Flujo E2E completo: registro → cuestionario → match → detalle candidato
- 12 preguntas, 6 candidatos, 72 posturas borrador
- Eleccion presidencial chilena (contexto 2025-2026)

**v0.2 — Datos verificados (Q1 2026)**
- Las 72 posturas verificadas con fuentes primarias
- Agregar posturas para candidaturas parlamentarias (senadores, diputados)
- Changelog publico de verificacion

**v0.3 — Explicabilidad (Q2 2026)**
- Mostrar *que* preguntas causaron que un candidato rankeara alto/bajo
- Simulador "cambia mi respuesta" para ver que tan sensible es el match
- Compartir tarjeta de match como PNG para redes sociales

**v0.4 — Mas alla de presidencial**
- Elecciones municipales y regionales
- Notificaciones personalizadas sobre novedades de candidatos
- Onboarding lado candidato (self-service updates de postura con evidencia)

**v1.0 — Lanzamiento publico**
- Hosteado en tinder-decisivo.cl
- Load-testeado para trafico de dia de eleccion
- Multi-idioma (espanol + Mapuzugun / Aymara para accesibilidad regional)

## Contribuir

Estamos en etapa MVP — se agradecen contribuciones, especialmente:

1. **Posturas verificadas**: elegis una fila de candidato del CSV, reemplazas la justificacion borrador con una con fuente, abris un PR con la URL de la fuente
2. **Nuevas preguntas**: sugerir preguntas para ejes poco representados (actualmente pobres en `INTERNACIONAL` e `INSTITUCIONAL`)
3. **Mejoras UI**: fixes de WCAG 2.2 AA, ergonomia mobile
4. **Traducciones**: Mapuzugun, Aymara, ingles para votantes en el exterior

Por favor abrir un issue primero para cambios grandes. Ver la carpeta [`docs/`](docs/) para deep-dives de arquitectura:

- [`sprints.md`](docs/sprints.md) — historial completo del proyecto por sprints
- [`algoritmo-tecnico.md`](docs/algoritmo-tecnico.md) — referencia del algoritmo de matching (formulas, API, complejidad)
- [`algoritmo-simple.md`](docs/algoritmo-simple.md) — el mismo algoritmo sin matematica, para publico no tecnico
- [`doc-tecnica.md`](docs/doc-tecnica.md) — doc legacy con arquitectura del sistema completo (pre-refactor)

## Estado

**En desarrollo activo.** No apto para produccion. Sin SLA. No dependas de esto para decisiones reales de voto hasta que salga v0.2 (datos verificados).

## Licencia

AGPL-3.0. Si desplegas una version modificada publicamente, debes compartir tus cambios.

Se eligio AGPL porque la tecnologia electoral es infraestructura de interes publico y los forks deben permanecer abiertos.

## Autora

Construido por [@whatebria](https://github.com/whatebria) — Jenifer Castillo.

Empezo como tesis de pregrado en apps moviles, ahora esta creciendo hacia algo real.
