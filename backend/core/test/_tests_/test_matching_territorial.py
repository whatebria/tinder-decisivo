"""Tests del filtro territorial en el matching.

Verifica que:
- Un usuario con comuna=X ve solo alcaldes de X y diputados del distrito de X.
- Presidenciales (nacionales) aparecen para todos los usuarios.
- Un usuario sin comuna ve TODOS los candidatos (fallback).
- El match anonimo puede recibir opcionalmente una comuna para filtrar.
"""

import pytest
from django.contrib.auth.models import User
from django.core.management import call_command
from decimal import Decimal
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    Comuna,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
    UnidadTerritorial,
)
from core.services.matching import (
    _filtrar_candidatos_por_territorio,
    calcular_match,
    calcular_match_anonimo,
)


@pytest.fixture
def seed_chile(db):
    call_command("seed_territorio_chile", verbosity=0)


@pytest.fixture
def escenario_territorial(db, seed_chile):
    """3 tipos de eleccion + 4 candidatos:
    - Presi nacional (sin territorio)
    - Alcalde Nunoa
    - Alcalde Providencia
    - Diputado distrito 10 (Nunoa/Providencia/etc)
    Todos con la misma unica pregunta y misma postura (valor 5).
    """
    tipo_pres = TipoEleccion.objects.create(nombre="Presidencial T")
    tipo_alc = TipoEleccion.objects.create(nombre="Alcalde T")
    tipo_dip = TipoEleccion.objects.create(nombre="Diputados T")
    # Tipo base con la unica pregunta: garantiza que la respuesta del usuario
    # cuente para el match de cualquier tipo (presi/alc/dip).
    tipo_base = TipoEleccion.objects.create(nombre="Base T", es_base=True)

    pregunta = Pregunta.objects.create(
        texto="Q1", tipo_eleccion=tipo_base, orden=1,
        eje_tematico=Pregunta.EJE_ECONOMIA,
    )
    for v in range(1, 6):
        OpcionRespuesta.objects.create(pregunta=pregunta, texto=f"o{v}", valor=v)

    nunoa = Comuna.objects.get(nombre="Nunoa")
    providencia = Comuna.objects.get(nombre="Providencia")
    d10 = nunoa.distrito

    # Removimos el signal auto-sync Candidato->UT por performance. Ahora los
    # tests que crean candidatos manuales deben setear unidad_territorial.
    ut_nunoa = UnidadTerritorial.objects.get(codigo=f"COM-{nunoa.codigo}")
    ut_prov = UnidadTerritorial.objects.get(codigo=f"COM-{providencia.codigo}")
    ut_d10 = UnidadTerritorial.objects.get(codigo=f"D-{d10.numero}")

    presi = Candidato.objects.create(
        nombre="Presi", apellido="Nacional", partido="P", propuesta_electoral="...",
    )
    presi.tipos_eleccion.add(tipo_pres)

    alc_nunoa = Candidato.objects.create(
        nombre="Ana", apellido="AlcNunoa", partido="P",
        propuesta_electoral="...", unidad_territorial=ut_nunoa,
    )
    alc_nunoa.tipos_eleccion.add(tipo_alc)

    alc_prov = Candidato.objects.create(
        nombre="Bea", apellido="AlcProv", partido="P",
        propuesta_electoral="...", unidad_territorial=ut_prov,
    )
    alc_prov.tipos_eleccion.add(tipo_alc)

    dip_d10 = Candidato.objects.create(
        nombre="Dip", apellido="D10", partido="P",
        propuesta_electoral="...", unidad_territorial=ut_d10,
    )
    dip_d10.tipos_eleccion.add(tipo_dip)

    # Todos tienen postura=5 en la unica pregunta
    for cand in [presi, alc_nunoa, alc_prov, dip_d10]:
        PosturaCandidato.objects.create(
            candidato=cand, pregunta=pregunta,
            opcion_respuesta=OpcionRespuesta.objects.get(pregunta=pregunta, valor=5),
        )

    return {
        "pregunta": pregunta,
        "tipo_pres": tipo_pres,
        "tipo_alc": tipo_alc,
        "tipo_dip": tipo_dip,
        "presi": presi,
        "alc_nunoa": alc_nunoa,
        "alc_prov": alc_prov,
        "dip_d10": dip_d10,
        "nunoa": nunoa,
        "providencia": providencia,
    }


class TestHelperFiltroTerritorial:
    def test_sin_comuna_devuelve_todos(self, escenario_territorial):
        qs = Candidato.objects.all()
        resultado = list(_filtrar_candidatos_por_territorio(qs, None))
        assert len(resultado) == 4

    def test_con_comuna_nunoa_filtra_correctamente(self, escenario_territorial):
        qs = Candidato.objects.all()
        nunoa = escenario_territorial["nunoa"]
        resultado = set(_filtrar_candidatos_por_territorio(qs, nunoa))
        # Debe incluir: presi nacional, alcalde nunoa, diputado d10.
        # No debe incluir: alcalde providencia (otra comuna).
        assert escenario_territorial["presi"] in resultado
        assert escenario_territorial["alc_nunoa"] in resultado
        assert escenario_territorial["dip_d10"] in resultado
        assert escenario_territorial["alc_prov"] not in resultado


class TestMatchAuthConComuna:
    def test_user_con_comuna_nunoa_ve_alcalde_nunoa_no_providencia(
        self, escenario_territorial
    ):
        user = User.objects.create_user(username="jenny", password="pw12345678")
        user.profile.comuna = escenario_territorial["nunoa"]
        user.profile.save()

        # Responde la unica pregunta con valor 5 -> match perfecto con todos.
        opcion = OpcionRespuesta.objects.get(
            pregunta=escenario_territorial["pregunta"], valor=5,
        )
        RespuestaUsuario.objects.create(
            user=user, pregunta=escenario_territorial["pregunta"],
            opcion_elegida=opcion,
        )

        # Pido match para tipo Alcalde -> solo debe aparecer alc_nunoa
        # (alc_prov NO, aunque tenga el mismo tipo, porque es de otra comuna).
        matches = calcular_match(user, escenario_territorial["tipo_alc"])
        nombres = {m.candidato.apellido for m in matches}
        assert "AlcNunoa" in nombres
        assert "AlcProv" not in nombres

    def test_user_sin_comuna_ve_todos(self, escenario_territorial):
        user = User.objects.create_user(username="jenny2", password="pw12345678")
        # user.profile.comuna es None por default.

        opcion = OpcionRespuesta.objects.get(
            pregunta=escenario_territorial["pregunta"], valor=5,
        )
        RespuestaUsuario.objects.create(
            user=user, pregunta=escenario_territorial["pregunta"],
            opcion_elegida=opcion,
        )

        # Sin comuna: ve alcaldes de TODAS las comunas del tipo pedido.
        matches = calcular_match(user, escenario_territorial["tipo_alc"])
        nombres = {m.candidato.apellido for m in matches}
        assert "AlcNunoa" in nombres
        assert "AlcProv" in nombres

    def test_presidencial_siempre_aparece(self, escenario_territorial):
        """Un candidato nacional aparece sin importar la comuna del user."""
        user = User.objects.create_user(username="jenny3", password="pw12345678")
        user.profile.comuna = escenario_territorial["providencia"]
        user.profile.save()

        opcion = OpcionRespuesta.objects.get(
            pregunta=escenario_territorial["pregunta"], valor=5,
        )
        RespuestaUsuario.objects.create(
            user=user, pregunta=escenario_territorial["pregunta"],
            opcion_elegida=opcion,
        )

        matches = calcular_match(user, escenario_territorial["tipo_pres"])
        assert len(matches) == 1
        assert matches[0].candidato.apellido == "Nacional"


class TestMatchAnonimoConComuna:
    def test_anon_sin_comuna_ve_todos(self, escenario_territorial):
        respuestas = [{
            "pregunta_id": escenario_territorial["pregunta"].id,
            "opcion_id": OpcionRespuesta.objects.get(
                pregunta=escenario_territorial["pregunta"], valor=5,
            ).id,
            "peso": 1,
        }]
        scores = calcular_match_anonimo(respuestas, escenario_territorial["tipo_alc"])
        nombres = {s["candidato"].apellido for s in scores}
        assert nombres == {"AlcNunoa", "AlcProv"}

    def test_anon_con_comuna_filtra(self, escenario_territorial):
        respuestas = [{
            "pregunta_id": escenario_territorial["pregunta"].id,
            "opcion_id": OpcionRespuesta.objects.get(
                pregunta=escenario_territorial["pregunta"], valor=5,
            ).id,
            "peso": 1,
        }]
        scores = calcular_match_anonimo(
            respuestas,
            escenario_territorial["tipo_alc"],
            comuna=escenario_territorial["nunoa"],
        )
        nombres = {s["candidato"].apellido for s in scores}
        assert nombres == {"AlcNunoa"}
