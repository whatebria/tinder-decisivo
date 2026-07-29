"""View del resumen de progreso del user en todas sus elecciones.

Endpoint agregador: en 1 request devuelve, para el user autenticado,
el estado de cuestionario + top match por cada tipo de eleccion no-base.

Motivacion: la HomeScreen antes hacia N+M requests (useMatchesQuery +
usePreguntas por cada tipo activo). Esto explota HTTP a medida que
crece el numero de elecciones. Este endpoint mueve el fan-out al backend
donde puede resolverse con queries agregadas en O(1) round-trips.
"""

from django.db.models import Count
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    MatchCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
)
from ..serializers.catalog import CandidatoSerializer
from ..services.tipos import get_base_tipo_ids


class MiProgresoTopMatchSerializer(serializers.Serializer):
    """Shape reducido del top match para hero cards en el Home."""

    candidato = CandidatoSerializer(read_only=True)
    match_percentage = serializers.DecimalField(
        source="match_percentage_value",
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )
    preguntas_consideradas = serializers.IntegerField(
        source="num_preguntas_consideradas", read_only=True
    )
    confianza = serializers.CharField(read_only=True)
    confianza_display = serializers.CharField(
        source="get_confianza_display", read_only=True
    )


class MiProgresoItemSerializer(serializers.Serializer):
    """Un item por tipo de eleccion no-base."""

    tipo_eleccion_id = serializers.IntegerField()
    tipo_eleccion_nombre = serializers.CharField()
    total_preguntas = serializers.IntegerField()
    respondidas = serializers.IntegerField()
    completa = serializers.BooleanField()
    top_match = MiProgresoTopMatchSerializer(allow_null=True)


@extend_schema(
    responses={
        200: MiProgresoItemSerializer(many=True),
        401: OpenApiResponse(description="Autenticacion requerida"),
    },
    description=(
        "Resumen de progreso del user en TODOS los tipos de eleccion no-base. "
        "Para cada tipo devuelve total de preguntas (incluye base), cantidad "
        "respondida y el top match si el cuestionario esta completo."
    ),
)
class MiProgresoView(APIView):
    """GET /api/v1/mi-progreso/ — resumen agregado para el Home HUB.

    Contract: SIEMPRE devuelve una entry por cada tipo no-base, aunque el user
    no haya respondido nada (respondidas=0, completa=False, top_match=None).
    Esto simplifica al frontend: no tiene que sincronizar "tipos disponibles"
    con "tipos con progreso" — es la misma fuente.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        base_ids = get_base_tipo_ids()

        # Total de preguntas por tipo = preguntas del tipo + preguntas base.
        # Se resuelve en dos queries agregadas + un dict merge (mas simple
        # y mas legible que un CASE WHEN gigante).
        preguntas_por_tipo = dict(
            Pregunta.objects.values("tipo_eleccion_id")
            .annotate(n=Count("id"))
            .values_list("tipo_eleccion_id", "n")
        )
        base_count = sum(preguntas_por_tipo.get(bid, 0) for bid in base_ids)

        # Respuestas del user agrupadas por tipo. Solo interesan tipos no-base.
        respuestas_por_tipo = dict(
            RespuestaUsuario.objects.filter(user=user)
            .exclude(pregunta__tipo_eleccion_id__in=base_ids)
            .values("pregunta__tipo_eleccion_id")
            .annotate(n=Count("id"))
            .values_list("pregunta__tipo_eleccion_id", "n")
        )
        # Respuestas del user en preguntas base (se suma a TODOS los tipos).
        respuestas_base = (
            RespuestaUsuario.objects.filter(user=user)
            .filter(pregunta__tipo_eleccion_id__in=base_ids)
            .count()
        )

        # Top match por tipo: el MatchCandidato con mayor porcentaje del user.
        # Candidato.tipos_eleccion es M2M -> un candidato puede pertenecer a
        # varios tipos (raro pero posible: base + especifico). Iteramos los
        # matches ordenados desc y para cada tipo del candidato guardamos el
        # primero visto = el mejor. prefetch_related asegura 2 queries totales.
        top_matches = list(
            MatchCandidato.objects.filter(user=user)
            .select_related("candidato")
            .prefetch_related("candidato__tipos_eleccion")
            .order_by("-match_percentage_value")
        )
        top_match_por_tipo: dict[int, MatchCandidato] = {}
        for m in top_matches:
            for tipo in m.candidato.tipos_eleccion.all():
                if tipo.id not in top_match_por_tipo:
                    top_match_por_tipo[tipo.id] = m

        # Arma el resultado tipo por tipo. Excluye base (no tienen candidatos).
        tipos = TipoEleccion.objects.exclude(es_base=True).order_by("id")
        items = []
        for tipo in tipos:
            propias = preguntas_por_tipo.get(tipo.id, 0)
            total = propias + base_count
            respondidas = respuestas_por_tipo.get(tipo.id, 0) + respuestas_base
            # "completa" = respondio todas las preguntas del tipo + base.
            # El match se calcula perezosamente al llegar a Resultados, asi que
            # top_match puede estar None aunque completa=True hasta el primer
            # calculo. HomeScreen debe ser tolerante a eso.
            completa = total > 0 and respondidas >= total
            items.append(
                {
                    "tipo_eleccion_id": tipo.id,
                    "tipo_eleccion_nombre": tipo.nombre,
                    "total_preguntas": total,
                    "respondidas": respondidas,
                    "completa": completa,
                    "top_match": top_match_por_tipo.get(tipo.id),
                }
            )

        return Response(MiProgresoItemSerializer(items, many=True).data)
