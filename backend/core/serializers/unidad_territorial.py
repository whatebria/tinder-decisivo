"""Serializers para UnidadTerritorial (nuevo modelo polimorfico)."""

from rest_framework import serializers

from ..models import UnidadTerritorial


class UnidadTerritorialSerializer(serializers.ModelSerializer):
    padre_nombre = serializers.CharField(source="padre.nombre", read_only=True, default=None)
    padre_nivel = serializers.CharField(source="padre.nivel", read_only=True, default=None)

    class Meta:
        model = UnidadTerritorial
        fields = [
            "id", "codigo", "nombre", "nivel",
            "padre", "padre_nombre", "padre_nivel",
            "metadata",
        ]
