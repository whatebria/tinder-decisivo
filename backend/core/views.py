"""API views para Servel."""

import logging
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Prefetch
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
)

from .models import (
    Candidato,
    CandidatoDescartado,
    CandidatoFavorito,
    DecisionFinal,
    MatchCandidato,
    Noticia,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
)
from .serializers import (
    CandidatoDescartadoSerializer,
    CandidatoFavoritoSerializer,
    CandidatoSerializer,
    DecisionFinalSerializer,
    MatchCandidatoResultSerializer,
    NoticiaSerializer,
    PreguntaSerializer,
    RespuestaUsuarioCreateSerializer,
    TipoEleccionSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)

# ------------------------------------------------------------
# Constantes del algoritmo de matching
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


# ============================================================
# Auth
# ============================================================
class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class CustomAuthToken(ObtainAuthToken):
    """Login. Retorna token, user_id y email."""

    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user_id": user.pk, "email": user.email})


# ============================================================
# Catalogos
# ============================================================
class TipoEleccionListView(generics.ListAPIView):
    queryset = TipoEleccion.objects.all()
    serializer_class = TipoEleccionSerializer


class CandidatoListView(generics.ListAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer


class CandidatoDetailView(generics.RetrieveAPIView):
    queryset = Candidato.objects.all().prefetch_related("tipos_eleccion")
    serializer_class = CandidatoSerializer


# ============================================================
# Preguntas / respuestas
# ============================================================
@extend_schema(
    parameters=[OpenApiParameter("tipo_eleccion_id", int, required=True)],
    responses={200: PreguntaSerializer(many=True), 400: OpenApiResponse(description="tipo_eleccion_id faltante")},
)
class PreguntasPendientesView(APIView):
    def get(self, request):
        tipo_eleccion_id = request.query_params.get("tipo_eleccion_id")
        if not tipo_eleccion_id:
            return Response(
                {"detail": "Se requiere el parametro 'tipo_eleccion_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not TipoEleccion.objects.filter(id=tipo_eleccion_id).exists():
            return Response(
                {"detail": "Tipo de eleccion no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        answered_ids = RespuestaUsuario.objects.filter(
            user=request.user,
            pregunta__tipo_eleccion_id=tipo_eleccion_id,
        ).values_list("pregunta_id", flat=True)

        pending = (
            Pregunta.objects.filter(tipo_eleccion_id=tipo_eleccion_id)
            .exclude(id__in=answered_ids)
            .prefetch_related("opciones_respuesta")
            .order_by("orden")
        )
        return Response(PreguntaSerializer(pending, many=True).data)


@extend_schema(
    request=RespuestaUsuarioCreateSerializer(many=True),
    responses={
        201: OpenApiResponse(description="Respuestas guardadas OK"),
        400: OpenApiResponse(description="Payload invalido"),
    },
)
class SubmitUserAnswersView(APIView):
    def post(self, request):
        serializer = RespuestaUsuarioCreateSerializer(
            data=request.data, many=True, context={"request": request}
        )
        if not serializer.is_valid():
            logger.warning("Datos de respuestas invalidos: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                for item in serializer.validated_data:
                    RespuestaUsuario.objects.update_or_create(
                        user=request.user,
                        pregunta=item["pregunta"],
                        defaults={
                            "opcion_elegida": item["opcion_elegida"],
                            "peso": item.get("peso", RespuestaUsuario.PESO_POCO),
                        },
                    )
        except Exception as exc:
            logger.exception("Error al guardar respuestas: %s", exc)
            return Response(
                {"detail": "Error interno al procesar respuestas."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Respuestas procesadas exitosamente."},
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# Matching (algoritmo robusto)
# ============================================================
def _score_pregunta(diff: int) -> Decimal:
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


def _confianza_por_n(n: int) -> str:
    if n >= CONFIANZA_UMBRAL_ALTA:
        return MatchCandidato.CONFIANZA_ALTA
    if n >= CONFIANZA_UMBRAL_MEDIA:
        return MatchCandidato.CONFIANZA_MEDIA
    return MatchCandidato.CONFIANZA_TENTATIVA


def _calcular_match(user, tipo_eleccion):
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
        breakdown_acc = {}

        for postura in candidato.posturas_candidato.all():
            info = user_map.get(postura.pregunta_id)
            if info is None:
                continue
            valor_user, peso_mult, eje = info

            diff = abs(valor_user - postura.opcion_respuesta.valor)
            score = _score_pregunta(diff)
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
                "confianza": _confianza_por_n(considered),
            },
        )
        resultados.append(match_obj)

    resultados.sort(key=lambda m: m.match_percentage_value, reverse=True)
    return resultados


class MatchCandidatoViewSet(viewsets.GenericViewSet):
    """Calculo de match. Usa POST porque persiste estado (no idempotente en el sentido HTTP)."""

    serializer_class = MatchCandidatoResultSerializer

    @action(detail=False, methods=["post"])
    def match_candidatos(self, request):
        tipo_eleccion_id = request.data.get("tipo_eleccion_id") or request.query_params.get(
            "tipo_eleccion_id"
        )
        if not tipo_eleccion_id:
            return Response(
                {"detail": "Falta el parametro 'tipo_eleccion_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tipo_eleccion = TipoEleccion.objects.get(id=tipo_eleccion_id)
        except TipoEleccion.DoesNotExist:
            return Response(
                {"detail": "Tipo de eleccion no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        resultados = _calcular_match(request.user, tipo_eleccion)
        if resultados is None:
            return Response(
                {"detail": "El usuario no ha respondido preguntas para este tipo de eleccion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(MatchCandidatoResultSerializer(resultados, many=True).data)


# ============================================================
# Favoritos / Descartados / Decision Final
# ============================================================
class _UserScopedCreateListDestroy(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Base para viewsets que solo listan/crean/borran items del user actual."""

    def get_queryset(self):
        return self.queryset_class.objects.filter(user=self.request.user).select_related(
            "candidato"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CandidatoFavoritoViewSet(_UserScopedCreateListDestroy):
    serializer_class = CandidatoFavoritoSerializer
    queryset_class = CandidatoFavorito
    queryset = CandidatoFavorito.objects.none()  # hint para drf-spectacular


class CandidatoDescartadoViewSet(_UserScopedCreateListDestroy):
    serializer_class = CandidatoDescartadoSerializer
    queryset_class = CandidatoDescartado
    queryset = CandidatoDescartado.objects.none()  # hint para drf-spectacular


class DecisionFinalViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Voto final del usuario por tipo de eleccion."""

    serializer_class = DecisionFinalSerializer
    queryset = DecisionFinal.objects.none()  # hint para drf-spectacular

    def get_queryset(self):
        return DecisionFinal.objects.filter(user=self.request.user).select_related(
            "candidato_elegido", "tipo_eleccion"
        )

    def perform_create(self, serializer):
        # unique_together (user, tipo_eleccion): usamos update_or_create
        # para que el usuario pueda cambiar de opinion.
        DecisionFinal.objects.update_or_create(
            user=self.request.user,
            tipo_eleccion=serializer.validated_data["tipo_eleccion"],
            defaults={"candidato_elegido": serializer.validated_data["candidato_elegido"]},
        )


# ============================================================
# Noticias  (GET publico, escritura solo admin)
# ============================================================
class _NoticiaPermMixin:
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class NoticiaListCreateView(_NoticiaPermMixin, generics.ListCreateAPIView):
    queryset = Noticia.objects.all()
    serializer_class = NoticiaSerializer


class NoticiaDetailView(_NoticiaPermMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Noticia.objects.all()
    serializer_class = NoticiaSerializer


class CandidatoNoticiasView(generics.ListAPIView):
    """GET /api/candidatos/<candidato_id>/noticias/ - noticias que mencionan al candidato."""

    serializer_class = NoticiaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Noticia.objects.filter(
            candidatos_mencionados__id=self.kwargs["candidato_id"]
        ).order_by("-fecha_publicacion").distinct()
