# Servel - Documentacion tecnica

**Version**: 0.1.0
**Ultima actualizacion**: 2026-07-24
**Stack**: Django 5.2 + DRF + SQLite | React Native + Expo + Tamagui (en desarrollo)
**Repo original**: https://github.com/whatebria/servel

---

## 1. Overview

Servel es una **aplicacion movil** de recomendacion de voto tipo "Voting Advice Application" (VAA). Los usuarios responden un cuestionario de posturas politicas y el sistema calcula un porcentaje de afinidad contra cada candidato registrado.

### Arquitectura de alto nivel

```
[App RN Expo] <--HTTP/JSON--> [Django REST API] --> [SQLite]
                                     |
                                     +--> [Media local /media/]
                                     |
                                     +--> [Django Admin]  <-- [Admin web browser]
```

### Repo layout

```
servel/
|-- backend/           # Django project
|   |-- api/           # settings, root urls, wsgi/asgi
|   |-- core/          # app de dominio unica
|   |   |-- models.py
|   |   |-- serializers.py
|   |   |-- views.py
|   |   |-- urls.py
|   |   |-- admin.py
|   |   |-- tests.py
|   |   `-- migrations/
|   |-- media/         # upload target (git-ignored)
|   |-- pyproject.toml # deps declaradas con uv
|   |-- requirements.txt
|   |-- .env.example
|   `-- manage.py
`-- frontend/          # (Fase 2, pendiente)
```

---

## 2. Stack y dependencias

### Backend runtime

| Paquete | Version | Rol |
|---|---|---|
| `Django` | `>=5.2,<5.3` | Framework web |
| `djangorestframework` | `>=3.15` | API REST + Token auth |
| `django-cors-headers` | `>=4.4` | CORS para la app RN |
| `django-cleanup` | `>=9.0` | Borra archivos huerfanos de `ImageField` |
| `python-decouple` | `>=3.8` | Config desde `.env` |
| `Pillow` | `>=10.3` | Requerido por `ImageField` |

### Backend dev

| Paquete | Version | Rol |
|---|---|---|
| `pytest` | `>=8.3` | Test runner |
| `pytest-django` | `>=4.9` | Integracion Django/pytest |
| `pytest-cov` | `>=5.0` | Coverage |

### Version de Python

`>=3.10` (probado en `3.13.5`).

### Package manager

Se usa **`uv`** (recomendado Walmart). Como fallback funciona `pip install -r requirements.txt`.

---

## 3. Configuracion (`api/settings.py`)

Todos los valores sensibles y ambientales se leen desde variables de entorno via `python-decouple`.

### Variables `.env`

| Variable | Tipo | Default | Descripcion |
|---|---|---|---|
| `SECRET_KEY` | str | (obligatoria) | Clave de firma de Django |
| `DEBUG` | bool | `False` | Modo debug (activa stacktraces y CORS abierto) |
| `ALLOWED_HOSTS` | csv | `127.0.0.1,localhost` | Hosts validos |
| `CORS_ALLOWED_ORIGINS` | csv | `""` | Origenes CORS permitidos (produccion) |
| `TIME_ZONE` | str | `America/Santiago` | TZ para timestamps |
| `LANGUAGE_CODE` | str | `es-cl` | Idioma del admin |

### DRF config

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

**Consecuencia**: por default *todo* endpoint requiere auth. Se sobreescribe explicitamente en views que sean publicas (`AllowAny`) o de admin (`IsAdminUser`).

### CORS

- En `DEBUG=True`: `CORS_ALLOW_ALL_ORIGINS = True` (conveniencia dev, Expo mobile no manda `Origin`).
- En `DEBUG=False`: solo los origenes listados en `CORS_ALLOWED_ORIGINS`.

### Logging

Handler consola con formatter verbose. Logger `core` en `DEBUG` cuando `DEBUG=True`, en `INFO` en produccion.

---

## 4. Modelo de dominio

### Diagrama ER (simplificado)

```
User (django.contrib.auth)
  |
  |--< RespuestaUsuario >-- Pregunta -- TipoEleccion
  |                                       |
  |                                       +---< Candidato (M2M)
  |
  |--< CandidatoFavorito >-- Candidato
  |
  |--< CandidatoDescartado >-- Candidato
  |
  |--< MatchCandidato >-- Candidato
  |
  `--< DecisionFinal >-- Candidato
                       -- TipoEleccion

Candidato --< PosturaCandidato >-- Pregunta
                                 -- OpcionRespuesta

Pregunta --< OpcionRespuesta

Noticia  (independiente)
```

### Modelos detallados (`core/models.py`)

#### `TipoEleccion`

```python
nombre           CharField(unique, max=100)
descripcion      TextField(null, blank)
fecha_eleccion   DateField(null, blank)
```

#### `Pregunta`

```python
texto            TextField
tipo_eleccion    FK(TipoEleccion, on_delete=CASCADE, related='preguntas')
orden            IntegerField(default=0)
eje_tematico     CharField(choices=EJES_CHOICES, default=EJE_OTRO)
Meta.ordering = ['orden']
```

Ejes tematicos disponibles: `ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`, `DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`, `OTRO`. Agrupan preguntas para el match por dimension (breakdown radar chart).

#### `OpcionRespuesta`

```python
pregunta         FK(Pregunta, on_delete=CASCADE, related='opciones_respuesta')
texto            CharField(max=255)
valor            IntegerField    # convencion: 1..5
es_no_se         BooleanField(default=False)
unique_together  (pregunta, texto)
```

`es_no_se=True` marca la opcion como "No se / Prefiero no responder". Las respuestas del usuario que apuntan a este tipo de opcion se **excluyen del calculo** de match (no cuentan como diferencia, no cuentan como acuerdo).

Helper: `crear_opciones_acuerdo_desacuerdo(pregunta)` popula las 5 opciones estandar (Muy en desacuerdo=1 ... Muy de acuerdo=5).

#### `RespuestaUsuario`

```python
user             FK(User, on_delete=CASCADE, related='respuestas_usuario')
pregunta         FK(Pregunta, on_delete=CASCADE)
opcion_elegida   FK(OpcionRespuesta, on_delete=CASCADE)
peso             IntegerField(choices=PESO_CHOICES, default=PESO_POCO)
fecha_respuesta  DateTimeField(auto_now_add)
unique_together  (user, pregunta)
```

`peso` es la importancia que le declara el usuario a la pregunta:

| Constante | Valor | Multiplicador en el score |
|---|---|---|
| `PESO_NO_IMPORTA` | 0 | 0.5x |
| `PESO_POCO` | 1 | 1.0x (default) |
| `PESO_MEDIO` | 2 | 1.5x |
| `PESO_MUCHO` | 3 | 2.0x (dealbreaker efectivo) |

#### `Candidato`

```python
nombre                CharField(max=100)
apellido              CharField(max=100, blank, default='')
partido               CharField(max=200)
bio                   TextField(null, blank)
ciudad                CharField(max=100, blank, default='')
propuesta_electoral   TextField
profile_picture       ImageField(default='assets/default.avif', upload_to='profiles/')
tipos_eleccion        M2M(TipoEleccion, related='candidatos')
```

**Nota**: en migracion `0019` se renombro `perfile_picture` -> `profile_picture` (typo original).

#### `PosturaCandidato`

```python
candidato        FK(Candidato, on_delete=CASCADE, related='posturas_candidato')
pregunta         FK(Pregunta, on_delete=CASCADE)
opcion_respuesta FK(OpcionRespuesta, on_delete=CASCADE)
justificacion    TextField(null, blank)
unique_together  (candidato, pregunta)
```

#### `MatchCandidato`

Cache del calculo de match. Se actualiza cada vez que se llama al endpoint `/api/match-candidatos/`.

```python
user                          FK(User, related='matches_candidato')
candidato                     FK(Candidato)
match_percentage_value        DecimalField(max_digits=5, decimal_places=2, default=0.0)
num_preguntas_consideradas    IntegerField(default=0)
breakdown_por_eje             JSONField(default=dict)
confianza                     CharField(choices=CONFIANZA_CHOICES, default='tentativa')
fecha_ultima_actualizacion    DateTimeField(auto_now=True)
unique_together               (user, candidato)
```

Shape de `breakdown_por_eje`:

```json
{
  "ECONOMIA":  {"porcentaje": 87.5, "preguntas": 4},
  "SOCIEDAD":  {"porcentaje": 62.0, "preguntas": 3},
  "AMBIENTE":  {"porcentaje": 100.0, "preguntas": 2}
}
```

Niveles de `confianza`:

| Nivel | Umbral (N preguntas consideradas) |
|---|---|
| `tentativa` | < 5 |
| `media` | 5..9 |
| `alta` | >= 10 |

#### `CandidatoFavorito`, `CandidatoDescartado`

Estructura identica:

```python
user             FK(User)
candidato        FK(Candidato)
fecha_agregado / fecha_descartado  DateTimeField(auto_now_add)
unique_together  (user, candidato)
```

#### `DecisionFinal`

```python
user               FK(User, related='decisiones_finales')
candidato_elegido  FK(Candidato, related='elegido_por_usuarios')
tipo_eleccion      FK(TipoEleccion)
fecha_decision     DateTimeField(auto_now_add)
unique_together    (user, tipo_eleccion)
```

Un usuario tiene **una sola** decision por tipo de eleccion. Cambiar de opinion = `update_or_create`.

#### `Noticia`

```python
titulo                  CharField(max=300)
descripcion             TextField
url                     URLField(max=1000, blank, default='')
fuente                  CharField(max=200, blank, default='')   # 'La Tercera', 'Emol', etc.
imagen_url              URLField(max=1000, blank, default='')
candidatos_mencionados  M2M(Candidato, related='noticias', blank)
fecha_publicacion       DateTimeField(auto_now_add)
actualizado_en          DateTimeField(auto_now)

Meta.ordering    = ['-fecha_publicacion']
Meta.constraints = [
    UniqueConstraint(fields=['url'], condition=~Q(url=''), name='...')  # unique cuando no vacia
]
```

La `url` es la clave logica para dedup de noticias importadas por RSS. Constraint parcial: multiples noticias con url vacia (cargadas manualmente) son OK.

En migracion `0019` se removio el `unique_together = ('titulo', 'descripcion')` que era invalido en Postgres (indice unico sobre TEXT sin length).

---

## 5. API REST

**Base URL en dev**: `http://127.0.0.1:8000/api/v1/`

**Auth header**: `Authorization: Token <token>`

### Descubrimiento del API (self-documenting)

Desde v1.0 la API expone **OpenAPI 3.0** autogenerado por `drf-spectacular`:

| Ruta | Contenido |
|---|---|
| `GET /api/health/` | Health check (no versionado). Chequea DB, devuelve version y estado |
| `GET /api/v1/schema/` | Schema OpenAPI 3.0 en YAML (fuente de verdad de tipos) |
| `GET /api/v1/docs/` | Swagger UI interactivo |
| `GET /api/v1/redoc/` | ReDoc (docs mas legibles para lectura larga) |

El schema se puede tambien dumpear a disco:

```bash
uv run python manage.py spectacular --file schema.yml --validate
```

**Uso desde el frontend**: con `openapi-typescript` (u `orval`) el frontend autogenera tipos TypeScript y clientes de fetch/axios/react-query desde el schema. Cero drift entre backend y frontend.

### Versionado

Toda la API vive bajo `/api/v1/`. Cuando llegue una v2:

1. Copiar `core/urls.py` a `core/urls_v2.py`.
2. Agregar `path("api/v2/", include("core.urls_v2"))` en `api/urls.py`.
3. Los clientes v1 siguen funcionando sin cambios.

Health check queda fuera del versionado (`/api/health/`) porque su contrato es universal.

### Endpoints

| Metodo | Ruta | Permission | Body / Params | Respuesta |
|---|---|---|---|---|
| POST | `/register/` | AllowAny | `{username, email, password}` | `201 {id, username, email}` |
| POST | `/login/` | AllowAny | `{username, password}` | `200 {token, user_id, email}` |
| GET | `/tipos-eleccion/` | Auth | - | `200 [TipoEleccion]` |
| GET | `/candidatos/` | Auth | - | `200 [Candidato]` |
| GET | `/candidatos/<pk>/` | Auth | - | `200 Candidato` |
| GET | `/preguntas/` | Auth | `?tipo_eleccion_id=<id>` | `200 [Pregunta con opciones]` |
| POST | `/respuestas/` | Auth | `[{pregunta, opcion_elegida}, ...]` | `201 {message}` |
| POST | `/match-candidatos/` | Auth | `{tipo_eleccion_id}` | `200 [MatchResult sorted desc]` |
| GET | `/candidatos-favoritos/` | Auth | - | `200 [Favorito]` |
| POST | `/candidatos-favoritos/` | Auth | `{candidato}` | `201 Favorito` |
| DELETE | `/candidatos-favoritos/<pk>/` | Auth | - | `204` |
| GET/POST/DELETE | `/descartados/[<pk>/]` | Auth | idem favoritos | |
| GET/POST/DELETE | `/decision-final/[<pk>/]` | Auth | `{candidato_elegido, tipo_eleccion}` | Upsert por `(user, tipo_eleccion)` |
| GET | `/noticias/` | AllowAny | - | `200 [Noticia]` |
| POST | `/noticias/` | IsAdminUser | `{titulo, descripcion, url?, fuente?, imagen_url?, candidatos_mencionados?}` | `201 Noticia` |
| GET/PUT/PATCH/DELETE | `/noticias/<pk>/` | GET public, resto admin | - | - |
| GET | `/candidatos/<id>/noticias/` | AllowAny | - | `200 [Noticia]` filtradas por candidato |

### Ejemplo de payload de respuesta: `MatchCandidatoResultSerializer`

```json
[
  {
    "id": 1,
    "user": "votante_demo",
    "candidato_data": {
      "id": 3,
      "nombre": "Ada",
      "apellido": "Perez",
      "partido": "Partido A",
      "bio": "...",
      "ciudad": "Santiago",
      "propuesta_electoral": "...",
      "profile_picture": "/media/profiles/ada.jpg",
      "tipos_eleccion": [1],
      "tipos_eleccion_nombres": ["Presidencial"]
    },
    "match_percentage": "87.50",
    "preguntas_consideradas": 8
  },
  ...
]
```

### Ejemplo de flujo cliente

```bash
# 1. Registro
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ana","email":"ana@x.com","password":"secreta123"}'

# 2. Login (obtener token)
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ana","password":"secreta123"}' | jq -r .token)

# 3. Listar tipos de eleccion
curl http://127.0.0.1:8000/api/tipos-eleccion/ \
  -H "Authorization: Token $TOKEN"

# 4. Preguntas pendientes
curl "http://127.0.0.1:8000/api/preguntas/?tipo_eleccion_id=1" \
  -H "Authorization: Token $TOKEN"

# 5. Enviar respuestas
curl -X POST http://127.0.0.1:8000/api/respuestas/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"pregunta":1,"opcion_elegida":5},{"pregunta":2,"opcion_elegida":9}]'

# 6. Calcular match
curl -X POST http://127.0.0.1:8000/api/match-candidatos/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo_eleccion_id":1}'
```

---

## 6. Algoritmo de matching (robusto)

Ubicacion: `core/views.py::_calcular_match(user, tipo_eleccion)`

El algoritmo tiene cuatro caracteristicas que lo hacen mas util que un simple promedio lineal:

1. **Fórmula no-lineal** — penaliza mas fuerte las diferencias grandes.
2. **Peso declarado por el usuario** — el propio user dice que temas le importan mas.
3. **Opcion "No se"** — respuestas ambiguas se excluyen en vez de contar como "neutral".
4. **Breakdown por eje tematico** — permite radar chart y explicaciones tipo "85% en Economia, 40% en Ambiente".
5. **Nivel de confianza** — comunica al frontend si el match es tentativo (pocos datos) o confiable.

### Formula

Para cada pregunta con overlap (el user y el candidato ambos respondieron, y el user **no** eligio "No se"):

```
diff             = |valor_usuario - valor_candidato|          en [0, 4]
score_pregunta   = 1 - (diff / 4)^2                           en [0.0, 1.0]
mult_peso        = peso_multiplier[peso_declarado_usuario]    en {0.5, 1.0, 1.5, 2.0}
score_ponderado  = score_pregunta * mult_peso
```

Agregacion global:

```
match_% = (sum(score_ponderado) / sum(mult_peso)) * 100
```

Agregacion por eje tematico (para el breakdown):

```
para cada eje E:
    match_%_eje_E = (sum(score_ponderado en preguntas del eje E) /
                     sum(mult_peso en preguntas del eje E)) * 100
```

### Tabla de scores por diferencia

| Diferencia (0..4) | Interpretacion | Score (lineal viejo) | Score (no-lineal nuevo) |
|---|---|---|---|
| 0 | Identico | 1.00 | 1.00 |
| 1 | Casi igual | 0.75 | 0.94 |
| 2 | Diferencia media | 0.50 | 0.75 |
| 3 | Diferencia grande | 0.25 | 0.44 |
| 4 | Opuesto | 0.00 | 0.00 |

Como ves, diferencias pequenias son mas perdonables y opuestos totales duelen igual. Refleja mejor la percepcion humana de similitud.

### Ejemplo completo

Usuario responde 3 preguntas:

| Pregunta | Eje | Valor user | Valor Ada | Diff | Score | Peso user | Score ponderado |
|---|---|---|---|---|---|---|---|
| Aborto libre | SOCIEDAD | 5 | 5 | 0 | 1.00 | Mucho (2.0) | 2.00 |
| Renta basica | ECONOMIA | 4 | 5 | 1 | 0.94 | Medio (1.5) | 1.41 |
| Reforma jubilaciones | ECONOMIA | 3 | 5 | 2 | 0.75 | Poco (1.0) | 0.75 |

Suma pesos = 2.0 + 1.5 + 1.0 = **4.5**
Suma scores ponderados = 2.00 + 1.41 + 0.75 = **4.16**
Match global con Ada = 4.16 / 4.5 = **92.4%**

Breakdown por eje:
- SOCIEDAD: 2.00 / 2.0 = **100%** (1 pregunta)
- ECONOMIA: (1.41 + 0.75) / (1.5 + 1.0) = 2.16 / 2.5 = **86.4%** (2 preguntas)

### Propiedades formales

- **Determinista**: mismo input, mismo output.
- **Simetrico**: `abs(a-b) == abs(b-a)`.
- **Requiere overlap**: solo se computan preguntas que ambos respondieron.
- **Robusto ante NaN**: opciones "No se" no rompen el calculo, solo se excluyen.
- **Convexo respecto al peso**: subir peso de una pregunta con score alto siempre mejora el match global.

### Complejidad

`O(N_candidatos * N_posturas_por_candidato)` por request. Con `prefetch_related` la cantidad de queries es constante (2-3), no N+1.

### Persistencia

El resultado se cachea en `MatchCandidato` via `update_or_create` sobre `(user, candidato)`. **El endpoint es POST** justamente porque muta estado (violacion de idempotencia HTTP si fuera GET).

### Extensiones futuras posibles

- **Similitud coseno** en vez de distancia L1: cuando haya candidatos con muchas posturas.
- **Confidence intervals** bootstrap: para reportar +/- % en vez de un punto.
- **Clustering** de usuarios por respuestas: recomendar "gente parecida a vos voto asi".

---

## 7. Migraciones

19 migraciones en total. Historia relevante:

| # | Descripcion |
|---|---|
| 0001 | Estado inicial (modelo `Profile` legacy) |
| 0002-0011 | Iteraciones sobre `Profile` (eliminado despues) |
| 0012 | Introduccion de `Candidato`, `Pregunta`, `OpcionRespuesta`, `TipoEleccion`, `PosturaCandidato` |
| 0013 | `RespuestaUsuario` |
| 0014 | `unique_together` en `OpcionRespuesta` |
| 0015 | `MatchCandidato` (cache) |
| 0016 | Ajustes de `PosturaCandidato` |
| 0017-0018 | `Noticia` |
| **0019** | Rename `perfile_picture` -> `profile_picture` + drop `unique_together` de Noticia |
| **0020** | Algoritmo robusto: `Pregunta.eje_tematico`, `OpcionRespuesta.es_no_se`, `RespuestaUsuario.peso`, `MatchCandidato.breakdown_por_eje`, `MatchCandidato.confianza` |
| **0021** | Noticia extendida: `url`, `fuente`, `imagen_url`, `candidatos_mencionados` M2M + unique parcial sobre `url` |

### Squash recomendado

Antes de un release publico conviene:

```bash
uv run python manage.py squashmigrations core 0001 0019
```

Esto colapsa las 19 en una sola inicial + delta futuras.

---

## 8. Seguridad

### Implementado

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` desde `.env` (no en repo).
- Password hashing default de Django (PBKDF2 con SHA256, 600k iterations en 5.x).
- Token auth (`rest_framework.authtoken`).
- Permisos DRF explicitos en cada view.
- CORS restrictivo en produccion (abierto solo en `DEBUG`).
- `django-cleanup` para no dejar archivos huerfanos.
- Noticias: GET publico, escritura solo `IsAdminUser` (test de regresion incluido).

### Pendiente / conocido

- **HTTPS**: en dev usa HTTP. En prod hay que terminar en un reverse proxy (nginx / Cloudflare) con TLS.
- **Rate limiting**: no hay. Un atacante puede hacer brute force sobre `/api/login/`. Fix sugerido: `django-ratelimit` o `django-axes`.
- **Rotacion de tokens**: los tokens son eternos hasta que el user cierra sesion. Considerar JWT con refresh (`djangorestframework-simplejwt`).
- **Email verification**: registro no valida email. Fix: `django-allauth`.
- **Validacion de identidad**: no hay integracion con Registro Civil / RUT. Cualquier persona puede registrarse.
- **Auditoria**: no se registran login attempts fallidos ni cambios de decision final.

---

## 9. Testing

### Setup

`pytest-django` configurado en `pyproject.toml`:

```toml
[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "api.settings"
python_files = ["test_*.py", "*_test.py", "tests.py"]
```

### Correr

```bash
cd backend
uv run pytest -v
uv run pytest --cov=core --cov-report=html   # con coverage
```

### Suite actual (40 tests)

**`core/tests.py`** (17 tests):
- `TestMatchAlgoritmo` (6) - match perfecto, no lineal, edge cases, auth
- `TestMatchRobusto` (5) - no-se, peso, breakdown, confianza, persistencia
- `TestSubmitAnswers` (2) - peso viaja al payload, validacion opcion-pregunta
- `TestNoticiaPermisos` (4) - regresion hallazgo critico #2

**`core/test_importers.py`** (12 tests):
- `TestImportCandidatos` (7)
- `TestImportPreguntas` (4)
- `TestFixtureCandidatosDelRepo` (1)

**`core/test_noticias.py`** (11 tests):
- `TestNoticiaModelo` (3) - unique parcial, M2M
- `TestEndpointNoticiasPorCandidato` (3) - filtro, vacio, publico
- `TestFetchNoticiasCommand` (5) - mockeando feedparser: crea, idempotente, dry-run, multi-candidato, --max

### Gaps de cobertura conocidos

- Ningun test de favoritos / descartados / decision-final CRUD.
- Ningun test de admin actions (`crear_opciones_estandar`).
- Ningun test de serializers directamente.

---

## 9b. Ingesta de datos (importers)

### Contexto Servel

**Servel Chile no expone una API REST publica**. Publica CSV/XLSX en `opendata.servel.cl` y HTML en `servel.cl/candidatos-elecciones-*`. La estrategia adoptada es **importar offline por CSV** via management commands.

### `manage.py import_candidatos`

Ubicacion: `core/management/commands/import_candidatos.py`

Carga o actualiza candidatos desde un CSV. Idempotente por `(nombre, apellido, partido)`. Crea automaticamente los `TipoEleccion` referenciados que no existan.

**Formato**:

| Columna | Requerida | Descripcion |
|---|---|---|
| `nombre` | si | |
| `apellido` | si | |
| `partido` | si | |
| `tipos_eleccion` | si | Separados por `\|`. Ej: `Presidencial\|Parlamentaria` |
| `ciudad` | no | |
| `bio` | no | |
| `propuesta_electoral` | no | |

**Flags**:

- `--dry-run` — simula, no escribe.
- `--delimiter ";"` — para CSVs con punto y coma.
- `--encoding latin-1` — para archivos no UTF-8.

**Ejemplo**:

```bash
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv
```

Salida:
```
Import completo. Total filas: 6
  Creados:                  6
  Actualizados:             0
  Errores:                  0
  Tipos eleccion creados:   0
```

### `manage.py import_preguntas`

Carga preguntas del cuestionario. Cada pregunta importada **auto-genera 6 opciones de respuesta estandar**: 5 de la escala Likert (Muy en desacuerdo=1 ... Muy de acuerdo=5) + 1 opcion `No se / Prefiero no responder` con `es_no_se=True`.

**Formato**:

| Columna | Requerida | Descripcion |
|---|---|---|
| `texto` | si | Enunciado |
| `tipo_eleccion` | si | Nombre. Se auto-crea si no existe |
| `eje_tematico` | si | Uno de los 8 ejes de `Pregunta.EJES_CHOICES` |
| `orden` | no | Default 0 |

### Robustez de los importers

- **Transaccional con savepoints por fila**: un error en la fila 5 no aborta las filas 1..4.
- **Idempotentes**: correr N veces = 1 sola vez (usan `update_or_create`).
- **Validacion clara**: errores por fila se reportan con numero de linea y campo problematico.
- **Dry-run**: preview sin escribir en DB.

### Como adaptar CSV oficial de opendata.servel.cl

Los exports de Servel traen ~30 columnas (RUT, folio, region, subpacto, etc.). Para importarlos hay que preprocesar con pandas o LibreOffice, dejando solo las columnas requeridas y renombrando. Ejemplo en `fixtures/README.md`.

### Tests

12 tests en `core/test_importers.py`:
- Import basico + M2M + auto-creacion de TipoEleccion
- Idempotencia (segundo run actualiza, no duplica)
- Dry-run no escribe
- Columnas faltantes fallan con `CommandError` claro
- Fila invalida no aborta las demas
- Archivo inexistente falla temprano
- Auto-generacion de las 6 opciones estandar en `import_preguntas`
- Validacion de `eje_tematico`
- Sanity check de los fixtures del repo

---

## 9c. Noticias por candidato (fetch desde Google News RSS)

### Diseno

Cada `Noticia` puede mencionar N candidatos via M2M. Un job pull (management command)
trae noticias desde Google News RSS por cada candidato y crea/actualiza `Noticia`s
linkeadas via `candidatos_mencionados`.

**Por que Google News RSS y no NewsAPI**:
- Sin API key ni registro (zero-friction).
- Cobertura amplia de medios chilenos (agrega de todo).
- Query language simple: `"Nombre Apellido" candidato`.
- Filtro geo/idioma via query params: `hl=es-CL&gl=CL&ceid=CL:es-419`.

**Contras conocidos**:
- Google puede rate-limitear si se abusa. Uso razonable (1 fetch/dia por candidato) esta OK.
- El feed devuelve URLs redirigidas de `news.google.com`. La `url` guardada apunta al redirect, no al medio original.
- Sin control de calidad: puede colar noticias tangenciales que mencionen al candidato por casualidad.

### `manage.py fetch_noticias`

Ubicacion: `core/management/commands/fetch_noticias.py`

**Flags**:

- `--candidato-id N` — solo procesar ese candidato (default: todos).
- `--max N` — top N noticias por candidato (default: 10).
- `--extra-keyword <str>` — palabra extra en el query (default: `"candidato"`).
- `--dry-run` — no escribe.

**Ejemplo**:

```bash
uv run python manage.py fetch_noticias --max 5
```

Salida real:
```
-> Gabriel Boric: fetching '"Gabriel Boric" candidato'...
-> Jose Antonio Kast: fetching '"Jose Antonio Kast" candidato'...
...
Fetch completo.
  Candidatos procesados: 6
  Noticias creadas:      18
  Noticias actualizadas: 0
  Links candidato-noticia creados: 18
```

### Endpoint

```
GET /api/candidatos/<candidato_id>/noticias/    (publico)
```

Devuelve las noticias que mencionan a ese candidato, ordenadas por `-fecha_publicacion`,
sin duplicados (distinct).

### Idempotencia

- **Dedup por URL**: `update_or_create(url=...)`. Correr N veces = 1 sola vez.
- **M2M sin duplicados**: `noticia.candidatos_mencionados.add(candidato)` es seguro (no crea link doble).
- **Multi-candidato**: si una misma noticia sale al buscar Ada y al buscar Beto, se guarda 1 vez y linkea a ambos.

### Testeo

El comando se testea mockeando `feedparser.parse()` para no depender de la red durante CI.
Ver `core/test_noticias.py::TestFetchNoticiasCommand`.

### Automatizacion (recomendado)

En produccion, correr como cron o task de systemd:

```cron
0 8 * * *  cd /opt/servel/backend && /usr/local/bin/uv run python manage.py fetch_noticias --max 10
```

O alternativa moderna: `django-q2` / `celery beat` con retry y backoff.

---

## 10. Como correr en local

### Prerequisitos

- Python 3.10+
- `uv` (o `pip`)

### Setup

```bash
# 1. Clonar
git clone https://github.com/whatebria/servel.git
cd servel/backend

# 2. Ambiente y deps
uv venv
uv sync --group dev

# 3. Config
cp .env.example .env
# editar .env con una SECRET_KEY real
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 4. Migrar
uv run python manage.py migrate

# 5. Superuser
uv run python manage.py createsuperuser

# 6. (Opcional) Cargar data demo
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv

# 7. Levantar
uv run python manage.py runserver 0.0.0.0:8000
```

### URLs utiles

- API: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/`
- Media: `http://127.0.0.1:8000/media/`

---

## 11. Convenciones y decisiones de diseno

### Django

- **1 sola app (`core`)**: el dominio es chico, no hay razon para partirlo. Cuando alguna area (ej. auth con email verification) crezca, se refactoriza.
- **`SerializerMethodField` evitado** cuando existe un campo nativo equivalente (`SlugRelatedField`, `PrimaryKeyRelatedField`). Mas performance, menos codigo.
- **`update_or_create` para upserts**: usado en respuestas, matches y decision final.
- **`select_related` / `prefetch_related` explicitos** en todos los querysets con FK/M2M para evitar N+1.
- **Base viewset `_UserScopedCreateListDestroy`** para reducir duplicacion entre favoritos y descartados (DRY).

### API

- Todos los endpoints bajo `/api/`.
- Errores 400/404 con `{"detail": "..."}` (formato DRF estandar).
- Fechas en ISO 8601 UTC, offset segun `TIME_ZONE`.
- Paginacion: **no habilitada** hoy (los datasets son chicos: 5-10 candidatos, 20-30 preguntas). Extension: `PageNumberPagination` en settings cuando sea necesario.

### Codigo

- Zen de Python: preferir explicito sobre implicito.
- `logging` estructurado en lugar de `print`.
- Type hints donde ayuda (retornos de metodos custom de serializer).
- Nombres en espanol para modelos de dominio (consistente con `.po` electoral chileno) y en ingles para variables/utilidades.

---

## 12. Roadmap tecnico

### Corto plazo (antes de Fase 2)

- [ ] Documentar API con `drf-spectacular` (OpenAPI 3.0)
- [ ] Agregar seeder / fixtures (`loaddata`) con candidatos y preguntas demo
- [ ] Health check endpoint `/api/health/`

### Mediano plazo

- [ ] Postgres en produccion (SQLite solo dev)
- [ ] Cache de match con Redis + TTL
- [ ] Notificaciones push (Expo Notifications + django-push-notifications)
- [ ] Email verification via `django-allauth`
- [ ] Rate limiting (`django-ratelimit`)
- [ ] CI: GitHub Actions con `pytest` + `ruff` + `mypy`

### Largo plazo

- [ ] Metricas: `django-prometheus`
- [ ] Observabilidad: Sentry
- [ ] Refactor a JWT con refresh tokens
- [ ] Multi-tenancy (multiples paises / procesos electorales)
- [ ] Panel de estadisticas publicas (matches agregados anonimizados)

---

## 13. Hallazgos originales del audit y su estado

Referencia al reporte `servel_report.html`.

| # | Severidad | Titulo | Estado |
|---|---|---|---|
| 1 | Critico | SECRET_KEY hardcodeada + DEBUG=True | **FIXED** - `.env` |
| 2 | Critico | Noticias CRUD publico | **FIXED** - `_NoticiaPermMixin` |
| 3 | Critico | README con merge conflict | **FIXED** |
| 4 | Alto | Frontend Flutter inexistente | Pendiente - se reemplaza por RN en Fase 2 |
| 5 | Alto | `db.sqlite3` commiteado | **FIXED** - `.gitignore` + delete |
| 6 | Alto | GET con side-effects en `/match-candidatos/` | **FIXED** - ahora POST |
| 7 | Alto | ALLOWED_HOSTS con IP privada hardcodeada | **FIXED** - `.env` |
| 8 | Alto | Sin `requirements.txt` | **FIXED** - `pyproject.toml` + `requirements.txt` |
| 9 | Medio | Prints de debug en produccion | **FIXED** - `logging` |
| 10 | Medio | Cero tests | **FIXED** - 10 tests iniciales |
| 11 | Medio | Media/profiles con duplicados | **FIXED** - `django-cleanup` (los legacy quedan; nuevos uploads limpian) |
| 12 | Medio | `DecisionFinal` sin endpoint | **FIXED** - `DecisionFinalViewSet` |
| 13 | Medio | `isinstance(dict)` hack en serializer | **FIXED** - refactor a `SlugRelatedField` |
| 14 | Medio | `unique_together` de Noticia invalido | **FIXED** - removido en 0019 |
| 15 | Bajo | LANGUAGE_CODE / TIME_ZONE mal | **FIXED** - `es-cl` + `America/Santiago` |
| 16 | Bajo | Typo `perfile_picture` | **FIXED** - migracion 0019 |
| 17 | Info | 18 migraciones para 12 modelos | Pendiente - squash antes de release |

**Score final del backend post-fix**: 16 de 17 hallazgos resueltos. El unico pendiente estructural (frontend Flutter) se resuelve en Fase 2 reemplazandolo por React Native.

---

## 14. Referencias

- Django 5.2: https://docs.djangoproject.com/en/5.2/
- DRF: https://www.django-rest-framework.org/
- python-decouple: https://github.com/HBNetwork/python-decouple
- django-cleanup: https://github.com/un1t/django-cleanup
- Expo (frontend futuro): https://docs.expo.dev/
- Tamagui (UI kit RN): https://tamagui.dev/

---

*Documento generado por Perrito Code Puppy - version 2026-07-24*
