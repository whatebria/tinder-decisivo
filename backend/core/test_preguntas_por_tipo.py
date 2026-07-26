"""Tests del seed de preguntas especificas por tipo de eleccion."""

import pytest
from django.core.management import call_command

from core.models import (
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)


@pytest.fixture
def seed_completo(db):
    call_command("seed_territorio_chile", verbosity=0)
    call_command("seed_preguntas_base", verbosity=0)
    call_command("seed_presidenciales_2025", verbosity=0)
    call_command("seed_diputados_2025", verbosity=0)
    call_command("seed_alcaldes_2024", verbosity=0)
    call_command("seed_preguntas_por_tipo", verbosity=0)


class TestPreguntasEspecificas:
    def test_presi_2025_tiene_5_preguntas_especificas(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        preguntas = Pregunta.objects.filter(tipo_eleccion=tipo)
        assert preguntas.count() == 5

    def test_dip_2025_tiene_5_preguntas_especificas(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        assert Pregunta.objects.filter(tipo_eleccion=tipo).count() == 5

    def test_alc_2024_tiene_5_preguntas_especificas(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        assert Pregunta.objects.filter(tipo_eleccion=tipo).count() == 5

    def test_cada_pregunta_tiene_6_opciones(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        for p in Pregunta.objects.filter(tipo_eleccion=tipo):
            assert OpcionRespuesta.objects.filter(pregunta=p).count() == 6


class TestPosturasEspecificas:
    def test_presis_2025_tienen_posturas_especificas(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Presidencial 2025")
        preguntas_especificas = Pregunta.objects.filter(tipo_eleccion=tipo)
        for cand in tipo.candidatos.all():
            n = PosturaCandidato.objects.filter(
                candidato=cand, pregunta__in=preguntas_especificas,
            ).count()
            assert n == 5, f"{cand} tiene {n} posturas especificas de presi (esperadas 5)"

    def test_diputados_muestra_tiene_todas_posturas(self, seed_completo):
        tipo = TipoEleccion.objects.get(nombre="Diputados 2025")
        preguntas_esp = Pregunta.objects.filter(tipo_eleccion=tipo)
        # Sample de 10 diputados
        for cand in tipo.candidatos.all()[:10]:
            n = PosturaCandidato.objects.filter(
                candidato=cand, pregunta__in=preguntas_esp,
            ).count()
            assert n == 5

    def test_es_idempotente(self, seed_completo):
        cnt_before = PosturaCandidato.objects.count()
        preg_before = Pregunta.objects.count()
        call_command("seed_preguntas_por_tipo", verbosity=0)
        assert PosturaCandidato.objects.count() == cnt_before
        assert Pregunta.objects.count() == preg_before


class TestCoherenciaPosturas:
    def test_kast_extremo_derecha_en_defensa(self, seed_completo):
        """Kast debe estar 'Muy de acuerdo' con aumentar Defensa."""
        from core.models import Candidato
        kast = Candidato.objects.get(apellido="Kast")
        pregunta_defensa = Pregunta.objects.get(
            texto__contains="gasto en Defensa",
        )
        postura = PosturaCandidato.objects.get(
            candidato=kast, pregunta=pregunta_defensa,
        )
        assert postura.opcion_respuesta.valor == 5

    def test_jara_pc_pro_nueva_constitucion(self, seed_completo):
        """Jara (PC) debe estar 'Muy de acuerdo' con nueva Constitucion."""
        from core.models import Candidato
        jara = Candidato.objects.get(apellido="Jara")
        pregunta_const = Pregunta.objects.get(
            texto__contains="nueva Constitucion",
        )
        postura = PosturaCandidato.objects.get(
            candidato=jara, pregunta=pregunta_const,
        )
        assert postura.opcion_respuesta.valor == 5
