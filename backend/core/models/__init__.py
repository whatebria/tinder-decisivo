"""Modelos de dominio de Servel.

Organizacion por dominio funcional:
- electoral   -> catalogo electoral (tipos de eleccion, candidatos)
- cuestionario -> preguntas, opciones, respuestas del usuario
- matching    -> posturas de candidatos + resultado del match
- user_data   -> bookmarking del usuario (favoritos, descartados, decision final)
- content     -> contenido asociado (noticias)

Re-exportamos todos los nombres publicos aca para preservar el API
`from core.models import X` que ya usan views, serializers, admin, tests
y management commands.

Nota Django: para que autodescubra los modelos, es suficiente con que
esten importados en el modulo `models` de la app. Esto lo cumple este
__init__.py.
"""

from .auth import PasswordResetToken
from .content import Noticia
from .cuestionario import (
    OPCION_DE_ACUERDO,
    OPCION_EN_DESACUERDO,
    OPCION_MUY_DE_ACUERDO,
    OPCION_MUY_EN_DESACUERDO,
    OPCION_NEUTRAL,
    OPCIONES_ACUERDO_DESACUERDO,
    OpcionRespuesta,
    Pregunta,
    RespuestaUsuario,
    crear_opciones_acuerdo_desacuerdo,
)
from .eje import Eje
from .electoral import Candidato, TipoEleccion
from .matching import MatchCandidato, PosturaCandidato
from .perfil import UserProfile
from .territorio import Comuna, Distrito, Region
from .user_data import (
    CandidatoDescartado,
    CandidatoFavorito,
    DecisionFinal,
    NoticiaBookmark,
    PosturaBookmark,
)

__all__ = [
    "OPCIONES_ACUERDO_DESACUERDO",
    "OPCION_DE_ACUERDO",
    "OPCION_EN_DESACUERDO",
    "OPCION_MUY_DE_ACUERDO",
    "OPCION_MUY_EN_DESACUERDO",
    "OPCION_NEUTRAL",
    "Candidato",
    "CandidatoDescartado",
    "CandidatoFavorito",
    "Comuna",
    "DecisionFinal",
    "Distrito",
    "Eje",
    "MatchCandidato",
    "Noticia",
    "NoticiaBookmark",
    "OpcionRespuesta",
    "PasswordResetToken",
    "PosturaBookmark",
    "PosturaCandidato",
    "Pregunta",
    "Region",
    "RespuestaUsuario",
    "TipoEleccion",
    "UserProfile",
    "crear_opciones_acuerdo_desacuerdo",
]
