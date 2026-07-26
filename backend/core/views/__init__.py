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
)
from .catalog import (
    CandidatoDetailView,
    CandidatoListView,
    TipoEleccionListView,
)
from .cuestionario import PreguntasPendientesView, SubmitUserAnswersView
from .matching import MatchCandidatoViewSet
from .noticias import (
    CandidatoNoticiasView,
    NoticiaDetailView,
    NoticiaListCreateView,
)

__all__ = [
    "CandidatoDescartadoViewSet",
    "CandidatoDetailView",
    "CandidatoFavoritoViewSet",
    "CandidatoListView",
    "CandidatoNoticiasView",
    "CustomAuthToken",
    "DecisionFinalViewSet",
    "MatchCandidatoViewSet",
    "NoticiaDetailView",
    "NoticiaListCreateView",
    "PasswordResetConfirmView",
    "PasswordResetRequestView",
    "PreguntasPendientesView",
    "RegisterUserView",
    "SubmitUserAnswersView",
    "TipoEleccionListView",
]
