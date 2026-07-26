"""Servicios de gestion de respuestas del usuario.

Complementa a services/matching.py: aca vive la logica de RESET/borrado.
"""

from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth.models import User
from django.db import transaction

from ..models import MatchCandidato, RespuestaUsuario, TipoEleccion


@dataclass(frozen=True)
class ReiniciarResult:
    """Cuantas cosas borro el reset. Util para logs y respuesta al cliente."""

    respuestas_borradas: int
    matches_borrados: int


class ReiniciarError(Exception):
    """Errores de dominio al reiniciar el cuestionario."""


def reiniciar_cuestionario(user: User, tipo_eleccion_id: int) -> ReiniciarResult:
    """Borra respuestas + matches del user para un tipo de eleccion.

    NO toca:
    - CandidatoFavorito (favoritos sobreviven)
    - CandidatoDescartado (descartados sobreviven)
    - DecisionFinal (voto guardado sobrevive)
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
