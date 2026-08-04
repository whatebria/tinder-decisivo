# 10 - Tests

> **Para quien**: devs que quieren correr o extender la suite.
> **Para que sirve**: entender el layout, las fixtures, la estrategia.

---

## Stack

- **pytest** 8.3+ como runner.
- **pytest-django** para integracion Django (fixture `db`, `client`, etc.).
- **DRF `APIClient`** para tests de endpoints.
- **coverage** disponible pero no bloqueante.

Config en `backend/pytest.ini` (o `pyproject.toml`).

---

## Correr los tests

```bash
cd backend

# Suite completa (~7 min con 276 tests)
uv run pytest

# Un archivo
uv run pytest core/test_services_matching.py

# Un test especifico
uv run pytest core/test_services_matching.py::TestScoreCandidato::test_diff_cero_da_uno

# Por patron
uv run pytest -k "match and not anonimo"

# Fail al primer error
uv run pytest -x

# Traceback resumido
uv run pytest --tb=short

# Verbose con nombres
uv run pytest -v
```

---

## Layout

Los tests viven **al lado del codigo que testean** (test colocation):

```
backend/core/
|-- conftest.py                    # Fixtures compartidas
|-- test_algoritmo_matching.py     # Algoritmo de matching (helpers puros + calcular_match)
|-- test_bookmarks_contenido.py    # Bookmarking ViewSets (favoritos, descartados, posturas, noticias)
|-- test_candidato_detail_territorial.py  # Detalle de candidato con filtro territorial
|-- test_candidato_posturas.py     # Endpoint posturas de candidato
|-- test_candidato_territorial.py  # Filtrado territorial en listado de candidatos
|-- test_cookie_auth.py            # Auth via cookie httpOnly (TASK-003)
|-- test_editar_respuestas.py      # Service editar_respuesta
|-- test_eje_refactor.py           # Modelo Eje + endpoint + signal sync
|-- test_importers.py              # Management commands de importacion CSV
|-- test_match_anonimo.py          # Variante guest (match anonimo)
|-- test_match_detalle.py          # Endpoint breakdown pregunta-a-pregunta
|-- test_matching_territorial.py   # Filtro territorial polimorfico
|-- test_mi_progreso.py            # Endpoint GET /api/v1/mi-progreso/
|-- test_noticias.py               # Endpoints noticias (CRUD)
|-- test_noticias_feed.py          # Feed de noticias con filtros
|-- test_noticias_filtros.py       # Filtros del feed de noticias
|-- test_password_reset.py         # Flujo completo reset de password
|-- test_perfil.py                 # Perfil (cambio password/username/email, eliminar cuenta)
|-- test_perfil_territorial.py     # Actualizacion de comuna, sync con UT
|-- test_preguntas_base.py         # Tipos base + preguntas transversales
|-- test_preguntas_por_tipo.py     # Endpoint preguntas + tipos base
|-- test_presidenciales_2025.py    # Seed presidenciales: conteos y posturas
|-- test_registro.py               # Registro de usuario
|-- test_reiniciar.py              # Service reiniciar_cuestionario
|-- test_security_config.py        # Configuracion de seguridad (CORS, cookies, headers)
|-- test_seeds_ficticios.py        # Verifica conteos y idempotencia de seeds
|-- test_services_matching.py      # Helpers puros del algoritmo
|-- test_services_tipos.py         # Cache de tipos base (get_base_tipo_ids)
|-- test_territorio.py             # Modelos Region/Distrito/Comuna
`-- test_unidad_territorial.py     # Modelo UT (signals, jerarquia, endpoint)

backend/api/
`-- test_meta.py                   # Valida que el schema OpenAPI se genera OK
```

**Total: 30 archivos de test en `core/` + 1 en `api/`.**

---

## Fixtures principales

En `core/conftest.py`.

### `datos_pesados` (function-scoped)

Corre todos los seeds principales. Aisla cada test en su propia transaccion.

**Costo**: ~10 seg por test que la usa. **Beneficio**: aislamiento total.

Decision consciente: se intento `scope="session"` pero **rompio 28 tests** que
asumian DB limpia. Se descarto. Ver comentario en el codigo.

Uso:

```python
def test_algo(datos_pesados):
    # DB tiene 16 regiones + 346 comunas + 1200 candidatos + ...
    assert Region.objects.count() == 16
```

### `seed_chile` (mas ligera, escenarios manuales)

Fixture usada por `test_matching_territorial.py`. Solo corre
`seed_territorio_chile`. Los tests crean sus propios candidatos/posturas.

Uso: cuando el test necesita territorio + control fino sobre candidatos.

### Fixtures ad-hoc

Muchos test files definen sus propias fixtures locales:

```python
@pytest.fixture
def escenario_territorial(db, seed_chile):
    # crea 4 candidatos con posturas + 1 pregunta
    ...
```

Preferimos fixtures locales cuando solo aplica a un archivo (no ensuciar
`conftest.py` global).

---

## Estrategias

### Tests de services (unit)

Llamar el service **directamente**, sin `APIClient`:

```python
def test_reiniciar_borra_respuestas(user, datos_pesados):
    RespuestaUsuario.objects.create(...)
    result = reiniciar_cuestionario(user, tipo.id)
    assert result.respuestas_borradas == 1
```

Ventaja: rapido, aislado, no depende de rutas ni serializers.

### Tests de endpoints (integracion)

Usar `APIClient`:

```python
def test_endpoint_match(datos_pesados):
    client = APIClient()
    user = User.objects.create_user("u", "p")
    Token.objects.create(user=user, key="test-token")
    client.credentials(HTTP_AUTHORIZATION="Token test-token")
    resp = client.post("/api/v1/match-candidatos/", {"tipo_eleccion_id": 1})
    assert resp.status_code == 200
```

Ventaja: valida wiring end-to-end (URL -> view -> service -> serializer).

### Tests de signals

Verificar el efecto secundario:

```python
def test_crear_region_crea_ut(db):
    reg = Region.objects.create(numero_romano="XVI", codigo="16", nombre="Test", orden=99)
    ut = UnidadTerritorial.objects.get(codigo="REG-XVI")
    assert ut.padre.codigo == "NACIONAL"
```

### Tests de migrations

En general **no** testeamos migrations en aislado (usariamos
`pytest-django-migrations`). Pero **cada test que corre `datos_pesados`**
ejecuta implicitamente todas las migrations sobre una DB fresca. Suficiente
para MVP.

Si necesitas testear una data migration especifica: usar `pytest-django`
migrator fixture o escribir un test dedicado.

---

## Cobertura actual

276 tests. Distribucion aproximada:

| Area | Tests |
|---:|---:|
| Matching (algoritmo + filtro + variantes) | ~40 |
| Modelos (Candidato, Pregunta, UT, Eje) | ~30 |
| Endpoints CRUD | ~50 |
| Auth (registro, login, reset) | ~25 |
| Perfil (comuna, password) | ~15 |
| Bookmarking (5 modelos) | ~25 |
| Seeds (conteos, idempotencia) | ~20 |
| Signals | ~15 |
| Meta (OpenAPI schema) | ~5 |
| Otros (importers, comandos) | ~50 |

---

## Performance

Suite completa: **~7 minutos** con la fixture `datos_pesados` function-scoped.
Bottleneck: **seeds re-ejecutados por test**.

Optimizaciones ya aplicadas:
- Seeds usan `bulk_create` cuando el volumen es grande.
- Signals de UT tienen guard `if not created` para no re-ejecutar en updates.
- Signal `Candidato.pre_save` fue removido (ver `08-signals.md`).

Optimizaciones consideradas y descartadas:
- **`datos_pesados` scope="session"**: rompio aislamiento (28 tests).
- **`--reuse-db`**: sensible a cambios de schema, riesgoso en un proyecto activo.
- **Test parallel (`pytest-xdist`)**: complicado con SQLite (concurrent write).
  Postgres lo simplificaria; pendiente de migracion.

---

## Como agregar tests nuevos

1. **Nombre**: `test_<area>.py` en la carpeta del codigo testeado.
2. **Prefijo**: cada funcion/metodo `def test_...`. Cada clase `class Test...`.
3. **Fixtures**: reusar `db`, `datos_pesados`, `seed_chile` cuando aplica.
4. **Asserts descriptivos**: `assert x == y, "explicacion cuando falla"`.
5. **Aislamiento**: no dependas del orden de ejecucion. Usa `pytest-django` transaction
   fixture (`db`) para rollback automatico.

Ejemplo minimo:

```python
import pytest
from core.models import Region


class TestRegion:
    def test_str_incluye_numero(self, db):
        reg = Region.objects.create(
            numero_romano="XVI", codigo="16", nombre="Test", orden=99,
        )
        assert "XVI" in str(reg) or "Test" in str(reg)
```

---

## CI (por hacer)

Actualmente los tests se corren manualmente. Setup CI recomendado:

- **GitHub Actions**: workflow `pytest.yml` que corre en cada PR.
- **Postgres en CI**: para paralelizar con `pytest-xdist`.
- **Fail si coverage < 70%**: gate soft.

---

## Siguiente lectura

- `01-arquitectura.md` - como levantar el entorno para correr tests.
- `04-algoritmo-matching.md#testing` - tests especificos de matching.
- `07-migraciones.md` - como testear cambios de schema.
