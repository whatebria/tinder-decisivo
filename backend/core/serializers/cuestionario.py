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
