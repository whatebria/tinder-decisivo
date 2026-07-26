# Diseño e Implementación de Tinder Decisivo

**Una aplicación móvil de asesoramiento electoral (VAA) para el contexto chileno**

*Documentación técnica del proyecto — versión 1.0 — 2026-07-25*

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

Chile es una democracia representativa con una de las agendas electorales más frecuentes de América Latina. En un ciclo típico de diez años, un ciudadano chileno enfrenta decisiones sobre elecciones presidenciales, parlamentarias (senadores y diputados), municipales (alcaldes y concejales), regionales (gobernadores y consejeros), y plebiscitos constitucionales. Cada uno de estos procesos implica evaluar candidaturas, plataformas programáticas y trayectorias políticas, con un volumen de información que supera la capacidad de análisis del votante promedio.

El Servicio Electoral de Chile (SERVEL) mantiene un registro público de candidaturas y resultados en `servel.cl`, y publica datasets abiertos en `opendata.servel.cl`. Sin embargo, esta información se distribuye en formatos administrativos (CSV, XLSX, PDF) orientados al escrutinio y no al votante. No existe, al momento de este trabajo, una API pública oficial que exponga las posturas programáticas de los candidatos en formato consumible por aplicaciones.

En paralelo, en el ecosistema internacional han proliferado desde 1989 las llamadas **Voting Advice Applications (VAA)**: herramientas digitales que comparan las posiciones políticas declaradas por un votante con las de partidos o candidatos, y ofrecen un ranking de afinidad. Los VAAs más consolidados —StemWijzer (Países Bajos), Wahl-O-Mat (Alemania), Smartvote (Suiza) y Kieskompas— reciben millones de usos por elección y, según literatura politológica, influyen entre 2% y 6% del voto en países con alta penetración.

En Chile, los intentos de replicar este modelo han sido intermitentes: *Voto Informado* opera solo en periodo electoral y sin algoritmo formal de matching, y *Decide Chile* (activo entre 2017 y 2021) se encuentra discontinuado. **No existe actualmente en Chile una VAA activa, con algoritmo transparente, código abierto y datos verificables**. Este vacío es el punto de partida de *Tinder Decisivo*.

---

## 2. Definición del problema

### 2.1 Enunciado

El votante chileno enfrenta un problema estructural de **asimetría de información** al momento de decidir su voto: dispone de tiempo limitado, canales de información fragmentados y polarizados, y ninguna herramienta institucional o civil que le permita comparar de forma sistemática y transparente las posturas de los candidatos frente a políticas públicas concretas.

Este problema se agrava por tres factores concurrentes:

1. **Desinformación electoral**: en Chile, especialmente desde el plebiscito constitucional de 2022, se ha documentado un crecimiento sostenido de campañas de desinformación en redes sociales, cadenas de mensajería instantánea (WhatsApp, Telegram) y medios afines a candidaturas. Iniciativas como *Fast Check CL*, *Mala Espina Check* y el observatorio de la Universidad Diego Portales han reportado un volumen creciente de contenido falso o descontextualizado circulando durante los periodos de campaña.

2. **Ausencia de una VAA chilena consolidada**: mientras Alemania cuenta con Wahl-O-Mat operado por la Agencia Federal para la Educación Cívica (bpb), y Países Bajos con StemWijzer sostenido por la fundación ProDemos, en Chile ninguna institución pública ni universidad ha logrado sostener una VAA activa entre elecciones. El resultado es que el votante chileno no tiene un equivalente local a estas herramientas.

3. **Guías electorales tradicionales inadecuadas**: los formatos existentes fallan por dos extremos opuestos. Por un lado, los programas oficiales de candidaturas publicados en el SERVEL son documentos extensos (habitualmente entre 80 y 200 páginas por candidatura) que exigen horas de lectura. Por otro, las coberturas mediáticas breves reducen la comparación a etiquetas de partido o eslóganes, sin permitir un contraste por política pública.

### 2.2 Formalización

El problema puede formalizarse como una **decisión bajo información incompleta**: dado un conjunto `C = {c1, c2, ..., cn}` de candidaturas y un conjunto `P = {p1, p2, ..., pm}` de políticas públicas relevantes, el votante `v` requiere estimar una función de afinidad `f(v, ci)` que le permita ordenar `C` por proximidad ideológica. Sin instrumentos que faciliten este cálculo, el votante recurre a heurísticas de baja calidad (imagen del candidato, adhesión partidaria histórica, opinión de círculo cercano) o simplemente se abstiene.

---

## 3. Problemas encontrados

Durante la fase de investigación y análisis del estado del arte se identificaron los siguientes problemas concretos que motivaron el diseño de la solución:

### 3.1 Problemas de la oferta actual de información electoral

| # | Problema | Descripción |
|---|----------|-------------|
| P1 | Sobrecarga informativa | Los programas oficiales de candidaturas superan las capacidades atencionales del votante promedio. |
| P2 | Sesgo mediático | La cobertura de prensa privilegia titulares, controversias y encuestas por sobre la comparación programática. |
| P3 | Desinformación organizada | Circulación masiva de contenido falso, memes descontextualizados y noticias manipuladas en redes sociales. |
| P4 | Fragmentación de fuentes | La información sobre un mismo candidato se dispersa entre programa oficial, entrevistas, redes propias, medios afines y hostiles. |
| P5 | Falta de trazabilidad | Cuando un medio o influencer afirma "el candidato X propone Y", raramente se cita la fuente primaria verificable. |

### 3.2 Problemas de las VAAs previas en Chile

| # | Problema | Descripción |
|---|----------|-------------|
| P6 | Discontinuidad operativa | *Decide Chile* y otros intentos se activaron solo en un ciclo electoral y luego fueron abandonados, perdiendo datos históricos. |
| P7 | Algoritmos opacos | Las herramientas existentes no publican su fórmula de matching, imposibilitando auditoría independiente. |
| P8 | Ausencia de código abierto | Ninguna VAA chilena previa liberó su código bajo licencia libre, impidiendo forks, correcciones colaborativas y continuidad. |
| P9 | Datos no verificables | Las posturas asignadas a candidatos no incluían URL de fuente primaria ni justificación textual auditable. |

### 3.3 Problemas técnicos identificados en soluciones análogas

Del análisis comparativo (ver `docs/comparacion-vaas.md`) surgieron limitaciones técnicas comunes que la solución busca evitar:

| # | Problema | Descripción |
|---|----------|-------------|
| P10 | Algoritmos lineales simplistas | La mayoría de VAAs promedian diferencias sin penalizar más fuerte las diferencias extremas. |
| P11 | Ausencia de opción "No sé" honesta | Los VAAs suelen forzar al usuario a una posición neutral cuando en realidad no tiene opinión, distorsionando el cálculo. |
| P12 | Sin nivel de confianza | Un match del 80% basado en 3 preguntas se presenta con la misma autoridad que uno basado en 30, generando falsa precisión. |
| P13 | Sin explicabilidad por dimensión | La mayoría entrega un porcentaje global sin desglose por eje temático, impidiendo entender *por qué* el match es alto o bajo. |
| P14 | Ausencia de accesibilidad | Pocas VAAs cumplen con las directrices WCAG (Web Content Accessibility Guidelines), excluyendo a votantes con discapacidad visual, motora o cognitiva. |

---

## 4. Síntomas e impacto

Los problemas descritos se manifiestan en el sistema electoral chileno a través de síntomas medibles y con consecuencias sobre la calidad democrática.

### 4.1 Síntomas observables

1. **Voto por imagen o adhesión partidaria heredada**: encuestas del Centro de Estudios Públicos (CEP) y del Latinobarómetro muestran que un porcentaje significativo del electorado chileno declara no conocer las propuestas específicas de los candidatos por los que vota.

2. **Alta volatilidad electoral entre ciclos**: la fragmentación del voto y los cambios abruptos entre elecciones sucesivas sugieren decisiones tomadas con información limitada.

3. **Desafección política creciente**: mediciones de confianza en instituciones políticas muestran caídas sostenidas en Chile durante la última década.

4. **Circulación viral de contenido falso**: verificadores independientes han documentado un aumento de piezas de desinformación en cada proceso electoral desde 2020.

5. **Abstención en elecciones voluntarias históricas**: antes del retorno al voto obligatorio, las tasas de participación cayeron por debajo del 50%.

### 4.2 Impacto

El impacto de estos síntomas se distribuye en tres niveles:

**Nivel individual**: el votante toma decisiones que no reflejan sus preferencias reales sobre políticas públicas. Elige candidatos con quienes discrepa en temas que declararía como prioritarios si se le preguntara explícitamente.

**Nivel institucional**: se erosiona la representatividad del sistema. Los electos no siempre reflejan las mayorías programáticas del electorado, sino las mayorías mediáticas o de imagen. Esto retroalimenta la desconfianza institucional.

**Nivel democrático**: la deliberación pública se degrada cuando el debate se centra en personajes en lugar de propuestas. El espacio para acuerdos programáticos entre sectores se reduce, y la polarización afectiva reemplaza a la discusión política sustantiva.

---

## 5. Objetivos

### 5.1 Objetivo general

Diseñar e implementar una aplicación móvil multiplataforma de asesoramiento electoral (VAA) para el contexto chileno, con algoritmo de matching transparente, datos verificables con fuentes primarias, arquitectura modular y código abierto, que permita al votante contrastar sus posturas frente a políticas públicas con las de los candidatos en competencia.

### 5.2 Objetivos específicos

1. **Algoritmo de matching robusto**: implementar un algoritmo de cálculo de afinidad que supere las limitaciones de los promedios lineales, incorporando (a) penalización cuadrática para diferencias extremas, (b) ponderación declarada por el usuario según importancia percibida de cada tema, (c) manejo explícito de respuestas "No sé" mediante exclusión del cálculo, y (d) nivel de confianza asociado al número de preguntas efectivamente consideradas.

2. **Arquitectura modular y escalable**: aplicar principios SOLID, DRY y YAGNI en la separación de capas backend (modelos, vistas, serializadores, servicios) y frontend (atomic design con átomos, moléculas, organismos y pantallas), permitiendo evolución independiente de cada capa.

3. **Contrato API tipado y auto-documentado**: exponer la API REST bajo el estándar OpenAPI 3.1 mediante `drf-spectacular`, y generar automáticamente los tipos TypeScript del frontend desde el schema, eliminando el drift entre backend y frontend.

4. **Transparencia de datos**: enforzar a nivel de código y de importadores que cada postura asignada a un candidato incluya (a) URL de fuente primaria pública, (b) justificación textual auditable, y (c) nivel de confianza declarado (`ALTA`, `MEDIA`, `BAJA`).

5. **Cobertura de pruebas**: mantener una suite de pruebas automatizadas (unitarias e integración) sobre backend (algoritmo, importadores, permisos, endpoints) y frontend (servicios puros, hooks) que permita refactorizaciones seguras.

6. **Accesibilidad WCAG 2.2 nivel AA**: cumplir con las pautas del World Wide Web Consortium para accesibilidad web, incluyendo contraste de color, navegación por teclado, targets táctiles mínimos y compatibilidad con lectores de pantalla.

7. **Multiplataforma con un solo código base**: entregar la aplicación en formato web (PWA), iOS y Android desde un único codebase mediante React Native con Expo.

---

## 6. Justificación

La justificación de este proyecto se sostiene en cuatro dimensiones:

### 6.1 Justificación cívica

En una democracia representativa, la calidad del voto depende de la calidad de la información disponible al votante. Cuando esta información es asimétrica, fragmentada o está contaminada por desinformación, la deliberación democrática se degrada. Una VAA transparente contribuye a reducir esta asimetría, entregando una herramienta comparativa sistemática que devuelve al debate político el foco sobre propuestas concretas.

### 6.2 Justificación tecnológica

El estado del arte en desarrollo móvil multiplataforma (React Native + Expo), APIs auto-documentadas (OpenAPI 3.1 + drf-spectacular) y bases de datos livianas para MVP (SQLite con path claro de migración a PostgreSQL) permite construir un sistema completo con recursos limitados. La existencia de estas herramientas maduras hace viable un proyecto que hace una década habría requerido presupuestos institucionales.

### 6.3 Justificación académica

Este trabajo se enmarca en una tesis de pregrado en desarrollo de aplicaciones móviles. Constituye un caso de estudio integral que cubre: diseño de arquitecturas modulares, aplicación de patrones de diseño (atomic design, arquitectura en capas), diseño de algoritmos numéricos, integración de contratos API tipados, testing automatizado, cumplimiento de estándares de accesibilidad, y despliegue multiplataforma. Como tal, ejemplifica la aplicación integrada de los contenidos curriculares de la carrera.

### 6.4 Justificación de código abierto

La elección de licenciar el proyecto bajo AGPL-3.0 responde a una convicción explícita: la tecnología electoral es infraestructura de interés público. Los ciudadanos deben poder auditar el algoritmo que les recomienda candidaturas, y cualquier despliegue público modificado debe compartir sus cambios. Esta decisión distingue al proyecto de las VAAs comerciales y de las de código cerrado.

---

## 7. Beneficios

### 7.1 Para el votante

- Reducción significativa del tiempo requerido para comparar candidaturas: de horas de lectura de programas a 5-10 minutos de cuestionario.
- Ranking objetivo con criterios explícitos y auditables.
- Desglose por eje temático que permite decisiones matizadas (por ejemplo, priorizar afinidad económica sobre social, o viceversa).
- Trazabilidad: cada postura asignada a un candidato viene con justificación y URL de fuente, permitiendo verificación independiente.
- Acceso multiplataforma sin costo, sin publicidad y sin extracción de datos personales.

### 7.2 Para la ciudadanía informada

- Contribución a la reducción de la desinformación mediante una fuente única, auditable y con fuentes primarias explícitas.
- Herramienta educativa que expone los ejes temáticos de la política pública chilena.
- Contenido educativo dentro de la app (repercusiones y explicación de cada pregunta).

### 7.3 Para investigadores y periodistas

- Dataset público de posturas de candidatos con fuentes verificables.
- Código auditable del algoritmo, permitiendo réplica y validación académica.
- Posibilidad de fork y adaptación para otras elecciones (parlamentarias, municipales, regionales) o para otros países latinoamericanos.

### 7.4 Para candidaturas y equipos programáticos

- Retroalimentación sobre coherencia programática: qué preguntas causan mayor afinidad o distancia con el electorado tipo.
- Incentivo a explicitar posturas con fuentes verificables en lugar de comunicación difusa.

### 7.5 Para el ecosistema tecnológico chileno

- Ejemplo de proyecto ciudadano con estándares profesionales (contract-first API, atomic design, WCAG AA, testing automatizado).
- Base de código reutilizable para otras iniciativas cívicas (`GovTech` chileno).

---

## 8. Metodología

### 8.1 Enfoque general

El proyecto se desarrolló siguiendo una metodología **iterativa e incremental**, con sprints de una semana, entregas verticales end-to-end (backend + frontend + pruebas) por feature, y refactorización guiada por auditorías periódicas del código.

### 8.2 Fases

**Fase 0 — Investigación y análisis del estado del arte**
- Revisión de la literatura académica sobre VAAs.
- Análisis comparativo de 9 VAAs internacionales en 12 dimensiones (`docs/comparacion-vaas.md`).
- Identificación de brechas en el ecosistema chileno.

**Fase 1 — Diseño de arquitectura**
- Modelo de dominio (8 entidades principales).
- Definición de contrato API bajo OpenAPI 3.1.
- Selección de stack tecnológico bajo criterio de "herramientas aburridas y probadas".

**Fase 2 — Implementación del MVP**
- Sprints funcionales: autenticación → catálogo → cuestionario → matching → resultados → detalle de candidato → noticias.
- TDD parcial: pruebas antes de código para el algoritmo de matching y los importadores.

**Fase 3 — Auditoría y refactorización**
- Auditoría de código con 17 hallazgos categorizados por severidad.
- Corrección de hallazgos críticos y altos previo a cualquier publicación.
- Refactorización de modelos y vistas a submódulos por dominio (reducción de acoplamiento).

**Fase 4 — Verificación de datos**
- Importación de 6 candidatos y 12 preguntas mediante CSV.
- 72 posturas borrador con nivel de confianza declarado, pendientes de verificación contra fuentes primarias para v0.2.

### 8.3 Prácticas aplicadas

- **Contract-first**: el schema OpenAPI es la fuente de verdad. Los tipos TypeScript del frontend se generan automáticamente desde este schema.
- **12-Factor App**: configuración por variables de entorno, logging estructurado, dependencias declaradas.
- **Atomic Design** (Brad Frost): componentes de UI organizados en átomos, moléculas, organismos, templates y páginas.
- **Testing pyramid**: mayor volumen de pruebas unitarias (servicios puros, algoritmo), menor volumen de pruebas de integración (endpoints), pruebas E2E manuales sobre el flujo crítico.
- **Idempotencia**: importadores diseñados para poder ejecutarse N veces con el mismo efecto que una sola.
- **Conventional Commits**: histórico de commits estructurado por tipo (`feat`, `fix`, `refactor`, `docs`, `test`).

---

## 9. Marco teórico

### 9.1 Voting Advice Applications (VAA)

Las VAAs son sistemas de apoyo a la decisión electoral que comparan las preferencias declaradas del votante con las de partidos o candidatos. Su origen se remonta a *StemWijzer* (Países Bajos, 1989), inicialmente distribuido en formato disquete. La literatura politológica (Marschall & Schmidt, Cedroni & Garzia, Garzia & Marschall) ha estudiado extensamente su impacto sobre la participación, la formación de preferencias y la volatilidad electoral.

Los VAAs se clasifican habitualmente por su modelo de recolección de posturas (autodeclarado por candidatos, curado por terceros, mixto), su escala de respuestas (binaria, Likert 3, Likert 5), y su forma de visualización (ranking, radar, mapa 2D bidimensional). *Tinder Decisivo* adopta un modelo curado con fuentes obligatorias, escala Likert 5 con opción explícita "No sé", y visualización combinada de ranking + radar por eje.

### 9.2 Escalas Likert

La escala Likert (Rensis Likert, 1932) es un instrumento psicométrico ampliamente utilizado en investigación social para medir actitudes. En su forma clásica, presenta al respondiente una afirmación y le solicita indicar su grado de acuerdo en una escala ordinal simétrica (habitualmente 5 o 7 puntos). En este proyecto se adoptó la variante de 5 puntos por ser el "sweet spot" documentado entre resolución y fatiga cognitiva, y se incorporó una sexta opción explícita "No sé / Prefiero no responder" que se excluye del cálculo.

### 9.3 Distancia ponderada no-lineal

Para el cálculo de afinidad, el proyecto adopta una fórmula que penaliza cuadráticamente las diferencias:

```
score_pregunta = 1 - (diff / 4)²
```

donde `diff` es la diferencia absoluta entre el valor Likert del usuario y el del candidato, normalizada por el rango máximo (4 en escala 1-5). Esta forma penaliza más fuertemente las diferencias extremas (candidatos "opuestos") que la suma de varias diferencias pequeñas, alineándose con la percepción humana de similitud política. Cada score se pondera por un multiplicador declarado por el usuario (0.5x, 1.0x, 1.5x, 2.0x) según la importancia percibida del tema.

### 9.4 Arquitectura de software

El diseño del sistema se guía por principios establecidos en la literatura de ingeniería de software:

- **SOLID** (Robert C. Martin): Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **DRY** (Andy Hunt & Dave Thomas, *The Pragmatic Programmer*): Don't Repeat Yourself.
- **YAGNI** (extreme programming): You Aren't Gonna Need It, evitar sobre-ingeniería.
- **Clean Architecture** (Robert C. Martin): separación en capas concéntricas con dependencias apuntando al dominio.
- **12-Factor App** (Adam Wiggins): metodología para aplicaciones web escalables y portables.

### 9.5 Atomic Design

Metodología de diseño de sistemas de interfaces propuesta por Brad Frost (2013), que organiza los componentes de UI en cinco niveles jerárquicos: átomos (elementos indivisibles como botones, inputs), moléculas (composiciones simples como campos de formulario), organismos (secciones funcionales como cabeceras), templates (esqueletos de página) y páginas (instancias con contenido real). El proyecto aplica los cuatro primeros niveles en la organización de `frontend/src/components/`.

### 9.6 Accesibilidad WCAG 2.2

Las *Web Content Accessibility Guidelines* del World Wide Web Consortium (W3C) definen criterios de éxito organizados en cuatro principios: perceptibilidad, operabilidad, comprensibilidad y robustez. El proyecto se compromete con el **nivel AA**, que incluye entre otros: contraste de color mínimo de 4.5:1 para texto normal y 3:1 para texto grande, targets táctiles de al menos 24×24 CSS pixels, navegación completa por teclado, y compatibilidad con lectores de pantalla.

### 9.7 Contract-first API design

Enfoque de diseño de APIs en el cual el contrato (schema OpenAPI en este caso) se define antes que la implementación y sirve como fuente única de verdad tanto para el servidor como para los consumidores. Este enfoque, apoyado por herramientas como `drf-spectacular` (backend) y `openapi-typescript` (frontend), elimina el drift entre las expectativas del cliente y las respuestas del servidor.

---

## 10. Flujo del usuario

Esta sección describe el recorrido completo de un usuario nuevo, desde la primera apertura de la aplicación hasta la revisión de su match con un candidato específico.

### 10.1 Diagrama de flujo principal

```
[Inicio]
   |
   v
+---------------+
| Registro /    |------> [Cuenta creada] ---+
| Login         |                           |
+---------------+                           v
                                  +-----------------+
                                  | Home            |
                                  | (Tipos de       |
                                  |  elección)      |
                                  +-----------------+
                                          |
                                          v
                                  +-----------------+
                                  | Cuestionario    |
                                  | (12 preguntas   |<--- puede volver
                                  |  Likert + peso) |     con "Atrás"
                                  +-----------------+
                                          |
                                          v
                                  +-----------------+
                                  | Envío           |
                                  | (POST batch     |
                                  |  respuestas)    |
                                  +-----------------+
                                          |
                                          v
                                  +-----------------+
                                  | Cálculo match   |
                                  | (POST match)    |
                                  +-----------------+
                                          |
                                          v
                                  +-----------------+
                                  | Resultados      |
                                  | (ranking con    |
                                  |  confianza)     |
                                  +-----------------+
                                          |
                          +---------------+---------------+
                          v                               v
                  +---------------+               +---------------+
                  | Detalle       |               | Comparar      |
                  | candidato     |               | candidatos    |
                  | (radar +      |               | (side by side)|
                  |  posturas +   |               +---------------+
                  |  noticias)    |
                  +---------------+
```

### 10.2 Descripción paso a paso

**Paso 1 — Registro o login**

El usuario abre la aplicación y se encuentra con la pantalla de autenticación. Si no tiene cuenta, se registra con nombre de usuario, correo electrónico y contraseña. Estos datos viajan al endpoint `POST /api/v1/register/`, y el backend crea el registro en la tabla `auth_user` con contraseña hasheada mediante PBKDF2-SHA256 (600.000 iteraciones, estándar de Django 5.x).

Si ya tiene cuenta, ingresa con usuario y contraseña. El backend valida las credenciales en `POST /api/v1/login/` y devuelve un token de autenticación DRF, que el frontend almacena en `SecureStore` (iOS/Android) o `localStorage` (web). Este token se incluye en el header `Authorization: Token <token>` de todas las peticiones subsecuentes.

**Paso 2 — Home**

Una vez autenticado, el usuario ve la pantalla `HomeScreen`, que consulta `GET /api/v1/tipos-eleccion/` y despliega los tipos de elección disponibles. En la versión actual, la única opción es "Presidencial". Al seleccionarla, se navega al cuestionario.

**Paso 3 — Cuestionario**

`CuestionarioScreen` consulta `GET /api/v1/preguntas/?tipo_eleccion_id=1` para obtener las 12 preguntas de la elección presidencial, junto con sus opciones de respuesta. Las preguntas se presentan una a una, cada una con:

- El enunciado de la afirmación (por ejemplo: "Chile debe cerrar las centrales de carbón antes de 2030").
- Un botón de información que despliega `PreguntaInfoModal` con contexto educativo y repercusiones (contenido pre-cargado en el modelo `Pregunta`).
- Cinco opciones Likert seleccionables mediante `SelectableButton` (Muy en desacuerdo, En desacuerdo, Neutral, De acuerdo, Muy de acuerdo).
- Una sexta opción "No sé / Prefiero no responder" que se marca en el backend con `es_no_se=True`.
- Un `WeightSelector` con cuatro niveles de importancia (No me importa, Poco, Medio, Mucho), correspondientes a los multiplicadores 0.5x, 1.0x, 1.5x y 2.0x.

Las respuestas se acumulan en el store de Zustand `store/cuestionario.ts` sin viajar al servidor hasta el envío final. Esto permite navegar atrás y modificar respuestas sin latencia.

**Paso 4 — Envío**

Al responder la última pregunta y presionar "Enviar", el frontend realiza `POST /api/v1/respuestas/` con el array completo de respuestas. El backend valida cada una (que la opción corresponda a la pregunta declarada, que el peso esté en el rango válido) y crea o actualiza los registros en `RespuestaUsuario` mediante `update_or_create` con clave única `(user, pregunta)`.

Si el envío es exitoso, se navega a `SubmitDoneScreen`, una pantalla intermedia que confirma la recepción y ofrece un botón "Ver mis matches".

**Paso 5 — Cálculo del match**

Al presionar "Ver mis matches", el frontend realiza `POST /api/v1/match-candidatos/` con el `tipo_eleccion_id`. Este endpoint dispara el algoritmo completo:

1. El backend recupera las respuestas del usuario (excluyendo las "No sé").
2. Para cada candidato registrado en el tipo de elección, recupera sus posturas.
3. Para cada pregunta con overlap (respondida por usuario y con postura del candidato), calcula el `score_pregunta = 1 - (diff/4)²`, lo pondera por el multiplicador de peso, y acumula por eje temático.
4. Agrega el resultado global y por eje.
5. Determina el nivel de confianza según el número de preguntas consideradas (`tentativa` < 5, `media` 5-9, `alta` >= 10).
6. Persiste el resultado en `MatchCandidato` mediante `update_or_create`.
7. Devuelve la lista de matches ordenada por porcentaje descendente.

**Paso 6 — Resultados**

`ResultadosScreen` muestra el ranking de candidatos con:

- Porcentaje de match global.
- Badge de confianza (`tentativa`, `media`, `alta`) con color diferenciado.
- Foto y nombre del candidato.
- Chip de partido.
- Acceso al detalle del candidato.

**Paso 7 — Detalle del candidato**

`DetalleCandidatoScreen` presenta:

- Biografía y propuesta electoral del candidato.
- `RadarChart` con la afinidad desglosada por los 7 ejes temáticos (Economía, Sociedad, Ambiente, Seguridad, DDHH, Internacional, Institucional).
- Lista de `PosturaCandidato` con justificación y fuente por cada pregunta.
- Sección de noticias recientes, consultando `GET /api/v1/candidatos/<id>/noticias/`.

**Paso 8 — Comparar candidatos (opcional)**

Desde resultados, el usuario puede acceder a `CompararScreen`, que permite seleccionar dos candidatos y ver sus posturas lado a lado en formato de tabla comparativa.

### 10.3 Rutas alternativas

- **Marcar favorito o descartar**: desde el detalle de candidato (backend implementado, UI en desarrollo).
- **Guardar decisión final**: registro de la elección final del usuario para un tipo de elección determinado (backend implementado, UI en desarrollo).
- **Ver noticias generales**: `NoticiasScreen` muestra un feed agregado de todas las noticias recientes con filtros por candidato y por fecha.
- **Perfil y configuración**: `PerfilScreen` y `ConfiguracionScreen` permiten editar datos del perfil, cambiar contraseña, y eliminar cuenta.
- **Recuperación de contraseña**: `PasswordResetRequestScreen` y `PasswordResetConfirmScreen` implementan el flujo de reset por correo electrónico mediante token de expiración.

---

## 11. Diseño e implementación

### 11.1 Stack tecnológico

**Backend**

| Capa | Tecnología | Versión | Rol |
|------|------------|---------|-----|
| Framework web | Django | 5.2 | Framework principal, ORM, admin |
| API REST | Django REST Framework | 3.15+ | Serialización, viewsets, autenticación |
| Auth | DRF Token Authentication | - | Autenticación mobile-friendly |
| Schema | drf-spectacular | - | Generación OpenAPI 3.1 |
| DB desarrollo | SQLite | - | Zero-config para dev |
| DB producción | PostgreSQL | - | Estándar production-ready |
| Config | python-decouple | 3.8+ | Variables desde `.env` |
| Media | Pillow | 10.3+ | Procesamiento de imágenes |
| Cleanup | django-cleanup | 9.0+ | Elimina archivos huérfanos |
| CORS | django-cors-headers | 4.4+ | Habilita consumo desde frontend |
| Testing | pytest + pytest-django | 8.3+ / 4.9+ | Suite de pruebas |
| Package manager | uv | - | Instalación y bloqueo de dependencias |

**Frontend**

| Capa | Tecnología | Rol |
|------|------------|-----|
| Runtime | React Native + Expo SDK 57 | Framework multiplataforma |
| UI kit | Tamagui | Sistema de componentes con theming |
| Navegación | React Navigation | Ruteo y navegación entre pantallas |
| Data fetching | TanStack Query v5 | Cache, retry, dedup de peticiones HTTP |
| Estado | Zustand | Estado global sin boilerplate |
| Tipos | TypeScript strict | Sistema de tipos estático |
| Contratos | openapi-typescript | Generación de tipos desde OpenAPI |
| Almacenamiento seguro | Expo SecureStore | Persistencia de tokens |
| Testing | Jest + React Native Testing Library | Suite de pruebas |

### 11.2 Modelo de dominio

El backend define 8 entidades principales en `core/models/`:

1. **`TipoEleccion`**: representa un proceso electoral (Presidencial, Parlamentaria, etc.).
2. **`Candidato`**: candidato con nombre, apellido, partido, biografía, propuesta electoral y relación M2M con `TipoEleccion`.
3. **`Pregunta`**: enunciado de política pública, con `eje_tematico` (ECONOMIA, SOCIEDAD, AMBIENTE, SEGURIDAD, DDHH, INTERNACIONAL, INSTITUCIONAL, OTRO), campos educativos (`explicacion`, `repercusiones`) y relación con `TipoEleccion`.
4. **`OpcionRespuesta`**: opciones asociadas a una pregunta, con `valor` (1-5), `texto` y `es_no_se` (booleano).
5. **`RespuestaUsuario`**: registra la respuesta de un usuario a una pregunta, con `opcion_elegida` y `peso` (0-3), con clave única `(user, pregunta)`.
6. **`PosturaCandidato`**: registra la postura de un candidato en una pregunta, con `opcion_respuesta` y `justificacion` (que incluye URL de fuente).
7. **`MatchCandidato`**: cache del cálculo de match por `(user, candidato)`, con `match_percentage_value`, `num_preguntas_consideradas`, `breakdown_por_eje` (JSONField) y `confianza`.
8. **`Noticia`**: noticias asociadas a candidatos mediante M2M `candidatos_mencionados`, con dedup por URL.

Adicionalmente: `CandidatoFavorito`, `CandidatoDescartado`, `DecisionFinal` para las funcionalidades post-matching (backend implementado).

### 11.3 Algoritmo de matching

El algoritmo vive en `core/services/matching.py` (arquitectura post-refactor). Sus características:

**Fórmula por pregunta**:
```
diff             = |valor_usuario - valor_candidato|          en [0, 4]
score_pregunta   = 1 - (diff / 4)²                             en [0.0, 1.0]
mult_peso        = peso_multiplier[peso_declarado_usuario]     en {0.5, 1.0, 1.5, 2.0}
score_ponderado  = score_pregunta * mult_peso
```

**Agregación global**:
```
match_% = (Σ score_ponderado) / (Σ mult_peso) × 100
```

**Agregación por eje**:
```
para cada eje E:
    match_%_eje_E = (Σ score_ponderado en preguntas del eje E) /
                    (Σ mult_peso en preguntas del eje E) × 100
```

**Tabla de scores por diferencia**:

| Diferencia (0-4) | Interpretación | Score lineal (rechazado) | Score no-lineal (adoptado) |
|:----------------:|----------------|:------------------------:|:--------------------------:|
| 0 | Idéntico | 1.00 | 1.00 |
| 1 | Casi igual | 0.75 | 0.94 |
| 2 | Diferencia media | 0.50 | 0.75 |
| 3 | Diferencia grande | 0.25 | 0.44 |
| 4 | Opuesto | 0.00 | 0.00 |

**Propiedades formales**:
- Determinista, simétrico, requiere overlap, robusto ante NaN.
- Complejidad `O(N_candidatos × N_preguntas)`, con queries constantes gracias a `prefetch_related`.

**Niveles de confianza**:

| Nivel | Preguntas consideradas |
|-------|:----------------------:|
| `tentativa` | < 5 |
| `media` | 5-9 |
| `alta` | >= 10 |

### 11.4 Arquitectura backend (post-refactor)

```
backend/core/
├── models/         (5 submódulos por dominio)
│   ├── auth.py
│   ├── content.py
│   ├── cuestionario.py
│   ├── electoral.py
│   ├── matching.py
│   └── user_data.py
├── views/          (6 submódulos por dominio)
│   ├── auth.py
│   ├── bookmarking.py
│   ├── catalog.py
│   ├── cuestionario.py
│   ├── matching.py
│   ├── noticias.py
│   └── perfil.py
├── serializers/    (7 submódulos por dominio)
├── services/       (lógica de dominio pura)
│   ├── matching.py
│   ├── password_reset.py
│   ├── perfil.py
│   └── respuestas.py
├── management/     (comandos CLI para importación)
│   └── commands/
│       ├── fetch_noticias.py
│       ├── import_candidatos.py
│       ├── import_posturas.py
│       ├── import_preguntas.py
│       └── seed_explicaciones_preguntas.py
├── migrations/     (24 migraciones)
├── admin.py
├── urls.py
└── test_*.py       (14 archivos de pruebas)
```

**Principios aplicados**:
- Single Responsibility: cada archivo con una responsabilidad clara, ninguno supera 300 líneas.
- Separación de capas: modelos → serializadores → vistas → servicios (lógica de dominio aislada de HTTP).
- Re-exports en `__init__.py` para mantener la API pública estable.
- Constantes explícitas (`MatchCandidato.CONFIANZA_ALTA`) en lugar de magic strings.

### 11.5 Arquitectura frontend (atomic design)

```
frontend/src/
├── api/
│   ├── client.ts        (cliente axios con interceptors)
│   ├── config.ts        (base URL)
│   ├── endpoints.ts     (definición de endpoints)
│   ├── hooks.ts         (hooks de React Query)
│   └── queryClient.ts   (configuración de TanStack Query)
├── components/
│   ├── atoms/           (24 componentes: Button, Input, Icon, Chip, etc.)
│   ├── molecules/       (22 componentes: FormField, ProgressStepper, etc.)
│   ├── organisms/       (16 componentes: CandidateCard, RadarChart, etc.)
│   └── templates/
├── navigation/          (rutas y tipos)
├── screens/             (19 pantallas)
├── services/            (lógica de negocio pura, testeable)
│   ├── comparar.ts
│   ├── cuestionario.ts
│   ├── matching.ts
│   └── share.ts
├── store/               (Zustand: auth, cuestionario, onboarding, theme)
├── theme/               (colors, motion, radii, shadows, spacing, typography)
└── types/
    └── api.ts           (tipos auto-generados desde OpenAPI, 34.3 KB)
```

**Principios aplicados**:
- Atomic design: composición ascendente desde átomos hasta pantallas.
- Servicios puros: `matching.ts`, `cuestionario.ts` no importan React ni RN, se testean sin renderizar.
- Contract-first: `types/api.ts` se regenera desde el schema OpenAPI; cambios de shape rompen TypeScript en compile-time.
- Un solo cliente HTTP con interceptors para token y manejo de errores 401.

### 11.6 Ingesta de datos

Chile no expone una API pública de posturas electorales. La estrategia adoptada es **importación offline por CSV** mediante management commands:

- `import_candidatos`: idempotente por `(nombre, apellido, partido)`, autocrea `TipoEleccion` referenciados, soporta `--dry-run`, `--delimiter`, `--encoding`.
- `import_preguntas`: autogenera las 6 opciones estándar (5 Likert + 1 "No sé") por cada pregunta importada.
- `import_posturas`: enforce URL de fuente y justificación mínima, con nivel de confianza declarado.
- `fetch_noticias`: consulta Google News RSS por candidato, dedup por URL, guarda en `Noticia` con M2M a `candidatos_mencionados`.
- `seed_explicaciones_preguntas`: pobla los campos educativos (`explicacion`, `repercusiones`) de las preguntas.

Todos los importadores son transaccionales con savepoints por fila (un error en la fila 5 no aborta las filas 1-4) y validados por 12 pruebas en `core/test_importers.py`.

### 11.7 Contrato API

La API expone bajo `/api/v1/` un conjunto de endpoints REST con autenticación por token DRF. Endpoints principales:

| Método | Ruta | Permission | Rol |
|--------|------|------------|-----|
| POST | `/register/` | AllowAny | Registro de usuario |
| POST | `/login/` | AllowAny | Obtención de token |
| GET | `/tipos-eleccion/` | Auth | Lista de procesos electorales |
| GET | `/candidatos/` | Auth | Lista de candidatos |
| GET | `/candidatos/<pk>/` | Auth | Detalle de candidato |
| GET | `/preguntas/?tipo_eleccion_id=<id>` | Auth | Preguntas del cuestionario |
| POST | `/respuestas/` | Auth | Envío batch de respuestas |
| POST | `/match-candidatos/` | Auth | Cálculo de match |
| GET/POST/DELETE | `/candidatos-favoritos/` | Auth | CRUD de favoritos |
| GET/POST/DELETE | `/descartados/` | Auth | CRUD de descartados |
| GET/POST/DELETE | `/decision-final/` | Auth | Upsert de decisión final |
| GET | `/noticias/` | AllowAny | Feed de noticias |
| GET | `/candidatos/<id>/noticias/` | AllowAny | Noticias por candidato |
| GET | `/schema/` | AllowAny | Schema OpenAPI |
| GET | `/docs/` | AllowAny | Swagger UI |
| GET | `/redoc/` | AllowAny | ReDoc |
| GET | `/health/` | AllowAny | Healthcheck |

### 11.8 Seguridad

Implementado:
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` desde variables de entorno.
- Password hashing PBKDF2-SHA256 (600k iteraciones, default Django 5.x).
- Autenticación por token DRF.
- Permisos DRF explícitos en cada view.
- CORS restrictivo en producción, abierto solo en `DEBUG=True`.
- `django-cleanup` para evitar archivos huérfanos.
- Constraint parcial de unicidad en `Noticia.url` (permite múltiples URLs vacías, dedup cuando existe).

Pendiente (documentado):
- Rate limiting en endpoints sensibles (`/login/`, `/match-candidatos/`).
- Rotación de tokens (migrar a JWT con refresh).
- Verificación de correo electrónico.
- Deploy con HTTPS terminado en reverse proxy (nginx o Cloudflare).

### 11.9 Testing

Suite actual: 40+ pruebas backend distribuidas en 14 archivos:

- `core/tests.py` (17): algoritmo de matching, algoritmo robusto, submit answers, permisos de noticias.
- `core/test_importers.py` (12): importadores CSV, idempotencia, dry-run, validaciones.
- `core/test_noticias.py` (11): modelo Noticia, endpoint por candidato, comando fetch mockeado.
- `core/test_services_matching.py`, `test_password_reset.py`, `test_perfil.py`, etc.

Frontend: pruebas de servicios puros con Jest (`services/*.test.ts`).

Coverage objetivo: >70% en `core/`.

### 11.10 Accesibilidad

La carpeta `frontend/design-exploration/` contiene:
- `audit_wcag.py`: script de auditoría automatizada de contraste WCAG 2.2.
- `wcag-audit.html`: reporte de contraste sobre la paleta actual.
- `design-system.html`: catálogo de componentes con documentación de accesibilidad.
- `paletas.html`: exploración de paletas alternativas.

Los componentes atómicos (`Button`, `SelectableButton`, `Input`) están construidos sobre `Pressable` puro con área táctil mínima 44×44 (superior al mínimo WCAG de 24×24), estados visuales explícitos para focus, hover, disabled, y compatibilidad con `accessibilityLabel` y `accessibilityRole` de React Native.

---

## 12. Conclusiones

### 12.1 Cumplimiento de objetivos

El proyecto cumple con la mayoría de los objetivos específicos planteados:

- **Algoritmo robusto**: implementado con fórmula cuadrática, ponderación por importancia, manejo explícito de "No sé" y nivel de confianza. Verificado por pruebas automatizadas y documentado en `docs/algoritmo-tecnico.md`.
- **Arquitectura modular**: alcanzada mediante refactorización de modelos, vistas y serializadores a submódulos por dominio. Ningún archivo supera 300 líneas. Score de modularidad autoevaluado: 8/10 backend, 8/10 frontend.
- **Contrato API tipado**: implementado con `drf-spectacular` (backend) y `openapi-typescript` (frontend). Cambios de shape rompen TypeScript en compile-time.
- **Transparencia de datos**: cada postura importada requiere justificación y fuente. Nivel de confianza declarado por fila del CSV.
- **Cobertura de pruebas**: 40+ pruebas backend, servicios puros del frontend con pruebas Jest.
- **Accesibilidad WCAG 2.2 AA**: base implementada, con auditoría automatizada del contraste. Requiere revisión final por lector de pantalla.
- **Multiplataforma**: un único codebase compilado para web, iOS y Android desde React Native + Expo.

### 12.2 Estado actual

Al momento de este documento, la aplicación se encuentra en versión MVP (0.1) con las siguientes características operativas:

- 12 features end-to-end funcionales (registro, login, cuestionario completo, cálculo de match, resultados, detalle de candidato, noticias por candidato, radar por eje, nivel de confianza, modal educativo).
- 3 features con backend implementado y UI pendiente (favoritos, descartados, decisión final).
- 6 features en roadmap (modo invitado, compartir resultado, editar respuestas ya enviadas, onboarding, panel de perfil, historial de sesiones).

### 12.3 Aprendizajes

**Aprendizajes técnicos**:

- La combinación **Django + DRF + React Native + Expo + Tamagui** permite alta velocidad de desarrollo con un solo desarrollador y garantías de calidad razonables.
- El enfoque **contract-first** con OpenAPI es la barrera anti-drift más importante del proyecto. Un cambio de tipo en el backend rompe el frontend en compile-time, no en producción.
- La **auditoría periódica del código** (con 17 hallazgos categorizados por severidad) demostró ser una práctica valiosa para elevar la calidad sin necesidad de reescribir desde cero.
- La **separación de servicios puros** (sin dependencias de React o de HTTP) permite testear la lógica de negocio sin infraestructura.
- El principio **YAGNI** aplicado a features 13-15 (favoritos, descartados, decisión final) generó deuda visible: código implementado sin UI que lo consuma. Es un antipatrón a evitar en futuras iteraciones.

**Aprendizajes de dominio**:

- La verificación de posturas contra fuentes primarias es el trabajo más costoso del proyecto, mayor que el desarrollo de código.
- El diseño de las 12 preguntas requiere iteración con expertos en ciencias políticas para evitar sesgos, ambigüedad o cobertura desigual de ejes temáticos.
- Los VAAs internacionales exitosos combinan tres elementos: **algoritmo transparente**, **datos verificados**, y **soporte institucional continuo entre elecciones**. El tercer punto es el más difícil de replicar en el contexto chileno actual.

### 12.4 Deuda pendiente

Documentada exhaustivamente en `docs/estado-actual.md`. Priorizada por relación valor/esfuerzo:

**Alta prioridad (bloquea publicación)**:
- UI para favoritos, descartados y decisión final.
- Modo invitado (permitir cuestionario sin registro previo).
- Verificación de las 72 posturas contra fuentes primarias.

**Media prioridad (bloquea escalar)**:
- Migración de SQLite a PostgreSQL en producción.
- Cache Redis para catálogos y matches.
- Rate limiting en endpoints sensibles.
- Optimización de `_persistir_matches` con `bulk_create(update_conflicts=True)`.
- Deploy con Gunicorn + Nginx + docker-compose.

**Baja prioridad**:
- Compartir resultado como imagen para redes sociales.
- Squash de 24 migraciones a 3.
- Logging estructurado con Sentry.
- CI/CD con GitHub Actions.

### 12.5 Proyección

La proyección natural del trabajo se enmarca en cuatro líneas:

1. **Publicación pública**: completar los 2-3 sprints de deuda alta y publicar en `tinder-decisivo.cl` con capacidad para el escenario de tráfico medio (10.000 usuarios/día).
2. **Verificación de datos**: alianza con universidades o think tanks para validar posturas y ampliar cobertura a elecciones parlamentarias, municipales y regionales.
3. **Explicabilidad avanzada** (v0.3): simulador "cambia mi respuesta" para mostrar sensibilidad del match, mapa 2D político similar a Kieskompas.
4. **Investigación académica**: publicar análisis anonimizado y agregado sobre distribución de respuestas y ejes temáticos, contribuyendo a la literatura empírica sobre VAAs en América Latina.

### 12.6 Reflexión final

El proyecto demuestra que es viable construir infraestructura cívica de calidad profesional con recursos limitados, siempre que se apliquen principios sólidos de ingeniería de software y se mantenga disciplina en la verificación de datos. La combinación de código abierto, arquitectura modular y datos trazables constituye una respuesta técnica concreta a los problemas de desinformación electoral y asimetría de información que enfrenta el votante chileno.

La existencia de un ecosistema internacional maduro de VAAs (StemWijzer con 35+ años de operación continua, Wahl-O-Mat con respaldo estatal alemán) prueba que estas herramientas pueden ser sostenibles a largo plazo. El desafío en Chile no es técnico sino institucional: encontrar un modelo de gobernanza y financiamiento que permita continuidad operativa entre elecciones.

---

## 13. Bibliografía

### 13.1 Sobre Voting Advice Applications

- Cedroni, L., & Garzia, D. (Eds.). (2010). *Voting Advice Applications in Europe: The State of the Art*. Napoli: ScriptaWeb.
- Garzia, D., & Marschall, S. (Eds.). (2014). *Matching Voters with Parties and Candidates: Voting Advice Applications in a Comparative Perspective*. Colchester: ECPR Press.
- Marschall, S. (2005). *Idee und Wirkung des Wahl-O-Mat*. Aus Politik und Zeitgeschichte, 51-52/2005.
- Walgrave, S., van Aelst, P., & Nuytemans, M. (2008). "Do the vote test": The electoral effects of a Popular Vote Advice Application at the 2004 Belgian Elections. *Acta Politica*, 43, 50-70.

### 13.2 VAAs referenciados

- StemWijzer (Países Bajos, ProDemos). https://stemwijzer.nl/
- Wahl-O-Mat (Alemania, Bundeszentrale für politische Bildung). https://www.bpb.de/themen/wahl-o-mat/
- Smartvote (Suiza, Politools). https://www.smartvote.ch/
- Kieskompas (Países Bajos, Universiteit van Amsterdam). https://www.kieskompas.nl/
- Vote Compass (Canadá/Australia, Vox Pop Labs). https://votecompass.com/
- Wahlkabine (Austria, Institut für Neue Kulturtechnologien). https://wahlkabine.at/

### 13.3 Sobre desinformación electoral

- Fast Check CL. https://www.fastcheck.cl/
- Mala Espina Check. https://malaespinacheck.cl/
- Observatorio de Redes y Elecciones, Universidad Diego Portales.
- Servicio Electoral de Chile (SERVEL). https://www.servel.cl/
- Datos abiertos SERVEL. https://opendata.servel.cl/

### 13.4 Sobre escalas de medición

- Likert, R. (1932). A Technique for the Measurement of Attitudes. *Archives of Psychology*, 140, 1-55.
- Krosnick, J. A., & Presser, S. (2010). Question and Questionnaire Design. In *Handbook of Survey Research* (2nd ed.). Emerald.

### 13.5 Sobre arquitectura de software

- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall.
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer: From Journeyman to Master*. Addison-Wesley.
- Wiggins, A. (2011). *The Twelve-Factor App*. https://12factor.net/
- Frost, B. (2016). *Atomic Design*. https://atomicdesign.bradfrost.com/

### 13.6 Sobre accesibilidad

- World Wide Web Consortium (W3C). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
- Mobile Accessibility: How WCAG 2.0 and Other W3C/WAI Guidelines Apply to Mobile. https://www.w3.org/TR/mobile-accessibility-mapping/

### 13.7 Documentación técnica de las tecnologías utilizadas

- Django Software Foundation. *Django Documentation*. https://docs.djangoproject.com/en/5.2/
- Django REST Framework. https://www.django-rest-framework.org/
- drf-spectacular. https://drf-spectacular.readthedocs.io/
- python-decouple. https://github.com/HBNetwork/python-decouple
- django-cleanup. https://github.com/un1t/django-cleanup
- Expo. *Expo Documentation*. https://docs.expo.dev/
- React Native. https://reactnative.dev/
- Tamagui. https://tamagui.dev/
- TanStack Query. https://tanstack.com/query/latest
- Zustand. https://github.com/pmndrs/zustand
- TypeScript. https://www.typescriptlang.org/docs/
- openapi-typescript. https://openapi-ts.dev/
- uv (Astral). https://github.com/astral-sh/uv

### 13.8 Documentación interna del proyecto

- `docs/algoritmo-tecnico.md` — Referencia técnica del algoritmo de matching (fórmulas, API, complejidad).
- `docs/algoritmo-simple.md` — Explicación del algoritmo sin matemática, para público no técnico.
- `docs/sistema-tecnico.md` — Referencia de arquitectura backend y frontend.
- `docs/sistema-simple.md` — Arquitectura en lenguaje simple.
- `docs/comparacion-vaas.md` — Análisis comparativo con 9 VAAs internacionales.
- `docs/buenas-practicas.md` — Aplicación de SOLID, DRY, Clean Architecture, 12-Factor.
- `docs/estado-actual.md` — Estado de features y deuda técnica priorizada.
- `docs/sprints.md` — Historial del proyecto por sprints.
- `docs/doc-tecnica.md` — Documentación técnica completa del backend.

---

*Documento elaborado como parte de la tesis de pregrado sobre desarrollo de aplicaciones móviles. Autora: Jenifer Castillo (@whatebria). Repositorio: https://github.com/whatebria/tinder-decisivo. Licencia del código: AGPL-3.0.*
