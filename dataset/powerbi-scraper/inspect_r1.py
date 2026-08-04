"""Inspecciona result[1] del querydata en detalle."""
import json

with open("api_dumps/011_querydata_78991.json", encoding="utf-8") as f:
    d = json.load(f)

# result[1] data
r1 = d["results"][1]["result"]["data"]
dsr = r1["dsr"]
ds = dsr["DS"][0]
ph = ds["PH"][0]
dm0 = ph["DM0"]
vdicts = ds["ValueDicts"]
descriptor = r1["descriptor"]

with open("inspect_r1.txt", "w", encoding="utf-8") as out:
    out.write(f"DM0 total rows: {len(dm0)}\n\n")
    
    out.write("=== DESCRIPTOR SELECT ===\n")
    for i, sel in enumerate(descriptor.get("Select", [])):
        out.write(f"  [{i}] {json.dumps(sel)}\n")
    
    out.write("\n=== VALUE DICTS ===\n")
    for k, v in vdicts.items():
        out.write(f"  {k} ({len(v)} entries):\n")
        for i, val in enumerate(v):
            out.write(f"    [{i}] {repr(val)[:120]}\n")
    
    out.write("\n=== DM0 FIRST 10 ROWS ===\n")
    for i, row in enumerate(dm0[:10]):
        out.write(f"  [{i}] {json.dumps(row)[:300]}\n")
    
    # Analizar cuales G-keys aparecen en cuantas filas
    key_counts = {}
    for row in dm0:
        for k in row.keys():
            key_counts[k] = key_counts.get(k, 0) + 1
    out.write(f"\n=== KEY FREQUENCY (total {len(dm0)} rows) ===\n")
    for k, v in sorted(key_counts.items()):
        out.write(f"  {k}: {v} ({v/len(dm0)*100:.1f}%)\n")

print("Written inspect_r1.txt")
