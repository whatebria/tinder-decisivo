"""Views del cuestionario: preguntas pendientes y submit de respuestas."""

import logging

from django.db import transaction
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
)
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Pregunta, RespuestaUsuario, TipoEleccion
from ..serializers import PreguntaSerializer, RespuestaUsuarioCreateSerializer

logger = logging.getLogger(__name__)


@extend_schema(
    parameters=[OpenApiParameter("tipo_eleccion_id", int, required=True)],
    responses={
        200: PreguntaSerializer(many=True),
        400: OpenApiResponse(description="tipo_eleccion_id faltante"),
    },
)
class PreguntasPendientesView(APIView):
    def get(self, request):
        tipo_eleccion_id = request.query_params.get("tipo_eleccion_id")
        if not tipo_eleccion_id:
            return Response(
                {"detail": "Se requiere el parametro 'tipo_eleccion_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not TipoEleccion.objects.filter(id=tipo_eleccion_id).exists():
            return Response(
                {"detail": "Tipo de eleccion no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        answered_ids = RespuestaUsuario.objects.filter(
            user=request.user,
            pregunta__tipo_eleccion_id=tipo_eleccion_id,
        ).values_list("pregunta_id", flat=True)

        pending = (
            Pregunta.objects.filter(tipo_eleccion_id=tipo_eleccion_id)
            .exclude(id__in=answered_ids)
            .prefetch_related("opciones_respuesta")
            .order_by("orden")
        )
        return Response(PreguntaSerializer(pending, many=True).data)


@extend_schema(
    request=RespuestaUsuarioCreateSerializer(many=True),
    responses={
        201: OpenApiResponse(description="Respuestas guardadas OK"),
        400: OpenApiResponse(description="Payload invalido"),
    },
)
class SubmitUserAnswersView(APIView):
    def post(self, request):
        serializer = RespuestaUsuarioCreateSerializer(
            data=request.data, many=True, context={"request": request}
        )
        if not serializer.is_valid():
            logger.warning("Datos de respuestas invalidos: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                for item in serializer.validated_data:
                    RespuestaUsuario.objects.update_or_create(
                        user=request.user,
                        pregunta=item["pregunta"],
                        defaults={
                            "opcion_elegida": item["opcion_elegida"],
                            "peso": item.get("peso", RespuestaUsuario.PESO_POCO),
                        },
                    )
        except Exception as exc:
            logger.exception("Error al guardar respuestas: %s", exc)
            return Response(
                {"detail": "Error interno al procesar respuestas."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Respuestas procesadas exitosamente."},
            status=status.HTTP_201_CREATED,
        )
