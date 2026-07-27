"""Serializers de bookmarking: favoritos, descartados, bookmarks de contenido."""

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


class CandidatoFavoritoSerializer(serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato", read_only=True)

    class Meta:
        model = CandidatoFavorito
        fields = ["id", "candidato", "fecha_agregado", "candidato_data"]
        read_only_fields = ["fecha_agregado", "candidato_data"]

    def validate(self, data):
        user = self.context["request"].user
        if CandidatoFavorito.objects.filter(user=user, candidato=data["candidato"]).exists():
            raise serializers.ValidationError("Este candidato ya esta en tus favoritos.")
        return data


class CandidatoDescartadoSerializer(serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato", read_only=True)

    class Meta:
        model = CandidatoDescartado
        fields = ["id", "candidato", "fecha_descartado", "candidato_data"]
        read_only_fields = ["fecha_descartado", "candidato_data"]

    def validate(self, data):
        user = self.context["request"].user
        if CandidatoDescartado.objects.filter(user=user, candidato=data["candidato"]).exists():
            raise serializers.ValidationError("Este candidato ya esta descartado.")
        return data


class NoticiaBookmarkSerializer(serializers.ModelSerializer):
    noticia_data = NoticiaSerializer(source='noticia', read_only=True)

    class Meta:
        model = NoticiaBookmark
        fields = ['id', 'noticia', 'fecha_agregado', 'noticia_data']
        read_only_fields = ['fecha_agregado', 'noticia_data']

    def validate(self, data):
        user = self.context['request'].user
        if NoticiaBookmark.objects.filter(user=user, noticia=data['noticia']).exists():
            raise serializers.ValidationError('Esta noticia ya esta guardada.')
        return data


class PosturaBookmarkSerializer(serializers.ModelSerializer):
    postura_data = PosturaCandidatoSerializer(source='postura', read_only=True)

    class Meta:
        model = PosturaBookmark
        fields = ['id', 'postura', 'fecha_agregado', 'postura_data']
        read_only_fields = ['fecha_agregado', 'postura_data']

    def validate(self, data):
        user = self.context['request'].user
        if PosturaBookmark.objects.filter(user=user, postura=data['postura']).exists():
            raise serializers.ValidationError('Esta postura ya esta guardada.')
        return data

