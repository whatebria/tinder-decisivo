"""Serializers del catalogo electoral: tipos de eleccion, candidatos, preguntas."""

from rest_framework import serializers

from ..models import Candidato, Eje, OpcionRespuesta, Pregunta, TipoEleccion


class EjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eje
        fields = ["id", "codigo", "nombre", "color", "icono", "orden", "activo", "descripcion"]


class TipoEleccionSerializer(serializers.ModelSerializer):
    # Conteo de preguntas activas para este tipo de eleccion.
    # Permite al frontend mostrar "X preguntas" incluso antes de que
    # el usuario haya iniciado el cuestionario (sin MiProgresoItem).
    total_preguntas = serializers.SerializerMethodField()

    def get_total_preguntas(self, obj) -> int:
        return obj.preguntas.count()

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
    # Los nombres/numeros se leen del Candidato via metodos derivados que
    # resuelven desde unidad_territorial (fuente unica de verdad).
    comuna_nombre = serializers.SerializerMethodField()
    comuna_region_nombre = serializers.SerializerMethodField()
    distrito_numero = serializers.SerializerMethodField()
    distrito_nombre = serializers.SerializerMethodField()
    alcance_territorial = serializers.CharField(read_only=True)

    def _ut_comuna(self, obj):
        """Retorna la UT nivel=comunal si el candidato compite a nivel comunal."""
        ut = obj.unidad_territorial
        return ut if ut and ut.nivel == "comunal" else None

    def _ut_distrito(self, obj):
        """Retorna la UT nivel=distrital si compite a nivel distrital."""
        ut = obj.unidad_territorial
        return ut if ut and ut.nivel == "distrital" else None

    def get_comuna_nombre(self, obj):
        ut = self._ut_comuna(obj)
        return ut.nombre if ut else None

    def get_comuna_region_nombre(self, obj):
        """Nombre de la region ancestro cuando el candidato es comunal.

        Cadena de ancestros: comuna -> distrito -> region -> pais.
        Frontend usa esto para filtrar candidatos por region.
        """
        ut = self._ut_comuna(obj)
        if not ut:
            return None
        for ancestro in ut.ancestros():
            if ancestro.nivel == "regional":
                return ancestro.nombre
        return None

    def get_distrito_numero(self, obj):
        ut = self._ut_distrito(obj)
        if not ut:
            return None
        # Codigo UT distrital es "D-<numero>", ej "D-10". Tambien esta en
        # metadata['numero_distrito'] pero parseamos del codigo por simpleza.
        try:
            return int(ut.codigo.split("-", 1)[1])
        except (IndexError, ValueError):
            return None

    def get_distrito_nombre(self, obj):
        ut = self._ut_distrito(obj)
        return ut.nombre if ut else None

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
            # Territorio (todos derivados de unidad_territorial)
            "unidad_territorial",
            "comuna_nombre",
            "comuna_region_nombre",
            "distrito_numero",
            "distrito_nombre",
            "alcance_territorial",
        ]
