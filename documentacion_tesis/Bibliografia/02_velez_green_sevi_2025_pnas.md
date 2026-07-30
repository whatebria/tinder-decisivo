# Resumen: Velez, Green y Sevi (2025)

> **Chatbot Voting Advice Applications inform but seldom sway young unaligned voters**

## Ficha

- **Autores**: Yamil R. Velez (Columbia), Donald P. Green (Columbia), Semra Sevi (U. Toronto)
- **Revista**: PNAS 2025, vol 122 no 50, art e2515516122
- **DOI**: 10.1073/pnas.2515516122
- **Publicado**: 8 diciembre 2025
- **Tipo**: **paper empírico** — 3 experimentos randomizados preregistrados
- **Pág PDF**: 8
- **Handle interno**: `_velez2025.txt` (workspace)
- **Data + código**: https://osf.io/4pf8t/

## Pregunta

¿Un **VAA Bot conversacional con LLM + RAG** funciona mejor que una VAA estática entre jóvenes independientes (18-34, no Dem ni Rep) — el segmento que las VAAs tradicionales dejan afuera? `[p.1-2]`

## Arquitectura del VAA Bot `[p.3]`

- **LLM**: GPT-4 (studies 1-2), GPT-4o (study 3)
- **Retrieval-Augmented Generation (RAG)** para prevenir hallucinations
- **Corpus fuente**:
  - 73 party platforms estatales (39 Dem, 34 Rep)
  - 19 state voter guides 2022
  - 12 national party speeches / town halls 2020-2023
- **Embeddings**: chunks de 512 tokens, `text-embedding-ada-002` (1.536 dims)
- **Interfaz gamificada** con "unlockable dialogues"

## Diseño experimental `[p.3-4]`

- **Control**: trivia bot posando como Benjamin Franklin
- **Treatment**: VAA Bot que discute diferencias Dem vs Rep en el **"core issue"** que el usuario declara importarle más
- **Flujo**: pretest -> asignación aleatoria -> interacción -> posttest
- **Preregistrado**. IRB aprobado (U Toronto #46582 + Columbia #AAAU8869)

## Muestras `[p.3]`

| Study | N | Vendor | Fechas |
|---|---:|---|---|
| 1 | 383 | CloudResearch Connect | nov-dic 2023 |
| 2 | 505 | Prolific | ene 2024 |
| 3 | 2,000 | YouGov | oct-nov 2024 |

**Nota**: samples de conveniencia, estimaciones sin pesos.

## Resultados meta-analíticos (REML random effects) `[p.6]`

| Outcome | Efecto | 95% CI | Veredicto |
|---|---:|---|---|
| **Core issue accuracy** | **+12.7 pp** | [8.4, 17.1] | **Efecto claro y robusto** |
| General issue accuracy | +4.3 pp | [1.4, 7.1] | Efecto menor pero significativo |
| Pro-Dem affect (Dem-aligned) | -1.2 pp | [-3.0, 0.7] | **Cero** |
| Pro-Dem affect (Rep-aligned) | +1.4 pp | [-2.4, 5.3] | **Cero** |
| Vote choice (Dem-aligned) | +0.6 pp | [-4.1, 5.4] | **Cero** |
| Vote choice (Rep-aligned) | +4.0 pp | [-5.8, 13.9] | **Cero** (ancho CI) |

**Punto de calibración clave** `[p.7]`: el efecto en conocimiento del core issue (12.7 pp) es **mayor** que el gap de conocimiento entre "bachelor's degree" y "sin secundaria" en la misma muestra (11.5 pp). Efecto grande en términos absolutos.

## Engagement `[p.3]`

- 70-86% de participantes clasificados como "engaged" (clasificador: Mistral Small 3.1 24B local)
- ~3/4 hicieron 1+ follow-up questions

## Conclusión (título literal)

**"Inform but seldom sway"**:
- SI **informa** de forma clara y medible sobre las posiciones partidarias en el issue que le importa al usuario
- NO **mueve el voto** ni el afecto partidario, ni siquiera entre indecisos jóvenes con priors débiles

Los autores enmarcan esto como **evidencia contra el "issue proximity hypothesis"** en su forma fuerte `[p.7]`.

## Contexto de literatura que el paper cita `[p.2]`

- **Munzert & Ramirez-Ruiz 2021** (meta-analysis de 22 VAAs): efectos fuertes en turnout autorreportado, moderados en vote choice, **sorprendentemente pequeños en political knowledge**.
- **Tromborg & Albertsen 2023** (Danish panel 2019): usuarios que recibieron consejo incongruente con su preferencia inicial fueron **16% más propensos a cambiar el voto**. Efectos más fuertes en undecided.
- **Kamoen & Liebrecht 2020, van Veggel 2025**: CAVAAs mejoran satisfacción y conocimiento pero **no vote intentions**.
- **Advertencia crítica**: observational studies reportan efectos más grandes que experimentales, "likely because VAAs disproportionately attract politically engaged users" `[p.2]`.

## Relevancia directa para Tinder Decisivo

### Literal del paper (defensible en tesis)

1. **Setear expectativas realistas**: si tu tesis promete "cambio de voto informado", este paper es evidencia empírica en contra. Enmarcá el aporte de Tinder Decisivo como **primariamente educativo** — no como cambia-votos.
2. **RAG + programas oficiales** es una arquitectura probada. Tinder Decisivo hoy tiene seeds hardcoded; si algún día evoluciona a LLM, este paper te da el patrón exacto (chunks 512 tokens + embeddings + retrieval sobre corpus curado).
3. **Riesgo de hallucination con LLMs** `[p.3]`: incluso GPT-4o con pretesting extensivo necesitó RAG. Advertencia si sumás AI.

### Inferencia mía (marcar como interpretación)

- **Que Tinder Decisivo sea static + swipe (no chatbot) no lo hace peor**: el paper muestra que ni siquiera un chatbot con LLM + RAG mueve el voto significativamente. Lo que importa es la información entregada, no el formato conversacional. Defensa razonable de tu decisión de diseño, pero el paper NO compara static vs chatbot directamente.
- **"Core issue" con multipartidismo chileno**: el paper es US bipartidista. Aplicar el concepto de "core issue" con 5+ partidos requiere adaptación explícita, no es transferencia directa.

## Verificación

Todos los números duros son verbatim del texto. Texto completo en `_velez2025.txt`.
