# Tinder Decisivo — Diseño e Implementación

**Una aplicación para ayudar a los chilenos a decidir su voto**

*Versión para todo público — 1.0 — 2026-07-25*

---

## Tabla de contenidos

1. [Contexto](#1-contexto)
2. [Definición del problema](#2-definicion-del-problema)
3. [Problemas encontrados](#3-problemas-encontrados)
4. [Síntomas e impacto](#4-sintomas-e-impacto)
5. [Objetivos](#5-objetivos)
6. [Justificación](#6-justificacion)
7. [Beneficios](#7-beneficios)
8. [Metodología](#8-metodologia)
9. [Marco teórico](#9-marco-teorico)
10. [Flujo del usuario](#10-flujo-del-usuario)
11. [Diseño e implementación](#11-diseno-e-implementacion)
12. [Conclusiones](#12-conclusiones)
13. [Bibliografía](#13-bibliografia)

---

## 1. Contexto

Chile es uno de los países con más elecciones en América Latina. En una década, un votante chileno tiene que decidir sobre elecciones presidenciales, parlamentarias, municipales, regionales y plebiscitos constitucionales. Son decenas de decisiones, cada una con muchos candidatos.

Pensemos en un caso concreto: una elección presidencial. Hay entre 6 y 8 candidaturas. Cada una publica un programa de gobierno de entre 80 y 200 páginas. Si un votante quisiera leer todos los programas antes de decidir, necesitaría literalmente semanas de lectura. **Nadie hace eso.**

En otros países existen desde hace décadas herramientas digitales pensadas para resolver este problema. Se llaman **Voting Advice Applications** (VAA), que en español podríamos traducir como "aplicaciones de recomendación de voto". La primera de ellas, *StemWijzer*, nació en Países Bajos en 1989 y hoy la usan millones de votantes en cada elección. En Alemania la herramienta se llama *Wahl-O-Mat*, en Suiza *Smartvote*, y así en muchos países.

En Chile, sin embargo, **no existe una VAA activa, transparente y sostenida en el tiempo**. Hubo intentos, como *Voto Informado* o *Decide Chile*, pero fueron intermitentes o se abandonaron. El votante chileno hoy no tiene un equivalente local de estas herramientas.

Este proyecto, llamado **Tinder Decisivo**, busca llenar ese vacío.

---

## 2. Definición del problema

El votante chileno se encuentra frente a una decisión importante —a quién elegir— con tres obstáculos grandes:

**Obstáculo 1: Demasiada información y muy poco tiempo.**  
Los programas oficiales de los candidatos son extensos y técnicos. Nadie con un trabajo, hijos o vida cotidiana normal puede leerlos todos y comparar en detalle.

**Obstáculo 2: Desinformación circulando en redes sociales.**  
Especialmente desde 2020, se ha vuelto común encontrar en WhatsApp, TikTok, Instagram y Facebook mensajes falsos o manipulados sobre lo que los candidatos supuestamente proponen. Organizaciones como *Fast Check CL* y *Mala Espina Check* trabajan revisando cientos de estos mensajes cada semana. El problema es que el mensaje falso se comparte mil veces más rápido que la verificación.

**Obstáculo 3: No hay una herramienta chilena que compare candidatos.**  
En Alemania, cualquier votante puede entrar a Wahl-O-Mat, responder 38 preguntas y ver de forma clara cuál partido está más cerca de sus posturas. En Chile no existe una herramienta parecida que esté funcionando, sea confiable, y no dependa solo de que un medio la impulse durante una elección específica.

En resumen: **el votante chileno tiene que decidir sin buena información, en un ambiente contaminado por desinformación, y sin una herramienta neutral que lo ayude a comparar.**

Ese es el problema que Tinder Decisivo busca resolver.

---

## 3. Problemas encontrados

Durante la investigación para diseñar esta aplicación, identificamos varios problemas concretos:

### 3.1 Con la información que hoy existe

- **Los programas son ilegibles para la mayoría.** No por falta de inteligencia del votante, sino por falta de tiempo y por el lenguaje técnico.
- **Los medios se enfocan en frases de impacto o encuestas**, no en comparar propuestas puntuales.
- **Circulan muchas mentiras y datos manipulados** en cadenas de mensajes y redes sociales, especialmente durante los últimos meses de campaña.
- **La información sobre un mismo candidato está dispersa** en su sitio web, entrevistas en YouTube, publicaciones en Twitter, notas de prensa. Reunir todo es agotador.
- **Cuando un medio o influencer dice "X candidato propone Y", raramente muestra la fuente exacta**. El votante tiene que confiar sin poder verificar.

### 3.2 Con las herramientas que se intentaron antes en Chile

- Fueron **intermitentes**: aparecían para una elección y desaparecían.
- **Nunca explicaron cómo hacían el cálculo** del match entre votante y candidato.
- **Ninguna publicó su código** para que otros pudieran revisar si el cálculo era justo.
- **Las posturas asignadas a los candidatos no traían justificación ni fuente verificable.**

### 3.3 Con las VAAs internacionales que sí funcionan

Aún las herramientas exitosas del mundo tienen limitaciones que quisimos evitar:

- La mayoría usa **fórmulas muy simples** que tratan las diferencias grandes igual que las chicas.
- Pocas ofrecen **opción "No sé"**. Fuerzan al usuario a elegir "neutral" aunque no tenga opinión, lo que distorsiona el resultado.
- **No muestran nivel de confianza**: si respondiste 3 preguntas te muestran un 80% con la misma seguridad que si respondiste 30.
- **Dan un porcentaje global sin explicar en qué temas coincides o difieres** con cada candidato.
- **Muchas no son accesibles**: no funcionan bien para personas con discapacidad visual o motora.

---

## 4. Síntomas e impacto

Los problemas descritos se ven en la realidad chilena de varias maneras:

### 4.1 Lo que se observa

- Los votantes deciden por la imagen del candidato, por el partido de la familia, o por lo que dijo un amigo, más que por comparar propuestas.
- La votación cambia mucho entre una elección y la siguiente, señal de decisiones tomadas sin información sólida.
- La confianza en las instituciones políticas viene bajando desde hace años.
- Cada elección aparecen nuevas piezas de desinformación viralizadas.
- Antes del voto obligatorio, en muchas elecciones votaba menos de la mitad de la gente habilitada.

### 4.2 A quién afecta y cómo

**A cada votante:** termina eligiendo candidatos que en realidad no representan bien sus prioridades. Si le hubieran preguntado tema por tema, habría descubierto que su match era otro.

**A las instituciones democráticas:** las autoridades electas no siempre reflejan las mayorías reales del país, sino las mayorías mediáticas. Esto alimenta la desconfianza y la polarización.

**A la democracia en general:** el debate público se centra en los personajes en vez de en las propuestas. Se pierde la capacidad de conversar sobre política real.

---

## 5. Objetivos

### 5.1 Objetivo general

Diseñar y construir una aplicación móvil que funcione en teléfonos y en la web, disponible sin costo para cualquier ciudadano chileno, que le permita en menos de 10 minutos comparar sus propias posturas políticas con las de los candidatos en competencia, con un cálculo transparente y datos verificables.

### 5.2 Objetivos específicos

1. **Diseñar un cálculo de afinidad que sea justo y explicable.** Que no penalice igual a una diferencia chica que a una grande, que le permita al usuario decir qué temas le importan más, y que ofrezca la opción honesta "No sé".

2. **Construir una aplicación multiplataforma.** Un solo desarrollo que funcione bien en la web, en iPhone y en Android, sin tener que mantener tres apps distintas.

3. **Garantizar que cada postura de un candidato tenga fuente verificable.** Nadie debería creer un match sin poder ir a revisar de dónde salió la información.

4. **Asegurar la accesibilidad.** La aplicación debe funcionar bien para personas con distintas capacidades: buenos contrastes de color, navegación por teclado, botones grandes suficientes para ser presionados con facilidad, compatibilidad con lectores de pantalla.

5. **Publicar el código como open source.** Cualquier persona debe poder revisar cómo funciona el cálculo y proponer mejoras. Si alguien monta una versión modificada en público, la licencia lo obliga a compartir sus cambios (esa es la lógica de la licencia AGPL).

6. **Hacer una aplicación mantenible.** Con estructura clara, componentes reutilizables y pruebas automáticas, para que futuras personas puedan mejorarla sin romper lo que ya funciona.

---

## 6. Justificación

### 6.1 Es un aporte cívico concreto

En una democracia, la calidad del voto depende de la calidad de la información que tiene el votante. Si esa información es escasa, contradictoria o falsa, la democracia se debilita. Una aplicación como esta reduce esa asimetría entregando una herramienta comparativa que devuelve el foco a las propuestas concretas.

### 6.2 La tecnología para hacerlo ya existe

Hoy hay herramientas de programación maduras que permiten construir, con recursos modestos, aplicaciones que hace diez años requerían presupuestos de institución grande. Este proyecto aprovecha esa disponibilidad.

### 6.3 Es un caso de estudio académico completo

Este trabajo se enmarca en una tesis de pregrado sobre desarrollo de aplicaciones móviles. Cubre en un solo proyecto: diseño de arquitectura, creación de un algoritmo, integración entre servidor y aplicación, pruebas automatizadas, cumplimiento de estándares de accesibilidad, y publicación multiplataforma. Es un ejemplo integral de aplicación de lo aprendido en la carrera.

### 6.4 Ser open source es un principio, no un accidente

La tecnología electoral debe ser auditable. Los ciudadanos tienen derecho a saber cómo funciona un algoritmo que les recomienda por quién votar. Por eso el código es público bajo una licencia (AGPL) que obliga a cualquier fork público a compartir también sus modificaciones.

---

## 7. Beneficios

### 7.1 Para quien vota

- Puede comparar candidatos en menos de 10 minutos, en vez de horas.
- Recibe un ranking con criterios claros: sabe por qué un candidato aparece arriba y otro abajo.
- Ve un desglose por tema: puede coincidir mucho en economía con un candidato y muy poco en medio ambiente con el mismo.
- Puede verificar cada postura yendo directamente a la fuente citada.
- Usa la aplicación gratis, sin publicidad, y sin que se extraigan sus datos personales.

### 7.2 Para la ciudadanía informada

- Contribuye a reducir la desinformación al ofrecer una fuente confiable con citas verificables.
- Es una herramienta educativa: al pasar por el cuestionario, uno aprende cuáles son los ejes principales de la política pública chilena.
- Cada pregunta incluye un botón de información con explicación y repercusiones, para que quien no domine el tema pueda entenderlo.

### 7.3 Para investigadores, periodistas y académicos

- Existe un dataset abierto de posturas con fuentes, disponible para análisis.
- El código del algoritmo es público y auditable, permitiendo réplica académica.
- Se puede adaptar el sistema para elecciones parlamentarias, municipales, o para otros países.

### 7.4 Para los propios candidatos

- Reciben retroalimentación sobre en qué temas su programa genera más o menos afinidad con el electorado.
- Se incentiva la explicitación de posturas con fuentes verificables en lugar de comunicación vaga.

### 7.5 Para el ecosistema tecnológico chileno

- Es un ejemplo de proyecto cívico hecho con estándares profesionales.
- La base de código puede reutilizarse para otras iniciativas de tecnología ciudadana.

---

## 8. Metodología

El proyecto se construyó en sprints cortos, de una semana cada uno, entregando funcionalidades completas de punta a punta (servidor + aplicación + pruebas) en cada iteración. Este enfoque, conocido como **desarrollo iterativo**, permite corregir el rumbo si algo no funciona sin haber invertido meses en la dirección equivocada.

### 8.1 Fases del trabajo

**Fase 0 — Investigar qué existe.** Antes de construir nada, se estudió cómo son las VAAs de otros países, qué hacen bien, qué hacen mal, y qué falta en Chile. Este análisis produjo el documento `docs/comparacion-vaas.md` con comparación de 9 herramientas internacionales.

**Fase 1 — Diseñar la arquitectura.** Se definió cómo se organizarían los datos, qué información se guardaría, cómo se comunicarían el servidor y la aplicación, y qué tecnologías se usarían. La regla fue "elegir herramientas aburridas y probadas", no las más modernas.

**Fase 2 — Construir el MVP.** Se implementó funcionalidad por funcionalidad: primero autenticación, después el catálogo, después el cuestionario, después el cálculo de match, después los resultados, y así.

**Fase 3 — Auditar y limpiar.** Se hizo una revisión sistemática del código en busca de errores, malas prácticas o riesgos de seguridad. Se detectaron 17 problemas de distinta severidad y se corrigieron todos los críticos y altos.

**Fase 4 — Verificar los datos.** Se importaron 6 candidatos, 12 preguntas y 72 posturas iniciales, marcadas con niveles de confianza (alta, media, baja) para transparentar qué información aún requiere verificación adicional.

### 8.2 Prácticas aplicadas

- **Pruebas automáticas antes que código nuevo:** especialmente para las partes críticas como el algoritmo de cálculo.
- **Contrato claro entre servidor y aplicación:** el servidor publica un documento formal describiendo su API, y la aplicación lo consume de forma que si algo cambia en el servidor, la aplicación deja de compilar hasta que se ajuste. Esto evita errores en producción.
- **Componentes reutilizables:** los botones, formularios y controles visuales se construyeron una sola vez y se usan en todas las pantallas.
- **Nada se importa dos veces:** los importadores de datos pueden correrse muchas veces con el mismo efecto que una sola.

---

## 9. Marco teórico

Esta sección presenta los conceptos y las ideas de fondo sobre los que se apoya el proyecto.

### 9.1 Qué es una Voting Advice Application

Una VAA es una aplicación que compara las opiniones políticas de un votante con las de partidos o candidatos, y le muestra con quiénes tiene más afinidad. La primera fue **StemWijzer**, creada en Países Bajos en 1989 (originalmente distribuida en disquete). Los estudios académicos sobre estas herramientas muestran que llegan a mover entre el 2% y el 6% del voto en países con alto uso, por lo que no son un juguete: tienen impacto electoral real.

Las VAAs se diferencian entre sí por:

- **De dónde sacan las posturas de los candidatos:** algunas les preguntan directamente a los candidatos, otras contratan equipos que las investigan, otras hacen ambas cosas.
- **Qué escala usan para las respuestas:** algunas son binarias (a favor/en contra), otras usan 3 niveles, otras usan 5 (la escala Likert), otras usan opciones múltiples.
- **Cómo muestran el resultado:** algunas dan un ranking simple, otras dibujan un mapa 2D del espectro político, otras muestran un radar con varios ejes.

### 9.2 La escala Likert

Cuando alguien te pregunta "¿qué tan de acuerdo estás con X?" y te da 5 opciones (Muy en desacuerdo, En desacuerdo, Neutral, De acuerdo, Muy de acuerdo), eso es una escala Likert. La inventó el psicólogo Rensis Likert en 1932, y es hoy uno de los instrumentos más usados en encuestas de opinión en todo el mundo. Los estudios sobre estas escalas sugieren que 5 puntos es el balance óptimo entre precisión y fatiga: más opciones dan más detalle pero cansan al respondiente.

Tinder Decisivo usa la escala Likert de 5 puntos, y añade una sexta opción explícita: "No sé / Prefiero no responder", que no se cuenta en el cálculo. Esto es más honesto que forzar una respuesta neutral falsa.

### 9.3 Cómo se compara la afinidad

El proyecto no usa un promedio simple. Usa una fórmula que castiga más las diferencias grandes que las chicas. La idea es que estar "muy en desacuerdo" con un candidato en un tema debería descontar más puntos que dos pequeñas diferencias sumadas. Esto refleja mejor cómo las personas percibimos la similitud política.

Además, cada respuesta se puede ponderar por importancia: si dijiste "muy importante" en una pregunta, esa pregunta pesa el doble que una donde dijiste "poco importante", y cuatro veces más que una donde dijiste "no me importa".

### 9.4 Buenas prácticas de arquitectura de software

El proyecto se guía por principios establecidos de ingeniería:

- **SOLID**: cinco reglas para escribir código que sea fácil de mantener y modificar.
- **DRY** ("No te repitas"): si algo aparece dos veces en el código, hay que unificarlo.
- **YAGNI** ("No lo vas a necesitar"): no construir funcionalidades hipotéticas, solo las que se usan hoy.
- **Clean Architecture**: separar el código en capas con responsabilidades claras.
- **12-Factor App**: reglas para hacer aplicaciones que se puedan desplegar y escalar sin sorpresas.

### 9.5 Diseño atómico

Los componentes de la aplicación se organizan como una tabla periódica de elementos:

- **Átomos**: piezas mínimas (un botón, un cuadro de texto, un ícono).
- **Moléculas**: combinaciones simples (un campo de formulario con etiqueta, mensaje de error e ícono).
- **Organismos**: bloques funcionales (una barra de navegación, una tarjeta de candidato).
- **Templates**: esqueletos de pantalla completa.
- **Páginas**: pantallas reales con datos.

Esta metodología, propuesta por el diseñador Brad Frost, ayuda a mantener consistencia visual y a reutilizar componentes en toda la aplicación.

### 9.6 Accesibilidad web

Existe un estándar internacional del W3C llamado **WCAG 2.2** (*Web Content Accessibility Guidelines*) que define cómo debe ser una interfaz digital para ser accesible a personas con discapacidades. Incluye reglas como: contraste mínimo entre texto y fondo, tamaño mínimo de botones, capacidad de navegar todo con el teclado (sin mouse), compatibilidad con lectores de pantalla para personas ciegas.

Tinder Decisivo apunta al nivel AA de estas guías, que es el nivel exigido por leyes de accesibilidad de la mayoría de los países desarrollados.

---

## 10. Flujo del usuario

Esta sección describe qué pasa cuando alguien abre la aplicación por primera vez, hasta que ve su match con un candidato.

### 10.1 Vista general del recorrido

```
+------------------+
| Registro o Login |
+------------------+
         |
         v
+------------------+
| Home             |
| (elegir tipo de  |
|  elección)       |
+------------------+
         |
         v
+------------------+
| Cuestionario     |
| (12 preguntas    |
|  con importancia)|
+------------------+
         |
         v
+------------------+
| Enviado          |
+------------------+
         |
         v
+------------------+
| Resultados       |
| (ranking de      |
|  candidatos)     |
+------------------+
         |
    +----+-----+
    v          v
+---------+ +---------+
| Detalle | | Comparar|
| candi-  | | dos     |
| dato    | | candi-  |
|         | | datos   |
+---------+ +---------+
```

### 10.2 Paso a paso

**Paso 1 — Registrarse o iniciar sesión.**  
El usuario abre la aplicación. Si es la primera vez, se registra con nombre de usuario, correo y contraseña. Si ya tiene cuenta, ingresa con sus credenciales. La contraseña se guarda encriptada en el servidor, imposible de leer en claro incluso para quien administra la base de datos.

**Paso 2 — Elegir el tipo de elección.**  
Aparece la pantalla principal (Home) donde el usuario selecciona qué elección le interesa. En esta versión, la única opción disponible es "Presidencial".

**Paso 3 — Responder el cuestionario.**  
Se muestran las 12 preguntas de una en una. Cada pregunta es una afirmación política, por ejemplo: "Chile debe cerrar las centrales de carbón antes de 2030".

Para cada pregunta el usuario:
- Puede presionar un ícono de información para ver contexto y explicación de por qué el tema es relevante.
- Elige una de 5 opciones: Muy en desacuerdo, En desacuerdo, Neutral, De acuerdo, Muy de acuerdo. O bien "No sé", que hace que esa pregunta no cuente en el cálculo.
- Elige el nivel de importancia que le da a ese tema: No me importa, Poco, Medio, Mucho.

Puede volver atrás y cambiar respuestas anteriores antes de enviar.

**Paso 4 — Enviar el cuestionario.**  
Al llegar a la última pregunta y presionar "Enviar", todas las respuestas viajan al servidor y se guardan. Aparece una pantalla intermedia confirmando "Enviado" con un botón para ver los resultados.

**Paso 5 — Ver el cálculo del match.**  
Cuando el usuario presiona "Ver mis matches", el servidor:

1. Toma sus respuestas (ignorando las "No sé").
2. Toma las posturas de cada candidato de la elección.
3. Compara pregunta por pregunta.
4. Aplica la fórmula que castiga más las diferencias grandes.
5. Multiplica por la importancia que el usuario dio a cada tema.
6. Saca un porcentaje global y un porcentaje por cada eje temático (Economía, Sociedad, Ambiente, Seguridad, Derechos Humanos, Política Internacional, Reforma Institucional).
7. Determina un nivel de confianza según cuántas preguntas usó: si fueron pocas (menos de 5), el match es "tentativo"; si fueron muchas (10 o más), es "alto".

**Paso 6 — Ver el ranking de resultados.**  
Se muestra la lista de candidatos ordenados de mayor a menor afinidad. Cada uno con:
- Foto y nombre.
- Partido político.
- Porcentaje de match.
- Etiqueta con el nivel de confianza.

**Paso 7 — Ver el detalle de un candidato.**  
Al presionar sobre un candidato, se abre su perfil completo con:
- Biografía y propuesta electoral.
- Radar visual con los 7 ejes temáticos, mostrando cuánto se coincide en cada uno.
- Lista completa de todas las posturas del candidato, cada una con justificación y enlace a la fuente original.
- Noticias recientes del candidato (obtenidas automáticamente de la prensa chilena).

**Paso 8 — Comparar dos candidatos (opcional).**  
Desde el detalle o desde el menú, el usuario puede elegir dos candidatos y verlos lado a lado, comparando sus posturas pregunta por pregunta.

### 10.3 Otras cosas que puede hacer el usuario

- **Marcar candidatos como favoritos** para revisar después.
- **Descartar candidatos** que no le interesan, para simplificar la vista.
- **Guardar su decisión final** de voto (esta es privada, solo la ve el propio usuario).
- **Leer un feed de noticias** con las últimas noticias de todos los candidatos.
- **Editar su perfil**, cambiar su contraseña, o eliminar su cuenta.
- **Recuperar la contraseña** si se le olvida, mediante un correo con enlace de recuperación.

---

## 11. Diseño e implementación

Esta sección explica, sin entrar en detalles técnicos, cómo se construyó la aplicación.

### 11.1 Dos mitades: el servidor y la aplicación

Una aplicación moderna tiene dos partes principales:

**El servidor (backend).** Es una computadora en la nube que guarda todos los datos: los candidatos, las preguntas, las posturas, los usuarios, las respuestas de cada uno, los cálculos de match. También hace las cuentas cuando alguien pide su match. Está construido con Django, una tecnología madura ampliamente usada en el mundo (Instagram, Spotify y Pinterest la usaron en sus inicios).

**La aplicación (frontend).** Es lo que el usuario ve y toca. Está construida con React Native, una tecnología que permite escribir el código una sola vez y generar la aplicación para web, iPhone y Android. Es lo mismo que usan aplicaciones como Facebook, Instagram y Discord para tener una sola base de código en múltiples plataformas.

Ambas partes se hablan entre sí por internet, enviándose mensajes con un formato estándar (JSON) a través de un tipo de comunicación llamada API REST. Es como si el frontend fuera un mesero que pasa pedidos a una cocina (el backend) y espera la respuesta.

### 11.2 Qué se guarda en el servidor

El servidor mantiene varias tablas de información, análogas a hojas de un Excel gigante:

- **Usuarios**: nombre, correo, contraseña encriptada.
- **Tipos de elección**: Presidencial, Parlamentaria, etc.
- **Candidatos**: nombre, apellido, partido, biografía, foto, propuesta electoral.
- **Preguntas**: enunciado, eje temático (a qué categoría pertenece), orden en el cuestionario, explicación educativa.
- **Opciones de respuesta**: las 5 de la escala Likert más la opción "No sé".
- **Respuestas de los usuarios**: qué respondió cada uno y con qué importancia.
- **Posturas de los candidatos**: qué opina cada candidato de cada pregunta, con justificación y fuente.
- **Cálculos de match**: los porcentajes ya calculados por usuario y por candidato.
- **Favoritos, descartados y decisión final**: elecciones personales del usuario.
- **Noticias**: artículos de prensa asociados a cada candidato.

### 11.3 El algoritmo de match

Cuando el usuario pide su match, el servidor compara sus respuestas con las posturas de cada candidato. Para cada pregunta:

- Si el usuario respondió "Muy de acuerdo" (5) y el candidato tiene "Muy de acuerdo" (5), la diferencia es 0 y coinciden 100%.
- Si el usuario respondió "Muy de acuerdo" (5) y el candidato tiene "Muy en desacuerdo" (1), la diferencia es 4 y coinciden 0%.
- Las diferencias intermedias no dan puntajes lineales: una diferencia de 1 (casi igual) da 94% de coincidencia; una diferencia de 3 (grande) da solo 44%. Se castiga más fuerte las diferencias extremas.

Luego se multiplica por la importancia que el usuario le dio al tema. Si dijo "Muy importante", la pregunta pesa el doble.

Se suma todo, se divide por el peso total, y se obtiene un porcentaje.

Además de este porcentaje global, el servidor calcula un porcentaje por cada uno de los 7 ejes temáticos, para dibujar el radar que el usuario ve en el detalle del candidato.

### 11.4 Cómo se organiza el código

Tanto el servidor como la aplicación se organizan en capas claras, con la idea de que cada archivo tenga una responsabilidad específica.

**En el servidor:**
- Una capa que define las tablas de datos.
- Una capa que convierte los datos a JSON para enviarlos.
- Una capa que recibe los mensajes de la aplicación y decide qué hacer.
- Una capa aislada que contiene la lógica del algoritmo (esta se puede probar sin necesidad de conectar con la aplicación).
- Una capa de scripts que importan datos desde archivos CSV.

**En la aplicación:**
- Una capa que se comunica con el servidor.
- Componentes visuales organizados por complejidad (átomos, moléculas, organismos).
- Pantallas completas que combinan varios componentes.
- Una capa de servicios con la lógica que no depende de lo visual.
- Un estado global que guarda las respuestas del cuestionario mientras el usuario responde.

Esta organización tiene una ventaja concreta: si mañana quisiéramos cambiar cómo se ven los botones, tocamos solo la capa visual. Si quisiéramos mejorar el algoritmo, tocamos solo la capa de servicios. Los cambios son locales y no se propagan por toda la aplicación.

### 11.5 De dónde salen los datos de los candidatos

Chile no tiene una API pública oficial con las posturas de los candidatos. El SERVEL publica datos electorales, pero no las posiciones programáticas. Por eso, la solución adoptada es cargar los datos manualmente desde archivos CSV mediante scripts especiales que:

- Pueden ejecutarse varias veces sin duplicar información.
- Validan que cada fila tenga los campos requeridos.
- Marcan cada postura con un nivel de confianza (alta, media, baja) según qué tan bien verificada esté.
- Permiten previsualizar sin escribir (modo "dry-run") antes de aplicar los cambios.

Las noticias, en cambio, se obtienen automáticamente desde Google News, mediante un script que corre una vez al día y busca las noticias recientes de cada candidato.

### 11.6 Seguridad

La aplicación aplica varias medidas de seguridad:

- Las contraseñas se guardan encriptadas mediante un algoritmo llamado PBKDF2, que aplica 600.000 vueltas de encriptación. Es prácticamente imposible revertir.
- Los datos sensibles de configuración (claves, URLs, etc.) no viven dentro del código, sino en archivos aparte que no se suben a repositorios públicos.
- Cada solicitud del usuario debe venir acompañada de un token de autenticación. Sin token, el servidor no responde.
- Cada tipo de endpoint tiene reglas claras de quién puede acceder (usuario común, administrador, público general).
- En producción se planifica agregar límites de velocidad para evitar ataques de fuerza bruta y despliegue con HTTPS.

### 11.7 Pruebas automáticas

El proyecto tiene más de 40 pruebas automáticas que se corren cada vez que se hace un cambio. Estas pruebas verifican, entre otras cosas:

- Que el algoritmo dé los resultados correctos ante casos conocidos.
- Que las respuestas "No sé" se excluyan correctamente del cálculo.
- Que los importadores de datos sean seguros de correr múltiples veces.
- Que las noticias no se pueden modificar sin ser administrador.
- Que las contraseñas se guarden encriptadas.

Este conjunto de pruebas permite hacer cambios con confianza: si algo se rompe, las pruebas avisan antes de llegar a los usuarios.

### 11.8 Accesibilidad

La aplicación se diseñó pensando en el estándar WCAG 2.2 nivel AA. Se incluyó:

- Contraste de color suficiente entre texto y fondo (al menos 4.5:1).
- Botones y áreas táctiles con tamaño adecuado (mayor al mínimo recomendado).
- Estados visuales claros para focus, hover y disabled.
- Compatibilidad con lectores de pantalla mediante etiquetas descriptivas en cada elemento interactivo.

Se incluye además un script de auditoría automática que verifica el contraste de todos los colores de la aplicación contra la guía WCAG.

---

## 12. Conclusiones

### 12.1 Se cumplieron los objetivos principales

El proyecto logró construir una aplicación funcional de recomendación de voto para Chile, con las características que se propuso al inicio:

- Algoritmo transparente y explicable, superior al de la mayoría de VAAs internacionales en varios aspectos (opción "No sé" honesta, nivel de confianza, radar por eje).
- Arquitectura modular que separa datos, lógica y presentación.
- Contrato claro entre servidor y aplicación, que evita errores de coordinación.
- Datos con fuentes verificables en cada postura.
- Cobertura de pruebas que permite hacer cambios con confianza.
- Bases de accesibilidad implementadas.
- Aplicación multiplataforma desde un único código.

### 12.2 En qué estado está hoy

La aplicación está en versión MVP (0.1), la primera versión funcional. Tiene 12 funcionalidades completas de punta a punta, 3 con servidor listo pero sin interfaz visual, y 6 más planificadas para versiones futuras.

Está lista para ser presentada como trabajo de tesis. Para publicarla al gran público chileno, faltan aproximadamente 2 o 3 sprints más de trabajo, principalmente para agregar funcionalidades faltantes, verificar las posturas contra fuentes primarias, y hacer el despliegue en un servidor de producción.

### 12.3 Lo que se aprendió

**Sobre tecnología:**
- Combinar Django (servidor) con React Native (aplicación) es una fórmula muy productiva para un desarrollador solo.
- Definir un contrato formal entre servidor y aplicación (con OpenAPI) es una de las mejores decisiones del proyecto: evita muchísimos errores.
- Hacer auditorías del propio código de forma periódica ayuda a mejorar la calidad sin necesidad de reescribir todo.
- No construir funcionalidades "por si las necesito después" (principio YAGNI). Todo código que se escribe pero no se usa se convierte en carga.

**Sobre el problema:**
- Verificar las posturas de los candidatos contra fuentes primarias es más trabajo que programar la aplicación. Es la parte más costosa del proyecto.
- Diseñar buenas preguntas para el cuestionario requiere colaboración con personas expertas en ciencias políticas.
- Las VAAs exitosas del mundo comparten tres cosas: algoritmo transparente, datos verificados, y respaldo institucional continuo entre elecciones. Este último punto es el más difícil de replicar en Chile hoy.

### 12.4 Qué falta

**Prioridad alta** (para poder lanzar al público):
- Terminar la interfaz para favoritos, descartados y decisión final.
- Permitir usar la aplicación sin registrarse (para bajar la barrera de entrada).
- Verificar todas las 72 posturas iniciales contra fuentes primarias.

**Prioridad media** (para aguantar mucho tráfico):
- Migrar la base de datos a PostgreSQL en producción.
- Agregar cache para consultas frecuentes.
- Implementar límites de velocidad para evitar abuso.
- Configurar servidor de producción con las mejores prácticas.

**Prioridad baja** (mejoras deseables):
- Permitir compartir el resultado como imagen para redes sociales.
- Agregar un tour inicial para nuevos usuarios.
- Implementar monitoreo automático de errores.

### 12.5 Hacia dónde va el proyecto

Se identifican cuatro líneas de trabajo natural:

1. **Publicación pública** de la versión completa en `tinder-decisivo.cl`.
2. **Verificación colaborativa de datos**, en alianza con universidades o think tanks de análisis político.
3. **Explicabilidad avanzada**: agregar simulador "¿qué pasa si cambio esta respuesta?" y mapa 2D del espectro político.
4. **Investigación académica**: publicar análisis agregado y anonimizado de las respuestas, contribuyendo al estudio empírico de las VAAs en América Latina.

### 12.6 Una reflexión final

Este proyecto demuestra que es posible construir tecnología cívica de calidad profesional con recursos modestos, siempre que se apliquen buenos principios de ingeniería y disciplina en la verificación de datos. La combinación de código abierto, arquitectura limpia y datos trazables constituye una respuesta concreta a los problemas de desinformación y de asimetría de información que enfrenta el votante chileno.

La existencia de VAAs internacionales que llevan más de 30 años operando (StemWijzer nació en 1989) prueba que estas herramientas pueden ser sostenibles a largo plazo. El desafío en Chile no es técnico —eso lo demuestra este trabajo— sino institucional: encontrar un modelo de gobernanza y financiamiento que permita mantenerla activa entre elecciones, no solo cuando hay urgencia.

Si este proyecto sirve, aunque sea como semilla, para que en el futuro Chile tenga su propia VAA consolidada como Wahl-O-Mat en Alemania o StemWijzer en Países Bajos, habrá cumplido más de lo que buscaba una tesis de pregrado.

---

## 13. Bibliografía

### 13.1 Sobre Voting Advice Applications

- Cedroni, L., & Garzia, D. (Eds.). (2010). *Voting Advice Applications in Europe: The State of the Art*. Napoli: ScriptaWeb.
- Garzia, D., & Marschall, S. (Eds.). (2014). *Matching Voters with Parties and Candidates: Voting Advice Applications in a Comparative Perspective*. Colchester: ECPR Press.
- Marschall, S. (2005). *Idee und Wirkung des Wahl-O-Mat*. Aus Politik und Zeitgeschichte, 51-52.
- Walgrave, S., van Aelst, P., & Nuytemans, M. (2008). "Do the vote test": The electoral effects of a Popular Vote Advice Application at the 2004 Belgian Elections. *Acta Politica*, 43, 50-70.

### 13.2 VAAs consultadas

- StemWijzer (Países Bajos). https://stemwijzer.nl/
- Wahl-O-Mat (Alemania). https://www.bpb.de/themen/wahl-o-mat/
- Smartvote (Suiza). https://www.smartvote.ch/
- Kieskompas (Países Bajos). https://www.kieskompas.nl/
- Vote Compass (Canadá y Australia). https://votecompass.com/

### 13.3 Sobre desinformación electoral

- Fast Check CL. https://www.fastcheck.cl/
- Mala Espina Check. https://malaespinacheck.cl/
- Servicio Electoral de Chile (SERVEL). https://www.servel.cl/
- Datos abiertos SERVEL. https://opendata.servel.cl/

### 13.4 Sobre escalas de medición

- Likert, R. (1932). A Technique for the Measurement of Attitudes. *Archives of Psychology*, 140, 1-55.

### 13.5 Sobre buenas prácticas de software

- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer: From Journeyman to Master*. Addison-Wesley.
- Wiggins, A. (2011). *The Twelve-Factor App*. https://12factor.net/
- Frost, B. (2016). *Atomic Design*. https://atomicdesign.bradfrost.com/

### 13.6 Sobre accesibilidad

- World Wide Web Consortium (W3C). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

### 13.7 Sobre las tecnologías utilizadas

- Django. https://www.djangoproject.com/
- React Native. https://reactnative.dev/
- Expo. https://expo.dev/

### 13.8 Documentación interna del proyecto

- `docs/algoritmo-simple.md` — Explicación del algoritmo sin matemática.
- `docs/sistema-simple.md` — Arquitectura en lenguaje simple.
- `docs/comparacion-vaas.md` — Comparación con VAAs internacionales.
- `docs/estado-actual.md` — Estado de las funcionalidades y trabajo pendiente.

---

*Documento elaborado como parte de la tesis de pregrado sobre desarrollo de aplicaciones móviles. Autora: Jenifer Castillo (@whatebria). Repositorio: https://github.com/whatebria/tinder-decisivo. Licencia del código: AGPL-3.0.*
