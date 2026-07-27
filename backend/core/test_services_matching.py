"""Tests unitarios puros para services/matching.py.

Estos tests NO tocan la base de datos ni levantan DRF. Testean las
funciones helper del algoritmo (score_pregunta, confianza_por_n) que son
puras — mismo input, mismo output, cero side effects.

Los tests de integracion end-to-end del algoritmo (que si usan DB,
usuarios reales, candidatos, etc.) viven en core/test_algoritmo_matching.py.

Beneficio del refactor: antes de mover el algoritmo a services/, estas
funciones vivian dentro de views.py como funciones privadas (_score_pregunta,
_confianza_por_n) y no eran directamente importables ni testeables sin
levantar todo el stack de DRF. Ahora si.
"""

from decimal import Decimal

import pytest

from core.models import MatchCandidato
from core.services.matching import (
    CONFIANZA_UMBRAL_ALTA,
    CONFIANZA_UMBRAL_MEDIA,
    MAX_DIFF_ESCALA,
    PESO_MULTIPLIERS,
    confianza_por_n,
    score_pregunta,
)


# ============================================================
# score_pregunta(diff)
# Formula: 1 - (diff/4)^2
# ============================================================
class TestScorePregunta:
    """Score no-lineal por diferencia entre respuestas."""

    def test_diff_cero_score_maximo(self):
        """Cuando el user y el candidato coinciden exactamente."""
        assert score_pregunta(0) == Decimal("1")

    def test_diff_uno_score_alto(self):
        """Diferencia minima (ej. 'Muy de acuerdo' vs 'De acuerdo')."""
        # 1 - (1/4)^2 = 1 - 0.0625 = 0.9375
        assert score_pregunta(1) == Decimal("0.9375")

    def test_diff_dos_score_medio(self):
        """Diferencia moderada (ej. 'Muy de acuerdo' vs 'Neutral')."""
        # 1 - (2/4)^2 = 1 - 0.25 = 0.75
        assert score_pregunta(2) == Decimal("0.75")

    def test_diff_tres_score_bajo(self):
        """Diferencia grande (ej. 'Muy de acuerdo' vs 'En desacuerdo')."""
        # 1 - (3/4)^2 = 1 - 0.5625 = 0.4375
        assert score_pregunta(3) == Decimal("0.4375")

    def test_diff_cuatro_score_cero(self):
        """Diferencia maxima (opuestos totales)."""
        # 1 - (4/4)^2 = 1 - 1 = 0
        assert score_pregunta(4) == Decimal("0")

    def test_penalizacion_no_lineal(self):
        """Verifica que dos diffs pequenos suman mas score que uno grande.

        Esto es la propiedad clave del score no-lineal.
        """
        dos_diffs_de_uno = score_pregunta(1) + score_pregunta(1)  # 1.875
        un_diff_de_dos = score_pregunta(2)  # 0.75

        # dos diffs=1 dan MAS puntos que un solo diff=2, aunque el "total" sea igual
        assert dos_diffs_de_uno > un_diff_de_dos

    def test_devuelve_decimal_no_float(self):
        """El calculo debe usar Decimal para evitar precision issues."""
        assert isinstance(score_pregunta(0), Decimal)
        assert isinstance(score_pregunta(2), Decimal)

    def test_monotonicidad(self):
        """A mayor diff, menor score. Sin excepciones."""
        scores = [score_pregunta(d) for d in range(5)]
        assert scores == sorted(scores, reverse=True)

    @pytest.mark.parametrize(
        "diff,expected",
        [
            (0, Decimal("1")),
            (1, Decimal("0.9375")),
            (2, Decimal("0.75")),
            (3, Decimal("0.4375")),
            (4, Decimal("0")),
        ],
    )
    def test_valores_esperados_parametrizados(self, diff, expected):
        """Version parametrizada de los tests puntuales de arriba.

        Documenta explicitamente la tabla completa que el algoritmo debe
        respetar. Si algun dia se cambia la formula, este test es el primero
        que debe re-derivarse a mano.
        """
        assert score_pregunta(diff) == expected


# ============================================================
# confianza_por_n(n)
# Umbrales: <5 tentativa, 5..9 media, >=10 alta
# ============================================================
class TestConfianzaPorN:
    """Nivel de confianza segun cantidad de preguntas consideradas."""

    def test_cero_preguntas_tentativa(self):
        assert confianza_por_n(0) == MatchCandidato.CONFIANZA_TENTATIVA

    def test_una_pregunta_tentativa(self):
        assert confianza_por_n(1) == MatchCandidato.CONFIANZA_TENTATIVA

    def test_justo_debajo_del_umbral_medio_tentativa(self):
        """N=4 sigue siendo tentativa (umbral es >=5)."""
        assert confianza_por_n(CONFIANZA_UMBRAL_MEDIA - 1) == MatchCandidato.CONFIANZA_TENTATIVA

    def test_justo_en_umbral_medio(self):
        """N=5 salta a media."""
        assert confianza_por_n(CONFIANZA_UMBRAL_MEDIA) == MatchCandidato.CONFIANZA_MEDIA

    def test_entre_umbrales_media(self):
        """N=7 esta entre 5 y 10 -> media."""
        assert confianza_por_n(7) == MatchCandidato.CONFIANZA_MEDIA

    def test_justo_debajo_del_umbral_alto_media(self):
        """N=9 sigue siendo media."""
        assert confianza_por_n(CONFIANZA_UMBRAL_ALTA - 1) == MatchCandidato.CONFIANZA_MEDIA

    def test_justo_en_umbral_alto(self):
        """N=10 salta a alta."""
        assert confianza_por_n(CONFIANZA_UMBRAL_ALTA) == MatchCandidato.CONFIANZA_ALTA

    def test_muy_por_encima_alta(self):
        """N grande sigue siendo alta (no hay tope)."""
        assert confianza_por_n(1000) == MatchCandidato.CONFIANZA_ALTA

    @pytest.mark.parametrize(
        "n,expected",
        [
            (0, MatchCandidato.CONFIANZA_TENTATIVA),
            (4, MatchCandidato.CONFIANZA_TENTATIVA),
            (5, MatchCandidato.CONFIANZA_MEDIA),
            (9, MatchCandidato.CONFIANZA_MEDIA),
            (10, MatchCandidato.CONFIANZA_ALTA),
            (100, MatchCandidato.CONFIANZA_ALTA),
        ],
    )
    def test_tabla_umbrales(self, n, expected):
        """Tabla completa de umbrales en un solo test parametrizado."""
        assert confianza_por_n(n) == expected


# ============================================================
# Constantes del algoritmo
# ============================================================
class TestConstantes:
    """Verifica que las constantes del algoritmo tengan valores esperados.

    Estos tests son la "documentacion ejecutable" de las decisiones de
    diseno. Si alguien cambia una constante, este test rompe y obliga a
    reconsiderar si el cambio fue intencional.
    """

    def test_max_diff_escala_es_cuatro(self):
        """Escala Likert 1-5 -> max diferencia posible es 4."""
        assert MAX_DIFF_ESCALA == Decimal("4")

    def test_peso_multipliers_completos(self):
        """Los 4 pesos declarables (0..3) deben tener multiplicador."""
        assert set(PESO_MULTIPLIERS.keys()) == {0, 1, 2, 3}

    def test_peso_no_importa_medio(self):
        """PESO_NO_IMPORTA no es 0 — cuenta la mitad (0.5x), no cero.

        Razon: si el user marca 'no me importa', igual queremos que la
        pregunta influya un poco. Cero seria descartar totalmente y
        eso es lo que hace la opcion 'No se' (es_no_se=True) en el modelo.
        """
        assert PESO_MULTIPLIERS[0] == Decimal("0.5")

    def test_peso_poco_es_neutro(self):
        """PESO_POCO (default) multiplica por 1.0."""
        assert PESO_MULTIPLIERS[1] == Decimal("1.0")

    def test_peso_mucho_es_dealbreaker(self):
        """PESO_MUCHO multiplica por 2.0 — dealbreaker efectivo."""
        assert PESO_MULTIPLIERS[3] == Decimal("2.0")

    def test_pesos_son_crecientes(self):
        """A mayor importancia declarada, mayor multiplicador. Sin excepciones."""
        pesos_ordenados = [PESO_MULTIPLIERS[i] for i in range(4)]
        assert pesos_ordenados == sorted(pesos_ordenados)

    def test_umbrales_confianza_ordenados(self):
        """El umbral de alta debe ser mayor al de media (obvio pero explicito)."""
        assert CONFIANZA_UMBRAL_ALTA > CONFIANZA_UMBRAL_MEDIA
        assert CONFIANZA_UMBRAL_MEDIA > 0

    def test_todos_los_pesos_devuelven_decimal(self):
        """Todos los multiplicadores son Decimal, no float."""
        for peso_key, mult in PESO_MULTIPLIERS.items():
            assert isinstance(mult, Decimal), f"peso {peso_key} no es Decimal"
