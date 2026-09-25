"""Tests del refactor UnidadTerritorial (polimorfico)."""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    Comuna,
    Distrito,
    Region,
    TipoEleccion,
    UnidadTerritorial,
    UserProfile,
)


User = get_user_model()


@pytest.mark.django_db
class TestUnidadTerritorialModel:
    def test_migration_materializo_jerarquia(self, datos_pesados):
        # Chile tiene 1 nacional + 16 regiones + 28 distritos + 346 comunas.
        assert UnidadTerritorial.objects.filter(nivel="nacional").count() == 1
        assert UnidadTerritorial.objects.filter(nivel="regional").count() == 16
        assert UnidadTerritorial.objects.filter(nivel="distrital").count() == 28
        assert UnidadTerritorial.objects.filter(nivel="comunal").count() == 346

    def test_ancestros_correctos(self, datos_pesados):
        nunoa = UnidadTerritorial.objects.filter(
            nivel="comunal", nombre="Nunoa",
        ).first()
        assert nunoa is not None
        ancestros = nunoa.ancestros()
        niveles = [a.nivel for a in ancestros]
        assert niveles == ["distrital", "regional", "nacional"]

    def test_descendientes_ids(self, datos_pesados):
        rm = UnidadTerritorial.objects.get(
            nivel="regional", nombre__icontains="Metropolitana",
        )
        descendientes = rm.descendientes_ids()
        # RM tiene varios distritos y muchas comunas.
        assert len(descendientes) > 30


@pytest.mark.django_db
class TestSignalCandidato:
    """El signal de auto-sync se removio por performance. Los seeds y
    codigo cliente deben setear unidad_territorial explicitamente.
    Este test documenta esa decision y verifica que se puede setear en el
    constructor sin problema.
    """
    def test_crear_candidato_con_ut_explicita(self, datos_pesados):
        nunoa_ut = UnidadTerritorial.objects.get(nivel="comunal", nombre="Nunoa")
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        c = Candidato.objects.create(
            nombre="Test", apellido="Directo", partido="X",
            unidad_territorial=nunoa_ut,
        )
        c.tipos_eleccion.add(tipo)
        c.refresh_from_db()
        assert c.unidad_territorial_id == nunoa_ut.id

    def test_ut_null_cuando_no_se_setea(self, datos_pesados):
        """Documenta comportamiento: si no seteas UT queda null (candidato nacional)."""
        tipo = TipoEleccion.objects.get(nombre="Alcaldes 2024")
        c = Candidato.objects.create(
            nombre="Test", apellido="NoUT", partido="X",
        )
        c.tipos_eleccion.add(tipo)
        c.refresh_from_db()
        assert c.unidad_territorial is None


@pytest.mark.django_db
class TestFiltroMatchingPolimorfico:
    def test_votante_ve_ancestros(self, datos_pesados):
        """Votante en Nunoa debe ver alcaldes de Nunoa + diputados D10 + presis."""
        from core.services.matching import _filtrar_candidatos_por_territorio
        nunoa = Comuna.objects.get(nombre="Nunoa")

        qs = _filtrar_candidatos_por_territorio(Candidato.objects.all(), nunoa)
        candidatos = list(qs)

        # Debe incluir alcaldes de Nunoa (3).
        alcaldes_nunoa = [
            c for c in candidatos
            if c.unidad_territorial and c.unidad_territorial.nombre == "Nunoa"
        ]
        assert len(alcaldes_nunoa) == 3

        # Debe incluir diputados D10 (5).
        diputados_d10 = [
            c for c in candidatos
            if c.unidad_territorial and c.unidad_territorial.codigo == "D-10"
        ]
        assert len(diputados_d10) == 5

        # Debe incluir presidenciales (nacionales, UT=None).
        presis = [c for c in candidatos if c.unidad_territorial_id is None]
        assert len(presis) >= 8  # los 8 oficiales

        # NO debe incluir alcaldes de otra comuna.
        alcaldes_provi = [
            c for c in candidatos
            if c.unidad_territorial and c.unidad_territorial.nombre == "Providencia"
        ]
        assert len(alcaldes_provi) == 0

    def test_votante_ve_candidatos_regionales_futuros(self, datos_pesados):
        """Escalabilidad: agregar candidato en UT-regional debe aparecer.

        Simula agregar senadores en Region Metropolitana. El votante de Nunoa
        deberia verlos porque la region es ancestro de su comuna.
        """
        from core.services.matching import _filtrar_candidatos_por_territorio
        nunoa = Comuna.objects.get(nombre="Nunoa")
        rm_ut = UnidadTerritorial.objects.get(
            nivel="regional", nombre__icontains="Metropolitana",
        )
        tipo = TipoEleccion.objects.create(nombre="Senadores 2029 Test", anio=2029)
        senador = Candidato.objects.create(
            nombre="Senador", apellido="Test RM", partido="X",
            unidad_territorial=rm_ut,
        )
        senador.tipos_eleccion.add(tipo)

        qs = _filtrar_candidatos_por_territorio(Candidato.objects.all(), nunoa)
        assert qs.filter(id=senador.id).exists(), \
            "Votante en Nunoa deberia ver senador de RM (ancestro)"


@pytest.mark.django_db
class TestUserProfileSignal:
    def test_setear_comuna_auto_setea_ut(self, datos_pesados):
        user = User.objects.create_user(username="u1", password="p")
        # profile ya se creo por signal post_save.
        profile = user.profile
        profile.comuna = Comuna.objects.get(nombre="Nunoa")
        profile.save()
        profile.refresh_from_db()
        assert profile.unidad_territorial is not None
        assert profile.unidad_territorial.nombre == "Nunoa"


@pytest.mark.django_db
class TestEndpointUnidadTerritorial:
    def test_lista_todas(self, datos_pesados):
        client = APIClient()
        resp = client.get(reverse("unidad-territorial-list"))
        assert resp.status_code == 200
        # 1 nacional + 16 + 28 + 346 = 391.
        assert len(resp.data) == 391

    def test_filtra_por_nivel(self, datos_pesados):
        client = APIClient()
        resp = client.get(reverse("unidad-territorial-list") + "?nivel=comunal")
        assert resp.status_code == 200
        assert len(resp.data) == 346
        assert all(u["nivel"] == "comunal" for u in resp.data)

    def test_filtra_por_padre(self, datos_pesados):
        d10 = UnidadTerritorial.objects.get(nivel="distrital",
                                             metadata__numero_distrito=10)
        client = APIClient()
        resp = client.get(reverse("unidad-territorial-list") + f"?padre={d10.id}")
        assert resp.status_code == 200
        # D10 tiene 3 comunas hijas (Nunoa, Providencia, Santiago).
        assert len(resp.data) >= 2
        assert all(u["nivel"] == "comunal" for u in resp.data)

    def test_busqueda_por_nombre(self, datos_pesados):
        client = APIClient()
        resp = client.get(reverse("unidad-territorial-list") + "?q=nunoa")
        assert resp.status_code == 200
        nombres = {u["nombre"] for u in resp.data}
        assert "Nunoa" in nombres
