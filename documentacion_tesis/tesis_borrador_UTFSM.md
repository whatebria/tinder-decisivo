---
título: Asimetría de información electoral y toma de decisiones asistida — Diseño e implementación de una aplicación de asesoramiento electoral para el contexto chileno
autora: Jenifer Castillo
universidad: Universidad Técnica Federico Santa María
carrera: Ingeniería en Informática
estado: Borrador v1.0
fecha: Agosto 2026
---

&nbsp;

---

<div align="center">

**UNIVERSIDAD TÉCNICA FEDERICO SANTA MARÍA**

Departamento de Informática

Carrera de Ingeniería en Informática

&nbsp;

&nbsp;

# Asimetría de información electoral y toma de decisiones asistida

## Diseño e implementación de una aplicación de asesoramiento electoral para el contexto chileno

&nbsp;

&nbsp;

**Autora:** Jenifer Castillo

**Profesor(a) guía:** [Nombre del profesor guía]

**Comisión evaluadora:** [Nombres de la comisión]

&nbsp;

*Trabajo de Titulación presentado en conformidad a los requisitos para optar al grado de Ingeniera en Informática*

&nbsp;

Valparaíso, Chile — Agosto 2026

</div>

---

## Resumen Ejecutivo

El presente trabajo describe el proceso de ingeniería aplicado al diseño e implementación de *VotoAFin*, una aplicación web progresiva y móvil multiplataforma que actúa como Voting Advice Application (VAA) para el contexto electoral chileno. Una VAA es una herramienta digital que compara las preferencias declaradas del votante con las posiciones programáticas de los candidatos, entregando un ranking de afinidad cuantificado con criterios transparentes y auditables.

Chile enfrenta un problema estructural de asimetría de información electoral: el votante toma decisiones de alta relevancia colectiva con información fragmentada, de baja calidad o directamente manipulada. Los programas oficiales de candidaturas superan con frecuencia las doscientas páginas por postulante, la cobertura mediática privilegia controversias sobre propuestas, la desinformación circula activamente en redes sociales y plataformas de mensajería, y los intentos previos de construir herramientas comparativas en Chile han sido discontinuos, de alcance limitado y sin publicación de sus algoritmos de matching.

La solución propuesta aborda este vacío mediante cuatro de de diseño centrales: un algoritmo de matching cuadrático ponderado, documentado completamente en la propia documentación del proyecto; una opción explícita de *no sé* que se excluye del cálculo en lugar de tratarse como posición neutral ficticia; un indicador de confianza que contextualiza el porcentaje de afinidad según el número de preguntas efectivamente respondidas; y publicación del código fuente bajo licencia AGPL-3.0, garantizando que cualquier despliegue público de una versión modificada deba compartir sus cambios.

El sistema se construyó en ocho fases iterativas a lo largo de aproximadamente ocho meses, con validación continua mediante pruebas automatizadas, auditorías de código y revisión de accesibilidad WCAG 2.2 nivel AA. Técnicamente, el backend utiliza Django con Django REST Framework y expone su API bajo contrato OpenAPI 3.1; el frontend usa React Native con Expo para despliegue simultáneo en web, iOS y Android desde un único codebase. Un modelo territorial polimórfico representa las dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas del país, permitiendo filtrar automáticamente los candidatos relevantes según la ubicación del votante.

El proyecto demuestra que es posible construir infraestructura cívica digital de calidad profesional con recursos limitados, aplicando disciplinadamente principios canónicos de ingeniería de software. Las limitaciones actuales — principalmente la ausencia de validación empírica con usuarios reales y la necesidad de curaduría formal del dataset de posturas — están documentadas con precisión y constituyen el camino natural hacia un despliegue público productivo.

**Palabras clave:** Voting Advice Application; asesoramiento electoral; asimetría de información; algoritmo de matching; modelo territorial polimórfico; accesibilidad WCAG; aplicaciones multiplataforma; Chile; desinformación electoral; ingeniería cívica.

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

### 1.1 Contexto general

Chile es uno de los países de América Latina con mayor densidad de procesos electorales por ciudadano. En el transcurso de una sola década, un votante habilitado puede enfrentar presidenciales, parlamentarias, municipales, regionales, plebiscitos constitucionales y eventualmente segundas vueltas. Cada uno de estos procesos exige una decisión de voto independiente, frecuentemente sobre candidatos distintos para cada nivel: un mismo ciudadano elige presidente, diputado de su distrito, alcalde de su comuna, y consejeros regionales con listas independientes por nivel.

Esta densidad electoral convierte al votante informado en un agente con necesidades de información extraordinariamente altas. Comprender las propuestas de seis candidatos presidenciales implica procesar más de mil doscientas páginas de texto heterogéneo entre programas oficiales, declaraciones públicas y debates televisivos. Hacer lo mismo para la candidatura parlamentaria del distrito propio — donde puede haber entre ocho y quince candidatos — añade otra carga informativa que pocas personas están en condiciones de absorber sistemáticamente.

La reintroducción del voto obligatorio en Chile mediante la Ley N° 21.533 de 2022 expandió significativamente el electorado activo, incorporando segmentos que históricamente no habían participado: jóvenes votando por primera vez, personas de sectores socioeconómicos con menor acceso histórico a información política estructurada, y ciudadanos desconectados de los medios tradicionales de comunicación política. Este contexto amplió el rango de perfiles de votante y, con ello, la diversidad de necesidades informativas que el ecosistema electoral debería satisfacer.

### 1.2 Motivación

La motivación de este proyecto nace de una observación concreta: la brecha entre las necesidades informativas descritas y la calidad de las herramientas disponibles para satisfacerlas en el contexto chileno es, técnicamente, innecesaria. El estado del arte en desarrollo de software — frameworks multiplataforma, contratos API automatizados, modelos de datos relacionales — permite construir herramientas de asesoramiento electoral de calidad profesional con recursos acotados. La brecha no es tecnológica; es de asignación de esfuerzo institucional.

Internacionalmente, las Voting Advice Applications llevan más de tres décadas operando en contextos europeos con impacto electoral documentado. En Alemania, *Wahl-O-Mat* registra entre dieciocho y veintiún millones de consultas por elección federal. En los Países Bajos, *StemWijzer* movilizó a segmentos de votantes que declaraban no haber decidido previamente su voto. En Chile, por contraste, los intentos de construir herramientas equivalentes han sido intermitentes, de alcance restringido y sin continuidad entre ciclos electorales.

El presente trabajo surge de la convicción de que demostrar la viabilidad técnica de esta clase de infraestructura cívica — con código abierto, algoritmo documentado y criterios de accesibilidad — constituye un aporte concreto al ecosistema democrático chileno, independientemente de los ciclos de adopción institucional que puedan seguir.

### 1.3 Relevancia del problema

La relevancia del problema se justifica desde tres perspectivas complementarias.

Desde la perspectiva democrática, la calidad de la decisión electoral depende de la calidad de la información disponible. Encuestas del Centro de Estudios Públicos y mediciones de Latinobarómetro documentan sistemáticamente que un porcentaje significativo del electorado chileno no conoce las propuestas específicas de los candidatos por quienes vota. Las decisiones tomadas con información asimétrica no reflejan necesariamente las preferencias reales del votante, comprometiendo la representatividad del resultado electoral.

Desde la perspectiva tecnológica, la penetración de smartphones en Chile supera el setenta por ciento de la población adulta, y el consumo de información política por canales digitales y móviles ha desplazado progresivamente a los medios tradicionales como fuente principal. En este contexto, la ausencia de herramientas digitales comparativas de calidad deja ese espacio ocupado por fuentes no estructuradas — redes sociales, mensajería, sitios no verificados — que operan sin criterios de rigor editorial.

Desde la perspectiva de la ingeniería de software, el problema es tecnológicamente resoluble con herramientas maduras y metodologías probadas. Existen patrones de diseño establecidos, frameworks estables y literatura académica suficiente sobre algoritmos de matching político para construir una solución robusta. La ausencia de esa solución en el contexto chileno no refleja una limitación técnica; refleja una oportunidad de ingeniería pendiente.

### 1.4 Problemática central

El problema central que motiva este trabajo es la ausencia, en el ecosistema digital chileno, de una herramienta de asesoramiento electoral que cumpla simultáneamente cinco características: algoritmo de matching documentado y auditable, transparencia en las posturas asignadas a cada candidato con fuentes verificables, cobertura territorial multi-nivel (nacional, distrital y comunal), continuidad operativa entre ciclos electorales, y accesibilidad conforme a estándares internacionales.

Los intentos previos — *Decide Chile*, *Vota Inteligente*, *Votamos Todos* y *Voto Informado* — han cumplido una o dos de estas características, pero ninguno las ha integrado en un único sistema sostenible. El resultado es que cada ciclo electoral encuentra a los votantes chilenos en la misma situación de partida, sin herramientas comparativas confiables y sin capital acumulado de experiencias previas.

### 1.5 Visión general de la solución

*VotoAFin* propone resolver esta brecha mediante una aplicación que pregunta al votante su opinión sobre políticas públicas concretas, organizadas en siete ejes temáticos — Economía, Sociedad, Ambiente, Seguridad, Derechos Humanos, Política Internacional y Reforma Institucional — y compara sistemáticamente esas respuestas con las posturas documentadas de los candidatos en competencia.

El resultado no es una recomendación de voto, sino un ranking de afinidad con criterios explícitos: qué tan alineadas están las posiciones del votante con las de cada candidato, desglosado por eje temático, con fuentes primarias consultables y con un indicador de confianza que contextualiza la solidez del resultado. El votante mantiene plena autonomía de decisión; la herramienta aporta estructura informativa donde antes no existía ninguna.

---

## 2. Definición del Problema

### 2.1 Situación actual del ecosistema de información electoral en Chile

El votante chileno enfrenta una estructura de fuentes de información altamente fragmentada. El canal institucional oficial — el Servicio Electoral de Chile (SERVEL) — publica los programas de candidaturas en formato PDF, sin estructura comparativa y sin personalización según los intereses específicos del votante. La cobertura mediática de televisión abierta y prensa escrita produce síntesis de propuestas, pero opera bajo lógicas editoriales que privilegian el conflicto y la controversia sobre la comparación sistemática de posiciones programáticas.

Las redes sociales y plataformas de mensajería instantánea han ocupado el espacio que los medios tradicionales han dejado vacante como fuentes de información electoral para segmentos jóvenes y digitales. En ese ecosistema, la información no verificada circula con la misma velocidad y visibilidad que la verificada, y los verificadores de hechos chilenos — *Fast Check CL* y *Mala Espina Check* — documentan ciclo tras ciclo la circulación masiva de afirmaciones falsas sobre propuestas de candidatos.

Este panorama no es exclusivo de Chile: la saturación informativa, la polarización afectiva y la desinformación organizada son fenómenos documentados en múltiples democracias contemporáneas. Sin embargo, el contexto chileno presenta particularidades que agravan el problema: la alta densidad de procesos electorales simultáneos, la reciente incorporación de un electorado masivo sin experiencia previa de votación, y la ausencia de instituciones que mantengan infraestructura comparativa entre ciclos.

### 2.2 Quiénes tienen el problema

El problema afecta al conjunto del electorado habilitado, con distintas intensidades según el perfil del votante.

Los votantes con interés activo en comparar propuestas reconocen el problema con claridad: invierten tiempo en lecturas dispersas que raramente alcanzan a cubrir todas las candidaturas y todos los niveles electorales. Los votantes sin experiencia previa de voto — especialmente los incorporados por el retorno del voto obligatorio — carecen del capital político acumulado que permite orientar decisiones en ausencia de información estructurada. Los votantes desconfiados del sistema político tienden a abandonar la búsqueda activa de información programática por saturación, votando por adhesión identitaria o imagen antes que por convergencia programática.

Los votantes con discapacidad visual o motriz encuentran adicionalmente barreras de acceso en los formatos tradicionales de información electoral — PDFs sin accesibilidad, sitios sin navegación por teclado, videos sin subtítulos. Los votantes fuera de los grandes centros urbanos ven cómo las candidaturas parlamentarias y municipales locales reciben cobertura mediática significativamente menor que las presidenciales, amplificando la asimetría informativa.

### 2.3 Dificultades concretas del ecosistema actual

Se identifican seis categorías de dificultades concretas en el ecosistema actual de información electoral en Chile.

**Sobrecarga informativa.** Los programas de candidaturas presidenciales alcanzan extensiones de doscientas a cuatrocientas páginas por candidato. Un votante que quisiera leer todos los programas presidenciales en un ciclo electoral debería procesar más de mil páginas de texto heterogéneo antes de poder comparar posiciones. Esta carga es incompatible con las disponibilidades horarias reales del votante promedio.

**Desinformación organizada.** Los verificadores de hechos chilenos documentan sistemáticamente la circulación de información falsa sobre propuestas de candidatos en WhatsApp, Facebook, Twitter/X e Instagram. La desinformación electoral no es un fenómeno marginal sino una estrategia comunicacional activa durante los ciclos electorales, que compite directamente con las fuentes verificadas en alcance y velocidad de circulación.

**Fragmentación territorial.** La cobertura mediática se concentra desproporcionadamente en la elección presidencial, dejando las candidaturas parlamentarias distritales y municipales con menor visibilidad. Sin embargo, el impacto de un alcalde o un diputado sobre la vida cotidiana del ciudadano es frecuentemente más directo que el del presidente.

**Opacidad algorítmica.** Los intentos previos de herramientas de matching electoral en Chile no han publicado sus algoritmos, imposibilitando la auditoría independiente de su mecanismo de recomendación. Un porcentaje de afinidad sin algoritmo publicado no es más que un número sin respaldo verificable.

**Discontinuidad entre ciclos.** Las iniciativas de asesoramiento electoral chilenas se han activado para un ciclo específico y luego han sido abandonadas, perdiendo el capital técnico y de datos acumulado y obligando a comenzar desde cero en cada elección.

**Ausencia de multi-elección.** Las herramientas existentes han cubierto mayoritariamente la elección presidencial, ignorando que el votante necesita orientación simultánea para presidencial, parlamentaria y municipal.

### 2.4 Impacto sobre los usuarios

El impacto del problema opera en tres niveles.

En el plano individual, el votante toma decisiones que no necesariamente reflejan sus preferencias reales sobre políticas públicas concretas. La adhesión partidaria heredada, la imagen del candidato y el rechazo emocional reemplazan a la comparación programática cuando la información estructurada no está disponible o es difícil de acceder.

En el plano comunitario, la ausencia de una fuente comparativa común dificulta la deliberación colectiva. Los debates familiares, laborales o educativos sobre candidaturas carecen de un referente de datos compartido, lo que aumenta la polarización afectiva y reduce la calidad del intercambio.

En el plano sistémico, la representatividad democrática se ve comprometida cuando las decisiones electorales se toman con información asimétrica: los electos no siempre reflejan las mayorías programáticas del electorado, sino las mayorías de reacción a los estímulos comunicacionales del ciclo. Esto contribuye al círculo vicioso de desconfianza institucional documentado en Chile por mediciones sucesivas del Centro de Estudios Públicos.

### 2.5 Por qué el problema merece ser abordado

El problema merece atención por tres razones concurrentes.

Es tecnológicamente resoluble. El estado del arte en ingeniería de software, diseño de producto digital y desarrollo multiplataforma permite construir una herramienta de asesoramiento electoral de calidad profesional con recursos limitados. No existe barrera técnica que justifique la ausencia de esta infraestructura en Chile; es una brecha de voluntad institucional y asignación de esfuerzo.

Es socialmente relevante. Herramientas comparativas bien diseñadas tienen efectos documentados sobre la participación electoral y la coherencia entre preferencias del votante y decisión de voto. Treinta años de investigación politológica sobre VAAs en Europa demuestran que estas aplicaciones son capaces de reducir la asimetría informativa de manera medible y de movilizar segmentos del electorado que de otra forma no participarían activamente en la deliberación programática.

Es políticamente neutro cuando está bien diseñado. Una herramienta que documenta públicamente su algoritmo, publica las posturas de todos los candidatos con sus fuentes verificables, y no tiene financiamiento partidario ni agenda editorial, puede ser percibida como recurso útil por votantes de todo el espectro ideológico. La neutralidad no es un marketing; es una propiedad de diseño que se garantiza con código abierto y auditoría pública.

---

## 3. Propuesta de Solución

### 3.1 Concepto general

Se propone el diseño e implementación de una Voting Advice Application para Chile que permita al votante comparar sus preferencias de política pública con las posiciones documentadas de los candidatos mediante un algoritmo de matching cuadrático ponderado, completamente documentado y auditable.

La aplicación no asesora sobre por quién votar. Entrega información estructurada sobre grado de afinidad programática, desglosada por eje temático, con fuentes primarias consultables y con un indicador de confianza que contextualiza la solidez del resultado. La decisión de voto permanece íntegramente en el votante.

### 3.2 Propuesta de valor

La propuesta de valor se articula en cinco dimensiones diferenciadas respecto de las alternativas existentes.

**Transparencia algorítmica.** El mecanismo de cálculo del porcentaje de afinidad se documenta completamente en la documentación del proyecto. El votante — o cualquier investigador o periodista — puede verificar que la fórmula es la declarada y que no hay parámetros ocultos que favorezcan a candidatos específicos.

**Honestidad epistemológica.** La opción *no sé / prefiero no responder* se excluye del cálculo en lugar de tratarse como posición neutral. Esto respeta la incertidumbre real del votante y produce resultados más precisos para las preguntas efectivamente respondidas. El indicador de confianza complementa esto: un porcentaje basado en tres preguntas se presenta con confianza *tentativa*, distinguiéndolo de uno basado en diez preguntas con confianza *alta*.

**Cobertura territorial completa.** El modelo de dominio representa las dieciséis regiones, veintiocho distritos electorales y trescientas cuarenta y seis comunas del país mediante una estructura polimórfica que filtra automáticamente los candidatos relevantes según la ubicación declarada del votante. Un ciudadano de Ñuñoa ve candidatos presidenciales (scope nacional), diputados del Distrito 10 (scope distrital) y alcalde de Ñuñoa (scope comunal), todo en una misma sesión.

**Multi-elección.** La aplicación soporta simultáneamente múltiples tipos de elección desde un único backend, con preguntas transversales que el usuario responde una sola vez y preguntas específicas por proceso electoral. Esto refleja la realidad del votante chileno, que raramente decide sobre una sola elección.

**Código abierto.** El proyecto se publica bajo licencia AGPL-3.0, garantizando que cualquier despliegue público de una versión modificada deba compartir sus cambios. Esto alinea la solución con la visión de la tecnología electoral como infraestructura de interés público.

### 3.3 Público objetivo

El público objetivo primario es el votante chileno habilitado, con énfasis en tres segmentos: votantes de primera vez sin capital político previo que necesitan referentes explícitos para organizar su decisión; votantes con interés comparativo pero tiempo limitado que buscan síntesis eficiente en lugar de lectura exhaustiva; y votantes digitales que consumen información principalmente por canales móviles y desconfían de medios tradicionales.

El público secundario incluye periodistas y comunicadores políticos que buscan fuentes comparativas verificadas, equipos de investigación electoral interesados en datos agregados anonimizados, docentes que trabajan participación ciudadana en aulas, y organizaciones de sociedad civil interesadas en educación cívica. El código abierto adiciona un tercer público: equipos técnicos de otros países o regiones que podrían adaptar la plataforma a sus propios contextos electorales.

### 3.4 Beneficios esperados

Los beneficios esperados se distribuyen en tres horizontes temporales.

A corto plazo, el votante accede a un ranking de afinidad con criterios explícitos y verificables para su proceso electoral inmediato, reduciendo el tiempo de comparación de candidaturas de horas a cinco o diez minutos por elección activa. La herramienta no garantiza una mejor decisión — eso depende de la calidad del cuestionario y de la veracidad de las posturas — pero sí garantiza una decisión más informada respecto de las alternativas disponibles.

A mediano plazo, la persistencia de preferencias del usuario entre ciclos permite al votante acumular su propio historial político y comparar cómo sus prioridades han evolucionado entre elecciones. Para el ecosistema cívico, la disponibilidad de una fuente comparativa común puede mejorar la calidad de la deliberación en espacios familiares, laborales y educativos.

A largo plazo, la acumulación de datos agregados y anonimizados sobre coherencia entre preferencias del electorado y posiciones de candidatos electos abre líneas de investigación politológica sobre representatividad y rendición de cuentas. El modelo de código abierto además permite que la inversión técnica de este proyecto sea reutilizada por iniciativas similares en otras regiones o países.

---

## 4. Objetivos

### 4.1 Objetivo General

Diseñar e implementar una aplicación web progresiva y móvil multiplataforma de asesoramiento electoral para el contexto chileno, que permita al ciudadano comparar sus preferencias de política pública con las posiciones declaradas de los candidatos mediante un algoritmo de matching cuadrático ponderado, transparente y auditable, cumpliendo con las pautas de accesibilidad WCAG 2.2 nivel AA y con cobertura multi-elección y territorial completa del sistema electoral chileno.

### 4.2 Objetivos Específicos

1. Realizar una investigación sistemática del estado del arte de las Voting Advice Applications a nivel internacional y nacional para identificar las dimensiones comparativas relevantes, las debilidades de los sistemas existentes y los requisitos específicos del contexto chileno.

2. Diseñar un modelo de dominio que represente adecuadamente la estructura territorial del sistema electoral chileno — sus dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas — mediante una abstracción polimórfica que permita filtrar automáticamente los candidatos relevantes según la ubicación declarada del usuario.

3. Implementar un algoritmo de matching cuadrático ponderado que maneje respuestas en escala Likert de cinco puntos, ponderación por importancia en cuatro niveles, exclusión explícita de respuestas *no sé* del cálculo, nivel de confianza según número de preguntas efectivamente consideradas, y desglose del resultado por eje temático.

4. Construir una interfaz de usuario centrada en el ciudadano, siguiendo la metodología Atomic Design, con soporte para web, iOS y Android desde un único codebase, y cumplimiento con las pautas de accesibilidad WCAG 2.2 nivel AA.

5. Establecer un contrato de API bajo el estándar OpenAPI 3.1 como fuente única de verdad entre el backend y el frontend, con generación automática de tipos TypeScript para garantizar consistencia entre las expectativas del cliente y las respuestas del servidor.

6. Publicar el código fuente del sistema bajo licencia AGPL-3.0 con documentación suficiente para que terceros puedan auditar el algoritmo de matching, comprender la arquitectura del sistema y contribuir al desarrollo o adaptar la solución a otros contextos.

7. Validar el sistema mediante una suite de pruebas automatizadas que cubra el algoritmo de matching en sus variantes principales, el filtrado territorial, los flujos de autenticación, la ingesta de datos y la persistencia de resultados.

---

## 5. Metodología

### 5.1 Enfoque general

El proyecto se desarrolla bajo un enfoque iterativo e incremental, con sprints definidos por objetivo de valor entregado en lugar de duración fija. Este enfoque se diferencia del modelo en cascada tradicional — donde los requerimientos se congelan antes del desarrollo — y del Scrum estricto con ceremonias formales y sprints de duración fija. Se aproxima más al espíritu de Extreme Programming (Beck, 1999) en cuanto al ritmo de iteración y a la validación continua del trabajo.

La elección se justifica por tres razones. Primera, el dominio del problema — diseño de herramientas cívicas digitales — requiere validación frecuente de las decisiones de diseño contra la realidad del proyecto, ya que los requerimientos no son estáticos sino que evolucionan a medida que la investigación del estado del arte y las pruebas técnicas revelan complejidades no anticipadas. Segunda, el equipo de desarrollo es individual, lo que hace innecesarios los mecanismos de coordinación que Scrum optimiza para equipos multi-persona. Tercera, el alcance del proyecto está acotado por el formato de tesis de pregrado, lo que requiere una disciplina estricta de priorización continua que el principio YAGNI (Beck, 1999) formaliza.

El ciclo de trabajo en cada sprint sigue el patrón: **objetivo claro → implementación → validación técnica (pruebas + compilación TypeScript) → commit con mensaje descriptivo**. La validación técnica es un requisito de integración: ningún sprint cierra sin que la suite de pruebas esté en verde y el compilador TypeScript no reporte errores.

### 5.2 Principios de ingeniería aplicados

Cuatro principios canónicos de ingeniería de software estructuran las decisiones del proyecto a lo largo de su desarrollo.

**DRY (Don't Repeat Yourself)** (Hunt & Thomas, 1999) guía la eliminación activa de duplicación. Cuando la lógica de cálculo de colores según el porcentaje de match apareció replicada en múltiples pantallas del frontend, se extrajo hacia un módulo de servicios compartido. Cuando la lógica de matching apareció repetida entre variantes autenticada y anónima, se refactorizó hacia un servicio de dominio sin dependencias de HTTP.

**YAGNI (You Aren't Gonna Need It)** (Beck, 1999) opera como filtro de scope. Cada feature propuesta debe justificar su necesidad antes de implementarse. La aplicación retroactiva de este principio llevó a eliminar el flujo de interfaz tipo swipe, que era entretenido pero incompatible con los requerimientos del algoritmo, y el módulo de decisión final, que había sido implementado sin casos de uso reales demostrados.

**SOLID** (Martin, 2017) estructura la arquitectura del backend. El Principio de Responsabilidad Única (S) se refleja en la separación de modelos, vistas, serializadores y servicios en módulos independientes por dominio. El Principio Abierto/Cerrado (O) se aplica en el diseño del algoritmo: agregar un nuevo eje temático no requiere modificar el servicio de cálculo porque éste lee los ejes dinámicamente desde la base de datos.

**Twelve-Factor App** (Wiggins, 2011) orienta las decisiones operacionales: configuración mediante variables de entorno, dependencias explícitas declaradas en archivos de bloqueo, procesos sin estado, y separación clara entre código y datos.

### 5.3 Fases del proyecto

El proyecto se organizó en ocho fases sucesivas con solapamientos parciales.

| Fase | Actividad principal | Entregable clave |
|:----:|---------------------|------------------|
| 0 | Investigación y análisis del estado del arte | Análisis comparativo de 9 VAAs internacionales + 4 iniciativas chilenas |
| 1 | Diseño de arquitectura y contrato API inicial | Modelo de dominio inicial, primer schema OpenAPI |
| 2 | Implementación del MVP | Flujo end-to-end funcional desde registro hasta resultados |
| 3 | Auditoría de código y refactorización | Resolución de 4 hallazgos críticos de seguridad + 6 de alta severidad |
| 4 | Expansión territorial y multi-elección | Modelo territorial polimórfico, preguntas base transversales |
| 5 | Simplificación YAGNI | Eliminación de componentes sin uso práctico demostrado |
| 6 | Sistema de diseño y accesibilidad | Sistema de diseño con showcase interno, auditoría WCAG 2.2 AA |
| 7 | Documentación y tesis | Documentación técnica y accesible, este documento |

La duración total estimada es de treinta y dos semanas, equivalentes a aproximadamente ocho meses de trabajo con dedicación de tesis.

### 5.4 Levantamiento de requerimientos

Los requerimientos del sistema se levantaron desde tres fuentes complementarias.

La primera fuente fue la revisión sistemática de literatura politológica sobre VAAs — particularmente Garzia y Marschall (2014) y Cedroni y Garzia (2010) — que identificó las dimensiones de diseño que la investigación académica ha asociado con mayor impacto en la calidad del matching y la utilidad percibida por el votante.

La segunda fue el análisis comparativo de nueve VAAs internacionales y cuatro iniciativas chilenas, organizado en doce dimensiones de evaluación: escala de respuestas, ponderación por importancia, número de preguntas, origen y verificabilidad de las posturas, visualización de resultados, explicabilidad, código abierto, modelo de financiamiento, entre otras. Este análisis identificó las características que las alternativas existentes no satisfacen en el contexto chileno.

La tercera fue el análisis del sistema electoral chileno, especialmente su estructura territorial con dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas, y la multiplicidad de procesos electorales simultáneos que debe cubrir una herramienta que aspire a ser útil durante el ciclo completo de decisiones del votante.

### 5.5 Validación

La validación del sistema se abordó desde cinco dimensiones: pruebas automatizadas del algoritmo con casos de salida matemáticamente conocida, pruebas del sistema territorial con verificación de filtrado por scope, pruebas de integración de los flujos de autenticación e ingesta de datos, revisión de accesibilidad WCAG 2.2 AA mediante auditoría automatizada y revisión manual, y dos rondas de auditoría interna de código.

Se reconoce explícitamente que la validación no incluyó pruebas empíricas con usuarios reales, evaluación de accesibilidad con personas con discapacidad, ni medición del impacto en decisiones de voto efectivas. Estas dimensiones quedan como deuda documentada y trabajo futuro prioritario.

---

## 6. Marco Teórico

### 6.1 Voting Advice Applications — concepto y caracterización

Una Voting Advice Application (VAA) es una herramienta digital que compara las preferencias declaradas del votante con las posiciones programáticas de partidos o candidatos, entregando un ranking de afinidad cuantificado y, en algunos sistemas, visualizaciones complementarias como radares por dimensión temática o mapas bidimensionales de posicionamiento ideológico.

El término fue acuñado formalmente por la investigación politológica europea para distinguir esta clase de aplicaciones de las guías electorales tradicionales — que presentan información sobre candidatos sin comparación personalizada — y de los sistemas de apoyo a la decisión en sentido amplio. La distinción central es la personalización algorítmica: la herramienta entrega un resultado específico para cada usuario en función de sus respuestas, no un directorio genérico de candidaturas.

Las VAAs comparten cuatro componentes estructurales: un cuestionario de afirmaciones o preguntas sobre políticas públicas; un conjunto de respuestas de partidos o candidatos a las mismas afirmaciones; un algoritmo de comparación que calcula la distancia entre la respuesta del usuario y las de cada candidato; y una interfaz de resultados que presenta esa comparación de manera comprensible.

La literatura politológica ha estudiado extensamente el impacto de las VAAs sobre la participación electoral y la formación de preferencias. Walgrave et al. (2008) estimaron que el uso de *Vote Test* en Bélgica en 2004 influyó en el voto de entre el 2% y el 6% de sus usuarios. Marschall (2005) documentó que *Wahl-O-Mat* contribuye a movilizar a votantes que declaraban no haber decidido su voto antes de usar la herramienta. Garzia y Marschall (2014) compilaron evidencia comparativa de múltiples contextos europeos sobre efectos en participación, dirección del voto y reducción de la asimetría informativa.

### 6.2 Algoritmos de matching político

El algoritmo de matching es el componente técnico central de cualquier VAA. Su diseño determina qué significa *afinidad* y cómo se cuantifica, decisiones con consecuencias directas sobre la experiencia del usuario y la validez de las recomendaciones.

La variante más simple es la distancia Manhattan o proximidad lineal: la diferencia absoluta entre la posición del usuario y la del candidato en cada pregunta se suma y se normaliza. Esta variante es transparente e intuitiva pero tiene una propiedad semánticamente discutible: trata las diferencias pequeñas y las grandes como linealmente proporcionales, sin penalizar con mayor severidad los desacuerdos extremos.

La variante cuadrática o euclidiana penaliza las diferencias con intensidad creciente: una diferencia de dos puntos en una escala de cinco no es simplemente el doble de grave que una diferencia de un punto, sino que su penalización es cuatriplica. Esto refleja mejor la intuición política de que dos personas que están *casi* de acuerdo se parecen mucho más que dos personas que están *a medias*, y dos personas *opuestas* no son simplemente la suma de cuatro diferencias de un punto.

La ponderación por importancia permite al usuario indicar qué temas le importan más, multiplicando el score de cada pregunta por un factor que refleja la prioridad declarada. Sin ponderación, una pregunta sobre reforma institucional tiene el mismo peso que una sobre sistema de pensiones, lo que puede producir recomendaciones incoherentes para usuarios con prioridades temáticas específicas.

La gestión de la ignorancia o indecisión del votante es un desafío de diseño relevante. Forzar al usuario a elegir una posición cuando genuinamente no tiene opinión introduce ruido en el cálculo. La exclusión de la pregunta del denominador — no solo del numerador — cuando el usuario responde *no sé* produce resultados más precisos para las preguntas efectivamente respondidas, a costa de un menor número de preguntas consideradas, situación que el indicador de confianza debe transparentar.

El indicador de confianza es una contribución de diseño que contextualiza la autoridad del resultado. Un porcentaje de afinidad del 78% basado en tres preguntas merece ser interpretado de manera diferente que uno basado en doce. Sin este indicador, el votante puede sobreestimar la solidez de un resultado construido sobre información parcial.

### 6.3 Experiencia de usuario en contextos cívicos

El diseño de interfaces para aplicaciones cívicas opera bajo restricciones distintas a las del diseño para plataformas comerciales. El objetivo no es maximizar el tiempo de sesión ni el engagement de retorno; es informar con precisión y luego dejar que el usuario se retire con criterios sólidos para su decisión.

Esta diferencia de objetivos tiene consecuencias sobre las decisiones de diseño. Los patrones de diseño persuasivos que funcionan en contextos comerciales — scrolls infinitos, gamificación, notificaciones de urgencia — son contraproducentes en una herramienta cívica porque pueden generar dependencia innecesaria o sesgar la percepción del usuario sobre la autoridad de los resultados.

La metodología Atomic Design de Frost (2016) proporciona un marco para organizar la interfaz en componentes reutilizables y jerárquicos: átomos (elementos básicos sin composición interna), moléculas (combinaciones de átomos con función propia), organismos (componentes de interfaz complejos), plantillas (layouts sin contenido real) y pantallas (instancias de plantillas con contenido real). Este enfoque facilita la consistencia visual, la mantenibilidad del código de interfaz y la construcción de un sistema de diseño documentado.

Las pautas WCAG 2.2 nivel AA del W3C (2023) definen criterios de éxito de accesibilidad en cuatro principios: perceptibilidad (la información debe ser presentable a los usuarios de maneras que puedan percibir), operabilidad (los componentes de la interfaz deben ser operables), comprensibilidad (la información y la operación de la interfaz deben ser comprensibles) y robustez (el contenido debe ser suficientemente robusto para ser interpretado de manera confiable por tecnologías asistivas). Para una herramienta cívica que aspira a servir al electorado completo, el cumplimiento de estos criterios no es opcional.

### 6.4 Sistemas de recomendación y toma de decisiones asistida

Las VAAs se sitúan dentro del campo más amplio de los sistemas de recomendación, pero se diferencian en características que tienen consecuencias importantes para su diseño.

Los sistemas de recomendación comerciales — plataformas de streaming, comercio electrónico — operan con retroalimentación implícita (historial de compras, reproducciones, clics) y optimizan para métricas de satisfacción individual. Las VAAs operan con retroalimentación explícita (las respuestas declaradas del usuario al cuestionario) y deben optimizar para la precisión de la comparación antes que para la satisfacción inmediata del usuario. Las recomendaciones comerciales se refinan con el tiempo mediante machine learning; las VAAs deben producir resultados correctos desde la primera sesión porque la elección puede ser inminente.

Además, las decisiones electorales tienen consecuencias colectivas que las decisiones comerciales no tienen: el voto de cada ciudadano contribuye a determinar quiénes gobernarán a toda la comunidad. Esta dimensión colectiva impone requisitos de neutralidad algorítmica que no aplican en el diseño de sistemas de recomendación comercial.

### 6.5 Arquitectura de software para infraestructura cívica

Las aplicaciones de infraestructura cívica — herramientas electorales, plataformas de participación ciudadana, sistemas de transparencia gubernamental — comparten un conjunto de requisitos arquitectónicos que van más allá de la funcionalidad básica.

La auditabilidad es un requisito funcional, no un complemento estético. El código debe ser publicado bajo licencias que permitan su revisión independiente. El algoritmo central debe estar documentado en prosa, no solo en código, para que personas sin formación técnica puedan comprender su funcionamiento. Los datos utilizados para generar las recomendaciones deben tener trazabilidad a fuentes verificables.

La neutralidad debe ser demostrable, no solo declarada. Un algoritmo que favorece sistemáticamente a ciertos candidatos — por error de diseño o intención — puede producir daño democrático real. El enfoque de código abierto y documentación del algoritmo permite a terceros verificar que no existe tal sesgo.

La sostenibilidad entre ciclos electorales es un requisito de diseño frecuentemente subestimado. La historia de las VAAs latinoamericanas muestra que las herramientas puntuales por ciclo pierden el capital técnico acumulado en cada abandono. Una arquitectura que soporte múltiples elecciones y que mantenga las preferencias del usuario entre ciclos es técnicamente más compleja pero estratégicamente más valiosa.

---

## 7. Estado del Arte

### 7.1 Panorama internacional de VAAs

Las Voting Advice Applications tienen más de tres décadas de historia documentada. El ecosistema europeo concentra la mayor tradición y sostenibilidad, con herramientas que han sobrevivido múltiples ciclos electorales y acumulado evidencia empírica sobre su impacto.

**StemWijzer** (Países Bajos, 1989) es la VAA más antigua del mundo. Comenzó como herramienta impresa, luego en disquete, y hoy opera como aplicación web con millones de consultas por elección. Utiliza escala de tres opciones (de acuerdo / neutral / en desacuerdo) con posibilidad de saltar preguntas, y permite ponderar temas como *importante*. Su operador, ProDemos, es una fundación sin ánimo de lucro especializada en educación cívica. El código no es abierto y el algoritmo no está documentado en detalle público.

**Wahl-O-Mat** (Alemania, 2002) es la VAA de mayor alcance documentado. Operado por la Agencia Federal para la Educación Cívica (Bundeszentrale für politische Bildung), registra entre dieciocho y veintiún millones de consultas por elección federal. Presenta tesis políticas — afirmaciones con posición implícita — en lugar de preguntas neutrales, permite ponderación por doble peso, y los partidos responden directamente a cada tesis con justificación oficial. Publica el dataset de respuestas partidarias pero no el código fuente. La metodología general está documentada académicamente (Marschall, 2005).

**Smartvote** (Suiza, 2003) es la VAA más sofisticada en cobertura territorial: opera simultáneamente para elecciones federales, cantonales y comunales, con candidatos individuales en lugar de partidos. Presenta un radar de ocho dimensiones ideológicas y un mapa bidimensional (el *smartmap*) que posiciona al usuario y a los candidatos en un plano cartesiano. Publica parte de sus datasets. El operador Politools ha colaborado con investigación académica sobre sus resultados.

**Kieskompas** (Países Bajos, 2006) fue desarrollado por la Universidad de Ámsterdam y se centra en el mapa bidimensional de posicionamiento, sin ponderación explícita de temas. La ubicación del usuario en el plano actúa como forma de expresar su perfil ideológico.

**Vote Compass** (Canadá/Australia, 2011) opera con alianzas estratégicas con medios públicos nacionales — CBC en Canadá, ABC en Australia — lo que explica su alcance masivo. Ha tenido ediciones en múltiples países. El algoritmo no es público.

**iSideWith** (Estados Unidos, 2012) cubre más de cincuenta países con cuestionarios de cien preguntas o más, ponderación granular y múltiples variantes de respuesta. Tiene la cobertura geográfica más amplia del sector pero el menor rigor de verificación de posturas, mezclando datos autodeclarados, curados y en algunos casos editados por usuarios.

### 7.2 Iniciativas en Chile y América Latina

El panorama latinoamericano y chileno ha sido significativamente más fragmentario que el europeo.

**Votamos Todos** (Zismo, Chile, 2021-2022) es la iniciativa chilena más cercana al modelo VAA tradicional. Implementó un cuestionario de setenta preguntas con matching contra respuestas de candidatos, disponible durante el plebiscito constitucional de 2022. Fue discontinuada tras ese proceso. Su alcance se limitó a una sola elección y no hay registro público de su metodología de matching.

**Decide Chile** ofrece información electoral, predicción de resultados y elementos lúdicos sin componente algorítmico de matching personalizado. Funciona como directorio y agregador de información, no como VAA.

**Vota Inteligente** y **Voto Informado** difunden propuestas de candidatos y en algunos casos verifican declaraciones, sin matching algorítmico.

**Infovecino** personaliza información electoral por comuna, sin comparación de preferencias.

En América Latina, las plataformas oficiales como *Voto Informado del INE* (México) y *Voto Informado del JNE* (Perú) priorizan el directorio institucional de candidaturas sobre el matching personalizado. *Infovotantes* (Colombia) y *VotaPE* (Perú) siguen líneas similares.

### 7.3 Análisis comparativo

El análisis de nueve VAAs internacionales y cuatro iniciativas chilenas en doce dimensiones revela patrones consistentes.

| Dimensión | Tendencia dominante | Caso diferenciador |
|-----------|--------------------|--------------------|
| Escala de respuestas | Likert 5 puntos | StemWijzer usa 3; iSideWith usa múltiples variantes |
| Ponderación | Mayoritariamente sí | Kieskompas no tiene ponderación explícita |
| Opción *no sé* | Opcional (skip) | Pocas tratan la exclusión del denominador |
| Indicador de confianza | Ausente | Ninguna VAA comparable lo implementa |
| Algoritmo publicado | Mayoría no | Wahl-O-Mat publica metodología general |
| Código fuente abierto | Ninguna | VotoAFin es la primera bajo licencia libre |
| Cobertura territorial multi-nivel | Solo Smartvote | Resto cubre solo nivel nacional |
| Continuidad entre ciclos | Variable | Las iniciativas chilenas son discontinuas |
| Fuentes por postura | Mayoría no | Wahl-O-Mat y Smartvote tienen justificaciones parciales |

### 7.4 Brechas identificadas y diferenciación de la propuesta

Del análisis comparativo emergen cuatro brechas no cubiertas por las alternativas existentes en el contexto chileno.

**Brecha de transparencia algorítmica.** Ninguna iniciativa chilena ha publicado su algoritmo de matching. VotoAFin documenta completamente su fórmula cuadrática, los multiplicadores de ponderación y la lógica del indicador de confianza, en prosa accesible para no técnicos y en código fuente abierto.

**Brecha de cobertura territorial.** Ninguna VAA latinoamericana cubre simultáneamente presidencial, distrital y comunal. VotoAFin lo hace mediante el modelo territorial polimórfico que mapea la jerarquía completa del sistema electoral chileno.

**Brecha de honestidad epistemológica.** La opción *no sé* con exclusión del denominador y el indicador de confianza asociado no tienen equivalente en las alternativas existentes. Esta combinación evita dos problemas: el ruido de respuestas neutras forzadas y la sobreestimación de la solidez de resultados basados en pocas preguntas.

**Brecha de continuidad.** La arquitectura multi-elección con persistencia de preferencias y código abierto permite que el sistema sirva como infraestructura acumulativa entre ciclos, en lugar de reinventarse en cada proceso electoral.

El principal riesgo de la propuesta frente a las alternativas internacionales consolidadas es la adopción: *Wahl-O-Mat* tiene décadas de presencia institucional y alianzas estatales que VotoAFin no tiene. Sin respaldo institucional equivalente, el alcance en el corto plazo depende de alianzas con medios, universidades u organizaciones de sociedad civil.

---

## 8. Desarrollo

### 8.1 Descubrimiento del problema — de la observación al proyecto

El proyecto tiene su origen en una situación concreta: la preparación de un ramo de Aplicaciones Móviles donde se trabajó con un prototipo inicial de comparación electoral. Ese prototipo demostró la viabilidad técnica básica de un sistema de matching para elecciones chilenas, pero también reveló sus limitaciones: el algoritmo era opaco, las posturas de candidatos habían sido generadas sin verificación contra fuentes primarias, y la arquitectura inicial no era extensible a múltiples procesos electorales.

La decisión de evolucionar ese prototipo hacia un trabajo de tesis surgió del reconocimiento de que el problema de asimetría de información electoral en Chile era real, que la brecha tecnológica era técnicamente resoluble, y que documentar ese proceso con rigor de ingeniería podía producir un aporte de valor más allá del contexto académico inmediato.

El hallazgo más temprano y más significativo de esta fase fue que el dataset inicial de posturas era inválido. Las posiciones asignadas a cada candidato habían sido generadas por inferencia ideológica estereotípica — *si un candidato es de derecha, entonces su postura en aborto es X* — sin verificación contra declaraciones públicas reales. Esta práctica, aunque conveniente para demostración técnica, producía un sistema que podía asesorar a los votantes basándose en datos fabricados. La decisión de eliminar completamente ese dataset y reconstruirlo con verificación obligatoria de fuentes primarias fue la primera decisión de diseño fundamental del proyecto, con consecuencias en la arquitectura del sistema de importación de datos.

### 8.2 Investigación — el estado del arte como requerimiento de diseño

La investigación del estado del arte no fue un capítulo académico separado del diseño, sino que generó directamente requerimientos concretos de la solución.

El análisis comparativo de Wahl-O-Mat identificó que las justificaciones por postura — por qué se asigna cierta respuesta a un candidato — son un componente diferenciador respecto de los sistemas que presentan solo el número en la escala. Esto se tradujo en un requerimiento de dato: cada postura debe incluir una justificación textual mínima y una URL de fuente primaria, validadas por el sistema de importación.

El análisis de Smartvote identificó el valor de la cobertura multi-nivel: un sistema que solo cubre presidencial pierde la dimensión donde el impacto en la vida del ciudadano es frecuentemente mayor. Esto se tradujo en el requerimiento del modelo territorial polimórfico.

El análisis de iSideWith identificó el riesgo de los sistemas con demasiadas preguntas: la fatiga cognitiva reduce la calidad de las respuestas a partir de cierto umbral. La literatura sobre diseño de cuestionarios (Krosnick & Presser, 2010) respalda que la escala Likert de cinco puntos con doce a treinta preguntas es el rango óptimo entre resolución y fatiga.

El análisis de los sistemas sin opción *no sé* identificó el problema de las respuestas neutrales forzadas: un usuario que no tiene opinión sobre política exterior no debería ver ese vacío de información reflejado como una posición neutral en el cálculo. Esto generó el requerimiento de la opción *no sé* con exclusión del denominador.

La revisión de las iniciativas chilenas discontinuas identificó el patrón de arquitecturas puntuales por ciclo como causa de la falta de continuidad. Esto generó el requerimiento de arquitectura multi-elección con persistencia de preferencias entre procesos.

### 8.3 Diseño de experiencia — el votante como sujeto de diseño

El proceso de diseño de experiencia partió de una premisa: el sujeto de diseño es el votante, no el sistema. Cada decisión de experiencia se evaluó preguntando si reducía la carga cognitiva del votante, si era honesta sobre las limitaciones del resultado, y si respetaba la autonomía de decisión del ciudadano.

El flujo principal se diseñó con tres principios operacionales.

**Minimizar el tiempo de entrada.** El cuestionario debe poder completarse en cinco a diez minutos sin conocimiento previo de política. Las preguntas se redactan en lenguaje accesible, cada una acompañada de un modal de contexto educativo que explica las repercusiones en cinco dimensiones (Económica, Social, Cultural, Ambiental, Institucional) sin lenguaje partidario.

**Transparencia radical.** La pantalla de resultados muestra no solo el ranking, sino el indicador de confianza para cada candidato, un radar de afinidad por eje temático, y acceso al detalle pregunta-a-pregunta del cálculo. El usuario no recibe un número: recibe el número y las razones que lo producen.

**Continuidad entre sesiones.** Las respuestas del usuario persisten entre sesiones. En la siguiente elección, las preguntas base transversales ya respondidas no requieren volver a contestarse, reduciendo la fricción de entrada.

El flujo de usuario resultante tiene tres etapas: bienvenida y selección de ubicación para el filtrado territorial; cuestionario con ponderación y opción *no sé*; y resultados con ranking, radar, indicador de confianza y detalle de candidato.

El diseño de la pantalla de resultados fue uno de los desafíos de mayor complejidad de experiencia. Mostrar solo el porcentaje de match produce la ilusión de precisión que el indicador de confianza corrige. La decisión final fue presentar el porcentaje siempre acompañado del indicador de confianza y del número de preguntas consideradas, haciendo imposible que el usuario ignore la base empírica del resultado.

### 8.4 Diseño de la solución — de la experiencia a la arquitectura

El diseño de la arquitectura surgió de los requerimientos de experiencia y no al revés. Los requerimientos clave que condicionaron la arquitectura fueron: multiplataforma desde el primer día (un solo codebase para web, iOS y Android); contrato API auditable públicamente; algoritmo encapsulado como servicio de dominio independiente; modelo territorial extensible sin cambios de schema; e ingesta de datos con validación de fuentes obligatoria.

La decisión de arquitectura más importante fue la separación en dos servicios independientes: un backend que encapsula toda la lógica de dominio, la persistencia y la API; y un frontend que presenta y captura interacciones sin lógica de negocio propia. Esta separación permite que el algoritmo de matching sea verificable de forma independiente — porque vive completamente en el backend sin fragmentos distribuidos en el frontend — y que múltiples clientes (web, iOS, Android, futuros bots o integraciones) reutilicen la misma lógica sin duplicación.

La elección del estándar OpenAPI 3.1 como contrato entre ambas capas responde al principio de que la fuente única de verdad sobre la forma de los datos debe ser el backend, y que el frontend nunca debe inferir ni inventar estructuras de datos. Con el esquema generado automáticamente desde el código del backend y los tipos TypeScript generados automáticamente desde ese esquema, el costo de mantener ambas capas sincronizadas es prácticamente nulo.

### 8.5 Arquitectura conceptual del sistema

El sistema se organiza en cuatro capas conceptuales.

**Capa de presentación.** La interfaz React Native renderiza pantallas, captura interacciones y gestiona el estado local del cuestionario. No contiene lógica de negocio: no calcula porcentajes, no determina qué candidatos son relevantes, no valida la consistencia de las respuestas. Esas responsabilidades pertenecen a la capa de dominio.

**Capa de API.** El backend expone la funcionalidad del sistema como endpoints REST, con documentación automática disponible en Swagger UI. Los permisos por endpoint son explícitos: algunos recursos son públicos (catálogo electoral, noticias), la mayoría requieren autenticación por token, y los recursos de administración requieren privilegios de administrador.

**Capa de dominio.** Los servicios de lógica de negocio — matching, cálculo territorial, validación de respuestas — son funciones puras sin dependencias de HTTP, completamente testeables sin levantar un servidor web. Esta separación es la que hace posible tener una suite de pruebas que valida el algoritmo de manera aislada.

**Capa de persistencia.** La base de datos almacena el modelo de dominio completo: candidatos, preguntas, posturas, respuestas de usuarios, resultados de matching y jerarquía territorial. En desarrollo se usa SQLite para configuración cero; en producción PostgreSQL para robustez y soporte de concurrencia.

### 8.6 Diseño funcional

El diseño funcional del sistema abarca cuatro subsistemas interdependientes.

**Subsistema de cuestionario.** Gestiona el catálogo de preguntas organizado por eje temático, el flujo de respuesta con escala Likert y opción *no sé*, la selección de peso por pregunta, y la persistencia de respuestas en el backend. Las preguntas se clasifican como *base* — transversales a todos los procesos electorales — o *específicas* de un tipo de elección. Las preguntas base se responden una sola vez y se reutilizan en todos los procesos.

**Subsistema de matching.** Implementa el algoritmo cuadrático ponderado en tres variantes: autenticada (calcula y persiste el resultado), detallada (retorna el desglose pregunta-a-pregunta) y anónima (calcula sin persistir, para modo invitado). El algoritmo es el componente más crítico del sistema en términos de correctitud y auditabilidad.

**Subsistema territorial.** Gestiona la jerarquía de dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas mediante una estructura polimórfica auto-referencial. El filtrado de candidatos elegibles por ubicación del usuario recorre la cadena de ancestros desde la comunas hasta la raíz nacional, identificando qué candidatos tienen scope que abarca la ubicación del usuario.

**Subsistema de gestión de datos.** Proporciona herramientas de ingesta idempotente mediante comandos de gestión del backend. Cada importador valida obligatoriamente que las posturas incluyan justificación textual mínima y URL de fuente primaria antes de persistir el dato. La idempotencia garantiza que las ejecuciones repetidas no dupliquen registros.

### 8.7 El algoritmo de matching — decisiones de diseño

El diseño del algoritmo fue el proceso de mayor iteración conceptual del proyecto. Se evaluaron tres alternativas antes de converger en la solución final.

**Alternativa 1: distancia Manhattan normalizada.** La diferencia absoluta entre la posición del usuario y la del candidato en cada pregunta se suma y normaliza. Simple y transparente, pero semánticamente discutible: trata todas las diferencias proporcionalmente, sin penalizar con mayor severidad los desacuerdos extremos.

**Alternativa 2: similitud de coseno.** Representa las posiciones como vectores y calcula el ángulo entre ellos. Produce resultados correctos cuando las respuestas tienen magnitudes comparables, pero no es intuitiva para usuarios no técnicos y su documentación comprensible para el público general es más difícil.

**Alternativa 3 (seleccionada): distancia cuadrática normalizada.** La diferencia absoluta se normaliza por el rango máximo posible y se eleva al cuadrado antes de restarse de uno. Esto produce una función que penaliza las diferencias extremas con mayor severidad relativa que las diferencias pequeñas, reflejando la intuición política de que *casi de acuerdo* es cualitativamente distinto de *a medias* entre acuerdo y desacuerdo.

La fórmula para cada pregunta es:

```
score_pregunta = 1 - (|valor_usuario - valor_candidato| / rango_máximo)²
```

El score de cada pregunta se multiplica por el multiplicador de peso declarado por el usuario: 0.5x para *poco importante*, 1.0x para importancia neutra, 1.5x para *importante* y 2.0x para *crítico*. El score final del candidato es el promedio ponderado de los scores de las preguntas efectivamente consideradas (excluyendo las respondidas como *no sé*).

La progresión numérica de los cinco casos posibles en escala Likert de uno a cinco confirma el comportamiento diseñado: diferencia 0 → score 1.00; diferencia 1 → score 0.9375; diferencia 2 → score 0.75; diferencia 3 → score 0.4375; diferencia 4 → score 0.00. La asimetría entre los incrementos de penalización — que se acelera hacia los extremos — es exactamente el comportamiento deseado.

### 8.8 Construcción del sistema — fases de implementación

La construcción se organizó siguiendo las ocho fases descritas en la sección de metodología. A continuación se describe cada fase desde la perspectiva de las decisiones de ingeniería tomadas.

**Fase 0 — Investigación.** El análisis comparativo de nueve VAAs internacionales y cuatro iniciativas chilenas generó una lista de trece requerimientos específicos que el diseño debía satisfacer. La revisión de literatura politológica proporcionó el marco conceptual para las decisiones sobre el algoritmo, la escala de respuestas y la gestión de la ignorancia del votante.

**Fase 1 — Arquitectura y contrato API.** El primer entregable fue el modelo de dominio inicial con nueve entidades: tipos de elección, candidatos, preguntas, opciones de respuesta, posturas de candidatos, respuestas de usuarios, resultados de matching, noticias y usuarios. El schema OpenAPI 3.1 se generó automáticamente desde el código del backend y se usó para generar los tipos TypeScript del frontend. Esta secuencia — backend define el contrato, frontend lo consume — se mantuvo durante todo el proyecto.

**Fase 2 — MVP.** La implementación del flujo end-to-end funcional cubrió registro y autenticación, catálogo de candidatos y preguntas, cuestionario con persistencia de respuestas, cálculo del match y pantalla de resultados. Al final de esta fase, el sistema era funcional desde el punto de vista técnico pero con limitaciones importantes: el dataset de posturas era borrador con nivel de confianza explícito, y la arquitectura tenía código duplicado entre pantallas que la siguiente fase eliminaría.

**Fase 3 — Auditoría y refactorización.** La revisión de código identificó diecisiete hallazgos. Los críticos de seguridad — permisos insuficientes en endpoints sensibles, ausencia de constraints en modelos que permitían datos inconsistentes — se resolvieron prioritariamente. La refactorización aplicó DRY y SOLID: la lógica de cálculo de porcentajes duplicada en múltiples pantallas se extrajo hacia un módulo de servicios compartido; el patrón repetido de gestión de estado de fetch — useState, useEffect, fetch manual — se reemplazó por una capa de gestión de datos con cache automático, retry y deduplicación.

**Fase 4 — Expansión territorial y multi-elección.** La incorporación del modelo territorial polimórfico fue la decisión de diseño de mayor impacto sobre el schema de la base de datos. El modelo inicial usaba referencias directas de región, distrito y comuna en el perfil del usuario y en el candidato, generando queries complejas y acoplamiento rígido. El modelo polimórfico jerárquico reemplazó esas referencias con una única entidad `UnidadTerritorial` que se relaciona recursivamente, permitiendo que el algoritmo de filtrado territorial recorra la jerarquía completa con una sola query recursiva. La incorporación del mecanismo de preguntas base transversales resolvió el requerimiento de que las respuestas del usuario a preguntas compartidas entre tipos de elección no debieran repetirse.

**Fase 5 — Simplificación YAGNI.** La aplicación del principio de *You Aren't Gonna Need It* fue una de las fases más contraintuitivas del proyecto: eliminar trabajo hecho. El flujo de interfaz tipo swipe, implementado en el prototipo original como mecánica atractiva de engagement, se eliminó porque reducía las respuestas a decisiones binarias incompatibles con la escala Likert de cinco puntos que el algoritmo requiere. El módulo de decisión final se eliminó porque no tenía casos de uso reales demostrados durante las pruebas. Esta fase redujo el número de componentes del sistema y simplificó el flujo de usuario, produciendo un producto más coherente con menos superficie de mantenimiento.

**Fase 6 — Sistema de diseño y accesibilidad.** La construcción del sistema de diseño siguió Atomic Design, organizando los componentes en átomos, moléculas, organismos y una plantilla real llamada `AppShell` que maneja el layout común. La auditoría de accesibilidad verificó contrastes de color contra los umbrales de WCAG 2.2 AA (ratio mínimo 4.5:1 para texto normal, 3:1 para elementos gráficos), tamaños mínimos de tap targets, presencia de atributos de accesibilidad en todos los componentes interactivos, y comportamiento correcto con navegación por teclado y lectores de pantalla.

**Fase 7 — Documentación.** La documentación se organizó en dos niveles paralelos: documentación técnica orientada a contribuidores y revisores de arquitectura, y documentación accesible en lenguaje no técnico orientada al público general interesado en entender cómo funciona el sistema. Esta dualidad responde al objetivo de que la transparencia del sistema sea accesible tanto para ingenieros que auditen el código como para votantes que quieran entender cómo se produce la recomendación.

### 8.9 Decisiones relevantes del proceso

A lo largo del proyecto se tomaron decisiones que merecen documentación explícita porque tuvieron impacto significativo sobre el resultado final.

**Decisión 1: eliminar el dataset de posturas fabricadas.** Cuando se descubrió que el dataset inicial había sido generado por inferencia ideológica estereotípica sin verificación, la decisión fue eliminarlo completamente en lugar de corregirlo parcialmente. La alternativa de corregir caso por caso habría producido un dataset de calidad desigual y opaco. La decisión de eliminar y reconstruir con validación de fuentes obligatoria impuso un costo inmediato — el sistema no tenía datos útiles durante la reconstrucción — pero produjo un dataset de mayor calidad con trazabilidad explícita.

**Decisión 2: función cuadrática sobre función lineal.** La elección de una fórmula de penalización cuadrática sobre la alternativa lineal fue una decisión de diseño conceptual antes que técnica. Reflejó la visión de que la distancia política entre posiciones extremas no es simplemente el doble de la distancia entre posiciones cercanas, sino cualitativamente diferente. Esta decisión diferencia el algoritmo de los sistemas de matching más simples y produce un ranking con mayor coherencia política.

**Decisión 3: AGPL-3.0 sobre MIT o Apache.** La elección de una licencia copyleft fuerte sobre una licencia permisiva respondió a la visión de que la tecnología electoral es infraestructura pública y que los forks deberían permanecer abiertos. MIT o Apache habrían permitido que actores privados modificaran el sistema y lo desplegaran como servicio cerrado sin compartir sus modificaciones, lo que es inconsistente con el objetivo de transparencia algorítmica.

**Decisión 4: modelo territorial polimórfico.** La alternativa al modelo polimórfico era un schema con tablas separadas por nivel territorial — una tabla para regiones, otra para distritos, otra para comunas — y joins por nivel en cada query de filtrado. El modelo polimórfico redujo el número de tablas necesarias y permitió que el algoritmo de filtrado territorial sea genérico: la misma función sirve para cualquier jerarquía de profundidad arbitraria.

**Decisión 5: eliminar el flujo tipo swipe.** La mecánica de deslizamiento tipo aplicación de citas era la característica más visible del prototipo original y la que más diferenciaba la experiencia de un cuestionario clásico. Se eliminó porque reducía las respuestas a decisiones binarias (me gusta / no me gusta), lo que es incompatible con la escala Likert de cinco puntos que el algoritmo requiere para capturar la intensidad de las posiciones. La intuición de diseño era correcta — hacer el cuestionario más entretenido — pero la implementación era incompatible con los requerimientos de precisión.

### 8.10 Evolución del proyecto

El proyecto evolucionó en tres dimensiones simultáneas a lo largo de sus ocho meses de desarrollo.

**Evolución del modelo de dominio.** El modelo inicial de nueve entidades creció a diecinueve entidades al incorporar la jerarquía territorial (Región, Distrito, Comuna, UnidadTerritorial), el perfil de usuario con ubicación polimórfica, los ejes temáticos como entidad independiente, los bookmarks de candidatos y posturas, y el token de reset de contraseña. Simultáneamente, una entidad fue eliminada: el modelo DecisionFinal, cuya función se demostró cubierta por los sistemas de favoritos y guardados existentes.

**Evolución de la interfaz.** La interfaz pasó de siete pantallas en el prototipo inicial a dieciocho pantallas funcionales, incorporando el Home HUB multi-elección, la pantalla de comparación entre candidatos, la gestión unificada de guardados, el flujo de recuperación de contraseña, y la pantalla interna de sistema de diseño. El sistema de componentes creció a veintisiete átomos, veintinueve moléculas y diecisiete organismos.

**Evolución de la infraestructura de calidad.** La suite de pruebas creció de ninguna prueba en el prototipo inicial a veinticinco archivos de pruebas backend que cubren el algoritmo, el sistema territorial, los flujos de autenticación y los importadores de datos. El compilador TypeScript en modo estricto se incorporó como requisito de integración, imposibilitando que el proyecto avance con errores de tipos sin resolver.

### 8.11 Principales desafíos

Cuatro desafíos concentraron la mayor parte del esfuerzo de resolución durante el proyecto.

**La ausencia de una API pública de posturas electorales en Chile.** Chile no expone datos de posiciones de candidatos en formato consumible por APIs. La estrategia de resolución fue diseñar un sistema de importación desde CSV con validación estricta, acompañado de un protocolo explícito de fuentes aceptables e inaceptables para cada postura. Esto impone trabajo manual de curaduría, pero garantiza trazabilidad verificable de cada dato.

**La incompatibilidad entre la mecánica de swipe y el algoritmo cuadrático.** El prototipo original había sido diseñado con una interfaz de deslizamiento que reducía las respuestas a binario, lo que era incompatible con el algoritmo de matching que requería escala Likert de cinco puntos. Resolver este desafío requirió eliminar la mecánica de interfaz más visible del prototipo y rediseñar el cuestionario desde cero.

**El comportamiento heterogéneo de Alert.alert entre plataformas.** El sistema de alertas nativo de React Native es silencioso en la versión web, lo que hacía que los errores de autenticación no fueran visibles para usuarios en navegador. La resolución fue construir un sistema de notificaciones en React Native puro — sin dependencias del sistema operativo — que funciona identicamente en todas las plataformas.

**La complejidad del modelo territorial chileno.** Representar dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas con filtrado dinámico de candidatos por scope requirió diseñar el modelo polimórfico jerárquico que fue la decisión de mayor impacto sobre el schema. La implementación y migración de datos existentes a ese modelo tomó la fase completa más extensa del proyecto.

### 8.12 Lecciones aprendidas

Cuatro lecciones emergen del proceso de desarrollo con valor que trasciende el contexto específico del proyecto.

**La curaduría de datos es más costosa que el código.** Un desarrollador individual puede construir el sistema completo en ocho meses. Verificar y documentar con fuentes primarias las posturas de todos los candidatos de una elección presidencial completa requiere trabajo curatorial de múltiples personas durante semanas. Esta asimetría determina el principal cuello de botella para llevar el sistema a producción pública, y debe ser un requisito de planificación explícito en proyectos similares.

**YAGNI aplicado retroactivamente vale tanto como YAGNI prospectivo.** La eliminación del flujo tipo swipe y del módulo de decisión final — ambos implementados — simplificó el sistema de manera visible y sin costo funcional. El miedo a eliminar trabajo hecho es un sesgo cognitivo que YAGNI permite contrarrestar con un criterio objetivo: si una feature no tiene casos de uso reales demostrados, su costo de mantenimiento supera su valor.

**El contrato OpenAPI como barrera anti-drift.** La combinación de schema generado automáticamente desde el backend y tipos TypeScript generados automáticamente desde el schema elimina prácticamente la posibilidad de desincronización entre cliente y servidor. En el proyecto, no hubo ni un solo error en producción atribuible a discrepancias entre la forma de datos esperada por el frontend y la entregada por el backend.

**La opción *no sé* es un requisito, no un nice-to-have.** Durante el diseño se consideró simplificar el cuestionario eliminando la opción *no sé* para reducir la complejidad de la interfaz. La revisión de literatura politológica convenció de que su ausencia produce resultados sesgados: el votante que genuinamente no tiene opinión sobre un tema no debería ver ese vacío convertido en una posición neutral que afecta el cálculo. La honestidad epistemológica tiene un correlato directo en la calidad del matching.

### 8.13 Resultados obtenidos

El sistema resultante es una aplicación funcional end-to-end que integra:

- Un flujo completo desde registro hasta detalle de candidato, cubriendo cuestionario, envío de respuestas, cálculo de matching y visualización de resultados
- Un algoritmo de matching con fórmula cuadrática, ponderación en cuatro niveles, exclusión de respuestas *no sé* e indicador de confianza en tres niveles
- Un modelo territorial que cubre dieciséis regiones, veintiocho distritos y trescientas cuarenta y seis comunas con filtrado automático de candidatos por scope
- Soporte para múltiples procesos electorales simultáneos con preguntas base transversales
- Cumplimiento con WCAG 2.2 nivel AA verificado mediante auditoría técnica y manual
- Despliegue en web, iOS y Android desde un único codebase
- Código publicado bajo AGPL-3.0 con documentación del algoritmo disponible
- Una suite de veinticinco archivos de pruebas backend con validación del algoritmo, sistema territorial y flujos principales

---

## 9. Conclusiones

### 9.1 Cumplimiento de objetivos

El objetivo general del trabajo se cumple: se diseñó e implementó una aplicación multiplataforma de asesoramiento electoral para el contexto chileno, con algoritmo documentado, arquitectura modular, cobertura territorial completa y cumplimiento WCAG 2.2 nivel AA. Los siete objetivos específicos se cumplen en su totalidad, con la salvedad documentada de que la validación empírica con usuarios reales y la curaduría formal del dataset de posturas contra fuentes primarias constituyen trabajo pendiente de alta prioridad antes del despliegue público productivo.

### 9.2 Valor generado

El valor del proyecto se materializa en tres dimensiones.

**Valor de infraestructura.** Chile no tenía una VAA activa con algoritmo documentado, código abierto y cobertura territorial multi-nivel. El sistema construido proporciona esa infraestructura por primera vez, con una arquitectura diseñada para ser mantenida entre ciclos electorales y no solo para un proceso específico.

**Valor de conocimiento.** El análisis comparativo de nueve VAAs internacionales y cuatro iniciativas chilenas, el diseño del modelo territorial polimórfico y la documentación del algoritmo de matching cuadrático son contribuciones reutilizables para proyectos similares en Chile u otros países latinoamericanos. El código abierto materializa este valor permitiendo que otros equipos construyan sobre el trabajo realizado.

**Valor de demostración.** El proyecto demuestra que construir infraestructura cívica digital de calidad profesional con recursos limitados es posible, aplicando disciplinadamente principios de ingeniería de software: SOLID, DRY, YAGNI, contrato API automatizado, pruebas automatizadas y principios de las Twelve-Factor App. Este valor de demostración es el más difícil de cuantificar y posiblemente el más duradero.

### 9.3 Limitaciones actuales

Las limitaciones actuales del sistema se organizan en tres niveles de prioridad.

**Alta prioridad (bloquean el despliegue público responsable).** El dataset de posturas es ilustrativo y requiere verificación formal contra fuentes primarias antes de usarse para orientar decisiones de voto reales. No se realizaron pruebas empíricas con usuarios reales: la validación es técnica y estructural, no experiencial. Falta auditoría de seguridad por un tercero especializado antes de exposición pública productiva.

**Media prioridad (bloquean el escalamiento operativo).** La interfaz en modo anónimo — sin registro — está implementada en el backend pero no en el frontend. No se ejecutaron pruebas de carga para garantizar el comportamiento bajo concurrencia electoral. No se calculó formalmente la cobertura de la suite de pruebas por módulo.

**Baja prioridad (mejoras deseables sin urgencia).** La generación de imagen compartible del resultado para redes sociales. La implementación de rate limiting productivo. La configuración de un pipeline de integración continua en el repositorio público.

### 9.4 Aprendizajes

El aprendizaje central del proyecto es que la tensión entre alcance y completitud en proyectos de infraestructura cívica requiere una disciplina explícita de priorización. El riesgo real no es hacer poco; es hacer mal. Acotar el dataset a posturas ilustrativas en lugar de intentar verificar setenta y dos posturas contra fuentes primarias fue la decisión que mejor protegió la calidad del sistema entregado.

Un segundo aprendizaje es que la apertura algorítmica no es un complemento estético sino un requisito funcional de legitimidad. Un porcentaje de afinidad producido por un algoritmo opaco no es más creíble que un porcentaje generado por cualquier otro mecanismo. La combinación de código abierto y documentación del algoritmo en prosa accesible es la única manera de que la herramienta sea percibida como neutral por votantes de todo el espectro.

Un tercer aprendizaje, de naturaleza más técnica, es que los contratos API automatizados eliminan una categoría completa de errores. Durante el desarrollo del proyecto no hubo un solo problema de desincronización entre backend y frontend atribuible a cambios en la forma de los datos, porque el schema era la única fuente de verdad y los tipos del frontend se generaban automáticamente desde él.

### 9.5 Trabajo futuro

El camino desde la entrega actual hacia un despliegue público productivo responsable involucra cinco líneas de trabajo prioritarias.

**Curaduría del dataset.** La prioridad más alta es verificar formalmente las posturas del dataset ilustrativo contra fuentes primarias — declaraciones públicas de candidatos, votaciones parlamentarias, programas oficiales de campaña — idealmente en colaboración con una universidad o think tank que pueda distribuir el trabajo curatorial.

**Validación con usuarios.** Antes de cualquier despliegue público, se requieren sesiones de usabilidad con votantes reales que representen los perfiles objetivo identificados, incluyendo evaluación específica con personas usuarias con discapacidad para la dimensión de accesibilidad.

**Auditoría de seguridad.** Una revisión por un equipo especializado en seguridad de aplicaciones web identificará vulnerabilidades que la auditoría interna puede haber omitido, especialmente en los flujos de autenticación y recuperación de contraseña.

**Alianzas institucionales.** La sostenibilidad del sistema entre ciclos electorales requiere respaldo institucional. Las alianzas más prometedoras son con universidades chilenas (para la curaduría de datos y la investigación sobre impacto), organizaciones de sociedad civil especializadas en educación cívica, y medios de comunicación interesados en herramientas comparativas verificadas.

**Investigación sobre impacto.** Una vez que el sistema esté en producción pública con datos verificados, será posible diseñar estudios sobre el impacto de la herramienta en la coherencia entre preferencias del votante y decisión de voto, siguiendo la metodología comparativa de la literatura politológica internacional (Garzia & Marschall, 2014; Walgrave et al., 2008).

### 9.6 Reflexión final

El proyecto demuestra que la brecha entre las necesidades de información del votante chileno y la oferta de herramientas disponibles no es una brecha tecnológica: es una brecha de voluntad y asignación de esfuerzo institucional. La tecnología para construir infraestructura de asesoramiento electoral de calidad existe y es accesible. Los principios de diseño para que esa infraestructura sea legítima, neutra y duradera están documentados en décadas de investigación politológica y de experiencia de proyectos como Wahl-O-Mat y Smartvote.

Lo que se requiere en Chile no es inventar una solución desde cero: es comprometerse institucionalmente con mantener una. El desafío pendiente es institucional más que técnico. Este trabajo entrega una base técnica sobre la cual esa discusión institucional puede desarrollarse a partir de un producto real, funcional y auditable, en lugar de un concepto abstracto.

---

## 10. Bibliografía

### Libros y capítulos

Beck, K. (1999). *Extreme programming explained: Embrace change*. Addison-Wesley.

Cedroni, L., & Garzia, D. (Eds.). (2010). *Voting Advice Applications in Europe: The state of the art*. ScriptaWeb.

Fowler, M. (2003). *Patterns of enterprise application architecture*. Addison-Wesley.

Frost, B. (2016). *Atomic design*. Brad Frost. https://atomicdesign.bradfrost.com/

Garzia, D., & Marschall, S. (Eds.). (2014). *Matching voters with parties and candidates: Voting Advice Applications in a comparative perspective*. ECPR Press.

Hunt, A., & Thomas, D. (1999). *The pragmatic programmer: From journeyman to master*. Addison-Wesley.

Krosnick, J. A., & Presser, S. (2010). Question and questionnaire design. En P. V. Marsden & J. D. Wright (Eds.), *Handbook of survey research* (2nd ed., pp. 263–313). Emerald.

Martin, R. C. (2017). *Clean architecture: A craftsman's guide to software structure and design*. Prentice Hall.

### Artículos académicos

Likert, R. (1932). A technique for the measurement of attitudes. *Archives of Psychology, 22*(140), 1–55.

Marschall, S. (2005). Idee und Wirkung des Wahl-O-Mat. *Aus Politik und Zeitgeschichte, 51-52*, 41–46.

Marschall, S., & Schmidt, C. K. (2010). The impact of Voting Indicator Applications on voters' decision-making. *German Politics, 19*(3–4), 400–417. https://doi.org/10.1080/09644008.2010.515798

Ruusuvirta, O., & Rosema, M. (2009). Do online vote selectors influence electoral participation and the direction of the vote? En S. Walgrave et al. (Eds.), *Acta Politica, 43*(1).

Walgrave, S., van Aelst, P., & Nuytemans, M. (2008). "Do the vote test": The electoral effects of a popular Vote Advice Application at the 2004 Belgian elections. *Acta Politica, 43*(1), 50–70. https://doi.org/10.1057/palgrave.ap.5500207

### Documentación técnica

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

Bundeszentrale für politische Bildung (bpb). (2024). *Wahl-O-Mat*. https://www.wahl-o-mat.de

Kieskompas. (2024). *Kieskompas*. Universiteit van Amsterdam. https://www.kieskompas.nl/

ProDemos. (2024). *StemWijzer*. https://stemwijzer.nl/

Smartvote. (2024). *Smartvote*. Politools. https://www.smartvote.ch/

Vox Pop Labs. (2024). *Vote Compass*. https://votecompass.com/

Zismo. (2021). *Votamos Todos* [Plataforma electoral discontinuada]. (Iniciativa activa entre 2021 y 2022.)

### Fuentes y marcos legales chilenos

Biblioteca del Congreso Nacional de Chile (BCN). (2015). *Ley N° 20.840 — Sistema proporcional de elección parlamentaria*. https://www.bcn.cl/leychile/navegar?idNorma=1077039

Biblioteca del Congreso Nacional de Chile (BCN). (2022). *Ley N° 21.533 — Voto obligatorio*. https://www.bcn.cl/leychile/

Fast Check CL. (2024). *Fast Check CL — Verificación de información política*. https://www.fastcheck.cl/

Mala Espina Check. (2024). *Mala Espina Check*. https://malaespinacheck.cl/

Servicio Electoral de Chile (SERVEL). (2024). *Servicio Electoral de Chile*. https://www.servel.cl/

---

*Borrador v1.0 — Agosto 2026.*
*Autora: Jenifer Castillo — Ingeniería en Informática — Universidad Técnica Federico Santa María.*
*Este documento es un primer borrador sujeto a revisión por el profesor guía y la comisión evaluadora.*
