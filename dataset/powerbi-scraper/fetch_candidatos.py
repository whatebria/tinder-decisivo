"""
PowerBI Scraper v7 - Guarda TODAS las respuestas querydata individualmente.
El 78,991-byte querydata tiene los candidatos en formato DSR de PowerBI.
"""
import asyncio
import base64
import csv
import json
import re
from pathlib import Path
from playwright.async_api import async_playwright, Response

REPORT_URL = (
    "https://app.powerbi.com/view"
    "?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6"
    "IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9"
)

DUMP_DIR  = Path("api_dumps")
DUMP_DIR.mkdir(exist_ok=True)
SHOTS_DIR = Path("screenshots")
SHOTS_DIR.mkdir(exist_ok=True)
OUTPUT_CSV = Path("candidatos.csv")

# Contador global de respuestas
_resp_counter = 0
captured_all: list[dict] = []


async def on_response(resp: Response):
    global _resp_counter
    url = resp.url
    if "analysis.windows.net" not in url:
        return
    if resp.status != 200:
        return

    ct = resp.headers.get("content-type", "")
    try:
        body = await resp.body()
        size = len(body)
        if size < 100:
            return

        _resp_counter += 1
        idx = _resp_counter

        # Detectar tipo de endpoint
        if url.endswith("/querydata"):
            etype = "querydata"
        elif "conceptualschema" in url:
            etype = "schema"
        elif "resourcePackage" in url:
            etype = "resource"
        else:
            etype = "other"

        # Intentar JSON
        data = None
        try:
            data = json.loads(body)
        except Exception:
            pass

        entry = {
            "idx": idx,
            "url": url,
            "size": size,
            "type": etype,
            "has_json": data is not None,
        }
        captured_all.append({**entry, "data": data, "raw_bytes": body if data is None else None})

        # Guardar a archivo
        fname = DUMP_DIR / f"{idx:03d}_{etype}_{size}.json"
        if data is not None:
            with open(fname, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
        else:
            with open(DUMP_DIR / f"{idx:03d}_{etype}_{size}.bin", "wb") as f:
                f.write(body)

        print(f"  [NET {idx:03d}] {size:>9,}B  {etype}  -> {fname.name}")

    except Exception as e:
        print(f"  [NET] Error: {e}")


async def capture_session():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=False,
            args=["--no-sandbox", "--disable-gpu"],
        )
        ctx = await browser.new_context(
            viewport={"width": 1600, "height": 900},
            locale="es-CL",
        )
        page = await ctx.new_page()
        page.on("response", on_response)

        # 1. Cargar
        print("1. Cargando reporte...")
        await page.goto(REPORT_URL, wait_until="domcontentloaded", timeout=60_000)
        try:
            await page.get_by_text("Presidencial").first.wait_for(
                state="visible", timeout=60_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(SHOTS_DIR / "A_loaded.png"))

        # 2. Click Buscar candidatos
        print("\n2. Navegando a 'Buscar candidatos'...")
        try:
            await page.get_by_text("Buscar candidatos", exact=True).first.click(
                force=True, timeout=5000
            )
        except Exception as e:
            print(f"   Error: {e}")

        # Esperar datos
        try:
            await page.get_by_text("Diputado").first.wait_for(
                state="visible", timeout=20_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(SHOTS_DIR / "B_buscar.png"))
        print(f"   Respuestas capturadas hasta ahora: {len(captured_all)}")

        # 3. Scroll para cargar mas datos
        print("\n3. Scrolleando para triggerear queries...")
        try:
            table = await page.query_selector(".tableEx, .pivotTable, [role='grid']")
            if table:
                await table.click(force=True)
        except Exception:
            pass

        for i in range(60):
            await page.keyboard.press("PageDown")
            await page.wait_for_timeout(150)

        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SHOTS_DIR / "C_scrolled.png"))
        print(f"   Respuestas totales: {len(captured_all)}")

        await browser.close()

    return captured_all


# ---------------------------------------------------------------------------
# Parseo DSR de PowerBI
# ---------------------------------------------------------------------------

def dsr_to_rows(dsr_data: dict) -> list[dict]:
    """
    Parsea el formato DSR (Data Shape Result) de PowerBI.
    El formato es: { DS: [{ PH: [{ DM0: { D: [...], C: [...] } }] }] }
    Donde D=schema, C=columns compressed, y los datos estan en PH.
    """
    rows = []

    def walk(obj, parent_key=""):
        if isinstance(obj, dict):
            # Formato DSR clasico
            if "DS" in obj:
                for ds in obj["DS"]:
                    walk(ds, "DS")

            if "PH" in obj:
                for ph in obj["PH"]:
                    walk(ph, "PH")

            # DataModelSchema con tablas
            if "DM0" in obj:
                dm = obj["DM0"]
                # Obtener columnas del schema
                schema = []
                if "D" in dm and isinstance(dm["D"], list):
                    for d in dm["D"]:
                        if isinstance(d, dict) and "N" in d:
                            schema.append(d["N"])

                # Los datos reales estan en C (columnas) o en nested
                if "C" in dm and schema:
                    data_cols = dm["C"]
                    # Reconstruir filas
                    n_cols = len(schema)
                    for i in range(0, len(data_cols), n_cols):
                        chunk = data_cols[i: i + n_cols]
                        if len(chunk) == n_cols:
                            row = dict(zip(schema, chunk))
                            rows.append(row)

            for v in obj.values():
                if isinstance(v, (dict, list)):
                    walk(v, parent_key)

        elif isinstance(obj, list):
            for item in obj:
                walk(item)

    walk(dsr_data)
    return rows


def powerbi_querydata_to_rows(data: dict) -> list[dict]:
    """
    Parsea una respuesta de /querydata de PowerBI.
    Estos tienen un formato especial con 'results' y 'dsr' o 'data'.
    """
    rows = []

    # Formato 1: results -> data -> dsr
    if "results" in data:
        for result in data["results"]:
            if "data" in result:
                rd = result["data"]
                # DSR format
                if "dsr" in rd:
                    rows.extend(dsr_to_rows(rd["dsr"]))
                # Direct rows
                if "rows" in rd:
                    rows.extend(rd["rows"])
                # Nested structures
                if isinstance(rd, dict):
                    walk_simple(rd, rows)

    # Formato 2: dsr directo
    if "dsr" in data:
        rows.extend(dsr_to_rows(data["dsr"]))

    # Formato 3: tables -> rows
    walk_simple(data, rows)

    return rows


def walk_simple(data, out: list):
    """Busca 'rows' en cualquier nivel del JSON."""
    if isinstance(data, dict):
        if "rows" in data and isinstance(data["rows"], list):
            r = data["rows"]
            if r and isinstance(r[0], dict) and len(r[0]) >= 2:
                out.extend(r)
        for v in data.values():
            walk_simple(v, out)
    elif isinstance(data, list):
        for item in data:
            walk_simple(item, out)


def inspect_json_structure(data, prefix="", depth=0, max_depth=4):
    """Muestra la estructura del JSON para debug."""
    if depth > max_depth:
        return
    if isinstance(data, dict):
        for k, v in list(data.items())[:10]:
            if isinstance(v, (dict, list)):
                vtype = f"dict({len(v)})" if isinstance(v, dict) else f"list({len(v)})"
                print(f"  {prefix}{k}: {vtype}")
                inspect_json_structure(v, prefix + "  ", depth + 1, max_depth)
            else:
                vstr = repr(v)[:60]
                print(f"  {prefix}{k}: {vstr}")
    elif isinstance(data, list) and len(data) > 0:
        print(f"  {prefix}[0]: {type(data[0]).__name__}")
        if isinstance(data[0], (dict, list)):
            inspect_json_structure(data[0], prefix + "  ", depth + 1, max_depth)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main():
    print("PowerBI Scraper v7 - Captura y parseo DSR")
    print("=" * 60)

    # Capturar sesion
    responses = await capture_session()

    print(f"\n{'='*60}")
    print(f"ANALISIS DE {len(responses)} RESPUESTAS")
    print("=" * 60)

    # Analizar cada respuesta, ordenar por tamano desc
    all_rows = []
    seen = set()

    sorted_responses = sorted(responses, key=lambda x: -x["size"])

    for resp in sorted_responses:
        if not resp["has_json"] or resp["data"] is None:
            continue

        print(f"\n[{resp['idx']:03d}] {resp['type']} ({resp['size']:,} bytes)")
        print(f"  URL: {resp['url'][:80]}")

        data = resp["data"]
        top_keys = list(data.keys())[:10]
        print(f"  Top keys: {top_keys}")

        if resp["type"] == "querydata" or resp["size"] > 10_000:
            print("  Estructura:")
            inspect_json_structure(data, "    ", max_depth=3)

            rows = powerbi_querydata_to_rows(data)
            print(f"  Filas extraidas: {len(rows)}")

            if rows:
                print(f"  Keys ejemplo: {list(rows[0].keys())[:8]}")
                print(f"  Row[0]: {dict(list(rows[0].items())[:4])}")

            for row in rows:
                key = json.dumps(row, sort_keys=True, ensure_ascii=False)
                if key not in seen:
                    seen.add(key)
                    all_rows.append(row)

    print(f"\nTotal filas unicas: {len(all_rows)}")

    if all_rows:
        print("Sample:")
        for r in all_rows[:5]:
            print(f"  {r}")

        # Guardar CSV
        fieldnames = list(all_rows[0].keys())
        with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            w.writeheader()
            w.writerows(all_rows)
        print(f"\nCSV: {OUTPUT_CSV} ({len(all_rows)} filas)")
    else:
        print("\nNo se extrajeron filas. Ver archivos en api_dumps/ para debug manual.")
        # Mostrar los archivos guardados
        for f in sorted(DUMP_DIR.iterdir()):
            print(f"  {f.name} ({f.stat().st_size:,} bytes)")


if __name__ == "__main__":
    asyncio.run(main())
