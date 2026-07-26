"""Fixtures compartidas para toda la suite de tests.

`datos_pesados` es function-scoped: cada test que la pide siembra desde cero
en una transaccion aislada. Correcto pero lento (~10 seg por test).

Diseno explicitamente conservador: intentamos scope='session' primero pero
rompio 28 tests que asumian DB limpia. Nunca vale la pena romper aislamiento
para ganar velocidad.

Si en el futuro necesitas mas speed, la ruta correcta es:
1. Optimizar los seeds con bulk_create (elimina el bottleneck real).
2. NO cambiar el scope.
"""

import pytest
from django.core.management import call_command


@pytest.fixture
def datos_pesados(db):
    """Seed completo: territorio + presi + diputados + alcaldes + preguntas.

    Cada test paga ~10 seg de setup. A cambio: aislamiento total.
    """
    call_command("seed_territorio_chile", verbosity=0)
    call_command("seed_preguntas_base", verbosity=0)
    call_command("seed_presidenciales_2025", verbosity=0)
    call_command("seed_diputados_2025", verbosity=0)
    call_command("seed_alcaldes_2024", verbosity=0)
    call_command("seed_preguntas_por_tipo", verbosity=0)
