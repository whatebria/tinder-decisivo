# 06 - Garzia & Marschall (2019): Voting Advice Applications

## Datos bibliograficos (verificados en el PDF)

- **Autores**: Diego Garzia (afiliacion no explicita en el PDF; en 2019 esta en EUI) y Stefan Marschall.
- **Titulo**: "Voting Advice Applications".
- **Publicacion**: *Oxford Research Encyclopedia of Politics* (subject: Political Behavior).
- **Ano de publicacion online**: marzo 2019.
- **DOI**: 10.1093/acrefore/9780190228637.013.620.
- **Tipo**: articulo de enciclopedia / literature review canonico.
- **Extension**: 22 paginas.

##  Nota sobre la procedencia del PDF

El PDF que se resume aca es `GARZIA_2019_2.pdf` que ya estaba en la carpeta Bibliografia. **NO se confirmo empiricamente** si es el mismo documento del link de Cadmus EUI (`https://cadmus.eui.eu/server/api/core/bitstreams/7cb654ff-2071-5ae5-b6f6-367eda68f324/content`) porque el guardrail de Walmart bloqueo la descarga directa. Es una suposicion plausible pero sin verificar. Cuando se whitelistee el dominio, se debe abrir el link y confirmar.

## Que es y por que importa

Es el articulo de referencia foundational sobre VAAs. No aporta datos empiricos nuevos, pero sintetiza el estado del arte hasta 2019: define que es una VAA, mapea su historia, describe la variacion en diseno, y resume toda la evidencia disponible sobre efectos en votantes. Los papers posteriores en el corpus lo citan como referencia canonica (verificado: Tromborg & Albertsen 2023 y Bachmann et al. 2026 ambos lo citan).

## Definicion operativa de VAA (contenido del paper)

Una VAA es una **herramienta online que compara las posiciones politicas del usuario con las de partidos/candidatos** sobre un conjunto de policy statements, y presenta el resultado como:

1. Un **ranking** ordenado de partidos/candidatos por proximidad (Figura 1 del paper, ejemplo EU Profiler UK).
2. Un **grafico bidimensional** que ubica al usuario y a los partidos en un espacio politico - ej. economico x social/cultural (Figura 2 del paper).

Caracteristicas adicionales explicitadas por los autores:
- Desarrolladas por **organizaciones "nonparty"** (no comerciales, con background civico-educativo o academico).
- Contenido **predictivo e issue-oriented**: no evalua desempeno de gobierno pasado ni juzga calidad personal de candidatos.
- Formato **heterogeneo** entre implementaciones.

## Historia y difusion (linea de tiempo - todo verificado en el paper)

- **1989 - Paises Bajos**: nace la primera VAA, **StemWijzer** en version paper-and-pencil (booklet + diskette), pensada para educacion en secundaria. 60 statements sacados de programas de partido.
- **1996 - Finlandia**: la broadcaster publica finlandesa desarrolla su primera VAA.
- **1998 - Paises Bajos**: primera version online de StemWijzer para la eleccion parlamentaria. Solo 6.500 usuarios.
- **1999 - Finlandia**: Helsingin Sanomat (diario) construye su propia VAA para elecciones al Parlamento Europeo.
- **2001 - Finlandia**: 11 VAAs distintas disponibles.
- **2002 - Alemania**: se lanza **Wahl-O-Mat**. "More than 50 million users ever since" (segun el paper, hasta 2019).
- **2002-2003 - Paises Bajos**: StemWijzer explota, +2M de usuarios, se convierte en el sitio politico mas usado del pais.
- **2003 - Suiza**: nace **smartvote** (250K usuarios en debut, casi cuadriplica en 4 anos). Reemplaza a Politarena.
- **2003 - Belgica (Flandes)**: **Doe de Stemtest!** de la broadcaster VRT, apalancada por show de TV. 840.000 recomendaciones en debut.
- **2007 - Finlandia**: >20 VAAs disponibles, la mas popular con >1M usuarios.
- **2009**: **EU Profiler**, primera VAA supranacional para elecciones al Parlamento Europeo.
- **2010+**: expansion global. Segun censo del ECPR VAA Research Network (mencionado en el paper), VAAs han sido desplegadas en Canada, Mexico, Australia, Nueva Zelanda, Tunez, Egipto, Marruecos, Israel, Turquia, Brasil, Peru, Venezuela, Ecuador, Japon, Taiwan, Corea del Sur.
- **2014**: **euandi**, segunda VAA supranacional europea.
- **2017**: StemWijzer 6.8M usos en elecciones parlamentarias holandesas. Wahl-O-Mat 15.6M usos en federales alemanas.

## Efectos comprobados en los votantes (segun el paper)

### Sobre conocimiento politico e interes

- Usuarios de VAAs son en promedio mas interesados y con mayor conocimiento politico que no-usuarios (Marschall 2014).
- Hay endogeneidad: el interes politico predice el uso de VAA (Hirzalla et al. 2010), no solo al reves.
- Krouwel et al. (2015): usuarios **perciben** que mejoro su conocimiento politico, con discrepancias entre percepcion y medicion factual.
- Schultze (2014): Wahl-O-Mat produce **efectos causales positivos** en el conocimiento de posiciones de partidos.

### Sobre participacion electoral (turnout)

- Ladner (Suiza) y Marschall (Alemania): autoreportes de mayor motivacion. 1 de cada 10 usuarios del Wahl-O-Mat 2005/2009. 40% de usuarios de Smartvote 2007 Suiza.
- Con datos de National Election Studies (mas robustos):
  - Gemenis & Rosema (2014): 4.4% del turnout reportado en Holanda 2006 atribuible a VAAs (propensity score matching).
  - Marschall & Schultze (2012): Wahl-O-Mat users 6% mas propensos a votar.
  - Dinas et al. (2014): Euro Parliament 2009, +14 pp para VAA users.
  - **Garzia, Trechsel & De Angelis (2017)**: 12 election studies (Finlandia, Alemania, Holanda, Suiza) - VAA aumenta prob de votar en **2-12 pp**.
- **RCT en Italia 2013** (Garzia et al. 2017): confirmo experimentalmente el efecto (>10 pp).

### Sobre eleccion de voto (vote choice)

- Concepto clave: **"representative deficit"** (Alvarez et al. 2014) = grado en que el usuario no matchea con la oferta politica.
- Wall, Krouwel & Vitiello (2014) / Pianzola et al. (2019): los usuarios siguen el consejo mas cuando la VAA recomienda un partido que **ya estaban considerando**.
- **Walgrave, van Aelst & Nuytemans (2008)** - Doe de Stemtest en Flandes: solo la mitad de los usuarios que declararon dudar por el VAA (8% del total) efectivamente cambiaron su voto.
- **Alvarez et al. (2014)** - EU Profiler 2009: 8% de usuarios reordenaron sus preferencias hacia el top match del VAA.
- **Kleinnijenhuis et al. (2017)** - Holanda 2010/2012 con panel de 3 olas + media content: encontraron efectos genuinos del VAA (no espurios), especialmente en votantes indecisos.

## El "proper construction" de una VAA

Cuatro decisiones metodologicas criticas segun el paper:

### 1. Seleccion y formulacion de statements

- **Walgrave, Nuytemans & Pepermans (2009)**: simulacion de 500.000 configuraciones de 36 statements muestra que **cada configuracion favorece a alguien**.
- **Lefevere & Walgrave (2014)**: incluir mas statements left-right amplifica la ventaja de partidos extremos.
- **Holleman et al. (2016)**: el wording (negaciones explicitas/implicitas) afecta las respuestas, especialmente de usuarios menos sofisticados.

### 2. Medicion de posiciones de partidos

Tres metodos posibles:
- Analisis experto de manifiestos.
- Auto-posicionamiento del partido (con posible correccion experta).
- Auto-posicionamiento sin correccion.

- **Gemenis & van Ham (2014)**: auto-posicionamiento es problematico (baja tasa de respuesta, manipulacion estrategica hacia el centro). Expert surveys tambien tienen problemas.
- Solucion: **metodo iterativo Kieskompas** (Krouwel & van Elfrinkhof 2014) combina expert coding + auto-posicionamiento con control cruzado. Usado en EU Profiler 2009 y euandi 2014.
- **Metodo Delphi** (Gemenis 2015) para EU Vox: iteracion anonima con feedback entre expertos.

### 3. Algoritmo

- **Louwerse & Rosema (2014)**: hasta el **90% de los usuarios recibiria una recomendacion distinta** si se usa otro algoritmo.
- Algoritmos: distancia Manhattan/city-block (mas usado), simple agreement, distancia Euclidiana.
- **Mendez (2012)**: propone algoritmo hibrido para superar limitaciones.

### 4. Visualizacion

- **Germann & Mendez (2016)**: desafian propiedades psicometricas de mapas 2D. Proponen **dynamic scale validation** con datos de usuarios reales.

## VAAs como fuente de datos para investigacion politica

Segunda rama de investigacion identificada por los autores:
- Analisis longitudinal de cambios en posiciones de partidos (Dalton 2016).
- Estudio de si partidos cumplen "promesas" del VAA una vez en gobierno (Fivaz et al. 2014).
- Comparacion posiciones partidos vs sus votantes (representative deficit).
- **Bright, Garzia, Lacey & Trechsel (2016)**: con EU Profiler, mayoria de votantes europeos tendria mejor match con un partido de OTRO pais europeo.
- Katsanidou & Otjes (2016): reordenamiento del espacio politico griego post-crisis.

## Cuestiones abiertas (segun los autores)

**Core VAA research**:
- Por que ciertos paises adoptan VAAs y otros no.
- Interaccion entre preferencias previas, resultado del VAA, contexto electoral y oferta partidaria.
- Falta de estandares gold para posicionar partidos y para algoritmos.
- Cuestiones eticas (proteccion de datos, hacking).
- Impacto normativo: contribuyen a racionalizar el discurso politico? Despersonalizan?

**VAAs como data source**:
- Limpiar, harmonizar y federar datos (iniciativa ECPR VAA Research Network).
- Overcome self-selection bias (ex-post stratification).
- Machine learning para explotar el volumen.
- Interdisciplinariedad.

---

##  INTERPRETACION PROPIA - Utilidad para Tinder Decisivo

> **Advertencia**: esta seccion NO es contenido del paper. Es lectura personal de como aplicar el paper al proyecto Tinder Decisivo. No usar como cita textual del autor original en la tesis.

- Es la **cita canonica #1** para definir VAAs en la introduccion de la tesis.
- Justifica hacer una VAA para Chile: la evidencia comparativa muestra efectos reales sobre turnout (2-12 pp).
- Justifica decisiones de diseno de Tinder Decisivo (numero de statements, algoritmo, presentacion de resultados).
- El framework "representative deficit" de Alvarez et al. 2014 (citado aca) es util para hablar del hero card "coincides en 10 de 12" en el Home HUB.
- La historia StemWijzer -> Wahl-O-Mat -> smartvote es la narrativa de apertura ideal.

## Cita sugerida (APA)

> Garzia, D., & Marschall, S. (2019). Voting Advice Applications. *Oxford Research Encyclopedia of Politics*. Oxford University Press. https://doi.org/10.1093/acrefore/9780190228637.013.620
