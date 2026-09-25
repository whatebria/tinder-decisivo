"""Tests para CookieTokenAuthentication y helpers set/clear_auth_cookie.

Verifica:
- Login setea cookie httpOnly.
- Logout limpia la cookie.
- Requests con cookie valida autentican correctamente.
- Requests sin cookie caen a header-based auth (fallback mobile).
- Cookie expirada/invalida da 401.
"""

import pytest
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from core.authentication import AUTH_COOKIE_NAME, set_auth_cookie, clear_auth_cookie


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="cookieuser", password="cookiepass123")


@pytest.fixture
def token(user):
    Token.objects.filter(user=user).delete()
    return Token.objects.create(user=user)


# ------------------------------------------------------------------
# Helper set_auth_cookie / clear_auth_cookie
# ------------------------------------------------------------------

@pytest.mark.django_db
def test_set_auth_cookie_atributos(user, token, rf):
    """set_auth_cookie debe poner cookie httpOnly, SameSite=Lax."""
    from django.http import HttpResponse
    response = HttpResponse()
    set_auth_cookie(response, token.key)

    cookie = response.cookies.get(AUTH_COOKIE_NAME)
    assert cookie is not None, "Cookie auth_token no seteada"
    assert cookie.value == token.key
    assert cookie["httponly"] is True or cookie["httponly"] == True  # noqa: E712
    assert cookie["samesite"].lower() == "lax"
    assert cookie["path"] == "/"


@pytest.mark.django_db
def test_clear_auth_cookie(user, token, rf):
    """clear_auth_cookie debe borrar la cookie (max-age=0 o expires pasado)."""
    from django.http import HttpResponse
    response = HttpResponse()
    set_auth_cookie(response, token.key)
    clear_auth_cookie(response)

    cookie = response.cookies.get(AUTH_COOKIE_NAME)
    # delete_cookie setea max_age=0 o un expires en el pasado
    assert cookie is not None
    max_age = cookie.get("max-age", None)
    expires = cookie.get("expires", "")
    assert max_age == 0 or "1970" in str(expires) or max_age == "" or cookie.value == ""


# ------------------------------------------------------------------
# Login endpoint: cookie seteada en la respuesta
# ------------------------------------------------------------------

@pytest.mark.django_db
def test_login_setea_cookie(client, user):
    """POST /login/ debe retornar Set-Cookie: auth_token."""
    response = client.post(
        "/api/v1/login/",
        {"username": "cookieuser", "password": "cookiepass123"},
        format="json",
    )
    assert response.status_code == 200
    assert AUTH_COOKIE_NAME in response.cookies, (
        f"Cookie '{AUTH_COOKIE_NAME}' no presente en respuesta de login"
    )
    # El body sigue teniendo token y user_id (backward compat con mobile)
    assert "token" in response.data
    assert "user_id" in response.data


@pytest.mark.django_db
def test_login_cookie_httponly(client, user):
    """La cookie debe ser httpOnly (no accesible desde JS)."""
    response = client.post(
        "/api/v1/login/",
        {"username": "cookieuser", "password": "cookiepass123"},
        format="json",
    )
    cookie = response.cookies.get(AUTH_COOKIE_NAME)
    assert cookie is not None
    assert cookie["httponly"] is True or cookie["httponly"] == True  # noqa: E712


# ------------------------------------------------------------------
# Autenticacion via cookie
# ------------------------------------------------------------------

@pytest.mark.django_db
def test_cookie_valida_autentica(client, user, token):
    """Un request con cookie valida debe ser autenticado."""
    client.cookies[AUTH_COOKIE_NAME] = token.key
    response = client.get("/api/v1/perfil/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_sin_cookie_ni_header_da_401(client):
    """Sin cookie ni header Authorization, debe devolver 401."""
    response = client.get("/api/v1/perfil/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_fallback_a_header_sin_cookie(client, user, token):
    """Sin cookie pero con Authorization header, debe autenticar (fallback mobile)."""
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    response = client.get("/api/v1/perfil/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_cookie_invalida_da_401(client):
    """Cookie con token inexistente debe dar 401."""
    client.cookies[AUTH_COOKIE_NAME] = "tokeninvalido1234567890"
    response = client.get("/api/v1/perfil/")
    assert response.status_code == 401


# ------------------------------------------------------------------
# Logout endpoint: cookie limpiada
# ------------------------------------------------------------------

@pytest.mark.django_db
def test_logout_limpia_cookie(client, user, token):
    """POST /logout/ debe incluir Set-Cookie que borre auth_token."""
    client.cookies[AUTH_COOKIE_NAME] = token.key
    response = client.post("/api/v1/logout/")
    assert response.status_code == 204

    cookie = response.cookies.get(AUTH_COOKIE_NAME)
    assert cookie is not None, "Respuesta de logout no borro la cookie"
    # Cookie borrada: max_age=0 o value vacio
    assert cookie.value == "" or cookie.get("max-age") == 0 or cookie.get("max-age") == ""


@pytest.mark.django_db
def test_logout_invalida_token_en_db(client, user, token):
    """Logout debe borrar el token de la BD (invalida header mobile tambien)."""
    client.cookies[AUTH_COOKIE_NAME] = token.key
    client.post("/api/v1/logout/")

    assert not Token.objects.filter(key=token.key).exists(), (
        "Token debe ser eliminado de la BD al hacer logout"
    )
