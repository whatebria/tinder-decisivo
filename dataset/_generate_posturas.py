"""Genera posturas_diputados_2025.csv y posturas_presidencial_2025.csv.

Split honesto por tipo de eleccion:
  - Los 1,096 candidatos con tipos_eleccion='Diputados 2025' generan posturas
    contra las 15 preguntas de preguntas_diputados_2025.csv.

Cada bloque usa su propia matriz base + overrides + probabilidades de omision
definidas en _posturas_base.py. Fuentes URL se comparten (son por lista).

Ruido deterministico +/-1 y omisiones deterministicas (mismos algoritmos).
"""
from __future__ import annotations

import csv
import hashlib
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _posturas_base import (
    VECTOR_BASE_POR_LISTA,
    VECTOR_PRESIDENCIAL_POR_CANDIDATO,
    OVERRIDES_DIPUTADOS,
    FUENTES_URL_POR_LISTA,
    FUENTES_URL_POR_CANDIDATO_PRES,
    PROB_OMISION_DIPUTADOS,
    PROB_OMISION_PRESIDENCIAL,
)

DATASET = Path(__file__).parent
CANDIDATOS_CSV = DATASET / "candidatos_parlamentaria_2025.csv"
CANDIDATOS_PRES_CSV = DATASET / "candidatos_presidencial_2025.csv"
PREGUNTAS_DIP_CSV = DATASET / "preguntas_diputados_2025.csv"
PREGUNTAS_PRES_CSV = DATASET / "preguntas_presidencial_2025.csv"
OUT_DIP_CSV = DATASET / "posturas_diputados_2025.csv"
OUT_PRES_CSV = DATASET / "posturas_presidencial_2025.csv"

PROB_IGUAL = 0.60
PROB_BAJA = 0.20


def normaliza_partido(p: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFD", p.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.strip()


def seed_candidato(nombre: str, apellido: str, partido: str, tipo: str) -> int:
    """Seed determinista por (candidato, tipo). Incluye tipo para que
    diputados y senadores nunca compartan el mismo seed si un candidato
    aparece en ambos (defensive: hoy no pasa pero futuro-proof)."""
    key = f"{nombre}|{apellido}|{partido}|{tipo}".encode("utf-8")
    return int(hashlib.sha256(key).hexdigest()[:8], 16)


def debe_omitir(
    nombre: str, apellido: str, partido: str, tipo: str,
    pregunta_orden: int, prob_map: dict[int, float],
) -> bool:
    prob = prob_map.get(pregunta_orden, 0.0)
    if prob <= 0:
        return False
    key = f"OMIT|{nombre}|{apellido}|{partido}|{tipo}|{pregunta_orden}".encode("utf-8")
    h = int(hashlib.sha256(key).hexdigest()[:8], 16)
    return (h / 0xFFFFFFFF) < prob


def clamp(v: int, lo: int = 1, hi: int = 5) -> int:
    return max(lo, min(hi, v))


def justificacion(base: int, valor: int, lista: str, partido: str, override: bool) -> str:
    partes = []
    if override:
        partes.append(f"[INFERIDO POR PARTIDO: {partido}]")
    else:
        partes.append(f"[INFERIDO POR LISTA: {lista}]")
    delta = valor - base
    if delta == 0:
        partes.append("Postura tomada del vector base de la coalicion sin desviacion.")
    elif delta > 0:
        partes.append(
            f"Base coalicion={base}, candidato={valor} (RUIDO +1 deterministico). "
            f"Refleja variacion intra-partido no verificada."
        )
    else:
        partes.append(
            f"Base coalicion={base}, candidato={valor} (RUIDO -1 deterministico). "
            f"Refleja variacion intra-partido no verificada."
        )
    partes.append(
        "Data sintetica. NO es declaracion personal del candidato. "
        "Ver dataset/README.md."
    )
    return " ".join(partes)


def generar_bloque(
    candidatos: list[dict],
    preguntas: list[dict],
    vector_por_lista: dict[str, tuple[int, ...]],
    overrides: dict[tuple[str, int], int],
    prob_omision: dict[int, float],
    tipo_label: str,
) -> tuple[list[dict], dict, dict]:
    """Genera posturas para un subconjunto de candidatos + su cuestionario."""
    out_rows = []
    stats = {
        "total": 0, "sin_desv": 0, "sube": 0, "baja": 0,
        "clamp_sube": 0, "clamp_baja": 0, "omitidas": 0,
    }
    n_preg = len(preguntas)
    omisiones_por_pregunta = {i: 0 for i in range(1, n_preg + 1)}
    candidatos_procesados = 0

    for c in candidatos:
        lista = c["lista_electoral"]
        partido = c["partido"]
        partido_norm = normaliza_partido(partido)

        vector_base = vector_por_lista.get(lista)
        if vector_base is None:
            print(f"  [{tipo_label}] ADVERTENCIA: lista '{lista}' no en matriz. Skip.")
            continue
        assert len(vector_base) == n_preg, (
            f"Vector '{lista}' tiene {len(vector_base)} valores, esperaba {n_preg}"
        )

        rng = random.Random(seed_candidato(c["nombre"], c["apellido"], partido, tipo_label))
        fuente_url = FUENTES_URL_POR_LISTA.get(lista, "https://www.servel.cl/")
        candidatos_procesados += 1

        for i, pregunta in enumerate(preguntas, start=1):
            if debe_omitir(c["nombre"], c["apellido"], partido, tipo_label, i, prob_omision):
                stats["omitidas"] += 1
                omisiones_por_pregunta[i] += 1
                rng.random()  # consumir para preservar determinismo del resto
                continue

            base = vector_base[i - 1]
            override_val = overrides.get((partido_norm, i))
            override = override_val is not None
            base_effective = override_val if override else base

            r = rng.random()
            if r < PROB_IGUAL:
                valor = base_effective
                stats["sin_desv"] += 1
            elif r < PROB_IGUAL + PROB_BAJA:
                nuevo = base_effective - 1
                valor = clamp(nuevo)
                stats["clamp_baja" if nuevo != valor else "baja"] += 1
            else:
                nuevo = base_effective + 1
                valor = clamp(nuevo)
                stats["clamp_sube" if nuevo != valor else "sube"] += 1

            just = justificacion(base_effective, valor, lista, partido, override)
            out_rows.append({
                "candidato_apellido": c["apellido"],
                "candidato_nombre": c["nombre"],
                "candidato_partido": partido,
                "pregunta_orden": i,
                "pregunta_texto_ref": pregunta["texto"][:60],
                "valor": valor,
                "justificacion": just,
                "fuente_url": fuente_url,
            })
            stats["total"] += 1

    return out_rows, stats, {
        "candidatos_procesados": candidatos_procesados,
        "omisiones_por_pregunta": omisiones_por_pregunta,
    }


def escribir_csv(path: Path, rows: list[dict]) -> None:
    fieldnames = [
        "candidato_apellido", "candidato_nombre", "candidato_partido",
        "pregunta_orden", "pregunta_texto_ref",
        "valor", "justificacion", "fuente_url",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(rows)


def imprimir_stats(tipo_label: str, stats: dict, meta: dict, prob_map: dict, n_preg: int) -> None:
    n_cand = meta["candidatos_procesados"]
    total_potencial = n_cand * n_preg
    print(f"\n=== {tipo_label} ===")
    print(f"Candidatos procesados: {n_cand:,}")
    print(f"Total potencial: {total_potencial:,}")
    print(f"Posturas escritas: {stats['total']:,} ({stats['total']*100/total_potencial:.1f}%)")
    print(f"Omitidas: {stats['omitidas']:,} ({stats['omitidas']*100/total_potencial:.1f}%)")

    if stats["total"] > 0:
        print(f"  Sin desviacion  : {stats['sin_desv']:,} ({stats['sin_desv']*100/stats['total']:.1f}%)")
        print(f"  Sube +1         : {stats['sube']:,} ({stats['sube']*100/stats['total']:.1f}%)")
        print(f"  Baja -1         : {stats['baja']:,} ({stats['baja']*100/stats['total']:.1f}%)")
        print(f"  Clamp base=5    : {stats['clamp_sube']:,}")
        print(f"  Clamp base=1    : {stats['clamp_baja']:,}")

    print(f"\n  Omisiones por pregunta:")
    for i in range(1, n_preg + 1):
        obs = meta["omisiones_por_pregunta"][i]
        pct = obs * 100 / n_cand if n_cand else 0
        prob_teo = prob_map.get(i, 0) * 100
        print(f"    {i:>2}: {obs:>4} ({pct:>4.1f}% obs / {prob_teo:>4.0f}% teo)")


def apellido_key_presidencial(apellido: str) -> str:
    """Normaliza apellido para lookup en VECTOR_PRESIDENCIAL_POR_CANDIDATO.
    Toma el primer token, lowercase, sin acentos."""
    import unicodedata
    primer = apellido.strip().split()[0].lower()
    return "".join(c for c in unicodedata.normalize("NFD", primer) if unicodedata.category(c) != "Mn")


def generar_presidencial(
    candidatos: list[dict],
    preguntas: list[dict],
) -> tuple[list[dict], dict, dict]:
    """Genera posturas para candidatos presidenciales (vector por candidato,
    no por lista). Aplica el mismo ruido +/-1 y omisiones deterministicas."""
    out_rows = []
    stats = {
        "total": 0, "sin_desv": 0, "sube": 0, "baja": 0,
        "clamp_sube": 0, "clamp_baja": 0, "omitidas": 0,
    }
    n_preg = len(preguntas)
    omisiones_por_pregunta = {i: 0 for i in range(1, n_preg + 1)}
    candidatos_procesados = 0

    for c in candidatos:
        key = apellido_key_presidencial(c["apellido"])
        vector = VECTOR_PRESIDENCIAL_POR_CANDIDATO.get(key)
        if vector is None:
            print(f"  [PRES] ADVERTENCIA: candidato '{c['nombre']} {c['apellido']}' "
                  f"key='{key}' no encontrado en matriz. Skip.")
            continue
        assert len(vector) == n_preg, (
            f"Vector '{key}' tiene {len(vector)}, esperaba {n_preg}"
        )

        rng = random.Random(seed_candidato(c["nombre"], c["apellido"], c["partido"], "Presidencial 2025"))
        fuente_url = FUENTES_URL_POR_CANDIDATO_PRES.get(key, "https://www.servel.cl/")
        candidatos_procesados += 1

        for i, pregunta in enumerate(preguntas, start=1):
            if debe_omitir(c["nombre"], c["apellido"], c["partido"],
                           "Presidencial 2025", i, PROB_OMISION_PRESIDENCIAL):
                stats["omitidas"] += 1
                omisiones_por_pregunta[i] += 1
                rng.random()
                continue

            base = vector[i - 1]
            r = rng.random()
            if r < PROB_IGUAL:
                valor = base
                stats["sin_desv"] += 1
            elif r < PROB_IGUAL + PROB_BAJA:
                nuevo = base - 1
                valor = clamp(nuevo)
                stats["clamp_baja" if nuevo != valor else "baja"] += 1
            else:
                nuevo = base + 1
                valor = clamp(nuevo)
                stats["clamp_sube" if nuevo != valor else "sube"] += 1

            # Justificacion presidencial: por candidato, no por lista
            delta = valor - base
            partes = [f"[INFERIDO POR CANDIDATO: {c['nombre']} {c['apellido']}]"]
            if delta == 0:
                partes.append("Postura tomada del perfil publico del candidato sin desviacion.")
            elif delta > 0:
                partes.append(
                    f"Base perfil={base}, candidato={valor} (RUIDO +1 deterministico). "
                    f"Refleja incertidumbre no verificada."
                )
            else:
                partes.append(
                    f"Base perfil={base}, candidato={valor} (RUIDO -1 deterministico). "
                    f"Refleja incertidumbre no verificada."
                )
            partes.append(
                "Data sintetica. NO es declaracion personal citada. "
                "Ver dataset/README.md."
            )
            just = " ".join(partes)

            out_rows.append({
                "candidato_apellido": c["apellido"],
                "candidato_nombre": c["nombre"],
                "candidato_partido": c["partido"],
                "pregunta_orden": i,
                "pregunta_texto_ref": pregunta["texto"][:60],
                "valor": valor,
                "justificacion": just,
                "fuente_url": fuente_url,
            })
            stats["total"] += 1

    return out_rows, stats, {
        "candidatos_procesados": candidatos_procesados,
        "omisiones_por_pregunta": omisiones_por_pregunta,
    }


def main() -> None:
    # Cargar candidatos y split por tipo_eleccion
    with CANDIDATOS_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        todos = list(csv.DictReader(f))
    diputados = [c for c in todos if c["tipos_eleccion"] == "Diputados 2025"]
    print(f"Total candidatos: {len(todos):,}")
    print(f"  Diputados 2025: {len(diputados):,}")

    # Cargar cuestionarios
    with PREGUNTAS_DIP_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        preg_dip = list(csv.DictReader(f))
    assert len(preg_dip) == 15

    # Generar posturas diputados
    rows_dip, stats_dip, meta_dip = generar_bloque(
        diputados, preg_dip,
        VECTOR_BASE_POR_LISTA, OVERRIDES_DIPUTADOS, PROB_OMISION_DIPUTADOS,
        "Diputados 2025",
    )
    escribir_csv(OUT_DIP_CSV, rows_dip)

    imprimir_stats("DIPUTADOS 2025", stats_dip, meta_dip, PROB_OMISION_DIPUTADOS, 15)

    # Generar posturas presidenciales (vector por candidato, no por lista)
    with CANDIDATOS_PRES_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        candidatos_pres = list(csv.DictReader(f))
    with PREGUNTAS_PRES_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        preg_pres = list(csv.DictReader(f))
    assert len(preg_pres) == 17
    print(f"\nPresidenciales: {len(candidatos_pres)} candidatos")

    rows_pres, stats_pres, meta_pres = generar_presidencial(candidatos_pres, preg_pres)
    escribir_csv(OUT_PRES_CSV, rows_pres)
    imprimir_stats("PRESIDENCIAL 2025", stats_pres, meta_pres, PROB_OMISION_PRESIDENCIAL, 17)

    print(f"\nOutputs:")
    print(f"  {OUT_DIP_CSV}  ({OUT_DIP_CSV.stat().st_size:,} bytes)")
    print(f"  {OUT_PRES_CSV}  ({OUT_PRES_CSV.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
