"""Tests del cache de tipos base (services/tipos.py).

Cubre: cache hit/miss, invalidacion por signal, invalidacion manual.
"""

from __future__ import annotations

import pytest
from django.core.cache import cache
from django.db import connection
from django.test.utils import CaptureQueriesContext

from core.models import TipoEleccion
from core.services.tipos import (
    CACHE_KEY_BASE_TIPO_IDS,
    get_base_tipo_ids,
    invalidar_cache_base_tipo_ids,
)


@pytest.fixture(autouse=True)
def _limpiar_cache():
    """Cache LocMem persiste entre tests dentro del mismo proceso; limpiar."""
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
class TestGetBaseTipoIds:
    def test_devuelve_solo_tipos_con_es_base_true(self):
        base = TipoEleccion.objects.create(nombre="Base A", es_base=True)
        TipoEleccion.objects.create(nombre="Presidencial 2025", es_base=False)

        ids = get_base_tipo_ids()

        assert ids == [base.id]

    def test_multiples_tipos_base_todos_incluidos_ordenados(self):
        b1 = TipoEleccion.objects.create(nombre="Base 1", es_base=True)
        b2 = TipoEleccion.objects.create(nombre="Base 2", es_base=True)
        TipoEleccion.objects.create(nombre="Especifico", es_base=False)

        ids = get_base_tipo_ids()

        assert ids == sorted([b1.id, b2.id])

    def test_sin_tipos_base_devuelve_lista_vacia(self):
        TipoEleccion.objects.create(nombre="Solo especifico", es_base=False)

        assert get_base_tipo_ids() == []

    def test_segunda_llamada_no_hace_query(self):
        TipoEleccion.objects.create(nombre="Base", es_base=True)
        # Primer llamado: caliente el cache.
        get_base_tipo_ids()

        # Segundo llamado: no debe golpear la DB.
        with CaptureQueriesContext(connection) as ctx:
            get_base_tipo_ids()
        assert len(ctx.captured_queries) == 0

    def test_setea_la_key_en_el_cache(self):
        TipoEleccion.objects.create(nombre="Base", es_base=True)
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is None

        get_base_tipo_ids()

        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is not None


@pytest.mark.django_db
class TestInvalidacion:
    def test_invalidar_manual_borra_la_key(self):
        TipoEleccion.objects.create(nombre="Base", es_base=True)
        get_base_tipo_ids()
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is not None

        invalidar_cache_base_tipo_ids()

        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is None

    def test_invalidar_sin_cache_seteado_no_falla(self):
        # Idempotencia: llamar sin cache previo debe ser no-op.
        invalidar_cache_base_tipo_ids()  # no raise

    def test_crear_tipo_eleccion_invalida_cache(self):
        # Cargar cache con estado vacio.
        get_base_tipo_ids()
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) == []

        # Crear un tipo debe disparar el signal post_save.
        TipoEleccion.objects.create(nombre="Nuevo base", es_base=True)

        # Cache invalidado.
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is None

    def test_editar_tipo_eleccion_invalida_cache(self):
        tipo = TipoEleccion.objects.create(nombre="Tipo", es_base=False)
        get_base_tipo_ids()  # cache poblado
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) == []

        # Editar: signal debe disparar.
        tipo.es_base = True
        tipo.save()

        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is None
        # Y la proxima llamada refleja el cambio.
        assert get_base_tipo_ids() == [tipo.id]

    def test_borrar_tipo_eleccion_invalida_cache(self):
        tipo = TipoEleccion.objects.create(nombre="Base", es_base=True)
        get_base_tipo_ids()
        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) == [tipo.id]

        tipo.delete()

        assert cache.get(CACHE_KEY_BASE_TIPO_IDS) is None
        assert get_base_tipo_ids() == []
