"""Servicio de reset de password (dominio puro, sin HTTP).

Flujo:
1. Usuario pide reset con su email  -> request_reset(email)
   - Si el email existe, genera token, guarda, envia email.
   - Si NO existe, no revela nada (security by obscurity).
2. Usuario confirma con token + nueva password -> confirm_reset(token, new_password)
   - Valida token vigente + no usado.
   - Cambia la password + marca token como usado.
   - Retorna el user para que la view pueda regenerar sesion / token de auth.
"""

from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.authtoken.models import Token

from ..models import PasswordResetToken

logger = logging.getLogger(__name__)
User = get_user_model()


@dataclass
class ResetRequestResult:
    """Resultado de request_reset.

    - email_sent: True si se envio el mail (o se hubiera enviado en prod).
    - reset_link: solo se popula cuando DEBUG=True (para facilitar testing).
                  En prod siempre es None.
    """

    email_sent: bool
    reset_link: Optional[str] = None


class ResetError(Exception):
    """Error de validacion en el flujo de reset (token invalido, password debil, etc.)."""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def request_reset(email: str) -> ResetRequestResult:
    """Genera un token de reset y envia el email.

    Invalida todos los tokens pendientes anteriores del mismo user antes de
    crear el nuevo (F2: un solo token activo por usuario en cualquier momento).

    NO revela si el email existe o no. Siempre retorna email_sent=True para
    evitar user enumeration attacks.
    """
    normalized = (email or "").strip().lower()
    if not normalized:
        raise ResetError("Email es obligatorio.")

    user = User.objects.filter(email__iexact=normalized).first()

    # Sin user: fingimos exito (security). Log a nivel INFO para investigacion.
    if user is None:
        logger.info("Reset solicitado para email inexistente: %s", normalized)
        return ResetRequestResult(email_sent=True)

    # F2: un solo token activo por usuario. Los pendientes anteriores quedan
    # marcados como usados (no borrados, para conservar auditoria).
    _invalidate_pending_tokens(user)

    token = _create_token(user)
    link = _build_reset_link(token.token)
    _send_reset_email(user, link)

    return ResetRequestResult(
        email_sent=True,
        reset_link=link if settings.DEBUG else None,
    )


def confirm_reset(token_str: str, new_password: str) -> User:
    """Confirma el reset y cambia la password.

    Valida:
    - token existe
    - no esta usado
    - no esta expirado
    - password nueva pasa los validators de Django

    Retorna el user modificado.
    """
    if not token_str:
        raise ResetError("Token es obligatorio.")
    if not new_password:
        raise ResetError("Password nueva es obligatoria.")

    try:
        token = PasswordResetToken.objects.select_related("user").get(token=token_str)
    except PasswordResetToken.DoesNotExist:
        raise ResetError("Token invalido.")

    if token.is_used:
        raise ResetError("Este token ya fue usado.")
    if token.is_expired:
        raise ResetError("Este token expiro. Solicita uno nuevo.")

    # Valida politica de password de Django (min length, no muy comun, etc.)
    try:
        validate_password(new_password, user=token.user)
    except DjangoValidationError as exc:
        raise ResetError(" ".join(exc.messages))

    user = token.user
    user.set_password(new_password)
    user.save(update_fields=["password"])

    token.used_at = timezone.now()
    token.save(update_fields=["used_at"])

    # Invalida todos los tokens de auth del usuario.
    # Si un atacante habia robado el token, ya no puede usarlo.
    Token.objects.filter(user=user).delete()

    logger.info("Password reseteada para user %s", user.username)
    return user


# ---------------------------------------------------------------------------
# Helpers privados
# ---------------------------------------------------------------------------
def _invalidate_pending_tokens(user: User) -> None:
    """Marca como usados todos los tokens de reset pendientes del usuario.

    Se llama antes de crear un token nuevo. Garantiza que en todo momento
    hay un unico token activo por usuario (F2).
    Usa used_at en lugar de delete() para preservar trazabilidad de auditoria.
    """
    PasswordResetToken.objects.filter(
        user=user,
        used_at__isnull=True,
        expires_at__gt=timezone.now(),
    ).update(used_at=timezone.now())


def _create_token(user: User) -> PasswordResetToken:
    """Crea un token seguro de 64 chars hex."""
    raw = secrets.token_urlsafe(48)  # ~64 chars base64 url-safe
    return PasswordResetToken.objects.create(
        user=user,
        token=raw,
        expires_at=PasswordResetToken.default_expires_at(),
    )


def _build_reset_link(token: str) -> str:
    """Construye el link que el usuario debe abrir para confirmar el reset.

    En dev/mobile no tenemos deep linking configurado; devolvemos la URL de la
    pantalla web con el token como query param. El frontend puede parsearlo.
    """
    base = getattr(settings, "PASSWORD_RESET_URL_BASE", "http://localhost:8081/reset-password")
    return f"{base}?token={token}"


def _send_reset_email(user: User, reset_link: str) -> None:
    """Envia el email con el link de reset.

    En dev usa console backend (imprime al stdout).
    En prod usa el EMAIL_BACKEND configurado (SMTP).
    """
    subject = "VotoAFin - Restablecer tu contrasena"
    body = (
        f"Hola {user.username},\n\n"
        f"Recibimos una solicitud para restablecer tu contrasena. "
        f"Abre el siguiente link para elegir una nueva:\n\n"
        f"{reset_link}\n\n"
        f"Este link expira en {PasswordResetToken.TTL_HOURS} hora(s). "
        f"Si no fuiste tu, ignora este email.\n\n"
        f"Equipo VotoAFin"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@votoafin.cl")

    send_mail(
        subject=subject,
        message=body,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )
