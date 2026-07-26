# Fixtures de datos para Servel

## Contexto: no hay API oficial de Servel

**Servel Chile no expone una API REST publica**. Lo que si publica:

- **opendata.servel.cl** - archivos CSV/XLSX de padron electoral y candidaturas por proceso.
- **servel.cl/candidatos-elecciones-***  - HTML con listas oficiales por eleccion.

La estrategia adoptada es: **importer offline por CSV**. Vos bajas el archivo
oficial cuando Servel lo publica, lo ajustas al formato esperado (si hace falta),
y corres el management command.

## Archivos de ejemplo

- `candidatos_ejemplo.csv` - candidatos historicos chilenos para probar.
- `preguntas_ejemplo.csv` - 12 preguntas con distintos ejes tematicos.

## Uso

### Cargar candidatos

```bash
cd backend

# Preview (no escribe en DB)
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv --dry-run

# Import real
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv

# CSV con delimitador ";"  (formato tipico Excel Europa/LATAM)
uv run python manage.py import_candidatos archivo.csv --delimiter ";"
```

### Cargar preguntas + opciones estandar

Cada pregunta importada genera automaticamente sus 6 opciones de respuesta:
`Muy en desacuerdo (1)`, `En desacuerdo (2)`, `Neutral (3)`, `De acuerdo (4)`,
`Muy de acuerdo (5)`, y `No se / Prefiero no responder` (marcada como `es_no_se=True`).

```bash
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
```

### Cargar posturas de candidatos (verificables)

**IMPORTANTE**: las posturas afectan directamente los resultados que ve el
usuario. Solo importa posturas respaldadas por **fuentes publicas verificables**.
El importer rechaza filas sin `justificacion` (min 20 chars) o sin `fuente_url`.

```bash
# 1. Genera template pre-poblado (1 fila por candidato x pregunta)
#    Regeneralo cada vez que cambien candidatos o preguntas.
cat > /tmp/gen_template.py <<'EOF'
import csv, django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','api.settings')
django.setup()
from core.models import Candidato, Pregunta
cands = list(Candidato.objects.order_by('apellido'))
prs = list(Pregunta.objects.order_by('orden','id'))
with open('fixtures/posturas_template.csv','w',newline='',encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['candidato_apellido','pregunta_orden','pregunta_texto_ref','valor','justificacion','fuente_url'])
    for c in cands:
        for p in prs:
            w.writerow([c.apellido, p.orden, p.texto[:60], '', '', ''])
EOF
uv run python /tmp/gen_template.py

# 2. Llenar posturas_template.csv en Excel/LibreOffice
#    (valor 1-5, justificacion + fuente_url para CADA fila)

# 3. Preview
uv run python manage.py import_posturas fixtures/posturas_template.csv --dry-run

# 4. Import real
uv run python manage.py import_posturas fixtures/posturas_template.csv

# Si necesitas sobreescribir posturas existentes:
uv run python manage.py import_posturas fixtures/posturas_template.csv --update
```

**Fuentes aceptables** para justificar posturas:
- Declaraciones publicas del candidato (entrevistas, prensa)
- Proyectos de ley presentados / votaciones registradas en Congreso
- Plataforma electoral publicada por el comando
- Debate publico grabado con timestamp

**Fuentes NO aceptables**:
- Analisis de terceros sin cita directa
- Redes sociales sin verificacion de autenticidad
- Opinion personal del que llena el CSV

### `posturas.csv`

| Columna | Requerida | Descripcion |
|---|---|---|
| `candidato_apellido` | si | Apellido exacto (case-insensitive) |
| `pregunta_orden` | si | Orden de la pregunta (1..N) |
| `pregunta_texto_ref` | no | Copia del texto de la pregunta (solo referencia visual, no se importa) |
| `valor` | si | 1..5 (1=Muy en desacuerdo, 5=Muy de acuerdo) |
| `justificacion` | si | Texto respaldatorio (min 20 chars) |
| `fuente_url` | si | URL verificable (http/https) |

Filas con `valor` o `candidato_apellido` vacio se saltan (permite CSV parcial).

## Formato esperado

### `candidatos.csv`

| Columna | Requerida | Descripcion |
|---|---|---|
| `nombre` | si | Nombre del candidato |
| `apellido` | si | Apellido |
| `partido` | si | Nombre del partido |
| `tipos_eleccion` | si | Lista de tipos separados por `\|` (pipe). Ej: `Presidencial\|Parlamentaria` |
| `ciudad` | no | Ciudad de origen |
| `bio` | no | Bio breve |
| `propuesta_electoral` | no | Resumen de la propuesta |

**Idempotencia**: la clave logica es `(nombre, apellido, partido)`. Si existe, se actualiza. Si no, se crea.

### `preguntas.csv`

| Columna | Requerida | Descripcion |
|---|---|---|
| `texto` | si | Enunciado de la pregunta |
| `tipo_eleccion` | si | Nombre del TipoEleccion (se auto-crea si no existe) |
| `eje_tematico` | si | Uno de: `ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`, `DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`, `OTRO` |
| `orden` | no | Orden en el cuestionario (default 0) |

## Como adaptar un CSV de opendata.servel.cl

El export oficial de Servel viene con muchas mas columnas (RUT, folio, region, etc.).
Para importarlo, hace un preprocesado con pandas o LibreOffice para dejar
solo las columnas que necesita el importer, renombrar segun corresponda,
y agregar la columna `tipos_eleccion` derivada del tipo de proceso electoral.

Ejemplo minimo en Python:

```python
import pandas as pd
df = pd.read_excel("servel_candidatos_2025.xlsx")
df = df.rename(columns={
    "NOMBRES": "nombre",
    "APELLIDOS": "apellido",
    "PARTIDO_POLITICO": "
    "COMUNA": "ciudad",
})
df["tipos_eleccion"] = "Presidencial"
df["bio"] = ""
df["propuesta_electoral"] = ""
df[["nombre", "apellido", "partido", "ciudad", "bio", "propuesta_electoral", "tipos_eleccion"]] \
    .to_csv("fixtures/candidatos_servel_2025.csv", index=False)
```
