"""Tests del algoritmo de matching (robusto) y de permisos de endpoints sensibles."""

from decimal import Decimal

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import (
    Candidato,
    MatchCandidato,
    Noticia,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    RespuestaUsuario,
    TipoEleccion,
)


# ------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------
@pytest.fixture
def user(db):
    return User.objects.create_user(username="votante", password="pw12345678")


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(username="admin", password="pw12345678")


@pytest.fixture
def api(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_api():
    return APIClient()


@pytest.fixture
def escenario_presidencial(db):
    """1 tipo eleccion, 2 preguntas (ejes distintos) con opciones 1..5 + 'No se', 2 candidatos con posturas."""
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    preguntas = []
    for i, (texto, eje) in enumerate([
        ("Aborto libre", Pregunta.EJE_SOCIEDAD),
        ("Renta basica", Pregunta.EJE_ECONOMIA),
    ]):
        p = Pregunta.objects.create(texto=texto, tipo_eleccion=tipo, orden=i, eje_tematico=eje)
        for val in range(1, 6):
            OpcionRespuesta.objects.create(pregunta=p, texto=f"Opcion {val}", valor=val)
        OpcionRespuesta.objects.create(pregunta=p, texto="No se", valor=0, es_no_se=True)
        preguntas.append(p)

    cand_a = Candidato.objects.create(
        nombre="Ada", apellido="Perez", partido="Partido A", propuesta_electoral="..."
    )
    cand_a.tipos_eleccion.add(tipo)
    cand_b = Candidato.objects.create(
        nombre="Beto", apellido="Diaz", partido="Partido B", propuesta_electoral="..."
    )
    cand_b.tipos_eleccion.add(tipo)

    # Ada responde valor 5 en ambas
    for p in preguntas:
        PosturaCandidato.objects.create(
            candidato=cand_a, pregunta=p,
            opcion_respuesta=OpcionRespuesta.objects.get(pregunta=p, valor=5),
        )
    # Beto responde valor 1 en ambas
    for p in preguntas:
        PosturaCandidato.objects.create(
            candidato=cand_b, pregunta=p,
            opcion_respuesta=OpcionRespuesta.objects.get(pregunta=p, valor=1),
        )
    return {"tipo": tipo, "preguntas": preguntas, "ada": cand_a, "beto": cand_b}


def _responder(user, pregunta, valor, peso=RespuestaUsuario.PESO_POCO):
    """Helper: crea una RespuestaUsuario apuntando a la opcion con ese valor."""
    opcion = OpcionRespuesta.objects.get(pregunta=pregunta, valor=valor)
    return RespuestaUsuario.objects.create(
        user=user, pregunta=pregunta, opcion_elegida=opcion, peso=peso,
    )


# ============================================================
# Match: casos basicos
# ============================================================
class TestMatchAlgoritmo:
    def test_match_perfecto_es_maximo(self, api, user, escenario_presidencial):
        """Con 2 preguntas perfectas, el suavizado Bayesiano (ALPHA=2, PRIOR=0.5)
        da (2+1)/(2+2)*100 = 75.00% para Ada y (0+1)/(2+2)*100 = 25.00% para Beto.

        El suavizado previene que candidatos con pocas preguntas de overlap
        dominen el ranking con 100% a partir de 1 sola respuesta (BUG-100%).
        Ada sigue siendo #1 y el orden es correcto.
        """
        for p in escenario_presidencial["preguntas"]:
            _responder(user, p, 5)
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data[0]["candidato_data"]["nombre"] == "Ada"
        # Suavizado: (2.0 + 2*0.5) / (2.0 + 2) * 100 = 75.00
        assert Decimal(data[0]["match_percentage"]) == Decimal("75.00")
        # Beto: (0 + 1) / (2+2) * 100 = 25.00
        assert Decimal(data[1]["match_percentage"]) == Decimal("25.00")

    def test_match_intermedio_no_lineal(self, api, user, escenario_presidencial):
        """User responde 3 (medio). Con formula no-lineal: diff=2 -> score=0.75 por pregunta.
        2 preguntas: score_total=1.5, peso_total=2.
        Con suavizado Bayesiano: (1.5+1) / (2+2) * 100 = 62.50%.
        Ada y Beto deben quedar empatados porque diff es simetrico.
        """
        for p in escenario_presidencial["preguntas"]:
            _responder(user, p, 3)
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        # Antes con formula lineal daba 50%. Con no-lineal raw da 75%, con
        # suavizado Bayesiano (ALPHA=2, PRIOR=0.5): (1.5+1)/(2+2)*100 = 62.50.
        assert Decimal(data[0]["match_percentage"]) == Decimal("62.50")
        assert Decimal(data[1]["match_percentage"]) == Decimal("62.50")

    def test_sin_respuestas_devuelve_400(self, api, escenario_presidencial):
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code == 400

    def test_falta_parametro_devuelve_400(self, api):
        resp = api.post(reverse("match-candidatos"), {}, format="json")
        assert resp.status_code == 400

    def test_tipo_eleccion_inexistente_devuelve_404(self, api):
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": 99999},
            format="json",
        )
        assert resp.status_code == 404

    def test_tipo_base_devuelve_400_con_code(self, api, db):
        """Match auth contra tipo con es_base=True devuelve 400 con code discriminado.

        Mismo contrato que /match-anonimo/: el front usa `code` para mostrar
        UI dedicada en vez del empty state genérico.
        """
        from core.models import TipoEleccion
        tipo_base = TipoEleccion.objects.create(nombre="Preguntas generales", es_base=True)
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": tipo_base.id},
            format="json",
        )
        assert resp.status_code == 400
        body = resp.json()
        assert body["code"] == "tipo_base_sin_candidatos"

    def test_endpoint_requiere_auth(self, anon_api, escenario_presidencial):
        resp = anon_api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code in (401, 403)


# ============================================================
# Match: features del algoritmo robusto
# ============================================================
class TestMatchRobusto:
    def test_no_se_se_excluye_del_calculo(self, api, user, escenario_presidencial):
        """Si el user marca 'No se' en una pregunta, esa pregunta se ignora.

        Con 1 sola pregunta considerada y score=1.0 (acuerdo total):
        suavizado Bayesiano: (1.0 + 2*0.5) / (1.0 + 2) * 100 = 2/3*100 = 66.67%.
        """
        p1, p2 = escenario_presidencial["preguntas"]
        # p1: 'No se'; p2: valor 5 (match perfecto con Ada)
        RespuestaUsuario.objects.create(
            user=user,
            pregunta=p1,
            opcion_elegida=OpcionRespuesta.objects.get(pregunta=p1, es_no_se=True),
        )
        _responder(user, p2, 5)

        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code == 200
        ada = next(x for x in resp.json() if x["candidato_data"]["nombre"] == "Ada")
        # 1 pregunta con diff=0: score_total=1.0, peso_total=1.0
        # smoothed = (1.0 + 1) / (1.0 + 2) * 100 = 66.67
        assert Decimal(ada["match_percentage"]) == Decimal("66.67")
        assert ada["preguntas_consideradas"] == 1  # p1 se excluyo

    def test_peso_mucho_hace_dealbreaker(self, api, user, escenario_presidencial):
        """User responde igual a Ada en p1 (peso MUCHO) y opuesto en p2 (peso NO_IMPORTA).

        score_total = 1.0*2.0 + 0.0*0.5 = 2.0, peso_total = 2.5.
        Con suavizado: (2.0 + 1) / (2.5 + 2) * 100 = 3/4.5 * 100 = 66.67%.
        Ada sigue superando a Beto (66.67 > 33.33), el peso pesado sigue importando.
        """
        p1, p2 = escenario_presidencial["preguntas"]
        _responder(user, p1, 5, peso=RespuestaUsuario.PESO_MUCHO)     # igual a Ada
        _responder(user, p2, 1, peso=RespuestaUsuario.PESO_NO_IMPORTA)  # opuesto a Ada

        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        ada = next(x for x in resp.json() if x["candidato_data"]["nombre"] == "Ada")
        # score_total=2.0, peso_total=2.5
        # smoothed = (2.0 + 2*0.5) / (2.5 + 2) * 100 = 3.0/4.5*100 = 66.67
        assert Decimal(ada["match_percentage"]) == Decimal("66.67")

    def test_breakdown_por_eje_tiene_estructura_correcta(self, api, user, escenario_presidencial):
        for p in escenario_presidencial["preguntas"]:
            _responder(user, p, 5)
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        ada = next(x for x in resp.json() if x["candidato_data"]["nombre"] == "Ada")
        breakdown = ada["breakdown_por_eje"]
        assert set(breakdown.keys()) == {Pregunta.EJE_SOCIEDAD, Pregunta.EJE_ECONOMIA}
        for eje_data in breakdown.values():
            assert eje_data["porcentaje"] == 100.0
            assert eje_data["preguntas"] == 1

    def test_confianza_tentativa_con_pocas_respuestas(self, api, user, escenario_presidencial):
        """Con solo 1 pregunta considerada, confianza deberia ser 'tentativa'."""
        p1 = escenario_presidencial["preguntas"][0]
        _responder(user, p1, 5)
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        ada = next(x for x in resp.json() if x["candidato_data"]["nombre"] == "Ada")
        assert ada["confianza"] == MatchCandidato.CONFIANZA_TENTATIVA

    def test_suavizado_bayesiano_previene_bug_100_porcento(self, api, user, escenario_presidencial):
        """Regression test: BUG-100% -- candidato con 1 sola pregunta de overlap
        no debe ser coronado con 100% de match en resultados parciales.

        Antes del fix: 1 pregunta perfecta = 100.00%.
        Con suavizado Bayesiano (ALPHA=2, PRIOR=0.5):
          (1.0 + 1) / (1.0 + 2) * 100 = 66.67% -- no domina el ranking.
        """
        p1 = escenario_presidencial["preguntas"][0]
        _responder(user, p1, 5)  # Solo responde 1 pregunta de 2 disponibles
        resp = api.post(
            reverse("match-candidatos"),
            {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
            format="json",
        )
        assert resp.status_code == 200
        ada = next(x for x in resp.json() if x["candidato_data"]["nombre"] == "Ada")
        # Con 1 pregunta de overlap: score_total=1.0, peso=1.0
        # smoothed = (1.0 + 1) / (1.0 + 2) * 100 = 66.67  (no 100%!)
        assert Decimal(ada["match_percentage"]) == Decimal("66.67")
        assert ada["preguntas_consideradas"] == 1
        assert ada["confianza"] == MatchCandidato.CONFIANZA_TENTATIVA

    def test_match_persiste_en_db(self, api, user, escenario_presidencial):
        """Segundo llamado usa update_or_create, no crea duplicados."""
        for p in escenario_presidencial["preguntas"]:
            _responder(user, p, 5)
        for _ in range(3):
            api.post(
                reverse("match-candidatos"),
                {"tipo_eleccion_id": escenario_presidencial["tipo"].id},
                format="json",
            )
        # Deberian existir exactamente 2 MatchCandidato (Ada y Beto)
        assert MatchCandidato.objects.filter(user=user).count() == 2


# ============================================================
# Submit answers: peso viaja en el payload
# ============================================================
class TestSubmitAnswers:
    def test_submit_con_peso_explicito(self, api, user, escenario_presidencial):
        p1, p2 = escenario_presidencial["preguntas"]
        op1 = OpcionRespuesta.objects.get(pregunta=p1, valor=5)
        op2 = OpcionRespuesta.objects.get(pregunta=p2, valor=3)
        payload = [
            {"pregunta": p1.id, "opcion_elegida": op1.id, "peso": RespuestaUsuario.PESO_MUCHO},
            {"pregunta": p2.id, "opcion_elegida": op2.id},  # peso default
        ]
        resp = api.post(reverse("submit-answers"), payload, format="json")
        assert resp.status_code == 201

        r1 = RespuestaUsuario.objects.get(user=user, pregunta=p1)
        r2 = RespuestaUsuario.objects.get(user=user, pregunta=p2)
        assert r1.peso == RespuestaUsuario.PESO_MUCHO
        assert r2.peso == RespuestaUsuario.PESO_POCO  # default

    def test_submit_valida_opcion_pertenece_a_pregunta(self, api, escenario_presidencial):
        p1, p2 = escenario_presidencial["preguntas"]
        opcion_de_p2 = OpcionRespuesta.objects.get(pregunta=p2, valor=5)
        payload = [{"pregunta": p1.id, "opcion_elegida": opcion_de_p2.id}]
        resp = api.post(reverse("submit-answers"), payload, format="json")
        assert resp.status_code == 400


# ============================================================
# Permisos de Noticias (regresion del hallazgo #2)
# ============================================================
class TestNoticiaPermisos:
    def test_get_publico_ok(self, anon_api, db):
        Noticia.objects.create(titulo="Test", descripcion="foo")
        resp = anon_api.get(reverse("noticia-list-create"))
        assert resp.status_code == 200

    def test_post_anon_denegado(self, anon_api):
        resp = anon_api.post(
            reverse("noticia-list-create"),
            {"titulo": "hack", "descripcion": "hack"},
            format="json",
        )
        assert resp.status_code in (401, 403)

    def test_post_user_normal_denegado(self, api):
        resp = api.post(
            reverse("noticia-list-create"),
            {"titulo": "hack", "descripcion": "hack"},
            format="json",
        )
        assert resp.status_code == 403

    def test_post_admin_ok(self, admin_user, db):
        client = APIClient()
        client.force_authenticate(user=admin_user)
        resp = client.post(
            reverse("noticia-list-create"),
            {"titulo": "oficial", "descripcion": "info"},
            format="json",
        )
        assert resp.status_code == 201
