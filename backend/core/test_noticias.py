"""Tests de noticias por candidato: modelo, endpoint y management command."""

from unittest.mock import patch

import pytest
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Candidato, Noticia, TipoEleccion


# ------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------
@pytest.fixture
def anon_api():
    return APIClient()


@pytest.fixture
def candidato_ada(db):
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    c = Candidato.objects.create(
        nombre="Ada", apellido="Perez", partido="PartidoA", propuesta_electoral="..."
    )
    c.tipos_eleccion.add(tipo)
    return c


@pytest.fixture
def candidato_beto(db):
    tipo = TipoEleccion.objects.get_or_create(nombre="Presidencial")[0]
    c = Candidato.objects.create(
        nombre="Beto", apellido="Diaz", partido="PartidoB", propuesta_electoral="..."
    )
    c.tipos_eleccion.add(tipo)
    return c


# ============================================================
# Modelo
# ============================================================
class TestNoticiaModelo:
    def test_url_unica_solo_cuando_no_vacia(self, db):
        """Dos noticias con url='' deben poder coexistir."""
        Noticia.objects.create(titulo="A", descripcion="x", url="")
        Noticia.objects.create(titulo="B", descripcion="y", url="")
        assert Noticia.objects.count() == 2

    def test_url_no_vacia_es_unica(self, db):
        from django.db import IntegrityError
        Noticia.objects.create(titulo="A", descripcion="x", url="https://ejemplo.cl/1")
        with pytest.raises(IntegrityError):
            Noticia.objects.create(titulo="B", descripcion="y", url="https://ejemplo.cl/1")

    def test_m2m_candidatos_mencionados(self, db, candidato_ada, candidato_beto):
        n = Noticia.objects.create(titulo="Debate", descripcion="Ada vs Beto")
        n.candidatos_mencionados.add(candidato_ada, candidato_beto)
        assert n.candidatos_mencionados.count() == 2
        assert candidato_ada.noticias.first() == n


# ============================================================
# Endpoint /candidatos/<id>/noticias/
# ============================================================
class TestEndpointNoticiasPorCandidato:
    def test_devuelve_solo_noticias_del_candidato(
        self, anon_api, db, candidato_ada, candidato_beto
    ):
        n1 = Noticia.objects.create(titulo="Sobre Ada", descripcion="x", url="https://a.cl/1")
        n1.candidatos_mencionados.add(candidato_ada)
        n2 = Noticia.objects.create(titulo="Sobre Beto", descripcion="y", url="https://a.cl/2")
        n2.candidatos_mencionados.add(candidato_beto)

        resp = anon_api.get(
            reverse("candidato-noticias", kwargs={"candidato_id": candidato_ada.id})
        )
        assert resp.status_code == 200
        titulos = [n["titulo"] for n in resp.json()]
        assert titulos == ["Sobre Ada"]

    def test_candidato_sin_noticias_devuelve_lista_vacia(
        self, anon_api, candidato_ada
    ):
        resp = anon_api.get(
            reverse("candidato-noticias", kwargs={"candidato_id": candidato_ada.id})
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_es_publico(self, anon_api, candidato_ada):
        """No requiere auth (para que la app pueda mostrar noticias en el perfil publico)."""
        resp = anon_api.get(
            reverse("candidato-noticias", kwargs={"candidato_id": candidato_ada.id})
        )
        assert resp.status_code == 200


# ============================================================
# Management command fetch_noticias
# ============================================================
class TestFetchNoticiasCommand:
    def _fake_feed(self, entries):
        class FakeSource:
            def __init__(self, title):
                self.title = title

        class FakeEntry:
            def __init__(self, title, link, summary, source_name):
                self.title = title
                self.link = link
                self.summary = summary
                self.source = FakeSource(source_name)

        class FakeFeed:
            def __init__(self, entries):
                self.entries = [FakeEntry(*e) for e in entries]
                self.bozo = 0

        return FakeFeed(entries)

    @patch("core.management.commands.fetch_noticias.feedparser.parse")
    def test_crea_noticias_y_las_linkea(self, mock_parse, db, candidato_ada):
        mock_parse.return_value = self._fake_feed([
            ("Ada gana debate", "https://ejemplo.cl/1", "resumen", "La Tercera"),
            ("Ada visita region", "https://ejemplo.cl/2", "resumen", "Emol"),
        ])
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id))

        assert Noticia.objects.count() == 2
        assert candidato_ada.noticias.count() == 2
        assert Noticia.objects.filter(fuente="La Tercera").exists()

    @patch("core.management.commands.fetch_noticias.feedparser.parse")
    def test_idempotente_por_url(self, mock_parse, db, candidato_ada):
        mock_parse.return_value = self._fake_feed([
            ("Ada gana debate", "https://ejemplo.cl/1", "resumen", "La Tercera"),
        ])
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id))
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id))
        assert Noticia.objects.count() == 1
        assert candidato_ada.noticias.count() == 1  # el add() no duplica en M2M

    @patch("core.management.commands.fetch_noticias.feedparser.parse")
    def test_dry_run_no_escribe(self, mock_parse, db, candidato_ada):
        mock_parse.return_value = self._fake_feed([
            ("Ada gana debate", "https://ejemplo.cl/1", "resumen", "X"),
        ])
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id), "--dry-run")
        assert Noticia.objects.count() == 0

    @patch("core.management.commands.fetch_noticias.feedparser.parse")
    def test_misma_noticia_menciona_a_dos_candidatos(
        self, mock_parse, db, candidato_ada, candidato_beto
    ):
        mock_parse.return_value = self._fake_feed([
            ("Debate Ada vs Beto", "https://ejemplo.cl/debate", "x", "CNN"),
        ])
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id))
        call_command("fetch_noticias", "--candidato-id", str(candidato_beto.id))
        assert Noticia.objects.count() == 1
        noticia = Noticia.objects.get()
        assert noticia.candidatos_mencionados.count() == 2

    @patch("core.management.commands.fetch_noticias.feedparser.parse")
    def test_respeta_max_items(self, mock_parse, db, candidato_ada):
        mock_parse.return_value = self._fake_feed([
            (f"Noticia {i}", f"https://ejemplo.cl/{i}", "x", "F") for i in range(20)
        ])
        call_command("fetch_noticias", "--candidato-id", str(candidato_ada.id), "--max", "5")
        assert Noticia.objects.count() == 5
