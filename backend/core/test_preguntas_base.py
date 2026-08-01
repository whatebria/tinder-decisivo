"""Tests de la feature PREGUNTAS BASE (TipoEleccion.es_base=True).

Verifica que:
- El endpoint /preguntas/ combina preguntas base + preguntas del tipo pedido.
- Respuestas a preguntas base cuentan para el match de cualquier eleccion.
- Preguntas base ya respondidas se excluyen del "pendiente" al abrir otra eleccion.
"""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    OpcionRespuesta,
    PosturaCandidato,
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
def escenario_con_base(db):
    """Setup con:
    - Tipo BASE (es_base=True) con 2 preguntas transversales.
    - Tipo PRESIDENCIAL con 3 preguntas especificas.
    - 1 candidato ("Ada") con posturas en TODAS (5 en todo).
    """
    tipo_base = TipoEleccion.objects.create(nombre="Base", es_base=True)
    tipo_pres = TipoEleccion.objects.create(nombre="Presidencial")

    def _crear_preg(tipo, texto, orden, eje=Pregunta.EJE_OTRO):
        p = Pregunta.objects.create(
            texto=texto, tipo_eleccion=tipo, orden=orden, eje_tematico=eje,
        )
        for val in range(1, 6):
            OpcionRespuesta.objects.create(pregunta=p, texto=f"Op {val}", valor=val)
        OpcionRespuesta.objects.create(pregunta=p, texto="No se", valor=0, es_no_se=True)
        return p

    base_1 = _crear_preg(tipo_base, "Base ideol 1", 1, Pregunta.EJE_SOCIEDAD)
    base_2 = _crear_preg(tipo_base, "Base ideol 2", 2, Pregunta.EJE_ECONOMIA)
    pres_1 = _crear_preg(tipo_pres, "Pres 1", 1, Pregunta.EJE_ECONOMIA)
    pres_2 = _crear_preg(tipo_pres, "Pres 2", 2, Pregunta.EJE_SEGURIDAD)
    pres_3 = _crear_preg(tipo_pres, "Pres 3", 3, Pregunta.EJE_AMBIENTE)

    ada = Candidato.objects.create(
        nombre="Ada", apellido="Perez", partido="X", propuesta_electoral="...",
    )
    ada.tipos_eleccion.add(tipo_pres)
    for p in [base_1, base_2, pres_1, pres_2, pres_3]:
        PosturaCandidato.objects.create(
            candidato=ada, pregunta=p,
            opcion_respuesta=OpcionRespuesta.objects.get(pregunta=p, valor=5),
        )

    return {
        "tipo_base": tipo_base, "tipo_pres": tipo_pres,
        "base_1": base_1, "base_2": base_2,
        "pres_1": pres_1, "pres_2": pres_2, "pres_3": pres_3,
        "ada": ada,
    }


class TestPreguntasPendientesConBase:
    def test_pendientes_incluye_base_y_especificas(self, api, escenario_con_base):
        """GET /preguntas/?tipo=Presidencial -> devuelve 2 base + 3 especificas = 5."""
        resp = api.get(
            reverse("pregunta-list"),
            {"tipo_eleccion_id": escenario_con_base["tipo_pres"].id},
        )
        assert resp.status_code == 200
        assert len(resp.data) == 5
        textos = {p["texto"] for p in resp.data}
        assert "Base ideol 1" in textos
        assert "Base ideol 2" in textos
        assert "Pres 3" in textos

    def test_base_respondida_se_excluye_al_abrir_otra_eleccion(
        self, api, user, escenario_con_base
    ):
        """Si el user responde una pregunta base, al abrir otra eleccion NO se
        le vuelve a pedir esa pregunta."""
        base_1 = escenario_con_base["base_1"]
        opcion = OpcionRespuesta.objects.get(pregunta=base_1, valor=3)
        RespuestaUsuario.objects.create(
            user=user, pregunta=base_1, opcion_elegida=opcion,
        )

        # Creo un segundo tipo "Parlamentaria" (sin preguntas) para verificar
        # que base_1 no aparece pero base_2 si.
        tipo_parla = TipoEleccion.objects.create(nombre="Parlamentaria")
        resp = api.get(
            reverse("pregunta-list"),
            {"tipo_eleccion_id": tipo_parla.id},
        )
        assert resp.status_code == 200
        textos = {p["texto"] for p in resp.data}
        assert "Base ideol 1" not in textos  # ya respondida
        assert "Base ideol 2" in textos  # base pendiente

    def test_guest_ve_todas_las_base_siempre(self, escenario_con_base):
        """Guest (no auth) no filtra por respondidas: siempre ve todas las base."""
        anon = APIClient()
        resp = anon.get(
            reverse("pregunta-list"),
            {"tipo_eleccion_id": escenario_con_base["tipo_pres"].id},
        )
        assert resp.status_code == 200
        assert len(resp.data) == 5


class TestMatchConPreguntasBase:
    def test_match_cuenta_respuestas_base(self, api, user, escenario_con_base):
        """El match para la Presidencial debe considerar las respuestas base."""
        # User responde igual que Ada en TODO (base + presidencial) -> 100% match.
        for p in [
            escenario_con_base["base_1"], escenario_con_base["base_2"],
            escenario_con_base["pres_1"], escenario_con_base["pres_2"],
            escenario_con_base["pres_3"],
        ]:
            op = OpcionRespuesta.objects.get(pregunta=p, valor=5)
            RespuestaUsuario.objects.create(user=user, pregunta=p, opcion_elegida=op)

        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_con_base["tipo_pres"].id},
        )
        assert resp.status_code == 200
        assert len(resp.data) == 1
        ada_result = resp.data[0]
        # 5 preguntas consideradas (2 base + 3 presidenciales)
        assert ada_result["preguntas_consideradas"] == 5
        # RAW (n=5, score_total=5.0, peso_total=5.0):
        # 5.0/5.0 * 100 = 100.00%
        assert float(ada_result["match_percentage"]) == 100.0

    def test_match_solo_con_respuestas_base_funciona(
        self, api, user, escenario_con_base
    ):
        """Si el user solo respondio las base y ninguna especifica, el match
        igual se calcula (parcial, con menor confianza)."""
        for p in [escenario_con_base["base_1"], escenario_con_base["base_2"]]:
            op = OpcionRespuesta.objects.get(pregunta=p, valor=5)
            RespuestaUsuario.objects.create(user=user, pregunta=p, opcion_elegida=op)

        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_con_base["tipo_pres"].id},
        )
        assert resp.status_code == 200
        assert len(resp.data) == 1
        ada = resp.data[0]
        assert ada["preguntas_consideradas"] == 2
        # RAW (n=2, score_total=2.0, peso_total=2.0):
        # 2.0/2.0 * 100 = 100.00%
        assert float(ada["match_percentage"]) == 100.0
        # Solo 2 preguntas -> confianza tentativa.
        assert ada["confianza"] == "tentativa"
