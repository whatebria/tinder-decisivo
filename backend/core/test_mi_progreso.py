"""Tests del endpoint agregador GET /api/v1/mi-progreso/.

Reemplaza el patron N+M de la HomeScreen antigua (useMatchesQuery + usePreguntas
por cada tipo) con 1 request agregado.

Cubre:
- Auth required.
- Devuelve todos los tipos no-base (aunque el user no haya respondido nada).
- total_preguntas incluye base + del tipo.
- respondidas incluye respuestas del tipo + base.
- completa=True solo cuando respondidas >= total.
- top_match viene poblado cuando hay MatchCandidato para el tipo.
- top_match=None cuando no hay match calculado (aunque completa=True).
- Tipos base NO aparecen en la respuesta.
"""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    MatchCandidato,
    OpcionRespuesta,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
)


@pytest.fixture
def user(db):
    return User.objects.create_user(username="votante", password="pw12345678")


@pytest.fixture
def api(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def escenario(db):
    """3 tipos: base (2 pregs) + Presidencial (3 pregs) + Municipal (2 pregs).

    Presidencial tiene 1 candidato Ada, Municipal 0 candidatos.
    """
    tipo_base = TipoEleccion.objects.create(nombre="Base", es_base=True)
    tipo_pres = TipoEleccion.objects.create(nombre="Presidencial")
    tipo_muni = TipoEleccion.objects.create(nombre="Municipal")

    def _pregunta(tipo, texto, orden):
        p = Pregunta.objects.create(
            texto=texto, tipo_eleccion=tipo, orden=orden,
            eje_tematico=Pregunta.EJE_OTRO,
        )
        for v in range(1, 6):
            OpcionRespuesta.objects.create(pregunta=p, texto=f"Op {v}", valor=v)
        return p

    base_1 = _pregunta(tipo_base, "Base 1", 1)
    base_2 = _pregunta(tipo_base, "Base 2", 2)
    pres_1 = _pregunta(tipo_pres, "Pres 1", 1)
    pres_2 = _pregunta(tipo_pres, "Pres 2", 2)
    pres_3 = _pregunta(tipo_pres, "Pres 3", 3)
    muni_1 = _pregunta(tipo_muni, "Muni 1", 1)
    muni_2 = _pregunta(tipo_muni, "Muni 2", 2)

    ada = Candidato.objects.create(
        nombre="Ada", apellido="Perez", partido="X", propuesta_electoral="...",
    )
    ada.tipos_eleccion.add(tipo_pres)

    return {
        "tipo_base": tipo_base, "tipo_pres": tipo_pres, "tipo_muni": tipo_muni,
        "base_1": base_1, "base_2": base_2,
        "pres_1": pres_1, "pres_2": pres_2, "pres_3": pres_3,
        "muni_1": muni_1, "muni_2": muni_2,
        "ada": ada,
    }


class TestMiProgreso:
    def test_requiere_auth(self, escenario):
        anon = APIClient()
        resp = anon.get(reverse("mi-progreso"))
        assert resp.status_code in (401, 403)

    def test_devuelve_todos_los_tipos_no_base(self, api, escenario):
        """Aunque el user no haya respondido nada, aparecen todos los tipos
        no-base (con respondidas=0, completa=False, top_match=None).

        Esto simplifica al frontend: no tiene que reconciliar "tipos" con
        "progreso" — es la misma fuente.
        """
        resp = api.get(reverse("mi-progreso"))
        assert resp.status_code == 200
        nombres = {item["tipo_eleccion_nombre"] for item in resp.data}
        assert nombres == {"Presidencial", "Municipal"}
        assert "Base" not in nombres  # es_base excluido

    def test_totales_incluyen_preguntas_base(self, api, escenario):
        """total_preguntas de un tipo = preguntas del tipo + preguntas base."""
        resp = api.get(reverse("mi-progreso"))
        by_nombre = {item["tipo_eleccion_nombre"]: item for item in resp.data}
        # Pres: 3 propias + 2 base = 5
        assert by_nombre["Presidencial"]["total_preguntas"] == 5
        # Muni: 2 propias + 2 base = 4
        assert by_nombre["Municipal"]["total_preguntas"] == 4

    def test_respondidas_cero_cuando_user_nuevo(self, api, escenario):
        resp = api.get(reverse("mi-progreso"))
        for item in resp.data:
            assert item["respondidas"] == 0
            assert item["completa"] is False
            assert item["top_match"] is None

    def test_respondidas_base_suma_a_todos_los_tipos(self, api, user, escenario):
        """Si respondio 1 base, respondidas=1 en TODOS los tipos."""
        op = OpcionRespuesta.objects.get(pregunta=escenario["base_1"], valor=3)
        RespuestaUsuario.objects.create(
            user=user, pregunta=escenario["base_1"], opcion_elegida=op,
        )
        resp = api.get(reverse("mi-progreso"))
        by_nombre = {i["tipo_eleccion_nombre"]: i for i in resp.data}
        assert by_nombre["Presidencial"]["respondidas"] == 1
        assert by_nombre["Municipal"]["respondidas"] == 1

    def test_completa_true_solo_cuando_todo_respondido(self, api, user, escenario):
        """completa=True cuando respondidas >= total. Solo para el tipo relevante."""
        # Responde las 5 preguntas de Presidencial (2 base + 3 pres).
        for p in [escenario["base_1"], escenario["base_2"],
                  escenario["pres_1"], escenario["pres_2"], escenario["pres_3"]]:
            op = OpcionRespuesta.objects.get(pregunta=p, valor=5)
            RespuestaUsuario.objects.create(user=user, pregunta=p, opcion_elegida=op)

        resp = api.get(reverse("mi-progreso"))
        by_nombre = {i["tipo_eleccion_nombre"]: i for i in resp.data}
        # Pres: completo
        assert by_nombre["Presidencial"]["respondidas"] == 5
        assert by_nombre["Presidencial"]["completa"] is True
        # Muni: base contribuye pero faltan 2 muni_x. total=4, respondidas=2.
        assert by_nombre["Municipal"]["respondidas"] == 2
        assert by_nombre["Municipal"]["completa"] is False

    def test_top_match_poblado_cuando_existe(self, api, user, escenario):
        """Si hay MatchCandidato del user para un candidato del tipo, top_match
        viene con los datos del candidato + porcentaje + confianza.
        """
        MatchCandidato.objects.create(
            user=user, candidato=escenario["ada"],
            match_percentage_value=87.5, num_preguntas_consideradas=5,
            confianza=MatchCandidato.CONFIANZA_ALTA,
        )
        resp = api.get(reverse("mi-progreso"))
        by_nombre = {i["tipo_eleccion_nombre"]: i for i in resp.data}
        pres = by_nombre["Presidencial"]
        assert pres["top_match"] is not None
        assert float(pres["top_match"]["match_percentage"]) == 87.5
        assert pres["top_match"]["candidato"]["nombre"] == "Ada"
        assert pres["top_match"]["confianza"] == "alta"
        # Municipal no tiene candidatos -> top_match None.
        assert by_nombre["Municipal"]["top_match"] is None

    def test_top_match_es_el_mayor_porcentaje(self, api, user, escenario):
        """Con 2 candidatos del mismo tipo, top_match = el de mayor %."""
        bob = Candidato.objects.create(
            nombre="Bob", apellido="Diaz", partido="Y", propuesta_electoral="...",
        )
        bob.tipos_eleccion.add(escenario["tipo_pres"])
        MatchCandidato.objects.create(
            user=user, candidato=escenario["ada"],
            match_percentage_value=60.0, num_preguntas_consideradas=5,
        )
        MatchCandidato.objects.create(
            user=user, candidato=bob,
            match_percentage_value=88.0, num_preguntas_consideradas=5,
        )
        resp = api.get(reverse("mi-progreso"))
        pres = next(i for i in resp.data if i["tipo_eleccion_nombre"] == "Presidencial")
        assert pres["top_match"]["candidato"]["nombre"] == "Bob"
        assert float(pres["top_match"]["match_percentage"]) == 88.0

    def test_completa_sin_top_match_es_posible(self, api, user, escenario):
        """Un tipo puede estar completa=True pero top_match=None si el user aun
        no gatillo el calculo del match (o si no hay candidatos).

        Municipal tiene 0 candidatos: aunque respondas todo, top_match=None.
        """
        for p in [escenario["base_1"], escenario["base_2"],
                  escenario["muni_1"], escenario["muni_2"]]:
            op = OpcionRespuesta.objects.get(pregunta=p, valor=5)
            RespuestaUsuario.objects.create(user=user, pregunta=p, opcion_elegida=op)

        resp = api.get(reverse("mi-progreso"))
        muni = next(i for i in resp.data if i["tipo_eleccion_nombre"] == "Municipal")
        assert muni["completa"] is True
        assert muni["top_match"] is None
