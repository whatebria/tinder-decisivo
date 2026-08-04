"""
Debug v2: imprime los valores C reales de las primeras 30 filas
para entender la codificación exacta.
"""
import json
from pathlib import Path

EXISTING = Path("api_dumps/011_querydata_78991.json")

with open(EXISTING, encoding="utf-8") as f:
    data = json.load(f)

result1 = data["results"][1]
rd = result1["result"]["data"]
dsr = rd["dsr"]
ds = dsr["DS"][0]
vd = ds["ValueDicts"]
ph = ds["PH"][0]
dm0 = ph["DM0"]

# Dict lookup helpers
D0 = vd.get("D0", [])  # region
D1 = vd.get("D1", [])  # territorio
D2 = vd.get("D2", [])  # tipo_eleccion
D3 = vd.get("D3", [])  # url_logo
D4 = vd.get("D4", [])  # partido
D5 = vd.get("D5", [])  # lista/pacto
D6 = vd.get("D6", [])  # nombre

def dv(d, i):
    """Dict value with OOB handling."""
    if isinstance(i, int) and 0 <= i < len(d):
        return d[i]
    return f"OOB({i})"

def short(s, n=30):
    s = str(s)
    return s[:n] + "..." if len(s) > n else s

print("Raw C values para primeras 30 filas:")
print(f"{'i':>3} {'k':>2} {'R':>5} | C array | decoded")
print("-" * 100)

for i, row in enumerate(dm0[:50]):
    c = row.get("C", [])
    r = row.get("R")
    k = len(c)
    
    # Decoded values por posición
    parts = []
    for j, v in enumerate(c):
        col_names = ["reg", "terr", "tipo", "logo", "part", "lista", "nomb", "M0", "M1"]
        # ¿Qué diccionario corresponde a posición j?
        dicts_by_pos = [D0, D1, D2, D3, D4, D5, D6, [], []]
        if k >= 9:
            # Full update, j maps directly to position j
            pos = j
        elif k == 7:
            # Primer 7 (FIRST-K)
            pos = j
        else:
            # Last k
            start = 9 - k
            pos = start + j
        
        dicts_by_pos = [D0, D1, D2, D3, D4, D5, D6, [], []]
        the_dict = dicts_by_pos[pos] if pos < len(dicts_by_pos) else []
        decoded = dv(the_dict, v)
        
        col = col_names[pos] if pos < len(col_names) else f"pos{pos}"
        if "logo" in col or "M" in col:
            parts.append(f"{col}={v}")
        else:
            parts.append(f"{col}={short(decoded, 20)!r}")
    
    r_str = str(r) if r else "-"
    print(f"{i:>3} {k:>2} {r_str:>5} | {c} | {', '.join(parts)}")
