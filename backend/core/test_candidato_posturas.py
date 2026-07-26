"""Tests para GET /candidatos/<id>/posturas/."""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    Pregunta,
    PosturaCandidato,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)


@pytest.fixture
def escenario(db):
    """Un candidato con 2 posturas cargadas en un tipo de eleccion."""
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    p1 = Pregunta.objects.create(
        tipo_eleccion=tipo, texto="P1 economia", eje_tematico="economia", orden=1
    )
    p2 = Pregunta.objects.create(
        tipo_eleccion=tipo, texto="P2 seguridad", eje_tematico="seguridad", orden=2
    )
    crear_opciones_acuerdo_desacuerdo(p1)
    crear_opciones_acuerdo_desacuerdo(p2)

    candidato = Candidato.objects.create(
        nombre="Ana", apellido="Perez", partido="Partido A"
    )
    candidato.tipos_eleccion.add(tipo)

    postura_p1 = PosturaCandidato.objects.create(
        candidato=candidato,
        pregunta=p1,
        opcion_respuesta=p1.opciones_respuesta.get(valor=5),
        justificacion="Segun su programa 2025 (https://example.com/programa).",
    )
    postura_p2 = PosturaCandidato.objects.create(
        candidato=candidato,
        pregunta=p2,
        opcion_respuesta=p2.opciones_respuesta.get(valor=1),
        justificacion="Declaracion en entrevista CNN Chile 2024-06.",
    )
    return {
        "tipo": tipo,
        "p1": p1,
        "p2": p2,
        "candidato": candidato,
        "posturas": [postura_p1, postura_p2],
    }


class TestCandidatoPosturasView:
    def test_endpoint_publico_no_requiere_auth(self, escenario):
        client = APIClient()
        resp = client.get(
            reverse("candidato-posturas", args=[escenario["candidato"].id])
        )
        assert resp.status_code == 200

    def test_devuelve_todas_las_posturas_del_candidato(self, escenario):
        client = APIClient()
        resp = client.get(
            reverse("candidato-posturas", args=[escenario["candidato"].id])
        )
        data = resp.json()
        assert len(data) == 2
        # Verifico campos expandidos
        assert data[0]["eje_tematico"] in ("economia", "seguridad")
        assert data[0]["eje_tematico_display"]
        assert data[0]["opcion_respuesta_texto"]
        assert data[0]["pregunta_texto"]

    def test_ordenado_por_pregunta_orden(self, escenario):
        client = APIClient()
        resp = client.get(
            reverse("candidato-posturas", args=[escenario["candidato"].id])
        )
        data = resp.json()
        assert data[0]["pregunta_orden"] < data[1]["pregunta_orden"]

    def test_filtra_por_tipo_eleccion(self, escenario, db):
        # Creo otro tipo con otra pregunta y postura del mismo candidato
        otro_tipo = TipoEleccion.objects.create(nombre="Gobernador")
        p_otro = Pregunta.objects.create(
            tipo_eleccion=otro_tipo,
            texto="Otro",
            eje_tematico="cultural",
            orden=1,
        )
        crear_opciones_acuerdo_desacuerdo(p_otro)
        escenario["candidato"].tipos_eleccion.add(otro_tipo)
        PosturaCandidato.objects.create(
            candidato=escenario["candidato"],
            pregunta=p_otro,
            opcion_respuesta=p_otro.opciones_respuesta.get(valor=3),
            justificacion="Data test.",
        )

        client = APIClient()
        # Sin filtro: devuelve las 3
        resp = client.get(
            reverse("candidato-posturas", args=[escenario["candidato"].id])
        )
        assert len(resp.json()) == 3

        # Con filtro: solo las 2 del tipo presidencial
        resp = client.get(
            reverse("candidato-posturas", args=[escenario["candidato"].id]),
            {"tipo_eleccion_id": escenario["tipo"].id},
        )
        assert len(resp.json()) == 2

    def test_candidato_inexistente_devuelve_lista_vacia(self, db):
        client = APIClient()
        resp = client.get(reverse("candidato-posturas", args=[99999]))
        assert resp.status_code == 200
        assert resp.json() == []
