"""Tests de los seeds ficticios de Diputados 2025 y Alcaldes 2024.

Usa la fixture `datos_pesados` (session-scoped) que siembra UNA sola vez
todos los datos. Cada test es rapido porque solo lee la DB, no siembra.
"""

import pytest
from django.core.management import call_command

from core.models import Candidato, Comuna, Distrito, PosturaCandidato, TipoEleccion


@pytest.mark.django_db
class TestSeedDiputados2025:
    def test_crea_140_candidatos(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        assert tipo.anio == 2025
        assert tipo.candidatos.count() == 140

    def test_cada_distrito_tiene_5(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        for distrito in Distrito.objects.all():
            count = tipo.candidatos.filter(distrito=distrito).count()
            assert count == 5, f"Distrito {distrito.numero} tiene {count} diputados"

    def test_todos_tienen_distrito_asignado(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        sin_distrito = tipo.candidatos.filter(distrito__isnull=True).count()
        assert sin_distrito == 0

    def test_todos_tienen_8_posturas_base(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        for cand in tipo.candidatos.all()[:20]:
            n = PosturaCandidato.objects.filter(
                candidato=cand, pregunta__tipo_eleccion__es_base=True,
            ).count()
            assert n == 8

    def test_es_idempotente(self, datos_pesados):
        antes = Candidato.objects.filter(distrito__isnull=False).count()
        call_command("seed_diputados_2025", verbosity=0)
        despues = Candidato.objects.filter(distrito__isnull=False).count()
        assert antes == despues == 140


@pytest.mark.django_db
class TestSeedAlcaldes2024:
    def test_crea_1038_candidatos(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        assert tipo.anio == 2024
        assert tipo.candidatos.count() == 1038

    def test_cada_comuna_tiene_3(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        for comuna in Comuna.objects.all()[:30]:
            count = tipo.candidatos.filter(comuna=comuna).count()
            assert count == 3, f"Comuna {comuna.nombre} tiene {count} candidatos"

    def test_todos_tienen_comuna_asignada(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        sin_comuna = tipo.candidatos.filter(comuna__isnull=True).count()
        assert sin_comuna == 0

    def test_ninguno_tiene_distrito(self, datos_pesados):
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        con_distrito = tipo.candidatos.filter(distrito__isnull=False).count()
        assert con_distrito == 0
