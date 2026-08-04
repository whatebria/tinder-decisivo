"""Presentacion 4 -- Ingenieria, Arquitectura y Resultados."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path: str):
    prs = new_prs()

    # -- Slide 1 -- PORTADA --------------------------------------------------
    dark_cover(
        prs,
        title="Ingenieria para la Democracia",
        subtitle="Arquitectura, decisiones tecnologicas, resultados y lecciones aprendidas",
        label="Presentacion 4 de 4  --  Ingenieria, Arquitectura y Resultados",
        notes=(
            "APERTURA -- 15 a 20 minutos\n\n"
            "Esta presentacion responde: como se construyo el sistema?\n\n"
            "La audiencia tecnica (comision evaluadora de ingenieria) puede "
            "encontrar aqui el trabajo real de ingenieria detras de la propuesta.\n\n"
            "Tres mensajes centrales:\n"
            "  1. Las decisiones tecnologicas tuvieron justificacion explicita.\n"
            "  2. La ingenieria estuvo al servicio del problema civico, no al reves.\n"
            "  3. El sistema produce conocimiento reutilizable, no solo software."
        )
    )

    # -- Slide 2 -- OBJETIVOS ------------------------------------------------
    light_slide(
        prs,
        title="Los objetivos del proyecto de tesis",
        accent_line="1 objetivo general. 7 especificos.",
        body_lines=[
            "OBJETIVO GENERAL:",
            "  Disenar e implementar una Voting Advice Application de codigo abierto",
            "  orientada al contexto electoral chileno.",
            "",
            "OBJETIVOS ESPECIFICOS:",
            "  1. Investigar el problema del deficit informativo electoral en Chile",
            "  2. Analizar el estado del arte en VAAs internacionales y nacionales",
            "  3. Disenar una experiencia de usuario centrada en la reduccion de carga cognitiva",
            "  4. Definir un algoritmo de matching con ponderacion e indicador de confianza",
            "  5. Implementar el sistema completo con arquitectura cliente-servidor",
            "  6. Establecer un modelo de verificacion de datos con fuentes trazables",
            "  7. Documentar el sistema para facilitar contribuciones externas",
        ],
        notes=(
            "Los 7 objetivos especificos cubren el ciclo completo:\n"
            "investigacion -> analisis -> diseno -> algoritmo -> implementacion -> datos -> documentacion.\n\n"
            "Al cierre del proyecto:\n"
            "  - Objetivos 1-6: alcanzados completamente.\n"
            "  - Objetivo 7 (documentacion para contribuidores): alcanzado parcialmente.\n"
            "    La documentacion existe pero requiere ampliacion.\n\n"
            "Esta honestidad sobre el estado de los objetivos es parte del modelo de "
            "transparencia que atraviesa todo el proyecto."
        )
    )

    # -- Slide 3 -- METODOLOGIA ----------------------------------------------
    light_slide(
        prs,
        title="Metodologia: 8 fases iterativas en ~32 semanas",
        body_lines=[
            "Fase 0  Investigacion del estado del arte",
            "        Analisis comparativo: 9 VAAs + 4 iniciativas chilenas",
            "",
            "Fase 1  Diseno de arquitectura y contrato API",
            "        Modelo de dominio + primer schema OpenAPI 3.1",
            "",
            "Fase 2  MVP end-to-end",
            "        Flujo funcional desde registro hasta resultados",
            "",
            "Fase 3  Auditoria y refactorizacion",
            "        4 hallazgos criticos de seguridad resueltos + DRY aplicado",
            "",
            "Fase 4  Expansion territorial",
            "        Modelo polimorfico + preguntas base transversales",
            "",
            "Fase 5  Simplificacion YAGNI",
            "        Swipe eliminado + DecisionFinal eliminado",
            "",
            "Fase 6  Sistema de diseno y accesibilidad",
            "        Atomic Design + WCAG 2.2 AA",
            "",
            "Fase 7  Documentacion y tesis",
            "        37 documentos auditados contra el codigo real",
        ],
        notes=(
            "La Fase 5 (Simplificacion YAGNI) merece atencion especial:\n"
            "Se eliminaron features que habian sido implementadas porque no resolvian "
            "el problema central del usuario. YAGNI = You Aren't Gonna Need It.\n\n"
            "Esta decision requirio disciplina: mas facil es mantener el codigo existente "
            "que decidir que no pertenece al sistema.\n\n"
            "La Fase 3 (Auditoria de seguridad) fue un momento honesto: el codigo del "
            "prototipo de Aplicaciones Moviles tenia deuda tecnica de seguridad que "
            "habia que resolver antes de continuar.\n\n"
            "La metodologia fue iterativa pero disciplinada: cada fase tenia "
            "un objetivo claro y entregables verificables."
        )
    )

    # -- Slide 4 -- ARQUITECTURA CONCEPTUAL ----------------------------------
    section_break(
        prs, "ARQ", "Arquitectura del Sistema",
        "Separacion de responsabilidades como garantia de auditabilidad",
        notes=(
            "Transicion a la arquitectura.\n\n"
            "La decision arquitectonica mas importante del proyecto no fue "
            "que tecnologia usar. Fue DONDE vive el algoritmo.\n\n"
            "La respuesta a esa pregunta determina si el sistema puede ser auditado "
            "o si opera como una caja negra."
        )
    )

    # -- Slide 5 -- CLIENTE-SERVIDOR -----------------------------------------
    two_col_slide(
        prs,
        title="Arquitectura cliente-servidor: la separacion que importa",
        left_title="Backend (servidor)",
        left_lines=[
            "Django 5.2 + DRF",
            "",
            "-- Persistencia de datos",
            "-- Logica del algoritmo de matching",
            "-- Autenticacion y autorizacion",
            "-- API REST con contrato OpenAPI 3.1",
            "",
            "Es la fuente de verdad del sistema.",
            "El algoritmo SOLO vive aqui.",
            "Auditable de manera independiente",
            "del frontend.",
        ],
        right_title="Frontend (cliente)",
        right_lines=[
            "Expo + React Native + TypeScript",
            "",
            "-- Presentacion de informacion",
            "-- Captura de respuestas del usuario",
            "-- Navegacion entre pantallas",
            "-- Comunicacion con el servidor",
            "",
            "NO contiene logica de negocio critica.",
            "Su funcion: mediar entre el usuario",
            "y el servidor.",
            "Multiplataforma: web + iOS + Android",
        ],
        notes=(
            "Esta separacion es critica para la auditabilidad electoral.\n\n"
            "Si el algoritmo de calculo estuviera en el cliente (frontend), "
            "seria posible que distintos usuarios recibieran calculos distintos "
            "segun la version del cliente que ejecutaran.\n\n"
            "Al vivir exclusivamente en el servidor, el algoritmo es unico, "
            "auditable de manera independiente y no puede ser alterado por el cliente.\n\n"
            "El contrato OpenAPI 3.1 genera tipos TypeScript automaticamente.\n"
            "Cuando el backend cambia, el compilador señala exactamente donde\n"
            "el frontend debe actualizar. Esto elimina errores de integracion "
            "que de otro modo solo aparecerian en tiempo de ejecucion."
        )
    )

    # -- Slide 6 -- MODELO DE DATOS ------------------------------------------
    light_slide(
        prs,
        title="4 dominios del modelo de datos — 19 modelos en total",
        body_lines=[
            "CATALOGO ELECTORAL",
            "  TipoEleccion, Candidato, Partido, ListaElectoral",
            "  Pregunta (organizada por eje), Eje, OpcionRespuesta",
            "",
            "INTERACCION DEL USUARIO",
            "  Respuesta, ResultadoCandidato, ResultadoEje",
            "  Guardado (favoritos), Descartado",
            "",
            "TERRITORIO",
            "  Region, Distrito, Comuna",
            "  Modelo polimorfico auto-recursivo para jerarquia electoral",
            "",
            "PERFIL Y CONTENIDO",
            "  Perfil de usuario, Noticia, MarcadorNoticia",
            "  PosturaCandidato (con nivel de confianza: ALTA / MEDIA / BAJA)",
        ],
        notes=(
            "19 modelos Django que cubren el dominio completo del problema electoral.\n\n"
            "El modelo territorial polimorfico es una decision arquitectonica interesante:\n"
            "  16 regiones, 28 distritos electorales, 346 comunas\n"
            "  representados como jerarquia auto-recursiva.\n"
            "  Permite que el filtrado de candidatos por usuario sea un algoritmo\n"
            "  generico extensible a cualquier profundidad de jerarquia territorial.\n\n"
            "PosturaCandidato con nivel de confianza (ALTA/MEDIA/BAJA) es la "
            "implementacion tecnica del principio de transparencia:\n"
            "  No se puede ocultar la incertidumbre. Si no se sabe con certeza, "
            "  se debe declarar. El sistema lo muestra explicitamente al usuario.\n\n"
            "42 migraciones documentan la evolucion del schema desde el dia 1."
        )
    )

    # -- Slide 7 -- DECISIONES TECNOLOGICAS ----------------------------------
    section_break(
        prs, "TECH", "Decisiones Tecnologicas",
        "YAGNI aplicado: herramientas probadas que resuelven el problema actual",
        notes=(
            "Todas las decisiones tecnologicas siguieron el mismo criterio:\n"
            "'Elegir herramientas probadas en produccion, con comunidades activas, "
            "que resuelvan el problema actual sin anadir complejidad que no sea necesaria hoy.'\n\n"
            "Este criterio refleja YAGNI aplicado a la eleccion de stack.\n"
            "No se eligio lo mas moderno ni lo mas popular: se eligio lo mas adecuado."
        )
    )

    # -- Slide 8 -- BACKEND DJANGO -------------------------------------------
    two_col_slide(
        prs,
        title="Backend: Django y Django REST Framework",
        left_title="Por que Django?",
        left_lines=[
            "1. Madurez y estabilidad",
            "   Django 5.2 — 20 anos en produccion",
            "",
            "2. Panel de administracion incluido",
            "   Interfaz de gestion de candidatos",
            "   y posturas sin construir una custom",
            "",
            "3. DRF como extension natural",
            "   Serializacion, validacion y",
            "   autenticacion integradas",
            "",
            "4. ORM maduro y predecible",
            "   Consultas legibles, migraciones",
            "   versionadas automaticamente",
        ],
        right_title="Alternativa considerada y razon de no eleccion",
        right_lines=[
            "FastAPI",
            "  + Mas moderno",
            "  + Mayor rendimiento asintotico",
            "  -- Sin panel de administracion integrado",
            "     (requerimiento funcional critico:",
            "     el equipo necesitaba gestionar datos",
            "     sin acceso directo a la BD)",
            "",
            "La razon de no elegirla:",
            "YAGNI + el admin de Django resuelve",
            "el problema real sin costo adicional.",
        ],
        notes=(
            "La decision de Django sobre FastAPI es un ejemplo canonico de YAGNI:\n\n"
            "FastAPI es mas moderno y tecnicamente mas eficiente para APIs puras.\n"
            "Pero el proyecto tenia un requerimiento especifico: el equipo de curacion "
            "de posturas necesitaba una interfaz de administracion sin escribir codigo.\n\n"
            "Django incluye eso por defecto. FastAPI no.\n\n"
            "Agregar FastAPI + una interfaz de admin custom habria sido mas complejo "
            "que usar Django que resuelve ambos problemas con una sola herramienta.\n\n"
            "Esta transparencia sobre las alternativas consideradas es parte del "
            "modelo de documentacion del proyecto: cada decision registra que se "
            "evaluo y por que no se eligio."
        )
    )

    # -- Slide 9 -- FRONTEND -------------------------------------------------
    two_col_slide(
        prs,
        title="Frontend: Expo + React Native + TypeScript",
        left_title="Por que Expo + React Native?",
        left_lines=[
            "Una sola base de codigo para:",
            "  Web + iOS + Android",
            "",
            "Cobertura maxima de usuarios",
            "para una plataforma civica.",
            "",
            "Expo: ecosistema de herramientas,",
            "simplifica compilacion multi-plataforma.",
            "",
            "TypeScript strict: contrato de tipos",
            "consistente en todo el frontend.",
        ],
        right_title="Estado / cache y alternativas evaluadas",
        right_lines=[
            "TanStack Query v5 (estado servidor)",
            "  Cache automatica, deduplicacion,",
            "  retry, estados de carga/error.",
            "",
            "Zustand (estado cliente)",
            "  Auth y cuestionario. Minimo boilerplate.",
            "",
            "Redux: descartado (YAGNI).",
            "Context+useReducer: descartado",
            "  (dificultad de debugging en estados complejos).",
            "",
            "PWA: descartada por limitaciones",
            "  en acceso a capacidades nativas.",
        ],
        notes=(
            "El requerimiento de cobertura multiplataforma es un argumento civico:\n"
            "una plataforma electoral que solo funciona en web excluye a los usuarios "
            "que consumen contenido principalmente desde dispositivos moviles.\n\n"
            "TanStack Query resolvio un problema real: sin cache automatica, "
            "cada navegacion entre pantallas hacia un request nuevo al servidor. "
            "Con TQ, los datos se cachean y el tiempo percibido de respuesta cae.\n\n"
            "Zustand sobre Redux fue otra decision YAGNI:\n"
            "Redux tiene capacidades que VotoAfin no necesita y complejidad que "
            "encarece el mantenimiento sin agregar valor.\n\n"
            "TypeScript strict modo: cada error de tipo se detecta en compilacion, "
            "no en ejecucion. En un contexto de contribuidores externos, esto reduce "
            "drasticamente los bugs de integracion."
        )
    )

    # -- Slide 10 -- LICENCIA AGPL -------------------------------------------
    dark_text_slide(
        prs,
        title="La decision de licencia: AGPL-3.0",
        highlight="La tecnologia electoral no deberia ser propiedad de nadie.",
        body=(
            "La AGPL (Affero General Public License) v3.0 establece:\n"
            "Cualquier version modificada del software que sea desplegada publicamente\n"
            "debe publicar su codigo fuente con la misma licencia.\n\n"
            "Por que AGPL y no MIT o Apache?\n\n"
            "  MIT / Apache: cualquiera puede hacer una version cerrada y privada.\n"
            "  Un gobierno o empresa podria modificar el algoritmo y no compartir esos cambios.\n\n"
            "  AGPL: cualquier version modificada DEBE publicar su codigo.\n"
            "  Ningun actor puede hacer opaca la logica de una herramienta electoral.\n\n"
            "Impacto adicional: habilita reutilizacion para otros paises de LatAm\n"
            "sin permitir que los reutilizadores cierren el codigo."
        ),
        notes=(
            "Esta fue una de las decisiones mas reflexivas del proyecto.\n\n"
            "En un producto comercial, la eleccion de licencia es una decision de negocio.\n"
            "En un producto electoral, es una decision etica.\n\n"
            "La AGPL es la licencia libre mas restrictiva en terminos de copyleft.\n"
            "Fue elegida deliberadamente porque el sistema procesa posiciones politicas "
            "de ciudadanos y produce recomendaciones de voto.\n\n"
            "Una herramienta de esas caracteristicas tiene la obligacion de ser auditable "
            "por cualquier persona, organismo de observacion electoral o investigador academico.\n\n"
            "Si cualquier actor (gobierno, partido, ONG) despliega una version modificada, "
            "los cambios al algoritmo son publicos. No puede haber manipulacion oculta."
        )
    )

    # -- Slide 11 -- EL PRINCIPIO DE LOS DATOS --------------------------------
    dark_text_slide(
        prs,
        title="El principio que organizo todos los datos",
        highlight="Nunca inventar datos electorales.",
        body=(
            "El momento que establecio el principio:\n\n"
            "El asistente de desarrollo intento inferir posturas de candidatos\n"
            "a partir de estereotipos ideologicos generales.\n\n"
            "'El candidato X es de derecha, por tanto su postura sobre el aborto es Y.'\n\n"
            "La autora del proyecto lo identifico de inmediato:\n"
            "las inferencias no son posturas verificadas. Pueden ser incorrectas Y sesgadas.\n\n"
            "Protocolo implementado como consecuencia:\n"
            "  -- Cada fila de datos requiere justificacion textual minima (20 caracteres)\n"
            "  -- URL de fuente primaria verificable obligatoria\n"
            "  -- El sistema RECHAZA automaticamente entradas sin esos campos\n"
            "  -- Posturas con incertidumbre: nivel de confianza BAJA, visible al usuario"
        ),
        notes=(
            "Este episodio fue uno de los momentos mas importantes del proyecto y "
            "merece narrarse con honestidad.\n\n"
            "La respuesta intuitiva seria ocultar el episodio o minimizarlo.\n"
            "La respuesta correcta -- la que el proyecto tomo -- fue convertirlo en\n"
            "un principio de diseno que atraviesa todo el sistema.\n\n"
            "El principio 'nunca inventar datos electorales' no es solo una regla de datos:\n"
            "es la implementacion tecnica de la etica del sistema.\n\n"
            "Un sistema electoral que genera recomendaciones basadas en datos fabricados\n"
            "no asesora al votante: lo desinforma con formato de credibilidad.\n\n"
            "Esa distincion -- entre desinformacion con y sin formato de credibilidad --\n"
            "es exactamente la que el problema original identifico como danina para la\n"
            "democracia."
        )
    )

    # -- Slide 12 -- SEGURIDAD Y AUTENTICACION --------------------------------
    two_col_slide(
        prs,
        title="Seguridad: la solucion mas simple que resuelve el problema real",
        left_title="Contexto web",
        left_lines=[
            "Token en cookie httpOnly",
            "  Atributos: SameSite=Lax, Secure",
            "  JavaScript NUNCA accede al token",
            "  Mitiga XSS (Cross-Site Scripting)",
            "",
            "PBKDF2 para contrasenas",
            "  Estandar por defecto de Django",
            "",
            "TOKEN_TTL_DAYS = 7",
            "  Token expira en 7 dias",
            "  Re-autenticacion requerida",
        ],
        right_title="Contexto nativo (iOS / Android)",
        right_lines=[
            "Token en almacenamiento seguro del SO",
            "  Keychain (iOS)",
            "  EncryptedSharedPreferences (Android)",
            "",
            "Inaccesible para otras apps",
            "",
            "17 hallazgos de seguridad:",
            "  15 resueltos durante la auditoria",
            "  2 aceptados como deuda documentada",
            "  0 sin accion ni documentacion",
        ],
        notes=(
            "La autenticacion sigue el principio de 'la solucion mas simple que\n"
            "resuelve el problema real'.\n\n"
            "El dual-mode authentication (cookie en web, almacenamiento seguro en nativo)\n"
            "responde a que los vectores de ataque son distintos en cada contexto:\n"
            "  - En web: XSS es el principal riesgo para tokens en localStorage.\n"
            "  - En nativo: otras apps no pueden acceder al Keychain ni a EncryptedSharedPrefs.\n\n"
            "Los 17 hallazgos de seguridad fueron identificados durante la auditoria formal.\n"
            "15 resueltos, 2 documentados con razon explicita de aceptacion.\n\n"
            "Este nivel de transparencia sobre deuda de seguridad es parte del mismo\n"
            "principio de honestidad que aplica a los datos de candidatos."
        )
    )

    # -- Slide 13 -- METRICAS DE EVOLUCION --------------------------------
    stat_slide(
        prs,
        title="Evolucion del sistema: Sprint 8 inicial vs. estado final",
        stats=[
            ("212", "commits en main\n(inicio: 2)", ACCENT),
            ("370", "tests automatizados\n(inicio: 46)", PRI_LIGHT),
            ("17/17", "hallazgos de seguridad\nresueltos", ACCENT),
            ("89", "componentes UI\nreutilizables (inicio: 7)", SECONDARY),
        ],
        notes=(
            "Estas metricas representan la magnitud del trabajo de ingenieria\n"
            "entre el prototipo de Aplicaciones Moviles y el sistema de tesis.\n\n"
            "212 commits no son solo cambios de codigo: son decisiones documentadas,\n"
            "refactorizaciones argumentadas, y evidencia de un proceso de desarrollo\n"
            "con revision continua.\n\n"
            "370 tests automatizados: la relacion test/codigo aumento a lo largo\n"
            "del proyecto. La suite cubre servicios de negocio y endpoints de API.\n\n"
            "89 componentes UI reutilizables: el crecimiento desde 7 refleja la\n"
            "aplicacion de Atomic Design -- la UI crece por composicion, no por\n"
            "duplicacion.\n\n"
            "17/17 hallazgos de seguridad resueltos o documentados: cero sin accion."
        )
    )

    # -- Slide 14 -- MAS METRICAS --------------------------------------------
    light_slide(
        prs,
        title="El sistema al cierre del proyecto",
        body_lines=[
            "DATOS CARGADOS",
            "  Candidatos presidenciales 2025-2026 con posturas en 12 preguntas base",
            "  140 diputados 2025, asignados a sus 28 distritos electorales",
            "  12 preguntas con contexto educativo en 5 dimensiones cada una",
            "",
            "CODIGO Y ARQUITECTURA",
            "  19 modelos de datos  --  42 migraciones  --  ~31 endpoints REST",
            "  17 pantallas frontend  --  30 hooks de datos  --  4 servicios puros",
            "  Contrato OpenAPI 3.1 generado automaticamente desde el backend",
            "",
            "DOCUMENTACION",
            "  37 documentos tecnicos auditados contra el codigo fuente real",
            "  Cero referencias a datos obsoletos o features eliminadas",
            "",
            "DISTRIBUCION",
            "  Repositorio publico GitHub (whatebria/tinder-decisivo)",
            "  Licencia AGPL-3.0  --  Listo para contribuidores externos",
        ],
        notes=(
            "Este slide es la fotografia del estado real del sistema al cierre.\n\n"
            "Los 37 documentos tecnicos auditados contra codigo real es un punto\n"
            "importante: la documentacion no fue escrita a priori ni copiada de otra fuente.\n"
            "Fue verificada linea a linea contra el codigo fuente para garantizar que\n"
            "refleja la realidad del sistema, no una version idealizada.\n\n"
            "El contrato OpenAPI 3.1 generado automaticamente significa que la\n"
            "documentacion de la API se actualiza con el codigo: nunca puede quedar desincronizada.\n\n"
            "El repositorio publico bajo AGPL-3.0 es la entrega que va mas alla\n"
            "del proyecto academico: es infraestructura reutilizable."
        )
    )

    # -- Slide 15 -- DESAFIOS ------------------------------------------------
    section_break(
        prs, "!!", "Los 3 Grandes Desafios",
        "Los problemas que no estaban en el curriculum",
        notes=(
            "Transicion a los desafios.\n\n"
            "Todo proyecto de ingenieria enfrenta desafios que no aparecen en el\n"
            "curriculum de la carrera. VotoAfin tuvo tres principales.\n\n"
            "Narrarlos con honestidad es parte del valor academico del proyecto."
        )
    )

    # -- Slide 16 -- 3 DESAFIOS ----------------------------------------------
    light_slide(
        prs,
        title="Los tres desafios principales",
        body_lines=[
            "DESAFIO 1 -- LOS DATOS",
            "  Las posturas de candidatos chilenos no estan sistematizadas en ninguna BD abierta.",
            "  Requiere consulta de multiples fuentes primarias por cada postura.",
            "  Es trabajo intensivo en tiempo humano. No automatizable de manera confiable.",
            "  Solucion adoptada: importar con nivel de confianza declarado, documentar verificacion pendiente.",
            "",
            "DESAFIO 2 -- LA NEUTRALIDAD",
            "  Disenar preguntas de politica publica que no favorezcan ninguna posicion ideologica",
            "  es mas dificil de lo que parece. El lenguaje mismo es un campo politico.",
            "  Solucion adoptada: revision para eliminar sesgos evidentes, lenguaje positivo,",
            "  presentacion de multiples perspectivas. Revision con especialistas pendiente.",
            "",
            "DESAFIO 3 -- LA SOSTENIBILIDAD",
            "  Las VAAs ciudadanas en Chile han sido discontinuadas por falta de financiamiento.",
            "  Decide Chile fue el ejemplo mas reciente.",
            "  Solucion adoptada: codigo abierto (AGPL-3.0) + importacion via CSV para voluntarios.",
            "  Camino largo: alianzas institucionales con universidades u organizaciones civicas.",
        ],
        notes=(
            "Estos tres desafios no son de ingenieria pura: son de contexto civico.\n\n"
            "DESAFIO 1 (Datos): la curaduría de posturas no se puede automatizar sin\n"
            "riesgo de reproducir sesgos. Un LLM que 'infiere' posturas a partir de la\n"
            "ideologia del partido seria mas rapido pero completamente inaceptable.\n\n"
            "DESAFIO 2 (Neutralidad): la investigacion politologica sobre formulacion\n"
            "de encuestas muestra que el orden de las opciones, los terminos elegidos\n"
            "y el encuadre de la pregunta afectan las respuestas. Resolver esto\n"
            "correctamente requiere revision con especialistas en metodologia de encuestas.\n\n"
            "DESAFIO 3 (Sostenibilidad): el problema de fondo es que la informacion\n"
            "electoral tiene maxima relevancia dos semanas por ano y es cara de mantener\n"
            "el resto del tiempo. Sin modelo de financiamiento estable, las VAAs mueren."
        )
    )

    # -- Slide 17 -- LECCIONES -----------------------------------------------
    two_col_slide(
        prs,
        title="Lecciones aprendidas — las que perduran",
        left_title="Lecciones de producto",
        left_lines=[
            "La pregunta de diseno determina",
            "la solucion. Invertir en precisar",
            "la pregunta correcta tiene el",
            "mayor retorno del proceso.",
            "",
            "Los datos son el producto.",
            "El algoritmo es el envoltorio.",
            "Un algoritmo perfecto sobre datos",
            "inventados produce recomendaciones",
            "inutiles.",
            "",
            "La transparencia es un requerimiento",
            "funcional, no una caracteristica.",
        ],
        right_title="Lecciones de ingenieria",
        right_lines=[
            "La separacion de responsabilidades",
            "tiene valor medible: tests 30x",
            "mas rapidos, cero duplicacion.",
            "",
            "El contrato de API como disciplina",
            "de integracion: el compilador",
            "detecta incompatibilidades antes",
            "de llegar a produccion.",
            "",
            "La deuda tecnica documentada es",
            "manejable. La no documentada no.",
            "Declarar lo que se acepta y",
            "por que es parte del diseño.",
        ],
        notes=(
            "Estas lecciones son el aporte academico mas transferible del proyecto.\n\n"
            "LECCION 1 (pregunta de diseno): el cambio de 'como hacer atractivo el\n"
            "candidato' a 'como medir la coincidencia programatica' genero una solucion\n"
            "fundamentalmente distinta. Esta leccion trasciende las VAAs.\n\n"
            "LECCION 2 (datos > algoritmo): un sistema de recomendacion es tan bueno\n"
            "como sus datos. En sistemas electorales, la calidad de los datos no es\n"
            "una opcion: es una obligacion etica.\n\n"
            "LECCION 3 (separacion de responsabilidades): la extraccion de logica de\n"
            "negocio a servicios puros no fue una decision estetica. Los tests unitarios\n"
            "que no requieren BD ni HTTP corren 30x mas rapido. Eso es valor medible.\n\n"
            "LECCION 4 (deuda documentada): el proyecto adopto la practica de declarar\n"
            "explicitamente que deuda acepta y por que. Eso permite priorizar\n"
            "deliberadamente en lugar de reaccionar ante los problemas."
        )
    )

    # -- Slide 18 -- TRABAJO FUTURO ------------------------------------------
    light_slide(
        prs,
        title="Roadmap: 4 releases hacia el lanzamiento publico",
        body_lines=[
            "v0.2  --  DATOS VERIFICADOS",
            "  Verificacion completa de posturas con fuentes primarias",
            "  Expansion del cuestionario (mas de 12 preguntas)",
            "  Changelog publico de verificaciones",
            "",
            "v0.3  --  EXPLICABILIDAD",
            "  Que preguntas causaron que un candidato rankeara alto o bajo?",
            "  Simulador interactivo de sensibilidad del resultado",
            "",
            "v0.4  --  EXPANSION DE COBERTURA",
            "  Elecciones municipales y regionales (donde ocurrio el +460% de nulos)",
            "  Notificaciones personalizadas",
            "  Onboarding del lado del candidato",
            "",
            "v1.0  --  LANZAMIENTO PUBLICO",
            "  Hosting en produccion  --  Pruebas de carga  --  Internacionalizacion",
        ],
        notes=(
            "El roadmap no es una lista de deseos: es el resultado de una evaluacion\n"
            "explicita de que falta para que el sistema este listo para impacto real.\n\n"
            "v0.2 es la prioridad mas alta: sin datos verificados completos, el MVP\n"
            "comunica incertidumbre de manera honesta pero no puede garantizar la\n"
            "calidad que una herramienta electoral requiere para ser util.\n\n"
            "v0.3 (explicabilidad) es la feature mas demandada academicamente:\n"
            "los investigadores de ciencia politica quieren entender no solo el\n"
            "resultado sino las preguntas que lo determinaron.\n\n"
            "v0.4 (cobertura municipal) ataca directamente el mayor problema identificado:\n"
            "los +460% de votos nulos para alcalde ocurrieron en esas elecciones,\n"
            "y VotoAfin no las cubre todavia.\n\n"
            "v1.0 requiere alianzas institucionales para el hosting y la escala."
        )
    )

    # -- Slide 19 -- POTENCIAL DE EVOLUCION ----------------------------------
    dark_text_slide(
        prs,
        title="Potencial de evolucion: tres dimensiones",
        highlight="Una base tecnica que va mas alla de una tesis.",
        body=(
            "INVESTIGACION ACADEMICA\n"
            "  La plataforma puede ser utilizada por equipos de ciencia politica para:\n"
            "  estudiar el comportamiento electoral frente a informacion estructurada,\n"
            "  la relacion entre ponderacion de temas y resultado del matching.\n\n"
            "MODELO PARA OTROS PAISES\n"
            "  Arquitectura modular + AGPL-3.0 + importacion via CSV verificado.\n"
            "  Un fork para Argentina, Colombia o Mexico requiere actualizar datos,\n"
            "  no reconstruir la infraestructura tecnica.\n\n"
            "ALIANZAS INSTITUCIONALES\n"
            "  Modelo de Vote Compass: alianza con medios de comunicacion.\n"
            "  Vote Compass + CBC (Canada) = millones de usuarios.\n"
            "  VotoAfin + un medio chileno + SERVEL = escala masiva.\n"
            "  El codigo esta listo. El camino institucional esta documentado."
        ),
        notes=(
            "Este slide es el cierre del argumento de impacto.\n\n"
            "VotoAfin no termina cuando se entrega la tesis: es una base tecnica\n"
            "que puede evolucionar en multiples direcciones.\n\n"
            "El modelo de Vote Compass (alianza con CBC en Canada) es el referente:\n"
            "una VAA con algoritmo estandar alcanzo millones de usuarios gracias a\n"
            "su modelo de distribucion. VotoAfin tiene mejores especificaciones\n"
            "tecnicas que Vote Compass -- lo que le falta es la alianza de distribucion.\n\n"
            "La apertura del codigo bajo AGPL-3.0 es la decision que hace posibles\n"
            "estas tres dimensiones de evolucion. Una VAA propietaria no puede\n"
            "ser usada por investigadores ni adaptada por otros paises sin negociacion."
        )
    )

    # -- Slide 20 -- REFLEXION FINAL -----------------------------------------
    quote_slide(
        prs,
        quote=(
            "La tecnologia electoral no deberia ser propiedad de nadie. "
            "Deberia ser infraestructura publica, auditable, "
            "y construida con los mismos estandares de rigor y transparencia "
            "que esperamos de cualquier otro proceso de interes democratico. "
            "VotoAfin es un paso pequeno pero concreto en esa direccion."
        ),
        author="Jenifer Castillo -- Tesis UTFSM, 2026",
        notes=(
            "CIERRE de la Presentacion 4 y de la exposicion completa.\n\n"
            "Esta cita final viene de la seccion de reflexion final de la tesis.\n\n"
            "Sintetiza el argumento central de todo el proyecto:\n"
            "  - La tecnologia fue el medio, la democracia fue el fin.\n"
            "  - El estandar etico para tecnologia electoral es mas alto que para\n"
            "    tecnologia comercial.\n"
            "  - El proyecto es pequeno en escala pero coherente en valores.\n\n"
            "Tiempo estimado para la Presentacion 4: 18-22 minutos.\n\n"
            "Defensa completa (4 presentaciones): 55-70 minutos + preguntas.\n\n"
            "Para la sesion de preguntas: las preguntas mas probables son sobre\n"
            "el algoritmo (que funcion de penalizacion se uso y por que),\n"
            "la neutralidad de las preguntas, y el modelo de sostenibilidad.\n"
            "Las 3 estan documentadas en la tesis con respuestas desarrolladas."
        )
    )

    # -- Slide 21 -- CIERRE FINAL ----------------------------------------
    dark_cover(
        prs,
        title="Un problema real. Una investigacion real. Una solucion construida.",
        subtitle=(
            "VotoAfin  --  Sistema de asistencia al voto informado  --  Chile, 2026\n"
            "Codigo abierto bajo AGPL-3.0  --  github.com/whatebria/tinder-decisivo"
        ),
        label="Cierre -- Presentacion 4 de 4  --  Fin de la exposicion",
        notes=(
            "Slide de cierre final.\n\n"
            "No es necesario decir mucho aqui. La historia ya fue contada.\n\n"
            "La URL del repositorio permite que cualquier miembro de la comision\n"
            "acceda al codigo, la documentacion y los datos en cualquier momento.\n\n"
            "Si hay tiempo para preguntas, dejar la pantalla en este slide\n"
            "mientras se responden.\n\n"
            "GUION PARA DEFENSA DE 45-60 MINUTOS:\n"
            "  P1 (Problema):   10-12 min\n"
            "  P2 (Evolucion):  10-13 min\n"
            "  P3 (Solucion):   13-16 min\n"
            "  P4 (Ingenieria): 15-18 min\n"
            "  Preguntas:        7-15 min\n"
            "  Total:           55-74 min"
        )
    )

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("04_Ingenieria_Arquitectura_y_Resultados.pptx")
