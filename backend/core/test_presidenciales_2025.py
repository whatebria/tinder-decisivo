"""Tests del seed de presidenciales 2025 + campo anio en TipoEleccion."""

import pytest
from django.core.management import call_command

from core.models import Candidato, PosturaCandidato, TipoEleccion


@pytest.fixture
def seed_base(db):
    call_command("seed_preguntas_base", verbosity=0)


@pytest.fixture
def seed_presi_2025(seed_base):
    call_command("seed_presidenciales_2025", verbosity=0)


class TestSeedPresidenciales2025:
    def test_crea_tipo_eleccion_con_anio(self, seed_presi_2025):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        assert tipo.anio == 2025
        assert not tipo.es_base

    def test_crea_los_8_candidatos_oficiales(self, seed_presi_2025):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        candidatos = list(tipo.candidatos.all())
        assert len(candidatos) == 8
        apellidos = {c.apellido for c in candidatos}
        assert {
            "Jara", "Kast", "Matthei", "Parisi",
            "Kaiser", "Enriquez-Ominami", "Mayne-Nicholls", "Artes",
        } == apellidos

    def test_todos_tienen_8_posturas_base(self, seed_presi_2025):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        for cand in tipo.candidatos.all():
            posturas = PosturaCandidato.objects.filter(
                candidato=cand, pregunta__tipo_eleccion__es_base=True,
            ).count()
            assert posturas == 8, f"{cand} tiene {posturas} posturas base, esperadas 8"

    def test_kast_puede_ser_multi_eleccion(self, seed_presi_2025):
        """Kast corre en 2025. Si tambien esta en Presi (2021), tiene dos tipos."""
        kast = Candidato.objects.get(nombre="Jose Antonio", apellido="Kast")
        nombres_tipos = set(kast.tipos_eleccion.values_list("nombre", flat=True))
        assert "Presidencial 2025" in nombres_tipos

    def test_es_idempotente(self, seed_base):
        call_command("seed_presidenciales_2025", verbosity=0)
        primera = Candidato.objects.count()
        call_command("seed_presidenciales_2025", verbosity=0)
        segunda = Candidato.objects.count()
        assert primera == segunda


class TestAnioTipoEleccion:
    def test_campo_anio_acepta_valores(self, db):
        tipo = TipoEleccion.objects.create(nombre="Test 2027", anio=2027)
        assert tipo.anio == 2027

    def test_puede_filtrar_por_anio(self, db):
        TipoEleccion.objects.create(nombre="Presi 2021 t", anio=2021)
        TipoEleccion.objects.create(nombre="Presi 2025 t", anio=2025)
        TipoEleccion.objects.create(nombre="Alcaldes 2024 t", anio=2024)

        del_2025 = TipoEleccion.objects.filter(anio=2025)
        assert del_2025.count() == 1
        assert del_2025.first().nombre == "Presi 2025 t"
