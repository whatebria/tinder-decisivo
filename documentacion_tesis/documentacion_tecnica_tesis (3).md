# matchVote — Diseño e Implementación

**Una aplicación para ayudar a los chilenos a decidir su voto**

*Versión para todo público — 2.0 — 2026-07-26*

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

Chile es uno de los países con más elecciones en América Latina. En una década, un votante chileno tiene que decidir sobre elecciones presidenciales, parlamentarias (senadores y diputados), municipales (alcaldes y concejales), regionales y plebiscitos. Son decenas de decisiones, muchas veces varias al mismo tiempo, con listas diferentes de candidatos según en qué comuna o distrito vive cada uno.

Pensemos en un caso concreto: un ciudadano que vive en Ñuñoa el día de las próximas elecciones va a votar simultáneamente por:
- Un candidato presidencial (los mismos para todo Chile).
- Un diputado del Distrito 10 (uno de los 8 candidatos que compiten en su distrito específico).
- Un alcalde para la comuna de Ñuñoa (diferente al alcalde que se elige en Providencia o La Reina).

Cada uno de estos procesos tiene 5 a 15 candidaturas, y cada candidatura publica un programa de 80 a 200 páginas. Comparar todo antes de votar toma literalmente semanas de lectura. **Nadie lo hace.**

En otros países existen desde hace décadas herramientas digitales para resolver este problema. Se llaman **Voting Advice Applications** (VAA). La primera, *StemWijzer*, nació en Países Bajos en 1989 y hoy la usan millones de votantes por elección. En Alemania la herramienta se llama *Wahl-O-Mat*, en Suiza *Smartvote*.

En Chile, sin embargo, **no existe una VAA activa, transparente y sostenida en el tiempo**. Hubo intentos como *Voto Informado* y *Decide Chile*, pero fueron intermitentes o se abandonaron. El votante chileno hoy no tiene un equivalente local.

Este proyecto, llamado **matchVote**, busca llenar ese vacío.

---

## 2. Definición del problema

El votante chileno se encuentra frente a una decisión importante —a quién elegir— con varios obstáculos grandes:

**Obstáculo 1: Demasiada información y muy poco tiempo.**  
Los programas oficiales son extensos y técnicos.

**Obstáculo 2: Desinformación circulando en redes sociales.**  
Especialmente desde 2020, es común encontrar en WhatsApp, TikTok, Instagram y Facebook mensajes falsos o manipulados sobre lo que los candidatos supuestamente proponen. *Fast Check CL* y *Mala Espina Check* revisan cientos de estos mensajes cada semana. El problema es que el mensaje falso se comparte mil veces más rápido que la verificación.

**Obstáculo 3: No hay una herramienta chilena que compare candidatos.**  
En Alemania cualquier votante entra a Wahl-O-Mat y en 15 minutos ve cuál partido está más cerca de sus posturas. En Chile no existe una herramienta parecida que esté activa y sea confiable.

**Obstáculo 4: Cada elección tiene sus propios candidatos según dónde vives.**  
Un votante en La Serena y otro en Puerto Montt van a votar por candidatos presidenciales iguales, pero por diputados y alcaldes completamente distintos. Una herramienta útil tiene que saber dónde vives para mostrarte los que te corresponden.

En resumen: **el votante chileno tiene que decidir sin buena información, en un ambiente contaminado por desinformación, sin una herramienta neutral que lo ayude a comparar, y con múltiples elecciones simultáneas cuyos candidatos dependen de su comuna.**

Ese es el problema que matchVote busca resolver.

---

## 3. Problemas encontrados

Durante la investigación para diseñar esta aplicación, identificamos varios problemas concretos:

### 3.1 Con la información que hoy existe

- **Los programas son ilegibles para la mayoría.**
- **Los medios se enfocan en frases de impacto o encuestas**, no en comparar propuestas puntuales.
- **Circulan muchas mentiras** en cadenas de mensajes y redes sociales.
- **La información está dispersa** en el sitio del candidato, entrevistas en YouTube, redes propias, notas de prensa.
- **Cuando un medio dice "X candidato propone Y", raramente muestra la fuente exacta.**
- **El votante debe decidir sobre varias elecciones a la vez** con listas de candidatos que cambian según su ubicación.

### 3.2 Con las herramientas que se intentaron antes en Chile

- Fueron **intermitentes**: aparecían para una elección y desaparecían.
- **Nunca explicaron cómo hacían el cálculo** del match.
- **Ninguna publicó su código** para que otros pudieran revisar si el cálculo era justo.
- **Las posturas no traían justificación ni fuente verificable.**
- **Solo cubrían elecciones nacionales**, dejando fuera las municipales y distritales donde los candidatos cambian según dónde vives.

### 3.3 Con las VAAs internacionales que sí funcionan

Aún las herramientas exitosas del mundo tienen limitaciones que quisimos evitar:

- La mayoría usa **fórmulas muy simples** que tratan las diferencias grandes igual que las chicas.
- Pocas ofrecen **opción "No sé"**.
- **No muestran nivel de confianza**: 3 preguntas o 30, la app te muestra un porcentaje con la misma seguridad.
- **Dan un porcentaje global sin explicar en qué temas coincides o difieres** con cada candidato.
- **No te dicen qué pregunta específica hizo que un candidato salga arriba** o abajo en tu ranking.
- **Muchas no son accesibles** para personas con discapacidad visual o motora.

---

## 4. Síntomas e impacto

### 4.1 Lo que se observa

- Los votantes deciden por la imagen del candidato, por el partido de la familia, o por lo que dijo un amigo, más que por comparar propuestas.
- La votación cambia mucho entre una elección y la siguiente, señal de decisiones tomadas sin información sólida.
- La confianza en las instituciones políticas viene bajando desde hace años.
- Cada elección aparecen nuevas piezas de desinformación viralizadas.
- Antes del voto obligatorio, en muchas elecciones votaba menos de la mitad de la gente habilitada.

### 4.2 A quién afecta y cómo

**A cada votante:** termina eligiendo candidatos que en realidad no representan bien sus prioridades.

**A las instituciones democráticas:** las autoridades electas no siempre reflejan las mayorías reales del país. Esto alimenta la desconfianza y la polarización.

**A la democracia en general:** el debate público se centra en los personajes en vez de en las propuestas.

---

## 5. Objetivos

### 5.1 Objetivo general

Diseñar y construir una aplicación móvil que funcione en teléfonos y en la web, disponible sin costo para cualquier ciudadano chileno, que le permita en menos de 15 minutos comparar sus posturas políticas con las de los candidatos en competencia para **varias elecciones simultáneamente** (presidencial, parlamentaria, municipal), con un cálculo transparente, exposición al usuario de las posturas asignadas a cada candidato, y filtrado automático según la comuna donde vive el usuario.

### 5.2 Objetivos específicos

1. **Diseñar un cálculo de afinidad que sea justo y explicable.** Que no penalice igual a una diferencia chica que a una grande, que le permita al usuario decir qué temas le importan más, que ofrezca la opción honesta "No sé", y que muestre no solo el porcentaje total sino también qué preguntas contribuyeron más al resultado.

2. **Soportar múltiples elecciones al mismo tiempo.** El usuario debe poder ver su match para las 2-3 elecciones activas en un momento dado, con preguntas de valores compartidas entre ellas (para no repetir las mismas 5 veces).

3. **Filtrar candidatos según la ubicación del votante.** Si vives en Ñuñoa, la app te muestra solo los alcaldes de Ñuñoa y los diputados del Distrito 10, no los de todo Chile.

4. **Construir una aplicación multiplataforma.** Un solo desarrollo que funcione bien en la web, iPhone y Android.

5. **Mostrar al usuario qué postura tiene asignada cada candidato en cada pregunta.** El usuario debe poder revisar, dentro de la propia aplicación, cuál fue la respuesta que se le atribuyó a cada candidato en cada tema, sin tener que consultar fuentes externas.

6. **Asegurar la accesibilidad.** Buenos contrastes, botones grandes, navegación por teclado, compatibilidad con lectores de pantalla.

7. **Publicar el algoritmo de matching en la propia documentación del proyecto.** Cualquier persona que lea la documentación debe poder entender exactamente cómo se calcula el porcentaje de afinidad, sin dependencia de que el código se libere en un repositorio público.

8. **Hacer una aplicación mantenible.** Estructura clara, componentes reutilizables, pruebas automáticas.

9. **Facilitar el despliegue.** Empaquetar la aplicación en un contenedor Docker para que cualquiera pueda instalarla en su propio servidor.

---

## 6. Justificación

### 6.1 Es un aporte cívico concreto

En una democracia, la calidad del voto depende de la calidad de la información que tiene el votante. Si esa información es escasa, contradictoria o falsa, la democracia se debilita. Una aplicación como esta reduce esa asimetría entregando una herramienta comparativa que devuelve el foco a las propuestas concretas.

### 6.2 La tecnología para hacerlo ya existe

Hoy hay herramientas de programación maduras que permiten construir, con recursos modestos, aplicaciones que hace diez años requerían presupuestos de institución grande. Este proyecto aprovecha esa disponibilidad.

### 6.3 Es un caso de estudio académico completo

Este trabajo se enmarca en una tesis de pregrado sobre desarrollo de aplicaciones móviles. Cubre en un solo proyecto: diseño de arquitectura, creación de un algoritmo, integración entre servidor y aplicación, pruebas automatizadas, cumplimiento de estándares de accesibilidad, despliegue multiplataforma, empaquetado con Docker.

### 6.4 La transparencia sobre el algoritmo y las posturas es un principio, no un accidente

La tecnología electoral debe ser auditable a nivel de idea, no solo a nivel de código. Los ciudadanos tienen derecho a saber cómo funciona un algoritmo que les recomienda por quién votar y qué postura se le atribuyó a cada candidato en cada pregunta. Por eso matchVote publica la fórmula completa del cálculo dentro de la propia documentación del proyecto, y expone al usuario dentro de la aplicación las posturas asignadas a cada candidato, para que pueda revisarlas antes de confiar en el porcentaje de afinidad.

---

## 7. Beneficios

### 7.1 Para quien vota

- Puede comparar candidatos en menos de 15 minutos, incluyendo varias elecciones a la vez.
- La app se acuerda de sus posturas ideológicas: no hay que responder "¿estás a favor del aborto?" en el cuestionario de la presidencial y otra vez en el de la parlamentaria — se responde una sola vez y aplica a todas.
- La app filtra automáticamente los candidatos según su comuna: si vive en Ñuñoa, ve solo los alcaldes de Ñuñoa y los diputados del Distrito 10.
- Recibe un ranking con criterios claros y puede ver qué preguntas contribuyeron más al resultado.
- Ve un desglose por tema en un gráfico de radar.
- Puede verificar cada postura yendo directamente a la fuente citada.
- Usa la aplicación gratis, sin publicidad, y sin que se extraigan sus datos personales.

### 7.2 Para la ciudadanía informada

- Contribuye a reducir la desinformación al ofrecer una fuente comparativa estructurada y consultable.
- Es una herramienta educativa: al pasar por el cuestionario se aprende cuáles son los ejes principales de la política pública chilena.
- Cada pregunta incluye un botón "Saber más" con contexto y repercusiones.

### 7.3 Para investigadores, periodistas y académicos

- Existe un dataset abierto de posturas con fuentes, disponible para análisis.
- El código del algoritmo es público y auditable, permitiendo réplica académica.
- El sistema territorial se puede adaptar a otros países latinoamericanos con estructura similar (regiones → distritos → comunas).

### 7.4 Para los propios candidatos

- Reciben retroalimentación sobre en qué temas su programa genera más o menos afinidad con el electorado.
- Se incentiva la explicitación de posturas de manera clara y consultable dentro de la aplicación.

### 7.5 Para el ecosistema tecnológico chileno

- Es un ejemplo de proyecto cívico hecho con estándares profesionales.
- La base de código puede reutilizarse para otras iniciativas de tecnología ciudadana.

---

## 8. Metodología

El proyecto se construyó en sprints cortos, de una semana cada uno, entregando funcionalidades completas de punta a punta (servidor + aplicación + pruebas) en cada iteración. Este enfoque, conocido como **desarrollo iterativo**, permite corregir el rumbo si algo no funciona sin haber invertido meses en la dirección equivocada.

### 8.1 Fases del trabajo

**Fase 0 — Investigar qué existe.** Se estudió cómo son las VAAs de otros países. Este análisis produjo el documento `docs/comparacion-vaas.md` con comparación de 9 herramientas internacionales.

**Fase 1 — Diseñar la arquitectura.** Se definió cómo se organizarían los datos, cómo se comunicarían el servidor y la aplicación, y qué tecnologías se usarían. La regla fue "elegir herramientas aburridas y probadas".

**Fase 2 — Construir el MVP inicial.** Se implementó funcionalidad por funcionalidad.

**Fase 3 — Auditar y limpiar.** Se hizo una revisión sistemática del código. Se detectaron 17 problemas iniciales y se corrigieron todos los críticos y altos. Meses después se hizo otra ronda que resolvió 4 hallazgos críticos y 6 de severidad alta adicionales.

**Fase 4 — Agregar el sistema territorial y multi-elección.** Se agregó soporte para las 16 regiones, 28 distritos y 346 comunas de Chile, y se rediseñó el sistema para que el cálculo del match filtre automáticamente los candidatos según la comuna del usuario. Además, se introdujo el concepto de "preguntas base" que se responden una sola vez y aplican a todas las elecciones (los valores ideológicos son transversales). Se crearon seeds específicos para presidenciales 2025, diputados 2025, alcaldes 2024 y parlamentaria genérica.

**Fase 5 — Simplificación agresiva.** Se aplicó de forma retroactiva el principio YAGNI ("no vas a necesitar eso"): se eliminaron features que no probaron su utilidad, como el flujo Tinder-swipe original y el módulo de "decisión final". También se unificaron las pantallas separadas de favoritos y descartados en una sola pantalla con tabs.

**Fase 6 — Sistema de diseño interno y accesibilidad.** Se creó una pantalla oculta con el catálogo completo de componentes y colores para facilitar el diseño consistente. Se publicó una guía de accesibilidad WCAG por pantalla y un mapa completo de navegación con coach marks y empty states.

**Fase 7 — Documentación estructurada.** Se reorganizó toda la documentación en dos niveles: técnica (10 documentos) y accesible (5 documentos), para que tanto desarrolladores como personas no técnicas puedan entender cómo funciona la app.

### 8.2 Prácticas aplicadas

- **Pruebas automáticas antes que código nuevo**, especialmente para las partes críticas como el algoritmo.
- **Contrato claro entre servidor y aplicación**: el servidor publica un documento formal describiendo su API, y la aplicación lo consume de forma que si algo cambia en el servidor, la aplicación deja de compilar hasta que se ajuste.
- **Componentes reutilizables**: los botones, formularios y controles visuales se construyeron una sola vez y se usan en todas las pantallas.
- **Nada se importa dos veces**: los importadores de datos pueden correrse muchas veces con el mismo efecto que una sola.
- **Coraje para eliminar lo que no sirve**: si una funcionalidad no probó su utilidad, se saca. Esto simplifica el mantenimiento.

---

## 9. Marco teórico

### 9.1 Qué es una Voting Advice Application

Una VAA es una aplicación que compara las opiniones políticas de un votante con las de partidos o candidatos, y le muestra con quiénes tiene más afinidad. La primera fue **StemWijzer**, creada en Países Bajos en 1989. Los estudios académicos muestran que llegan a mover entre el 2% y el 6% del voto en países con alto uso.

### 9.2 La escala Likert

Cuando alguien te pregunta "¿qué tan de acuerdo estás con X?" y te da 5 opciones (Muy en desacuerdo, En desacuerdo, Neutral, De acuerdo, Muy de acuerdo), eso es una escala Likert. La inventó Rensis Likert en 1932 y es hoy uno de los instrumentos más usados en encuestas de opinión. Los estudios sugieren que 5 puntos es el balance óptimo entre precisión y fatiga: más opciones dan más detalle pero cansan al respondiente.

matchVote usa la escala Likert de 5 puntos, y añade una sexta opción explícita: "No sé / Prefiero no responder", que no se cuenta en el cálculo. Esto es más honesto que forzar una respuesta neutral falsa.

### 9.3 Cómo se compara la afinidad

El proyecto usa una fórmula que castiga más las diferencias grandes que las chicas. Estar "muy en desacuerdo" con un candidato en un tema debería descontar más puntos que dos pequeñas diferencias sumadas. Esto refleja mejor cómo las personas percibimos la similitud política.

Además, cada respuesta se puede ponderar por importancia: si dijiste "muy importante" en una pregunta, esa pregunta pesa el doble que una donde dijiste "poco importante", y cuatro veces más que una donde dijiste "no me importa".

**La fórmula en palabras**. Para cada pregunta se calcula la diferencia entre tu respuesta y la del candidato. Esa diferencia se divide por 4 (el máximo posible en una escala de 5 puntos) para dejarla en un rango entre 0 y 1, y luego se eleva al cuadrado. El resultado se resta de 1, y eso da el puntaje de esa pregunta en una escala de 0 (opuesto total) a 1 (idéntico). Ese puntaje se multiplica por el peso que le pusiste a la pregunta (0.5, 1.0, 1.5 o 2.0 según poco / normal / importante / muy importante). Al final se suman todos los puntajes ponderados y se dividen por la suma de los pesos, y ese cociente por 100 es tu porcentaje de afinidad con ese candidato.

Las preguntas donde respondiste "No sé" no entran en el cálculo: ni suman ni restan, simplemente no cuentan.

**Un ejemplo concreto**. Imagina que respondes 5 preguntas comparando tus posturas con las de un candidato:

- **Pregunta 1** — tú: "muy de acuerdo" (5), candidato: "de acuerdo" (4), peso: muy importante. Diferencia = 1. Puntaje = 0.9375. Ponderado = 0.9375 × 2.0 = **1.875**.
- **Pregunta 2** — tú: "en desacuerdo" (2), candidato: "neutro" (3), peso: importante. Diferencia = 1. Puntaje = 0.9375. Ponderado = 0.9375 × 1.5 = **1.406**.
- **Pregunta 3** — tú: "muy en desacuerdo" (1), candidato: "muy en desacuerdo" (1), peso: normal. Diferencia = 0. Puntaje = 1.0. Ponderado = 1.0 × 1.0 = **1.000**.
- **Pregunta 4** — tú: "de acuerdo" (4), candidato: "en desacuerdo" (2), peso: poco importante. Diferencia = 2. Puntaje = 0.75. Ponderado = 0.75 × 0.5 = **0.375**.
- **Pregunta 5** — tú: "No sé", candidato: "neutro" (3). Esta pregunta se excluye del cálculo.

La suma de los puntajes ponderados es 1.875 + 1.406 + 1.000 + 0.375 = **4.656**. La suma de los pesos usados es 2.0 + 1.5 + 1.0 + 0.5 = **5.0**. El porcentaje de afinidad es 4.656 / 5.0 = 0.9312, o sea aproximadamente **93%**.

Como solo se consideraron 4 preguntas efectivas (la quinta se excluyó por "No sé"), la aplicación además te muestra un nivel de confianza `tentativa`, advirtiéndote que ese 93% se calculó con pocos datos. Con 5 a 9 preguntas efectivas la confianza sube a `media`, y con 10 o más a `alta`.

### 9.4 Territorio en cascada

Chile tiene una estructura territorial anidada: el país se divide en 16 regiones, cada región en distritos electorales (28 en total), y cada distrito en comunas (346 en total). Un votante vive en UNA comuna, que pertenece a UN distrito, que pertenece a UNA región, que pertenece al país.

Esto se aprovecha en el cálculo del match: si vives en Ñuñoa, la app te muestra:
- Los candidatos presidenciales (todos, porque son de scope nacional).
- Los diputados del Distrito 10 (que incluye Ñuñoa entre otras comunas).
- Los alcaldes de Ñuñoa (los candidatos que compiten específicamente en tu comuna).

No te muestra los alcaldes de Puerto Montt ni los diputados de Antofagasta, porque no son tuyos. Este filtrado automático se implementa con un modelo de datos llamado "unidad territorial" que representa cualquier nivel (nacional, regional, distrital, comunal) y permite navegar la jerarquía hacia arriba (de una comuna hacia su distrito, región, país) para decidir qué candidatos mostrar.

### 9.5 Buenas prácticas de arquitectura de software

El proyecto se guía por principios establecidos:

- **SOLID**: cinco reglas para escribir código mantenible.
- **DRY** ("No te repitas"): si algo aparece dos veces, hay que unificarlo.
- **YAGNI** ("No lo vas a necesitar"): no construir funcionalidades hipotéticas, solo las que se usan hoy. Y eliminar las que no probaron su valor.
- **Clean Architecture**: separar el código en capas con responsabilidades claras.
- **12-Factor App**: reglas para hacer aplicaciones que se puedan desplegar y escalar sin sorpresas.

### 9.6 Diseño atómico

Los componentes de la aplicación se organizan como una tabla periódica de elementos:

- **Átomos**: piezas mínimas (un botón, un cuadro de texto, un ícono).
- **Moléculas**: combinaciones simples (un campo de formulario con etiqueta e ícono).
- **Organismos**: bloques funcionales (una barra de navegación, una tarjeta de candidato).
- **Templates**: esqueletos de pantalla completa (por ejemplo, el shell que envuelve toda la app con navegación).
- **Páginas**: pantallas reales con datos.

Esta metodología, propuesta por Brad Frost, ayuda a mantener consistencia visual y a reutilizar componentes.

### 9.7 Accesibilidad web

Existe un estándar internacional del W3C llamado **WCAG 2.2** que define cómo debe ser una interfaz digital para ser accesible a personas con discapacidades: contraste mínimo entre texto y fondo, tamaño mínimo de botones, capacidad de navegar todo con el teclado, compatibilidad con lectores de pantalla.

matchVote apunta al nivel AA de estas guías. Además implementa coach marks contextuales (pequeñas ayudas que aparecen la primera vez que llegas a una pantalla nueva) y empty states educativos (mensajes útiles cuando una lista está vacía).

---

## 10. Flujo del usuario

Esta sección describe qué pasa cuando alguien abre la aplicación por primera vez, hasta que ve su match con un candidato.

### 10.1 Vista general del recorrido

```
[Bienvenida (5 slides)]
         │
         ▼
[Registro o Login]
         │
         ▼
[Elegir tu comuna]
(opcional pero recomendado)
         │
         ▼
[Home HUB]
(muestra las elecciones activas
 con tarjetas por cada una)
         │
   ┌─────┼──────────┐
   ▼     ▼          ▼
[Gestión  [Cuestionario  [Novedades]
 de elec.] de una elec.]
              │
              ▼
      [Enviado]
              │
              ▼
      [Resultados]
      (ranking + radar)
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
[Detalle  [Comparar  [Mis
 candid.]  dos]      Guardados]
    │
    ▼
[Explicación
 pregunta-a-pregunta]
```

### 10.2 Paso a paso

**Paso 1 — Bienvenida.**  
La primera vez que se abre la app, aparece un tour de 5 slides que explica qué hace, cómo funciona y qué la hace diferente. Se puede saltar en cualquier momento.

**Paso 2 — Registrarse o iniciar sesión.**  
Si es la primera vez, el usuario se registra con nombre de usuario, correo y contraseña. Si ya tiene cuenta, ingresa con sus credenciales. La contraseña se guarda encriptada.

**Paso 3 — Elegir la comuna.**  
Después del registro, la app le pregunta al usuario en qué comuna vive. Este paso es opcional (se puede saltar) pero muy recomendado: sin él, la app no puede mostrar los candidatos correctos para diputados y alcaldes. Si el usuario se salta este paso, siempre puede completarlo después desde Configuración.

**Paso 4 — Home HUB.**  
Aparece la pantalla principal, que muestra una tarjeta por cada elección activa (presidencial, parlamentaria, municipal). Cada tarjeta indica:
- El nombre de la elección.
- Cuántos días faltan.
- El scope territorial (por ejemplo: "Ñuñoa · Distrito 10 · Nacional").
- El estado del cuestionario para esa elección: no empezado / en progreso / completado.
- Un botón contextual: "Empezar", "Continuar" o "Ver mis resultados".

Los nuevos usuarios ven una pequeña ayuda flotante ("coach mark") que explica cómo usar estas tarjetas.

**Paso 5 — Gestión de elecciones (opcional).**  
El usuario puede activar o desactivar las elecciones que le interesa seguir. Por ejemplo, si no le interesa la municipal, la desactiva y no le aparece en el Home.

**Paso 6 — Responder el cuestionario.**  
Al entrar a una elección, se muestran las preguntas. Aquí hay algo importante: además de las preguntas específicas de esa elección, aparecen también las **preguntas base** (transversales de valores ideológicos) que se responden UNA SOLA VEZ y aplican a todas las elecciones. Así, si el usuario ya respondió antes "¿estás a favor del aborto?" al hacer el cuestionario presidencial, no tiene que responderla de nuevo al hacer el parlamentario.

Para cada pregunta el usuario:
- Puede presionar "Saber más" para ver contexto y explicación del tema.
- Elige una de 5 opciones (Muy en desacuerdo hasta Muy de acuerdo) o "No sé" (que hace que esa pregunta no cuente).
- Elige el nivel de importancia que le da al tema (No me importa, Poco, Medio, Mucho).

Puede volver atrás y cambiar respuestas antes de enviar. La barra de progreso muestra por separado las preguntas base y las específicas.

**Paso 7 — Enviar el cuestionario.**  
Al llegar al final, todas las respuestas viajan al servidor. Aparece una pantalla intermedia confirmando "Enviado" con un botón para ver los resultados.

**Paso 8 — Cálculo del match.**  
Cuando el usuario presiona "Ver mis matches", el servidor:

1. Toma sus respuestas (ignorando las "No sé").
2. Toma los candidatos de la elección, **filtrando según la comuna del usuario**: si es presidencial, todos los candidatos; si es parlamentaria, solo los del distrito del usuario; si es municipal, solo los de la comuna.
3. Compara pregunta por pregunta usando la fórmula que castiga más las diferencias grandes.
4. Multiplica por la importancia que el usuario dio a cada tema.
5. Saca un porcentaje global y un porcentaje por cada eje temático (Economía, Sociedad, Ambiente, Seguridad, Derechos Humanos, Política Internacional, Reforma Institucional).
6. Determina un nivel de confianza (tentativo / medio / alto) según cuántas preguntas usó.

**Paso 9 — Ver el ranking de resultados.**  
Se muestra el candidato en primer lugar destacado (con foto grande, propuesta y match%), seguido por el resto en un ranking. Cada uno con:
- Foto y nombre.
- Partido político.
- Porcentaje de match.
- Etiqueta con el nivel de confianza.

Si el usuario no ha definido su comuna, aparece un banner que le sugiere hacerlo, con un botón directo para configurarla.

**Paso 10 — Ver el detalle de un candidato.**  
Al presionar sobre un candidato, se abre su perfil con:
- Biografía y propuesta electoral.
- Radar visual con los 7 ejes temáticos, mostrando cuánto se coincide en cada uno.
- **Sección "¿Por qué este match?"** que muestra pregunta por pregunta cuál fue tu respuesta, cuál fue la del candidato, cuánta era la diferencia, y cuánto contribuyó al porcentaje final. Ordenadas por impacto: las que más pesaron aparecen arriba.
- Lista completa de todas las posturas del candidato, cada una con justificación y enlace a la fuente original.
- Noticias recientes del candidato (obtenidas automáticamente de la prensa chilena).

**Paso 11 — Comparar dos candidatos.**  
Se puede elegir dos candidatos y verlos lado a lado, comparando sus posturas pregunta por pregunta. Hay un toggle "Solo diferencias" para ver solo las preguntas donde piensan distinto.

**Paso 12 — Mis Guardados.**  
Todos los candidatos que el usuario marcó como favoritos (o descartó explícitamente), y también las posturas y noticias que guardó para revisar después, viven en una sola pantalla con tres pestañas.

### 10.3 Otras cosas que puede hacer el usuario

- **Leer un feed de novedades** con las últimas noticias de los candidatos, filtrable por elección.
- **Editar su perfil**, cambiar su contraseña, o eliminar su cuenta.
- **Cambiar su comuna** en cualquier momento (los matches se recalculan con la nueva ubicación).
- **Recuperar la contraseña** si se le olvida, mediante un correo con enlace seguro.
- **Editar respuestas ya enviadas** desde "Mis Respuestas" en Configuración.

### 10.4 Navegación en móvil vs desktop

En **teléfonos** la aplicación usa una barra inferior con 5 íconos (Home, Guardados, Comparar, Novedades, Configuración). En **desktop** los mismos 5 items aparecen en una barra lateral izquierda que se puede colapsar. Es el mismo componente que se adapta al tamaño de pantalla.

---

## 11. Diseño e implementación

Esta sección explica, sin entrar en detalles técnicos, cómo se construyó la aplicación.

### 11.1 Dos mitades: el servidor y la aplicación

**El servidor (backend).** Es una computadora en la nube que guarda todos los datos y hace las cuentas cuando alguien pide su match. Está construido con Django, una tecnología madura ampliamente usada (Instagram, Spotify y Pinterest la usaron en sus inicios). El servidor viene empaquetado en un contenedor Docker, lo que facilita desplegarlo en cualquier proveedor de nube sin configuraciones complejas.

**La aplicación (frontend).** Es lo que el usuario ve y toca. Está construida con React Native, una tecnología que permite escribir el código una sola vez y generar la aplicación para web, iPhone y Android. Es lo mismo que usan Facebook, Instagram y Discord.

Ambas partes se hablan entre sí por internet, enviándose mensajes con un formato estándar (JSON) a través de una API REST.

### 11.2 Qué se guarda en el servidor

El servidor mantiene varias tablas de información:

**Sobre los usuarios**:
- Usuarios (con nombre, correo y contraseña encriptada).
- Perfil del usuario (con la comuna donde vive, para el filtrado territorial).

**Sobre las elecciones**:
- Tipos de elección (Presidencial 2025, Parlamentaria 2025, Municipal 2024, etc.), con año específico y una marca que indica si sus preguntas son "base" (transversales) o específicas.
- Candidatos (con nombre, apellido, partido, biografía, foto, propuesta, y su ámbito territorial).

**Sobre el territorio de Chile**:
- 16 regiones (norte a sur).
- 28 distritos electorales.
- 346 comunas.
- Un modelo unificado "unidad territorial" que representa cualquier nivel (nacional, regional, distrital, comunal) y permite navegar la jerarquía.

**Sobre el cuestionario**:
- Ejes temáticos (con color y descripción, gestionables desde el panel de admin).
- Preguntas (con enunciado, explicación educativa, repercusiones).
- Opciones de respuesta.
- Respuestas de los usuarios (qué respondió cada uno y con qué importancia).
- Posturas de los candidatos (qué opina cada candidato de cada pregunta, con justificación y fuente).

**Sobre el matching y las acciones del usuario**:
- Matches calculados.
- Favoritos, descartados y bookmarks de posturas y noticias.

**Sobre las noticias**:
- Artículos de prensa asociados a cada candidato.

**Otros**:
- Tokens de recuperación de contraseña.

### 11.3 El algoritmo de match

Cuando el usuario pide su match, el servidor compara sus respuestas con las posturas de cada candidato. Para cada pregunta:

- Si el usuario respondió "Muy de acuerdo" (5) y el candidato tiene "Muy de acuerdo" (5), coinciden 100%.
- Si el usuario respondió "Muy de acuerdo" (5) y el candidato tiene "Muy en desacuerdo" (1), coinciden 0%.
- Las diferencias intermedias dan puntajes no lineales: una diferencia chica descuenta poco (94% de coincidencia); una diferencia grande descuenta mucho (44%).

Luego se multiplica por la importancia que el usuario le dio al tema, y se suma todo.

**Novedad clave: filtrado territorial.** Antes de comparar, el servidor filtra los candidatos según la comuna del usuario. Un usuario de Ñuñoa verá:
- Todos los candidatos presidenciales (no tienen scope territorial).
- Solo los diputados del Distrito 10 (donde está Ñuñoa).
- Solo los alcaldes de Ñuñoa.
- En el futuro, cuando se agreguen senadores, solo los de la Región Metropolitana.

Todo esto se logra con el modelo de "unidad territorial" que permite navegar de una comuna hacia su distrito, región y país en cascada.

**Preguntas base:** las preguntas de valores/ideología (que se responden una sola vez) se incluyen automáticamente en el cálculo de cualquier elección. Así, si el usuario respondió sobre "aborto" al hacer el cuestionario presidencial, esa respuesta también cuenta cuando calcula su match con los diputados.

Además del porcentaje global, el servidor calcula:
- Un porcentaje por cada eje temático (para el radar).
- Un nivel de confianza según cuántas preguntas se usaron.
- Un desglose pregunta-a-pregunta (para la sección "¿Por qué este match?" que aparece en el detalle del candidato).

### 11.4 Cómo se organiza el código

Tanto el servidor como la aplicación se organizan en capas claras, con la idea de que cada archivo tenga una responsabilidad específica.

**En el servidor** hay separación clara entre:
- Modelos de datos (organizados en 10 archivos, uno por dominio: usuarios, cuestionario, matching, territorio, ejes, etc.).
- Serializadores (que convierten los datos a JSON).
- Vistas (que reciben las peticiones y responden).
- Servicios (donde vive la lógica pura, testeable sin necesidad de servidor).
- Comandos (scripts que se corren desde la línea de comandos para cargar datos).

**En la aplicación** los componentes visuales se organizan por complejidad (átomos, moléculas, organismos, templates), hay pantallas completas que los combinan, servicios con lógica pura, y un estado global que guarda las respuestas del cuestionario mientras el usuario responde.

Esta organización tiene una ventaja concreta: si mañana quisiéramos cambiar cómo se ven los botones, tocamos solo la capa visual. Si quisiéramos mejorar el algoritmo, tocamos solo la capa de servicios. Los cambios son locales.

### 11.5 De dónde salen los datos de los candidatos

Chile no tiene una API pública oficial con las posturas de los candidatos. La solución es cargar los datos desde archivos CSV o desde scripts Python, mediante comandos especiales:

**Importadores desde CSV**: para cargas manuales.

**Seeds programáticos**: para elecciones específicas.
- Uno que carga las 16 regiones, 28 distritos y 346 comunas de Chile.
- Uno que carga las preguntas base (valores transversales).
- Uno que carga las preguntas por tipo de elección.
- Uno específico para las presidenciales 2025.
- Uno específico para los diputados 2025.
- Uno específico para los alcaldes 2024.
- Uno para la parlamentaria genérica.
- Uno que carga las explicaciones educativas de cada pregunta.

Todos los importadores tienen tres propiedades importantes:
- **Son idempotentes**: se pueden correr muchas veces sin duplicar datos.
- **Validan cada fila**: si una fila está mal, la reportan pero no abortan las demás.
- **Tienen modo "dry-run"**: se pueden ejecutar en modo simulación para ver qué harían antes de aplicar cambios.

Además, las noticias se obtienen automáticamente desde Google News mediante un script que corre una vez al día. Y hay un comando que limpia los tokens de recuperación de contraseña vencidos.

### 11.6 Seguridad

La aplicación aplica varias medidas de seguridad:

- Las contraseñas se guardan encriptadas mediante un algoritmo llamado PBKDF2, que aplica 600.000 vueltas de encriptación.
- Los datos sensibles (claves, URLs, etc.) no viven dentro del código, sino en archivos aparte que no se suben a repositorios públicos.
- Cada solicitud del usuario debe venir acompañada de un token de autenticación.
- Cada tipo de endpoint tiene reglas claras de quién puede acceder.
- Los tokens de recuperación de contraseña expiran automáticamente.
- El sistema pasó por dos rondas de auditoría de seguridad, con resolución de 4 problemas críticos y 10 de severidad alta en total.

### 11.7 Pruebas automáticas

El proyecto tiene 25 archivos de pruebas automáticas que verifican, entre otras cosas:

- Que el algoritmo dé los resultados correctos ante casos conocidos.
- Que el filtrado territorial funcione (un usuario en Ñuñoa no vea alcaldes de Puerto Montt).
- Que las respuestas "No sé" se excluyan del cálculo.
- Que las preguntas base se compartan correctamente entre elecciones.
- Que los importadores sean seguros de correr múltiples veces.
- Que las noticias no se pueden modificar sin ser administrador.
- Que las contraseñas se guarden encriptadas.
- Que el sistema de tokens de reset de contraseña funcione.

Este conjunto de pruebas permite hacer cambios con confianza: si algo se rompe, las pruebas avisan antes de llegar a los usuarios.

### 11.8 Accesibilidad

La aplicación se diseñó pensando en el estándar WCAG 2.2 nivel AA. Se incluyó:

- Contraste de color suficiente entre texto y fondo.
- Botones con tamaño adecuado (mayor al mínimo recomendado).
- Estados visuales claros para focus, hover y disabled.
- Compatibilidad con lectores de pantalla.
- Coach marks contextuales (pequeñas ayudas la primera vez que se llega a una pantalla clave).
- Empty states educativos cuando una lista está vacía.
- Navegación por teclado completa.

Se incluye además un script de auditoría automática que verifica el contraste de todos los colores contra la guía WCAG, y una guía completa (`docs/accesibilidad.md`) con los requisitos por pantalla.

### 11.9 Sistema de diseño interno

La aplicación incluye una pantalla oculta (accesible solo en modo desarrollo) que muestra el catálogo completo del sistema de diseño: todos los colores, tipografías, espaciados, sombras, todos los átomos, moléculas y organismos, cada uno con sus variantes y su código de uso. Esto facilita mantener consistencia visual y sirve como documentación viva para futuros desarrolladores.

### 11.10 Despliegue con Docker

El servidor viene con un `Dockerfile` que permite crear una imagen lista para desplegar. Esto significa que cualquiera puede correr el servidor con un solo comando, sin necesidad de instalar manualmente Python, dependencias, o configurar el entorno. Facilita también el despliegue en servicios de nube como AWS, Google Cloud o Azure.

---

## 12. Conclusiones

### 12.1 Se cumplieron los objetivos principales

El proyecto logró construir una aplicación funcional de recomendación de voto para Chile, con las características que se propuso al inicio:

- Algoritmo transparente y explicable, superior al de la mayoría de VAAs internacionales en varios aspectos (opción "No sé" honesta, nivel de confianza, radar por eje, explicación pregunta-a-pregunta).
- Sistema multi-elección con filtrado territorial automático según la comuna del usuario.
- Preguntas base transversales que se responden una sola vez.
- Arquitectura modular que separa datos, lógica y presentación.
- Datos con posturas visibles al usuario dentro de la propia aplicación.
- Cobertura de pruebas amplia (25 archivos de pruebas).
- Bases de accesibilidad implementadas y auditadas.
- Aplicación multiplataforma desde un único código (web + iOS + Android).
- Empaquetado con Docker para despliegue reproducible.

### 12.2 En qué estado está hoy

La aplicación tiene:
- 18 pantallas funcionales.
- Sistema territorial operativo (regiones, distritos, comunas + unidad territorial polimórfica).
- Seeds para 4 tipos de elecciones diferentes (presidencial 2025, diputados 2025, alcaldes 2024, parlamentaria genérica).
- Design system interno completo.
- Documentación estructurada: 10 documentos técnicos + 5 documentos accesibles + una guía WCAG + mapa de navegación.

Como parte de la evolución, se eliminaron algunas funcionalidades que se construyeron inicialmente pero que no probaron su utilidad:
- El flujo Tinder-swipe original (que le daba el nombre al proyecto).
- El módulo de "decisión final" (registrar cuál candidato elegí).
- Las pantallas separadas de favoritos y descartados (se unificaron en una sola con tabs).

Esto se hizo aplicando el principio YAGNI de forma retroactiva: si una feature no probó su valor, eliminarla simplifica el mantenimiento sin costo funcional real.

### 12.3 Lo que se aprendió

**Sobre tecnología:**
- Combinar Django (servidor) con React Native (aplicación) es una fórmula muy productiva para un desarrollador solo.
- Definir un contrato formal entre servidor y aplicación es una de las mejores decisiones del proyecto: evita muchísimos errores.
- Hacer auditorías periódicas del propio código mejora la calidad sin necesidad de reescribir todo.
- Eliminar código que no aporta valor es tan importante como agregar código nuevo.
- Los modelos jerárquicos polimórficos (como "unidad territorial") son la respuesta correcta cuando el dominio tiene múltiples niveles de scope. Evitan tener que crear una nueva columna para cada nivel.

**Sobre el problema:**
- Documentar el algoritmo completo hizo más trabajo que codificarlo, y armó el dataset ilustrativo de posturas de la tesis es un trabajo curatorial que en un despliegue productivo requeriría revisar cada postura contra fuentes primarias documentadas.
- El sistema territorial chileno (16 regiones, 28 distritos, 346 comunas) es manejable cuando se modela con la abstracción correcta.
- El votante rara vez decide sobre una sola elección; el diseño multi-elección con preguntas transversales es más natural que un cuestionario por elección aislado.
- Los coach marks contextuales (pequeñas ayudas al llegar a una pantalla) son más efectivos que un tour lineal exhaustivo al inicio.

### 12.4 Qué falta

**Prioridad alta** (para poder lanzar al público):
- Reemplazar el dataset ilustrativo de la tesis por un dataset curado con posturas revisadas contra fuentes primarias documentadas.
- Habilitar el modo invitado en la interfaz (el servidor ya lo soporta).
- Completar la migración territorial (limpiar las columnas antiguas ahora que el sistema nuevo funciona).

**Prioridad media** (para aguantar mucho tráfico):
- Migrar la base de datos a PostgreSQL en producción.
- Agregar cache para consultas frecuentes.
- Implementar límites de velocidad para evitar abuso.

**Prioridad baja** (mejoras deseables):
- Permitir compartir el resultado como imagen para redes sociales.
- Implementar monitoreo automático de errores.
- Configurar deploy automático desde el repositorio.

### 12.5 Hacia dónde va el proyecto

1. **Publicación pública** de la versión completa en `matchvote.cl`.
2. **Verificación colaborativa de datos**, en alianza con universidades o think tanks.
3. **Ampliar el catálogo territorial**: agregar senadores por circunscripción (usando el mismo modelo territorial sin necesidad de cambios estructurales) y consejeros regionales.
4. **Explicabilidad avanzada**: agregar simulador "¿qué pasa si cambio esta respuesta?" y mapa 2D del espectro político.
5. **Investigación académica**: publicar análisis agregado y anonimizado.

### 12.6 Una reflexión final

Este proyecto demuestra que es posible construir tecnología cívica de calidad profesional con recursos modestos, siempre que se apliquen buenos principios de ingeniería, disciplina en el diseño del algoritmo, y coraje para eliminar lo que no sirve. La combinación de transparencia sobre el algoritmo y las posturas asignadas a cada candidato, arquitectura limpia y modelo territorial flexible constituye una respuesta concreta a los problemas de desinformación electoral, ausencia de VAA chilena y complejidad multi-elección que enfrenta el votante.

La existencia de VAAs internacionales que llevan más de 30 años operando (StemWijzer nació en 1989) prueba que estas herramientas pueden ser sostenibles a largo plazo. El desafío en Chile no es técnico —eso lo demuestra este trabajo— sino institucional: encontrar un modelo de gobernanza y financiamiento que permita mantenerla activa entre elecciones.

Si este proyecto sirve, aunque sea como semilla, para que en el futuro Chile tenga su propia VAA consolidada como Wahl-O-Mat en Alemania o StemWijzer en Países Bajos, habrá cumplido más de lo que buscaba una tesis de pregrado.

---

## 13. Bibliografía

### 13.1 Sobre Voting Advice Applications

- Cedroni, L., & Garzia, D. (Eds.). (2010). *Voting Advice Applications in Europe: The State of the Art*. Napoli: ScriptaWeb.
- Garzia, D., & Marschall, S. (Eds.). (2014). *Matching Voters with Parties and Candidates: Voting Advice Applications in a Comparative Perspective*. Colchester: ECPR Press.
- Marschall, S. (2005). *Idee und Wirkung des Wahl-O-Mat*. Aus Politik und Zeitgeschichte, 51-52.

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

- Martin, R. C. (2017). *Clean Architecture*. Prentice Hall.
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer*. Addison-Wesley.
- Wiggins, A. (2011). *The Twelve-Factor App*. https://12factor.net/
- Frost, B. (2016). *Atomic Design*. https://atomicdesign.bradfrost.com/

### 13.6 Sobre accesibilidad

- World Wide Web Consortium (W3C). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

### 13.7 Marco legal y territorial de Chile

- Decreto Ley 575 (División política administrativa de Chile).
- Ley 20.840 de 2015 (Sistema electoral proporcional inclusivo).
- Ley 21.073 de 2018 (Reformas al sistema electoral).

### 13.8 Sobre las tecnologías utilizadas

- Django. https://www.djangoproject.com/
- React Native. https://reactnative.dev/
- Expo. https://expo.dev/
- Docker. https://docs.docker.com/

### 13.9 Documentación interna del proyecto

- `README.es.md` — Descripción general del proyecto.
- `docs/algoritmo-simple.md` — Explicación del algoritmo sin matemática.
- `docs/sistema-simple.md` — Arquitectura en lenguaje simple.
- `docs/comparacion-vaas.md` — Comparación con VAAs internacionales.
- `docs/estado-actual.md` — Estado de las funcionalidades y trabajo pendiente.
- `docs/accesibilidad.md` — Guía de accesibilidad.
- `docs/mapa-navegacion.md` — Mapa completo de rutas.
- `docs/backend/simple/*` — 5 documentos accesibles sobre el servidor: qué hace, datos, match, cómo agregar cosas, troubleshooting.

---

*Documento elaborado como parte de la tesis de pregrado sobre desarrollo de aplicaciones móviles. Autora: Jenifer Castillo. Versión 2.0 del documento, actualizada tras las fases de multi-elección territorial, simplificación YAGNI, design system interno y documentación estructurada.*
