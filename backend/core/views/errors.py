"""Handlers personalizados de errores HTTP.

Reemplaza los handlers default de Django que en DEBUG=True devuelven
HTML con la lista completa de URLs (OWASP ASVS V14.3.2, CWE-209).

Incluso en modo DEBUG, estos handlers aseguran que:
  - Los 404 respondan JSON consistente con el resto de la API REST.
  - Los 500 no expongan stack traces en el response body.
  (Django Debug Toolbar / logs siguen mostrando el detalle localmente.)

Registrar en api/urls.py:
  handler404 = "core.views.errors.handler_404"
  handler500 = "core.views.errors.handler_500"
"""

from django.http import HttpRequest, JsonResponse


def handler_404(request: HttpRequest, exception=None) -> JsonResponse:  # noqa: ARG001
    """404 JSON consistente. No lista URLs — ni en DEBUG ni en prod."""
    return JsonResponse(
        {"detail": "No encontrado."},
        status=404,
    )


def handler_500(request: HttpRequest) -> JsonResponse:
    """500 JSON generico. No expone stack traces en el body del response."""
    return JsonResponse(
        {"detail": "Error interno del servidor. Intentalo de nuevo."},
        status=500,
    )
