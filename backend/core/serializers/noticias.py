"""Serializer de noticias."""

from rest_framework import serializers

from ..models import Candidato, Noticia


class NoticiaSerializer(serializers.ModelSerializer):
    candidatos_mencionados = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Candidato.objects.all(), required=False,
    )

    class Meta:
        model = Noticia
        fields = [
            "id", "titulo", "descripcion", "url", "fuente", "imagen_url",
            "candidatos_mencionados", "fecha_publicacion", "actualizado_en",
        ]
        read_only_fields = ["fecha_publicacion", "actualizado_en"]
