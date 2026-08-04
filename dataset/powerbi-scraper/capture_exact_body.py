"""
Captura el body EXACTO del querydata de 'Buscar candidatos'
y lo guarda para usar en paginacion directa.
"""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright, Route, Request, Response

REPORT_URL = (
    "https://app.powerbi.com/view"
    "?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6"
    "IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9"
)
SHOTS = Path("screenshots"); SHOTS.mkdir(exist_ok=True)

captured_pairs: list[dict] = []   # {body, response, size}


async def route_capture(route: Route, request: Request):
    """Captura body y continua normalmente."""
    body_str = request.post_data or ""
    if body_str and len(body_str) > 500:
        try:
            body = json.loads(body_str)
            idx = len(captured_pairs)
            print(f"    [REQ {idx:03d}] {len(body_str)}B POST")
            captured_pairs.append({"body": body, "response": None, "size": len(body_str)})
        except Exception:
            pass
    await route.continue_()


async def on_response(resp: Response):
    if "analysis.windows.net" not in resp.url or "querydata" not in resp.url:
        return
    if resp.status != 200:
        return
    try:
        data = await resp.body()
        size = len(data)
        if size < 1000:
            return
        resp_data = json.loads(data)
        # Asociar con el ultimo req sin response
        for pair in reversed(captured_pairs):
            if pair["response"] is None:
                pair["response"] = resp_data
                pair["resp_size"] = size
                print(f"    [RSP] {size:,}B asociado")
                break
    except Exception as e:
        print(f"    [RSP] err: {e}")


async def main():
    print("Capturando body exacto del query de candidatos...")
    print("=" * 60)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=False,
            args=["--no-sandbox", "--disable-cache", "--disk-cache-size=0"]
        )
        # Contexto fresco - sin cache
        ctx = await browser.new_context(
            viewport={"width": 1600, "height": 900},
            locale="es-CL",
            ignore_https_errors=True,
        )
        # Limpiar storage
        await ctx.clear_cookies()

        page = await ctx.new_page()
        await page.route("**/querydata**", route_capture)
        page.on("response", lambda r: asyncio.ensure_future(on_response(r)))

        print("1. Cargando reporte (sin cache)...")
        await page.goto(REPORT_URL, wait_until="domcontentloaded", timeout=60_000)
        try:
            await page.get_by_text("Presidencial").first.wait_for(
                state="visible", timeout=60_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(4000)
        print(f"   Reqs capturados hasta ahora: {len(captured_pairs)}")

        print("2. Navegando a 'Buscar candidatos'...")
        try:
            await page.get_by_text("Buscar candidatos", exact=True).first.click(
                force=True, timeout=5000
            )
        except Exception as e:
            print(f"   Error: {e}")

        try:
            await page.get_by_text("Diputado").first.wait_for(
                state="visible", timeout=30_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(4000)
        await page.screenshot(path=str(SHOTS / "cap_final.png"))
        print(f"   Reqs capturados total: {len(captured_pairs)}")

    await browser.close()

    # Guardar todos los pares
    print("\n3. Analizando requests capturados...")
    best_pair = None
    best_size = 0

    for i, pair in enumerate(captured_pairs):
        body = pair["body"]
        resp = pair["response"]
        resp_size = pair.get("resp_size", 0)
        body_str = json.dumps(body)

        # Identificar el de candidatos por columnas o por tamano de respuesta
        has_candidatos = any(kw in body_str for kw in [
            "nvoto_nombre_completo", "territorio_nombre", "region_nombre",
            "Letra - Pacto", "partido - sin prefijo"
        ])

        print(f"  Req[{i}]: {len(body_str)}B body | resp_size={resp_size} | candidatos={has_candidatos}")

        if resp_size > best_size:
            best_size = resp_size
            best_pair = pair

    if best_pair:
        print(f"\nMejor candidato: resp_size={best_pair.get('resp_size', 0):,}B")
        # Guardar el body
        with open("candidatos_query_body.json", "w", encoding="utf-8") as f:
            json.dump(best_pair["body"], f, ensure_ascii=False, indent=2)
        print("Guardado: candidatos_query_body.json")

        if best_pair.get("response"):
            with open("candidatos_resp_fresh.json", "w", encoding="utf-8") as f:
                json.dump(best_pair["response"], f, ensure_ascii=False)
            print("Guardado: candidatos_resp_fresh.json")

    print("\nListo!")


if __name__ == "__main__":
    asyncio.run(main())
