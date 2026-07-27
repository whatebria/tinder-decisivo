"""View del matching. La logica de calculo vive en `services/matching.py`.

Hay dos variantes:
- `match_candidatos`     -> autenticado, persiste MatchCandidato.
- `match_anonimo`        -> guest, calcula in-memory, no persiste nada.
"""

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Candidato, TipoEleccion
from ..serializers import AnonMatchResultSerializer, MatchCandidatoResultSerializer
from ..services.matching import (
    calcular_match,
    calcular_match_anonimo,
    calcular_match_detalle,
)


class MatchCandidatoViewSet(viewsets.GenericViewSet):
    """Calculo de match. Usa POST porque persiste estado (no idempotente en el sentido HTTP)."""

    serializer_class = MatchCandidatoResultSerializer

    def get_permissions(self):
        # match_anonimo es publico, el resto autenticado.
        if self.action == "match_anonimo":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_authenticators(self):
        # Guest no manda token -> no queremos que TokenAuthentication tire 401 spurious.
        if getattr(self, "action", None) == "match_anonimo":
            return []
        return super().get_authenticators()

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

        if tipo_eleccion.es_base:
            return Response(
                {
                    "detail": (
                        "Este tipo de cuestionario no tiene candidatos propios. "
                        "Sus respuestas se aplican al match de cualquier otra eleccion."
                    ),
                    "code": "tipo_base_sin_candidatos",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        resultados = calcular_match(request.user, tipo_eleccion)
        if resultados is None:
            return Response(
                {
                    "detail": "El usuario no ha respondido preguntas para este tipo de eleccion.",
                    "code": "sin_respuestas",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(MatchCandidatoResultSerializer(resultados, many=True).data)

    @extend_schema(
        request={
            "type": "object",
            "properties": {
                "tipo_eleccion_id": {"type": "integer"},
                "respuestas": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "pregunta_id": {"type": "integer"},
                            "opcion_id": {"type": "integer"},
                            "peso": {"type": "integer", "minimum": 0, "maximum": 3},
                        },
                        "required": ["pregunta_id", "opcion_id"],
                    },
                },
            },
            "required": ["tipo_eleccion_id", "respuestas"],
        },
        responses={
            200: AnonMatchResultSerializer(many=True),
            400: OpenApiResponse(description="Payload invalido"),
        },
    )
    @action(detail=False, methods=["post"], url_path="match-anonimo")
    def match_anonimo(self, request):
        """Match para usuarios guest. No persiste nada."""
        tipo_eleccion_id = request.data.get("tipo_eleccion_id")
        respuestas = request.data.get("respuestas")

        if not tipo_eleccion_id or not isinstance(respuestas, list):
            return Response(
                {"detail": "Se requiere 'tipo_eleccion_id' y 'respuestas' (lista)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tipo_eleccion = TipoEleccion.objects.get(id=tipo_eleccion_id)
        except TipoEleccion.DoesNotExist:
            return Response(
                {"detail": "Tipo de eleccion no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if tipo_eleccion.es_base:
            return Response(
                {
                    "detail": (
                        "Este tipo de cuestionario no tiene candidatos propios. "
                        "Sus respuestas se aplican al match de cualquier otra eleccion."
                    ),
                    "code": "tipo_base_sin_candidatos",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        scores = calcular_match_anonimo(respuestas, tipo_eleccion)
        if not scores:
            return Response(
                {
                    "detail": "No hay respuestas validas para calcular match.",
                    "code": "sin_respuestas",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(AnonMatchResultSerializer(scores, many=True).data)


class CandidatoMatchDetalleView(generics.GenericAPIView):
    """GET /api/v1/candidatos/<id>/match-detalle/ - explicacion del match del user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, candidato_id):
        try:
            candidato = Candidato.objects.get(id=candidato_id)
        except Candidato.DoesNotExist:
            return Response(
                {"detail": "Candidato no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        detalle = calcular_match_detalle(request.user, candidato)
        if detalle is None:
            return Response(
                {"detail": "El usuario aun no ha respondido preguntas para este candidato."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(detalle)
