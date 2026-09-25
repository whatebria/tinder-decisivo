"""Tests del flujo de password reset (service + API)."""

from datetime import timedelta

import pytest
from django.contrib.auth.models import User
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from core.models import PasswordResetToken
from core.services.password_reset import (
    ResetError,
    confirm_reset,
    request_reset,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="jenny", email="jenny@example.com", password="OldPass123!"
    )


@pytest.fixture
def api():
    return APIClient()


# ---------------------------------------------------------------------------
# Service: request_reset
# ---------------------------------------------------------------------------
class TestRequestReset:
    def test_email_valido_crea_token_y_envia_mail(self, user):
        result = request_reset(user.email)
        assert result.email_sent is True
        assert PasswordResetToken.objects.filter(user=user).count() == 1
        assert len(mail.outbox) == 1
        assert user.email in mail.outbox[0].to

    def test_email_inexistente_no_revela_nada(self, db):
        result = request_reset("noexiste@example.com")
        # Fingimos exito para evitar user enumeration.
        assert result.email_sent is True
        assert PasswordResetToken.objects.count() == 0
        # Y no mandamos mail.
        assert len(mail.outbox) == 0

    def test_email_vacio_error(self, db):
        with pytest.raises(ResetError):
            request_reset("")

    def test_case_insensitive(self, user):
        request_reset("JENNY@EXAMPLE.COM")
        assert PasswordResetToken.objects.filter(user=user).count() == 1

    def test_segunda_solicitud_invalida_token_anterior(self, user):
        """F2: el token anterior queda marcado como usado al pedir uno nuevo."""
        request_reset(user.email)
        token_viejo = PasswordResetToken.objects.get(user=user)

        request_reset(user.email)

        token_viejo.refresh_from_db()
        assert token_viejo.is_used, "El token anterior debe quedar marcado como usado"

        # Solo el nuevo token esta activo
        activos = PasswordResetToken.objects.filter(
            user=user, used_at__isnull=True
        )
        assert activos.count() == 1
        assert activos.first().token != token_viejo.token

    def test_token_anterior_invalido_tras_nueva_solicitud(self, user):
        """F2: usar el token viejo post-segunda-solicitud debe fallar."""
        request_reset(user.email)
        token_viejo = PasswordResetToken.objects.get(user=user)

        request_reset(user.email)  # invalida el anterior

        with pytest.raises(ResetError, match="ya fue usado"):
            confirm_reset(token_viejo.token, "NuevaPass_Segura123!")


# ---------------------------------------------------------------------------
# Service: confirm_reset
# ---------------------------------------------------------------------------
class TestConfirmReset:
    def test_token_valido_cambia_password(self, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)

        confirm_reset(token.token, "MyNewSecure_Pass123!")

        user.refresh_from_db()
        assert user.check_password("MyNewSecure_Pass123!")
        assert not user.check_password("OldPass123!")

    def test_token_marca_como_usado(self, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)

        confirm_reset(token.token, "MyNewSecure_Pass123!")

        token.refresh_from_db()
        assert token.is_used

    def test_confirm_reset_invalida_tokens_auth(self, user):
        """F15: confirm_reset debe borrar los tokens de auth existentes."""
        auth_token = Token.objects.create(user=user)
        request_reset(user.email)
        reset_token = PasswordResetToken.objects.get(user=user)

        confirm_reset(reset_token.token, "MyNewSecure_Pass123!")

        assert not Token.objects.filter(key=auth_token.key).exists()
        assert Token.objects.filter(user=user).count() == 0

    def test_token_ya_usado_falla(self, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)
        confirm_reset(token.token, "MyNewSecure_Pass123!")

        with pytest.raises(ResetError, match="ya fue usado"):
            confirm_reset(token.token, "OtroPass_456!")

    def test_token_expirado_falla(self, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)
        token.expires_at = timezone.now() - timedelta(hours=2)
        token.save()

        with pytest.raises(ResetError, match="expiro"):
            confirm_reset(token.token, "MyNewSecure_Pass123!")

    def test_token_inexistente_falla(self, user):
        with pytest.raises(ResetError, match="invalido"):
            confirm_reset("token-que-no-existe", "MyNewSecure_Pass123!")

    def test_password_debil_falla(self, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)

        with pytest.raises(ResetError):
            confirm_reset(token.token, "12345")  # muy corto y comun


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------
class TestPasswordResetAPI:
    def test_request_endpoint_publico(self, api, user):
        # Sin token de auth.
        resp = api.post(
            reverse("password-reset-request"),
            {"email": user.email},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email_sent"] is True

    def test_request_email_invalido_400(self, api, db):
        resp = api.post(
            reverse("password-reset-request"),
            {"email": "no-es-email"},
            format="json",
        )
        assert resp.status_code == 400

    def test_confirm_endpoint_publico(self, api, user):
        request_reset(user.email)
        token = PasswordResetToken.objects.get(user=user)

        resp = api.post(
            reverse("password-reset-confirm"),
            {"token": token.token, "new_password": "MyNewSecure_Pass123!"},
            format="json",
        )
        assert resp.status_code == 200

        user.refresh_from_db()
        assert user.check_password("MyNewSecure_Pass123!")

    def test_confirm_token_invalido_400(self, api, db):
        resp = api.post(
            reverse("password-reset-confirm"),
            {"token": "invalido", "new_password": "MyNewSecure_Pass123!"},
            format="json",
        )
        assert resp.status_code == 400
