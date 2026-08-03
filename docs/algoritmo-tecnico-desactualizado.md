# Algoritmo de matching — documentacion tecnica

> Explicacion detallada del algoritmo que rankea candidatos segun las respuestas del usuario.
> Audiencia: desarrolladores, contribuidores, revisores tecnicos.

---

## Objetivos de diseno

El algoritmo debe:

1. **Ser interpretable**: un usuario debe poder entender por que un candidato ranquea alto o bajo
2. **Ser robusto a data incompleta**: si el usuario responde "No se" o si un candidato no tiene postura sobre una pregunta, el resultado debe seguir siendo utilizable
3. **Penalizar diferencias grandes mas que diferencias pequenas** (no-linealidad)
4. **Reflejar la importancia relativa** que el usuario asigna a cada tema (pesos)
5. **Ser transparente sobre su propia confianza**: no debe presentar un match basado en 2 preguntas con el mismo peso que uno basado en 12
6. **Descomponerse por eje tematico** para visualizacion en radar

---

## Modelo de datos relevante

```
User (Django auth)
  |
  +--< RespuestaUsuario
         - opcion_elegida (FK OpcionRespuesta)
         - peso (0..3)
         - pregunta (FK Pregunta)

Pregunta
  - texto
  - eje_tematico (ECONOMIA | SOCIEDAD | AMBIENTE | SEGURIDAD | DDHH | INTERNACIONAL | INSTITUCIONAL | OTRO)
  - explicacion (para el modal educativo)
  - repercusiones (JSON con 5 dimensiones)
  |
  +--< OpcionRespuesta
         - valor (1..5 en Likert, o especial es_no_se=True)
         - texto

Candidato
  |
  +--< PosturaCandidato
         - pregunta (FK)
         - opcion_respuesta (FK) ← indica que valor Likert defiende el candidato
         - justificacion + fuente_url

MatchCandidato (persistido, se recomputa en cada POST /match-candidatos/)
  - user + candidato (unique together)
  - match_percentage_value
  - num_preguntas_consideradas
  - breakdown_por_eje (JSON)
  - confianza (TENTATIVA | MEDIA | ALTA)
```

---

## Constantes del algoritmo

Todas viven en `backend/core/views.py`:

```python
MAX_DIFF_ESCALA = Decimal("4")   # diff maximo posible entre 2 opciones Likert (5 - 1)

PESO_MULTIPLIERS = {
    0: Decimal("0.5"),   # PESO_NO_IMPORTA (cuenta la mitad, no cero)
    1: Decimal("1.0"),   # PESO_POCO (neutro, default)
    2: Decimal("1.5"),   # PESO_MEDIO
    3: Decimal("2.0"),   # PESO_MUCHO (dealbreaker efectivo)
}

CONFIANZA_UMBRAL_MEDIA = 5
CONFIANZA_UMBRAL_ALTA = 10
```

---

## Formula por pregunta

### Score no-lineal

Dada una respuesta del usuario con valor `v_u ∈ [1, 5]` y una postura del candidato con valor `v_c ∈ [1, 5]`:

```
diff       = |v_u - v_c|                         ∈ [0, 4]
normalized = diff / 4                            ∈ [0, 1]
score      = 1 - normalized²                     ∈ [0, 1]
```

Tabla completa de valores:

| diff | normalized | score  | interpretacion |
|-----:|-----------:|-------:|----------------|
| 0    | 0.00       | 1.0000 | acuerdo total (100%) |
| 1    | 0.25       | 0.9375 | diferencia pequena — apenas penalizada |
| 2    | 0.50       | 0.7500 | diferencia moderada |
| 3    | 0.75       | 0.4375 | diferencia grande — fuertemente penalizada |
| 4    | 1.00       | 0.0000 | oposicion total (0%) |

**Por que no-lineal**: una diferencia lineal `1 - diff/4` daria `[1.0, 0.75, 0.5, 0.25, 0.0]`, tratando diferencias moderadas como si fueran casi iguales que oposiciones parciales. La forma cuadratica refleja mejor la intuicion de que "estar en el medio" no equivale a "estar cerca" del usuario.

### Ponderacion por peso

```
score_ponderado = score × PESO_MULTIPLIERS[peso_declarado_por_user]
```

El peso lo elige el usuario en el cuestionario (`No me importa` / `Poco importante` / `Importante` / `Muy importante`).

**Decision de diseno**: `PESO_NO_IMPORTA` es `0.5x`, no `0.0x`. Si un usuario dijo "no me importa" pero respondio la pregunta, su respuesta sigue conteniendo informacion — solo la contamos menos. Poner `0.0x` haria que la pregunta desaparezca del calculo, lo que es contraintuitivo cuando la usuaria si dio una opinion.

---

## Formula global

### Match total

Para cada candidato:

```
Sea Q = { preguntas donde el user respondio (no "No se") ∩ preguntas donde el candidato tiene postura }

score_total = Σ_{q ∈ Q}  score_q × peso_multiplier_q
peso_total  = Σ_{q ∈ Q}  peso_multiplier_q

porcentaje  = (score_total / peso_total) × 100     si peso_total > 0
            = 0.00                                  si peso_total = 0
```

El porcentaje se cuantiza a 2 decimales con `Decimal.quantize(Decimal("0.01"))` para evitar problemas de precision flotante.

### Breakdown por eje tematico

Se computa el mismo promedio ponderado pero **por eje**:

```python
breakdown_acc[eje] = [Σ score_ponderado, Σ peso, count]

breakdown[eje] = {
    "porcentaje": (Σ score_ponderado / Σ peso) × 100  si peso > 0 else 0,
    "preguntas": count
}
```

Esto es lo que consume el radar chart en el frontend: 7 valores (uno por eje), cada uno entre 0 y 100.

### Nivel de confianza

```python
def _confianza_por_n(n: int) -> str:
    if n >= 10:  return "ALTA"
    if n >= 5:   return "MEDIA"
    return "TENTATIVA"
```

Depende **solo del numero de preguntas consideradas**, no del porcentaje. Un match de 90% basado en 3 preguntas es `TENTATIVA`. Un match de 55% basado en 12 preguntas es `ALTA`.

**Por que separado**: el porcentaje mide *que tan de acuerdo estan*. La confianza mide *que tan seguros estamos de esa medicion*. Son cosas independientes que el usuario debe poder ver por separado.

---

## Flujo completo del algoritmo

Codigo real en `backend/core/views.py::_calcular_match()`:

1. **Cargar respuestas del usuario** para el `TipoEleccion` dado, con `select_related` sobre `opcion_elegida` y `pregunta`
2. **Filtrar** las respuestas donde `opcion_elegida.es_no_se == True`
3. Si no quedan respuestas validas → retornar `None`
4. **Construir un dict** `{pregunta_id: (valor_usuario, peso_multiplier, eje_tematico)}` en memoria
5. **Cargar candidatos** para el `TipoEleccion` con `prefetch_related` sobre `posturas_candidato` (y sus FKs)
6. Para cada candidato:
   1. Iterar sus posturas
   2. Skippear las que no coinciden con preguntas respondidas por el usuario
   3. Computar `diff`, `score`, `score_ponderado`
   4. Acumular `score_total`, `peso_total`, `considered`
   5. Acumular tambien en `breakdown_acc[eje]`
   6. Computar `porcentaje` y `breakdown` finales
   7. `update_or_create` del `MatchCandidato` con la data
7. Ordenar la lista desc por `match_percentage_value`
8. Retornar la lista de `MatchCandidato`

---

## Ejemplo trazado end-to-end

**Setup**: usuario con 3 respuestas, un candidato con 3 posturas.

| Pregunta | Eje | v_user | peso_user | mult | v_cand | diff | score  | score_pond |
|----------|-----|-------:|----------:|-----:|-------:|-----:|-------:|-----------:|
| P1 IMU   | ECO | 5      | 3 (mucho) | 2.0  | 4      | 1    | 0.9375 | 1.8750     |
| P2 Impuestos | ECO | 2  | 1 (poco)  | 1.0  | 5      | 3    | 0.4375 | 0.4375     |
| P3 Aborto | DDHH | 4     | 2 (medio) | 1.5  | 5      | 1    | 0.9375 | 1.4063     |

**Totales**:
- `score_total = 1.8750 + 0.4375 + 1.4063 = 3.7188`
- `peso_total  = 2.0 + 1.0 + 1.5 = 4.5`
- `porcentaje  = 3.7188 / 4.5 × 100 = 82.64%`
- `considered  = 3` → confianza = `TENTATIVA` (menos de 5)

**Breakdown**:
- `ECO`: `(1.8750 + 0.4375) / (2.0 + 1.0) × 100 = 77.08%` con `preguntas: 2`
- `DDHH`: `1.4063 / 1.5 × 100 = 93.75%` con `preguntas: 1`

El usuario ve: **82.64% match, confianza tentativa**, y en el radar 77% en Economia y 93% en DDHH.

---

## API contract

### Request

```http
POST /api/v1/match-candidatos/
Authorization: Token <user-token>
Content-Type: application/json

{ "tipo_eleccion_id": 1 }
```

### Response 200

```json
[
  {
    "id": 42,
    "candidato": 3,
    "candidato_nombre": "Franco Parisi",
    "match_percentage_value": "83.79",
    "match_percentage_display": "83.79%",
    "num_preguntas_consideradas": 11,
    "breakdown_por_eje": {
      "ECONOMIA": {"porcentaje": 91.67, "preguntas": 3},
      "SOCIEDAD": {"porcentaje": 75.00, "preguntas": 2},
      "AMBIENTE": {"porcentaje": 80.00, "preguntas": 1}
    },
    "confianza": "ALTA"
  },
  ...
]
```

Lista ordenada descendentemente por `match_percentage_value`.

### Errores

| Codigo | Cuando |
|--------|--------|
| 400 | Falta `tipo_eleccion_id` |
| 401 | Sin token o token invalido |
| 404 | `tipo_eleccion_id` no existe |
| 200 con `[]` | Usuario no respondio ninguna pregunta valida |

---

## Complejidad computacional

Sea `N = numero de candidatos`, `M = numero de preguntas respondidas por el usuario`.

- **Cargar respuestas**: `O(M)` con un solo query (select_related evita N+1)
- **Cargar candidatos + posturas**: `O(N × M)` en el peor caso, con `prefetch_related` en 1 query adicional
- **Iterar candidatos × posturas**: `O(N × M)` (lookup en dict es `O(1)`)
- **Sort final**: `O(N log N)`
- **Persistencia**: `N` UPSERTs

**Total**: `O(N × M + N log N)` con `O(1 + 1 + N)` queries a la DB (las N son los `update_or_create`).

Para el caso actual (`N = 6`, `M = 12`), el algoritmo corre en milisegundos.

**Optimizacion futura** si `N` crece a cientos: reemplazar los N `update_or_create` con un `bulk_update` o `bulk_create` con `update_conflicts=True`.

---

## Decisiones y edge cases

### "No se" del usuario

Se excluye completamente del calculo. El usuario declaro no tener opinion, entonces esa pregunta no aporta senal ni positiva ni negativa. Se implementa filtrando por `opcion_elegida.es_no_se == True` antes de armar el dict de respuestas.

### Candidato sin postura sobre una pregunta

Se skippea. No se penaliza al candidato por falta de data. Consecuencia: candidatos con menos posturas registradas pueden aparecer con `num_preguntas_consideradas` bajo, lo que reduce la confianza del match — la senal correcta.

### Peso "No me importa" con respuesta dada

Se cuenta con multiplicador `0.5x` (no `0.0x`). Racional en la seccion "Ponderacion por peso".

### Usuario no respondio nada valido

Retorna `None`. La vista responde con lista vacia (200 + `[]`). El frontend muestra "todavia no hay respuestas".

### Empate en porcentaje

`sort` es estable en Python (Timsort). Los empatados quedan en el orden que devuelve el ORM. **Mejora futura**: desempatar por `num_preguntas_consideradas` desc (mas preguntas = mas confianza).

### Precision numerica

Se usa `Decimal` en todo el calculo, no `float`. Evita errores tipo `0.1 + 0.2 = 0.30000000000000004`. Al final se cuantiza a 2 decimales.

### Idempotencia

El endpoint es `POST` porque persiste `MatchCandidato`. En un futuro se podria hacer `GET` con cache y recompute lazy — pero por ahora `POST` es honesto sobre que hay side effect.

---

## Ubicacion en el codigo

- **Constantes**: `backend/core/views.py` (top del archivo)
- **Funciones puras**: `_score_pregunta`, `_confianza_por_n` en `backend/core/views.py`
- **Orquestador**: `_calcular_match(user, tipo_eleccion)` en `backend/core/views.py`
- **Endpoint**: `MatchCandidatoViewSet.match_candidatos` en `backend/core/views.py`
- **Modelo persistido**: `MatchCandidato` en `backend/core/models.py`
- **Serializer**: `MatchCandidatoResultSerializer` en `backend/core/serializers.py`

---

## Tests relevantes

`backend/tests/test_match.py` cubre:
- Sin respuestas → response vacia
- Todas respuestas con "No se" → response vacia
- Match perfecto (todas las opciones iguales) → 100.00%
- Match perfecto opuesto (diff=4 en todas) → 0.00%
- Peso 0 vs peso 3 en la misma pregunta → cambia el ranking
- Confianza baja con 3 preguntas, alta con 10+
- Breakdown suma correcta por eje

Correr con: `uv run pytest backend/tests/test_match.py -v`.

---

## Referencias y trabajos similares

- **VoteMatch / VAAs (Voting Advice Applications)**: la literatura politologica sobre matchers electorales cubre la eleccion entre metricas de agreement (city-block, Euclidean, correlacion). Este algoritmo usa una version cuadratica de city-block ponderada — simple, interpretable, sesgada hacia penalizar diferencias grandes.
- **StemWijzer (Holanda)**, **Wahl-O-Mat (Alemania)**: precedentes de matchers oficiales con decadas de uso. Sus algoritmos son publicos y similares en espiritu.

---

_Ultima revision: 2026-07-25 (post sprint 7)._
