# Resumen: Stockinger, Maas, Talvitie y Dignum (2024)

> **Trustworthiness of voting advice applications in Europe**

## Ficha

- **Autores**: Elisabeth Stockinger (ETH Zurich), Jonne Maas (TU Delft), Christofer Talvitie (U Amsterdam), Virginia Dignum (Umeå U)
- **Revista**: *Ethics and Information Technology* (2024) 26:55
- **DOI**: 10.1007/s10676-024-09790-6
- **Publicado**: 12 agosto 2024
- **Tipo**: **estudio comparativo cualitativo** (7 VAAs europeas) con framework normativo
- **Pág PDF**: 18
- **Handle interno**: `_s10676.txt` (workspace)
- **Código**: https://github.com/ethz-coss/vaa-egtai-compliance

## Pregunta

¿Las VAAs europeas cumplen con los requisitos de **AI confiable** definidos por la Comisión Europea (Ethics Guidelines for Trustworthy AI — EGTAI)? `[p.1-2]`

## Framework EGTAI (Comisión Europea, 2019) `[p.2-3]`

Los 4 principios fundamentales de AI confiable:
1. Respeto a la autonomía humana
2. Fairness
3. Explicabilidad
4. Prevención de daño

Operacionalizados en **7 requisitos evaluables**:

| Req | Nombre | Sub-reqs |
|---|---|---:|
| **R1** | Human agency and oversight | 4 |
| **R2** | Technical robustness and safety | 8 |
| **R3** | Privacy and data governance | 3 |
| **R4** | Transparency | 11 |
| **R5** | Diversity, non-discrimination, fairness | 11 |
| **R6** | Societal and environmental well-being | 6 |
| **R7** | Accountability | 7 |

Los autores adaptan cada sub-requisito al contexto específico de VAAs y publican el checklist completo en Tabla A4 del paper.

## Muestra evaluada `[p.6-7]`

7 VAAs europeas representando las 3 familias canónicas:

| VAA | País | Familia | Complejidad | Placement | Institución |
|---|---|---|---|---|---|
| **StemWijzer** | NL | StemWijzer | Baja | Auto (partidos) | Non-profit |
| **Wahl-O-Mat** | DE | StemWijzer | Baja | Auto (partidos) | Agencia federal |
| **Kieskompas What2Vote** | NL | Kieskompas | Media | Expertos | Agencia privada |
| **Aftonbladets valkompass** | SE | Kieskompas | Baja | Híbrido | Medio periodístico |
| **Smartvote** | CH | Smartvote | Alta | Auto (candidatos) | Non-profit |
| **HS Vaalikone** | FI | Smartvote | Alta | Auto (candidatos) | Medio periodístico |
| **SVT Nyheters valkompass** | SE | Mixto | Media | Auto (partidos) | Medio periodístico |

## Método

- Análisis de documento restringido a **información pública fácilmente accesible** al usuario final (websites de las VAAs y sus instituciones). No consultan literatura académica sobre las VAAs — deliberadamente, porque el usuario común no la lee.
- Cada sub-requisito puntuado 0-n, normalizado a 1
- Score final por requisito = ratio de puntos alcanzados / totales
- Escaneo de seguridad con Qualys y Pentest Tools para R2.5-R2.6

## Resultados clave `[p.10-13]`

### Hallazgo principal `[p.13]`

> "**None of the VAAs under investigation scored highly**"

Bajos scores generalizados. Ningún VAA supera el 70% en la mayoría de requisitos. **R6 (societal well-being)** y **R7 (accountability)** son los peor cumplidos en todas.

### Ranking por requisito (mi extracción del texto)

| Req | Mejor(es) | Peor(es) | Nota |
|---|---|---|---|
| **R1** Human agency | Ninguno alto | Smartvote (0 pts) | Smartvote se describe como "neutral y puramente matemático" — los autores lo marcan como red flag `[p.13]` |
| **R2** Robustness | StemWijzer, Wahl-O-Mat | Smartvote | Smartvote tiene libs con vulnerabilidades conocidas Y guarda respuestas del cuestionario `[p.11]` |
| **R3** Privacy | Wahl-O-Mat (agencia pública, minimiza data) | Aftonbladets valkompass, HS Vaalikone (monetizan con ads) | Correlación fuerte con tipo de institución |
| **R4** Transparency | Smartvote, Wahl-O-Mat | Kieskompas What2Vote | Kieskompas tiene método bien descrito en literatura académica pero no accesible al usuario |
| **R5** Diversity | Wahl-O-Mat, StemWijzer (accesibilidad) | Todos débiles | Ningún VAA menciona diversidad de stakeholders (económica, cultural, LGBTQ+, etc.) |
| **R6** Societal | Todos bajos | — | Ningún VAA discute impacto en resultados electorales |
| **R7** Accountability | Kieskompas (auditoría anual) | Casi todos | Solo Kieskompas tiene auditoría externa de privacidad |

### Hallazgos específicos citables

- **"Recomendaciones pueden diferir hasta 90%** dependiendo de la distance function usada" (Louwerse & Rosema 2014, citado `[p.1]`).
- **Ejemplo strategic answering**: Helsingin Sanomat (HS Vaalikone) observó que al menos un partido finlandés respondió estratégicamente para "llenar un corner vacío" del mapa 2D `[p.3]`.
- **Wahl-O-Mat vs AfD** `[p.10]`: dilema ético concreto. La agencia federal alemana clasificó a la facción "Der Flügel" de la AfD como "extremismo de derecha incompatible con la Constitución". Wahl-O-Mat sigue recomendándolos pero linkea a los reportes en su FAQ. Los autores lo destacan como ejemplo bien manejado de tensión entre principios.

## Recomendaciones del paper `[p.14-15]`

**4 áreas de mejora identificadas**:

1. **Transparencia sobre la subjetividad**: reconocer explícitamente que las VAAs NO dan respuestas objetivas.
2. **Diversidad de stakeholders**: incluir minorías (culturales, económicas, LGBTQ+, geográficas) en el diseño del cuestionario.
3. **Documentación centrada en el usuario**: si el algoritmo está en GitHub pero solo lo entienden 3 personas, no cuenta.
4. **Disclosure de valores y supuestos**: reconocer que las VAAs asumen "social choice theory" y hay otros modelos de democracia (deliberativa, agonística de Mouffe).

Cita final memorable de Selbst et al. 2019 `[p.15]`:
> *"The foundations of liberal society depend on the idea that some concepts will be fundamentally contestable and will shift over time (…). To set them in stone — or in code — is to pick sides."*

## Limitaciones que el paper reconoce `[p.15]`

1. Muestra no representativa del universo VAA europeo
2. VAAs no son "AI típica" — el EGTAI puede no aplicar perfecto
3. AI ethics evoluciona rápido — el análisis puede quedar obsoleto
4. Se restringe a info pública, ignora esfuerzos internos documentados solo en literatura académica

## Ejercicio: Tinder Decisivo evaluado bajo EGTAI (mi interpretación)

**IMPORTANTE**: esto es MI aplicación del framework al proyecto, NO está en el paper. Marca como interpretación en tu tesis.

| Req | Sub-req | Cumplimiento actual | Gap |
|---|---|---|---|
| R1.1 | Human rights impact assessment previo |  No documentado | Agregar sección en README |
| R1.4 | Medidas contra overreliance |  Parcial (hay disclaimer de confianza) | Fortalecer texto |
| R2.1 | Placement verificado independientemente |  Seeds hardcodeadas sin fuente citada | Crítico — agregar trazabilidad |
| R2.4 | Evaluación de seguridad ante ataques |  Falta pentest formal | Alineado con "risk 15" del cross-check anterior |
| R2.5-R2.6 | Sin vulnerabilidades conocidas |  Depende del stack (Django + deps) | Correr Snyk/Qualys periódico |
| R3.1 | Sin data sensible identificatoria |  Anónimo por diseño | OK |
| R3.2 | No monetización de data |  Proyecto no comercial | OK |
| R3.3 | Privacy defaults |  | OK |
| R4.2 | Ver respuestas por pregunta y candidato |  Verificar en la UI | Auditar |
| R4.9 | Reconocer subjetividad del algoritmo |  Necesita explicit disclaimer | Agregar |
| R4.11 | Usuario sabe que es algorítmico |  Es obvio por el nombre "Tinder" | OK |
| R5.2-R5.4 | Stakeholder diversity en diseño |  Diseño solo por Jenny | Considerar consulta con ONGs, jóvenes, minorías |
| R5.10 | Accesibilidad para discapacidad |  WCAG 2.2 AA (Walmart rule) — verificar | Testear con screen reader |
| R5.11 | Multi-idioma |  Solo español chileno actualmente | Considerar mapudungun, inglés |
| R6.4 | Impacto en outcomes electorales |  No medido | Difícil de establecer, pero al menos declarar |
| R7.2 | Mecanismo de reporte de bugs/bias |  No visible al usuario | Agregar contact form |
| R7.5 | Auditoría externa |  | Buscar review académico |

**Interpretación mía**: Tinder Decisivo probablemente scorearía en el **rango medio-bajo** del EGTAI (~30-40%), similar a las peores VAAs del estudio. La mayor parte de los gaps son **documentales, no técnicos** — mucho se resuelve con transparency updates al README y disclaimers en la UI.

## Relevancia directa para Tinder Decisivo

### Literal del paper (defensible en tesis)

1. **Framework de auditoría estándar europeo**: el EGTAI es la referencia normativa. Aplicarlo a Tinder Decisivo le da rigor académico y credibilidad.
2. **Cita fundamental para "risk 15"** (seguridad + ética + gobernanza) que mencioné en el cross-check anterior. Este paper es la vara.
3. **Recomendaciones concretas y accionables**: las 4 áreas de mejora son un checklist directo para el proyecto.
4. **Antecedente de auditoría hostil**: si tu tesis quiere ser rigurosa, hacer una auto-auditoría bajo EGTAI y publicarla es un aporte metodológico serio.

### Inferencia mía (marcar como interpretación)

- **La tabla de compliance de Tinder Decisivo arriba** es mi lectura, no del paper. Verificá cada sub-requisito contra el código real antes de citarla.
- **Chile no tiene un análogo formal del AI Act europeo (aún)**. La Ley 19.628 de datos personales aplica, pero el vacío regulatorio para VAAs es real. Es interesante como contribución de tesis proponer un adaptar EGTAI al contexto chileno.
- **El paper deliberadamente ignora info académica del developer**. Esto es una elección metodológica dura — si aplicás lo mismo a Tinder Decisivo, tu tesis misma no cuenta como documentación pública. Habría que producir docs orientadas al usuario.

## Verificación

Todas las citas son verbatim del texto. Los sub-requisitos de las 7 áreas están completos en Tabla A4 del paper original. Texto completo en `_s10676.txt` en el workspace.
