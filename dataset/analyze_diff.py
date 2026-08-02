"""Analiza diferencias entre el scrape nuevo y el dataset existente."""
import csv, io
from pathlib import Path
from collections import Counter

SCRAPE = Path(r"C:\Users\vn5ai5n\Documents\puppy_workspace\powerbi-scraper\candidatos.csv")
SERVEL = Path(r"C:\Users\vn5ai5n\Documents\puppy_workspace\tinder-decisivo\dataset\candidatos_servel_2025.csv")
PARL   = Path(r"C:\Users\vn5ai5n\Documents\puppy_workspace\tinder-decisivo\dataset\candidatos_parlamentaria_2025.csv")

new  = list(csv.DictReader(SCRAPE.open(encoding="utf-8-sig")))
old  = list(csv.DictReader(SERVEL.open(encoding="utf-8-sig")))
parl = list(csv.DictReader(PARL.open(encoding="utf-8-sig")))

out = []
out.append(f"Nuevo scrape:  {len(new)}")
out.append(f"Servel old:    {len(old)}")
out.append(f"Parlamentaria: {len(parl)}")
out.append("")

def norm(s):
    return " ".join(s.lower().split())

new_names  = {norm(r["candidato"]) for r in new}
old_names  = {norm(r["candidato"]) for r in old}
parl_names = {norm(r["nombre"] + " " + r["apellido"]) for r in parl}

out.append(f"Solo en NUEVO (no en servel viejo): {len(new_names - old_names)}")
out.append(f"Solo en SERVEL viejo (no en nuevo): {len(old_names - new_names)}")
out.append(f"En comun nuevo y servel:            {len(new_names & old_names)}")
out.append("")
out.append(f"Solo en nuevo (no en parlamentaria): {len(new_names - parl_names)}")
out.append(f"Solo en parl (no en nuevo):          {len(parl_names - new_names)}")
out.append("")

out.append("LISTAS en nuevo (Top 10):")
listas_new = Counter(r["lista"] for r in new)
for l, c in listas_new.most_common(10):
    out.append(f"  {c:4d}  {l!r}")

out.append("")
out.append("LISTAS en servel viejo (Top 10):")
listas_old = Counter(r["lista"] for r in old)
for l, c in listas_old.most_common(10):
    out.append(f"  {c:4d}  {l!r}")

out.append("")
out.append("PARTIDOS en nuevo (Top 10):")
partidos_new = Counter(r["partido_candidatura"] for r in new)
for p, c in partidos_new.most_common(10):
    out.append(f"  {c:4d}  {p!r}")

out.append("")
out.append("Sample candidatos SOLO en nuevo (10):")
for name in list(new_names - old_names)[:10]:
    out.append(f"  {name!r}")

out.append("")
out.append("Sample candidatos SOLO en servel viejo (10):")
for name in list(old_names - new_names)[:10]:
    out.append(f"  {name!r}")

result = "\n".join(out)
print(result)
Path("diff_result.txt").write_text(result, encoding="utf-8")
