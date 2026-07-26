"""Views de noticias. Lectura publica, escritura solo admin."""

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, permissions

from ..models import Noticia
from ..serializers import NoticiaSerializer


class _NoticiaPermMixin:
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


@extend_schema(
    parameters=[
        OpenApiParameter(
            "candidato_id", int, required=False,
            description="Filtra noticias que mencionen a este candidato.",
        ),
        OpenApiParameter(
            "fuente", str, required=False,
            description="Filtra por medio de origen (match parcial, case-insensitive).",
        ),
    ],
    responses={200: NoticiaSerializer(many=True)},
)
class NoticiaListCreateView(_NoticiaPermMixin, generics.ListCreateAPIView):
    """GET /api/noticias/ (feed global, con filtros opcionales) / POST admin."""

    serializer_class = NoticiaSerializer

    def get_queryset(self):
        qs = (
            Noticia.objects.all()
            .prefetch_related("candidatos_mencionados")
            .order_by("-fecha_publicacion")
        )
        candidato_id = self.request.query_params.get("candidato_id")
        if candidato_id:
            qs = qs.filter(candidatos_mencionados__id=candidato_id).distinct()
        fuente = self.request.query_params.get("fuente")
        if fuente:
            qs = qs.filter(fuente__icontains=fuente)
        return qs


class NoticiaDetailView(_NoticiaPermMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Noticia.objects.all()
    serializer_class = NoticiaSerializer


class CandidatoNoticiasView(generics.ListAPIView):
    """GET /api/candidatos/<candidato_id>/noticias/ - noticias que mencionan al candidato."""

    serializer_class = NoticiaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Noticia.objects.filter(
            candidatos_mencionados__id=self.kwargs["candidato_id"]
        ).order_by("-fecha_publicacion").distinct()
