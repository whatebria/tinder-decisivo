# Historia y Evolución del Proyecto VotoAFin

**Autora:** Jenifer Castillo  
**Universidad:** Universidad Técnica Federico Santa María  
**Carrera:** Ingeniería en Informática  
**Versión:** 1.0 — Agosto 2026  

---

## Tabla de Contenidos

1. [Antecedentes](#1-antecedentes)
2. [Contexto Social y Electoral](#2-contexto-social-y-electoral)
3. [Investigación Inicial — Curso de Emprendimiento](#3-investigación-inicial--curso-de-emprendimiento)
4. [Hallazgos del Levantamiento Empírico](#4-hallazgos-del-levantamiento-empírico)
5. [Primera Propuesta de Solución](#5-primera-propuesta-de-solución)
6. [La Transición al Desarrollo: el Prototipo Móvil](#6-la-transición-al-desarrollo-el-prototipo-móvil)
7. [Limitaciones del Prototipo Inicial](#7-limitaciones-del-prototipo-inicial)
8. [Reformulación hacia el Modelo VAA](#8-reformulación-hacia-el-modelo-vaa)
9. [Construcción del Sistema VotoAFin](#9-construcción-del-sistema-votoafin)
10. [Decisiones Relevantes a lo Largo del Proceso](#10-decisiones-relevantes-a-lo-largo-del-proceso)
11. [Lecciones Aprendidas por Etapa](#11-lecciones-aprendidas-por-etapa)
12. [Próximos Pasos](#12-próximos-pasos)

---

## 1. Antecedentes

El sistema político chileno enfrentó entre 2020 y 2024 una densidad de procesos electorales sin precedentes en su historia democrática reciente. Desde el plebiscito de entrada a la primera convención constitucional en octubre de 2020, los ciudadanos chilenos concurrieron a las urnas en ocho ocasiones en el transcurso de cuatro años: dos procesos constitucionales, elecciones presidenciales y parlamentarias, elecciones municipales y regionales, y sus respectivas segundas vueltas. Los analistas electorales comenzaron a documentar un fenómeno que denominaron *fatiga electoral*: la acumulación de procesos electorales generaba una progresiva disminución del interés ciudadano por cada convocatoria sucesiva, con efectos directamente medibles sobre la participación informada y el índice de votos nulos y en blanco.

El profesor asociado de la Universidad de Santiago René Jara describió este fenómeno en los siguientes términos: *"Es cierto que se observa una fatiga electoral. Ello tiene como correlato que la gente evita informarse e invertir mucho tiempo en estar expuesto a material de campaña"*. Por su parte, el académico de la Escuela de Ciencia Política de la Universidad Diego Portales, Claudio Fuentes, identificó las tres causas concurrentes del fenómeno como las tres "D": **desinformación, desinterés y desconfianza** — una tríada que sintetiza con precisión el problema que este proyecto buscó abordar.

Este contexto constituyó el punto de partida. No la decisión de desarrollar una aplicación, sino la observación de un problema sistémico con raíces empíricamente verificables.

---

## 2. Contexto Social y Electoral

### 2.1 La magnitud de la desinformación electoral en Chile

La investigación inicial realizada en el marco del curso de Emprendimiento partió de una pregunta amplia: ¿cómo influye la desinformación en el comportamiento electoral de los chilenos? La revisión de fuentes secundarias reveló un panorama estadístico que justificaba con solidez la relevancia del problema.

Según datos del estudio *Fake News y Desinformación en Chile y LatAm* de Activa Knowledge for Action, la desinformación electoral se posicionaba como un problema significativo aunque no el de mayor magnitud en la agenda de preocupaciones ciudadanas. Concretamente:

- El **54% de los chilenos** consideraba que la *información incompleta en las noticias* era un problema importante en el país (frente al 74% del promedio latinoamericano).
- El **52%** identificaba la *desinformación en las noticias* como un problema importante (frente al 73% latinoamericano).
- El **71%** estaba de acuerdo con la afirmación *"la desinformación es una amenaza para nuestra democracia"*.
- El **68%** concordaba con que *"la desinformación debilita nuestro proceso electoral"*.
- El **65%** señalaba que *"la desinformación aumenta la polarización en la política"*.

Respecto a la frecuencia de exposición, el **52% de los encuestados** declaraba encontrarse con noticias o información que creía falsas o distorsionadas *todos los días o casi todos los días*, y el **29%** al menos una vez por semana. Es decir, el **81% del electorado** estaba expuesto a contenido desinformativo con frecuencia semanal o mayor.

El comportamiento informativo era igualmente revelador. Las tres principales fuentes de noticias que los ciudadanos declararon consultar en la última semana eran: televisión (35%), noticias online (14%) y Facebook (12%) — precisamente las fuentes en las que menos confiaban para obtener información precisa. Los políticos obtenían el porcentaje de desconfianza más alto: el **79% de los chilenos** declaraba no confiar en ellos para proporcionar noticias o información precisa.

### 2.2 Baja información sobre candidatos y procesos

El informe Claves Ipsos N°33, elaborado en el contexto de las elecciones municipales de octubre de 2024, reveló el nivel real de información del electorado sobre el proceso en el que participaría:

- Solo el **21% de los encuestados** se reconocía como *muy informado* sobre las elecciones municipales.
- El **62%** se declaraba *algo informado* y el **16%** *nada informado*.
- Solo el **83%** sabía que se elegía alcalde — el cargo de mayor visibilidad.
- Apenas el **55%** sabía que se elegían concejales.
- Menos de la mitad sabía de la elección de gobernadores (42%) y consejeros regionales (45%).

En cuanto a la decisión de voto, el panorama era aún más preocupante:

- El **42%** aún no había decidido su voto para alcalde — el más conocido de los cuatro cargos en juego.
- El **60%** no había decidido por concejales.
- El **64%** no había decidido por gobernadores.
- El **68%** no había decidido por consejeros regionales.

La conclusión era directa: la desinformación, la falta de conocimiento de los procesos y la indecisión votante no eran percepciones subjetivas sino fenómenos medibles con instrumentos de investigación social.

### 2.3 El impacto sobre la calidad del voto

El impacto más visible y cuantificable de este fenómeno fue el incremento de los votos nulos y en blanco. Comparando las elecciones municipales de 2021 con las de 2024, el porcentaje de sufragios nulos y blancos creció de manera dramática:

| Cargo | 2021 | 2024 | Variación |
|-------|------|------|-----------|
| Alcalde | 1,93% | 10,80% | **+460%** |
| Gobernador | 6,13% | 17,80% | +190% |
| Concejal | 5,74% | 21,46% | +274% |
| Consejero Regional | 13,10% | 25,78% | +97% |

En las elecciones constitucionales, el Servicio Electoral (SERVEL) registró **2.119.506 sufragios nulos**, equivalentes al **16,98%** del total de votos emitidos. Los expertos consultados fueron explícitos: *"Los votos blancos normalmente son el resultado de la desinformación, y en el voto nulo también tiene ese componente porque en esta elección hubo poca información. Poca gente sabía lo que se votaba"*.

Este contexto empírico fue el que motivó la investigación inicial y, posteriormente, el diseño de una respuesta tecnológica concreta.

---

## 3. Investigación Inicial — Curso de Emprendimiento

### 3.1 El punto de partida académico

La investigación que daría origen al proyecto comenzó en el contexto del curso de Emprendimiento de la carrera de Ingeniería en Informática de la UTFSM. El equipo de trabajo — conformado por Jennifer Castillo, Patricio De Lima y Alonso Sánchez — seleccionó como problema de estudio la *desinformación en los procesos electorales*, identificada como un área de interés con impacto social directo y con posibilidades de abordaje desde la ingeniería.

El objetivo declarado era analizar cómo la desinformación influye en el comportamiento electoral, identificar las circunstancias y actores involucrados, y entender sus consecuencias para el voto informado, *con el fin de mejorar la calidad de la información disponible para los votantes* (Castillo, De Lima y Sánchez, 2024a).

El equipo identificó cinco circunstancias estructurales en las que opera la desinformación electoral:

1. Aumento de fuentes no reguladas de información
2. Desconfianza en las fuentes de información tradicionales
3. Complejidad de la información electoral
4. Polarización política creciente
5. Ausencia de educación cívica sistemática

### 3.2 El levantamiento de evidencia secundaria

La revisión de literatura secundaria y de informes de opinión pública produjo un conjunto de evidencias estadísticas que el equipo utilizó para caracterizar la magnitud del problema (ver sección 2 de este documento para los datos específicos). Las fuentes consultadas incluyeron el estudio de Activa Knowledge for Action sobre desinformación en Chile y LatAm, el Informe Claves Ipsos N°33 sobre conocimiento electoral, y registros oficiales del SERVEL sobre comportamiento de voto nulo.

La síntesis de la situación actual fue expresada en los siguientes términos en la presentación académica correspondiente: *"Si bien no es el mayor problema, se cree que la desinformación y la información incompleta en las noticias son un problema no menor en Chile"* (Castillo et al., 2024a, diapositiva 5).

### 3.3 La metodología de campo

Adicionalmente a la revisión de fuentes secundarias, el equipo realizó una **inmersión en terreno** con el objetivo de identificar patrones y validar la problemática frente a una muestra de personas. La metodología consistió en entrevistas cortas aplicadas a **12 personas** en las localidades de Playa Ancha, Viña del Mar y Quilpué — tres comunas del área metropolitana de Valparaíso con perfiles socioeconómicos y etarios distintos.

---

## 4. Hallazgos del Levantamiento Empírico

### 4.1 Distribución de respuestas por métrica

Las entrevistas aplicadas cubrieron siete dimensiones de análisis, con respuestas dicotómicas (sí / no). Los resultados consolidados arrojaron los siguientes patrones:

| Métrica consultada | Respuestas Sí | Respuestas No |
|-------------------|:---:|:---:|
| Conocen a los candidatos | ~5 | ~7 |
| Voto de manera informada | ~6 | ~6 |
| Se informa mediante redes sociales | ~10 | ~2 |
| Se informa mediante canales oficiales | ~3 | ~9 |
| Saben qué cargos se eligen | ~6 | ~6 |
| Creen que existe desinformación en Chile | ~12 | ~0 |
| Han visto o conocen fake news electorales | ~10 | ~2 |

*Nota: N=12 entrevistados. Datos provenientes de la presentación Emprendimiento 1 (Castillo et al., 2024a).*

### 4.2 Hallazgos principales

Del análisis de las entrevistas emergieron cuatro descubrimientos centrales:

**1. Primacía de las redes sociales sobre los canales oficiales.** Las personas se informan predominantemente a través de redes sociales y no mediante canales oficiales como SERVEL o medios verificados. De 12 entrevistados, aproximadamente 10 declararon informarse por redes sociales, mientras que apenas 3 utilizaban canales oficiales.

**2. Desinformación generalizada sobre los candidatos.** La mitad de los entrevistados no conocía a los candidatos en competencia para el proceso electoral en curso. Este hallazgo era coherente con los datos nacionales del Informe Ipsos (solo 21% muy informado).

**3. Conocimiento de la existencia de fake news electorales.** Los entrevistados reconocían ampliamente la existencia de noticias falsas en contextos electorales. El dato más contundente del estudio fue que **el 100% de las personas entrevistadas** aseguraba haber visto o conocer la existencia de fake news respecto a candidatos electorales.

**4. Creencia generalizada en la desinformación.** La totalidad de los entrevistados (12 de 12) declaró creer que existe desinformación generalizada en Chile sobre procesos electorales. No hubo ninguna persona que considerara que el fenómeno no existía o era irrelevante.

### 4.3 Problemas principales detectados

A partir del análisis integrado de la evidencia secundaria y del trabajo de campo, el equipo formuló dos problemas principales:

**Desconocimiento de los canales oficiales de información:** Los canales institucionales de información electoral — SERVEL, medios verificados, programas oficiales de candidaturas — no eran accesibles ni visibles para la mayoría de las personas, lo que facilitaba el uso y circulación de fuentes con información no verificada.

**Sobrepoblación de fake news electorales:** El 100% de las personas entrevistadas había tenido contacto con información falsa sobre candidatos. Este nivel de exposición era consistente con los datos nacionales que mostraban que el 52% de los chilenos encontraba desinformación electoral diariamente.

### 4.4 Segmentos más afectados

La investigación identificó tres segmentos de votantes con mayor vulnerabilidad frente a la desinformación electoral:

- **Jóvenes votantes:** Segmento más expuesto a la desinformación digital por su alta interacción con redes sociales y bajo consumo de medios de comunicación tradicionales. Paradójicamente, también el segmento con mayor potencial de adopción de una solución tecnológica.
- **Adultos mayores:** Segmento que enfrenta dificultades para distinguir información confiable en plataformas digitales, combinando alta exposición a fake news con menor capacidad de verificación.
- **Votantes indecisos:** Segmento que típicamente busca información en el último momento antes de votar, haciéndolos especialmente vulnerables a contenido manipulador o sesgado que circula con más intensidad durante los días previos a una elección.

### 4.5 La oportunidad identificada

La síntesis del análisis del problema se expresó como una oportunidad de diseño: *"Diseñar e implementar herramientas y estrategias que permitan a los ciudadanos acceder a información confiable, clara y oportuna sobre elecciones, candidatos y propuestas"* (Castillo et al., 2024a, diapositiva 22).

La justificación de abordar esa oportunidad se articuló en cinco dimensiones:

1. Preservar la integridad de la democracia
2. Fomentar el voto informado
3. Fortalecer la confianza en las instituciones
4. Evitar impactos negativos en la participación electoral
5. Adaptarse a un entorno digital cambiante

La conclusión del primer trabajo de Emprendimiento fue directa: *"La desinformación electoral es un gran problema para la democracia, ya que afecta la confianza en las instituciones y la calidad del voto. Solo un 21% de las personas se siente realmente informado y con la presencia de las FakeNews este número está en crecimiento. Dejando un espacio de oportunidad para encontrar una solución que reúna información confiable sobre candidatos y elecciones que sea accesible para todos"* (Castillo et al., 2024a, diapositiva 33).

---

## 5. Primera Propuesta de Solución

### 5.1 Del problema a la idea de producto

El segundo trabajo del curso de Emprendimiento construyó sobre los hallazgos de la investigación anterior para desplazar el foco desde la comprensión del problema hacia el diseño de una propuesta de solución. El título del nuevo trabajo — *"Desinterés en los Procesos Electorales"* — reflejó un refinamiento conceptual importante: el equipo reconoció que el problema no era solamente la desinformación activa, sino la combinación de desinformación con desinterés estructural.

El problema se reformuló en tres vectores:

1. **Desinterés activo:** Las personas no estaban motivadas para informarse sobre política.
2. **Desconfianza en los medios:** Los ciudadanos preferían el boca a boca o el consejo de familiares por encima de los medios de comunicación formales.
3. **Déficit de información percibida:** Según datos de IPSO citados en el trabajo, solo el 21% de las personas creía estar muy informada; el **79% no creía conocer lo suficiente**.

### 5.2 La hipótesis de solución inicial

La hipótesis de solución que emergió de este análisis fue que una aplicación que combinara **educación cívica con elementos de gamificación** podría superar la barrera del desinterés y motivar a los ciudadanos a informarse sobre candidatos y procesos electorales de una manera atractiva y accesible.

El prototipo presentado —construido en la plataforma de diseño Visily AI— mostró los lineamientos visuales de esa propuesta:

- **Autenticación con RUT y Clave Única:** El sistema de identificación del Estado, familiar para todos los ciudadanos habilitados para votar, reducía la fricción de registro y generaba un vínculo simbólico con la institucionalidad electoral.
- **Directorio de partidos políticos:** Una vista de partidos con sus logos como punto de entrada al conocimiento de la oferta electoral.
- **Preguntas sobre candidatos y elecciones de la región:** Los usuarios respondían preguntas que incentivaban el aprendizaje sobre el proceso electoral local.
- **Sistema de puntos y recompensas:** Los usuarios competían con otros para obtener recompensas tangibles, motivando la participación activa.

### 5.3 Propuesta de valor declarada

La propuesta de valor articulaba tres dimensiones:

- **Gamificación cívica:** La aplicación no solo informaba, sino que lo hacía de forma divertida y competitiva.
- **Beneficios tangibles:** Premios y descuentos vinculados a la participación activa para motivar la conducta.
- **Información sobre candidatos y tendencias de voto:** Datos estructurados sobre la oferta electoral local.

Las ventajas identificadas en la presentación incluían la combinación única de educación cívica con juegos interactivos, especialmente atractiva para el público joven; la escalabilidad del modelo hacia otros procesos participativos; y su potencial para fomentar la participación electoral.

### 5.4 Limitaciones reconocidas

El equipo también identificó, con honestidad, las limitaciones de la propuesta:

- Se trataba de una aplicación de uso específico y estacional, poco probable de ser usada cotidianamente.
- La masificación del uso tomaría tiempo.
- La gestión de la imparcialidad representaba un desafío no trivial.

### 5.5 Modelo de negocio propuesto

El modelo de negocio contemplaba cuatro fuentes de ingresos: patrocinios de empresas locales y nacionales; publicidad in-app con promociones personalizadas; licencias para gobiernos que quisieran versiones adaptadas a sus regiones; y monetización de datos agregados y anonimizados sobre tendencias cívicas, respetando la legislación de privacidad. La propuesta al inversionista planteaba una inversión inicial de $120 millones CLP con un retorno potencial del 50% en el primer año.

La escalabilidad proyectada incluía la adaptación para otros procesos participativos — consultas ciudadanas, encuestas públicas, presupuestos participativos — y la expansión a otros países donde se encontrara un desinterés electoral similar.

---

## 6. La Transición al Desarrollo: el Prototipo Móvil

### 6.1 Del concepto al código

El siguiente paso en la evolución del proyecto ocurrió en el contexto del curso de Desarrollo de Aplicaciones Móviles. El desafío era transformar la propuesta conceptual diseñada en Emprendimiento en una aplicación funcional. Este tránsito del boceto al código produjo decisiones de diseño que revelaron tensiones no previstas en la fase conceptual.

La hipótesis que guió esta iteración fue que la barrera de entrada al conocimiento de los candidatos podía reducirse drásticamente simplificando la interacción al mínimo. Si explorar candidatos mediante listas, fichas y textos resultaba tedioso para el usuario, ¿sería posible hacer ese proceso casi instantáneo, intuitivo y visualmente atractivo?

### 6.2 La mecánica de deslizamiento — inspiración y limitaciones

La inspiración conceptual fue una mecánica de interfaz ya conocida por millones de usuarios: el deslizamiento lateral (*swipe*) popularizado por aplicaciones de citas. La idea era directa: el votante ve la tarjeta de un candidato con su foto, nombre y propuestas clave; desliza hacia la derecha si le parece interesante, hacia la izquierda si no. La interacción es binaria, inmediata y sin fricción.

Este prototipo — informalmente denominado *"Tinder Electoral"* durante su desarrollo — incluía:

- Candidatos ficticios como datos de prueba
- Perfil visual del candidato (imagen, nombre, partido)
- Información básica de propuestas
- Interacción de deslizamiento izquierda/derecha

La mecánica cumplía la promesa de reducir la carga cognitiva de la exploración: el usuario no necesitaba leer listas comparativas ni navegar por menús complejos. Pero contenía una contradicción estructural que solo se hizo evidente durante el desarrollo y la reflexión posterior.

### 6.3 El problema de fondo: binario vs. matiz

La mecánica de swipe reduce inherentemente cada respuesta a una decisión binaria: *me gusta / no me gusta*. Esto es perfectamente funcional para seleccionar una pareja potencial (donde la preferencia es en efecto binaria), pero introduce un sesgo significativo en el contexto de la comparación programática electoral.

La posición de un votante sobre una política pública rara vez es binaria. Las personas tienen posiciones matizadas: *estoy muy de acuerdo*, *estoy algo de acuerdo*, *me es indiferente*, *estoy algo en desacuerdo*, *estoy muy en desacuerdo*. Esta gradación — que la escala Likert de cinco puntos captura con fidelidad — es precisamente la que determina la calidad del matching entre votante y candidato.

Un sistema que reduce las respuestas a binario pierde la mitad de la información relevante para el cálculo. Y sin esa información, el porcentaje de afinidad que produciría no refleja con precisión las preferencias reales del votante.

Esta limitación, combinada con el uso de candidatos ficticios sin datos verificados, produjo el aprendizaje fundamental de esta etapa.

---

## 7. Limitaciones del Prototipo Inicial

### 7.1 El dataset fabricado

La limitación más crítica identificada al revisar el prototipo no era de interfaz sino de datos. Las posturas asignadas a los candidatos de prueba habían sido generadas por inferencia ideológica estereotípica — si un candidato pertenecía a un partido de cierta orientación, se asumía que su postura en cada tema era la *esperada* para esa orientación — sin verificación alguna contra declaraciones públicas, programas oficiales o votaciones previas.

Esta práctica, válida para una demostración técnica, era inaceptable para un sistema diseñado a orientar decisiones de voto reales. Un sistema que genera recomendaciones electorales basadas en datos fabricados no asesora al votante: lo desinforma de una manera más sofisticada que un artículo falso en redes sociales, porque la presentación algorítmica genera una ilusión de rigor que el contenido no respalda.

La decisión de eliminar completamente ese dataset fue la primera decisión de diseño estructurante del proyecto de tesis.

### 7.2 La incompatibilidad algorítmica

El swipe no solo limita la interfaz: limita el algoritmo. Si las respuestas son binarias, el único cálculo de matching posible es contar coincidencias (swipe derecho a los candidatos que el usuario también marcó positivamente). Este cálculo no captura ni la intensidad de los acuerdos, ni la importancia relativa que el votante asigna a cada tema, ni la diferencia entre un desacuerdo leve y un desacuerdo absoluto.

Para capturar esas dimensiones se necesita una escala ordinal de al menos cinco puntos, un mecanismo de ponderación por importancia, y una función de penalización que refleje que las diferencias extremas son cualitativamente distintas de las diferencias pequeñas. Ninguno de estos componentes es compatible con una interfaz de swipe binario.

### 7.3 La ausencia de cobertura territorial

El prototipo cubría un tipo de elección (presidencial) con un conjunto fijo de candidatos ficticios. No tenía mecanismo para filtrar candidatos por el nivel electoral relevante para cada usuario (distrital para diputados, comunal para alcaldes). Esta limitación era aceptable en una demostración técnica, pero incompatible con una herramienta útil para el votante real chileno, que necesita orientación simultánea para múltiples niveles electorales.

---

## 8. Reformulación hacia el Modelo VAA

### 8.1 La pregunta que reorganizó el proyecto

La reflexión sobre las limitaciones del prototipo llevó a reformular la pregunta de diseño central. La pregunta original había sido: *¿cómo hacer más entretenido el proceso de conocer candidatos?* La nueva pregunta fue: *¿cómo ayudar al votante a descubrir con cuál candidato está más alineado programáticamente, con la menor carga cognitiva posible y con la mayor precisión que los datos disponibles permitan?*

Este desplazamiento de pregunta produjo un desplazamiento de paradigma: de una aplicación de exploración de candidatos a una *Voting Advice Application* (VAA).

### 8.2 El referente internacional como requerimiento de diseño

La investigación del estado del arte en VAAs internacionales — realizada como parte de la Fase 0 del proyecto — identificó que treinta años de desarrollo y validación empírica de estas herramientas habían convergido en principios de diseño razonablemente bien establecidos. Los más relevantes para el proyecto:

**Escala de respuesta Likert de cinco puntos.** La escala Likert captura la gradación de acuerdo/desacuerdo con una resolución suficiente para calcular distancias programáticas significativas. Escalas más cortas (tres puntos, como StemWijzer) pierden matiz; escalas más largas generan fatiga cognitiva sin ganancia informativa proporcional (Krosnick & Presser, 2010).

**Ponderación por importancia declarada.** Permitir al usuario indicar qué temas le importan más — mediante un multiplicador de peso — produce recomendaciones más coherentes con sus prioridades reales. Un votante que prioriza el medioambiente debería ver ese eje con mayor peso en su matching que uno indiferente al tema.

**Exclusión de respuestas *no sé*.** La investigación de Bachmann et al. (2026) y la práctica de sistemas como Wahl-O-Mat confirmaron que la opción *no sé / prefiero no responder* debe excluirse del denominador del cálculo, no tratarse como posición neutral. Una respuesta neutral ficticia introduce ruido; su exclusión preserva la precisión del resultado.

**Función de penalización cuadrática.** El algoritmo euclidiano — que eleva al cuadrado la diferencia normalizada — penaliza los desacuerdos extremos con mayor severidad que los desacuerdos leves, reflejando la intuición política de que la distancia entre posiciones no es linealmente proporcional a su diferencia numérica (Louwerse & Rosema, 2014).

**Indicador de confianza.** Bachmann et al. (2026) demostraron empíricamente que comunicar al usuario el nivel de certeza de la recomendación — según el número de preguntas efectivamente respondidas — afecta positivamente el comportamiento de uso sin introducir distorsiones en la percepción del resultado.

### 8.3 La hipótesis reformulada

La hipótesis que guió la tercera iteración fue la siguiente: si se reduce la carga cognitiva del proceso informativo — no haciendo la interfaz más entretenida, sino estructurando las preguntas de manera que el usuario revele sus preferencias en cinco a diez minutos — y si el resultado entrega no una recomendación opaca sino un ranking con criterios explícitos y verificables, entonces la herramienta puede ser percibida como útil y confiable por votantes de perfiles muy distintos.

Esta hipótesis diferencia a VotoAFin del prototipo de Aplicaciones Móviles en una dimensión fundamental: el objetivo no es reducir la carga cognitiva haciendo el proceso más entretenido, sino reducirla haciendo el proceso más eficiente. La diferencia no es estética; es epistemológica.

---

## 9. Construcción del Sistema VotoAFin

### 9.1 Decisiones arquitectónicas fundacionales

La transición del concepto a la implementación de VotoAFin estuvo guiada por cuatro decisiones arquitectónicas tomadas antes de escribir la primera línea de código.

**Separación backend/frontend con contrato OpenAPI.** La lógica del algoritmo de matching debía vivir íntegramente en el backend, auditable de manera independiente del frontend. El contrato OpenAPI 3.1 generado automáticamente desde el código del backend y consumido por el frontend como tipos TypeScript garantizaba que no hubiera discrepancias entre la forma de datos que el cliente esperaba y la que el servidor producía.

**Modelo territorial polimórfico.** La representación de las 16 regiones, 28 distritos electorales y 346 comunas del sistema electoral chileno mediante una entidad jerárquica auto-recursiva permitía que el filtrado de candidatos por scope del usuario fuera un algoritmo genérico, extensible a cualquier profundidad de jerarquía territorial.

**Licencia AGPL-3.0.** La elección de una licencia copyleft fuerte respondía a la visión de que la tecnología electoral es infraestructura de interés público: cualquier versión modificada desplegada públicamente debe compartir sus cambios.

**Eliminación del dataset fabricado y reconstrucción con validación obligatoria de fuentes.** Cada postura en el sistema debe incluir justificación textual mínima y URL de fuente primaria verificable. Los importadores de datos rechazan registros sin esos campos.

### 9.2 Las ocho fases del desarrollo

El sistema se construyó en ocho fases iterativas sobre un período de aproximadamente treinta y dos semanas:

| Fase | Objetivo | Resultado |
|:---:|----------|-----------|
| 0 | Investigación del estado del arte | Análisis comparativo de 9 VAAs + 4 iniciativas chilenas |
| 1 | Diseño de arquitectura y contrato API | Modelo de dominio + primer schema OpenAPI |
| 2 | MVP end-to-end | Flujo funcional desde registro hasta resultados |
| 3 | Auditoría y refactorización | 4 hallazgos críticos de seguridad resueltos + DRY aplicado |
| 4 | Expansión territorial | Modelo polimórfico + preguntas base transversales |
| 5 | Simplificación YAGNI | Swipe eliminado + DecisionFinal eliminado |
| 6 | Sistema de diseño y accesibilidad | Atomic Design + WCAG 2.2 AA |
| 7 | Documentación y tesis | Este documento |

### 9.3 Estado final del sistema

El sistema entregado al cierre del proyecto incluye:

- 18 pantallas funcionales con flujo completo end-to-end
- Algoritmo cuadrático con ponderación en cuatro niveles e indicador de confianza en tres niveles
- Modelo territorial con 16 regiones, 28 distritos y 346 comunas
- Soporte para múltiples procesos electorales simultáneos con preguntas base transversales
- 27 átomos, 29 moléculas y 17 organismos siguiendo Atomic Design
- 25 archivos de pruebas automatizadas en el backend
- Código publicado bajo AGPL-3.0

---

## 10. Decisiones Relevantes a lo Largo del Proceso

### Decisión 1: Eliminar el dataset de posturas fabricadas (Etapa 3 → 4)

**Situación:** El prototipo de Aplicaciones Móviles usaba posturas generadas por inferencia ideológica estereotípica, sin verificación.

**Alternativas evaluadas:**
- Corregir el dataset existente caso por caso
- Eliminar completamente y reconstruir con validación obligatoria

**Decisión:** Eliminación y reconstrucción. Un dataset de calidad desigual sin trazabilidad genera confianza falsa en los resultados.

**Impacto:** El sistema de importación requiere campo de fuente primaria y justificación para cada postura. La calidad del dato es verificable por cualquier tercero.

---

### Decisión 2: Abandonar la mecánica de swipe (Etapa 3 → 4)

**Situación:** El swipe era la característica más visible del prototipo, pero reducía las respuestas a binario, incompatible con el algoritmo Likert.

**Alternativas evaluadas:**
- Mantener el swipe y adaptar el algoritmo al binario
- Reemplazar el swipe por un cuestionario con escala Likert

**Decisión:** Reemplazo completo del paradigma de interacción. El objetivo del sistema es precisión en el matching, no entretenimiento en la exploración.

**Impacto:** La interfaz resultante es menos "viral" pero más honesta sobre lo que el sistema hace. El algoritmo puede operar con toda su capacidad.

---

### Decisión 3: Función cuadrática sobre función lineal

**Situación:** Al diseñar el algoritmo, se evaluaron tres variantes de función de penalización.

**Alternativas evaluadas:**
- Distancia Manhattan (diferencia absoluta normalizada)
- Similitud de coseno
- Distancia cuadrática normalizada

**Decisión:** Función cuadrática. Penaliza los desacuerdos extremos con mayor severidad relativa, reflejando la intuición política de que posiciones *casi de acuerdo* son cualitativamente distintas de posiciones *opuestas*.

**Impacto:** El ranking producido tiene mayor coherencia política para usuarios con posiciones fuertes en algunos temas.

---

### Decisión 4: Modelo territorial polimórfico (Fase 4)

**Situación:** El sistema necesitaba representar 16 regiones, 28 distritos y 346 comunas con filtrado automático por scope.

**Alternativas evaluadas:**
- Tablas separadas por nivel territorial (Región, Distrito, Comuna) con joins por nivel
- Entidad única polimórfica jerárquica auto-recursiva

**Decisión:** Entidad polimórfica. El algoritmo de filtrado es genérico y extensible a cualquier profundidad de jerarquía.

**Impacto:** Un candidato con scope nacional es visible desde cualquier comuna del país. El filtrado es una única función recursiva, no una consulta diferente por nivel.

---

### Decisión 5: Licencia AGPL-3.0 sobre MIT o Apache (Diseño inicial)

**Situación:** Al definir la licencia del proyecto, se evaluaron las opciones más comunes.

**Alternativas evaluadas:**
- MIT o Apache 2.0 (permisivas)
- AGPL-3.0 (copyleft fuerte)

**Decisión:** AGPL-3.0. La tecnología electoral como infraestructura pública no debería poder ser apropiada privadamente sin compartir las modificaciones.

**Impacto:** Cualquier actor que despliegue VotoAFin modificado como servicio público debe publicar sus cambios. El código permanece abierto en todos sus forks.

---

## 11. Lecciones Aprendidas por Etapa

### Etapa 1 — Emprendimiento: investigación de problemas

**Lección central:** La investigación empírica del problema — incluso con una muestra pequeña como las 12 entrevistas de Playa Ancha, Viña del Mar y Quilpué — produce hallazgos cualitativamente distintos de la intuición. El dato de que el 100% de los entrevistados había visto fake news electorales no era un número esperado; era un hallazgo que justificaba la urgencia de la solución.

**Lección metodológica:** Las fuentes secundarias (Activa, IPSO, SERVEL) proveen el contexto cuantitativo; las entrevistas proveen la textura cualitativa. Ambas son necesarias para fundamentar un proyecto de ingeniería con relevancia social real.

### Etapa 2 — Emprendimiento: diseño de producto

**Lección central:** El modelo de negocio de una herramienta cívica no puede basarse exclusivamente en publicidad o gamificación. La imparcialidad percibida es un activo más valioso que el revenue inmediato. La gamificación con recompensas tangibles, aunque atractiva, introduce incentivos que pueden distorsionar la conducta de uso y generar dependencia del modelo de negocio.

**Lección de diseño:** La identificación de desventajas propias — *dependencia de la participación activa, costos iniciales altos, desafíos en la gestión de la imparcialidad* — en la fase de propuesta previene el enamoramiento del propio concepto y orienta el diseño de la siguiente iteración.

### Etapa 3 — Aplicaciones Móviles: primer prototipo funcional

**Lección central:** La mecánica más atractiva de interfaz puede ser incompatible con los requerimientos de precisión del sistema. El swipe era entretenido; también era algorítmicamente inadecuado. Descubrirlo durante el desarrollo — y tener el criterio de eliminarlo — es una lección de ingeniería de producto que no se puede aprender solo en teoría.

**Lección de datos:** Un dataset no verificado es peor que ningún dataset. La ausencia de datos honestos produce resultados incorrectos con apariencia de correctos — el peor tipo de error en una herramienta que orienta decisiones de voto.

### Etapa 4 — Tesis: sistema VAA completo

**Lección central:** La transparencia algorítmica no es un adorno estético de un proyecto académico: es el único mecanismo verificable de legitimidad de una herramienta electoral. Un porcentaje de afinidad producido por un algoritmo opaco no es más confiable que cualquier otro número publicado sin respaldo.

**Lección de alcance:** YAGNI aplicado retroactivamente — eliminar el swipe y el módulo DecisionFinal ya implementados — produce un sistema más cohesivo sin pérdida funcional real. El miedo a eliminar trabajo hecho es un sesgo cognitivo que el criterio de *casos de uso demostrados* permite contrarrestar con objetividad.

**Lección de sostenibilidad:** La curaduría de datos es el cuello de botella real. El código puede construirse en ocho meses; verificar las posturas de todos los candidatos de un ciclo electoral completo contra fuentes primarias requiere múltiples personas durante semanas. Esta asimetría debe incorporarse como requerimiento de planificación en cualquier despliegue público responsable.

---

## 12. Próximos Pasos

El proyecto entrega un sistema técnicamente funcional, auditado y documentado. El camino hacia un despliegue público responsable requiere abordar las siguientes líneas de trabajo prioritarias:

### Inmediato (bloquea el despliegue público responsable)

**Curaduría formal del dataset.** El dataset de posturas actual es ilustrativo. Verificar formalmente las posiciones de los candidatos contra fuentes primarias — declaraciones públicas, votaciones registradas, programas oficiales — es el prerrequisito más crítico para un despliegue que oriente decisiones de voto reales. Este trabajo requiere alianzas con universidades, think tanks o medios de comunicación que puedan distribuir la carga curatorial.

**Validación con usuarios reales.** El sistema no ha sido evaluado con votantes reales. Se requieren sesiones de usabilidad con personas representativas de los tres segmentos objetivo identificados en la investigación de Emprendimiento: jóvenes votantes, adultos sin experiencia digital avanzada y votantes indecisos. La evaluación de accesibilidad con personas con discapacidad visual o motriz es parte obligatoria de esta validación.

**Auditoría de seguridad externa.** Una revisión por un equipo especializado en seguridad de aplicaciones web es necesaria antes de la exposición pública productiva.

### Mediano plazo (escalamiento operativo)

**Alianzas institucionales.** La sostenibilidad del sistema entre ciclos electorales requiere respaldo institucional. Las alianzas más prometedoras son con universidades chilenas (para la curaduría de datos e investigación sobre impacto), organizaciones de sociedad civil especializadas en educación cívica, y medios de comunicación interesados en herramientas comparativas verificadas.

**Modo anónimo en el frontend.** El backend ya implementa el cálculo de matching anónimo sin persistencia. El frontend aún no expone ese modo al usuario. Esta funcionalidad reduciría la fricción de entrada para usuarios que no desean registrarse.

**Pruebas de carga.** El comportamiento del sistema bajo la concurrencia de un ciclo electoral activo no ha sido evaluado. Se requieren pruebas de carga antes del despliegue en producción.

### Largo plazo (investigación y evolución)

**Investigación sobre impacto.** Una vez que el sistema esté en producción con datos verificados y una base de usuarios real, es posible diseñar estudios sobre la coherencia entre las preferencias declaradas en el cuestionario y las decisiones de voto reportadas posteriormente. Esta línea de investigación conecta directamente con la literatura politológica sobre impacto de VAAs (Tromborg & Albertsen, 2023; Stadelmann-Steffen et al., 2022).

**Formalización del indicador de confianza.** El sistema actual usa un indicador de confianza heurístico (tentativa / media / alta) basado en el número de preguntas respondidas. Bachmann et al. (2026) proponen un algoritmo estadístico formal para estimar la *Candidate Recommendation Accuracy* (CRA) que permitiría formalizar y mejorar ese indicador.

**Modo plebiscito.** El diseño actual cubre elecciones de candidatos. Stadelmann-Steffen et al. (2022) demuestran que las VAAs tienen impactos potencialmente más fuertes en contextos de democracia directa (referéndums), donde los votantes entran con menor información previa. Chile ha celebrado tres plebiscitos constitucionales en cuatro años — un contexto que justifica el desarrollo de un modo específico para decisiones de sí/no sobre propuestas de política pública.

---

## Referencias

Bachmann, F., van der Weijden, D., Sarasua, C., & Bernstein, A. (2026). Estimating the recommendation certainty in candidate-based voting advice applications. *Politics and Governance*, *14*, Article 11256. https://doi.org/10.17645/pag.11256

Castillo, J., De Lima, P., & Sánchez, A. (2024a). *Desinformación en los procesos electorales* [Presentación académica, Curso de Emprendimiento]. Universidad Técnica Federico Santa María.

Castillo, J., De Lima, P., & Sánchez, A. (2024b). *Desinterés en los procesos electorales* [Presentación académica, Curso de Emprendimiento]. Universidad Técnica Federico Santa María.

Garzia, D., & Marschall, S. (2019). Voting advice applications. *Oxford Research Encyclopedia of Politics*. Oxford University Press. https://doi.org/10.1093/acrefore/9780190228637.013.620

Garzia, D., Marschall, S., Tromborg, M. W., & Albertsen, A. (2026). Voting advice applications: Methodological innovations, behavioural effects, and research perspectives. *Politics and Governance*, *14*, Article 12331. https://doi.org/10.17645/pag.12331

Krosnick, J. A., & Presser, S. (2010). Question and questionnaire design. En P. V. Marsden & J. D. Wright (Eds.), *Handbook of survey research* (2nd ed., pp. 263–313). Emerald.

Louwerse, T., & Rosema, M. (2014). The design effects of voting advice applications: Comparing methods of interest aggregation. *Electoral Studies*, *36*, 142–155.

Stadelmann-Steffen, I., Rajski, H., & Ruprecht, S. (2022). The role of vote advice application in direct-democratic opinion formation: An experiment from Switzerland. *Acta Politica*, *58*, 792–818. https://doi.org/10.1057/s41269-022-00264-5

Tromborg, M. W., & Albertsen, A. (2023). Candidates, voters, and voting advice applications. *European Political Science Review*, *15*(4), 582–599. https://doi.org/10.1017/S1755773923000103

---

*Documento de apoyo al proceso de tesis — Borrador v1.0 — Agosto 2026.*  
*Autora: Jenifer Castillo — Ingeniería en Informática — UTFSM.*
