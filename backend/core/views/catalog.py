"""Views de catalogos: tipos de eleccion y candidatos.

Estos endpoints son publicos (AllowAny) para soportar modo invitado.
El bookmarking (favoritos/descartados/decision) sigue requiriendo auth.
"""

from rest_framework import generics, permissions

from ..models import Candidato, TipoEleccion
from ..serializers import CandidatoSerializer, TipoEleccionSerializer


class TipoEleccionListView(generics.ListAPIView):
    queryset = TipoEleccion.objects.all()
    serializer_class = TipoEleccionSerializer
    permission_classes = [permissions.AllowAny]


class CandidatoListView(generics.ListAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer
    permission_classes = [permissions.AllowAny]


class CandidatoDetailView(generics.RetrieveAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer
    permission_classes = [permissions.AllowAny]
