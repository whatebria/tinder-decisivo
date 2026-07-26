"""API views agrupadas por dominio.

Re-exportamos todos los nombres publicos aca para no romper `core/urls.py`
ni imports externos. Cada submodulo maneja un area funcional distinta.
"""

from .auth import (
    CustomAuthToken,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterUserView,
)
from .bookmarking import (
    CandidatoDescartadoViewSet,
    CandidatoFavoritoViewSet,
    DecisionFinalViewSet,
    NoticiaBookmarkViewSet,
    PosturaBookmarkViewSet,
)
from .catalog import (
    CandidatoDetailView,
    CandidatoListView,
    CandidatoPosturasView,
    TipoEleccionListView,
)
from .cuestionario import (
    EditarRespuestaView,
    MisRespuestasListView,
    PreguntasPendientesView,
    ReiniciarCuestionarioView,
    SubmitUserAnswersView,
)
from .matching import CandidatoMatchDetalleView, MatchCandidatoViewSet
from .noticias import (
    CandidatoNoticiasView,
    NoticiaDetailView,
    NoticiaListCreateView,
)
from .perfil import CambiarPasswordView, PerfilView

__all__ = [
    "CandidatoDescartadoViewSet",
    "CandidatoDetailView",
    "CandidatoFavoritoViewSet",
    "CandidatoListView",
    "CandidatoMatchDetalleView",
    "CandidatoNoticiasView",
    "CandidatoPosturasView",
    "CambiarPasswordView",
    "CustomAuthToken",
    "DecisionFinalViewSet",
    "EditarRespuestaView",
    "MatchCandidatoViewSet",
    "MisRespuestasListView",
    "NoticiaBookmarkViewSet",
    "NoticiaDetailView",
    "NoticiaListCreateView",
    "PasswordResetConfirmView",
    "PasswordResetRequestView",
    "PerfilView",
    "PosturaBookmarkViewSet",
    "PreguntasPendientesView",
    "RegisterUserView",
    "ReiniciarCuestionarioView",
    "SubmitUserAnswersView",
    "TipoEleccionListView",
]
