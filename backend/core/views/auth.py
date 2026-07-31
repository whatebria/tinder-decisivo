"""Views de autenticacion: registro, login, password reset."""

import logging

from django.contrib.auth.models import User
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from ..serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserSerializer,
)
from ..services.password_reset import ResetError, confirm_reset, request_reset

logger = logging.getLogger(__name__)


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"


class CustomAuthToken(ObtainAuthToken):
    """Login. Retorna token y user_id (sin email — F18 privacy minimization)."""

    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        # Rotamos el token en cada login para invalidar sesiones viejas.
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        # F18: email removido de la response. El frontend lo obtiene via
        # GET /api/v1/perfil/ que es el endpoint autoritativo para datos de usuario.
        return Response({"token": token.key, "user_id": user.pk})


class LogoutView(APIView):
    """POST /logout/ -> borra el token del user actual (invalidacion inmediata)."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            204: OpenApiResponse(description="Sesion cerrada"),
        },
    )
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    request=PasswordResetRequestSerializer,
    responses={
        200: OpenApiResponse(
            description=(
                "email_sent siempre True (no revelamos si el email existe). "
                "En DEBUG=True devuelve reset_link para testing."
            )
        ),
    },
)
class PasswordResetRequestView(APIView):
    """POST /password-reset/request/ -> genera token y envia email."""

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = request_reset(serializer.validated_data["email"])
        except ResetError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        payload = {"email_sent": result.email_sent}
        if result.reset_link:  # solo si DEBUG=True
            payload["reset_link"] = result.reset_link
        return Response(payload, status=status.HTTP_200_OK)


@extend_schema(
    request=PasswordResetConfirmSerializer,
    responses={
        200: OpenApiResponse(description="Password cambiada"),
        400: OpenApiResponse(description="Token invalido / expirado / password debil"),
    },
)
class PasswordResetConfirmView(APIView):
    """POST /password-reset/confirm/ -> cambia password si el token es valido."""

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            confirm_reset(
                serializer.validated_data["token"],
                serializer.validated_data["new_password"],
            )
        except ResetError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Contrasena actualizada. Puedes iniciar sesion."})
