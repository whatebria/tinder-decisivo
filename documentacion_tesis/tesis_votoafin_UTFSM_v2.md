# VotoAFin: Diseño e Implementación de una Aplicación de Asistencia para el Voto Informado en el Contexto Electoral Chileno

---

**Universidad Técnica Federico Santa María**  
Departamento de Informática  
Carrera: Ingeniería en Informática  

**Autora:** Jenifer Castillo  
**Profesor Guía:** [Por confirmar]  
**Fecha:** Agosto 2026  

---

## Resumen Ejecutivo

Chile atravesó entre 2020 y 2024 un período de densidad electoral sin precedentes en su historia democrática reciente: ocho procesos electorales en cuatro años, incluyendo dos plebiscitos constitucionales, elecciones presidenciales y parlamentarias, y comicios municipales y regionales. Este escenario desencadenó un fenómeno documentado de fatiga electoral que se expresó de manera cuantificable en los indicadores de participación informada: apenas el 21% del electorado se reconocía como "muy informado" antes de las elecciones municipales de octubre de 2024, y los sufragios nulos para alcalde crecieron un 460% entre 2021 y 2024, pasando del 1,93% al 10,8%. En los procesos constitucionales, los votos nulos alcanzaron los 2.119.506, equivalentes al 16,98% del total emitido. El 81% del electorado declaraba exposición semanal o mayor a contenido desinformativo, y en el levantamiento de campo realizado en el área metropolitana de Valparaíso, el 100% de las personas entrevistadas había tenido contacto directo con información electoral falsa.

Este trabajo presenta el proceso de investigación, diseño e implementación de **VotoAFin**, una Voting Advice Application (VAA) de código abierto, orientada al contexto electoral chileno, con enfoque mobile-first. La plataforma permite a los ciudadanos responder un cuestionario sobre posturas de política pública, ponderar los temas según su importancia personal, y obtener un ranking de afinidad con los candidatos expresado en porcentaje de coincidencia, desglosado por siete ejes temáticos, acompañado de un indicador de confianza del resultado.

La metodología adoptada fue iterativa e incremental, organizada en fases de investigación empírica, diseño de experiencia centrada en el usuario, construcción por sprints con validación continua, y auditoría técnica y documental. El resultado es un producto en estado de MVP funcional, con arquitectura cliente-servidor, contrato de API formalizado mediante el estándar OpenAPI 3.1, suite de tests automatizados, y licencia AGPL-3.0 que garantiza la apertura del código para versiones derivadas de interés público.

**Palabras clave:** Voting Advice Application, participación ciudadana, desinformación electoral, matching político, ingeniería de producto, experiencia de usuario, aplicaciones móviles, Chile, AGPL.

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Definición del Problema](#2-definición-del-problema)
3. [Propuesta de Solución](#3-propuesta-de-solución)
4. [Objetivos](#4-objetivos)
5. [Metodología](#5-metodología)
6. [Marco Teórico](#6-marco-teórico)
7. [Estado del Arte](#7-estado-del-arte)
8. [Desarrollo](#8-desarrollo)
9. [Conclusiones](#9-conclusiones)
10. [Bibliografía](#10-bibliografía)

---

## 1. Introducción

### 1.1 Contexto General

Las democracias contemporáneas enfrentan un desafío estructural que trasciende las diferencias entre sistemas de gobierno y contextos geopolíticos: la brecha creciente entre la complejidad de la oferta electoral y la capacidad efectiva de los ciudadanos para procesarla de manera informada. Esta brecha no es nueva, pero se ha agudizado en la última década como resultado de la confluencia de tres fuerzas simultáneas: la proliferación de fuentes de información no verificadas en el ecosistema digital, la densificación de los calendarios electorales en muchos países, y la disminución de la confianza ciudadana en las instituciones políticas y mediáticas tradicionales.

Chile no es una excepción a este fenómeno. Por el contrario, en el período 2020-2024 constituyó un caso de estudio particularmente significativo, en el que la acumulación de procesos electorales sucesivos generó condiciones que los analistas comenzaron a denominar *fatiga electoral*: una disminución progresiva del interés y la disposición ciudadana a invertir tiempo y atención en cada nueva convocatoria. El fenómeno fue documentado tanto por indicadores cuantitativos de participación como por estudios de percepción ciudadana que revelaron el deterioro de la calidad del voto: más ciudadanos votando, pero con menor información sobre lo que votaban.

Es en este contexto donde surge VotoAFin, no como respuesta a una especificación técnica abstracta, sino como el producto de un proceso de investigación que comenzó con la observación directa del problema y la sistematización de sus causas.

### 1.2 Motivación

El proyecto nació en el marco del curso de Emprendimiento de la carrera de Ingeniería en Informática de la Universidad Técnica Federico Santa María. El equipo inicial, integrado por Jenifer Castillo, Patricio De Lima y Alonso Sánchez, seleccionó la desinformación electoral como área de investigación por su relevancia social directa y por la posibilidad de abordarla desde la ingeniería con impacto medible.

Lo que comenzó como un trabajo académico de investigación evolucionó de manera orgánica hacia el diseño de una propuesta de solución, luego hacia un prototipo de experiencia, y finalmente hacia la implementación de un sistema funcional completo. Este trabajo de tesis documenta ese proceso en su totalidad: el problema identificado, las decisiones tomadas, la metodología aplicada, y el sistema resultante.

La motivación central no fue tecnológica sino cívica: la tecnología fue el medio, no el fin. El fin fue contribuir a que más ciudadanos puedan ejercer su derecho a voto con mayor comprensión de las posturas de los candidatos que compiten por representarlos.

### 1.3 Relevancia del Problema

La desinformación electoral y el déficit informativo de los votantes no son problemas menores. Sus consecuencias son directamente observables en los indicadores de calidad democrática: aumento de votos nulos y en blanco, decisiones de voto basadas en identidades partidarias superficiales antes que en posiciones programáticas, y erosión de la confianza en las instituciones. Estos efectos son especialmente pronunciados en contextos de alta densidad electoral, donde la fatiga cognitiva limita la disposición ciudadana a invertir tiempo en informarse sobre cada proceso sucesivo.

Las herramientas existentes para facilitar la información electoral en Chile eran, al momento de iniciar este proyecto, insuficientes o discontinuadas. Las guías electorales institucionales resultaban excesivamente extensas y de acceso limitado. Las plataformas de comparación de candidatos que existían estaban desactualizadas o carecían de metodologías transparentes. El espacio para una solución de código abierto, mobile-first, con algoritmo auditable y datos verificables estaba abierto.

### 1.4 Visión General de la Solución

VotoAFin es una Voting Advice Application (VAA) que permite a los usuarios:

1. Seleccionar el tipo de elección de su interés.
2. Responder un cuestionario de preguntas sobre política pública, con opción de indicar el nivel de importancia de cada tema para su decisión.
3. Obtener un ranking de afinidad con los candidatos, expresado como porcentaje de coincidencia global y desglosado por siete ejes temáticos.
4. Explorar el detalle de cada candidato: su perfil, sus posturas en cada pregunta con justificación y fuente verificable, y noticias recientes asociadas.
5. Guardar candidatos favoritos, descartar candidatos y navegar entre comparaciones.

La plataforma opera sobre una arquitectura cliente-servidor con frontend multiplataforma (web, iOS y Android desde una misma base de código) y un backend que expone una API REST con contrato formalizado. El sistema es completamente de código abierto bajo licencia AGPL-3.0.

### 1.5 Estructura del Documento

Este documento se organiza de la siguiente manera: la Sección 2 caracteriza el problema en su contexto social y tecnológico. La Sección 3 describe la propuesta de solución y su propuesta de valor. La Sección 4 formaliza los objetivos del proyecto. La Sección 5 explica la metodología utilizada. La Sección 6 desarrolla el marco teórico relevante. La Sección 7 analiza el estado del arte y las plataformas comparables. La Sección 8 documenta el proceso de desarrollo en su totalidad. La Sección 9 presenta las conclusiones, y la Sección 10 incluye la bibliografía en formato APA.

---

## 2. Definición del Problema

### 2.1 Situación Actual del Ecosistema Electoral Chileno

#### 2.1.1 Densidad electoral y fatiga ciudadana

Entre octubre de 2020 y noviembre de 2024, los ciudadanos chilenos habilitados para votar fueron convocados a las urnas en ocho ocasiones distintas. Este período incluyó el plebiscito de entrada al primer proceso constituyente (octubre 2020), la elección de convencionales constituyentes y primera vuelta presidencial (noviembre 2021), la elección presidencial de segunda vuelta (diciembre 2021), el plebiscito de salida del primer proceso constitucional (septiembre 2022), la elección del Consejo Constitucional (mayo 2023), el plebiscito de salida del segundo proceso constitucional (diciembre 2023), las elecciones municipales y regionales (octubre 2024) y sus respectivas segundas vueltas.

Esta acumulación no tuvo precedentes en la historia democrática reciente del país. Los analistas electorales y académicos comenzaron a documentar un patrón consistente: a medida que se sucedían los procesos, disminuía la disposición ciudadana a invertir atención y tiempo en informarse sobre cada uno. El profesor René Jara de la Universidad de Santiago describió el fenómeno con precisión: *"Es cierto que se observa una fatiga electoral. Ello tiene como correlato que la gente evita informarse e invertir mucho tiempo en estar expuesto a material de campaña"*. El académico Claudio Fuentes, de la Escuela de Ciencia Política de la Universidad Diego Portales, sintetizó las causas en una tríada que se volvió referencia en el análisis del período: **desinformación, desinterés y desconfianza**.

#### 2.1.2 El déficit de información: evidencia cuantitativa

El Informe Claves Ipsos N°33, elaborado en el contexto de las elecciones municipales de octubre de 2024, ofreció una medición directa del nivel real de información del electorado chileno frente a un proceso concreto:

- Solo el **21%** de los encuestados se reconocía como *muy informado* sobre las elecciones municipales que se avecinaban.
- El **62%** se declaraba *algo informado* y el **16%** *nada informado*.
- A pesar de que el cargo de alcalde era el de mayor visibilidad mediática, solo el **83%** de los encuestados sabía que se elegía ese cargo.
- Apenas el **55%** sabía que también se elegían concejales.
- Menos de la mitad conocía la existencia de la elección de gobernadores regionales (**42%**) y de consejeros regionales (**45%**).

La situación de indecisión de voto confirmaba la profundidad del problema. Al momento de la encuesta, el **42%** de los consultados aún no había decidido su voto para alcalde, el cargo más conocido. Para concejales, la indecisión alcanzaba al **60%**; para gobernadores, al **64%**; y para consejeros regionales, al **68%**.

La interpretación más directa de estos datos es que una proporción significativa de los ciudadanos ejercía su derecho a voto sin información adecuada sobre los candidatos ni sobre las implicaciones de su elección. El voto, en esas condiciones, dejaba de ser un acto de preferencia informada para convertirse en una decisión bajo incertidumbre.

#### 2.1.3 La desinformación como factor agravante

El fenómeno de la desinformación opera como amplificador del déficit informativo. El estudio *Fake News y Desinformación en Chile y LatAm* de Activa Knowledge for Action cuantificó la magnitud del problema en el contexto chileno:

- El **54%** de los chilenos consideraba que la *información incompleta en las noticias* era un problema importante en el país.
- El **52%** identificaba la *desinformación en las noticias* como un problema de importancia.
- El **71%** concordaba con la afirmación de que *"la desinformación es una amenaza para nuestra democracia"*.
- El **68%** señalaba que *"la desinformación debilita nuestro proceso electoral"*.

Respecto a la frecuencia de exposición a información desinformativa, el **52% de los encuestados** declaraba encontrarse con noticias que creía falsas o distorsionadas *todos los días o casi todos los días*, y el **29%** al menos una vez a la semana. La suma indica que el **81% del electorado** estaba expuesto a contenido desinformativo con frecuencia semanal o mayor.

El panorama de confianza en las fuentes era igualmente preocupante. Los tres principales canales a través de los cuales los ciudadanos declararon informarse incluían la televisión (35%), noticias online (14%) y Facebook (12%). Los actores políticos registraban el mayor índice de desconfianza como fuentes de información: el **79%** de los chilenos declaraba no confiar en los políticos para obtener noticias o información precisa.

#### 2.1.4 El impacto sobre la calidad del voto: los indicadores objetivos

El indicador más directamente observable del deterioro en la calidad de la participación electoral fue el incremento sostenido de los sufragios nulos y en blanco. La comparación entre las elecciones municipales de 2021 y las de 2024 revela variaciones que los propios analistas del SERVEL calificaron de extraordinarias:

| Cargo | Votos nulos (2021) | Votos nulos (2024) | Variación |
|---|---|---|---|
| Alcalde | 1,93% | 10,80% | **+460%** |
| Gobernador | 6,13% | 17,80% | **+190%** |
| Concejal | 5,74% | 21,46% | **+274%** |
| Consejero Regional | 13,10% | 25,78% | **+97%** |

En los procesos constitucionales, el SERVEL registró **2.119.506 sufragios nulos**, equivalentes al **16,98%** del total de votos emitidos. Analistas electorales fueron explícitos en su interpretación: *"Los votos blancos normalmente son el resultado de la desinformación, y en el voto nulo también tiene ese componente porque en esta elección hubo poca información. Poca gente sabía lo que se votaba"*.

### 2.2 Contexto Tecnológico: las Herramientas Existentes

#### 2.2.1 Guías electorales institucionales

El ecosistema de información electoral institucional en Chile contaba con algunos recursos, pero todos presentaban limitaciones significativas para el usuario promedio. Las guías del SERVEL, si bien oficiales y completas, consistían en documentos extensos con perfiles textuales de candidatos, sin mecanismos de comparación personalizada ni algoritmos de afinidad. Eran fuentes de información pasiva: el usuario debía saber qué buscar y tener disposición a leer extensamente.

#### 2.2.2 Plataformas de comparación anteriores en Chile

Chile contó en períodos anteriores con dos plataformas relevantes de asistencia electoral:

**Voto Informado** fue desarrollada en colaboración entre el SERVEL y el PNUD. Ofrecía perfiles de candidatos comparables, pero sin un algoritmo de matching propiamente dicho. Su operación era intermitente, asociada a cada proceso electoral, sin un equipo de mantención permanente, y carecía de un mecanismo formal para verificar y justificar las posturas asignadas a los candidatos.

**Decide Chile** fue una iniciativa ciudadana que incorporaba elementos de matching en una escala de respuestas Likert de cinco puntos, con alrededor de 20 preguntas. Sin embargo, fue discontinuada y al momento de inicio de este proyecto se encontraba inactiva, sin mantenimiento y sin datos actualizados para los procesos electorales en curso.

#### 2.2.3 Plataformas internacionales

A nivel internacional, las Voting Advice Applications más consolidadas —Wahl-O-Mat de Alemania, Smartvote de Suiza, StemWijzer de los Países Bajos, Vote Compass de Canadá y Australia— no tenían cobertura del contexto electoral chileno o la tenían de manera muy superficial. iSideWith, la plataforma global de mayor alcance, incluía algunos candidatos chilenos pero sin la profundidad, contextualización local ni verificación de posturas necesarias para ser útil en el nivel que el problema requería.

#### 2.2.4 La brecha identificada

La situación descrita configuraba una brecha de producto concreta: no existía en Chile, al momento de inicio de este proyecto, una Voting Advice Application activa, con metodología transparente, datos verificables, y diseñada específicamente para el contexto y vocabulario político chileno. El espacio estaba vacante.

### 2.3 El Perfil de los Usuarios Afectados

La investigación de campo realizada en el área metropolitana de Valparaíso identificó tres segmentos de votantes con mayor vulnerabilidad frente al déficit informativo:

**Jóvenes votantes:** Segmento con mayor exposición a la desinformación digital por su alta interacción con redes sociales y menor consumo de medios de comunicación verificados. Paradójicamente, es también el segmento con mayor potencial de adopción de una solución tecnológica mobile-first.

**Adultos mayores:** Segmento que enfrenta dificultades específicas para evaluar la confiabilidad de las fuentes en plataformas digitales. Combinan alta exposición a desinformación con menor capacidad de verificación independiente.

**Votantes indecisos:** Segmento que típicamente busca información en el período previo inmediato a la elección, cuando el flujo de contenido partidario y desinformativo es más intenso y la capacidad crítica más vulnerable.

Los tres segmentos comparten una necesidad común: acceso a información confiable, estructurada y procesable en un tiempo razonable, presentada en un formato que no requiera conocimiento político previo para ser interpretada.

### 2.4 Por Qué el Problema Merece Ser Abordado

La participación electoral desinformada tiene consecuencias que trascienden el acto individual del voto. En un sistema representativo, la calidad de la información con que los ciudadanos ejercen su derecho electoral determina en última instancia la calidad de la representación que obtienen. Un voto emitido sin información sobre las posturas del candidato elegido es un voto que no puede racionalizar ni evaluar la gestión posterior de ese representante.

El problema, además, presenta características que lo hacen abordable desde la ingeniería: es un problema de acceso, procesamiento y presentación de información, tres dimensiones en las que las aplicaciones de software pueden intervenir de manera concreta y medible. No es un problema de voluntad política ni de escasez de información primaria —las posturas de los candidatos existen en el registro público—, sino de intermediación: el procesamiento que transforma esa información bruta en conocimiento accionable para el votante promedio.

---

## 3. Propuesta de Solución

### 3.1 Concepto General

VotoAFin es una Voting Advice Application —una clase de herramienta digital con historia y literatura académica propias— diseñada específicamente para el contexto electoral chileno. Su función central es actuar como intermediario informado entre la oferta electoral disponible y la necesidad de decisión del votante: toma las posturas documentadas de los candidatos, las compara con las preferencias declaradas del usuario, y produce un ranking de afinidad que el usuario puede explorar y utilizar como insumo para su decisión de voto.

El concepto no parte del candidato como unidad de presentación, sino del tema. En lugar de mostrar primero quiénes son los candidatos y pedirle al usuario que elija, el sistema le muestra primero preguntas sobre temas de política pública y le solicita su posición personal. Solo después produce el resultado del matching. Este orden de presentación es deliberado: reduce el peso de los sesgos de identificación partidaria y favorece la evaluación basada en posiciones programáticas.

### 3.2 Propuesta de Valor

VotoAFin se diferencia de las alternativas disponibles en el contexto chileno en cinco dimensiones:

**1. Transparencia metodológica.** El algoritmo de cálculo de afinidad es público, documentado y auditable. Cualquier ciudadano u organización puede verificar cómo se calculan los resultados. Esto es especialmente relevante en el contexto electoral, donde la credibilidad del instrumento de información es condición necesaria para su utilidad.

**2. Trazabilidad de las posturas.** Cada postura asignada a un candidato debe estar respaldada por una fuente primaria verificable: declaración pública, votación parlamentaria registrada, plataforma de campaña oficial. El sistema rechaza posturas sin justificación ni fuente, y es explícito sobre el nivel de confianza de cada una (alta, media o baja) cuando existe incertidumbre.

**3. Ponderación por importancia.** El usuario puede indicar qué temas le importan más para su decisión de voto, y el algoritmo ajusta el cálculo de afinidad en función de esa ponderación. Este mecanismo reconoce que distintos ciudadanos tienen prioridades distintas y que la afinidad electoral no es una magnitud universal.

**4. Indicador de confianza del resultado.** A diferencia de la mayoría de las VAAs, que presentan el porcentaje de coincidencia como un valor absoluto, VotoAFin acompaña cada resultado con un indicador de confianza que refleja cuántas preguntas del cuestionario fueron efectivamente utilizadas en el cálculo. Un match calculado sobre tres preguntas tiene menos certeza que uno calculado sobre doce.

**5. Código abierto.** La plataforma se distribuye bajo licencia AGPL-3.0, lo que garantiza que cualquier versión modificada desplegada públicamente deba compartir sus cambios. Esta elección es coherente con el argumento de que la tecnología electoral es infraestructura de interés público y no debería operar como caja negra bajo propiedad privada.

### 3.3 Público Objetivo

El público objetivo primario de VotoAFin es el votante chileno que enfrenta una elección y desea información estructurada sobre las posiciones de los candidatos sin necesidad de leer extensos documentos programáticos. El perfil específico es el de un usuario con acceso a un dispositivo móvil o a un navegador web, con disposición a invertir entre cinco y quince minutos en completar el cuestionario, y con interés en tomar una decisión de voto más informada.

El público objetivo secundario incluye organizaciones de educación cívica, medios de comunicación interesados en herramientas de periodismo de datos electoral, e investigadores académicos en ciencia política e ingeniería de software que puedan utilizar la plataforma de código abierto como base o como objeto de estudio.

### 3.4 Beneficios Esperados

En el corto plazo, el beneficio esperado es funcional: un usuario que completa el cuestionario de VotoAFin dispone de información estructurada y comparativa sobre los candidatos que no requiere conocimiento político previo para ser interpretada.

En el mediano plazo, el beneficio esperado es educativo: al exponer al usuario a las posturas de los candidatos en siete ejes temáticos, con justificación y fuente, la plataforma contribuye a elevar la calidad del debate sobre las dimensiones relevantes de la representación política, más allá de los temas de campaña que dominan la agenda mediática en cada proceso electoral.

En el largo plazo, el beneficio esperado es sistémico: una plataforma de acceso libre, con metodología transparente y datos verificables, puede convertirse en un estándar de referencia que eleve las expectativas ciudadanas sobre la calidad de la información electoral disponible y, eventualmente, presione a los propios candidatos hacia mayor especificidad y consistencia en sus declaraciones programáticas.

---

## 4. Objetivos

### 4.1 Objetivo General

Diseñar e implementar una Voting Advice Application de código abierto orientada al contexto electoral chileno, que permita a los ciudadanos comparar sus posturas personales sobre política pública con las posiciones documentadas de los candidatos, obteniendo un resultado de afinidad transparente, ponderado por preferencias y contextualizado por nivel de confianza.

### 4.2 Objetivos Específicos

1. **Investigar y caracterizar** el fenómeno del déficit informativo electoral en Chile, mediante revisión de evidencia secundaria y levantamiento de campo, estableciendo la magnitud y causas del problema.

2. **Analizar el estado del arte** en Voting Advice Applications a nivel internacional y local, identificando fortalezas, debilidades y brechas de las soluciones existentes aplicables al contexto chileno.

3. **Diseñar la experiencia de usuario** de la plataforma desde la perspectiva de los segmentos de votantes afectados, asegurando que el flujo de interacción sea comprensible, accesible y eficiente para usuarios sin conocimiento político especializado.

4. **Definir un algoritmo de matching** que compare las respuestas del usuario con las posturas de los candidatos de manera transparente, considerando ponderación por importancia declarada y produciendo un indicador de confianza del resultado.

5. **Implementar el sistema completo** mediante una arquitectura cliente-servidor con frontend multiplataforma y backend REST, aplicando principios de ingeniería de software que garanticen mantenibilidad, extensibilidad y seguridad.

6. **Establecer un modelo de datos y verificación** que asegure la trazabilidad de las posturas asignadas a los candidatos, requiriendo justificación y fuente primaria verificable para cada entrada del sistema.

7. **Documentar el proceso** de manera que el sistema sea comprensible para contribuidores externos, adaptable a otros contextos electorales latinoamericanos, y replicable como base para proyectos similares.

---

## 5. Metodología

### 5.1 Enfoque General

El proyecto adoptó un enfoque de desarrollo iterativo e incremental, orientado por los principios de *ingeniería centrada en el usuario* y *mínima funcionalidad viable* (MVP, Minimum Viable Product). Este enfoque reconoce que en proyectos donde los requerimientos evolucionan con el proceso de construcción —como ocurre en productos de software orientados a resolver problemas de comportamiento humano— la planificación rígida de largo plazo genera más fricción que valor.

La metodología no se corresponde con un marco de trabajo Agile en sentido estricto (sin ceremonias Scrum, sin roles definidos, sin velocidad estimada por sprint). Más bien, adoptó los principios de valor iterativo: cada ciclo de trabajo debía entregar algo funcional, los resultados de cada iteración retroalimentaban el diseño de la siguiente, y las decisiones se tomaban con la información disponible en cada momento, revisándose cuando nueva evidencia lo justificaba.

Los principios de ingeniería de software que guiaron las decisiones técnicas durante todo el proceso fueron: DRY (Don't Repeat Yourself), YAGNI (You Aren't Gonna Need It), KISS (Keep It Simple, Stupid), y SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion). La aplicación de estos principios fue sistemática y está documentada explícitamente en el repositorio del proyecto.

### 5.2 Fases del Proyecto

El proceso de desarrollo se organizó en cuatro fases macro, cada una con objetivos diferenciados:

#### Fase 1: Investigación y Definición del Problema (2024)

Esta fase correspondió al trabajo desarrollado en el marco del curso de Emprendimiento de la carrera. Sus actividades centrales fueron:

- **Revisión de fuentes secundarias:** sistematización de estudios de opinión pública, registros del SERVEL, informes académicos y datos de prensa sobre comportamiento electoral en Chile.
- **Levantamiento de campo:** entrevistas cortas con 12 personas en tres comunas del área metropolitana de Valparaíso (Playa Ancha, Viña del Mar, Quilpué), con perfiles socioeconómicos y etarios distintos, orientadas a validar empíricamente la magnitud del problema.
- **Síntesis del problema:** identificación de los factores causales, los segmentos afectados y las dimensiones de la oportunidad de diseño.
- **Primera propuesta conceptual:** diseño de una aplicación gamificada con autenticación por Clave Única como primera hipótesis de solución.

**Entregable:** caracterización documentada del problema, con datos cuantitativos y cualitativos de respaldo.

#### Fase 2: Diseño de la Solución (2025 — primer semestre)

En esta fase, el foco se desplazó de la comprensión del problema al diseño de una respuesta. Las actividades centrales fueron:

- **Prototipado de experiencia:** construcción de un prototipo de baja fidelidad en herramienta de diseño (Visily AI), evaluando la mecánica de swipe bidireccional (candidato vs. postura temática) como metáfora de interacción.
- **Evaluación de la metáfora inicial:** identificación de las limitaciones del modelo de swipe binario para capturar matices en las posiciones del usuario sobre temas complejos de política pública.
- **Reformulación conceptual hacia VAA:** cambio de la pregunta de diseño central, de *"¿cómo hacer atractivo el perfil del candidato?"* a *"¿cómo medir la coincidencia entre las posturas del votante y las del candidato?"*.
- **Definición de requerimientos funcionales:** listado de funcionalidades del sistema a implementar, priorizado por valor para el usuario.

**Entregable:** especificación de diseño del sistema VAA, con definición de la mecánica de cuestionario, el modelo de ejes temáticos y el concepto de matching.

#### Fase 3: Construcción Incremental (2025 — segundo semestre / 2026)

Esta fue la fase más extensa del proyecto, en la que se construyó el sistema completo mediante iteraciones sucesivas organizadas en *sprints* de objetivo único. Las actividades centrales incluyeron:

- **Configuración del entorno y arquitectura base:** selección del stack tecnológico, configuración de repositorio y primeras implementaciones del backend y el frontend.
- **Construcción del modelo de datos:** diseño e implementación de la estructura de entidades del sistema (candidatos, preguntas, respuestas, posturas, matches).
- **Implementación del algoritmo de matching:** traducción del modelo conceptual de comparación de posturas a una función de cálculo que considera ponderación y produce indicadores de confianza.
- **Desarrollo de la interfaz de usuario:** implementación de las pantallas de la aplicación siguiendo el diseño de experiencia definido en la fase anterior.
- **Verificación de integridad de datos:** definición del protocolo de importación de posturas, con validaciones que exigen justificación y fuente primaria por entrada.
- **Refactorización continua:** reorganización del código en capas con responsabilidades claras, extracción de lógica de negocio pura a servicios independientes, adopción de herramientas de gestión de estado y caché.
- **Implementación de features adicionales:** sistema de favoritos y descartados, contexto educativo por pregunta, sistema de toasts, sistema de autenticación seguro, modo oscuro, y otros componentes de experiencia.
- **Tests automatizados:** construcción de una suite de pruebas con cobertura de los servicios de negocio y los endpoints de la API.

**Entregable:** sistema funcional en estado de MVP, con 17 pantallas de frontend, 19 modelos de datos, ~31 endpoints REST, 370 tests automatizados y documentación técnica.

#### Fase 4: Auditoría y Documentación (2026 — agosto)

La fase final fue un proceso sistemático de revisión documental cruzada. Sus actividades centrales fueron:

- **Auditoría de 37 documentos técnicos** contra el código fuente real, identificando y corrigiendo inconsistencias, referencias a funcionalidades eliminadas y métricas desactualizadas.
- **Actualización de la documentación** de arquitectura, modelos, endpoints, algoritmo, servicios, comandos, migraciones, señales, autenticación y tests.
- **Generación de documentación académica** sobre el proyecto, incluyendo el análisis de la historia y evolución del sistema, el análisis comparativo con VAAs internacionales, y el presente documento de tesis.

**Entregable:** repositorio con documentación verificada y coherente con el código fuente.

### 5.3 Levantamiento de Requerimientos

Los requerimientos del sistema se obtuvieron mediante tres mecanismos complementarios:

**Requerimientos derivados del problema:** la caracterización empírica del problema en la Fase 1 definió las propiedades esenciales que debía tener la solución (comprensible, mobile-first, rápida, confiable, verificable).

**Requerimientos derivados del análisis comparativo:** el estudio de las VAAs internacionales existentes identificó funcionalidades probadas y brechas que la plataforma podía cubrir.

**Requerimientos emergentes durante la construcción:** durante la Fase 3, la construcción del sistema reveló necesidades que no habían sido anticipadas en el diseño conceptual. Estas se incorporaron al backlog y se abordaron en sprints posteriores. El proceso fue explícito: los requerimientos emergentes se registraron como issues con descripción del problema, criterios de aceptación y prioridad.

### 5.4 Validación

La validación del sistema se realizó en múltiples niveles:

**Validación funcional end-to-end:** en cada sprint, se verificó que el flujo completo —desde el registro del usuario hasta la obtención del ranking de matches— funcionara correctamente.

**Validación de datos:** las posturas de candidatos importadas al sistema fueron verificadas contra fuentes primarias. Las entradas sin verificación suficiente fueron marcadas explícitamente con nivel de confianza BAJA, y el sistema las presenta como tales al usuario.

**Validación de contrato de API:** el esquema OpenAPI generado automáticamente por el backend fue consumido por el frontend para generar tipos TypeScript, lo que garantiza que cualquier cambio en el contrato de la API se refleje como error en tiempo de compilación.

**Validación automatizada:** la suite de tests cubre los servicios de negocio críticos (cálculo de match, lógica del cuestionario) y los endpoints de la API, con 370 tests distribuidos en 30 archivos.

**Validación de accesibilidad:** la interfaz fue construida siguiendo las pautas WCAG 2.2 nivel AA, con revisión de contraste mínimo de 4,5:1 para texto normal y tamaños mínimos de targets táctiles de 44×44 puntos.

---

## 6. Marco Teórico

### 6.1 Voting Advice Applications (VAA)

#### 6.1.1 Definición y origen

Una Voting Advice Application es una herramienta digital diseñada para asistir a los ciudadanos en el proceso de decisión electoral mediante la comparación sistemática de las posturas del votante con las posiciones de los partidos o candidatos en competencia (Garzia y Marschall, 2014). El resultado de esta comparación se expresa típicamente como un indicador de afinidad o coincidencia, acompañado de elementos de visualización que permiten al usuario interpretar la distancia entre sus posiciones y las de cada candidato.

Las VAAs tienen historia documentada desde 1989, cuando la organización ProDemos de los Países Bajos lanzó la primera versión de StemWijzer —inicialmente distribuida en disquete— para las elecciones parlamentarias holandesas. Desde entonces, la categoría se ha expandido a decenas de países en Europa, América del Norte, América Latina y Oceanía, con implementaciones que varían significativamente en metodología, escala y sofisticación.

#### 6.1.2 Impacto político documentado

La literatura politológica sobre el impacto de las VAAs en el comportamiento electoral es consistente en varios hallazgos. Estudios realizados en países con alta penetración de estas herramientas —especialmente Alemania, Suiza y los Países Bajos— estiman que las VAAs pueden influir en entre el 2% y el 6% de los votos emitidos en procesos donde tienen alta adopción (Ruusuvirta y Rosema, 2009). Wahl-O-Mat, la VAA alemana operada por la Agencia Federal de Educación Cívica, registró más de 21 millones de usos durante las elecciones federales de 2021, con investigaciones que sugieren que su uso incrementa la participación electoral y la información ciudadana sobre los programas de los partidos (Marschall y Schmidt, 2010).

El impacto de las VAAs no se limita a la dirección del voto. También se ha documentado su efecto sobre la participación misma: usuarios que completan una VAA muestran mayor probabilidad de concurrir a votar que quienes no lo hacen, posiblemente porque el proceso de completar el cuestionario genera un sentido de compromiso con la decisión electoral.

#### 6.1.3 Componentes fundamentales de una VAA

Las VAAs comparten, con independencia de sus particularidades de implementación, un conjunto de componentes estructurales:

**El cuestionario de posiciones:** conjunto de preguntas sobre temas de política pública, diseñadas para cubrir el espacio de variación ideológica y programática relevante en el contexto electoral específico. Las escalas de respuesta más comunes son Likert de 3, 4 o 5 puntos, con o sin opción de omitir respuesta.

**El repositorio de posturas de candidatos:** base de datos que registra la posición de cada partido o candidato en cada pregunta del cuestionario. El origen de estas posturas puede ser autodeclarado (los propios candidatos responden el cuestionario), curado por terceros (un equipo independiente asigna posturas a partir de fuentes primarias), o mixto.

**El algoritmo de matching:** función que compara las respuestas del usuario con las posturas de los candidatos y produce un indicador de afinidad. Los algoritmos varían en complejidad: desde la simple coincidencia binaria hasta funciones que consideran ponderación por importancia declarada, distancia métrica entre posiciones y mecanismos de control por cobertura de respuestas.

**La visualización de resultados:** la representación gráfica de los resultados influye significativamente en cómo los usuarios los interpretan. Los formatos más comunes incluyen rankings con porcentajes, mapas de posicionamiento en dos ejes (izquierda-derecha y progresista-conservador) y gráficos de radar que muestran la afinidad por dimensiones temáticas.

### 6.2 Sistemas de Recomendación y Matching

#### 6.2.1 Taxonomía de sistemas de recomendación

Los sistemas de recomendación son herramientas de procesamiento de información que filtran un conjunto de opciones disponibles para presentar al usuario las más relevantes según sus preferencias (Ricci et al., 2011). Se clasifican en tres categorías principales:

**Filtrado colaborativo:** recomienda ítems basándose en las preferencias de usuarios con perfiles similares. Requiere masa crítica de datos de usuarios para funcionar correctamente.

**Filtrado basado en contenido:** recomienda ítems cuyas características son similares a las de ítems que el usuario ha valorado positivamente en el pasado.

**Filtrado basado en conocimiento:** recomienda ítems que satisfacen los requerimientos explícitos del usuario, sin depender de historiales de preferencias.

Las VAAs pertenecen a la tercera categoría: utilizan las posturas explícitas del usuario en el cuestionario como especificación de sus preferencias, y comparan esta especificación con las características (posturas) de los candidatos disponibles. No dependen de historiales de comportamiento ni de comparaciones entre usuarios.

#### 6.2.2 Funciones de similaridad

El cálculo de afinidad en una VAA puede modelarse como una función de similaridad entre el vector de respuestas del usuario y el vector de posturas de cada candidato. La elección de la métrica de distancia es una decisión de diseño con implicaciones directas en los resultados:

**Distancia Manhattan:** suma de las diferencias absolutas entre posiciones. Simple e intuitiva.

**Distancia Euclidiana:** raíz cuadrada de la suma de las diferencias cuadradas. Penaliza más las discrepancias grandes.

**Similaridad del coseno:** mide el ángulo entre vectores, normalizada por la magnitud. Útil cuando la escala absoluta importa menos que la dirección.

**Coincidencia exacta normalizada:** penaliza o premia exclusivamente la coincidencia o discrepancia, sin considerar la distancia entre posiciones adyacentes.

La selección de la métrica adecuada depende del modelo político subyacente: ¿es más relevante que un usuario en posición 5 (muy de acuerdo) y un candidato en posición 4 (de acuerdo) sean considerados cercanos, o que la distancia entre posición 1 y posición 5 sea igual a la distancia entre posición 3 y posición 5?

#### 6.2.3 Ponderación por importancia

Un mecanismo fundamental en las VAAs más sofisticadas es la posibilidad de que el usuario indique la importancia relativa de cada tema para su decisión de voto. Esta ponderación transforma el cálculo de afinidad en una suma ponderada, donde los temas más importantes para el usuario tienen mayor peso en el resultado final. La literatura politológica documenta que este mecanismo incrementa la validez percibida del resultado: los usuarios sienten que el sistema los entiende mejor cuando pueden expresar no solo sus posiciones sino también sus prioridades (Garzia y Marschall, 2014).

### 6.3 Toma de Decisiones Asistida

#### 6.3.1 La carga cognitiva en la decisión electoral

La psicología cognitiva de la toma de decisiones identifica que los seres humanos enfrentan limitaciones estructurales cuando procesan conjuntos de opciones complejas con múltiples atributos (Kahneman, 2011). En el contexto electoral, estas limitaciones son especialmente relevantes: el votante debe evaluar a múltiples candidatos en múltiples dimensiones —programa económico, posiciones sociales, trayectoria, credibilidad— con información dispersa, de calidad variable y en competencia con sesgos cognitivos como el efecto halo y la heurística de familiaridad.

La investigación en ciencias conductuales indica que los ciudadanos tienden a resolver esta complejidad mediante heurísticas simplificadoras: votan por el partido que siempre han votado, eligen al candidato más mediáticamente visible, o transfieren la recomendación de un referente de confianza. Estas heurísticas no son irracionales, pero pueden producir resultados inconsistentes con las preferencias reales del votante cuando se evalúan sistemáticamente.

#### 6.3.2 Sistemas de soporte a la decisión

Los sistemas de soporte a la decisión (Decision Support Systems, DSS) son herramientas de información diseñadas para asistir a los usuarios en la toma de decisiones complejas mediante la estructuración, análisis y presentación de información relevante (Power, 2002). Las VAAs son un caso particular de DSS aplicado al dominio electoral: no remplazan la decisión del ciudadano, sino que proveen información estructurada que reduce la carga cognitiva del proceso decisional.

La distinción entre asistencia a la decisión y prescripción de la decisión es fundamental en el diseño de una VAA. El sistema no dice al usuario por quién votar: le muestra con quién coincide más, según sus propias posturas declaradas, y le provee información adicional para que elabore su propio juicio.

### 6.4 Experiencia de Usuario en Aplicaciones Cívicas

#### 6.4.1 Diseño centrado en el usuario

El diseño centrado en el usuario (User-Centered Design, UCD) es un proceso iterativo de diseño que parte de las necesidades, capacidades y contextos de los usuarios objetivo para orientar cada decisión de diseño (Norman, 2013). En el contexto de VotoAFin, las implicaciones del UCD son concretas:

- El cuestionario debe ser comprensible sin conocimiento político previo.
- El resultado debe ser interpretable sin formación estadística.
- El flujo de interacción debe minimizar la fricción y maximizar la completitud (que el usuario llegue al resultado sin abandonar a mitad del cuestionario).
- La plataforma debe funcionar en los dispositivos y condiciones de conectividad de sus usuarios objetivo.

#### 6.4.2 Accesibilidad en aplicaciones de interés público

Las aplicaciones de interés público tienen una responsabilidad de accesibilidad que trasciende la de las aplicaciones comerciales convencionales. Si una VAA es accesible solo para usuarios con determinadas capacidades cognitivas, visuales o tecnológicas, excluye a los segmentos que más podrían beneficiarse de la asistencia a la decisión electoral.

El estándar WCAG 2.2 (Web Content Accessibility Guidelines) en su nivel AA establece los requerimientos mínimos de accesibilidad para aplicaciones web: contraste mínimo de 4,5:1 para texto normal, tamaño mínimo de targets táctiles, compatibilidad con tecnologías asistivas, y navegación coherente por teclado. La adopción de este estándar como requerimiento no negociable del diseño fue una decisión consciente del proyecto.

### 6.5 Arquitectura de Software para Aplicaciones de Escala Cívica

#### 6.5.1 Separación de responsabilidades

El principio de separación de responsabilidades (Separation of Concerns) establece que los distintos aspectos funcionales de un sistema deben estar encapsulados en módulos independientes con interfaces bien definidas. En el contexto de una VAA, este principio tiene implicaciones directas: el algoritmo de matching debe ser independiente de la capa de presentación, los datos de candidatos deben ser independientes de la lógica de usuario, y la capa de comunicación debe ser independiente de la lógica de negocio.

Esta separación es crítica para la auditabilidad: si el algoritmo de cálculo de afinidad está entremezclado con el código de presentación o con las consultas a la base de datos, resulta difícil para terceros verificar que el sistema opera correctamente y sin favoritismos ocultos.

#### 6.5.2 Contrato de API como mecanismo de coordinación

El diseño de APIs con contratos formales —especificados mediante estándares como OpenAPI— permite la evolución independiente de los componentes de un sistema sin romper la integración entre ellos. En el contexto de una plataforma cívica con múltiples potenciales consumidores (app web, app nativa, eventuales integraciones con medios), un contrato de API bien definido es la base de la interoperabilidad.

---

## 7. Estado del Arte

### 7.1 Panorama Internacional de VAAs

Las Voting Advice Applications existen desde hace más de tres décadas y han evolucionado desde herramientas simples de comparación binaria hacia sistemas complejos con visualizaciones avanzadas, modelos de posicionamiento político en espacios multidimensionales y capacidades explicativas. El análisis de las principales plataformas activas a nivel internacional permite contextualizar las decisiones de diseño de VotoAFin.

#### 7.1.1 StemWijzer (Países Bajos, 1989)

StemWijzer es la VAA más antigua del mundo, operada por la organización de educación cívica ProDemos. Utiliza una escala de respuesta de tres puntos (sí / neutral / no) con opción de indicar importancia (normal / importante). Su número típico de preguntas por proceso electoral es de alrededor de 30. Las posturas de los partidos son curadas por el equipo de ProDemos en colaboración con los propios partidos, con justificaciones parciales disponibles. Los resultados se presentan en formato de ranking con porcentaje de coincidencia.

StemWijzer demuestra que la utilidad de una VAA no requiere complejidad algorítmica: con una escala de tres puntos y 30 preguntas, ha informado la decisión electoral de decenas de millones de holandeses en sucesivos procesos desde 1989.

#### 7.1.2 Wahl-O-Mat (Alemania, 2002)

Wahl-O-Mat, operado por la Agencia Federal de Educación Cívica (BpB), es considerado el estándar de referencia entre las VAAs europeas. Utiliza escala de tres puntos (de acuerdo / neutral / en desacuerdo), con 38 preguntas típicas y un mecanismo de doble peso para temas seleccionados como prioritarios por el usuario. Las posturas de los partidos son autodeclaradas y revisadas por un panel independiente, con justificaciones escritas disponibles para cada postura.

El nivel de explicabilidad de Wahl-O-Mat es el más avanzado del grupo analizado: el usuario puede ver, pregunta por pregunta, la respuesta de cada partido con su justificación oficial. Esto convierte a la herramienta no solo en un instrumento de matching sino en un recurso educativo sobre los programas partidarios.

#### 7.1.3 Smartvote (Suiza, 2003)

Smartvote es la VAA con el cuestionario más extenso del espectro analizado (hasta 75 preguntas) y el sistema de visualización más sofisticado. Utiliza escala de cuatro puntos (sí / más sí / más no / no) y permite a los usuarios ponderar preguntas en una escala de 0 a 2. Sus resultados incluyen el "Smartmap", un mapa de posicionamiento en dos ejes que ubica al usuario y a los candidatos en el espacio político, además de un análisis detallado por categorías temáticas.

Smartvote demuestra el potencial de los mapas de posicionamiento bidimensional como herramienta de comprensión política, pero su implementación requiere calibración académica rigurosa de los ejes y no es directamente replicable sin ese trabajo previo.

#### 7.1.4 Vote Compass (Canadá/Australia/otros, 2011)

Vote Compass, desarrollado originalmente en Canadá y luego expandido a Australia, Brasil y otros países, se distingue por su modelo de distribución: opera en alianza con medios de comunicación nacionales (CBC en Canadá, ABC en Australia), lo que le da acceso a distribución masiva en cada proceso electoral. Utiliza escala Likert de cinco puntos con opción de omitir, alrededor de 30 preguntas, y visualización mediante mapa de posicionamiento en dos ejes.

Vote Compass demuestra la importancia de la distribución sobre la sofisticación técnica: con un algoritmo de matching estándar, alcanza millones de usuarios gracias a sus alianzas con medios de comunicación.

#### 7.1.5 iSideWith (Estados Unidos/global, 2012)

iSideWith es la VAA de mayor alcance geográfico, con cobertura de candidatos de decenas de países. Utiliza un sistema de preguntas de opción múltiple con variantes contextuales y permite a los usuarios indicar la importancia de cada tema. Los resultados se presentan como porcentaje de afinidad global y por tema, con identificación de las preguntas donde hay acuerdo y desacuerdo.

iSideWith demuestra la viabilidad del modelo global, pero su cobertura superficial de la mayoría de los países limita su utilidad para el votante que busca información detallada sobre candidatos específicos.

### 7.2 Contexto Chileno

#### 7.2.1 Voto Informado

La plataforma Voto Informado fue desarrollada originalmente en colaboración entre el SERVEL y el PNUD, con el objetivo de ofrecer a los ciudadanos chilenos información comparativa sobre los candidatos en cada proceso electoral. Sin embargo, su operación ha sido intermitente —activa solo en períodos preelectorales, sin mantención permanente— y carece de un algoritmo de matching formal. La plataforma permite comparar perfiles de candidatos lado a lado, pero no produce un indicador de afinidad basado en las respuestas del usuario.

#### 7.2.2 Decide Chile

Decide Chile fue una iniciativa ciudadana con mayor foco en el matching algorítmico que Voto Informado, con alrededor de 20 preguntas en escala Likert de cinco puntos. Sin embargo, la plataforma fue discontinuada y se encontraba inactiva al inicio de este proyecto. Su desaparición por falta de mantención ilustra un desafío común en las iniciativas ciudadanas de tecnología cívica: la sostenibilidad a largo plazo sin respaldo institucional.

### 7.3 Análisis Comparativo

La tabla siguiente sintetiza las dimensiones clave de comparación entre las principales plataformas analizadas y VotoAFin:

| VAA | País | Escala | Peso | Fuentes citadas | Radar | Open Source |
|---|---|---|---|---|---|---|
| StemWijzer | NL | 3 puntos | Sí (2 niveles) | Parcial | No | No |
| Wahl-O-Mat | DE | 3 puntos | Sí (doble) | Sí (justificaciones) | No | No |
| Smartvote | CH | 4 puntos | Sí (0-2) | Parcial | Sí | Parcial |
| Vote Compass | CA/AU | 5 puntos | Sí | Limitado | No | No |
| iSideWith | Global | Múltiple | Sí | Limitado | No | No |
| Voto Informado | CL | Sin algoritmo | No | Parcial | No | No |
| Decide Chile | CL | 5 puntos | Sí | Limitado | No | No |
| **VotoAFin** | **CL** | **5 puntos + No sé** | **Sí (4 niveles)** | **Sí (URL obligatoria)** | **Sí (7 ejes)** | **Sí (AGPL-3.0)** |

### 7.4 Brechas Identificadas y Posicionamiento de VotoAFin

Del análisis comparativo emergen cuatro brechas que VotoAFin busca cubrir:

**Brecha 1 — Vacío en el mercado local:** al momento de inicio del proyecto, no existía en Chile una VAA activa con metodología transparente y datos actualizados. Decide Chile estaba discontinuada y Voto Informado carecía de matching algorítmico.

**Brecha 2 — Transparencia de posturas:** ninguna de las VAAs chilenas anteriores requería fuentes verificables para las posturas asignadas a los candidatos. VotoAFin incorpora esta exigencia a nivel técnico, no solo de política editorial.

**Brecha 3 — Código abierto:** ninguna VAA del grupo internacional analizado publica su código fuente completo bajo licencia libre. VotoAFin adopta AGPL-3.0, permitiendo la auditoria del algoritmo y los datos, y habilitando reutilización en otros contextos.

**Brecha 4 — Indicador de confianza:** ninguna VAA del grupo analizado incorpora un indicador explícito de la confianza del resultado en función de la cobertura de respuestas del usuario. VotoAFin es la primera que comunica activamente la diferencia entre un match calculado sobre pocas preguntas (tentativo) y uno calculado sobre muchas (alta confianza).

---

## 8. Desarrollo

### 8.1 Historia del Proyecto: del Problema a la Solución

#### 8.1.1 Etapa I — Investigación del problema (Emprendimiento I, 2024)

El proyecto tuvo su origen en el primer trabajo del curso de Emprendimiento. El equipo —Jenifer Castillo, Patricio De Lima y Alonso Sánchez— identificó la desinformación electoral como su área de estudio, motivado por la observación directa de un ciclo electoral de inusual densidad en Chile y por la percepción de que los ciudadanos disponían de herramientas insuficientes para tomar decisiones informadas.

La investigación procedió en dos etapas: una revisión sistemática de fuentes secundarias (estudios de opinión, registros del SERVEL, informes académicos) y un levantamiento de campo mediante entrevistas con 12 personas en el área metropolitana de Valparaíso. Los hallazgos —resumidos en la Sección 2 de este documento— confirmaron la relevancia empírica del problema y lo cuantificaron con datos específicos del contexto chileno.

La conclusión de esta etapa fue una oportunidad de diseño articulada: *"existe espacio para una herramienta que reúna información confiable sobre candidatos y elecciones y la haga accesible para todos"*.

#### 8.1.2 Etapa II — Primera propuesta de solución (Emprendimiento II, 2024)

El segundo trabajo del curso desplazó el foco hacia el diseño de una respuesta. El equipo reformuló el problema incluyendo una dimensión adicional: no solo la desinformación activa, sino el **desinterés estructural** como factor agravante. La hipótesis fue que una aplicación capaz de superar la barrera del desinterés —mediante diseño atractivo y mecánicas de gamificación— podría resolver simultáneamente ambos problemas.

La primera propuesta conceptual incorporaba:
- Autenticación mediante RUT y Clave Única (el sistema de identificación del Estado), para reducir la fricción de registro y crear un vínculo simbólico con la institucionalidad electoral.
- Un directorio de partidos y candidatos con información estructurada.
- Mecánicas de gamificación para motivar la exploración.
- Sistemas de puntos y recompensas por participación cívica.

Un prototipo de baja fidelidad fue construido en la plataforma de diseño Visily AI y presentado con una propuesta de negocio dirigida a potenciales inversionistas, con una proyección de inversión inicial de $120 millones de pesos chilenos y un modelo de sostenibilidad basado en patrocinios, publicidad y licencias a organismos gubernamentales.

Esta etapa produjo una propuesta viable en concepto, pero la evaluación posterior identificó tres limitaciones estructurales: la autenticación con Clave Única implicaba requerimientos de integración con infraestructura estatal difíciles de cumplir para un proyecto independiente; las mecánicas de gamificación añadían complejidad sin abordar directamente el problema de la calidad de la información; y el foco en el atractivo de la experiencia desplazaba el problema central, que era la falta de información estructurada sobre posturas de candidatos, no la falta de motivación para interactuar con una aplicación.

#### 8.1.3 Etapa III — El prototipo de swipe (2024-2025)

La tercera etapa experimentó con una metáfora de interacción radicalmente simplificada: el swipe bidireccional, popularizado por Tinder como mecanismo de evaluación rápida de opciones. La idea era presentar al usuario tarjetas con los candidatos y permitirle deslizarlas hacia la izquierda (no me interesa) o la derecha (me interesa), construyendo progresivamente un ranking de preferencias.

El prototipo se construyó con candidatos ficticios y posiciones simplificadas. La evaluación rápida de la experiencia reveló la limitación fundamental de la metáfora: el swipe binario (sí/no) no podía capturar la riqueza de las posiciones de los usuarios sobre temas complejos de política pública. La respuesta a *"¿estás de acuerdo con el aumento del salario mínimo?"* no puede ser binaria: exige matiz (¿cuánto aumento?, ¿en qué plazo?, ¿con qué compensación para las empresas?).

Más fundamentalmente, el swipe estaba orientado al candidato, no a los temas. El usuario evaluaba al candidato como unidad, reforzando los sesgos de identificación personal o partidaria que el proyecto pretendía superar.

Esta etapa fue corta, pero necesaria: la identificación de las limitaciones del modelo llevó directamente a la reformulación que generó VotoAFin.

#### 8.1.4 Etapa IV — Reformulación hacia VAA y consolidación (2025-2026)

La pregunta de diseño central cambió. En lugar de *"¿cómo hacer atractiva la presentación del candidato?"*, la nueva pregunta fue: *"¿cómo medir la coincidencia entre las posturas declaradas del votante y las posiciones documentadas del candidato?"*.

Este cambio de pregunta implicó adoptar el modelo conceptual de las Voting Advice Applications: un cuestionario de posiciones, comparación algorítmica y resultado de afinidad. El análisis de las VAAs internacionales existentes (Sección 7) proporcionó el marco de referencia para las decisiones de diseño que siguieron.

El nombre del proyecto evolucionó en paralelo: de una metáfora gamificada inicial a **VotoAFin**, que expresa directamente el propósito del sistema —orientar el voto hacia la afinidad programática.

### 8.2 Descubrimiento y Diseño de la Experiencia

#### 8.2.1 Principios de diseño de experiencia

El diseño de la experiencia de VotoAFin se guió por tres principios:

**Claridad sobre atractivo:** en cada decisión de diseño donde competían la claridad del mensaje y el atractivo visual, se priorizó la claridad. El usuario necesita entender lo que el sistema le está mostrando antes de apreciar cómo lo muestra.

**Flujo mínimo viable:** el camino desde el ingreso a la plataforma hasta la obtención del resultado debe ser lo más corto posible, eliminando cualquier paso que no contribuya directamente a la calidad del resultado. Cada pantalla adicional entre el inicio y el resultado es una oportunidad de abandono.

**Resultado accionable:** el resultado del matching debe ser interpretable sin formación estadística o política. El porcentaje de coincidencia, el radar por ejes y el indicador de confianza deben ser leídos por un ciudadano sin experiencia previa con este tipo de herramientas.

#### 8.2.2 Flujo de usuario

El flujo de interacción diseñado para VotoAFin tiene siete pasos:

1. **Registro o inicio de sesión:** el usuario crea una cuenta con nombre de usuario, correo electrónico y contraseña. No se requiere identificación oficial (RUT) ni vinculación con servicios del Estado.

2. **Selección del tipo de elección:** el usuario indica a qué proceso electoral desea que se oriente la recomendación (presidencial, parlamentaria, etc.).

3. **Cuestionario:** el usuario responde las preguntas sobre política pública de manera secuencial, indicando su posición en escala Likert de cinco puntos y, opcionalmente, el nivel de importancia que asigna a cada tema.

4. **Envío de respuestas:** las respuestas se guardan en el sistema, que calcula el ranking de afinidad.

5. **Resultados:** el usuario ve el ranking de candidatos ordenado por porcentaje de coincidencia, con indicador de confianza y opción de filtrar por candidatos favoritos o descartar candidatos no deseados.

6. **Detalle de candidato:** el usuario puede explorar el perfil completo de cualquier candidato del ranking, incluyendo su postura en cada pregunta con justificación y fuente, el radar de afinidad por siete ejes temáticos, y noticias recientes.

7. **Guardado y comparación:** el usuario puede marcar candidatos como favoritos, descartar candidatos del ranking, y comparar candidatos entre sí.

#### 8.2.3 El diseño del cuestionario

El cuestionario es el elemento más crítico del diseño de experiencia de una VAA: su extensión determina la calidad del resultado (más preguntas = resultado más preciso) pero también la tasa de completitud (más preguntas = más abandono). La literatura politológica sobre VAAs identifica este balance como uno de los principales desafíos de diseño.

Para el MVP, se definió un conjunto inicial de 12 preguntas distribuidas en siete ejes temáticos: Economía, Sociedad, Ambiente, Seguridad, Derechos Humanos, Internacional e Institucional. Este número fue conservador pero suficiente para producir resultados significativos, con la posibilidad de expansión documentada en el roadmap del proyecto.

Cada pregunta incorpora un modal de contexto educativo con cinco dimensiones de análisis (económica, social, cultural, ambiental e institucional), construido con lenguaje neutral y sin valoración ideológica. Este componente fue diseñado explícitamente para que el usuario pueda tomar una decisión informada sobre la pregunta sin conocimiento previo del tema.

La escala de respuesta utiliza cinco puntos (Muy de acuerdo / De acuerdo / Neutral / En desacuerdo / Muy en desacuerdo) más una opción explícita *"No sé"* que excluye la pregunta del cálculo en lugar de asignarle un valor neutral. Esta distinción es significativa: la respuesta neutral implica que el usuario tiene una posición intermedia; la respuesta *"No sé"* implica que el usuario no tiene información suficiente para tomar posición, y el sistema no debe penalizar al candidato ni favorecerlo por esa omisión.

### 8.3 Arquitectura Conceptual del Sistema

#### 8.3.1 Modelo de separación cliente-servidor

VotoAFin adopta la arquitectura cliente-servidor como modelo fundamental de organización del sistema. Esta separación establece dos dominios claramente diferenciados:

**El servidor (backend)** es responsable de la persistencia de datos, el cálculo de los matches, la autenticación y la exposición de una API que define el contrato de comunicación con cualquier cliente. El servidor es la fuente de verdad del sistema: contiene los datos de candidatos, preguntas y posturas; ejecuta el algoritmo de cálculo; y devuelve los resultados según el contrato especificado.

**El cliente (frontend)** es responsable de la presentación de la información al usuario, la captura de sus respuestas, la navegación entre pantallas y la comunicación con el servidor a través del contrato de API definido. El cliente no contiene lógica de negocio crítica: su función es mediar entre el usuario y el servidor.

Esta separación es fundamental para la auditabilidad del sistema: el algoritmo de cálculo, que es el componente central en términos de impacto político, reside exclusivamente en el servidor, está documentado y es verificable de forma independiente del código de presentación.

#### 8.3.2 El modelo de datos

El sistema organiza su información en cuatro dominios conceptuales:

**Catálogo electoral:** las entidades que definen el contexto de cada proceso electoral — tipos de elección, candidatos con sus atributos (nombre, partido, lista, territorio), preguntas del cuestionario organizadas por eje temático, y opciones de respuesta con sus valores en la escala Likert.

**Interacción del usuario:** las entidades que registran las preferencias expresadas por el usuario — sus respuestas al cuestionario con el peso asignado a cada pregunta, los resultados del matching calculados para cada candidato, y sus acciones de guardado (favoritos, descartados).

**Territorio:** las entidades geográficas que permiten contextualizar la relevancia electoral de cada candidato para cada usuario — regiones, distritos, comunas y unidades territoriales.

**Perfil y contenido:** las entidades complementarias que enriquecen la experiencia — el perfil del usuario, las noticias asociadas a cada candidato, y los marcadores de noticias y posturas.

#### 8.3.3 El algoritmo de matching

El algoritmo de cálculo de afinidad entre el usuario y cada candidato opera sobre el principio de coincidencia ponderada entre posiciones en escala Likert, con cuatro componentes:

**Comparación posición a posición:** para cada pregunta respondida por el usuario y con postura registrada para el candidato, se calcula la distancia entre la posición del usuario y la postura del candidato. Esta distancia se normaliza a una escala de coincidencia entre 0 (máxima discrepancia) y 1 (coincidencia exacta).

**Aplicación del peso del usuario:** el resultado de la comparación se multiplica por el multiplicador correspondiente al nivel de importancia indicado por el usuario para esa pregunta. La escala de importancia tiene cuatro niveles con multiplicadores diferenciados, de modo que los temas más importantes para el usuario contribuyen proporcionalmente más al resultado final.

**Cobertura y confianza:** el sistema registra cuántas preguntas participaron efectivamente en el cálculo (aquellas respondidas por el usuario y con postura del candidato disponible). Esta cobertura determina el nivel de confianza del resultado: se establece un umbral mínimo de preguntas necesarias para un resultado de alta confianza.

**Desglose por eje:** adicionalmente al porcentaje global, el algoritmo calcula el porcentaje de coincidencia para cada uno de los siete ejes temáticos, produciendo el vector de datos que alimenta el gráfico de radar en la visualización de resultados.

El diseño del algoritmo priorizó la explicabilidad por sobre la sofisticación matemática: cualquier ciudadano con comprensión básica de proporciones puede entender cómo se calcula el resultado, lo que es un requerimiento fundamental para la credibilidad del sistema en un contexto electoral.

#### 8.3.4 El contrato de API

La comunicación entre el frontend y el backend se establece mediante una API REST documentada con el estándar OpenAPI 3.1. Este contrato formal tiene dos funciones: define precisamente qué datos puede solicitar el cliente y qué formato recibirá en respuesta, y sirve como fuente de verdad para la generación automática de tipos de datos en el frontend.

El mecanismo funciona de manera bidireccional: cuando el backend cambia el esquema de un endpoint, la regeneración de tipos en el frontend produce errores de compilación que señalan exactamente los sitios del código donde la incompatibilidad debe resolverse. Esto elimina una categoría completa de errores de integración que de otro modo solo se manifiestan en tiempo de ejecución.

### 8.4 Decisiones Tecnológicas

#### 8.4.1 Criterios de selección de tecnologías

Las tecnologías adoptadas en el proyecto fueron seleccionadas aplicando un criterio explícito: *elegir herramientas probadas en producción, con comunidades activas, que resuelvan el problema actual sin añadir complejidad que no sea necesaria hoy*. Este criterio refleja el principio YAGNI (You Aren't Gonna Need It) aplicado a la elección de stack.

#### 8.4.2 Backend: Django y Django REST Framework

La elección de Django como framework backend fue justificada por tres factores: madurez y estabilidad (Django 5.2 es la versión más reciente de un framework con 20 años de historia en producción), funcionalidad incluida sin costo adicional (el panel de administración de Django es una interfaz de gestión de datos de candidatos y preguntas sin necesidad de construir una interfaz dedicada), y Django REST Framework como extensión natural para la construcción de APIs REST con serialización, validación y autenticación integradas.

**Alternativas consideradas:** FastAPI fue evaluado como alternativa más moderna y de mayor rendimiento asintótico. La razón de no elegirlo fue la ausencia de panel de administración integrado, que era un requerimiento funcional para que el equipo de curación de posturas pudiera gestionar los datos sin acceso directo a la base de datos.

**Impacto esperado:** la madurez de Django reduce el riesgo de errores no anticipados, simplifica el onboarding de contribuidores externos (mayor disponibilidad de documentación y experiencia en la comunidad), y provee la infraestructura de seguridad necesaria sin configuración adicional.

#### 8.4.3 Base de datos: SQLite y PostgreSQL

Se adoptó un modelo de bases de datos diferenciadas por entorno: SQLite para el entorno de desarrollo y PostgreSQL para el entorno de producción. SQLite permite que cualquier desarrollador ejecute el backend completo sin instalación de dependencias adicionales, reduciendo la fricción de onboarding. PostgreSQL es el estándar industrial para aplicaciones web en producción con requerimientos de concurrencia y escalabilidad.

**Deuda técnica reconocida:** la diferencia entre el motor de base de datos en desarrollo y en producción es una brecha conocida (documentada como incumplimiento del Factor X del 12-Factor App). Se decidió aceptarla en el MVP y resolverla antes del lanzamiento público mediante contenedores Docker que usen PostgreSQL en ambos entornos.

#### 8.4.4 Frontend: Expo, React Native y TypeScript

La elección de React Native con Expo como framework de frontend respondió al requerimiento de cobertura multiplataforma: una sola base de código capaz de producir aplicaciones para web, iOS y Android. Esta característica es fundamental para el alcance de una plataforma cívica orientada a la máxima cobertura de usuarios.

Expo fue preferido sobre React Native puro por su ecosistema de herramientas, su simplificación del proceso de compilación para múltiples plataformas, y su amplia compatibilidad con librerías de terceros. TypeScript con modo estricto fue adoptado como lenguaje obligatorio para garantizar la consistencia del contrato de tipos a lo largo de toda la capa de presentación.

**Alternativas consideradas:** una aplicación web progresiva (PWA) pura fue considerada como alternativa más simple. La razón de no elegirla fue la limitación en el acceso a capacidades nativas del dispositivo (almacenamiento seguro de tokens, notificaciones push) que serían necesarias en versiones futuras.

#### 8.4.5 Gestión de estado y caché: TanStack Query y Zustand

Para la gestión del estado del servidor (datos provenientes del backend), se adoptó TanStack Query en su versión 5. Esta librería provee caché automática, deduplicación de requests simultáneos, manejo de estados de carga y error, y retry automático, eliminando la necesidad de implementar estos patrones de manera manual en cada componente.

Para la gestión del estado del cliente (autenticación y estado del cuestionario), se adoptó Zustand, una librería de gestión de estado mínima que elimina el boilerplate de Redux sin sacrificar la capacidad de gestionar estados compartidos entre componentes.

**Alternativas consideradas:** Redux fue descartado por sobreingeniería para la escala del sistema (YAGNI). La combinación Context + useReducer fue considerada pero descartada por la dificultad de depuración en estados complejos.

#### 8.4.6 Licencia: AGPL-3.0

La elección de licencia fue una de las decisiones más reflexivas del proyecto. La AGPL (Affero General Public License) versión 3.0 establece que cualquier versión modificada del software que sea desplegada públicamente debe publicar su código fuente con la misma licencia. Esta condición es la más restrictiva entre las licencias de software libre, y fue elegida deliberadamente por la naturaleza electoral del sistema.

La justificación es conceptual: la tecnología electoral que procesa las posiciones políticas de los ciudadanos y produce recomendaciones de voto no debería poder operar como caja negra bajo propiedad privada. La AGPL garantiza que cualquier gobierno, organización o individuo que despliegue una versión modificada de VotoAFin deba compartir sus cambios, haciendo auditable cualquier eventual manipulación del algoritmo.

**Impacto esperado:** la AGPL habilita la reutilización del sistema para procesos electorales de otros países latinoamericanos sin permitir que los reutilizadores cierren el código. Esto crea un ecosistema de VAAs abiertas alrededor de la plataforma base.

### 8.5 Construcción del Sistema por Fases

#### 8.5.1 Fase inicial: del prototipo funcional al MVP

El punto de partida de la construcción fue el proyecto entregado en el marco del ramo de Aplicaciones Móviles: una aplicación Django+React Native con el flujo básico de cuestionario y matching implementado, pero sin datos reales de candidatos ni verificación de integridad. La arquitectura original era funcional pero monolítica: la lógica de negocio estaba mezclada con la capa de presentación, sin separación clara de responsabilidades.

La primera decisión de la fase de construcción fue auditar el estado real del sistema: verificar qué funcionaba, qué no funcionaba, y qué deuda técnica había que resolver antes de continuar. El hallazgo más crítico fue que el flujo end-to-end fallaba porque **no había posturas de candidatos cargadas en la base de datos**. Los matches devolvían 0% para todos los candidatos. El sistema era arquitectónicamente correcto pero vacío de datos reales.

#### 8.5.2 El problema de los datos de posturas

La resolución del problema de datos fue el primer ejercicio de decisión de integridad del proyecto y generó el principio que orientaría todos los datos del sistema en adelante: **nunca inventar datos electorales**.

En un primer intento, el asistente de desarrollo intentó inferir las posturas de los candidatos a partir de estereotipos ideológicos generales (*"el candidato X es de derecha, por lo tanto su postura sobre el aborto es Y"*). La autora del proyecto identificó el problema de inmediato: las inferencias ideológicas no son posturas verificadas y pueden ser tanto incorrectas como sesgadas. En un sistema electoral, la diferencia es crítica.

La decisión resultante fue implementar un protocolo de importación de posturas con validación técnica obligatoria: cada fila del archivo de datos debe incluir una justificación textual mínima de 20 caracteres y una URL de fuente primaria verificable que comience con http:// o https://. El sistema rechaza automáticamente las entradas que no cumplen estos criterios. Las posturas que no podían ser verificadas con certeza fueron marcadas explícitamente con nivel de confianza BAJA, y el sistema los presenta como tales al usuario.

Este episodio estableció el precedente de transparencia que atraviesa todo el diseño del sistema: si hay incertidumbre, se muestra la incertidumbre. No se simula certeza que no existe.

#### 8.5.3 Refactorización hacia capas limpias

Con el flujo básico funcional y la integridad de datos establecida, el siguiente sprint abordó la deuda arquitectónica del código original: la mezcla de lógica de negocio con presentación que dificultaba la testabilidad y la mantenibilidad.

La refactorización se organizó en tres capas en el frontend:

- **Capa de servicios:** lógica pura sin dependencias de React — funciones para calcular tiers de afinidad, formatear porcentajes, ordenar resultados, determinar si el cuestionario puede enviarse, calcular el progreso del formulario.
- **Capa de datos:** hooks de React Query que encapsulan la comunicación con el backend, proveyendo caché automática y estados de carga/error.
- **Capa de presentación:** pantallas que leen los hooks y los servicios, renderizan la información y despachan acciones — sin lógica de negocio propia.

En el backend, la refactorización produjo una separación análoga en: modelos de dominio (persistencia), servicios (lógica de negocio pura), vistas (recepción HTTP y delegación al servicio), y serializers (transformación de datos para el contrato de API).

El beneficio medido más tangible de esta separación fue la velocidad de los tests: los tests unitarios que operan directamente sobre los servicios (sin base de datos ni HTTP) corren 30 veces más rápido que los tests de integración que pasan por el stack completo.

#### 8.5.4 Seguridad y autenticación

La implementación del sistema de autenticación siguió el principio de *la solución más simple que resuelve el problema real*. El sistema utiliza tokens de autenticación DRF con dos adaptaciones para los contextos de uso:

En el contexto web (navegador), el token se almacena en una cookie httpOnly con atributos SameSite=Lax y Secure, de modo que el código JavaScript de la aplicación nunca tiene acceso al token en texto claro. Esto mitiga un vector de ataque de Cross-Site Scripting (XSS) donde un script malicioso podría robar el token.

En el contexto nativo (iOS/Android), el token se almacena en el almacenamiento seguro del sistema operativo (Keychain en iOS, EncryptedSharedPreferences en Android), inaccesible para otras aplicaciones.

Los tokens tienen un tiempo de vida configurable (por defecto, siete días), después del cual expiran y el usuario debe re-autenticarse. Las contraseñas se almacenan hasheadas con el algoritmo PBKDF2, el estándar por defecto de Django.

#### 8.5.5 Accesibilidad y diseño visual

El diseño visual adoptó una paleta de colores específica para los indicadores de afinidad, basada en cinco niveles con gradaciones de color que van del rojo (baja afinidad) al verde (alta afinidad), pasando por naranja y amarillo. Cada nivel tiene un ratio de contraste verificado para cumplir con el mínimo de 4,5:1 exigido por WCAG 2.2 AA tanto en modo claro como en modo oscuro.

El modo oscuro fue implementado como opción de visualización, con revisión explícita de todos los pares de colores en ambos modos para garantizar que la accesibilidad no se degrada en ninguna combinación.

Los tamaños de elementos táctiles en las pantallas del cuestionario —donde el usuario interactúa con mayor frecuencia— fueron establecidos en un mínimo de 44×44 puntos, siguiendo las guías de accesibilidad de Apple y las pautas WCAG.

#### 8.5.6 Contexto educativo por pregunta

Una funcionalidad diferenciadora respecto a las VAAs más simples fue el modal de contexto educativo por pregunta. Cada una de las 12 preguntas del cuestionario incluye, accesible mediante un icono de información junto al enunciado, un texto explicativo con dos componentes:

- **Explicación general:** descripción del tema en términos accesibles, sin lenguaje técnico ni posicionamiento ideológico.
- **Repercusiones por dimensión:** análisis de las implicaciones potenciales de diferentes posiciones en cinco dimensiones — económica, social, cultural, ambiental e institucional — redactado en tono neutral que presenta los argumentos de distintas perspectivas sin prescribir una posición.

El contenido de estos contextos educativos fue redactado con lenguaje explícitamente neutral y acompañado del aviso de que se encuentra "en revisión con especialistas", reconociendo que la producción de texto electoral realmente neutral requiere validación académica que no estaba disponible en el horizonte del MVP.

### 8.6 Evolución del Proyecto y Métricas

#### 8.6.1 Evolución de las métricas del sistema

La siguiente tabla compara las métricas del sistema al final de la fase inicial (Sprint 8) con las métricas al final de las sesiones de desarrollo intensivo (Sesiones A-F):

| Métrica | Sprint 8 (base) | Sesiones A-F (actual) |
|---|---|---|
| Commits en `main` | 2 | **212** |
| Tests automatizados | 46 | **370** |
| Endpoints REST | 11 | **~31** |
| Modelos de datos | 8 | **19** |
| Pantallas del frontend | 7 | **17** |
| Componentes UI reutilizables | 7 | **~89** |
| Servicios (lógica pura) | 2 | **4** |
| Hooks de datos | 6 | **30** |
| Migraciones de base de datos | 22 | **42** |
| Comandos de gestión | 5 | **19** |
| Issues resueltos del backlog | 0 | **~230** |
| Hallazgos de seguridad resueltos | 0 | **17/17** |

El crecimiento de las métricas refleja no solo la acumulación de funcionalidades, sino la maduración progresiva de la arquitectura: la relación entre tests y código aumentó, el número de componentes reutilizables creció para reflejar una mayor modularidad de la interfaz, y el número de comandos de gestión refleja la incorporación de datos más ricos (diputados 2025, candidatos presidenciales con posturas verificadas).

#### 8.6.2 Datos del sistema al estado actual

El sistema contiene actualmente:

- Candidatos presidenciales para las elecciones de 2025-2026, con posturas en las 12 preguntas base.
- Diputados 2025, 140 en total, asignados a sus distritos electorales correspondientes.
- 12 preguntas base distribuidas en 7 ejes temáticos, cada una con contexto educativo en 5 dimensiones.
- Posturas con nivel de confianza declarado (ALTA / MEDIA / BAJA) para cada entrada no completamente verificada.

### 8.7 Desafíos Principales

#### 8.7.1 El desafío de los datos

El desafío más significativo del proyecto, en términos de impacto sobre la calidad del resultado final, fue la obtención de posturas verificadas de los candidatos. Las posiciones públicas de los candidatos chilenos no están sistematizadas en ninguna base de datos abierta. Es necesario consultar una multiplicidad de fuentes primarias: declaraciones públicas en entrevistas de prensa, votaciones registradas en el portal del Congreso Nacional, plataformas de campaña publicadas en los sitios oficiales de los candidatos, y compromisos declarados en debates y foros.

Este trabajo de curaduría es intensivo en tiempo humano y no puede ser automatizado de manera confiable. Para el MVP, se optó por un enfoque pragmático: importar las posturas disponibles marcadas con nivel de confianza explícito, y documentar la verificación pendiente como deuda del roadmap (Sprint 9 — Verificación de posturas).

#### 8.7.2 El desafío de la neutralidad

Diseñar preguntas sobre política pública que sean genuinamente neutrales —que no favorezcan ni desfavorezcan ninguna posición ideológica a través de la formulación— es considerablemente más difícil de lo que parece. El lenguaje mismo es un campo político: la elección de términos, el encuadre de la pregunta, y el orden de las opciones de respuesta pueden introducir sesgos sutiles que afectan los resultados.

Para el MVP, se adoptó un criterio práctico: las preguntas fueron revisadas para eliminar los sesgos más evidentes de formulación, se redactaron en lenguaje positivo (afirmando posiciones en lugar de negándolas), y el contenido educativo fue escrito presentando argumentos de múltiples perspectivas sin privilegiar ninguna. La revisión con especialistas en comunicación política y metodología de encuestas es una tarea pendiente identificada para etapas posteriores.

#### 8.7.3 El desafío de la sostenibilidad

Las VAAs de origen ciudadano en Chile han enfrentado históricamente el problema de la sostenibilidad: requieren actualización constante con cada nuevo proceso electoral, y sin un modelo de financiamiento estable, tienden a deteriorarse entre ciclos electorales. Decide Chile es el ejemplo más reciente: la plataforma fue discontinuada precisamente por este motivo.

VotoAFin enfrenta el mismo desafío. La respuesta actual es la apertura del código (AGPL-3.0) para facilitar contribuciones externas, y el diseño modular de los datos de candidatos (importación mediante CSV validados) para que voluntarios puedan contribuir sin acceso al código fuente. El camino a largo plazo, identificado en la documentación del proyecto, incluye la búsqueda de alianzas institucionales con universidades, organismos de educación cívica, o medios de comunicación interesados en el periodismo de datos electoral.

### 8.8 Lecciones Aprendidas

#### 8.8.1 Lecciones de producto

**La pregunta de diseño determina la solución.** El cambio más importante del proyecto no fue técnico sino conceptual: pasar de *"cómo hacer atractivo el candidato"* a *"cómo medir la coincidencia entre posturas"*. Este cambio de pregunta generó una solución fundamentalmente distinta. La inversión en precisar la pregunta correcta antes de construir es la decisión con mayor retorno del proceso.

**El modelo VAA resuelve problemas que el diseño narrativo no puede.** La mecánica de swipe es atractiva y tiene baja fricción de inicio, pero no puede capturar la riqueza de posiciones políticas sobre temas complejos. El cuestionario Likert con ponderación, aunque menos inmediato, produce un resultado significativamente más válido para el propósito de asistir al votante.

**Los datos son el producto, el algoritmo es el envoltorio.** La calidad de las posturas de los candidatos determina la calidad del resultado más que cualquier sofisticación del algoritmo. Un algoritmo perfecto sobre datos inventados produce recomendaciones inútiles. Un algoritmo simple sobre datos verificados produce recomendaciones valiosas.

#### 8.8.2 Lecciones de ingeniería

**La separación de responsabilidades tiene valor medible.** La extracción de la lógica de negocio a servicios puros no fue una decisión estética: produjo tests 30 veces más rápidos, eliminó la duplicación de código entre pantallas, y permitió verificar el comportamiento del algoritmo de manera completamente independiente de la interfaz de usuario.

**El contrato de API como disciplina de integración.** La generación automática de tipos TypeScript desde el esquema OpenAPI del backend eliminó una categoría completa de errores de integración. Cada vez que el contrato cambió, el compilador señaló exactamente los sitios afectados, reduciendo drásticamente el tiempo de detección de incompatibilidades.

**La deuda técnica documentada es manejable; la no documentada no.** El proyecto adoptó la práctica de documentar explícitamente las áreas de deuda técnica conocida (sin rate limiting, SQLite vs. PostgreSQL en desarrollo, tests de frontend pendientes), distinguiéndolas de las áreas completas. Esto permitió priorizar deliberadamente qué deuda aceptar en el MVP y qué no.

#### 8.8.3 Lecciones de contexto cívico

**La transparencia es un requerimiento funcional, no una característica.** En el contexto de una herramienta electoral, la confianza del usuario en el sistema es condición necesaria para que sea útil. Un resultado que el usuario no entiende cómo fue calculado o que sospecha que pudo haber sido manipulado es un resultado que no usará para su decisión. La transparencia del algoritmo, la trazabilidad de las posturas y el indicador de confianza del resultado son respuestas directas a esta necesidad.

**El diseño para contextos de alta incertidumbre requiere honestidad explícita.** El MVP tiene posturas de candidatos con diferentes niveles de verificación. La respuesta correcta no es ocultar esa incertidumbre para que el resultado parezca más confiable, sino comunicarla explícitamente: el usuario sabe que un match marcado como "confianza baja" se calculó con información incompleta y debe interpretarlo en consecuencia. Esta honestidad, aunque parece reducir el valor percibido del resultado, en realidad lo incrementa porque protege la credibilidad del sistema a largo plazo.

### 8.9 Resultados Obtenidos

Al momento de escritura de este documento, VotoAFin es un sistema funcional en estado de MVP con las siguientes capacidades verificadas:

- Flujo completo de registro, cuestionario, cálculo de matches y exploración de resultados, funcionando en web, y con base de código preparada para compilación iOS y Android.
- Datos de candidatos presidenciales y diputados 2025 cargados, con posturas etiquetadas por nivel de confianza.
- Suite de tests con 370 casos automatizados cubriendo los servicios de negocio y los endpoints de la API.
- 37 documentos técnicos auditados y actualizados contra el código fuente real.
- Sistema de código abierto bajo AGPL-3.0 con documentación suficiente para onboarding de contribuidores externos.
- Repositorio público en GitHub bajo el nombre `whatebria/tinder-decisivo`.

Los pasos pendientes para el lanzamiento público —identificados en el roadmap del proyecto— incluyen la verificación completa de las posturas con fuentes primarias, el deploy en infraestructura de producción, la implementación de tests unitarios en el frontend, y la habilitación de la funcionalidad de explicabilidad detallada (mostrar qué preguntas causaron que un candidato rankeara alto o bajo).

---

## 9. Conclusiones

### 9.1 Cumplimiento de Objetivos

El objetivo general del proyecto —diseñar e implementar una Voting Advice Application de código abierto orientada al contexto electoral chileno— fue cumplido en su dimensión técnica: existe un sistema funcional que implementa la mecánica de cuestionario, cálculo de matching con ponderación e indicador de confianza, visualización de resultados y exploración de perfiles de candidatos. La plataforma está disponible públicamente en formato de código abierto.

En sus dimensiones de validación e impacto, el objetivo sigue en proceso: la verificación completa de posturas con fuentes primarias está pendiente, y el lanzamiento al público —prerequisito para la medición de impacto real sobre la participación informada— está en el horizonte inmediato del roadmap.

De los siete objetivos específicos, seis fueron alcanzados completamente (investigación del problema, análisis del estado del arte, diseño de experiencia, definición del algoritmo, implementación del sistema, modelo de verificación de datos), y uno fue alcanzado parcialmente (documentación orientada a contribuidores externos, que existe pero requiere ampliación).

### 9.2 Valor Generado

El valor generado por el proyecto es de tres tipos:

**Valor de producto:** un sistema funcional que no existía en Chile al inicio del proyecto. Cualquier votante chileno que lo utilice antes de una elección dispone de información estructurada y comparativa sobre los candidatos que ninguna herramienta disponible localmente le proveía de manera equivalente.

**Valor académico:** el proceso de investigación, diseño y construcción produce conocimiento documentado sobre el problema de la desinformación electoral en Chile, sobre el diseño de VAAs en contextos de información incompleta, y sobre la aplicación de principios de ingeniería de software a productos de interés cívico.

**Valor de infraestructura:** el código fuente abierto bajo AGPL-3.0 es una base técnica que otros grupos —universidades, organizaciones de educación cívica, medios de comunicación— pueden utilizar para construir instancias de la plataforma adaptadas a otros contextos electorales latinoamericanos, sin partir de cero.

### 9.3 Limitaciones Actuales

**Verificación de datos:** las posturas de candidatos en el sistema incluyen entradas con nivel de confianza medio y bajo. El sistema las comunica explícitamente, pero el ideal es que todas las posturas estén verificadas antes del lanzamiento al público.

**Escala de preguntas:** el cuestionario de 12 preguntas es funcional pero limitado en resolución comparado con VAAs consolidadas (Smartvote tiene 75, Wahl-O-Mat tiene 38). La precisión del matching se beneficiaría de una expansión del cuestionario.

**Cobertura electoral:** el MVP cubre la elección presidencial y la elección de diputados. Las elecciones municipales —donde los datos de la investigación mostraron los índices más altos de desinformación— no están cubiertas aún.

**Sostenibilidad:** el modelo actual es de proyecto personal sin respaldo institucional. La continuidad del sistema entre ciclos electorales requiere un modelo de sostenibilidad que no está resuelto.

**Tests de frontend:** la suite de tests cubre el backend de manera sólida, pero el frontend tiene cobertura de tests automatizados prácticamente nula. Esto representa un riesgo de regresión en funcionalidades de interfaz.

### 9.4 Trabajo Futuro

El roadmap del proyecto establece los pasos futuros en un horizonte de cuatro releases:

**v0.2 — Datos verificados:** verificación de todas las posturas con fuentes primarias, expansión del cuestionario, y publicación de un changelog público de verificaciones.

**v0.3 — Explicabilidad:** implementación de la funcionalidad de explicabilidad detallada (qué preguntas causaron que un candidato rankeara alto o bajo) y un simulador interactivo de sensibilidad del resultado.

**v0.4 — Expansión de cobertura:** elecciones municipales y regionales, notificaciones personalizadas, y onboarding del lado del candidato.

**v1.0 — Lanzamiento público:** hosting en producción, pruebas de carga para tráfico de día de elección, internacionalización.

### 9.5 Potencial de Evolución

Más allá del roadmap inmediato, VotoAFin tiene potencial de evolución en tres dimensiones:

**Investigación académica:** la plataforma puede ser utilizada por equipos de investigación en ciencia política para estudiar el comportamiento de los votantes frente a información estructurada, la relación entre la ponderación de temas y el resultado del matching, y el efecto del indicador de confianza sobre la percepción del resultado.

**Modelo para otros países:** la arquitectura modular y el código abierto permiten que el sistema sea adaptado a otros contextos electorales latinoamericanos. Un fork para las elecciones de Argentina, Colombia o México requeriría principalmente actualizar los datos de candidatos y preguntas, no reconstruir la infraestructura técnica.

**Alianzas institucionales:** la colaboración con el SERVEL, universidades, o medios de comunicación podría resolver el problema de sostenibilidad y ampliar el alcance de la plataforma exponencialmente, como lo demostró Vote Compass con su alianza con la CBC en Canadá.

### 9.6 Reflexión Final

Este proyecto comenzó con una observación simple: los ciudadanos chilenos enfrentaban decisiones electorales complejas sin herramientas adecuadas para tomarlas de manera informada. Terminó con un sistema funcional que intenta resolver ese problema de manera técnicamente sólida, metodológicamente transparente y éticamente responsable.

El proceso enseñó que la ingeniería de productos de interés público exige un estándar diferente al de los productos comerciales convencionales. En un producto comercial, el fracaso en comunicar la incertidumbre de un resultado es un problema de experiencia de usuario. En un producto electoral, es un problema de integridad democrática. Esta diferencia de escala ética no está presente en los currículos de ingeniería de manera explícita, pero se vuelve urgente en cuanto se construye algo que puede influir en la decisión de millones de ciudadanos sobre quién los representa.

La tecnología electoral no debería ser propiedad de nadie. Debería ser infraestructura pública, auditable, y construida con los mismos estándares de rigor y transparencia que esperamos de cualquier otro proceso de interés democrático. VotoAFin es un paso pequeño pero concreto en esa dirección.

---

## 10. Bibliografía

### Libros y monografías

Garzia, D. y Marschall, S. (Eds.) (2014). *Matching Voters with Parties and Candidates: Voting Advice Applications in Comparative Perspective*. ECPR Press.

Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.

Martin, R. C. (2002). *Agile Software Development, Principles, Patterns, and Practices*. Prentice Hall.

Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.

Norman, D. A. (2013). *The Design of Everyday Things* (Revised and Expanded Edition). Basic Books.

Power, D. J. (2002). *Decision Support Systems: Concepts and Resources for Managers*. Quorum Books.

Ricci, F., Rokach, L. y Shapira, B. (Eds.) (2011). *Recommender Systems Handbook*. Springer.

Hunt, A. y Thomas, D. (1999). *The Pragmatic Programmer: From Journeyman to Master*. Addison-Wesley.

Beck, K. (2000). *Extreme Programming Explained: Embrace Change*. Addison-Wesley.

Cohn, M. (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley.

Cockburn, A. (2005). *Hexagonal Architecture*. Disponible en: https://alistair.cockburn.us/hexagonal-architecture/

### Artículos académicos

Marschall, S. y Schmidt, C. K. (2010). The impact of Voting Indicator Applications on voters' decision-making. *Politische Vierteljahresschrift*, 51(3), 495–516.

Ruusuvirta, O. y Rosema, M. (2009). Do online vote selectors influence electoral participation and the direction of the vote? *Ponencia presentada en la Conferencia Anual de la Asociación de Estudios Electorales del Reino Unido*, Manchester.

Walgrave, S., Nuytemans, M. y Pepermans, K. (2009). Voting aid applications and the effect of VAAs on party preference formation. *Acta Politica*, 44(3), 214–226.

Fivaz, J. y Nadig, G. (2010). Impact of Voting Advice Applications (VAAs) on voter turnout and their potential use for civic education. *Policy y Internet*, 2(4), 167–200.

Mahéo, V.-A. y Gauvin, J.-F. (2018). Partisan cues and attitude change: evidence from a Vote Advice Application. *Political Communication*, 35(3), 465–483.

### Informes y documentos institucionales

Activa Knowledge for Action. (2023). *Fake News y Desinformación en Chile y LatAm*. Santiago: Activa Research.

Ipsos Chile. (2024). *Claves Ipsos N°33: Conocimiento y preparación del electorado para las elecciones municipales de octubre 2024*. Santiago: Ipsos.

Servicio Electoral de Chile (SERVEL). (2024). *Informe de participación y calidad del voto — Elecciones municipales y regionales 2024*. Santiago: SERVEL.

Servicio Electoral de Chile (SERVEL). (2023). *Resultados del plebiscito constitucional de diciembre de 2023*. Santiago: SERVEL.

PNUD Chile. (2024). *Informe de participación ciudadana en procesos electorales 2020-2024*. Santiago: PNUD.

### Estándares técnicos y especificaciones

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. Recuperado de: https://www.w3.org/TR/WCAG22/

Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* [Tesis doctoral]. University of California, Irvine.

OpenAPI Initiative. (2021). *OpenAPI Specification 3.1.0*. Recuperado de: https://spec.openapis.org/oas/latest.html

Heroku. (2011). *The Twelve-Factor App*. Recuperado de: https://12factor.net

Peters, T. (2004). *PEP 20 — The Zen of Python*. Python.org. Recuperado de: https://peps.python.org/pep-0020/

### Fuentes sobre VAAs y plataformas comparadas

ProDemos. (2024). *StemWijzer: Methodologie en verantwoording*. Den Haag: ProDemos. Recuperado de: https://www.stemwijzer.nl

Bundeszentrale für politische Bildung (BpB). (2024). *Wahl-O-Mat: Wissenschaftliche Begleitung*. Bonn: BpB. Recuperado de: https://www.wahl-o-mat.de

Politools. (2024). *Smartvote: Methodology*. Zurich: Politools. Recuperado de: https://www.smartvote.ch

Vote Compass. (2024). *Vote Compass: Methodology*. Recuperado de: https://votecompass.com

iSideWith. (2024). *How iSideWith Works*. Recuperado de: https://www.isidewith.com

### Fuentes del proyecto

Castillo, J., De Lima, P. y Sánchez, A. (2024a). *Desinformación en los Procesos Electorales* [Trabajo de Emprendimiento I]. Universidad Técnica Federico Santa María, Valparaíso.

Castillo, J., De Lima, P. y Sánchez, A. (2024b). *Desinterés en los Procesos Electorales* [Trabajo de Emprendimiento II]. Universidad Técnica Federico Santa María, Valparaíso.

Castillo, J. (2026). *Historia y Evolución del Proyecto VotoAFin*. Repositorio GitHub: whatebria/tinder-decisivo. Recuperado de: https://github.com/whatebria/tinder-decisivo

Castillo, J. (2026). *Comparación con VAAs Internacionales — VotoAFin*. Repositorio GitHub: whatebria/tinder-decisivo.

---

*Documento generado como borrador académico de tesis de pregrado en Ingeniería en Informática.*  
*Universidad Técnica Federico Santa María — Agosto 2026.*  
*Autora: Jenifer Castillo*
