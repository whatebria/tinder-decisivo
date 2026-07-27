"""Tests de los nuevos filtros del feed de noticias: q, dias."""

import pytest
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import Noticia


URL = "/api/v1/noticias/"


def _items(response):
    """Extrae la lista paginada del response (shape: {count, next, previous, results})."""
    return response.json()["results"]


@pytest.fixture
def escenario(db):
    """4 noticias con distintas fuentes, edades y texto."""
    now = timezone.now()

    n_reciente = Noticia.objects.create(
        titulo="Debate economico esta semana",
        descripcion="Analisis del debate",
        url="https://x.cl/1",
        fuente="La Tercera",
    )
    n_semana = Noticia.objects.create(
        titulo="Nueva encuesta CADEM",
        descripcion="Sondeo actual",
        url="https://x.cl/2",
        fuente="Emol",
    )
    # Backdate: 10 dias
    Noticia.objects.filter(pk=n_semana.pk).update(
        fecha_publicacion=now - timedelta(days=10)
    )

    n_mes = Noticia.objects.create(
        titulo="Programa presidencial completo",
        descripcion="Detalle economia",
        url="https://x.cl/3",
        fuente="La Tercera",
    )
    Noticia.objects.filter(pk=n_mes.pk).update(
        fecha_publicacion=now - timedelta(days=45)
    )

    n_viejo = Noticia.objects.create(
        titulo="Historia partidista",
        descripcion="Retrospectiva",
        url="https://x.cl/4",
        fuente="Cooperativa",
    )
    Noticia.objects.filter(pk=n_viejo.pk).update(
        fecha_publicacion=now - timedelta(days=200)
    )
    return {"reciente": n_reciente, "semana": n_semana, "mes": n_mes, "viejo": n_viejo}


class TestFiltroDias:
    def test_dias_7_solo_devuelve_reciente(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"dias": 7}))
        assert len(data) == 1
        assert data[0]["titulo"] == "Debate economico esta semana"

    def test_dias_30_devuelve_reciente_y_semana(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"dias": 30}))
        titulos = {x["titulo"] for x in data}
        assert titulos == {"Debate economico esta semana", "Nueva encuesta CADEM"}

    def test_dias_90_incluye_el_de_45_dias(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"dias": 90}))
        assert len(data) == 3  # reciente + semana + mes, no viejo

    def test_dias_invalido_se_ignora(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"dias": "abc"}))
        assert len(data) == 4  # devuelve todas


class TestFiltroBusquedaTexto:
    def test_busqueda_en_titulo(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"q": "debate"}))
        assert len(data) == 1
        assert "Debate" in data[0]["titulo"]

    def test_busqueda_en_descripcion(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"q": "sondeo"}))
        assert len(data) == 1
        assert data[0]["titulo"] == "Nueva encuesta CADEM"

    def test_busqueda_case_insensitive(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"q": "PROGRAMA"}))
        assert len(data) == 1

    def test_busqueda_vacia_devuelve_todo(self, escenario):
        client = APIClient()
        assert len(_items(client.get(URL, {"q": ""}))) == 4
        assert len(_items(client.get(URL, {"q": "   "}))) == 4


class TestFiltrosCombinados:
    def test_dias_mas_fuente(self, escenario):
        client = APIClient()
        data = _items(client.get(URL, {"dias": 30, "fuente": "tercera"}))
        assert len(data) == 1
        assert data[0]["fuente"] == "La Tercera"

    def test_q_mas_dias(self, escenario):
        client = APIClient()
        # "programa" existe en n_mes (45 dias) -> con dias=7 no debe aparecer
        data = _items(client.get(URL, {"q": "programa", "dias": 7}))
        assert len(data) == 0
        # con dias=90 si
        data = _items(client.get(URL, {"q": "programa", "dias": 90}))
        assert len(data) == 1
