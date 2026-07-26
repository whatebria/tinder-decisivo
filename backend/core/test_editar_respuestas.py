"""Tests para editar respuestas individuales (service + API)."""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    MatchCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)
from core.services.respuestas import (
    EditarRespuestaError,
    editar_respuesta,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def user(db):
    return User.objects.create_user(username="jenny", password="Pass1234!")


@pytest.fixture
def otro_user(db):
    return User.objects.create_user(username="otro", password="Pass1234!")


@pytest.fixture
def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def escenario(db, user):
    """Un tipo con 2 preguntas, cada una con 5 opciones Likert.

    User respondio la P1 con la opcion 'muy_desacuerdo' + peso 1.
    Ademas un candidato con match calculado (para probar invalidacion).
    """
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    p1 = Pregunta.objects.create(
        tipo_eleccion=tipo, texto="P1", eje_tematico="economia", orden=1
    )
    p2 = Pregunta.objects.create(
        tipo_eleccion=tipo, texto="P2", eje_tematico="seguridad", orden=2
    )
    crear_opciones_acuerdo_desacuerdo(p1)
    crear_opciones_acuerdo_desacuerdo(p2)

    opcion_p1_muy_desacuerdo = p1.opciones_respuesta.get(valor=1)
    respuesta = RespuestaUsuario.objects.create(
        user=user,
        pregunta=p1,
        opcion_elegida=opcion_p1_muy_desacuerdo,
        peso=1,
    )

    candidato = Candidato.objects.create(nombre="Ana", apellido="X", partido="A")
    candidato.tipos_eleccion.add(tipo)
    match = MatchCandidato.objects.create(
        user=user, candidato=candidato, match_percentage_value=75.0
    )

    return {
        "tipo": tipo,
        "p1": p1,
        "p2": p2,
        "respuesta": respuesta,
        "candidato": candidato,
        "match": match,
    }


# ---------------------------------------------------------------------------
# Service: editar_respuesta
# ---------------------------------------------------------------------------
class TestEditarRespuestaService:
    def test_cambio_opcion_y_peso_ok(self, user, escenario):
        opcion_nueva = escenario["p1"].opciones_respuesta.get(valor=5)  # muy de acuerdo
        result = editar_respuesta(
            user=user,
            respuesta_id=escenario["respuesta"].id,
            opcion_id=opcion_nueva.id,
            peso=3,
        )
        escenario["respuesta"].refresh_from_db()
        assert escenario["respuesta"].opcion_elegida_id == opcion_nueva.id
        assert escenario["respuesta"].peso == 3
        assert result.matches_invalidados == 1

    def test_invalida_matches_del_tipo(self, user, escenario):
        opcion_nueva = escenario["p1"].opciones_respuesta.get(valor=3)
        editar_respuesta(user, escenario["respuesta"].id, opcion_nueva.id, 2)
        assert not MatchCandidato.objects.filter(id=escenario["match"].id).exists()

    def test_no_toca_matches_de_otro_tipo(self, user, escenario):
        # Otro tipo con otro candidato + match del user
        otro_tipo = TipoEleccion.objects.create(nombre="Gobernador")
        otro_candidato = Candidato.objects.create(nombre="Bea", apellido="Y")
        otro_candidato.tipos_eleccion.add(otro_tipo)
        otro_match = MatchCandidato.objects.create(
            user=user, candidato=otro_candidato, match_percentage_value=50.0
        )

        opcion_nueva = escenario["p1"].opciones_respuesta.get(valor=3)
        editar_respuesta(user, escenario["respuesta"].id, opcion_nueva.id, 2)

        assert MatchCandidato.objects.filter(id=otro_match.id).exists()

    def test_respuesta_de_otro_user_falla(self, otro_user, escenario):
        opcion = escenario["p1"].opciones_respuesta.get(valor=3)
        with pytest.raises(EditarRespuestaError, match="no encontrada"):
            editar_respuesta(otro_user, escenario["respuesta"].id, opcion.id, 1)

    def test_opcion_de_otra_pregunta_falla(self, user, escenario):
        opcion_p2 = escenario["p2"].opciones_respuesta.first()
        with pytest.raises(EditarRespuestaError, match="no pertenece"):
            editar_respuesta(user, escenario["respuesta"].id, opcion_p2.id, 1)

    def test_peso_fuera_de_rango_falla(self, user, escenario):
        opcion = escenario["p1"].opciones_respuesta.get(valor=3)
        with pytest.raises(EditarRespuestaError, match="rango"):
            editar_respuesta(user, escenario["respuesta"].id, opcion.id, 99)


# ---------------------------------------------------------------------------
# API: GET /respuestas/mias/
# ---------------------------------------------------------------------------
class TestMisRespuestasListAPI:
    def test_requiere_auth(self, db):
        client = APIClient()
        resp = client.get(reverse("respuestas-mias-list"), {"tipo_eleccion_id": 1})
        assert resp.status_code in (401, 403)

    def test_sin_tipo_400(self, auth_client, escenario):
        resp = auth_client.get(reverse("respuestas-mias-list"))
        assert resp.status_code == 400

    def test_lista_solo_respuestas_del_user(self, auth_client, escenario):
        resp = auth_client.get(
            reverse("respuestas-mias-list"),
            {"tipo_eleccion_id": escenario["tipo"].id},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == escenario["respuesta"].id
        assert data[0]["peso"] == 1
        assert data[0]["eje_tematico"] == "economia"
        # Trae todas las opciones para el editor
        assert len(data[0]["opciones"]) == 5


# ---------------------------------------------------------------------------
# API: PATCH /respuestas/mias/{pk}/
# ---------------------------------------------------------------------------
class TestEditarRespuestaAPI:
    def test_requiere_auth(self, db):
        client = APIClient()
        resp = client.patch(
            reverse("respuestas-mias-detail", args=[1]),
            {"opcion_elegida": 1, "peso": 1},
            format="json",
        )
        assert resp.status_code in (401, 403)

    def test_edicion_ok(self, auth_client, escenario):
        opcion_nueva = escenario["p1"].opciones_respuesta.get(valor=5)
        resp = auth_client.patch(
            reverse("respuestas-mias-detail", args=[escenario["respuesta"].id]),
            {"opcion_elegida": opcion_nueva.id, "peso": 3},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["peso"] == 3
        assert data["opcion_elegida"] == opcion_nueva.id
        assert data["matches_invalidados"] == 1

    def test_respuesta_de_otro_user_404(self, escenario, otro_user):
        token, _ = Token.objects.get_or_create(user=otro_user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        opcion = escenario["p1"].opciones_respuesta.get(valor=3)
        resp = client.patch(
            reverse("respuestas-mias-detail", args=[escenario["respuesta"].id]),
            {"opcion_elegida": opcion.id, "peso": 1},
            format="json",
        )
        assert resp.status_code == 404

    def test_payload_invalido_400(self, auth_client, escenario):
        resp = auth_client.patch(
            reverse("respuestas-mias-detail", args=[escenario["respuesta"].id]),
            {"peso": 999},  # sin opcion + peso fuera de rango
            format="json",
        )
        assert resp.status_code == 400
