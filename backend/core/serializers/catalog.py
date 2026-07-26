"""Serializers del catalogo electoral: tipos de eleccion, candidatos, preguntas."""

from rest_framework import serializers

from ..models import Candidato, OpcionRespuesta, Pregunta, TipoEleccion


class TipoEleccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEleccion
        fields = "__all__"


class OpcionRespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcionRespuesta
        fields = ["id", "texto", "valor", "es_no_se"]


class PreguntaSerializer(serializers.ModelSerializer):
    opciones_respuesta = OpcionRespuestaSerializer(many=True, read_only=True)
    tipo_eleccion_nombre = serializers.CharField(
        source="tipo_eleccion.nombre", read_only=True
    )
    eje_tematico_display = serializers.CharField(
        source="get_eje_tematico_display", read_only=True
    )

    class Meta:
        model = Pregunta
        fields = [
            "id",
            "texto",
            "orden",
            "tipo_eleccion",
            "tipo_eleccion_nombre",
            "eje_tematico",
            "eje_tematico_display",
            "explicacion",
            "repercusiones",
            "opciones_respuesta",
        ]


class CandidatoSerializer(serializers.ModelSerializer):
    # Un candidato tiene N tipos de eleccion; los exponemos como lista de ids
    # (input/output) y una lista de nombres (read-only).
    tipos_eleccion_nombres = serializers.SlugRelatedField(
        source="tipos_eleccion",
        many=True,
        read_only=True,
        slug_field="nombre",
    )

    class Meta:
        model = Candidato
        fields = [
            "id",
            "nombre",
            "apellido",
            "partido",
            "bio",
            "ciudad",
            "propuesta_electoral",
            "profile_picture",
            "tipos_eleccion",
            "tipos_eleccion_nombres",
        ]
