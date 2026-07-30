# Resumen: Stadelmann-Steffen, Rajski y Ruprecht (2022)

> **The role of vote advice application in direct-democratic opinion formation: an experiment from Switzerland**

## Ficha

- **Autores**: Isabelle Stadelmann-Steffen (U Bern), Hannah Rajski (U Mannheim), Sophie Ruprecht (U Bern)
- **Revista**: *Acta Politica* (2023) 58:792-818
- **DOI**: 10.1057/s41269-022-00264-5
- **Aceptado**: 4 octubre 2022 | **Publicado online**: 26 octubre 2022
- **Tipo**: **experimento RCT** con panel survey de 3 olas
- **Pág PDF**: 27
- **Handle interno**: `_s41269.txt` (workspace)

## Novedad del paper

Es el **primer estudio experimental** que evalúa VAAs en un **referéndum** (democracia directa), no en elecciones. Solo existía un estudio previo sobre Brexit (Trechsel et al. 2017), y no era experimental estricto. `[p.792, p.796]`

## Pregunta

¿Las VAAs afectan la formación de opinión individual en decisiones de democracia directa (referéndums), y a través de qué mecanismos? `[p.793]`

## Marco teórico

### 2 mecanismos distintos que el paper separa `[p.796]`

1. **Efecto de USO** (usage effect): el mero hecho de completar la VAA cambia comportamiento.
2. **Efecto de MENSAJE** (message effect): la recomendación específica que recibe el usuario cambia comportamiento.

### 2 tipos de efecto que se pueden combinar con lo anterior `[p.796]`

- **Persuasivo** (persuasive): la VAA aporta información nueva o distinta y CAMBIA la intención.
- **Intensificador** (intensifying): la VAA CONFIRMA lo que el usuario ya pensaba y refuerza su intención.

### Por qué es diferente en referéndum vs elección `[p.793]`

- En elecciones, la mayoría tiene identidad partidaria previa (partisan attachment).
- En referéndums, muchos votantes entran en **estado de "ignorancia relativa"** — no saben qué votar hasta muy tarde en la campaña.
- Por eso las VAAs pueden ser **MÁS impactantes en referéndum** que en elección.

## 5 Hipótesis testeadas

| H | Hipótesis | Efecto |
|---|---|---|
| **H1** | Usar VAA reduce la probabilidad de seguir indeciso | Usage effect |
| **H2** | Cuanto más fuerte el mensaje VAA, más probable que el usuario lo siga | Message effect |
| **H3** | Los indecisos son más afectados por el mensaje que los ya decididos | Persuasive |
| **H4a** | Congruencia mensaje-intención original refuerza la intención | Intensifying |
| **H4b** | Congruencia mensaje-partido del usuario refuerza la intención | Intensifying |
| **H5** | Incongruencia mensaje-intención aumenta probabilidad de cambio | Persuasive |

## Diseño experimental `[p.799-802]`

- **Caso**: referéndum del 21 de mayo 2017 sobre la **nueva Ley de Energía** en Suiza (resultado real: 58.2% SÍ)
- **Por qué este caso**: única votación federal ese día (no interferencia con otras campañas), y Suiza es líder mundial en democracia directa
- **Panel survey de 3 olas**:
  - Wave 1 (10 semanas antes): 2,891 respondientes
  - Wave 2 (1 mes antes): 1,841
  - Wave 3 (1 semana antes): 1,253
  - **Datos completos en las 3 olas: n=1,181**
- **Randomización en wave 3**: treatment (n=606, ve la VAA) vs control (n=575, no la ve)
- **Muestra final de análisis** (excluyendo early voters que ya votaron por correo): **n=633**, de los cuales 326 son del treatment group
- **VAA diseñada por los autores**: 10 statements sobre la ley, slider 0-100 por statement, peso por importancia (50/100/200), score final calculado como suma ponderada
- **Recolección vía Qualtrics**, cuotas por lengua/edad/género/cantón

### Fórmula del score VAA `[p.800]`

```
v = Σ(s_i * w_i) / Σ(w_i)
```
donde `s_i` es el grado de acuerdo con statement i (0-100) y `w_i` el peso de importancia (50, 100, o 200).

### Categorización asimétrica de vote intentions `[p.801]`

- < 31% de probabilidad de "sí" → codificado como **"No"**
- 31-74% → **"Undecided"**
- ≥ 75% → **"Yes"**

Umbrales asimétricos deliberadamente para controlar por sesgo de deseabilidad social.

## Resultados clave

### Resultado 1: Efecto de USO (H1) — parcial `[p.804-805]`

- **No hay efecto general** de tratamiento sobre "estar indeciso"
- **Pero SÍ hay efecto entre los originalmente indecisos**: los indecisos que usaron la VAA tuvieron **menor probabilidad** de seguir indecisos que los indecisos del grupo control (significativo p<0.1 en interacción)
- Log-odds del modelo (1d): `VAA * undecided = -0.669`, p<0.1

### Resultado 2: Efecto de MENSAJE (H2) — fuerte `[p.805-806]`

- Coeficiente OLS del score VAA sobre probabilidad final de votar "sí": **β=1.38, p<0.001** (modelo 2)
- Por cada punto adicional en el score VAA, sube 1.38 puntos la probabilidad de votar "sí" — efecto grande.
- Robusto controlando por original vote intention en wave 1, 2 o 3.

### Resultado 3: Efecto persuasivo en indecisos (H3) — parcial `[p.807]`

- Los indecisos originales muestran una **pendiente más pronunciada** entre score VAA y voto final que quienes tenían intención "sí" previa (Fig. 3).
- **Pero** los que originalmente iban a votar "no" NO son significativamente menos afectados que los indecisos — posiblemente por bajo n en ese grupo.

### Resultado 4: Efecto intensificador con congruencia (H4) — soportado `[p.808]`

Con la variable cruzada intención×VAA (Tabla 3):
- "yes & yes" (intención sí + VAA sí): **+41.36 puntos** en probabilidad final de "sí" vs indecisos ambos
- "no & no": **-48.22 puntos** — refuerzo simétrico
- Interacción con afiliación partidaria (modelos 6-7): personas con afiliación partidaria REACCIONAN MÁS FUERTE al VAA que las sin partido — hallazgo contraintuitivo.

### Resultado 5: Efecto persuasivo con incongruencia (H5) — no testeable `[p.808]`

- Grupo demasiado pequeño para inferencia estadística.
- Solo 1 respondiente en la celda "yes & no" (originalmente sí, VAA le recomienda no) — imposible testear.

### Descubrimiento adicional: percepción de relevancia `[p.807, nota 9]`

- Aunque el VAA CONFIRMÓ la intención original en la mayoría de casos:
  - **58.3%** perceptió la VAA como relevante
  - **~60%** quería considerarla al formar su opinión
  - Solo **~25%** dijo que no le importaba

**Insight**: Una VAA que confirma también genera valor percibido por el usuario — no solo cuando cambia opinión.

## Limitaciones que el paper reconoce `[p.810]`

1. Se miden **intenciones de voto**, no votos actuales
2. **Un solo referéndum, un solo país, un solo tema** (energía) — validez externa cuestionable
3. La VAA se aplicó muy cerca de la votación (últimos 7 días); no se puede medir persistencia del efecto
4. La mayoría de VAA recomendaciones coincidieron con la intención original → celda de conflicto (donde H5 sería testeable) es muy pequeña
5. No se puede diferenciar entre persuasive y intensifying en el USE effect, solo en el MESSAGE effect

## Relevancia para Tinder Decisivo

### Directo del paper (defensible en tesis)

1. **Framework conceptual de 4 cuadrantes**: `{use, message} × {persuasive, intensifying}` es aplicable directamente a Tinder Decisivo. La tesis puede reutilizar esta taxonomía para clasificar qué efectos busca vs qué efectos evita.
2. **Chile tiene democracia directa reciente**: Plebiscito Entrada 2020, Salida 2022, Salida 2023. Este paper es literalmente la evidencia empírica de por qué una VAA importa MÁS en ese contexto que en elecciones tradicionales.
3. **Efecto intensificador de la afiliación partidaria** `[p.807]`: contradice la narrativa naive de que "las VAAs son para los que no tienen partido". Los CON partido reaccionan más fuerte. Implicación de diseño: no se debe subestimar el impacto sobre votantes ya politizados.
4. **Diseño experimental replicable**: n=633, 3-wave panel, RCT con control. Es una plantilla metodológica para validar Tinder Decisivo si Jenny consigue muestra y timing.
5. **Fórmula del score explícita** `[p.800]`: sirve como benchmark para comparar el algoritmo de Tinder Decisivo. Pesos discretos 50/100/200 (o equivalentes) son defendibles bibliográficamente.
6. **Insight sobre "relevancia percibida" pese a congruencia**: el 60% valoró la VAA aunque solo confirmó su opinión — argumento fuerte para justificar valor de Tinder Decisivo incluso ante votantes decididos.

### Inferencia mía (marcar como interpretación)

- **Generalización Suiza → Chile es no-trivial**. Suiza tiene 100+ años de cultura de democracia directa; Chile está en fase de aprendizaje colectivo tras el rechazo constitucional. El efecto persuasivo podría ser INCLUSO MÁS FUERTE en Chile por menor sofisticación política agregada — pero es especulación.
- **El paper NO estudia**: elecciones parlamentarias multi-candidato (que Tinder Decisivo sí modela con "Diputados 2025"). Los hallazgos son generalizables a "sí/no" en plebiscitos, no directamente a ranking de candidatos.
- **El caso Chile podría tener resultado más ruidoso** por la volatilidad electoral y polarización pos-estallido. Timing de aplicación importa muchísimo más que en Suiza.
- **Tinder Decisivo NO tiene modo referéndum** actualmente. Si Jenny quiere apalancar este paper como sustento, agregar un modo "plebiscito" con statements sobre reformas concretas sería una expansión natural.

## Línea histórica combinada de los 5 papers

| Año | Paper | Contribución central |
|---|---|---|
| **2022** | Stadelmann-Steffen | Primer RCT de VAA en democracia directa; framework use/message x persuasive/intensifying |
| **2024** | Buryakov et al. (Frontiers AI) | Primer sistema semi-automatizado (BERT + Sentence-BERT + YouTube) para SUGERIR statements de VAA |
| **2024** | Stockinger et al. (Ethics & IT) | Primera auditoría sistemática de 7 VAAs europeas bajo el framework EGTAI de AI confiable |
| **2025** | Velez, Green & Sevi (PNAS) | Primera evaluación experimental de VAA basada en LLM (GPT-4 + RAG); "inform but seldom sway" |
| **2026** | Garzia, Marschall, Tromborg & Albertsen (PaG) | Editorial que consolida el campo con 4 dimensiones metodológicas y agenda futura |

## Verificación

Todas las citas son verbatim del PDF. Los coeficientes de regresión están tomados directamente de las Tablas 1, 2 y 3 del paper (páginas 803-806). Texto completo en `_s41269.txt` en el workspace.
