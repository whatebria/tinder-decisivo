"""
PowerBI Candidatos Scraper - v6 NETWORK INTERCEPT
Intercepta las llamadas XHR de PowerBI al backend de datos.
PowerBI hace queries REST al Analysis Services para obtener los datos
del visual de tabla. Capturamos esa respuesta JSON directamente.
Mucho mas rapido que DOM scraping.
"""
import asyncio
import csv
import json
import re
from pathlib import Path
from playwright.async_api import async_playwright, Request, Response

URL = (
    "https://app.powerbi.com/view"
    "?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6"
    "IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9"
)

OUTPUT_JSON = Path("raw_responses.json")
OUTPUT_CSV = Path("candidatos.csv")
SHOTS = Path("screenshots")
SHOTS.mkdir(exist_ok=True)

# Todas las respuestas de datos capturadas
captured_responses: list[dict] = []

# Keywords que indican respuestas de datos de PowerBI
DATA_URL_PATTERNS = [
    "querydata",
    "executequeries",
    "tilerendererservice",
    "analysis.windows.net",
    "powerbi.com/query",
    "powerbi.com/render",
    "/tile/",
    "queryExecute",
    "explore/datamodel",
]


def looks_like_data_response(url: str, content_type: str) -> bool:
    url_lower = url.lower()
    return any(p in url_lower for p in DATA_URL_PATTERNS) or (
        "json" in content_type and "powerbi" in url_lower
    )


async def capture_response(response: Response):
    """Callback para capturar respuestas de red relevantes."""
    url = response.url
    ct = response.headers.get("content-type", "")

    # Filtrar respuestas JSON potencialmente interesantes
    if response.status != 200:
        return

    if "json" not in ct and "octet" not in ct:
        return

    # Buscar URLs de PowerBI Analysis Services o QueryData
    interesting = (
        "analysis.windows.net" in url
        or "querydata" in url.lower()
        or "executequeries" in url.lower()
        or ("powerbi.com" in url and "query" in url.lower())
        or ("msit.pbidedicated" in url)
        or ("pbidedicated" in url)
    )

    if not interesting:
        return

    try:
        body = await response.body()
        if len(body) < 50:
            return

        print(f"  [NET] {url[:100]} ({len(body)} bytes)")

        try:
            data = json.loads(body)
            captured_responses.append({
                "url": url,
                "status": response.status,
                "content_type": ct,
                "size": len(body),
                "data": data,
            })
        except json.JSONDecodeError:
            # Guardar de todos modos como texto si parece util
            text = body.decode("utf-8", errors="replace")
            if len(text) > 200:
                captured_responses.append({
                    "url": url,
                    "status": response.status,
                    "content_type": ct,
                    "size": len(body),
                    "data": {"_raw": text[:5000]},
                })
    except Exception as e:
        print(f"  [NET] Error capturando {url[:60]}: {e}")


async def capture_all_requests(page):
    """Registra todos los requests para debug."""
    all_reqs = []

    async def on_request(req: Request):
        all_reqs.append({
            "url": req.url,
            "method": req.method,
            "resource_type": req.resource_type,
        })

    page.on("request", on_request)
    return all_reqs


# ---------------------------------------------------------------------------
# Extraccion de candidatos de la respuesta JSON
# ---------------------------------------------------------------------------

def extract_candidates_from_response(resp: dict) -> list[dict]:
    """
    Intenta extraer candidatos de una respuesta JSON de PowerBI.
    PowerBI devuelve datos en formato nested con 'results', 'tables', 'rows'.
    """
    data = resp.get("data", {})
    candidates = []

    def search_nested(obj, depth=0):
        if depth > 10:
            return

        if isinstance(obj, dict):
            # PowerBI formato: {"results": [{"tables": [{"rows": [...]}]}]}
            if "rows" in obj and isinstance(obj["rows"], list):
                for row in obj["rows"]:
                    if isinstance(row, dict) and len(row) >= 2:
                        candidates.append(row)

            for v in obj.values():
                search_nested(v, depth + 1)

        elif isinstance(obj, list):
            for item in obj:
                search_nested(item, depth + 1)

    search_nested(data)
    return candidates


def detect_candidate_rows(rows: list[dict]) -> list[dict]:
    """
    De todas las filas capturadas, filtra las que parecen candidatos.
    Busca filas que tengan campos de nombre, region, partido, etc.
    """
    candidate_rows = []

    # Keywords que sugieren datos de candidatos
    candidate_keywords = {
        "nombre", "candidato", "region", "territorio", "partido",
        "lista", "eleccion", "senador", "diputado", "circunscripcion",
        "distrito", "nombre_completo"
    }

    for row in rows:
        keys_lower = {k.lower() for k in row.keys()}
        # Si al menos 2 keys suenan a candidato
        if len(keys_lower & candidate_keywords) >= 2:
            candidate_rows.append(row)
        # O si alguna value contiene nombres de partidos chilenos
        else:
            vals = " ".join(str(v) for v in row.values()).lower()
            if any(kw in vals for kw in [
                "independiente", "chile vamos", "apruebo",
                "ecologista", "socialista", "democratica"
            ]):
                candidate_rows.append(row)

    return candidate_rows


# ---------------------------------------------------------------------------
# Scroll para forzar que PowerBI haga queries
# ---------------------------------------------------------------------------

async def trigger_data_loads(page):
    """
    Navega y hace scroll para forzar que PowerBI cargue todos los datos
    via queries al backend.
    """
    print("\nForzando carga de datos via scroll...")

    # Esperar tabla lista
    await page.wait_for_timeout(2000)

    # Click en la tabla para darle foco
    try:
        table = await page.query_selector(".tableEx, .pivotTable, [role='grid']")
        if table:
            await table.click(force=True)
    except Exception:
        pass

    await page.wait_for_timeout(500)

    # Scroll rapido para triggerear virtualizacion
    print("  Scrolleando tabla para cargar todas las paginas de datos...")
    for i in range(60):
        await page.keyboard.press("PageDown")
        await page.wait_for_timeout(200)
        if i % 10 == 0:
            print(f"    Scroll {i}/60 | Respuestas capturadas: {len(captured_responses)}")

    # Volver al inicio
    await page.keyboard.press("Control+Home")
    await page.wait_for_timeout(1000)

    print(f"  Scroll terminado. Respuestas de datos: {len(captured_responses)}")


# ---------------------------------------------------------------------------
# DOM fallback - extraccion directa mas agresiva
# ---------------------------------------------------------------------------

async def dom_extract_all(page, target: int = 1221) -> list[dict]:
    """
    Fallback: extraccion por DOM con scroll agresivo.
    Optimizado para velocidad (menos waits, mas eficiente).
    """
    print("\nDOM extraction fallback...")

    # Detectar headers
    headers_raw = []
    for sel in [
        ".tableEx .columnHeaders .pivotTableCellWrap",
        "[class*='columnHeaders'] [class*='CellWrap']",
        "th",
        "[role='columnheader']",
    ]:
        els = await page.query_selector_all(sel)
        if els:
            for el in els:
                t = (await el.inner_text()).strip().replace("\xa0", " ").strip()
                if t and t not in headers_raw:
                    headers_raw.append(t)
            if len(headers_raw) >= 3:
                break

    print(f"  Headers: {headers_raw}")
    n = len(headers_raw) if headers_raw else 7

    # Encontrar scroller con scrollHeight > 1000
    scroll_info = await page.evaluate("""() => {
        const els = [...document.querySelectorAll('*')];
        const candidates = els
            .filter(el => {
                const s = window.getComputedStyle(el);
                return (s.overflowY === 'auto' || s.overflowY === 'scroll')
                    && el.scrollHeight > 300;
            })
            .map(el => ({
                tag: el.tagName,
                cls: el.className,
                scrollH: el.scrollHeight,
                clientH: el.clientHeight,
                rect: el.getBoundingClientRect()
            }))
            .sort((a, b) => b.scrollH - a.scrollH);
        return candidates[0] || null;
    }""")

    print(f"  Mejor scroller: {scroll_info}")

    all_rows: list[dict] = []
    seen: set[str] = set()
    no_new = 0
    pos = 0

    # Obtener el scroller element
    scroller_cls = None
    if scroll_info and scroll_info.get("cls"):
        parts = scroll_info["cls"].split()
        if parts:
            scroller_cls = parts[0]

    while no_new < 15 and len(all_rows) < target:
        # Extraer filas visibles
        rows_raw = await page.evaluate(f"""(n) => {{
            const result = [];

            // Estrategia 1: role=row
            const rowEls = document.querySelectorAll("[role='row']");
            if (rowEls.length > 0) {{
                for (const row of rowEls) {{
                    const cells = row.querySelectorAll("[role='cell'], [role='gridcell'], td");
                    if (!cells.length) continue;
                    const vals = [...cells].map(c => c.innerText.trim());
                    if (vals.some(v => v)) result.push(vals);
                }}
                if (result.length) return result;
            }}

            // Estrategia 2: tr > td
            const trs = document.querySelectorAll("tr");
            for (const tr of trs) {{
                const tds = tr.querySelectorAll("td");
                if (!tds.length) continue;
                const vals = [...tds].map(td => td.innerText.trim());
                if (vals.some(v => v)) result.push(vals);
            }}
            if (result.length) return result;

            // Estrategia 3: pivotTableCellWrap
            const wraps = document.querySelectorAll(".pivotTableCellWrap");
            if (wraps.length) {{
                const texts = [...wraps].map(w => w.innerText.trim());
                for (let i = 0; i <= texts.length - n; i += n) {{
                    const chunk = texts.slice(i, i + n);
                    if (chunk.some(v => v)) result.push(chunk);
                }}
            }}

            return result;
        }}""", n)

        added = 0
        for vals in rows_raw:
            row = {(headers_raw[i] if i < len(headers_raw) else f"col_{i}"): v
                   for i, v in enumerate(vals)}
            key = json.dumps(row, sort_keys=True, ensure_ascii=False)
            if key not in seen:
                seen.add(key)
                all_rows.append(row)
                added += 1

        no_new = 0 if added else no_new + 1

        if len(all_rows) % 100 == 0 and added:
            print(f"  DOM: {len(all_rows)} filas | no_new={no_new}")

        pos += 400
        if scroller_cls:
            await page.evaluate(
                f"""() => {{
                    const el = document.querySelector('.{scroller_cls}');
                    if (el) el.scrollTop = {pos};
                }}"""
            )
        else:
            for _ in range(5):
                await page.keyboard.press("PageDown")

        await page.wait_for_timeout(100)

    return all_rows


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main():
    print("PowerBI Candidatos Scraper v6 - Network Intercept + DOM fallback")
    print(f"URL: {URL}\n")

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

        # Registrar listener de respuestas
        page.on("response", capture_response)

        # 1. Cargar reporte
        print("1. Cargando reporte...")
        await page.goto(URL, wait_until="domcontentloaded", timeout=60_000)
        try:
            await page.get_by_text("Presidencial").first.wait_for(
                state="visible", timeout=60_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(2000)
        await shot(page, "01_loaded")

        # 2. Navegar a Buscar candidatos
        print("2. Click en 'Buscar candidatos'...")
        try:
            await page.get_by_text("Buscar candidatos", exact=True).first.click(
                force=True, timeout=5000
            )
        except Exception as e:
            print(f"   Error: {e}")

        # Esperar que la tabla cargue
        try:
            await page.get_by_text("Diputado").first.wait_for(
                state="visible", timeout=20_000
            )
        except Exception:
            pass

        await page.wait_for_timeout(2000)
        await shot(page, "02_buscar")

        # 3. Hacer scroll para triggerear requests de datos
        await trigger_data_loads(page)
        await page.wait_for_timeout(2000)

        print(f"\n3. Respuestas de red capturadas: {len(captured_responses)}")

        # Guardar raw responses para inspeccion
        if captured_responses:
            with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
                json.dump(
                    [{k: v for k, v in r.items() if k != "data"} | {"url": r["url"]}
                     for r in captured_responses],
                    f, indent=2, ensure_ascii=False
                )
            print(f"   URLs capturadas guardadas en {OUTPUT_JSON}")

        # 4. Intentar extraer de respuestas de red
        all_net_candidates = []
        for resp in captured_responses:
            cands = extract_candidates_from_response(resp)
            print(f"   {resp['url'][:70]}: {len(cands)} rows potenciales")
            all_net_candidates.extend(cands)

        filtered = detect_candidate_rows(all_net_candidates)
        print(f"   Candidatos via red: {len(filtered)}")

        # 5. Si la red no dio suficiente, hacer DOM scraping
        final_rows = filtered
        if len(filtered) < 100:
            print("\n4. Fallback a DOM scraping...")
            await shot(page, "03_before_dom")
            dom_rows = await dom_extract_all(page, target=1221)
            print(f"   DOM: {len(dom_rows)} filas")
            final_rows = dom_rows

        await shot(page, "04_final")

        # 6. Guardar CSV
        if final_rows:
            fieldnames = list(final_rows[0].keys())
            with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
                w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
                w.writeheader()
                w.writerows(final_rows)
            print(f"\nCSV: {OUTPUT_CSV} ({len(final_rows)} filas)")
        else:
            print("\nSin datos.")

        await page.wait_for_timeout(2000)
        await browser.close()
        print("Listo!")


if __name__ == "__main__":
    asyncio.run(main())
