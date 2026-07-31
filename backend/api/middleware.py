"""Content-Security-Policy middleware (F5 security review).

Agrega el header CSP a todas las responses. Politica diferenciada:
- Admin Django (HTML): directiva restrictiva con 'unsafe-inline' en script-src
  (necesario para el JS inline que genera el admin de Django).
- Todo lo demas (JSON API): politica maxima -- default-src 'none'.

No usa django-csp para evitar dependencia extra (YAGNI para este scope).
Detecta la URL del admin desde la env var DJANGO_ADMIN_URL (F6).

OWASP ASVS V14.4.3.
"""

from decouple import config as env_config
from django.conf import settings

# Path del admin: puede ser /admin/ o cualquier cosa configurada en DJANGO_ADMIN_URL.
_ADMIN_URL_PREFIX = "/" + env_config("DJANGO_ADMIN_URL", default="hidden-admin/")


class ContentSecurityPolicyMiddleware:
    """Inyecta CSP header en cada response HTTP."""

    # Politica para el admin de Django (sirve HTML con JS inline).
    # 'unsafe-inline' es necesario para los scripts del admin.
    # Endurecer si en el futuro se usa un admin theme sin inline scripts.
    CSP_ADMIN = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "font-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )

    # Politica maxima para la API JSON: no necesita recursos externos.
    CSP_API = (
        "default-src 'none'; "
        "frame-ancestors 'none';"
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # No sobreescribir si la response ya tiene CSP (ej. django-csp si se
        # instala en el futuro, o views que lo setean manualmente).
        if "Content-Security-Policy" in response:
            return response

        # En dev, no bloqueamos para no entorpecer el flujo de trabajo.
        # En prod (DEBUG=False) aplicamos la politica real.
        if not settings.DEBUG:
            path = request.path_info or ""
            policy = self.CSP_ADMIN if path.startswith(_ADMIN_URL_PREFIX) else self.CSP_API
            response["Content-Security-Policy"] = policy

        return response
