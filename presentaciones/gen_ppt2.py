"""P2 -- Evolucion de la Idea. Visual-first, sin parrafos en slides."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path):
    prs = new_prs()

    # 1 -- PORTADA -----------------------------------------------------------
    dark_cover(prs,
        title="De la Observacion al Sistema",
        subtitle="Como 3 hipotesis erradas llevaron a la solucion correcta",
        label="Presentacion 2 de 4  --  Evolucion de la Idea",
        notes=(
            "APERTURA -- 10 a 15 minutos\n\n"
            "Esta presentacion cuenta la historia de la ITERACION real del proyecto.\n"
            "No es una historia lineal de exito. Es una historia de hipotesis, experimentos y\n"
            "aprendizajes que llevaron a un cambio de paradigma.\n\n"
            "Tres hipotesis:\n"
            "  H1: gamificacion civica resuelve el desinteres.\n"
            "  H2: el swipe binario reduce la friccion de explorar candidatos.\n"
            "  H3 (la correcta): medir coincidencia programatica reduce la carga cognitiva.\n\n"
            "Cada hipotesis fue razonable en su momento. Cada una tenia un problema oculto.\n"
            "La audiencia debe percibir la evolucion como real, no como presentacion retroactiva."
        ))

    # 2 -- TIMELINE COMPLETO -------------------------------------------------
    timeline_slide(prs,
        title="El recorrido completo -- 4 etapas, 2 cursos, 1 sistema",
        items=[
            ("2024\nEmprendimiento I",
             "Investigacion del problema.\n12 entrevistas.\nHipotesis de oportunidad.", PRIMARY),
            ("2024\nEmprendimiento II",
             "H1: Gamificacion civica.\nPrototipo Visily AI.\nLimitaciones detectadas.", DARK2),
            ("2024-2025\nApl. Moviles",
             "H2: Tinder Electoral.\nSwipe + candidatos ficticios.\nLimitacion estructural.", AMBER),
            ("2025-2026\nTesis UTFSM",
             "H3: VAA con matching.\nSistema real, datos\nverificados, open source.", ACCENT),
        ],
        notes=(
            "Este slide es el mapa de toda la historia.\n\n"
            "Cuatro etapas, dos cursos universitarios, una tesis.\n"
            "Cada etapa construyo sobre los aprendizajes de la anterior.\n\n"
            "La Etapa III (Tinder Electoral) no fue un fracaso -- fue el experimento\n"
            "que revelo la pregunta correcta de diseno.\n\n"
            "Este tipo de recorrido iterativo es lo que distingue la ingenieria\n"
            "de producto de la simple construccion de software."
        ))

    # -- ETAPA I -----------------------------------------------------------
    section_break(prs, "I", "Emprendimiento I",
        "El punto de partida: investigar antes de disenar",
        notes=(
            "El proyecto no comenzo con la decision de construir una app.\n"
            "Comenzo con la decision de ENTENDER un problema.\n\n"
            "Este orden -- investigacion antes de solucion -- es clave para\n"
            "entender por que las decisiones del proyecto tienen sentido."
        ))

    # 4 -- PREGUNTA DE INVESTIGACION -----------------------------------------
    big_question(prs,
        question="?Como influye la desinformacion\nen el comportamiento electoral de los chilenos?",
        answer="Equipo: Jenifer Castillo, Patricio De Lima, Alonso Sanchez\n"
               "Objetivo: Mejorar la calidad de la informacion disponible para los votantes",
        notes=(
            "La pregunta de investigacion fue amplia y correcta:\n"
            "No asumio una solucion. Busco entender el fenomeno primero.\n\n"
            "El equipo identifico 5 circunstancias estructurales de la desinformacion:\n"
            "  1. Aumento de fuentes no reguladas\n"
            "  2. Desconfianza en medios tradicionales\n"
            "  3. Complejidad de la informacion electoral\n"
            "  4. Polarizacion politica creciente\n"
            "  5. Ausencia de educacion civica sistematica"
        ))

    # 5 -- HALLAZGOS ETAPA I -------------------------------------------------
    stat_slide(prs,
        title="Los hadefinieron la oportunidad",
        stats=[
            ("100%", "entrevistados con\nfake news electorales\n(N=12)", DANGER),
            ("21%", "nivel nacional de\nvotantes 'muy informados'\n(Ipsos)", PRILIT),
            ("+460%", "incremento en\nvotos nulos 2021-2024\n(SERVEL)", AMBER),
            ("Brecha", "no existia VAA activa\ncon datos verificados\nen Chile", ACCENT),
        ],
        notes=(
            "Estos cuatro indicadores son los que justificaron pasar de la investigacion\n"
            "a la propuesta de solucion.\n\n"
            "La 'Brecha' no es un numero pero es el hallazgo de producto mas importante:\n"
            "al inicio del proyecto no existia en Chile ninguna herramienta activa\n"
            "con metodologia transparente y matching algoritmico.\n\n"
            "Con estos datos, el equipo tenia la justificacion empirica\n"
            "para proponer una solucion."
        ))

    # -- ETAPA II ----------------------------------------------------------
    section_break(prs, "II", "Emprendimiento II",
        "H1: ?Y si hacemos que informarse sea divertido?",
        notes=(
            "Con el problema caracterizado, la primera respuesta fue intuitiva:\n"
            "si el problema es el desinteres, una solucion gamificada que haga\n"
            "el proceso entretenido deberia funcionar."
        ))

    # 7 -- HIPOTESIS 1: GAMIFICACION -----------------------------------------
    single_message(prs,
        message="H1: Si informarse es divertido y recompensado,\nel ciudadano lo hara.",
        sub="Propuesta: gamificacion civica + RUT y Clave Unica + puntos y recompensas tangibles\n"
            "Prototipo en Visily AI. Propuesta a inversionistas: $120M CLP.",
        notes=(
            "La hipotesis de gamificacion era coherente con el diagnostico de desinteres.\n\n"
            "La propuesta incluia:\n"
            "  -- Autenticacion con RUT + Clave Unica (vinculo con institucionalidad)\n"
            "  -- Directorio de partidos y candidatos\n"
            "  -- Preguntas tipo quiz sobre candidatos (aprendizaje interactivo)\n"
            "  -- Sistema de puntos y recompensas tangibles\n\n"
            "El prototipo fue construido en Visily AI y presentado con propuesta de negocio.\n"
            "Modelo: patrocinios, publicidad in-app, licencias a gobiernos, datos agregados."
        ))

    # 8 -- LIMITACIONES H1 ---------------------------------------------------
    before_after(prs,
        title="Hipotesis 1 -- Lo que funcionaba y lo que faltaba",
        left_title="Lo que identifico bien",
        left_items=[
            "El desinteres es una barrera real",
            "La experiencia del usuario importa",
            "La escalabilidad es posible",
            "El vinculo con la institucionalidad tiene valor",
        ],
        right_title="Lo que no resolvia",
        right_items=[
            "Clave Unica requeria integracion con el Estado",
            "La gamificacion desplazaba el problema de datos",
            "Sin matching: informar != orientar la decision",
            "Sin fuentes: la app podia reproducir desinformacion",
        ],
        left_col=ACCENT, right_col=DANGER,
        notes=(
            "Esta evaluacion fue honesta y critica.\n\n"
            "La hipotesis identifico correctamente que el DESINTERES es una causa,\n"
            "pero su solucion no atacaba el problema central:\n"
            "la falta de informacion de calidad y estructurada sobre candidatos.\n\n"
            "El punto mas importante: sin mecanismo de matching, la app informaba\n"
            "pero NO orientaba. Y orientar la decision con minima carga cognitiva\n"
            "era exactamente lo que el votante promedio necesitaba.\n\n"
            "Esta limitacion genero la siguiente iteracion."
        ))

    # -- ETAPA III ---------------------------------------------------------
    section_break(prs, "III", "Desarrollo de Aplicaciones Moviles",
        "H2: El experimento del Tinder Electoral",
        notes=(
            "La siguiente hipotesis nacio de otra observacion:\n"
            "el problema no era solo el desinteres, sino la FRICCION COGNITIVA\n"
            "de explorar candidatos mediante listas y textos.\n\n"
            "La pregunta fue: podemos hacer ese proceso casi instantaneo?"
        ))

    # 10 -- LA MECANICA DEL SWIPE --------------------------------------------
    tight_bullets(prs,
        title="H2: El swipe reduce la friccion al minimo",
        bullets=[
            "Tarjeta del candidato: foto, nombre, partido, propuestas clave",
            "Swipe derecha = me interesa",
            "Swipe izquierda = no me interesa",
            "Interaccion conocida: cero curva de aprendizaje",
            "Evaluacion rapida, inmediata, sin friccin",
        ],
        dark=True,
        notes=(
            "La inspiracion en Tinder era tecnica y concepcionalmente solida:\n"
            "la mecanica es conocida por millones de usuarios.\n\n"
            "La hipotesis: si explorar candidatos mediante listas resulta tedioso,\n"
            "hacer ese proceso casi instantaneo con un gesto familiar\n"
            "deberia reducir la barrera de entrada.\n\n"
            "El prototipo se construyo en el ramo de Desarrollo de Aplicaciones Moviles.\n"
            "Incluia candidatos ficticios y posiciones simplificadas.\n\n"
            "Pero contenia una contradiccion estructural..."
        ))

    # 11 -- EL PROBLEMA BINARIO ----------------------------------------------
    big_question(prs,
        question="El swipe es binario.\nLa politica publica no lo es.",
        answer="La posicion de un votante sobre un tema rara vez es: me gusta / no me gusta.",
        notes=(
            "Esta es la limitacion fundamental del modelo de swipe.\n\n"
            "La posicion de un votante sobre, por ejemplo, 'el aumento del salario minimo'\n"
            "no puede ser binaria: exige matiz.\n"
            "?Cuanto aumento? ?En que plazo? ?Con que compensacion para las empresas?\n\n"
            "La escala Likert de 5 puntos captura esa gradacion:\n"
            "  Muy de acuerdo / De acuerdo / Neutral / En desacuerdo / Muy en desacuerdo\n\n"
            "El swipe binario pierde la mitad de la informacion relevante para el matching.\n"
            "Sin esa informacion, el porcentaje de afinidad no refleja preferencias reales."
        ))

    # 12 -- EL PROBLEMA DE LOS DATOS -----------------------------------------
    single_message(prs,
        message="Los datos eran fabricados.\nEso convierte la herramienta en otra fuente de desinformacion.",
        sub="Los candidatos ficticios tenian posturas asignadas por inferencia ideologica, sin verificacion.\n"
            "'Si el candidato X es de derecha, su postura sobre el aborto es Y.' -- Inaceptable.",
        notes=(
            "Este fue el segundo problema critico del prototipo.\n\n"
            "Las posturas eran generadas por estereotipos ideologicos sin verificacion:\n"
            "ningun candidato real, ninguna fuente primaria, ninguna trazabilidad.\n\n"
            "Un sistema que genera recomendaciones electorales basadas en datos fabricados\n"
            "no asesora al votante: lo DESINFORMA de manera mas sofisticada.\n"
            "La presentacion algoritmica genera una ilusion de rigor que el contenido no respalda.\n\n"
            "Este episodio genero el principio que organizo todo el proyecto:\n"
            "NUNCA INVENTAR DATOS ELECTORALES."
        ))

    # -- EL CAMBIO ---------------------------------------------------------
    section_break(prs, "->", "El Cambio de Paradigma",
        "Cuando cambiar la pregunta cambia todo",
        notes=(
            "Las limitaciones del Tinder Electoral no eran problemas a parchear.\n"
            "Eran senales de que la PREGUNTA DE DISENO era incorrecta.\n\n"
            "Cambiar la pregunta fue el movimiento mas importante del proyecto."
        ))

    # 14 -- LA PREGUNTA QUE CAMBIO TODO --------------------------------------
    before_after(prs,
        title="La pregunta que cambio todo",
        left_title="Pregunta ANTERIOR",
        left_items=[
            "?Como hacer mas entretenido el proceso de conocer candidatos?",
            "Foco: presentacion del candidato",
            "Metafora: Tinder",
            "Resultado: experiencia atractiva",
            "Problema: no captura preferencias reales",
        ],
        right_title="Pregunta NUEVA",
        right_items=[
            "?Como medir la coincidencia entre las posturas del votante y el candidato?",
            "Foco: coincidencia programatica",
            "Metafora: herramienta de orientacion",
            "Resultado: decision mas informada",
            "Modelo: Voting Advice Application (VAA)",
        ],
        left_col=AMBER, right_col=ACCENT,
        notes=(
            "El cambio no fue de funcionalidad: fue EPISTEMOLOGICO.\n\n"
            "La pregunta anterior asumia que el problema era la PRESENTACION del candidato.\n"
            "La nueva pregunta asumia que el problema era la MEDICION DE AFINIDAD entre\n"
            "las preferencias del votante y las posiciones del candidato.\n\n"
            "Esa diferencia lo cambio todo:\n"
            "  -- El algoritmo (escala Likert en vez de conteo de swipes)\n"
            "  -- El flujo de usuario (cuestionario antes de ver candidatos)\n"
            "  -- El modelo de datos (posturas verificadas con fuentes)\n"
            "  -- El indicador de confianza (nueva para el campo de VAAs)\n\n"
            "Invertir en precisar la pregunta correcta antes de construir es\n"
            "la decision con mayor retorno del proceso."
        ))

    # 15 -- LAS VAAS INTERNACIONALES -----------------------------------------
    three_cards(prs,
        title="El referente: 30+ anos de VAAs validadas academicamente",
        cards=[
            ("StemWijzer (NL, 1989)\nWahl-O-Mat (DE, 2002)",
             "Los mas usados en Europa.\nMillones de usuarios por proceso.\n\n"
             "Principio validado:\nescala Likert + ponderacion\nproduce resultados utiles.",
             EJE_SOC),
            ("Smartvote (CH, 2003)\nVote Compass (CA, 2011)",
             "Mas sofisticados.\nVisualizacion en ejes multidimensionales.\n\n"
             "Leccion: la distribucion importa\ntanto como el algoritmo.",
             PRIMARY),
            ("iSideWith (Global, 2012)\nDecide Chile (CL, disc.)",
             "Alcance global pero sin profundidad local.\nDecide Chile fue discontinuada.\n\n"
             "Leccion: sostenibilidad es\nun desafio central.",
             DARK2),
        ],
        notes=(
            "El modelo VAA no fue inventado para VotoAfin. Tiene 30 anos de historia\n"
            "y literatura academica propia.\n\n"
            "La investigacion del estado del arte en VAAs fue parte formal de la Fase 0.\n\n"
            "Los principios clave que emergieron:\n"
            "  -- Escala Likert de 5 puntos (no binaria, no mas larga por fatiga)\n"
            "  -- Ponderacion por importancia declarada\n"
            "  -- Exclusion de 'No se' del calculo (no asignar posicion neutral)\n"
            "  -- Indicador de confianza segun cobertura de respuestas\n\n"
            "Estos principios no son opiniones: son conclusiones de investigacion empirica."
        ))

    # 16 -- H3: LA HIPOTESIS CORRECTA ----------------------------------------
    single_message(prs,
        message="H3: Si el proceso es EFICIENTE (no entretenido),\nel resultado sera UTIL.",
        sub="Reducir la carga cognitiva haciendo el proceso mas eficiente\nes radicalmente distinto de hacerlo mas entretenido.",
        notes=(
            "Esta distincion -- eficiencia vs entretenimiento -- es la esencia del cambio.\n\n"
            "H2 (swipe): buscaba reducir la carga cognitiva haciendola casi imperceptible.\n"
            "El precio era perder la calidad del resultado.\n\n"
            "H3 (VAA): acepta que el proceso requiere atencion del usuario,\n"
            "pero lo estructura de manera que esa atencion se invierta en 5-10 minutos\n"
            "y produzca un resultado de calidad.\n\n"
            "Esta hipotesis guio la construccion de VotoAfin."
        ))

    # 17 -- TIMELINE SINTESIS ------------------------------------------------
    timeline_slide(prs,
        title="La evolucion completa: hipotesis, aprendizajes, pivotes",
        items=[
            ("H1", "Gamificacion civica\nDesinteres como\nbarrera central", PRIMARY),
            ("Limite H1", "No resuelve la\ncalidad de datos.\nSin matching.", DANGER),
            ("H2", "Tinder Electoral\nReducir friccion\nal minimo", AMBER),
            ("Limite H2", "Binario vs matiz.\nDatos fabricados\n= desinformacion.", DANGER),
            ("H3", "VAA: medir\ncoincidencia\nprogramatica", ACCENT),
        ],
        notes=(
            "Este slide sintetiza toda la historia de evolucion.\n\n"
            "El mensaje clave:\n"
            "  -- Hubo iteracion real. No fue un camino recto.\n"
            "  -- Cada hipotesis fue razonable en su momento.\n"
            "  -- Las limitaciones no fueron fracasos: fueron aprendizajes.\n"
            "  -- La hipotesis correcta llego PORQUE se experimentaron las incorrectas.\n\n"
            "Tiempo estimado presentacion 2: 12-15 minutos."
        ))

    # 18 -- CIERRE P2 --------------------------------------------------------
    dark_cover(prs,
        title="Tres hipotesis. Tres aprendizajes. Un cambio de pregunta.",
        subtitle="Continuacion -> P3: La solucion, el diseno y el producto.",
        label="Cierre -- Presentacion 2 de 4",
        notes=(
            "La audiencia debe salir habiendo entendido:\n"
            "  -- El proyecto no nacio como una app: nacio como una investigacion.\n"
            "  -- La evolucion fue real, no presentada retroactivamente.\n"
            "  -- Cambiar la pregunta fue el movimiento mas importante.\n"
            "  -- Las VAAs como modelo tienen decadas de respaldo academico.\n\n"
            "Si hay tiempo para preguntas: preguntar que hipotesis habrian intentado ellos."
        ))

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("02_Evolucion_de_la_Idea.pptx")
