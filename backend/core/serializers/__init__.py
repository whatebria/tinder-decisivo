"""Serializers de DRF organizados por dominio.

Misma logica de split que views/ y models/: agrupamos por dominio
funcional y re-exportamos aca para preservar el API
`from core.serializers import X`.
"""

from .auth import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserSerializer,
)
from .bookmarking import (
    CandidatoDescartadoSerializer,
    CandidatoFavoritoSerializer,
    NoticiaBookmarkSerializer,
    PosturaBookmarkSerializer,
)
from .catalog import (
    CandidatoSerializer,
    EjeSerializer,
    OpcionRespuestaSerializer,
    PreguntaSerializer,
    TipoEleccionSerializer,
)
from .cuestionario import (
    RespuestaUsuarioCreateSerializer,
    RespuestaUsuarioReadSerializer,
)
from .matching import (
    AnonMatchResultSerializer,
    MatchCandidatoResultSerializer,
    PosturaCandidatoSerializer,
)
from .noticias import NoticiaSerializer
from .perfil import (
    ActualizarComunaSerializer,
    CambiarPasswordSerializer,
    ComunaInlineSerializer,
    EliminarCuentaSerializer,
    PerfilSerializer,
)

__all__ = [
    "ActualizarComunaSerializer",
    "AnonMatchResultSerializer",
    "CambiarPasswordSerializer",
    "CandidatoDescartadoSerializer",
    "CandidatoFavoritoSerializer",
    "CandidatoSerializer",
    "ComunaInlineSerializer",
    "EliminarCuentaSerializer",
    "EjeSerializer",
    "MatchCandidatoResultSerializer",
    "NoticiaBookmarkSerializer",
    "NoticiaSerializer",
    "OpcionRespuestaSerializer",
    "PasswordResetConfirmSerializer",
    "PasswordResetRequestSerializer",
    "PerfilSerializer",
    "PosturaBookmarkSerializer",
    "PosturaCandidatoSerializer",
    "PreguntaSerializer",
    "RespuestaUsuarioCreateSerializer",
    "RespuestaUsuarioReadSerializer",
    "TipoEleccionSerializer",
    "UserSerializer",
]
