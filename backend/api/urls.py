"""URL configuration del proyecto Servel.

Rutas:

- /<ADMIN_URL>/          - Panel de Django admin (path configurable via env, F6)
- /api/health/           - Health check (fuera del versionado, para load balancers)
- /api/v1/health/        - Alias versionado del health check
- /api/v1/...            - API REST versionada v1
- /api/v1/schema/        - OpenAPI 3.0 schema (JSON/YAML)
- /api/v1/docs/          - Swagger UI
- /api/v1/redoc/         - ReDoc
- /media/...             - Archivos subidos (solo en DEBUG)
"""

from decouple import config as env_config

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .views import health_check

# F6: URL del admin configurable via env para reducir superficie de ataque.
# El path por defecto ('hidden-admin/') ya no es el estandar '/admin/'.
# En prod, usar un valor unico generado en el setup inicial.
_ADMIN_URL = env_config("DJANGO_ADMIN_URL", default="hidden-admin/")

# Handlers JSON personalizados (F17: no exponer lista de URLs en 404).
# Activos incluso en DEBUG: la API siempre responde JSON, no HTML.
handler404 = "core.views.errors.handler_404"
handler500 = "core.views.errors.handler_500"

urlpatterns = [
    # F6: admin en URL no estandar. El path real viene de DJANGO_ADMIN_URL en .env.
    path(_ADMIN_URL, admin.site.urls),
    # Health check fuera del versionado: siempre disponible en /api/health/
    # (usado por load balancers / uptime monitors que no deberian conocer versiones)
    path("api/health/", health_check, name="health-check"),
    # Alias versionado para consistencia con el resto de la API v1
    path("api/v1/health/", health_check, name="health-check-v1"),
    # API v1 (sin namespace para simplicidad; cuando exista v2, migrar a namespaces)
    path("api/v1/", include("core.urls")),
    # OpenAPI
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/v1/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
