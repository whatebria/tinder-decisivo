"""Servicio de gestion del perfil del usuario.

Cubre:
- Cambio de password (con verificacion del password actual)
- Eliminacion de cuenta (con verificacion de password)

El GET del perfil se resuelve directo en la view (es una lectura simple sin
logica de dominio).
"""

from __future__ import annotations

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction


class PerfilError(Exception):
    """Errores de dominio al operar sobre el perfil."""


def cambiar_password(user: User, current_password: str, new_password: str) -> None:
    """Cambia la password del usuario tras verificar la actual.

    Args:
        user: usuario autenticado.
        current_password: password actual (para prevenir cambio ajeno con
            token robado).
        new_password: nueva password a setear.

    Raises:
        PerfilError: si la password actual es incorrecta o la nueva no
            pasa los validators de Django.
    """
    if not user.check_password(current_password):
        raise PerfilError("La contrasena actual es incorrecta.")

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        raise PerfilError(" ".join(e.messages)) from e

    if user.check_password(new_password):
        raise PerfilError("La nueva contrasena debe ser distinta de la actual.")

    user.set_password(new_password)
    user.save(update_fields=["password"])


def eliminar_cuenta(user: User, password: str) -> None:
    """Borra la cuenta del usuario tras verificar su password.

    CASCADE de Django limpia todos los objetos relacionados:
    RespuestaUsuario, MatchCandidato, CandidatoFavorito, CandidatoDescartado,
    DecisionFinal, PasswordResetToken, Token (auth).

    Args:
        user: usuario autenticado a eliminar.
        password: password actual como confirmacion.

    Raises:
        PerfilError: si el password no coincide.
    """
    if not user.check_password(password):
        raise PerfilError("La contrasena es incorrecta.")

    with transaction.atomic():
        user.delete()
