"""Tests del scope territorial del modelo Candidato.

Verifica:
- Un candidato presidencial puede tener comuna=null y distrito=null.
- Un candidato alcalde tiene comuna, distrito=null.
- Un candidato diputado tiene distrito, comuna=null.
- La restriccion prohibe tener comuna Y distrito simultaneamente.
- La property `alcance_territorial` devuelve la etiqueta correcta.
"""

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from core.models import Candidato, Comuna, Distrito, Region, TipoEleccion


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
def tipos(db):
    return {
        "pres": TipoEleccion.objects.create(nombre="Presidencial Test"),
        "dip": TipoEleccion.objects.create(nombre="Diputados Test"),
        "alc": TipoEleccion.objects.create(nombre="Alcalde Test"),
    }


class TestCandidatoTerritorial:
    def test_presidencial_sin_territorio(self, db, tipos):
        """Un candidato presidencial no tiene ni comuna ni distrito."""
        c = Candidato.objects.create(
            nombre="Prez", apellido="Test", partido="P", propuesta_electoral="...",
        )
        c.tipos_eleccion.add(tipos["pres"])
        assert c.comuna is None
        assert c.distrito is None
        assert c.alcance_territorial == "nacional"

    def test_diputado_con_distrito(self, db, tipos, distrito_10):
        c = Candidato.objects.create(
            nombre="Dip", apellido="Test", partido="P",
            propuesta_electoral="...", distrito=distrito_10,
        )
        c.tipos_eleccion.add(tipos["dip"])
        assert c.distrito == distrito_10
        assert c.comuna is None
        assert c.alcance_territorial == "distrital"

    def test_alcalde_con_comuna(self, db, tipos, comuna_nunoa):
        c = Candidato.objects.create(
            nombre="Alc", apellido="Test", partido="P",
            propuesta_electoral="...", comuna=comuna_nunoa,
        )
        c.tipos_eleccion.add(tipos["alc"])
        assert c.comuna == comuna_nunoa
        assert c.distrito is None
        assert c.alcance_territorial == "comunal"

    def test_no_puede_tener_comuna_y_distrito(self, db, comuna_nunoa, distrito_10):
        """La check-constraint de DB rechaza tener ambos a la vez."""
        with pytest.raises(IntegrityError):
            with transaction.atomic():
                Candidato.objects.create(
                    nombre="X", apellido="Y", partido="P",
                    propuesta_electoral="...",
                    comuna=comuna_nunoa, distrito=distrito_10,
                )

    def test_clean_da_mensaje_amigable(self, db, comuna_nunoa, distrito_10):
        """El .clean() del modelo levanta ValidationError anr la DB."""
        c = Candidato(
            nombre="X", apellido="Y", partido="P",
            propuesta_electoral="...",
            comuna=comuna_nunoa, distrito=distrito_10,
        )
        with pytest.raises(ValidationError) as excinfo:
            c.clean()
        assert "no puede tener comuna Y distrito" in str(excinfo.value)


class TestReverseRelations:
    def test_comuna_expone_sus_candidatos(self, db, comuna_nunoa, tipos):
        c = Candidato.objects.create(
            nombre="Alc", apellido="Test", partido="P",
            propuesta_electoral="...", comuna=comuna_nunoa,
        )
        c.tipos_eleccion.add(tipos["alc"])
        assert list(comuna_nunoa.candidatos.all()) == [c]

    def test_distrito_expone_sus_candidatos(self, db, distrito_10, tipos):
        c = Candidato.objects.create(
            nombre="Dip", apellido="Test", partido="P",
            propuesta_electoral="...", distrito=distrito_10,
        )
        c.tipos_eleccion.add(tipos["dip"])
        assert list(distrito_10.candidatos.all()) == [c]
