from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActualizarComunaView,
    CambiarPasswordView,
    CandidatoDescartadoViewSet,
    CandidatoDetailView,
    CandidatoFavoritoViewSet,
    CandidatoListView,
    CandidatoMatchDetalleView,
    CandidatoNoticiasView,
    CandidatoPosturasView,
    ComunaListView,
    CustomAuthToken,
    DecisionFinalViewSet,
    EditarRespuestaView,
    EjeListView,
    UnidadTerritorialListView,
    MatchCandidatoViewSet,
    MisRespuestasListView,
    NoticiaBookmarkViewSet,
    NoticiaDetailView,
    NoticiaListCreateView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PerfilView,
    PosturaBookmarkViewSet,
    PreguntasPendientesView,
    RegionListView,
    RegisterUserView,
    ReiniciarCuestionarioView,
    SubmitUserAnswersView,
    TipoEleccionListView,
)

router = DefaultRouter()
router.register(r"candidatos-favoritos", CandidatoFavoritoViewSet, basename="candidato-favorito")
router.register(r"descartados", CandidatoDescartadoViewSet, basename="descartado")
router.register(r"decision-final", DecisionFinalViewSet, basename="decision-final")
router.register(r"noticias-guardadas", NoticiaBookmarkViewSet, basename="noticia-bookmark")
router.register(r"posturas-guardadas", PosturaBookmarkViewSet, basename="postura-bookmark")

urlpatterns = [
    # Auth
    path("register/", RegisterUserView.as_view(), name="register"),
    path("login/", CustomAuthToken.as_view(), name="login"),
    path(
        "password-reset/request/",
        PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    # Perfil
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "perfil/cambiar-password/",
        CambiarPasswordView.as_view(),
        name="perfil-cambiar-password",
    ),
    path(
        "perfil/comuna/",
        ActualizarComunaView.as_view(),
        name="perfil-comuna",
    ),
    # Territorio (publico, para autocomplete)
    path("regiones/", RegionListView.as_view(), name="region-list"),
    path("comunas/", ComunaListView.as_view(), name="comuna-list"),
    # Ejes tematicos (publico, para radar chart y filtros)
    path("ejes/", EjeListView.as_view(), name="eje-list"),
    # Unidad territorial polimorfica (publico, para browse jerarquico)
    path("unidades-territoriales/", UnidadTerritorialListView.as_view(),
         name="unidad-territorial-list"),
    # Catalogos
    path("tipos-eleccion/", TipoEleccionListView.as_view(), name="tipos-eleccion-list"),
    path("candidatos/", CandidatoListView.as_view(), name="candidato-list"),
    path("candidatos/<int:pk>/", CandidatoDetailView.as_view(), name="candidato-detail"),
    path(
        "candidatos/<int:candidato_id>/noticias/",
        CandidatoNoticiasView.as_view(),
        name="candidato-noticias",
    ),
    path(
        "candidatos/<int:candidato_id>/posturas/",
        CandidatoPosturasView.as_view(),
        name="candidato-posturas",
    ),
    path(
        "candidatos/<int:candidato_id>/match-detalle/",
        CandidatoMatchDetalleView.as_view(),
        name="candidato-match-detalle",
    ),
    # Preguntas / respuestas
    path("preguntas/", PreguntasPendientesView.as_view(), name="pregunta-list"),
    path("respuestas/", SubmitUserAnswersView.as_view(), name="submit-answers"),
    path(
        "respuestas/reiniciar/",
        ReiniciarCuestionarioView.as_view(),
        name="respuestas-reiniciar",
    ),
    path(
        "respuestas/mias/",
        MisRespuestasListView.as_view(),
        name="respuestas-mias-list",
    ),
    path(
        "respuestas/mias/<int:pk>/",
        EditarRespuestaView.as_view(),
        name="respuestas-mias-detail",
    ),
    # Match
    path(
        "match-candidatos/",
        MatchCandidatoViewSet.as_view({"post": "match_candidatos"}),
        name="match-candidatos",
    ),
    path(
        "match-anonimo/",
        MatchCandidatoViewSet.as_view({"post": "match_anonimo"}),
        name="match-anonimo",
    ),
    # Noticias
    path("noticias/", NoticiaListCreateView.as_view(), name="noticia-list-create"),
    path("noticias/<int:pk>/", NoticiaDetailView.as_view(), name="noticia-detail"),
    # Router (favoritos / descartados / decision-final)
    path("", include(router.urls)),
]
