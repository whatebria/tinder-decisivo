# 03 - API Endpoints

> **Para quien**: devs frontend o de integraciones que consumen el API.
> **Para que sirve**: catalogo completo de endpoints con metodo, permisos, payload y respuesta.

---

## Base URL

Todos los endpoints viven bajo `/api/v1/`.

Ejemplo local: `http://127.0.0.1:8010/api/v1/candidatos/`.

## Autenticacion

- **Auth default**: Token Auth de DRF. Header: `Authorization: Token <token>`.
- **Obtener el token**: `POST /api/v1/login/` con credenciales.
- **Endpoints publicos** (sin auth): explicitamente `AllowAny`. Listados abajo.

Documentacion interactiva del API disponible en:
- Swagger UI: `/api/v1/docs/`
- ReDoc: `/api/v1/redoc/`
- OpenAPI JSON: `/api/v1/schema/`

---

## Health

### `GET /api/health/`
**No versionado**. Publico. Devuelve `{"status": "ok"}`. Uso: monitoreo/uptime.

---

## Auth

### `POST /api/v1/register/`
**Publico**. Registra un usuario nuevo.

Body:
```json
{
  "username": "juan",
  "password": "clave_segura",
  "email": "juan@example.cl"
}
```

Response 201:
```json
{"id": 42, "username": "juan", "email": "juan@example.cl", "token": "abc123..."}
```

### `POST /api/v1/login/`
**Publico**. Devuelve token para el usuario existente.

Body: `{"username": "...", "password": "..."}`
Response 200: `{"token": "abc123..."}`

### `POST /api/v1/password-reset/request/`
**Publico**. Dispara envio de email con link de reset (si el user existe). Siempre responde 200 (para no filtrar existencia de emails).

Body: `{"email": "juan@example.cl"}`
Response 200: `{"detail": "Si el email existe, se envio un enlace de recuperacion."}`

### `POST /api/v1/password-reset/confirm/`
**Publico**. Confirma reset con el token del email.

Body:
```json
{"token": "abc123...", "new_password": "clave_nueva"}
```
Response 200: `{"detail": "Password actualizado."}` (o 400 si token invalido/expirado).

---

## Perfil

### `GET /api/v1/perfil/`
**Auth**. Devuelve el perfil del user autenticado.

Response 200:
```json
{
  "id": 1,
  "username": "juan",
  "email": "juan@example.cl",
  "comuna": {"id": 102, "nombre": "Nunoa", ...}
}
```

### `POST /api/v1/perfil/cambiar-password/`
**Auth**. Cambia el password del user autenticado.

Body: `{"password_actual": "...", "password_nuevo": "..."}`

### `PATCH /api/v1/perfil/comuna/`
**Auth**. Actualiza (o limpia) la comuna del user.

Body: `{"comuna_id": 102}` o `{"comuna_id": null}`.
Response 200: la comuna actualizada (o `null` si se limpio).

---

## Territorio

Endpoints publicos para autocomplete/browse.

### `GET /api/v1/regiones/`
Lista las 16 regiones. **Publico**. Sin paginacion.

### `GET /api/v1/comunas/`
Lista las 346 comunas. **Publico**. Sin paginacion.

Query params:
- `?region=<id>` - filtra por region
- `?q=<texto>` - busqueda `nombre__icontains`

### `GET /api/v1/unidades-territoriales/`
Lista polimorfica de unidades territoriales. **Publico**. Sin paginacion.

Query params:
- `?nivel=comunal|distrital|regional|nacional`
- `?padre=<id>` - hijos directos de esa unidad
- `?q=<texto>` - busqueda por nombre

Response 200 (array):
```json
[
  {
    "id": 100,
    "codigo": "COM-13120",
    "nombre": "Nunoa",
    "nivel": "comunal",
    "padre": 45,
    "padre_nombre": "RM Zona Centro",
    "padre_nivel": "distrital",
    "metadata": {"codigo_ine": "13120"}
  }
]
```

---

## Ejes tematicos

### `GET /api/v1/ejes/`
Lista de ejes tematicos. **Publico**. Sin paginacion.

Query params:
- `?incluir_inactivos=true` - incluye ejes con `activo=false` (util para admin)

Response 200 (array):
```json
[
  {
    "id": 1,
    "codigo": "ECONOMIA",
    "nombre": "Economia",
    "color": "#FFC220",
    "icono": "trending-up",
    "orden": 1,
    "activo": true,
    "descripcion": "Politicas economicas y fiscales."
  }
]
```

---

## Catalogo electoral

### `GET /api/v1/tipos-eleccion/`
Lista los tipos de eleccion (Presi 2025, Dip 2025, Alc 2024, base, etc.). **Publico**.

### `GET /api/v1/candidatos/`
Lista de candidatos filtrable. **Auth**.

Query params:
- `?tipo_eleccion=<id>` - filtra por tipo
- `?comuna=<id>` - filtra por comuna del user (retrocompat)
- `?unidad_territorial=<id>` - filtra por UT (nuevo)
- `?q=<texto>` - busqueda por nombre/apellido/partido

Response paginada.

### `GET /api/v1/candidatos/{id}/`
Detalle de un candidato. **Auth**. Incluye datos territoriales y contadores basicos.

### `GET /api/v1/candidatos/{id}/posturas/`
Devuelve todas las posturas del candidato con la pregunta, opcion elegida y justificacion. **Auth**.

### `GET /api/v1/candidatos/{id}/noticias/`
Noticias asociadas al candidato. **Auth**. Paginado.

### `GET /api/v1/candidatos/{id}/match-detalle/`
Devuelve el breakdown pregunta-a-pregunta del match del user autenticado vs este candidato. **Auth**.

Response 200:
```json
{
  "candidato_id": 42,
  "candidato_nombre": "Ana Perez",
  "match_percentage": 78.5,
  "num_preguntas_consideradas": 15,
  "confianza": "alta",
  "items": [
    {
      "pregunta_id": 3,
      "pregunta_texto": "...",
      "eje_tematico": "ECONOMIA",
      "user_valor": 5, "user_texto": "Muy de acuerdo", "user_peso": 3,
      "candidato_valor": 5, "candidato_texto": "Muy de acuerdo",
      "diff": 0, "score": 1.0, "contribucion": 2.0, "coincide": true
    }
  ]
}
```

---

## Cuestionario

### `GET /api/v1/preguntas/`
Devuelve las preguntas **que el user aun no respondio** (o todas si es guest). **Auth opcional**.

Query params:
- `?tipo_eleccion=<id>` (default: incluye tipos base + el seleccionado)

Response: lista de preguntas con `opciones_respuesta` embed y `eje` (con color).

### `POST /api/v1/respuestas/`
Envia respuestas del usuario (batch). **Auth**.

Body:
```json
{
  "respuestas": [
    {"pregunta_id": 3, "opcion_id": 15, "peso": 2},
    {"pregunta_id": 4, "opcion_id": 22, "peso": 3}
  ]
}
```

### `POST /api/v1/respuestas/reiniciar/`
Borra todas las respuestas del user (para volver a hacer el cuestionario). **Auth**.

### `GET /api/v1/respuestas/mias/`
Lista las respuestas del user autenticado. **Auth**.

### `PATCH /api/v1/respuestas/mias/{id}/`
Edita una respuesta existente (cambiar opcion elegida o peso). **Auth**.

Body: `{"opcion_id": 22, "peso": 3}`

---

## Match

### `POST /api/v1/match-candidatos/`
Calcula (y persiste) el match del user autenticado contra todos los candidatos del tipo de eleccion. **Auth**.

Body: `{"tipo_eleccion_id": 5}`

Response 200:
```json
[
  {
    "candidato_id": 42,
    "candidato_nombre": "Ana Perez",
    "match_percentage_value": "78.50",
    "num_preguntas_consideradas": 15,
    "breakdown_por_eje": {"ECONOMIA": {"porcentaje": 82.5, "preguntas": 5}},
    "confianza": "alta"
  }
]
```

Nota: aplica **filtro territorial** automatico usando `user.profile.comuna` (via
`UnidadTerritorial` jerarquica). Ver `04-algoritmo-matching.md`.

### `POST /api/v1/match-anonimo/`
Variante para guest users. **Publico**. No persiste nada.

Body:
```json
{
  "tipo_eleccion_id": 5,
  "respuestas": [
    {"pregunta_id": 3, "opcion_id": 15, "peso": 2}
  ],
  "comuna_id": 102
}
```

Response igual que `match-candidatos/` pero como lista in-memory.

---

## Noticias

### `GET /api/v1/noticias/`
Feed de noticias. **Auth**. Paginado.

Query params:
- `?candidato=<id>` - solo noticias que mencionan ese candidato
- `?fuente=<texto>`
- `?q=<texto>` - busqueda titulo/descripcion

### `POST /api/v1/noticias/`
Crea una noticia manualmente. **Auth staff** (permission check en la view).

### `GET /api/v1/noticias/{id}/`
Detalle de una noticia. **Auth**.

---

## Bookmarking (router)

Los siguientes endpoints estan bajo un DRF `DefaultRouter`, expuestos como
ViewSets con las 5 acciones estandar (list, create, retrieve, update, destroy).

### `/api/v1/candidatos-favoritos/`
CRUD de favoritos del user. Auto-scoped al user autenticado.

### `/api/v1/descartados/`
CRUD de candidatos descartados por el user.

### `/api/v1/decision-final/`
CRUD de la decision final por tipo de eleccion.

### `/api/v1/noticias-guardadas/`
CRUD de noticias marcadas por el user.

### `/api/v1/posturas-guardadas/`
CRUD de posturas guardadas como cita por el user.

Todos aceptan `POST { "candidato_id": 42 }` (o `noticia_id`, `postura_id`,
`candidato_elegido_id + tipo_eleccion_id` segun corresponda) y devuelven
la entidad creada.

Unique constraints garantizan idempotencia: un mismo user no puede favoritear
al mismo candidato dos veces.

---

## Formato de errores

Errores estandar DRF:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

O validation errors por campo:

```json
{
  "password": ["Este campo no puede estar vacio."],
  "email": ["Ingresa una direccion valida."]
}
```

Codigos:
- `400` - payload invalido
- `401` - falta token o invalido
- `403` - autenticado pero sin permiso
- `404` - recurso no existe
- `429` - rate limit (por ahora no implementado)
- `500` - error del server

---

## Convenciones

- **Snake case en JSON**: `tipo_eleccion_id`, `match_percentage_value`.
- **Fechas**: ISO 8601 en UTC (ej. `2026-07-25T20:36:40Z`).
- **Paginacion**: DRF default cuando aplica (list). `count`, `next`, `previous`, `results`.
- **IDs**: siempre `IntegerField` autoincrement.
- **`id` vs `pk`**: los URLs usan `pk` en `<int:pk>`, los payloads usan `id` o `<field>_id`.

---

## Siguiente lectura

- `04-algoritmo-matching.md` - deep dive del calculo del match.
- `05-servicios.md` - la capa de negocio detras de las views.
- `09-auth-y-perfil.md` - detalles de auth, registro, password reset.
