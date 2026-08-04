# Backend VotoAFin — Documentación completa

> Referencia exhaustiva y descriptiva de todo el código del backend Django ubicado en `backend/`. Este doc describe el estado actual del código; no incluye historia ni comparaciones con versiones anteriores.
>
> Convención: cada sección lista archivos con su ruta relativa desde `backend/`.

## Índice

Secciones 1-7 viven en este archivo. Secciones 8-11 estan en archivos hermanos para respetar el limite de 600 lineas por archivo.

1. Configuración y arranque (`api/`, `manage.py`, `pyproject.toml`, `requirements.txt`, `.env.example`, `Dockerfile`) — **este archivo**
2. Modelos (`core/models/`) — **este archivo**
3. Serializers (`core/serializers/`) — **este archivo**
4. Services (`core/services/`) — **este archivo**
5. Views y URLs (`core/views/`, `core/urls.py`) — **este archivo**
6. Admin, autenticación, apps, paginación, conftest (`core/admin*.py`, `core/authentication.py`, `core/apps.py`, `core/pagination.py`, `core/conftest.py`) — **este archivo**
7. Management commands (`core/management/commands/`) — **este archivo**
8. Migraciones (`core/migrations/`) — [`08_migraciones.md`](./08_migraciones.md)
9. Tests (`core/test_*.py`, `api/test_meta.py`) — [`09_tests.md`](./09_tests.md)
10. Fixtures (`fixtures/`) — [`10_fixtures.md`](./10_fixtures.md)
11. Docs internos del backend (`backend/docs/`) — [`11_docs_internos.md`](./11_docs_internos.md)

---

## 1. Configuración y arranque

### `manage.py`
Entry point estándar de Django. Setea `DJANGO_SETTINGS_MODULE=api.settings` y delega en `execute_from_command_line(sys.argv)`. Solo tiene el `main()` boilerplate por default.

### `pyproject.toml`
Metadatos del proyecto `votoafin-backend` v0.1.0, descripción `"API REST de VotoAFin - matching votante/candidato"`, Python `>=3.10`.

Dependencias (runtime):
- `django>=5.2,<5.3`
- `djangorestframework>=3.15`
- `django-cors-headers>=4.4`
- `django-cleanup>=9.0`
- `python-decouple>=3.8`
- `Pillow>=10.3`
- `feedparser>=6.0`
- `drf-spectacular>=0.27`
- `dj-database-url>=2.2`
- `psycopg[binary]>=3.2`
- `sentry-sdk>=2.18`

Grupo dev: `pytest>=8.3`, `pytest-django>=4.9`, `pytest-cov>=5.0`.

Config pytest en `[tool.pytest.ini_options]`:
- `DJANGO_SETTINGS_MODULE = "api.settings"`
- `python_files = ["test_*.py", "*_test.py", "tests.py"]`
- `addopts = "-ra --strict-markers"`

### `requirements.txt`
Archivo generado automáticamente desde `pyproject.toml + uv.lock` para plataformas de deploy (Fly.io, Railway, Heroku). Comentario en el header explica cómo regenerar: `uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt`. Lista las mismas dependencias runtime que `pyproject.toml`.

### `.env.example`
Plantilla comentada de variables de entorno. Secciones:

- **Django core**: `SECRET_KEY` (obligatorio en prod), `DEBUG` (default False), `ALLOWED_HOSTS` (default `127.0.0.1,localhost,10.0.2.2`).
- **Base de datos**: `DATABASE_URL` opcional. Sin ella, usa SQLite local. Soporta `postgres://`, `mysql://`, `sqlite:///`.
- **CORS**: `CORS_ALLOWED_ORIGINS` (default `http://localhost:19006,http://localhost:8081`), `CORS_ALLOWED_ORIGIN_REGEXES` opcional. Comentario aclara que "nunca se abre a `*`".
- **Auth**: `TOKEN_TTL_DAYS` (default 30).
- **i18n**: `TIME_ZONE=America/Santiago`, `LANGUAGE_CODE=es-cl`.
- **Email**: `EMAIL_BACKEND` (default console para dev), `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL=no-reply@votoafin.cl`, `PASSWORD_RESET_URL_BASE=http://localhost:8081/reset-password`.
- **Hardening prod**: `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` (comentados por default).

### `Dockerfile`
Multi-stage build.

**Stage `builder`** (`python:3.13-slim`):
- Instala `build-essential`, `libpq-dev`, `libjpeg-dev`, `zlib1g-dev`.
- `pip install --user -r requirements.txt gunicorn` en `/build`.

**Stage `runtime`** (`python:3.13-slim`):
- Instala solo runtime libs: `libpq5`, `libjpeg62-turbo`, `zlib1g`.
- Crea usuario `app` con home `/home/app`.
- Copia site-packages del builder a `/home/app/.local`.
- Copia el código a `/app`.
- Corre `python manage.py collectstatic --noinput --clear || true`.
- `EXPOSE 8000`.
- `HEALTHCHECK` cada 30s haciendo `urllib.request.urlopen('http://localhost:8000/api/health/', timeout=3)`.
- `CMD` corre `gunicorn api.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60 --preload` con logs a stdout/stderr.

### `api/settings.py`
Configuración de Django. Usa `python-decouple` para leer variables de entorno y `dj_database_url` para parsear `DATABASE_URL`.

- **Seguridad**: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` desde `.env`.
- **INSTALLED_APPS**: apps de Django estándar + `rest_framework`, `rest_framework.authtoken`, `corsheaders`, `drf_spectacular`, la app local `core`, y `django_cleanup.apps.CleanupConfig` al final (necesario para que escuche signals de todas las apps).
- **MIDDLEWARE**: `CorsMiddleware` (primero, antes de `CommonMiddleware`) + los estándar de Django (security, sessions, common, csrf, auth, messages, xframe).
- **ROOT_URLCONF**: `api.urls`. **WSGI_APPLICATION**: `api.wsgi.application`.
- **TEMPLATES**: config Django default (APP_DIRS=True).
- **DATABASES**: `dj_database_url.config(default="sqlite:///.../db.sqlite3", conn_max_age=600, conn_health_checks=True)`.
- **AUTH_PASSWORD_VALIDATORS**: `UserAttributeSimilarity`, `MinimumLength` con `min_length=10` (comentario cita NIST 800-63B), `CommonPassword`, `NumericPassword`.
- **i18n**: `LANGUAGE_CODE=es-cl`, `TIME_ZONE=America/Santiago`, `USE_I18N=True`, `USE_TZ=True`.
- **Static/Media**: `STATIC_URL="static/"`, `MEDIA_URL="/media/"`, `MEDIA_ROOT=BASE_DIR/media`. `DEFAULT_AUTO_FIELD="django.db.models.BigAutoField"`.
- **CACHES**: LocMem cache (`votoafin-locmem`). Comentario indica que para multi-worker migrar a Redis.
- **Email**: variables de entorno; default backend console.
- **DRF**:
  - `TOKEN_TTL_DAYS` configurable (default 30).
  - `DRF_THROTTLE_DISABLED` opcional (solo para tests E2E).
  - `DEFAULT_AUTHENTICATION_CLASSES = ["core.authentication.ExpiringTokenAuthentication"]`.
  - `DEFAULT_PERMISSION_CLASSES = ["rest_framework.permissions.IsAuthenticated"]`.
  - `DEFAULT_SCHEMA_CLASS = "drf_spectacular.openapi.AutoSchema"`.
  - Throttles: `AnonRateThrottle`, `UserRateThrottle`, `ScopedRateThrottle`.
  - Rates: `anon: 60/min`, `user: 300/min`, `login: 5/min`, `register: 10/hour`, `password_reset: 3/hour`.
- **SPECTACULAR_SETTINGS**: title `"VotoAFin API"`, version `"1.0.0"`, `SCHEMA_PATH_PREFIX=r"/api/v1"`, `COMPONENT_SPLIT_REQUEST=True`.
- **CORS**: `CORS_ALLOWED_ORIGINS` y `CORS_ALLOWED_ORIGIN_REGEXES` desde `.env`, sin fallback a `*`.
- **Hardening prod** (solo si `DEBUG=False`): `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS=31536000`, HSTS con subdomains y preload, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_REFERRER_POLICY="same-origin"`, cookies `Secure`/`HttpOnly`/`SameSite=Lax`, `SECURE_PROXY_SSL_HEADER=("HTTP_X_FORWARDED_PROTO","https")`, `X_FRAME_OPTIONS="DENY"`.
- **Sentry**: se activa solo si hay `SENTRY_DSN`. Integraciones: `DjangoIntegration`, `LoggingIntegration(level=None, event_level=None)`. `traces_sample_rate` configurable (default 0.1). `send_default_pii=False`.
- **LOGGING**: formatter `verbose` (`{levelname} {asctime} {module} {message}`), handler `console`, logger `core` en DEBUG cuando `DEBUG=True` sino INFO.

### `api/urls.py`
URL config del proyecto. Rutas:

- `admin/` → Django admin.
- `api/health/` → `health_check` (fuera del versionado, para load balancers).
- `api/v1/health/` → alias versionado del mismo `health_check`.
- `api/v1/` → `include("core.urls")`.
- `api/v1/schema/` → `SpectacularAPIView` (OpenAPI 3.0 JSON/YAML).
- `api/v1/docs/` → `SpectacularSwaggerView` (Swagger UI).
- `api/v1/redoc/` → `SpectacularRedocView`.
- Si `DEBUG=True`: sirve `/media/` desde `MEDIA_ROOT`.

### `api/views.py`
Contiene una sola view: `health_check`.

- Decorada con `@extend_schema(tags=["meta"], responses={200: ..., 503: ...})`, `@api_view(["GET"])`, `@permission_classes([AllowAny])`.
- Devuelve payload con `status`, `api_version="1.0.0"`, `django_version`, `debug` y `checks.database`.
- Ejecuta `SELECT 1` contra la DB. Si falla, cambia `status="degraded"` y devuelve 503.

### `api/asgi.py` y `api/wsgi.py`
Boilerplate estándar de Django. Ambos exponen `application` seteando `DJANGO_SETTINGS_MODULE=api.settings`.

### `api/test_meta.py`
Tests del proyecto (no de la app). Fixture `anon_api` devuelve un `APIClient` sin autenticación.

- **`TestHealthCheck`**: `test_health_ok` verifica 200 con `status="ok"` y `checks.database="ok"`; `test_health_es_publico` confirma que no requiere auth.
- **`TestOpenAPISchema`**: verifica que `/api/v1/schema/`, `/api/v1/docs/` y `/api/v1/redoc/` responden 200 con contenido esperado (`openapi`, `swagger`, `redoc`).
- **`TestVersionadoAPI`**:
  - `test_api_v1_prefix_funciona`: `/api/tipos-eleccion/` (ruta vieja) debe dar 404; `/api/v1/tipos-eleccion/` debe dar 200 (público).
  - `test_bookmarking_sigue_requiriendo_auth`: `/api/v1/candidatos-favoritos/`, `/api/v1/descartados/` y `/api/v1/respuestas/` deben devolver 401/403 sin token.

### `api/__init__.py`
Vacío.

---

## 2. Modelos (`core/models/`)

Organización por dominio en 10 submódulos + `__init__.py` que re-exporta todos los nombres públicos para preservar `from core.models import X`.

### `__init__.py`
Re-exporta modelos, constantes y helpers:
- `PasswordResetToken`
- `Noticia`
- `Pregunta`, `OpcionRespuesta`, `RespuestaUsuario`
- Constantes: `OPCION_MUY_DE_ACUERDO`, `OPCION_DE_ACUERDO`, `OPCION_NEUTRAL`, `OPCION_EN_DESACUERDO`, `OPCION_MUY_EN_DESACUERDO`, `OPCIONES_ACUERDO_DESACUERDO`
- Helper: `crear_opciones_acuerdo_desacuerdo`
- `Eje`
- `TipoEleccion`, `Candidato`
- `PosturaCandidato`, `MatchCandidato`
- `UserProfile`
- `Region`, `Distrito`, `Comuna`
- `UnidadTerritorial`
- `CandidatoFavorito`, `CandidatoDescartado`, `NoticiaBookmark`, `PosturaBookmark`

El docstring aclara la organización por dominio funcional y menciona el modelo `territorio` como "legacy, ver H2 del audit" mientras que `unidad_territorial` es "la jerarquía territorial nueva".

---

### `auth.py` — `PasswordResetToken`
Token single-use para reset de password.

**Constante**: `TTL_HOURS = 1`.

**Campos**:
- `user`: FK a `User`, `related_name="reset_tokens"`.
- `token`: CharField(64) único, indexado.
- `created_at`: DateTimeField `auto_now_add`.
- `expires_at`: DateTimeField.
- `used_at`: DateTimeField nullable.

**Meta**: `verbose_name_plural="Password Reset Tokens"`, `ordering=["-created_at"]`.

**Propiedades**: `is_expired`, `is_used`, `is_valid`.

**Método de clase**: `default_expires_at()` → `timezone.now() + timedelta(hours=TTL_HOURS)`.

`__str__` refleja estado (`usado` / `expirado` / `vigente`).

---

### `content.py` — `Noticia`

**Campos**:
- `titulo`: CharField(300).
- `descripcion`: TextField.
- `url`: URLField(1000), blank, default `""`. Comentado como "clave lógica para dedup".
- `fuente`: CharField(200), blank. Ejemplos: `"Google News"`, `"La Tercera"`, `"Emol"`.
- `imagen_url`: URLField(1000), blank.
- `candidatos_mencionados`: M2M a `core.Candidato`, `related_name="noticias"`, blank.
- `fecha_publicacion`: DateTimeField `auto_now_add`.
- `actualizado_en`: DateTimeField `auto_now`.

**Meta**: `ordering=["-fecha_publicacion"]`. Constraint `noticia_url_unique_when_not_empty`: `url` único cuando `url != ""` (partial unique).

---

### `cuestionario.py`

#### `Pregunta`

Constantes de eje temático (usadas como choices legacy):
`EJE_ECONOMIA`, `EJE_SOCIEDAD`, `EJE_AMBIENTE`, `EJE_SEGURIDAD`, `EJE_DDHH`, `EJE_INTERNACIONAL`, `EJE_INSTITUCIONAL`. Cada uno mapea a un label legible en `EJES_CHOICES`.

**Campos**:
- `texto`: TextField.
- `tipo_eleccion`: FK a `TipoEleccion`, `related_name="preguntas"`.
- `orden`: IntegerField default 0.
- `eje_tematico`: CharField(24) con `choices=EJES_CHOICES`, default `EJE_INSTITUCIONAL`. "Fuente para el match".
- `eje`: FK opcional a `Eje`, `on_delete=SET_NULL`, `related_name="preguntas"`. Sincronizada con `eje_tematico` via signal `pre_save`.
- `explicacion`: TextField blank. "Contexto educativo neutro".
- `repercusiones`: JSONField (dict) con keys documentadas: `economico`, `social`, `cultural`, `ambiental`, `institucional`.

**Meta**: `ordering=["orden"]`.

#### `OpcionRespuesta`

**Campos**:
- `pregunta`: FK, `related_name="opciones_respuesta"`.
- `texto`: CharField(255).
- `valor`: IntegerField.
- `es_no_se`: BooleanField default False. Si True, se excluye del cálculo de match.

**Meta**: `unique_together=("pregunta","texto")`.

#### Constantes y helper de Likert-5
- `OPCION_MUY_DE_ACUERDO` = `"Muy de acuerdo"`
- `OPCION_DE_ACUERDO` = `"De acuerdo"`
- `OPCION_NEUTRAL` = `"Neutral"`
- `OPCION_EN_DESACUERDO` = `"En desacuerdo"`
- `OPCION_MUY_EN_DESACUERDO` = `"Muy en desacuerdo"`
- `OPCIONES_ACUERDO_DESACUERDO`: lista de tuplas `(texto, valor)` con valores 5..1.
- `crear_opciones_acuerdo_desacuerdo(pregunta)`: hace `bulk_create` de las 5 opciones estándar.

#### `RespuestaUsuario`

Constantes de peso: `PESO_NO_IMPORTA=0`, `PESO_POCO=1`, `PESO_MEDIO=2`, `PESO_MUCHO=3`. Choices: `"No me importa"`, `"Poco importante"`, `"Importante"`, `"Muy importante"`.

**Campos**:
- `user`: FK, `related_name="respuestas_usuario"`.
- `pregunta`: FK.
- `opcion_elegida`: FK a `OpcionRespuesta`.
- `peso`: IntegerField con choices, default `PESO_POCO`. "Multiplica el peso de la pregunta en el match".
- `fecha_respuesta`: DateTimeField `auto_now_add`.

**Meta**: `unique_together=("user","pregunta")`.

#### Signal `_sincronizar_pregunta_eje` (pre_save Pregunta)
Mantiene `Pregunta.eje` (FK) sincronizado con `Pregunta.eje_tematico` (string):
- Si `eje_id` está seteado: copia `eje.codigo` → `eje_tematico`.
- Si sólo `eje_tematico` está seteado: busca `Eje` por `codigo__iexact`; si no existe lo crea con `nombre=eje_tematico.capitalize()`.

---

### `eje.py` — `Eje`

Catálogo de ejes temáticos. Reemplaza el hardcoded `EJES_CHOICES` pero convive con él (el string sigue siendo fuente para el matching por simplicidad).

**Campos**:
- `codigo`: CharField(32) único. Slug canónico (case-insensitive).
- `nombre`: CharField(64).
- `color`: CharField(7) default `"#666666"`. Para radar chart y badges.
- `icono`: CharField(32) blank. Nombre Ionicons/Lucide.
- `orden`: IntegerField default 0.
- `activo`: BooleanField default True.
- `descripcion`: TextField blank. Para tooltips.

**Meta**: `ordering=["orden","nombre"]`, `verbose_name="Eje tematico"`.

---

### `electoral.py`

#### `TipoEleccion`

**Campos**:
- `nombre`: CharField(100) único. Ej: Presidencial, Parlamentaria, Regional, Municipal.
- `descripcion`: TextField nullable.
- `fecha_eleccion`: DateField nullable.
- `anio`: IntegerField nullable. Permite versionar ("Presidencial 2021" vs "Presidencial 2025").
- `es_base`: BooleanField default False. Si True, sus preguntas se agregan a **todas** las elecciones (preguntas transversales de valores/ideología).

#### `Candidato`

**Campos**:
- `nombre`: CharField(100).
- `apellido`: CharField(100) blank.
- `partido`: CharField(200).
- `bio`: TextField nullable.
- `ciudad`: CharField(100) blank.
- `propuesta_electoral`: TextField.
- `profile_picture`: ImageField, upload_to `"profiles/"`, default `"assets/default.avif"`.
- `tipos_eleccion`: M2M a `TipoEleccion`, `related_name="candidatos"`.
- `unidad_territorial`: FK a `UnidadTerritorial`, `on_delete=PROTECT`, `related_name="candidatos"`, nullable. Comentario: nulo = nacional. Alcaldes usan UT comunal, diputados distrital, senadores regional (a futuro).

**Propiedad `alcance_territorial`**: devuelve string `"nacional"` si no hay UT, sino `unidad_territorial.nivel`.

**Nota del código**: no hay signal para sincronizar `unidad_territorial`; los seeds y los importers setean el FK explícitamente. Si se crea un Candidato manualmente desde el admin sin UT, queda con `alcance_territorial="nacional"`.

#### Signal `_invalidar_cache_tipos_base` (post_save + post_delete de `TipoEleccion`)
Invalida `cache` de `services.tipos.get_base_tipo_ids()` (TTL 1h). Import local para evitar circular.

---

### `matching.py`

#### `PosturaCandidato`

**Campos**:
- `candidato`: FK, `related_name="posturas_candidato"`.
- `pregunta`: FK.
- `opcion_respuesta`: FK a `OpcionRespuesta`.
- `justificacion`: TextField nullable.

**Meta**: `unique_together=("candidato","pregunta")`.

#### `MatchCandidato`

Confianza: `CONFIANZA_TENTATIVA` (`"tentativa"`), `CONFIANZA_MEDIA` (`"media"`), `CONFIANZA_ALTA` (`"alta"`).

**Campos**:
- `user`: FK, `related_name="matches_candidato"`.
- `candidato`: FK.
- `match_percentage_value`: DecimalField(5,2) default 0.0.
- `num_preguntas_consideradas`: IntegerField default 0.
- `breakdown_por_eje`: JSONField. Dict `eje -> {porcentaje, preguntas}`.
- `confianza`: CharField(15) con choices, default `CONFIANZA_TENTATIVA`.
- `fecha_ultima_actualizacion`: DateTimeField `auto_now`.

**Meta**: `unique_together=("user","candidato")`.

---

### `perfil.py` — `UserProfile`

OneToOne con `settings.AUTH_USER_MODEL`, `related_name="profile"`.

**Campos**:
- `user`: OneToOne.
- `comuna`: FK a `Comuna`, `on_delete=SET_NULL`, `related_name="votantes"`, nullable.
- `unidad_territorial`: FK a `UnidadTerritorial`, `on_delete=SET_NULL`, `related_name="votantes"`, nullable. "Auto-sincroniza con comuna via signal".
- `fecha_actualizacion`: DateTimeField `auto_now`.

#### Signal `crear_profile_al_registrar_user` (post_save User)
`UserProfile.objects.get_or_create(user=instance)` cuando `created=True`.

#### Signal `_sincronizar_perfil_ut` (pre_save UserProfile)
Sincronización **unidireccional** `comuna → unidad_territorial`. Si `comuna_id` está seteado, busca `UnidadTerritorial` con `codigo=f"COM-{comuna.codigo}"` y la asigna. Si `comuna_id` es None, vacía `unidad_territorial`. Docstring aclara que **no** hace el reverso para no restaurar comunas viejas en PATCHs que envían `comuna=null`.

---

### `territorio.py`

Modelo territorial de Chile. Docstring aclara scope MVP: Presidencial + Diputados + Alcalde (no cubre circunscripciones senatoriales ni provincial CORE). Fuentes citadas: DL 575, Ley 20.840, Ley 21.073, catálogo INE / códigos Servel.

#### `Region`
**Campos**: `numero_romano` (CharField 5 único, ej. `"I"`, `"RM"`), `codigo` (CharField 2 único, código INE), `nombre` (único), `nombre_corto` (blank, para UI), `orden` (para norte-sur).
**Meta**: `ordering=["orden"]`.

#### `Distrito`
**Campos**: `numero` (IntegerField único, 1–28), `nombre` (CharField 100), `region` (FK `PROTECT`, `related_name="distritos"`), `escanos` (IntegerField default 0).
**Meta**: `ordering=["numero"]`.

#### `Comuna`
**Campos**: `codigo` (CharField 5 único, SUBDERE), `nombre`, `region` (FK `PROTECT`), `distrito` (FK `PROTECT`, `related_name="comunas"`).
**Meta**: `ordering=["region__orden","nombre"]`. Constraint `unique_comuna_por_region` sobre `(nombre, region)`.

#### Signals (post_save de Region, Distrito, Comuna)
Sólo actúan cuando `created=True` (para updates hay que correr `sync_unidades_territoriales`).

- `_upsert_ut_region`: `get_or_create` UT `"NACIONAL"` como raíz, luego UT `f"REG-{numero_romano}"` con nivel `regional`, padre nacional, metadata `{"codigo_region": codigo}`.
- `_upsert_ut_distrito`: crea UT `f"D-{numero}"` con nivel `distrital`, padre = UT de la region, metadata `{"numero_distrito": numero}`.
- `_upsert_ut_comuna`: crea UT `f"COM-{codigo}"` con nivel `comunal`, padre = UT del distrito, metadata `{"codigo_ine": codigo}`.

---

### `unidad_territorial.py` — `UnidadTerritorial`

Catálogo polimórfico que reemplaza el uso de FKs específicos en `Candidato`. Docstring aclara: Region/Distrito/Comuna siguen existiendo, se sincronizan via signals; los FKs viejos `Candidato.comuna/distrito` estaban deprecated y ya no existen en el schema actual (ver migración 0038).

Constantes de nivel: `NIVEL_NACIONAL`, `NIVEL_REGIONAL`, `NIVEL_PROVINCIAL`, `NIVEL_DISTRITAL`, `NIVEL_COMUNAL`. `NIVEL_CHOICES` cubre los cinco.

**Campos**:
- `codigo`: CharField(32) único. Ejemplos citados: `"NACIONAL"`, `"REG-13"`, `"D-10"`, `"COM-13120"`.
- `nombre`: CharField(128).
- `nivel`: CharField(16) con `choices=NIVEL_CHOICES`.
- `padre`: FK a `self`, `PROTECT`, `related_name="hijos"`, nullable.
- `metadata`: JSONField (dict).

**Meta**: `ordering=["nivel","nombre"]`, indexes en `nivel` y `padre`.

**Métodos**:
- `ancestros()`: lista de padres desde el inmediato a la raíz (walk vía `.padre`). Ej: comuna Ñuñoa → `[distrito 10, RM, nacional]`.
- `descendientes_ids()`: set con ids de todos los descendientes (BFS iterativo sobre `hijos`).

---

### `user_data.py` — Bookmarking

Cuatro modelos idénticos en estructura (`user` + FK al item + `fecha_agregado`), con `unique_together=("user", <item>)`:

#### `CandidatoFavorito`
- `user` FK, `related_name="favoritos"`.
- `candidato` FK.
- `fecha_agregado` `auto_now_add`.

#### `CandidatoDescartado`
- `user` FK, `related_name="descartados"`.
- `candidato` FK.
- `fecha_descartado` `auto_now_add`.

#### `NoticiaBookmark`
- `user` FK, `related_name="noticias_bookmark"`.
- `noticia` FK.
- `fecha_agregado` `auto_now_add`.
- Meta: `ordering=["-fecha_agregado"]`.

#### `PosturaBookmark`
- `user` FK, `related_name="posturas_bookmark"`.
- `postura` FK a `PosturaCandidato`.
- `fecha_agregado` `auto_now_add`.
- Meta: `ordering=["-fecha_agregado"]`.

---

## 3. Serializers (`core/serializers/`)

### `__init__.py`
Re-exporta desde los 8 submódulos. Los nombres públicos: `ActualizarComunaSerializer`, `AnonMatchResultSerializer`, `CambiarPasswordSerializer`, `CandidatoDescartadoSerializer`, `CandidatoFavoritoSerializer`, `CandidatoSerializer`, `ComunaInlineSerializer`, `EliminarCuentaSerializer`, `EjeSerializer`, `MatchCandidatoResultSerializer`, `NoticiaBookmarkSerializer`, `NoticiaSerializer`, `OpcionRespuestaSerializer`, `PasswordResetConfirmSerializer`, `PasswordResetRequestSerializer`, `PerfilSerializer`, `PosturaBookmarkSerializer`, `PosturaCandidatoSerializer`, `PreguntaSerializer`, `RespuestaUsuarioCreateSerializer`, `RespuestaUsuarioReadSerializer`, `TipoEleccionSerializer`, `UserSerializer`.

---

### `auth.py`

#### `UserSerializer` (ModelSerializer)
- Fields: `id`, `username`, `email`, `password` (write_only).
- `create()` usa `User.objects.create_user(username, email, password)`.

#### `PasswordResetRequestSerializer` (Serializer)
- `email: EmailField`.

#### `PasswordResetConfirmSerializer` (Serializer)
- `token: CharField(max_length=200)`.
- `new_password: CharField(min_length=8, write_only=True)`.

---

### `bookmarking.py`

#### `UniqueUserBookmarkMixin`
Mixin que adelanta la validación de `unique_together=(user, <objeto>)` para devolver 400 en vez de 500 (IntegrityError). Subclase declara `unique_object_field` y `unique_error_message`. En `validate()`: chequea `model.objects.filter(user=user, **{campo: obj}).exists()` y levanta `ValidationError`.

#### `CandidatoFavoritoSerializer` (mixin + ModelSerializer)
- `candidato_data` = `CandidatoSerializer(source="candidato", read_only=True)`.
- Fields: `id, candidato, fecha_agregado, candidato_data`.
- `unique_error_message = "Este candidato ya esta en tus favoritos."`.

#### `CandidatoDescartadoSerializer`
Igual patrón, con `fecha_descartado` y mensaje `"Este candidato ya esta descartado."`.

#### `NoticiaBookmarkSerializer`
Con `noticia_data`, mensaje `"Esta noticia ya esta guardada."`.

#### `PosturaBookmarkSerializer`
Con `postura_data`, mensaje `"Esta postura ya esta guardada."`.

---

### `catalog.py`

#### `EjeSerializer` (ModelSerializer)
Fields: `id, codigo, nombre, color, icono, orden, activo, descripcion`.

#### `TipoEleccionSerializer` (ModelSerializer)
`fields = "__all__"`.

#### `OpcionRespuestaSerializer` (ModelSerializer)
Fields: `id, texto, valor, es_no_se`.

#### `PreguntaSerializer` (ModelSerializer)
- `opciones_respuesta`: nested `OpcionRespuestaSerializer(many=True, read_only=True)`.
- `tipo_eleccion_nombre`: source `tipo_eleccion.nombre`.
- `eje_tematico_display`: source `get_eje_tematico_display`.
- `eje_nombre`, `eje_color`, `eje_icono`: source `eje.<campo>`, `default=None`.
- Fields completos: `id, texto, orden, tipo_eleccion, tipo_eleccion_nombre, eje_tematico, eje_tematico_display, eje, eje_nombre, eje_color, eje_icono, explicacion, repercusiones, opciones_respuesta`.

#### `CandidatoSerializer` (ModelSerializer)
- `tipos_eleccion_nombres`: `SlugRelatedField(source="tipos_eleccion", many=True, slug_field="nombre")`, read-only.
- Territorio (todos derivados de `unidad_territorial`):
  - Helpers privados `_ut_comuna(obj)` y `_ut_distrito(obj)` que retornan la UT si `nivel=="comunal"` / `"distrital"` respectivamente.
  - `get_comuna_nombre(obj)`: nombre de UT comunal.
  - `get_comuna_region_nombre(obj)`: recorre `ut.ancestros()` buscando `nivel=="regional"`.
  - `get_distrito_numero(obj)`: parsea `int(ut.codigo.split("-",1)[1])`.
  - `get_distrito_nombre(obj)`: nombre de UT distrital.
  - `alcance_territorial`: expuesto como CharField read-only (property del modelo).
- Fields completos: `id, nombre, apellido, partido, bio, ciudad, propuesta_electoral, profile_picture, tipos_eleccion, tipos_eleccion_nombres, unidad_territorial, comuna_nombre, comuna_region_nombre, distrito_numero, distrito_nombre, alcance_territorial`.

---

### `cuestionario.py`

#### `RespuestaUsuarioCreateSerializer` (ModelSerializer)
- `pregunta`: `PrimaryKeyRelatedField(queryset=Pregunta.objects.all())`.
- `opcion_elegida`: `PrimaryKeyRelatedField(queryset=OpcionRespuesta.objects.all())`.
- `peso`: IntegerField `required=False`, `min=0`, `max=3`, `default=RespuestaUsuario.PESO_POCO`.
- `validate()`: verifica que `opcion_elegida.pregunta == pregunta`; sino levanta `"La opcion elegida no pertenece a la pregunta especificada."`.

#### `RespuestaUsuarioReadSerializer` (ModelSerializer)
Expone `pregunta_texto`, `opcion_elegida_texto`, `opcion_elegida_valor` vía `source=`. Fields: `id, pregunta, pregunta_texto, opcion_elegida, opcion_elegida_texto, opcion_elegida_valor, fecha_respuesta`.

#### `OpcionSimpleSerializer` (ModelSerializer)
Fields: `id, texto, valor`. Para poblar editor.

#### `MisRespuestasItemSerializer` (ModelSerializer)
Expone respuesta con pregunta + eje + opciones disponibles. Fields: `id, pregunta, pregunta_texto, eje_tematico, eje_tematico_display, opcion_elegida, peso, opciones, fecha_respuesta` (todos read-only).

#### `EditarRespuestaSerializer` (Serializer)
Para `PATCH /respuestas/mias/{id}/`. Fields: `opcion_elegida: IntegerField`, `peso: IntegerField(min=0,max=3)`.

> Nota: `MisRespuestasItemSerializer`, `OpcionSimpleSerializer` y `EditarRespuestaSerializer` no están re-exportados en `__init__.py`; se importan directo del submódulo.

---

### `matching.py`

#### `PosturaCandidatoSerializer` (ModelSerializer)
Campos derivados: `opcion_respuesta_texto`, `opcion_respuesta_valor`, `pregunta_texto`, `pregunta_orden`, `eje_tematico`, `eje_tematico_display`, `candidato_nombre_completo` (SerializerMethodField que hace `f"{nombre} {apellido}".strip()`).
Fields: `id, candidato, pregunta, opcion_respuesta, justificacion` + los derivados.

#### `MatchCandidatoResultSerializer` (ModelSerializer)
- `candidato_data`: `CandidatoSerializer(source="candidato", read_only=True)`.
- `user`: `StringRelatedField(read_only=True)`.
- `match_percentage`: DecimalField(5,2), source `match_percentage_value`.
- `preguntas_consideradas`: source `num_preguntas_consideradas`.
- `confianza_display`: source `get_confianza_display`.
- Fields: `id, user, candidato_data, match_percentage, preguntas_consideradas, breakdown_por_eje, confianza, confianza_display`.

#### `AnonMatchResultSerializer` (Serializer)
Para resultados de match anónimo (guest). Trabaja con un dict `ScoreCandidato` del service.
- `candidato_data`: SerializerMethodField que hace `CandidatoSerializer(obj["candidato"]).data`.
- `match_percentage`: DecimalField(5,2).
- `preguntas_consideradas`: source `num_preguntas_consideradas`.
- `breakdown_por_eje`: DictField.
- `confianza`: CharField.

---

### `noticias.py`

#### `CandidatoMencionadoSerializer` (ModelSerializer)
Fields mínimos: `id, nombre, apellido, partido` (para chips).

#### `NoticiaSerializer` (ModelSerializer)
- `candidatos_mencionados`: `PrimaryKeyRelatedField(many=True, queryset=Candidato.objects.all(), required=False)` para writes.
- `candidatos_mencionados_data`: nested `CandidatoMencionadoSerializer(many=True, read_only=True)` para reads.
- Fields: `id, titulo, descripcion, url, fuente, imagen_url, candidatos_mencionados, candidatos_mencionados_data, fecha_publicacion, actualizado_en`.
- Read-only: `fecha_publicacion, actualizado_en`.

---

### `perfil.py`

#### `ContadoresSerializer` (Serializer)
Fields: `respuestas, favoritos, descartados` (todos IntegerField).

#### `ComunaInlineSerializer` (ModelSerializer)
- `region_nombre`: source `region.nombre`.
- `distrito_numero`: source `distrito.numero`.
- Fields: `(id, codigo, nombre, region_nombre, distrito_numero)`.

#### `PerfilSerializer` (Serializer)
Fields: `id, username, email, fecha_registro, contadores (ContadoresSerializer), comuna (ComunaInlineSerializer, allow_null)`.

#### `ActualizarComunaSerializer` (Serializer)
- `comuna_id`: IntegerField `allow_null=True`.
- `validate_comuna_id()`: si no es None, verifica que exista `Comuna.objects.filter(id=value).exists()`.

#### `CambiarPasswordSerializer` (Serializer)
- `current_password`: CharField write-only.
- `new_password`: CharField write-only, `min_length=8`.

#### `EliminarCuentaSerializer` (Serializer)
- `password`: CharField write-only.

> Nota: `ContadoresSerializer` no está en `__all__`; se usa anónimamente como nested dentro de `PerfilSerializer`.

---

### `unidad_territorial.py`

#### `UnidadTerritorialSerializer` (ModelSerializer)
- `padre_nombre`: source `padre.nombre`, default None.
- `padre_nivel`: source `padre.nivel`, default None.
- Fields: `id, codigo, nombre, nivel, padre, padre_nombre, padre_nivel, metadata`.

> Nota: este serializer no está re-exportado en `serializers/__init__.py`; se importa directo del submódulo.

---

## 4. Services (`core/services/`)

### `__init__.py`
Sólo un docstring: capa de "lógica de negocio pura, desacoplada del transporte HTTP (views)". No re-exporta nada; los consumidores importan desde el submódulo concreto (`from core.services.matching import ...`).

---

### `matching.py`

Algoritmo de matching entre respuestas del usuario y posturas de candidatos.

#### Constantes del algoritmo
- `MAX_DIFF_ESCALA = Decimal("4")` (escala 1..5).
- `PESO_MULTIPLIERS`: dict `{0: 0.5, 1: 1.0, 2: 1.5, 3: 2.0}` (Decimals). Comentario: `PESO_NO_IMPORTA` cuenta la mitad, no cero, para no ignorar del todo.
- `CONFIANZA_UMBRAL_MEDIA = 5`, `CONFIANZA_UMBRAL_ALTA = 10`.

#### Helpers privados

**`_tipo_ids_con_base(tipo_eleccion) -> list[int]`**  
Devuelve `[tipo_eleccion.id, ...ids_de_tipos_base]`. Los tipos con `es_base=True` aplican a todas las elecciones. Cache viene de `services/tipos.py`.

**`_filtrar_candidatos_por_territorio(qs, comuna)`**  
Aplica filtro territorial polimórfico via `UnidadTerritorial`. Si `comuna=None`, retorna el qs sin tocar. Si la comuna del votante no tiene UT registrada, **fail-open**: retorna qs sin filtrar. Sino: `ids_permitidos = {ut_votante.id} | {ancestros.id}`, filtra por `unidad_territorial__isnull=True OR unidad_territorial_id__in=ids_permitidos`.

#### TypedDict `ScoreCandidato`
`{candidato: Candidato, match_percentage: Decimal, num_preguntas_consideradas: int, breakdown_por_eje: dict, confianza: str}`.

#### Helpers puros

**`score_pregunta(diff: int) -> Decimal`**: no-lineal, `1 - (diff/4)^2`. Tabla:
- diff=0 → 1.00
- diff=1 → 0.9375
- diff=2 → 0.75
- diff=3 → 0.4375
- diff=4 → 0.00

**`confianza_por_n(n: int) -> str`**: `>=10 → ALTA`, `>=5 → MEDIA`, sino `TENTATIVA`.

#### `_calcular_scores(user_map, tipo_eleccion, comuna_usuario=None) -> list[ScoreCandidato]`
Core del algoritmo. In-memory, sin DB writes.
- `user_map`: `{pregunta_id: (valor_usuario, peso_multiplier, eje_tematico)}`.
- Query: `Candidato.objects.filter(tipos_eleccion=tipo_eleccion)` + filtro territorial + `prefetch_related` de `posturas_candidato` con `select_related("pregunta","opcion_respuesta")`.
- Para cada candidato itera sus posturas; si el user respondió esa pregunta:
  - `diff = |valor_user - postura.opcion_respuesta.valor|`
  - `score = score_pregunta(diff)`
  - `score_ponderado = score * peso_mult`
  - Acumula en total y en `breakdown_acc[eje] = [score_acc, peso_acc, count]`.
- Porcentaje = `(score_total / peso_total * 100).quantize(0.01)` (0.00 si peso_total==0).
- Breakdown final por eje incluye `porcentaje` (float, 2 decimales) y `preguntas` (int).
- Ordena por `match_percentage` descendente.

#### `calcular_match(user, tipo_eleccion) -> Optional[list[MatchCandidato]]`
Variante autenticada, **persiste**:
- Filtra `RespuestaUsuario` por `user` y `pregunta__tipo_eleccion_id__in=_tipo_ids_con_base(tipo_eleccion)`.
- Excluye opciones con `es_no_se`. Si no queda nada → retorna `None`.
- Extrae `comuna_usuario` vía `getattr(getattr(user, "profile", None), "comuna", None)`.
- Llama `_calcular_scores` y persiste con `MatchCandidato.objects.update_or_create(user, candidato, defaults=...)`.

#### `calcular_match_detalle(user, candidato) -> Optional[dict]`
Desglose pregunta-a-pregunta para "por qué X% de match".
- Une `_tipo_ids_con_base` para todos los tipos del candidato.
- Recolecta respuestas válidas (no-"No sé") + posturas del candidato.
- Para cada respuesta con postura correspondiente, arma un `item` con: `pregunta_id, pregunta_texto, pregunta_orden, eje_tematico, eje_tematico_display, user_valor, user_texto, user_peso, user_peso_display, user_peso_multiplicador, candidato_valor, candidato_texto, diff, score, contribucion, coincide (bool diff==0)`.
- Sort por `(-contribucion, pregunta_orden)`.
- Retorna dict `{candidato_id, candidato_nombre, match_percentage, num_preguntas_consideradas, confianza, items}`.

#### `calcular_match_anonimo(respuestas_raw, tipo_eleccion, comuna=None) -> list[ScoreCandidato]`
Variante guest (no persiste). `respuestas_raw` = iterable de `{"pregunta_id", "opcion_id", "peso"}`. Valida que preguntas pertenezcan al tipo (o a un tipo base) y que opciones existan. Ignora silenciosamente respuestas inválidas o con opciones `es_no_se`. Delega en `_calcular_scores`.

---

### `password_reset.py`

Servicio de reset de password (dominio puro, sin HTTP).

#### `ResetRequestResult` (dataclass)
- `email_sent: bool`
- `reset_link: Optional[str]` — sólo se popula si `DEBUG=True`; en prod siempre `None`.

#### `ResetError(Exception)`

#### `request_reset(email: str) -> ResetRequestResult`
- Normaliza email (`.strip().lower()`). Vacío → `ResetError("Email es obligatorio.")`.
- Busca `User.objects.filter(email__iexact=normalized).first()`.
- Si no existe: log INFO y retorna `email_sent=True` (no revela existencia — anti user enumeration).
- Si existe: crea token, arma link, envía email.

#### `confirm_reset(token_str: str, new_password: str) -> User`
- Valida token no vacío, password no vacía.
- Busca `PasswordResetToken.objects.select_related("user").get(token=token_str)`. `DoesNotExist` → `ResetError("Token invalido.")`.
- Chequea `is_used` (→ `"Este token ya fue usado."`), `is_expired` (→ `"Este token expiro. Solicita uno nuevo."`).
- `validate_password(new_password, user=token.user)`; DjangoValidationError → concatena mensajes en `ResetError`.
- `user.set_password(...)` + `user.save(update_fields=["password"])`.
- Marca token: `used_at = timezone.now()`, `save(update_fields=["used_at"])`.
- Retorna el `user`.

#### Helpers privados
- `_create_token(user)`: `secrets.token_urlsafe(48)` → crea `PasswordResetToken` con `expires_at=default_expires_at()`.
- `_build_reset_link(token)`: `f"{settings.PASSWORD_RESET_URL_BASE}?token={token}"` (default `http://localhost:8081/reset-password`).
- `_send_reset_email(user, reset_link)`: `send_mail` con subject `"VotoAFin - Restablecer tu contrasena"`, body multilinea que incluye username, link y TTL en horas. `fail_silently=False`.

---

### `perfil.py`

#### `PerfilError(Exception)`

#### `cambiar_password(user, current_password, new_password) -> None`
1. `user.check_password(current_password)` → si falso, `PerfilError("La contrasena actual es incorrecta.")`.
2. `validate_password(new_password, user=user)` → si falla, concatena mensajes.
3. Si la nueva es igual a la actual: `PerfilError("La nueva contrasena debe ser distinta de la actual.")`.
4. `user.set_password(...)` + `save(update_fields=["password"])`.

#### `eliminar_cuenta(user, password) -> None`
- Verifica `check_password(password)` → sino `PerfilError("La contrasena es incorrecta.")`.
- `with transaction.atomic(): user.delete()`. Comentario: CASCADE de Django limpia `RespuestaUsuario, MatchCandidato, CandidatoFavorito, CandidatoDescartado, PasswordResetToken, Token (auth)`.

#### `ActualizarComunaResult` (dataclass)
- `profile: UserProfile`
- `comuna_cambio: bool`
- `matches_invalidados: int`

#### `actualizar_comuna(user, comuna_id: Optional[int]) -> ActualizarComunaResult`
- `get_or_create(user=user)` de `UserProfile`.
- Si `comuna_id` no es None: `Comuna.objects.select_related("region","distrito").get(id=comuna_id)` (puede levantar `DoesNotExist`).
- `comuna_cambio = comuna_anterior_id != nueva.id`.
- `transaction.atomic`: setea comuna, `save(update_fields=["comuna","fecha_actualizacion"])`. Si cambió, `MatchCandidato.objects.filter(user=user).delete()` para invalidar cache territorial de matches.
- Retorna result con contador.

---

### `respuestas.py`

#### `ReiniciarResult` (frozen dataclass)
- `respuestas_borradas: int`, `matches_borrados: int`.

#### `ReiniciarError(Exception)` y `EditarRespuestaError(Exception)`

#### `EditarRespuestaResult` (frozen dataclass)
- `respuesta: RespuestaUsuario`, `matches_actualizados: int`.

#### `editar_respuesta(user, respuesta_id, opcion_id, peso) -> EditarRespuestaResult`
- Valida `peso in [0,3]`.
- Busca `RespuestaUsuario` (con `select_related("pregunta", "pregunta__tipo_eleccion")`) filtrando por `id` y `user`. `DoesNotExist` → `EditarRespuestaError("Respuesta no encontrada.")`.
- Busca `OpcionRespuesta` con `select_related("pregunta")`.
- Verifica `opcion.pregunta_id == respuesta.pregunta_id`.
- `transaction.atomic`: actualiza `opcion_elegida`, `peso` con `save(update_fields=[...,"fecha_respuesta"])`. Recalcula matches con `calcular_match(user, tipo)` (UPDATE inline, no delete+insert). Retorna count.

#### `reiniciar_cuestionario(user, tipo_eleccion_id) -> ReiniciarResult`
- Verifica que exista `TipoEleccion`. Sino, `ReiniciarError("Tipo de eleccion no encontrado.")`.
- `transaction.atomic`:
  - Borra `RespuestaUsuario.objects.filter(user=user, pregunta__tipo_eleccion_id=tipo_eleccion_id)`.
  - Borra `MatchCandidato.objects.filter(user=user, candidato__tipos_eleccion__id=tipo_eleccion_id)`.
- **NO toca** `CandidatoFavorito`, `CandidatoDescartado`, ni datos de otros tipos.

---

### `tipos.py`

Cache de ids de `TipoEleccion.es_base=True`.

#### Constantes
- `CACHE_KEY_BASE_TIPO_IDS = "matching:base_tipo_ids:v1"`.
- `CACHE_TTL_SECONDS = 60*60` (1h).

#### `get_base_tipo_ids() -> list[int]`
- Lee de `cache`. Si hit, retorna. Miss: `TipoEleccion.objects.filter(es_base=True).values_list("id", flat=True)`, `sorted(...)`, `cache.set(..., TTL)`.
- Import local de `TipoEleccion` para evitar circular.

#### `invalidar_cache_base_tipo_ids() -> None`
- `cache.delete(CACHE_KEY_BASE_TIPO_IDS)`. Idempotente. Invocado por signals de `TipoEleccion` (ver `models/electoral.py`).

---

## 5. Views y URLs

### `core/urls.py`

Usa `DefaultRouter` para 4 viewsets de bookmarking. Resto son paths explícitos.

#### Router (bookmarking)
| URL | Basename | ViewSet |
|---|---|---|
| `candidatos-favoritos/` | `candidato-favorito` | `CandidatoFavoritoViewSet` |
| `descartados/` | `descartado` | `CandidatoDescartadoViewSet` |
| `noticias-guardadas/` | `noticia-bookmark` | `NoticiaBookmarkViewSet` |
| `posturas-guardadas/` | `postura-bookmark` | `PosturaBookmarkViewSet` |

#### Tabla completa de endpoints (bajo `/api/v1/`)

| Método | Ruta | Name | View | Permisos |
|---|---|---|---|---|
| POST | `register/` | `register` | `RegisterUserView` | AllowAny + throttle `register` |
| POST | `login/` | `login` | `CustomAuthToken` | AllowAny + throttle `login` |
| POST | `logout/` | `logout` | `LogoutView` | IsAuthenticated |
| POST | `password-reset/request/` | `password-reset-request` | `PasswordResetRequestView` | AllowAny + throttle `password_reset` |
| POST | `password-reset/confirm/` | `password-reset-confirm` | `PasswordResetConfirmView` | AllowAny + throttle `password_reset` |
| GET/DELETE | `perfil/` | `perfil` | `PerfilView` | IsAuthenticated |
| POST | `perfil/cambiar-password/` | `perfil-cambiar-password` | `CambiarPasswordView` | IsAuthenticated |
| PATCH | `perfil/comuna/` | `perfil-comuna` | `ActualizarComunaView` | IsAuthenticated |
| GET | `regiones/` | `region-list` | `RegionListView` | AllowAny |
| GET | `comunas/` | `comuna-list` | `ComunaListView` | AllowAny |
| GET | `ejes/` | `eje-list` | `EjeListView` | AllowAny |
| GET | `unidades-territoriales/` | `unidad-territorial-list` | `UnidadTerritorialListView` | AllowAny |
| GET | `tipos-eleccion/` | `tipos-eleccion-list` | `TipoEleccionListView` | AllowAny |
| GET | `candidatos/` | `candidato-list` | `CandidatoListView` | AllowAny |
| GET | `candidatos/<int:pk>/` | `candidato-detail` | `CandidatoDetailView` | AllowAny |
| GET | `candidatos/<int:candidato_id>/noticias/` | `candidato-noticias` | `CandidatoNoticiasView` | AllowAny |
| GET | `candidatos/<int:candidato_id>/posturas/` | `candidato-posturas` | `CandidatoPosturasView` | AllowAny |
| GET | `candidatos/<int:candidato_id>/match-detalle/` | `candidato-match-detalle` | `CandidatoMatchDetalleView` | IsAuthenticated |
| GET | `preguntas/` | `pregunta-list` | `PreguntasPendientesView` | AllowAny |
| POST | `respuestas/` | `submit-answers` | `SubmitUserAnswersView` | IsAuthenticated (default) |
| POST | `respuestas/reiniciar/` | `respuestas-reiniciar` | `ReiniciarCuestionarioView` | IsAuthenticated |
| GET | `respuestas/mias/` | `respuestas-mias-list` | `MisRespuestasListView` | IsAuthenticated |
| PATCH | `respuestas/mias/<int:pk>/` | `respuestas-mias-detail` | `EditarRespuestaView` | IsAuthenticated |
| GET | `mi-progreso/` | `mi-progreso` | `MiProgresoView` | IsAuthenticated |
| POST | `match-candidatos/` | `match-candidatos` | `MatchCandidatoViewSet.match_candidatos` | IsAuthenticated |
| POST | `match-anonimo/` | `match-anonimo` | `MatchCandidatoViewSet.match_anonimo` | AllowAny (sin authenticator) |
| GET/POST | `noticias/` | `noticia-list-create` | `NoticiaListCreateView` | AllowAny (GET) / IsAdminUser (POST) |
| GET/PUT/PATCH/DELETE | `noticias/<int:pk>/` | `noticia-detail` | `NoticiaDetailView` | AllowAny (GET) / IsAdminUser (write) |
| GET/POST/DELETE | `candidatos-favoritos/[<pk>/]` | (router) | `CandidatoFavoritoViewSet` | IsAuthenticated |
| GET/POST/DELETE | `descartados/[<pk>/]` | (router) | `CandidatoDescartadoViewSet` | IsAuthenticated |
| GET/POST/DELETE | `noticias-guardadas/[<pk>/]` | (router) | `NoticiaBookmarkViewSet` | IsAuthenticated |
| GET/POST/DELETE | `posturas-guardadas/[<pk>/]` | (router) | `PosturaBookmarkViewSet` | IsAuthenticated |

---

### `views/__init__.py`
Re-exporta desde los 11 submódulos. `__all__` incluye 31 nombres.

---

### `views/auth.py`

#### `RegisterUserView` (CreateAPIView)
- `queryset=User.objects.all()`, `serializer_class=UserSerializer`, `permission_classes=[AllowAny]`.
- Throttle scope `"register"`.

#### `CustomAuthToken(ObtainAuthToken)`
- Throttle scope `"login"`.
- `post()`: valida credenciales, borra tokens viejos del user, crea uno nuevo. Retorna `{token, user_id, email}`.

#### `LogoutView` (APIView, IsAuthenticated)
- `POST`: `Token.objects.filter(user=request.user).delete()`. Retorna 204.

#### `PasswordResetRequestView` (APIView, AllowAny, sin authenticators)
- Throttle scope `"password_reset"`.
- `POST`: valida `PasswordResetRequestSerializer`, llama `request_reset()`. Retorna `{email_sent: True}` + `reset_link` sólo si `DEBUG=True`.

#### `PasswordResetConfirmView` (APIView, AllowAny, sin authenticators)
- Throttle scope `"password_reset"`.
- `POST`: valida serializer, llama `confirm_reset()`. Errores → 400. Éxito → `{"message": "Contrasena actualizada. Puedes iniciar sesion."}`.

---

### `views/bookmarking.py`

#### `_UserScopedCreateListDestroy` (base)
Combina `CreateModelMixin + ListModelMixin + DestroyModelMixin + GenericViewSet`.
- `get_queryset()`: `self.queryset_class.objects.filter(user=request.user).select_related("candidato")`.
- `perform_create(serializer)`: `serializer.save(user=request.user)`.

#### `CandidatoFavoritoViewSet` y `CandidatoDescartadoViewSet`
Heredan de la base. Definen `queryset_class` y `queryset = <Model>.objects.none()` (último es hint para drf-spectacular).

#### `NoticiaBookmarkViewSet`
Mismo shape que la base pero override propio:
- `get_queryset`: filtra por user con `select_related("noticia")` + `prefetch_related("noticia__candidatos_mencionados")`.
- `perform_create`: inyecta user.

#### `PosturaBookmarkViewSet`
- `get_queryset`: filtra por user con `select_related("postura", "postura__candidato", "postura__pregunta", "postura__opcion_respuesta")`.
- `perform_create`: inyecta user.

---

### `views/catalog.py`

Todos `AllowAny` (soporte modo invitado).

#### `TipoEleccionListView` (ListAPIView)
- `queryset = TipoEleccion.objects.all().order_by("anio", "nombre")`.

#### `CandidatoListView` (ListAPIView)
- `Candidato.objects.all().select_related("unidad_territorial", "unidad_territorial__padre").prefetch_related("tipos_eleccion").order_by("apellido", "nombre")`.

#### `CandidatoDetailView` (RetrieveAPIView)
- Mismo queryset con `select_related` y `prefetch_related`.

#### `CandidatoPosturasView` (ListAPIView)
- URL `/candidatos/<candidato_id>/posturas/`.
- `get_queryset`: `PosturaCandidato.objects.filter(candidato_id=...).select_related("candidato", "pregunta", "opcion_respuesta").order_by("pregunta__orden")`. Filtro opcional `?tipo_eleccion_id=` sobre `pregunta__tipo_eleccion_id`.

---

### `views/cuestionario.py`

#### `PreguntasPendientesView` (APIView, AllowAny)
- Requiere `?tipo_eleccion_id=<int>` (400 si falta, 404 si no existe).
- Combina `{tipo pedido} ∪ get_base_tipo_ids()` para incluir preguntas transversales.
- Query: `Pregunta.objects.filter(tipo_eleccion_id__in=tipo_ids).prefetch_related("opciones_respuesta").order_by("orden")`.
- Si el user está autenticado, excluye las que ya respondió.
- Retorna `PreguntaSerializer(many=True)`.

#### `SubmitUserAnswersView` (APIView, IsAuthenticated por default)
- `POST`: valida `RespuestaUsuarioCreateSerializer(many=True)`. En `transaction.atomic`, itera `validated_data` y hace `RespuestaUsuario.objects.update_or_create(user=..., pregunta=..., defaults={opcion_elegida, peso})`.
- Excepciones inesperadas → log + 500.
- 201 con `{message: "Respuestas procesadas exitosamente."}`.

#### `ReiniciarCuestionarioView` (APIView, IsAuthenticated)
- `POST`: requiere `tipo_eleccion_id` en body. Llama `reiniciar_cuestionario(user, id)`. `ReiniciarError` → 404. Cast error → 400. Retorna `{respuestas_borradas, matches_borrados}`.

#### `MisRespuestasListView` (APIView, IsAuthenticated)
- `GET`: requiere `?tipo_eleccion_id=`. Query con `select_related("pregunta","opcion_elegida")` + `prefetch_related("pregunta__opciones_respuesta")`. Ordena por `pregunta__orden`. Retorna `MisRespuestasItemSerializer(many=True)`.

#### `EditarRespuestaView` (APIView, IsAuthenticated)
- `PATCH /respuestas/mias/<pk>/`: valida `EditarRespuestaSerializer`. Llama `editar_respuesta(user, respuesta_id, opcion_id, peso)`. `EditarRespuestaError` → 404 si `"no encontrada" in msg` sino 400.
- Respuesta: `MisRespuestasItemSerializer(respuesta).data` + `matches_actualizados`.

---

### `views/eje.py`

#### `EjeListView` (ListAPIView, AllowAny)
- Sin paginación.
- `get_queryset`: `Eje.objects.all()`. Si `?incluir_inactivos=true` no está seteado, filtra `activo=True`. Ordena por `(orden, nombre)`.

---

### `views/matching.py`

#### `MatchCandidatoViewSet(GenericViewSet)`
- `get_permissions()`: si `action=="match_anonimo"` → `AllowAny`, sino `IsAuthenticated`.
- `get_authenticators()`: si `action=="match_anonimo"` → `[]` (evita 401 spurious cuando no viene token).

**Action `match_candidatos` (POST)**  
- Lee `tipo_eleccion_id` de body o query params. 400 si falta.
- 404 si no existe. 400 con `code="tipo_base_sin_candidatos"` si `tipo.es_base=True`.
- Llama `calcular_match(user, tipo)`. Si None → 400 con `code="sin_respuestas"`.
- Retorna `MatchCandidatoResultSerializer(many=True)`.

**Action `match_anonimo` (POST, url_path `match-anonimo`)**  
- Requiere `tipo_eleccion_id` y `respuestas` (lista) en body. 400 si falta.
- 404 si no existe tipo. 400 si `es_base=True`.
- Llama `calcular_match_anonimo(respuestas, tipo)`. Si vacío → 400 con `code="sin_respuestas"`.
- Retorna `AnonMatchResultSerializer(many=True)`.

#### `CandidatoMatchDetalleView` (GenericAPIView, IsAuthenticated)
- `GET /candidatos/<candidato_id>/match-detalle/`: busca candidato (404 si no existe). Llama `calcular_match_detalle(user, candidato)`. None → 400. Sino, devuelve el dict crudo.

---

### `views/mi_progreso.py`

#### Serializers internos
- `MiProgresoTopMatchSerializer` (Serializer): `candidato (CandidatoSerializer), match_percentage (source match_percentage_value), preguntas_consideradas (source num_preguntas_consideradas), confianza, confianza_display, breakdown_por_eje (JSONField)`.
- `MiProgresoItemSerializer` (Serializer): `tipo_eleccion_id, tipo_eleccion_nombre, total_preguntas, respondidas, completa, top_match (allow_null)`.

#### `MiProgresoView` (APIView, IsAuthenticated)
`GET /mi-progreso/` — resumen agregado para el Home HUB.

Contrato: siempre devuelve una entry por cada `TipoEleccion.es_base=False`, aunque el user no haya respondido (respondidas=0, completa=False, top_match=None).

Queries:
1. `preguntas_por_tipo`: `Pregunta.objects.values("tipo_eleccion_id").annotate(n=Count("id"))`.
2. `base_count`: suma de `preguntas_por_tipo.get(bid, 0)` para cada `bid in get_base_tipo_ids()`.
3. `respuestas_por_tipo`: `RespuestaUsuario` del user, excluye base, group by tipo.
4. `respuestas_base`: count del user en preguntas base.
5. `tipos_completos`: set de `tipo.id` con `respondidas >= total > 0`. Se calcula ANTES de iterar top_matches y se usa como filtro (ver punto 6).
6. `top_matches`: `MatchCandidato` del user con `select_related("candidato") + prefetch_related("candidato__tipos_eleccion")` ordenado desc por `match_percentage_value`. Iteracion: para cada match, para cada tipo del candidato, si `tipo.id in tipos_completos` y no visto, guardar (primer visto = mejor). **El filtro por `tipos_completos` evita el bug de "matches fantasma" donde un candidato en varios `tipos_eleccion` (M2M) leaqueaba su match calculado en un tipo hacia otros tipos que el user no habia contestado.**

Itera `TipoEleccion.objects.exclude(es_base=True).order_by("id")` y arma cada item con:
- `total_preguntas = propias + base_count`
- `respondidas = respuestas_por_tipo.get(tipo.id, 0) + respuestas_base`
- `completa = tipo.id in tipos_completos`
- `top_match = top_match_por_tipo.get(tipo.id)` (puede ser None si aún no se calculó el match).

---

### `views/noticias.py`

#### `_NoticiaPermMixin`
- `get_permissions`: `AllowAny` para SAFE_METHODS, `IsAdminUser` para el resto.

#### `NoticiaListCreateView` (mixin + ListCreateAPIView)
- `pagination_class = StandardResultsSetPagination`.
- `get_queryset`: base `Noticia.objects.all().prefetch_related("candidatos_mencionados").order_by("-fecha_publicacion")`. Filtros opcionales:
  - `candidato_id`: `filter(candidatos_mencionados__id=...).distinct()`.
  - `fuente`: `filter(fuente__icontains=...)`.
  - `dias`: `filter(fecha_publicacion__gte=timezone.now()-timedelta(days=int(dias)))`. `try/except` silencioso ante valores inválidos.
  - `q`: `filter(Q(titulo__icontains=q) | Q(descripcion__icontains=q))`.

#### `NoticiaDetailView` (mixin + RetrieveUpdateDestroyAPIView)
- `queryset = Noticia.objects.all()`, `serializer_class = NoticiaSerializer`.

#### `CandidatoNoticiasView` (ListAPIView, AllowAny)
- `GET /candidatos/<candidato_id>/noticias/`.
- Filtra noticias que mencionan al candidato, ordena por `-fecha_publicacion`, `distinct()`.

---

### `views/perfil.py`

#### `PerfilView` (APIView, IsAuthenticated)
**GET**: `UserProfile.objects.select_related("comuna","comuna__region","comuna__distrito").get_or_create(user=user)`. Retorna dict con `id, username, email, fecha_registro, contadores {respuestas, favoritos, descartados}, comuna (ComunaInlineSerializer o None)`.

**DELETE**: valida `EliminarCuentaSerializer`, llama `eliminar_cuenta(user, password)`. `PerfilError` → 400. Éxito → 204.

#### `CambiarPasswordView` (APIView, IsAuthenticated)
- `POST`: valida `CambiarPasswordSerializer`, llama `cambiar_password(user, current, new)`. Errores → 400. Éxito → `{message: "Contrasena actualizada."}`.

#### `ActualizarComunaView` (APIView, IsAuthenticated)
- `PATCH`: valida `ActualizarComunaSerializer`, llama `actualizar_comuna(user, comuna_id)`. `Comuna.DoesNotExist` → 400.
- Si `comuna_cambio and matches_invalidados`, loguea INFO con el count.
- Retorna `ComunaInlineSerializer(profile.comuna).data` o `None`.

---

### `views/territorio.py`

#### `RegionListView` (ListAPIView, AllowAny)
- Sin paginación. `queryset = Region.objects.all().order_by("orden")`.
- Override `list()` retorna lista de dicts `{id, codigo, numero_romano, nombre, nombre_corto}`.

#### `ComunaListView` (ListAPIView, AllowAny)
- Sin paginación. `serializer_class = ComunaInlineSerializer`.
- `get_queryset`: `Comuna.objects.select_related("region","distrito")`. Filtros: `region_id`, `q` (`nombre__icontains OR codigo__istartswith`). Orden `(region__orden, nombre)`.

---

### `views/unidad_territorial.py`

#### `UnidadTerritorialListView` (ListAPIView, AllowAny)
- Sin paginación. Filtros: `nivel`, `padre` (id), `q` (`nombre__icontains`). Orden `(nivel, nombre)`.

---

## 6. Admin, autenticación custom, apps, paginación, conftest

### `core/apps.py`
```
class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
```
Sin `ready()` — los signals se conectan vía decorators `@receiver` al importar los modelos.

---

### `core/authentication.py`

#### `ExpiringTokenAuthentication(TokenAuthentication)`
Token de DRF con TTL configurable vía `settings.TOKEN_TTL_DAYS` (default 30).

**`authenticate_credentials(key)`**:
- Llama al `super()`. Toma `token.created`, calcula `expira_en = created + timedelta(days=ttl)`.
- Si `timezone.now() >= expira_en`: `token.delete()` + `raise AuthenticationFailed("Token expirado. Inicia sesion de nuevo.")`.
- Sino, retorna `(user, token)`.

Ciclo de vida completo: Login (crea) → uso (valida edad) → Logout (borra) → cron `limpiar_tokens_viejos` limpia expirados.

---

### `core/pagination.py`

#### `StandardResultsSetPagination(PageNumberPagination)`
- `page_size = 25`, `page_size_query_param = "page_size"`, `max_page_size = 100`.
- Response shape estándar de DRF: `{count, next, previous, results}`.
- Se aplica selectivamente por endpoint (por ahora sólo en `NoticiaListCreateView`). Comentario del módulo: no se pone global para no romper el frontend que asume list endpoints como arrays planos.

---

### `core/admin.py`

Docstring: convenciones de `list_display`, `list_filter`, `search_fields`, `autocomplete_fields`, `inlines`.

Importa con `# noqa: F401` los sub-admins: `admin_eje`, `admin_territorio`, `admin_unidad_territorial` (autorregistro).

#### Inlines
- **`OpcionRespuestaInline`** (TabularInline): fields `(texto, valor, es_no_se)`, orden `valor`, `extra=0`. Usado desde Pregunta.
- **`PreguntaInline`** (TabularInline, sólo lectura): fields `(orden, texto, eje_tematico)`, `readonly=(texto,)`, `can_delete=False`, `show_change_link=True`. Usado desde TipoEleccion.

#### `TipoEleccionAdmin`
- `list_display`: `(nombre, anio, fecha_eleccion, es_base, num_preguntas, num_candidatos)`.
- `list_filter`: `(es_base, anio)`. `search_fields`: `(nombre, descripcion)`.
- `ordering`: `(-es_base, -anio, -fecha_eleccion, nombre)`. `inlines = [PreguntaInline]`.
- `get_queryset`: annotate `_num_pregs=Count("preguntas", distinct=True)`, `_num_cands=Count("candidatos", distinct=True)`.
- Displays `num_preguntas` y `num_candidatos` orderables por las anotaciones.

#### `CandidatoAdmin`
- `list_display`: `(nombre, apellido, partido, alcance_territorial, unidad_territorial, get_tipos_eleccion)`.
- `list_filter`: `(tipos_eleccion, partido, unidad_territorial__nivel)`.
- `search_fields` incluye nombre/apellido/partido/ciudad + `unidad_territorial__nombre/codigo`.
- `filter_horizontal = ("tipos_eleccion",)`, `autocomplete_fields = ("unidad_territorial",)`.
- Displays: `get_tipos_eleccion` (join con `", ".join(...)`), `alcance_territorial` (property del modelo, orderable por `unidad_territorial__nivel`).

#### `PreguntaAdmin`
- `list_display`: `(texto_corto, tipo_eleccion, eje_tematico, orden)`.
- `list_filter`: `(tipo_eleccion, eje_tematico)`. `list_editable = (eje_tematico,)`.
- `search_fields = (texto,)`, `ordering = (tipo_eleccion, orden)`, `autocomplete_fields = (tipo_eleccion,)`.
- `inlines = [OpcionRespuestaInline]`.
- **Action `crear_opciones_estandar`**: por cada pregunta selecc, `OpcionRespuesta.objects.filter(pregunta=...).delete()` + `crear_opciones_acuerdo_desacuerdo(pregunta)`. `message_user` con conteo.
- Display `texto_corto`: primeros 80 chars + `"..."`.

#### `OpcionRespuestaAdmin`
- `list_display`: `(texto, valor, es_no_se, pregunta)`.
- `list_filter`: `(pregunta__tipo_eleccion, es_no_se)`. `list_editable = (valor, es_no_se)`.
- `search_fields`: `(texto, pregunta__texto)`. `ordering`: `(pregunta__orden, valor)`.

#### `PosturaCandidatoAdmin`
- `list_display`: `(candidato, pregunta_corta, opcion_respuesta)`.
- `list_filter`: `(candidato__tipos_eleccion, pregunta__eje_tematico)`.
- `autocomplete_fields`: `(candidato, pregunta, opcion_respuesta)`.
- Display `pregunta_corta`: 60 chars.

#### `RespuestaUsuarioAdmin`, `CandidatoFavoritoAdmin`, `CandidatoDescartadoAdmin`
- Todos con `list_display` de user + relación + fecha, `list_filter` por peso/tipo, `search_fields` por username + nombre/apellido, `autocomplete_fields = (user, candidato o pregunta)`, `date_hierarchy` en la fecha.

#### `NoticiaAdmin`
- `list_display`: `(titulo, fuente, fecha_publicacion)`.
- `list_filter`: `(fuente,)`. `search_fields`: `(titulo, descripcion)`.
- `filter_horizontal = ("candidatos_mencionados",)`.
- `readonly_fields = ("fecha_publicacion", "actualizado_en")`. `date_hierarchy = "fecha_publicacion"`.

#### `NoticiaBookmarkAdmin` y `PosturaBookmarkAdmin`
- `list_display`: `(user, <relación>, fecha_agregado)`, `search_fields` por username + título/apellido, `autocomplete_fields`, `date_hierarchy = "fecha_agregado"`.

---

### `core/admin_eje.py`

#### `EjeAdmin`
- `list_display`: `(codigo, nombre, color, orden, activo, num_preguntas)`.
- `list_editable = (color, orden, activo)`. `list_filter = (activo,)`.
- `search_fields`: `(codigo, nombre)`. `ordering`: `(orden, nombre)`.
- Display `num_preguntas`: `obj.preguntas.count()`.

---

### `core/admin_territorio.py`

#### `RegionAdmin`
- `list_display`: `(orden, numero_romano, codigo, nombre, num_comunas)`.
- `get_queryset` annotate `_num_com=Count("comunas")`; display orderable por esa anotación.

#### `DistritoAdmin`
- `list_display`: `(numero, nombre, region, escanos, num_comunas)`.
- `list_filter = (region,)`, `autocomplete_fields = (region,)`.
- Mismo patrón de annotate para `num_comunas`.

#### `ComunaAdmin`
- `list_display`: `(codigo, nombre, region, distrito)`.
- `list_filter = (region, distrito)`, `autocomplete_fields = (region, distrito)`, `ordering = (region__orden, nombre)`.

#### `UserProfileAdmin`
- `list_display`: `(user, comuna, get_region, fecha_actualizacion)`.
- `list_filter = (comuna__region,)`, `search_fields`: `(user__username, user__email, comuna__nombre)`, `autocomplete_fields = (user, comuna)`.
- Display `get_region`: `obj.comuna.region.nombre if obj.comuna_id else "-"`.

---

### `core/admin_unidad_territorial.py`

#### `UnidadTerritorialAdmin`
- `list_display`: `(codigo, nombre, nivel, padre, num_candidatos)`.
- `list_filter = (nivel,)`, `search_fields`: `(codigo, nombre)`, `ordering = (nivel, nombre)`, `autocomplete_fields = (padre,)`.
- Display `num_candidatos`: `obj.candidatos.count()`.

---

### `core/conftest.py`

#### Fixture `_disable_throttling` (autouse=True)
- Sobrescribe `settings.REST_FRAMEWORK` con `DEFAULT_THROTTLE_CLASSES=[]` y todos los rates a `"1000000/min"` (anon/user/login/register/password_reset).
- `cache.clear()` antes y después del yield.

#### Fixture `datos_pesados(db)`
Seed function-scoped: por cada test que la pide corre `call_command(...)` para:
1. `seed_territorio_chile`
2. `seed_preguntas_base`
3. `seed_presidenciales_2025`
4. `seed_diputados_2025`
5. `seed_preguntas_por_tipo`

(`seed_alcaldes_2024` NO esta en el fixture -- el comando no existe aun.)

Es lento (~10s por test) pero garantiza aislamiento. Comentario explícito: se probó `scope='session'` y rompió 28 tests — se descartó.

---

## 7. Management commands (`core/management/commands/`)

### Módulos de data compartida (empiezan con `_`, no son comandos)

#### `_data_chile.py` (17.7 KB)
Tuplas estáticas `REGIONES`, `DISTRITOS`, `COMUNAS` con la estructura territorial chilena (16 regiones DL 575, 28 distritos Ley 21.073, 346 comunas SUBDERE). Consumido por `seed_territorio_chile`.

#### `_data_candidatos_ficticios.py` (6.7 KB)
Generador determinístico de candidatos:
- Listas `NOMBRES_M`, `NOMBRES_F`, `APELLIDOS` (chilenos comunes).
- Dict `POSTURAS_POR_PARTIDO` con 8 valores 1-5 por cada partido conocido.
- Diccionarios `DISTRIBUCION_DIPUTADOS` y `DISTRIBUCION_ALCALDES` con pesos.
- Funciones `elegir_partidos(seed_int, n, distribucion)` y `generar_candidato(seed, idx, partido)` usan `random.Random(seed)` para idempotencia. Consumido actualmente por `seed_diputados_2025`. `DISTRIBUCION_ALCALDES` existe preparado para un futuro `seed_alcaldes_2025` aun no implementado.

#### `_preguntas_por_tipo.py` (12.1 KB)
Exporta:
- Listas `PREGUNTAS_PRESI_2025`, `PREGUNTAS_DIP_2025` (5 preguntas c/u con texto, eje, explicacion, repercusiones). No existe `PREGUNTAS_ALC_2024` -- las preguntas de alcaldes aun no estan implementadas.
- Dict `POSTURAS_ESPECIFICAS[partido][clave]` donde `clave in {"presi","dip"}` → lista de 5 valores. Incluye entry `"Independiente"` como fallback.

---

### Comandos de import (archivos CSV externos)

#### `import_candidatos.py`
**`Command.help`**: `"Importa candidatos desde un archivo CSV. Idempotente por (nombre, apellido, partido)."`

**Args**: `archivo` (positional path), `--delimiter=","`, `--encoding="utf-8"`, `--dry-run`.

Columnas requeridas: `{nombre, apellido, partido, tipos_eleccion}` (esta última separada por `|`). Opcionales: `ciudad, bio, propuesta_electoral`.

**Flujo**:
- Valida existencia de archivo y columnas requeridas.
- `transaction.atomic` + savepoint. Por cada fila: `_importar_fila(row)`, catchea excepciones y las loguea sin abortar el batch.
- Si `--dry-run` → `savepoint_rollback`, sino `savepoint_commit`.
- Por fila: `TipoEleccion.objects.get_or_create(nombre=...)` para cada tipo; `Candidato.objects.update_or_create(nombre, apellido, partido, defaults={ciudad, bio, propuesta_electoral})`; `candidato.tipos_eleccion.set(tipos_obj)`.

#### `import_preguntas.py`
**Help**: `"Importa preguntas y auto-genera sus opciones de respuesta estandar."`

**Args**: `archivo`, `--delimiter`, `--encoding`, `--dry-run`.

Columnas requeridas: `{texto, tipo_eleccion, eje_tematico}`. Opcional: `orden`.

Auto-crea 6 `OpcionRespuesta` Likertándar (1..5 + "No se" con `es_no_se=True, valor=0`). Valida que `eje_tematico` esté en `EJES_VALIDOS = {choice[0] for choice in Pregunta.EJES_CHOICES}` (hardcoded en el modelo pre-tabla `Eje`; ver drift documentado en sección 2 sobre `content.py`).

Mismo patrón savepoint + dry-run que `import_candidatos`.

#### `import_posturas.py`
**Help**: `"Importa posturas de candidatos desde CSV verificable (justificacion + fuente_url obligatorias)."`

**Args**: `csv_path`, `--dry-run`, `--update` (si la postura ya existe, la sobreescribe; sin este flag, ignora duplicados).

Columnas requeridas: `{candidato_apellido, pregunta_orden, valor, justificacion, fuente_url}`. `MIN_JUSTIFICACION = 20` chars.

**Validaciones por fila** (levantan `ValueError` capturado y logueado):
- candidato con `apellido` case-insensitive existe.
- `pregunta_orden` es entero, existe.
- `valor` entero 1..5.
- `justificacion` >= 20 chars.
- `fuente_url` empieza con `http://` o `https://`.
- Existe `OpcionRespuesta(pregunta=..., valor=..., es_no_se=False)`.

Guarda como `f"{justificacion}\n\nFuente: {fuente_url}"` en el campo `justificacion` (el modelo no tiene campo `fuente_url`).

Si hay errores o `dry-run` → `transaction.set_rollback(True)`. Muestra los primeros 20 errores.

---

### Comando de fetch externo

#### `fetch_noticias.py`
**Help**: `"Fetch de noticias por candidato desde Google News RSS."`

Constante: `GOOGLE_NEWS_RSS = "https://news.googlom/rss/search?q={query}&hl=es-CL&gl=CL&ceid=CL:es-419"`.

**Args**: `--candidato-id` (default None = todos), `--max=10`, `--extra-keyword="candidato"`, `--dry-run`.

**Flujo**:
- Query por candidato: `f'"{nombre} {apellido}" {extra_keyword}'`.
- Parsea con `feedparser.parse(url)`. Skip si `feed.bozo and not feed.entries`.
- Por cada entry (hasta `--max`): extrae `url`, `titulo`, `descripcion`, `fuente` (de `entry.source.title` o `"Google News"`).
- `Noticia.objects.update_or_create(url=..., defaults={titulo, descripcion, fuente})` — idempotente por URL.
- `noticia.candidatos_mencionados.add(candidato)` si aún no está.
- `transaction.atomic` + savepoint con `--dry-run` rollback.

---

### Comando de mantenimiento

#### `limpiar_tokens_viejos.py`
**Help**: `"Borra tokens de auth con `created` anterior al TTL configurado."`

**Args**: `--ttl` (default lee `settings.TOKEN_TTL_DAYS` o 30), `--dry-run`.

**Flujo**: `Token.objects.filter(created__lt=timezone.now()-timedelta(days=ttl)).delete()`. Log del count antes/después. Pensado para cron periódico.

---

### Seeds de estructura territorial y preguntas base

#### `seed_territorio_chile.py`
**Help**: `"Carga la estructura territorial chilena: regiones, distritos y comunas."`  
**Args**: `--reset` (borra todo primero).

**Flujo (todo bajo `@transaction.atomic`)**:
1. Itera `REGIONES` → `Region.objects.update_or_create(codigo=..., defaults={numero_romano, nombre, nombre_corto, orden})`. Guarda en `regiones_por_codigo`.
2. Itera `DISTRITOS` → `Distrito.objects.update_or_create(numero=..., defaults={nombre, region, escanos})`.
3. Itera `COMUNAS` → `Comuna.objects.update_or_create(codigo=..., defaults={nombre, region, distrito})`.

Reporta counts totales/creados por nivel.

#### `seed_preguntas_base.py`
**Help**: `"Crea/actualiza el set de PREGUNTAS BASE (transversales) + posturas."`  
**Args**: `--reset`.

**Data hardcoded** dentro del módulo:
- `NOMBRE_TIPO = "Preguntas generales"`.
- Lista `PREGUNTAS` con 8 dicts (texto, eje, explicacion, repercusiones dimensionales). `assert len == 8`.
- Lista `OPCIONES` Likert-5 estándar (con "No se" `es_no_se=True, valor=0`).
- Dict `RESPUESTAS` mapea `(nombre, apellido)` → lista de 8 valores para candidatos presidenciales y parlamentaria de ejemplo.

**Flujo**:
1. Si `--reset`, borra `TipoEleccion` "Preguntas generales" (cascade a preguntas/posturas).
2. `TipoEleccion.objects.update_or_create(nombre=NOMBRE_TIPO, defaults={..., es_base=True})`.
3. Por pregunta: `update_or_create` + crear las 6 opciones Likert.
4. Por candidato en `RESPUESTAS`: si existe, `PosturaCandidato.objects.update_or_create(candidato, pregunta, defaults={opcion_respuesta})` para cada uno de los 8 valores.

Reporta resumen final.

---

### Seeds de elecciones reales

#### `seed_presidenciales_2025.py`
**Help**: `"Crea el TipoEleccion 'Presidencial 2025' con los 8 candidatos oficiales y posturas base."`  
**Args**: `--reset`.  
**Requiere**: `seed_preguntas_base` (usa las 8 preguntas base).

**Data hardcoded**: lista `CANDIDATOS` con 8 candidatos presidenciales chilenos 2025 (Jara, Kast, Matthei, Parisi, Kaiser, Enríquez-Ominami, Mayne-Nicholls, Artés), cada uno con `nombre, apellido, partido, bio, propuesta, posturas` (lista de 8 valores 1-5 para las 8 preguntas base).

**Flujo**: chequea que existan las 8 preguntas base. `TipoEleccion.objects.update_or_create(nombre="Presidencial 2025", defaults={..., anio=2025})`. Por cada candidato: `Candidato.objects.update_or_create(nombre, apellido, defaults={partido, bio, propuesta_electoral})` + `candidato.tipos_eleccion.add(tipo)` + 8 `PosturaCandidato.update_or_create`.

#### `seed_diputados_2025.py`
**Help**: `"Crea 140 diputados ficticios (5 por distrito x 28) con posturas por partido."`  
**Constantes**: `NOMBRE_TIPO="Diputados 2025"`, `CANDIDATOS_POR_DISTRITO=5`.  
**Requiere**: `seed_territorio_chile` + `seed_preguntas_base`.

**Flujo**:
1. Chequea 28 distritos + 8 preguntas base.
2. `TipoEleccion.objects.update_or_create("Diputados 2025", ..., anio=2025)`.
3. Construye `ut_por_distrito` (`UnidadTerritorial.nivel="distrital"` indexado por `metadata["numero_distrito"]`).
4. Por distrito → `elegir_partidos(distrito.numero, 5, DISTRIBUCION_DIPUTADOS)`.
5. Por candidato: `Candidato.objects.update_or_create(nombre, apellido, unidad_territorial=ut, defaults={...})` + `add(tipo)` + 8 `PosturaCandidato.update_or_create` (una por cada pregunta base).

#### `seed_alcaldes_2024.py` -- NO IMPLEMENTADO

> **Este comando no existe en el repositorio.** Los datos de soporte estan
> preparados (`DISTRIBUCION_ALCALDES` en `_data_candidatos_ficticios.py`)
> pero el comando en si nunca fue creado. El diseno planeado era:
> - ~1038 alcaldes ficticios (3 por comuna x 346 comunas)
> - `NOMBRE_TIPO="Alcaldes 2024"`, `CANDIDATOS_POR_COMUNA=3`
> - Bulk operations identicas a `seed_diputados_2025`
> - Requeriria `seed_territorio_chile` + `seed_preguntas_base`

#### `seed_preguntas_por_tipo.py`
**Help**: `"Crea preguntas especificas por tipo + genera posturas para todos los candidatos."`  
**Args**: `--reset`.

Usa `_preguntas_por_tipo` (SETS = 2 tuplas `(nombre_tipo, preguntas, clave)` para Presidencial 2025 y Diputados 2025). Alcaldes no esta implementado aun.

**Helper**: `_match_partido(partido_candidato)` — busca por keys de `POSTURAS_ESPECIFICAS` con match parcial case-insensitive, priorizando la key más larga. Si no match → None (usa fallback "Independiente").

**Flujo por SET**:
1. Verifica que exista el `TipoEleccion`.
2. Si `--reset`, borra las preguntas específicas por `texto__in`.
3. Precarga `tipo.candidatos.all()`.
4. Crea/actualiza preguntas con `orden=100+idx` (para separarlas de las base 1..8) + opciones Likert.
5. Indexa opciones `(pregunta_id, valor) → OpcionRespuesta` e `posturas_existentes` para dedup.
6. Bulk crea `PosturaCandidato` para todas las combinaciones (candidato, pregunta) faltantes usando `_match_partido` o fallback.

#### `seed_parlamentaria.py`
**Help**: `"Crea datos de ejemplo para una eleccion Parlamentaria 2025."`  
**Args**: `--reset`.

Data hardcoded independiente (no reusa las 8 preguntas base):
- Constantes `NOMBRE_ELECCION="Parlamentaria 2025"`, `FECHA_ELECCION=date(2025,11,16)`.
- Lista `PREGUNTAS` con 8 preguntas propias (con texto, eje, explicacion, repercusiones).
- Lista `CANDIDATOS` con 4 candidatos ficticios (Camila Rojas, Diego Vergara, Fernanda Muñoz, Matias Contreras) cada uno con perfil ideológico y `respuestas` (lista de 8 valores).

**Flujo**: mismo patrón `--reset`, `TipoEleccion.update_or_create` + 8 preguntas con `update_or_create` + opciones + candidatos + posturas.

> Nota: parece un seed histórico/ejemplo. Los seeds actuales usan `seed_preguntas_base` + `seed_diputados_2025` + `seed_preguntas_por_tipo`.

#### `seed_explicaciones_preguntas.py` (22.6 KB)
**Help**: `"Puebla explicacion + repercusiones de las 12 preguntas seed."`  
**Args**: `--dry-run`.

Constante `DIMENSIONES = ("economico", "social", "cultural", "ambiental", "institucional")`.

Dict grande `DATA[orden]` con `"explicacion"` (texto largo educativo/neutro) y `"repercusiones"` (dict con 5 dimensiones cada una en texto largo). Cubre 12 preguntas indexadas por `orden`.

**Flujo**: por cada `orden` → `Pregunta.objects.filter(orden=orden)` (puede haber varias en distintos tipos). Valida que las 5 dimensiones estén presentes; si no, error y skip. Setea `p.explicacion` y `p.repercusiones` con `save(update_fields=[...])`. Con `--dry-run` no guarda. Reporta counts + preguntas no encontradas.

---
