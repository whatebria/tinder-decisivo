# Metodologia de diseno de preguntas

Este documento describe **como se disenaron las 81 preguntas** de los 5
cuestionarios (`preguntas_base.csv`, `preguntas_presidencial_2025.csv`,
`preguntas_diputados_2025.csv`, `preguntas_senadores_2025.csv`,
`preguntas_alcaldes_2024.csv`) y **cuales restricciones se aplicaron**
para asegurar neutralidad, controversialidad real y balance tematico.

> Este documento acompana a `README.md` (que describe el contenido de los
> archivos). Aca vive el *como* y el *por que* del diseno.

---

## 1. Objetivos de diseno

Las preguntas deben cumplir simultaneamente:

1. **Diferenciar candidatos**: si todos los candidatos responderian igual,
   la pregunta no aporta senal para el algoritmo de match. Consensos
   obvios ("hay que combatir la corrupcion") estan excluidos.
2. **Ser respondibles sin conocimiento tecnico especializado**: el usuario
   promedio debe poder tomar una postura sin necesitar background
   juridico, economico o cientifico.
3. **No inducir una respuesta**: el framing no debe empujar al usuario
   hacia un bando.
4. **Ser actuales**: temas del debate publico chileno 2024-2025, con
   referencias verificables (proyectos de ley, votaciones, leyes recien
   promulgadas).
5. **Cubrir los 10 ejes tematicos** del sistema de forma balanceada dentro
   de cada cuestionario.

---

## 2. Fuentes consultadas

- **Programas oficiales** de los pactos electorales 2025 (Servel).
- **Actas de votacion nominal** de la Camara de Diputados y el Senado
  (camara.cl, senado.cl) periodo 2022-2025.
- **Leyes recientes de alto impacto publico**:
  - Ley 21.560 "Nain-Retamal" (endurecimiento de penas por delitos
    violentos, 2023)
  - Ley 21.400 "Matrimonio Igualitario" (2021)
  - Ley 21.404 "Interrupcion voluntaria del embarazo en tres causales"
    (2017, base para la discusion de las 14 semanas)
  - Ley 21.545 "Piensa en Chile" y ley de royalty minero
  - Estados de Excepcion Constitucional en la Macrozona Sur (recurrentes
    desde 2022)
- **Debates publicos identificables** por cobertura de prensa nacional
  (El Mercurio, La Tercera, CIPER, Interferencia) en el periodo.
- **Convencion Constitucional 2021-2022** y **Consejo Constitucional
  2023** como registro publico de posturas partidarias sobre
  plurinacionalidad, aborto, propiedad, etc.

---

## 3. Restricciones de framing (**la mas importante**)

Cada afirmacion se redacto siguiendo reglas estrictas para evitar sesgo
lexico.

### 3.1. Verbos prohibidos

Estos verbos, aunque parezcan neutros, sesgan la lectura hacia una
posicion (usualmente intervencionista o consensual):

| Verbo prohibido | Por que sesga | Alternativa neutra |
|---|---|---|
| `garantizar` | Implica que hay un derecho pre-existente que se puede vulnerar | `permitir`, `establecer` |
| `proteger` | Presupone que el objeto de la accion esta amenazado | `regular`, `mantener` |
| `combatir` | Framing belico: sugiere que el objeto es enemigo | `reducir`, `sancionar` |
| `erradicar` | Absolutismo, no admite matiz | `disminuir` |
| `salvaguardar` | Sinonimo de `proteger`, mismo problema | `conservar` |
| `asegurar` | Similar a garantizar | `promover`, `facilitar` |

### 3.2. Palabras cargadas prohibidas

- `criminales`, `delincuentes` (deshumanizante, sesga hacia mano dura)
- `invasion`, `amenaza` (aplicado a migracion sesga hacia restrictivismo)
- `casta`, `elite`, `corrupto` (populismo lexico, sesga anti-establishment)

### 3.3. Verbos preferidos (neutros bipolares)

Verbos que aceptan sinceramente respuestas de acuerdo y desacuerdo:

- `permitir` / `prohibir`
- `aumentar` / `reducir`
- `ampliar` / `restringir`
- `mantener` / `eliminar`
- `incluir` / `excluir`
- `establecer` / `derogar`

### 3.4. Estructura sintactica recomendada

```
[SUJETO INSTITUCIONAL] debe [VERBO NEUTRO] [OBJETO CONCRETO]
[con/para <precision opcional>].
```

Ejemplos:
- "El Estado debe intervenir activamente en la economia..."
- "El municipio debe cobrar una sobretasa a las comunas ricas..."
- "El proximo gobierno debe impulsar una reforma tributaria..."

**No** se usa "es necesario" / "hay que" / "seria bueno" porque son
sujetos ambiguos que asumen consenso implicito.

### 3.5. Verificacion automatica

El script `_verify_preguntas.py` corre un chequeo lexico contra el
set `PALABRAS_CARGADAS`. Si detecta alguna, imprime la pregunta
ofensora. **La rama de main solo debe hacerse merge si el chequeo
reporta "Framing limpio"**.

Caso conocido: en el diseno inicial una pregunta base usaba
`garantizar el derecho pleno a la adopcion`. Fue reformulada a
`Las parejas del mismo sexo deben poder adoptar hijos en igualdad
de condiciones que las parejas heterosexuales`.

---

## 4. Restricciones de controversialidad

Una pregunta valida **debe** cumplir:

1. **Existir dos posiciones publicas identificables**, cada una
   defendida por al menos un partido con representacion actual en el
   Congreso o en el Ejecutivo. No preguntas sobre las que solo hay
   consenso ("Chile debe combatir el terrorismo" - fuera).
2. **Ser respondible en escala 1-5** sin que 3 sea trivialmente la
   respuesta "correcta". Si la mayoria racional respondera 3, la
   pregunta no discrimina y se elimina.
3. **No mezclar dos temas** en la misma afirmacion. Ej: rechazado
   "Se debe permitir el aborto y el matrimonio igualitario" (dos
   temas). Se divide en dos preguntas.
4. **Referencia concreta y datable**. Preferimos "Se debe aprobar la
   Ley Nain-Retamal" sobre "Se debe endurecer las penas". La primera
   ancla la respuesta a una politica publica identificable.

---

## 5. Distribucion por eje tematico

El sistema Servel usa 10 ejes: los 8 originales (`ECONOMIA`, `SOCIEDAD`,
`AMBIENTE`, `SEGURIDAD`, `DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`,
`OTRO`) mas 2 agregados en el dataset (`PUEBLOS_ORIGINARIOS`,
`DISCAPACIDAD`). Los dos ultimos no estan en el `EJES_CHOICES` del
modelo Django — el signal `Eje` los auto-crea al importar (ver README
seccion "Nota sobre backend").

Cada cuestionario cubre **al menos 6 de los 10 ejes**. Se aceptan
ausencias donde el cargo no tiene competencia:

- `Alcaldes 2024` no tiene `INTERNACIONAL` porque los alcaldes chilenos
  no manejan politica exterior.
- `Senadores 2025` no tiene `OTRO` porque los 7 ejes restantes cubren
  bien la agenda del Senado, con carga alta en `INSTITUCIONAL` (5
  preguntas) por su rol constitucional en nombramientos altos, quorum
  reformas, bicameralismo, limitacion de reeleccion y numero de
  escanos.
- `Diputados 2025` y `Senadores 2025` no tienen preguntas etiquetadas
  como `PUEBLOS_ORIGINARIOS` ni `DISCAPACIDAD`. Los temas relacionados
  (escanos reservados, plurinacionalidad) siguen en `DDHH` para
  preservar la trazabilidad historica del dataset. Los ejes nuevos
  entran via Base (transversal) + Presidencial + Alcaldes, que son
  los cuestionarios donde tienen mas competencia directa.

Distribucion final (verificada con `_verify_preguntas.py`):

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
| PUEBLOS_ORIGINARIOS | 1 | 1 | 0 | 0 | 1 | 3 |
| DISCAPACIDAD | 1 | 1 | 0 | 0 | 1 | 3 |

---

## 6. Restricciones por tipo de eleccion

Cada cuestionario tiene un **scope de agenda** propio. Una pregunta
que aplica a un scope no necesariamente aplica a otro.

### 6.1. `Preguntas generales` (base, `es_base=True`)

- **Scope**: valores transversales que se aplican a cualquier cargo.
- **Criterio de inclusion**: la pregunta debe poder responderse
  independientemente del cargo por el que se postula el candidato.
- **Tipico**: aborto, matrimonio, migracion, rol del Estado, nueva
  Constitucion, cannabis. Temas que definen la ideologia global y no
  la agenda especifica.
- **Feature backend**: al tener `TipoEleccion.es_base=True`, estas
  preguntas se agregan automaticamente a TODAS las demas elecciones
  al calcular el match. El usuario las responde una sola vez.

### 6.2. `Presidencial 2025`

- **Scope**: agenda ejecutiva del proximo gobierno (poderes propios
  del Presidente).
- **Criterio de inclusion**: la pregunta debe referirse a algo que el
  Presidente **puede impulsar directamente** (proyectos de ley con
  urgencia, decretos, politica exterior, nombramientos, etc.).
- **Tipico**: reforma tributaria, reforma previsional, royalty minero,
  cierre de termoelectricas, militarizacion de la frontera,
  TPP-11/tratados, aborto por proyecto de ley presidencial,
  eliminacion del Senado (via nuevo proceso constituyente).

### 6.3. `Diputados 2025`

- **Scope**: agenda legislativa de la Camara de Diputados.
- **Criterio de inclusion**: la pregunta debe referirse a una
  votacion parlamentaria concreta (existente o previsible) donde
  el diputado tendria que pronunciarse.
- **Tipico**: aprobacion/rechazo de proyectos, reformas
  constitucionales, escanos reservados, limite de reeleccion, ley
  de glaciares, Ley Nain-Retamal, plurinacionalidad, etc.
- **Solapamiento con Presidencial**: algunas preguntas son casi
  identicas en tema pero difieren en el **verbo institucional**:
  Presidente `impulsa` / Congreso `aprueba`.

### 6.4. `Senadores 2025`

- **Scope**: agenda del Senado, con enfasis en **atribuciones
  exclusivas** que la Camara de Diputados no tiene.
- **Criterio de inclusion**: la pregunta debe tocar al menos una de:
  (a) atribuciones exclusivas del Senado (nombramientos altos:
  Fiscal Nacional, ministros Corte Suprema; ratificacion de
  tratados; acusaciones constitucionales), (b) proyectos actualmente
  en tramitacion en el Senado (isapres, eutanasia, previsional,
  ley antiterrorista, zonas de sacrificio), o (c) reformas al
  propio funcionamiento del Senado (bicameralismo, reduccion de
  escanos, quorum 2/3, limite de reeleccion).
- **Solapamiento con Diputados**: intencional en temas como
  previsional, escanos reservados o limite de reeleccion, para
  medir la coherencia del candidato entre camaras. El verbo cambia
  (Diputados `aprueba` / Senado `revisa y aprueba/rechaza`).
- **Restriccion tematica**: sin `OTRO` (los 7 ejes restantes cubren
  el scope; agregar una pregunta artificial en `OTRO` diluiria la
  coherencia).

### 6.5. `Alcaldes 2024`

- **Scope**: agenda municipal (competencias del municipio).
- **Criterio de inclusion**: la pregunta debe caer en un area donde
  el municipio tiene **atribuciones legales reales** (ornato, aseo,
  transito, permisos comerciales, viviendas sociales, seguridad
  comunal, educacion municipal, presupuestos participativos).
- **Restriccion**: **sin `INTERNACIONAL`** por definicion.
- **Tipico**: sobretasa a comunas ricas, guardias armados,
  reconocimiento facial en calles, presupuestos participativos,
  regularizacion de tomas, comercio ambulante, ferias libres,
  cesion de terrenos para areas verdes.

---

## 7. Validaciones automatizadas

El script `_verify_preguntas.py` corre en cada cambio:

| Check | Descripcion | Falla si |
|---|---|---|
| **Filas por archivo** | Debe haber exactamente 15 preguntas por CSV | count != 15 |
| **tipo_eleccion coherente** | Todas las filas del CSV usan el tipo canonico | mezcla o typo |
| **Ejes validos** | Se aceptan los 10 ejes del dataset (8 de `EJES_CHOICES` + `PUEBLOS_ORIGINARIOS` + `DISCAPACIDAD`) | eje desconocido |
| **Sin duplicados de texto** | Ningun texto se repite entre los 4 CSVs | hash colision |
| **Framing limpio** | Ninguna pregunta contiene palabras cargadas | match en set prohibido |

Ejecutar con:

```bash
cd dataset
python _verify_preguntas.py
```

Output esperado: todos los checks marcan **OK** y `Framing limpio`.

---

## 8. Limitaciones conocidas

Estas son limitaciones **aceptadas** del diseno, no bugs a arreglar.

1. **Neutralidad no es objetiva**. Aun evitando verbos cargados, el
   solo hecho de elegir *que* preguntar sesga. Elegir "royalty al agua
   para agroexportacion" implica que el tema es relevante; no
   preguntar "prohibir sindicatos" implica que no lo es. **Este dataset
   asume la ventana de Overton del debate chileno 2024-2025.**
2. **Framing bipolar** simplifica realidades. Muchas politicas tienen
   grises tecnicos (ej. "royalty minero al 3%, 5% o progresivo") que
   una escala 1-5 no captura. Se opto por afirmaciones globales.
3. **Solapamiento entre cuestionarios**. Algunas preguntas se
   parecen entre `Presidencial` y `Diputados` (ej. aborto 14 semanas
   aparece en ambos con framing distinto). Esto es intencional: mide
   la coherencia del candidato entre el rol ejecutivo y legislativo,
   y refleja que muchos temas se debaten en ambos poderes.
4. **Traduccion cultural**. Las preguntas asumen contexto chileno
   (SLEP, Nain-Retamal, Macrozona Sur, TPP-11). No son portables a
   otros paises sin reformulacion.
5. **Congelamiento temporal**. Los cuestionarios reflejan el debate
   de un momento (2024-2025). Reforma previsional puede aprobarse y
   dejar la pregunta obsoleta. Se requiere revision anual.

---

## 9. Ciclo de actualizacion recomendado

Para futuras iteraciones del dataset:

1. Revisar cada 12 meses si alguna pregunta quedo obsoleta (ley
   aprobada, tema salio del debate).
2. Reemplazar preguntas obsoletas manteniendo el count de 15 por CSV
   y la distribucion por eje.
3. Correr `_verify_preguntas.py` antes de commit.
4. Si cambia una pregunta ya usada, actualizar `_posturas_base.py`
   con el vector correspondiente y regenerar `posturas_*.csv`.

---

## 10. Referencias cruzadas

- `README.md` - descripcion de los archivos del dataset.
- `_verify_preguntas.py` - script de validacion.
- `_posturas_base.py` - vector base de posturas por lista (15 valores
  alineados con las 15 preguntas de `Diputados 2025`).
- `backend/core/models/electoral.py` - modelo `TipoEleccion` con la
  feature `es_base`.
- `backend/core/management/commands/import_preguntas.py` - importer
  que consume estos CSVs.
- `backend/docs/MIGRATION_TERRITORIAL.md` - deuda tecnica de
  UnidadTerritorial (relacionada con `candidatos_*` pero no con
  `preguntas_*`).
