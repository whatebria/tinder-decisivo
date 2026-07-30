# Dataset SERVEL 2025 - Candidatos y Posturas Parlamentarias

> **AVISO IMPORTANTE**: este directorio contiene datos con dos naturalezas
> muy distintas. Leelo entero antes de importar nada a la base de datos.

## Composicion del dataset

| Archivo | Naturaleza | Nivel de confianza |
|---|---|---|
| `candidatos_servel_2025.csv` | **Datos reales** extraidos oficialmente | Alta |
| `candidatos_parlamentaria_2025.csv` | Datos reales adaptados al formato del importer | Alta |
| `preguntas_base.csv` | 17 preguntas transversales (`Preguntas generales`, `es_base=True`) | N/A |
| `preguntas_presidencial_2025.csv` | 17 preguntas agenda ejecutiva | N/A |
| `preguntas_diputados_2025.csv` | 15 preguntas agenda legislativa (Camara Baja) | N/A |
| `preguntas_senadores_2025.csv` | 15 preguntas agenda del Senado (bicameralismo, nombramientos, tratados) | N/A |
| `preguntas_alcaldes_2024.csv` | 17 preguntas agenda municipal | N/A |
| `candidatos_presidencial_2025.csv` | 8 candidatos presidenciales conocidos (Kast, Jara, Matthei, Parisi, Kaiser, Mayne-Nicholls, MEO, Artes) | Publica/manual |
| `posturas_presidencial_2025.csv` | **Datos DUMMY inferidos por CANDIDATO** (131 filas, 8 candidatos x 17 preguntas, con ~4% omisiones) | **Baja - ver seccion siguiente** |
| `posturas_diputados_2025.csv` | **Datos DUMMY inferidos por lista/partido** (14,636 filas, 1,096 diputados x 15 preguntas, con ~11% omisiones intencionales) | **Baja - ver seccion siguiente** |
| `posturas_senadores_2025.csv` | **Datos DUMMY inferidos por lista/partido** (1,675 filas, 125 senadores x 15 preguntas, con ~11% omisiones intencionales) | **Baja - ver seccion siguiente** |
| `preguntas_ejemplo.csv` | Copia de `backend/fixtures/preguntas_ejemplo.csv`. Se dejo como referencia de estilo/framing durante el diseno de los 5 cuestionarios. **No importar** en produccion (tipo `Presidencial` sin ano). | Referencia |

## `candidatos_servel_2025.csv` - fuente real

Los 1,221 candidatos a Diputado y Senador para la eleccion parlamentaria
Chile 2025.

**Fuente**: reporte Power BI publico del SERVEL.
`https://app.powerbi.com/view?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9`

**Fecha de extraccion**: 2026-07-28.

**Metodo de extraccion**:
1. Automatizacion Playwright headless de la tab "Buscar candidatos" del
   reporte PBI (el reporte no expone API ni descarga oficial).
2. Scroll bidireccional con detección de estabilidad para vencer la
   virtualizacion del visual de tabla.
3. Extraccion del DOM de las 6 columnas visibles.
4. Descarga como CSV UTF-8 con BOM via `Blob` + `<a download>` en el
   browser, rescatado del tempdir de Playwright.

**Verificacion**:
- Count vs KPI del reporte: 1,221 == 1,221.
- SHA-256 (verificable): (regenerar con `Get-FileHash`).
- Sin duplicados exactos, sin filas corruptas, sin leaks de metadata
  del visual PBI.

**Columnas**:
- `eleccion` - "Diputado" o "Senador"
- `nro_lista` - numero de listado del candidato dentro de su lista (int)
- `candidato` - nombre completo tal como aparece en Servel
- `region` - region electoral
- `territorio` - distrito o circunscripcion senatorial
- `lista` - pacto electoral (A-K o Independiente)
- `partido` - partido politico especifico del candidato

## `candidatos_parlamentaria_2025.csv` - adaptado al importer

Mismo contenido de `candidatos_servel_2025.csv` transformado al formato
que espera `backend/manage.py import_candidatos`. Tiene 13 columnas:

**Columnas consumidas por el importer actual** (7):
- `nombre` - split heuristico del campo `candidato` original
- `apellido` - idem
- `partido` - tal cual
- `ciudad` - vacio (los parlamentarios no tienen "ciudad", tienen distrito/circunscripcion)
- `bio` - vacio (no lo teniamos del PBI)
- `propuesta_electoral` - vacio (idem)
- `tipos_eleccion` - "Parlamentaria" fijo

**Columnas extras informativas** (6, IGNORADAS por el importer actual):
- `lista_electoral` - pacto electoral (A-K o Independiente)
- `territorio` - "Distrito N" para diputados, "Circunscripcion Senatorial N" para senadores
- `region` - region electoral ("De Valparaiso", "Metropolitana De Santiago", etc.)
- `eleccion` - "Diputado" o "Senador"
- `nro_lista` - numero de listado del candidato dentro de su lista
- `revision_apellido` - flag "1" si el split nombre/apellido es dudoso (46 filas)

### Sobre `region` y `territorio` (deuda tecnica documentada)

El modelo `Candidato` del backend tiene un FK `unidad_territorial` que
apunta a `UnidadTerritorial` (nivel `regional/distrital/comunal/etc`).
**El importer actual NO setea este FK.** Existe un TODO en
`backend/docs/MIGRATION_TERRITORIAL.md` linea 62 que pide ampliar los
importers (`import_candidatos.py`, `seed_diputados_2025.py`,
`seed_alcaldes_2024.py`) para que resuelvan la UT desde el CSV.

Las columnas `region` y `territorio` en este CSV **estan preparadas
para ese futuro importer**. Cuando se implemente:

```python
# Pseudocodigo del mapeo esperado
region_ut, _ = UnidadTerritorial.objects.get_or_create(
    nivel="regional", nombre=row["region"],
    defaults={"codigo": slugify(row["region"])},
)
if row["eleccion"] == "Diputado":
    # Diputado -> UT distrital, padre=region
    ut, _ = UnidadTerritorial.objects.get_or_create(
        nivel="distrital", nombre=row["territorio"],
        padre=region_ut,
        defaults={"codigo": slugify(row["territorio"])},
    )
else:
    # Senador -> UT regional (la region misma)
    ut = region_ut
candidato.unidad_territorial = ut
```

Mientras tanto, si la UI necesita mostrar "donde compite" un candidato,
puede leer estos campos directamente del CSV o correrse un script
separado que popule `ciudad` con `territorio` como fallback.

**Distribucion**: 1,096 Diputados + 125 Senadores. 12 listas, 43 partidos.

## `posturas_{diputados,senadores}_2025.csv` - DUMMY INFERIDO CON OMISIONES

**Estos archivos NO contienen posturas reales de cada candidato.** Son
data sintetica generada mediante un mapeo `lista/partido -> vector de 15
posturas` disenado a partir de:

- Programas publicos oficiales de los 12 pactos electorales 2025
- Historial de votaciones de los partidos componentes en el Congreso
  (periodo 2022-2025)
- Declaraciones publicas conocidas de los partidos madre

**Composicion final**:

| Archivo | Candidatos | Preguntas | Total potencial | Escritas | Omisiones |
|---|---:|---:|---:|---:|---:|
| `posturas_diputados_2025.csv` | 1,096 | 15 | 16,440 | 14,636 (89%) | 1,804 (11%) |
| `posturas_senadores_2025.csv` | 125 | 15 | 1,875 | 1,675 (89%) | 200 (11%) |

Las omisiones son **intencionales**: candidatos que "no respondieron"
a alguna pregunta, para probar el caso UX de posturas ausentes.

**Lo que NO hicimos** (y por que):

- **No consultamos a cada candidato individual**. Con 1,221 candidatos
  x 15 preguntas = 18,315 posturas potenciales, verificar una por una
  excede totalmente el alcance de este proyecto.
- **No investigamos declaraciones personales de cada candidato**. Un
  diputado UDI concreto puede diferir del promedio UDI en una pregunta
  puntual, y este dataset no captura esa dispersion.
- **No usamos LLM por candidato**. Descartado por consistencia: si
  algunos rows dicen `[INFERIDO POR LISTA]` y otros dicen `[LLM
  investigo]`, el importer los trata igual y engaña al usuario final.

### Diferenciacion intra-partido (ruido deterministico)

Para evitar que dos candidatos del mismo partido tengan posturas
IDENTICAS (lo que colapsaria la utilidad del match), se aplica ruido
deterministico +/- 1 por candidato:

- Seed por candidato: `SHA-256(nombre|apellido|partido)` primeros 32 bits
- Por cada pregunta: 60% queda igual al base, 20% baja 1, 20% sube 1
- Clamp a rango [1, 5] (nunca sale del dominio de opciones)
- Reproducible: regenerar da bit-a-bit lo mismo

Resultado empirico: candidatos del mismo partido difieren en ~30-50% de
sus posturas comunes. El sesgo ideologico se preserva (un candidato UDI
nunca terminara con aborto=5 porque su base=1 y maximo sube a 2).

### Omisiones deterministicas (candidatos que "no opinaron")

Cada `(candidato, pregunta)` tiene una probabilidad fija de ser omitido,
calibrada por controversialidad del tema. **Probabilidades por
cuestionario** (definidas en `_posturas_base.py`):

**Diputados 2025** (18% para las mas hot):

| Preg | Tema | P(omision) | Obs. reales |
|---:|---|---:|---:|
| 3 | Aborto libre 14 semanas | 18% | 18.9% |
| 8 | Plurinacionalidad | 18% | 15.8% |
| 12 | Matrimonio + adopcion | 18% | 18.5% |
| 15 | Escanos etnicos Congreso | 18% | 17.2% |
| 11 | Nueva Constitucion | 12% | 14.1% |
| 5-9 | ambiente/EdE/frontera | 10% | ~10% |
| 4-14 | SLEP/penas/reducir/agua | 8-10% | ~8-10% |
| 1-2 | Tributaria / Previsional | 5% | 4-6% |

**Senadores 2025**:

| Preg | Tema | P(omision) | Obs. reales |
|---:|---|---:|---:|
| 11 | Fin de las isapres | 18% | 20.0% |
| 12 | Eutanasia | 18% | 14.4% |
| 15 | Escanos etnicos en Senado | 18% | 15.2% |
| 7 | Reconocer Palestina | 15% | 13.6% |
| 8 | Mantener TIAR | 12% | 14.4% |
| 14 | Ley Antiterrorista | 12% | 11.2% |
| 4-13 | quorum/reducir/zonas | 8-10% | 5-13% |
| 2, 9, 10 | Nombramientos/previs/royalty | 5-6% | 2-10% |

Mecanismo: `SHA-256("OMIT|nombre|apellido|partido|tipo|orden")`
normalizado a [0,1] y comparado contra la probabilidad. Cuando decide
omitir, **la fila simplemente no se escribe** (el importer no crea
`Postura` para ese par, lo que la app trata como "sin dato").

Distribucion resultante en ambos archivos: **~83% de candidatos tienen
al menos 1 omision**; solo ~17% respondio las 15 completas. Ningun
candidato omitio mas de 6 preguntas.

### Marcadores de transparencia en cada fila

- `[INFERIDO POR LISTA: <nombre>]` - base desde el vector de la lista
- `[INFERIDO POR PARTIDO: <nombre>]` - override intra-lista
- Si hubo ruido, la justificacion incluye `RUIDO +1 deterministico` o
  `RUIDO -1 deterministico` con el valor base explicito

**`fuente_url`**: apunta al programa oficial de la coalicion / partido
donde fue posible, o a Wikipedia del partido como fallback. La URL es
real y navegable, pero NO cita una declaracion especifica del
candidato individual.

## `preguntas_*.csv` - 5 cuestionarios (81 preguntas totales, 10 ejes)

Cuestionarios disenados para las 3 elecciones principales de Chile
(Presidencial, Diputados + Senadores, Alcaldes) mas un set BASE
transversal.

**Ejes tematicos (10)**: `ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`,
`DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`, `PUEBLOS_ORIGINARIOS`,
`DISCAPACIDAD`, `OTRO`.

**Nota sobre backend**: `PUEBLOS_ORIGINARIOS` y `DISCAPACIDAD` NO estan
en `EJES_CHOICES` del modelo Django (los 8 originales si). El signal
automatico crea el `Eje` catalogo al importar, asi que funciona
end-to-end, pero el admin de Django muestra estos dos como codigos
crudos en vez de labels amigables. Si molesta, agregar a
`models/cuestionario.py` + migration.

> **Para el detalle completo de metodologia, restricciones lexicas,
> criterios por tipo de eleccion y limitaciones conocidas, ver
> [`METODOLOGIA_PREGUNTAS.md`](./METODOLOGIA_PREGUNTAS.md).**

Criterios de diseno resumidos:

- **Framing neutro**: se evitan verbos cargados (`garantizar`, `combatir`,
  `erradicar`, `proteger`) que sesgan hacia intervencionismo. Se prefiere
  `permitir/prohibir`, `aumentar/reducir`, `mantener/eliminar`, `ampliar/
  restringir` que no toman lado.
- **Controversial real**: cada pregunta genera dos bandos identificables
  en el debate chileno actual. Consensos obvios ("debe combatirse la
  corrupcion") estan excluidos.
- **Actualidad 2024-2025**: referencias explicitas a proyectos, leyes y
  agendas concretas (Ley Nain-Retamal, Estado de Excepcion Macrosur,
  copago Fonasa, royalty minero, TPP-11, SLEP, etc.).
- **Cobertura por ejes**: distribucion balanceada entre los 8 ejes
  (`ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`, `DDHH`,
  `INTERNACIONAL`, `INSTITUCIONAL`, `OTRO`).

### Distribucion por eje (81 preguntas)

| Eje | Base | Presid. | Diputados | Senadores | Alcaldes | Total |
|---|---:|---:|---:|---:|---:|---:|
| INSTITUCIONAL | 2 | 2 | 3 | 5 | 2 | 14 |
| ECONOMIA | 2 | 4 | 2 | 2 | 2 | 12 |
| SOCIEDAD | 3 | 2 | 2 | 2 | 2 | 11 |
| AMBIENTE | 1 | 2 | 2 | 1 | 3 | 9 |
| SEGURIDAD | 2 | 2 | 2 | 1 | 2 | 9 |
| INTERNACIONAL | 1 | 2 | 1 | 3 | 0 | 7 |
| OTRO | 2 | 1 | 1 | 0 | 3 | 7 |
| DDHH | 2 | 0 | 2 | 1 | 1 | 6 |
| **PUEBLOS_ORIGINARIOS** | 1 | 1 | 0 | 0 | 1 | 3 |
| **DISCAPACIDAD** | 1 | 1 | 0 | 0 | 1 | 3 |

**Casos sin cobertura intencionales**:
- `Alcaldes 2024` sin `INTERNACIONAL` (no manejan politica exterior).
- `Senadores 2025` sin `OTRO` (agenda del Senado se cubre bien con los
  7 ejes restantes, con carga alta en `INSTITUCIONAL` por su rol
  constitucional).
- `Diputados` y `Senadores` sin `PUEBLOS_ORIGINARIOS` ni `DISCAPACIDAD`
  como ejes propios (temas tocados en otras preguntas: escanos
  reservados esta en DDHH, plurinacionalidad en DDHH).

### Orden de import

El importer `import_preguntas` **no setea** `TipoEleccion.es_base=True`
desde el CSV — usa `get_or_create(nombre=...)` que crea el tipo con
`es_base=False` por default. Por lo tanto, para las preguntas base hay
que asegurarse de que el TipoEleccion "Preguntas generales" **exista con
`es_base=True`** antes de importar. Dos alternativas:

1. **Correr primero** `seed_preguntas_base.py` (crea el tipo con el flag
   correcto), y despues importar el resto.
2. **Setear a mano** el flag despues del import:
   ```python
   TipoEleccion.objects.filter(nombre="Preguntas generales").update(es_base=True)
   ```

Orden recomendado:

```bash
# 1. Base (transversales)
uv run python manage.py import_preguntas dataset/preguntas_base.csv
# manual: marcar el tipo como base
uv run python manage.py shell -c \
  "from core.models import TipoEleccion; TipoEleccion.objects.filter(nombre='Preguntas generales').update(es_base=True)"

# 2. Cada eleccion
uv run python manage.py import_preguntas dataset/preguntas_presidencial_2025.csv
uv run python manage.py import_preguntas dataset/preguntas_diputados_2025.csv
uv run python manage.py import_preguntas dataset/preguntas_senadores_2025.csv
uv run python manage.py import_preguntas dataset/preguntas_alcaldes_2024.csv

# 3. Candidatos - parlamentarios (setea tipos_eleccion segun cargo)
uv run python manage.py import_candidatos dataset/candidatos_parlamentaria_2025.csv
# 3b. Candidatos - presidenciales (los 8 conocidos)
uv run python manage.py import_candidatos dataset/candidatos_presidencial_2025.csv

# 4. Posturas
uv run python manage.py import_posturas dataset/posturas_presidencial_2025.csv
uv run python manage.py import_posturas dataset/posturas_diputados_2025.csv
uv run python manage.py import_posturas dataset/posturas_senadores_2025.csv
```

### Alineacion candidato -> cuestionario

El campo `tipos_eleccion` esta seteado segun el tipo de candidatura:

- 8 presidenciales (`candidatos_presidencial_2025.csv`) ->
  `tipos_eleccion="Presidencial 2025"` -> match contra
  `preguntas_presidencial_2025.csv` (15 preguntas) + las 15 base.
- 1,096 diputados -> `tipos_eleccion="Diputados 2025"` -> match contra
  `preguntas_diputados_2025.csv` (15 preguntas) + las 15 base.
- 125 senadores -> `tipos_eleccion="Senadores 2025"` -> match contra
  `preguntas_senadores_2025.csv` (15 preguntas) + las 15 base.

Esta separacion respeta la logica institucional del sistema chileno.

### Posturas dummy: tres archivos, dos metodologias

- `posturas_presidencial_2025.csv` (131 filas): 8 candidatos x 17
  preguntas, ~4% omisiones. **Vector POR CANDIDATO** (Kast, Jara,
  etc. tienen perfil publico conocido, no se infieren desde la lista).
- `posturas_diputados_2025.csv` (14,636 filas): 1,096 candidatos x 15
  preguntas, ~11% omisiones. **Vector POR LISTA + overrides por
  partido**.
- `posturas_senadores_2025.csv` (1,675 filas): 125 candidatos x 15
  preguntas, ~11% omisiones. **Vector POR LISTA + overrides por
  partido**.

Todos usan el mismo ruido deterministico +/-1 y las mismas omisiones
deterministicas via SHA-256. Los vectores base son distintos por
cuestionario. Definiciones en `_posturas_base.py`.

## Uso apropiado

**SI**:
- Testing de la app con volumen realista de datos (1,221 candidatos).
- Prototipos y demos con feedback cualitativo (la app "se ve bien").
- Simulacion end-to-end del flujo cuestionario -> resultados -> match.
- Investigacion academica sobre la app en si (tesis).

**NO**:
- Nunca desplegar esta data en produccion abierta al publico general.
- Nunca usar el porcentaje de match como recomendacion real de voto.
- Nunca citar posturas de esta base como si fueran declaraciones
  reales de un candidato.

Si el proyecto avanza a produccion, el archivo `posturas_*` **debe ser
regenerado con investigacion candidato-por-candidato** o abandonado en
favor de un modelo distinto (ej. auto-declaracion del candidato via
formulario).

## Sugerencia frontend

Si esta data se muestra en la app aunque sea en dev, el UI **debe
mostrar un disclaimer visible** cuando la justificacion de una postura
contiene `[INFERIDO...]`. Algo como:

> Postura inferida por afiliacion politica del candidato. No es una
> declaracion personal verificada.

## Estadisticas del dataset generado

- **Total filas**: 14,652 (1,221 candidatos x 12 preguntas)
- **Tamano archivo**: 5.0 MB (CSV UTF-8 con BOM)
- **Distribucion de valores**:
  - 1 (Muy en desacuerdo): 20.1%
  - 2 (En desacuerdo): 17.6%
  - 3 (Neutral): 14.9%
  - 4 (De acuerdo): 20.1%
  - 5 (Muy de acuerdo): 27.3%
- **Filas con override por partido**: 508 (3.5%)
- **Filas con ruido +/- 1**: 4,303 (29.4%)
- **Filas identicas al base de coalicion**: 10,349 (70.6%)

## Scripts internos de generacion

El dataset es reproducible bit-a-bit. Los scripts que lo generan viven
en este mismo directorio con prefijo `_` (indicando "tooling interno"):

- `_posturas_base.py` - matriz `12 listas x 12 preguntas` + overrides
  por partido + URLs de fuente. Es el nucleo intelectual: si algun
  vector es incorrecto, se edita aca y se regenera todo.
- `_adapt_candidatos.py` - convierte `candidatos_servel_2025.csv` al
  formato del importer del backend.
- `_generate_posturas.py` - genera el CSV de 14,652 filas aplicando
  la matriz + ruido deterministico.
- `_verify_posturas.py` - checks post-generacion (counts, longitud
  justificaciones, URLs, diferenciacion intra-partido).
- `_show_matrix.py` - imprime la matriz en tabla legible.

Para regenerar despues de cambios en la matriz:

```bash
cd dataset
python _adapt_candidatos.py  # solo si cambio el CSV de candidatos
python _generate_posturas.py
python _verify_posturas.py
```

## Historial de generacion

- **2026-07-28**: extraccion de los 1,221 candidatos desde el reporte
  Power BI del Servel via Playwright headless.
- **2026-07-28**: adaptacion al formato del importer, diseno de 12
  preguntas parlamentarias, matriz base 12x12 y overrides por partido,
  ruido deterministico intra-partido, generacion y verificacion del
  CSV final de 14,652 filas.
