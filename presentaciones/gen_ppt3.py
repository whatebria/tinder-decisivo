"""P3 -- Solucion, Diseno y Producto. Visual-first, sin parrafos en slides."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from gen_helpers import *


def build(out_path):
    prs = new_prs()

    # 1 -- PORTADA -----------------------------------------------------------
    dark_cover(prs,
        title="VotoAfin",
        subtitle="Una brujula para el votante.\nSolucion, diseno y propuesta de valor.",
        label="Presentacion 3 de 4  --  Solucion, Diseno y Producto",
        notes=(
            "APERTURA -- 15 a 20 minutos\n\n"
            "Esta presentacion responde tres preguntas:\n"
            "  1. ?Por que una VAA -- y no otra cosa -- es la respuesta correcta?\n"
            "  2. ?Que decisions de UX se tomaron y por que?\n"
            "  3. ?Que valor genera concretamente para el usuario?\n\n"
            "Esta presentacion puede usarse de manera independiente frente a audiencias\n"
            "de producto, UX, innovacion o emprendimiento."
        ))

    # 2 -- QUE ES UNA VAA ----------------------------------------------------
    flow_steps(prs,
        title="?Que es una Voting Advice Application?",
        steps=[
            ("1", "Preguntas sobre politica publica", "Economia, salud, medioambiente..."),
            ("2", "El usuario toma posicion", "Escala Likert: 5 puntos + 'No se'"),
            ("3", "Ponderacion opcional", "Que temas te importan mas?"),
            ("4", "Comparacion algoritmica", "Postura del usuario vs candidato"),
            ("5", "Ranking de afinidad", "% coincidencia + indicador de confianza"),
            ("6", "Explorar resultados", "Perfil, radar, fuentes verificadas"),
        ],
        notes=(
            "La VAA invierte el flujo tradicional:\n"
            "  -- NO muestra primero candidatos para que el usuario elija.\n"
            "  -- Muestra primero los TEMAS, captura preferencias, y LUEGO compara.\n\n"
            "Este orden es deliberado: reduce el peso de los sesgos de identificacion\n"
            "partidaria y favorece la evaluacion basada en posiciones programaticas.\n\n"
            "Clave: el resultado es un INSUMO para la decision, no la decision misma.\n"
            "VotoAfin no dice por quien votar. Dice con quien coincide mas."
        ))

    # 3 -- EL PROBLEMA EN NUMEROS --------------------------------------------
    stat_slide(prs,
        title="El problema que VotoAfin resuelve -- en numeros",
        stats=[
            ("79%", "no confia en\npoliticos como\nfuente de informacion", DANGER),
            ("42%", "indeciso sobre su\nvoto para el cargo\nmas conocido", AMBER),
            ("21%", "se considera\n'muy informado'\nantes de votar", PRILIT),
            ("5-10", "minutos para completar\nel cuestionario\nde VotoAfin", ACCENT),
        ],
        notes=(
            "El contraste entre el 42% indeciso (para el cargo de alcalde, el mas visible)\n"
            "y los 5-10 minutos de VotoAfin hace visible el valor de manera directa.\n\n"
            "La desconfianza en politicos (79%) hace relevante una herramienta que\n"
            "parte de las POSTURAS declaradas, no de la imagen del candidato.\n\n"
            "5-10 minutos es el argumento contra el desinteres:\n"
            "no requiere leer decenas de paginas. Es una inversion razonable."
        ))

    # -- PROPUESTA DE VALOR ------------------------------------------------
    section_break(prs, "V", "Propuesta de Valor",
        "5 dimensiones que diferencian a VotoAfin",
        notes=(
            "VotoAfin no es solo 'otra app de candidatos'.\n"
            "Tiene 5 dimensiones de diferenciacion respecto a lo que existia en Chile.\n"
            "Ninguna es 'mas features': todas son decisiones de diseno con razon explicita."
        ))

    # 5 -- 5 DIMENSIONES -----------------------------------------------------
    tight_bullets(prs,
        title="5 dimensiones que diferencian a VotoAfin",
        bullets=[
            "1. Transparencia: algoritmo publico, documentado y auditable",
            "2. Trazabilidad: cada postura necesita URL de fuente primaria",
            "3. Ponderacion: el usuario declara que temas le importan mas",
            "4. Confianza: indicador de certeza segun cobertura de respuestas",
            "5. Codigo abierto: AGPL-3.0 -- la tecnologia electoral no es una caja negra",
        ],
        notes=(
            "Cada dimension responde a una brecha identificada en el analisis comparativo.\n\n"
            "Dimension 1: ninguna VAA chilena anterior publicaba su algoritmo.\n"
            "Dimension 2: ninguna requeria fuentes verificables como requerimiento tecnico.\n"
            "Dimension 3: comun en VAAs internacionales, ausente en Chile.\n"
            "Dimension 4: UNICA entre todas las VAAs analizadas. Ni Wahl-O-Mat ni\n"
            "Smartvote ni Vote Compass incorporan indicador de confianza.\n"
            "Dimension 5: ninguna VAA del grupo internacional tiene codigo completamente\n"
            "abierto bajo licencia libre.\n\n"
            "VotoAfin es la primera VAA que combina las cinco dimensiones."
        ))

    # 6 -- PUBLICO OBJETIVO --------------------------------------------------
    three_cards(prs,
        title="A quien ayuda VotoAfin?",
        cards=[
            ("Jovenes Votantes",
             "Alta exposicion digital.\nBajo consumo de medios verificados.\n\n"
             "Mayor potencial de adopcion.\nDiseno mobile-first.\nExperiencia sin friccion.",
             EJE_SOC),
            ("Votantes Indecisos",
             "42% no decidido para alcalde.\n64% para gobernador.\n\n"
             "Buscan orientacion en el\nperiodo previo inmediato.\nResultado accionable en 10 min.",
             AMBER),
            ("Adultos Mayores",
             "Dificultad para evaluar\nfuentes digitales.\n\n"
             "Interfaz clara y simple.\nSin jerga politica necesaria.\nResultado comprensible.",
             DARK2),
        ],
        notes=(
            "Los tres segmentos comparten una necesidad comun:\n"
            "informacion confiable, procesable en tiempo razonable, sin conocimiento\n"
            "politico previo necesario para interpretarla.\n\n"
            "El diseno mobile-first responde al perfil del joven votante.\n\n"
            "La claridad del resultado y el indicador de confianza responden al\n"
            "perfil del votante indeciso que busca informacion en el ultimo momento."
        ))

    # -- EXPERIENCIA DEL USUARIO -------------------------------------------
    section_break(prs, "UX", "Experiencia del Usuario",
        "Del ingreso al resultado en 7 pasos",
        notes=(
            "Una VAA puede tener el mejor algoritmo del mundo,\n"
            "pero si el flujo de usuario genera abandono, el impacto es cero.\n\n"
            "El diseno de experiencia de VotoAfin fue guiado por un principio central:\n"
            "el camino mas corto posible desde el ingreso hasta un resultado util."
        ))

    # 8 -- FLUJO DE 7 PASOS -------------------------------------------------
    flow_steps(prs,
        title="Flujo de usuario -- 7 pasos del ingreso al resultado",
        steps=[
            ("1", "Registro", "Solo usuario + email. Sin RUT ni Clave Unica."),
            ("2", "Seleccionar eleccion", "Presidencial, parlamentaria, municipal..."),
            ("3", "Cuestionario", "12 preguntas. 5 pts Likert + 'No se'"),
            ("4", "Ponderacion", "Que temas te importan mas? (opcional)"),
            ("5", "Resultados", "Ranking con % y nivel de confianza"),
            ("6", "Explorar candidato", "Radar 7 ejes + posturas + fuentes"),
            ("7", "Guardar y comparar", "Favoritos, descartados, comparacion"),
        ],
        notes=(
            "Decisiones clave de UX en este flujo:\n\n"
            "Paso 1 -- Sin RUT ni Clave Unica:\n"
            "Reduce la friccion de onboarding vs la hipotesis original de Emprendimiento II.\n\n"
            "Paso 4 -- Ponderacion OPCIONAL:\n"
            "El usuario puede completar el cuestionario sin ponderar y obtener un resultado util.\n\n"
            "Paso 5 -- Resultado antes de explorar perfiles:\n"
            "Invierte el flujo tradicional. Primero la coincidencia; luego los candidatos.\n\n"
            "Paso 6 -- Modal de contexto educativo por pregunta:\n"
            "Permite tomar posicion sin conocimiento politico previo."
        ))

    # 9 -- LA HOME -----------------------------------------------------------
    tight_bullets(prs,
        title="La Home -- punto de entrada a la decision",
        bullets=[
            "Eleccion activa destacada con fecha y tipo",
            "Acceso rapido al cuestionario (CTA principal)",
            "Estado de progreso si ya inicio el cuestionario",
            "Resumen de resultados si ya lo completo",
            "Navegacion: Resultados, Candidatos, Guardados",
        ],
        dark=True,
        notes=(
            "La Home no es una pantalla de exploracion: es una pantalla de ORIENTACION.\n\n"
            "El principio de diseno: el usuario siempre debe saber que hacer a continuacion.\n\n"
            "Si no ha respondido: el CTA principal lo lleva al cuestionario.\n"
            "Si ya respondio: ve el resumen de sus resultados directamente.\n\n"
            "La navegacion esta presente pero no es el foco principal.\n"
            "El foco es siempre el flujo central: cuestionario -> resultados."
        ))

    # 10 -- EL CUESTIONARIO --------------------------------------------------
    tight_bullets(prs,
        title="El cuestionario -- el corazon del sistema",
        bullets=[
            "12 preguntas sobre politica publica en 7 ejes tematicos",
            "Escala Likert de 5 puntos + opcion 'No se' (excluye del calculo)",
            "Ponderacion opcional: 4 niveles de importancia por pregunta",
            "Modal de contexto educativo por pregunta (5 dimensiones, lenguaje neutral)",
            "Tiempo estimado: 5 a 10 minutos",
        ],
        notes=(
            "El cuestionario es un balance deliberado:\n"
            "  -- Calidad del resultado (mas preguntas = resultado mas preciso)\n"
            "  -- Tasa de completitud (mas preguntas = mas abandono)\n\n"
            "La opcion 'No se' es mas que una comodidad:\n"
            "  -- Respuesta NEUTRAL: el usuario tiene posicion intermedia.\n"
            "  -- Respuesta 'No se': el usuario no tiene informacion suficiente.\n"
            "  -- Tratarlas como equivalentes introduciria ruido en el calculo.\n\n"
            "El modal educativo permite que un ciudadano sin conocimiento politico\n"
            "tome posicion informada en cada pregunta."
        ))

    # 11 -- LOS 7 EJES -------------------------------------------------------
    three_cards(prs,
        title="Los 7 ejes tematicos del cuestionario",
        cards=[
            ("Ejes 1-3",
             "Economia\n  (crecimiento, salario, impuestos)\n\n"
             "Sociedad\n  (salud, educacion, vivienda)\n\n"
             "Ambiente\n  (clima, recursos naturales)",
             EJE_ECO),
            ("Ejes 4-5",
             "Seguridad\n  (crimen, policia, fronteras)\n\n"
             "Derechos Humanos\n  (genero, diversidad, migracion)",
             EJE_SEG),
            ("Ejes 6-7",
             "Internacional\n  (politica exterior, comercio)\n\n"
             "Institucional\n  (democracia, transparencia, descentralizacion)",
             EJE_INST),
        ],
        notes=(
            "Los 7 ejes tematicos cubren las dimensiones centrales del debate publico chileno.\n\n"
            "Cada eje tiene color invariante en el sistema visual (Capa E del Design System):\n"
            "ningun color puede cambiar sin romper la semantica de la visualizacion.\n\n"
            "El radar de 7 ejes en los resultados permite al usuario ver no solo\n"
            "'con quien coincide mas' sino 'en que temas especificos coincide mas'.\n\n"
            "Esto es especialmente util para el votante que tiene prioridades especificas."
        ))

    # 12 -- LOS RESULTADOS ---------------------------------------------------
    tight_bullets(prs,
        title="La pantalla de resultados -- lo que ve el usuario",
        bullets=[
            "Ranking de candidatos ordenado por % de coincidencia global",
            "Indicador de confianza: ALTA / MEDIA / BAJA segun cobertura",
            "Radar de 7 ejes: coincidencia visual por dimension tematica",
            "Acciones: guardar favorito / descartar del ranking",
            "Acceso al detalle completo de cada candidato",
        ],
        notes=(
            "El resultado no es un numero: es un SISTEMA DE INFORMACION.\n\n"
            "El radar de 7 ejes permite ver no solo 'con quien coincide mas'\n"
            "sino 'en que temas especificos coincide'.\n\n"
            "El indicador de confianza es la diferenciacion mas significativa:\n"
            "comunica la diferencia entre un match calculado sobre 3 preguntas (tentat.)\n"
            "y uno calculado sobre 12 (alta confianza).\n\n"
            "Esta honestidad protege la credibilidad del sistema a largo plazo."
        ))

    # 13 -- PERFIL DEL CANDIDATO ---------------------------------------------
    tight_bullets(prs,
        title="Perfil del candidato -- transparencia total",
        bullets=[
            "Postura en cada pregunta con justificacion textual",
            "URL de fuente primaria verificable por cada postura",
            "Nivel de confianza de la postura: ALTA / MEDIA / BAJA",
            "Radar de afinidad personal vs posiciones del candidato",
            "Noticias recientes asociadas al candidato",
        ],
        notes=(
            "El perfil del candidato es donde la transparencia se hace concreta.\n\n"
            "El usuario puede ver:\n"
            "  -- No solo CUAL es la postura, sino POR QUE se asigno esa postura.\n"
            "  -- La fuente primaria que la respalda (declaracion, votacion, programa).\n"
            "  -- Si hay incertidumbre sobre la postura, el sistema lo dice.\n\n"
            "Este nivel de trazabilidad no existe en ninguna VAA chilena anterior\n"
            "ni en la mayoria de las VAAs internacionales analizadas.\n\n"
            "El principio: si hay incertidumbre, se muestra la incertidumbre.\n"
            "No se simula certeza que no existe."
        ))

    # 14 -- COMPARACION DE CANDIDATOS ----------------------------------------
    tight_bullets(prs,
        title="Comparacion de candidatos -- decidir con informacion",
        bullets=[
            "Vista lado a lado de dos candidatos del ranking",
            "Comparacion pregunta por pregunta: posturas y fuentes",
            "Diferencias destacadas visualmente por eje tematico",
            "Afinidad relativa: quien coincide mas en que dimension",
            "Acceso a guardar, descartar o explorar desde la vista comparativa",
        ],
        notes=(
            "La funcionalidad de comparacion responde a un patron de uso comun:\n"
            "el votante ya tiene un candidato preferido pero quiere compararlo\n"
            "con el segundo del ranking antes de decidir.\n\n"
            "La comparacion pregunta por pregunta con fuentes hace que el usuario\n"
            "no solo sepa que los candidatos difieren, sino POR QUE difieren.\n\n"
            "Esta funcionalidad transforma VotoAfin de un sistema de ranking\n"
            "a un sistema de exploracion informada."
        ))

    # -- IDENTIDAD VISUAL --------------------------------------------------
    section_break(prs, "DS", "Sistema Visual",
        "Confianza institucional sin tomar partido politico",
        notes=(
            "El diseno no es decoracion: es parte del mensaje.\n\n"
            "VotoAfin necesitaba transmitir credibilidad y neutralidad politica\n"
            "simultaneamente. Esa combinacion requirio decisiones especificas."
        ))

    # 16 -- PALETA DE COLORES ------------------------------------------------
    tight_bullets(prs,
        title="Sistema de color -- 6 capas con ownership exclusivo",
        bullets=[
            "A. Marca: hero #1C3A52 / primary #2E5F7E / accent #3A9E7A",
            "B. Semantica: success / warning / danger (estados y badges)",
            "C. Superficie: #F7F8F7 fondos claros, cards, inputs",
            "D. Datos: series para radar y comparador (invariantes)",
            "E. Ejes: 7 colores semanticos por eje tematico (invariantes)",
            "F. Premium: violeta #7C5C9E para funcionalidades avanzadas",
        ],
        notes=(
            "Restriccion critica: ningun color puede asociarse con ningun partido politico chileno.\n"
            "  -- Azul-petroleo (#1C3A52): suficientemente distinto del azul de RN/Chile Vamos.\n"
            "  -- Verde-salvia (#7BA098): diferente del verde del Frente Amplio.\n"
            "  -- Verde acento (#3A9E7A): tampoco es el verde del FA.\n\n"
            "6 capas independientes: un cambio de branding no rompe los ejes\n"
            "ni la visualizacion de datos. Esto es diseno sistematico, no decoracion.\n\n"
            "Todos los pares cumplen contraste WCAG 2.2 AA (4.5:1 minimo)."
        ))

    # 17 -- FILOSOFIA VISUAL -------------------------------------------------
    three_cards(prs,
        title="Tres principios del sistema visual",
        cards=[
            ("Credibilidad\ny Neutralidad",
             "Paleta desaturada.\nSin gimmicks visuales.\n\n"
             "Ningun color evoca\nun partido politico chileno.\n\n"
             "El usuario debe confiar\nen el instrumento.",
             PRIMARY),
            ("Claridad\ny Confianza",
             "Un dato, un color, un rol.\nSin ambiguedad semantica.\n\n"
             "WCAG 2.2 AA en todos\nlos pares de colores.\nDark mode correcto.",
             ACCENT),
            ("Modernidad\ny Escalabilidad",
             "Hero oscuro, accent energetico.\nTipografia bold.\n\n"
             "6 capas independientes.\nRebrandable sin\nromper la visualizacion.",
             DARK2),
        ],
        notes=(
            "El sistema visual fue documentado en 11 modulos (ds-01 a ds-11):\n"
            "filosofia, psicologia, benchmarking, color, dark mode, ejes, dataviz,\n"
            "tiers de afinidad, componentes, tokens y validacion por pantalla.\n\n"
            "Esta profundidad de documentacion permite mantener consistencia visual\n"
            "en 17 pantallas y 89 componentes reutilizables.\n\n"
            "El sistema debe sentirse como:\n"
            "  Una guia. Una brujula. Una herramienta de orientacion.\n"
            "NO como:\n"
            "  Un partido politico. Una campana electoral. Una institucion gubernamental."
        ))

    # 18 -- BENEFICIOS AL USUARIO --------------------------------------------
    before_after(prs,
        title="Que gana el usuario con VotoAfin?",
        left_title="ANTES de VotoAfin",
        left_items=[
            "Leer programas extensos de cada candidato",
            "Buscar comparativas inexistentes o desactualizadas",
            "Navegar redes con 81% de desinformacion",
            "Votar sin informacion (42% indeciso para alcalde)",
        ],
        right_title="DESPUES de VotoAfin",
        right_items=[
            "12 preguntas en 5-10 minutos",
            "Ranking verificado con fuentes primarias",
            "Radar de coincidencia por 7 ejes tematicos",
            "Decision mas informada sin ser experto en politica",
        ],
        left_col=DANGER, right_col=ACCENT,
        notes=(
            "Este slide hace concreto el valor para el usuario final.\n\n"
            "El contraste antes/despues conecta directamente con los datos del\n"
            "problema presentados en la Presentacion 1.\n\n"
            "El tiempo (5-10 minutos) es el argumento contra el desinteres:\n"
            "no es necesario leer decenas de paginas. Es una inversion razonable\n"
            "para un acto democratico que ocurre una vez cada cuatro anos."
        ))

    # 19 -- CIERRE P3 --------------------------------------------------------
    dark_cover(prs,
        title="Una brujula, no una agenda.",
        subtitle="Continuacion -> P4: Como se construyo y que aprendimos.",
        label="Cierre -- Presentacion 3 de 4",
        notes=(
            "CIERRE -- Tiempo estimado: 15-18 minutos.\n\n"
            "La frase 'Una brujula, no una agenda' sintetiza el posicionamiento:\n"
            "  -- VotoAfin orienta. No prescribe.\n"
            "  -- VotoAfin compara. No recomienda.\n"
            "  -- VotoAfin informa. No decide.\n\n"
            "El usuario conserva completamente la autonomia de su decision.\n"
            "VotoAfin solo hace esa decision mas informada."
        ))

    prs.save(out_path)
    print(f"[OK] {out_path}")


if __name__ == "__main__":
    build("03_Solucion_Diseno_y_Producto.pptx")
