"""Fixtures compartidas para toda la suite de tests.

`seed_completo_session` corre los seeds pesados UNA sola vez por sesion de
pytest y persiste la data. Los tests que la usan reciben la DB ya poblada,
en vez de re-sembrar 1046 candidatos por test.

Truco: sobreescribir la fixture reservada `django_db_setup` de pytest-django
para inyectar los seeds al terminar el setup del schema.
"""

import pytest
from django.core.management import call_command


@pytest.fixture(scope="session")
def datos_pesados(django_db_setup, django_db_blocker):
    """Siembra territorio + preguntas base + los 3 seeds pesados UNA vez.

    Uso: pedir esta fixture en cualquier test.

    Los datos persisten toda la sesion. Cada test corre en una transaccion
    aparte que se rollbackea (via @pytest.mark.django_db normal), pero la
    data sembrada fuera de transaccion (aca) NO se rollbackea.
    """
    with django_db_blocker.unblock():
        call_command("seed_territorio_chile", verbosity=0)
        call_command("seed_preguntas_base", verbosity=0)
        call_command("seed_presidenciales_2025", verbosity=0)
        call_command("seed_diputados_2025", verbosity=0)
        call_command("seed_alcaldes_2024", verbosity=0)
        call_command("seed_preguntas_por_tipo", verbosity=0)
    yield
