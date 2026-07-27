# 06 - Management commands (seeds, importers, tasks)

> **Para quien**: devs que necesitan poblar la DB, importar datos o correr tareas periodicas.
> **Para que sirve**: catalogo con proposito, orden de ejecucion, idempotencia.

---

## Como se ejecutan

```bash
cd backend
uv run python manage.py <comando> [args]
```

O con `--help`:
```bash
uv run python manage.py seed_alcaldes_2024 --help
```

---

## Catalogo

Los archivos que empiezan con `_` (subrayado) son **modulos de data**, no
commands: `_data_candidatos_ficticios.py`, `_data_chile.py`, `_preguntas_por_tipo.py`.

### Seeds (poblar DB desde cero)

#### `seed_territorio_chile`
Carga la estructura territorial: **16 regiones, 28 distritos, 346 comunas**.

Idempotente via `update_or_create`. Los signals `post_save` en Region/Distrito/Comuna
crean automaticamente la `UnidadTerritorial` correspondiente (ver `08-signals.md`).

**Corre primero** siempre. Todo lo demas depende de esto.

#### `seed_presidenciales_2025`
Crea `TipoEleccion` "Presidencial 2025" + los **8 candidatos oficiales** con
sus posturas base ya definidas.

Fuente: hardcoded en el script (data pre-verificada).

#### `seed_diputados_2025`
Crea `TipoEleccion` "Diputados 2025" + **140 diputados ficticios** (5 por distrito x 28).

Los candidatos son sinteticos (no reales), generados con distribucion de partidos
plausible por distrito (`DISTRIBUCION_DIPUTADOS` en `_data_candidatos_ficticios.py`).

Posturas por partido (no por candidato individual): asume que todos los diputados
de un mismo partido tienen posturas identicas. Simplificacion para MVP.

Idempotente por `(nombre, apellido, distrito)`.

#### `seed_alcaldes_2024`
Crea `TipoEleccion` "Alcaldes 2024" + **1038 alcaldes ficticios** (3 por comuna x 346).

Igual que diputados: sinteticos, posturas por partido. Usa `bulk_create` para
performance (fresh seed en ~8s, idempotente en ~2s).

**Nota importante**: `bulk_create` NO dispara signals. El seed setea
`unidad_territorial` explicitamente durante el bulk (indice por codigo comuna).

Idempotente por `(nombre, apellido, comuna)`.

#### `seed_parlamentaria`
Legacy: crea data de ejemplo para una eleccion Parlamentaria 2025 (mixto senadores +
diputados). Reemplazado en gran parte por `seed_diputados_2025`. Puede quedar
como historico o ser usado para casos de test.

#### `seed_preguntas_base`
Crea el set de **preguntas base transversales** (marcadas con `es_base=True` en su
`TipoEleccion`). Estas preguntas aplican a TODAS las elecciones y se responden
una sola vez (ideologia general).

Idempotente. Reejecucion actualiza opciones si cambian.

#### `seed_preguntas_por_tipo`
Crea **preguntas especificas por tipo de eleccion** (Presi, Dip, Alc) definidas
en `_preguntas_por_tipo.py`. Ademas, **auto-genera posturas** para todos los
candidatos existentes de ese tipo (usa `bulk_create` con `ignore_conflicts`).

Corre **despues de** los seeds de candidatos + preguntas base. Muy rapido: ~2s
gracias a bulk operations.

#### `seed_explicaciones_preguntas`
Puebla los campos `explicacion` + `repercusiones` (JSON) de las preguntas seed.

Sirve para dar contexto educativo al usuario ("por que se pregunta esto",
"que impacto tiene").

### Importers (bulk import desde CSV)

#### `import_candidatos <archivo.csv>`
Importa candidatSV. Idempotente por `(nombre, apellido, partido)`.
Uso: subir candidatos reales verificados.

#### `import_preguntas <archivo.csv>`
Importa preguntas + genera automaticamente las opciones Likert estandar (5
opciones: Muy de acuerdo, De acuerdo, Neutral, En desacuerdo, Muy en desacuerdo).

#### `import_posturas <archivo.csv>`
Importa posturas de **Requiere `justificacion` y `fuente_url` no
vacias** para trazabilidad (no aceptamos posturas sin fuente).

Idempotente por `(candidato, pregunta)`.

### Tareas periodicas

#### `fetch_noticias`
Scrape noticias por candidato desde Google News RSS. Uso: cronjob diario.

Args: `--candidato-id <id>` (uno solo) o corre para todos.

Idempotente por `url` (constraint en `Noticia.url`).

---

## Orden recomendado para setup en limpio

```bash
# 1. Base territorial
uv run python manage.py seed_territorio_chile

# 2. Preguntas transversales (para que el matching funcione desde el inicio)
uv run python manage.py seed_preguntas_base

# 3. Candidatos (en orden de dependencia con TipoEleccion)
uv run python manage.py seed_presidenciales_2025
uv run python manage.py seed_diputados_2025
uv run python manage.py seed_alcaldes_2024

# 4. Preguntas por tipo + posturas de todos los candidatos
uv run python manage.py seed_preguntas_por_tipo

# 5. Metadata educativa (opcional)
uv run python manage.py seed_explicaciones_preguntas

# 6. Noticias frescas (opcional, requiere internet)
uv run python manage.py fetch_noticias
```

Tiempo total en dev: ~15-20 segundos.

---

## Idempotencia

**Todos los seeds son idempotentes**. Re-correrlos:
- No crea duplicados.
- Actualiza campos que cambiaron (ej. bio, propuesta).
- No borra data existente que ya no esta en el seed.

Reglas de idempotencia:

| Modelo | Unique key |
|---|---|
| Region | `numero_romano` |
| Distrito | `numero` |
| Comuna | `codigo` |
| Eje | `codigo` |
| TipoEleccion | `nombre` |
| Pregunta | `(texto, tipo_eleccion)` |
| OpcionRespuesta | `(pregunta, texto)` |
| Candidato | `(nombre, apellido, comuna)` o `(..., distrito)` |
| PosturaCandidato | `(candidato, pregunta)` |
| Noticia | `url` (cuando no vacio) |

---

## Optimizaciones aplicadas

Los seeds de gran volumen usan patron **"index in memory + bulk_create"**:

```python
# Antes: 1038 update_or_create + 8304 update_or_create = 9342 queries
# Despues: 3 SELECT + 1 bulk_create + 1 bulk_create = 5 queries
```

Detalle en `seed_alcaldes_2024.py` y `seed_preguntas_por_tipo.py`.

Cuando `bulk_create` bypassa signals, los FKs derivados
(ej. `Candidato.unidad_territorial`) se pre-indexan y setean **explicitamente**
antes del bulk.

---

## Como agregar un seed nuevo

1. Crear `core/management/commands/seed_<tema>.py`.
2. Heredar de `BaseCommand`.
3. Definir `help = "..."`.
4. Definir `handle(self, *args, **options)`.
5. Idempotencia por `update_or_create` (chico) o `bulk_create` + pre-index (grande).
6. Escribir un test en `test_seeds_ficticios.py` que verifique conteos + idempotencia.

Skeleton minimo:

```python
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Descripcion clara del comando en 1 linea."

    def handle(self, *args, **options):
        self.stdout.write("Sembrando <cosa>...")
        # ... logica ...
        self.stdout.write(self.style.SUCCESS("Listo."))
```

---

## Siguiente lectura

- `07-migraciones.md` - narrativa de schema changes.
- `08-signals.md` - efectos secundarios que se activan al crear/modificar filas.
- `../simple/04-como-agregar-cosas.md` - version admin para no devs.
