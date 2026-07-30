# 10. Fixtures (`backend/fixtures/`)

Archivos CSV de ejemplo para los importers + un `README.md` que documenta el flujo. **No hay API oficial de Servel**: la estrategia es import offline por CSV. El usuario baja archivos de `opendata.servel.cl`, los adapta al formato esperado y corre los management commands.

## Archivos

### `README.md` (5.7 KB)
Documenta:
- Contexto: no hay API oficial, opendata.servel.cl publica XLSX/CSV.
- Uso de cada importer con comandos `uv run python manage.py import_*`.
- Formato esperado de cada CSV (columnas requeridas + opcionales).
- Como generar `posturas_template.csv` con un script Python inline (que hace `Candidato x Pregunta` -> filas vacias para llenar en Excel).
- Fuentes aceptables y NO aceptables para justificar posturas (declaraciones publicas, votaciones en Congreso, plataforma electoral; NO analisis de terceros ni redes sin verificacion).
- Como adaptar un CSV de `opendata.servel.cl` con pandas.

### `candidatos_ejemplo.csv` (1.1 KB)
Ejemplo con candidatos historicos chilenos para probar `import_candidatos`. Columnas: `nombre, apellido, partido, tipos_eleccion, ciudad, bio, propuesta_electoral`.

### `preguntas_ejemplo.csv` (1.1 KB)
Ejemplo con 12 preguntas variando ejes tematicos para probar `import_preguntas`. Columnas: `texto, tipo_eleccion, eje_tematico, orden`.

### `posturas_template.csv` (5.1 KB)
Template pre-poblado con filas vacias para el importer verificable. Se regenera cuando cambian candidatos o preguntas. Columnas: `candidato_apellido, pregunta_orden, pregunta_texto_ref, valor, justificacion, fuente_url`.

### `posturas_draft_verificar.csv` (14.8 KB)
Draft grande con posturas para verificar antes de importar. Es un WIP humano -- el operador llena `justificacion` y `fuente_url` para cada fila con `valor` no vacio.

## Formato de columnas

### `candidatos.csv`
| Columna | Req | Descripcion |
|---|---|---|
| `nombre` | si | Nombre |
| `apellido` | si | Apellido |
| `partido` | si | Nombre del partido |
| `tipos_eleccion` | si | Separados por `\|` (pipe) |
| `ciudad` | no | Ciudad |
| `bio` | no | Bio breve |
| `propuesta_electoral` | no | Resumen |

Idempotencia: clave `(nombre, apellido, partido)`.

### `preguntas.csv`
| Columna | Req | Descripcion |
|---|---|---|
| `texto` | si | Enunciado |
| `tipo_eleccion` | si | Nombre del TipoEleccion (auto-crea) |
| `eje_tematico` | si | Uno de: `ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`, `DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`, `OTRO` |
| `orden` | no | Default 0 |

### `posturas.csv`
| Columna | Req | Descripcion |
|---|---|---|
| `candidato_apellido` | si | Case-insensitive |
| `pregunta_orden` | si | Entero |
| `pregunta_texto_ref` | no | Solo referencia visual, no se importa |
| `valor` | si | 1..5 |
| `justificacion` | si | Min 20 chars |
| `fuente_url` | si | URL verificable http/https |

Filas con `valor` o `candidato_apellido` vacios se saltan (CSV parcial permitido).
