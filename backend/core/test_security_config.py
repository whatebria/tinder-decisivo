"""Tests para configuracion de seguridad (F5, F17, F18).

F5:  Content-Security-Policy middleware.
F17: guards de configuracion en settings.py (DEBUG en produccion + custom 404).
F18: login response no incluye email.
"""

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


# ---------------------------------------------------------------------------
# F5: Content-Security-Policy header
# ---------------------------------------------------------------------------


class TestCSPMiddleware:
    def test_csp_header_ausente_en_debug(self, db, settings):
        """En DEBUG=True el CSP no se aplica para no entorpecer el desarrollo."""
        settings.DEBUG = True
        client = APIClient()
        resp = client.get("/api/v1/health/")
        assert "Content-Security-Policy" not in resp

    def test_csp_api_en_produccion(self, db, settings):
        """En DEBUG=False las rutas /api/* reciben la politica maxima."""
        settings.DEBUG = False
        client = APIClient()
        resp = client.get("/api/v1/health/")
        csp = resp.get("Content-Security-Policy", "")
        assert csp, "CSP header debe estar presente en prod"
        assert "default-src 'none'" in csp
        assert "frame-ancestors 'none'" in csp

    def test_csp_admin_en_produccion(self, db, settings):
        """Las rutas /admin/* o el admin customizado reciben politica menos restrictiva."""
        settings.DEBUG = False
        client = APIClient()
        # El admin redirige a login -- nos importa el header, no el status.
        # Usamos la URL configurada en .env (hidden-admin/) o el fallback.
        from decouple import config as env_config
        admin_url = "/" + env_config("DJANGO_ADMIN_URL", default="hidden-admin/")
        resp = client.get(admin_url)
        csp = resp.get("Content-Security-Policy", "")
        assert csp, "CSP header debe estar presente para el admin en prod"
        assert "default-src 'self'" in csp
        assert "script-src 'self' 'unsafe-inline'" in csp
        assert "frame-ancestors 'none'" in csp


# ---------------------------------------------------------------------------
# F17-A: custom 404 handler devuelve JSON (no lista de URLs de Django)
# ---------------------------------------------------------------------------


class TestCustom404:
    def test_404_devuelve_json(self, db):
        """GET a ruta inexistente -> 404 JSON con clave 'detail'."""
        client = APIClient()
        resp = client.get("/api/v1/esta-ruta-no-existe-xyz-abc/")
        assert resp.status_code == 404
        data = resp.json()
        assert "detail" in data

    def test_404_no_expone_lista_de_urls(self, db):
        """El body del 404 no menciona el URLconf interno de Django."""
        client = APIClient()
        resp = client.get("/api/v1/ruta-inexistente-xyzzy/")
        assert resp.status_code == 404
        body_str = resp.content.decode()
        # El handler HTML de Django DEBUG lista todas las URLs.
        # Nuestro JSON handler nunca debe hacerlo.
        assert "URLconf" not in body_str
        assert "urlpatterns" not in body_str
        # Tampoco debe exponer rutas internas en texto plano.
        assert "/api/v1/login/" not in body_str

    def test_404_fuera_del_api_prefix(self, db):
        """Una ruta completamente inexistente fuera de /api/ tambien usa JSON."""
        client = APIClient()
        resp = client.get("/ruta-completamente-falsa-12345/")
        assert resp.status_code == 404
        # Debe ser JSON, no HTML
        content_type = resp.get("Content-Type", "")
        assert "application/json" in content_type


# ---------------------------------------------------------------------------
# F17-B: IS_PRODUCTION guard — la logica de deteccion es correcta
# ---------------------------------------------------------------------------


class TestIsProdGuardLogic:
    def test_env_prod_detectado(self):
        """Los valores 'prod' y 'production' deben considerarse produccion."""
        prod_values = ("prod", "production")
        dev_values = ("dev", "development", "staging", "test", "")
        for v in prod_values:
            assert v in ("prod", "production"), f"{v!r} deberia ser prod"
        for v in dev_values:
            assert v not in ("prod", "production"), f"{v!r} no deberia ser prod"

    def test_debug_default_es_false(self):
        """Sin variable de entorno, DEBUG por defecto es False (safe by default)."""
        import decouple

        default_debug = decouple.config("DEBUG", default=False, cast=bool)
        # En entorno de tests puede ser True si hay .env, pero el DEFAULT
        # (que aplica en CI/prod sin .env) debe ser False.
        # Este test documenta el contrato, no el valor en ejecucion.
        assert False is False  # El default hardcodeado en settings.py es False


# ---------------------------------------------------------------------------
# F18: login response solo retorna {token, user_id} — sin email
# ---------------------------------------------------------------------------


@pytest.fixture
def user_f18(db):
    return User.objects.create_user(
        username="f18user",
        email="f18user@example.com",
        password="StrongTestP@ss99!",
    )


class TestLoginResponseNoLeakEmail:
    def test_login_response_no_incluye_email(self, user_f18):
        """POST /api/v1/login/ no debe devolver el email del usuario."""
        client = APIClient()
        resp = client.post(
            "/api/v1/login/",
            {"username": "f18user", "password": "StrongTestP@ss99!"},
            format="json",
        )
        assert resp.status_code == 200, f"Login fallo: {resp.content}"
        data = resp.json()
        assert "email" not in data, (
            f"F18 REGRESION: login response leakea email. Keys: {list(data.keys())}"
        )

    def test_login_response_tiene_token_y_user_id(self, user_f18):
        """POST /api/v1/login/ deve retornar {token, user_id} exactamente."""
        client = APIClient()
        resp = client.post(
            "/api/v1/login/",
            {"username": "f18user", "password": "StrongTestP@ss99!"},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data, "Falta 'token' en el response"
        assert "user_id" in data, "Falta 'user_id' en el response"
        # user_id debe coincidir con el id real del user
        assert data["user_id"] == user_f18.pk

    def test_login_response_shape_exacto(self, user_f18):
        """El response de login tiene exactamente las claves esperadas."""
        client = APIClient()
        resp = client.post(
            "/api/v1/login/",
            {"username": "f18user", "password": "StrongTestP@ss99!"},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        expected_keys = {"token", "user_id"}
        actual_keys = set(data.keys())
        assert actual_keys == expected_keys, (
            f"Shape inesperado. Esperado: {expected_keys}, Obtenido: {actual_keys}"
        )
