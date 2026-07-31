"""Tests del flujo de registro de usuarios (serializer + API).

Cubre especificamente que la password policy se aplica en POST /register/
(F9: bypass de validators en UserSerializer).
"""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def api():
    return APIClient()


class TestRegistroPasswordPolicy:
    """F9: el endpoint de registro debe rechazar passwords debiles."""

    def test_password_muy_corta_devuelve_400(self, api, db):
        """Una password de 1 caracter no debe crear el usuario."""
        resp = api.post(
            reverse("register"),
            {"username": "nuevo_user", "email": "nuevo@example.com", "password": "a"},
            format="json",
        )
        assert resp.status_code == 400
        assert not User.objects.filter(username="nuevo_user").exists()

    def test_password_muy_comun_devuelve_400(self, api, db):
        """'password123' esta en la lista negra de CommonPasswordValidator."""
        resp = api.post(
            reverse("register"),
            {
                "username": "nuevo_user",
                "email": "nuevo@example.com",
                "password": "password123",
            },
            format="json",
        )
        assert resp.status_code == 400
        assert not User.objects.filter(username="nuevo_user").exists()

    def test_password_solo_numerica_devuelve_400(self, api, db):
        """NumericPasswordValidator: password solo con digitos es rechazada."""
        resp = api.post(
            reverse("register"),
            {
                "username": "nuevo_user",
                "email": "nuevo@example.com",
                "password": "1234567890",
            },
            format="json",
        )
        assert resp.status_code == 400
        assert not User.objects.filter(username="nuevo_user").exists()

    def test_password_menor_a_10_chars_devuelve_400(self, api, db):
        """MinimumLengthValidator: min_length=10 en settings, no 8."""
        resp = api.post(
            reverse("register"),
            {
                "username": "nuevo_user",
                "email": "nuevo@example.com",
                "password": "Short1!",  # 7 chars — bajo del minimo
            },
            format="json",
        )
        assert resp.status_code == 400
        assert not User.objects.filter(username="nuevo_user").exists()

    def test_password_valida_crea_usuario(self, api, db):
        """Una password fuerte pasa todos los validators."""
        resp = api.post(
            reverse("register"),
            {
                "username": "nuevo_user",
                "email": "nuevo@example.com",
                "password": "Sup3r!Secur3Pass",
            },
            format="json",
        )
        assert resp.status_code == 201
        assert User.objects.filter(username="nuevo_user").exists()

    def test_error_response_incluye_campo_password(self, api, db):
        """La respuesta de error debe indicar el campo 'password'."""
        resp = api.post(
            reverse("register"),
            {"username": "x", "email": "x@x.com", "password": "a"},
            format="json",
        )
        assert resp.status_code == 400
        data = resp.json()
        assert "password" in data
