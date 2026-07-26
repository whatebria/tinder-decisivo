"""Tests del endpoint de explicacion del match (match-detalle)."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    OpcionRespuesta,
    Pregunta,
    RespuestaUsuario,
    PosturaCandidato,
    TipoEleccion,
)


User = get_user_model()


@pytest.fixture
def escenario(db):
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    preguntas = []
    for i, (texto, eje) in enumerate(
        [
            ("Aborto libre", Pregunta.EJE_SOCIEDAD),
            ("Renta basica", Pregunta.EJE_ECONOMIA),
            ("Reforma tributaria", Pregunta.EJE_ECONOMIA),
        ]
    ):
        p = Pregunta.objects.create(
            texto=texto, tipo_eleccion=tipo, orden=i, eje_tematico=eje
        )
        for val in range(1, 6):
            OpcionRespuesta.objects.create(pregunta=p, texto=f"Opcion {val}", valor=val)
        OpcionRespuesta.objects.create(pregunta=p, texto="No se", valor=0, es_no_se=True)
        preguntas.append(p)

    ada = Candidato.objects.create(nombre="Ada", apellido="Perez", partido="A")
    ada.tipos_eleccion.add(tipo)
    for p in preguntas:
        PosturaCandidato.objects.create(
            candidato=ada, pregunta=p, opcion_respuesta=OpcionRespuesta.objects.get(pregunta=p, valor=5)
        )

    user = User.objects.create_user(username="jenny", password="pw")
    # user responde: p0=5 (identica), p1=4 (cercana), p2=1 (opuesta)
    for p, val, peso in zip(preguntas, [5, 4, 1], [RespuestaUsuario.PESO_MEDIO, RespuestaUsuario.PESO_POCO, RespuestaUsuario.PESO_MUCHO]):
        RespuestaUsuario.objects.create(
            user=user, pregunta=p, opcion_elegida=OpcionRespuesta.objects.get(pregunta=p, valor=val), peso=peso
        )

    return {"tipo": tipo, "preguntas": preguntas, "ada": ada, "user": user}


def _url(cand_id):
    return f"/api/v1/candidatos/{cand_id}/match-detalle/"


class TestMatchDetalle:
    def test_requiere_autenticacion(self, escenario):
        client = APIClient()
        r = client.get(_url(escenario["ada"].id))
        assert r.status_code in (401, 403)

    def test_devuelve_items_por_cada_pregunta_respondida(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        r = client.get(_url(escenario["ada"].id))
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) == 3
        assert data["num_preguntas_consideradas"] == 3

    def test_incluye_valores_texto_y_eje_de_cada_lado(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        data = client.get(_url(escenario["ada"].id)).json()
        item = data["items"][0]
        # Todos los campos clave estan
        for key in [
            "pregunta_id", "pregunta_texto", "pregunta_orden",
            "eje_tematico", "eje_tematico_display",
            "user_valor", "user_texto", "user_peso", "user_peso_multiplicador",
            "candidato_valor", "candidato_texto",
            "diff", "score", "contribucion", "coincide",
        ]:
            assert key in item, f"Falta {key} en el item"

    def test_marca_coincide_true_solo_si_diff_cero(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        data = client.get(_url(escenario["ada"].id)).json()
        # p0 identica (5=5) -> coincide
        # p1 diff 1 -> no
        # p2 diff 4 -> no
        coincidencias = [it["coincide"] for it in data["items"]]
        assert coincidencias.count(True) == 1
        assert coincidencias.count(False) == 2

    def test_orden_por_contribucion_descendente(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        data = client.get(_url(escenario["ada"].id)).json()
        contribs = [it["contribucion"] for it in data["items"]]
        assert contribs == sorted(contribs, reverse=True)

    def test_400_si_user_no_respondio_nada(self, escenario):
        client = APIClient()
        user2 = User.objects.create_user(username="otro", password="pw")
        client.force_authenticate(user=user2)
        r = client.get(_url(escenario["ada"].id))
        assert r.status_code == 400

    def test_404_si_candidato_no_existe(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        r = client.get(_url(99999))
        assert r.status_code == 404

    def test_incluye_summary_del_match(self, escenario):
        client = APIClient()
        client.force_authenticate(user=escenario["user"])
        data = client.get(_url(escenario["ada"].id)).json()
        assert "match_percentage" in data
        assert "confianza" in data
        assert "candidato_nombre" in data
        assert data["candidato_nombre"] == "Ada Perez"
