# Comparacion con VAAs internacionales

> Analisis de Tinder Decisivo frente a los Voting Advice Applications
> (VAAs) mas relevantes del mundo. El objetivo es ubicar el proyecto en
> el mapa competitivo, entender que aprender de otros, e identificar
> nichos que hoy no estan cubiertos.
>
> **Disclaimer**: los datos sobre otros VAAs provienen del conocimiento
> publico general del asistente al momento de escribir (2026-07). Antes
> de usar este documento en publicaciones academicas o comparaciones
> oficiales, verificar las metricas y features actuales contra los sitios
> oficiales de cada VAA — algunos pueden haber cambiado su metodologia,
> discontinuado el servicio, o actualizado su cobertura.

---

## Que es un VAA

Un **Voting Advice Application** (VAA) es una herramienta digital que
compara las posturas politicas de un votante con las de partidos o
candidatos y le sugiere afinidades. Existen desde 1989 (StemWijzer,
Paises Bajos, en formato disquete) y hoy son parte del ecosistema
electoral en decenas de paises.

Estudios politologicos estiman que los VAAs mueven entre 2% y 6% de
los votos en paises con alta penetracion (Alemania, Suiza, Paises
Bajos), por lo que no son un gadget menor.

---

## Metodologia de comparacion

Se evaluaron 10 VAAs (9 externos + Tinder Decisivo) en 12 dimensiones:

| Dimension | Que mide |
|-----------|----------|
| Pais / anio de origen | Contexto de creacion |
| Estado actual | Activo / discontinuado / intermitente |
| Escala de respuestas | Sinos, Likert 3, Likert 5, otras |
| Ponderacion por importancia | ¿El usuario puede indicar que temas le importan mas? |
| Numero de preguntas | Tipico por eleccion |
| Origen de las posturas | Autodeclarado por candidatos, curado por terceros, mixto |
| Justificaciones + fuentes | ¿Cada postura es trazable a un origen verificable? |
| Visualizacion de resultados | Ranking, radar, mapa 2D, etc. |
| Explicabilidad | ¿Muestra que preguntas causaron alto/bajo match? |
| Codigo abierto | ¿Se puede auditar el algoritmo y la data? |
| Modelo de datos publico | ¿Se puede descargar el dataset? |
| Financiamiento | Estatal, academico, comercial, ciudadano |

---

## Tabla comparativa

Ordenados por antiguedad para dar contexto historico. Ver secciones
detalladas mas abajo.

| VAA | Pais | Anio | Estado | Escala | Peso | # preg | Fuente posturas | Fuentes citadas | Viz | Explicable | Open source |
|-----|------|-----:|--------|--------|:----:|-------:|-----------------|:---------------:|-----|:----------:|:-----------:|
| **StemWijzer** | NL | 1989 | activo | 3 (si/neutral/no) + skip | si (importante/normal) | ~30 | curado por ProDemos + partidos | parcial | ranking | limitado | no |
| **Wahl-O-Mat** | DE | 2002 | activo | 3 (acuerdo/neutral/desacuerdo) + skip | si (doble peso) | 38 | autodeclarado por partidos + revisado | si (justificaciones) | ranking + coincidencia por tema | si | codigo no, data si |
| **Smartvote** | CH | 2003 | activo | 4 (si/mas si/mas no/no) + skip | si (0-2) | ~75 | autodeclarado por candidatos individuales | parcial | radar + smartmap 2D | si (avanzado) | data si, codigo parcial |
| **Kieskompas** | NL | 2006 | activo | 5 (Likert) | no | ~30 | curado academico | si | mapa 2D (izq-der / progresista-conservador) | limitado | no |
| **Vote Compass** | CA/AU/otros | 2011 | activo | 5 (Likert) + skip | si | ~30 | curado academico | limitado | mapa 2D + ranking | limitado | no |
| **isidewith** | USA / global | 2012 | activo | multiple (si/no + variantes con multiple choice) | si (importante/muy/no me importa) | 50-100+ | autodeclarado + curado + editable por usuarios en algunas versiones | limitado | ranking + porcentaje | si | no |
| **Voto Informado** | CL | ~2013 | intermitente (por eleccion) | perfiles comparativos, no algoritmo formal | no | variable | curado + candidatos | parcial | comparacion lado a lado | no aplica | no |
| **electionCompass** | internacional | ~2010s | activo (por eleccion) | 5 (Likert) | opcional | ~30 | curado academico | limitado | mapa 2D | limitado | no |
| **Decide Chile** | CL | ~2017-2021 | discontinuado / dormido | 5 (Likert) | si | ~20 | curado | limitado | ranking | limitado | no |
| **Tinder Decisivo** | CL | 2026 | MVP en desarrollo | 5 (Likert) + No se | si (0-3, 4 niveles) | 12 (v0.1) | curado con fuentes obligatorias | si (URL + justificacion en cada postura) | ranking + radar por eje + confianza | roadmap v0.3 | **si (AGPL-3.0)** |

---

## Analisis por dimension

### Escala de respuestas

**Tendencia dominante**: Likert de 5 puntos (acuerdo / mas o menos /
neutral / mas o menos en contra / desacuerdo), a veces con opcion de
skip.

**Casos particulares**:
- StemWijzer y Wahl-O-Mat usan escalas de 3 puntos (mas simple, menos
  resolucion)
- Smartvote y iSideWith usan 4 puntos o multiple choice contextual
- Tinder Decisivo usa Likert 5 + una opcion explicita "No se" que se
  excluye del calculo (mas honesto que forzar un neutral)

**Trade-off**: mas puntos en la escala dan mas resolucion pero
aumentan la fatiga cognitiva. La literatura politologica sugiere que
Likert 5 es el sweet spot.

### Ponderacion por importancia

**Con peso**: Wahl-O-Mat (doble), Smartvote (0-2), Vote Compass, iSideWith,
StemWijzer (importante/normal), Tinder Decisivo (0-3 con multiplicadores
0.5x-2.0x).

**Sin peso**: Kieskompas, electionCompass (usan sus mapas 2D como forma
alternativa de expresar prioridad — donde te ubicas geometricamente ya
implica que temas te importan).

**Tinder Decisivo**: tiene la escala de peso mas granular del grupo
(4 niveles con multiplicador multiplicativo, no aditivo). Es explicito
sobre como se convierte en el calculo.

### Origen de las posturas

Tres modelos:

1. **Autodeclarado por el partido/candidato** (Wahl-O-Mat, Smartvote):
   los propios candidatos responden un cuestionario. Ventaja: el
   candidato es la fuente. Desventaja: pueden mentir o dar respuestas
   estrategicas.

2. **Curado por terceros** (Kieskompas, Vote Compass, Tinder Decisivo):
   un equipo independiente revisa declaraciones, votos, plataformas
   oficiales y asigna una postura. Ventaja: mas objetivo. Desventaja:
   trabajo intenso, sesgos posibles del equipo curador.

3. **Mixto** (StemWijzer, iSideWith): combinacion de ambos.

**Tinder Decisivo**: modelo curado con **fuentes obligatorias** — cada
postura debe tener URL de fuente publica y justificacion minima
(validado por el import command). Es una de las pocas apps que
enforcea esto a nivel de codigo.

### Justificaciones y fuentes citadas

La mayoria de VAAs muestran solo la postura (si/no/likert) sin
justificar por que se asigno esa respuesta al candidato. Wahl-O-Mat y
Smartvote son los mas explicitos con justificaciones cortas.

**Tinder Decisivo** enforce justificacion + URL en cada postura
mediante validaciones en el import. Ademas, con el sistema de posturas
draft con confianza marcada (ALTA/MEDIA/BAJA) es transparente sobre su
propia incertidumbre — algo que ningun otro VAA hace explicitamente
al usuario.

### Visualizacion de resultados

**Ranking simple** (mayoria): lista ordenada con porcentaje.

**Mapa 2D** (Kieskompas, Vote Compass, electionCompass, Smartvote):
ubican al usuario y a los partidos en dos ejes (tipicamente izq-der +
progresista-conservador). Muy poderoso conceptualmente, pero requiere
mucha data para calibrar los ejes.

**Radar por eje** (Smartvote, Tinder Decisivo): grafico de arana con
n dimensiones tematicas. Permite ver que un candidato coincide contigo
en economia pero no en DDHH, por ejemplo.

**Tinder Decisivo**: ranking + radar por 7 ejes + badge de confianza.
No tiene mapa 2D (feature pendiente si se decide agregar).

### Explicabilidad ("¿por que este match?")

**Wahl-O-Mat**: sistema mas sofisticado — cada usuario puede ver
respuesta por respuesta que dijo cada partido, con justificacion
oficial.

**Smartvote**: permite ver breakdown detallado por tema.

**iSideWith**: muestra en que preguntas concuerdas y en cuales no.

**Tinder Decisivo** (v0.1): no muestra todavia la explicabilidad
detallada — solo el porcentaje global y el radar por eje. Sprint 14
del roadmap prevé agregar:
- Mostrar que preguntas subieron/bajaron el match
- Simulador "cambia tu respuesta y ve como cambia el match"

Esto lo llevaria al nivel de explicabilidad de Wahl-O-Mat.

### Codigo abierto

**Ningun VAA del top-tier internacional publica su codigo fuente
completo bajo licencia libre**. Wahl-O-Mat publica solo su dataset de
respuestas partidarias. Smartvote publica parte de sus datasets.
StemWijzer, Kieskompas, Vote Compass, iSideWith son 100% cerrados.

**Tinder Decisivo es open source bajo AGPL-3.0** — una eleccion
deliberada. La AGPL fuerza a que cualquier deploy publico modificado
comparta sus cambios, lo que es coherente con la idea de que la
tecnologia electoral es infraestructura de interes publico. Este es
uno de los diferenciales mas fuertes del proyecto.

Impacto practico:
- Cualquiera puede auditar el algoritmo (link a `algoritmo-tecnico.md`)
- Cualquiera puede verificar que no hay favoritismos ocultos
- Grupos ciudadanos de otros paises pueden forkear y adaptar
- Investigadores pueden reproducir estudios usando el mismo motor

### Financiamiento y sostenibilidad

- **Estatal**: Wahl-O-Mat (BpB, agencia federal alemana de educacion
  civica), Voto Informado (Servel + PNUD)
- **Academico**: Kieskompas, Vote Compass (nacen en universidades)
- **ONG especializada**: StemWijzer (ProDemos), Smartvote (Politools)
- **Comercial / ad-supported**: iSideWith, electionCompass
- **Ciudadano voluntario / proyecto personal**: Decide Chile,
  Tinder Decisivo (en su estado actual)

**El modelo ciudadano tiene un problema conocido**: la sostenibilidad.
Decide Chile murio por falta de mantenimiento. Voto Informado esta
intermitente. Es un riesgo real que Tinder Decisivo debe planear —
posible camino: alianza con universidad chilena, ONG civica, o
Servel/PNUD para pasar a modelo institucional.

---

## Nichos que Tinder Decisivo cubre y otros no

### Fortalezas unicas o poco comunes

1. **Open source AGPL-3.0**: unico entre VAAs con presencia relevante.
   Facilita auditoria, reproducibilidad, colaboracion.

2. **Confianza explicita del match**: solo VAA que separa "cuanto
   coinciden" (porcentaje) de "cuanto lo sabemos" (confianza segun N
   preguntas). Educa al usuario sobre incertidumbre — importante para
   MVP con datos parciales.

3. **Justificaciones + fuentes obligatorias en cada postura**:
   validado por codigo, no dependiente de la buena voluntad del
   equipo curador.

4. **Contexto educativo por pregunta con 5 dimensiones**: el modal
   con repercusiones economico/social/cultural/ambiental/institucional
   es didactico. Solo Wahl-O-Mat tiene algo parecido, pero mas
   basico (una linea por partido, no dimensiones).

5. **Diseno mobile-first cross-platform**: la mayoria de VAAs
   son webs desktop responsivas. Tinder Decisivo va a mobile app
   nativo desde v2 con el mismo codebase.

6. **Espanol chileno neutro**: todos los VAAs latam existentes o son
   argentinos (con voseo), mexicanos o generales. El nicho local
   chileno con foco chileno esta poco cubierto post-caida de Voto
   Informado y Decide Chile.

### Debilidades relativas

1. **Numero de preguntas bajo (12 vs 30-75 de otros)**: menos
   resolucion. Roadmap: crecer a 20-30 en v0.2 con posturas verificadas.

2. **Sin mapa 2D**: Kieskompas y Smartvote lo tienen y es visualmente
   atractivo. Requiere calibracion academica de los ejes. Roadmap:
   considerar para v1.0.

3. **Explicabilidad detallada pendiente**: v0.1 solo muestra global +
   radar. Wahl-O-Mat y Smartvote son mejores aca. Sprint 14 esta
   planeado.

4. **Data draft**: 72 posturas con confianza baja/media en muchas
   filas. Ninguno de los VAAs consolidados vive con este problema —
   ellos empezaron mas chicos pero con data verificada. Es un tradeoff
   de MVP.

5. **Adopcion cero (todavia)**: Wahl-O-Mat tuvo 21M usos en las
   federales alemanas de 2021. Cambiar la balanza requiere alianza
   institucional o viralizacion muy fuerte.

6. **Sin cobertura parlamentaria/regional**: solo Presidencial en el
   MVP. Smartvote y Wahl-O-Mat cubren varios niveles. Roadmap v0.4.

---

## Lecciones aplicables

Cosas concretas para robar a otros:

- **De Wahl-O-Mat**: el sistema de "compara mi respuesta con la del
  partido lado a lado". Convertirlo en feature explicability para
  Sprint 14.

- **De Smartvote**: el "smartmap" (mapa 2D). Evaluar si vale la pena
  para v1.0.

- **De Vote Compass**: el modelo de partnership con medios (en Canada
  el CBC hostea el VAA). Buscar alianza con medio chileno para
  distribucion.

- **De StemWijzer**: la simplicidad radical (Likert 3 puntos, 30
  preguntas). Contrastar con Smartvote (Likert 4, 75 preguntas).
  Iterar en usability testing para encontrar el punto medio chileno.

- **De iSideWith**: la mecanica de "porcentaje evoluciona en tiempo
  real" mientras completas. Considerable para v0.3.

- **Del ecosistema academico** (Politools, Kieskompas): publicar
  papers sobre metodologia. Da credibilidad y abre puertas a
  financiamiento.

---

## Como se posiciona Tinder Decisivo

**Nicho declarado**: matcher electoral chileno, mobile-first, open
source, transparente sobre incertidumbre, con contexto educativo por
pregunta.

**Competencia local directa**:
- Voto Informado (institucional pero pasivo, sin match algoritmico
  real)
- Decide Chile (discontinuado)
- No hay realmente un jugador local activo — es un espacio abierto.

**Competencia internacional que podria expandirse a Chile**:
- Vote Compass tiene ediciones en varios paises; podria hacer Chile
  en alianza con un medio local.
- electionCompass hace instancias por eleccion; podria armar una
  chilena.
- iSideWith tiene una version generica que incluye politicos chilenos
  pero muy superficial.

**Ventaja temporal**: hoy no hay VAA chileno serio activo. Ventana
para consolidarse antes de que un jugador internacional decida entrar.

**Vulnerabilidad**: si Vote Compass o similar hace deal con CNN Chile,
Meganoticias o similar, tiene distribucion masiva instantanea. Tinder
Decisivo necesita distribucion antes de la eleccion presidencial 2029
para ser relevante.

---

## Referencias externas

Sitios oficiales al momento de escribir este documento:

- StemWijzer: https://www.stemwijzer.nl
- Wahl-O-Mat: https://www.wahl-o-mat.de
- Smartvote: https://www.smartvote.ch
- Kieskompas: https://www.kieskompas.nl
- Vote Compass: https://votecompass.com
- iSideWith: https://www.isidewith.com
- electionCompass: https://www.electioncompass.com
- Voto Informado Chile: intermitente, historicamente en
  https://votoinformado.cl (verificar disponibilidad al momento de leer)
- Decide Chile: discontinuado

Literatura academica recomendada para profundizar:

- Garzia, D. & Marschall, S. (eds.) (2014). *Matching Voters with
  Parties and Candidates. Voting Advice Applications in Comparative
  Perspective*. ECPR Press.
- Ruusuvirta, O. & Rosema, M. (2009). "Do online vote selectors
  influence electoral participation and the direction of the vote?"
- Marschall, S. & Schmidt, C. K. (2010). "The impact of Voting Indicator
  Applications on voters' decision-making"

---

## Consideraciones finales

Este documento es un snapshot en un momento del tiempo. Los VAAs
mencionados evolucionan constantemente. Tinder Decisivo tambien.

**Sugerencia**: reeditar este documento cada 6-12 meses, especialmente:
- Antes de una eleccion presidencial (para ver quien mas esta jugando)
- Despues de cada release mayor propio (para reubicar en la matriz)
- Si aparece competencia local nueva (para reaccionar)

**Contribuciones bienvenidas**: si encontras un error factual en
cualquiera de las metricas de otros VAAs, abrir un issue con la fuente
oficial y se corrige.

---

_Version 1.0 — 2026-07-25. Autor: equipo Tinder Decisivo._
_Snapshot del conocimiento al momento de escritura; verificar contra
fuentes primarias antes de citar academicamente._
