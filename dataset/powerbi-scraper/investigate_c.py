"""
Investigacion empirica del formato C-array de PowerBI DSR.
Objetivo: decodificar los 500 rows de result[1] correctamente.
"""
import json
from pathlib import Path

with open("api_dumps/011_querydata_78991.json", encoding="utf-8") as f:
    d = json.load(f)

r1 = d["results"][1]["result"]["data"]
ds = r1["dsr"]["DS"][0]
vd = ds["ValueDicts"]
dm0 = ds["PH"][0]["DM0"]

# ── 1. Analizar los valores R ────────────────────────────────────────────────
r_vals = [row.get("R", 1) for row in dm0]
print(f"Total DM0 rows: {len(dm0)}")
print(f"Sum of R values: {sum(r_vals)}")
print(f"Max R: {max(r_vals)}  Min R (excluding 1): {min(v for v in r_vals if v > 1)}")
print(f"Rows without R (R defaults to 1): {sum(1 for v in r_vals if v == 1)}")

# ── 2. Ver las primeras 20 filas completas ───────────────────────────────────
print("\n=== PRIMERAS 20 ROWS DM0 COMPLETAS ===")
for i, row in enumerate(dm0[:20]):
    c = row.get("C", [])
    r = row.get("R", "NO-R")
    has_s = "S" in row
    print(f"  [{i:03d}] C={c}  R={r}  S={has_s}")

# ── 3. Distribucion de longitudes de C ──────────────────────────────────────
from collections import Counter
k_dist = Counter(len(row.get("C", [])) for row in dm0)
print(f"\n=== DISTRIBUCION DE k=len(C) ===")
for k, cnt in sorted(k_dist.items()):
    print(f"  k={k}: {cnt} rows")

# ── 4. Candidates conocidos del screenshot ───────────────────────────────────
# Mapeamos D-dict indices para cada candidato conocido
KNOWN = [
    {
        "desc": "Saul Gonzalez",
        "G0": 0,  # Del Biobio
        "G1": 0,  # Distrito 20
        "G2": 0,  # Diputado
        "G3": 0,  # Saul logo
        "G4": 0,  # Candidatura Independiente
        "G5": 0,  # ' Candidatura Independiente'
        "G6": 0,  # 112. Saul Gonzalez
    },
    {
        "desc": "Rosa Catrileo",
        "G0": 1,  # De La Araucania
        "G1": 1,  # CS11
        "G2": 1,  # Senador
        "G3": 1,  # Rosa logo
        "G4": 0,  # Candidatura Independiente
        "G5": 0,  # ' Candidatura Independiente'
        "G6": 1,  # 35. Rosa
    },
    {
        "desc": "Juan Pulgar",
        "G0": 2,  # Del Maule
        "G1": 2,  # CS9
        "G2": 1,  # Senador (same as Rosa)
        "G3": 2,  # Pulgar logo
        "G4": 0,  # Candidatura Independiente
        "G5": 0,  # ' Candidatura Independiente'
        "G6": 2,  # 40. Juan Pulgar
    },
]

# Calcular cambios entre consecutivos
print("\n=== CAMBIOS ENTRE CANDIDATOS CONOCIDOS ===")
for i in range(1, len(KNOWN)):
    prev = KNOWN[i-1]
    curr = KNOWN[i]
    changes = {}
    for key in ["G0","G1","G2","G3","G4","G5","G6"]:
        if prev[key] != curr[key]:
            changes[key] = f"{prev[key]}->{curr[key]}"
    same = [k for k in ["G0","G1","G2","G3","G4","G5","G6"] if prev[k] == curr[k]]
    print(f"  {prev['desc']} -> {curr['desc']}:")
    print(f"    Changes ({len(changes)}): {changes}")
    print(f"    Same ({len(same)}): {same}")

# ── 5. Probar FIRST-K vs LAST-K para los primeros 3 DM0 rows ─────────────────
print("\n=== TEST FIRST-K vs LAST-K ===")
G_ORDER = ["G0", "G1", "G2", "G3", "G4", "G5", "G6"]
D_ORDER = ["D0", "D1", "D2", "D3", "D4", "D5", "D6"]
n = len(G_ORDER)

# Inicializar estado
state_first = [0] * n
state_last  = [0] * n

# Probar primeras 5 rows
for i, row in enumerate(dm0[:6]):
    c = row.get("C", [])
    k = len(c)
    
    # First-K: update G0..G(k-1)
    s_f = list(state_first)
    for j, val in enumerate(c):
        if j < n:
            s_f[j] = val
    
    # Last-K: update G(n-k)..G(n-1)
    s_l = list(state_last)
    for j, val in enumerate(c):
        col_idx = (n - k) + j
        if 0 <= col_idx < n:
            s_l[col_idx] = val
    
    # Decodificar ambos
    def decode_state(state, vd, d_order):
        vals = {}
        for idx, (gk, dk) in enumerate(zip(G_ORDER, d_order)):
            vdict = vd.get(dk, [])
            v = state[idx]
            vals[gk] = vdict[v] if isinstance(v, int) and v < len(vdict) else f"OOB({v}/{len(vdict)})"
        return vals
    
    f_vals = decode_state(s_f, vd, D_ORDER)
    l_vals = decode_state(s_l, vd, D_ORDER)
    
    print(f"\n  DM0[{i}] C={c}")
    print(f"    FIRST-K: region={f_vals['G0']} | terr={f_vals['G1']} | tipo={f_vals['G2']} | partido={f_vals['G4']} | nombre={f_vals['G6'][:40]}")
    print(f"    LAST-K:  region={l_vals['G0']} | terr={l_vals['G1']} | tipo={l_vals['G2']} | partido={l_vals['G4']} | nombre={l_vals['G6'][:40]}")
    
    state_first = s_f
    state_last = s_l

print("\nDone.")
