"""Procesa todos los dumps existentes con el decoder actual."""
import json, csv, re
from pathlib import Path

DUMP_DIRS = [Path("api_dumps"), Path("api_dumps_v8")]
OUT = Path("candidatos_partial.csv")


def decode_dsr_table(result_data: dict) -> list[dict]:
    dsr = result_data.get("dsr", {})
    descriptor = result_data.get("descriptor", {})
    col_names = [sel.get("Name","").split(".")[-1].strip()
                 for sel in descriptor.get("Select", [])]
    rows_out = []
    for ds in dsr.get("DS", []):
        vd = ds.get("ValueDicts", {})
        for ph in ds.get("PH", []):
            dm0 = ph.get("DM0", [])
            if not dm0:
                continue
            schema = []
            for row in dm0:
                if "S" in row:
                    for e in row["S"]:
                        if e.get("DN"):
                            schema.append((e["N"], e["DN"]))
                    break
            n = len(schema)
            if n == 0:
                continue
            state = [0] * n
            for row in dm0:
                c = row.get("C")
                if c is None:
                    continue
                k = len(c)
                if k == 0:
                    continue
                if k >= n:
                    for i, v in enumerate(c[:n]):
                        state[i] = v
                elif k == 7 and n >= 9:
                    for i, v in enumerate(c):
                        state[i] = v
                else:
                    start = n - k
                    for i, v in enumerate(c):
                        state[start + i] = v
                decoded = {}
                for idx, (gk, dk) in enumerate(schema):
                    vdict = vd.get(dk, [])
                    v = state[idx]
                    decoded[gk] = vdict[v] if isinstance(v, int) and v < len(vdict) else ""
                named = {(col_names[i] if i < len(col_names) else gk): decoded[gk]
                         for i, (gk, _) in enumerate(schema)}
                if any(named.values()):
                    rows_out.append(named)
    return rows_out


def clean_row(row: dict):
    raw = row.get("nvoto_nombre_completo", "")
    m = re.match(r"^(\d+)\.\s+(.+)$", raw.strip())
    if not m:
        return None
    return {
        "eleccion": row.get("tipo_eleccion", "").strip(),
        "numero": m.group(1).strip(),
        "candidato": m.group(2).strip(),
        "region": row.get("region_nombre", "").replace("\xa0", " ").strip(),
        "territorio": row.get("territorio_nombre", "").replace("\xa0", " ").strip(),
        "lista": row.get("Letra - Pacto", "").strip(),
        "partido_candidatura": row.get("partido - sin prefijo", "").strip(),
    }


all_c = []
seen = set()
files_processed = 0

for d in DUMP_DIRS:
    if not d.exists():
        continue
    for f in sorted(d.glob("*.json")):
        try:
            with open(f, encoding="utf-8") as fp:
                data = json.load(fp)
            if "results" not in data:
                continue
            for res in data["results"]:
                rd = res.get("result", {}).get("data", {})
                rows = decode_dsr_table(rd)
                for row in rows:
                    c = clean_row(row)
                    if not c:
                        continue
                    key = f"{c['eleccion']}|{c['numero']}|{c['candidato']}|{c['territorio']}"
                    if key not in seen:
                        seen.add(key)
                        all_c.append(c)
            files_processed += 1
        except Exception as e:
            with open("process_errors.txt", "a", encoding="utf-8") as ef:
                ef.write(f"{f}: {e}\n")

all_c.sort(key=lambda x: (x["eleccion"], x["region"], x["territorio"], x["candidato"]))

with open("process_result.txt", "w", encoding="utf-8") as f:
    f.write(f"Archivos procesados: {files_processed}\n")
    f.write(f"Candidatos unicos: {len(all_c)}\n\n")
    f.write("Primeros 10:\n")
    for r in all_c[:10]:
        f.write(f"  {r}\n")
    f.write("\nDistribucion por eleccion:\n")
    from collections import Counter
    for k, v in Counter(r["eleccion"] for r in all_c).items():
        f.write(f"  {k}: {v}\n")

if all_c:
    fieldnames = ["eleccion","numero","candidato","region","territorio","lista","partido_candidatura"]
    with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        w.writerows(all_c)

print(f"Done: {len(all_c)} candidatos desde {files_processed} archivos")
