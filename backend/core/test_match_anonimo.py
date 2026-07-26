"""Tests del endpoint de match anonimo (modo guest)."""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def tipo_eleccion(db):
    return TipoEleccion.objects.create(nombre="Presidencial 2025")


@pytest.fixture
def preguntas_y_opciones(tipo_eleccion):
    """3 preguntas con opciones estandar de acuerdo/desacuerdo."""
    preguntas = []
    for i in range(3):
        p = Pregunta.objects.create(
            tipo_eleccion=tipo_eleccion,
            texto=f"Pregunta {i+1}",
            eje_tematico="economia",
            orden=i + 1,
        )
        crear_opciones_acuerdo_desacuerdo(p)
        preguntas.append(p)
    return preguntas


@pytest.fixture
def candidatos_con_posturas(tipo_eleccion, preguntas_y_opciones):
    """2 candidatos con posturas opuestas."""
    c1 = Candidato.objects.create(nombre="Ana", apellido="Uno", partido="A")
    c2 = Candidato.objects.create(nombre="Beto", apellido="Dos", partido="B")
    c1.tipos_eleccion.add(tipo_eleccion)
    c2.tipos_eleccion.add(tipo_eleccion)

    # c1: muy de acuerdo (valor 5) en todas
    # c2: muy en desacuerdo (valor 1) en todas
    for p in preguntas_y_opciones:
        op_max = p.opciones_respuesta.get(valor=5)
        op_min = p.opciones_respuesta.get(valor=1)
        PosturaCandidato.objects.create(candidato=c1, pregunta=p, opcion_respuesta=op_max)
        PosturaCandidato.objects.create(candidato=c2, pregunta=p, opcion_respuesta=op_min)
    return c1, c2


# ---------------------------------------------------------------------------
# Endpoint /match-anonimo/
# ---------------------------------------------------------------------------
class TestMatchAnonimo:
    def test_no_requiere_auth(self, api, tipo_eleccion, preguntas_y_opciones, candidatos_con_posturas):
        respuestas = [
            {
                "pregunta_id": p.id,
                "opcion_id": p.opciones_respuesta.get(valor=5).id,
                "peso": 1,
            }
            for p in preguntas_y_opciones
        ]
        resp = api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": tipo_eleccion.id, "respuestas": respuestas},
            format="json",
        )
        assert resp.status_code == 200

    def test_ranking_correcto(self, api, tipo_eleccion, preguntas_y_opciones, candidatos_con_posturas):
        c1, c2 = candidatos_con_posturas
        # Usuario 100% de acuerdo en todas -> matchea c1 al 100%, c2 al 0%.
        respuestas = [
            {
                "pregunta_id": p.id,
                "opcion_id": p.opciones_respuesta.get(valor=5).id,
                "peso": 1,
            }
            for p in preguntas_y_opciones
        ]
        resp = api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": tipo_eleccion.id, "respuestas": respuestas},
            format="json",
        )
        data = resp.json()
        assert len(data) == 2
        assert data[0]["candidato_data"]["nombre"] == "Ana"
        assert float(data[0]["match_percentage"]) == 100.0
        assert data[1]["candidato_data"]["nombre"] == "Beto"
        assert float(data[1]["match_percentage"]) == 0.0

    def test_no_persiste_nada(self, api, tipo_eleccion, preguntas_y_opciones, candidatos_con_posturas):
        from core.models import MatchCandidato, RespuestaUsuario

        respuestas = [
            {
                "pregunta_id": p.id,
                "opcion_id": p.opciones_respuesta.get(valor=3).id,
                "peso": 2,
            }
            for p in preguntas_y_opciones
        ]
        api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": tipo_eleccion.id, "respuestas": respuestas},
            format="json",
        )
        # Nada de RespuestaUsuario ni MatchCandidato en la DB.
        assert RespuestaUsuario.objects.count() == 0
        assert MatchCandidato.objects.count() == 0

    def test_payload_invalido_400(self, api, tipo_eleccion):
        resp = api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": tipo_eleccion.id},  # sin respuestas
            format="json",
        )
        assert resp.status_code == 400

    def test_tipo_eleccion_inexistente_404(self, api, db):
        resp = api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": 99999, "respuestas": [{"pregunta_id": 1, "opcion_id": 1}]},
            format="json",
        )
        assert resp.status_code == 404

    def test_respuestas_invalidas_se_ignoran(self, api, tipo_eleccion, preguntas_y_opciones, candidatos_con_posturas):
        respuestas = [
            {"pregunta_id": 99999, "opcion_id": 99999, "peso": 1},  # invalida
            *[
                {
                    "pregunta_id": p.id,
                    "opcion_id": p.opciones_respuesta.get(valor=5).id,
                    "peso": 1,
                }
                for p in preguntas_y_opciones
            ],
        ]
        resp = api.post(
            reverse("match-anonimo"),
            {"tipo_eleccion_id": tipo_eleccion.id, "respuestas": respuestas},
            format="json",
        )
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Catalogos publicos (soporte guest)
# ---------------------------------------------------------------------------
class TestCatalogosPublicos:
    def test_tipos_eleccion_publico(self, api, tipo_eleccion):
        resp = api.get(reverse("tipos-eleccion-list"))
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_candidatos_publico(self, api, candidatos_con_posturas):
        resp = api.get(reverse("candidato-list"))
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_preguntas_publico(self, api, tipo_eleccion, preguntas_y_opciones):
        resp = api.get(
            reverse("pregunta-list"),
            {"tipo_eleccion_id": tipo_eleccion.id},
        )
        assert resp.status_code == 200
        # Guest ve todas las preguntas (no filtro por respondidas)
        assert len(resp.json()) == 3

    def test_preguntas_guest_no_filtra_por_respondidas(
        self, api, tipo_eleccion, preguntas_y_opciones
    ):
        # Aun si otro user autenticado respondio, guest sigue viendo TODAS
        from core.models import RespuestaUsuario
        user = User.objects.create_user(username="alguien", password="x")
        RespuestaUsuario.objects.create(
            user=user,
            pregunta=preguntas_y_opciones[0],
            opcion_elegida=preguntas_y_opciones[0].opciones_respuesta.first(),
            peso=1,
        )
        # Guest (sin auth) sigue viendo 3
        resp = api.get(
            reverse("pregunta-list"),
            {"tipo_eleccion_id": tipo_eleccion.id},
        )
        assert len(resp.json()) == 3
