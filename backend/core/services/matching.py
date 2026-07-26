"""Algoritmo de matching entre respuestas de usuario y posturas de candidatos.

Toda la logica de calculo vive aca, aislada del transporte HTTP.
Ver docs/algoritmo-tecnico.md para el diseno completo.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from django.db.models import Prefetch

from ..models import (
    Candidato,
    MatchCandidato,
    PosturaCandidato,
    RespuestaUsuario,
)

# ------------------------------------------------------------
# Constantes del algoritmo
# ------------------------------------------------------------
# Con opciones en escala 1..5, la maxima diferencia posible es 4.
MAX_DIFF_ESCALA = Decimal("4")

# Multiplicador por peso declarado del usuario.
# PESO_NO_IMPORTA (0) -> 0.5x  (la pregunta cuenta la mitad, no cero, para no ignorar del todo)
# PESO_POCO       (1) -> 1.0x  (peso neutro, default)
# PESO_MEDIO      (2) -> 1.5x
# PESO_MUCHO      (3) -> 2.0x  (dealbreaker efectivo)
PESO_MULTIPLIERS = {
    0: Decimal("0.5"),
    1: Decimal("1.0"),
    2: Decimal("1.5"),
    3: Decimal("2.0"),
}

# Umbrales para el nivel de confianza del match.
CONFIANZA_UMBRAL_MEDIA = 5
CONFIANZA_UMBRAL_ALTA = 10


# ------------------------------------------------------------
# Helpers puros (sin side effects, facilmente testeables)
# ------------------------------------------------------------
def score_pregunta(diff: int) -> Decimal:
    """Score no-lineal por pregunta: 1 - (diff/4)^2.

    Penaliza mas fuerte las diferencias grandes.
    diff=0 -> 1.00 (100%)
    diff=1 -> 0.9375
    diff=2 -> 0.75
    diff=3 -> 0.4375
    diff=4 -> 0.00
    """
    normalized = Decimal(diff) / MAX_DIFF_ESCALA
    return Decimal("1") - (normalized * normalized)


def confianza_por_n(n: int) -> str:
    """Devuelve el nivel de confianza segun cantidad de preguntas consideradas."""
    if n >= CONFIANZA_UMBRAL_ALTA:
        return MatchCandidato.CONFIANZA_ALTA
    if n >= CONFIANZA_UMBRAL_MEDIA:
        return MatchCandidato.CONFIANZA_MEDIA
    return MatchCandidato.CONFIANZA_TENTATIVA


# ------------------------------------------------------------
# Servicio principal
# ------------------------------------------------------------
def calcular_match(user, tipo_eleccion) -> Optional[list[MatchCandidato]]:
    """Calcula y persiste el match del usuario contra los candidatos.

    Reglas:
    - Solo se consideran preguntas donde el user *y* el candidato tienen postura.
    - Se ignoran las respuestas del user marcadas como 'No se' (es_no_se=True).
    - Score no-lineal (1 - (diff/4)^2) para penalizar diferencias grandes.
    - Promedio ponderado por el peso declarado por el user (0..3 -> 0.5x..2x).
    - Breakdown por eje tematico para radar chart en el frontend.
    - Nivel de confianza segun N preguntas consideradas.

    Devuelve lista ordenada desc de MatchCandidato, o None si el user no respondio nada.
    """
    respuestas = (
        RespuestaUsuario.objects
        .filter(user=user, pregunta__tipo_eleccion=tipo_eleccion)
        .select_related("opcion_elegida", "pregunta")
    )

    # Excluir explicitamente las opciones "No se" del cache en memoria.
    respuestas_validas = [r for r in respuestas if not r.opcion_elegida.es_no_se]

    if not respuestas_validas:
        return None

    # {pregunta_id: (valor_usuario, peso_r, eje_tematico)}
    user_map = {
        r.pregunta_id: (
            r.opcion_elegida.valor,
            PESO_MULTIPLIERS.get(r.peso, Decimal("1.0")),
            r.pregunta.eje_tematico,
        )
        for r in respuestas_validas
    }

    candidatos = Candidato.objects.filter(tipos_eleccion=tipo_eleccion).prefetch_related(
        Prefetch(
            "posturas_candidato",
            queryset=PosturaCandidato.objects.select_related("pregunta", "opcion_respuesta"),
        )
    )

    resultados = []
    for candidato in candidatos:
        score_total = Decimal("0")
        peso_total = Decimal("0")
        considered = 0
        # eje -> [score_ponderado_acumulado, peso_acumulado, count]
        breakdown_acc: dict[str, list] = {}

        for postura in candidato.posturas_candidato.all():
            info = user_map.get(postura.pregunta_id)
            if info is None:
                continue
            valor_user, peso_mult, eje = info

            diff = abs(valor_user - postura.opcion_respuesta.valor)
            score = score_pregunta(diff)
            score_ponderado = score * peso_mult

            score_total += score_ponderado
            peso_total += peso_mult
            considered += 1

            acc = breakdown_acc.setdefault(eje, [Decimal("0"), Decimal("0"), 0])
            acc[0] += score_ponderado
            acc[1] += peso_mult
            acc[2] += 1

        if peso_total > 0:
            porcentaje = (score_total / peso_total * 100).quantize(Decimal("0.01"))
        else:
            porcentaje = Decimal("0.00")

        breakdown = {
            eje: {
                "porcentaje": float(
                    (score_acc / peso_acc * 100).quantize(Decimal("0.01"))
                    if peso_acc > 0 else Decimal("0.00")
                ),
                "preguntas": count,
            }
            for eje, (score_acc, peso_acc, count) in breakdown_acc.items()
        }

        match_obj, _ = MatchCandidato.objects.update_or_create(
            user=user,
            candidato=candidato,
            defaults={
                "match_percentage_value": porcentaje,
                "num_preguntas_consideradas": considered,
                "breakdown_por_eje": breakdown,
                "confianza": confianza_por_n(considered),
            },
        )
        resultados.append(match_obj)

    resultados.sort(key=lambda m: m.match_percentage_value, reverse=True)
    return resultados
