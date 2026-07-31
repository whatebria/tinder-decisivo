"""Autenticacion custom: Token de DRF con expiracion configurable.

Clases:
- ExpiringTokenAuthentication: Token nativo + TTL configurable.
- CookieTokenAuthentication:   Lee el token desde una cookie httpOnly
  en lugar del header Authorization. Usada en clientes web (TASK-003).

El flujo dual es:
  1. Browser (web)  -> CookieTokenAuthentication  (cookie httpOnly, sin JS)
  2. Mobile nativo  -> ExpiringTokenAuthentication (Authorization: Token header)

Defensa CSRF: `SameSite=Lax` en la cookie auth_token impide que el browser
envie la cookie en POST cross-site. Es la mitigacion primaria segun OWASP.
No se implementa enforce_csrf() de DRF porque requeriria que el frontend
maneje el CSRF token manualmente (y CSRF_COOKIE_HTTPONLY=True en prod
impide leer el csrftoken desde JS). En caso de requerirlo a futuro,
cambiar CSRF_COOKIE_HTTPONLY=False y agregar enforce_csrf() aqui.
"""

from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


# Nombre de la cookie que guarda el token en clientes web.
AUTH_COOKIE_NAME = "auth_token"


def set_auth_cookie(response, token_key: str) -> None:
    """Setea la cookie httpOnly de autenticacion en la respuesta.

    Atributos:
    - httponly: JavaScript no puede leer el valor (protege contra XSS).
    - samesite=Lax: el browser no envia la cookie en POST cross-site (CSRF).
    - secure: solo en produccion (DEBUG=False) para forzar HTTPS.
    - max_age: sincronizado con TOKEN_TTL_DAYS para que cookie y token expiren juntos.
    """
    ttl_days = getattr(settings, "TOKEN_TTL_DAYS", 7)
    is_secure = not getattr(settings, "DEBUG", False)
    response.set_cookie(
        AUTH_COOKIE_NAME,
        token_key,
        max_age=ttl_days * 24 * 60 * 60,  # segundos
        httponly=True,
        samesite="Lax",
        secure=is_secure,
        path="/",
    )


def clear_auth_cookie(response) -> None:
    """Borra la cookie de autenticacion (logout web)."""
    response.delete_cookie(AUTH_COOKIE_NAME, path="/", samesite="Lax")


class ExpiringTokenAuthentication(TokenAuthentication):
    """TokenAuthentication con expiracion via `settings.TOKEN_TTL_DAYS`."""

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        ttl_days = getattr(settings, "TOKEN_TTL_DAYS", 30)
        expira_en = token.created + timedelta(days=ttl_days)

        if timezone.now() >= expira_en:
            # Borra el token vencido para que el proximo login genere uno nuevo.
            token.delete()
            raise AuthenticationFailed("Token expirado. Inicia sesion de nuevo.")

        return user, token


class CookieTokenAuthentication(ExpiringTokenAuthentication):
    """Lee el token desde la cookie httpOnly `auth_token` (clientes web).

    Reutiliza la logica de expiracion de ExpiringTokenAuthentication.
    Si la cookie no existe, devuelve None: DRF cae al siguiente backend
    (ExpiringTokenAuthentication via Authorization header, para mobile).
    """

    def authenticate(self, request):
        token_key = request.COOKIES.get(AUTH_COOKIE_NAME)
        if not token_key:
            return None  # No cookie -> DRF intenta el siguiente backend
        return self.authenticate_credentials(token_key)
