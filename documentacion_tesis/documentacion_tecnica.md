---

<div align="center">

**[NOMBRE DE LA UNIVERSIDAD]**

**Facultad de [Ingeniería / Ciencias / etc.]**

**Carrera de Ingeniería en Informática**

<br><br><br><br><br>

# Diseño e Implementación de matchVote

## Una aplicación móvil multi-elección de asesoramiento electoral (VAA) para el contexto chileno

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

*[Aquí va tu dedicatoria personal. Reemplaza este texto por lo que quieras dedicar.]*

*A mi familia, por el apoyo incondicional en cada etapa de este camino.*

*A quienes creyeron en este proyecto desde el primer día.*

*A los votantes que aún buscan información honesta antes de decidir.*

</div>

<!--PAGE_BREAK-->

---

## Agradecimientos

<br>

Quiero expresar mi más sincero agradecimiento a **[Nombre del profesor(a) guía]**, por su orientación, paciencia y valiosos aportes durante el desarrollo de este trabajo.

Agradezco a los miembros de la comisión evaluadora, **[Nombres]**, por dedicar su tiempo a revisar y enriquecer esta tesis con sus comentarios.

A mis compañeros y compañeras de carrera, con quienes compartí discusiones, dudas y aprendizajes a lo largo de estos años.

A mi familia, por el apoyo emocional y material que hizo posible dedicarme a este proyecto.

A la comunidad de software libre, cuyas herramientas y documentación abierta hicieron técnicamente viable un proyecto ciudadano con recursos limitados.

Finalmente, a las organizaciones chilenas que han insistido durante años en la necesidad de mejores herramientas de información electoral —*Fast Check CL*, *Mala Espina Check* y equipos académicos que han estudiado el problema—, cuyo trabajo sirvió de contexto y motivación para este proyecto.

<!--PAGE_BREAK-->

---

## Resumen

El presente trabajo describe el diseño e implementación de *matchVote*, una aplicación web progresiva (PWA) y móvil multiplataforma que actúa como Voting Advice Application (VAA) para el contexto electoral chileno. La aplicación permite al votante comparar sus preferencias políticas con las de los candidatos en competencia mediante un algoritmo transparente, exposición al usuario de las posturas asignadas a cada candidato y soporte simultáneo para múltiples procesos electorales (presidencial, parlamentaria, municipal). A diferencia de los intentos previos en Chile —entre ellos *Votamos Todos* (Zismo, 2021-2022, limitada al plebiscito constitucional), *Decide Chile*, *Vota Inteligente* e *Infovecino*, ninguna consolidada como VAA multi-elección con matching algorítmico documentado—, la solución propuesta publica su algoritmo de matching en la propia documentación del proyecto, expone al usuario las posturas asignadas a cada candidato y filtra automáticamente candidaturas según la comuna del votante mediante un modelo territorial polimórfico que representa las 16 regiones, 28 distritos y 346 comunas del país. El backend fue implementado en Django + Django REST Framework y el frontend en React Native + Expo, con contrato API bajo OpenAPI 3.1 auto-generado. El algoritmo de afinidad utiliza una fórmula cuadrática que penaliza con mayor severidad las diferencias extremas, incorpora ponderación declarada por el usuario, maneja explícitamente respuesta, entrega un nivel de confianza según el número de preguntas efectivamente consideradas y provee explicación pregunta-a-pregunta del resultado. La aplicación cumple con las pautas WCAG 2.2 nivel AA. Se aplicó metodología iterativa con siete fases y se ejecutó testing automatizado con 25 archivos de pruebas backend. El sistema se empaqueta con Docker para despliegue reproducible.

**Palabras clave:** Voting Advice Application; asesoramiento electoral; algoritmo de matching; modelo polimórfico jerárquico; desinformación electoral; accesibilidad WCAG; aplicaciones multiplataforma; Chile; Django; React Native.

<!--PAGE_BREAK-->

---

## Abstract

This work describes the design and implementation of *matchVote*, a Progressive Web App (PWA) and cross-platform mobile application that acts as a Voting Advice Application (VAA) for the Chilean electoral context. The application allows voters to compare their political preferences with those of competing candidates through a transparent algorithm, transparent exposure of the postures assigned to each candidate and simultaneous support for multiple electoral processes (presidential, parliamentary, municipal). Unlike previous efforts in Chile —including *Votamos Todos* (Zismo, 2021-2022, limited to the constitutional plebiscite), *Decide Chile*, *Vota Inteligente*, and *Infovecino*, none of which consolidated as a multi-election VAA with a documented matching algorithm—, the proposed solution publishes its matching algorithm in the project documentation, transparently exposes to the user the postures assigned to each candidate and automatically filters candidates according to the voter's municipality through a polymorphic territorial model representing the country's 16 regions, 28 electoral districts, and 346 municipalities. The backend was implemented in Django and Django REST Framework, and the frontend in React Native and Expo, with an auto-generated OpenAPI 3.1 API contract. The affinity algorithm uses a quadratic formula that penalizes extreme differences more heavily, incorporates user-declared weighting, explicitly handles "Don't know" answers, provides a confidence level based on the number of questions actually considered, and offers a question-by-question explanation of the result. The application complies with WCAG 2.2 Level AA accessibility guidelines. An iterative methodology was applied through seven phases, and automated testing was executed with 25 backend test files. The system is packaged with Docker for reproducible deployment.

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

- **Figura 1.** Diagrama de flujo del usuario principal — sección 4.9
- **Figura 2.** Arquitectura general del sistema (backend y frontend) — sección 4.13
- **Figura 3.** Estructura de directorios del backend — sección 4.13
- **Figura 4.** Estructura de directorios del frontend — sección 4.14
- **Figura 5.** Carta Gantt del proyecto por fases y sprints — sección 4.8

## Índice de tablas

- **Tabla 1.** Alcances del proyecto — sección 1.7
- **Tabla 2.** Limitaciones del proyecto — sección 1.7
- **Tabla 3.** Problemas de la oferta actual de información electoral — sección 2.4
- **Tabla 4.** Problemas de las VAAs previas en Chile — sección 2.4
- **Tabla 5.** Problemas técnicos identificados en soluciones análogas — sección 2.4
- **Tabla 6.** Cronograma de fases y sprints — sección 4.8
- **Tabla 7.** Stack tecnológico del backend — sección 4.10
- **Tabla 8.** Stack tecnológico del frontend — sección 4.10
- **Tabla 9.** Scores por diferencia en escala Likert 1-5 — sección 4.12
- **Tabla 10.** Niveles de confianza según preguntas consideradas — sección 4.12
- **Tabla 11.** Ejemplo numérico del cálculo de matching pregunta a pregunta — sección 4.12
- **Tabla 12.** Endpoints principales de la API — sección 4.16
- **Tabla 13.** Casos de prueba del algoritmo de matching — sección 5.3
- **Tabla 14.** Anexo A. Ejes temáticos del cuestionario — Anexo A
- **Tabla 15.** Anexo B. Preguntas base ilustrativas — Anexo B
- **Tabla 16.** Anexo C. Comparativa con VAAs internacionales — Anexo C

<!--PAGE_BREAK-->

---

## 1. Introducción

### 1.1 Qué es matchVote

*matchVote* es una aplicación web progresiva (PWA) y móvil multiplataforma que actúa como **Voting Advice Application (VAA)** para el contexto electoral chileno. En términos simples, es una herramienta que le pregunta al votante su opinión sobre políticas públicas concretas —economía, salud, educación, seguridad, ambiente, derechos humanos, política internacional y reforma institucional— y compara esas respuestas con las posturas declaradas y verificadas de los candidatos en competencia, entregando un ranking de afinidad ordenado, un desglose por eje temático y una explicación pregunta-a-pregunta del resultado.

La aplicación soporta simultáneamente múltiples procesos electorales activos (presidencial, parlamentaria y municipal) mediante un modelo territorial que filtra automáticamente a los candidatos según la comuna del votante, evitando que compare candidaturas que no aparecerán en su cédula. El nombre "matchVote" refiere metafóricamente al mecanismo de comparación individualizada, pero el producto no replica el flujo de swipe característico de la plataforma homónima: se estructura como un cuestionario ponderable con explicación algorítmica.

### 1.2 Qué busca

El proyecto busca **reducir la asimetría de información** que enfrenta el votante chileno en cada ciclo electoral, entregando una herramienta que cumpla simultáneamente con cinco características que hoy no están reunidas en ninguna solución existente en el país:

1. Algoritmo de matching documentado y transparente, publicado en la propia documentación del proyecto.
2. Exposición al usuario de las posturas asignadas a cada candidato de manera clara y consultable dentro de la propia aplicación.
3. Cobertura multi-nivel territorial (nacional, distrital y comunal).
4. Accesibilidad conforme a WCAG 2.2 nivel AA (W3C, 2023).
5. Continuidad operativa entre elecciones.

En términos de resultado esperado, el proyecto entrega un producto funcional multiplataforma, un cuestionario estructurado en torno a ejes temáticos amplios de la política pública chilena, una arquitectura reutilizable para otros países con estructura territorial comparable, y documentación técnica y accesible que permite la reproducibilidad de las decisiones de diseño.

### 1.3 Cuándo se ocuparía

La aplicación fue diseñada para tres momentos del ciclo electoral chileno:

- **Antes de la elección** (uso principal): el votante ingresa a la aplicación durante el período de campaña, responde el cuestionario correspondiente al proceso electoral activo y obtiene un ranking de afinidad que puede consultar tantas veces como necesite hasta el día de la votación.
- **Durante períodos no electorales** (uso educativo): la aplicación permanece disponible para consulta educativa sobre los ejes temáticos de la política pública chilena, sirve como referencia para investigadores y periodistas, y permite a los votantes explorar retroactivamente las posturas de electos vigentes.
- **Entre ciclos electorales** (uso comparativo): el usuario puede consultar el histórico de sus respuestas, comparar coherencia entre elecciones sucesivas y observar la evolución de las posturas de candidatos que participan en más de un proceso.

El diseño multi-elección permite que un mismo votante utilice la aplicación en una sola sesión para las tres elecciones simultáneas típicas de un ciclo chileno (por ejemplo, presidencial + diputados por distrito + alcalde por comuna), reutilizando las respuestas de las **preguntas base** transversales de valores.

### 1.4 Cuándo pasa el problema

El problema al que responde *matchVote* se manifiesta principalmente durante los **períodos de campaña electoral**, cuando el votante enfrenta una avalancha de información fragmentada, sesgada y en ocasiones deliberadamente falsa. Este período crítico se agudiza en las últimas tres a cuatro semanas antes de cada elección, cuando la circulación de contenido en redes sociales y aplicaciones de mensajería alcanza sus picos históricos, según reportan verificadores independientes como Fast Check CL (2024) y Mala Espina Check (2024).

Sin embargo, el problema tiene una dimensión estructural que trasciende el período de campaña: la ausencia de herramientas civiles o institucionales de comparación programática es permanente. En Chile, incluso fuera de períodos electorales, un ciudadano interesado en comparar sistemáticamente las posturas de sus representantes electos vigentes con las suyas propias no dispone de una plataforma para hacerlo.

### 1.5 Por qué es importante

En una democracia representativa, la calidad de las decisiones colectivas depende de la calidad de las decisiones individuales, y estas a su vez de la información disponible al momento de decidir. Cuando la información es asimétrica, fragmentada o está contaminada por desinformación, el resultado agregado no refleja las preferencias reales del electorado sobre políticas públicas concretas, sino su reacción a los estímulos comunicacionales dominantes del ciclo.

La importancia del proyecto se sostiene en tres dimensiones:

- **Cívica**: entrega una herramienta que devuelve al debate público el foco sobre propuestas concretas, en un contexto donde el debate está dominado por controversias personales y encuestas de intención de voto (Cedroni & Garzia, 2010).
- **Tecnológica**: demuestra que es viable construir infraestructura cívica de calidad profesional con recursos limitados, aprovechando el estado del arte en desarrollo multiplataforma (Meta Platforms, 2024), APIs auto-documentadas (OpenAPI Initiative, 2021) y containerización (Docker Inc., 2024).
- **Académica**: constituye un caso de estudio integral que aplica principios sólidos de ingeniería de software (Martin, 2017; Hunt & Thomas, 1999; Beck, 1999), diseño de interfaces (Frost, 2016), estándares de accesibilidad (W3C, 2023) y modelos de dominio complejos.

### 1.6 Objetivos

**Objetivo general.** Diseñar e implementar una aplicación web progresiva (PWA) y móvil multiplataforma de asesoramiento electoral (VAA) para el contexto chileno, con algoritmo de matching transparente y documentado, arquitectura modular, soporte para múltiples elecciones simultáneas con scope territorial, y cumplimiento de estándares de accesibilidad WCAG 2.2 nivel AA (W3C, 2023).

**Objetivos específicos.**

1. Implementar un algoritmo de matching robusto que incorpore penalización cuadrática, ponderación declarada, manejo explícito de "No sé", nivel de confianza, breakdown por eje temático y filtrado territorial polimórfico.
2. Diseñar un sistema territorial polimórfico que soporte scopes nacional, distrital y comunal sin migraciones de schema para nuevos niveles.
3. Soportar múltiples elecciones simultáneas con reutilización de preguntas transversales de valores.
4. Aplicar principios SOLID (Martin, 2017), DRY (Hunt & Thomas, 1999) y YAGNI (Beck, 1999) en la arquitectura.
5. Exponer la API bajo el estándar OpenAPI 3.1 (OpenAPI Initiative, 2021).
6. Exponer al usuario las posturas asignadas a cada candidato de manera transparente y consultable dentro de la propia aplicación.
7. Mantener suite de pruebas automatizadas sobre backend y frontend.
8. Cumplir WCAG 2.2 nivel AA (W3C, 2023).
9. Entregar la aplicación en web, iOS y Android desde un único codebase mediante React Native + Expo (Meta Platforms, 2024; Expo, 2024).
10. Empaquetar el sistema con Docker para despliegue reproducible (Docker Inc., 2024).

### 1.7 Alcances y limitaciones

**Tabla 1**

*Alcances del proyecto*

| # | Dimensión | Alcance del proyecto |
|---|-----------|----------------------|
| A1 | Cobertura electoral | Presidencial, parlamentaria (diputados por distrito) y municipal (alcaldes por comuna) del ciclo 2024-2025. |
| A2 | Cobertura territorial | Las 16 regiones, 28 distritos electorales y 346 comunas de Chile. |
| A3 | Plataformas de entrega | Web (PWA responsive), iOS y Android desde un único codebase React Native. |
| A4 | Idioma | Español chileno como idioma principal de la interfaz y del contenido. |
| A5 | Algoritmo de matching | Fórmula cuadrática con ponderación declarada, manejo de "No sé", confianza por número de preguntas, breakdown por eje y filtrado territorial polimórfico. |
| A6 | Modelo de datos | 19 entidades organizadas en 10 submódulos, con signals para consistencia derivada. |
| A7 | Contrato API | 25+ endpoints REST bajo OpenAPI 3.1, auto-documentados y con tipos TypeScript generados. |
| A8 | Accesibilidad | Cumplimiento de WCAG 2.2 nivel AA en todas las pantallas de la aplicación. |
| A9 | Testing | Suite de 25 archivos de pruebas backend. |
| A10 | Documentación | 20+ documentos técnicos y accesibles, guía de accesibilidad y mapa de navegación. |
| A11 | Despliegue | Empaquetado con Docker, con instrucciones de deploy productivo. |
| A12 | Transparencia interna | Exposición al usuario de las posturas asignadas a cada candidato de manera clara y consultable dentro de la propia aplicación. |
| A13 | Modo guest | Servicio backend `calcular_match_anonimo` operativo (interfaz frontend en roadmap). |
| A14 | Dataset del alcance de tesis | Los candidatos incorporados corresponden a los últimos participantes de cada elección del ciclo cuando la información pública lo permite, o a datos ficticios didácticos en caso contrario. Las posturas asignadas son ilustrativas, construidas a partir de referencias generales de posicionamiento político existente, no como resultado de verificación formal contra fuentes primarias. El sistema soporta la migración a un dataset verificado en despliegue productivo sin modificaciones estructurales. |

*Nota.* Elaboración propia. Todos los alcances declarados están implementados en el proyecto entregado.

**Tabla 2**

*Limitaciones del proyecto*

| # | Limitación | Descripción y motivo |
|---|------------|----------------------|
| L1 | Dataset ilustrativo, no operativo | El presente trabajo prueba el diseño del sistema, no la curaduría de datos operativos. Las posturas asignadas a cada candidato son ilustrativas y no fueron sometidas a un proceso de verificación formal contra fuentes primarias documentadas. La curaduría formal es trabajo curatorial masivo que corresponde a la etapa posterior de despliegue productivo. |
| L2 | Sin senadores ni consejeros regionales en el MVP | El modelo territorial polimórfico soporta estos niveles sin cambios de schema, pero los seeds no forman parte de esta entrega. |
| L3 | Sin cobertura de plebiscitos | Los procesos plebiscitarios tienen un modelo pregunta/respuesta distinto que requeriría adaptación. |
| L4 | Base de datos SQLite en desarrollo | Producción requiere migración a PostgreSQL. Documentada pero no ejecutada. |
| L5 | Sin autenticación mediante ClaveÚnica | La integración con el sistema de identidad estatal chileno queda fuera del scope. |
| L6 | Sin verificación de correo electrónico | El registro genera cuenta activa sin verificar dominio. |
| L7 | Sin rate limiting productivo | Endpoints sensibles (login, reset) sin límites de velocidad. |
| L8 | Sin CI/CD automatizado | Las pruebas se ejecutan localmente. |
| L9 | Sin análisis empírico de uso | No incluye pruebas con usuarios reales ni medición del impacto electoral. |
| L10 | Migración territorial en fase 2 de 3 | Los FKs legacy conviven con el nuevo `unidad_territorial`. |
| L11 | Sin auditoría externa de seguridad | Dos rondas de auditoría interna, sin auditoría de tercero especializado. |
| L12 | Sin compartir resultado como imagen | Feature deseable no implementada. |
| L13 | Sin componente académico empírico | Trabajo de diseño e implementación; no incluye componente hipotético-deductivo. |
| L14 | Sin evaluación de accesibilidad con usuarios | WCAG 2.2 AA verificado con auditoría técnica automatizada y revisión manual, no con pruebas con personas usuarias con discapacidad. |

*Nota.* Elaboración propia. Cada limitación queda registrada como deuda técnica priorizada.

<!--PAGE_BREAK-->

---

## 2. Definición del problema

### 2.1 Enunciado general

El votante chileno enfrenta un problema estructural de **asimetría de información** al momento de decidir su voto: dispone de tiempo limitado, canales de información fragmentados y polarizados, y ninguna herramienta institucional o civil que le permita comparar de forma sistemática y transparente las posturas de los candidatos frente a políticas públicas concretas.

Este problema puede formalizarse como una **decisión multi-nivel bajo información incompleta**: dado un conjunto `C = {c_1, c_2, ..., c_n}` de candidaturas compitiendo en un proceso electoral `E` de un nivel territorial dado, y un conjunto `P = {p_1, p_2, ..., p_m}` de políticas públicas relevantes, el votante `v` requiere estimar una función de afinidad `f(v, c_i)` que le permita ordenar `C` por proximidad ideológica. La complejidad es multiplicativa porque el votante decide simultáneamente sobre varias elecciones activas con distintos niveles de scope territorial.

### 2.2 Quién tiene el problema

El problema afecta principalmente a **los votantes chilenos habilitados**, con distintos niveles de intensidad según su perfil:

- **Votantes con interés activo por comparar propuestas**, pero sin tiempo material para leer los programas oficiales completos de cada candidatura. Este segmento reconoce el problema y busca soluciones, pero no las encuentra.
- **Votantes desconfiados del sistema político**, que abandonan la búsqueda activa de información programatica por saturación o cinismo. Terminan votando por adhesión partidaria heredada, por imagen o por rechazo.
- **Votantes nuevos** (jóvenes que votan por primera vez, especialmente relevantes desde la reintroducción del voto obligatorio en Chile) que carecen del capital político previo para orientar su decisión.
- **Votantes con discapacidad**, para quienes las guias electorales tradicionales presentan barreras adicionales de acceso.
- **Votantes fuera de los grandes centros urbanos**, cuya oferta de candidaturas locales recibe menos cobertura mediática.

Secundariamente, el problema afecta al ecosistema democrático completo: **periodistas, investigadores, docentes, organizaciones de sociedad civil y las propias candidaturas** operan sin infraestructura comparativa transparente.

### 2.3 Quién se puede ver beneficiado por resolverlo

Resolver el problema beneficia a los siguientes actores:

- **Al votante individual**: reduce el costo cognitivo de comparar, entrega criterios explícitos y devuelve tiempo.
- **A la ciudadanía organizada**: dispone de una fuente común auditable para conversaciones familiares, laborales o educativas sobre la elección.
- **A investigadores y periodistas**: acceden a un modelo comparativo estructurado que permite análisis agregados sobre coherencia programática.
- **A candidaturas y equipos programáticos**: reciben retroalimentación sobre coherencia programática y un incentivo a explicitar posturas de manera clara y consultable por el electorado.
- **Al ecosistema tecnológico chileno**: se demuestra que es posible construir infraestructura cívica de calidad profesional con recursos limitados, entregando una base de código reutilizable para otras iniciativas GovTech.
- **A las instituciones democráticas**: se mejora la representatividad al reducir la brecha entre las mayorías programáticas del electorado y los electos.

### 2.4 Qué problema hay

El problema tiene múltiples manifestaciones concretas identificadas durante la investigación. Se agrupan en tres categorías: problemas de la oferta actual de información, problemas de las VAAs previas en Chile y problemas técnicos identificados en soluciones análogas internacionales.

**Tabla 3**

*Problemas de la oferta actual de información electoral*

| # | Problema | Descripción |
|---|----------|-------------|
| P1 | Sobrecarga informativa | Los programas oficiales de candidaturas superan las capacidades atencionales del votante promedio. |
| P2 | Sesgo mediático | La cobertura de prensa privilegia titulares, controversias y encuestas por sobre la comparación programática. |
| P3 | Desinformación organizada | Circulación masiva de contenido falso, memes descontextualizados y noticias manipuladas en redes sociales. |
| P4 | Fragmentación de fuentes | La información sobre un mismo candidato se dispersa entre programa oficial, entrevistas, redes propias, medios afines y hostiles. |
| P5 | Falta de trazabilidad | Cuando un medio o influencer afirma "el candidato X propone Y", raramente se cita la fuente primaria verificable. |
| P6 | Complejidad multi-elección | El votante debe decidir simultáneamente sobre presidencial, diputados por distrito, alcalde por comuna y otras, cada una con listas distintas de candidatos. |

*Nota.* Elaboración propia a partir de la revisión de literatura y observación del ecosistema electoral chileno.

**Tabla 4**

*Problemas de las VAAs previas en Chile*

| # | Problema | Descripción |
|---|----------|-------------|
| P7 | Discontinuidad operativa | Los intentos previos en Chile se activaron solo en un ciclo electoral y luego fueron abandonados. |
| P8 | Algoritmos opacos | Las herramientas existentes no publican su fórmula de matching, imposibilitando auditoría independiente. |
| P9 | Sin documentación abierta del algoritmo | Ninguna VAA chilena previa publicó la fórmula ni el detalle del cálculo de matching en formato consultable por terceros. |
| P10 | Sin transparencia sobre las posturas asignadas | Las posturas asignadas a candidatos no se exponían al usuario de manera clara y consultable dentro de la propia herramienta. |
| P11 | Sin cobertura territorial | Herramientas previas cubrían solo elecciones nacionales, ignorando la dimensión distrital y comunal. |

*Nota.* Elaboración propia a partir del análisis de las VAAs chilenas identificadas.

**Tabla 5**

*Problemas técnicos identificados en soluciones análogas*

| # | Problema | Descripción |
|---|----------|-------------|
| P12 | Algoritmos lineales simplistas | La mayoría de VAAs promedian diferencias sin penalizar más fuerte las diferencias extremas. |
| P13 | Ausencia de opción "No sé" honesta | Los VAAs suelen forzar al usuario a una posición neutral cuando en realidad no tiene opinión. |
| P14 | Sin nivel de confianza | Un match del 80% basado en 3 preguntas se presenta con la misma autoridad que uno basado en 30. |
| P15 | Sin explicabilidad por dimensión | La mayoría entrega un porcentaje global sin desglose por eje temático. |
| P16 | Sin explicabilidad pregunta-a-pregunta | El usuario no puede ver qué preguntas contribuyeron más o menos al resultado final. |
| P17 | Ausencia de accesibilidad | Pocas VAAs cumplen con las directrices WCAG (W3C, 2023). |

*Nota.* Elaboración propia a partir de la revisión de nueve VAAs internacionales.

### 2.5 Dónde está el problema

El problema tiene una localización **nacional en Chile**, pero con dimensiones específicas que lo hacen distinto de contextos comparables:

- **Nivel institucional**: no existe una institución pública ni universidad chilena que mantenga una VAA activa entre elecciones. Contrasta con Alemania (Wahl-O-Mat de la *bpb*), Países Bajos (StemWijzer de ProDemos) o Suiza (Smartvote de Politools).
- **Nivel mediático**: los medios chilenos han publicado cuestionarios electorales puntuales durante campañas específicas, sin sostenerlos entre ciclos.
- **Nivel territorial**: incluso las iniciativas puntuales han cubierto solo la elección presidencial, ignorando las decisiones distritales y comunales donde el votante enfrenta candidatos diferentes según su ubicación geográfica.
- **Nivel digital**: la información electoral oficial existe (SERVEL, 2024), pero se distribuye en formatos administrativos (CSV, XLSX, PDF) orientados al escrutinio y no al votante; no hay API pública que exponga posturas programáticas en formato consumible por aplicaciones.
- **Nivel de confianza**: la circulación de desinformación en redes sociales y aplicaciones de mensajería (WhatsApp, Telegram) documentada por verificadores como Fast Check CL (2024) y Mala Espina Check (2024) erosiona la confianza en las fuentes disponibles.

### 2.6 En qué proceso está el problema

El problema se manifiesta a lo largo del **ciclo completo de decisión del votante**, con distintas intensidades por etapa:

1. **Etapa de exposición inicial** (varios meses antes de la elección): el votante empieza a percibir a los candidatos por cobertura mediática y redes sociales, sin criterio programático organizado.
2. **Etapa de búsqueda activa** (semanas antes): el votante interesado intenta comparar posturas, choca con la fragmentación de fuentes y la falta de una herramienta comparativa transparente.
3. **Etapa de decisión final** (días antes o durante el voto): el votante decide con la información parcial acumulada, en muchos casos por adhesión partidaria previa, imagen o rechazo antes que por convergencia programática.
4. **Etapa posterior al voto** (post-elección): sin herramienta de trazabilidad, el votante pierde la capacidad de contrastar retrospectivamente si el electo cumple las posturas que declaró.

El proyecto se enfoca principalmente en las etapas 2 y 3, entregando una herramienta que reduce el costo de la búsqueda activa y aporta criterios explícitos para la decisión final.

### 2.7 Cómo se resuelve actualmente

Actualmente, el problema se resuelve (de forma parcial e insatisfactoria) mediante los siguientes canales:

- **Lectura directa de programas oficiales** publicados en el portal del SERVEL (SERVEL, 2024). Requiere horas por candidato y no ofrece comparación sistemática.
- **Cobertura mediática** de programas de televisión, radios y prensa escrita. Ofrece síntesis pero suele privilegiar controversias sobre propuestas.
- **Conversaciones informales** con familia, amistades o colegas. Sesgadas por la burbuja social.
- **Redes sociales** de los propios candidatos y de terceros. Alto ruido informacional, con presencia de desinformación verificada por Fast Check CL (2024) y Mala Espina Check (2024).
- **Iniciativas puntuales chilenas** que se han acercado parcialmente al problema:
  - **Votamos Todos** (Zismo, 2021-2022) fue creada para el plebiscito constitucional con un cuestionario de 70 preguntas y matching contra las respuestas de los candidatos. Es el antecedente más cercano al modelo VAA propiamente tal, pero limitada al plebiscito y actualmente discontinuada.
  - **Decide Chile** ofrece información electoral, predicción de resultados y componentes lúdicos, sin matching personalizado.
  - **Vota Inteligente** difunde propuestas de candidaturas, sin componente algorítmico de matching.
  - **Infovecino** entrega información personalizada por comuna, sin matching.
- **Voto Informado del INE** (México) y **Voto Informado del JNE** (Perú) son ejemplos regionales relacionados, orientados a directorio institucional más que a matching algorítmico personalizado. Ninguna disponible para el contexto chileno.

Esta oferta no cumple simultáneamente con las seis características identificadas en la sección 1.2, lo que motiva el desarrollo del presente proyecto.

### 2.8 Por qué es un problema

Es un problema porque las decisiones colectivas tomadas con información asimétrica generan tres consecuencias observables:

- **A nivel individual**: el votante toma decisiones que no reflejan sus preferencias reales sobre políticas públicas. Encuestas del CEP y Latinobarómetro muestran que un porcentaje significativo del electorado chileno declara no conocer las propuestas específicas de los candidatos por los que vota.
- **A nivel institucional**: se erosiona la representatividad. Los electos no siempre reflejan las mayorías programáticas del electorado, sino las mayorías de reacción a los estímulos comunicacionales.
- **A nivel democrático**: la deliberación pública se degrada. El debate se centra en personajes en lugar de propuestas. La polarización afectiva reemplaza a la discusión política sustantiva, patrón documentado en la literatura politológica internacional (Garzia & Marschall, 2014).

Adicionalmente, es un problema tecnológicamente resoluble: el estado del arte en desarrollo móvil multiplataforma (Meta Platforms, 2024), APIs auto-documentadas (OpenAPI Initiative, 2021), y containerización (Docker Inc., 2024) permite construir la solución con recursos limitados. No hay barrera técnica que justifique su ausencia; es una brecha institucional y de asignación de esfuerzo.

<!--PAGE_BREAK-->

---

## 3. Marco conceptual

### 3.1 Voting Advice Applications (VAA)

Las VAAs son sistemas de apoyo a la decisión electoral que comparan las preferencias declaradas del votante con las de partidos o candidatos, entregando un ranking de afinidad. Su origen se remonta a *StemWijzer* en Países Bajos (1989), inicialmente distribuido en formato disquete y hoy disponible como aplicación web. La literatura politológica (Cedroni & Garzia, 2010; Garzia & Marschall, 2014; Marschall, 2005) ha estudiado extensamente su impacto sobre la participación, la formación de preferencias y la volatilidad electoral. Walgrave et al. (2008) documentan que las VAAs pueden influir efectivamente en el voto en países con alta penetración.

### 3.2 Estado del arte de las VAAs

#### 3.2.1 VAAs consolidadas en Europa

**StemWijzer** (Países Bajos, ProDemos). La VAA más antigua del mundo (1989). Cada elección neerlandesa registra millones de consultas. Utiliza un algoritmo de proximidad basado en escala de tres opciones. Su algoritmo no está documentado públicamente en detalle y su código no es abierto, pero ha establecido el estándar del rubro (Cedroni & Garzia, 2010).

**Wahl-O-Mat** (Alemania, *Bundeszentrale für politische Bildung*). Operado por la agencia federal alemana para la educación cívica desde 2002. Se basa en tesis políticas con tres opciones de respuesta, permite ponderar por importancia y publica su metodología de matching (Marschall, 2005). Su respaldo institucional continuo entre elecciones lo convierte en la referencia europea con mayor sostenibilidad.

**Smartvote** (Suiza, Politools). Cubre múltiples niveles electorales simultáneamente (federal, cantonal, comunal), una característica rara entre VAAs. Presenta al usuario un gráfico de radar con ocho dimensiones ideológicas y un mapa bidimensional de posicionamiento político.

**Kieskompas** (Países Bajos, Universiteit van Amsterdam). Introduce el paradigma del *mapa bidimensional*: en lugar de un ranking lineal, ubica al usuario y a los partidos en un plano cartesiano con eje económico y eje cultural.

#### 3.2.2 VAAs e iniciativas informativas en América

**Vote Compass** (Canadá y Australia, Vox Pop Labs). Operativo desde 2011 en alianza con las cadenas públicas CBC y ABC. No publica su algoritmo detallado ni su código.

**Voto Informado del INE** (México) y **Voto Informado del JNE** (Perú). Plataformas oficiales que agregan perfiles y programas de candidaturas, priorizando el directorio institucional por sobre el matching personalizado.

**Infovotantes** (Colombia). Información sobre votaciones y candidatos, sin matching algorítmico personalizado.

**VotaPE** (Perú). Combina información de candidatos, comparación directa, planes de gobierno, noticias y podcast de partidos políticos. Más cercana al directorio comparativo enriquecido que a la VAA algorítmica clásica.

#### 3.2.3 El caso chileno

En Chile se han identificado varias iniciativas con distintos grados de cercanía al modelo VAA. **Votamos Todos** (Zismo, 2021-2022) es el antecedente más cercano al modelo VAA propiamente tal: creada para el plebiscito constitucional con un cuestionario de 70 preguntas que el usuario podía ir respondiendo en tramos de 5 en 5, generando un match parcial desde las primeras cinco respuestas contra las respuestas de los candidatos. **Decide Chile** ofrece información electoral, predicción de resultados y componentes lúdicos, pero no incorpora matching personalizado. **Vota Inteligente** difunde propuestas de candidaturas sin componente algorítmico. **Infovecino** entrega información personalizada por comuna, también sin matching. Ninguna cumple simultáneamente con las seis características identificadas como necesarias (sección 1.2); *Votamos Todos* es la más cercana pero se limitó al plebiscito.

#### 3.2.4 Factores comunes de éxito

De la revisión se identifican tres factores comunes en las VAAs sostenibles: **respaldo institucional continuo entre elecciones**, **integración con periodismo político o educación cívica formal**, y **transparencia metodológica**.

El Anexo C presenta la comparativa detallada de *matchVote* con las iniciativas mencionadas.

### 3.3 Escalas Likert

La escala Likert (Likert, 1932) es un instrumento psicométrico ampliamente utilizado en investigación social para medir actitudes. En este proyecto se adoptó la variante de 5 puntos por ser el *sweet spot* documentado entre resolución y fatiga cognitiva (Krosnick & Presser, 2010), y se incorporó una sexta opción explícita "No sé / Prefiero no responder" que se excluye del cálculo.

### 3.4 Distancia ponderada no-lineal

El proyecto adopta una fórmula que penaliza cuadráticamente las diferencias:

```
score_pregunta = 1 - (diff / 4)^2
```

donde `diff` es la diferencia absoluta entre el valor Likert del usuario y el del candidato, normalizada por el rango máximo (4 en escala 1-5). Cada score se pondera por un multiplicador declarado por el usuario. Este enfoque es coherente con la literatura sobre distancias euclidianas ponderadas en el análisis multidimensional de posiciones políticas (Garzia & Marschall, 2014).

### 3.5 Modelos polimórficos con jerarquía

El diseño del modelo `UnidadTerritorial` implementa el patrón *polymorphic hierarchical entity*, donde una única tabla representa unidades de distintos niveles relacionadas mediante una referencia auto-recursiva `padre`. Este patrón, común en la modelación de estructuras administrativas y en ontologías (Fowler, 2003), permite agregar nuevos niveles sin migraciones de schema.

### 3.6 Arquitectura de software

- **SOLID** (Martin, 2017): principios de diseño orientado a objetos aplicados a la modularización del backend.
- **DRY** (Hunt & Thomas, 1999): eliminación de duplicación en modelos, serializadores y vistas.
- **YAGNI** (Beck, 1999): no implementar features sin necesidad demostrada; aplicado retroactivamente en la Fase 5 del proyecto.
- **Clean Architecture** (Martin, 2017): separación de capas y dependencias unidireccionales.
- **12-Factor App** (Wiggins, 2011): configuración externa, dependencias declaradas, procesos sin estado.

### 3.7 Atomic Design

Metodología propuesta por Frost (2016) que estructura la interfaz en cinco niveles: átomos, moléculas, organismos, templates y pantallas. El proyecto aplica los cinco niveles con implementación real de templates (`AppShell`).

### 3.8 Accesibilidad WCAG 2.2

Las *Web Content Accessibility Guidelines* del W3C (2023) definen criterios de éxito organizados en cuatro principios: perceptibilidad, operabilidad, comprensibilidad y robustez. El proyecto se compromete con el **nivel AA**, lo que implica contrastes mínimos, tamaños de tap targets, navegación por teclado y compatibilidad con tecnologías asistivas.

### 3.9 Contract-first API design

Enfoque en el cual el contrato (schema OpenAPI en este caso) se define antes que la implementación y sirve como fuente única de verdad (OpenAPI Initiative, 2021). Elimina el *drift* entre las expectativas del cliente y las respuestas del servidor.

### 3.10 Cache invalidation y query keys centralizadas

TanStack Query v5 (Linsley, 2024) introduce el patrón de *query keys* jerárquicos que permiten invalidaciones granulares del cache. El proyecto centraliza las query keys en `api/queryClient.ts` para evitar el drift entre puntos de invalidación.

<!--PAGE_BREAK-->

---

## 4. Propuesta de solución

### 4.1 Quién propone la solución

La solución *matchVote* es propuesta y desarrollada por **Jenifer Castillo** como trabajo de tesis para optar al grado de Ingeniera en Informática. El proyecto es individual en cuanto al desarrollo, con orientación del profesor(a) guía y la comisión evaluadora de la carrera.

El código fuente y su documentación forman parte de los entregables de la tesis y quedan a disposición de la comisión evaluadora para la revisión académica.

### 4.2 Qué solución se propone

Se propone construir **una aplicación web progresiva (PWA) y móvil multiplataforma** que sirva como Voting Advice Application (VAA) para el contexto electoral chileno. La solución integra:

- Un **backend** en Django + Django REST Framework con base de datos SQLite (desarrollo) o PostgreSQL (producción).
- Un **frontend** en React Native + Expo, entregable simultáneamente como aplicación web (PWA responsive), iOS y Android desde un único codebase.
- Un **contrato API** bajo OpenAPI 3.1 auto-generado, con tipos TypeScript sincronizados en el frontend.
- Un **algoritmo de matching** cuadrático con ponderación declarada, manejo explícito de "No sé", nivel de confianza y explicación pregunta-a-pregunta.
- Un **modelo territorial polimórfico** que representa las 16 regiones, 28 distritos y 346 comunas de Chile.
- Un **sistema de diseño** interno con showcase completo y cumplimiento WCAG 2.2 AA (W3C, 2023).
- Un **empaquetado con Docker** para despliegue reproducible (Docker Inc., 2024).

La solución no reemplaza al SERVEL ni al debate público; los complementa entregando una capa comparativa transparente.

### 4.3 Quiénes se benefician

La solución beneficia a los actores identificados en la sección 2.3, con impactos concretos por segmento:

- **Al votante individual**: reduce el tiempo de comparación de horas a 5-10 minutos por elección activa; entrega ranking objetivo con criterios explícitos; asegura filtro automático de candidatos por ubicación; provee explicación pregunta-a-pregunta; garantiza acceso sin costo, sin publicidad y sin extracción de datos personales.
- **A la ciudadanía organizada**: entrega fuente común auditable para conversaciones familiares, laborales o educativas.
- **A investigadores y periodistas**: entrega un modelo comparativo estructurado y documentación completa del algoritmo, permitiendo análisis y réplica académica.
- **A candidaturas**: entrega retroalimentación sobre coherencia programática.
- **Al ecosistema tecnológico chileno**: entrega un modelo de diseño reutilizable para otras iniciativas GovTech, con modelo territorial polimórfico adaptable a otros países latinoamericanos.
- **A personas con discapacidad**: garantiza compatibilidad con lectores de pantalla, navegación por teclado y contrastes WCAG AA (W3C, 2023).

### 4.4 Qué hay en la solución

La solución se compone de los siguientes elementos funcionales:

- **19 modelos de dominio** organizados en 10 submódulos (catálogo electoral, territorial, perfil, cuestionario, ejes, matching, datos de usuario, autenticación y contenido).
- **11 submódulos de vistas** con 25+ endpoints REST.
- **9 submódulos de serializadores** para el contrato API.
- **5 servicios** de lógica de dominio (matching, password reset, perfil, respuestas, tipos).
- **16 comandos de management** (importadores + seeds + utilidades).
- **38 migraciones** de base de datos que registran la evolución del schema.
- **25 archivos de pruebas backend** que cubren algoritmo, territorial, seeds, importadores y permisos.
- **18 pantallas** de aplicación, más una pantalla oculta `DesignSystemScreen` para desarrolladores.
- **27 átomos, 29 moléculas y 17 organismos** siguiendo atomic design (Frost, 2016), más un template real `AppShell`.
- **1 sistema de diseño interno** con showcase completo.
- **20+ documentos** de arquitectura, algoritmo, accesibilidad y navegación.
- **Docker** para empaquetado reproducible.

### 4.5 Cuándo impacta la solución

El impacto de la solución se distribuye temporalmente en los mismos cuatro momentos del ciclo del votante identificados en la sección 2.6:

1. **Etapa de exposición inicial**: la aplicación está disponible desde el momento en que se publican las candidaturas oficiales, permitiendo al votante familiarizarse con las opciones antes de la sobrecarga informativa mediática.
2. **Etapa de búsqueda activa**: la aplicación reduce el costo de la búsqueda estructurada de horas a minutos, entregando una comparación sistemática que no existe en otras fuentes.
3. **Etapa de decisión final**: la aplicación entrega criterios explícitos y auditables que el votante puede utilizar como base racional de la decisión, sin sustituirla.
4. **Etapa post-electoral**: el historial de respuestas del usuario y las posturas registradas de los electos permiten trazabilidad retroactiva.

### 4.6 Dónde resuelve el problema y dónde impacta

La solución opera desde el **navegador web y las tiendas de aplicaciones móviles** (iOS App Store y Google Play Store), acompletando la infraestructura digital ya existente del ecosistema electoral chileno. Impacta directamente en los siguientes puntos del ciclo:

- **Punto de acceso ciudadano**: sirve como capa comparativa entre el votante y la información oficial del SERVEL (SERVEL, 2024), sin reemplazarla.
- **Punto de decisión territorial**: por su modelo polimórfico jerárquico (Fowler, 2003), impacta simultáneamente en la decisión nacional (presidencial), distrital (diputados) y comunal (alcaldes), reflejando la realidad de que un mismo votante decide sobre varias elecciones a la vez.
- **Punto de transparencia**: al publicar el algoritmo completo en la propia documentación del proyecto y al exponer las posturas asignadas a cada candidato dentro de la propia aplicación, permite que universidades, periodismo técnico y ciudadanía organizada revisen tanto el mecanismo de cálculo como los insumos que lo alimentan.
- **Punto de accesibilidad**: al cumplir WCAG 2.2 AA (W3C, 2023), impacta positivamente en segmentos habitualmente excluidos de las guias electorales tradicionales.

### 4.7 Metodología

El proyecto se desarrolló siguiendo una metodología **iterativa e incremental**, con sprints de una semana, entregas verticales end-to-end por feature, refactorización guiada por auditorías periódicas del código y aplicación estricta de YAGNI (Beck, 1999). Se organizó en ocho fases:

**Fase 0 — Investigación y análisis del estado del arte.** Revisión de literatura politológica (Cedroni & Garzia, 2010; Garzia & Marschall, 2014; Walgrave et al., 2008) y comparativa de nueve VAAs internacionales.

**Fase 1 — Diseño de arquitectura.** Modelo de dominio inicial y contrato API bajo OpenAPI 3.1 (OpenAPI Initiative, 2021).

**Fase 2 — Implementación del MVP inicial.** Sprints funcionales end-to-end de autenticación, catálogo, cuestionario, matching, resultados y noticias.

**Fase 3 — Auditoría de código y refactorización estructural.** 17 hallazgos iniciales; resolución de 4 críticos y 6 altos.

**Fase 4 — Expansión territorial y multi-elección.** Modelos `Region`, `Distrito`, `Comuna` y `UnidadTerritorial` polimórfico. Campo `es_base` para preguntas transversales.

**Fase 5 — Simplificación agresiva (YAGNI).** Eliminación del flujo swipe y del módulo `DecisionFinal`. Unificación de favoritos + descartados en `MisGuardadosScreen`.

**Fase 6 — Sistema de diseño interno y accesibilidad.** `DesignSystemScreen` con showcase completo. Auditoría WCAG. Guía de accesibilidad y mapa de navegación.

**Fase 7 — Documentación estructurada.** Reorganización de documentación en `docs/backend/simple/` y `docs/backend/tecnico/`.

### 4.8 Cronograma

**Tabla 6**

*Cronograma de fases y sprints*

| Fase | Actividad principal | Duración | Entregable clave |
|:----:|---------------------|:--------:|------------------|
| 0 | Investigación y estado del arte | 3 semanas | Comparativa de VAAs, definición del problema |
| 1 | Diseño de arquitectura y contrato API | 2 semanas | Modelo inicial, primer esquema OpenAPI |
| 2 | MVP inicial (backend + frontend) | 10 semanas | Flujo end-to-end |
| 3 | Auditoría de código y refactorización | 3 semanas | Resolución de 4 críticos + 6 altos |
| 4 | Expansión territorial y multi-elección | 5 semanas | Modelos territoriales, `es_base`, seeds |
| 5 | Simplificación YAGNI | 2 semanas | Eliminación de swipe y `DecisionFinal` |
| 6 | Sistema de diseño y accesibilidad | 3 semanas | `DesignSystemScreen`, guía WCAG |
| 7 | Documentación y tesis | 4 semanas | `docs/backend/*`, este documento |

*Nota.* Elaboración propia. Duración total estimada: 32 semanas (~8 meses).

**Figura 5**

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

*Nota.* Elaboración propia. Cada `#` representa aproximadamente una semana.

### 4.9 Flujo del usuario

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
                    +---------------+---------+          |
                    v               v         v          |
            [Gestion elec.]  [Cuestionario]  [Novedades] |
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

El flujo principal consta de 12 pasos: splash + welcome tour, login/signup, selección de ubicación, home HUB multi-elección, gestión de elecciones activas, cuestionario con Likert 1-5 + "No sé" + peso, envío de respuestas, cálculo de match, resultados con ranking, detalle de candidato con radar y desglose pregunta-a-pregunta, comparación de candidatos, y gestión de guardados (favoritos + descartados + bookmarks de posturas).

### 4.10 Stack tecnológico

**Tabla 7**

*Stack tecnológico del backend*

| Capa | Tecnología | Versión | Rol |
|------|------------|---------|-----|
| Framework web | Django (Django Software Foundation, 2024) | 5.2 | Framework principal, ORM, admin |
| API REST | Django REST Framework | 3.15+ | Serialización, viewsets, autenticación |
| Auth | DRF Token Authentication (custom) | - | Autenticación mobile-friendly |
| Schema | drf-spectacular | - | Generación OpenAPI 3.1 |
| DB desarrollo | SQLite | - | Zero-config |
| DB producción | PostgreSQL | - | Estándar production-ready |
| Config | python-decouple | 3.8+ | Variables desde `.env` |
| Media | Pillow | 10.3+ | Procesamiento de imágenes |
| CORS | django-cors-headers | 4.4+ | Consumo desde frontend |
| Testing | pytest + pytest-django | 8.3+ / 4.9+ | Suite de pruebas |
| Package manager | uv (Astral, 2024) | - | Instalación de dependencias |
| Containerización | Docker (Docker Inc., 2024) | - | Deploy reproducible |

*Nota.* Elaboración propia a partir del `pyproject.toml`.

**Tabla 8**

*Stack tecnológico del frontend*

| Capa | Tecnología | Rol |
|------|------------|-----|
| Runtime | React Native + Expo SDK 57 (Meta Platforms, 2024; Expo, 2024) | Framework multiplataforma |
| UI kit | Tamagui | Sistema de componentes con theming |
| Navegación | React Navigation | Ruteo entre pantallas |
| Data fetching | TanStack Query v5 (Linsley, 2024) | Cache, retry, dedup |
| Estado | Zustand (pmndrs, 2024) | Estado global |
| Tipos | TypeScript strict (Microsoft, 2024) | Sistema de tipos estático |
| Contratos | openapi-typescript | Tipos desde OpenAPI |
| Almacenamiento seguro | Expo SecureStore | Persistencia de tokens |
| Testing | Jest + React Native Testing Library | Pruebas |

*Nota.* Elaboración propia a partir del `package.json`.

### 4.11 Modelo de dominio

El backend define 19 modelos en `core/models/` (10 submódulos): catálogo electoral (`TipoEleccion`, `Candidato`), territorial (`Region`, `Distrito`, `Comuna`, `UnidadTerritorial`), perfil (`UserProfile`), cuestionario (`Pregunta`, `OpcionRespuesta`, `RespuestaUsuario`), ejes (`Eje`), matching (`PosturaCandidato`, `MatchCandidato`), datos de usuario (`CandidatoFavorito`, `CandidatoDescartado`, `PosturaBookmark`, `NoticiaBookmark`), autenticación (`PasswordResetToken`) y contenido (`Noticia`). El modelo `DecisionFinal` fue eliminado en la migración `0037` como parte del sprint YAGNI (Beck, 1999).

### 4.12 Algoritmo de matching

Tres servicios en `core/services/matching.py`:

- `calcular_match(user, tipo_eleccion)` — autenticada, persiste en `MatchCandidato`.
- `calcular_match_detalle(user, candidato)` — desglose pregunta-a-pregunta.
- `calcular_match_anonimo(respuestas, tipo_eleccion, comuna)` — modo guest.

**Fórmula por pregunta**:

```
diff             = |valor_usuario - valor_candidato|   en [0, 4]
score_pregunta   = 1 - (diff / 4)^2                    en [0.0, 1.0]
mult_peso        = PESO_MULTIPLIERS[peso_declarado]    en {0.5, 1.0, 1.5, 2.0}
score_ponderado  = score_pregunta * mult_peso
```

**Filtrado territorial polimórfico**: dada la comuna del usuario, se calcula su `UnidadTerritorial` y la cadena de ancestros, y se filtran los candidatos con `unidad_territorial IS NULL` OR `unidad_territorial_id IN {ut_votante, ancestros}` (Fowler, 2003).

**Tabla 9**

*Scores por diferencia en escala Likert 1-5*

| Diferencia | Interpretación | Score no-lineal |
|:----------:|----------------|:---------------:|
| 0 | Idéntico | 1.00 |
| 1 | Casi igual | 0.9375 |
| 2 | Diferencia media | 0.75 |
| 3 | Diferencia grande | 0.4375 |
| 4 | Opuesto | 0.00 |

*Nota.* Cálculo obtenido de la fórmula `1 - (diff / 4)^2`.

**Tabla 10**

*Niveles de confianza según preguntas consideradas*

| Nivel | Preguntas consideradas |
|-------|:----------------------:|
| `tentativa` | < 5 |
| `media` | 5-9 |
| `alta` | >= 10 |

*Nota.* Umbrales definidos empíricamente durante el diseño.

**Agregación final** del score por candidato:

```
score_candidato = sum(score_ponderado_i) / sum(mult_peso_i)      para i en preguntas efectivas
afinidad_%      = score_candidato * 100
```

Las preguntas efectivas son aquellas en las que el usuario respondió con una opción distinta de "No sé". Las preguntas marcadas "No sé" se excluyen tanto del numerador como del denominador, evitando distorsión por respuestas neutras artificiales.

**Deducción del `diff / 4`**: la división por 4 normaliza la diferencia absoluta al rango `[0, 1]`, dado que la escala Likert 1-5 admite una diferencia máxima de 4 puntos entre extremos opuestos. Elevar al cuadrado esa diferencia normalizada penaliza las diferencias grandes más severamente que las pequeñas: una diferencia de 1 penaliza `0.0625`, mientras que una diferencia de 3 penaliza `0.5625`, nueve veces más. Este comportamiento no-lineal es deseable en un contexto electoral porque expresa el hecho de que la incompatibilidad programática en temas centrales pesa más que la coincidencia parcial en temas menores.

**Ejemplo numérico paso a paso** para una usuaria X y un candidato Y sobre 5 preguntas:

**Tabla 11**

*Ejemplo numérico del cálculo de matching pregunta a pregunta*

| Pregunta | Respuesta usuario | Respuesta candidato | Peso declarado | `diff` | `score_pregunta = 1 - (diff/4)^2` | `mult_peso` | `score_ponderado` |
|:--------:|:-----------------:|:-------------------:|:--------------:|:------:|:---------------------------------:|:-----------:|:-----------------:|
| 1 | 5 (muy de acuerdo) | 4 (de acuerdo) | Muy importante | 1 | 0.9375 | 2.0 | 1.8750 |
| 2 | 2 (en desacuerdo) | 3 (neutro) | Importante | 1 | 0.9375 | 1.5 | 1.4063 |
| 3 | 1 (muy en desacuerdo) | 1 (muy en desacuerdo) | Normal | 0 | 1.0000 | 1.0 | 1.0000 |
| 4 | 4 (de acuerdo) | 2 (en desacuerdo) | Poco importante | 2 | 0.7500 | 0.5 | 0.3750 |
| 5 | No sé | 3 (neutro) | Normal | — | excluida | — | — |

*Nota.* Elaboración propia. `PESO_MULTIPLIERS = {poco: 0.5, normal: 1.0, importante: 1.5, muy_importante: 2.0}`.

**Agregación**:

- Suma de `score_ponderado` en preguntas efectivas: `1.8750 + 1.4063 + 1.0000 + 0.3750 = 4.6563`.
- Suma de `mult_peso` en preguntas efectivas: `2.0 + 1.5 + 1.0 + 0.5 = 5.0`.
- `score_candidato = 4.6563 / 5.0 = 0.9313`.
- `afinidad_% = 93.13%`.
- **Preguntas efectivas** = 4 (pregunta 5 excluida por respuesta "No sé").
- **Nivel de confianza** = `tentativa` (< 5 preguntas efectivas, Tabla 10).

Este ejemplo ilustra tres comportamientos deseables del algoritmo: la ponderación eleva el peso relativo de la pregunta 1 donde usuaria y candidato casi coinciden, empujando el score hacia arriba; la opción "No sé" en la pregunta 5 no distorsiona el cálculo con una respuesta neutra falsa; y el nivel de confianza `tentativa` alerta al usuario de que el resultado tiene baja base empírica.

### 4.13 Arquitectura backend

**Figura 2**

*Arquitectura general del sistema (backend y frontend)*

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

**Figura 3**

*Estructura de directorios del backend*

```
backend/
+-- Dockerfile
+-- api/                              (settings, urls, views raiz)
+-- core/
|   +-- admin*.py, authentication.py, pagination.py
|   +-- models/                       (10 submodulos)
|   +-- views/                        (11 submodulos)
|   +-- serializers/                  (9 submodulos)
|   +-- services/                     (5 servicios)
|   +-- management/commands/          (16 comandos)
|   +-- migrations/                   (38 migraciones)
|   +-- test_*.py                     (25 archivos)
+-- docs/MIGRATION_TERRITORIAL.md
+-- fixtures/                         (CSVs)
```

*Nota.* Elaboración propia.

### 4.14 Arquitectura frontend

**Figura 4**

*Estructura de directorios del frontend*

```
frontend/
+-- App.tsx
+-- src/
|   +-- api/                          (client, endpoints, hooks, queryClient)
|   +-- components/
|   |   +-- atoms/                    (27 componentes)
|   |   +-- molecules/                (29 componentes)
|   |   +-- organisms/                (17 componentes)
|   |   +-- templates/AppShell.tsx    (layout responsive)
|   +-- navigation/
|   +-- screens/                      (18 pantallas + design-system)
|   +-- services/                     (logica pura testeable)
|   +-- store/                        (Zustand)
|   +-- theme/                        (design tokens)
|   +-- types/api.ts                  (auto-generado desde OpenAPI)
|   +-- utils/
+-- design-exploration/               (audit WCAG, paletas)
+-- docs/
```

*Nota.* Elaboración propia.

Principios aplicados: Atomic Design (Frost, 2016), servicios puros sin dependencias de React, contract-first (OpenAPI Initiative, 2021), query keys centralizadas (Linsley, 2024).

### 4.15 Ingesta de datos

Chile no expone una API pública de posturas electorales. La estrategia es **importación offline por CSV + seeds programáticos**, todos idempotentes. Los comandos cubren territorio, preguntas base, preguntas por tipo y candidatos por proceso (presidenciales 2025, diputados 2025, alcaldes 2024, parlamentaria). Ver Anexo D.

### 4.16 Contrato API

**Tabla 12**

*Endpoints principales de la API*

| Método | Ruta | Permission | Rol |
|--------|------|------------|-----|
| POST | `/register/` | AllowAny | Registro |
| POST | `/login/` | AllowAny | Obtención de token |
| GET | `/tipos-eleccion/` | Auth | Lista de procesos electorales |
| GET | `/candidatos/` | Auth | Lista con filtros territoriales |
| GET | `/candidatos/<pk>/` | Auth | Detalle de candidato |
| GET | `/preguntas/` | Auth | Preguntas del tipo + base |
| POST | `/respuestas/` | Auth | Envío batch |
| POST | `/match-candidatos/` | Auth | Cálculo de match (persiste) |
| POST | `/match-detalle/` | Auth | Desglose pregunta-a-pregunta |
| POST | `/match-anonimo/` | AllowAny | Match sin persistir |
| GET/POST/DELETE | `/candidatos-favoritos/` | Auth | CRUD de favoritos |
| GET/PATCH | `/perfil/` | Auth | Obtener/actualizar perfil |
| PATCH | `/perfil/comuna/` | Auth | Actualizar comuna |
| POST | `/password-reset/request/` | AllowAny | Solicitar reset |
| GET | `/regiones/` `/distritos/` `/comunas/` | AllowAny | Catálogo territorial |
| GET | `/ejes/` | AllowAny | Catálogo de ejes |
| GET | `/noticias/` | AllowAny | Feed paginado |
| GET | `/schema/` | AllowAny | Schema OpenAPI |
| GET | `/health/` | AllowAny | Healthcheck |

*Nota.* Elaboración propia. Catálogo completo en `/api/v1/docs/` (Swagger UI).

### 4.17 Seguridad

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` desde variables de entorno (Wiggins, 2011).
- Password hashing PBKDF2-SHA256 (Django Software Foundation, 2024).
- Token DRF con implementación custom.
- Permisos DRF explícitos por view.
- CORS restrictivo en producción.
- `CheckConstraint` en `Candidato`.
- Token de reset con expiración.

### 4.18 Deploy y containerización

Backend con `Dockerfile` (Docker Inc., 2024):

```bash
docker build -t matchvote-backend ./backend
docker run -p 8000:8000 --env-file .env matchvote-backend
```

El `.env.example` (Anexo E) documenta las variables requeridas.

### 4.19 Por qué funciona y por qué es una buena solución

**Por qué funciona técnicamente**. La solución funciona porque combina tecnologías maduras con patrones probados: Django + DRF entrega productividad alta con seguridad razonable por defecto (Django Software Foundation, 2024); React Native + Expo permite despliegue multiplataforma sin duplicar código (Meta Platforms, 2024; Expo, 2024); el contrato OpenAPI 3.1 elimina el drift entre backend y frontend (OpenAPI Initiative, 2021); el modelo polimórfico jerárquico (Fowler, 2003) resuelve elegantemente la representación de scope territorial variable; y la aplicación de SOLID (Martin, 2017), DRY (Hunt & Thomas, 1999) y YAGNI (Beck, 1999) mantiene el código mantenible incluso con un solo desarrollador.

**Por qué es una buena solución frente a las alternativas**. Es una buena solución porque cumple simultáneamente con las cinco características que ninguna alternativa chilena actual cumple (sección 1.2): algoritmo documentado y publicado en la propia documentación del proyecto, transparencia sobre las posturas asignadas a cada candidato dentro de la propia aplicación, cobertura multi-nivel territorial, accesibilidad WCAG AA (W3C, 2023) y diseño pensado para continuidad operativa. Frente a *Votamos Todos* (Zismo, 2021-2022), extiende el alcance del plebiscito único a un modelo multi-elección permanente. Frente a *Decide Chile*, *Vota Inteligente* e *Infovecino*, incorpora el componente algorítmico de matching personalizado que aquellas iniciativas no ofrecen. Frente a Wahl-O-Mat, StemWijzer y Smartvote, publica la fórmula de matching completa dentro de la propia documentación del proyecto, algo que aquellas iniciativas no hacen de manera integral.

**Por qué se ven beneficiados los usuarios**. Los usuarios se benefician porque la solución internaliza principios centrados en el votante: reduce su costo cognitivo con cuestionarios cortos y ponderables; respeta su honestidad epistemológica con la opción "No sé" que se excluye del cálculo; expone niveles de confianza para evitar la falsa autoridad de un porcentaje aislado; entrega explicabilidad pregunta-a-pregunta que permite al usuario cuestionar el resultado; garantiza accesibilidad universal (W3C, 2023); protege su privacidad al no requerir datos personales sensibles ni monetizar el uso; y ofrece continuidad al persistir preferencias entre elecciones sucesivas.

<!--PAGE_BREAK-->

---

## 5. Validación de la solución

La validación de la solución se realizó en cinco dimensiones: cumplimiento de objetivos, validación técnica automatizada, validación específica del algoritmo, validación de accesibilidad y auditorías internas de código. Se explicita además en qué dimensiones la validación es limitada (sección 5.7).

### 5.1 Cumplimiento de objetivos específicos

La Tabla 13 asocia cada objetivo específico declarado en 1.6 con la evidencia de cumplimiento presente en el repositorio.

- **Objetivo 1** (algoritmo robusto): cumplido. Fórmula cuadrática implementada en `core/services/matching.py`, con ponderación `PESO_MULTIPLIERS`, exclusión de "No sé", umbrales de confianza (Tabla 10), breakdown por eje en `calcular_match_detalle`, y filtrado territorial polimórfico integrado.
- **Objetivo 2** (sistema territorial polimórfico): cumplido. Modelos `Region`, `Distrito`, `Comuna` y `UnidadTerritorial` operativos; signals de sincronización activos.
- **Objetivo 3** (multi-elección simultánea): cumplido. Campo `TipoEleccion.es_base` operativo; preguntas base reutilizables entre procesos.
- **Objetivo 4** (SOLID / DRY / YAGNI): cumplido con evidencia estructural. Los submódulos de 10 modelos, 11 vistas, 9 serializadores y 5 servicios reflejan Single Responsibility (Martin, 2017); la eliminación de `DecisionFinal` en la migración `0037` documenta la aplicación de YAGNI (Beck, 1999).
- **Objetivo 5** (contrato OpenAPI 3.1): cumplido. Schema disponible en `/api/v1/schema/`; Swagger UI en `/api/v1/docs/`; tipos TypeScript sincronizados con `openapi-typescript`.
- **Objetivo 6** (transparencia sobre las posturas asignadas): cumplido a nivel estructural. La aplicación expone al usuario las posturas asignadas a cada candidato dentro de la propia interfaz, y los modelos `PosturaCandidato` incluyen campos `fuente_url` y `justificacion` que permiten migrar el dataset ilustrativo a un dataset con curaduría formal en despliegue productivo (limitación L1).
- **Objetivo 7** (cobertura de pruebas): cumplido parcialmente. 25 archivos de pruebas backend operativos; frontend con pruebas de servicios puros. No hay medición formal de cobertura porcentual.
- **Objetivo 8** (WCAG 2.2 AA): cumplido con auditoría técnica automatizada (`design-exploration/audit_wcag.py`) y revisión manual; sin evaluación con usuarios reales con discapacidad (limitación L14).
- **Objetivo 9** (multiplataforma): cumplido. `App.tsx` único entrega web, iOS y Android vía React Native + Expo.
- **Objetivo 10** (Docker): cumplido. `Dockerfile` en `backend/`; instrucciones de build y run documentadas.

### 5.2 Validación técnica automatizada

La suite de pruebas backend consta de **25 archivos de pruebas** ubicados en `backend/core/test_*.py`, con configuración en `conftest.py` y ejecución mediante `pytest`. Cubre los siguientes dominios:

- Algoritmo core de matching (variantes autenticada, anónima, con detalle).
- Cobertura territorial polimórfica (región, distrito, comuna, ancestros).
- Refactor de ejes temáticos a modelo `Eje`.
- Mecanismo `TipoEleccion.es_base` para preguntas transversales.
- Seeds específicos por elección (presidenciales 2025, diputados 2025, alcaldes 2024, parlamentaria).
- Variantes del algoritmo con casos límite.
- Flujos de edición de respuestas y guardado.
- Bookmarks de candidatos, posturas y noticias.
- Feed de noticias.
- Flujo completo de password reset.
- Actualización de perfil y sincronización territorial.
- Importadores de CSV.

Las pruebas del frontend cubren los **servicios puros** (`src/services/`), es decir la lógica de dominio sin dependencias de React, mediante Jest y React Native Testing Library.

### 5.3 Validación específica del algoritmo

El algoritmo se validó mediante casos con salida conocida por construcción matemática. La Tabla 13 muestra un subconjunto ilustrativo de los casos más relevantes verificados en `test_algoritmo.py`.

**Tabla 13**

*Casos de prueba del algoritmo de matching*

| # | Escenario | Entrada | Salida esperada |
|:-:|-----------|---------|-----------------|
| C1 | Concordancia total | Usuario y candidato responden todos Likert=3 en 10 preguntas, peso 1.0 | Score = 100%, confianza `alta` |
| C2 | Oposición total | Usuario Likert=1, candidato Likert=5, 10 preguntas, peso 1.0 | Score = 0%, confianza `alta` |
| C3 | Punto medio | Diferencia constante = 2 en todas las preguntas | Score = 75%, confianza correspondiente |
| C4 | Manejo de "No sé" | Usuario responde "No sé" en 3 de 8 preguntas | Solo 5 preguntas consideradas; confianza `media` |
| C5 | Ponderación asimétrica | Usuario da peso 2.0 a preguntas donde coincide con candidato | Score mayor que sin ponderación |
| C6 | Confianza `tentativa` | Usuario responde solo 3 preguntas | Confianza `tentativa` |
| C7 | Filtrado territorial | Usuario en comuna X vs candidato distrital que no incluye X | Candidato no aparece en resultados |
| C8 | Herencia polimórfica | Usuario en comuna X, candidato de scope nacional (`unidad_territorial IS NULL`) | Candidato sí aparece |
| C9 | Preguntas base transversales | Usuario responde una vez preguntas `es_base=True` | Respuestas reutilizables en varias elecciones |
| C10 | Idempotencia de `MatchCandidato` | Ejecución repetida de `calcular_match` para mismo usuario y elección | No duplica filas; actualiza si cambian respuestas |

*Nota.* Casos representativos. La suite completa cubre variantes adicionales de escala, empates, y edge cases del filtrado territorial.

### 5.4 Validación del sistema territorial polimórfico

El sistema territorial se validó con casos de:

- **Cobertura completa**: seed `seed_territorio_chile` genera las 16 regiones, 28 distritos electorales y 346 comunas, verificable por conteo posterior.
- **Consistencia jerárquica**: cada comuna tiene distrito padre; cada distrito tiene región padre; recorrido de ancestros funciona por método recursivo.
- **Filtrado por scope**: candidato de scope nacional visible desde cualquier comuna; candidato distrital visible solo desde comunas del distrito; candidato comunal visible solo desde su comuna.
- **Sincronización `UserProfile.comuna` → `unidad_territorial`**: signal `pre_save` actualiza automáticamente la referencia polimórfica.

### 5.5 Validación de accesibilidad WCAG 2.2 AA

La validación de accesibilidad se realizó en tres niveles:

1. **Auditoría técnica automatizada**: script `design-exploration/audit_wcag.py` que verifica contrastes de la paleta de diseño contra los umbrales AA de WCAG 2.2 (W3C, 2023).
2. **Revisión manual por pantalla**: `docs/accesibilidad.md` documenta requisitos WCAG por pantalla con verificación cualitativa de targets táctiles, estados visuales, focus trap en modales, empty states educativos y navegación por teclado.
3. **Compatibilidad con tecnologías asistivas**: componentes React Native con `accessibilityLabel`, `accessibilityRole` y `accessibilityHint` según el estándar (Meta Platforms, 2024).

### 5.6 Auditorías internas de código

El proyecto pasó por **dos rondas de auditoría interna** durante la Fase 3 del cronograma (sección 4.8):

- **Primera ronda**: 17 hallazgos categorizados por severidad. Se resolvieron 4 críticos de seguridad y 6 altos, incluyendo endurecimiento de permisos por endpoint, revisión de constraints en modelos, y validación de inputs sensibles.
- **Segunda ronda**: enfoque en accesibilidad y consistencia del sistema de diseño, con validación del cumplimiento WCAG 2.2 AA y auditoría del showcase interno de componentes.

No se realizó auditoría externa por tercero especializado (limitación L11).

### 5.7 Limitaciones de la validación

Se explicita honestamente qué dimensiones de la validación **no** fueron cubiertas en esta entrega:

- **Sin pruebas empíricas con usuarios reales** (limitación L9): no se realizaron sesiones de usabilidad, encuestas de satisfacción ni medición de conversión en un despliegue público. La validación reportada es técnica y estructural.
- **Sin evaluación de accesibilidad con personas usuarias con discapacidad** (limitación L14): el cumplimiento WCAG 2.2 AA se verificó con auditoría técnica y revisión manual, no con pruebas de campo.
- **Sin medición del impacto electoral**: no se puede afirmar que la herramienta modifique decisiones de voto en la magnitud reportada por la literatura para VAAs consolidadas (Walgrave et al., 2008); ese es un objetivo a mediano plazo condicionado al despliegue público continuo.
- **Sin medición formal de cobertura de tests**: la suite existe pero no hay reporte porcentual (%) de cobertura por módulo.
- **Sin auditoría de seguridad por tercero** (limitación L11): recomendable antes de exposición pública productiva.
- **Sin análisis de rendimiento bajo carga**: no se ejecutaron pruebas de estrés ni benchmarks contra números esperados de usuarios concurrentes.

Estas limitaciones se registran como deuda técnica y se priorizan en la sección 6.4.

<!--PAGE_BREAK-->

---

## 6. Conclusiones

### 6.1 Cumplimiento del objetivo general

El objetivo general planteado en 1.6 se cumple: se diseñó e implementó una aplicación multiplataforma de asesoramiento electoral (VAA) para el contexto chileno, con algoritmo transparente y documentado, arquitectura modular, soporte multi-elección con scope territorial y cumplimiento WCAG 2.2 AA (W3C, 2023). Los objetivos específicos se cumplen en su mayoría; las excepciones (curaduría formal de posturas contra fuentes primarias documentadas para reemplazar el dataset ilustrativo utilizado en la tesis, modo guest en la UI, evaluación empírica con usuarios) están documentadas como limitaciones y deuda priorizada.

### 6.2 Estado actual del sistema

Al momento de este documento, la aplicación tiene 18 pantallas funcionales, 27 átomos, 29 moléculas, 17 organismos, 1 template real (`AppShell`), 38 migraciones, sistema territorial operativo con retrocompatibilidad, design system interno con showcase completo, y documentación estructurada en dos niveles (técnica + accesible). Las funcionalidades eliminadas por YAGNI (Beck, 1999) fueron el flujo Tinder-swipe y el módulo `DecisionFinal`. Las funcionalidades unificadas incluyen favoritos, descartados y bookmarks bajo `MisGuardadosScreen`, y seis modales legacy bajo un componente `Modal` unificado.

### 6.3 Aprendizajes

**Técnicos**. Django + DRF + React Native + Expo + Tamagui permite alta velocidad de desarrollo con un solo desarrollador. El enfoque contract-first con OpenAPI (OpenAPI Initiative, 2021) es la barrera anti-drift más importante entre backend y frontend. YAGNI (Beck, 1999) aplicado retroactivamente simplifica sin costo funcional. Los modelos polimórficos jerárquicos (Fowler, 2003) son la respuesta correcta ante múltiples niveles de scope. Los signals de Django requieren cuidado con la direccionalidad para evitar loops o efectos no deseados. Las migraciones grandes en fases reducen riesgo respecto a *big-bang* migrations.

**De dominio**. La curaduría formal de posturas contra fuentes primarias documentadas (limitación L1) es más costosa que el desarrollo de código. El sistema territorial chileno es manejable con la abstracción polimórfica correcta. El votante rara vez decide sobre una sola elección; el diseño multi-elección es esencial. Los coach marks contextuales son más efectivos que tours lineales exhaustivos.

### 6.4 Deuda pendiente priorizada

**Alta prioridad** (bloquea publicación pública confiable): curaduría formal de posturas contra fuentes primarias documentadas para reemplazar el dataset ilustrativo utilizado en la tesis (L1); interfaz de modo invitado (A13); cierre de migración territorial (L10); auditoría de seguridad por tercero (L11); pruebas empíricas con usuarios reales, incluyendo con personas con discapacidad (L9, L14).

**Media prioridad** (bloquea escalar): migración a PostgreSQL (L4); cache Redis; rate limiting (L7); optimización de `_persistir_matches`; deploy con Gunicorn + Nginx.

**Baja prioridad**: compartir resultado como imagen (L12); squash de migraciones; logging estructurado; CI/CD (L8).

### 6.5 Proyección

1. Publicación pública en `matchvote.cl` una vez cerrada la deuda de alta prioridad, en particular la curaduría formal del dataset.
2. Curaduría colaborativa del dataset con universidades y think tanks para reemplazar el dataset ilustrativo.
3. Escalamiento territorial a senadores por circunscripción y consejeros regionales, sin cambios de schema (limitación L2).
4. Explicabilidad avanzada: simulador "cambia mi respuesta" y mapa 2D político al estilo Kieskompas.
5. Investigación académica: publicar análisis agregado y anonimizado siguiendo el método de Garzia y Marschall (2014).

### 6.6 Reflexión final

El proyecto demuestra que es viable construir infraestructura cívica de calidad profesional con recursos limitados, aplicando principios sólidos de ingeniería (Martin, 2017; Hunt & Thomas, 1999; Wiggins, 2011), disciplina en el diseño del algoritmo y coraje para eliminar features que no probaron su valor (Beck, 1999). La combinación de arquitectura modular, modelos polimórficos (Fowler, 2003), transparencia sobre el mecanismo de matching y las posturas asignadas a cada candidato, y accesibilidad estándar (W3C, 2023) constituye una respuesta técnica concreta a los problemas de desinformación electoral, asimetría de información y ausencia de VAA chilena consolidada.

La existencia de un ecosistema internacional maduro (Cedroni & Garzia, 2010) prueba que estas herramientas pueden ser sostenibles a largo plazo. El desafío en Chile no es técnico —eso lo demuestra este trabajo— sino institucional: encontrar un modelo de gobernanza y financiamiento que permita continuidad operativa entre elecciones.

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

Castillo, J. (2026a). *README.es.md* [Documento interno del repositorio del proyecto de tesis].

Castillo, J. (2026b). *docs/algoritmo-tecnico.md* [Referencia técnica interna del algoritmo].

Castillo, J. (2026c). *docs/sistema-tecnico.md* [Documentación interna de arquitectura].

Castillo, J. (2026d). *docs/comparacion-vaas.md* [Análisis comparativo]. GitHub.

Castillo, J. (2026e). *docs/accesibilidad.md* [Guía WCAG 2.2 AA]. GitHub.

Castillo, J. (2026f). *docs/mapa-navegacion.md* [Mapa de rutas]. GitHub.

Castillo, J. (2026g). *backend/docs/MIGRATION_TERRITORIAL.md* [Plan de migración]. GitHub.

<!--PAGE_BREAK-->

---

## 8. Anexos

### Anexo A. Ejes temáticos del cuestionario

**Tabla 14**

*Anexo A. Ejes temáticos del cuestionario*

| Código | Nombre | Descripción resumida |
|:------:|--------|----------------------|
| ECO | Economía | Política fiscal, tributaria, laboral, previsional y de desarrollo productivo. |
| SOC | Sociedad | Educación, salud, vivienda, cultura, ciencia y política social. |
| AMB | Ambiente | Cambio climático, energía, minería, agua, biodiversidad y ordenamiento territorial. |
| SEG | Seguridad | Seguridad pública, delito organizado, políticas migratorias y sistema penal. |
| DDH | Derechos Humanos | Igualdad, diversidad, pueblos originarios, derechos reproductivos y libertades civiles. |
| INT | Política Internacional | Relaciones exteriores, integración regional, tratados comerciales y política de defensa. |
| INS | Reforma Institucional | Sistema político, descentralización, reforma constitucional y probidad. |

*Nota.* Cada eje se asocia a un color y descripción educativa mostrados en el radar y tooltips.

### Anexo B. Preguntas base ilustrativas

**Tabla 15**

*Anexo B. Preguntas base ilustrativas*

| # | Enunciado (ilustrativo) | Eje | Escala |
|:-:|-------------------------|:---:|:------:|
| B1 | El Estado debe tener un rol activo en la provisión directa de servicios como salud y pensiones. | ECO | Likert 1-5 |
| B2 | El aborto libre debe estar garantizado por ley durante todo el embarazo. | DDH | Likert 1-5 |
| B3 | Chile debe priorizar la transición energética aunque implique costos económicos en el corto plazo. | AMB | Likert 1-5 |
| B4 | Las políticas migratorias deben endurecerse para reducir la migración irregular. | SEG | Likert 1-5 |
| B5 | El sistema electoral binominal era mejor que el proporcional actual para la estabilidad política. | INS | Likert 1-5 |

*Nota.* Enunciados ilustrativos. Cada pregunta incluye sexta opción "No sé / Prefiero no responder" excluida del cálculo (Likert, 1932).

### Anexo C. Comparativa con VAAs internacionales

**Tabla 16**

*Anexo C. Comparativa resumida con VAAs internacionales*

| VAA | País | Institución | Algoritmo público | Doc del cálculo | Cobertura territorial | Confianza |
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
| **matchVote** | **CL** | **Este proyecto** | **Sí** | **No aplica** | **Nacional + distrital + comunal** | **Sí (3 niveles)** |

*Nota.* Elaboración propia a partir de sitios oficiales y relevamiento manual. "Confianza" se refiere a la exposición del número de preguntas efectivamente consideradas. "No consta" indica dato no verificado; "No aplica" indica que la iniciativa no se diseñó como VAA con matching personalizado.

### Anexo D. Comandos de management del backend

- **Importadores**: `import_candidatos`, `import_preguntas`, `import_posturas`.
- **Seeds territoriales**: `seed_territorio_chile`.
- **Seeds de cuestionario**: `seed_preguntas_base`, `seed_preguntas_por_tipo`, `seed_explicaciones_preguntas`.
- **Seeds electorales**: `seed_presidenciales_2025`, `seed_diputados_2025`, `seed_alcaldes_2024`, `seed_parlamentaria`.
- **Utilidades**: `fetch_noticias`, `limpiar_tokens_viejos`.

### Anexo E. Estructura del `.env.example`

```
# Django
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=example.com

# Base de datos
DB_ENGINE=django.db.backends.postgresql
DB_NAME=matchvote
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://example.com

# Email (password reset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=noreply@example.com

# Reset tokens
PASSWORD_RESET_TOKEN_TTL_HOURS=24
```

### Anexo F. Recursos del repositorio

- **Repositorio interno**: código del proyecto disponible en el entorno de desarrollo de la autora, con estructura documentada en las secciones 4.13 y 4.14 de este documento.
- **README**: `README.es.md`.
- **Documentación técnica**: `docs/backend/tecnico/`.
- **Documentación accesible**: `docs/backend/simple/`.
- **Guía WCAG**: `docs/accesibilidad.md`.
- **Mapa de navegación**: `docs/mapa-navegacion.md`.
- **Plan de migración territorial**: `backend/docs/MIGRATION_TERRITORIAL.md`.

---

*Documento elaborado como parte de la tesis de pregrado de la carrera de Ingeniería en Informática. Autora: Jenifer Castillo. Versión académica APA 7 con estructura de 8 secciones: Introducción, Definición del problema, Marco conceptual, Propuesta de solución, Validación de la solución, Conclusiones, Bibliografía y Anexos.*
