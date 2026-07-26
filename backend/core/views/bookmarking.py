"""Viewsets de bookmarking: favoritos, descartados, decision final, bookmarks de contenido."""

from rest_framework import mixins, viewsets

from ..models import (
    CandidatoDescartado,
    CandidatoFavorito,
    DecisionFinal,
    NoticiaBookmark,
    PosturaBookmark,
)
from ..serializers import (
    CandidatoDescartadoSerializer,
    CandidatoFavoritoSerializer,
    DecisionFinalSerializer,
    NoticiaBookmarkSerializer,
    PosturaBookmarkSerializer,
)


class _UserScopedCreateListDestroy(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Base para viewsets que solo listan/crean/borran items del user actual."""

    def get_queryset(self):
        return self.queryset_class.objects.filter(user=self.request.user).select_related(
            "candidato"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CandidatoFavoritoViewSet(_UserScopedCreateListDestroy):
    serializer_class = CandidatoFavoritoSerializer
    queryset_class = CandidatoFavorito
    queryset = CandidatoFavorito.objects.none()  # hint para drf-spectacular


class CandidatoDescartadoViewSet(_UserScopedCreateListDestroy):
    serializer_class = CandidatoDescartadoSerializer
    queryset_class = CandidatoDescartado
    queryset = CandidatoDescartado.objects.none()  # hint para drf-spectacular


class NoticiaBookmarkViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NoticiaBookmarkSerializer
    queryset = NoticiaBookmark.objects.none()

    def get_queryset(self):
        return NoticiaBookmark.objects.filter(user=self.request.user).select_related(
            "noticia"
        ).prefetch_related("noticia__candidatos_mencionados")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PosturaBookmarkViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PosturaBookmarkSerializer
    queryset = PosturaBookmark.objects.none()

    def get_queryset(self):
        return PosturaBookmark.objects.filter(user=self.request.user).select_related(
            "postura",
            "postura__candidato",
            "postura__pregunta",
            "postura__opcion_respuesta",
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DecisionFinalViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Voto final del usuario por tipo de eleccion."""

    serializer_class = DecisionFinalSerializer
    queryset = DecisionFinal.objects.none()  # hint para drf-spectacular

    def get_queryset(self):
        return DecisionFinal.objects.filter(user=self.request.user).select_related(
            "candidato_elegido", "tipo_eleccion"
        )

    def perform_create(self, serializer):
        # unique_together (user, tipo_eleccion): usamos update_or_create
        # para que el usuario pueda cambiar de opinion.
        DecisionFinal.objects.update_or_create(
            user=self.request.user,
            tipo_eleccion=serializer.validated_data["tipo_eleccion"],
            defaults={"candidato_elegido": serializer.validated_data["candidato_elegido"]},
        )
