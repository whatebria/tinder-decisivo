"""Algoritmo de matching entre respuestas de usuario y posturas de candidatos.

Toda la logica de calculo vive aca, aislada del transporte HTTP.
Ver docs/algoritmo-tecnico.md para el diseno completo.

Arquitectura:
- score_pregunta / confianza_por_n         -> helpers puros
- _calcular_scores(user_map, tipo_eleccion) -> core del algoritmo, in-memory
- calcular_match(user, tipo_eleccion)       -> variante autenticada (persiste)
- calcular_match_anonimo(respuestas, tipo)  -> variante guest (no persiste)
"""

from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional, TypedDict

from django.db.models import Prefetch, Q

from ..models import (
    Candidato,
    Comuna,
    MatchCandidato,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
)
from .tipos import get_base_tipo_ids

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


def _tipo_ids_con_base(tipo_eleccion) -> list[int]:
    """Devuelve [tipo_eleccion.id, ...ids_de_tipos_base].

    Preguntas de tipos con `es_base=True` son transversales y aplican a TODAS
    las elecciones (valores/ideologia que se responden una sola vez).

    Los ids base vienen cacheados (ver services/tipos.py).
    """
    tipo_id = tipo_eleccion.id if hasattr(tipo_eleccion, "id") else int(tipo_eleccion)
    return list({tipo_id, *get_base_tipo_ids()})


def _filtrar_candidatos_por_territorio(qs, comuna: Optional[Comuna]):
    """Aplica filtro territorial polimorfico al queryset de candidatos.

    Ahora usa UnidadTerritorial (jerarquia). Un votante en Nunoa matchea con:
    - Candidatos con unidad_territorial=None (nacional puro, ej. presidenciales), O
    - Candidatos con unidad_territorial de la comuna Nunoa (alcaldes), O
    - Candidatos con unidad_territorial de cualquier ANCESTRO de Nunoa
      (distrito D10, region metropolitana, nacional).

    Este approach es plug-and-play: para agregar senadores por region, basta
    crear candidatos con unidad_territorial=<UT-regional>. El filtro los incluye
    automaticamente porque la region es ancestro de la comuna del votante.

    Retrocompat: sigue soportando el filtro viejo (comuna/distrito) para
    candidatos que aun no tienen unidad_territorial asignada.
    """
    if comuna is None:
        return qs
    # Buscar la UT correspondiente a la comuna del votante.
    from ..models import UnidadTerritorial
    ut_votante = UnidadTerritorial.objects.filter(
        codigo=f"COM-{comuna.codigo}",
    ).first()
    if ut_votante is None:
        # Fallback al filtro viejo si no hay UT.
        return qs.filter(
            Q(comuna__isnull=True, distrito__isnull=True)
            | Q(comuna_id=comuna.id)
            | Q(distrito_id=comuna.distrito_id)
        )
    # Cadena de ancestros del votante: [distrito, region, nacional].
    ids_permitidos = {ut_votante.id} | {a.id for a in ut_votante.ancestros()}
    return qs.filter(
        # Nuevo modelo: unidad_territorial es propia, ancestro o null (nacional).
        Q(unidad_territorial__isnull=True)
        | Q(unidad_territorial_id__in=ids_permitidos)
    )


# ------------------------------------------------------------
# Types
# ------------------------------------------------------------
class ScoreCandidato(TypedDict):
    """Resultado in-memory del match contra un candidato (sin persistir)."""

    candidato: Candidato
    match_percentage: Decimal
    num_preguntas_consideradas: int
    breakdown_por_eje: dict
    confianza: str


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
# Core del algoritmo (in-memory, sin DB writes)
# ------------------------------------------------------------
def _calcular_scores(
    user_map: dict, tipo_eleccion, comuna_usuario: Optional[Comuna] = None
) -> list[ScoreCandidato]:
    """Core del algoritmo. Recibe respuestas en memoria, devuelve scores.

    user_map: {pregunta_id: (valor_usuario, peso_multiplier, eje_tematico)}
    comuna_usuario: si se pasa, filtra candidatos por territorio del user.
    """
    if not user_map:
        return []

    candidatos_qs = Candidato.objects.filter(tipos_eleccion=tipo_eleccion)
    candidatos_qs = _filtrar_candidatos_por_territorio(candidatos_qs, comuna_usuario)
    candidatos = candidatos_qs.prefetch_related(
        Prefetch(
            "posturas_candidato",
            queryset=PosturaCandidato.objects.select_related("pregunta", "opcion_respuesta"),
        )
    )

    resultados: list[ScoreCandidato] = []
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

        resultados.append({
            "candidato": candidato,
            "match_percentage": porcentaje,
            "num_preguntas_consideradas": considered,
            "breakdown_por_eje": breakdown,
            "confianza": confianza_por_n(considered),
        })

    resultados.sort(key=lambda r: r["match_percentage"], reverse=True)
    return resultados


# ------------------------------------------------------------
# Servicios publicos
# ------------------------------------------------------------
def calcular_match(user, tipo_eleccion) -> Optional[list[MatchCandidato]]:
    """Calcula y persiste el match del usuario contra los candidatos.

    Devuelve lista ordenada desc de MatchCandidato, o None si el user no respondio nada.
    """
    tipo_ids = _tipo_ids_con_base(tipo_eleccion)
    respuestas = (
        RespuestaUsuario.objects
        .filter(user=user, pregunta__tipo_eleccion_id__in=tipo_ids)
        .select_related("opcion_elegida", "pregunta")
    )

    # Excluir explicitamente las opciones "No se" del cache en memoria.
    respuestas_validas = [r for r in respuestas if not r.opcion_elegida.es_no_se]
    if not respuestas_validas:
        return None

    user_map = {
        r.pregunta_id: (
            r.opcion_elegida.valor,
            PESO_MULTIPLIERS.get(r.peso, Decimal("1.0")),
            r.pregunta.eje_tematico,
        )
        for r in respuestas_validas
    }

    # Comuna del user para filtrar candidatos territorialmente.
    comuna_usuario = getattr(getattr(user, "profile", None), "comuna", None)
    scores = _calcular_scores(user_map, tipo_eleccion, comuna_usuario=comuna_usuario)

    # Persistir como MatchCandidato
    resultados: list[MatchCandidato] = []
    for s in scores:
        match_obj, _ = MatchCandidato.objects.update_or_create(
            user=user,
            candidato=s["candidato"],
            defaults={
                "match_percentage_value": s["match_percentage"],
                "num_preguntas_consideradas": s["num_preguntas_consideradas"],
                "breakdown_por_eje": s["breakdown_por_eje"],
                "confianza": s["confianza"],
            },
        )
        resultados.append(match_obj)
    return resultados


def calcular_match_detalle(user, candidato) -> Optional[dict]:
    """Devuelve el desglose pregunta-a-pregunta del match user vs candidato.

    Usado por la UI "por que X% de match". Incluye por cada pregunta donde ambos
    respondieron: valor y texto de la respuesta de cada uno, diff, score parcial,
    peso del usuario y su contribucion final al %.

    Devuelve None si el user no respondio nada para el tipo de eleccion del candidato.
    """
    tipos = list(candidato.tipos_eleccion.all())
    if not tipos:
        return None

    # Incluir tipos base: preguntas transversales aplican a candidatos de
    # cualquier eleccion (si el candidato tiene postura en ellas).
    # Usamos _tipo_ids_con_base para todos los tipos del candidato y unimos.
    tipo_ids: set[int] = set()
    for t in tipos:
        tipo_ids.update(_tipo_ids_con_base(t))

    respuestas = (
        RespuestaUsuario.objects
        .filter(user=user, pregunta__tipo_eleccion_id__in=tipo_ids)
        .select_related("opcion_elegida", "pregunta")
    )
    respuestas_validas = [r for r in respuestas if not r.opcion_elegida.es_no_se]
    if not respuestas_validas:
        return None

    posturas = (
        PosturaCandidato.objects
        .filter(candidato=candidato)
        .select_related("pregunta", "opcion_respuesta")
    )
    posturas_por_pregunta = {p.pregunta_id: p for p in posturas}

    items = []
    score_total = Decimal("0")
    peso_total = Decimal("0")

    for r in respuestas_validas:
        postura = posturas_por_pregunta.get(r.pregunta_id)
        if postura is None:
            continue  # candidato no tiene postura -> se ignora del calculo

        peso_mult = PESO_MULTIPLIERS.get(r.peso, Decimal("1.0"))
        diff = abs(r.opcion_elegida.valor - postura.opcion_respuesta.valor)
        score = score_pregunta(diff)
        contribucion = score * peso_mult

        score_total += contribucion
        peso_total += peso_mult

        items.append({
            "pregunta_id": r.pregunta_id,
            "pregunta_texto": r.pregunta.texto,
            "pregunta_orden": r.pregunta.orden,
            "eje_tematico": r.pregunta.eje_tematico,
            "eje_tematico_display": r.pregunta.get_eje_tematico_display(),
            "user_valor": r.opcion_elegida.valor,
            "user_texto": r.opcion_elegida.texto,
            "user_peso": r.peso,
            "user_peso_display": r.get_peso_display() if hasattr(r, "get_peso_display") else str(r.peso),
            "user_peso_multiplicador": float(peso_mult),
            "candidato_valor": postura.opcion_respuesta.valor,
            "candidato_texto": postura.opcion_respuesta.texto,
            "diff": diff,
            "score": float(score.quantize(Decimal("0.0001"))),
            "contribucion": float(contribucion.quantize(Decimal("0.0001"))),
            "coincide": diff == 0,
        })

    # Sort por contribucion descendente (mas influyentes arriba)
    items.sort(key=lambda x: (-x["contribucion"], x["pregunta_orden"]))

    porcentaje = (
        (score_total / peso_total * 100).quantize(Decimal("0.01"))
        if peso_total > 0 else Decimal("0.00")
    )

    return {
        "candidato_id": candidato.id,
        "candidato_nombre": f"{candidato.nombre} {candidato.apellido}".strip(),
        "match_percentage": float(porcentaje),
        "num_preguntas_consideradas": len(items),
        "confianza": confianza_por_n(len(items)),
        "items": items,
    }


def calcular_match_anonimo(
    respuestas_raw: Iterable[dict], tipo_eleccion, comuna: Optional[Comuna] = None
) -> list[ScoreCandidato]:
    """Variante para usuarios guest. Recibe respuestas en el body, no persiste nada.

    respuestas_raw: [{"pregunta_id": int, "opcion_id": int, "peso": int}]
    comuna: opcional, si se pasa filtra candidatos territorialmente.

    Valida que las opciones/preguntas existan y pertenezcan al tipo de eleccion.
    Ignora las respuestas con opciones "No se" (mismo criterio que el modo auth).
    """
    respuestas_list = list(respuestas_raw)
    if not respuestas_list:
        return []

    pregunta_ids = {r["pregunta_id"] for r in respuestas_list}
    opcion_ids = {r["opcion_id"] for r in respuestas_list}

    tipo_ids = _tipo_ids_con_base(tipo_eleccion)
    preguntas = {
        p.id: p
        for p in Pregunta.objects.filter(
            id__in=pregunta_ids, tipo_eleccion_id__in=tipo_ids
        )
    }
    opciones = {o.id: o for o in OpcionRespuesta.objects.filter(id__in=opcion_ids)}

    user_map: dict = {}
    for r in respuestas_list:
        pregunta = preguntas.get(r["pregunta_id"])
        opcion = opciones.get(r["opcion_id"])
        if pregunta is None or opcion is None:
            # Silenciosamente ignoramos respuestas invalidas (fail-safe).
            continue
        if opcion.es_no_se:
            continue
        peso = int(r.get("peso", RespuestaUsuario.PESO_POCO))
        user_map[pregunta.id] = (
            opcion.valor,
            PESO_MULTIPLIERS.get(peso, Decimal("1.0")),
            pregunta.eje_tematico,
        )

    return _calcular_scores(user_map, tipo_eleccion, comuna_usuario=comuna)
