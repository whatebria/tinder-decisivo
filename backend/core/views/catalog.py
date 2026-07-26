"""Views de catalogos: tipos de eleccion y candidatos.

Estos endpoints son publicos (AllowAny) para soportar modo invitado.
El bookmarking (favoritos/descartados/decision) sigue requiriendo auth.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response

from ..models import Candidato, PosturaCandidato, TipoEleccion
from ..serializers import (
    CandidatoSerializer,
    PosturaCandidatoSerializer,
    TipoEleccionSerializer,
)


class TipoEleccionListView(generics.ListAPIView):
    queryset = TipoEleccion.objects.all()
    serializer_class = TipoEleccionSerializer
    permission_classes = [permissions.AllowAny]


class CandidatoListView(generics.ListAPIView):
    queryset = (
        Candidato.objects.all()
        .select_related("comuna", "comuna__region", "distrito")
        .prefetch_related("tipos_eleccion")
    )
    serializer_class = CandidatoSerializer
    permission_classes = [permissions.AllowAny]


class CandidatoDetailView(generics.RetrieveAPIView):
    queryset = (
        Candidato.objects.all()
        .select_related("comuna", "comuna__region", "distrito")
        .prefetch_related("tipos_eleccion")
    )
    serializer_class = CandidatoSerializer
    permission_classes = [permissions.AllowAny]


@extend_schema(
    parameters=[
        OpenApiParameter(
            "tipo_eleccion_id",
            int,
            required=False,
            description="Filtra posturas por preguntas de este tipo de eleccion.",
        )
    ],
    responses={200: PosturaCandidatoSerializer(many=True)},
)
class CandidatoPosturasView(generics.ListAPIView):
    """GET /candidatos/<candidato_id>/posturas/.

    Devuelve todas las posturas del candidato (12 tipicamente), con la
    pregunta + opcion elegida + justificacion + eje tematico expandidos.

    Publico: cualquiera puede ver las posturas de un candidato (es data
    editorial, no PII del user).
    """

    serializer_class = PosturaCandidatoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        candidato_id = self.kwargs["candidato_id"]
        qs = (
            PosturaCandidato.objects.filter(candidato_id=candidato_id)
            .select_related(
                "candidato", "pregunta", "opcion_respuesta"
            )
            .order_by("pregunta__orden")
        )
        tipo_id = self.request.query_params.get("tipo_eleccion_id")
        if tipo_id:
            qs = qs.filter(pregunta__tipo_eleccion_id=tipo_id)
        return qs
