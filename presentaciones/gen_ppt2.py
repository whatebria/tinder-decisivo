"""Presentacion 2 -- Evolucion de la Idea."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path: str):
    prs = new_prs()

    # -- Slide 1 -- PORTADA --------------------------------------------------
    dark_cover(
        prs,
        title="De la Observacion al Sistema",
        subtitle="Como una idea evoluciono desde Emprendimiento hasta una VAA funcional",
        label="Presentacion 2 de 4  --  Evolucion de la Idea",
        notes=(
            "APERTURA -- 10 a 15 minutos\n\n"
            "Esta presentacion cuenta la historia de como evolucionaron las HIPOTESIS.\n"
            "No es una historia lineal de exito: es una historia de iteracion real.\n\n"
            "Hipotesis 1: gamificacion civica resuelve el desinteres.\n"
            "Hipotesis 2: el swipe elimina la friccion de explorar candidatos.\n"
            "Hipotesis 3 (correcta): medir coincidencia programatica reduce la carga cognitiva.\n\n"
            "Cada hipotesis fue razonable en su momento. Cada una tenia un problema.\n"
            "El aprendizaje real viene de identificar esos problemas."
        )
    )

    # -- Slide 2 -- TIMELINE -------------------------------------------------
    light_slide(
        prs,
        title="El recorrido completo — 4 etapas, 2 cursos, 1 sistema",
        accent_line="Desde la observacion del problema hasta el MVP funcional",
        body_lines=[
            "ETAPA I — 2024  |  Emprendimiento I",
            "  Investigacion del problema. 12 entrevistas en Valparaiso.",
            "  Hipotesis: la desinformacion es un problema abordable.",
            "",
            "ETAPA II — 2024  |  Emprendimiento II",
            "  Primera propuesta de solucion: gamificacion civica.",
            "  Prototipo en Visily AI. Propuesta a inversionistas.",
            "",
            "ETAPA III — 2024/2025  |  Desarrollo de Aplicaciones Moviles",
            "  'Tinder Electoral'. Swipe + candidatos ficticios.",
            "  Descubrimiento: la metafora tiene limitaciones estructurales.",
            "",
            "ETAPA IV — 2025/2026  |  Proyecto de Tesis",
            "  Reformulacion hacia VAA. Construccion del sistema real.",
            "  VotoAfin: cuestionario + matching + algoritmo verificable.",
        ],
        notes=(
            "Este slide es el mapa de la historia completa.\n\n"
            "Es importante que la audiencia entienda que no hubo un 'error' que corregir: "
            "hubo una evolucion natural de hipotesis, cada una construida sobre los "
            "aprendizajes de la anterior.\n\n"
            "La Etapa III (Tinder Electoral) no fue un fracaso — fue el experimento que "
            "revelo la pregunta correcta.\n\n"
            "Este recorrido de 4 etapas a lo largo de 2 cursos universitarios es "
            "exact tipo de proceso de investigacion iterativa que distingue "
            "la ingenieria de producto de la simple construccion de software."
        )
    )

    # -- Slide 3 -- ETAPA I: EMPRENDIMIENTO I --------------------------------
    section_break(
        prs, "I", "Emprendimiento I",
        "El punto de partida: investigar el problema",
        notes=(
            "Transicion a la Etapa I.\n\n"
            "El proyecto no comenzo con la decision de construir una app. "
            "Comenzo con la decision de entender un problema.\n\n"
            "Este orden es importante para la audiencia: la investigacion precedio "
            "a la solucion, no al reves."
        )
    )

    # -- Slide 4 -- INVESTIGACION EMPRENDIMIENTO I ---------------------------
    two_col_slide(
        prs,
        title="Emprendimiento I — El problema como punto de partida",
        left_title="La pregunta de investigacion",
        left_lines=[
            "Como influye la desinformacion",
            "en el comportamiento electoral",
            "de los chilenos?",
            "",
            "Objetivo declarado:",
            "Mejorar la calidad de la",
            "informacion disponible",
            "para los votantes.",
        ],
        right_title="5 circunstancias estructurales identificadas",
        right_lines=[
            "1. Aumento de fuentes no reguladas",
            "2. Desconfianza en medios tradicionales",
            "3. Complejida informacion electoral",
            "4. Polarizacion politica creciente",
            "5. Ausencia de educacion civica sistematica",
        ],
        notes=(
            "El equipo de Emprendimiento I identifico cinco circunstancias estructurales "
            "en las que opera la desinformacion electoral.\n\n"
            "Esta segmentacion del problema es importante: no es solo 'hay mucha fake news', "
            "sino que hay un ecosistema de condiciones que la facilitan y amplifican.\n\n"
            "El resultado de esta etapa fue una oportunidad de diseno articulada, "
            "no una solucion. El siguiente paso seria disenar la respuesta."
        )
    )

    # -- Slide 5 -- HALLAZGOS CLAVE DE CAMPO ---------------------------------
    stat_slide(
        prs,
        title="Los hallazgos que guiaron el proyecto",
        stats=[
            ("100%", "entrevistados con\nfake news electorales", DANGER),
            ("100%", "creen que existe\ndesinformacion en Chile", ACCENT),
            ("50%", "no conocia a\nlos candidatos", AMBER),
            ("21%", "nivel nacional de\nvotantes 'muy informados'", PRI_LIGHT),
        ],
        notes=(
            "El hallazgo mas contundente del trabajo de campo: el 100% de los entrevistados "
            "habia tenido contacto con fake news electorales.\n\n"
            "Esto fue consistente con el dato nacional: 81% del electorado expuesto a "
            "desinformacion semanal (Activa Knowledge for Action).\n\n"
            "Solo el 21% se sentia 'muy informado' -- este numero se convirtio en la "
            "metrica central del problema que VotoAfin buscaria mover.\n\n"
            "Conclusion de Etapa I: existe una brecha concreta entre la informacion "
            "disponible y la informacion procesada por el votante promedio."
        )
    )

    # -- Slide 6 -- ETAPA II: EMPRENDIMIENTO II ------------------------------
    section_break(
        prs, "II", "Emprendimiento II",
        "La primera hipotesis: gamificacion civica",
        notes=(
            "Transicion a la Etapa II.\n\n"
            "Con el problema caracterizado, el equipo se pregunto: "
            "como disenar una solucion que supere la barrera del desinteres?\n\n"
            "La respuesta inicial fue: gamificacion. Hacer informarse divertido."
        )
    )

    # -- Slide 7 -- PROPUESTA GAMIFICACION -----------------------------------
    light_slide(
        prs,
        title="Hipotesis 1 — Gamificacion civica",
        accent_line="Si hacemos que informarse sea divertido y recompensado, el ciudadano lo hara.",
        body_lines=[
            "La propuesta incluia:",
            "  -- Autenticacion con RUT + Clave Unica",
            "     (reducir friccion, crear vinculo simbolico con la institucionalidad)",
            "  -- Directorio de partidos politicos",
            "     (punto de entrada al conocimiento de la oferta electoral)",
            "  -- Preguntas tipo quiz sobre candidatos y elecciones",
            "     (aprendizaje interactivo)",
            "  -- Sistema de puntos y recompensas tangibles",
            "     (motivacion extrinseca para la participacion)",
            "",
            "Prototipo construido en Visily AI.",
            "Propuesta a inversionistas: $120 millones CLP.",
        ],
        notes=(
            "Esta propuesta era coherente con la hipotesis: si el problema es el "
            "desinteres, una solucion gamificada que haga el proceso entretenido "
            "deberia funcionar.\n\n"
            "La propuesta tenia valor: identifico que la barrera principal no era "
            "la falta de informacion, sino la disposicion a procesarla.\n\n"
            "El modelo de negocio incluia patrocinios, publicidad in-app, licencias "
            "a gobiernos y datos agregados anonimizados.\n\n"
            "Pero habia tres limitaciones estructurales que el equipo identifico "
            "posteriormente..."
        )
    )

    # -- Slide 8 -- LIMITACIONES HIPOTESIS 1 ---------------------------------
    two_col_slide(
        prs,
        title="Por que la hipotesis de gamificacion no era suficiente",
        left_title="Lo que funcionaba bien",
        left_lines=[
            "+ Identifico correctamente la barrera",
            "  del desinteres como problema real",
            "",
            "+ Propuso un modelo de distribucion",
            "  escalable a otras regiones",
            "",
            "+ Vinculo con Clave Unica era",
            "  una idea de friccion reducida",
            "",
            "+ Puso el foco en la experiencia",
            "  del usuario, no en el contenido",
        ],
        right_title="Lo que faltaba resolver",
        right_lines=[
            "-- Clave Unica requeria integracion",
            "   con infraestructura del Estado",
            "",
            "-- La gamificacion desplazaba el",
            "   problema central: calidad de datos",
            "",
            "-- No habia mecanismo de matching:",
            "   informar != orientar la decision",
            "",
            "-- Sin fuentes verificadas, la app",
            "   reproducia desinformacion con",
            "   formato de credibilidad",
        ],
        notes=(
            "Esta evaluacion fue honesta y critica.\n\n"
            "La hipotesis de gamificacion identifico correctamente una causa "
            "(desinteres), pero su solucion no atacaba directamente el problema central "
            "(deficit de informacion de calidad sobre candidatos).\n\n"
            "El punto mas importante: sin mecanismo de matching, la app informaba "
            "pero no orientaba. Y orientar la decision con minima carga cognitiva "
            "era exactamente lo que el votante promedio necesitaba.\n\n"
            "Esta limitacion llevo a la siguiente etapa experimental."
        )
    )

    # -- Slide 9 -- ETAPA III: TINDER ELECTORAL ------------------------------
    section_break(
        prs, "III", "El Prototipo de Swipe",
        "El experimento del 'Tinder Electoral'",
        notes=(
            "Transicion a la Etapa III.\n\n"
            "La siguiente hipotesis nacio de una observacion diferente: "
            "el problema no era solo el desinteres, sino la friccion cognitiva "
            "de explorar candidatos.\n\n"
            "La pregunta fue: podemos hacer ese proceso casi instantaneo?"
        )
    )

    # -- Slide 10 -- EL TINDER ELECTORAL -------------------------------------
    light_slide(
        prs,
        title="Hipotesis 2 — El swipe elimina la friccion",
        accent_line="Si el usuario puede evaluar candidatos con un gesto, la carga cognitiva cae al minimo.",
        body_lines=[
            "La mecanica:",
            "  -- Tarjeta visual del candidato: foto, nombre, partido, propuestas clave",
            "  -- Swipe derecha = me interesa",
            "  -- Swipe izquierda = no me interesa",
            "  -- Construccion progresiva de preferencias",
            "",
            "La inspiracion:",
            "  -- Mecanica de Tinder: conocida por millones de usuarios",
            "  -- Zero learning curve: el usuario ya sabe como funciona",
            "  -- Evaluacion rapida, inmediata, sin friccion",
            "",
            "Estado del prototipo: candidatos ficticios, posiciones simplificadas.",
        ],
        notes=(
            "Esta hipotesis era tecnicamente solida: reducir la friccion de interaccion "
            "es un objetivo de diseno valido.\n\n"
            "La inspiracion en Tinder tenia sentido: la mecanica es conocida, "
            "intuitiva y sin curva de aprendizaje.\n\n"
            "El prototipo se construyo en el ramo de Desarrollo de Aplicaciones Moviles.\n\n"
            "Pero tenia una contradiccion estructural que se hizo evidente durante "
            "el desarrollo..."
        )
    )

    # -- Slide 11 -- EL PROBLEMA DEL SWIPE -----------------------------------
    dark_text_slide(
        prs,
        title="La contradiccion estructural del swipe",
        highlight="El swipe es binario. La politica publica no lo es.",
        body=(
            "La posicion de un votante sobre una politica publica rara vez es binaria.\n\n"
            "Aborto: estoy de acuerdo / estoy en desacuerdo?\n"
            "Salario minimo: subirlo o no subirlo?\n\n"
            "Estas preguntas no tienen respuestas binarias. Tienen matices:\n"
            "  Muy de acuerdo   De acuerdo   Neutral   En desacuerdo   Muy en desacuerdo\n\n"
            "La escala Likert de 5 puntos captura esa gradacion.\n"
            "El swipe binario pierde la mitad de la informacion relevante para el matching.\n\n"
            "Sin esa informacion, el porcentaje de afinidad no refleja las preferencias reales."
        ),
        notes=(
            "Este es el momento bisagra de la historia.\n\n"
            "La limitacion del swipe no era de interfaz — era algorítmlca.\n\n"
            "Si las respuestas son binarias, el unico calculo de matching posible es "
            "contar coincidencias. Ese calculo no captura:\n"
            "  - La intensidad del acuerdo/desacuerdo\n"
            "  - La importancia relativa que el votante asigna a cada tema\n"
            "  - La diferencia entre un desacuerdo leve y uno absoluto\n\n"
            "Para capturar esas dimensiones se necesita una escala ordinal de al menos "
            "5 puntos y un mecanismo de ponderacion por importancia. "
            "Ningun componente de eso es compatible con una interfaz de swipe binario.\n\n"
            "El swipe no solo limitaba la interfaz: limitaba el algoritmo."
        )
    )

    # -- Slide 12 -- EL PROBLEMA DE LOS DATOS --------------------------------
    dark_text_slide(
        prs,
        title="El segundo problema: los datos fabricados",
        highlight="Candidatos ficticios con posturas inventadas.",
        body=(
            "Las posturas asignadas a los candidatos de prueba fueron generadas\n"
            "por inferencia ideologica estereopitica:\n"
            "  'Si el candidato X es de derecha, su postura sobre el aborto es Y.'\n\n"
            "No habia verificacion. No habia fuentes. No habia trazabilidad.\n\n"
            "Esto es inaceptable para un sistema electoral.\n"
            "Un sistema que genera recomendaciones basadas en datos fabricados\n"
            "no asesora al votante: lo DESINFORMA de una manera mas sofisticada.\n\n"
            "La presentacion algoritmica genera una ilusion de rigor\n"
            "que el contenido no respalda."
        ),
        notes=(
            "Este episodio fue uno de los momentos mas importantes del proyecto.\n\n"
            "El asistente de desarrollo intento inferir posturas de candidatos a partir "
            "de estereotipos ideologicos. La autora del proyecto lo identifico de inmediato.\n\n"
            "La decision resultante fue estructurante para todo el proyecto:\n"
            "nunca inventar datos electorales.\n\n"
            "Cada postura en el sistema debe incluir:\n"
            "  - Justificacion textual minima verificable\n"
            "  - URL de fuente primaria (declaracion publica, votacion parlamentaria, programa oficial)\n"
            "El sistema rechaza automaticamente entradas sin esos campos.\n\n"
            "Este principio -- la integridad de los datos sobre el atractivo del resultado -- "
            "es lo que distingue una VAA de un juego electoral."
        )
    )

    # -- Slide 13 -- EL MOMENTO BISAGRA --------------------------------------
    section_break(
        prs, "IV", "El Cambio de Paradigma",
        "Cuando la pregunta correcta genera la solucion correcta",
        notes=(
            "Transicion al momento central de la historia.\n\n"
            "Las limitaciones del Tinder Electoral no eran problemas a parchear.\n"
            "Eran senales de que la pregunta de diseno era incorrecta desde el inicio.\n\n"
            "Cambiar la pregunta fue el movimiento mas importante del proyecto."
        )
    )

    # -- Slide 14 -- LA NUEVA PREGUNTA ---------------------------------------
    dark_text_slide(
        prs,
        title="La pregunta que lo cambio todo",
        highlight="La pregunta correcta genera la solucion correcta.",
        body=(
            "PREGUNTA ANTERIOR:\n"
            "  Como hacer mas entretenido el proceso de conocer candidatos?\n\n"
            "NUEVA PREGUNTA:\n"
            "  Como medir la coincidencia entre las posturas declaradas del votante\n"
            "  y las posiciones documentadas del candidato,\n"
            "  con la menor carga cognitiva posible\n"
            "  y la mayor precision que los datos permitan?\n\n"
            "Este desplazamiento de pregunta produjo un desplazamiento de paradigma:\n"
            "De una app de EXPLORACION DE CANDIDATOS\n"
            "a una VOTING ADVICE APPLICATION (VAA)."
        ),
        notes=(
            "Este es el punto de inflexion de la historia. La audiencia debe "
            "percibirlo como tal.\n\n"
            "El cambio no fue solo de funcionalidad: fue epistemologico.\n\n"
            "La pregunta anterior asumia que el problema era la PRESENTACION del candidato.\n"
            "La nueva pregunta asumia que el problema era la MEDICION DE AFINIDAD entre "
            "las preferencias del votante y las posiciones del candidato.\n\n"
            "Esa diferencia lo cambio todo: el algoritmo, el flujo de usuario, "
            "el modelo de datos, la escala de respuesta, el indicador de confianza.\n\n"
            "La inversion en precisar la pregunta correcta antes de construir "
            "es la decision con mayor retorno del proceso."
        )
    )

    # -- Slide 15 -- QUE ES UNA VAA ------------------------------------------
    two_col_slide(
        prs,
        title="De la intuicion al referente: las VAAs como modelo",
        left_title="Que es una Voting Advice Application?",
        left_lines=[
            "Una herramienta digital que:",
            "",
            "1. Presenta preguntas sobre temas",
            "   de politica publica",
            "",
            "2. Captura las preferencias del",
            "   usuario (escala Likert 5 puntos)",
            "",
            "3. Compara con las posturas",
            "   documentadas de los candidatos",
            "",
            "4. Produce un ranking de afinidad",
            "   expresado en porcentaje",
        ],
        right_title="30+ anos de desarrollo y validacion academica",
        right_lines=[
            "StemWijzer (NL, 1989)     -- primer VAA del mundo",
            "Wahl-O-Mat (DE, 2002)     -- referencia europea",
            "Smartvote (CH, 2003)      -- mas sofisticado",
            "Vote Compass (CA, 2011)   -- modelo de distribucion masiva",
            "iSideWith (Global, 2012)  -- mayor alcance geografico",
            "",
            "Decadas de investigacion academica",
            "convergieron en principios de diseno",
            "razonablemente bien establecidos.",
        ],
        notes=(
            "El modelo VAA no fue inventado para VotoAfin. Tiene 30 anos de historia "
            "y literatura academica propia.\n\n"
            "La investigacion del estado del arte en VAAs internacionales fue parte "
            "formal de la Fase 0 del proyecto -- identificar que ya funcionaba.\n\n"
            "Los principios clave que emergieron de ese analisis:\n"
            "  - Escala Likert de 5 puntos (no binaria, no mas larga por fatiga)\n"
            "  - Ponderacion por importancia declarada\n"
            "  - Exclusion de 'no se' del calculo (no asignar posicion neutral)\n"
            "  - Indicador de confianza segun cobertura de respuestas\n\n"
            "Estos principios no son opiniones: son conclusiones de investigacion "
            "empirica con decadas de validacion."
        )
    )

    # -- Slide 16 -- LA HIPOTESIS REFORMULADA --------------------------------
    light_slide(
        prs,
        title="Hipotesis 3 — La que funciono",
        accent_line="Si el proceso es eficiente (no entretenido), el resultado sera util.",
        body_lines=[
            "La hipotesis reformulada:",
            "",
            "  'Si se reduce la carga cognitiva del proceso informativo --",
            "  no haciendo la interfaz mas entretenida, sino estructurando las preguntas",
            "  de manera que el usuario revele sus preferencias en 5 a 10 minutos --",
            "  y si el resultado entrega un ranking con criterios explicitos y verificables,",
            "  entonces la herramienta puede ser percibida como util y confiable",
            "  por votantes de perfiles muy distintos.'",
            "",
            "La diferencia con H2 no es estetica. Es epistemologica.",
            "Reducir la carga cognitiva HACIENDO EL PROCESO MAS EFICIENTE",
            "es radicalmente distinto de reducirla HACIENDOLO MAS ENTRETENIDO.",
        ],
        notes=(
            "Esta distincion -- eficiencia vs entretenimiento -- es la esencia del "
            "cambio de paradigma.\n\n"
            "La Hipotesis 2 (swipe) buscaba reducir la carga cognitiva haciendola casi "
            "imperceptible. El precio era perder la calidad del resultado.\n\n"
            "La Hipotesis 3 (VAA) acepta que el proceso requiere atencion del usuario, "
            "pero lo estructura de manera que esa atencion se invierta en 5-10 minutos "
            "y produzca un resultado de calidad.\n\n"
            "Esta hipotesis fue la que guio la construccion de VotoAfin."
        )
    )

    # -- Slide 17 -- TIMELINE VISUAL -----------------------------------------
    dark_text_slide(
        prs,
        title="La evolucion completa: de la idea al sistema",
        highlight="4 hipotesis. 2 cursos. 1 sistema que funciona.",
        body=(
            "2024 -- Emprendimiento I\n"
            "  Problema identificado y cuantificado. Oportunidad articulada.\n\n"
            "2024 -- Emprendimiento II\n"
            "  H1: Gamificacion civica. Prototipo en Visily AI.\n"
            "  Limitacion: desplaza el problema de datos sin resolverlo.\n\n"
            "2024/2025 -- Aplicaciones Moviles\n"
            "  H2: Swipe electoral. Prototipo funcional.\n"
            "  Limitacion: binario vs. matiz. Datos fabricados = desinformacion.\n\n"
            "2025/2026 -- Tesis UTFSM\n"
            "  H3: VAA con cuestionario Likert + matching + ponderacion.\n"
            "  Resultado: sistema funcional, auditable, datos verificados."
        ),
        notes=(
            "CIERRE de la presentacion 2.\n\n"
            "Este slide sintetiza toda la historia de evolucion.\n\n"
            "El mensaje clave para la audiencia:\n"
            "  - Hubo iteracion real. No fue un camino recto.\n"
            "  - Cada hipotesis fue razonable en su momento.\n"
            "  - Las limitaciones no fueron fracasos: fueron aprendizajes estructurantes.\n"
            "  - La hipotesis correcta llego PORQUE se experimentaron las incorrectas.\n\n"
            "Tiempo estimado: 12-15 minutos.\n\n"
            "Transicion a la Presentacion 3: la solucion en detalle."
        )
    )

    # -- Slide 18 -- CIERRE --------------------------------------------------
    dark_cover(
        prs,
        title="Tres hipotesis. Tres aprendizajes. Una solucion.",
        subtitle=(
            "Continuacion -> Presentacion 3: La Solucion, el Diseno y el Producto\n"
            "Que es VotoAfin, como funciona, y que valor genera."
        ),
        label="Cierre -- Presentacion 2 de 4",
        notes=(
            "La audiencia debe salir de esta presentacion habiendo entendido:\n"
            "  - El proyecto no nacio como una app: nacio como una investigacion.\n"
            "  - La evolucion fue real, no presentada retroactivamente.\n"
            "  - El cambio de pregunta fue el movimiento mas importante.\n"
            "  - Las VAAs como modelo tienen decadas de respaldo academico.\n\n"
            "Si hay tiempo para preguntas: preguntar que hipotesis habrian intentado ellos."
        )
    )

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("02_Evolucion_de_la_Idea.pptx")
