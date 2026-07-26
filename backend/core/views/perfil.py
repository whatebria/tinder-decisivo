"""Views del perfil del usuario: info, cambiar password, eliminar cuenta."""

import logging

from django.db.models import Count
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    CandidatoDescartado,
    CandidatoFavorito,
    Comuna,
    DecisionFinal,
    RespuestaUsuario,
    UserProfile,
)
from ..serializers.perfil import (
    ActualizarComunaSerializer,
    CambiarPasswordSerializer,
    ComunaInlineSerializer,
    EliminarCuentaSerializer,
    PerfilSerializer,
)
from ..services.perfil import PerfilError, cambiar_password, eliminar_cuenta

logger = logging.getLogger(__name__)


class PerfilView(APIView):
    """GET: devuelve info del user + contadores. DELETE: elimina la cuenta."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: PerfilSerializer})
    def get(self, request):
        user = request.user
        # Asegura que el profile exista aunque no haya corrido el backfill.
        profile, _ = UserProfile.objects.select_related(
            "comuna", "comuna__region", "comuna__distrito"
        ).get_or_create(user=user)
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "fecha_registro": user.date_joined,
            "contadores": {
                "respuestas": RespuestaUsuario.objects.filter(user=user).count(),
                "favoritos": CandidatoFavorito.objects.filter(user=user).count(),
                "descartados": CandidatoDescartado.objects.filter(user=user).count(),
                "decisiones": DecisionFinal.objects.filter(user=user).count(),
            },
            "comuna": (
                ComunaInlineSerializer(profile.comuna).data
                if profile.comuna_id else None
            ),
        }
        return Response(data)

    @extend_schema(
        request=EliminarCuentaSerializer,
        responses={
            204: OpenApiResponse(description="Cuenta eliminada"),
            400: OpenApiResponse(description="Password incorrecta o faltante"),
        },
    )
    def delete(self, request):
        serializer = EliminarCuentaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            eliminar_cuenta(request.user, serializer.validated_data["password"])
        except PerfilError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


class CambiarPasswordView(APIView):
    """POST /perfil/cambiar-password/: cambia password verificando la actual."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=CambiarPasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password actualizada"),
            400: OpenApiResponse(description="Password actual incorrecta o nueva invalida"),
        },
    )
    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            cambiar_password(
                request.user,
                serializer.validated_data["current_password"],
                serializer.validated_data["new_password"],
            )
        except PerfilError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Contrasena actualizada."}, status=status.HTTP_200_OK)


class ActualizarComunaView(APIView):
    """PATCH /perfil/comuna/: setea o limpia la comuna donde vota el usuario.

    Body: {"comuna_id": <int|null>}
    Respuesta: perfil actualizado con la comuna inline.
    """

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ActualizarComunaSerializer,
        responses={
            200: ComunaInlineSerializer(allow_null=True),
            400: OpenApiResponse(description="comuna_id invalido"),
        },
    )
    def patch(self, request):
        serializer = ActualizarComunaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        comuna_id = serializer.validated_data["comuna_id"]
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.comuna = (
            Comuna.objects.select_related("region", "distrito").get(id=comuna_id)
            if comuna_id else None
        )
        profile.save(update_fields=["comuna", "fecha_actualizacion"])

        return Response(
            ComunaInlineSerializer(profile.comuna).data if profile.comuna else None,
            status=status.HTTP_200_OK,
        )

