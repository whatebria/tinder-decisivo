"""Endpoints read-only del catalogo territorial (regiones y comunas).

Sirven para poblar dropdowns/autocomplete en el frontend cuando el usuario
elige su comuna de residencia. Publicos (no requieren auth) porque la
info es catastral publica.
"""

from django.db.models import Q
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response

from ..models import Comuna, Region
from ..serializers.perfil import ComunaInlineSerializer


class RegionListView(generics.ListAPIView):
    """GET /regiones/: lista las 16 regiones ordenadas norte-sur."""

    permission_classes = [permissions.AllowAny]
    pagination_class = None
    queryset = Region.objects.all().order_by("orden")

    def list(self, request, *args, **kwargs):
        return Response([
            {
                "id": r.id,
                "codigo": r.codigo,
                "numero_romano": r.numero_romano,
                "nombre": r.nombre,
                "nombre_corto": r.nombre_corto,
            }
            for r in self.get_queryset()
        ])


class ComunaListView(generics.ListAPIView):
    """GET /comunas/: lista comunas para dropdown/autocomplete.

    Query params:
    - `region_id`: filtra por region.
    - `q`: match parcial case-insensitive en nombre de comuna.
    """

    permission_classes = [permissions.AllowAny]
    pagination_class = None
    serializer_class = ComunaInlineSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter("region_id", int, required=False),
            OpenApiParameter("q", str, required=False),
        ],
    )
    def get_queryset(self):
        qs = Comuna.objects.select_related("region", "distrito")
        region_id = self.request.query_params.get("region_id")
        if region_id:
            qs = qs.filter(region_id=region_id)
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(codigo__istartswith=q))
        return qs.order_by("region__orden", "nombre")
