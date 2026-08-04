"""Inspecciona result[0] y corrige el decoder."""
import json, csv, re
from pathlib import Path

QFILE = Path("api_dumps/011_querydata_78991.json")
OUT   = Path("candidatos.csv")

with open(QFILE, encoding="utf-8") as f:
    data = json.load(f)

# ── Inspeccionar result[0] ───────────────────────────────────────────────────
r0 = data["results"][0]["result"]["data"]
dsr0 = r0["dsr"]
ds0 = dsr0["DS"][0]
vd0 = ds0["ValueDicts"]
dm0_0 = ds0["PH"][0]["DM0"]

with open("inspect_r0.txt", "w", encoding="utf-8") as out:
    out.write(f"result[0] DM0 rows: {len(dm0_0)}\n")
    out.write(f"ValueDicts keys: {list(vd0.keys())}\n")
    for k, v in vd0.items():
        out.write(f"  {k}: list({len(v)}) first3={str(v[:3])[:200]}\n")
    out.write(f"\nPrimeros 15 rows:\n")
    for i, row in enumerate(dm0_0[:15]):
        out.write(f"  [{i}] {json.dumps(row)[:200]}\n")
    out.write(f"\nKey types en first 20 rows:\n")
    key_types = {}
    for row in dm0_0[:20]:
        for k, v in row.items():
            if k not in ("S",):
                key_types[k] = type(v).__name__
    out.write(f"  {key_types}\n")

print("Written inspect_r0.txt")

# ── Ahora decodificar correctamente ambos resultados ─────────────────────────

def decode_r0(r0_data):
    """
    result[0]: 1221 rows, 1 columna: nombre_completo
    Los rows pueden tener:
      - G0 como int (indice a D0)
      - G0 como string (valor directo)
      - C array (mismo formato que result[1])
      - Delta: si no hay G0/C, heredar el anterior
    """
    ds = r0_data["dsr"]["DS"][0]
    vd = ds["ValueDicts"]
    dm0 = ds["PH"][0]["DM0"]
    d0 = vd.get("D0", [])
    
    names = []
    prev = None  # valor actual
    
    for row in dm0:
        # Formato C-array (como result[1])
        if "C" in row and "G0" not in row:
            c = row["C"]
            if c:
                idx = c[-1]  # El ultimo (unico) valor corresponde a G0
                if isinstance(idx, int) and idx < len(d0):
                    prev = d0[idx]
                elif isinstance(idx, str):
                    prev = idx
        # Formato G0 directo
        elif "G0" in row:
            val = row["G0"]
            if isinstance(val, int) and val < len(d0):
                prev = d0[val]
            elif isinstance(val, str):
                prev = val
        # Delta: sin campo = hereda anterior
        
        if prev is not None:
            names.append(prev)
    
    return names


def get_schema_order(first_row):
    schema = []
    for entry in first_row.get("S", []):
        n = entry.get("N", "")
        dn = entry.get("DN", "")
        if dn:
            schema.append((n, dn))
    return schema


def decode_r1(r1_data):
    """
    result[1]: 500 rows, 9 columnas.
    Formato C-array: si C tiene k valores, actualiza los ultimos k del schema.
    """
    ds = r1_data["dsr"]["DS"][0]
    vd = ds["ValueDicts"]
    dm0 = ds["PH"][0]["DM0"]
    descriptor = r1_data["descriptor"]
    
    schema = get_schema_order(dm0[0])  # [(G0,D0),(G1,D1),...,(G6,D6)]
    n = len(schema)
    
    col_names = []
    for sel in descriptor.get("Select", []):
        short = sel.get("Name", "").split(".")[-1].strip()
        col_names.append(short)
    
    current = [0] * n
    rows = []
    
    for row in dm0:
        if "C" in row:
            c = row["C"]
            k = len(c)
            # Actualizar los ultimos k del schema
            for i, val in enumerate(c):
                col_idx = (n - k) + i
                if 0 <= col_idx < n:
                    current[col_idx] = val
        
        # Decodificar fila
        decoded = {}
        for i, (gkey, dkey) in enumerate(schema):
            vdict = vd.get(dkey, [])
            idx = current[i]
            val = vdict[idx] if isinstance(idx, int) and idx < len(vdict) else str(idx)
            col = col_names[i] if i < len(col_names) else gkey
            decoded[col] = val
        rows.append(decoded)
    
    return rows


# ── Decodificar ──────────────────────────────────────────────────────────────
r0_names = decode_r0(r0)
print(f"result[0]: {len(r0_names)} nombres")
print(f"  Primeros 5: {r0_names[:5]}")

r1 = data["results"][1]["result"]["data"]
r1_rows = decode_r1(r1)
print(f"\nresult[1]: {len(r1_rows)} filas")
if r1_rows:
    print(f"  Columnas: {list(r1_rows[0].keys())}")
    print(f"  Fila[0]: {r1_rows[0]}")
    print(f"  Fila[1]: {r1_rows[1]}")
    print(f"  Fila[2]: {r1_rows[2]}")

# ── Verificar ────────────────────────────────────────────────────────────────
print("\n=== VERIFICACION vs screenshot ===")
expected = [
    ("Diputado", "Saul Gonzalez Caceres", "Del Biobio", "Distrito 20"),
    ("Senador",  "Rosa Elizabeth Catrileo Arias", "De La Araucania", "Circunscripción Senatorial 11"),
    ("Senador",  "Juan Francisco Pulgar Castillo", "Del Maule", "Circunscripción Senatorial 9"),
]
for i, (etp, en, er, et) in enumerate(expected):
    row = r1_rows[i] if i < len(r1_rows) else {}
    tipo = row.get("tipo_eleccion", row.get("Min(candidaturas_202510.tipo_eleccion)", "?"))
    nombre = row.get("nvoto_nombre_completo", "?")
    region = row.get("region_nombre", "?")
    terr = row.get("territorio_nombre", "?")
    ok_tipo = etp.lower() in tipo.lower() if tipo else False
    ok_nombre = en.split()[0].lower() in nombre.lower() if nombre else False
    print(f"  [{i}] tipo='{tipo}' OK={ok_tipo}")
    print(f"       nombre='{nombre[:50]}' OK={ok_nombre}")
    print(f"       region='{region}' terr='{terr}'")

# ── Guardar CSV ──────────────────────────────────────────────────────────────
def split_num_nombre(val: str):
    m = re.match(r"^(\d+)\.\s*(.+)$", val.strip())
    return (m.group(1), m.group(2).strip()) if m else ("", val.strip())

if r1_rows:
    clean = []
    for row in r1_rows:
        nb = row.get("nvoto_nombre_completo", "")
        num, nombre = split_num_nombre(nb)
        clean.append({
            "eleccion": row.get("tipo_eleccion", ""),
            "numero": num,
            "candidato": nombre,
            "region": row.get("region_nombre", "").replace("\xa0", " ").strip(),
            "territorio": row.get("territorio_nombre", "").replace("\xa0", " ").strip(),
            "lista": row.get("Letra - Pacto", ""),
            "partido_candidatura": row.get("partido - sin prefijo", ""),
            "url_foto": row.get("url_logo", ""),
        })
    
    with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(clean[0].keys()), extrasaction="ignore")
        w.writeheader()
        w.writerows(clean)
    print(f"\nCSV guardado: {OUT} ({len(clean)} filas)")
    print("Primeras 5:")
    for r in clean[:5]:
        print(f"  {r}")
