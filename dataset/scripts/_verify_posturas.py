"""Verificacion post-generacion de posturas_{diputados,senadores}_2025.csv.

Checks aplicados a cada archivo:
1. Justificaciones >= 20 chars
2. fuente_url HTTP(S)
3. pregunta_orden en 1-15
4. Distribucion de omisiones por candidato
5. Diferenciacion intra-partido
6. Distribucion de valores 1-5
"""
from __future__ import annotations
import csv
import random
from collections import Counter, defaultdict
from pathlib import Path

DATASET = Path(__file__).parent
CANDIDATOS = DATASET / "candidatos_parlamentaria_2025.csv"
CANDIDATOS_PRES = DATASET / "candidatos_presidencial_2025.csv"

BLOQUES = [
    ("Diputados 2025", DATASET / "posturas_diputados_2025.csv", CANDIDATOS, 15),
    ("Senadores 2025", DATASET / "posturas_senadores_2025.csv", CANDIDATOS, 15),
    ("Presidencial 2025", DATASET / "posturas_presidencial_2025.csv", CANDIDATOS_PRES, 17),
]

def cargar_candidatos_de(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

for tipo_label, path_posturas, path_candidatos, n_preg in BLOQUES:
    print(f"\n{'#' * 70}")
    print(f"# {tipo_label} - {path_posturas.name}")
    print(f"{'#' * 70}")

    todos_cand = cargar_candidatos_de(path_candidatos)
    candidatos = [c for c in todos_cand if c["tipos_eleccion"] == tipo_label]
    with path_posturas.open("r", encoding="utf-8-sig", newline="") as f:
        posturas = list(csv.DictReader(f))

    print(f"Candidatos del tipo: {len(candidatos):,}")
    print(f"Posturas totales:    {len(posturas):,}")
    print(f"Ratio posturas/cand: {len(posturas)/len(candidatos):.2f} (max {n_preg})")

    print(f"\nCHECK 1 - Justificaciones >= 20 chars: ", end="")
    cortas = [p for p in posturas if len(p["justificacion"]) < 20]
    print("OK" if not cortas else f"FAIL - {len(cortas)}")

    print(f"CHECK 2 - fuente_url HTTP(S): ", end="")
    malas = [p for p in posturas if not p["fuente_url"].startswith(("http://", "https://"))]
    print("OK" if not malas else f"FAIL - {len(malas)}")

    print(f"CHECK 3 - pregunta_orden en 1-{n_preg}: ", end="")
    fuera = [p for p in posturas if not (1 <= int(p["pregunta_orden"]) <= n_preg)]
    print("OK" if not fuera else f"FAIL - {len(fuera)}")

    # Check 4: distribucion de omisiones
    posturas_por_apellido = defaultdict(set)
    for p in posturas:
        posturas_por_apellido[p["candidato_apellido"]].add(int(p["pregunta_orden"]))

    apellido_a_candidatos = defaultdict(list)
    for c in candidatos:
        apellido_a_candidatos[c["apellido"]].append((c["nombre"], c["partido"], c["lista_electoral"]))
    apellidos_unicos = {a for a, cs in apellido_a_candidatos.items() if len(cs) == 1}

    respuestas_por_cand = Counter()
    for a in apellidos_unicos:
        n = len(posturas_por_apellido[a])
        respuestas_por_cand[n] += 1

    print(f"\nCHECK 4 - Distribucion de omisiones (candidatos con apellido unico):")
    if respuestas_por_cand:
        max_bar = max(respuestas_por_cand.values())
        for n in sorted(respuestas_por_cand.keys()):
            bar = "#" * min(int(respuestas_por_cand[n] * 40 / max_bar), 40)
            print(f"  {n:>2} preguntas: {respuestas_por_cand[n]:>4}  {bar}")
        total_u = len(apellidos_unicos)
        completos = respuestas_por_cand.get(n_preg, 0)
        print(f"  Con las {n_preg} completas: {completos} ({completos*100/total_u:.1f}%)")
        print(f"  Con al menos 1 omision: {total_u - completos} ({(total_u - completos)*100/total_u:.1f}%)")

    # Check 5: diferenciacion intra-partido
    print(f"\nCHECK 5 - DIFERENCIACION intra-partido:")
    partido_a_apellidos = defaultdict(list)
    for c in candidatos:
        if c["apellido"] in apellidos_unicos:
            partido_a_apellidos[c["partido"]].append((c["nombre"], c["apellido"]))

    posturas_por_cand = defaultdict(dict)
    for p in posturas:
        posturas_por_cand[p["candidato_apellido"]][int(p["pregunta_orden"])] = int(p["valor"])

    top = sorted(partido_a_apellidos.items(), key=lambda x: -len(x[1]))[:3]
    rng = random.Random(42)
    for partido, cands in top:
        if len(cands) < 2:
            continue
        print(f"\n  {partido} ({len(cands)} apellidos unicos)")
        n_samples = min(2, len(cands) // 2)
        for _ in range(n_samples):
            a, b = rng.sample(cands, 2)
            pa = posturas_por_cand[a[1]]
            pb = posturas_por_cand[b[1]]
            comunes = set(pa.keys()) & set(pb.keys())
            solo_a = set(pa.keys()) - set(pb.keys())
            solo_b = set(pb.keys()) - set(pa.keys())
            diffs = sum(1 for i in comunes if pa[i] != pb[i])
            print(f"    {a[1][:22]:<22} vs {b[1][:22]:<22}")
            print(f"      Comunes: {len(comunes)}/{n_preg}, diffs: {diffs}, solo_A: {len(solo_a)}, solo_B: {len(solo_b)}")

    # Check 6: distribucion valores
    print(f"\nCHECK 6 - Distribucion valores 1-5:")
    vals = Counter(int(p["valor"]) for p in posturas)
    max_v = max(vals.values())
    for v in [1, 2, 3, 4, 5]:
        n = vals[v]
        bar = "#" * int(n * 30 / max_v)
        print(f"  {v}: {n:>5,} ({n*100/len(posturas):>4.1f}%)  {bar}")
