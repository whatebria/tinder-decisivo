"""Inspecciona el querydata de 78KB para entender el formato DSR."""
import json

with open("api_dumps/011_querydata_78991.json", encoding="utf-8") as f:
    d = json.load(f)

out = []
def dump(obj, prefix="", depth=0):
    if depth > 6:
        return
    if isinstance(obj, dict):
        for k, v in list(obj.items())[:20]:
            if isinstance(v, (dict, list)):
                out.append(f"{prefix}{k}: {type(v).__name__}({len(v)})")
                dump(v, prefix + "  ", depth + 1)
            else:
                out.append(f"{prefix}{k}: {repr(v)[:100]}")
    elif isinstance(obj, list) and obj:
        out.append(f"{prefix}[0]: ({len(obj)} items total)")
        dump(obj[0], prefix + "  ", depth + 1)
        if len(obj) > 1:
            out.append(f"{prefix}[1]: ...")
            dump(obj[1], prefix + "  ", depth + 1)

dump(d)

with open("structure_011.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print("Written to structure_011.txt")

# Tambien: intentar extraer datos de la estructura real
results = d.get("results", [])
for ri, result in enumerate(results):
    data = result.get("result", {}).get("data", {})
    with open(f"result_{ri}_data_keys.txt", "w", encoding="utf-8") as f:
        f.write(f"result[{ri}] data keys: {list(data.keys())}\n\n")
        
        # Inspeccionar dsr si existe
        dsr = data.get("dsr", {})
        if dsr:
            f.write(f"dsr keys: {list(dsr.keys())}\n")
            ds = dsr.get("DS", [])
            f.write(f"DS count: {len(ds)}\n")
            for di, ds_item in enumerate(ds):
                f.write(f"\nDS[{di}] keys: {list(ds_item.keys())}\n")
                ph = ds_item.get("PH", [])
                f.write(f"  PH count: {len(ph)}\n")
                for pi, ph_item in enumerate(ph):
                    f.write(f"  PH[{pi}] keys: {list(ph_item.keys())}\n")
                    # Intentar ver DM0
                    for key in ph_item:
                        val = ph_item[key]
                        if isinstance(val, dict):
                            f.write(f"    {key} keys: {list(val.keys())}\n")
                            # Buscar datos numericos/strings que parezcan candidatos
                            for k2, v2 in val.items():
                                if isinstance(v2, list) and len(v2) > 10:
                                    f.write(f"      {k2}: list({len(v2)}) first5={str(v2[:5])[:200]}\n")
                                elif isinstance(v2, dict):
                                    f.write(f"      {k2}: dict({len(v2)}) keys={list(v2.keys())[:10]}\n")
                        elif isinstance(val, list):
                            f.write(f"    {key}: list({len(val)}) first3={str(val[:3])[:200]}\n")
                            
        # Tambien ver descriptor
        descriptor = data.get("descriptor", {})
        if descriptor:
            f.write(f"\ndescriptor keys: {list(descriptor.keys())}\n")
            
        # Ver timestamp/other keys
        for k, v in data.items():
            if k not in ("dsr", "descriptor"):
                f.write(f"\n{k}: {repr(v)[:200]}\n")
    
    print(f"Written result_{ri}_data_keys.txt")
