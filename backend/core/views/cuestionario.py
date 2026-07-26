"""Views del cuestionario: preguntas pendientes y submit de respuestas."""

import logging

from django.db import transaction
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
)
from rest_framework import status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Pregunta, RespuestaUsuario, TipoEleccion
from ..serializers import PreguntaSerializer, RespuestaUsuarioCreateSerializer
from ..services.respuestas import ReiniciarError, reiniciar_cuestionario

logger = logging.getLogger(__name__)


@extend_schema(
    parameters=[OpenApiParameter("tipo_eleccion_id", int, required=True)],
    responses={
        200: PreguntaSerializer(many=True),
        400: OpenApiResponse(description="tipo_eleccion_id faltante"),
    },
)
class PreguntasPendientesView(APIView):
    """Lista preguntas pendientes de responder.

    - Autenticado: excluye las que ya respondio el user.
    - Guest (anonymous): devuelve todas las preguntas del tipo de eleccion.
    """

    permission_classes = [permissions.AllowAny]

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

        pending = (
            Pregunta.objects.filter(tipo_eleccion_id=tipo_eleccion_id)
            .prefetch_related("opciones_respuesta")
            .order_by("orden")
        )

        # Solo filtramos por respondidas si hay user autenticado.
        if request.user and request.user.is_authenticated:
            answered_ids = RespuestaUsuario.objects.filter(
                user=request.user,
                pregunta__tipo_eleccion_id=tipo_eleccion_id,
            ).values_list("pregunta_id", flat=True)
            pending = pending.exclude(id__in=answered_ids)

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


@extend_schema(
    request={"application/json": {"type": "object", "properties": {"tipo_eleccion_id": {"type": "integer"}}, "required": ["tipo_eleccion_id"]}},
    responses={
        200: OpenApiResponse(description="Cuestionario reiniciado. Devuelve counts."),
        400: OpenApiResponse(description="tipo_eleccion_id faltante"),
        404: OpenApiResponse(description="Tipo de eleccion no encontrado"),
    },
)
class ReiniciarCuestionarioView(APIView):
    """Borra todas las respuestas + matches del user para un tipo de eleccion.

    NO toca favoritos, descartados ni decision final: esos son bookmarks
    personales aparte del cuestionario.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tipo_eleccion_id = request.data.get("tipo_eleccion_id")
        if not tipo_eleccion_id:
            return Response(
                {"detail": "Se requiere 'tipo_eleccion_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = reiniciar_cuestionario(request.user, int(tipo_eleccion_id))
        except ReiniciarError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except (TypeError, ValueError):
            return Response(
                {"detail": "tipo_eleccion_id invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "respuestas_borradas": result.respuestas_borradas,
                "matches_borrados": result.matches_borrados,
            },
            status=status.HTTP_200_OK,
        )
