"""Muestra las matrices 12 listas x 15 preguntas para revision humana.

Imprime ambas matrices (Diputados y Senadores) + sus overrides.
"""
from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _posturas_base import (
    VECTOR_BASE_POR_LISTA,
    VECTOR_BASE_SENADORES_POR_LISTA,
    OVERRIDES_DIPUTADOS,
    OVERRIDES_SENADORES,
)

PREGUNTAS_DIP = [
    "1.Trib+", "2.Capital", "3.Aborto", "4.SLEP", "5.Glacia",
    "6.Penas+", "7.EstExc", "8.Plurin", "9.Fron+", "10.Reel-",
    "11.NuevaC", "12.Matri+", "13.Reduc-", "14.RoyAgua", "15.EscEtn",
]

PREGUNTAS_SEN = [
    "1.Bicam", "2.Nomb+", "3.Reel-", "4.Q2/3", "5.Reduc-",
    "6.-TPP", "7.+Pale", "8.+TIAR", "9.Prev+", "10.Roy+",
    "11.-Isap", "12.Euta", "13.ZonaSac", "14.LeyAT", "15.EscEtn",
]


def imprimir_bloque(titulo, vector_map, overrides, preguntas_cortas):
    print(f"\n{'=' * 100}")
    print(f"  {titulo}")
    print(f"{'=' * 100}")
    header = f"{'Lista':<58} " + " ".join(f"{p:>9}" for p in preguntas_cortas)
    print(header)
    print("-" * len(header))
    for lista, vec in vector_map.items():
        nombre_corto = lista if len(lista) <= 56 else lista[:53] + "..."
        vals = " ".join(f"{v:>9}" for v in vec)
        print(f"{nombre_corto:<58} {vals}")

    print(f"\nOverrides ({len(overrides)}):")
    for (partido, preg), val in sorted(overrides.items()):
        print(f"  {partido:>44s}  P{preg:<2}  ->  {val}")


def main():
    imprimir_bloque(
        "DIPUTADOS 2025 - vector base por lista",
        VECTOR_BASE_POR_LISTA, OVERRIDES_DIPUTADOS, PREGUNTAS_DIP,
    )
    imprimir_bloque(
        "SENADORES 2025 - vector base por lista",
        VECTOR_BASE_SENADORES_POR_LISTA, OVERRIDES_SENADORES, PREGUNTAS_SEN,
    )


if __name__ == "__main__":
    main()
