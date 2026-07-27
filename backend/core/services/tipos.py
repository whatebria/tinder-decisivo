"""Helpers cacheados sobre TipoEleccion.

El query `TipoEleccion.objects.filter(es_base=True)` corre en cada request
que pide preguntas o calcula match. Los tipos base cambian una vez cada
varios anios (nuevo periodo electoral), asi que cachearlos por 1h no
introduce staleness relevante y ahorra 1 query por request.

Invalidacion: signal `post_save` / `post_delete` en TipoEleccion (ver
models/electoral.py) llama a `invalidar_cache_base_tipo_ids()` cuando
algo cambia. Zero staleness.
"""

from __future__ import annotations

from django.core.cache import cache

# Bump el sufijo `:vN` si cambia el shape del valor cacheado (ahora es list[int]).
CACHE_KEY_BASE_TIPO_IDS = "matching:base_tipo_ids:v1"
CACHE_TTL_SECONDS = 60 * 60  # 1h; el signal invalida antes si algo cambia


def get_base_tipo_ids() -> list[int]:
    """Devuelve los ids de todos los TipoEleccion con `es_base=True`.

    Cacheado en `CACHE_KEY_BASE_TIPO_IDS`. Miss -> query + set.
    Ordenado para hashabilidad predecible.
    """
    ids = cache.get(CACHE_KEY_BASE_TIPO_IDS)
    if ids is not None:
        return ids

    # Import local para evitar circular (tipos.py <- models <- signals <- tipos.py).
    from ..models import TipoEleccion

    ids = sorted(
        TipoEleccion.objects.filter(es_base=True).values_list("id", flat=True)
    )
    cache.set(CACHE_KEY_BASE_TIPO_IDS, ids, CACHE_TTL_SECONDS)
    return ids


def invalidar_cache_base_tipo_ids() -> None:
    """Fuerza refresh del cache. Llamado por el signal en TipoEleccion.

    Idempotente: si la key no esta seteada, no falla.
    """
    cache.delete(CACHE_KEY_BASE_TIPO_IDS)
