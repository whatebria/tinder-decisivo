"""Preguntas ESPECIFICAS por tipo de eleccion + posturas por partido.

Complementa las 8 preguntas BASE (transversales). Cada tipo tiene 5 preguntas
tematizadas al nivel/rol:
- Presidencial: temas nacionales que solo el ejecutivo puede impulsar.
- Diputados: temas de agenda legislativa.
- Alcaldes: temas de gestion municipal.

Cada partido tiene un mapping de posturas para cada set de preguntas.
Los partidos no listados usan las posturas de "Independiente" como fallback.
"""

from core.models import Pregunta

# ============================================================================
# PRESIDENCIAL 2025 - 5 preguntas
# ============================================================================
PREGUNTAS_PRESI_2025 = [
    {
        "texto": "Chile debe impulsar una nueva Constitucion en los proximos anos.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Tras el rechazo de las dos propuestas constitucionales (2022 y 2023), "
            "queda abierto el debate sobre si insistir con un tercer proceso o "
            "gobernar con la Constitucion vigente."
        ),
        "repercusiones": {
            "institucional": "Cambia las reglas del juego politico.",
            "social": "Impacta derechos sociales garantizados.",
            "economico": "Requiere estabilidad para atraer inversion.",
        },
    },
    {
        "texto": "Chile debe priorizar sus relaciones comerciales con Estados Unidos por sobre China.",
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "China es el principal socio comercial de Chile, pero EE.UU. presiona "
            "por alineamiento geopolitico frente al avance chino en Latinoamerica."
        ),
        "repercusiones": {
            "economico": "China compra el 40%% del cobre chileno.",
            "institucional": "Alineamiento geopolitico y tratados bilaterales.",
        },
    },
    {
        "texto": "El gasto en Defensa y Fuerzas Armadas debe aumentar significativamente.",
        "eje": Pregunta.EJE_SEGURIDAD,
        "explicacion": (
            "Debate sobre modernizacion militar, presencia en frontera norte y "
            "capacidades de defensa nacional en un contexto regional tenso."
        ),
        "repercusiones": {
            "economico": "Compite con gasto social y educacion.",
            "institucional": "Rol de las FF.AA. en la democracia.",
        },
    },
    {
        "texto": "El Banco Central debe mantener autonomia total del gobierno, incluso en crisis.",
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Tension entre autonomia del BCCh para controlar inflacion vs "
            "presion politica por politica monetaria expansiva en momentos duros."
        ),
        "repercusiones": {
            "economico": "Confianza de mercados e inflacion.",
            "institucional": "Separacion de poderes tecnicos.",
        },
    },
    {
        "texto": "Chile debe firmar activamente nuevos tratados de libre comercio internacionales.",
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Chile tiene TLC con mas de 60 economias. Discusion sobre si "
            "profundizar apertura o proteger sectores locales (agricultura, industria)."
        ),
        "repercusiones": {
            "economico": "Acceso a mercados vs proteccion productiva.",
            "social": "Impacto en pequeno productor local.",
        },
    },
]

# ============================================================================
# DIPUTADOS 2025 - 5 preguntas
# ============================================================================
PREGUNTAS_DIP_2025 = [
    {
        "texto": "Se debe legislar la eutanasia y muerte digna asistida.",
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "El proyecto lleva anos en discusion en el Congreso. Debate sobre "
            "autonomia individual, rol del Estado en decisiones al final de la vida "
            "y objeciones religiosas."
        ),
        "repercusiones": {
            "social": "Autonomia sobre el propio cuerpo.",
            "cultural": "Tension con posiciones religiosas.",
        },
    },
    {
        "texto": "Se debe reducir el numero de diputados y senadores para bajar el costo del Congreso.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Populista pero recurrente. Reduccion de dietas parlamentarias y "
            "cantidad de escanos. En tension con representacion territorial adecuada."
        ),
        "repercusiones": {
            "institucional": "Menos representantes = mas concentracion de poder.",
            "economico": "Ahorro fiscal marginal.",
        },
    },
    {
        "texto": "El financiamiento de partidos politicos debe ser exclusivamente publico.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Post-caso Penta/SQM se limito el aporte privado. Discusion sobre "
            "si extenderlo a 100%% publico o permitir donaciones acotadas de personas."
        ),
        "repercusiones": {
            "institucional": "Reduce influencia empresarial en politica.",
            "economico": "Aumenta gasto del Estado en democracia.",
        },
    },
    {
        "texto": "Se debe aprobar la ley de proteccion de humedales urbanos y biodiversidad.",
        "eje": Pregunta.EJE_AMBIENTE,
        "explicacion": (
            "Chile ya tiene ley de humedales urbanos (2020), pero sigue en debate "
            "extender proteccion, restringir permisos inmobiliarios y penalizar dano ambiental."
        ),
        "repercusiones": {
            "ambiental": "Preserva ecosistemas urbanos claves.",
            "economico": "Restringe desarrollo inmobiliario.",
        },
    },
    {
        "texto": "Se debe legislar el reconocimiento legal de familias no tradicionales (poliamor, elegidas).",
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "Debate emergente sobre reconocimiento de estructuras familiares "
            "diversas mas alla del matrimonio biparental (heterosexual u homosexual)."
        ),
        "repercusiones": {
            "social": "Derechos hereditarios y de proteccion social.",
            "cultural": "Choque con visiones tradicionales de familia.",
        },
    },
]

# ============================================================================
# ALCALDES 2024 - 5 preguntas
# ============================================================================
PREGUNTAS_ALC_2024 = [
    {
        "texto": "La comuna debe instalar mas camaras de vigilancia en el espacio publico.",
        "eje": Pregunta.EJE_SEGURIDAD,
        "explicacion": (
            "Debate entre seguridad y privacidad ciudadana. Efectividad real "
            "cuestionada pero muy demandado electoralmente."
        ),
        "repercusiones": {
            "social": "Sensacion de seguridad vs privacidad.",
            "economico": "Gasto municipal significativo.",
        },
    },
    {
        "texto": "La comuna debe priorizar ciclovias y transporte no motorizado por sobre estacionamientos.",
        "eje": Pregunta.EJE_AMBIENTE,
        "explicacion": (
            "Movilidad sustentable vs cultura del auto. Impacta uso del espacio "
            "publico, contaminacion y estilo de vida barrial."
        ),
        "repercusiones": {
            "ambiental": "Reduce emisiones locales.",
            "social": "Cambio cultural en habitos de transporte.",
        },
    },
    {
        "texto": "La comuna debe restringir permisos de construccion en zonas de alta densidad.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "'Guettos verticales' vs necesidad de vivienda. Ordenamiento territorial "
            "que balancea desarrollo economico y calidad de vida barrial."
        ),
        "repercusiones": {
            "economico": "Afecta industria inmobiliaria y precios.",
            "social": "Preserva o degrada tejido barrial.",
        },
    },
    {
        "texto": "La comuna debe aumentar presupuesto para programas sociales (adultos mayores, infancia).",
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "Trade-off entre presupuesto en programas sociales vs infraestructura, "
            "seguridad u obras publicas. Prioridad valorativa del municipio."
        ),
        "repercusiones": {
            "social": "Impacto directo en grupos vulnerables.",
            "economico": "Compite con otros gastos municipales.",
        },
    },
    {
        "texto": "La comuna debe implementar teletrabajo permanente para sus funcionarios municipales.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Modernizacion de la gestion publica local. Balance entre eficiencia, "
            "atencion presencial al vecino y bienestar del funcionariado."
        ),
        "repercusiones": {
            "social": "Calidad de atencion municipal al vecino.",
            "institucional": "Modernizacion vs cercania.",
        },
    },
]

# ============================================================================
# Posturas ESPECIFICAS por partido, por tipo.
# Valores 1-5. None significa "usar fallback Independiente".
# ============================================================================
POSTURAS_ESPECIFICAS = {
    "Partido Comunista": {
        "presi": [5, 1, 2, 4, 2],  # Nueva Const SI, no EEUU, no Defensa, BCCh SI, TLC no
        "dip":   [5, 5, 2, 5, 4],  # Eutanasia SI, no reduccion Congreso, financ publico, humedales, familias
        "alc":   [3, 5, 5, 5, 3],  # No mas camaras, ciclovias, restringir construccion, social, teletrabajo
    },
    "Frente Amplio": {
        "presi": [5, 2, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 5],
        "alc":   [3, 5, 4, 5, 4],
    },
    "Convergencia Social": {
        "presi": [5, 2, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 5],
        "alc":   [3, 5, 4, 5, 4],
    },
    "Federacion Regionalista Verde": {
        "presi": [4, 3, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 4],
        "alc":   [3, 5, 5, 5, 4],
    },
    "Partido Socialista": {
        "presi": [4, 3, 3, 5, 4],
        "dip":   [5, 3, 4, 4, 3],
        "alc":   [4, 4, 3, 4, 3],
    },
    "PPD": {
        "presi": [3, 3, 3, 5, 4],
        "dip":   [5, 3, 4, 4, 3],
        "alc":   [4, 4, 3, 4, 3],
    },
    "Partido Radical": {
        "presi": [3, 3, 3, 5, 4],
        "dip":   [4, 3, 4, 4, 3],
        "alc":   [4, 4, 3, 4, 3],
    },
    "Democracia Cristiana": {
        "presi": [3, 4, 3, 5, 4],
        "dip":   [2, 3, 4, 4, 2],
        "alc":   [4, 3, 3, 4, 3],
    },
    "Amarillos por Chile": {
        "presi": [2, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
        "alc":   [4, 3, 3, 3, 3],
    },
    "Democratas": {
        "presi": [2, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
        "alc":   [4, 3, 3, 3, 3],
    },
    "Independiente": {
        "presi": [3, 3, 3, 4, 3],
        "dip":   [3, 3, 3, 3, 3],
        "alc":   [3, 3, 3, 3, 3],
    },
    "Independiente Regional": {
        "presi": [3, 3, 3, 4, 3],
        "dip":   [3, 4, 3, 4, 3],
        "alc":   [3, 4, 4, 4, 3],
    },
    "Partido de la Gente": {
        "presi": [2, 3, 3, 3, 3],
        "dip":   [3, 5, 3, 3, 2],
        "alc":   [5, 3, 3, 3, 4],
    },
    "Evopoli": {
        "presi": [1, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
        "alc":   [4, 3, 2, 3, 4],
    },
    "Renovacion Nacional": {
        "presi": [1, 4, 4, 5, 5],
        "dip":   [2, 4, 2, 3, 2],
        "alc":   [5, 2, 2, 3, 3],
    },
    "UDI": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [1, 5, 2, 2, 1],
        "alc":   [5, 2, 2, 2, 3],
    },
    "Partido Republicano": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [1, 5, 2, 2, 1],
        "alc":   [5, 2, 2, 2, 2],
    },
    "Partido Nacional Libertario": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [3, 5, 2, 2, 2],
        "alc":   [5, 2, 2, 2, 2],
    },
}
