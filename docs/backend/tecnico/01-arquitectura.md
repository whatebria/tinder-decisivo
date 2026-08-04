# 01 - Arquitectura

> **Para quien**: devs que quieren entender la estructura del backend antes de tocar nada.
> **Para que sirve**: mapear el proyecto en 10 minutos, saber donde vive cada cosa.

---

## Stack

| Capa | Tecnologia | Version |
|---|---|---|
| Runtime | Python | >=3.10 |
| Framework | Django | 5.2.x |
| API | Django REST Framework | >=3.15 |
| DB dev | SQLite | (built-in) |
| DB prod (planificada) | PostgreSQL | 15+ |
| Auth | DRF Token Auth | built-in |
| CORS | django-cors-headers | >=4.4 |
| OpenAPI | drf-spectacular | >=0.27 |
| Media cleanup | django-cleanup | >=9.0 |
| Config | python-decouple | >=3.8 |
| Imagenes | Pillow | >=10.3 |
| RSS scrap noticias | feedparser | >=6.0 |
| Tests | pytest + pytest-django | 8.3 / 4.9 |
| Gestor deps | `uv` | latest |

Definido en `backend/pyproject.toml` y `backend/requirements.txt`.

---

## Layout del proyecto

```
backend/
|-- api/                    # Proyecto Django (settings, urls raiz)
|   |-- settings.py         # Config general: DB, DRF, CORS, email, logging
|   |-- urls.py             # /admin, /api/health, /api/v1/, /schema, /docs
|   |-- views.py            # health_check
|   |-- test_meta.py        # test que verifica que el schema OpenAPI se genera OK
|   |-- wsgi.py / asgi.py   # Entrypoints WSGI/ASGI
|
|-- core/                   # Unica app de dominio (todo el negocio vive aca)
|   |-- models/             # Dominio en 11 archivos (uno por bounded context)
|   |-- views/              # Endpoints DRF (10 archivos)
|   |-- serializers/        # Serializadores DRF
|   |-- services/           # Logica de negocio pura (fuera de views)
|   |-- management/commands/ # 16 mgmt commands (seeds + importers + fetch noticias)
|   |-- migrations/         # 36 migrations (schema + data)
|   |-- admin*.py           # Configuraciones del Django admin
|   |-- urls.py             # Rutas del API v1
|   |-- test_*.py           # Tests (pytest, colocacion por archivo)
|   |-- conftest.py         # Fixtures compartidas (datos_pesados, api, user, etc.)
|
|-- fixtures/               # Fixtures Django (JSON) para seed rapido
|-- media/                  # Imagenes subidas (profiles/, default.avif)
|-- db.sqlite3              # DB de dev (gitignored)
|-- manage.py               # CLI Django
|-- pyproject.toml          # Deps (uv)
|-- requirements.txt        # Deps pinning (venv)
|-- uv.lock                 # Lock de uv
`-- .env / .env.example     # Secrets locales
```

## Filosofia de organizacion

- **Una sola app (`core`)**. No hacemos micro-apps por dominio (electoral, matching, etc.) porque el
  proyecto es chico y la cross-referencia entre modelos seria constante. Igual dentro
  de `core/models/` hay **un archivo por dominio funcional** (ver `02-modelos.md`).
- **Services separadas de views**. Toda la logica de negocio no trivial vive en
  `core/services/*.py`. Las views solo orquestan: parseo, permisos, delegar,
  serializar respuesta.
- **Test colocation**. Cada `test_*.py` vive al lado del codigo que testea
  (`test_matching_territorial.py` en la raiz de `core/`).
- **Signals para invariantes cross-modelo**. Ej: crear una `Region` dispara la creacion
  de la `UnidadTerritorial` correspondiente. Ver `08-signals.md`.

---

## Configuracion (`api/settings.py`)

Todo se lee del `.env` via `python-decouple`. Ver `.env.example` para el listado.

### Variables clave

| Variable | Default | Notas |
|---|---|---|
| `SECRET_KEY` | (required) | Django secret |
| `DEBUG` | `False` | En dev = `True` |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost` | CSV |
| `LANGUAGE_CODE` | `es-cl` | App chilena |
| `TIME_ZONE` | `America/Santiago` | |
| `CORS_ALLOWED_ORIGINS` | `""` | CSV. En `DEBUG=True` se ignora y se permite todo |
| `EMAIL_BACKEND` | `console` | `smtp` en prod |
| `EMAIL_HOST/PORT/TLS/USER/PASSWORD` | - | Solo prod |
| `DEFAULT_FROM_EMAIL` | `no-reply@votoafin.cl` | |
| `PASSWORD_RESET_URL_BASE` | `http://localhost:8081/reset-password` | URL del frontend que recibe el token |

### Bloques importantes

- **DB**: SQLite en `backend/db.sqlite3`. En prod se cambia a Postgres.
- **DRF**: auth por defecto = `TokenAuthentication`. Permission por defecto = `IsAuthenticated`.
  Endpoints publicos usan `permission_classes = [AllowAny]` explicitamente.
- **OpenAPI**: `drf-spectacular` sirve el schema en `/api/v1/schema/` y Swagger UI en `/api/v1/docs/`.
- **Logging**: nivel `INFO` general, `DEBUG` para el logger `core` cuando `DEBUG=True`.
- **Media**: `MEDIA_ROOT=backend/media/`, servido en `/media/` solo si `DEBUG=True`.
- **`django-cleanup`** al final de `INSTALLED_APPS`: borra automaticamente los archivos
  del disco cuando se elimina el modelo que los referencia.

---

## URLs de alto nivel

Ver `api/urls.py`:

```
/admin/                 - Panel de Django admin (auth staff)
/api/health/            - Healthcheck (no versionado)
/api/v1/...             - API REST versionada (ver 03-api-endpoints.md)
/api/v1/schema/         - OpenAPI 3.0 schema JSON
/api/v1/docs/           - Swagger UI
/api/v1/redoc/          - ReDoc
/media/...              - Media servida solo en DEBUG
```

El versionado es por prefijo (`/api/v1/`) sin usar DRF namespaces. Cuando aparezca `v2`, migrar a namespaces.

---

## Como levantar el backend en local

Asumiendo Python 3.10+ y `uv` instalado.

```bash
cd backend

# 1. Instalar deps
uv sync

# 2. Copiar el .env de ejemplo
cp .env.example .env
# Editar .env: al menos SECRET_KEY

# 3. Aplicar migrations
uv run python manage.py migrate

# 4. Seed inicial completo (territorio + preguntas + candidatos)
uv run python manage.py seed_territorio_chile
uv run python manage.py seed_preguntas_base
uv run python manage.py seed_presidenciales_2025
uv run python manage.py seed_diputados_2025
uv run python manage.py seed_alcaldes_2024
uv run python manage.py seed_preguntas_por_tipo

# 5. Crear superuser (opcional, para admin)
uv run python manage.py createsuperuser

# 6. Arrancar el server
uv run python manage.py runserver 8010
```

Verificar: `curl http://127.0.0.1:8010/api/health/` -> `{"status": "ok"}`.

Para el orden completo de seeds ver `06-comandos-seeds.md`.
Para troubleshooting comun ver [`../simple/05-troubleshooting.md`](../simple/05-troubleshooting.md).

---

## Como correr los tests

```bash
cd backend
uv run pytest              # Suite completa (~3 min)
uv run pytest core/test_matching_territorial.py  # Un archivo
uv run pytest -k "match"   # Por patron
uv run pytest -x           # Fallar al primer error
uv run pytest --tb=short   # Traceback resumido
```

Detalles en `10-tests.md`.

---

## Diagrama de dependencias (alto nivel)

```
+-------------------------------------------------------+
|                        API                            |
|  /api/v1/*  (urls.py + views.py + serializers.py)     |
+---------------------------|---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                     Services                          |
|  matching.py | respuestas.py | password_reset.py |    |
|  perfil.py                                            |
+---------------------------|---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                     Modelos                           |
|  electoral | cuestionario | matching | territorio |   |
|  unidad_territorial | perfil | eje | user_data |      |
|  content | auth                                       |
+---------------------------|---------------------------+
                            |
                            v
+-------------------------------------------------------+
|              SQLite (dev) / Postgres (prod)           |
+-------------------------------------------------------+
```

Flujo tipico de una request:

1. Cliente hace `POST /api/v1/match-candidatos/` con token en header.
2. Django resuelve URL en `core/urls.py` -> `MatchCandidatoViewSet.match_candidatos`.
3. La view valida input via serializer, delega a `services/matching.py::calcular_match`.
4. Service consulta modelos, corre algoritmo, persiste `MatchCandidato`.
5. View toma resultado, serializa, responde JSON.

---

## Siguiente lectura

- `02-modelos.md` - los 12 modelos y sus relaciones.
- `03-api-endpoints.md` - lista completa de endpoints.
- `05-servicios.md` - que hay en `services/` y por que.
