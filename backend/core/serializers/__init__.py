"""Serializers de DRF organizados por dominio.

Misma logica de split que views/ y models/: agrupamos por dominio
funcional y re-exportamos aca para preservar el API
`from core.serializers import X`.
"""

from .auth import UserSerializer
from .bookmarking import (
    CandidatoDescartadoSerializer,
    CandidatoFavoritoSerializer,
    DecisionFinalSerializer,
)
from .catalog import (
    CandidatoSerializer,
    OpcionRespuestaSerializer,
    PreguntaSerializer,
    TipoEleccionSerializer,
)
from .cuestionario import (
    RespuestaUsuarioCreateSerializer,
    RespuestaUsuarioReadSerializer,
)
from .matching import MatchCandidatoResultSerializer, PosturaCandidatoSerializer
from .noticias import NoticiaSerializer

__all__ = [
    "CandidatoDescartadoSerializer",
    "CandidatoFavoritoSerializer",
    "CandidatoSerializer",
    "DecisionFinalSerializer",
    "MatchCandidatoResultSerializer",
    "NoticiaSerializer",
    "OpcionRespuestaSerializer",
    "PosturaCandidatoSerializer",
    "PreguntaSerializer",
    "RespuestaUsuarioCreateSerializer",
    "RespuestaUsuarioReadSerializer",
    "TipoEleccionSerializer",
    "UserSerializer",
]
