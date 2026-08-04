"""P4 -- Proceso de Ingenieria y Conclusiones. Visual-first, sin parrafos en slides."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path):
    prs = new_prs()

    # 1 -- PORTADA -----------------------------------------------------------
    dark_cover(prs,
        title="Ingenieria para la Democracia",
        subtitle="Arquitectura, decisiones, desafios, resultados y lecciones aprendidas",
        label="Presentacion 4 de 4  --  Proceso de Ingenieria y Conclusiones",
        notes=(
            "APERTURA -- 15 a 20 minutos\n\n"
            "Esta presentacion responde: como se construyo el sistema?\n\n"
            "Tres mensajes centrales:\n"
            "  1. Las decisiones tecnologicas tuvieron justificacion explicita.\n"
            "  2. La ingenieria estuvo al servicio del problema civico, no al reves.\n"
            "  3. El sistema produce conocimiento reutilizable, no solo software.\n\n"
            "La audiencia tecnica encontrara aqui el trabajo real de ingenieria."
        ))

    # 2 -- OBJETIVOS ---------------------------------------------------------
    tight_bullets(prs,
        title="Objetivo general y 7 especificos",
        bullets=[
            "General: disenar e implementar una VAA de codigo abierto para Chile",
            "1. Investigar el deficit informativo electoral",
            "2. Analizar el estado del arte en VAAs internacionales",
            "3. Disenar UX centrada en reduccion de carga cognitiva",
            "4. Implementar algoritmo de matching con ponderacion y confianza",
        ],
        notes=(
            "Objetivos especificos completos (7):\n"
            "  1. Investigar el problema del deficit informativo electoral en Chile.\n"
            "  2. Analizar el estado del arte en VAAs internacionales y nacionales.\n"
            "  3. Disenar una experiencia de usuario centrada en la reduccion de carga cognitiva.\n"
            "  4. Definir algoritmo de matching con ponderacion e indicador de confianza.\n"
            "  5. Implementar el sistema completo con arquitectura cliente-servidor.\n"
            "  6. Establecer un modelo de verificacion de datos con fuentes trazables.\n"
            "  7. Documentar el sistema para facilitar contribuciones externas.\n\n"
            "Al cierre:\n"
            "  -- Objetivos 1-6: alcanzados completamente.\n"
            "  -- Objetivo 7: alcanzado parcialmente (documentacion existe pero requiere ampliacion).\n\n"
            "Esta honestidad sobre el estado de los objetivos es parte del modelo de transparencia."
        ))

    # 3 -- METODOLOGIA: 8 FASES ----------------------------------------------
    timeline_slide(prs,
        title="Metodologia -- 8 fases iterativas en ~32 semanas",
        items=[
            ("F0", "Investigacion\nVAAs + estado del arte", DARK2),
            ("F1", "Arquitectura\n+ contrato API", PRIMARY),
            ("F2", "MVP\nend-to-end", ACCENT),
            ("F3", "Auditoria\nseguridad + DRY", DANGER),
            ("F4-F7", "Expansion\nDiseno\nDocs\nTesis", SEC),
        ],
        notes=(
            "Las 8 fases completas:\n"
            "  F0: Investigacion del estado del arte -- 9 VAAs + 4 iniciativas chilenas\n"
            "  F1: Diseno de arquitectura y contrato API -- modelo de dominio + OpenAPI 3.1\n"
            "  F2: MVP end-to-end -- flujo funcional registro -> resultados\n"
            "  F3: Auditoria y refactorizacion -- 4 hallazgos criticos de seguridad + DRY\n"
            "  F4: Expansion territorial -- modelo polimorfico + preguntas base\n"
            "  F5: Simplificacion YAGNI -- swipe eliminado + DecisionFinal eliminado\n"
            "  F6: Sistema de diseno y accesibilidad -- Atomic Design + WCAG 2.2 AA\n"
            "  F7: Documentacion y tesis -- 37 documentos auditados contra codigo real\n\n"
            "La Fase 5 (Simplificacion YAGNI) es importante:\n"
            "Se eliminaron features implementadas que no resolvian el problema central.\n"
            "YAGNI = You Aren't Gonna Need It."
        ))

    # -- DISENO DEL SISTEMA ------------------------------------------------
    section_break(prs, "D", "Diseno y Arquitectura",
        "Las decisiones que determinaron la auditabilidad del sistema",
        notes=(
            "La decision arquitectonica mas importante no fue que tecnologia usar.\n"
            "Fue DONDE vive el algoritmo.\n\n"
            "Esa respuesta determina si el sistema puede ser auditado independientemente\n"
            "o si opera como una caja negra."
        ))

    # 5 -- CLIENTE-SERVIDOR --------------------------------------------------
    before_after(prs,
        title="Arquitectura cliente-servidor -- la separacion que importa",
        left_title="Backend (servidor)",
        left_items=[
            "Django 5.2 + DRF",
            "Persistencia y logica de negocio",
            "Algoritmo de matching (SOLO aqui)",
            "API REST con contrato OpenAPI 3.1",
            "Fuente de verdad del sistema",
        ],
        right_title="Frontend (cliente)",
        right_items=[
            "Expo + React Native + TypeScript",
            "Presentacion y navegacion",
            "Sin logica de negocio critica",
            "Multiplataforma: web + iOS + Android",
            "Tipos TypeScript generados desde OpenAPI",
        ],
        left_col=PRIMARY, right_col=ACCENT,
        notes=(
            "La separacion es critica para la auditabilidad electoral.\n\n"
            "Si el algoritmo estuviera en el cliente, podrian existir distintas versiones\n"
            "del calculo segun el cliente ejecutado.\n\n"
            "Al vivir exclusivamente en el servidor:\n"
            "  -- El algoritmo es unico\n"
            "  -- Es auditable de manera independiente\n"
            "  -- No puede ser alterado por el cliente\n\n"
            "El contrato OpenAPI 3.1 genera tipos TypeScript automaticamente.\n"
            "Cuando el backend cambia, el compilador senala donde el frontend debe actualizar.\n"
            "Elimina errores de integracion que de otro modo aparecen solo en produccion."
        ))

    # 6 -- MODELO DE DATOS ---------------------------------------------------
    three_cards(prs,
        title="Modelo de datos -- 4 dominios, 19 modelos, 42 migraciones",
        cards=[
            ("Catalogo Electoral",
             "TipoEleccion\nCandidato (partido, lista, territorio)\nPregunta (por eje)\nOpcionRespuesta\nPosturaCandidato + nivel confianza",
             PRIMARY),
            ("Interaccion\nde Usuario",
             "Respuesta del usuario\nResultadoCandidato\nResultadoEje (7 ejes)\nGuardado (favoritos)\nDescartado",
             ACCENT),
            ("Territorio\ny Perfil",
             "Region / Distrito / Comuna\n(modelo polimorfico auto-recursivo)\n\nPerfil usuario\nNoticia\nMarcadorNoticia",
             DARK2),
        ],
        notes=(
            "El modelo territorial polimorfico es una decision arquitectonica destacada:\n"
            "  16 regiones, 28 distritos electorales, 346 comunas\n"
            "  representados como jerarquia auto-recursiva.\n"
            "  Permite filtrado de candidatos por scope del usuario como algoritmo generico.\n\n"
            "PosturaCandidato con nivel de confianza (ALTA/MEDIA/BAJA) es la\n"
            "implementacion tecnica del principio de transparencia.\n\n"
            "42 migraciones documentan la evolucion del schema desde el dia 1."
        ))

    # 7 -- ALGORITMO DE MATCHING ---------------------------------------------
    flow_steps(prs,
        title="El algoritmo de matching -- 4 componentes",
        steps=[
            ("1", "Comparacion\nposicion a posicion",
             "Distancia normalizada\n0=discrepancia\n1=coincidencia"),
            ("2", "Aplicacion\ndel peso",
             "4 niveles de importancia\nMultiplicadores diferenciados"),
            ("3", "Cobertura\ny confianza",
             "Cuantas preguntas\nparticiparon?\nUmbral -> nivel confianza"),
            ("4", "Desglose\npor eje",
             "% por cada uno de\nlos 7 ejes tematicos\nAlimenta el radar"),
        ],
        notes=(
            "El algoritmo priorizo la EXPLICABILIDAD sobre la sofisticacion matematica.\n\n"
            "Cualquier ciudadano con comprension basica de proporciones puede entender\n"
            "como se calcula el resultado. Es un requerimiento funcional para la credibilidad.\n\n"
            "La funcion cuadratica de penalizacion (elevar al cuadrado la diferencia normalizada)\n"
            "penaliza los desacuerdos extremos con mayor severidad que los leves.\n"
            "Refleja la intuicion politica: distancias extremas son cualitativamente distintas\n"
            "de diferencias pequeñas.\n\n"
            "El indicador de confianza (Componente 3) es la diferenciacion algorítmica\n"
            "mas significativa respecto a VAAs internacionales."
        ))

    # -- DECISIONES TECNOLOGICAS -------------------------------------------
    section_break(prs, "T", "Decisiones Tecnologicas",
        "YAGNI aplicado: herramientas probadas para el problema actual",
        notes=(
            "Criterio aplicado a cada decision:\n"
            "'Elegir herramientas probadas en produccion, con comunidades activas,\n"
            "que resuelvan el problema actual sin anadir complejidad innecesaria.'\n\n"
            "Esto refleja YAGNI aplicado al stack."
        ))

    # 9 -- BACKEND: DJANGO vs FASTAPI ----------------------------------------
    before_after(prs,
        title="Backend -- Django vs FastAPI",
        left_title="Por que Django",
        left_items=[
            "20 anos de historia en produccion",
            "Panel de administracion incluido",
            "ORM + migraciones automaticas",
            "DRF: serializacion + validacion + auth",
            "YAGNI: resuelve ambos problemas con una herramienta",
        ],
        right_title="Por que NO FastAPI",
        right_items=[
            "Mas moderno y de mayor rendimiento",
            "Sin panel de administracion integrado",
            "El equipo necesitaba gestionar datos sin codigo",
            "Agregar admin custom = mas complejidad",
            "Descartado: YAGNI + requerimiento funcional critico",
        ],
        left_col=ACCENT, right_col=AMBER,
        notes=(
            "La decision de Django sobre FastAPI es un ejemplo canonico de YAGNI.\n\n"
            "FastAPI es tecnicamente superior para APIs puras.\n"
            "Pero el proyecto tenia un requerimiento especifico:\n"
            "el equipo de curacion de posturas necesitaba una interfaz de administracion\n"
            "sin escribir codigo adicional.\n\n"
            "Django incluye eso por defecto. FastAPI no.\n\n"
            "Agregar FastAPI + una interfaz de admin custom habria sido mas complejo\n"
            "que usar Django que resuelve ambos problemas con una sola herramienta."
        ))

    # 10 -- FRONTEND: EXPO vs PWA --------------------------------------------
    before_after(prs,
        title="Frontend -- Expo React Native vs PWA",
        left_title="Por que Expo + React Native",
        left_items=[
            "Una sola base de codigo: web + iOS + Android",
            "Cobertura maxima para plataforma civica",
            "TypeScript strict: errores detectados en compilacion",
            "TanStack Query v5: cache + deduplication + retry",
            "Zustand: estado minimo sin boilerplate de Redux",
        ],
        right_title="Por que NO PWA pura",
        right_items=[
            "Limitaciones en capacidades nativas del dispositivo",
            "Almacenamiento seguro de tokens (Keychain/EncryptedSharedPrefs)",
            "Notificaciones push (necesarias en versiones futuras)",
            "Descartada por limitaciones en el roadmap",
        ],
        left_col=ACCENT, right_col=AMBER,
        notes=(
            "El requerimiento de cobertura multiplataforma es un argumento civico:\n"
            "una plataforma electoral que solo funciona en web excluye a los usuarios\n"
            "que consumen contenido principalmente desde dispositivos moviles.\n\n"
            "TanStack Query resolvio un problema real de cache:\n"
            "sin ella, cada navegacion entre pantallas hacia un request nuevo al servidor.\n\n"
            "Redux fue descartado (YAGNI): tiene capacidades que VotoAfin no necesita\n"
            "y complejidad que encarece el mantenimiento sin agregar valor.\n\n"
            "Base de datos: SQLite en desarrollo, PostgreSQL en produccion.\n"
            "Deuda reconocida: viola Factor X del 12-Factor App. Documentada para resolver\n"
            "antes del lanzamiento mediante contenedores Docker."
        ))

    # 11 -- LICENCIA AGPL-3.0 ------------------------------------------------
    single_message(prs,
        message="La tecnologia electoral no deberia ser\nuna caja negra de propiedad privada.",
        sub="Licencia AGPL-3.0: cualquier version modificada y desplegada publicamente\ndebe publicar su codigo fuente con la misma licencia.",
        notes=(
            "Esta fue una de las decisiones mas reflexivas del proyecto.\n\n"
            "MIT o Apache: cualquiera puede hacer una version cerrada.\n"
            "Un gobierno o empresa podria modificar el algoritmo sin compartir los cambios.\n\n"
            "AGPL: cualquier version modificada y desplegada publicamente DEBE publicar su codigo.\n"
            "Ningun actor puede hacer opaca la logica de una herramienta electoral.\n\n"
            "Impacto adicional: habilita reutilizacion para otros paises de LatAm\n"
            "sin permitir que los reutilizadores cierren el codigo.\n\n"
            "La AGPL es la implementacion tecnica del argumento democratico del proyecto."
        ))

    # 12 -- EL PRINCIPIO FUNDAMENTAL -----------------------------------------
    big_question(prs,
        question="?Que pasa cuando el asistente de desarrollo\nintenta inferir posturas de candidatos sin fuentes?",
        answer="Se establece el principio que organiza todo el proyecto:\nNUNCA INVENTAR DATOS ELECTORALES.",
        notes=(
            "Este episodio fue uno de los momentos mas importantes del proyecto.\n\n"
            "El asistente intento generar posturas por inferencia ideologica:\n"
            "'Si el candidato X es de derecha, su postura sobre Y es Z.'\n\n"
            "La autora lo identifico de inmediato:\n"
            "Las inferencias pueden ser incorrectas Y sesgadas.\n"
            "Un sistema electoral con datos fabricados desinforma con formato de credibilidad.\n\n"
            "Protocolo implementado como consecuencia:\n"
            "  -- Justificacion textual minima (20 caracteres) obligatoria por postura\n"
            "  -- URL de fuente primaria verificable requerida\n"
            "  -- El sistema RECHAZA automaticamente entradas sin esos campos\n"
            "  -- Posturas con incertidumbre: confianza BAJA, visible al usuario"
        ))

    # -- DESAFIOS -------------------------------------------------------
    section_break(prs, "!", "Los 3 Grandes Desafios",
        "Los problemas que no estaban en el curriculum",
        notes=(
            "Todo proyecto enfrenta desafios que no aparecen en los libros de texto.\n"
            "VotoAfin tuvo tres principales. Narrarlos con honestidad es parte del\n"
            "valor academico del proyecto."
        ))

    # 14 -- TRES DESAFIOS ----------------------------------------------------
    three_cards(prs,
        title="Los 3 desafios principales",
        cards=[
            ("Los Datos",
             "Las posturas de candidatos chilenos\nno estan sistematizadas en ninguna BD.\n\n"
             "Requiere consulta de multiples fuentes\nprimarias por cada postura.\n\n"
             "No automatizable confiablemente.",
             DANGER),
            ("La Neutralidad",
             "Disenar preguntas de politica publica\nrealmente neutras es muy dificil.\n\n"
             "El lenguaje mismo es un campo politico.\n\n"
             "Requiere revision con especialistas\nen metodologia de encuestas.",
             AMBER),
            ("La Sostenibilidad",
             "Las VAAs ciudadanas en Chile\nhan sido discontinuadas.\n(Decide Chile = ejemplo reciente)\n\n"
             "Solucion actual: AGPL-3.0 + CSV.\n"
             "Camino largo: alianzas institucionales.",
             DARK2),
        ],
        notes=(
            "Estos tres desafios no son de ingenieria pura: son de contexto civico.\n\n"
            "DATOS: la curacion de posturas no se puede automatizar sin riesgo de sesgos.\n"
            "Un LLM que 'infiere' posturas a partir de la ideologia del partido seria\n"
            "mas rapido pero completamente inaceptable.\n\n"
            "NEUTRALIDAD: la investigacion politologica muestra que el orden de las opciones,\n"
            "los terminos elegidos y el encuadre de la pregunta afectan las respuestas.\n\n"
            "SOSTENIBILIDAD: la informacion electoral tiene maxima relevancia dos semanas\n"
            "por ano y es cara de mantener el resto del tiempo. Sin modelo estable, las VAAs mueren."
        ))

    # 15 -- VALIDACIONES Y SEGURIDAD -----------------------------------------
    tight_bullets(prs,
        title="Validaciones y seguridad -- lo que se verifico",
        bullets=[
            "17 hallazgos de seguridad identificados: 15 resueltos, 2 documentados",
            "Token en cookie httpOnly (web) + Keychain/EncryptedSharedPrefs (nativo)",
            "370 tests automatizados cubriendo servicios y endpoints",
            "37 documentos tecnicos auditados contra el codigo fuente real",
            "Protocolo de importacion: URL de fuente primaria obligatoria por postura",
        ],
        notes=(
            "La auditoria de seguridad fue parte formal del proceso (Fase 3).\n\n"
            "17 hallazgos identificados:\n"
            "  -- 15 resueltos durante la auditoria\n"
            "  -- 2 aceptados como deuda documentada con razon explicita\n"
            "  -- 0 sin accion ni documentacion\n\n"
            "370 tests automatizados: la suite cubre servicios de negocio y endpoints API.\n"
            "El frontend tiene cobertura minima -- deuda identificada para v0.2.\n\n"
            "37 documentos auditados contra el codigo real:\n"
            "no fue documentacion escrita a priori, sino verificada linea a linea."
        ))

    # 16 -- METRICAS DE EVOLUCION --------------------------------------------
    stat_slide(prs,
        title="El proyecto en numeros -- Sprint 8 inicial vs estado final",
        stats=[
            ("212", "commits en main\n(inicio: 2)", ACCENT),
            ("370", "tests automatizados\n(inicio: 46)", PRILIT),
            ("89", "componentes UI\nreutilizables (inicio: 7)", SEC),
            ("17/17", "hallazgos de\nseguridad resueltos\no documentados", ACCENT),
        ],
        notes=(
            "212 commits no son solo cambios de codigo:\n"
            "son decisiones documentadas y evidencia de proceso de desarrollo con revision continua.\n\n"
            "370 tests: la relacion test/codigo aumento a lo largo del proyecto.\n\n"
            "89 componentes UI: el crecimiento desde 7 refleja la aplicacion de Atomic Design.\n"
            "La UI crece por composicion, no por duplicacion.\n\n"
            "17/17 hallazgos de seguridad: cero sin accion ni documentacion."
        ))

    # 17 -- LECCIONES APRENDIDAS ---------------------------------------------
    two_col_tight(prs,
        title="Lecciones aprendidas -- las que perduran",
        left_title="De producto",
        left_items=[
            "La pregunta correcta determina la solucion",
            "Los datos son el producto; el algoritmo es el envoltorio",
            "La transparencia es un requerimiento funcional, no una feature",
        ],
        right_title="De ingenieria",
        right_items=[
            "Separacion de responsabilidades: tests 30x mas rapidos",
            "Contrato de API: el compilador detecta incompatibilidades",
            "Deuda documentada es manejable; la oculta no lo es",
        ],
        notes=(
            "LECCION 1 (pregunta de diseno): el cambio de 'como hacer atractivo el candidato'\n"
            "a 'como medir la coincidencia programatica' genero una solucion fundamentalmente distinta.\n\n"
            "LECCION 2 (datos > algoritmo): en sistemas electorales, la calidad de los datos\n"
            "no es una opcion. Es una obligacion etica.\n\n"
            "LECCION 3 (separacion de responsabilidades): extraer logica de negocio a servicios puros\n"
            "produjo tests unitarios 30x mas rapidos y elimino duplicacion de codigo.\n\n"
            "LECCION 4 (contrato de API): la generacion automatica de tipos TypeScript desde OpenAPI\n"
            "elimino una categoria completa de errores de integracion.\n\n"
            "LECCION 5 (deuda documentada): declarar que deuda se acepta y por que\n"
            "permite priorizar deliberadamente en lugar de reaccionar ante los problemas."
        ))

    # 18 -- ROADMAP ----------------------------------------------------------
    timeline_slide(prs,
        title="Roadmap -- 4 releases hacia el lanzamiento publico",
        items=[
            ("v0.2", "Datos verificados\nExpansion cuestionario\nChangelog publico", ACCENT),
            ("v0.3", "Explicabilidad\n'Por que este candidato\nrankeo alto o bajo?'", PRIMARY),
            ("v0.4", "Elecciones municipales\nNotificaciones\nOnboarding candidato", DARK2),
            ("v1.0", "Produccion\nPruebas de carga\nInternacionalizacion", AMBER),
        ],
        notes=(
            "v0.2 es la prioridad mas alta:\n"
            "Sin datos verificados completos, el MVP comunica incertidumbre de manera\n"
            "honesta pero no puede garantizar la calidad que una herramienta electoral requiere.\n\n"
            "v0.3 (explicabilidad) es la feature mas demandada academicamente:\n"
            "los investigadores de ciencia politica quieren entender no solo el resultado\n"
            "sino las preguntas que lo determinaron.\n\n"
            "v0.4 (cobertura municipal) ataca directamente el mayor problema identificado:\n"
            "los +460% de votos nulos para alcalde ocurrieron en elecciones municipales\n"
            "y VotoAfin no las cubre todavia.\n\n"
            "v1.0 requiere alianzas institucionales para hosting y escala."
        ))

    # 19 -- POTENCIAL DE EVOLUCION -------------------------------------------
    three_cards(prs,
        title="Potencial de evolucion -- 3 dimensiones",
        cards=[
            ("Investigacion Academica",
             "La plataforma puede usarse para estudiar:\n\n"
             "-- Comportamiento electoral frente a informacion estructurada\n"
             "-- Relacion entre ponderacion y resultado del matching\n"
             "-- Efecto del indicador de confianza",
             PRIMARY),
            ("Modelo para LatAm",
             "AGPL-3.0 + arquitectura modular.\n\n"
             "Un fork para Argentina, Colombia o Mexico:\n"
             "-- Actualizar datos y preguntas\n"
             "-- Infraestructura ya construida\n"
             "-- Sin partir de cero",
             ACCENT),
            ("Alianzas Institucionales",
             "Modelo Vote Compass:\n"
             "VAA + medio de comunicacion\n"
             "= millones de usuarios (CBC, Canada)\n\n"
             "VotoAfin + medio chileno + SERVEL\n= escala masiva posible",
             DARK2),
        ],
        notes=(
            "VotoAfin no termina cuando se entrega la tesis: es una base tecnica\n"
            "que puede evolucionar en multiples direcciones.\n\n"
            "El modelo de Vote Compass es el referente:\n"
            "una VAA con algoritmo estandar alcanzo millones de usuarios\n"
            "gracias a su modelo de distribucion (alianza con CBC Canada).\n\n"
            "VotoAfin tiene mejores especificaciones tecnicas que Vote Compass.\n"
            "Lo que le falta es la alianza de distribucion.\n\n"
            "La apertura del codigo bajo AGPL-3.0 hace posibles las tres dimensiones.\n"
            "Una VAA propietaria no puede ser usada por investigadores\n"
            "ni adaptada por otros paises sin negociacion."
        ))

    # 20 -- REFLEXION FINAL --------------------------------------------------
    quote_slide(prs,
        quote=("La tecnologia electoral no deberia ser propiedad de nadie. "
               "Deberia ser infraestructura publica, auditable, y construida "
               "con los mismos estandares de rigor y transparencia que esperamos "
               "de cualquier otro proceso de interes democratico. "
               "VotoAfin es un paso pequeno pero concreto en esa direccion."),
        author="Jenifer Castillo -- Tesis UTFSM, Agosto 2026",
        notes=(
            "CIERRE de la Presentacion 4 y de la exposicion completa.\n\n"
            "Esta cita es la reflexion final de la tesis.\n\n"
            "Sintetiza el argumento central del proyecto:\n"
            "  -- La tecnologia fue el medio, la democracia fue el fin.\n"
            "  -- El estandar etico para tecnologia electoral es mas alto que para\n"
            "     tecnologia comercial.\n"
            "  -- El proyecto es pequeno en escala pero coherente en valores.\n\n"
            "GUION PARA DEFENSA DE 45-60 MINUTOS:\n"
            "  P1 (Problema):   10-13 min\n"
            "  P2 (Evolucion):  12-15 min\n"
            "  P3 (Solucion):   15-18 min\n"
            "  P4 (Ingenieria): 16-20 min\n"
            "  Preguntas:        7-15 min\n"
            "  Total:           60-81 min"
        ))

    # 21 -- SLIDE FINAL ------------------------------------------------------
    dark_cover(prs,
        title="Un problema real. Una investigacion real. Una solucion construida.",
        subtitle="VotoAfin  --  Chile 2026  --  github.com/whatebria/tinder-decisivo\n"
                 "Codigo abierto bajo AGPL-3.0",
        label="Fin de la exposicion -- Presentacion 4 de 4",
        notes=(
            "Slide de cierre. La URL del repositorio permite acceso al codigo,\n"
            "la documentacion y los datos en cualquier momento.\n\n"
            "Dejar este slide en pantalla durante la sesion de preguntas.\n\n"
            "Preguntas mas probables de la comision:\n"
            "  1. El algoritmo: funcion de penalizacion cuadratica vs lineal\n"
            "  2. Neutralidad de preguntas: como se verifico, quien lo reviso\n"
            "  3. Sostenibilidad: como se financiara el sistema a largo plazo\n\n"
            "Las tres estan documentadas con respuestas desarrolladas en la tesis."
        ))

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("04_Proceso_Ingenieria_y_Conclusiones.pptx")
