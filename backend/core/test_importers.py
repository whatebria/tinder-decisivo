"""Tests de los management commands de import."""

import io
from pathlib import Path

import pytest
from django.conf import settings
from django.core.management import CommandError, call_command
from django.test import override_settings

from core.models import Candidato, OpcionRespuesta, PosturaCandidato, Pregunta, TipoEleccion


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
def _write_csv(tmp_path: Path, filename: str, content: str) -> str:
    p = tmp_path / filename
    p.write_text(content, encoding="utf-8")
    return str(p)


# ============================================================
# import_candidatos
# ============================================================
class TestImportCandidatos:
    def test_import_basico(self, db, tmp_path):
        csv_content = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Ada,Perez,PartidoA,Santiago,Bio Ada,Propuesta Ada,Presidencial\n"
            "Beto,Diaz,PartidoB,Vina,Bio Beto,Propuesta Beto,Presidencial|Parlamentaria\n"
        )
        path = _write_csv(tmp_path, "candidatos.csv", csv_content)

        call_command("import_candidatos", path)

        assert Candidato.objects.count() == 2
        ada = Candidato.objects.get(nombre="Ada")
        assert ada.partido == "PartidoA"
        assert list(ada.tipos_eleccion.values_list("nombre", flat=True)) == ["Presidencial"]

        beto = Candidato.objects.get(nombre="Beto")
        assert set(beto.tipos_eleccion.values_list("nombre", flat=True)) == {"Presidencial", "Parlamentaria"}

    def test_import_idempotente_actualiza_no_duplica(self, db, tmp_path):
        csv1 = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Ada,Perez,PartidoA,Santiago,V1,V1,Presidencial\n"
        )
        csv2 = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Ada,Perez,PartidoA,Valparaiso,V2,V2,Presidencial\n"
        )
        call_command("import_candidatos", _write_csv(tmp_path, "c1.csv", csv1))
        call_command("import_candidatos", _write_csv(tmp_path, "c2.csv", csv2))

        assert Candidato.objects.count() == 1
        ada = Candidato.objects.get()
        assert ada.ciudad == "Valparaiso"
        assert ada.bio == "V2"

    def test_import_dry_run_no_escribe(self, db, tmp_path):
        csv = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Ada,Perez,PartidoA,Santiago,Bio,Prop,Presidencial\n"
        )
        call_command("import_candidatos", _write_csv(tmp_path, "c.csv", csv), "--dry-run")
        assert Candidato.objects.count() == 0

    def test_import_columnas_faltantes_falla(self, db, tmp_path):
        csv = "nombre,apellido\nAda,Perez\n"
        with pytest.raises(CommandError, match="Columnas requeridas faltantes"):
            call_command("import_candidatos", _write_csv(tmp_path, "c.csv", csv))

    def test_import_fila_invalida_no_aborta_todo(self, db, tmp_path, capsys):
        # Segunda fila valida, primera fila sin partido -> error solo en fila 1
        csv = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Sin,Partido,,X,,,Presidencial\n"
            "Ada,Perez,PartidoA,Santiago,,,Presidencial\n"
        )
        call_command("import_candidatos", _write_csv(tmp_path, "c.csv", csv))
        assert Candidato.objects.count() == 1
        assert Candidato.objects.get().nombre == "Ada"

    def test_archivo_inexistente_falla(self, db):
        with pytest.raises(CommandError, match="no encontrado"):
            call_command("import_candidatos", "/tmp/no_existe_este_archivo.csv")

    def test_tipo_eleccion_se_crea_si_no_existe(self, db, tmp_path):
        assert TipoEleccion.objects.count() == 0
        csv = (
            "nombre,apellido,partido,ciudad,bio,propuesta_electoral,tipos_eleccion\n"
            "Ada,Perez,PartidoA,X,,,NuevoTipo\n"
        )
        call_command("import_candidatos", _write_csv(tmp_path, "c.csv", csv))
        assert TipoEleccion.objects.get(nombre="NuevoTipo")


# ============================================================
# import_preguntas
# ============================================================
class TestImportPreguntas:
    def test_import_pregunta_auto_genera_6_opciones(self, db, tmp_path):
        csv = (
            "texto,tipo_eleccion,eje_tematico,orden\n"
            "El aborto libre debe ser legal,Presidencial,SOCIEDAD,1\n"
        )
        call_command("import_preguntas", _write_csv(tmp_path, "p.csv", csv))
        assert Pregunta.objects.count() == 1
        p = Pregunta.objects.get()
        assert p.eje_tematico == "SOCIEDAD"
        assert p.opciones_respuesta.count() == 6
        # una de ellas es 'No se'
        assert p.opciones_respuesta.filter(es_no_se=True).count() == 1

    def test_import_pregunta_idempotente(self, db, tmp_path):
        csv = (
            "texto,tipo_eleccion,eje_tematico,orden\n"
            "Pregunta 1,Presidencial,ECONOMIA,1\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        call_command("import_preguntas", path)
        call_command("import_preguntas", path)
        # No duplica preguntas ni opciones
        assert Pregunta.objects.count() == 1
        assert OpcionRespuesta.objects.count() == 6

    def test_import_pregunta_eje_invalido_falla_esa_fila(self, db, tmp_path):
        csv = (
            "texto,tipo_eleccion,eje_tematico,orden\n"
            "P1,Presidencial,LO_QUE_SEA,1\n"
            "P2,Presidencial,ECONOMIA,2\n"
        )
        call_command("import_preguntas", _write_csv(tmp_path, "p.csv", csv))
        assert Pregunta.objects.count() == 1
        assert Pregunta.objects.get().texto == "P2"

    def test_fixture_ejemplo_del_repo_funciona(self, db):
        """Sanity check: el CSV comitteado en fixtures/ carga sin errores."""
        from django.conf import settings
        csv_path = Path(settings.BASE_DIR) / "fixtures" / "preguntas_ejemplo.csv"
        assert csv_path.exists(), f"Falta {csv_path}"
        call_command("import_preguntas", str(csv_path))
        assert Pregunta.objects.count() == 12  # las 12 preguntas del ejemplo


class TestFixtureCandidatosDelRepo:
    def test_fixture_candidatos_ejemplo_del_repo_funciona(self, db):
        """Sanity check del CSV comitteado en fixtures/."""
        from django.conf import settings
        csv_path = Path(settings.BASE_DIR) / "fixtures" / "candidatos_ejemplo.csv"
        assert csv_path.exists()
        call_command("import_candidatos", str(csv_path))
        assert Candidato.objects.count() == 6  # los 6 candidatos historicos del ejemplo
        assert Candidato.objects.filter(nombre="Gabriel", apellido="Boric").exists()


# ============================================================
# import_posturas
# ============================================================
@pytest.fixture
def escenario_posturas(db):
    """Candidato + Pregunta + Opciones listos para importar posturas."""
    tipo = TipoEleccion.objects.create(nombre="Presidencial")
    candidato = Candidato.objects.create(
        nombre="Ada", apellido="Perez", partido="A", propuesta_electoral="..."
    )
    candidato.tipos_eleccion.add(tipo)
    from core.models import crear_opciones_acuerdo_desacuerdo
    pregunta = Pregunta.objects.create(
        texto="Aborto libre", tipo_eleccion=tipo, orden=1, eje_tematico="SOCIEDAD"
    )
    crear_opciones_acuerdo_desacuerdo(pregunta)
    return {"tipo": tipo, "candidato": candidato, "pregunta": pregunta}


class TestImportPosturas:
    def test_produccion_requiere_justificacion_y_fuente(self, escenario_posturas, tmp_path):
        """En modo produccion (DEBUG=False), el CSV sin justificacion/fuente falla."""
        csv = (
            "candidato_apellido,pregunta_orden,valor\n"
            "Perez,1,5\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        with override_settings(DEBUG=False):
            with pytest.raises(CommandError, match="Faltan columnas"):
                call_command("import_posturas", path)
        assert PosturaCandidato.objects.count() == 0

    def test_produccion_justificacion_corta_falla(self, escenario_posturas, tmp_path):
        """En produccion, justificacion < 20 chars es un error por fila."""
        csv = (
            "candidato_apellido,pregunta_orden,valor,justificacion,fuente_url\n"
            "Perez,1,5,corta,https://ejemplo.cl\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        with override_settings(DEBUG=False):
            call_command("import_posturas", path)
        # La fila tiene error pero no lanza excepcion (rollback silencioso)
        assert PosturaCandidato.objects.count() == 0

    def test_produccion_fuente_invalida_falla(self, escenario_posturas, tmp_path):
        """En produccion, fuente_url sin http falla la fila."""
        csv = (
            "candidato_apellido,pregunta_orden,valor,justificacion,fuente_url\n"
            "Perez,1,5,Esta es una justificacion suficientemente larga,no-es-url\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        with override_settings(DEBUG=False):
            call_command("import_posturas", path)
        assert PosturaCandidato.objects.count() == 0

    @override_settings(DEBUG=True)
    def test_debug_acepta_csv_sin_justificacion_ni_fuente(self, escenario_posturas, tmp_path):
        """En modo debug, basta con apellido + orden + valor."""
        csv = (
            "candidato_apellido,pregunta_orden,valor\n"
            "Perez,1,5\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        call_command("import_posturas", path)
        assert PosturaCandidato.objects.count() == 1
        postura = PosturaCandidato.objects.get()
        assert postura.opcion_respuesta.valor == 5
        assert "[DEBUG" in postura.justificacion

    @override_settings(DEBUG=True)
    def test_debug_acepta_justificacion_corta(self, escenario_posturas, tmp_path):
        """En modo debug, justificacion corta no es error."""
        csv = (
            "candidato_apellido,pregunta_orden,valor,justificacion,fuente_url\n"
            "Perez,1,4,corta,\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        call_command("import_posturas", path)
        assert PosturaCandidato.objects.count() == 1

    def test_produccion_carga_correcta(self, escenario_posturas, tmp_path):
        """Happy path en produccion: postura con justificacion y fuente validas."""
        csv = (
            "candidato_apellido,pregunta_orden,valor,justificacion,fuente_url\n"
            "Perez,1,5,Esta es una justificacion larga y descriptiva de la postura,https://ejemplo.cl\n"
        )
        path = _write_csv(tmp_path, "p.csv", csv)
        with override_settings(DEBUG=False):
            call_command("import_posturas", path)
        assert PosturaCandidato.objects.count() == 1
        assert PosturaCandidato.objects.get().opcion_respuesta.valor == 5
