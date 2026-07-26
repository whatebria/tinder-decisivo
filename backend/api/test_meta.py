"""Tests del proyecto (health check, docs OpenAPI)."""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def anon_api():
    return APIClient()


class TestHealthCheck:
    def test_health_ok(self, anon_api, db):
        resp = anon_api.get(reverse("health-check"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["checks"]["database"] == "ok"
        assert "api_version" in data
        assert "django_version" in data

    def test_health_es_publico(self, anon_api, db):
        """Health check no requiere auth (para load balancers y uptime monitoring)."""
        resp = anon_api.get(reverse("health-check"))
        assert resp.status_code == 200


class TestOpenAPISchema:
    def test_schema_endpoint_responde(self, anon_api, db):
        resp = anon_api.get(reverse("schema"))
        assert resp.status_code == 200
        # Contenido puede ser application/vnd.oai.openapi (YAML por default)
        assert "openapi" in resp.content.decode()

    def test_swagger_ui_endpoint_responde(self, anon_api, db):
        resp = anon_api.get(reverse("swagger-ui"))
        assert resp.status_code == 200
        assert b"swagger" in resp.content.lower()

    def test_redoc_endpoint_responde(self, anon_api, db):
        resp = anon_api.get(reverse("redoc"))
        assert resp.status_code == 200
        assert b"redoc" in resp.content.lower()


class TestVersionadoAPI:
    def test_api_v1_prefix_funciona(self, anon_api, db):
        """Rutas viejas /api/... deben responder 404. Nuevas /api/v1/... deben andar."""
        # /api/tipos-eleccion/ ya no existe (movido a /api/v1/)
        resp_vieja = anon_api.get("/api/tipos-eleccion/")
        assert resp_vieja.status_code == 404

        # /api/v1/tipos-eleccion/ existe. Es publico (soporte modo guest)
        # asi que devuelve 200 sin token.
        resp_nueva = anon_api.get("/api/v1/tipos-eleccion/")
        assert resp_nueva.status_code == 200

    def test_bookmarking_sigue_requiriendo_auth(self, anon_api, db):
        """Los endpoints de datos del usuario NO pueden ser publicos."""
        for path in [
            "/api/v1/candidatos-favoritos/",
            "/api/v1/descartados/",
            "/api/v1/decision-final/",
            "/api/v1/respuestas/",
        ]:
            resp = anon_api.get(path)
            assert resp.status_code in (401, 403), f"{path} no protegido: {resp.status_code}"
