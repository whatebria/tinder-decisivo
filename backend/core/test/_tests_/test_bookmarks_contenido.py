"""Tests de bookmarks: noticias y posturas guardadas por el user."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    Noticia,
    NoticiaBookmark,
    OpcionRespuesta,
    PosturaBookmark,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)

User = get_user_model()


@pytest.fixture
def data(db):
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    pregunta = Pregunta.objects.create(
        texto="Test", tipo_eleccion=tipo, orden=0, eje_tematico=Pregunta.EJE_ECONOMIA
    )
    for v in range(1, 6):
        OpcionRespuesta.objects.create(pregunta=pregunta, texto=f"O{v}", valor=v)

    cand = Candidato.objects.create(nombre="Ada", apellido="P", partido="A")
    cand.tipos_eleccion.add(tipo)
    postura = PosturaCandidato.objects.create(
        candidato=cand,
        pregunta=pregunta,
        opcion_respuesta=OpcionRespuesta.objects.get(pregunta=pregunta, valor=5),
    )
    noticia = Noticia.objects.create(titulo="Test news", descripcion="lorem")
    user = User.objects.create_user(username="j", password="pw")
    other = User.objects.create_user(username="other", password="pw")
    return {
        "tipo": tipo, "pregunta": pregunta, "cand": cand,
        "postura": postura, "noticia": noticia, "user": user, "other": other,
    }


# ============================================================
# NoticiaBookmark
# ============================================================
class TestNoticiaBookmark:
    def test_requiere_auth(self, data):
        r = APIClient().get("/api/v1/noticias-guardadas/")
        assert r.status_code in (401, 403)

    def test_create_devuelve_201(self, data):
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.post("/api/v1/noticias-guardadas/", {"noticia": data["noticia"].id})
        assert r.status_code == 201
        assert r.json()["noticia_data"]["titulo"] == "Test news"

    def test_no_duplica(self, data):
        c = APIClient()
        c.force_authenticate(user=data["user"])
        c.post("/api/v1/noticias-guardadas/", {"noticia": data["noticia"].id})
        r = c.post("/api/v1/noticias-guardadas/", {"noticia": data["noticia"].id})
        assert r.status_code == 400

    def test_list_solo_del_user(self, data):
        NoticiaBookmark.objects.create(user=data["user"], noticia=data["noticia"])
        NoticiaBookmark.objects.create(user=data["other"], noticia=data["noticia"])
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.get("/api/v1/noticias-guardadas/")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_delete(self, data):
        b = NoticiaBookmark.objects.create(user=data["user"], noticia=data["noticia"])
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.delete(f"/api/v1/noticias-guardadas/{b.id}/")
        assert r.status_code == 204
        assert not NoticiaBookmark.objects.filter(id=b.id).exists()

    def test_no_puedo_borrar_de_otro_user(self, data):
        b = NoticiaBookmark.objects.create(user=data["other"], noticia=data["noticia"])
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.delete(f"/api/v1/noticias-guardadas/{b.id}/")
        assert r.status_code == 404


# ============================================================
# PosturaBookmark
# ============================================================
class TestPosturaBookmark:
    def test_create(self, data):
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.post("/api/v1/posturas-guardadas/", {"postura": data["postura"].id})
        assert r.status_code == 201
        pd = r.json()["postura_data"]
        assert pd["candidato"] == data["cand"].id
        assert "pregunta_texto" in pd

    def test_no_duplica(self, data):
        c = APIClient()
        c.force_authenticate(user=data["user"])
        c.post("/api/v1/posturas-guardadas/", {"postura": data["postura"].id})
        r = c.post("/api/v1/posturas-guardadas/", {"postura": data["postura"].id})
        assert r.status_code == 400

    def test_list_solo_del_user(self, data):
        PosturaBookmark.objects.create(user=data["user"], postura=data["postura"])
        PosturaBookmark.objects.create(user=data["other"], postura=data["postura"])
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.get("/api/v1/posturas-guardadas/")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_delete(self, data):
        b = PosturaBookmark.objects.create(user=data["user"], postura=data["postura"])
        c = APIClient()
        c.force_authenticate(user=data["user"])
        r = c.delete(f"/api/v1/posturas-guardadas/{b.id}/")
        assert r.status_code == 204
