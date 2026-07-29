"""API views agrupadas por dominio.

Re-exportamos todos los nombres publicos aca para no romper `core/urls.py`
ni imports externos. Cada submodulo maneja un area funcional distinta.
"""

from .auth import (
    CustomAuthToken,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterUserView,
)
from .bookmarking import (
    CandidatoDescartadoViewSet,
    CandidatoFavoritoViewSet,
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
from .mi_progreso import MiProgresoView
from .noticias import (
    CandidatoNoticiasView,
    NoticiaDetailView,
    NoticiaListCreateView,
)
from .eje import EjeListView
from .perfil import ActualizarComunaView, CambiarPasswordView, PerfilView
from .unidad_territorial import UnidadTerritorialListView
from .territorio import ComunaListView, RegionListView

__all__ = [
    "ActualizarComunaView",
    "CandidatoDescartadoViewSet",
    "CandidatoDetailView",
    "CandidatoFavoritoViewSet",
    "CandidatoListView",
    "CandidatoMatchDetalleView",
    "CandidatoNoticiasView",
    "CandidatoPosturasView",
    "CambiarPasswordView",
    "ComunaListView",
    "CustomAuthToken",
    "EjeListView",
    "UnidadTerritorialListView",
    "EditarRespuestaView",
    "LogoutView",
    "MatchCandidatoViewSet",
    "MiProgresoView",
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
    "RegionListView",
    "ReiniciarCuestionarioView",
    "SubmitUserAnswersView",
    "TipoEleccionListView",
]
