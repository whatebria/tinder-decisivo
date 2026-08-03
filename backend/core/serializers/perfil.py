"""Serializers de perfil de usuario."""

from rest_framework import serializers

from ..models import Comuna


class ContadoresSerializer(serializers.Serializer):
    respuestas = serializers.IntegerField()
    favoritos = serializers.IntegerField()
    descartados = serializers.IntegerField()


class ComunaInlineSerializer(serializers.ModelSerializer):
    """Representacion inline de comuna dentro del perfil."""
    region_nombre = serializers.CharField(source="region.nombre", read_only=True)
    distrito_numero = serializers.IntegerField(source="distrito.numero", read_only=True)

    class Meta:
        model = Comuna
        fields = ("id", "codigo", "nombre", "region_nombre", "distrito_numero")


class PerfilSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    fecha_registro = serializers.DateTimeField()
    contadores = ContadoresSerializer()
    comuna = ComunaInlineSerializer(allow_null=True)


class ActualizarComunaSerializer(serializers.Serializer):
    """Body del PATCH /perfil/comuna/. Solo requiere comuna_id."""
    comuna_id = serializers.IntegerField(
        allow_null=True,
        help_text="ID de la comuna donde vota. null para limpiar.",
    )

    def validate_comuna_id(self, value):
        if value is None:
            return value
        if not Comuna.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"No existe comuna con id={value}.")
        return value


class CambiarPasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    # Sin min_length: la politica real la aplica validate_password() en
    # services/perfil.py (fuente unica de verdad = AUTH_PASSWORD_VALIDATORS).
    new_password = serializers.CharField(write_only=True)


class EliminarCuentaSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)


class CambiarUsernameSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_username = serializers.CharField(
        min_length=3,
        max_length=30,
        write_only=True,
        help_text="Solo letras, numeros, puntos y guiones bajos (3-30 chars).",
    )


class CambiarEmailSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_email = serializers.EmailField(
        write_only=True,
        help_text="Nuevo email del usuario. Debe ser unico.",
    )
