"""Tests del perfil de usuario (info, cambio password, eliminar cuenta)."""

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    CandidatoFavorito,
    RespuestaUsuario,
    OpcionRespuesta,
    Pregunta,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)
from core.services.perfil import (
    PerfilError,
    cambiar_password,
    eliminar_cuenta,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="jenny", email="jenny@example.com", password="ActualPass123!"
    )


@pytest.fixture
def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def user_con_datos(user, db):
    """User con algunos favoritos y respuestas para probar contadores."""
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    pregunta = Pregunta.objects.create(
        tipo_eleccion=tipo, texto="P1", eje_tematico="economia", orden=1
    )
    crear_opciones_acuerdo_desacuerdo(pregunta)
    candidato = Candidato.objects.create(nombre="Ana", apellido="X", partido="A")
    candidato.tipos_eleccion.add(tipo)

    RespuestaUsuario.objects.create(
        user=user,
        pregunta=pregunta,
        opcion_elegida=pregunta.opciones_respuesta.first(),
        peso=1,
    )
    CandidatoFavorito.objects.create(user=user, candidato=candidato)
    return user


# ---------------------------------------------------------------------------
# Service: cambiar_password
# ---------------------------------------------------------------------------
class TestCambiarPassword:
    def test_password_correcto_cambia(self, user):
        cambiar_password(user, "ActualPass123!", "NuevaPass456!")
        user.refresh_from_db()
        assert user.check_password("NuevaPass456!")
        assert not user.check_password("ActualPass123!")

    def test_password_actual_incorrecto_falla(self, user):
        with pytest.raises(PerfilError, match="actual es incorrecta"):
            cambiar_password(user, "WrongPass", "NuevaPass456!")

    def test_nueva_password_debil_falla(self, user):
        with pytest.raises(PerfilError):
            cambiar_password(user, "ActualPass123!", "12345")

    def test_nueva_password_igual_a_actual_falla(self, user):
        with pytest.raises(PerfilError, match="distinta"):
            cambiar_password(user, "ActualPass123!", "ActualPass123!")


# ---------------------------------------------------------------------------
# Service: eliminar_cuenta
# ---------------------------------------------------------------------------
class TestEliminarCuenta:
    def test_password_correcto_borra_user(self, user):
        user_id = user.id
        eliminar_cuenta(user, "ActualPass123!")
        assert not User.objects.filter(id=user_id).exists()

    def test_password_incorrecto_falla(self, user):
        with pytest.raises(PerfilError):
            eliminar_cuenta(user, "WrongPass")
        assert User.objects.filter(id=user.id).exists()

    def test_delete_cascadea_datos_relacionados(self, user_con_datos):
        user_id = user_con_datos.id
        eliminar_cuenta(user_con_datos, "ActualPass123!")
        assert RespuestaUsuario.objects.filter(user_id=user_id).count() == 0
        assert CandidatoFavorito.objects.filter(user_id=user_id).count() == 0


# ---------------------------------------------------------------------------
# API: GET /perfil/
# ---------------------------------------------------------------------------
class TestPerfilGET:
    def test_requiere_auth(self, db):
        client = APIClient()
        resp = client.get(reverse("perfil"))
        assert resp.status_code in (401, 403)

    def test_devuelve_info_basica(self, auth_client, user):
        resp = auth_client.get(reverse("perfil"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["username"] == user.username
        assert data["email"] == user.email
        assert "fecha_registro" in data
        assert data["contadores"]["respuestas"] == 0
        assert data["contadores"]["favoritos"] == 0

    def test_contadores_con_datos(self, auth_client, user_con_datos):
        resp = auth_client.get(reverse("perfil"))
        data = resp.json()
        assert data["contadores"]["respuestas"] == 1
        assert data["contadores"]["favoritos"] == 1


# ---------------------------------------------------------------------------
# API: POST /perfil/cambiar-password/
# ---------------------------------------------------------------------------
class TestCambiarPasswordAPI:
    def test_requiere_auth(self, db):
        client = APIClient()
        resp = client.post(reverse("perfil-cambiar-password"), {}, format="json")
        assert resp.status_code in (401, 403)

    def test_flow_ok(self, auth_client, user):
        resp = auth_client.post(
            reverse("perfil-cambiar-password"),
            {"current_password": "ActualPass123!", "new_password": "NuevaPass456!"},
            format="json",
        )
        assert resp.status_code == 200
        user.refresh_from_db()
        assert user.check_password("NuevaPass456!")

    def test_current_incorrecto_400(self, auth_client, user):
        resp = auth_client.post(
            reverse("perfil-cambiar-password"),
            {"current_password": "Wrong", "new_password": "NuevaPass456!"},
            format="json",
        )
        assert resp.status_code == 400
        user.refresh_from_db()
        assert user.check_password("ActualPass123!")


# ---------------------------------------------------------------------------
# API: DELETE /perfil/
# ---------------------------------------------------------------------------
class TestEliminarCuentaAPI:
    def test_requiere_auth(self, db):
        client = APIClient()
        resp = client.delete(reverse("perfil"))
        assert resp.status_code in (401, 403)

    def test_flow_ok(self, auth_client, user):
        resp = auth_client.delete(
            reverse("perfil"), {"password": "ActualPass123!"}, format="json"
        )
        assert resp.status_code == 204
        assert not User.objects.filter(id=user.id).exists()

    def test_sin_password_400(self, auth_client, user):
        resp = auth_client.delete(reverse("perfil"), {}, format="json")
        assert resp.status_code == 400
        assert User.objects.filter(id=user.id).exists()

    def test_password_incorrecto_400(self, auth_client, user):
        resp = auth_client.delete(
            reverse("perfil"), {"password": "Wrong"}, format="json"
        )
        assert resp.status_code == 400
        assert User.objects.filter(id=user.id).exists()
