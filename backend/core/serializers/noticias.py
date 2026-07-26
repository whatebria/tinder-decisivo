"""Serializer de noticias."""

from rest_framework import serializers

from ..models import Candidato, Noticia


class CandidatoMencionadoSerializer(serializers.ModelSerializer):
    """Info minima del candidato para chips en el feed de noticias."""

    class Meta:
        model = Candidato
        fields = ["id", "nombre", "apellido", "partido"]


class NoticiaSerializer(serializers.ModelSerializer):
    # Para writes: acepta lista de IDs.
    candidatos_mencionados = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Candidato.objects.all(), required=False,
    )
    # Para reads: expande info basica de cada candidato (chips en la UI).
    candidatos_mencionados_data = CandidatoMencionadoSerializer(
        source="candidatos_mencionados", many=True, read_only=True,
    )

    class Meta:
        model = Noticia
        fields = [
            "id", "titulo", "descripcion", "url", "fuente", "imagen_url",
            "candidatos_mencionados", "candidatos_mencionados_data",
            "fecha_publicacion", "actualizado_en",
        ]
        read_only_fields = ["fecha_publicacion", "actualizado_en"]
