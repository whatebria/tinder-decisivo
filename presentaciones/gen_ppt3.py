"""Presentacion 3 -- Solucion, Diseno y Producto."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path: str):
    prs = new_prs()

    # -- Slide 1 -- PORTADA --------------------------------------------------
    dark_cover(
        prs,
        title="VotoAfin",
        subtitle="Una brujula para el votante. Solucion, diseno y producto.",
        label="Presentacion 3 de 4  --  Solucion, Diseno y Producto",
        notes=(
            "APERTURA -- 15 a 20 minutos\n\n"
            "Esta presentacion responde: que es VotoAfin y como funciona?\n\n"
            "Hay tres cosas que la audiencia deberia entender al terminar:\n"
            "  1. Por que una VAA -- y no otra cosa -- es la respuesta correcta al problema.\n"
            "  2. Que decisions de UX se tomaron y por que.\n"
            "  3. Que valor genera concretamente para el usuario.\n\n"
            "Esta presentacion puede usarse de manera independiente frente a audiencias "
            "de producto, UX e innovacion."
        )
    )

    # -- Slide 2 -- QUE ES UNA VAA -------------------------------------------
    light_slide(
        prs,
        title="Que es una Voting Advice Application?",
        accent_line="Una herramienta que mide la coincidencia entre tus posiciones y las de los candidatos.",
        body_lines=[
            "1. Se te presentan preguntas sobre politica publica (economia, medioambiente, etc.)",
            "2. Indicas tu posicion en una escala de 5 puntos (Muy de acuerdo <-> Muy en desacuerdo)",
            "3. Opcionalmente: indicas que temas son mas importantes para ti",
            "4. El sistema compara tus respuestas con las posturas documentadas de cada candidato",
            "5. Obtienes un ranking de afinidad: quien coincide mas con tu forma de pensar",
            "",
            "No es una encuesta. No es un sondeo. No dice por quien votar.",
            "Es una herramienta de orientacion que hace transparente la comparacion.",
        ],
        notes=(
            "La definicion de VAA es simple pero importante establecerla desde el inicio.\n\n"
            "La clave conceptual es la INVERSION DEL FLUJO:\n"
            "  - Las VAAs NO muestran primero a los candidatos para que el usuario elija.\n"
            "  - Muestran primero los TEMAS, capturan las preferencias del usuario, "
            "    y LUEGO producen la comparacion.\n\n"
            "Este orden es deliberado: reduce el peso de los sesgos de identificacion "
            "partidaria y favorece la evaluacion basada en posiciones programaticas.\n\n"
            "Muy importante: el resultado es un INSUMO para la decision, no la decision misma. "
            "VotoAfin no le dice al usuario por quien votar. Le dice con quien coincide mas."
        )
    )

    # -- Slide 3 -- EL PROBLEMA QUE RESUELVE ---------------------------------
    stat_slide(
        prs,
        title="El problema que VotoAfin resuelve en numeros",
        stats=[
            ("79%", "no confia en politicos\ncomo fuente de informacion", DANGER),
            ("42%", "indeciso sobre su voto\npara el cargo mas conocido", AMBER),
            ("21%", "se considera\n'muy informado'", PRI_LIGHT),
            ("5-10", "minutos para completar\nel cuestionario VotoAfin", ACCENT),
        ],
        notes=(
            "Este slide conecta el problema (slides anteriores) con la solucion.\n\n"
            "El 42% indeciso con el cargo de alcalde (el mas visible) contrasta con "
            "los 5-10 minutos necesarios para completar el cuestionario de VotoAfin.\n\n"
            "El valor no es que VotoAfin sea 'facil' -- es que es EFICIENTE:\n"
            "invierte 5 minutos del usuario y produce un resultado accionable.\n\n"
            "La desconfianza en los politicos (79%) hace aun mas relevante una "
            "herramienta que parte de las POSTURAS declaradas, no de la imagen o el "
            "discurso del candidato."
        )
    )

    # -- Slide 4 -- PROPUESTA DE VALOR ---------------------------------------
    section_break(
        prs, "V", "Propuesta de Valor",
        "5 dimensiones que diferencian a VotoAfin",
        notes=(
            "VotoAfin no es solo 'otra app de candidatos'.\n"
            "Tiene cinco dimensiones de diferenciacion respecto a lo que existia en Chile.\n"
            "Ninguna de ellas es 'mas features' -- todas son decisiones de diseno "
            "con una razon especifica."
        )
    )

    # -- Slide 5 -- 5 DIMENSIONES --------------------------------------------
    light_slide(
        prs,
        title="5 dimensiones que diferencian a VotoAfin",
        body_lines=[
            "1. TRANSPARENCIA METODOLOGICA",
            "   El algoritmo es publico, documentado y auditable.",
            "   Cualquier ciudadano puede verificar como se calculan los resultados.",
            "",
            "2. TRAZABILIDAD DE POSTURAS",
            "   Cada postura incluye justificacion textual + URL de fuente primaria.",
            "   El sistema rechaza datos sin fuente verificable.",
            "",
            "3. PONDERACION POR IMPORTANCIA",
            "   El usuario indica que temas le importan mas. El algoritmo ajusta.",
            "   La afinidad electoral no es una magnitud universal.",
            "",
            "4. INDICADOR DE CONFIANZA DEL RESULTADO",
            "   Un match calculado sobre 3 preguntas tiene menos certeza que uno sobre 12.",
            "   VotoAfin lo comunica explicitamente.",
            "",
            "5. CODIGO ABIERTO (AGPL-3.0)",
            "   La tecnologia electoral no deberia ser una caja negra.",
        ],
        notes=(
            "Cada una de estas dimensiones responde a una brecha identificada en el analisis "
            "comparativo de VAAs internacionales y nacionales.\n\n"
            "Dimension 1 (Transparencia): ninguna VAA chilena anterior publicaba su algoritmo.\n"
            "Dimension 2 (Trazabilidad): ninguna requeria fuentes verificables tecnicamente.\n"
            "Dimension 3 (Ponderacion): comun en VAAs internacionales, ausente en Chile.\n"
            "Dimension 4 (Confianza): UNICA entre todas las VAAs analizadas -- ni Wahl-O-Mat "
            "ni Smartvote ni Vote Compass lo implementan.\n"
            "Dimension 5 (Open source): ninguna VAA del grupo internacional tiene "
            "codigo fuente completamente abierto bajo licencia libre.\n\n"
            "VotoAfin es la primera VAA que combina las cinco dimensiones."
        )
    )

    # -- Slide 6 -- PUBLICO OBJETIVO -----------------------------------------
    two_col_slide(
        prs,
        title="A quien ayuda VotoAfin?",
        left_title="El votante objetivo",
        left_lines=[
            "Cualquier ciudadano chileno que:",
            "",
            "  -- Enfrenta una eleccion proxima",
            "  -- Desea informacion estructurada",
            "     sobre posiciones de candidatos",
            "  -- No quiere leer programas",
            "     extensos de campaña",
            "  -- Dispone de 5-15 minutos",
            "  -- Tiene acceso a un dispositivo",
            "     movil o navegador web",
        ],
        right_title="Diseñado especificamente para tres segmentos",
        right_lines=[
            "JOVENES VOTANTES",
            "Alta exposicion digital, menor consumo",
            "de medios verificados. Mayor potencial",
            "de adopcion.",
            "",
            "ADULTOS MAYORES",
            "Dificultad para evaluar confiabilidad.",
            "La interfaz simple reduce la barrera.",
            "",
            "VOTANTES INDECISOS",
            "Buscan en el ultimo momento.",
            "El resultado accionable responde",
            "exactamente esa necesidad.",
        ],
        notes=(
            "El publico objetivo fue definido desde el inicio del proyecto, "
            "no construido retroactivamente.\n\n"
            "Los tres segmentos compartian una necesidad comun: informacion confiable, "
            "estructurada y procesable en tiempo razonable, sin conocimiento politico previo.\n\n"
            "El diseño mobile-first responde directamente al perfil del joven votante "
            "(mayor potencial de adopcion).\n\n"
            "La claridad del resultado y el indicador de confianza responden al perfil "
            "del votante indeciso que busca informacion en el ultimo momento."
        )
    )

    # -- Slide 7 -- USER JOURNEY ---------------------------------------------
    section_break(
        prs, "UX", "El Flujo de Usuario",
        "7 pasos desde el ingreso hasta la decision",
        notes=(
            "Transicion al diseño de experiencia.\n\n"
            "Una VAA puede tener el mejor algoritmo del mundo, pero si el flujo de "
            "usuario es confuso o genera abandono, el impacto es cero.\n\n"
            "El flujo de VotoAfin fue disenado con un principio central: "
            "el camino mas corto posible desde el ingreso hasta el resultado util."
        )
    )

    # -- Slide 8 -- USER JOURNEY DETALLE -------------------------------------
    light_slide(
        prs,
        title="Flujo de 7 pasos: del ingreso al resultado",
        body_lines=[
            "PASO 1  Registro / Inicio de sesion",
            "  Solo nombre de usuario, correo y contrasena. Sin RUT, sin Clave Unica.",
            "",
            "PASO 2  Seleccion del tipo de eleccion",
            "  El usuario indica a que proceso electoral se orienta la recomendacion.",
            "",
            "PASO 3  Cuestionario",
            "  Preguntas sobre politica publica. Escala Likert de 5 puntos + opcion 'No se'.",
            "  Modal de contexto educativo disponible por cada pregunta.",
            "",
            "PASO 4  Ponderacion (opcional)",
            "  El usuario indica que temas le importan mas. 4 niveles de peso.",
            "",
            "PASO 5  Resultados",
            "  Ranking de candidatos con % de coincidencia + indicador de confianza.",
            "",
            "PASO 6  Detalle del candidato",
            "  Perfil completo: postura por pregunta + justificacion + fuente + radar.",
            "",
            "PASO 7  Guardado y comparacion",
            "  Favoritos, descartados, comparacion entre candidatos.",
        ],
        notes=(
            "El flujo de 7 pasos fue diseñado minimizando los puntos de abandono.\n\n"
            "Decisiones clave de UX:\n"
            "  - Sin RUT ni Clave Unica: reduce la friccion de onboarding drasticamente.\n"
            "    (vs la hipotesis de Emprendimiento II que requeria Clave Unica).\n\n"
            "  - La ponderacion es OPCIONAL: el usuario puede completar el cuestionario "
            "    sin ponderar y obtener un resultado igualmente util.\n\n"
            "  - El resultado se muestra ANTES de explorar candidatos: invierte el "
            "    flujo tradicional. Primero la coincidencia; luego los perfiles.\n\n"
            "  - El modal de contexto educativo por pregunta permite a usuarios sin "
            "    conocimiento politico tomar posicion informada."
        )
    )

    # -- Slide 9 -- EL CUESTIONARIO ------------------------------------------
    dark_text_slide(
        prs,
        title="El cuestionario: el corazon del sistema",
        highlight="12 preguntas. 7 ejes. 5 + 1 opciones de respuesta.",
        body=(
            "Los 7 ejes tematicos:\n"
            "  Economia  --  Sociedad  --  Ambiente  --  Seguridad\n"
            "  Derechos Humanos  --  Internacional  --  Institucional\n\n"
            "La escala de respuesta:\n"
            "  Muy de acuerdo / De acuerdo / Neutral / En desacuerdo / Muy en desacuerdo\n"
            "  + 'No se' (excluye la pregunta del calculo, no asigna posicion neutral)\n\n"
            "Por cada pregunta: modal de contexto educativo con 5 dimensiones de analisis\n"
            "(economica, social, cultural, ambiental, institucional) -- lenguaje neutral.\n\n"
            "Tiempo estimado de completitud: 5 a 10 minutos."
        ),
        notes=(
            "El cuestionario de 12 preguntas es un balance deliberado entre:\n"
            "  - Calidad del resultado (mas preguntas = resultado mas preciso)\n"
            "  - Tasa de completitud (mas preguntas = mas abandono)\n\n"
            "La literatura politologica sobre VAAs identifica este balance como uno "
            "de los principales desafios de diseno. 12 es conservador pero suficiente.\n\n"
            "La opcion 'No se' es mas que una comodidad:\n"
            "  - La respuesta NEUTRAL implica que el usuario tiene una posicion intermedia.\n"
            "  - La respuesta 'No se' implica falta de informacion suficiente.\n"
            "  - Tratar ambas como equivalentes introduciria ruido en el calculo.\n\n"
            "El modal de contexto educativo permite que un usuario sin conocimiento "
            "politico pueda tomar posicion informada en cada pregunta."
        )
    )

    # -- Slide 10 -- EL ALGORITMO --------------------------------------------
    light_slide(
        prs,
        title="El algoritmo de matching: 4 componentes",
        body_lines=[
            "1. COMPARACION POSICION A POSICION",
            "   Para cada pregunta respondida por el usuario y con postura del candidato:",
            "   Distancia entre posicion del usuario y postura del candidato.",
            "   Normalizada: 0 (maxima discrepancia) a 1 (coincidencia exacta).",
            "",
            "2. APLICACION DEL PESO",
            "   El resultado se multiplica por el peso asignado por el usuario al tema.",
            "   4 niveles de importancia, con multiplicadores diferenciados.",
            "",
            "3. COBERTURA Y CONFIANZA",
            "   Cuantas preguntas participaron en el calculo?",
            "   Umbral de cobertura determina nivel de confianza del resultado.",
            "",
            "4. DESGLOSE POR EJE",
            "   Ademas del porcentaje global, el algoritmo calcula % por cada eje.",
            "   Produce el vector que alimenta el grafico de radar.",
        ],
        notes=(
            "El algoritmo priorizo la EXPLICABILIDAD sobre la sofisticacion matematica.\n\n"
            "Cualquier ciudadano con comprension basica de proporciones puede entender "
            "como se calcula el resultado. Esto es un requerimiento funcional para la "
            "credibilidad en un contexto electoral.\n\n"
            "La funcion cuadratica de penalizacion (elevar al cuadrado la diferencia "
            "normalizada) penaliza los desacuerdos extremos con mayor severidad, "
            "reflejando la intuicion politica de que la distancia entre posiciones no "
            "es linealmente proporcional a su diferencia numerica.\n\n"
            "El indicador de confianza (Componente 3) es la diferenciacion algorítmica "
            "mas significativa respecto a VAAs internacionales."
        )
    )

    # -- Slide 11 -- LOS RESULTADOS ------------------------------------------
    dark_text_slide(
        prs,
        title="La pantalla de resultados: que ve el usuario",
        highlight="Un ranking. Un radar. Un indicador de confianza.",
        body=(
            "RANKING DE CANDIDATOS\n"
            "  Ordenados por % de coincidencia global.\n"
            "  Indicador visual: ALTA / MEDIA / BAJA confianza del resultado.\n\n"
            "DETALLE DEL CANDIDATO\n"
            "  Radar de 7 ejes: coincidencia visual por dimension tematica.\n"
            "  Postura en cada pregunta + justificacion + URL de fuente primaria.\n"
            "  Nivel de confianza de cada postura (ALTA/MEDIA/BAJA).\n\n"
            "ACCIONES DISPONIBLES\n"
            "  Guardar candidato como favorito.\n"
            "  Descartar candidato del ranking.\n"
            "  Comparar candidatos entre si."
        ),
        notes=(
            "El resultado no es un numero: es un sistema de informacion.\n\n"
            "El radar de 7 ejes permite al usuario ver no solo 'con quien coincide mas' "
            "sino 'en que temas coincide mas'. Esto es especialmente util para el votante "
            "que tiene prioridades especificas (p.ej. coincide en economia pero difiere "
            "en derechos humanos).\n\n"
            "El indicador de confianza en las posturas es la implementacion directa del "
            "principio de honestidad: si una postura fue verificada con certeza limitada, "
            "el sistema lo dice. No simula certeza que no existe.\n\n"
            "Este nivel de transparencia protege la credibilidad del sistema a largo plazo."
        )
    )

    # -- Slide 12 -- IDENTIDAD VISUAL ----------------------------------------
    section_break(
        prs, "DS", "Sistema Visual",
        "La identidad que comunica confianza sin tomar partido",
        notes=(
            "Transicion al sistema visual.\n\n"
            "El diseño no es decoracion: es parte del mensaje.\n\n"
            "VotoAfin necesitaba transmitir credibilidad institucional y neutralidad politica "
            "simultaneamente. Esa combinacion requirio decisiones especificas de color, "
            "tipografia y componentes."
        )
    )

    # -- Slide 13 -- PALETA DE COLORES ---------------------------------------
    light_slide(
        prs,
        title="Sistema de color — 6 capas con ownership exclusivo",
        body_lines=[
            "CAPA A -- MARCA",
            "  #1C3A52 brand-hero  --  #2E5F7E primary  --  #4A9BBF primary-light",
            "  #7BA098 secondary   --  #3A9E7A accent",
            "",
            "CAPA B -- SEMANTICA",
            "  success / warning / danger / info  (badges, toasts, feedback)",
            "",
            "CAPA C -- SUPERFICIE",
            "  #F7F8F7 bg claro -- fondos, cards, inputs",
            "",
            "CAPA D -- DATOS  (radar, ranking bars, comparador)",
            "CAPA E -- EJES  (cada eje tematico tiene color invariante)",
            "CAPA F -- PREMIUM  (indicadores de funcionalidades premium)",
            "",
            "Principio: ningun color del sistema evoca un partido politico chileno.",
            "Azul-petroleo (vs azul-RN). Verde-salvia (vs verde-FA).",
        ],
        notes=(
            "El sistema de color fue diseñado con una restriccion critica: "
            "ningun color puede asociarse con ningun partido politico chileno.\n\n"
            "Esta restriccion determino la paleta entera:\n"
            "  - El azul-petroleo (#1C3A52) fue elegido por ser suficientemente distinto "
            "    del azul de RN y Chile Vamos.\n"
            "  - El verde-salvia (#7BA098) es diferente del verde del Frente Amplio.\n"
            "  - El verde acento (#3A9E7A) tampoco es el verde del FA.\n\n"
            "6 capas independientes: un cambio de branding no rompe los ejes "
            "ni la visualizacion de datos. Esto es diseno sistematico, no decoracion.\n\n"
            "Todos los pares de colores cumplen contraste WCAG 2.2 AA (4.5:1 minimo)."
        )
    )

    # -- Slide 14 -- FILOSOFIA VISUAL ----------------------------------------
    dark_text_slide(
        prs,
        title="La filosofia del sistema visual",
        highlight="Seriedad institucional sin frialdad. Modernidad sin superficialidad.",
        body=(
            "6 objetivos del sistema:\n\n"
            "  C -- Credibilidad      Paleta desaturada, tipografia solida, sin gimmicks.\n"
            "  N -- Neutralidad       Ningun color evoca un partido politico.\n"
            "  Cl -- Claridad         Un dato, un color, un rol. Sin ambiguedad semantica.\n"
            "  Co -- Confianza        WCAG AA minimo, dark mode correcto, contraste real.\n"
            "  M -- Modernidad        Hero oscuro, accent energetico, tipografia bold.\n"
            "  E -- Escalabilidad     6 capas independientes. Rebrandable sin romper datos.\n\n"
            "Debe sentirse como:\n"
            "  Una guia.  Una brujula.  Una herramienta de orientacion.\n"
            "NO como:\n"
            "  Un partido politico.  Una campana electoral.  Una institucion gubernamental."
        ),
        notes=(
            "Este slide sintetiza la filosofia del Design System de VotoAfin.\n\n"
            "El sistema fue documentado en 11 modulos (ds-01 a ds-11), cubriendo:\n"
            "  - Filosofia y principios\n"
            "  - Psicologia del usuario\n"
            "  - Benchmarking visual\n"
            "  - Sistema de color completo\n"
            "  - Dark mode\n"
            "  - Ejes tematicos\n"
            "  - Visualizacion de datos\n"
            "  - Tiers de afinidad\n"
            "  - Component library\n"
            "  - Design tokens\n"
            "  - Validacion por pantalla\n\n"
            "Esta profundidad de documentacion es lo que permite mantener consistencia "
            "visual a lo largo de 17 pantallas y 89 componentes reutilizables."
        )
    )

    # -- Slide 15 -- DECISIONES UX -------------------------------------------
    two_col_slide(
        prs,
        title="Decisiones de UX: la claridad primero",
        left_title="Principio 1: Claridad sobre atractivo",
        left_lines=[
            "En cada decision donde competian",
            "la claridad del mensaje y el",
            "atractivo visual, se priorizo",
            "la claridad.",
            "",
            "El usuario necesita entender lo",
            "que el sistema le muestra antes",
            "de apreciar como lo muestra.",
            "",
            "No es una presentacion de",
            "entretenimiento. Es una",
            "herramienta civica.",
        ],
        right_title="Principio 2: Resultado accionable",
        right_lines=[
            "El resultado debe ser interpretable",
            "sin formacion estadistica o politica.",
            "",
            "El % de coincidencia, el radar",
            "por ejes y el indicador de",
            "confianza deben ser leidos por",
            "cualquier ciudadano.",
            "",
            "Si el resultado requiere",
            "explicacion para ser comprendido,",
            "entonces el diseño fallo.",
        ],
        notes=(
            "Estos dos principios guiaron todas las decisiones de UX del sistema.\n\n"
            "Principio 1 explica por que no hay animaciones excesivas, iconos ambiguos "
            "ni jerarquias visuales complicadas.\n\n"
            "Principio 2 explica la decision de usar el radar de 7 ejes como "
            "visualizacion principal: es visualmente intuitivo y no requiere "
            "que el usuario sepa leer estadisticas.\n\n"
            "Un tercer principio que guio el diseno fue el FLUJO MINIMO VIABLE:\n"
            "el camino desde el ingreso hasta el resultado debe ser lo mas corto posible. "
            "Cada pantalla adicional es una oportunidad de abandono."
        )
    )

    # -- Slide 16 -- COMPARACION CON VAAS ------------------------------------
    light_slide(
        prs,
        title="VotoAfin en el ecosistema de VAAs internacionales",
        body_lines=[
            "VAA               | Escala  | Peso   | Fuentes       | Radar  | Open Source",
            "---               | ---     | ---    | ---           | ---    | ---",
            "StemWijzer (NL)   | 3 pts   | 2 nvl  | Parcial       | No     | No",
            "Wahl-O-Mat (DE)   | 3 pts   | doble  | Si (justif.)  | No     | No",
            "Smartvote (CH)    | 4 pts   | 0-2    | Parcial       | Si     | Parcial",
            "Vote Compass (CA) | 5 pts   | Si     | Limitado      | No     | No",
            "iSideWith (Global)| Multiple| Si     | Limitado      | No     | No",
            "Voto Informado(CL)| Sin alg.| No     | Parcial       | No     | No",
            "Decide Chile (CL) | 5 pts   | Si     | Limitado      | No     | No",
            "VotoAfin (CL)     | 5+No se | 4 nvl  | URL obligat.  | 7 ejes | AGPL-3.0",
        ],
        notes=(
            "VotoAfin es la unica VAA del grupo analizado que combina los 5 elementos:\n"
            "  - Escala de 5 puntos con opcion 'No se'\n"
            "  - Ponderacion en 4 niveles\n"
            "  - Fuentes primarias con URL como requerimiento tecnico obligatorio\n"
            "  - Radar de 7 ejes\n"
            "  - Codigo abierto bajo AGPL-3.0\n\n"
            "Ademas, es la UNICA que incorpora indicador de confianza del resultado "
            "-- una caracteristica no implementada en ninguna VAA del grupo analizado.\n\n"
            "Esto no significa que VotoAfin es mejor que Wahl-O-Mat o Smartvote "
            "en terminos de escala de uso: esas tienen millones de usuarios. "
            "Pero en terminos de especificaciones de diseno, cubre brechas que "
            "las mas consolidadas no tienen."
        )
    )

    # -- Slide 17 -- VALOR PARA EL USUARIO -----------------------------------
    dark_text_slide(
        prs,
        title="Que gana el usuario con VotoAfin?",
        highlight="5-10 minutos. Un resultado accionable. Informacion verificada.",
        body=(
            "ANTES de VotoAfin, el votante chileno que queria informarse tenia que:\n"
            "  -- Leer programas de campaña de cada candidato (extensos, tecnicos)\n"
            "  -- Buscar en multiples fuentes comparativas (inexistentes o desactualizadas)\n"
            "  -- Confiar en la palabra del candidato sin verificacion posible\n"
            "  -- Navegar redes sociales (81% de exposicion a desinformacion semanal)\n\n"
            "DESPUES de VotoAfin, el mismo votante puede:\n"
            "  -- Responder 12 preguntas en 5-10 minutos\n"
            "  -- Obtener un ranking de coincidencia con fuentes verificables\n"
            "  -- Explorar el perfil detallado del candidato con sus posturas y fuentes\n"
            "  -- Tomar una decision mas informada sin ser un experto en politica"
        ),
        notes=(
            "Este slide hace concreto el valor de VotoAfin para el usuario final.\n\n"
            "El contraste antes/despues es poderoso porque conecta directamente con "
            "los datos del problema que se presentaron en la Presentacion 1.\n\n"
            "81% de exposicion a desinformacion semanal -> ahora tienen una fuente "
            "con verificacion tecnica obligatoria de fuentes primarias.\n\n"
            "21% muy informados -> la herramienta no garantiza llegar al 100%, "
            "pero si puede aumentar la calidad de informacion de quienes la usen.\n\n"
            "El tiempo (5-10 minutos) es un argumento contra el desinteres: "
            "no es necesario leer decenas de paginas. Es una inversion razonable."
        )
    )

    # -- Slide 18 -- CIERRE --------------------------------------------------
    dark_cover(
        prs,
        title="Una brujula, no una agenda.",
        subtitle=(
            "Continuacion -> Presentacion 4: Ingenieria, Arquitectura y Resultados\n"
            "Como se construyo. Que aprendimos. Que sigue."
        ),
        label="Cierre -- Presentacion 3 de 4",
        notes=(
            "CIERRE de la Presentacion 3.\n\n"
            "Tiempo estimado: 15-18 minutos.\n\n"
            "La frase 'Una brujula, no una agenda' sintetiza el posicionamiento del producto:\n"
            "  - VotoAfin orienta. No prescribe.\n"
            "  - VotoAfin compara. No recomienda.\n"
            "  - VotoAfin informa. No decide.\n\n"
            "El usuario conserva completamente la autonomia de su decision.\n"
            "VotoAfin solo hace esa decision mas informada.\n\n"
            "Mensajes de salida clave:\n"
            "  - La VAA es la respuesta correcta al problema identificado.\n"
            "  - Las 5 dimensiones de valor diferencian a VotoAfin.\n"
            "  - El diseño priorizo claridad y resultado accionable.\n"
            "  - El sistema existe. Funciona. Y puede escalar."
        )
    )

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("03_Solucion_Diseno_y_Producto.pptx")
