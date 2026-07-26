"""Views de noticias. Lectura publica, escritura solo admin."""

from rest_framework import generics, permissions

from ..models import Noticia
from ..serializers import NoticiaSerializer


class _NoticiaPermMixin:
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class NoticiaListCreateView(_NoticiaPermMixin, generics.ListCreateAPIView):
    queryset = Noticia.objects.all()
    serializer_class = NoticiaSerializer


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
