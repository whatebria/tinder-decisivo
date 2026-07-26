"""Serializers de perfil de usuario."""

from rest_framework import serializers


class ContadoresSerializer(serializers.Serializer):
    respuestas = serializers.IntegerField()
    favoritos = serializers.IntegerField()
    descartados = serializers.IntegerField()
    decisiones = serializers.IntegerField()


class PerfilSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    fecha_registro = serializers.DateTimeField()
    contadores = ContadoresSerializer()


class CambiarPasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class EliminarCuentaSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
