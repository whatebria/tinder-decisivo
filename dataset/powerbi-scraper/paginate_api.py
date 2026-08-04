"""
SERVEL 2025 - Paginacion via RestartToken + Python requests.
PowerBI public reports usan x-powerbi-resourcekey para auth publica.
DS[0]['RT'] = Restart Token para la siguiente pagina.
"""
import json, csv, re, time
from pathlib import Path

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

WABI = "https://wabi-south-central-us-api.analysis.windows.net"
RESOURCE_KEY = "4c777313-e189-4fa8-b894-64c7403d35e4"
MODEL_ID = 11533800
DATASET_ID = "6f77e8d8-e6a3-4fc4-9776-22942cec7474"
REPORT_ID = "cdc475bc-230c-490b-8d5a-3eb9d4d63ea4"
VISUAL_ID = "73bb0dee9bf573fb07c7"  # Visual de buscar candidatos (tablacandidatos)

EXISTING_FILE = Path("api_dumps/011_querydata_78991.json")
OUT = Path("candidatos.csv")

HEADERS = {
    "content-type": "application/json;charset=UTF-8",
    "x-powerbi-resourcekey": RESOURCE_KEY,
    "accept": "application/json, text/plain, */*",
    "origin": "https://app.powerbi.com",
    "referer": "https://app.powerbi.com/",
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
    ),
}


def get_restart_token(data: dict) -> str | None:
    """Extrae el RestartToken de la respuesta DSR."""
    for result in data.get("results", []):
        rd = result.get("result", {}).get("data", {})
        dsr = rd.get("dsr", {})
        for ds in dsr.get("DS", []):
            rt = ds.get("RT")
            if rt is not None:
                return rt
    return None


def has_additional_data(data: dict) -> bool:
    """Verifica si hay mas datos disponibles (HAD = Has Additional Data)."""
    for result in data.get("results", []):
        rd = result.get("result", {}).get("data", {})
        dsr = rd.get("dsr", {})
        for ds in dsr.get("DS", []):
            if ds.get("HAD") or ds.get("RT") is not None:
                return True
    return False


def build_query_body(restart_token: str | None = None, count: int = 500) -> dict:
    """
    Construye el body del querydata para la tabla de candidatos.
    El query replica la tabla 'Buscar candidatos' con todas las columnas.
    """
    # Base query para la tabla de candidatos (basado en req interceptados)
    query = {
        "Version": 2,
        "From": [
            {"Name": "c", "Entity": "candidaturas_202510", "Type": 0},
            {"Name": "s", "Entity": "simbolos", "Type": 0}
        ],
        "Select": [
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "region_nombre"},
             "Name": "candidaturas_202510.region_nombre"},
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "territorio_nombre"},
             "Name": "candidaturas_202510.territorio_nombre"},
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "tipo_eleccion"},
             "Name": "candidaturas_202510.tipo_eleccion"},
            {"Column": {"Expression": {"SourceRef": {"Source": "s"}},
                        "Property": "url_logo"},
             "Name": "simbolos.url_logo"},
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "partido - sin prefijo"},
             "Name": "candidaturas_202510.partido - sin prefijo"},
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "Letra - Pacto"},
             "Name": "candidaturas_202510.Letra - Pacto"},
            {"Column": {"Expression": {"SourceRef": {"Source": "c"}},
                        "Property": "nvoto_nombre_completo"},
             "Name": "candidaturas_202510.nvoto_nombre_completo"},
            {"Aggregation": {"Expression": {"Column": {
                "Expression": {"SourceRef": {"Source": "c"}},
                "Property": "tipo_eleccion"}}, "Function": 3},
             "Name": "Min(candidaturas_202510.tipo_eleccion)"},
            {"Aggregation": {"Expression": {"Column": {
                "Expression": {"SourceRef": {"Source": "s"}},
                "Property": "url_logo"}}, "Function": 3},
             "Name": "Min(simbolos.url_logo)"},
        ]
    }

    binding = {
        "Primary": {"Groupings": [{"Projections": [0,1,2,3,4,5,6,7,8]}]},
        "DataReduction": {"DataVolume": 3, "Primary": {"Window": {"Count": count}}},
        "Version": 1
    }

    if restart_token is not None:
        binding["DataReduction"]["Primary"]["Window"]["RestartToken"] = restart_token

    return {
        "version": "1.0.0",
        "queries": [{
            "Query": {
                "Commands": [{
                    "SemanticQueryDataShapeCommand": {
                        "Query": query,
                        "Binding": binding,
                        "ExecutionMetricsKind": 1
                    }
                }]
            },
            "QueryId": "",
            "ApplicationContext": {
                "DatasetId": DATASET_ID,
                "Sources": [{"ReportId": REPORT_ID, "VisualId": VISUAL_ID}]
            }
        }],
        "cancelQueries": [],
        "modelId": MODEL_ID
    }


def fetch_page(restart_token: str | None, page_num: int) -> dict | None:
    """Hace una llamada directa a la API de PowerBI."""
    if not HAS_REQUESTS:
        print("  requests no disponible")
        return None

    url = f"{WABI}/public/reports/querydata"
    body = build_query_body(restart_token, count=500)

    print(f"  Fetching page {page_num} (RT={'presente' if restart_token else 'None'})...")
    try:
        resp = requests.post(
            url,
            headers=HEADERS,
            json=body,
            timeout=30,
            verify=False,  # Ignorar SSL si hay problemas de cert
        )
        print(f"    Status: {resp.status_code}  Size: {len(resp.content):,}B")
        if resp.status_code == 200:
            data = resp.json()
            fname = Path(f"api_dumps/page_{page_num:02d}.json")
            with open(fname, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            return data
        else:
            print(f"    Error: {resp.text[:200]}")
    except Exception as e:
        print(f"    Exception: {e}")
    return None


def decode_dsr_table(result_data: dict) -> list[dict]:
    """Decode DSR con la logica probada."""
    dsr = result_data.get("dsr", {})
    descriptor = result_data.get("descriptor", {})
    col_names = [sel.get("Name", "").split(".")[-1].strip()
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
        "eleccion"          : row.get("tipo_eleccion", "").strip(),
        "numero"            : m.group(1).strip(),
        "candidato"         : m.group(2).strip(),
        "region"            : row.get("region_nombre", "").replace("\xa0", " ").strip(),
        "territorio"        : row.get("territorio_nombre", "").replace("\xa0", " ").strip(),
        "lista"             : row.get("Letra - Pacto", "").strip(),
        "partido_candidatura": row.get("partido - sin prefijo", "").strip(),
    }


def inspect_existing() -> tuple[dict, str | None]:
    """Lee el archivo existente y extrae el RT."""
    with open(EXISTING_FILE, encoding="utf-8") as f:
        data = json.load(f)

    rt = get_restart_token(data)
    had = has_additional_data(data)

    with open("rt_info.txt", "w", encoding="utf-8") as f:
        f.write(f"RestartToken: {json.dumps(rt)[:500] if rt else 'None'}\n")
        f.write(f"HasAdditionalData: {had}\n\n")
        # Inspeccionar DS
        for ri, result in enumerate(data.get("results", [])):
            rd = result.get("result", {}).get("data", {})
            dsr = rd.get("dsr", {})
            for di, ds in enumerate(dsr.get("DS", [])):
                keys = list(ds.keys())
                f.write(f"result[{ri}].DS[{di}] keys: {keys}\n")
                if "RT" in ds:
                    rt_val = ds["RT"]
                    f.write(f"  RT type: {type(rt_val).__name__}\n")
                    f.write(f"  RT value: {json.dumps(rt_val)[:300]}\n")
                if "HAD" in ds:
                    f.write(f"  HAD: {ds['HAD']}\n")

    print(f"RT info guardado en rt_info.txt")
    return data, rt


def main():
    print("SERVEL 2025 - Paginacion via RestartToken")
    print("=" * 60)

    # 1. Leer archivo existente
    print(f"\n1. Inspeccionando {EXISTING_FILE}...")
    data_p1, rt = inspect_existing()

    # Leer rt_info.txt para mostrar
    with open("rt_info.txt", encoding="utf-8") as f:
        print(f.read())

    # 2. Procesar pagina 1 (ya tenemos los datos)
    all_c: list[dict] = []
    seen: set[str] = set()

    def add_from_data(data: dict, label: str):
        cnt = 0
        for res in data.get("results", []):
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
                    cnt += 1
        print(f"  [{label}] +{cnt} candidatos nuevos (total: {len(all_c)})")

    print(f"\n2. Procesando pagina 1 (existente)...")
    add_from_data(data_p1, "page1_existente")

    # 3. Si hay RT y tenemos requests, paginar
    if rt is not None and HAS_REQUESTS:
        print(f"\n3. Paginando via API directa...")
        current_rt = rt
        page = 2
        max_pages = 10

        while current_rt is not None and page <= max_pages:
            time.sleep(1)  # Rate limit
            data = fetch_page(current_rt, page)
            if not data:
                print(f"  Pagina {page} fallo, deteniendo.")
                break

            add_from_data(data, f"page{page}")

            # Obtener RT para la siguiente pagina
            new_rt = get_restart_token(data)
            if new_rt == current_rt or new_rt is None:
                print(f"  No hay mas paginas.")
                break

            current_rt = new_rt
            page += 1

    elif not HAS_REQUESTS:
        print("\n3. requests no disponible, solo datos existentes.")
    else:
        print("\n3. No hay RT - los datos existentes son todos los disponibles.")

    # 4. Procesar todos los dumps existentes
    print("\n4. Procesando dumps existentes adicionales...")
    for f in sorted(Path("api_dumps").glob("*.json")):
        if f == EXISTING_FILE:
            continue
        try:
            with open(f, encoding="utf-8") as fp:
                d = json.load(fp)
            if "results" in d:
                add_from_data(d, f.name[:30])
        except Exception:
            pass

    # 5. Guardar
    all_c.sort(key=lambda x: (x["eleccion"], x["region"], x["territorio"], x["candidato"]))
    print(f"\nTotal: {len(all_c)} / 1221 esperados")

    if all_c:
        fieldnames = ["eleccion","numero","candidato","region","territorio","lista","partido_candidatura"]
        with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            w.writeheader()
            w.writerows(all_c)
        print(f"CSV: {OUT}")
        print("Muestra (5):")
        for r in all_c[:5]:
            print(f"  {r}")


if __name__ == "__main__":
    import urllib3; urllib3.disable_warnings()
    main()
