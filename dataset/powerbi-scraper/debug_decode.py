"""
Debug del decode de result[1] en 011_querydata_78991.json.
Vamos a trazar exactamente qué está pasando con cada fila del DM0.
"""
import json
from pathlib import Path

EXISTING = Path("api_dumps/011_querydata_78991.json")

with open(EXISTING, encoding="utf-8") as f:
    data = json.load(f)

# result[1] es el que tiene los 9 columnas
result1 = data["results"][1]
rd = result1["result"]["data"]
dsr = rd["dsr"]
descriptor = rd["descriptor"]

# Columnas del descriptor
col_names = [sel.get("Name","").split(".")[-1].strip()
             for sel in descriptor.get("Select", [])]
print(f"Columnas ({len(col_names)}): {col_names}")

# DS[0]
ds = dsr["DS"][0]
vd = ds["ValueDicts"]
ph = ds["PH"][0]
dm0 = ph["DM0"]

print(f"\nDM0: {len(dm0)} rows")
print(f"ValueDicts keys: {list(vd.keys())}")
print(f"D6 size: {len(vd.get('D6', []))}")

# Tamaño de cada dict
for k, v in sorted(vd.items()):
    print(f"  {k}: {len(v)} entries", end="")
    if len(v) <= 5:
        print(f" = {v}")
    else:
        print(f" [0]={v[0]!r} ... [{len(v)-1}]={v[-1]!r}")

# Schema
schema = []
for row in dm0:
    if "S" in row:
        for e in row["S"]:
            if e.get("DN"):
                schema.append((e["N"], e["DN"]))
        break

print(f"\nSchema ({len(schema)}): {schema}")
n = len(schema)

# Distribución de k y R
from collections import Counter
k_dist = Counter()
r_values = []
for row in dm0:
    c = row.get("C")
    r = row.get("R")
    k = len(c) if c is not None else -1
    k_dist[k] += 1
    if r is not None:
        r_values.append(r)

print(f"\nDistribución de k: {dict(sorted(k_dist.items()))}")
print(f"Valores de R: {len(r_values)} rows tienen R, rango [{min(r_values) if r_values else 0}, {max(r_values) if r_values else 0}]")

# Trazar primeras 30 filas
print(f"\n{'='*80}")
print("TRACE: primeras 30 filas")
print(f"{'='*80}")

state = [0] * n

def decode_state(state, vd, schema, col_names):
    row = {}
    for idx, (gk, dk) in enumerate(schema):
        vdict = vd.get(dk, [])
        v = state[idx]
        if isinstance(v, int) and 0 <= v < len(vdict):
            row[col_names[idx] if idx < len(col_names) else gk] = vdict[v]
        else:
            row[col_names[idx] if idx < len(col_names) else gk] = f"OOB({v},len={len(vdict)})"
    return row

for i, row in enumerate(dm0[:30]):
    c = row.get("C")
    r = row.get("R")
    s = "S" in row

    if c is not None:
        k = len(c)
        if k >= n:
            for j, v in enumerate(c[:n]):
                state[j] = v
        elif k == 7 and n >= 9:
            for j, v in enumerate(c):
                state[j] = v
        else:
            start = n - k
            for j, v in enumerate(c):
                state[start + j] = v

    dec = decode_state(state, vd, schema, col_names) if c is not None else {}
    g6_key = col_names[6] if 6 < len(col_names) else "G6"
    nombre = dec.get(g6_key, "N/A")
    eleccion = dec.get(col_names[2] if 2 < len(col_names) else "G2", "N/A")

    print(f"[{i:3d}] k={len(c) if c else '-':2} R={r!r:10} | {eleccion:10} | {nombre[:50]}")

# Contar cuantas filas son OOB en G6
print(f"\n{'='*80}")
print("Analisis OOB en G6")

state = [0] * n
d6 = vd.get("D6", [])
d6_len = len(d6)

ok = 0
oob = 0
no_c = 0
k_oob = Counter()

for row in dm0:
    c = row.get("C")
    if c is None:
        no_c += 1
        continue
    k = len(c)
    if k >= n:
        for j, v in enumerate(c[:n]):
            state[j] = v
    elif k == 7 and n >= 9:
        for j, v in enumerate(c):
            state[j] = v
    else:
        start = n - k
        for j, v in enumerate(c):
            state[start + j] = v

    g6_idx = state[6]
    if isinstance(g6_idx, int) and 0 <= g6_idx < d6_len:
        ok += 1
    else:
        oob += 1
        k_oob[k] += 1

print(f"G6 OK: {ok}")
print(f"G6 OOB: {oob}")
print(f"no C: {no_c}")
print(f"OOB por k: {dict(sorted(k_oob.items()))}")

# Verifiquemos si los valores OOB en G6 coinciden con R
print(f"\n{'='*80}")
print("¿Los valores OOB en state[6] son R del mismo row?")
print(f"{'='*80}")

state = [0] * n
mismatches = 0
matches = 0

for i, row in enumerate(dm0[:50]):
    c = row.get("C")
    r = row.get("R")
    if c is None:
        continue
    k = len(c)
    if k >= n:
        for j, v in enumerate(c[:n]):
            state[j] = v
    elif k == 7 and n >= 9:
        for j, v in enumerate(c):
            state[j] = v
    else:
        start = n - k
        for j, v in enumerate(c):
            state[start + j] = v

    g6 = state[6]
    is_oob = not (isinstance(g6, int) and 0 <= g6 < d6_len)

    if is_oob and r is not None:
        if g6 == r:
            matches += 1
        else:
            mismatches += 1
            print(f"  [{i}] k={k} state[6]={g6} R={r} -> {'MATCH' if g6==r else 'MISMATCH'}")

print(f"OOB rows where state[6]==R: {matches}")
print(f"OOB rows where state[6]!=R: {mismatches}")
