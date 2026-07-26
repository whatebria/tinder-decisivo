"""Endpoint publico de UnidadTerritorial: browse jerarquico del territorio."""

from rest_framework import generics, permissions

from ..models import UnidadTerritorial
from ..serializers.unidad_territorial import UnidadTerritorialSerializer


class UnidadTerritorialListView(generics.ListAPIView):
    """GET /unidades-territoriales/ con filtros:

    - ?nivel=comunal  -> solo comunas
    - ?padre=<id>     -> solo hijos directos de esa unidad (ej. comunas del D10)
    - ?q=nunoa        -> busqueda por nombre (icontains)
    """

    permission_classes = [permissions.AllowAny]
    pagination_class = None
    serializer_class = UnidadTerritorialSerializer

    def get_queryset(self):
        qs = UnidadTerritorial.objects.select_related("padre")
        nivel = self.request.query_params.get("nivel")
        padre = self.request.query_params.get("padre")
        q = self.request.query_params.get("q")
        if nivel:
            qs = qs.filter(nivel=nivel)
        if padre:
            qs = qs.filter(padre_id=padre)
        if q:
            qs = qs.filter(nombre__icontains=q)
        return qs.order_by("nivel", "nombre")
