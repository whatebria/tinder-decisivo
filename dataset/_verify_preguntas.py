"""Verifica las 5 CSVs de preguntas: counts, ejes cubiertos, duplicados, neutralidad."""
from __future__ import annotations
import csv
from collections import Counter
from pathlib import Path

DATASET = Path(__file__).parent
ARCHIVOS = [
    ("preguntas_base.csv", "Preguntas generales", 17),
    ("preguntas_presidencial_2025.csv", "Presidencial 2025", 17),
    ("preguntas_diputados_2025.csv", "Diputados 2025", 15),
    ("preguntas_senadores_2025.csv", "Senadores 2025", 15),
]

# Palabras "cargadas" que sesgan hacia intervencionismo/estatismo o hacia mercado
PALABRAS_CARGADAS = {
    "garantizar", "erradicar", "combatir", "proteger", "asegurar",
    "salvaguardar", "criminales", "delincuentes", "invasion", "amenaza",
    "corrupcion", "corrupto", "elite", "casta",
}

todas_preguntas = []
ejes_esperados = {
    "ECONOMIA", "SOCIEDAD", "AMBIENTE", "SEGURIDAD", "DDHH",
    "INTERNACIONAL", "INSTITUCIONAL", "OTRO",
    "PUEBLOS_ORIGINARIOS", "DISCAPACIDAD",
}

print(f"{'Archivo':<40} {'Filas':>6} {'Tipo':<25} {'OK':>4}")
print("-" * 80)
for archivo, tipo_esperado, count_esperado in ARCHIVOS:
    path = DATASET / archivo
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    ok = "OK" if len(rows) == count_esperado and all(r["tipo_eleccion"] == tipo_esperado for r in rows) else "FAIL"
    print(f"{archivo:<40} {len(rows):>6} {tipo_esperado:<25} {ok:>4}")
    todas_preguntas.extend(rows)

print(f"\n=== TOTALES ===")
print(f"Preguntas totales: {len(todas_preguntas)} (esperado 64)")

# Distribucion por eje (por archivo)
print(f"\n=== EJES POR ARCHIVO ===")
print(f"{'Eje':<15}", end="")
for archivo, _, _ in ARCHIVOS:
    tag = archivo.replace("preguntas_", "").replace(".csv", "")[:12]
    print(f"{tag:>14}", end="")
print(f"{'TOTAL':>8}")
print("-" * 100)

ejes_totales = Counter()
por_archivo_por_eje = {}
for archivo, _, _ in ARCHIVOS:
    with (DATASET / archivo).open("r", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    por_archivo_por_eje[archivo] = Counter(r["eje_tematico"] for r in rows)

for eje in sorted(ejes_esperados):
    print(f"{eje:<15}", end="")
    total_eje = 0
    for archivo, _, _ in ARCHIVOS:
        n = por_archivo_por_eje[archivo].get(eje, 0)
        total_eje += n
        print(f"{n:>14}", end="")
    ejes_totales[eje] = total_eje
    print(f"{total_eje:>8}")

# Duplicados de texto entre archivos
print(f"\n=== DUPLICADOS DE TEXTO ===")
textos = Counter(p["texto"] for p in todas_preguntas)
dupes = {t: n for t, n in textos.items() if n > 1}
if not dupes:
    print("Ninguno.")
else:
    for t, n in dupes.items():
        print(f"  x{n}  {t[:80]}")

# Chequeo de palabras cargadas
print(f"\n=== PALABRAS POTENCIALMENTE CARGADAS ===")
issues = []
for p in todas_preguntas:
    txt_lower = p["texto"].lower()
    palabras_encontradas = [w for w in PALABRAS_CARGADAS if w in txt_lower]
    if palabras_encontradas:
        issues.append((p["tipo_eleccion"], p["orden"], p["texto"][:80], palabras_encontradas))

if not issues:
    print("Ninguna. Framing limpio.")
else:
    for tipo, orden, texto, palabras in issues:
        print(f"  [{tipo} #{orden}] {palabras}")
        print(f"     -> {texto}")

# Chequeo de ejes validos
print(f"\n=== EJES VALIDOS ===")
ejes_usados = set(p["eje_tematico"] for p in todas_preguntas)
invalidos = ejes_usados - ejes_esperados
if invalidos:
    print(f"  FAIL: {invalidos}")
else:
    print(f"  OK: todos en {sorted(ejes_esperados)}")
