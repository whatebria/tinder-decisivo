---

<div align="center">

**[NOMBRE DE LA UNIVERSIDAD]**

**Facultad de [Ingeniería / Ciencias / etc.]**

**Carrera de Ingeniería en Informática**

<br><br><br><br><br>

# Diseño e Implementación de matchVote

## Una aplicación móvil multi-elección de asesoramiento electoral (VAA) para el contexto chileno

### *Versión narrativa académica*

<br><br><br><br>

**Autora:** Jenifer Castillo

**Profesor(a) guía:** [Nombre del profesor(a) guía]

**Comisión evaluadora:** [Nombres de la comisión]

<br><br><br><br>

*Tesis presentada para optar al grado de Ingeniera en Informática*

<br><br><br>

**[Ciudad], [País]**

**[Mes], 2026**

</div>

<!--PAGE_BREAK-->

---

## Dedicatoria

<br><br>

<div align="center">

*[Aquí va tu dedicatoria personal.]*

*A mi familia, por el apoyo incondicional en cada etapa de este camino.*

*A quienes creyeron en este proyecto desde el primer día.*

*A los votantes que aún buscan información honesta antes de decidir.*

</div>

<!--PAGE_BREAK-->

---

## Agradecimientos

<br>

Quiero expresar mi más sincero agradecimiento a **[Nombre del profesor(a) guía]**, por su orientación, paciencia y valiosos aportes durante el desarrollo de este trabajo. Sus observaciones críticas y su experiencia académica fueron fundamentales para dar forma al proyecto en momentos donde el alcance amenazaba con desbordarse, y para reencauzar la investigación cuando los caminos exploratorios prometían más de lo que podían entregar.

Agradezco a los miembros de la comisión evaluadora, **[Nombres]**, por dedicar su tiempo a revisar y enriquecer esta tesis con sus comentarios. La discusión académica que acompañó las revisiones sucesivas del documento contribuyó de manera significativa a la precisión conceptual del trabajo final.

A mis compañeros y compañeras de carrera, con quienes compartí discusiones, dudas y aprendizajes a lo largo de estos años. Las conversaciones informales de pasillo terminaron siendo, en más de una ocasión, la fuente de decisiones técnicas relevantes. A mi familia, por el apoyo emocional y material que hizo posible dedicarme a este proyecto con la atención que requería.

Un reconocimiento especial merece la comunidad de software libre, cuyas herramientas y documentación abierta hicieron técnicamente viable un proyecto ciudadano con recursos limitados. Sin las bases de trabajo de Django, React Native, Expo, PostgreSQL, Docker y cientos de librerías complementarias, este proyecto habría requerido presupuestos institucionales fuera del alcance de una tesis individual.

Finalmente, a las organizaciones chilenas que han insistido durante años en la necesidad de mejores herramientas de información electoral —*Fast Check CL*, *Mala Espina Check* y equipos académicos que han estudiado el problema— cuyo trabajo sirvió de contexto y motivación para este proyecto.

<!--PAGE_BREAK-->

---

## Resumen

El presente trabajo describe el diseño y la implementación de *matchVote*, una aplicación web progresiva y móvil multiplataforma que actúa como Voting Advice Application (VAA) para el contexto electoral chileno. La aplicación permite al votante comparar sus preferencias políticas con las declaradas por los candidatos en competencia mediante un algoritmo transparente, exposición al usuario de las posturas asignadas a cada candidato y soporte simultáneo para múltiples procesos electorales, incluyendo elecciones presidenciales, parlamentarias y municipales.

A diferencia de los intentos previos en Chile, como *Votamos Todos* de Zismo (activa entre 2021 y 2022, limitada al plebiscito constitucional), *Decide Chile*, *Vota Inteligente* e *Infovecino*, ninguno de los cuales logró consolidarse como una VAA multi-elección con matching algorítmico documentado, la solución propuesta publica su algoritmo de matching en la propia documentación del proyecto, expone al usuario las posturas asignadas a cada candidato de manera transparente y consultable, y filtra automáticamente candidaturas según la comuna del votante mediante un modelo territorial polimórfico que representa las dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas del país.

El backend fue implementado en Django con Django REST Framework, mientras que el frontend se construyó en React Native con Expo. El contrato entre ambas capas sigue el estándar OpenAPI 3.1, generado automáticamente y sincronizado en tipos TypeScript. El algoritmo de afinidad utiliza una fórmula cuadrática que penaliza con mayor severidad las diferencias extremas, incorpora ponderación declarada por el usuario, maneja explícitamente respuestas del tipo *no sé*, entrega un nivel de confianza según el número de preguntas efectivamente consideradas y provee explicación pregunta-a-pregunta del resultado. La aplicación cumple con las pautas WCAG 2.2 nivel AA en todas sus pantallas.

Metodológicamente, el proyecto se desarrolló siguiendo un enfoque iterativo e incremental organizado en ocho fases, con testing automatizado sobre veinticinco archivos de pruebas backend. El sistema completo se empaqueta con Docker para garantizar despliegue reproducible en cualquier proveedor cloud.

**Palabras clave:** Voting Advice Application; asesoramiento electoral; algoritmo de matching; modelo polimórfico jerárquico; desinformación electoral; accesibilidad WCAG; aplicaciones multiplataforma; Chile; Django; React Native.

<!--PAGE_BREAK-->

---

## Abstract

This work describes the design and implementation of *matchVote*, a Progressive Web App and cross-platform mobile application that acts as a Voting Advice Application for the Chilean electoral context. The application allows voters to compare their political preferences with those declared by competing candidates through a transparent algorithm, transparent exposure of the postures assigned to each candidate and simultaneous support for multiple electoral processes, including presidential, parliamentary and municipal elections.

Unlike previous efforts in Chile, such as *Votamos Todos* by Zismo (active between 2021 and 2022, limited to the constitutional plebiscite), *Decide Chile*, *Vota Inteligente* and *Infovecino*, none of which consolidated as a multi-election VAA with a documented matching algorithm, the proposed solution publishes its matching algorithm in the project documentation, transparently exposes to the user the postures assigned to each candidate and automatically filters candidates according to the voter's municipality through a polymorphic territorial model representing the country's sixteen regions, twenty-eight electoral districts and three hundred forty-six municipalities.

The backend was implemented in Django with Django REST Framework, while the frontend was built with React Native and Expo. The contract between both layers follows the OpenAPI 3.1 standard, automatically generated and synchronized in TypeScript types. The affinity algorithm uses a quadratic formula that penalizes extreme differences more heavily, incorporates user-declared weighting, explicitly handles *don't know* answers, provides a confidence level based on the number of questions actually considered and offers a question-by-question explanation of the result. The application complies with WCAG 2.2 Level AA accessibility guidelines across all screens.

Methodologically, the project was developed following an iterative and incremental approach organized in eight phases, with automated testing across twenty-five backend test files. The complete system is packaged with Docker to guarantee reproducible deployment in any cloud provider.

**Keywords:** Voting Advice Application; electoral guidance; matching algorithm; polymorphic hierarchical model; electoral disinformation; WCAG accessibility; cross-platform applications; Chile; Django; React Native.

<!--PAGE_BREAK-->

---

## Tabla de contenidos

<!--WORD_TOC-->

1. [Introducción](#1-introduccion)
2. [Definición del problema](#2-definicion-del-problema)
3. [Marco conceptual](#3-marco-conceptual)
4. [Propuesta de solución](#4-propuesta-de-solucion)
5. [Validación de la solución](#5-validacion-de-la-solucion)
6. [Conclusiones](#6-conclusiones)
7. [Bibliografía](#7-bibliografia)
8. [Anexos](#8-anexos)

## Índice de figuras

- **Figura 1.** Diagrama de flujo del usuario principal — sección 4
- **Figura 2.** Arquitectura general del sistema — sección 4
- **Figura 3.** Carta Gantt del proyecto — sección 4

## Índice de tablas

- **Tabla 1.** Alcances y limitaciones del proyecto — sección 1
- **Tabla 2.** Cronograma de fases — sección 4
- **Tabla 3.** Stack tecnológico — sección 4
- **Tabla 4.** Endpoints principales de la API — sección 4
- **Tabla 5.** Casos de prueba del algoritmo — sección 5
- **Tabla 6.** Comparativa con VAAs internacionales — Anexo C

<!--PAGE_BREAK-->

---

## 1. Introducción

### 1.1 Qué es matchVote y qué busca

*matchVote* es una aplicación web progresiva y móvil multiplataforma que actúa como Voting Advice Application para el contexto electoral chileno. Su función principal consiste en preguntarle al votante su opinión sobre políticas públicas concretas —organizadas en ejes temáticos que van desde la economía hasta la reforma institucional, pasando por sociedad, ambiente, seguridad, derechos humanos y política internacional— y compararla sistemáticamente con las posturas declaradas y verificadas de los candidatos en competencia. El resultado se entrega bajo tres formas complementarias: un ranking de afinidad ordenado, un desglose por eje temático visualizado como radar y una explicación pregunta-a-pregunta que permite al usuario cuestionar y comprender el porqué de cada resultado.

La aplicación soporta simultáneamente múltiples procesos electorales activos —presidencial, parlamentaria y municipal— gracias a un modelo territorial que filtra automáticamente a los candidatos según la comuna del votante, evitando que la persona compare candidaturas que no aparecerán en su cédula. Aunque el nombre del proyecto refiere metafóricamente al mecanismo de comparación individualizada popularizado por la aplicación homónima, el producto no replica el flujo de swipe característico de aquella: se estructura como un cuestionario ponderable con explicación algorítmica transparente, orientado a la reflexión más que a la reacción rápida.

El proyecto busca reducir la asimetría de información que enfrenta el votante chileno en cada ciclo electoral, entregando una herramienta que cumpla simultáneamente con cinco características hoy ausentes en el ecosistema nacional: algoritmo de matching documentado y transparente publicado en la propia documentación del proyecto, exposición al usuario de las posturas asignadas a cada candidato de manera clara y consultable, cobertura multi-nivel territorial que abarque el ámbito nacional, distrital y comunal, accesibilidad conforme a WCAG 2.2 nivel AA (W3C, 2023), y una arquitectura pensada para la continuidad operativa entre elecciones. En términos de resultado esperado, el proyecto entrega un producto funcional multiplataforma, un cuestionario estructurado en torno a ejes temáticos amplios de la política pública chilena, una arquitectura reutilizable para otros países con estructura territorial comparable, y documentación técnica y accesible que permite la reproducibilidad de las decisiones de diseño.

### 1.2 Cuándo se ocuparía y cuándo se manifiesta el problema

La aplicación fue diseñada para acompañar al votante en tres momentos distintos del ciclo electoral chileno. En primer lugar, y como caso de uso principal, sirve durante el período de campaña previo a la elección: el votante ingresa a la aplicación, responde el cuestionario correspondiente al proceso electoral activo y obtiene un ranking de afinidad que puede consultar tantas veces como necesite hasta el día de la votación, ajustando pesos, cambiando respuestas y explorando las justificaciones de cada match. En segundo lugar, la aplicación permanece disponible durante períodos no electorales, cumpliendo un rol educativo sobre los ejes temáticos de la política pública chilena, sirviendo como referencia para investigadores y periodistas, y permitiendo a los votantes explorar retroactivamente las posturas de los electos vigentes. En tercer lugar, entre ciclos electorales sucesivos, la persona usuaria puede consultar el historial de sus propias respuestas, comparar su coherencia en el tiempo y observar la evolución de las posturas de candidatos que participan en más de un proceso.

El diseño multi-elección permite además que un mismo votante utilice la aplicación en una sola sesión para las tres elecciones simultáneas típicas de un ciclo chileno —por ejemplo, presidencial más diputados por distrito más alcalde por comuna—, reutilizando las respuestas a las preguntas base transversales sobre valores.

El problema al que responde *matchVote* se manifiesta principalmente durante los períodos de campaña electoral, cuando el votante enfrenta una avalancha de información fragmentada, sesgada y en ocasiones deliberadamente falsa. Este período crítico se agudiza en las últimas tres a cuatro semanas antes de cada elección, cuando la circulación de contenido en redes sociales y aplicaciones de mensajería alcanza sus picos históricos, según reportan verificadores independientes como Fast Check CL (2024) y Mala Espina Check (2024). Sin embargo, el problema tiene una dimensión estructural que trasciende el período de campaña: la ausencia de herramientas civiles o institucionales de comparación programática es permanente. Incluso fuera de períodos electorales, un ciudadano interesado en comparar sistemáticamente las posturas de sus representantes electos vigentes con las suyas propias no dispone en Chile de una plataforma para hacerlo.

### 1.3 Por qué es importante

En una democracia representativa, la calidad de las decisiones colectivas depende de la calidad de las decisiones individuales, y estas a su vez dependen de la información disponible al momento de decidir. Cuando la información es asimétrica, fragmentada o está contaminada por desinformación, el resultado agregado no refleja las preferencias reales del electorado sobre políticas públicas concretas, sino su reacción a los estímulos comunicacionales dominantes del ciclo. Este trabajo se sostiene en la convicción de que la deliberación democrática mejora cuando el debate se centra en propuestas verificables antes que en controversias personales o encuestas de intención de voto.

La importancia del proyecto se sostiene en tres dimensiones que operan de manera simultánea. En el plano cívico, la herramienta devuelve al debate público el foco sobre propuestas concretas, contribuyendo a reducir la asimetría informacional del votante (Cedroni & Garzia, 2010). En el plano tecnológico, demuestra que es viable construir infraestructura cívica de calidad profesional con recursos limitados, aprovechando el estado del arte en desarrollo multiplataforma (Meta Platforms, 2024), APIs auto-documentadas (OpenAPI Initiative, 2021) y containerización (Docker Inc., 2024). En el plano académico, constituye un caso de estudio integral que aplica principios sólidos de ingeniería de software (Martin, 2017; Hunt & Thomas, 1999; Beck, 1999), diseño de interfaces (Frost, 2016), estándares de accesibilidad (W3C, 2023) y modelos de dominio complejos con jerarquía polimórfica.

### 1.4 Objetivos

El objetivo general del proyecto consiste en diseñar e implementar una aplicación web progresiva y móvil multiplataforma de asesoramiento electoral para el contexto chileno, con algoritmo de matching transparente y documentado, arquitectura modular, soporte para múltiples elecciones simultáneas con scope territorial, y cumplimiento de estándares de accesibilidad WCAG 2.2 nivel AA (W3C, 2023).

Este objetivo general se descompone en nueve objetivos específicos que orientan la implementación. Se busca implementar un algoritmo de matching robusto que incorpore penalización cuadrática para diferencias extremas, ponderación declarada por el usuario, manejo explícito de respuestas del tipo *no sé*, nivel de confianza asociado al número de preguntas consideradas, desglose por eje temático y filtrado territorial polimórfico. Se busca diseñar un sistema territorial polimórfico que soporte scopes nacional, distrital y comunal sin requerir migraciones de schema para incorporar nuevos niveles. Se busca soportar múltiples elecciones simultáneas con reutilización de preguntas transversales de valores. Se busca aplicar principios SOLID (Martin, 2017), DRY (Hunt & Thomas, 1999) y YAGNI (Beck, 1999) en toda la arquitectura del sistema. Se busca exponer la API bajo el estándar OpenAPI 3.1 (OpenAPI Initiative, 2021) con generación automática del schema y sincronización tipada del cliente. Se busca exponer al usuario las posturas asignadas a cada candidato de manera transparente y consultable dentro de la propia aplicación. Se busca mantener una suite de pruebas automatizadas sobre backend y frontend. Se busca cumplir con las pautas WCAG 2.2 nivel AA en todas las pantallas. Se busca entregar la aplicación en web, iOS y Android desde un único codebase mediante React Native con Expo (Meta Platforms, 2024; Expo, 2024). Y se busca empaquetar el sistema con Docker para despliegue reproducible en cualquier proveedor cloud (Docker Inc., 2024).

### 1.5 Alcances y limitaciones

Toda tesis de ingeniería requiere delimitar con claridad qué queda dentro del proyecto y qué queda fuera, para evitar tanto la sobrepromesa como la ambigüedad sobre lo evaluable. En términos generales, el proyecto cubre las elecciones presidenciales, parlamentarias (diputados por distrito) y municipales (alcaldes por comuna) del ciclo 2024-2025, sobre las dieciséis regiones, veintiocho distritos electorales y trescientas cuarenta y seis comunas del país. La aplicación se entrega en tres plataformas —web como PWA responsive, iOS y Android— desde un único codebase React Native, con el español chileno como idioma principal de la interfaz y del contenido.

En el plano técnico, la solución incorpora un algoritmo de matching con fórmula cuadrática, ponderación declarada por el usuario y filtrado territorial polimórfico; un modelo de datos con diecinueve entidades organizadas en diez submódulos, con signals para consistencia derivada; un contrato API con más de veinticinco endpoints REST bajo OpenAPI 3.1 auto-documentado y con tipos TypeScript generados; cumplimiento de WCAG 2.2 nivel AA en todas las pantallas; una suite de veinticinco archivos de pruebas backend; más de veinte documentos técnicos y accesibles complementarios; empaquetado con Docker con instrucciones de deploy productivo; y exposición al usuario de las posturas asignadas a cada candidato de manera clara y consultable dentro de la propia aplicación. El proyecto contempla además un modo guest cuyo servicio backend está operativo, con la interfaz frontend correspondiente pendiente para roadmap.

Las limitaciones se agrupan en tres categorías. Un primer grupo corresponde a limitaciones del dataset utilizado para el desarrollo y demostración del sistema. El presente trabajo prueba el diseño del sistema, no la curaduría de datos operativos: los candidatos incorporados corresponden a los últimos participantes de cada elección del ciclo cuando la información pública lo permite, o a datos ficticios didácticos en caso contrario, y las posturas asignadas a cada candidato son ilustrativas, construidas a partir de referencias generales de posicionamiento político existente y no como resultado de un proceso de verificación formal contra fuentes primarias. Esta decisión de scope es intencional: la carga y verificación exhaustiva de posturas es un trabajo curatorial masivo que excede las capacidades de una tesis individual, y su ejecución formal corresponde a la etapa posterior de despliegue productivo, momento en el cual el dataset ilustrativo debe reemplazarse por posturas verificadas. El sistema fue diseñado para soportar dicha migración de datos sin modificaciones estructurales.

Un segundo grupo corresponde a limitaciones de alcance electoral: los senadores y consejeros regionales quedan fuera del MVP —aunque el modelo territorial polimórfico los soporta sin cambios de schema—, así como los procesos plebiscitarios, que requieren un modelo pregunta/respuesta distinto. Un tercer grupo corresponde a limitaciones de despliegue productivo: la base de datos SQLite del entorno de desarrollo debe migrar a PostgreSQL para producción, migración documentada pero no ejecutada; no se integró autenticación mediante ClaveÚnica; no hay verificación de correo electrónico; no hay rate limiting productivo; no hay pipeline de CI/CD automatizado; y la migración del modelo territorial se encuentra en su fase intermedia, con FKs legacy conviviendo con la referencia polimórfica nueva por razones de retrocompatibilidad. Finalmente, el proyecto no incluye análisis empírico de uso con usuarios reales, no cuenta con auditoría externa de seguridad, y no ejecutó evaluación de accesibilidad con personas usuarias con discapacidad, limitaciones que se explicitan como deuda técnica priorizada en las conclusiones.

Estas limitaciones no invalidan la propuesta: se documentan explícitamente porque la honestidad sobre lo entregado y lo pendiente es un requisito de un trabajo académico serio. Cada una de ellas se traduce en un ítem de deuda priorizada que se aborda en la sección 6.4.

Conceptualmente, el proyecto se enmarca dentro de la categoría de Voting Advice Application con enfoque de matching cuantitativo (Cedroni & Garzia, 2010). No pretende ser un sistema de recomendación personalizado al estilo del comercio electrónico —no perfila a la persona usuaria ni le sugiere candidatos por comportamiento pasado—, ni un chatbot conversacional, ni un asistente basado en modelos de lenguaje grandes, ni un fact-checker de propuestas —el proyecto asume las posturas declaradas como fuente y no las evalúa por veracidad—, ni un sistema oficial ni un sustituto del voto informado; es una herramienta complementaria de apoyo a la decisión.

<!--PAGE_BREAK-->

---

## 2. Definición del problema

### 2.1 Enunciado general

El votante chileno enfrenta un problema estructural de asimetría de información al momento de decidir su voto: dispone de tiempo limitado, canales de información fragmentados y polarizados, y ninguna herramienta institucional o civil que le permita comparar de forma sistemática y transparente las posturas de los candidatos frente a políticas públicas concretas. Este problema puede formalizarse como una decisión multi-nivel bajo información incompleta, en la que la persona debe estimar una función de afinidad entre sus propias preferencias y las de un conjunto de candidaturas competidoras, en un proceso electoral que a menudo se ejecuta simultáneamente en varios niveles territoriales.

La complejidad del problema es multiplicativa porque el votante decide sobre varias elecciones activas con distintos niveles de scope territorial: la elección presidencial opera a nivel nacional, la parlamentaria a nivel distrital y la municipal a nivel comunal. Cada nivel presenta un conjunto de candidaturas diferente, con programas propios y con temas de agenda diferenciados. Sin una herramienta integradora, la persona debe reconstruir manualmente esta matriz de comparación para cada elección, un esfuerzo que en la práctica pocas personas ejecutan de manera completa.

### 2.2 Quiénes tienen el problema y quiénes se benefician al resolverlo

El problema afecta principalmente a los votantes chilenos habilitados, aunque con distintos niveles de intensidad según su perfil sociodemográfico y cognitivo. Las personas con interés activo por comparar propuestas suelen reconocer el problema con claridad, pero no encuentran soluciones eficientes; terminan invirtiendo horas en lecturas parciales que rara vez alcanzan a cubrir todas las candidaturas de todas las elecciones simultáneas. Las personas desconfiadas del sistema político, por su parte, abandonan la búsqueda activa de información programática por saturación o cinismo, y terminan votando por adhesión partidaria heredada, por imagen o por rechazo. Las personas jóvenes que votan por primera vez —segmento particularmente relevante desde la reintroducción del voto obligatorio en Chile— carecen del capital político previo para orientar su decisión. Las personas con discapacidad encuentran adicionalmente barreras de acceso en las guias electorales tradicionales, diseñadas mayoritariamente sin considerar los estándares de accesibilidad web (W3C, 2023). Y las personas que viven fuera de los grandes centros urbanos ven cómo la oferta de candidaturas locales recibe menos cobertura mediática que la de las capitales regionales o de Santiago.

Secundariamente, el problema afecta al ecosistema democrático completo: periodistas, investigadores, docentes, organizaciones de sociedad civil y las propias candidaturas operan sin infraestructura comparativa transparente y sin acceso a un dataset común y comparable de posturas programáticas. Esta ausencia obliga a cada actor a construir sus propias herramientas parciales, replicando trabajo y limitando la posibilidad de acumulación de conocimiento cruzado.

Resolver el problema, por tanto, beneficia a múltiples actores simultáneamente. El votante individual reduce el costo cognitivo de comparar, dispone de criterios explícitos para su decisión y recupera tiempo que puede invertir en otras dimensiones de su participación cívica. La ciudadanía organizada dispone de una fuente común auditable para conversaciones familiares, laborales o educativas sobre las elecciones. Los equipos de investigación y periodismo político acceden a un modelo comparativo estructurado que permite análisis agregados sobre coherencia programática y volatilidad de posturas. Las candidaturas reciben retroalimentación sobre la coherencia interna de sus programas y un incentivo a explicitar sus posturas de manera clara y consultable por el electorado. El ecosistema tecnológico chileno se enriquece con un ejemplo de proyecto cívico de calidad profesional construido con recursos limitados, que deja un modelo de diseño reutilizable para otras iniciativas gubernamentales o de sociedad civil. Y las instituciones democráticas mejoran su representatividad al reducir la brecha entre las mayorías programáticas del electorado y quienes resultan electos.

### 2.3 Cuál es el problema específico

El problema tiene múltiples manifestaciones concretas identificadas durante la fase de investigación. La oferta actual de información electoral en Chile presenta sobrecarga informativa —los programas oficiales superan las capacidades atencionales del votante promedio—, sesgo mediático —la cobertura de prensa privilegia titulares y controversias por sobre la comparación programática—, presencia sistemática de desinformación organizada —circulación masiva de contenido falso y noticias manipuladas en redes sociales y aplicaciones de mensajería—, fragmentación de fuentes —la información sobre un mismo candidato se dispersa entre programa oficial, entrevistas, redes propias y medios afines u hostiles—, falta generalizada de trazabilidad —cuando un medio afirma que un candidato propone algo, raramente se cita la fuente primaria verificable— y complejidad multi-elección —el votante debe decidir simultáneamente sobre presidencial, diputados por distrito, alcalde por comuna y otros procesos, cada uno con listas distintas.

Los intentos previos de VAA en Chile han presentado también limitaciones específicas. La discontinuidad operativa entre elecciones ha sido la constante: las iniciativas se activaron para un ciclo específico y luego fueron abandonadas, perdiendo el capital técnico y de datos acumulado. Los algoritmos han sido opacos: no se han publicado las fórmulas de matching, imposibilitando la auditoría independiente. El código ha permanecido cerrado, sin liberación bajo licencias libres que permitan replicabilidad, mejora comunitaria o auditoría del comportamiento del sistema. Los datos han carecido de verificabilidad, sin URL de fuente primaria por postura ni justificación textual auditable. Y la cobertura territorial se ha limitado a lo nacional, ignorando la dimensión distrital y comunal donde el votante enfrenta candidatos diferentes según su ubicación geográfica.

Del análisis comparativo con VAAs internacionales surgieron además limitaciones técnicas comunes que la solución busca evitar. La mayoría de las herramientas usan algoritmos lineales simplistas que promedian diferencias sin penalizar con mayor severidad las diferencias extremas. Suelen ausentar una opción honesta de *no sé*, forzando al usuario a una posición neutral cuando en realidad no tiene opinión y distorsionando el cálculo. No exponen un nivel de confianza al resultado, presentando un match del ochenta por ciento basado en tres preguntas con la misma autoridad que uno basado en treinta. No entregan explicabilidad por dimensión, mostrando un porcentaje global sin desglose por eje temático. No entregan explicabilidad pregunta-a-pregunta, impidiendo al usuario cuestionar qué preguntas contribuyeron más o menos al resultado final. Y muy pocas cumplen con las directrices de accesibilidad WCAG (W3C, 2023), excluyendo estructuralmente a segmentos completos del electorado.

### 2.4 Dónde y en qué proceso está el problema

El problema tiene una localización nacional en Chile, pero con dimensiones específicas que lo hacen distinto de contextos internacionales comparables. En el nivel institucional, no existe una institución pública ni universidad chilena que mantenga una VAA activa entre elecciones, lo que contrasta con la existencia de Wahl-O-Mat operado por la agencia federal alemana para la educación cívica (bpb, 2024), StemWijzer sostenido por la fundación neerlandesa ProDemos (ProDemos, 2024) o Smartvote mantenido por la organización suiza Politools (Smartvote, 2024). En el nivel mediático, los medios chilenos han publicado cuestionarios electorales puntuales durante campañas específicas, sin sostenerlos entre ciclos. En el nivel territorial, incluso las iniciativas puntuales han cubierto casi exclusivamente la elección presidencial, ignorando las decisiones distritales y comunales donde el votante enfrenta candidatos diferentes según su ubicación geográfica. En el nivel digital, la información electoral oficial existe (SERVEL, 2024) pero se distribuye en formatos administrativos orientados al escrutinio, no al votante, y no hay API pública que exponga posturas programáticas en formato consumible por aplicaciones de terceros. En el nivel de confianza, la circulación de desinformación en redes sociales y aplicaciones de mensajería documentada por verificadores como Fast Check CL (2024) y Mala Espina Check (2024) erosiona la confianza en las fuentes disponibles.

El problema se manifiesta además a lo largo del ciclo completo de decisión del votante, con distintas intensidades por etapa. En la etapa de exposición inicial, meses antes de la elección, el votante empieza a percibir a los candidatos por cobertura mediática y redes sociales, sin criterio programático organizado. En la etapa de búsqueda activa, semanas antes de la votación, el votante interesado intenta comparar posturas y choca con la fragmentación de fuentes y la falta de una herramienta comparativa transparente. En la etapa de decisión final, días antes o durante el voto, la persona decide con la información parcial acumulada, en muchos casos por adhesión partidaria previa, imagen o rechazo antes que por convergencia programática sustantiva. En la etapa posterior al voto, sin herramienta de trazabilidad, el votante pierde la capacidad de contrastar retrospectivamente si el electo cumple las posturas que declaró durante la campaña.

### 2.5 Cómo se resuelve actualmente

Actualmente el problema se resuelve, de forma parcial e insatisfactoria, mediante varios canales complementarios. La lectura directa de los programas oficiales publicados en el portal del Servicio Electoral de Chile (SERVEL, 2024) requiere horas de trabajo por candidato y no ofrece comparación sistemática ni criterios para la ponderación personal. La cobertura mediática de programas de televisión, radios y prensa escrita ofrece síntesis, pero suele privilegiar controversias sobre propuestas y opera bajo líneas editoriales que aportan sesgos previsibles. Las conversaciones informales con familia, amistades o colegas quedan sesgadas por la burbuja social del interlocutor. Las redes sociales de los propios candidatos y de terceros presentan alto ruido informacional, con presencia de desinformación verificada por Fast Check CL (2024) y Mala Espina Check (2024).

En el ecosistema chileno existen además varias iniciativas que se han acercado parcialmente al problema. *Votamos Todos*, iniciativa creada por Zismo y activa entre 2021 y 2022, incorporó un cuestionario de setenta preguntas que el usuario podía ir respondiendo en tramos de cinco en cinco, generando un match parcial desde las primeras cinco respuestas contra las respuestas de los candidatos, quienes habían respondido las mismas preguntas. Es el antecedente más cercano al modelo VAA propiamente tal en Chile, pero su cobertura se limitó al plebiscito constitucional y actualmente se encuentra discontinuada. *Decide Chile* ofrece información electoral, predicción de resultados y componentes lúdicos, sin componente algorítmico de matching personalizado. *Vota Inteligente* difunde propuestas de candidaturas sin componente de matching. E *Infovecino* entrega información electoral personalizada por comuna, también sin matching. En el plano regional, *Voto Informado del INE* en México e *Voto Informado del JNE* en Perú son ejemplos de plataformas oficiales orientadas al directorio institucional más que al matching algorítmico personalizado; *Infovotantes* en Colombia y *VotaPE* en Perú siguen líneas similares. Ninguna de estas alternativas está disponible para el contexto electoral chileno con sus características específicas.

Esta oferta actual no cumple simultáneamente con las cinco características identificadas en 1.1 —algoritmo documentado, exposición transparente de posturas por candidato, cobertura multi-nivel, accesibilidad WCAG y continuidad operativa—, lo que motiva el desarrollo del presente proyecto.

### 2.6 Por qué es un problema

Es un problema porque las decisiones colectivas tomadas con información asimétrica generan consecuencias observables en tres niveles. En el plano individual, el votante toma decisiones que no reflejan sus preferencias reales sobre políticas públicas concretas; encuestas del Centro de Estudios Públicos y Latinobarómetro muestran que un porcentaje significativo del electorado chileno declara no conocer las propuestas específicas de los candidatos por los que vota. En el plano institucional, se erosiona la representatividad democrática: los electos no siempre reflejan las mayorías programáticas del electorado, sino las mayorías de reacción a los estímulos comunicacionales del ciclo. En el plano democrático agregado, la deliberación pública se degrada: el debate se centra en personajes en lugar de propuestas, y la polarización afectiva reemplaza a la discusión política sustantiva, patrón ampliamente documentado en la literatura politológica internacional (Garzia & Marschall, 2014).

Adicionalmente, es un problema tecnológicamente resoluble. El estado del arte en desarrollo móvil multiplataforma (Meta Platforms, 2024), APIs auto-documentadas (OpenAPI Initiative, 2021) y containerización (Docker Inc., 2024) permite construir la solución con recursos limitados. No existe barrera técnica que justifique su ausencia en el ecosistema chileno; es una brecha institucional y de asignación de esfuerzo, no una brecha de capacidad tecnológica.

<!--PAGE_BREAK-->

---

## 3. Marco conceptual

### 3.1 Voting Advice Applications

Las Voting Advice Applications o VAAs son sistemas de apoyo a la decisión electoral que comparan las preferencias declaradas del votante con las de partidos o candidatos, entregando un ranking de afinidad ordenado y, en algunos casos, visualizaciones complementarias como radares por dimensión o mapas bidimensionales de posicionamiento ideológico. Su origen se remonta a *StemWijzer* en Países Bajos en 1989, inicialmente distribuido en formato disquete y hoy disponible como aplicación web con millones de consultas por elección. La literatura politológica ha estudiado extensamente su impacto sobre la participación, la formación de preferencias y la volatilidad electoral (Cedroni & Garzia, 2010; Garzia & Marschall, 2014; Marschall, 2005), documentando efectos medibles sobre las decisiones de voto en países con alta penetración (Walgrave et al., 2008).

### 3.2 Estado del arte

En el ecosistema europeo, cuatro herramientas concentran la mayor tradición y sostenibilidad. *StemWijzer* es la VAA más antigua del mundo y ha establecido el estándar del rubro con un algoritmo de proximidad basado en escala de tres opciones; su código no es abierto y su algoritmo no está documentado en detalle públicamente. *Wahl-O-Mat*, operado por la agencia federal alemana para la educación cívica (bpb, 2024) desde 2002, se basa en tesis políticas con tres opciones de respuesta, permite ponderar por importancia y publica su metodología de matching (Marschall, 2005); su respaldo institucional continuo entre elecciones lo convierte en la referencia europea con mayor sostenibilidad. *Smartvote*, operado por la organización suiza Politools, cubre múltiples niveles electorales simultáneamente (federal, cantonal y comunal), una característica rara entre VAAs, y presenta al usuario un gráfico de radar con ocho dimensiones ideológicas junto con un mapa bidimensional. *Kieskompas*, desarrollado por la Universidad de Ámsterdam, introduce el paradigma del mapa bidimensional donde el usuario y los partidos se ubican en un plano cartesiano con eje económico y eje cultural.

En América, la adopción ha sido más limitada. *Vote Compass*, operado por Vox Pop Labs en Canadá y Australia desde 2011, opera en alianza con las cadenas públicas CBC y ABC respectivamente, factor crítico de su alcance masivo. En Latinoamérica, las plataformas oficiales *Voto Informado del INE* (México) y *Voto Informado del JNE* (Perú) agregan perfiles y programas de candidaturas, priorizando el directorio institucional por sobre el matching personalizado. *Infovotantes* en Colombia ofrece información sobre votaciones y candidatos sin componente algorítmico. *VotaPE* en Perú combina información de candidatos, comparación directa, planes de gobierno, noticias y contenido en formato podcast. Estas iniciativas comparten un patrón común: privilegian la agregación y presentación estructurada de información oficial de candidaturas sobre la construcción de un algoritmo de proximidad personalizada, lo que las diferencia estructuralmente de las VAAs europeas.

En Chile se han identificado varias iniciativas con distintos grados de cercanía al modelo VAA. La más cercana es *Votamos Todos*, creada por Zismo y activa entre 2021 y 2022 con un cuestionario de setenta preguntas y matching contra las respuestas de los candidatos; su cobertura, sin embargo, se limitó al plebiscito constitucional y no se extendió a elecciones presidenciales, parlamentarias ni municipales. *Decide Chile* opera como plataforma de información electoral, predicción de resultados y componentes lúdicos, sin matching personalizado. *Vota Inteligente* difunde propuestas de candidaturas sin componente algorítmico. *Infovecino* entrega información electoral personalizada por comuna, también sin matching. Ninguna de estas iniciativas cumple simultáneamente con las seis características identificadas como necesarias en 1.1, siendo *Votamos Todos* la más cercana al concepto de VAA propiamente tal pero limitada en cobertura electoral. El Anexo C presenta la comparativa detallada con todas las iniciativas mencionadas.

De la revisión conjunta emergen tres factores comunes en las VAAs sostenibles: respaldo institucional continuo entre elecciones, integración con periodismo político o educación cívica formal, y transparencia metodológica sobre el algoritmo. La ausencia de estos tres factores explica en buena medida la fragilidad de las iniciativas latinoamericanas descritas.

### 3.3 Fundamentos técnicos del algoritmo

El algoritmo de matching se sostiene sobre dos pilares teóricos. Por una parte, la escala Likert (Likert, 1932) es un instrumento psicométrico ampliamente utilizado en investigación social para medir actitudes; en este proyecto se adopta la variante de cinco puntos por ser el *sweet spot* documentado entre resolución y fatiga cognitiva (Krosnick & Presser, 2010), incorporando además una sexta opción explícita de *no sé* que se excluye del cálculo. Por otra parte, para el cómputo de afinidad se adopta una distancia ponderada no-lineal que penaliza cuadráticamente las diferencias, siguiendo el enfoque coherente con la literatura sobre distancias euclidianas ponderadas en el análisis multidimensional de posiciones políticas (Garzia & Marschall, 2014). La fórmula concreta calcula la diferencia absoluta entre el valor Likert del usuario y el del candidato, normaliza por el rango máximo, la eleva al cuadrado y la resta de la unidad, obteniendo un score entre cero y uno que luego se pondera por un multiplicador declarado por la persona usuaria según la importancia percibida de cada pregunta.

### 3.4 Fundamentos del modelo de dominio

El diseño del modelo `UnidadTerritorial` implementa el patrón *polymorphic hierarchical entity*, donde una única tabla representa unidades de distintos niveles relacionadas mediante una referencia auto-recursiva. Este patrón, común en la modelación de estructuras administrativas y ontologías (Fowler, 2003), permite agregar nuevos niveles jerárquicos sin migraciones de schema y facilita queries de ancestros y descendientes recursivos, aspecto crítico para el filtrado territorial de candidatos según el scope de cada tipo de elección.

### 3.5 Fundamentos de la arquitectura de software

La arquitectura se sostiene sobre cinco cuerpos de conocimiento canonicos. Los principios SOLID de Martin (2017) orientan la modularización del backend, particularmente Single Responsibility Principle en la organización de submódulos por dominio. El principio DRY de Hunt y Thomas (1999) guía la eliminación de duplicación en modelos, serializadores y vistas. El principio YAGNI de Beck (1999) opera como filtro para no implementar features sin necesidad demostrada, y se aplica retroactivamente en la Fase 5 del proyecto para eliminar componentes sin uso práctico. La Clean Architecture de Martin (2017) informa la separación de capas y las dependencias unidireccionales. Y el enfoque de las Twelve-Factor App de Wiggins (2011) orienta la configuración externa, la declaración explícita de dependencias y los procesos sin estado.

### 3.6 Fundamentos del diseño de interfaz

La organización del frontend sigue la metodología Atomic Design de Frost (2016), que estructura la interfaz en cinco niveles jerárquicos: átomos, moléculas, organismos, templates y pantallas. El proyecto aplica los cinco niveles con implementación real de templates a través del componente `AppShell`, evitando el error común de saltarse el nivel de template y perder la separación entre layout y contenido.

El cumplimiento de accesibilidad se orienta por las *Web Content Accessibility Guidelines* 2.2 del W3C (2023), que definen criterios de éxito organizados en cuatro principios: perceptibilidad, operabilidad, comprensibilidad y robustez. El proyecto se compromete con el nivel AA, lo que implica contrastes mínimos definidos por umbrales numéricos, tamaños mínimos de tap targets, navegación completa por teclado y compatibilidad con tecnologías asistivas como lectores de pantalla.

### 3.7 Fundamentos del contrato entre backend y frontend

La comunicación entre el backend Django y el frontend React Native se organiza bajo el paradigma *contract-first*, en el cual el contrato —schema OpenAPI 3.1 en este caso— se define antes que la implementación y sirve como fuente única de verdad para ambas partes (OpenAPI Initiative, 2021). Este enfoque elimina el *drift* entre las expectativas del cliente y las respuestas del servidor, un problema recurrente en arquitecturas donde el contrato se documenta después de implementar. La gestión de cache en el frontend se apoya en el patrón de *query keys* jerárquicos introducido por TanStack Query en su versión cinco (Linsley, 2024), que permite invalidaciones granulares del cache y evita el drift entre puntos de invalidación dispersos en el código.

<!--PAGE_BREAK-->

---

## 4. Propuesta de solución

### 4.1 Autoría y filosofía de la propuesta

La solución *matchVote* es propuesta y desarrollada por Jenifer Castillo como trabajo de tesis para optar al grado de Ingeniera en Informática. El proyecto es individual en cuanto al desarrollo, con orientación del profesor guía y la comisión evaluadora de la carrera. El algoritmo de matching y las decisiones de arquitectura se documentan explícitamente en la propia tesis —particularmente en las secciones 4.7 y 4.8—, con el objetivo de que cualquier lectora o lector pueda comprender la lógica de recomendación sin necesidad de inspeccionar el código fuente, y de que la comisión evaluadora pueda validar directamente los criterios de matching contra los parámetros declarados.

### 4.2 En qué consiste la solución

Se propone construir una aplicación web progresiva y móvil multiplataforma que sirva como Voting Advice Application para el contexto electoral chileno. La solución integra un backend en Django con Django REST Framework y base de datos SQLite en desarrollo o PostgreSQL en producción; un frontend en React Native con Expo, entregable simultáneamente como aplicación web responsive, iOS y Android desde un único codebase; un contrato API bajo OpenAPI 3.1 auto-generado, con tipos TypeScript sincronizados en el frontend; un algoritmo de matching cuadrático con ponderación declarada por el usuario, manejo explícito de respuestas *no sé*, nivel de confianza y explicación pregunta-a-pregunta; un modelo territorial polimórfico que representa las dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas de Chile; un sistema de diseño interno con showcase completo y cumplimiento WCAG 2.2 AA (W3C, 2023); y un empaquetado con Docker para despliegue reproducible en cualquier proveedor cloud (Docker Inc., 2024). La solución no reemplaza al Servicio Electoral de Chile ni al debate público; los complementa entregando una capa comparativa transparente que hoy no existe.

En términos cuantitativos, la solución se compone de diecinueve modelos de dominio organizados en diez submódulos, once submódulos de vistas con más de veinticinco endpoints REST, nueve submódulos de serializadores, cinco servicios de lógica de dominio, dieciséis comandos de gestión para importadores y seeds, treinta y ocho migraciones que registran la evolución del schema, veinticinco archivos de pruebas backend, dieciocho pantallas funcionales más una pantalla oculta de sistema de diseño, veintisiete átomos, veintinueve moléculas y diecisiete organismos siguiendo atomic design (Frost, 2016), y más de veinte documentos de arquitectura, algoritmo, accesibilidad y navegación.

### 4.3 Distribución del impacto

El impacto de la solución se distribuye temporalmente en los mismos cuatro momentos del ciclo del votante identificados en la definición del problema. Está disponible desde el momento en que se publican las candidaturas oficiales, permitiendo al votante familiarizarse con las opciones antes de la sobrecarga informativa mediática. Reduce el costo de la búsqueda activa estructurada de horas a minutos, entregando una comparación sistemática que no existe en otras fuentes. Entrega criterios explícitos y auditables para la decisión final, sin sustituirla. Y persiste las respuestas del usuario para permitir trazabilidad retroactiva una vez conocidos los resultados electorales.

Espacialmente, la solución opera desde el navegador web y las tiendas de aplicaciones móviles —App Store de iOS y Play Store de Google—, complementando la infraestructura digital ya existente del ecosistema electoral chileno. Impacta directamente en tres puntos del ciclo: como punto de acceso ciudadano, sirve como capa comparativa entre el votante y la información oficial del SERVEL (SERVEL, 2024), sin reemplazarla; como punto de decisión territorial, gracias a su modelo polimórfico jerárquico (Fowler, 2003), impacta simultáneamente en la decisión nacional, distrital y comunal, reflejando la realidad de que un mismo votante decide sobre varias elecciones a la vez; y como punto de accesibilidad, al cumplir WCAG 2.2 nivel AA (W3C, 2023), impacta positivamente en segmentos habitualmente excluidos de las guias electorales tradicionales.

Los beneficios concretos se distribuyen entre múltiples actores. El votante individual reduce el tiempo de comparación de horas a cinco o diez minutos por elección activa, obtiene un ranking objetivo con criterios explícitos, se asegura el filtro automático de candidatos por ubicación, dispone de explicación pregunta-a-pregunta y accede a un servicio sin costo, sin publicidad y sin extracción de datos personales. La ciudadanía organizada dispone de una fuente común para conversaciones familiares, laborales o educativas sobre la elección. Las candidaturas reciben retroalimentación indirecta sobre la coherencia interna de sus programas y un incentivo a explicitar sus posturas de manera precisa. Y las personas con discapacidad acceden a una herramienta compatible con lectores de pantalla, navegación por teclado y contrastes conformes al estándar WCAG AA.

### 4.4 Metodología y cronograma

El proyecto se desarrolló siguiendo una metodología iterativa e incremental, con sprints de una semana, entregas verticales end-to-end por feature, refactorización guiada por auditorías periódicas del código y aplicación estricta del principio YAGNI (Beck, 1999). El trabajo se organizó en ocho fases sucesivas con solapamientos parciales.

La Fase 0 abarcó la investigación y el análisis del estado del arte, con revisión de literatura politológica (Cedroni & Garzia, 2010; Garzia & Marschall, 2014; Walgrave et al., 2008) y comparativa de nueve VAAs internacionales. La Fase 1 diseñó la arquitectura y el contrato API inicial bajo OpenAPI 3.1 (OpenAPI Initiative, 2021). La Fase 2 implementó el MVP con sprints funcionales end-to-end de autenticación, catálogo, cuestionario, matching, resultados y noticias. La Fase 3 ejecutó una auditoría de código con diecisiete hallazgos iniciales, de los cuales se resolvieron cuatro críticos de seguridad y seis de severidad alta. La Fase 4 introdujo la expansión territorial y multi-elección, incorporando los modelos `Region`, `Distrito`, `Comuna` y `UnidadTerritorial` polimórfico, junto con el campo `es_base` para preguntas transversales. La Fase 5 aplicó simplificación agresiva bajo el principio YAGNI, eliminando el flujo swipe original y el módulo `DecisionFinal`, y unificando favoritos y descartados en un componente compartido. La Fase 6 construyó el sistema de diseño interno y ejecutó la auditoría WCAG. La Fase 7 reorganizó la documentación en dos niveles paralelos, uno técnico y uno accesible, y produjo el presente documento.

La Tabla 2 resume el cronograma con las duraciones estimadas por fase.

**Tabla 2**

*Cronograma de fases y sprints*

| Fase | Actividad principal | Duración | Entregable clave |
|:----:|---------------------|:--------:|------------------|
| 0 | Investigación y estado del arte | 3 semanas | Comparativa de VAAs, definición del problema |
| 1 | Diseño de arquitectura y contrato API | 2 semanas | Modelo inicial, primer esquema OpenAPI |
| 2 | MVP inicial (backend + frontend) | 10 semanas | Flujo end-to-end funcional |
| 3 | Auditoría de código y refactorización | 3 semanas | Resolución de 4 críticos + 6 altos |
| 4 | Expansión territorial y multi-elección | 5 semanas | Modelos territoriales, `es_base`, seeds |
| 5 | Simplificación YAGNI | 2 semanas | Eliminación de swipe y `DecisionFinal` |
| 6 | Sistema de diseño y accesibilidad | 3 semanas | Sistema de diseño interno, guía WCAG |
| 7 | Documentación y tesis | 4 semanas | Documentación backend y este documento |

*Nota.* Elaboración propia. La duración total estimada asciende a treinta y dos semanas, aproximadamente ocho meses.

**Figura 3**

*Carta Gantt del proyecto por fases y sprints*

```
Semanas:  1--3  4-5  6---------15  16-18  19-23  24-25  26-28  29-32
          |     |    |             |      |      |      |      |
Fase 0 :  ###
Fase 1 :        ##
Fase 2 :             ##########
Fase 3 :                            ###
Fase 4 :                                    #####
Fase 5 :                                            ##
Fase 6 :                                                    ###
Fase 7 :                                                             ###
```

*Nota.* Elaboración propia. Cada símbolo representa aproximadamente una semana. Las fases se ejecutaron principalmente en serie, con solapamientos parciales entre 3-4 y 6-7 según requerimientos específicos.

### 4.5 Flujo del usuario

Desde la perspectiva de la persona usuaria, la experiencia comienza con una pantalla de splash y un tour de bienvenida de cinco slides que se muestra solo en el primer arranque. A continuación el usuario decide entre registrarse o iniciar sesión con cuenta existente. El registro utiliza hashing PBKDF2-SHA256 con seiscientas mil iteraciones (Django Software Foundation, 2024) y activa automáticamente un signal que crea el perfil asociado. Como paso opcional pero recomendado, el usuario selecciona su ubicación —región, comuna o simplemente omite el paso— lo que actualiza el perfil y sincroniza automáticamente la referencia territorial polimórfica.

El centro de la aplicación es el Home HUB, una pantalla que muestra tarjetas por cada proceso electoral activo, cada una con estado actual del cuestionario y llamado a la acción contextual. Desde este HUB el usuario puede gestionar qué elecciones tiene activas, ingresar al cuestionario correspondiente o consultar el feed de novedades. El cuestionario presenta preguntas del tipo de elección activa más las preguntas base transversales, cada una con escala Likert de uno a cinco (Likert, 1932), una sexta opción de *no sé* y un selector de peso que permite marcar la pregunta como poco importante, importante o crítica.

Al enviar las respuestas al backend, el sistema calcula el match mediante el servicio `calcular_match` y persiste el resultado en la tabla `MatchCandidato`. El usuario accede entonces a la pantalla de resultados, que muestra un componente hero con el mejor match y filas ordenadas de ranking. Cada candidato es explorable en detalle: un radar visualiza la afinidad por eje temático, una sección *¿Por qué este match?* explicita el desglose pregunta-a-pregunta, se listan las posturas con su fuente primaria y las noticias asociadas. El usuario también puede comparar directamente dos o más candidatos mediante la pantalla de comparación, con un toggle que oculta las coincidencias y muestra solo las diferencias.

La gestión de guardados se centraliza en la pantalla `MisGuardadosScreen`, que unifica tres tabs: favoritos, descartados y posturas guardadas. Rutas adicionales incluyen el feed de novedades, el perfil y configuración, la recuperación de contraseña, la edición de respuestas previas y un modo anónimo cuyo servicio backend `calcular_match_anonimo` está operativo aunque la interfaz frontend correspondiente permanece en el roadmap. Existe además una pantalla oculta `DesignSystemScreen` con showcase completo de todos los componentes siguiendo atomic design (Frost, 2016), útil para el desarrollo interno y para futuros contribuidores externos.

**Figura 1**

*Diagrama de flujo del usuario principal*

```
[Splash] --> [Welcome tour] --> [Login / Signup]
                                        |
                                        v
                            [Seleccion de ubicacion]
                                        |
                                        v
                            +----------------------+
                            |  Home HUB            |
                            |  (multi-eleccion)    |<----+
                            +----------------------+     |
                                    |                    |
                                    v                    |
                            [Cuestionario]               |
                                    |                    |
                                    v                    |
                            [Envio respuestas]           |
                                    |                    |
                                    v                    |
                            [Calculo match]              |
                                    |                    |
                                    v                    |
                            +-------------+              |
                            | Resultados  |              |
                            +-------------+              |
                                    |                    |
                    +---------------+-----------+        |
                    v               v           v        |
            [Detalle cand.]  [Comparar]  [Guardados] ----+
```

*Nota.* Elaboración propia.

### 4.6 Stack tecnológico y arquitectura

El stack tecnológico se diseñó privilegiando la madurez de las herramientas, la productividad por línea de código y la posibilidad de operar todo el sistema con un solo desarrollador. La Tabla 3 resume las decisiones principales por capa.

**Tabla 3**

*Stack tecnológico del proyecto*

| Capa | Tecnología | Rol |
|------|------------|-----|
| Framework backend | Django 5.2 (Django Software Foundation, 2024) + Django REST Framework 3.15+ | ORM, admin, serialización, viewsets |
| Schema y contrato API | drf-spectacular + OpenAPI 3.1 (OpenAPI Initiative, 2021) | Generación automática de schema |
| Base de datos | SQLite en desarrollo, PostgreSQL en producción | Zero-config en dev, production-ready en prod |
| Package manager Python | uv (Astral, 2024) | Instalación rápida y bloqueo de dependencias |
| Runtime frontend | React Native + Expo SDK 57 (Meta Platforms, 2024; Expo, 2024) | Framework multiplataforma |
| UI kit | Tamagui | Sistema de componentes con theming |
| Data fetching | TanStack Query v5 (Linsley, 2024) | Cache, retry, deduplicación |
| Estado global | Zustand (pmndrs, 2024) | Estado ligero sin boilerplate |
| Tipado | TypeScript strict (Microsoft, 2024) + openapi-typescript | Tipos generados desde schema |
| Almacenamiento seguro | Expo SecureStore | Persistencia de tokens |
| Testing | pytest + pytest-django (backend), Jest + RNTL (frontend) | Suite de pruebas automatizadas |
| Containerización | Docker (Docker Inc., 2024) | Deploy reproducible |

*Nota.* Elaboración propia a partir del `pyproject.toml` y el `package.json` del proyecto.

La arquitectura general del sistema se organiza en dos servicios independientes comunicados por HTTPS y JSON. El backend Django expone la API REST bajo el contrato OpenAPI 3.1, con capas de vistas, serializadores, modelos y servicios claramente separadas y organizadas por dominio en submodulos independientes. El frontend React Native consume la API a través de tipos TypeScript generados automáticamente desde el schema, y organiza su código siguiendo atomic design con átomos, moléculas, organismos y templates, más pantallas que componen la experiencia.

**Figura 2**

*Arquitectura general del sistema*

```
+------------------+       HTTPS/JSON       +------------------+
|                  |     +---------------+  |                  |
|  Frontend        |<--->| OpenAPI 3.1   |<>|  Backend         |
|  React Native +  |     | schema        |  |  Django + DRF    |
|  Expo (web/iOS/  |     +---------------+  |                  |
|  Android)        |                        |  Modelos (10)    |
|                  |                        |  Serializers (9) |
|  Atomic Design   |                        |  Views (11)      |
|  + Zustand +     |                        |  Services (5)    |
|  TanStack Query  |                        |                  |
+------------------+                        +------------------+
                                                    |
                                                    v
                                            +------------------+
                                            |  DB SQLite (dev) |
                                            |  DB PostgreSQL   |
                                            |  (produccion)    |
                                            +------------------+
```

*Nota.* Elaboración propia.

### 4.7 Modelo de dominio

El backend define diecinueve modelos organizados en diez submódulos dentro de `core/models/`. El catálogo electoral se compone de `TipoEleccion` y `Candidato`. El submodulo territorial agrupa `Region`, `Distrito`, `Comuna` y la abstracción polimórfica `UnidadTerritorial` que sostiene la jerarquía. El perfil de usuario se modela mediante `UserProfile`. El cuestionario se estructura con `Pregunta`, `OpcionRespuesta` y `RespuestaUsuario`. Los ejes temáticos se modelan como entidad `Eje`, refactor introducido en la Fase 4 que reemplaza la representación original como campo enum. El sistema de matching persiste posturas y resultados en `PosturaCandidato` y `MatchCandidato`. Los datos de usuario relacionados a candidatos y contenido se representan en `CandidatoFavorito`, `CandidatoDescartado`, `PosturaBookmark` y `NoticiaBookmark`. La autenticación auxiliar incluye `PasswordResetToken`. Y el contenido informativo agrega el modelo `Noticia`. Cabe notar que el modelo `DecisionFinal` original fue eliminado en la migración `0037` como parte del sprint YAGNI (Beck, 1999) que consolidó los flujos de guardado en la pantalla unificada.

### 4.8 Algoritmo de matching

El corazón lógico de la aplicación reside en tres servicios definidos en `core/services/matching.py`. La variante autenticada `calcular_match` recibe un usuario y un tipo de elección, calcula la afinidad contra todos los candidatos elegibles según filtrado territorial, y persiste los resultados en `MatchCandidato` como fuente para consultas posteriores. La variante detallada `calcular_match_detalle` recibe un usuario y un candidato específico, y retorna el desglose pregunta-a-pregunta con score individual, diferencia numérica y peso aplicado. La variante anónima `calcular_match_anonimo` opera sin persistir, aceptando respuestas en el cuerpo del request y devolviendo el ranking calculado; sirve al modo guest de la aplicación.

#### 4.8.1 La fórmula por pregunta

El algoritmo procesa cada pregunta del cuestionario aplicando cuatro pasos matemáticos sucesivos. Primero calcula la diferencia absoluta entre el valor Likert del usuario y el del candidato, en un rango de cero a cuatro sobre la escala Likert de uno a cinco. Segundo, normaliza esa diferencia dividiéndola por el rango máximo posible —cuatro—, obteniendo un valor entre cero y uno. Tercero, eleva ese valor normalizado al cuadrado, penalizando así con mayor severidad las diferencias extremas. Cuarto, resta el resultado de la unidad, obteniendo el score de la pregunta: uno significa identidad completa entre usuario y candidato en esa pregunta, cero significa oposición máxima. La expresión formal es la siguiente:

```
score_pregunta = 1 - (|valor_usuario - valor_candidato| / 4)^2
```

Al score obtenido se le aplica el multiplicador de peso declarado por el usuario en el cuestionario. Los cuatro valores admitidos son cero coma cinco cuando el usuario marca la pregunta como poco importante, uno cuando la considera de importancia neutra, uno coma cinco cuando la marca como importante, y dos cuando la declara crítica. El score ponderado es simplemente el producto del score de la pregunta por el multiplicador.

#### 4.8.2 Por qué cuadrática y no lineal

La elección de una fórmula cuadrática en lugar de la variante lineal más común en VAAs internacionales responde a una decisión de diseño intencional. Si se usara una fórmula lineal como `1 - diff/4`, una diferencia de dos puntos entre usuario y candidato produciría un score de cero coma cinco, es decir, se interpretaría como "la mitad de coincidencia". La fórmula cuadrática en cambio produce para esa misma diferencia un score de cero coma siete cinco: la penalización es menos severa en el rango medio pero mucho más severa en los extremos. Un opuesto total sigue puntuando cero, pero una casi-coincidencia puntua muy alto. Este comportamiento refleja mejor la intuición política: dos personas que están *casi* de acuerdo son mucho más parecidas que dos personas que están *a medias*, y dos personas *opuestas* no están "a mitad" de coincidir, sino que no coinciden.

La progresión numérica completa de los cinco casos posibles en la escala Likert de uno a cinco es la siguiente: diferencia cero produce score uno; diferencia uno produce score cero coma nueve tres siete cinco; diferencia dos produce score cero coma siete cinco; diferencia tres produce score cero coma cuatro tres siete cinco; y diferencia cuatro produce score cero.

#### 4.8.3 Score final del candidato

El score final del candidato es el promedio de los scores ponderados de todas las preguntas efectivamente consideradas —excluyendo las que el usuario respondió como *no sé*—, expresado como porcentaje. El algoritmo entrega además dos productos complementarios. Por un lado, el desglose por eje temático agrupa los scores por eje y calcula el promedio parcial, permitiendo visualizar la afinidad en el radar de siete dimensiones. Por otro lado, el nivel de confianza asociado al número de preguntas efectivamente consideradas: tentativa cuando la persona respondió menos de cinco preguntas, media cuando respondió entre cinco y nueve, y alta a partir de diez preguntas. Este último aspecto es especialmente importante porque evita presentar un match construido con muy pocas preguntas con la misma autoridad que uno construido con un cuestionario completo.

#### 4.8.4 Ejemplo numérico paso a paso

Para ilustrar el funcionamiento del algoritmo se presenta un caso de cálculo completo. Supóngase una usuaria hipotética que responde cinco preguntas del cuestionario, con sus valores Likert y pesos declarados como se muestra a continuación, y un candidato cuyas respuestas conocidas se comparan.

**Preguntas y respuestas del ejemplo**:

- *Pregunta 1* (eje ECO): usuaria responde Likert 5, peso crítico (2.0); candidato responde Likert 4.
- *Pregunta 2* (eje SOC): usuaria responde Likert 4, peso importante (1.5); candidato responde Likert 2.
- *Pregunta 3* (eje AMB): usuaria responde Likert 3, peso neutro (1.0); candidato responde Likert 3.
- *Pregunta 4* (eje SEG): usuaria responde *no sé*; el candidato responde Likert 5 pero esta pregunta se excluye del cálculo.
- *Pregunta 5* (eje DDH): usuaria responde Likert 1, peso poco importante (0.5); candidato responde Likert 5.

**Cálculo pregunta por pregunta**:

En la pregunta 1, la diferencia absoluta es uno; normalizada da cero coma dos cinco; al cuadrado da cero coma cero seis dos cinco; restado de uno da un score de cero coma nueve tres siete cinco. Multiplicado por el peso crítico de dos, el score ponderado es uno coma ocho siete cinco.

En la pregunta 2, la diferencia absoluta es dos; normalizada da cero coma cinco; al cuadrado da cero coma dos cinco; restado de uno da un score de cero coma siete cinco. Multiplicado por el peso importante de uno coma cinco, el score ponderado es uno coma uno dos cinco.

En la pregunta 3, la diferencia absoluta es cero; el score es exactamente uno. Multiplicado por el peso neutro de uno, el score ponderado es uno.

La pregunta 4 se descarta completamente porque la usuaria respondió *no sé*. No aporta ni suma al denominador ni al numerador.

En la pregunta 5, la diferencia absoluta es cuatro —oposición máxima—; normalizada da uno; al cuadrado da uno; restado de uno da un score de cero. Multiplicado por el peso poco importante de cero coma cinco, el score ponderado es cero.

**Agregación final**:

La suma de scores ponderados es uno coma ocho siete cinco más uno coma uno dos cinco más uno más cero, es decir, cuatro exactos. La suma de pesos aplicados en las preguntas efectivamente consideradas es dos más uno coma cinco más uno más cero coma cinco, es decir, cinco. El score final del candidato es el cociente entre ambas sumas, cuatro dividido cinco, que da cero coma ocho, expresado como ochenta por ciento de afinidad. El nivel de confianza asociado es tentativa, porque la usuaria consideró solo cuatro preguntas efectivas, por debajo del umbral de cinco.

Este ejemplo ilustra tres comportamientos deseables del algoritmo. La ponderación aumentó el peso relativo de la pregunta 1, donde usuaria y candidato coinciden casi por completo, empujando el score final hacia arriba. La opción *no sé* se manejó correctamente al no distorsionar el cálculo con una respuesta neutral falsa. Y el nivel de confianza tentativa alerta al usuario de que el resultado tiene baja base empírica y merece considerarse una aproximación antes que una conclusión definitiva.

#### 4.8.5 Filtrado territorial polimórfico

Antes del cálculo de matching, el sistema aplica el filtro territorial polimórfico para determinar qué candidatos son elegibles según la ubicación de la persona usuaria. Dada la comuna del usuario, el sistema resuelve su unidad territorial correspondiente y calcula la cadena de ancestros hasta la raíz nacional. Por ejemplo, si la usuaria vive en Ñuñoa, la cadena de ancestros sería Ñuñoa → Distrito Diez → Región Metropolitana → Chile Nacional. Los candidatos elegibles son entonces aquellos cuya `unidad_territorial` sea nula —scope nacional, visible desde cualquier comuna, como los candidatos presidenciales— o cuya `unidad_territorial` coincida con la de la usuaria o con alguno de sus ancestros. Este mecanismo permite que un candidato distrital —por ejemplo, un diputado por el Distrito Diez— sea visible solo desde comunas del distrito, y un candidato comunal —por ejemplo, un alcalde de Ñuñoa— solo desde su comuna específica, sin requerir queries `join` complejas ni hardcodear la jerarquía territorial en la lógica de negocio (Fowler, 2003).

### 4.9 Contrato API

La API expone más de veinticinco endpoints REST documentados automáticamente en Swagger UI accesible desde `/api/v1/docs/`. La Tabla 4 resume los endpoints principales agrupados por dominio. Todos los endpoints devuelven JSON conforme al schema OpenAPI 3.1, y los tipos TypeScript del frontend se generan directamente desde ese schema mediante `openapi-typescript`, garantizando ausencia de drift entre las expectativas del cliente y las respuestas del servidor.

**Tabla 4**

*Endpoints principales de la API*

| Método | Ruta | Permission | Rol |
|--------|------|------------|-----|
| POST | `/register/` | AllowAny | Registro de usuario nuevo |
| POST | `/login/` | AllowAny | Obtención de token DRF |
| GET | `/tipos-eleccion/` | Auth | Lista de procesos electorales activos |
| GET | `/candidatos/` | Auth | Lista con filtros territoriales |
| GET | `/preguntas/` | Auth | Preguntas del tipo más las base |
| POST | `/respuestas/` | Auth | Envío batch de respuestas |
| POST | `/match-candidatos/` | Auth | Cálculo de match persistido |
| POST | `/match-detalle/` | Auth | Desglose pregunta-a-pregunta |
| POST | `/match-anonimo/` | AllowAny | Match sin persistir (guest) |
| GET/POST/DELETE | `/candidatos-favoritos/` | Auth | CRUD de favoritos |
| GET/PATCH | `/perfil/` | Auth | Obtener y actualizar perfil |
| POST | `/password-reset/request/` | AllowAny | Solicitar reset de clave |
| GET | `/regiones/` `/distritos/` `/comunas/` | AllowAny | Catálogo territorial |
| GET | `/ejes/` | AllowAny | Catálogo de ejes temáticos |
| GET | `/noticias/` | AllowAny | Feed paginado de novedades |
| GET | `/schema/` `/health/` | AllowAny | Schema OpenAPI y healthcheck |

*Nota.* Elaboración propia. Catálogo completo interactivo disponible en `/api/v1/docs/` (Swagger UI).

### 4.10 Ingesta de datos, seguridad y despliegue

Chile no expone actualmente una API pública de posturas electorales, por lo que la estrategia de ingesta se basa en importación offline por CSV y seeds programáticos, todos idempotentes. Los comandos de gestión cubren la carga del territorio nacional, las preguntas base y las preguntas por tipo de elección, los candidatos por proceso, las posturas verificadas y las noticias del feed. La idempotencia garantiza que las ejecuciones sucesivas no dupliquen registros ni pierdan datos.

La seguridad de la aplicación se sostiene sobre varias capas complementarias. La configuración sensible —clave secreta de Django, modo debug, hosts permitidos, credenciales de base de datos y correo— se lee desde variables de entorno según la Twelve-Factor App (Wiggins, 2011). El hashing de contraseñas usa PBKDF2-SHA256 con seiscientas mil iteraciones (Django Software Foundation, 2024). La autenticación se implementa mediante tokens DRF con implementación custom para mobile-friendliness. Los permisos por endpoint son explícitos, revisados en la auditoría de la Fase 3. CORS opera restrictivo en producción. Los constraints de dominio en modelos como `Candidato` previenen datos inconsistentes a nivel de base de datos. Y los tokens de reset de contraseña tienen expiración configurable. Como deuda pendiente documentada quedan la implementación de rate limiting productivo, la migración a JWT con refresh, la verificación de correo electrónico, y la auditoría externa de seguridad por un tercero especializado.

El despliegue se resuelve mediante Docker (Docker Inc., 2024). El backend incluye un `Dockerfile` que produce una imagen ejecutable con `docker build -t matchvote-backend ./backend` y ejecutable con `docker run -p 8000:8000 --env-file .env matchvote-backend`. El archivo `.env.example` incluido en el repositorio documenta todas las variables requeridas, tanto para desarrollo local como para producción con base de datos PostgreSQL, envio SMTP y CORS restringido.

### 4.11 Por qué la solución funciona

La solución funciona técnicamente porque combina tecnologías maduras con patrones probados. Django con Django REST Framework entrega productividad alta con seguridad razonable por defecto (Django Software Foundation, 2024). React Native con Expo permite despliegue multiplataforma sin duplicar código (Meta Platforms, 2024; Expo, 2024). El contrato OpenAPI 3.1 elimina el drift entre backend y frontend (OpenAPI Initiative, 2021). El modelo polimórfico jerárquico resuelve elegantemente la representación de scope territorial variable (Fowler, 2003). Y la aplicación rigurosa de SOLID (Martin, 2017), DRY (Hunt & Thomas, 1999) y YAGNI (Beck, 1999) mantiene el código mantenible incluso con un solo desarrollador durante un ciclo prolongado.

Es una buena solución frente a las alternativas existentes porque cumple simultáneamente con las cinco características que ninguna alternativa chilena actual cumple. Frente a *Votamos Todos* (Zismo, 2021-2022), extiende el alcance del plebiscito único a un modelo multi-elección permanente. Frente a *Decide Chile*, *Vota Inteligente* e *Infovecino*, incorpora el componente algorítmico de matching personalizado que aquellas iniciativas no ofrecen. Frente a Wahl-O-Mat, StemWijzer y Smartvote, publica su algoritmo en detalle en la propia documentación del proyecto, permitiendo a la lectora comprender exactamente cómo se produce cada recomendación.

Y es una solución que beneficia efectivamente a los usuarios porque internaliza principios centrados en la persona votante. Reduce su costo cognitivo mediante cuestionarios cortos y ponderables. Respeta su honestidad epistemológica con la opción *no sé* que se excluye del cálculo en lugar de forzar una respuesta neutral distorsionante. Expone niveles de confianza para evitar la falsa autoridad de un porcentaje presentado sin contexto sobre el número de preguntas que lo sostienen. Entrega explicabilidad pregunta-a-pregunta que permite al usuario cuestionar y ajustar el resultado en lugar de aceptarlo como caja negra. Garantiza accesibilidad universal según estándares WCAG (W3C, 2023). Protege la privacidad al no requerir datos personales sensibles ni monetizar el uso mediante publicidad. Y ofrece continuidad al persistir preferencias entre elecciones sucesivas, permitiendo al usuario acumular su propio historial político personal.

<!--PAGE_BREAK-->

---

## 5. Validación de la solución

La validación de la solución se abordó desde cinco dimensiones complementarias: el cumplimiento de los objetivos declarados en la introducción, la validación técnica automatizada mediante suite de pruebas, la validación específica del algoritmo de matching con casos conocidos, la validación del sistema territorial polimórfico, y la validación de la accesibilidad según estándares WCAG 2.2 nivel AA. A esto se suman dos rondas internas de auditoría de código. Se explicita al final del capítulo, con honestidad académica, qué dimensiones de la validación no fueron cubiertas en esta entrega, en particular la validación empírica con usuarios reales.

### 5.1 Cumplimiento de los objetivos

El objetivo general planteado en 1.4 se cumple: se diseñó e implementó la aplicación multiplataforma de asesoramiento electoral con las características declaradas. Los objetivos específicos se cumplen en su mayoría con evidencia estructural en el repositorio. El algoritmo robusto está implementado en `core/services/matching.py`, con la fórmula cuadrática, los multiplicadores de peso, la exclusión de respuestas *no sé*, los umbrales de confianza, el desglose por eje temporizado en `calcular_match_detalle` y el filtrado territorial polimórfico integrado. El sistema territorial polimórfico está operativo mediante los modelos `Region`, `Distrito`, `Comuna` y `UnidadTerritorial`, con signals de sincronización activos entre el perfil del usuario y la referencia polimórfica. El soporte multi-elección opera mediante el campo `TipoEleccion.es_base` que marca preguntas transversales reutilizables entre procesos.

La aplicación de SOLID, DRY y YAGNI se refleja estructuralmente en la organización de submódulos: diez modelos, once vistas, nueve serializadores y cinco servicios reflejan Single Responsibility Principle (Martin, 2017), y la eliminación del modelo `DecisionFinal` en la migración `0037` documenta la aplicación retroactiva de YAGNI (Beck, 1999). El contrato OpenAPI 3.1 está disponible en el endpoint `/api/v1/schema/`, con documentación interactiva Swagger en `/api/v1/docs/` y tipos TypeScript sincronizados en el frontend mediante `openapi-typescript`. La exposición de posturas se cumple a nivel estructural con los campos correspondientes en el modelo `PosturaCandidato`, mostradas al usuario en la pantalla de detalle de cada candidato dentro de la propia aplicación. La cobertura de pruebas se cumple parcialmente con veinticinco archivos de pruebas backend operativos y pruebas de servicios puros en frontend, sin reporte formal de porcentaje de cobertura. La accesibilidad WCAG 2.2 AA se cumple con auditoría técnica automatizada y revisión manual, pero sin evaluación con personas usuarias con discapacidad. La multiplataforma se cumple con un solo codebase `App.tsx` que se despliega en web, iOS y Android. Y el empaquetado Docker está cumplido con `Dockerfile` en `backend/` e instrucciones documentadas de build y run.

### 5.2 Validación técnica automatizada

La suite de pruebas backend consta de veinticinco archivos ubicados en `backend/core/test_*.py`, con configuración en `conftest.py` y ejecución mediante `pytest`. Cubre el algoritmo core en sus tres variantes (autenticada, anónima y con detalle), la cobertura territorial polimórfica incluyendo la resolución de ancestros y el filtrado por scope, el refactor de ejes temáticos al modelo `Eje`, el mecanismo `es_base` para preguntas transversales, los seeds específicos por elección —presidenciales 2025, diputados 2025, alcaldes 2024 y parlamentaria—, las variantes del algoritmo con casos límite, los flujos de edición de respuestas y guardado, los bookmarks de candidatos, posturas y noticias, el feed de noticias, el flujo completo de password reset, la actualización de perfil y sincronización territorial, y los importadores de CSV. Las pruebas del frontend cubren los servicios puros ubicados en `src/services/`, es decir la lógica de dominio sin dependencias de React, ejecutados mediante Jest y React Native Testing Library.

### 5.3 Validación específica del algoritmo

El algoritmo se validó mediante casos con salida conocida por construcción matemática. La Tabla 5 muestra un subconjunto ilustrativo de los casos más relevantes verificados en `test_algoritmo.py`, seleccionados para cubrir concordancia total, oposición total, manejo de respuestas *no sé*, ponderación asimétrica, umbrales de confianza, filtrado territorial y herencia polimórfica.

**Tabla 5**

*Casos de prueba del algoritmo de matching*

| # | Escenario | Salida esperada |
|:-:|-----------|-----------------|
| C1 | Concordancia total: usuario y candidato responden Likert=3 en 10 preguntas | Score = 100%, confianza `alta` |
| C2 | Oposición total: usuario Likert=1, candidato Likert=5, 10 preguntas | Score = 0%, confianza `alta` |
| C3 | Punto medio: diferencia constante de 2 en todas las preguntas | Score = 75% |
| C4 | Manejo de *no sé*: 3 respuestas *no sé* sobre 8 preguntas | 5 preguntas consideradas, confianza `media` |
| C5 | Ponderación asimétrica: usuario da peso 2.0 a coincidencias | Score mayor que sin ponderación |
| C6 | Confianza tentativa: usuario responde solo 3 preguntas | Confianza `tentativa` |
| C7 | Filtrado territorial: usuario en comuna X, candidato distrital que no incluye X | Candidato no aparece |
| C8 | Herencia polimórfica: usuario en comuna X, candidato de scope nacional | Candidato aparece |
| C9 | Preguntas base transversales: respuestas reutilizables entre elecciones | Match calculable en elección adyacente |
| C10 | Idempotencia de MatchCandidato: ejecución repetida | No duplica; actualiza si cambian respuestas |

*Nota.* Casos representativos. La suite completa cubre variantes adicionales de escala, empates y edge cases del filtrado territorial.

La validación numericá confirma que la fórmula cuadrática produce los valores teóricos esperados: para diferencias de cero, uno, dos, tres y cuatro se obtienen scores de uno, cero coma nueve tres siete cinco, cero coma siete cinco, cero coma cuatro tres siete cinco y cero respectivamente, exactamente lo que predice la fórmula `1 - (diff / 4)^2` aplicada al rango uno a cinco. Los umbrales de confianza operan como se definió: menos de cinco preguntas producen confianza tentativa, entre cinco y nueve producen confianza media, y a partir de diez producen confianza alta.

### 5.4 Validación del sistema territorial

El sistema territorial se validó mediante varios ejes complementarios. La cobertura completa se verifica con el comando `seed_territorio_chile`, que genera las dieciséis regiones, veintiocho distritos electorales y trescientas cuarenta y seis comunas, verificable posteriormente por conteo directo en la base de datos. La consistencia jerárquica se verifica confirmando que cada comuna tiene distrito padre, cada distrito tiene región padre, y el recorrido de ancestros hasta la raíz funciona correctamente por el método recursivo definido en el modelo `UnidadTerritorial`. El filtrado por scope se valida con casos donde un candidato de scope nacional resulta visible desde cualquier comuna del país, un candidato distrital solo desde comunas del distrito, y un candidato comunal solo desde su comuna específica. La sincronización entre `UserProfile.comuna` y la referencia polimórfica se valida verificando que el signal `post_save` actualiza automáticamente la relación cada vez que el usuario modifica su comuna. Y la retrocompatibilidad se verifica confirmando que las FKs legacy `Candidato.comuna` y `Candidato.distrito` conviven correctamente con la nueva referencia polimórfica durante la migración, sin causar inconsistencias en las queries.

### 5.5 Validación de accesibilidad

La validación de accesibilidad se realizó en tres niveles complementarios. En el nivel automatizado, el script `design-exploration/audit_wcag.py` verifica los contrastes de la paleta de diseño contra los umbrales AA definidos por WCAG 2.2 (W3C, 2023), asegurando que ninguna combinación de texto y fondo caiga por debajo del ratio de contraste mínimo requerido. En el nivel manual, la documentación `docs/accesibilidad.md` recorre pantalla por pantalla los requisitos WCAG aplicables, verificando cualitativamente el cumplimiento de tamaños mínimos de tap targets, presencia de estados visuales explícitos, focus trap correcto en modales, empty states educativos, navegación coherente por teclado y compatibilidad con lectores de pantalla. En el nivel de compatibilidad con tecnologías asistivas, los componentes React Native declaran explícitamente sus roles, etiquetas y descripciones mediante los atributos `accessibilityLabel`, `accessibilityRole` y `accessibilityHint` según el estándar del framework (Meta Platforms, 2024).

### 5.6 Auditorías internas de código

El proyecto pasó por dos rondas de auditoría interna de código durante la Fase 3 del cronograma. La primera ronda identificó diecisiete hallazgos categorizados por severidad, de los cuales se resolvieron cuatro críticos de seguridad relacionados a permisos por endpoint, constraints faltantes en modelos y validación de inputs sensibles, más seis hallazgos de severidad alta que motivaron endurecimiento de la configuración de producción. La segunda ronda enfocada en accesibilidad y consistencia del sistema de diseño validó el cumplimiento WCAG 2.2 AA y auditoría del showcase interno de componentes. No se realizó auditoría externa por un tercero especializado en seguridad, lo que constituye deuda pendiente antes del despliegue público productivo.

### 5.7 Limitaciones de la validación

Se explicita honestamente qué dimensiones de la validación no fueron cubiertas en esta entrega, por razones que se documentan como deuda o como decisiones explícitas de scope. Con respecto al dataset utilizado en el desarrollo y demostración del sistema, se reconoce como limitación de validación empírica que las posturas asignadas a cada candidato son ilustrativas y no fueron sometidas a un proceso de verificación formal contra fuentes primarias documentadas: se construyeron a partir de referencias generales de posicionamiento político existente para permitir demostrar el comportamiento del sistema, decisión explicitada como scope académico en la sección 1.5. La validación de que las posturas asignadas coincidan efectivamente con las declaraciones documentadas de cada candidatura es un trabajo curatorial pendiente que debe ejecutarse antes de cualquier despliegue público productivo. No se realizaron pruebas empíricas con usuarios reales: no hubo sesiones de usabilidad, encuestas de satisfacción ni medición de conversión en un despliegue público. La validación reportada es técnica y estructural, no experiencial. No se realizó evaluación de accesibilidad con personas usuarias con discapacidad: el cumplimiento WCAG 2.2 AA se verificó con auditoría técnica y revisión manual, no con pruebas de campo que serían el estándar de oro para validar accesibilidad. No se midió el impacto electoral de la herramienta: no se puede afirmar que modifique decisiones de voto en la magnitud reportada por la literatura para VAAs consolidadas (Walgrave et al., 2008); ese es un objetivo a mediano plazo condicionado al despliegue público continuo. No se calculó formalmente la cobertura porcentual de tests por módulo. No se ejecutó auditoría externa de seguridad, recomendable antes de exposición pública productiva. Y no se realizaron pruebas de estrés ni benchmarks contra números esperados de usuarios concurrentes.

Estas limitaciones no invalidan la validación realizada, pero delimitan su alcance con precisión. Todas se registran como deuda técnica priorizada en el capítulo de conclusiones y constituyen el camino natural de trabajo futuro entre la entrega actual y un despliegue público productivo.

<!--PAGE_BREAK-->

---

## 6. Conclusiones

### 6.1 Cumplimiento del objetivo general

El objetivo general planteado en 1.4 se cumple: se diseñó e implementó una aplicación multiplataforma de asesoramiento electoral para el contexto chileno, con algoritmo transparente y documentado, arquitectura modular, soporte multi-elección con scope territorial y cumplimiento WCAG 2.2 nivel AA (W3C, 2023). Los objetivos específicos se cumplen en su mayoría. Las excepciones a este cumplimiento —curaduría formal de posturas contra fuentes primarias documentadas, modo guest en la interfaz frontend, evaluación empírica con usuarios reales— están documentadas como limitaciones y quedan priorizadas en la sección de deuda pendiente.

Al momento de este documento, la aplicación presenta dieciocho pantallas funcionales, veintisiete átomos, veintinueve moléculas, diecisiete organismos, un template real llamado `AppShell`, treinta y ocho migraciones que registran la evolución del schema, sistema territorial operativo con retrocompatibilidad durante la fase de migración, sistema de diseño interno con showcase completo, y documentación estructurada en dos niveles paralelos, uno técnico y uno accesible. Las funcionalidades eliminadas por aplicación retroactiva del principio YAGNI (Beck, 1999) fueron el flujo Tinder-swipe original y el módulo `DecisionFinal`. Las funcionalidades unificadas incluyen favoritos, descartados y bookmarks bajo la pantalla `MisGuardadosScreen`, y seis modales legacy bajo un componente `Modal` unificado que reemplazó implementaciones fragmentadas dispersas por el código.

### 6.2 Aprendizajes técnicos y de dominio

Del proyecto emergen aprendizajes en dos ejes complementarios. En el plano técnico, se confirma que la combinación de Django con Django REST Framework, React Native con Expo y Tamagui permite alta velocidad de desarrollo con un solo desarrollador durante ciclos prolongados. Se confirma también que el enfoque contract-first con OpenAPI (OpenAPI Initiative, 2021) es la barrera anti-drift más importante entre backend y frontend, sin necesidad de mecanismos adicionales de sincronización. YAGNI aplicado retroactivamente demostró simplificar el código sin costo funcional, contradiciendo el miedo común a eliminar features aparentemente útiles. Los modelos polimórficos jerárquicos (Fowler, 2003) resultaron la respuesta correcta ante múltiples niveles de scope territorial, evitando la explosión combinatoria de tablas por nivel. Los signals de Django requieren cuidado con la direccionalidad para evitar loops o efectos no deseados; su uso disciplinado sostiene consistencia derivada sin acoplar lógica de negocio. Y las migraciones grandes en fases sucesivas reducen riesgo respecto a *big-bang migrations*, aunque introducen deuda técnica temporal en forma de campos legacy conviviendo con nuevos.

En el plano de dominio, la principal lección es que la curaduría formal de posturas contra fuentes primarias documentadas es más costosa que el desarrollo de código. Un solo desarrollador puede construir el sistema completo en ocho meses, pero cargar y verificar posturas de todas las candidaturas de una elección presidencial completa requiere trabajo curatorial de varias personas durante semanas, razón por la cual el scope de esta tesis se limitó al dataset ilustrativo descrito en 1.5. Se confirmó también que el sistema territorial chileno es manejable con la abstracción polimórfica correcta, y que la complejidad aparente del filtrado territorial se disuelve con el modelo `UnidadTerritorial`. Se confirmó que el votante rara vez decide sobre una sola elección; el diseño multi-elección no es un lujo sino un requisito funcional. Y se confirmó que los coach marks contextuales resultan más efectivos que tours lineales exhaustivos al primer arranque, evidencia consistente con la literatura de usabilidad móvil.

### 6.3 Deuda pendiente priorizada

La deuda técnica del proyecto se organiza en tres niveles de prioridad. En alta prioridad, es decir, aquellos elementos que bloquean el paso a publicación pública confiable, quedan la curaduría formal de posturas contra fuentes primarias documentadas para reemplazar el dataset ilustrativo utilizado en la tesis, la implementación de la interfaz de modo invitado, el cierre de la migración territorial eliminando los campos legacy, la ejecución de una auditoría de seguridad por un tercero especializado, y las pruebas empíricas con usuarios reales, incluyendo evaluación específica con personas usuarias con discapacidad. En media prioridad, es decir, aquellos elementos que bloquean el escalamiento operativo más allá de un piloto reducido, quedan la migración a PostgreSQL, la incorporación de cache Redis, la implementación de rate limiting productivo, la optimización de la función de persistencia de matches, y el despliegue formal con Gunicorn y Nginx. En baja prioridad, es decir, mejoras deseables sin urgencia, quedan la generación de imagen shareable con el resultado del match para redes sociales, la consolidación mediante squash de migraciones, la incorporación de logging estructurado y la configuración de pipeline de integración continua.

### 6.4 Proyección

El camino natural desde la entrega actual involucra cinco líneas de trabajo. La publicación pública en el dominio `matchvote.cl`, una vez cerrada la deuda de alta prioridad —en particular la curaduría formal del dataset—, marca el paso de un producto académico a una herramienta cívica en operación. La curaduría colaborativa de datos verificables con universidades y think tanks distribuye el trabajo curatorial masivo entre múltiples actores, aprovechando la infraestructura ya construida. El escalamiento territorial hacia senadores por circunscripción y consejeros regionales es viable sin cambios de schema gracias al modelo polimórfico, cerrando la brecha con respecto a la cobertura completa del ciclo electoral chileno. El desarrollo de explicabilidad avanzada, incluyendo un simulador de tipo *cambia mi respuesta* y un mapa bidimensional político al estilo de Kieskompas, extiende las herramientas de interpretación para votantes con interés exploratorio. Y la investigación académica sobre datos agregados y anonimizados, siguiendo el método comparativo internacional de Garzia y Marschall (2014), abre la posibilidad de contribuir a la literatura politológica chilena sobre comportamiento electoral y coherencia programática.

### 6.5 Reflexión final

El proyecto demuestra que es viable construir infraestructura cívica de calidad profesional con recursos limitados, aplicando principios sólidos de ingeniería de software (Martin, 2017; Hunt & Thomas, 1999; Wiggins, 2011), disciplina en el diseño del algoritmo y coraje para eliminar features que no probaron su valor práctico (Beck, 1999). La combinación de arquitectura modular, modelos polimórficos (Fowler, 2003), transparencia sobre el mecanismo de matching y accesibilidad estándar (W3C, 2023) constituye una respuesta técnica concreta al problema estructural de desinformación electoral, asimetría de información y ausencia de VAA chilena consolidada.

La existencia de un ecosistema internacional maduro de VAAs con décadas de operación sostenida (Cedroni & Garzia, 2010) prueba que estas herramientas pueden ser sostenibles a largo plazo cuando encuentran el respaldo institucional adecuado. El desafío pendiente en Chile no es técnico —eso lo demuestra el presente trabajo— sino institucional: encontrar un modelo de gobernanza y financiamiento que permita continuidad operativa entre elecciones, evitando el patrón de iniciativas puntuales que se activan para un ciclo y luego se abandonan. La entrega técnica de esta tesis constituye una base sobre la cual esa discusión institucional puede desarrollarse a partir de un producto real y funcional, no de un concepto abstracto.

<!--PAGE_BREAK-->

---

## 7. Bibliografía

### Libros y capítulos

Beck, K. (1999). *Extreme programming explained: Embrace change*. Addison-Wesley.

Cedroni, L., & Garzia, D. (Eds.). (2010). *Voting Advice Applications in Europe: The state of the art*. ScriptaWeb.

Fowler, M. (2003). *Patterns of enterprise application architecture*. Addison-Wesley.

Fowler, M. (2018). *Refactoring: Improving the design of existing code* (2nd ed.). Addison-Wesley.

Frost, B. (2016). *Atomic design*. Brad Frost. https://atomicdesign.bradfrost.com/

Garzia, D., & Marschall, S. (Eds.). (2014). *Matching voters with parties and candidates: Voting Advice Applications in a comparative perspective*. ECPR Press.

Hunt, A., & Thomas, D. (1999). *The pragmatic programmer: From journeyman to master*. Addison-Wesley.

Krosnick, J. A., & Presser, S. (2010). Question and questionnaire design. En P. V. Marsden & J. D. Wright (Eds.), *Handbook of survey research* (2nd ed., pp. 263-313). Emerald.

Martin, R. C. (2017). *Clean architecture: A craftsman's guide to software structure and design*. Prentice Hall.

### Artículos académicos

Likert, R. (1932). A technique for the measurement of attitudes. *Archives of Psychology, 22*(140), 1-55.

Marschall, S. (2005). Idee und Wirkung des Wahl-O-Mat. *Aus Politik und Zeitgeschichte, 51-52*, 41-46.

Walgrave, S., van Aelst, P., & Nuytemans, M. (2008). "Do the vote test": The electoral effects of a popular Vote Advice Application at the 2004 Belgian elections. *Acta Politica, 43*(1), 50-70. https://doi.org/10.1057/palgrave.ap.5500207

### Sitios y documentación técnica

Astral. (2024). *uv: An extremely fast Python package installer and resolver*. https://github.com/astral-sh/uv

Django Software Foundation. (2024). *Django documentation (version 5.2)*. https://docs.djangoproject.com/en/5.2/

Docker Inc. (2024). *Docker documentation*. https://docs.docker.com/

Expo. (2024). *Expo documentation*. https://docs.expo.dev/

Linsley, T. (2024). *TanStack Query v5 documentation*. https://tanstack.com/query/latest

Meta Platforms. (2024). *React Native documentation*. https://reactnative.dev/

Microsoft. (2024). *TypeScript documentation*. https://www.typescriptlang.org/docs/

OpenAPI Initiative. (2021). *OpenAPI Specification v3.1.0*. https://spec.openapis.org/oas/v3.1.0

pmndrs. (2024). *Zustand documentation*. https://github.com/pmndrs/zustand

Wiggins, A. (2011). *The Twelve-Factor App*. https://12factor.net/

World Wide Web Consortium (W3C). (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

### Voting Advice Applications e iniciativas referenciadas

Bundeszentrale für politische Bildung (bpb). (2024). *Wahl-O-Mat*. https://www.bpb.de/themen/wahl-o-mat/

Kieskompas. (2024). *Kieskompas*. Universiteit van Amsterdam. https://www.kieskompas.nl/

ProDemos. (2024). *StemWijzer*. https://stemwijzer.nl/

Smartvote. (2024). *Smartvote*. Politools. https://www.smartvote.ch/

Vox Pop Labs. (2024). *Vote Compass*. https://votecompass.com/

Zismo. (2021). *Votamos Todos* [Plataforma electoral discontinuada]. (Iniciativa activa entre 2021 y 2022).

### Verificadores de información y fuentes chilenas

Fast Check CL. (2024). *Fast Check CL*. https://www.fastcheck.cl/

Mala Espina Check. (2024). *Mala Espina Check*. https://malaespinacheck.cl/

Servicio Electoral de Chile (SERVEL). (2024). *Servicio Electoral de Chile*. https://www.servel.cl/

Servicio Electoral de Chile (SERVEL). (2024). *Datos abiertos SERVEL*. https://opendata.servel.cl/

### Marco legal chileno

Biblioteca del Congreso Nacional de Chile (BCN). (1974). *Decreto Ley N° 575: Regionalización del país*. https://www.bcn.cl/leychile/navegar?idNorma=6350

Biblioteca del Congreso Nacional de Chile (BCN). (2015). *Ley N° 20.840*. https://www.bcn.cl/leychile/navegar?idNorma=1077039

Biblioteca del Congreso Nacional de Chile (BCN). (2018). *Ley N° 21.073*. https://www.bcn.cl/leychile/navegar?idNorma=1115216

### Documentación interna del proyecto

Castillo, J. (2026a). *README.es.md* [Documento de repositorio interno del proyecto].

Castillo, J. (2026b). *docs/algoritmo-tecnico.md* [Referencia técnica del algoritmo, repositorio interno].

Castillo, J. (2026c). *docs/sistema-tecnico.md* [Documentación de arquitectura, repositorio interno].

Castillo, J. (2026d). *docs/comparacion-vaas.md* [Análisis comparativo, repositorio interno].

Castillo, J. (2026e). *docs/accesibilidad.md* [Guía WCAG 2.2 AA, repositorio interno].

Castillo, J. (2026f). *docs/mapa-navegacion.md* [Mapa de rutas, repositorio interno].

Castillo, J. (2026g). *backend/docs/MIGRATION_TERRITORIAL.md* [Plan de migración, repositorio interno].

<!--PAGE_BREAK-->

---

## 8. Anexos

### Anexo A. Ejes temáticos del cuestionario

Los siete ejes temáticos que estructuran el cuestionario fueron seleccionados a partir de la revisión de los ejes usados por VAAs internacionales (Cedroni & Garzia, 2010) y adaptados al debate público chileno. Se describen a continuación en prosa; cada eje se asocia adicionalmente a un color y a una descripción educativa que se muestran en el radar y en los tooltips de la aplicación.

El eje **Economía** (código ECO) agrupa preguntas sobre política fiscal, tributaria, laboral, previsional y de desarrollo productivo. El eje **Sociedad** (SOC) cubre educación, salud, vivienda, cultura, ciencia y política social. El eje **Ambiente** (AMB) aborda cambio climático, energía, minería, agua, biodiversidad y ordenamiento territorial. El eje **Seguridad** (SEG) trata seguridad pública, delito organizado, políticas migratorias y sistema penal. El eje **Derechos Humanos** (DDH) contempla igualdad, diversidad, pueblos originarios, derechos reproductivos y libertades civiles. El eje **Política Internacional** (INT) engloba relaciones exteriores, integración regional, tratados comerciales y política de defensa. Y el eje **Reforma Institucional** (INS) cubre sistema político, descentralización, reforma constitucional y probidad.

### Anexo B. Preguntas base ilustrativas

Las preguntas base, marcadas con `TipoEleccion.es_base=True` en el modelo, son transversales a todas las elecciones y capturan valores ideológicos que la persona usuaria responde una sola vez. Se muestran algunos ejemplos ilustrativos; los enunciados exactos publicados en la aplicación pueden diferir, y cada pregunta incluye una sexta opción *no sé / prefiero no responder* que se excluye del cálculo (Likert, 1932). Ejemplos representativos incluyen enunciados como *El Estado debe tener un rol activo en la provisión directa de servicios como salud y pensiones* (eje ECO), *El aborto libre debe estar garantizado por ley durante todo el embarazo* (eje DDH), *Chile debe priorizar la transición energética aunque implique costos económicos en el corto plazo* (eje AMB), *Las políticas migratorias deben endurecerse para reducir la migración irregular* (eje SEG), y *El sistema electoral binominal era mejor que el proporcional actual para la estabilidad política* (eje INS).

### Anexo C. Comparativa con VAAs internacionales

La Tabla 6 resume la comparación de *matchVote* con las principales VAAs internacionales y con las iniciativas chilenas y latinoamericanas más cercanas identificadas durante la investigación.

**Tabla 6**

*Anexo C. Comparativa con VAAs internacionales*

| VAA | País | Institución | Algoritmo público | Código abierto | Cobertura territorial | Confianza |
|-----|:----:|-------------|:-----------------:|:--------------:|:---------------------:|:---------:|
| StemWijzer | NL | ProDemos | No | No | Nacional | No |
| Wahl-O-Mat | DE | bpb | Sí | Parcial | Nacional | No |
| Smartvote | CH | Politools | Sí | No | Multi-nivel | No |
| Kieskompas | NL | UvA | Parcial | No | Nacional | No |
| Vote Compass | CA/AU | Vox Pop Labs | No | No | Nacional | No |
| Votamos Todos | CL | Zismo | No consta | No consta | Nacional (plebiscito 2022) | No |
| Decide Chile | CL | No consta | No aplica (no es VAA) | No consta | Nacional | No |
| Vota Inteligente | CL | No consta | No aplica (no es VAA) | No consta | Nacional | No |
| Infovecino | CL | No consta | No aplica (no es VAA) | No consta | Comunal | No |
| Infovotantes | CO | No consta | No aplica (no es VAA) | No consta | Nacional | No |
| VotaPE | PE | No consta | No aplica (no es VAA clásica) | No consta | Nacional | No |
| **matchVote** | **CL** | **Este proyecto** | **Sí** | N/A | **Nacional + distrital + comunal** | **Sí (3 niveles)** |

*Nota.* Elaboración propia a partir de sitios oficiales y relevamiento manual. "Confianza" se refiere a la exposición del número de preguntas efectivamente consideradas. "No consta" indica dato no verificado; "No aplica" indica que la iniciativa no se diseñó como VAA con matching personalizado.

### Anexo D. Recursos del repositorio

El repositorio principal del proyecto contiene el código fuente completo del sistema, la documentación interna y los materiales de diseño. La documentación interna se organiza en dos niveles paralelos: la documentación técnica cubre arquitectura, algoritmo, servicios, seguridad, testing y deploy; la documentación accesible reescribe los mismos contenidos en lenguaje divulgativo. Se incluyen además una guía específica de accesibilidad, un mapa completo de navegación con rutas, coach marks y empty states, y un plan de migración territorial. Los comandos de gestión del backend agrupan importadores de datos (`import_candidatos`, `import_preguntas`, `import_posturas`), seeds territoriales (`seed_territorio_chile`), seeds de cuestionario (`seed_preguntas_base`, `seed_preguntas_por_tipo`, `seed_explicaciones_preguntas`), seeds electorales por proceso (`seed_presidenciales_2025`, `seed_diputados_2025`, `seed_alcaldes_2024`, `seed_parlamentaria`) y utilidades (`fetch_noticias`, `limpiar_tokens_viejos`). El archivo `.env.example` en la raíz del backend documenta todas las variables de entorno requeridas para desarrollo y producción.

---

*Documento elaborado como parte de la tesis de pregrado de la carrera de Ingeniería en Informática. Autora: Jenifer Castillo. Versión narrativa académica APA 7 con estructura de 8 secciones: Introducción, Definición del problema, Marco conceptual, Propuesta de solución, Validación de la solución, Conclusiones, Bibliografía y Anexos.*
