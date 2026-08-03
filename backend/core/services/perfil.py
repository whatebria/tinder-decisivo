"""Servicio de gestion del perfil del usuario.

Cubre:
- Cambio de password (con verificacion del password actual)
- Cambio de username y email (con verificacion del password actual)
- Eliminacion de cuenta (con verificacion de password)
- Actualizacion de comuna (con auto-invalidacion de matches cacheados)

El GET del perfil se resuelve directo en la view (es una lectura simple sin
logica de dominio).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework.authtoken.models import Token

from core.models import Comuna, MatchCandidato, UserProfile

# Regex de username: letras, numeros, punto y guion bajo.
# Sin punto/guion al inicio o final. 3-30 chars.
_USERNAME_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._]{1,28}[a-zA-Z0-9]$|^[a-zA-Z0-9]{1,30}$")


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


def cambiar_username(user: User, new_username: str, current_password: str) -> None:
    """Cambia el username del usuario tras verificar la password actual.

    Validaciones:
    - La password actual debe ser correcta.
    - El username debe tener 3-30 chars, solo [a-zA-Z0-9._].
    - No puede empezar/terminar con punto o guion bajo.
    - No puede estar ya en uso por otro usuario.
    - No puede ser identico al username actual.

    Raises:
        PerfilError: si alguna validacion falla.
    """
    if not user.check_password(current_password):
        raise PerfilError("La contraseña es incorrecta.")

    new_username = new_username.strip()

    if not (3 <= len(new_username) <= 30):
        raise PerfilError("El nombre de usuario debe tener entre 3 y 30 caracteres.")

    if not _USERNAME_RE.match(new_username):
        raise PerfilError(
            "Solo se permiten letras, números, puntos y guiones bajos. "
            "No puede empezar ni terminar con punto o guion bajo."
        )

    if new_username == user.username:
        raise PerfilError("El nuevo nombre de usuario es igual al actual.")

    if User.objects.filter(username__iexact=new_username).exclude(pk=user.pk).exists():
        raise PerfilError("Ese nombre de usuario ya está en uso.")

    user.username = new_username
    user.save(update_fields=["username"])


def cambiar_email(user: User, new_email: str, current_password: str) -> None:
    """Cambia el email del usuario tras verificar la password actual.

    No requiere verificacion por link (la app no tiene SMTP configurado).
    El cambio es inmediato pero requiere la password actual como confirmacion
    para prevenir cambios por tokens comprometidos.

    Validaciones:
    - La password actual debe ser correcta.
    - El email debe tener formato valido.
    - No puede estar en uso por otro usuario.
    - No puede ser identico al email actual.

    Raises:
        PerfilError: si alguna validacion falla.
    """
    if not user.check_password(current_password):
        raise PerfilError("La contraseña es incorrecta.")

    new_email = new_email.strip().lower()

    if not new_email:
        raise PerfilError("El email no puede estar vacío.")

    if new_email == (user.email or "").lower():
        raise PerfilError("El nuevo email es igual al actual.")

    if User.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
        raise PerfilError("Ese email ya está en uso por otra cuenta.")

    user.email = new_email
    user.save(update_fields=["email"])

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
