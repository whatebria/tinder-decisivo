"""Tests del endpoint CandidatoDetailView con info territorial expandida."""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Candidato


@pytest.fixture
def api(db):
    return APIClient()


@pytest.mark.django_db
class TestCandidatoDetailTerritorial:
    def test_presidencial_nacional_no_tiene_territorio(self, api, datos_pesados):
        kast = Candidato.objects.get(apellido="Kast")
        # Un candidato puede correr en Presidencial 2025 (sin territorio) y
        # tambien en Presidencial 2021. Verificamos que si NO tiene unidad
        # territorial, el alcance es 'nacional'.
        if kast.unidad_territorial_id is None:
            resp = api.get(reverse("candidato-detail", args=[kast.id]))
            assert resp.status_code == 200
            data = resp.json()
            assert data["unidad_territorial"] is None
            assert data["comuna_nombre"] is None
            assert data["distrito_numero"] is None
            assert data["alcance_territorial"] == "nacional"

    def test_alcalde_expone_comuna_y_region(self, api, datos_pesados):
        alcalde = Candidato.objects.filter(
            unidad_territorial__nivel="comunal",
            unidad_territorial__nombre="Nunoa",
        ).first()
        assert alcalde is not None
        resp = api.get(reverse("candidato-detail", args=[alcalde.id]))
        assert resp.status_code == 200
        data = resp.json()
        assert data["comuna_nombre"] == "Nunoa"
        assert "Metropolitana" in data["comuna_region_nombre"]
        assert data["distrito_numero"] is None  # alcalde nunca tiene distrito
        assert data["alcance_territorial"] == "comunal"

    def test_diputado_expone_distrito(self, api, datos_pesados):
        diputado = Candidato.objects.filter(
            unidad_territorial__nivel="distrital",
            unidad_territorial__codigo="D-10",
        ).first()
        assert diputado is not None
        resp = api.get(reverse("candidato-detail", args=[diputado.id]))
        assert resp.status_code == 200
        data = resp.json()
        assert data["distrito_numero"] == 10
        assert data["distrito_nombre"] is not None
        assert data["comuna_nombre"] is None
        assert data["alcance_territorial"] == "distrital"

    def test_list_incluye_campos_territoriales(self, api, datos_pesados):
        resp = api.get(reverse("candidato-list"))
        assert resp.status_code == 200
        # Al menos un candidato debe tener info territorial expuesta.
        candidatos = resp.json()
        # Es paginado o lista directa?
        if isinstance(candidatos, dict) and "results" in candidatos:
            candidatos = candidatos["results"]
        keys = candidatos[0].keys()
        for campo in ("unidad_territorial", "comuna_nombre", "comuna_region_nombre",
                      "distrito_numero", "distrito_nombre", "alcance_territorial"):
            assert campo in keys, f"Falta {campo} en el serializer list"
