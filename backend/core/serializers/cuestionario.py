"""Serializers de respuestas del cuestionario."""

from rest_framework import serializers

from ..models import OpcionRespuesta, Pregunta, RespuestaUsuario


class RespuestaUsuarioCreateSerializer(serializers.ModelSerializer):
    pregunta = serializers.PrimaryKeyRelatedField(queryset=Pregunta.objects.all())
    opcion_elegida = serializers.PrimaryKeyRelatedField(
        queryset=OpcionRespuesta.objects.all()
    )
    peso = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=3,
        default=RespuestaUsuario.PESO_POCO,
    )

    class Meta:
        model = RespuestaUsuario
        fields = ["pregunta", "opcion_elegida", "peso"]

    def validate(self, data):
        pregunta = data.get("pregunta")
        opcion_elegida = data.get("opcion_elegida")
        if pregunta and opcion_elegida and opcion_elegida.pregunta != pregunta:
            raise serializers.ValidationError(
                {"opcion_elegida": "La opcion elegida no pertenece a la pregunta especificada."}
            )
        return data


class RespuestaUsuarioReadSerializer(serializers.ModelSerializer):
    pregunta_texto = serializers.CharField(source="pregunta.texto", read_only=True)
    opcion_elegida_texto = serializers.CharField(
        source="opcion_elegida.texto", read_only=True
    )
    opcion_elegida_valor = serializers.IntegerField(
        source="opcion_elegida.valor", read_only=True
    )

    class Meta:
        model = RespuestaUsuario
        fields = [
            "id",
            "pregunta",
            "pregunta_texto",
            "opcion_elegida",
            "opcion_elegida_texto",
            "opcion_elegida_valor",
            "fecha_respuesta",
        ]
        read_only_fields = ["id", "fecha_respuesta"]


class OpcionSimpleSerializer(serializers.ModelSerializer):
    """Opcion minima para poblar el editor de respuestas."""

    class Meta:
        model = OpcionRespuesta
        fields = ["id", "texto", "valor"]


class MisRespuestasItemSerializer(serializers.ModelSerializer):
    """Respuesta del user con pregunta + eje + opciones disponibles.

    Diseñado para el editor: el cliente muestra la pregunta, la opcion
    actual (con peso), y las alternativas para elegir otra.
    """

    pregunta_texto = serializers.CharField(source="pregunta.texto", read_only=True)
    eje_tematico = serializers.CharField(
        source="pregunta.eje_tematico", read_only=True
    )
    eje_tematico_display = serializers.CharField(
        source="pregunta.get_eje_tematico_display", read_only=True
    )
    opciones = OpcionSimpleSerializer(
        source="pregunta.opciones_respuesta", many=True, read_only=True
    )

    class Meta:
        model = RespuestaUsuario
        fields = [
            "id",
            "pregunta",
            "pregunta_texto",
            "eje_tematico",
            "eje_tematico_display",
            "opcion_elegida",
            "peso",
            "opciones",
            "fecha_respuesta",
        ]
        read_only_fields = fields


class EditarRespuestaSerializer(serializers.Serializer):
    """Input para PATCH /respuestas/mias/{id}/."""

    opcion_elegida = serializers.IntegerField()
    peso = serializers.IntegerField(min_value=0, max_value=3)
