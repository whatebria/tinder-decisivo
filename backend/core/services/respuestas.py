"""Servicios de gestion de respuestas del usuario.

Complementa a services/matching.py: aca vive la logica de RESET/borrado.
"""

from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth.models import User
from django.db import transaction

from ..models import MatchCandidato, OpcionRespuesta, RespuestaUsuario, TipoEleccion
from .matching import calcular_match


@dataclass(frozen=True)
class ReiniciarResult:
    """Cuantas cosas borro el reset. Util para logs y respuesta al cliente."""

    respuestas_borradas: int
    matches_borrados: int


class ReiniciarError(Exception):
    """Errores de dominio al reiniciar el cuestionario."""


class EditarRespuestaError(Exception):
    """Errores de dominio al editar una respuesta individual."""


@dataclass(frozen=True)
class EditarRespuestaResult:
    respuesta: RespuestaUsuario
    matches_actualizados: int


def editar_respuesta(
    user: User,
    respuesta_id: int,
    opcion_id: int,
    peso: int,
) -> EditarRespuestaResult:
    """Actualiza opcion_elegida + peso de una respuesta del user.

    Al mutar la respuesta, recalculamos INLINE los MatchCandidato del user
    contra candidatos del mismo tipo de eleccion. Usamos calcular_match que
    hace update_or_create: los rows existentes se UPDATE (no delete+insert),
    evitando fragmentacion del B-tree en SQLite (M4 del audit).

    Trade-off: la request de edicion paga el costo del recalculo inmediato
    (~50-100ms) en vez de defer al proximo GET /match-candidatos/. Ganamos
    matches siempre frescos + cero delete-recreate.

    Args:
        user: usuario autenticado (owner de la respuesta).
        respuesta_id: pk de la RespuestaUsuario a editar.
        opcion_id: pk de la nueva OpcionRespuesta.
        peso: nuevo peso (0-3).

    Raises:
        EditarRespuestaError: si la respuesta no existe, no es del user,
            la opcion no pertenece a la pregunta de la respuesta, o el peso
            esta fuera de rango.
    """
    if peso < 0 or peso > 3:
        raise EditarRespuestaError("Peso fuera de rango (0-3).")

    try:
        respuesta = RespuestaUsuario.objects.select_related(
            "pregunta", "pregunta__tipo_eleccion"
        ).get(id=respuesta_id, user=user)
    except RespuestaUsuario.DoesNotExist as e:
        raise EditarRespuestaError("Respuesta no encontrada.") from e

    try:
        opcion = OpcionRespuesta.objects.select_related("pregunta").get(id=opcion_id)
    except OpcionRespuesta.DoesNotExist as e:
        raise EditarRespuestaError("Opcion no encontrada.") from e

    if opcion.pregunta_id != respuesta.pregunta_id:
        raise EditarRespuestaError(
            "La opcion no pertenece a la pregunta de la respuesta."
        )

    tipo = respuesta.pregunta.tipo_eleccion

    with transaction.atomic():
        respuesta.opcion_elegida = opcion
        respuesta.peso = peso
        respuesta.save(update_fields=["opcion_elegida", "peso", "fecha_respuesta"])

        # Recalcular inline: update_or_create sobre los MatchCandidato
        # existentes (UPDATE in-place, sin delete + insert). Si la respuesta
        # editada es de un tipo base, calcular_match ya considera todas las
        # preguntas base + del tipo, no hace falta iterar sobre todos los
        # tipos donde el user respondio.
        matches = calcular_match(user, tipo)
        matches_actualizados = len(matches) if matches else 0

    return EditarRespuestaResult(
        respuesta=respuesta,
        matches_actualizados=matches_actualizados,
    )

def reiniciar_cuestionario(user: User, tipo_eleccion_id: int) -> ReiniciarResult:
    """Borra respuestas + matches del user para un tipo de eleccion.

    NO toca:
    - CandidatoFavorito (favoritos sobreviven)
    - CandidatoDescartado (descartados sobreviven)
        - Datos de OTROS tipos de eleccion

    Motivacion UX: si el usuario cambia de opinion y quiere responder de nuevo,
    no queremos perder los candidatos que ya marco como interesantes.
    Sus bookmarks son data personal aparte del cuestionario.

    Args:
        user: usuario autenticado.
        tipo_eleccion_id: pk del TipoEleccion a resetear.

    Returns:
        ReiniciarResult con counts.

    Raises:
        ReiniciarError: si el tipo_eleccion no existe.
    """
    if not TipoEleccion.objects.filter(id=tipo_eleccion_id).exists():
        raise ReiniciarError("Tipo de eleccion no encontrado.")

    with transaction.atomic():
        # Respuestas: filtramos por user + tipo del pregunta (join).
        respuestas_qs = RespuestaUsuario.objects.filter(
            user=user,
            pregunta__tipo_eleccion_id=tipo_eleccion_id,
        )
        respuestas_borradas, _ = respuestas_qs.delete()

        # Matches: el modelo NO tiene FK a tipo_eleccion (unique por user+candidato),
        # asi que borramos los matches del user contra candidatos de este tipo.
        # Si un candidato aparece en tipos multiples, su match se recalcula al
        # completar el otro cuestionario.
        matches_qs = MatchCandidato.objects.filter(
            user=user,
            candidato__tipos_eleccion__id=tipo_eleccion_id,
        )
        matches_borrados, _ = matches_qs.delete()

    return ReiniciarResult(
        respuestas_borradas=respuestas_borradas,
        matches_borrados=matches_borrados,
    )
