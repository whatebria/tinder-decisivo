"""Views a nivel proyecto (fuera de las apps).

Contiene el health check para load balancers / uptime monitoring.
"""

import django
from django.conf import settings
from django.db import DatabaseError, connection
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

API_VERSION = "1.0.0"


@extend_schema(
    responses={
        200: OpenApiResponse(description="Sistema OK"),
        503: OpenApiResponse(description="DB caida u otro fallo"),
    },
    tags=["meta"],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Devuelve el estado del sistema.

    Chequea:
    - App corre (200).
    - DB responde (SELECT 1).
    - Version de la API expuesta para debugging cross-env.

    Responde 200 si todo bien, 503 si la DB no responde.
    """
    payload = {
        "status": "ok",
        "api_version": API_VERSION,
        "django_version": django.get_version(),
        "debug": settings.DEBUG,
        "checks": {"database": "unknown"},
    }

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        payload["checks"]["database"] = "ok"
    except DatabaseError as exc:
        payload["status"] = "degraded"
        payload["checks"]["database"] = f"error: {exc}"
        return Response(payload, status=503)

    return Response(payload)
