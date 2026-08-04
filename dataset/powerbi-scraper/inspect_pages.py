"""
Inspecciona la estructura completa de page_02.json vs el original.
Verificar si D6 cambia entre páginas y qué son exactamente los valores R.
"""
import json
from pathlib import Path

def inspect_result(data, label):
    for ri, result in enumerate(data.get("results", [])):
        rd = result.get("result", {}).get("data", {})
        dsr = rd.get("dsr", {})
        descriptor = rd.get("descriptor", {})
        
        col_names = [sel.get("Name","").split(".")[-1].strip()
                     for sel in descriptor.get("Select", [])]
        
        for di, ds in enumerate(dsr.get("DS", [])):
            vd = ds.get("ValueDicts", {})
            for ph in ds.get("PH", []):
                dm0 = ph.get("DM0", [])
                D6 = vd.get("D6", [])
                
                print(f"\n{label} result[{ri}] DS[{di}]:")
                print(f"  DM0 rows: {len(dm0)}")
                print(f"  D6 size: {len(D6)}")
                if D6:
                    print(f"  D6[0]: {D6[0]}")
                    print(f"  D6[-1]: {D6[-1]}")
                
                # Contar filas con R
                rows_r = [r for row in dm0 if (r := row.get("R")) is not None]
                rows_no_r = [row for row in dm0 if row.get("R") is None]
                print(f"  Rows con R: {len(rows_r)} | Sin R: {len(rows_no_r)}")
                
                if rows_r:
                    print(f"  R range: {min(rows_r)} - {max(rows_r)}")
                
                # Distribución de k
                from collections import Counter
                k_dist = Counter(len(row.get("C", [])) if row.get("C") is not None else -1
                                  for row in dm0)
                print(f"  k dist: {dict(sorted(k_dist.items()))}")
                
                # Primeras 10 filas con datos
                count = 0
                for i, row in enumerate(dm0):
                    c = row.get("C")
                    r = row.get("R")
                    if c is not None:
                        k = len(c)
                        if count < 10:
                            print(f"  [{i:3d}] k={k} R={r} C={c}")
                            count += 1

# Original (page 1)
print("="*70)
p1_file = Path("api_dumps/011_querydata_78991.json")
if p1_file.exists():
    with open(p1_file, encoding="utf-8") as f:
        inspect_result(json.load(f), "PAGE1")

# Page 2
print("\n" + "="*70)
p2_file = Path("api_dumps/page_02.json")
if p2_file.exists():
    with open(p2_file, encoding="utf-8") as f:
        inspect_result(json.load(f), "PAGE2")
else:
    print("page_02.json not found")

# Page 3 (if exists)
print("\n" + "="*70)
p3_file = Path("api_dumps/page_03.json")
if p3_file.exists():
    with open(p3_file, encoding="utf-8") as f:
        inspect_result(json.load(f), "PAGE3")
else:
    print("page_03.json not found")
