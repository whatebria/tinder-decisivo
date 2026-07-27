"""Tests del scope territorial polimorfico del modelo Candidato.

Verifica:
- Un candidato presidencial puede tener unidad_territorial=null.
- Un candidato alcalde tiene unidad_territorial nivel comunal.
- Un candidato diputado tiene unidad_territorial nivel distrital.
- La property `alcance_territorial` devuelve la etiqueta correcta.
- Reverse relations desde UnidadTerritorial siguen funcionando.
"""

import pytest

from core.models import (
    Candidato, Comuna, Distrito, Region, TipoEleccion, UnidadTerritorial,
)


@pytest.fixture
def region_rm(db):
    return Region.objects.create(
        numero_romano="RM", codigo="13", nombre="Metropolitana Test", orden=99,
    )


@pytest.fixture
def distrito_10(db, region_rm):
    return Distrito.objects.create(
        numero=100, nombre="Distrito test", region=region_rm, escanos=5,
    )


@pytest.fixture
def comuna_nunoa(db, region_rm, distrito_10):
    return Comuna.objects.create(
        codigo="99999", nombre="Nunoa Test",
        region=region_rm, distrito=distrito_10,
    )


@pytest.fixture
def ut_nacional(db):
    """UT nacional root, no la referencia ningun candidato salvo tests explicitos."""
    return UnidadTerritorial.objects.create(
        codigo="NAC-TEST", nombre="Chile Test", nivel="nacional",
    )


@pytest.fixture
def ut_distrital(db, ut_nacional):
    return UnidadTerritorial.objects.create(
        codigo="D-TEST-100", nombre="Distrito UT test",
        nivel="distrital", padre=ut_nacional,
        metadata={"numero_distrito": 100},
    )


@pytest.fixture
def ut_comunal(db, ut_distrital):
    return UnidadTerritorial.objects.create(
        codigo="COM-99999", nombre="Nunoa UT test",
        nivel="comunal", padre=ut_distrital,
        metadata={"codigo_ine": "99999"},
    )


@pytest.fixture
def tipos(db):
    return {
        "pres": TipoEleccion.objects.create(nombre="Presidencial Test"),
        "dip": TipoEleccion.objects.create(nombre="Diputados Test"),
        "alc": TipoEleccion.objects.create(nombre="Alcalde Test"),
    }


class TestCandidatoTerritorial:
    def test_presidencial_sin_territorio(self, db, tipos):
        """Un candidato presidencial no tiene unidad_territorial (=nacional)."""
        c = Candidato.objects.create(
            nombre="Prez", apellido="Test", partido="P", propuesta_electoral="...",
        )
        c.tipos_eleccion.add(tipos["pres"])
        assert c.unidad_territorial is None
        assert c.alcance_territorial == "nacional"

    def test_diputado_con_ut_distrital(self, db, tipos, ut_distrital):
        c = Candidato.objects.create(
            nombre="Dip", apellido="Test", partido="P",
            propuesta_electoral="...", unidad_territorial=ut_distrital,
        )
        c.tipos_eleccion.add(tipos["dip"])
        assert c.unidad_territorial == ut_distrital
        assert c.alcance_territorial == "distrital"

    def test_alcalde_con_ut_comunal(self, db, tipos, ut_comunal):
        c = Candidato.objects.create(
            nombre="Alc", apellido="Test", partido="P",
            propuesta_electoral="...", unidad_territorial=ut_comunal,
        )
        c.tipos_eleccion.add(tipos["alc"])
        assert c.unidad_territorial == ut_comunal
        assert c.alcance_territorial == "comunal"


class TestReverseRelations:
    def test_ut_comunal_expone_sus_candidatos(self, db, ut_comunal, tipos):
        c = Candidato.objects.create(
            nombre="Alc", apellido="Test", partido="P",
            propuesta_electoral="...", unidad_territorial=ut_comunal,
        )
        c.tipos_eleccion.add(tipos["alc"])
        assert list(ut_comunal.candidatos.all()) == [c]

    def test_ut_distrital_expone_sus_candidatos(self, db, ut_distrital, tipos):
        c = Candidato.objects.create(
            nombre="Dip", apellido="Test", partido="P",
            propuesta_electoral="...", unidad_territorial=ut_distrital,
        )
        c.tipos_eleccion.add(tipos["dip"])
        assert list(ut_distrital.candidatos.all()) == [c]
