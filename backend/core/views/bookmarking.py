"""Viewsets de bookmarking: favoritos, descartados, bookmarks de contenido."""

from rest_framework import mixins, viewsets

from ..models import (
    CandidatoDescartado,
    CandidatoFavorito,
    NoticiaBookmark,
    PosturaBookmark,
)
from ..serializers import (
    CandidatoDescartadoSerializer,
    CandidatoFavoritoSerializer,
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


