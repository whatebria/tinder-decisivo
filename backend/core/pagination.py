"""Clases de paginacion customizadas.

Preferimos paginacion selectiva (por endpoint) en vez de global para no
romper el frontend que asume list endpoints como arrays planos. Cuando
el frontend soporte paginacion, se puede promover a DEFAULT_PAGINATION_CLASS
en settings.
"""

from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Paginacion estandar: 25 por pagina, override via ?page_size=N (max 100).

    Response shape:
        {
            "count": 342,
            "next": "http://.../?page=3",
            "previous": "http://.../?page=1",
            "results": [...]
        }
    """

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100
