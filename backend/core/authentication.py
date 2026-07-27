"""Autenticacion custom: Token de DRF con expiracion configurable.

El Token nativo de DRF es eterno hasta que se borra. Esta clase agrega TTL
leyendo `settings.TOKEN_TTL_DAYS`. Tokens mas viejos son rechazados y
borrados automaticamente para que el usuario deba re-loguearse.

Combinado con el endpoint POST /logout/ (que borra el token del user actual)
esto da un ciclo de vida completo:
- Login  -> crea/reusa token con `created` timestamp.
- Uso    -> ExpiringTokenAuthentication valida edad en cada request.
- Logout -> LogoutView borra el token (invalidacion inmediata).
- Cron   -> `manage.py limpiar_tokens_viejos` limpia tokens > TTL.
"""

from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


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
