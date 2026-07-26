"""Serializers del catalogo electoral: tipos de eleccion, candidatos, preguntas."""

from rest_framework import serializers

from ..models import Candidato, Eje, OpcionRespuesta, Pregunta, TipoEleccion


class EjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eje
        fields = ["id", "codigo", "nombre", "color", "icono", "orden", "activo", "descripcion"]


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
    # Info del catalogo Eje (color/icono para UI). Nullable si el FK aun no se sincronizó.
    eje_nombre = serializers.CharField(source="eje.nombre", read_only=True, default=None)
    eje_color = serializers.CharField(source="eje.color", read_only=True, default=None)
    eje_icono = serializers.CharField(source="eje.icono", read_only=True, default=None)

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
            "eje",
            "eje_nombre",
            "eje_color",
            "eje_icono",
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
    # Info territorial expandida para el detalle candidato del frontend.
    comuna_nombre = serializers.CharField(
        source="comuna.nombre", read_only=True, default=None,
    )
    comuna_region_nombre = serializers.CharField(
        source="comuna.region.nombre", read_only=True, default=None,
    )
    distrito_numero = serializers.IntegerField(
        source="distrito.numero", read_only=True, default=None,
    )
    distrito_nombre = serializers.CharField(
        source="distrito.nombre", read_only=True, default=None,
    )
    alcance_territorial = serializers.CharField(read_only=True)

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
            # Territorio
            "comuna",
            "comuna_nombre",
            "comuna_region_nombre",
            "distrito",
            "distrito_numero",
            "distrito_nombre",
            "alcance_territorial",
        ]
