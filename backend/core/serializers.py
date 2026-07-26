"""Serializers para la API REST de Servel."""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    TipoEleccion,
    Candidato,
    Pregunta,
    OpcionRespuesta,
    PosturaCandidato,
    CandidatoFavorito,
    CandidatoDescartado,
    DecisionFinal,
    RespuestaUsuario,
    MatchCandidato,
    Noticia,
)

User = get_user_model()


# ------------------------------------------------------------
# Auth / Registro
# ------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


# ------------------------------------------------------------
# Catalogos
# ------------------------------------------------------------
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
    # Aprovechamos los campos nativos de DRF: nada de SerializerMethodField
    # + isinstance(dict) hacks. Un candidato tiene N tipos de eleccion, se
    # exponen como lista de ids (input/output) y una lista de nombres (read-only).
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


# ------------------------------------------------------------
# Match
# ------------------------------------------------------------
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


# ------------------------------------------------------------
# Favoritos / Descartados / Decision final
# ------------------------------------------------------------
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


class DecisionFinalSerializer(serializers.ModelSerializer):
    candidato_data = CandidatoSerializer(source="candidato_elegido", read_only=True)
    tipo_eleccion_nombre = serializers.CharField(
        source="tipo_eleccion.nombre", read_only=True
    )

    class Meta:
        model = DecisionFinal
        fields = [
            "id",
            "candidato_elegido",
            "tipo_eleccion",
            "fecha_decision",
            "candidato_data",
            "tipo_eleccion_nombre",
        ]
        read_only_fields = ["fecha_decision", "candidato_data", "tipo_eleccion_nombre"]


# ------------------------------------------------------------
# Respuestas del usuario
# ------------------------------------------------------------
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


# ------------------------------------------------------------
# Noticias
# ------------------------------------------------------------
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
