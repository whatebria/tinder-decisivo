"""Tests del reset de cuestionario."""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    CandidatoDescartado,
    CandidatoFavorito,
    MatchCandidato,
    OpcionRespuesta,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)
from core.services.respuestas import (
    ReiniciarError,
    reiniciar_cuestionario,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="jenny", email="jenny@example.com", password="pass1234"
    )


@pytest.fixture
def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def tipo1(db):
    return TipoEleccion.objects.create(nombre="Presidencial")


@pytest.fixture
def tipo2(db):
    return TipoEleccion.objects.create(nombre="Diputados")


@pytest.fixture
def preguntas_tipo1(tipo1):
    preguntas = []
    for i in range(3):
        p = Pregunta.objects.create(
            tipo_eleccion=tipo1, texto=f"P{i}", eje_tematico="economia", orden=i
        )
        crear_opciones_acuerdo_desacuerdo(p)
        preguntas.append(p)
    return preguntas


@pytest.fixture
def preguntas_tipo2(tipo2):
    preguntas = []
    for i in range(2):
        p = Pregunta.objects.create(
            tipo_eleccion=tipo2, texto=f"P{i}", eje_tematico="economia", orden=i
        )
        crear_opciones_acuerdo_desacuerdo(p)
        preguntas.append(p)
    return preguntas


@pytest.fixture
def candidato_tipo1(tipo1):
    c = Candidato.objects.create(nombre="Ana", apellido="Uno", partido="X")
    c.tipos_eleccion.add(tipo1)
    return c


@pytest.fixture
def candidato_tipo2(tipo2):
    c = Candidato.objects.create(nombre="Beto", apellido="Dos", partido="Y")
    c.tipos_eleccion.add(tipo2)
    return c


@pytest.fixture
def user_con_datos(
    user,
    preguntas_tipo1,
    preguntas_tipo2,
    candidato_tipo1,
    candidato_tipo2,
    tipo1,
    tipo2,
):
    """User con respuestas + matches + favorito + descartado + decision en tipo1,
    y tambien con respuestas + match en tipo2 (para probar aislamiento).
    """
    # Respuestas en tipo1
    for p in preguntas_tipo1:
        RespuestaUsuario.objects.create(
            user=user,
            pregunta=p,
            opcion_elegida=p.opciones_respuesta.first(),
            peso=1,
        )
    # Respuestas en tipo2
    for p in preguntas_tipo2:
        RespuestaUsuario.objects.create(
            user=user,
            pregunta=p,
            opcion_elegida=p.opciones_respuesta.first(),
            peso=1,
        )
    # Match: solo candidato_tipo1 tiene match "del tipo 1", candidato_tipo2 del tipo 2
    MatchCandidato.objects.create(
        user=user,
        candidato=candidato_tipo1,
        match_percentage_value=80,
        num_preguntas_consideradas=3,
        confianza=MatchCandidato.CONFIANZA_ALTA,
    )
    MatchCandidato.objects.create(
        user=user,
        candidato=candidato_tipo2,
        match_percentage_value=50,
        num_preguntas_consideradas=2,
        confianza=MatchCandidato.CONFIANZA_TENTATIVA,
    )
    # Bookmarks: sobre candidato_tipo1 (NO deben borrarse)
    CandidatoFavorito.objects.create(user=user, candidato=candidato_tipo1)
    CandidatoDescartado.objects.create(user=user, candidato=candidato_tipo1)
    return user


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------
class TestReiniciarCuestionario:
    def test_borra_respuestas_del_tipo(self, user_con_datos, tipo1):
        assert RespuestaUsuario.objects.filter(user=user_con_datos, pregunta__tipo_eleccion=tipo1).count() == 3

        result = reiniciar_cuestionario(user_con_datos, tipo1.id)

        assert result.respuestas_borradas == 3
        assert RespuestaUsuario.objects.filter(user=user_con_datos, pregunta__tipo_eleccion=tipo1).count() == 0

    def test_borra_matches_del_tipo(self, user_con_datos, tipo1, tipo2):
        assert MatchCandidato.objects.filter(user=user_con_datos).count() == 2

        result = reiniciar_cuestionario(user_con_datos, tipo1.id)

        # Solo se borro el match contra candidato_tipo1 (1).
        # El match contra candidato_tipo2 sobrevive.
        assert result.matches_borrados == 1
        assert MatchCandidato.objects.filter(user=user_con_datos).count() == 1

    def test_no_toca_respuestas_de_otro_tipo(self, user_con_datos, tipo1, tipo2):
        reiniciar_cuestionario(user_con_datos, tipo1.id)
        # tipo2 sobrevive intacto
        assert RespuestaUsuario.objects.filter(user=user_con_datos, pregunta__tipo_eleccion=tipo2).count() == 2
        assert MatchCandidato.objects.filter(user=user_con_datos, candidato__tipos_eleccion=tipo2).count() == 1

    def test_no_toca_bookmarks(self, user_con_datos, tipo1):
        reiniciar_cuestionario(user_con_datos, tipo1.id)
        # Favoritos, descartados sobreviven.
        assert CandidatoFavorito.objects.filter(user=user_con_datos).count() == 1
        assert CandidatoDescartado.objects.filter(user=user_con_datos).count() == 1

    def test_tipo_eleccion_inexistente_error(self, user):
        with pytest.raises(ReiniciarError):
            reiniciar_cuestionario(user, 99999)

    def test_reset_sin_respuestas_no_falla(self, user, tipo1):
        result = reiniciar_cuestionario(user, tipo1.id)
        assert result.respuestas_borradas == 0
        assert result.matches_borrados == 0


# ---------------------------------------------------------------------------
# API endpoint
# ---------------------------------------------------------------------------
class TestReiniciarAPI:
    def test_endpoint_requiere_auth(self, tipo1):
        client = APIClient()
        resp = client.post(
            reverse("respuestas-reiniciar"),
            {"tipo_eleccion_id": tipo1.id},
            format="json",
        )
        assert resp.status_code in (401, 403)

    def test_endpoint_reinicia_ok(self, auth_client, user_con_datos, tipo1):
        resp = auth_client.post(
            reverse("respuestas-reiniciar"),
            {"tipo_eleccion_id": tipo1.id},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["respuestas_borradas"] == 3
        assert data["matches_borrados"] == 1
        assert RespuestaUsuario.objects.filter(user=user_con_datos, pregunta__tipo_eleccion=tipo1).count() == 0

    def test_endpoint_sin_tipo_400(self, auth_client, user):
        resp = auth_client.post(reverse("respuestas-reiniciar"), {}, format="json")
        assert resp.status_code == 400

    def test_endpoint_tipo_inexistente_404(self, auth_client, user):
        resp = auth_client.post(
            reverse("respuestas-reiniciar"),
            {"tipo_eleccion_id": 99999},
            format="json",
        )
        assert resp.status_code == 404
