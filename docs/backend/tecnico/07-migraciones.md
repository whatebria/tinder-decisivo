# 07 - Migraciones

> **Para quien**: devs que quieren entender la historia del schema o hacer una migration nueva.
> **Para que sirve**: narrativa cronologica de decisiones importantes.

Al momento de escribir esto: **36 migrations** aplicadas.

Ver las 36 archivos completos en `backend/core/migrations/`. Este doc destaca
las relevantes.

---

## Convenciones

- **`0001_initial`** — schema inicial autogenerado.
- **`0002` a `0011`** — evolucion temprana experimental (renombres, alter fields, iteracion del modelo Profile). Ver commit history si necesitas detalle.
- **`0012` en adelante** — schema estable con features versionadas.
- **Data migrations** — nombre descriptivo `NNNN_backfill_*` o `NNNN_seed_*`. Deberian tener `reverse_code` funcional cuando es posible.

---

## Hitos importantes

### `0012_candidato_opcionrespuesta_pregunta_tipoeleccion_and_more`
Introduce el modelo de dominio actual (Candidato, TipoEleccion, Pregunta,
OpcionRespuesta). Reemplaza el intento inicial (Apoyo, Cualidad, InteresPolitico).

### `0013_respuestausuario`
Modelo `RespuestaUsuario` que reemplaza el intento anterior. Constraint
`unique(user, pregunta)`.

### `0014_alter_opcionrespuesta_unique_together`
`unique(pregunta, texto)` para OpcionRespuesta.

### `0015_matchcandidato` + `0020_algoritmo_robusto`
Modelo `MatchCandidato` con:
- `match_percentage_value` (DecimalField 5,2).
- `num_preguntas_consideradas`.
- `breakdown_por_eje` (JSONField).
- `confianza` (choices).
Base del algoritmo de match actual.

### `0022_pregunta_explicacion_pregunta_repercusiones`
Agrega campos educativos a `Pregunta`:
- `explicacion` (contexto neutro).
- `repercusiones` (JSONField con dimensiones eco/social/cultural/ambiental/institucional).

### `0023_passwordresettoken`
Modelo `PasswordResetToken`. Antes el reset era 100% via signals de auth de Django.

### `0024_noticiabookmark_posturabookmark`
Bookmarking de noticias y posturas por parte del user.

### `0025_tipoeleccion_es_base`
Flag `es_base` en `TipoEleccion`. Habilita preguntas transversales.
Cambio importante en el algoritmo de matching: `_tipo_ids_con_base` incluye tipos base.

### `0026_region_distrito_comuna`
Introduce los 3 modelos territoriales concretos. Fuentes:
- Regiones: DL 575.
- Distritos: Ley 20.840 (2015) + Ley 21.073 (2018).
- Comunas: catalogo INE.

Complemento: `seed_territorio_chile` para poblar.

### `0027_candidato_comuna_candidato_distrito`
Agrega `Candidato.comuna` y `Candidato.distrito` como FKs opcionales.
Habilita filtrado territorial por candidato.

### `0028_candidato_candidato_no_comuna_y_distrito_a_la_vez`
Agrega `CheckConstraint` para prevenir setear ambos FKs a la vez.

### `0029_userprofile` + `0030_backfill_userprofile`
Modelo `UserProfile` OneToOne con `User`, con `comuna` FK.
`backfill`: crea un `UserProfile` para cada `User` existente.

### `0031_tipoeleccion_anio` + `0032_backfill_anios`
Agrega `TipoEleccion.anio`. `backfill_anios` lo popula desde el nombre
(regex "20XX") para los tipos existentes.

### `0033_eje_pregunta_eje` + `0034_seed_ejes_canonicos`
**Refactor Eje dinamico**.

`0033`: crea modelo `Eje` + agrega `Pregunta.eje` FK nullable (sin remover
`Pregunta.eje_tematico` string).

`0034`: crea los 8 ejes canonicos (ECONOMIA, SOCIEDAD, AMBIENTE, SEGURIDAD,
DDHH, INTERNACIONAL, INSTITUCIONAL, OTRO) con colores hex + backfillea
`Pregunta.eje_id` desde `eje_tematico` string.

**Motivacion**: antes agregar un eje = editar modelo + migration + deploy.
Ahora = 1 click en admin.

### `0035_unidadterritorial_candidato_unidad_territorial_and_more`
Crea modelo `UnidadTerritorial` polimorfico + agrega `Candidato.unidad_territorial`
y `UserProfile.unidad_territorial` como FKs opcionales.

### `0036_materializar_unidad_territorial`
Data migration. **Materializa UT desde Region/Distrito/Comuna existentes**:
- 1 UT nacional "Chile".
- 16 UT regionales (padre = nacional).
- 28 UT distritales (padre = region correspondiente).
- 346 UT comunales (padre = distrito correspondiente).

Backfillea `Candidato.unidad_territorial` desde `comuna`/`distrito`.
Backfillea `UserProfile.unidad_territorial` desde `comuna`.

**Motivacion refactor territorio polimorfico**: escalar a senadores por region,
CORE por provincia, etc. sin agregar FKs nuevos. Ver `04-algoritmo-matching.md#filtro-territorial-polimorfico`.

---

## Patrones usados

### Data migration idempotente

```python
def forward(apps, schema_editor):
    Model = apps.get_model("core", "Model")
    for obj in ...:
        Model.objects.update_or_create(unique_key=x, defaults=...)


def reverse(apps, schema_editor):
    Model = apps.get_model("core", "Model")
    Model.objects.filter(...).delete()
```

**Nunca usar `Model.objects` directamente** dentro de migration: usar
`apps.get_model()` para tomar el estado historico del modelo.

### CheckConstraint

Preferir sobre validation en `clean()` porque:
- Se enforce a nivel DB (no se saltea con `save(update_fields)`, bulk_create, etc.).
- Es documentacion viva.
- Cuando aplica, Django lo pone en el schema con `ALTER TABLE ... CHECK`.

### Backfill grande

Para backfills de miles de filas, usar `bulk_update` en lotes:

```python
def forward(apps, schema_editor):
    Cand = apps.get_model("core", "Candidato")
    updates = []
    for c in Cand.objects.filter(unidad_territorial__isnull=True):
        c.unidad_territorial = ...
        updates.append(c)
    if updates:
        Cand.objects.bulk_update(updates, ["unidad_territorial"])
```

---

## Como agregar una migration nueva

### Schema change (autogenerada)

```bash
# Cambias models/whatever.py
uv run python manage.py makemigrations core
# Revisa el archivo generado, editalo si hay algo custom (help_text, etc.)
uv run python manage.py migrate
```

### Data migration (manual)

```bash
uv run python manage.py makemigrations --empty --name backfill_x core
```

Editar el archivo generado, agregar `RunPython`:

```python
from django.db import migrations


def forward(apps, schema_editor):
    Model = apps.get_model("core", "Model")
    ...


def reverse(apps, schema_editor):
    ...


class Migration(migrations.Migration):
    dependencies = [("core", "0035_previa")]
    operations = [migrations.RunPython(forward, reverse)]
```

### Validar antes de commitear

```bash
uv run python manage.py migrate --plan       # muestra que se va a aplicar
uv run python manage.py migrate               # aplica
uv run python manage.py migrate core 0035     # rollback a una anterior
uv run pytest core/                            # asegurate que los tests pasan
```

---

## Estrategia deprecation

Los campos "viejos" que fueron reemplazados por otros **no se borran** de
inmediato. Se dejan como deprecated pero funcionales:

- `Pregunta.eje_tematico` (string) -> convive con `Pregunta.eje` (FK).
- `UserProfile.comuna` -> convive con `UserProfile.unidad_territorial`.

**Regla**: se remueven cuando (a) todo el codigo cliente migro al nuevo,
(b) hay 1 sprint de "quarantine" sin issues, (c) hay una migration que valida
que ninguno todavia los usa.

---

## Siguiente lectura

- `02-modelos.md` - el schema final resultante.
- `08-signals.md` - los signals que auto-mantienen invariantes cross-modelo.
- `10-tests.md` - como testear cambios de schema.
