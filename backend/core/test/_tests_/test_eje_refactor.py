"""Tests del refactor Eje: modelo, signal, endpoint, admin extensibility."""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Eje, Pregunta, TipoEleccion


@pytest.mark.django_db
class TestEjeModel:
    def test_migration_creo_7_ejes_canonicos(self, datos_pesados):
        codigos = set(Eje.objects.values_list("codigo", flat=True))
        canonicos = {"ECONOMIA", "SOCIEDAD", "AMBIENTE", "SEGURIDAD",
                     "DDHH", "INTERNACIONAL", "INSTITUCIONAL"}
        assert canonicos.issubset(codigos)

    def test_ejes_tienen_color_default(self, datos_pesados):
        eco = Eje.objects.get(codigo="ECONOMIA")
        assert eco.color.startswith("#")
        assert eco.nombre == "Economia"


@pytest.mark.django_db
class TestSignalSincronizacion:
    def test_setear_eje_fk_actualiza_string(self):
        tipo = TipoEleccion.objects.create(nombre="T")
        eje = Eje.objects.create(codigo="SALUD", nombre="Salud", color="#00A")
        p = Pregunta.objects.create(
            texto="Q", tipo_eleccion=tipo, eje=eje,
        )
        p.refresh_from_db()
        assert p.eje_tematico == "SALUD"

    def test_setear_solo_string_crea_fk(self):
        tipo = TipoEleccion.objects.create(nombre="T2")
        # Un eje nuevo que NO existe en canonicos:
        p = Pregunta.objects.create(
            texto="Q", tipo_eleccion=tipo, eje_tematico="EDUCACION",
        )
        p.refresh_from_db()
        assert p.eje is not None
        assert p.eje.codigo == "EDUCACION"
        assert p.eje.nombre == "Educacion"

    def test_string_case_insensitive_matchea_fk(self):
        Eje.objects.get_or_create(
            codigo="CULTURA", defaults={"nombre": "Cultura"},
        )
        tipo = TipoEleccion.objects.create(nombre="T3")
        p = Pregunta.objects.create(
            texto="Q", tipo_eleccion=tipo, eje_tematico="cultura",  # minuscula
        )
        p.refresh_from_db()
        assert p.eje.codigo == "CULTURA"


@pytest.mark.django_db
class TestEndpointEjes:
    def test_lista_publica(self, datos_pesados):
        client = APIClient()
        resp = client.get(reverse("eje-list"))
        assert resp.status_code == 200
        # Al menos los 7 canonicos.
        assert len(resp.data) >= 7
        # Verificar campos expuestos.
        first = resp.data[0]
        assert set(first.keys()) >= {"id", "codigo", "nombre", "color", "orden", "activo"}

    def test_no_requiere_auth(self, datos_pesados):
        anon = APIClient()
        resp = anon.get(reverse("eje-list"))
        assert resp.status_code == 200

    def test_filtra_inactivos_por_default(self, datos_pesados):
        Eje.objects.create(codigo="TEMPORAL", nombre="Temp", activo=False)
        client = APIClient()
        resp = client.get(reverse("eje-list"))
        codigos = {e["codigo"] for e in resp.data}
        assert "TEMPORAL" not in codigos

        # Con flag, aparece.
        resp2 = client.get(reverse("eje-list") + "?incluir_inactivos=true")
        codigos2 = {e["codigo"] for e in resp2.data}
        assert "TEMPORAL" in codigos2


@pytest.mark.django_db
class TestPreguntaSerializerConEje:
    def test_expone_eje_color(self, datos_pesados):
        from core.serializers import PreguntaSerializer
        pregunta = Pregunta.objects.filter(eje__isnull=False).first()
        assert pregunta is not None
        data = PreguntaSerializer(pregunta).data
        assert data["eje_color"] is not None
        assert data["eje_nombre"] is not None
