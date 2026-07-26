"""Tests del feed global de noticias (GET /api/v1/noticias/ con filtros)."""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Candidato, Noticia


@pytest.fixture
def escenario(db):
    ana = Candidato.objects.create(nombre="Ana", apellido="Perez", partido="A")
    beto = Candidato.objects.create(nombre="Beto", apellido="Lopez", partido="B")

    n1 = Noticia.objects.create(
        titulo="Ana en debate", descripcion="...", url="https://x.cl/1",
        fuente="La Tercera",
    )
    n1.candidatos_mencionados.add(ana)

    n2 = Noticia.objects.create(
        titulo="Beto en gira", descripcion="...", url="https://x.cl/2",
        fuente="Emol",
    )
    n2.candidatos_mencionados.add(beto)

    n3 = Noticia.objects.create(
        titulo="Ana y Beto en foro", descripcion="...", url="https://x.cl/3",
        fuente="La Tercera",
    )
    n3.candidatos_mencionados.add(ana, beto)

    n4 = Noticia.objects.create(
        titulo="Noticia sin candidatos", descripcion="...", url="https://x.cl/4",
        fuente="Cooperativa",
    )
    return {"ana": ana, "beto": beto, "n1": n1, "n2": n2, "n3": n3, "n4": n4}


URL = "/api/v1/noticias/"


class TestFeedNoticiasGlobal:
    def test_endpoint_publico_sin_auth(self, escenario):
        client = APIClient()
        assert client.get(URL).status_code == 200

    def test_lista_todas_por_default(self, escenario):
        client = APIClient()
        data = client.get(URL).json()
        assert len(data) == 4

    def test_incluye_candidatos_mencionados_data(self, escenario):
        client = APIClient()
        data = client.get(URL).json()
        n = next(x for x in data if x["titulo"] == "Ana en debate")
        assert len(n["candidatos_mencionados_data"]) == 1
        assert n["candidatos_mencionados_data"][0]["nombre"] == "Ana"
        assert n["candidatos_mencionados_data"][0]["partido"] == "A"

    def test_filtra_por_candidato_id(self, escenario):
        client = APIClient()
        data = client.get(URL, {"candidato_id": escenario["ana"].id}).json()
        # Ana esta en n1 y n3
        titulos = {x["titulo"] for x in data}
        assert titulos == {"Ana en debate", "Ana y Beto en foro"}

    def test_filtra_por_fuente_case_insensitive(self, escenario):
        client = APIClient()
        data = client.get(URL, {"fuente": "tercera"}).json()
        assert len(data) == 2
        assert all("Tercera" in x["fuente"] for x in data)

    def test_orden_desc_por_fecha_publicacion(self, escenario):
        client = APIClient()
        data = client.get(URL).json()
        fechas = [x["fecha_publicacion"] for x in data]
        assert fechas == sorted(fechas, reverse=True)
