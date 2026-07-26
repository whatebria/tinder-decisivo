"""View del matching. La logica de calculo vive en `services/matching.py`."""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import TipoEleccion
from ..serializers import MatchCandidatoResultSerializer
from ..services.matching import calcular_match


class MatchCandidatoViewSet(viewsets.GenericViewSet):
    """Calculo de match. Usa POST porque persiste estado (no idempotente en el sentido HTTP)."""

    serializer_class = MatchCandidatoResultSerializer

    @action(detail=False, methods=["post"])
    def match_candidatos(self, request):
        tipo_eleccion_id = request.data.get("tipo_eleccion_id") or request.query_params.get(
            "tipo_eleccion_id"
        )
        if not tipo_eleccion_id:
            return Response(
                {"detail": "Falta el parametro 'tipo_eleccion_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tipo_eleccion = TipoEleccion.objects.get(id=tipo_eleccion_id)
        except TipoEleccion.DoesNotExist:
            return Response(
                {"detail": "Tipo de eleccion no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        resultados = calcular_match(request.user, tipo_eleccion)
        if resultados is None:
            return Response(
                {"detail": "El usuario no ha respondido preguntas para este tipo de eleccion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(MatchCandidatoResultSerializer(resultados, many=True).data)
