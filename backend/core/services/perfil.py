"""Servicio de gestion del perfil del usuario.

Cubre:
- Cambio de password (con verificacion del password actual)
- Eliminacion de cuenta (con verificacion de password)
- Actualizacion de comuna (con auto-invalidacion de matches cacheados)

El GET del perfil se resuelve directo en la view (es una lectura simple sin
logica de dominio).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework.authtoken.models import Token

from core.models import Comuna, MatchCandidato, UserProfile


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
        raise PerfilError("La contraseña actual es incorrecta.")

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        raise PerfilError(" ".join(e.messages)) from e

    if user.check_password(new_password):
        raise PerfilError("La nueva contraseña debe ser distinta de la actual.")

    user.set_password(new_password)
    user.save(update_fields=["password"])

    # Invalida todas las sesiones activas (tokens) del usuario.
    # Cualquier atacante que haya robado un token ya no puede usarlo.
    # El usuario necesitara hacer login de nuevo.
    Token.objects.filter(user=user).delete()


def eliminar_cuenta(user: User, password: str) -> None:
    """Borra la cuenta del usuario tras verificar su password.

    CASCADE de Django limpia todos los objetos relacionados:
    RespuestaUsuario, MatchCandidato, CandidatoFavorito, CandidatoDescartado,
    PasswordResetToken, Token (auth).

    Args:
        user: usuario autenticado a eliminar.
        password: password actual como confirmacion.

    Raises:
        PerfilError: si el password no coincide.
    """
    if not user.check_password(password):
        raise PerfilError("La contraseña es incorrecta.")

    with transaction.atomic():
        user.delete()


@dataclass
class ActualizarComunaResult:
    """Resultado de actualizar la comuna del usuario.

    Attributes:
        profile: perfil actualizado (con la comuna nueva).
        comuna_cambio: True si la comuna es distinta a la que tenia antes.
        matches_invalidados: cantidad de MatchCandidato borrados por
            invalidacion. Cero si la comuna no cambio.
    """

    profile: UserProfile
    comuna_cambio: bool
    matches_invalidados: int


def actualizar_comuna(user: User, comuna_id: Optional[int]) -> ActualizarComunaResult:
    """Setea (o limpia) la comuna donde vota el usuario.

    Cuando la comuna EFECTIVAMENTE cambia (distinta a la anterior), se
    invalidan todos los MatchCandidato cacheados del user. Motivo: el
    algoritmo de matching filtra candidatos segun el territorio del user;
    los matches viejos apuntan a candidatos que quiza ya no le corresponden.
    Los matches se re-calculan en la proxima llamada a POST /match-candidatos/.

    Si el user pasa el MISMO comuna_id que ya tenia, es un no-op: no se
    borra nada (evita trabajo caro innecesario).

    Args:
        user: usuario autenticado.
        comuna_id: id de la comuna nueva, o None para limpiar.

    Returns:
        ActualizarComunaResult con el perfil actualizado + flags.

    Raises:
        Comuna.DoesNotExist: si comuna_id no existe.
    """
    profile, _ = UserProfile.objects.get_or_create(user=user)
    comuna_anterior_id = profile.comuna_id

    nueva_comuna = (
        Comuna.objects.select_related("region", "distrito").get(id=comuna_id)
        if comuna_id is not None
        else None
    )

    comuna_cambio = comuna_anterior_id != (nueva_comuna.id if nueva_comuna else None)
    matches_invalidados = 0

    with transaction.atomic():
        profile.comuna = nueva_comuna
        profile.save(update_fields=["comuna", "fecha_actualizacion"])

        if comuna_cambio:
            # Los matches cacheados quedan invalidos porque el filtro
            # territorial cambia. Se recalculan on-demand en el proximo
            # POST /match-candidatos/.
            matches_invalidados, _ = MatchCandidato.objects.filter(
                user=user
            ).delete()

    return ActualizarComunaResult(
        profile=profile,
        comuna_cambio=comuna_cambio,
        matches_invalidados=matches_invalidados,
    )
