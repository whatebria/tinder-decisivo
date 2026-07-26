"""Serializers de matching: posturas y resultado del match."""

from rest_framework import serializers

from ..models import MatchCandidato, PosturaCandidato
from .catalog import CandidatoSerializer


class PosturaCandidatoSerializer(serializers.ModelSerializer):
    opcion_respuesta_texto = serializers.CharField(
        source="opcion_respuesta.texto", read_only=True
    )
    opcion_respuesta_valor = serializers.IntegerField(
        source="opcion_respuesta.valor", read_only=True
    )
    pregunta_texto = serializers.CharField(source="pregunta.texto", read_only=True)
    candidato_nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = PosturaCandidato
        fields = [
            "id",
            "candidato",
            "pregunta",
            "opcion_respuesta",
            "justificacion",
            "opcion_respuesta_texto",
            "opcion_respuesta_valor",
            "candidato_nombre_completo",
            "pregunta_texto",
        ]

    def get_candidato_nombre_completo(self, obj) -> str:
        return f"{obj.candidato.nombre} {obj.candidato.apellido}".strip()


class MatchCandidatoResultSerializer(serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato", read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    match_percentage = serializers.DecimalField(
        source="match_percentage_value",
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )
    preguntas_consideradas = serializers.IntegerField(
        source="num_preguntas_consideradas", read_only=True
    )
    confianza_display = serializers.CharField(
        source="get_confianza_display", read_only=True
    )

    class Meta:
        model = MatchCandidato
        fields = [
            "id",
            "user",
            "candidato_data",
            "match_percentage",
            "preguntas_consideradas",
            "breakdown_por_eje",
            "confianza",
            "confianza_display",
        ]
