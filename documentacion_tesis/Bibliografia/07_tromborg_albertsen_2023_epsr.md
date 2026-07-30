# 07 - Tromborg & Albertsen (2023): Candidates, voters, and voting advice applications

## Datos bibliograficos (verificados)

- **Autores**: Mathias Wessel Tromborg (Aarhus University, Department of Political Science) y Andreas Albertsen (Aarhus University, Centre for the Experimental-Philosophical Study of Discrimination + Department of Political Science, Aarhus BSS).
- **Titulo**: "Candidates, voters, and voting advice applications".
- **Revista**: *European Political Science Review*, **15(4)**, 582-599.
  - El footer del PDF dice literalmente "European Political Science Review (2023), 15, 582 – 599".
  - Bachmann et al. (2026) al citarlo confirma **15(4)** como issue number.
- **Ano**: recibido sep 2022, revisado dic 2022, aceptado marzo 2023, primera publicacion online 14 de abril 2023.
- **DOI**: 10.1017/S1755773923000103.
- **Publisher**: Cambridge University Press / European Consortium for Political Research.
- **Tipo**: articulo empirico con diseno within-subject (experimento cuasi-natural, NO un RCT clasico).
- **Open Access**: si (CC BY 4.0).

## Que aporta

Estudio empirico sobre efectos de VAAs **basadas en candidatos** (no solo en partidos). Aborda la brecha entre:
- **Estudios observacionales** que estiman efectos grandes (probablemente inflados por endogeneidad).
- **RCTs experimentales** que encuentran efectos nulos en promedio (probablemente subestimados por no distinguir entre advice congruente e incongruente).

**Aporte metodologico**: diseno **within-subject** (los mismos usuarios responden intencion de voto **antes y despues** de usar la VAA real, en la misma sesion) usando un VAA real (Altinget) durante la eleccion danesa 2019.

## Marco teorico

**Ecological rationality heuristic framework** (Gigerenzer & Gaissmaier 2011; Fortunato et al. 2019, 2021):

Los votantes en entornos complejos usan reglas heuristicas cuando:
1. El costo de informacion es **bajo**.
2. La regla es **simple** de aplicar.
3. La inferencia es **accurate en promedio**.

Los autores argumentan que VAAs de candidatos cumplen las tres condiciones:
- Bajo costo: minutos vs horas de leer noticias/debates.
- Simple: mapear el ranking a una decision.
- Accurate: candidatos son posicionados por si mismos y suelen mantener sus posiciones tras electos (Fivaz et al. 2014, Ilmarinen et al. 2022).

**Implicacion**: los votantes con **menor acceso a informacion alternativa** deberian ser mas influenciados por VAAs.

## Hipotesis (7 total, extraidas del paper)

### Vote switching entre partidos

- **H1**: usuarios que reciben advice menos party-congruent son mas propensos a abandonar su intencion de voto previa.
- **H2**: usuarios con **menor interes politico** son mas afectados por el advice.
- **H3**: usuarios que **NO se identifican con su pre-VAA party** son mas afectados por el advice.
- **H4**: si el usuario cambia de partido, tiende a cambiar a un partido congruente con el advice.
- **H5**: usuarios indecisos son mas propensos a cambiar a un partido congruente que usuarios con preferencia previa.

### Vote switching dentro de partidos (candidato)

- **H6**: advice party-congruent pero candidate-incongruent lleva a switch de candidato dentro del mismo partido.
- **H7**: usuarios con menor interes politico son mas afectados en su eleccion de candidato dentro-del-partido.

## Diseno del estudio

- **Contexto**: eleccion parlamentaria danesa 2019 (175 MPs, 10 distritos multi-miembro, 13 partidos, 900 candidatos).
- **VAA usado**: **Altinget's VAA** (30 preguntas, escala 1-5 con categoria intermedia oculta, algoritmo Manhattan, ~2.5M usos en la eleccion). Presenta al usuario los **5 candidatos mas congruentes de su distrito** ordenados, con el top en negrita.
- **Muestra**: 1.496 daneses reclutados via panel Dynata (con survey weights para representatividad).
- **Diseno**: within-subject en 3 partes:
  1. Pre-encuesta: interes politico, party ID, intencion de voto (partido + candidato).
  2. Redireccion al VAA real, se registra el advice.
  3. Post-encuesta inmediata: nueva intencion de voto (partido + candidato).
- **Tiempo mediano** de completar el flujo: 13 minutos (minimiza contaminacion informacional externa).

## Variables clave

- **Pre-VAA party choice**, **Undecided**, **Non-party** (blanco/independiente/otro), **Abstain**.
- **Party ID**: 0 = sin identificacion, 1 = debil, 2 = fuerte.
- **Political interest**: escala ordinal 0-3.
- **VAA advice categorias**:
  - **No advice** (party-incongruent): partido no fildea ningun candidato recomendado.
  - **Weak advice** (partial congruence): fildea uno recomendado pero no el top.
  - **Strong advice** (high congruence): fildea el candidato top (bold).

Modelo: **Linear Probability Model** con party-fixed effects y errores standard clusterizados por respondente.

## Resultados principales

### Party vote switching (H1, H2, H3)

Todas las hipotesis confirmadas:

- **H1**: usuarios con advice party-incongruent son **+16 pp** mas propensos a cambiar su intencion de voto que los que reciben strong advice. Con advice weak: **+7 pp**.
- **H2**: el efecto se **reduce 11 pp por cada nivel de interes politico**. Entre usuarios sin interes politico, el efecto llega a **+34 pp**.
- **H3**: el efecto se **reduce 10 pp por cada nivel de party identification**.

### Vote switching hacia partido recomendado (H4, H5)

- **H4** confirmada: usuarios que cambian tienden a cambiar a partidos recomendados.
- **H5** confirmada: indecisos son **+10 pp** mas propensos a cambiar a un partido con strong advice que a uno sin advice (vs +3 pp para usuarios con preferencia previa).

### Estimacion agregada del efecto en el electorado

Ajustando por propensity de usar VAA y probabilidad de recibir distintos tipos de advice:

> **3.7% de los votantes daneses actualizaron sus preferencias partidarias por VAA en 2019 = ~175.000 votantes.**

Efecto mas fuerte en votantes con "un poco" de interes politico (los sin interes no usan VAA; los muy interesados usan pero no se dejan influenciar).

### Candidate vote switching (H6, H7)

Sub-muestra: usuarios que se quedaron con su party post-advice (N=252).

- **H6** confirmada: candidate-incongruent advice reduce en **-13 pp** la probabilidad de mantener el mismo candidato pre-VAA.
- **H7** confirmada: efecto mas fuerte en votantes menos politicamente interesados.
- Party ID NO modera el efecto dentro del partido (esperado: no discrimina entre candidatos del mismo partido).

## Conclusiones y limitaciones

- Los efectos observados **reconcilian los hallazgos contradictorios** entre estudios observacionales (efectos grandes) y experimentales (efectos nulos): distinguir por congruencia del advice y por moderadores revela efectos genuinos.
- Los VAAs son un **ecologically rational cue** para votantes en sistemas multi-partidarios complejos.
- Encaja con la **teoria de Zaller**: los efectos requieren un umbral de interes politico para RECIBIR el mensaje, pero luego los menos interesados son mas ACEPTANTES.

**Limitaciones reconocidas por los autores**:
- Vote intentions, no vote choices reales (aunque post-election survey corroboro).
- Prime effect de la pregunta pre-VAA (sesgo conservador).
- Aplica a sistemas multi-partidarios complejos; menos generalizable a sistemas con pocos partidos.

---

##  INTERPRETACION PROPIA - Utilidad para Tinder Decisivo

> **Advertencia**: esta seccion NO es contenido del paper. Es lectura personal aplicada al proyecto. No citar como del autor.

1. **Chile es sistema multi-partidario complejo**: encaja con el ambito de generalizacion del estudio.

2. **Tinder Decisivo es candidate-based en la Presidencial**: este paper es EL referente para VAAs de candidatos. Cita obligada.

3. **Framework de ecological rationality**: proporciona la teoria academica para justificar POR QUE hacer una VAA.

4. **Efecto ~4% del electorado cambio voto en Dinamarca**: cifra concreta para presentar la relevancia potencial. NO se extrapola a Chile aca porque seria especulacion sin base empirica.

5. **Diseno metodologico replicable**: si en la tesis se planea medir efecto de Tinder Decisivo empiricamente, el within-subject design es el gold standard.

6. **Perfil de usuario mas afectado**: votantes con interes politico medio-bajo y sin identificacion partidaria fuerte. Este es un argumento fuerte para el potencial en Chile (baja identificacion con partidos tradicionales), aunque hay que verificarlo empiricamente antes de afirmarlo en la tesis.

7. **Advice congruence matters**: los usuarios NO cambian a partidos random - cambian a los recomendados. Relevante para el diseno de UI (mostrar ranking claramente + hero card del top match).

8. **Distincion party vs candidate switching**: en Presidencial es puro candidate; en Parlamentarias/Municipales de Tinder Decisivo hay tanto partido como candidato. Este paper da framework para analizar ambos por separado.

## Cita sugerida (APA)

> Tromborg, M. W., & Albertsen, A. (2023). Candidates, voters, and voting advice applications. *European Political Science Review*, *15*(4), 582-599. https://doi.org/10.1017/S1755773923000103
