"""P1 -- El Problema, la Investigacion y el Contexto. Visual-first, sin parrafos."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path):
    prs = new_prs()

    # 1 -- PORTADA -----------------------------------------------------------
    dark_cover(prs,
        title="El Voto Sin Informacion",
        subtitle="Desinformacion, apatia y la oportunidad de la tecnologia civica",
        label="Presentacion 1 de 4  --  Problema, Investigacion y Contexto",
        notes=(
            "APERTURA -- 10 a 15 minutos\n\n"
            "Comenzar con una pregunta directa a la audiencia:\n"
            "  '?Cuantos saben el nombre de al menos un candidato a diputado de su distrito?'\n\n"
            "Esta presentacion responde DOS preguntas:\n"
            "  1. ?Por que existe el problema?\n"
            "  2. ?Por que merece ser resuelto?\n\n"
            "No se habla de la aplicacion todavia. Solo del problema y la investigacion.\n"
            "El objetivo es que la audiencia termine pensando: 'Si, este problema existe.'"
        ))

    # 2 -- CONTEXTO: CHILE 2020-2024 -----------------------------------------
    timeline_slide(prs,
        title="Chile 2020-2024 -- 8 procesos electorales en 4 anos",
        items=[
            ("Oct 2020", "Plebiscito\nde entrada", PRIMARY),
            ("Nov 2021", "Presidencial\n+ Convencionales", DARK2),
            ("Sep 2022", "Plebiscito\nconstitucional", ACCENT),
            ("May-Dic 2023", "Consejo\nConstitucional", AMBER),
            ("Oct 2024", "Municipales\ny Regionales", DANGER),
        ],
        notes=(
            "Chile tuvo entre 2020 y 2024 una densidad electoral sin precedentes.\n"
            "Ningun otro periodo de cuatro anos en la historia chilena tuvo tantos procesos consecutivos.\n\n"
            "Los analistas comenzaron a documentar la 'fatiga electoral':\n"
            "a medida que se sucedian los procesos, los ciudadanos invertian menos atencion en informarse.\n\n"
            "Este contexto es el escenario donde nace el problema que VotoAfin busca resolver."
        ))

    # 3 -- FATIGA: LA CITA ---------------------------------------------------
    quote_slide(prs,
        quote=("Es cierto que se observa una fatiga electoral. "
               "Ello tiene como correlato que la gente evita informarse "
               "e invertir mucho tiempo en estar expuesto a material de campana."),
        author="Prof. Rene Jara, Universidad de Santiago de Chile",
        notes=(
            "Esta cita encapsula la consecuencia de la densidad electoral: "
            "no es solo cansancio, es una reduccion activa en la disposicion a informarse.\n\n"
            "Claudio Fuentes (UDP) identifico tres causas: desinformacion, desinteres, desconfianza.\n"
            "Las tres 'D' sintetizan el problema que VotoAfin busca abordar."
        ))

    # 4 -- DEFICIT DE INFORMACION --------------------------------------------
    stat_slide(prs,
        title="?Que tan informado esta el electorado chileno?  (Ipsos, Municipales 2024)",
        stats=[
            ("21%", "se sentia\n'muy informado'", DANGER),
            ("42%", "no habia decidido\nsu voto para alcalde", AMBER),
            ("45%", "sabia que se\nelegian consejeros\nregionales", PRILIT),
            ("16%", "se declaraba\n'nada informado'", SEC),
        ],
        notes=(
            "Fuente: Informe Claves Ipsos N33 -- Municipales octubre 2024.\n\n"
            "Solo el 21% 'muy informado' -- y eso en el cargo de MAYOR visibilidad.\n"
            "Para concejales: 60% indeciso. Para gobernadores: 64%. Para consejeros: 68%.\n\n"
            "Conclusion: una proporcion significativa del electorado voto sin informacion\n"
            "adecuada sobre los candidatos. El voto se convirtio en una decision bajo incertidumbre."
        ))

    # 5 -- DESINFORMACION ----------------------------------------------------
    stat_slide(prs,
        title="La desinformacion como amplificador del deficit",
        stats=[
            ("81%", "expuesto a desinformacion\ncon frecuencia semanal\no mayor", DANGER),
            ("71%", "cree que la\ndesinformacion amenaza\nla democracia", AMBER),
            ("79%", "no confia en\nlos politicos como\nfuente de informacion", PRILIT),
            ("100%", "de los entrevistados\nen terreno habia\nvisto fake news", ACCENT),
        ],
        notes=(
            "Fuente: Activa Knowledge for Action -- 'Fake News y Desinformacion en Chile y LatAm'.\n\n"
            "El 52% encuentra desinformacion TODOS LOS DIAS. 29% al menos una vez por semana.\n"
            "Suma semanal o mas: 81% del electorado.\n\n"
            "Paradoja: las tres fuentes mas usadas (TV 35%, noticias online 14%, Facebook 12%)\n"
            "son exactamente aquellas en que menos confian.\n\n"
            "El dato del 100% proviene del levantamiento de campo propio (12 entrevistas en Valparaiso)."
        ))

    # 6 -- EL COSTO: VOTOS NULOS ---------------------------------------------
    stat_slide(prs,
        title="El costo visible -- votos nulos Municipales 2021 vs 2024 (SERVEL)",
        stats=[
            ("+460%", "votos nulos\npara alcalde\n1,93% -> 10,80%", DANGER),
            ("+274%", "votos nulos\npara concejal\n5,74% -> 21,46%", AMBER),
            ("+190%", "votos nulos\npara gobernador\n6,13% -> 17,80%", PRILIT),
            ("2,1M", "votos nulos en\nprocesos\nconstitucionales", SEC),
        ],
        notes=(
            "El +460% en votos nulos para alcalde es el indicador mas dramatico:\n"
            "mismo cargo, mismo electorado, cuatro anos despues.\n\n"
            "Los expertos del SERVEL fueron explícitos:\n"
            "'Los votos blancos normalmente son el resultado de la desinformacion.\n"
            "En este proceso hubo poca informacion. Poca gente sabia lo que se votaba.'\n\n"
            "2,1 millones de sufragios nulos en los procesos constitucionales =\n"
            "el equivalente a la poblacion de Santiago y Valparaiso juntos."
        ))

    # 7 -- SOBRECARGA INFORMATIVA -------------------------------------------
    tight_bullets(prs,
        title="La sobrecarga: demasiada informacion, poca estructura",
        bullets=[
            "8 procesos en 4 anos = fatiga cognitiva acumulada",
            "Cada eleccion tiene multiples cargos con decenas de candidatos",
            "Las fuentes verificadas son extensas y de dificil acceso",
            "Las redes sociales simplifican pero desinforman",
            "No existia herramienta que estructurara la comparacion",
        ],
        notes=(
            "La sobrecarga informativa no es solo 'mucha informacion':\n"
            "es la combinacion de volumen + falta de estructura + desinformacion activa.\n\n"
            "El votante promedio no tiene tiempo de leer los programas de cada candidato\n"
            "para cada uno de los multiples cargos en disputa.\n\n"
            "Las herramientas que existian eran pasivas: el usuario debia saber que buscar\n"
            "y tener disposicion a leer extensamente. Ese es el punto de quiebre."
        ))

    # 8 -- INVESTIGACION DE CAMPO --------------------------------------------
    three_cards(prs,
        title="Investigacion de campo -- Emprendimiento I, UTFSM 2024",
        cards=[
            ("Equipo",
             "Jenifer Castillo\nPatricio De Lima\nAlonso Sanchez\n\nCurso:\nEmprendimiento -- UTFSM",
             PRIMARY),
            ("Metodologia",
             "12 entrevistas en terreno\n\nLocalidades:\nPlaya Ancha\nVina del Mar\nQuilpue\n\n7 dimensiones / respuestas Si-No",
             DARK2),
            ("Hallazgo central",
             "100% de los entrevistados\nhabia tenido contacto\ncon fake news electorales.\n\n100% creia que existe\ndesinformacion generalizada.",
             DANGER),
        ],
        notes=(
            "La investigacion combino fuentes secundarias (Ipsos, Activa, SERVEL)\n"
            "con trabajo de campo propio en tres comunas del Gran Valparaiso.\n\n"
            "Las 12 entrevistas no son estadisticamente representativas -- el equipo\n"
            "fue explícito en ese punto -- pero si ofrecen triangulacion cualitativa\n"
            "de los datos nacionales.\n\n"
            "El hallazgo mas contundente: 12 de 12 entrevistados habian visto fake news\n"
            "electorales. No hubo ninguna excepcion."
        ))

    # 9 -- HALLAZGOS CUANTITATIVOS -------------------------------------------
    stat_slide(prs,
        title="Hallazgos del levantamiento de campo -- N=12 entrevistados",
        stats=[
            ("~83%", "se informa por\nredes sociales\n(no medios verificados)", AMBER),
            ("~50%", "no conocia a los\ncandidatos en\ncompetencia", DANGER),
            ("~25%", "usaba canales\noficiales como\nfuente principal", PRILIT),
            ("100%", "creia que existe\ndesinformacion\ngeneralizada en Chile", ACCENT),
        ],
        notes=(
            "Estos datos son coherentes con el panorama nacional:\n"
            "  - 83% redes sociales (vs 35% TV + 14% online a nivel nacional)\n"
            "  - 50% no conocia candidatos (vs 21% 'muy informado' a nivel nacional)\n\n"
            "La investigacion de campo no contradijo los datos secundarios;\n"
            "los confirmo con observacion directa en el territorio.\n\n"
            "Esto le da solidez empirica a la hipotesis de que el problema es real,\n"
            "medible y consistente entre fuentes."
        ))

    # 10 -- LA OPORTUNIDAD ---------------------------------------------------
    section_break(prs, "!", "La Oportunidad",
        "Un espacio vacio. Una necesidad real. Un problema abordable.",
        notes=(
            "Transicion al diagnóstico de la oportunidad de producto.\n\n"
            "El problema esta documentado. El ecosistema de herramientas falla.\n"
            "El espacio esta abierto. ?Por que nadie lo habia llenado?"
        ))

    # 11 -- HERRAMIENTAS QUE FALLARON ----------------------------------------
    before_after(prs,
        title="El ecosistema existente -- y por que no era suficiente",
        left_title="Lo que existia en Chile",
        left_items=[
            "Guias SERVEL: extensas, pasivas, sin matching",
            "Voto Informado (SERVEL+PNUD): sin algoritmo de afinidad",
            "Decide Chile: discontinuada, sin datos actualizados",
            "Plataformas globales: sin contexto electoral chileno",
            "Redes sociales: ruido > informacion verificada",
        ],
        right_title="Lo que faltaba",
        right_items=[
            "VAA activa con metodologia transparente",
            "Algoritmo de matching auditable",
            "Datos verificados con fuentes primarias",
            "Diseno mobile-first para el usuario chileno",
            "Codigo abierto y sostenible",
        ],
        left_col=DANGER, right_col=ACCENT,
        notes=(
            "Al inicio del proyecto, Chile no tenia ninguna VAA activa con metodologia\n"
            "transparente y datos actualizados.\n\n"
            "Voto Informado (SERVEL+PNUD): comparaba perfiles lado a lado pero sin\n"
            "producir un indicador de afinidad. Sin algoritmo de matching.\n\n"
            "Decide Chile: era la mas cercana al concepto de VAA, pero estaba\n"
            "discontinuada y sin datos actualizados. Falta de sostenibilidad.\n\n"
            "La brecha era concreta. El espacio estaba abierto."
        ))

    # 12 -- SEGMENTOS VULNERABLES --------------------------------------------
    three_cards(prs,
        title="?Quienes son mas vulnerables al deficit informativo?",
        cards=[
            ("Jovenes Votantes",
             "Alta exposicion a redes sociales.\nBajo consumo de medios verificados.\n\nMayor potencial de adopcion\nde una solucion tecnologica\nmobile-first.",
             EJE_SOC),
            ("Adultos Mayores",
             "Dificultad para evaluar\nconfiabilidad en plataformas digitales.\n\nAlta exposicion a fake news +\nmenor capacidad de verificacion\nindependiente.",
             DARK2),
            ("Votantes Indecisos",
             "Buscan informacion en el\nperiodo previo inmediato.\n\nMoment de mayor flujo de\ncontenido desinformativo.\n\n42% no decidido para alcalde.",
             AMBER),
        ],
        notes=(
            "Los tres segmentos comparten una necesidad comun:\n"
            "informacion confiable, estructurada y procesable en tiempo razonable.\n\n"
            "Esta segmentacion fue determinante en las decisiones de UX:\n"
            "sin conocimiento politico previo necesario para usar la herramienta.\n\n"
            "El joven es el perfil con mayor potencial de adopcion.\n"
            "El adulto mayor y el indeciso son quienes mas se beneficiarian de\n"
            "la reduccion de carga cognitiva."
        ))

    # 13 -- HIPOTESIS INICIAL ------------------------------------------------
    big_question(prs,
        question="?Existe espacio para una herramienta que reuna informacion confiable\nsobre candidatos y elecciones, accesible para todos?",
        answer="Emprendimiento I, UTFSM 2024 -- Conclusion del levantamiento",
        notes=(
            "Esta fue la hipotesis de oportunidad articulada al cierre del primer\n"
            "trabajo de Emprendimiento -- el documento que dio origen al proyecto.\n\n"
            "Es importante que la audiencia entienda:\n"
            "  - El proyecto NO comenzo con la decision de construir una app.\n"
            "  - Comenzo con la OBSERVACION de un problema y la ARTICULACION de una oportunidad.\n\n"
            "La tecnologia fue el medio. La democracia informada fue siempre el fin."
        ))

    # 14 -- POR QUE LA INGENIERIA --------------------------------------------
    single_message(prs,
        message="No es un problema de escasez de informacion.\nEs un problema de intermediacion.",
        sub="Las posturas de los candidatos existen en el registro publico.\nEl problema es transformar esa informacion bruta en conocimiento accionable.",
        notes=(
            "Este slide es el argumento central de justificacion tecnica del proyecto.\n\n"
            "Un problema de escasez requiere producir mas informacion -- eso es periodismo.\n"
            "Un problema de intermediacion requiere un sistema que transforme la informacion\n"
            "existente en algo utilizable para el votante promedio. Eso es ingenieria.\n\n"
            "VotoAfin no produce informacion nueva. Organiza, compara y presenta\n"
            "la informacion que ya existe en el registro publico.\n\n"
            "Este argumento es el que justifica el proyecto desde la ingenieria de software."
        ))

    # 15 -- CIERRE P1 --------------------------------------------------------
    dark_cover(prs,
        title="Un problema real. Una brecha concreta. Una hipotesis verificada.",
        subtitle="Continuacion -> P2: Como evoluciono la idea hacia la solucion actual.",
        label="Cierre -- Presentacion 1 de 4",
        notes=(
            "CIERRE -- Tiempo estimado: 10-13 minutos con buena cadencia.\n\n"
            "Mensajes de salida:\n"
            "  -- El problema esta documentado con datos primarios y secundarios.\n"
            "  -- El 21% informado y el +460% en votos nulos son el punto de partida.\n"
            "  -- Las herramientas existentes no lo resolvian.\n"
            "  -- La brecha estaba abierta.\n\n"
            "Pregunta para dejar en el aire:\n"
            "'?Y cual fue la primera respuesta que intentamos darle al problema?'\n\n"
            "Espacio para preguntas si el formato lo permite."
        ))

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("01_Problema_Investigacion_y_Contexto.pptx")
