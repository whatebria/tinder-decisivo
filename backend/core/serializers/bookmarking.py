"""Serializers de bookmarking: favoritos, descartados, bookmarks de contenido.

El patron es siempre el mismo: un modelo con (user, <objeto>) unique_together,
donde el user se inyecta desde el request. Factoreamos la validacion de unicidad
en un mixin para no repetir el patron 4 veces.
"""

from rest_framework import serializers

from ..models import (
    CandidatoDescartado,
    CandidatoFavorito,
    NoticiaBookmark,
    PosturaBookmark,
)
from .catalog import CandidatoSerializer
from .matching import PosturaCandidatoSerializer
from .noticias import NoticiaSerializer


class UniqueUserBookmarkMixin:
    """Valida que no exista ya un bookmark (user, <objeto>) para este user.

    El modelo YA tiene el `unique_together = ("user", <objeto>)`, entonces
    intentar guardar duplicado terminaria en IntegrityError -> HTTP 500 feo.
    Este mixin adelanta la validacion y devuelve un 400 con mensaje amigable.

    Subclases declaran:
        unique_object_field: str        # ej. "candidato", "noticia"
        unique_error_message: str       # ej. "Este candidato ya esta en tus favoritos."
    """

    unique_object_field: str = ""
    unique_error_message: str = ""

    def validate(self, data):
        user = self.context["request"].user
        obj = data[self.unique_object_field]
        model = self.Meta.model
        if model.objects.filter(user=user, **{self.unique_object_field: obj}).exists():
            raise serializers.ValidationError(self.unique_error_message)
        return data


class CandidatoFavoritoSerializer(UniqueUserBookmarkMixin, serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato", read_only=True)
    unique_object_field = "candidato"
    unique_error_message = "Este candidato ya esta en tus favoritos."

    class Meta:
        model = CandidatoFavorito
        fields = ["id", "candidato", "fecha_agregado", "candidato_data"]
        read_only_fields = ["fecha_agregado", "candidato_data"]


class CandidatoDescartadoSerializer(UniqueUserBookmarkMixin, serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato", read_only=True)
    unique_object_field = "candidato"
    unique_error_message = "Este candidato ya esta descartado."

    class Meta:
        model = CandidatoDescartado
        fields = ["id", "candidato", "fecha_descartado", "candidato_data"]
        read_only_fields = ["fecha_descartado", "candidato_data"]


class NoticiaBookmarkSerializer(UniqueUserBookmarkMixin, serializers.ModelSerializer):
    noticia_data = NoticiaSerializer(source="noticia", read_only=True)
    unique_object_field = "noticia"
    unique_error_message = "Esta noticia ya esta guardada."

    class Meta:
        model = NoticiaBookmark
        fields = ["id", "noticia", "fecha_agregado", "noticia_data"]
        read_only_fields = ["fecha_agregado", "noticia_data"]


class PosturaBookmarkSerializer(UniqueUserBookmarkMixin, serializers.ModelSerializer):
    postura_data = PosturaCandidatoSerializer(source="postura", read_only=True)
    unique_object_field = "postura"
    unique_error_message = "Esta postura ya esta guardada."

    class Meta:
        model = PosturaBookmark
        fields = ["id", "postura", "fecha_agregado", "postura_data"]
        read_only_fields = ["fecha_agregado", "postura_data"]
