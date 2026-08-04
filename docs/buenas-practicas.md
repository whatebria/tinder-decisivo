# Buenas practicas aplicadas al proyecto

> Cuando refactorice y ampliaste el codigo, no lo hice al ojo. Segui
> principios y patrones concretos de la industria. Este documento los
> enumera con nombre, con la referencia canonica, y con el ejemplo real
> del proyecto donde se aplican.
>
> Audiencia: contribuidores nuevos, revisores tecnicos, tesistas que
> quieran justificar decisiones academicamente.

---

## Indice rapido

1. [Zen de Python (PEP 20)](#1-zen-de-python-pep-20)
2. [SOLID](#2-solid)
3. [DRY, YAGNI, KISS](#3-dry-yagni-kiss)
4. [Clean Architecture / Hexagonal (capas)](#4-clean-architecture--hexagonal-capas)
5. [12-Factor App](#5-12-factor-app)
6. [REST + OpenAPI (contract-first)](#6-rest--openapi-contract-first)
7. [Testing pyramid](#7-testing-pyramid)
8. [Convenciones Django especificas](#8-convenciones-django-especificas)
9. [Convenciones React / RN especificas](#9-convenciones-react--rn-especificas)
10. [Git y commits](#10-git-y-commits)
11. [Documentacion](#11-documentacion)
12. [Accesibilidad y i18n](#12-accesibilidad-y-i18n)
13. [Seguridad basica](#13-seguridad-basica)
14. [Lo que NO se sigue todavia](#14-lo-que-no-se-sigue-todavia)

---

## 1. Zen de Python (PEP 20)

> Referencia: https://peps.python.org/pep-0020/
>
> "Beautiful is better than ugly. Explicit is better than implicit.
> Simple is better than complex..."

**Como se aplica aca**:

- **"Explicit is better than implicit"**: `RespuestaUsuario.PESO_POCO`,
  `MatchCandidato.CONFIANZA_ALTA` en vez de magic strings `"poco"` o `"alta"`.
- **"Flat is better than nested"**: los `services/` estan al mismo nivel
  que `models/` y `views/`, no anidados 5 niveles adentro.
- **"There should be one — and preferably only one — obvious way to do it"**:
  un solo endpoint para calcular match (`/match-candidatos/`), no 3
  alternativas. Un solo tipo de token, no varios sistemas de auth.
- **"Readability counts"**: los tests parametrizados de
  `test_services_matching.py` usan tabla explicita en vez de
  metaprogramar los casos.

---

## 2. SOLID

> Referencia: Robert C. Martin, *Agile Software Development, Principles,
> Patterns, and Practices* (2002). Los 5 principios de OOP.

### S — Single Responsibility Principle

**Cada modulo hace una sola cosa**.

Ejemplo en el proyecto:

| Archivo | Unica responsabilidad |
|---------|----------------------|
| `services/matching.py` | Calcular match |
| `views/matching.py` | Recibir HTTP + delegar al service |
| `serializers/matching.py` | Serializar match a JSON |
| `models/matching.py` | Persistencia de PosturaCandidato + MatchCandidato |

Antes del refactor, todo esto vivia en un solo `views.py`. Violaba SRP
descaradamente.

### O — Open/Closed Principle

**Abierto a extension, cerrado a modificacion**.

Ejemplo: agregar un nuevo eje tematico (ej. `EJE_TECNOLOGIA`) al modelo
`Pregunta` no requiere tocar `calcular_match()`. El algoritmo lee
`eje_tematico` como string cualquiera y arma el breakdown dinamicamente.

Otro ejemplo: agregar un nuevo peso (ej. `PESO_CRITICO=4`) solo requiere
agregar una entrada al dict `PESO_MULTIPLIERS`. No hay `if/elif` que
tocar.

### L — Liskov Substitution Principle

**Los subtipos deben ser sustituibles por sus supertipos**.

Ejemplo: `_UserScopedCreateListDestroy` es la base de
`CandidatoFavoritoViewSet` y `CandidatoDescartadoViewSet`. Cualquier
consumidor que espere un `viewsets.GenericViewSet` puede recibir
cualquiera de los dos sin romperse — cumplen el mismo contrato de
metodos (`get_queryset`, `perform_create`, etc.).

### I — Interface Segregation Principle

**Los clientes no deben depender de interfaces que no usan**.

Ejemplo: en vez de un unico `AbstractBookmarkViewSet` con
`create + list + retrieve + update + delete`, tenemos
`_UserScopedCreateListDestroy` que ofrece solo lo que sus consumidores
necesitan. `DecisionFinalViewSet` en cambio incluye `RetrieveModelMixin`
porque su UX si necesita GET detalle.

### D — Dependency Inversion Principle

**Depender de abstracciones, no de implementaciones concretas**.

Ejemplo: `views/matching.py` importa `calcular_match` (funcion), no la
implementacion del algoritmo. Manana podemos cambiar la formula sin
tocar la view.

Ejemplo del frontend: `screens/` dependen de `hooks/` (abstraccion),
no de `axios` directamente. Podemos cambiar axios por fetch sin tocar
las screens.

---

## 3. DRY, YAGNI, KISS

### DRY — Don't Repeat Yourself

> Andy Hunt & Dave Thomas, *The Pragmatic Programmer* (1999).

**Aplicaciones concretas**:

- **`_UserScopedCreateListDestroy`**: base viewset comun para favoritos +
  descartados. Sin herencia serian 2 clases identicas de 15 lineas
  cada una.
- **`_NoticiaPermMixin`**: logica de "GET publico, escritura solo admin"
  compartida entre `NoticiaListCreateView` y `NoticiaDetailView`.
- **`crear_opciones_acuerdo_desacuerdo(pregunta)`**: helper reusable
  por management commands y admin actions.
- **Types autogenerados desde OpenAPI**: la definicion de tipos vive
  en el backend, no se duplica manualmente en TypeScript.
- **`OPCIONES_ACUERDO_DESACUERDO`**: constante compartida entre el
  helper de creacion, tests y admin.

**Pero no dogmatico**. Ejemplos donde deliberadamente NO se hizo DRY:

- Los serializers de `CandidatoFavorito` y `CandidatoDescartado` son
  muy parecidos pero no se abstrajeron — el `validate()` referencia
  clases distintas, y abstraerlo hacia el codigo mas confuso, no menos.
- Cada view tiene su docstring propio en vez de generarlos.

### YAGNI — You Aren't Gonna Need It

> Kent Beck, XP (2000).

**"No implementes lo que no necesitas ahora"**.

Aplicado:

- No hay refresh token — el MVP no lo necesita, agrega complejidad.
- No hay soft-delete en ningun modelo — no hay compliance que lo pida.
- No hay multi-tenancy — es un proyecto para una eleccion, no una
  plataforma SaaS.
- No hay i18n del backend — la app es solo para Chile por ahora.
- No hay eventos/webhooks — nadie consume.
- No hay GraphQL — REST alcanza para la complejidad actual.

**Pero cuando SI se aplico y fue error**: agregar el bookmarking
(favoritos, descartados, decision final) antes de validar que el user
lo pedia. Deuda ahora — son 3 endpoints que nadie usa todavia.

### KISS — Keep It Simple, Stupid

> US Navy, 1960.

Aplicado:

- Token auth simple en vez de JWT (menos moving parts, menos superficie
  de bugs).
- SQLite en dev en vez de docker-compose con Postgres (uv run
  runserver arranca en 2 segundos).
- Zustand en vez de Redux + Redux Toolkit + Sagas + Selectors
  (el estado del cliente es simple, no amerita industria pesada).
- HTMX no aplica porque hay app nativa, pero cuando aplica lo elegimos.
- CSVs para importar posturas, no interfaz admin custom (bulk edit en
  Excel es lo que el equipo civico entiende).

---

## 4. Clean Architecture / Hexagonal (capas)

> Robert C. Martin, *Clean Architecture* (2017).
> Alistair Cockburn, *Hexagonal Architecture* (2005).

**Idea central**: la logica de dominio no debe depender del transporte
(HTTP, CLI, WebSocket). La direccion de las dependencias apunta hacia
adentro.

**Aplicado en el backend** (post-refactor):

```
   +-----------------------------------------------+
   |  Transport layer                              |
   |  views/  urls.py  management/commands/       |
   |             |                                 |
   |             v                                 |
   |  Domain layer (services)                     |
   |  services/matching.py                        |
   |             |                                 |
   |             v                                 |
   |  Persistence layer (models + Django ORM)     |
   |  models/                                     |
   +-----------------------------------------------+
```

**Regla que enforce**: `services/` NO importa de `views/` ni de
`serializers/`. Los tests unitarios (`test_services_matching.py`)
verifican esto implicitamente — corren en 0.42s sin DRF, si `services/`
hubiera fugado dependencias de views seria imposible.

**Beneficio concreto medido**: los tests unitarios corren **30x mas
rapido** que los de integracion (12ms vs 370ms por test). Feedback loop
del dev mejora dramaticamente.

---

## 5. 12-Factor App

> Heroku, https://12factor.net (2011). El manifiesto para apps SaaS
> portables y escalables.

**De los 12 factores, cumplimos**:

| # | Factor | Aplicacion |
|---|--------|-----------|
| I | Codebase | Un repo git, deploy a multiples envs |
| II | Dependencies | `pyproject.toml` + uv lockfile |
| III | Config | `.env` via `python-decouple` (no hardcoded) |
| IV | Backing services | Postgres/SQLite atachables por URL |
| V | Build/release/run | Separados (uv build → docker → run) [pendiente docker] |
| VI | Processes | Stateless — auth por token, no session cookies |
| VIII | Concurrency | Django ASGI escalable [no probado a escala] |
| IX | Disposability | Graceful shutdown default de Django |
| X | Dev/prod parity | Misma app, misma DB engine ideal (Postgres en ambos) [dev usa SQLite, deuda] |
| XI | Logs | stdout, no archivos [parcial — hay logger, no estructurado] |
| XII | Admin processes | Management commands (import_*, seed_*) |

**Los que NO cumplimos y son deuda documentada**:
- Factor VII (Port binding) — apenas cumplido, prod deploy pendiente
- Factor X — dev SQLite vs prod Postgres esta desalineado
- Factor XI — logs no estructurados

---

## 6. REST + OpenAPI (contract-first)

> OpenAPI Specification 3.1 — https://spec.openapis.org/oas/latest.html
> Fielding, Roy T. (2000). *Architectural Styles and the Design of
> Network-based Software Architectures*. Tesis PhD.

**Contract-first**: el schema OpenAPI es la fuente de verdad. El
backend lo genera automaticamente con `drf-spectacular`, y el frontend
lo consume con `openapi-typescript` para generar tipos.

**Beneficios**:
- Un cambio de shape en el backend rompe TypeScript en el frontend en
  compile-time, no en produccion.
- La documentacion API (`/api/schema/swagger-ui/`) esta siempre
  actualizada — es la misma fuente que el codigo.
- Cero manual "documenta el JSON de respuesta en README" — eso es
  siempre mentira despues de 3 sprints.

**Convenciones REST respetadas**:
- Sustantivos plurales en URLs (`/candidatos/`, `/preguntas/`, no
  `/getCandidato/`).
- Verbos HTTP semanticos: GET lista/lee, POST crea/procesa, PUT
  reemplaza, PATCH actualiza parcial, DELETE borra.
- Status codes semanticos: 200 ok, 201 created, 400 client error, 401
  no auth, 403 sin permiso, 404 no existe, 500 server error.
- Prefijo de version: `/api/v1/` — permite v2 sin romper v1.

**Donde nos salimos de REST**: `/api/v1/match-candidatos/` usa POST
para un calculo (no crea un recurso nuevo desde la perspectiva del
cliente). Es un tradeoff conocido en VAAs — es POST porque persiste el
resultado del calculo.

---

## 7. Testing pyramid

> Mike Cohn, *Succeeding with Agile* (2009).

**La piramide**: muchos tests unitarios rapidos, algunos de integracion,
poquitos e2e.

**Como esta hoy el backend**:

```
                           /\
                          /  \    e2e: 0 (no hay tests de UI+API)
                         /____\
                        /      \
                       / integr \  46 tests (Django DB + DRF APIClient)
                      /__________\
                     /            \
                    /   unitarios  \ 35 tests (funciones puras, sin DB)
                   /________________\
```

**Total**: 81 tests, corren en 19s, 30% son unitarios (target sano).

**Convenciones aplicadas**:

- **Test naming**: `test_<que_hace>_<condicion>_<esperado>` — ej.
  `test_diff_cuatro_score_cero`.
- **Fixtures reusables** con `@pytest.fixture` en vez de setUp/tearDown.
- **Parametrized tests** para tablas de valores (ver
  `test_tabla_umbrales`, `test_valores_esperados_parametrizados`).
- **Un assert por test** cuando es posible (o multiples asserts de la
  misma cosa).
- **AAA pattern** (Arrange - Act - Assert) — visible en la mayoria de
  tests.
- **Test doubles** minimizados — preferimos DB real con transacciones.

---

## 8. Convenciones Django especificas

**Fuentes**: Django docs oficial, *Two Scoops of Django* (Greenfeld &
Roy).

### Modelos
- **PascalCase** para clases, **snake_case** para campos.
- **`verbose_name_plural`** siempre definido en `Meta`.
- **`__str__` explicito** en todos los modelos (no confiar en el
  default).
- **`related_name`** siempre definido en ForeignKey/M2M (evita
  `_set` feo y ambiguo).
- **Constantes de choices como class attributes** (`PESO_POCO = 1`) en
  vez de tuplas anonimas. Facil de referenciar desde consumidores.
- **`unique_together`** para constraints de negocio.
- **JSONField para datos semi-estructurados** (`breakdown_por_eje`,
  `repercusiones`) con esquema documentado en `help_text`.

### Views
- **CBV** (Class-Based Views) sobre FBV (function-based) — mas DRY
  cuando escala.
- **Genericas de DRF** (`ListAPIView`, `RetrieveAPIView`) cuando el
  CRUD es standard.
- **`APIView`** cuando el behavior es custom (ej. `PreguntasPendientesView`
  hace query custom con filtros de user + tipo).
- **ViewSets** cuando hay familia de URLs relacionadas (ej.
  `CandidatoFavoritoViewSet` con create/list/destroy).

### Serializers
- **`ModelSerializer`** por default.
- **Campos read_only** explicitos con `SlugRelatedField` en vez de
  `SerializerMethodField` cuando alcanza (mas rapido, mas declarativo).
- **`context={'request': request}`** siempre pasado — permite acceso
  al user en validate().
- **`validate()` a nivel objeto** para reglas cross-field (ej.
  "esta opcion pertenece a esta pregunta?").

### URLs
- **Nombres explicitos** en cada `path()` (`name="candidato-list"`) —
  permite `reverse()` desde tests.
- **Router de DRF** para viewsets con CRUD standard.

### Settings
- **Separacion de config vs codigo**: `.env` con `python-decouple`, no
  `settings.py` con `if DEBUG:`.
- **`SECRET_KEY` desde env**, obligatorio en prod.
- **`ALLOWED_HOSTS` explicito**.

### Migrations
- **Nombres descriptivos** cuando hacemos `--name` (ej.
  `0022_pregunta_explicacion_pregunta_repercusiones`).
- **Nunca editar una migration commiteada** — siempre crear una nueva.

---

## 9. Convenciones React / RN especificas

### Componentes
- **Funcionales + hooks**, no class components.
- **Un archivo, un componente** (excepto pequenos helpers privados).
- **Props tipadas** con TypeScript interfaces.
- **Variants controladas por prop** (ej. `PrimaryButton
  variant="danger"`).

### Estado
- **useState** para estado local de una pantalla.
- **Zustand** para estado global compartido (auth, form multi-step).
- **React Query** para estado del servidor (cache + sync + refetch).
- **NO redux** — YAGNI para nuestra escala.

### Estructura
- **Feature-first en el frontend** dentro de `screens/`: cada pantalla
  agrupa lo suyo, se abstrae solo lo que se usa >1 vez.
- **`services/` con logica pura**: sin React, sin RN, testeable con
  Jest sin renderizado.
- **`api/` con capa de red aislada**: si cambiamos axios por fetch,
  tocamos un solo archivo.

### Estilos
- **StyleSheet nativo de RN** o Tamagui — no CSS-in-JS ni styled-components.
- **Paleta centralizada** en `theme/colors.ts`.
- **Sin magic values** de spacing — usar el sistema del design system.

### Naming
- **PascalCase** para componentes y types.
- **camelCase** para funciones, variables, hooks.
- **kebab-case** para archivos de config, uppercase para constantes.

---

## 10. Git y commits

> Conventional Commits — https://www.conventionalcommits.org/es/v1.0.0/

**Formato**: `<type>(<scope>): <descripcion>`

**Types usados en el proyecto**:
- `feat`: nueva funcionalidad
- `fix`: bug fix
- `refactor`: cambio interno sin alterar comportamiento
- `docs`: cambios de documentacion
- `chore`: tareas de mantenimiento (deps, config)
- `test`: solo agregar/modificar tests

**Ejemplos reales del repo**:
- `feat(preguntas): educational context modal with 5-dimension repercussions`
- `refactor(backend): split monolithic modules into domain packages`
- `docs: add competitive analysis vs international VAAs`

**Reglas adicionales**:
- **Un commit, un cambio logico**. No mezclar refactor + feature.
- **Mensaje corto** en linea 1 (<72 chars), body con contexto en
  siguientes lineas.
- **Verbo en presente imperativo** en ingles ("add", "fix", "refactor")
  o infinitivo en espanol ("agregar", "corregir").
- **Push solo con OK explicito** del owner del repo (regla del
  proyecto).

---

## 11. Documentacion

### Principios
- **Docs viven con el codigo** en `docs/` — no en Confluence, no en
  Google Docs. Se versiona con git.
- **README de nivel producto** en la raiz, no solo tech.
- **Doc tecnico vs doc simple** para cada tema (algoritmo, sistema,
  historia) — cada uno tiene su audiencia.
- **Ejemplos ejecutables** > descripciones abstractas.
- **Snapshots temporales**: docs de estado del arte marcan fecha de
  ultima revision.

### Convenciones
- **Markdown** con GFM (GitHub Flavored Markdown).
- **Diagramas en ASCII** cuando alcanza (no dependencias externas).
- **Espanol neutro (tuteo)** en todo — no voseo, no vosotros.
- **Tablas** para info comparativa o de referencia.
- **Bloques de codigo con lenguaje** especificado (para syntax highlight).

### Docstrings Python
- **Formato triple-quoted string** en la primera linea de cada modulo,
  clase publica, funcion publica.
- **"Que hace" en primera linea corta**, detalles en parrafo abajo si
  aplica.
- **Type hints obligatorios** en funciones publicas de `services/`.

---

## 12. Accesibilidad y i18n

### WCAG 2.2 nivel AA
> https://www.w3.org/WAI/WCAG22/quickref/

**Aplicado en frontend**:
- **Contraste minimo 4.5:1** para texto normal, 3:1 para texto grande
  — validado en `theme/colors.ts`.
- **`accessibilityLabel`** en botones + inputs sin texto visible.
- **Tamano minimo de targets tactiles**: 44x44 pt (guia de Apple + WCAG).
- **Focus visible** en navegacion por teclado (web).

**Pendiente**:
- Auditoria completa con axe-core o similar.
- Testing con screen readers reales (VoiceOver, TalkBack).

### i18n
- **Espanol de Chile** como target primario, neutro para no alejar
  otros LatAm.
- **Sin ingles** en la UI (aunque el codigo usa ingles).
- **Sin hardcode de strings** en componentes — vive un sprint futuro
  extraer a `i18n/es.json` para poder agregar `en.json` despues.

---

## 13. Seguridad basica

### Autenticacion
- **Passwords hasheados con PBKDF2** (default de Django, no plaintext).
- **Token DRF con expiracion**: `ExpiringTokenAuthentication` con TTL configurable (`TOKEN_TTL_DAYS`, default 7 dias). Token vencido = 401 + borrado de DB.
- **Cookie httpOnly en web (TASK-003)**: `CookieTokenAuthentication` envia el token en cookie `SameSite=Lax; httpOnly; Secure`. JS nunca toca el token; CSRF mitigado via SameSite.
- **HTTPS obligatorio en prod** — `SESSION_COOKIE_SECURE=True`, `SECURE_SSL_REDIRECT=True` en settings de prod.

### Autorizacion
- **DRF Permission classes** en cada view sensible.
- **User-scoped querysets**: `queryset.filter(user=request.user)` en
  vez de exponer todos los recursos.
- **`IsAdminUser`** para escritura de noticias.

### Datos
- **Zero PII sensible**: no guardamos DNI, RUT, telefono, geolocalizacion.
- **Env vars para secrets** — `.env` gitignored.
- **`SECRET_KEY` diferente** por env.

### Validacion de input
- **Serializers de DRF** validan tipos + rangos.
- **Django ORM parametriza** queries — sin SQL injection.
- **CSRF exempt solo en APIs** (necesario para clientes sin cookies).

### Deuda conocida
- Sin rate limiting (deuda documentada en `sistema-tecnico.md`).
- Sin auditoria de accesos (nice-to-have).
- Sin 2FA (nice-to-have).

---

## 14. Lo que NO se sigue todavia

Honestidad: no todo esta implementado. Estos son los gaps identificados:

| Practica | Estado | Priorizado en |
|----------|--------|---------------|
| Logging estructurado (JSON, correlation IDs) | Ausente | Sprint 12 (deploy) |
| Observabilidad (metricas, tracing, alerting) | Ausente | Sprint 12 |
| Tests frontend (Jest + RNTL) | 0% cobertura | Sprint 10 |
| Rate limiting | Ausente | Sprint 11 (pre-prod) |
| Cache Redis del match | Ausente | Sprint 13 |
| Postgres en dev (parity con prod) | SQLite | Sprint 12 |
| CI/CD (GitHub Actions con typecheck + tests) | Ausente | Sprint 12 |
| Squash de migrations legacy | 22 migrations | Post-v1.0 |
| Docker Compose reproducible | Ausente | Sprint 12 |
| Code coverage report en CI | Ausente | Sprint 10 |
| Feature flags | Ausente | Nunca (YAGNI) |
| Event sourcing / CQRS | Ausente | Nunca (YAGNI) |
| GraphQL | Ausente | Nunca (YAGNI) |
| Microservicios | Ausente | Nunca (YAGNI) |

---

## Referencias generales

### Libros mencionados
- Robert C. Martin. *Clean Architecture: A Craftsman's Guide to
  Software Structure and Design*. Prentice Hall, 2017.
- Robert C. Martin. *Agile Software Development, Principles, Patterns,
  and Practices*. Prentice Hall, 2002.
- Andy Hunt & Dave Thomas. *The Pragmatic Programmer*. Addison-Wesley,
  1999.
- Kent Beck. *Extreme Programming Explained*. Addison-Wesley, 2000.
- Mike Cohn. *Succeeding with Agile: Software Development Using Scrum*.
  Addison-Wesley, 2009.
- Danny Greenfeld & Audrey Roy. *Two Scoops of Django*. Two Scoops
  Press.
- Alistair Cockburn. *Hexagonal Architecture*. 2005.

### PEPs relevantes
- PEP 8 — Style Guide for Python Code
- PEP 20 — The Zen of Python
- PEP 257 — Docstring Conventions
- PEP 484 — Type Hints

### Estandares web
- WCAG 2.2 (W3C, 2023)
- OpenAPI Specification 3.1
- HTTP Semantics (RFC 9110)

### Filosofias de desarrollo
- 12-Factor App (Heroku, 2011)
- Conventional Commits (2016)
- Semantic Versioning

---

## Como usar este documento

- **Si eres reviewer** de un PR, usa las secciones 2-4 para dar
  feedback objetivo.
- **Si eres tesista/investigador**, usa las referencias academicas de
  la seccion final para justificar decisiones.
- **Si eres nuevo en el proyecto**, empieza por sistema-simple.md y
  luego lee las secciones 4, 6, 7 de este doc.
- **Si vas a agregar una practica nueva** (ej. adoptar mypy en CI),
  documentala aca con la referencia y el ejemplo de aplicacion.

---

_Version 1.0 — 2026-07-25._
_Este documento se actualiza cada vez que adoptamos o abandonamos una
practica. Ultima revision de gaps: post-refactor de backend._
