"""Views de catalogos: tipos de eleccion y candidatos."""

from rest_framework import generics

from ..models import Candidato, TipoEleccion
from ..serializers import CandidatoSerializer, TipoEleccionSerializer


class TipoEleccionListView(generics.ListAPIView):
    queryset = TipoEleccion.objects.all()
    serializer_class = TipoEleccionSerializer


class CandidatoListView(generics.ListAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer


class CandidatoDetailView(generics.RetrieveAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer
