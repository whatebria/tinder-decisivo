"""
Validacion de seguridad para CORS_ALLOWED_ORIGIN_REGEXES (F7).

Separa la logica de validacion de settings.py para que sea facilmente
testeable sin necesidad de recargar todo el modulo de configuracion.

Uso en settings.py:
    from .cors_security import check_cors_regexes
    check_cors_regexes(CORS_ALLOWED_ORIGIN_REGEXES, debug=DEBUG)
"""

import logging
import re
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger("django.security.cors")

# Origenes "hostiles" que ningun regex bien escrito deberia aceptar.
# Si un regex hace match con alguno de estos, es demasiado amplio.
# Usamos re.match() porque django-cors-headers usa esa funcion internamente.
_HOSTILE_PROBES = [
    "https://attacker.evil-example.com",
    "https://totally-different-domain.io",
    "http://malicious.example.org",
    "https://notmydomain.xyz",
]


def check_cors_regexes(regexes: list[str], *, debug: bool = False) -> None:
    """Valida que los regex de CORS no sean peligrosamente amplios.

    - Regex invalido (no compila) -> ImproperlyConfigured siempre.
    - Regex que acepta origenes externos arbitrarios:
        - En DEBUG=False -> ImproperlyConfigured (no arranca).
        - En DEBUG=True  -> WARNING (no bloquea el desarrollo).

    Args:
        regexes: Lista de patrones de CORS_ALLOWED_ORIGIN_REGEXES.
        debug:   Valor de settings.DEBUG.
    """
    for pattern in regexes:
        if not pattern:
            continue

        # -- Valida que el regex compile -- siempre es un error si no compila.
        try:
            compiled = re.compile(pattern)
        except re.error as exc:
            raise ImproperlyConfigured(
                f"[F7] CORS_ALLOWED_ORIGIN_REGEXES contiene un regex invalido: "
                f"{pattern!r} -> {exc}"
            ) from exc

        # -- Verifica que no acepte origenes arbitrarios externos.
        for probe in _HOSTILE_PROBES:
            if compiled.match(probe):
                msg = (
                    f"[F7] CORS_ALLOWED_ORIGIN_REGEXES tiene un regex peligrosamente "
                    f"amplio: {pattern!r} acepta origenes como {probe!r}. "
                    f"Agrega anchors (^ y $) y un dominio especifico para limitar el alcance. "
                    f"Ejemplo seguro: r'^https://miapp\\.ejemplo\\.cl$'"
                )
                if not debug:
                    # En produccion, no arrancar con CORS abierto es lo correcto.
                    raise ImproperlyConfigured(msg)
                # En desarrollo, advertir sin bloquear.
                logger.warning(msg)
                break  # Un probe es suficiente para diagnosticar el patron.
