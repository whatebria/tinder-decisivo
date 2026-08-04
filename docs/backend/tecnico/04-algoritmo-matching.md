# 04 - Algoritmo de Matching

> **Para quien**: devs que quieren entender (o modificar) el corazon del sistema.
> **Para que sirve**: entender que hace `services/matching.py`, por que las decisiones.

Nota: para la version conceptual sin codigo, ver [`../simple/03-como-hace-el-match.md`](../simple/03-como-hace-el-match.md).
Para la version conceptual con formula, ver [`../../algoritmo-tecnico.md`](../../algoritmo-tecnico.md).

---

## Idea general

El match es un porcentaje 0-100 que mide **cuanto se parecen las respuestas
del usuario a las posturas del candidato**, ponderado por cuanto le importa
cada tema al usuario.

Formula base por pregunta:

```
diff  = |valor_user - valor_candidato|                # 0..4 en escala Likert 1..5
score = 1 - (diff / 4)^2                              # 0..1 (cuadratico, penaliza mas los extremos)
peso  = PESO_MULTIPLIERS[user.peso]                   # 0.5, 1.0, 1.5, 2.0

contribucion = score * peso
```

Match final:

```
match_percentage = (sum(contribuciones) / sum(pesos)) * 100
```

---

## Tabla de valores

### Score por diferencia (`score_pregunta`)

| diff | score |
|---:|---:|
| 0 | 1.0000 |
| 1 | 0.9375 |
| 2 | 0.7500 |
| 3 | 0.4375 |
| 4 | 0.0000 |

Es **cuadratico** intencional: castigar mas los desacuerdos totales que los parciales.

### Multiplicador por peso del usuario (`PESO_MULTIPLIERS`)

| Peso declarado | Codigo | Multiplicador |
|---|---:|---:|
| No me importa | 0 | 0.5x |
| Poco importante | 1 | 1.0x |
| Importante (default UX) | 2 | 1.5x |
| Muy importante (dealbreaker) | 3 | 2.0x |

Notar que **"No me importa" NO es cero**: la pregunta sigue contando la mitad. Justificacion:
si el user dice "no me importa" pero contesto algo, esa senal sigue teniendo valor. Poner 0
haria que responder "no me importa" fuera equivalente a `es_no_se`, y no queremos eso.

**Default UX vs default modelo**: el frontend envia siempre `peso=2` (Importante) al crear
una respuesta (`DEFAULT_PESO = 2` en `services/cuestionario.ts`). El modelo backend tiene
`default=PESO_POCO (1)` como fallback a nivel DB — en la practica nunca se usa porque el
frontend siempre envia el peso explicitamente.

### Confianza por # de preguntas respondidas (`confianza_por_n`)

| N preguntas consideradas | Confianza |
|---:|---|
| < 5 | tentativa |
| 5..9 | media |
| >= 10 | alta |

Constantes en `services/matching.py`: `CONFIANZA_UMBRAL_MEDIA = 5`, `CONFIANZA_UMBRAL_ALTA = 10`.

---

## Arquitectura del modulo

```
services/matching.py
|
|-- Constantes: MAX_DIFF_ESCALA, PESO_MULTIPLIERS, CONFIANZA_UMBRAL_*
|
|-- Helpers puros (fase 1: sin side effects)
|   |-- score_pregunta(diff) -> Decimal
|   |-- confianza_por_n(n) -> str
|   `-- _tipo_ids_con_base(tipo_eleccion) -> list[int]
|
|-- Filtro territorial (fase 2)
|   `-- _filtrar_candidatos_por_territorio(qs, comuna) -> qs
|
|-- Core algoritmo (fase 3: in-memory)
|   `-- _calcular_scores(user_map, tipo_eleccion, comuna) -> list[ScoreCandidato]
|
`-- Servicios publicos (fase 4)
    |-- calcular_match(user, tipo_eleccion) -> list[MatchCandidato]  # persiste
    |-- calcular_match_detalle(user, candidato) -> dict        # NO persiste
    `-- calcular_match_anonimo(respuestas, tipo, comuna) -> list     # NO persiste
```

Cada fase esta aislada y es testeable por separado.

---

## Filtro territorial polimorfico

**Escenario**: user en Nunoa hace match para "Alcaldes 2024". ¿Que candidatos
tiene que ver? Solo los que compiten en un territorio que le corresponde:

- Alcaldes de **Nunoa** (su comuna)SI
- Diputados de **Distrito 10** (contiene a Nunoa) - SI
- Senadores de la **Region Metropolitana** (contiene a D10) - SI (futuro)
- Presidenciales (nacional) - SI
- Alcaldes de **Providencia** (misma comuna que Nunoa? NO) - NO

Antes: filtro custom `Q(comuna=nunoa) | Q(distrito=nunoa.distrito) | Q(comuna__isnull=True, distrito__isnull=True)`.
No escalaba: agregar senadores requeria migration + FK nueva + case nuevo en el filtro.

Ahora: usa **`UnidadTerritorial` jerarquica**.

```python
def _filtrar_candidatos_por_territorio(qs, comuna):
    if comuna is None:
        return qs  # guest sin comuna -> ve todo

    ut_votante = UnidadTerritorial.objects.get(codigo=f"COM-{comuna.codigo}")
    # ancestros = [distrito, region, nacional]
    ids_permitidos = {ut_votante.id} | {a.id for a in ut_votante.ancestros()}

    return qs.filter(
        Q(unidad_territorial__isnull=True)               # nacional puro (presi)
        | Q(unidad_territorial_id__in=ids_permitidos)     # matchea con votante o sus ancestros
    )
```

**Ventaja**: para agregar senadores, basta crear candidatos con
`unidad_territorial=<UT-regional>`. El filtro los detecta automatico porque
la region es ancestro de la comuna del votante.

Ver `02-modelos.md#unidadterritorial` y `07-migraciones.md#refactor-territorio-polimorfico`.

---

## Fase por fase del algoritmo

### Paso 1: preparar `user_map`

Diccionario `{pregunta_id: (valor_usuario, peso_multiplicador, eje_tematico)}`.

Se filtran las respuestas `es_no_se=True` (no se cuentan en el match).

### Paso 2: filtrar candidatos por tipo + territorio

```python
candidatos_qs = Candidato.objects.filter(tipos_eleccion=tipo_eleccion)
candidatos_qs = _filtrar_candidatos_por_territorio(candidatos_qs, comuna_usuario)
candidatos = candidatos_qs.prefetch_related("posturas_candidato")
```

`prefetch_related` evita el N+1 clasico.

### Paso 3: iterar candidatos y calcular score

Para cada candidato:

```python
for postura in candidato.posturas_candidato.all():
    info = user_map.get(postura.pregunta_id)
    if info is None:
        continue  # user no respondio esta pregunta

    valor_user, peso_mult, eje = info
    diff = abs(valor_user - postura.opcion_respuesta.valor)
    score = score_pregunta(diff)
    contribucion = score * peso_mult

    score_total += contribucion
    peso_total  += peso_mult
    breakdown[eje] += (contribucion, peso_mult, 1)
```

Al final:

```python
match_percentage = (score_total / peso_total * 100).quantize(Decimal("0.01"))
```

### Paso 4: sort por coverage_score y devolver

Los resultados se ordenan **descendente** por `coverage_score`, con `match_percentage` como desempate secundario:

```python
resultados.sort(
    key=lambda r: (
        float(r["match_percentage"]) * math.log1p(r["num_preguntas_consideradas"]),
        float(r["match_percentage"]),
    ),
    reverse=True,
)
```

**Por que no ordenar por `match_percentage` directo?** Un candidato con 1 pregunta de overlap perfecta (100% raw) superaria a uno con 12 preguntas al 93%. El usuario veria primero al candidato del que casi no sabemos nada.

**`coverage_score = match_percentage * log(1 + n)`**: penaliza candidatos con poca cobertura sin distorsionar el porcentaje visible. Ejemplos:

| n (overlap) | match% | coverage_score |
|---:|---:|---:|
| 1 | 100% | 69.3 |
| 2 | 93% | 102.3 |
| 12 | 93% | 238.5 |

El `coverage_score` es **interno**: no se serializa ni se muestra al usuario. La incertidumbre se comunica via el campo `confianza` y el banner de ResultadosScreen cuando `confianza == "tentativa"`.

---

## Tipos base (`es_base=True`)

Un `TipoEleccion` puede marcarse como `es_base=True`. Sus preguntas son
**transversales**: aplican a **TODAS** las elecciones.

Uso: preguntas ideologicas generales que el user responde UNA SOLA VEZ,
y cuentan tanto para Presidencial como Diputados como Alcaldes.

Implementacion en `_tipo_ids_con_base(tipo_eleccion)`:

```python
def _tipo_ids_con_base(tipo_eleccion):
    base_ids = TipoEleccion.objects.filter(es_base=True).values_list("id", flat=True)
    return list({tipo_eleccion.id, *base_ids})
```

Luego `.filter(pregunta__tipo_eleccion_id__in=tipo_ids)`.

---

## Variantes publicas

### `calcular_match(user, tipo_eleccion)` (auth)

- Lee respuestas persistidas de `RespuestaUsuario`.
- Usa `user.profile.comuna` para filtro territorial.
- Persiste resultado en `MatchCandidato` (update_or_create).
- Retorna `list[MatchCandidato]` ordenado desc.
- Devuelve `None` si el user no respondio nada valido.

### `calcular_match_anonimo(respuestas, tipo, comuna)` (guest)

- Recibe respuestas en el request body (no lee DB).
- No persiste nada.
- Recibe `comuna` opcional (para filtro).
- Retorna `list[ScoreCandidato]` (dict in-memory).
- Fail-safe: ignora silenciosamente respuestas con pregunta/opcion invalidas.

### `calcular_match_detalle(user, candidato)` (auth, para UI)

- Devuelve el desglose **pregunta-a-pregunta** del match user vs candidato.
- Usado por la pantalla "por que X% de match".
- Cada item incluye: pregunta, eje, valores/textos de ambos, diff, score, peso, contribucion, `coincide` (bool).
- Ordenado por contribucion desc (mas influyentes arriba).
- Incluye tipos base ademas de los tipos del candidato.

---

## Complejidad

Sea `C` = candidatos, `P` = preguntas del user, `Q` = posturas por candidato.

- **Filtro territorial**: 1 query + `ancestros()` (walk O(depth) = 4 max).
- **Prefetch posturas**: 1 query extra en total (no por candidato).
- **Bucle in-memory**: `O(C * Q)`. Con C=1200 y Q=15 promedio = 18000 ops. Trivial.
- **DB writes** (variante auth): 1 `update_or_create` por candidato considerado = hasta `C` upserts.

En dev con 1200 candidatos: <200ms full round-trip.

---

## Testing

Tres archivos cubren este modulo:

- `test_services_matching.py` - happy paths, edge cases, peso 0/3, es_no_se.
- `test_matching_territorial.py` - filtro polimorfico, escenario Nunoa/Providencia/D10.
- `test_match_anonimo.py` - variante guest, fail-safe.
- `test_match_detalle.py` - endpoint de breakdown pregunta-a-pregunta.

Todos usan la fixture `escenario_territorial` (definida al inicio del archivo) que crea:
- Comuna Nunoa + Providencia + Distrito 10 (via `seed_chile`).
- 4 candidatos: presi nacional, alcalde de Nunoa, alcalde de Providencia, diputado D10.
- 1 pregunta + 5 opciones + posturas para todos.

Los tests reservan `unidad_territorial` explicito al crear candidatos manuales
(no hay signal auto-sync desde v2 del refactor territorial).

---

## Siguiente lectura

- `05-servicios.md` - las otras services (respuestas, password_reset, perfil).
- `07-migraciones.md#refactor-territorio-polimorfico` - historia del refactor UT.
- `../simple/03-como-hace-el-match.md` - version sin ecuaciones para audiencia general.
