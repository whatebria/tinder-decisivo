"""Preguntas ESPECIFICAS por tipo de eleccion + posturas por partido.

Complementa las 8 preguntas BASE (transversales). Cada tipo tiene 5 preguntas
tematizadas al nivel/rol:
- Presidencial: temas nacionales que solo el ejecutivo puede impulsar.
- Diputados: temas de agenda legislativa.

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
# Posturas ESPECIFICAS por partido, por tipo.
# Valores 1-5. None significa "usar fallback Independiente".
# ============================================================================
POSTURAS_ESPECIFICAS = {
    "Partido Comunista": {
        "presi": [5, 1, 2, 4, 2],  # Nueva Const SI, no EEUU, no Defensa, BCCh SI, TLC no
        "dip":   [5, 5, 2, 5, 4],  # Eutanasia SI, no reduccion Congreso, financ publico, humedales, familias
    },
    "Frente Amplio": {
        "presi": [5, 2, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 5],
    },
    "Convergencia Social": {
        "presi": [5, 2, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 5],
    },
    "Federacion Regionalista Verde": {
        "presi": [4, 3, 2, 4, 3],
        "dip":   [5, 4, 5, 5, 4],
    },
    "Partido Socialista": {
        "presi": [4, 3, 3, 5, 4],
        "dip":   [5, 3, 4, 4, 3],
    },
    "PPD": {
        "presi": [3, 3, 3, 5, 4],
        "dip":   [5, 3, 4, 4, 3],
    },
    "Partido Radical": {
        "presi": [3, 3, 3, 5, 4],
        "dip":   [4, 3, 4, 4, 3],
    },
    "Democracia Cristiana": {
        "presi": [3, 4, 3, 5, 4],
        "dip":   [2, 3, 4, 4, 2],
    },
    "Amarillos por Chile": {
        "presi": [2, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
    },
    "Democratas": {
        "presi": [2, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
    },
    "Independiente": {
        "presi": [3, 3, 3, 4, 3],
        "dip":   [3, 3, 3, 3, 3],
    },
    "Independiente Regional": {
        "presi": [3, 3, 3, 4, 3],
        "dip":   [3, 4, 3, 4, 3],
    },
    "Partido de la Gente": {
        "presi": [2, 3, 3, 3, 3],
        "dip":   [3, 5, 3, 3, 2],
    },
    "Evopoli": {
        "presi": [1, 4, 4, 5, 5],
        "dip":   [3, 4, 3, 3, 2],
    },
    "Renovacion Nacional": {
        "presi": [1, 4, 4, 5, 5],
        "dip":   [2, 4, 2, 3, 2],
    },
    "UDI": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [1, 5, 2, 2, 1],
    },
    "Partido Republicano": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [1, 5, 2, 2, 1],
    },
    "Partido Nacional Libertario": {
        "presi": [1, 5, 5, 5, 5],
        "dip":   [3, 5, 2, 2, 2],
    },
}
