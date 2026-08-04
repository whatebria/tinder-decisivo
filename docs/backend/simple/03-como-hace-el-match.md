# 03 - Como hace el match

> **Para quien**: alguien que quiere entender el algoritmo sin matematicas.
> **Para que sirve**: explicar "por que me sale 78% con este candidato" sin
> abrir el codigo.

Para la version tecnica con formulas, ver [`../tecnico/04-algoritmo-matching.md`](../tecnico/04-algoritmo-matching.md).

---

## La idea en una frase

**El match mide cuanto se parecen tus respuestas a las posturas del candidato,
dandole mas peso a los temas que te importan.**

Es un porcentaje entre 0% y 100%. Mientras mas alto, mas coinciden.

---

## Como se compara respuesta a respuesta

Todas las preguntas usan la misma escala de 5 opciones:

| Opcion | Valor |
|---|---:|
| Muy de acuerdo | 5 |
| De acuerdo | 4 |
| Neutral | 3 |
| En desacuerdo | 2 |
| Muy en desacuerdo | 1 |

### Por pregunta:

1. Se mira **cuanto se aleja** tu respuesta de la del candidato.
2. Si respondieron **igual** (misma opcion) -> **100% de coincidencia** en esa pregunta.
3. Si respondieron **totalmente opuesto** (uno "muy de acuerdo", el otro "muy en desacuerdo") -> **0% de coincidencia**.
4. Distancias intermedias tienen un puntaje entre 0 y 1.

**Importante**: la penalizacion no es lineal. Los desacuerdos "extremos" duelen
mucho mas que los parciales. Estar en polos opuestos es mucho peor que estar
"neutral vs de acuerdo".

Ejemplos:

| Tu respuesta | Candidato | Coincidencia |
|---|---|---:|
| Muy de acuerdo | Muy de acuerdo | 100% |
| Muy de acuerdo | De acuerdo | 94% |
| Muy de acuerdo | Neutral | 75% |
| Muy de acuerdo | En desacuerdo | 44% |
| Muy de acuerdo | Muy en desacuerdo | 0% |

---

## Cuanto te importa cada tema

Cuando respondes una pregunta, tambien indicas **que tan importante es** para ti:

- No me importa
- Poco importante
- Importante (default en la app)
- Muy importante ("dealbreaker")

Eso multiplica el peso de esa pregunta en el match:

| Importancia | Multiplicador |
|---|---:|
| No me importa | x0.5 |
| Poco importante | x1 |
| Importante | x1.5 |
| Muy importante | x2 |

Si dijiste "muy importante" en un tema donde el candidato piensa lo opuesto,
eso baja mucho tu porcentaje con esa persona. Si el desacuerdo es en un tema
donde dijiste "no me importa", casi no afecta.

**Nota**: "No me importa" **no es cero**: la pregunta sigue contando un
poquito. Si no te importa DE VERDAD y no querias que contara, mejor usa la
opcion "No lo se" (que se excluye del calculo).

---

## Como se llega al porcentaje final

1. Se suman todas las coincidencias de cada pregunta.
2. Cada una se pondera por su importancia (multiplicador).
3. Se divide por el peso total.
4. Se multiplica x 100.

En palabras: es un **promedio ponderado** de tus coincidencias.

Ejemplo simplificado:

| Pregunta | Coincidencia | Importancia | Aporte |
|---|---:|---|---:|
| Salud publica | 100% | Muy importante (x2) | 200 |
| Impuestos | 75% | Importante (x1.5) | 112 |
| Medio ambiente | 50% | Poco (x1) | 50 |
| Politica exterior | 0% | No me importa (x0.5) | 0 |
| **Total** | | Peso: 5 | 362 |

Match final: **362 / (5 * 100) = 72,4%**

---

## Nivel de confianza

Cuantas mas preguntas hayas respondido, mas confiable es el porcentaje.

| Preguntas respondidas | Etiqueta |
|---:|---|
| < 5 | Tentativa (te falta responder mas) |
| 5 - 9 | Media |
| >= 10 | Alta |

La app muestra la etiqueta al lado del porcentaje. Un 90% "tentativo" puede
cambiar mucho al responder mas preguntas.

---

## Filtro territorial

Antes de calcular el match, el sistema **filtra** los candidatos a los que
puedes votar segun donde vives:

- Si eres de **Nunoa**:
  - Ves los **alcaldes de Nunoa** (nunca los de Providencia).
  - Ves los **diputados del Distrito 10** (el que contiene Nunoa).
  - Ves los **presidenciales** (son nacionales).

Si aun no seteaste tu comuna en el perfil, ves a **todos** los candidatos.
Sirve para explorar la app antes de registrarte del todo.

**Escalable a futuro**: cuando se agreguen senadores (elegidos por region) o
consejeros regionales (por circunscripcion), el filtro los incluye
automaticamente segun tu jerarquia territorial (comuna -> distrito -> region
-> nacional).

---

## Preguntas "no lo se"

Algunas preguntas tienen la opcion "No lo se / No opinion". Cuando la marcas:

- Esa pregunta se **excluye** del calculo (como si no la hubieras respondido).
- No cuenta ni para bien ni para mal.

Es distinto de "no me importa": "no me importa" cuenta pero poco, "no lo se"
no cuenta.

---

## Preguntas base y por tipo

Hay dos tipos de preguntas:

- **Base (transversales)**: aplican a todas las elecciones. Ej. "El Estado
  deberia intervenir mas en la economia". La respondes una vez y cuenta para
  presi, dip y alcalde.
- **Por tipo especifico**: ej. una pregunta sobre alcaldes solo aplica al
  calcular match para alcaldes.

Cuando pides tu match para "Alcaldes 2024", el sistema junta:
- Tus respuestas a las preguntas de tipo "Alcaldes 2024".
- Tus respuestas a las preguntas **base**.
- Compara con las posturas del candidato en esas mismas preguntas.

---

## Se puede rehacer el cuestionario?

Si. En la app hay un boton "Reiniciar cuestionario". Al usarlo:

- Se **borran** tus respuestas para ese tipo de eleccion.
- Se **borran** los matches ya calculados para ese tipo.
- **NO se borran**: favoritos, descartados, decision final, ni datos de otros
  tipos de eleccion.

Motivo: cambiar de opinion sobre preguntas no deberia hacerte perder los
candidatos que ya te interesaron.

---

## Editar una respuesta puntual

Si cambias UNA respuesta:

- Se actualiza en la DB.
- Se marcan como "invalidos" los matches del mismo tipo de eleccion.
- La proxima vez que abras Resultados, se **recalculan**.

O sea: no rompes nada, solo esperas un instante extra la proxima vez.

---

## Siguiente lectura

- [`01-que-hace-el-backend.md`](01-que-hace-el-backend.md) - vision general del sistema.
- [`../tecnico/04-algoritmo-matching.md`](../tecnico/04-algoritmo-matching.md) - la version con formulas.
- [`../../algoritmo-simple.md`](../../algoritmo-simple.md) - otra explicacion no tecnica alternativa.
