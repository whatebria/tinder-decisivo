# 08 - Bachmann et al. (2026): Estimating the Recommendation Certainty in Candidate-Based VAAs

## Datos bibliograficos (verificados)

- **Autores**: Fynn Bachmann, Daan van der Weijden, Cristina Sarasua, Abraham Bernstein (Department of Informatics, University of Zurich, Suiza).
- **Titulo**: "Estimating the Recommendation Certainty in Candidate-Based Voting Advice Applications".
- **Revista**: *Politics and Governance*, vol. 14, articulo 11256.
- **Ano**: recibido agosto 2025, aceptado noviembre 2025, publicado 21 enero **2026**.
- **DOI**: 10.17645/pag.11256.
- **Issue tematico**: "Voting Advice Applications: Methodological Innovations, Behavioural Effects, and Research Perspectives" - editado por Diego Garzia, Stefan Marschall, Mathias Wessel Tromborg y Andreas Albertsen (los mismos autores de los papers 01, 06 y 07 del corpus).
- **Open Access**: si (CC BY 4.0).
- **Tipo**: articulo empirico con dos contribuciones: (1) algoritmo estadistico + (2) experimento controlado con usuarios.
- **Codigo publico**: https://github.com/fsvbach/recommendations-pag-paper
- **Financiamiento**: Swiss National Science Foundation (SNSF), grant CRSII5-205975.

## Que aporta

Aborda un problema empirico previamente ignorado: como estimar la **certeza** de la recomendacion de una VAA **cuando el usuario NO completa todas las preguntas**.

Motivacion empirica potente (datos citados del paper):
- En **Smartvote (VAA mas popular de Suiza)**, aproximadamente el **76% de los usuarios no completa el cuestionario** completo (75 preguntas).
- El **34% responde menos de 30 preguntas**.
- Media de Smartvote users: 57 preguntas antes de ver recomendaciones.

**Contribuciones**:
1. **Algoritmo estadistico** que estima la "Candidate Recommendation Accuracy" (CRA) - la superposicion entre las recomendaciones tempranas y las finales.
2. **Experimento controlado con 130 usuarios reales** probando 5 condiciones.

## Preguntas de investigacion

- **RQ1**: Con que precision el algoritmo puede estimar la certeza de la recomendacion?
- **RQ2**: Como afecta el display de la certeza al comportamiento del usuario?
- **RQ3**: Que interfaz funciona mejor para comunicar la certeza a los usuarios?

## Marco conceptual: tipos de recomendacion

- **Early recommendations (R_Q)**: candidatos mas cercanos al usuario segun las preguntas respondidas hasta el momento.
- **Predicted recommendations (R_P)**: candidatos mas cercanos si el modelo IMPUTA las respuestas faltantes.
- **Final recommendations (R_F)**: "ground truth" - candidatos cuando el usuario completa TODAS las preguntas.
- **Stable recommendations**: candidatos que estan en la interseccion de R_Q, R_P y R_F.

**CRA = overlap entre R_Q y R_F / k** (donde k es el numero de candidatos por recomendacion).

## Modelo estadistico

Adopta el approach de Potthoff (2018) y Bachmann et al. (2025):
- Modelo latente 2D aprendido de la distribucion de datos.
- Combinacion de **PCA + Logistic Regression** por pregunta.
- Cada candidato: 2 parametros (x1, x2). Cada pregunta: 3 (beta1, beta2, alpha).
- Prior gaussiano para evitar posiciones al infinito.
- Discretiza en grid 200x200 para eficiencia (<90 ms).

Dos algoritmos de imputacion:
- **One-Shot**: maximum-likelihood determinista.
- **Posterior sampling**: muestrea del posterior (1, 10, 100, 1000 muestras).

## Datos

- **Smartvote 2023 (Zurich)**: 75 preguntas, 1.029 candidatos, respuestas convertidas de Likert 4-7 a escala continua 0-1.
- Muestra representativa de **1.122 votantes** generada por sampling estratificado (genero, edad, posicion politica) usando Urbistat + Swiss Federal Statistical Office.

## Study 1: Simulacion de estimacion (RQ1)

**Resultados**:
- Mejor performer: **Posterior con 1.000 muestras**, error medio del CRA de **6.28%**.
- One-Shot (maximum-likelihood): 7.27%.
- Baselines user-agnostic:
  - Historic (CRA promedio de usuarios previos): 9.33%.
  - Linear (barra de progreso lineal estatica): 10.22% (el peor).
- Todos los algoritmos One-Shot/Posterior superan a los baselines (p < 0.001).
- Tiempo de computo: <100 ms en Mac M1.

**Configuracion recomendada por los autores** (seccion 6.1 del paper):
- M = 100 samples
- **t = 0.7** como threshold para stable recommendations (punto de diminishing returns).

## Study 2: Experimento controlado con usuarios (RQ2, RQ3)

- **Reclutamiento**: 130 participantes del Canton de Zurich, via la market research company **Bilendi**.
- **Fecha**: 24-30 de julio 2025.
- **Demografia**: 53 hombres, 77 mujeres.
- **Exclusiones**: 27 users excluidos (no entendieron instrucciones o duracion irrazonable). Analisis con ~103.
- **Duracion mediana**: 14:12 minutos.

### 5 condiciones experimentales (NO 3 como erroneamente indicaba la version anterior)

| Condicion | N | Descripcion |
|-----------|---|-------------|
| **Control** | 21 | Sin display de certeza, questionnaire basico. |
| **FastCRA** | 17 | Certeza artificialmente inflada (crece rapido). |
| **TrueCRA** | 22 | Certeza real estimada, mostrada como barra dinamica. |
| **Estimated** | 21 | Preview de nombres + partido de candidatos recomendados. Sin porcentajes. |
| **Sampled** | 20 | Preview de recomendaciones + porcentajes de certeza individuales. |

### Resultados del experimento

**Dropout (numero de preguntas respondidas antes de salir)**:

| Condicion | Preguntas promedio |
|-----------|--------------------|
| Estimated | 68 (el mas alto) |
| Sampled | 65 |
| TrueCRA | 63 |
| Control | 56 |
| FastCRA | 49 (el mas bajo) |

- 88 users (67.7%) completaron los 75.
- 6 users (4.6%) salieron al minimo de 20 preguntas.
- **Estimated tiene dropout significativamente mas tarde que Control** (p=0.005).
- **TrueCRA, Estimated y Sampled tienen dropout significativamente mas tarde que FastCRA** (p<0.001).

**Comprension percibida**:
- **Estimated** (nombres + partido, sin porcentajes) fue percibido como el mas entendible.
- **Sampled** (con porcentajes individuales) fue el menos entendible.
- Diferencia significativa: Estimated > Sampled (p<0.001) y Estimated > FastCRA (p=0.018).

**Relevancia percibida** (no significativo pero tendencia):
- Sampled tuvo mayor relevancia percibida.
- FastCRA tuvo mayor "likelihood de recomendar la web".

**Interpretacion de los autores**:
- **Preview de stable recommendations (Estimated) INCREMENTA engagement**: los usuarios permanecen mas tiempo por curiosidad.
- **CRA artificialmente alto (FastCRA) DISMINUYE engagement**: los usuarios abandonan antes cuando creen que ya alcanzaron alta certeza.
- **Los usuarios prefieren interfaces SIMPLES sobre las mas ACCURATE**: Estimated (mas simple) fue mejor entendida que Sampled (mas rica). Los autores concluyen que hay un trade-off entre expresividad y comprensibilidad.
- Los usuarios reportaron que el display NO les influyo (percepcion), pero el comportamiento observado (dropout) muestra lo contrario.

## Discusion (extractos de la seccion 6 del paper)

- **6.1**: El algoritmo predice CRA con precision estadisticamente significativa vs baselines.
- **6.2**: La precision varia entre usuarios - depende de si tienen response pattern atipico, respuestas neutrales, o muchos candidatos similares en proximidad. No es defecto del metodo sino artefacto del paisaje politico.
- **6.3**: La curiosidad es el motor - "displaying intermediate recommendations may be a cognitive anchor for users to reflect more deeply on their responses". Advierten sobre riesgo de **performative prediction / confirmation bias** que requiere investigacion futura.
- **6.4**: Trade-off simplicidad vs precision. La interfaz Estimated logra el mejor balance.
- **6.5**: El metodo generaliza a party-based VAAs con ajustes (Spearman's rank correlation en vez de overlap).

## Limitaciones reconocidas por los autores (seccion 7)

**Simulacion**:
- El CRA no incluye el ranking exacto (solo overlap).
- No se sabe empiricamente si "final recommendations" son percibidas como mejores que "early".
- k=36 no aplica a todos los cantones. Para k=10 los estimados son menos accurate.
- PCA+LR ignora el weighing de preguntas y el mapeo ordinal->continuo.

**Experimento**:
- Interfaces disenadas priorizando precision tecnica, no usabilidad. Algunos users se atascaron.
- Reclutamiento por incentivo financiero, no por interes personal.
- Muestra no representativa de usuarios tipicos de Smartvote (mas jovenes/liberales que la muestra).
- Diseno experimental 1D en vez de 2x2 (limita analisis de cross-effects).
- No se midio la comprension **real** del usuario, solo la percibida.

## Conclusion

Los autores destacan:
- El metodo generaliza a otros dominios (no solo VAAs).
- El hallazgo geometrico interesante: predicted recommendations descubren candidatos DISTINTOS a los early solo cuando ambos estan lejos del final.
- Simplicidad > precision en interfaz.
- Vision a futuro: personalizar estrategias adaptativas, tipologia de "user profiles" segun forma de la curva CRA (smooth, surprising, unpredictable).

---

##  INTERPRETACION PROPIA - Utilidad para Tinder Decisivo

> **Advertencia**: esta seccion NO es contenido del paper. Es lectura personal aplicada al proyecto. No citar como del autor.

### 1. Justifica el dropdown TENTATIVA / MEDIA / ALTA

Tinder Decisivo ya tiene un estado de progreso semantico para los matches. Este paper ofrece:
- Justificacion academica para usar niveles de certeza vs solo un score.
- Framework matematico (CRA) para calcular esos niveles rigurosamente.
- Evidencia experimental de que comunicar certeza afecta el comportamiento.

### 2. Confirma que el nuevo Home HUB (hero card con "coincides en X de Y") es correcto

El experimento muestra que **preview de stable recommendations aumenta engagement**. La nueva seccion "Tus mejores matches" en el Home HUB es exactamente el patron Estimated que Bachmann et al. validaron como el que mejor combina engagement + comprension.

### 3. Predice el problema del "0 de 12" y valida la solucion actual

Hasta 76% de usuarios de Smartvote no completa el questionnaire. La decision reciente en el Home HUB de mostrar progreso claro ("12 de 12", "6 de 12", "0 de 12") va en la direccion del paper: comunicar certeza reduce el drop-off ambiguo.

### 4. Advertencia clave sobre honestidad estadistica

Nunca inflar el % de match artificialmente. FastCRA muestra que los usuarios abandonan cuando piensan que ya "es suficiente".

### 5. Simplicidad > riqueza visual

**Contraintuitivo**: el paper sugiere que mostrar porcentajes numericos (Sampled) confunde a los usuarios. Preferir la interfaz Estimated: solo nombres + partido. Considerar esto para el hero card de Tinder Decisivo.

### 6. Codigo publico

El repo https://github.com/fsvbach/recommendations-pag-paper podria servir como base para implementar CRA en Tinder Decisivo si se quiere agregar esa feature.

### 7. Extension futura posible

Si en algun momento se quiere agregar un modo adaptativo a Tinder Decisivo (priorizar preguntas mas discriminantes), este paper cita Bachmann et al. 2024 como referencia.

## Relacion con los otros papers del corpus

- **Cita a Garzia & Marschall 2019** (paper 06) como referencia canonica del campo.
- **Cita a Tromborg & Albertsen 2023** (paper 07) como referente empirico para candidate-based VAAs. Confirma el issue **15(4)** del paper 07.
- **Cita a Buryakov et al. 2024** (paper 03) sobre diseno de VAAs.
- **Cita a Garzia et al. 2017** sobre efectos en turnout.
- **Cita a Munzert & Ramirez-Ruiz 2021** (meta-analisis de efectos de VAAs).
- El issue completo de *Politics and Governance vol 14* esta editado por Garzia, Marschall, Tromborg y Albertsen (los mismos autores de los papers 01, 06 y 07). Es el numero especial mas relevante para la tesis publicado en 2026.

## Cita sugerida (APA)

> Bachmann, F., van der Weijden, D., Sarasua, C., & Bernstein, A. (2026). Estimating the recommendation certainty in candidate-based voting advice applications. *Politics and Governance*, *14*, Article 11256. https://doi.org/10.17645/pag.11256
