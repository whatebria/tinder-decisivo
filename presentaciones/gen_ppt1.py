"""Presentación 1 — El Problema, la Investigación y el Contexto."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path: str):
    prs = new_prs()

    # ── Slide 1 ── PORTADA ───────────────────────────────────────────────────
    dark_cover(
        prs,
        title="El Voto Sin Información",
        subtitle="Desinformación electoral, participación ciudadana y la oportunidad de la tecnología cívica",
        label="Presentación 1 de 4  ·  Problema, Investigación y Contexto",
        notes=(
            "APERTURA — 10 a 15 minutos\n\n"
            "Comenzar preguntando a la audiencia: '¿Cuántos de ustedes saben el nombre de "
            "al menos uno de los candidatos a diputado de su distrito?' Pausa breve.\n"
            "Esta presentación cuenta POR QUÉ nació este proyecto: un problema real, medible, "
            "con consecuencias democráticas concretas.\n"
            "El objetivo no es explicar la aplicación. Es que la audiencia termine pensando: "
            "'Sí, este problema existe y merece ser resuelto.'\n\n"
            "VotoAFin · UTFSM · Jenifer Castillo · 2026"
        )
    )

    # ── Slide 2 ── CONTEXTO CHILE ────────────────────────────────────────────
    dark_text_slide(
        prs,
        title="Chile 2020–2024",
        highlight="8 procesos electorales en 4 años",
        body=(
            "• Plebiscito de entrada (oct 2020)\n"
            "• Convencionales + primera vuelta presidencial (nov 2021)\n"
            "• Segunda vuelta presidencial (dic 2021)\n"
            "• Plebiscito de salida del 1er proceso constitucional (sep 2022)\n"
            "• Consejo Constitucional (may 2023)\n"
            "• Plebiscito de salida del 2do proceso constitucional (dic 2023)\n"
            "• Elecciones municipales y regionales (oct 2024)\n"
            "• Segundas vueltas municipales (nov 2024)"
        ),
        notes=(
            "Establecer el contexto temporal: Chile tuvo entre 2020 y 2024 una densidad "
            "electoral sin precedentes en su historia democrática reciente.\n\n"
            "Ningún otro período de cuatro años en la historia chilena tuvo tantos procesos "
            "electorales consecutivos.\n\n"
            "Los analistas electorales comenzaron a documentar un fenómeno que llamaron "
            "'fatiga electoral': a medida que se sucedían los procesos, los ciudadanos "
            "invertían cada vez menos atención en informarse.\n\n"
            "Esta acumulación es el escenario donde nace el problema que este proyecto busca resolver."
        )
    )

    # ── Slide 3 ── FATIGA ELECTORAL ──────────────────────────────────────────
    quote_slide(
        prs,
        quote=(
            "Es cierto que se observa una fatiga electoral. "
            "Ello tiene como correlato que la gente evita informarse "
            "e invertir mucho tiempo en estar expuesto a material de campaña."
        ),
        author="Prof. René Jara, Universidad de Santiago de Chile",
        notes=(
            "Esta cita encapsula la consecuencia central de la densidad electoral.\n\n"
            "La fatiga no es solo cansancio: es una reducción activa en la disposición "
            "a invertir tiempo y atención en informarse.\n\n"
            "Claudio Fuentes (UDP) identificó tres causas del fenómeno con precisión: "
            "desinformación, desinterés y desconfianza — las tres 'D'.\n\n"
            "Cada una de esas 'D' representa una dimensión distinta del problema que "
            "VotoAFin intentó abordar."
        )
    )

    # ── Slide 4 ── ESTADÍSTICAS DE INFORMACIÓN ───────────────────────────────
    stat_slide(
        prs,
        title="Nivel real de información del electorado — Municipales 2024 (Ipsos)",
        stats=[
            ("21%", "se reconocía como\n'muy informado'", DANGER),
            ("42%", "aún no había decidido\nsu voto para alcalde", AMBER),
            ("55%", "sabía que se\nelegían concejales", PRI_LIGHT),
            ("45%", "sabía de la elección\nde consejeros regionales", SECONDARY),
        ],
        notes=(
            "Fuente: Informe Claves Ipsos N°33 — elecciones municipales octubre 2024.\n\n"
            "Solo el 21% 'muy informado'. Para perspectiva: el 83% sabía que se elegía alcalde, "
            "el cargo más mediático. Pero apenas el 55% sabía que también se elegían concejales.\n\n"
            "El 42% no había decidido su voto para alcalde al momento de la encuesta. "
            "Para gobernador: 64%. Para consejeros regionales: 68%.\n\n"
            "Conclusión directa: una proporción significativa del electorado ejercía su "
            "derecho a voto sin información adecuada sobre los candidatos.\n\n"
            "El voto deja de ser una decisión informada para convertirse en una decisión "
            "bajo incertidumbre."
        )
    )

    # ── Slide 5 ── DESINFORMACIÓN ────────────────────────────────────────────
    stat_slide(
        prs,
        title="La desinformación como factor agravante — Activa Knowledge for Action",
        stats=[
            ("81%", "del electorado expuesto\na desinformación semanal", DANGER),
            ("71%", "cree que la desinformación\namena la democracia", AMBER),
            ("68%", "dice que debilita\nel proceso electoral", PRI_LIGHT),
            ("79%", "no confía en los\npolíticos como fuente", SECONDARY),
        ],
        notes=(
            "Fuente: estudio 'Fake News y Desinformación en Chile y LatAm' — Activa Knowledge for Action.\n\n"
            "El 52% encuentra desinformación TODOS LOS DÍAS. El 29% al menos una vez a la semana. "
            "Total semanal o más: 81%.\n\n"
            "Las tres fuentes principales de información declaradas: televisión (35%), "
            "noticias online (14%), Facebook (12%). Exactamente las fuentes en que menos confían.\n\n"
            "El 79% de desconfianza en políticos como fuente es especialmente relevante: "
            "el principal emisor de mensajes electorales es el actor que menos credibilidad tiene.\n\n"
            "Este es el ecosistema informativo en el que el votante promedio intenta tomar una "
            "decisión de voto."
        )
    )

    # ── Slide 6 ── COSTO: VOTOS NULOS ────────────────────────────────────────
    light_slide(
        prs,
        title="El costo visible: votos nulos y en blanco",
        accent_line="Municipales 2021 → 2024: un salto extraordinario",
        body_lines=[
            "Alcalde:             1,93%  →  10,80%   (+460%)",
            "Gobernador:          6,13%  →  17,80%   (+190%)",
            "Concejal:            5,74%  →  21,46%   (+274%)",
            "Consejero Regional: 13,10%  →  25,78%   (+97%)",
            "",
            "Procesos constitucionales: 2.119.506 votos nulos  =  16,98% del total",
            "",
            "\"Los votos blancos normalmente son el resultado de la desinformación.\"",
            "— Analistas del SERVEL"
        ],
        notes=(
            "Fuente: Servicio Electoral de Chile (SERVEL), datos comparativos 2021-2024.\n\n"
            "El +460% en votos nulos para alcalde es el número más dramático del dataset. "
            "Es prácticamente el mismo cargo, el mismo electorado, cuatro años después.\n\n"
            "La interpretación de los expertos del SERVEL fue directa: 'en este proceso hubo "
            "poca información. Poca gente sabía lo que se votaba.'\n\n"
            "En los procesos constitucionales, más de dos millones de personas emitieron "
            "un sufragio nulo — el equivalente de la población de Santiago y Valparaíso juntos.\n\n"
            "Estos números no son abstractos: son ciudadanos que llegaron a votar pero no "
            "pudieron ejercer su derecho de manera informada."
        )
    )

    # ── Slide 7 ── LA INVESTIGACIÓN ──────────────────────────────────────────
    section_break(
        prs, "02", "La Investigación Empírica",
        "Cómo se verificó el problema en el terreno",
        notes=(
            "Transición a la segunda parte de esta presentación.\n\n"
            "Hasta ahora vimos los números nacionales. Ahora vamos a los datos propios: "
            "la investigación de campo que el equipo realizó en el contexto del curso "
            "de Emprendimiento de la UTFSM.\n\n"
            "La investigación no fue bibliográfica: fue a la calle, con personas reales, "
            "en comunas reales del área metropolitana de Valparaíso."
        )
    )

    # ── Slide 8 ── METODOLOGÍA CAMPO ────────────────────────────────────────
    two_col_slide(
        prs,
        title="Investigación de campo — Emprendimiento I, 2024",
        left_title="La metodología",
        left_lines=[
            "• Curso: Emprendimiento — UTFSM",
            "• Equipo: Jenifer Castillo, Patricio De Lima, Alonso Sánchez",
            "",
            "• 12 entrevistas en terreno",
            "• Localidades: Playa Ancha, Viña del Mar y Quilpué",
            "• Perfiles socioeconómicos y etarios distintos",
            "",
            "• 7 dimensiones de análisis",
            "• Respuestas dicotómicas (sí / no)",
        ],
        right_title="Las dimensiones consultadas",
        right_lines=[
            "1. ¿Conocen a los candidatos?",
            "2. ¿Votan de manera informada?",
            "3. ¿Se informan por redes sociales?",
            "4. ¿Se informan por canales oficiales?",
            "5. ¿Saben qué cargos se eligen?",
            "6. ¿Creen que existe desinformación?",
            "7. ¿Han visto fake news electorales?",
        ],
        notes=(
            "La investigación combinó fuentes secundarias (Ipsos, Activa, SERVEL) con "
            "trabajo de campo propio.\n\n"
            "Las 12 entrevistas en tres comunas con perfiles distintos permitieron triangular "
            "los datos nacionales con observación directa.\n\n"
            "La metodología fue simple e intencional: respuestas dicotómicas para facilitar "
            "el análisis comparativo y mantener la coherencia entre entrevistadores.\n\n"
            "No es una muestra estadísticamente representativa — el equipo fue explícito en "
            "ese punto — pero sí un levantamiento de evidencia cualitativa con consistencia "
            "interna."
        )
    )

    # ── Slide 9 ── HALLAZGOS ─────────────────────────────────────────────────
    stat_slide(
        prs,
        title="Hallazgos del levantamiento de campo — N=12 entrevistados",
        stats=[
            ("100%", "vio o conoce\nfake news electorales", DANGER),
            ("100%", "cree que existe\ndesinformación en Chile", ACCENT),
            ("~83%", "se informa por\nredes sociales", AMBER),
            ("~25%", "usa canales\noficiales (SERVEL)", PRI_LIGHT),
        ],
        notes=(
            "El hallazgo más contundente: el 100% de los entrevistados — 12 de 12 — "
            "aseguró haber visto o conocer la existencia de fake news electorales.\n\n"
            "Igualmente, el 100% declaró creer que existe desinformación generalizada en Chile. "
            "No hubo ninguna persona que considerara que el fenómeno no existía.\n\n"
            "El ~83% se informaba por redes sociales vs apenas ~25% por canales oficiales.\n\n"
            "La mitad de los entrevistados no conocía a los candidatos en competencia para "
            "el proceso electoral en curso.\n\n"
            "Estos datos son coherentes con el panorama nacional: 21% muy informado "
            "vs exposición masiva a desinformación."
        )
    )

    # ── Slide 10 ── PROBLEMA CENTRAL ─────────────────────────────────────────
    quote_slide(
        prs,
        quote=(
            "Solo un 21% de las personas se siente realmente informado y con la presencia "
            "de las fake news este número está en crecimiento. Dejando un espacio de oportunidad "
            "para encontrar una solución que reúna información confiable sobre candidatos y "
            "elecciones, accesible para todos."
        ),
        author="Castillo, De Lima y Sánchez — Emprendimiento I, UTFSM, 2024",
        notes=(
            "Esta fue la conclusión literal del primer trabajo de Emprendimiento — "
            "el documento que inició el proyecto.\n\n"
            "Es importante que la audiencia entienda que VotoAFin no comenzó con la "
            "decisión de construir una aplicación. Comenzó con la observación de un "
            "problema y la articulación de una oportunidad.\n\n"
            "La tecnología fue el medio; la democracia informada fue siempre el fin."
        )
    )

    # ── Slide 11 ── EL ECOSISTEMA EXISTENTE ─────────────────────────────────
    two_col_slide(
        prs,
        title="Las herramientas existentes — y por qué fallaban",
        left_title="Lo que existía en Chile",
        left_lines=[
            "• Guías SERVEL",
            "  → Extensas, pasivas, sin comparación",
            "",
            "• Voto Informado (SERVEL + PNUD)",
            "  → Sin algoritmo de matching",
            "  → Operación intermitente",
            "",
            "• Decide Chile",
            "  → Discontinuada, sin datos actualizados",
            "  → Inactiva al inicio del proyecto",
        ],
        right_title="Lo que faltaba",
        right_lines=[
            " VAA activa con metodología transparente",
            " Algoritmo de matching auditable",
            " Datos verificados y trazables",
            " Diseño mobile-first",
            " Código abierto",
            "",
            "→ La brecha estaba vacante.",
        ],
        notes=(
            "Al inicio del proyecto, no existía en Chile ninguna VAA activa con "
            "metodología transparente y datos actualizados.\n\n"
            "Voto Informado permitía comparar perfiles lado a lado pero sin producir "
            "un indicador de afinidad basado en las respuestas del usuario.\n\n"
            "Decide Chile fue la más cercana al concepto de VAA, pero estaba "
            "discontinuada y sin mantención.\n\n"
            "Internacionalmente, las VAAs consolidadas (Wahl-O-Mat, Smartvote, "
            "Vote Compass, iSideWith) no tenían cobertura del contexto chileno.\n\n"
            "La brecha era concreta y el espacio estaba abierto."
        )
    )

    # ── Slide 12 ── SEGMENTOS VULNERABLES ────────────────────────────────────
    light_slide(
        prs,
        title="¿Quiénes son más vulnerables?",
        accent_line="Tres segmentos identificados con mayor déficit informativo",
        body_lines=[
            " JÓVENES VOTANTES",
            "  Alta exposición a redes sociales · Bajo consumo de medios verificados",
            "  Mayor potencial de adopción de una solución tecnológica mobile-first",
            "",
            " ADULTOS MAYORES",
            "  Dificultad para evaluar confiabilidad en plataformas digitales",
            "  Alta exposición + menor capacidad de verificación independiente",
            "",
            " VOTANTES INDECISOS",
            "  Buscan información en el período previo inmediato a la elección",
            "  Momento de mayor flujo de contenido partidario y desinformativo",
        ],
        notes=(
            "Los tres segmentos comparten una necesidad común: acceso a información "
            "confiable, estructurada y procesable en un tiempo razonable.\n\n"
            "El diseño de VotoAFin debía ser accesible para los tres — sin conocimiento "
            "político previo necesario para interpretarlo.\n\n"
            "El joven es el perfil con mayor potencial de adopción de una solución "
            "tecnológica; el adulto mayor y el indeciso son los que más se beneficiarían "
            "de la reducción de carga cognitiva.\n\n"
            "Esta segmentación fue determinante en las decisiones de UX de la plataforma: "
            "simplificar, no complejizar. Orientar, no abrumar."
        )
    )

    # ── Slide 13 ── POR QUÉ MERECE SER RESUELTO ─────────────────────────────
    dark_text_slide(
        prs,
        title="¿Por qué el problema merece ser abordado desde la ingeniería?",
        highlight="Es un problema de intermediación, no de escasez.",
        body=(
            "Las posturas de los candidatos existen en el registro público.\n"
            "La información electoral primaria está disponible.\n"
            "El problema no es la ausencia de datos.\n\n"
            "El problema es la transformación:\n"
            "  Información bruta  →  Conocimiento accionable para el votante promedio.\n\n"
            "Este es exactamente el tipo de problema que la ingeniería de software puede resolver:\n"
            "  Acceso · Procesamiento · Presentación."
        ),
        notes=(
            "Este slide es el argumento de justificación técnica del proyecto.\n\n"
            "Un problema de 'escasez de información' requiere producir más información — "
            "eso es periodismo, no ingeniería.\n\n"
            "Un problema de 'intermediación' requiere un sistema que transforme "
            "la información existente en algo utilizable. Eso sí es ingeniería.\n\n"
            "Las posturas de los candidatos están en sus programas, sus votaciones "
            "parlamentarias registradas, sus declaraciones públicas. El problema es que "
            "el ciudadano promedio no tiene tiempo ni herramientas para procesar esa información.\n\n"
            "VotoAFin no produce información nueva: organiza, compara y presenta "
            "la información que ya existe."
        )
    )

    # ── Slide 14 ── OPORTUNIDAD ──────────────────────────────────────────────
    light_slide(
        prs,
        title="La oportunidad identificada",
        accent_line="\"Diseñar una herramienta que permita a los ciudadanos acceder a información confiable, clara y oportuna.\"",
        body_lines=[
            "La justificación emerge en 5 dimensiones:",
            "",
            "  1. Preservar la integridad de la democracia",
            "  2. Fomentar el voto informado",
            "  3. Fortalecer la confianza en las instituciones",
            "  4. Evitar impactos negativos en la participación electoral",
            "  5. Adaptarse a un entorno digital cambiante",
            "",
            "→ Un espacio vacante · Una necesidad real · Un problema abordable.",
        ],
        notes=(
            "Esta slide cierra el Acto I de la historia.\n\n"
            "La audiencia debe llegar a este punto pensando: 'Sí, este problema existe, "
            "está documentado, tiene consecuencias medibles, y la tecnología puede "
            "hacer algo al respecto.'\n\n"
            "Las 5 dimensiones de justificación vienen directamente del primer trabajo "
            "de Emprendimiento — no fueron construidas retroactivamente para la tesis.\n\n"
            "El cierre de esta slide prepara la transición a la Presentación 2: "
            "cómo evolucionó la respuesta desde esa oportunidad identificada."
        )
    )

    # ── Slide 15 ── CIERRE ───────────────────────────────────────────────────
    dark_cover(
        prs,
        title="Un problema real. Una brecha concreta. Una oportunidad verificada.",
        subtitle=(
            "Continuación → Presentación 2: La Evolución de la Idea\n"
            "Cómo una observación empírica se transformó en un sistema."
        ),
        label="Cierre — Presentación 1 de 4",
        notes=(
            "CIERRE de la presentación 1.\n\n"
            "Tiempo estimado: 10–13 minutos con buena cadencia.\n\n"
            "Mensaje de salida para la audiencia:\n"
            "- El problema está documentado con datos primarios y secundarios.\n"
            "- No es una percepción subjetiva: es un fenómeno medible.\n"
            "- Las herramientas existentes no lo resolvían.\n"
            "- La brecha estaba abierta.\n\n"
            "Pregunta para dejar en el aire antes de la siguiente presentación:\n"
            "'¿Y cuál fue la primera respuesta que intentamos darle?'\n\n"
            "Espacio para preguntas breves si el formato lo permite."
        )
    )

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("01_Problema_Investigacion_y_Contexto.pptx")
