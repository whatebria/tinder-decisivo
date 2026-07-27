"""Views de noticias. Lectura publica, escritura solo admin."""

from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, permissions

from ..models import Noticia
from ..pagination import StandardResultsSetPagination
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
        OpenApiParameter(
            "dias", int, required=False,
            description="Solo noticias de los ultimos N dias (ej. 7, 30, 90).",
        ),
        OpenApiParameter(
            "q", str, required=False,
            description="Busqueda de texto libre en titulo y descripcion.",
        ),
    ],
    responses={200: NoticiaSerializer(many=True)},
)
class NoticiaListCreateView(_NoticiaPermMixin, generics.ListCreateAPIView):
    """GET /api/noticias/ (feed global, con filtros opcionales) / POST admin."""

    serializer_class = NoticiaSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = (
            Noticia.objects.all()
            .prefetch_related("candidatos_mencionados")
            .order_by("-fecha_publicacion")
        )
        params = self.request.query_params

        candidato_id = params.get("candidato_id")
        if candidato_id:
            qs = qs.filter(candidatos_mencionados__id=candidato_id).distinct()

        fuente = params.get("fuente")
        if fuente:
            qs = qs.filter(fuente__icontains=fuente)

        dias = params.get("dias")
        if dias:
            try:
                dias_int = int(dias)
                if dias_int > 0:
                    desde = timezone.now() - timedelta(days=dias_int)
                    qs = qs.filter(fecha_publicacion__gte=desde)
            except (ValueError, TypeError):
                pass  # ignoro dias invalido, no rompo el request

        q = params.get("q")
        if q and q.strip():
            from django.db.models import Q
            qs = qs.filter(
                Q(titulo__icontains=q) | Q(descripcion__icontains=q)
            )

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
