"""Tests de integridad del modelo territorial (regiones/distritos/comunas).

Verifica:
- El seed carga la cantidad correcta: 16/28/346.
- Cada comuna tiene region y distrito consistentes.
- Cada distrito pertenece a la misma region que sus comunas.
- Las restricciones unique estan activas.
"""

import pytest
from django.core.management import call_command
from django.db import IntegrityError

from core.models import Comuna, Distrito, Region


@pytest.fixture
def seed_territorio(db):
    """Carga el seed real de Chile una vez para toda la clase de tests."""
    call_command("seed_territorio_chile", verbosity=0)


class TestSeedTerritorio:
    def test_conteos_oficiales(self, seed_territorio):
        assert Region.objects.count() == 16
        assert Distrito.objects.count() == 28
        assert Comuna.objects.count() == 346

    def test_cada_comuna_tiene_region_y_distrito(self, seed_territorio):
        huerfanas = Comuna.objects.filter(region__isnull=True).count()
        sin_distrito = Comuna.objects.filter(distrito__isnull=True).count()
        assert huerfanas == 0
        assert sin_distrito == 0

    def test_distrito_y_comuna_pertenecen_a_misma_region(self, seed_territorio):
        """Sanity: si una comuna esta en distrito D, D debe estar en la misma region que la comuna."""
        inconsistentes = []
        for c in Comuna.objects.select_related("region", "distrito", "distrito__region"):
            if c.distrito.region_id != c.region_id:
                inconsistentes.append(
                    f"{c.nombre}: region={c.region_id} distrito.region={c.distrito.region_id}"
                )
        assert not inconsistentes, "Inconsistencias: " + "; ".join(inconsistentes[:5])

    def test_rm_tiene_52_comunas(self, seed_territorio):
        """La RM (codigo 13) tiene exactamente 52 comunas segun division actual."""
        rm = Region.objects.get(codigo="13")
        assert rm.comunas.count() == 52

    def test_distrito_10_incluye_nunoa_y_santiago(self, seed_territorio):
        """Verifica el mapeo distrito -> comunas para un distrito muy conocido."""
        d10 = Distrito.objects.get(numero=10)
        nombres = set(d10.comunas.values_list("nombre", flat=True))
        assert "Santiago" in nombres
        assert "Nunoa" in nombres
        assert "Providencia" in nombres

    def test_todas_las_regiones_tienen_al_menos_un_distrito(self, seed_territorio):
        sin_distritos = Region.objects.filter(distritos__isnull=True)
        assert not sin_distritos.exists(), (
            f"Regiones sin distrito: {list(sin_distritos.values_list('nombre', flat=True))}"
        )

    def test_todos_los_distritos_tienen_al_menos_una_comuna(self, seed_territorio):
        sin_comunas = Distrito.objects.filter(comunas__isnull=True)
        assert not sin_comunas.exists(), (
            f"Distritos sin comuna: {list(sin_comunas.values_list('numero', flat=True))}"
        )


class TestConstraintsTerritorio:
    def test_codigo_region_es_unico(self, db):
        Region.objects.create(numero_romano="I", codigo="99", nombre="Test")
        with pytest.raises(IntegrityError):
            Region.objects.create(numero_romano="II", codigo="99", nombre="Otro")

    def test_seed_es_idempotente(self, db):
        """Correr el seed dos veces no duplica nada."""
        call_command("seed_territorio_chile", verbosity=0)
        primera_c = Comuna.objects.count()
        call_command("seed_territorio_chile", verbosity=0)
        segunda_c = Comuna.objects.count()
        assert primera_c == segunda_c == 346
