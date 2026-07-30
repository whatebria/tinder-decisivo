# Resumen: Buryakov, Kovacs, Serdült y Kryssanov (2024)

> **Enhancing the design of voting advice applications with BERT language model**

## Ficha

- **Autores**: Daniil Buryakov, Mate Kovacs, Uwe Serdült (Ritsumeikan U + Zentrum für Demokratie Aarau), Victor Kryssanov
- **Revista**: *Frontiers in Artificial Intelligence*, vol 7:1343214
- **DOI**: 10.3389/frai.2024.1343214
- **Publicado**: 6 agosto 2024 (recibido nov 2023)
- **Tipo**: **paper CS aplicado** con case study empírico
- **Pág PDF**: 16
- **Handle interno**: `_frai.txt` (workspace)
- **Código**: https://github.com/DBurya/VAASuggestions_GIQ
- **Data**: YouTube comments + party manifestos japoneses en Mendeley Data

## Pregunta

¿Se puede automatizar (parcialmente) la formulación de policy statements para VAAs usando NLP + machine learning, para reducir la carga manual sobre los diseñadores y el sesgo por fuente única (manifestos)? `[p.1-2]`

## Contexto de literatura que el paper cita `[p.1-2]`

- **Uso de VAAs**: 10-40% del electorado europeo usa VAAs en las semanas previas a las elecciones (Garzia & Marschall 2012; Germann & Gemenis 2019).
- **Cita retomada por Velez et al. 2025**: "en promedio, ~30% de los votantes considera las recomendaciones de VAAs durante elecciones" `[p.1]`.
- **Meta-análisis Munzert & Ramirez-Ruiz 2021** citado como validación del impacto.
- **Statement quality es el core**: Lefevere & Walgrave 2014, Isotalo 2020 marcan que los statements son el componente que más afecta el output final.

## Arquitectura del sistema propuesto `[p.4-6]`

**Pipeline (aproximación 1)**:
1. Split de manifestos en oraciones (>= 40 chars)
2. **BERT topic modeling** (BERTopic + UMAP + HDBSCAN + C-TF-IDF)
3. Evaluación de número óptimo de topics con **coherence score Cv** (Röder et al. 2015)
4. Sentence-BERT embeddings (768 dims) para statements y documentos
5. **Cosine similarity** entre cada topic y cada statement VAA
6. **Threshold: cosine >= 0.5** para considerar topic-statement como relacionado
7. Top 5 oraciones más similares dentro del topic seleccionado -> sugerencia para el diseñador

**Aproximación 2** (opcional): agrega BERT extractive summarizer + k-means para documentos largos.

**Filosofía**: el sistema NO reemplaza al humano, lo asiste. Sale de la lógica "manifestos-only" hacia una lógica multi-fuente.

## Case study — Japón `[p.7-9]`

### Datos

- **VAAs fuente**: 6 japonesas (Zero Senkyo, Shimotsuke Shimbun, Japan Choice, FokusJapan, Asahi Shimbun, Mainichi Shimbun) + 2 europeas (EUandi, EUvox). **185 statements totales**.
- **Party manifestos**: 9 partidos japoneses, elecciones Upper House 2021 + 2022. **9.454 oraciones** después de limpieza.
- **YouTube comments**: 18 canales políticos japoneses (~7.6M subs total). De 6.25M comentarios raw, **2.13M** quedaron después de filtrar por fecha (ene 2021 - jul 2022) y longitud (>= 40 chars).

### Resultados del pipeline `[p.9-11]`

**Manifestos**:
- 45 topics óptimos (por Cv)
- 18% outliers (documentos sin topic asignado)
- 26 statements con match >= 0.5 -> **130 sugerencias generadas** (top 5 por statement)

**YouTube**:
- 35 topics óptimos
- 20% outliers
- 14 statements con match >= 0.5 -> **70 sugerencias generadas**

### Hallazgo empírico crítico `[p.9]`

De los 36 statements únicos derivados (24 de manifestos + 12 de YouTube), **solo 2 overlapping** entre ambas fuentes.

> **Interpretación literal del paper**: "significant disparity between the issues users discussed on social media and those political parties prioritized in their manifestos" `[p.9]`.

### Validación real-world `[p.10]`

Los resultados fueron entregados al equipo **FokusJapan** para las elecciones Upper House del 10 julio 2022. Los diseñadores decidieron INDEPENDIENTEMENTE, sin coordinación con los autores.

**Adopción**: de los 20 statements finales que usó FokusJapan, **9 estuvieron basados en sugerencias del sistema** (45% de adopción). Los otros 11 fueron manuales.

Statement con adopción cross-cultural: uno derivado del VAA europeo (statement 7 sobre reducción gradual de pensiones) `[p.10]`.

## Limitaciones que el paper reconoce `[p.13-14]`

1. **BERT es over-parametrizado** (Kovaleva et al. 2019). Modelos más eficientes existen (ELECTRA, RoBERTa, DistilBERT) pero no los usaron.
2. **Outliers pueden contener información valiosa** que se pierde en HDBSCAN.
3. **Necesita validación con más equipos de diseñadores VAA**, no solo FokusJapan.
4. **Threshold 0.5 es arbitrario** — no hay estudio de sensibilidad.
5. **Falta cobertura temática**: 14 statements representativos que el sistema NO produjo (ej: voting rights de residentes extranjeros, sucesión imperial, online voting) `[p.13, Table 8]`.
6. **Bias no eliminado**: solo reducido. El sistema puede tener sesgos del corpus fuente.

## Relevancia directa para Tinder Decisivo

### Literal del paper (defensible en tesis)

1. **Argumento metodológico para ampliar fuentes**: Tinder Decisivo hoy tiene statements hardcodeados sin trazabilidad de fuente. Este paper es la cita canónica para justificar por qué esa práctica es problemática y qué alternativa hay (manifestos + redes + petitions).
2. **Sistema reproducible con código abierto**: si Tinder Decisivo escala a mantener statements de múltiples elecciones chilenas, este pipeline es implementable. No hay que reinventar nada — BERTopic + sentence-BERT + threshold 0.5.
3. **Métrica de adopción realista**: 45% (9/20) es un benchmark empírico de cuánto pesa la asistencia AI vs. juicio humano. Útil para setear expectativas.
4. **Advertencia obligatoria**: el paper admite que el sistema NO elimina el trabajo humano ni el sesgo. Cualquier defensa de Tinder Decisivo debe replicar este framing honesto.

### Inferencia mía (marcar como interpretación)

- **El hallazgo de "solo 2 statements overlap entre manifestos y YouTube"** es una advertencia fuerte para Tinder Decisivo si algún día usa solo programas oficiales de candidatos chilenos: probablemente estará capturando la mitad del debate público real.
- **Aplicabilidad a Chile**: el paper enfatiza que el pipeline funciona en cualquier país con manifestos + datos sociales. Chile tiene ambos (programas presidenciales oficiales + Twitter/X + Reddit chile). Es directamente transferible. Pero esta afirmación es MI extrapolación — el paper solo validó Japón.
- **BERT en español**: el paper usa BERT en japonés. Para Chile habría que usar un modelo pre-entrenado en español (BETO, mBERT, o Llama en español). Esto es adaptación no trivial, no está en el paper.

## Cita comparativa con Velez et al. 2025

| Dimensión | Buryakov 2024 | Velez 2025 |
|---|---|---|
| Foco | **Diseño de VAAs** (asistir al equipo diseñador) | **Efectos de VAAs en usuarios** (experimentos) |
| Método AI | BERT topic modeling + cosine similarity | GPT-4/4o + RAG |
| Rol del LLM | Sugerir statements | Explicar posiciones partidarias al usuario |
| Evaluación | Adopción real por FokusJapan (45%) | RCT preregistrado con 2.888 sujetos |
| Complementarios | Sí — Buryakov es upstream (design), Velez es downstream (use) |

Los dos papers son la **evidencia técnica más actualizada** del campo. Ambos son útiles para tu tesis: Buryakov para la sección "cómo se construye la app" y Velez para la sección "qué efectos tiene".

## Verificación

Todos los datos son verbatim del texto. Texto completo en `_frai.txt` en el workspace.
