"""Tests del perfil territorial: UserProfile + endpoints /perfil/comuna/, /regiones/, /comunas/."""

import pytest
from django.contrib.auth.models import User
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Comuna, Region, UserProfile


@pytest.fixture
def seed_chile(db):
    call_command("seed_territorio_chile", verbosity=0)


@pytest.fixture
def user(db):
    return User.objects.create_user(username="votante", password="pw12345678")


@pytest.fixture
def api(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class TestUserProfileAutoCreado:
    def test_registrar_user_crea_profile(self, db):
        u = User.objects.create_user(username="nuevo", password="pw12345678")
        assert hasattr(u, "profile")
        assert u.profile.comuna is None

    def test_profile_es_unico_por_user(self, user):
        # El signal solo dispara en create, no debe crear duplicado.
        assert UserProfile.objects.filter(user=user).count() == 1


class TestPerfilGETIncluyeComuna:
    def test_perfil_sin_comuna_devuelve_null(self, api, seed_chile):
        resp = api.get(reverse("perfil"))
        assert resp.status_code == 200
        assert resp.data["comuna"] is None

    def test_perfil_con_comuna_devuelve_inline(self, api, user, seed_chile):
        nunoa = Comuna.objects.get(nombre="Nunoa")
        user.profile.comuna = nunoa
        user.profile.save()

        resp = api.get(reverse("perfil"))
        assert resp.status_code == 200
        assert resp.data["comuna"]["nombre"] == "Nunoa"
        assert resp.data["comuna"]["distrito_numero"] == 10
        assert "Metropolitana" in resp.data["comuna"]["region_nombre"]


class TestActualizarComunaEndpoint:
    def test_setear_comuna_valida(self, api, user, seed_chile):
        nunoa = Comuna.objects.get(nombre="Nunoa")
        resp = api.patch(
            reverse("perfil-comuna"),
            {"comuna_id": nunoa.id},
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["nombre"] == "Nunoa"
        user.profile.refresh_from_db()
        assert user.profile.comuna == nunoa

    def test_limpiar_comuna_con_null(self, api, user, seed_chile):
        nunoa = Comuna.objects.get(nombre="Nunoa")
        user.profile.comuna = nunoa
        user.profile.save()

        resp = api.patch(
            reverse("perfil-comuna"),
            {"comuna_id": None},
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data is None
        user.profile.refresh_from_db()
        assert user.profile.comuna is None

    def test_comuna_inexistente_devuelve_400(self, api, seed_chile):
        resp = api.patch(
            reverse("perfil-comuna"),
            {"comuna_id": 999999},
            format="json",
        )
        assert resp.status_code == 400

    def test_requiere_auth(self, db, seed_chile):
        anon = APIClient()
        resp = anon.patch(reverse("perfil-comuna"), {"comuna_id": 1}, format="json")
        assert resp.status_code in (401, 403)


class TestCatalogosTerritoriales:
    def test_regiones_list(self, db, seed_chile):
        anon = APIClient()
        resp = anon.get(reverse("region-list"))
        assert resp.status_code == 200
        assert len(resp.data) == 16
        # Orden norte-sur: la primera debe ser Arica y Parinacota.
        assert resp.data[0]["numero_romano"] == "XV"

    def test_comunas_list_filtra_por_region(self, db, seed_chile):
        anon = APIClient()
        rm = Region.objects.get(codigo="13")
        resp = anon.get(reverse("comuna-list"), {"region_id": rm.id})
        assert resp.status_code == 200
        assert len(resp.data) == 52

    def test_comunas_busqueda_por_nombre(self, db, seed_chile):
        anon = APIClient()
        resp = anon.get(reverse("comuna-list"), {"q": "nun"})
        assert resp.status_code == 200
        nombres = {c["nombre"] for c in resp.data}
        assert "Nunoa" in nombres

    def test_comunas_publico(self, db, seed_chile):
        """No requiere auth (info catastral publica)."""
        anon = APIClient()
        resp = anon.get(reverse("comuna-list"))
        assert resp.status_code == 200
