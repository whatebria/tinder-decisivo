"""Endpoint publico del catalogo Eje."""

from rest_framework import generics, permissions

from ..models import Eje
from ..serializers import EjeSerializer


class EjeListView(generics.ListAPIView):
    """GET /ejes/: lista todos los ejes activos ordenados por `orden`.

    Publico: se usa desde el frontend para dropdown de filtros, radar chart
    con colores canonicos, y tooltips educativos.
    """

    permission_classes = [permissions.AllowAny]
    pagination_class = None
    serializer_class = EjeSerializer

    def get_queryset(self):
        qs = Eje.objects.all()
        # ?incluir_inactivos=true para el admin/dashboard.
        if self.request.query_params.get("incluir_inactivos") != "true":
            qs = qs.filter(activo=True)
        return qs.order_by("orden", "nombre")
