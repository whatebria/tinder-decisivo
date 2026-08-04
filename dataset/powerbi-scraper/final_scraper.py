"""
SERVEL 2025 - DOM scraping final.
Usa el scroll pixel por pixel sobre el contenedor de la tabla PowerBI.
Extrae texto visible de cada set de filas renderizadas.
"""
import asyncio, csv, json, re, time
from pathlib import Path
from playwright.async_api import async_playwright

REPORT_URL = (
    "https://app.powerbi.com/view"
    "?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6"
    "IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9"
)
SHOTS = Path("screenshots"); SHOTS.mkdir(exist_ok=True)
OUT   = Path("candidatos.csv")

seen: set[str] = set()
all_c: list[dict] = []


def clean_text(s: str) -> str:
    """Limpia nbsp, saltos de linea y espacios extra."""
    return re.sub(r"\s+", " ", s.replace("\xa0", " ")).strip()


def parse_rows(rows_data: list[dict]) -> int:
    """Parsea filas crudas y las agrega a all_c. Retorna cuantas nuevas."""
    new = 0
    for row in rows_data:
        cells = row.get("cells", [])
        if len(cells) < 5:
            continue
        # PowerBI table structure:
        # [0] = "Seleccionar fila" (checkbox - SKIP)
        # [1] = "Diputado\nFormato condicional..." (take first line)
        # [2] = "NNN. Nombre Apellido"
        # [3] = Region
        # [4] = Territorio
        # [5] = Lista
        # [6] = Partido
        raw = [clean_text(str(c)) for c in cells]
        
        # Buscar el campo con número de candidato (patrón "NNN. Nombre")
        nombre_raw = ""
        nombre_idx = -1
        for i, cell in enumerate(raw):
            m = re.match(r"^(\d+)\.\s+(.{5,})", cell)
            if m:
                nombre_raw = cell
                nombre_idx = i
                break
        
        if not nombre_raw or nombre_idx < 0:
            continue
        
        m = re.match(r"^(\d+)\.\s+(.+)$", nombre_raw)
        if not m:
            continue
        
        numero = m.group(1).strip()
        nombre = m.group(2).strip()
        
        # Eleccion: campo anterior al nombre (ignorar checkbox y tomar primera palabra)
        eleccion = ""
        if nombre_idx > 0:
            prev = raw[nombre_idx - 1]
            first_word = prev.split()[0] if prev.split() else ""
            if first_word in ("Diputado", "Senador", "Presidente"):
                eleccion = first_word
        
        region = raw[nombre_idx + 1] if nombre_idx + 1 < len(raw) else ""
        territorio = raw[nombre_idx + 2] if nombre_idx + 2 < len(raw) else ""
        lista = raw[nombre_idx + 3] if nombre_idx + 3 < len(raw) else ""
        partido = raw[nombre_idx + 4] if nombre_idx + 4 < len(raw) else ""
        
        key = f"{eleccion}|{numero}|{nombre}|{territorio}"
        if key not in seen:
            seen.add(key)
            all_c.append({
                "eleccion": eleccion,
                "numero": numero,
                "candidato": nombre,
                "region": region,
                "territorio": territorio,
                "lista": lista,
                "partido_candidatura": partido,
            })
            new += 1
    return new


async def extract_table_rows(page) -> list[dict]:
    """Extrae filas actuales visibles de la tabla."""
    return await page.evaluate("""() => {
        // PowerBI table rows tienen data-rowindex o están en .tableEx
        const allRows = [];
        
        // Selector 1: grid rows con role=row
        const rowEls = document.querySelectorAll('[role="row"]:not([role="columnheader"]):not([role="rowheader"])');
        
        for (const row of rowEls) {
            const cells = [];
            // Celdas con role=gridcell o role=rowheader
            const cellEls = row.querySelectorAll('[role="gridcell"], [role="rowheader"], td, .cell');
            for (const cell of cellEls) {
                const text = (cell.innerText || cell.textContent || '').trim();
                if (text) cells.push(text);
            }
            if (cells.length >= 3) {
                allRows.push({cells: cells});
            }
        }
        
        if (allRows.length > 0) return allRows;
        
        // Selector 2: tabla visual de PowerBI
        const tableRows = document.querySelectorAll('.tableEx .rowContainer .innerContainer, .pivotTable tr');
        for (const row of tableRows) {
            const cells = [];
            const cellEls = row.querySelectorAll('.cell, td, th');
            for (const cell of cellEls) {
                const t = (cell.innerText || cell.textContent || '').trim();
                if (t) cells.push(t);
            }
            if (cells.length >= 3) allRows.push({cells: cells});
        }
        
        return allRows;
    }""")


async def find_scroll_container(page):
    """Encuentra el elemento scrollable de la tabla."""
    info = await page.evaluate("""() => {
        // Buscar el contenedor con overflow scroll que tenga filas
        const candidates = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
            const style = window.getComputedStyle(el);
            const overflowY = style.overflowY;
            if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 50) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 400 && rect.height > 200) {
                    candidates.push({
                        tag: el.tagName,
                        cls: el.className.substring(0, 60),
                        scrollHeight: el.scrollHeight,
                        clientHeight: el.clientHeight,
                        width: rect.width,
                        x: rect.x,
                        y: rect.y,
                        role: el.getAttribute('role') || ''
                    });
                }
            }
        }
        // Ordenar por scrollHeight (mas grande = mas candidatos)
        candidates.sort((a, b) => b.scrollHeight - a.scrollHeight);
        return candidates.slice(0, 5);
    }""")
    return info


async def scroll_and_extract(page) -> int:
    """Scroll completo de la tabla extrayendo todas las filas."""
    # Encontrar contenedor
    containers = await find_scroll_container(page)
    print(f"   Contenedores scrollables: {len(containers)}")
    for c in containers[:3]:
        print(f"   -> {c['tag']}.{c['cls'][:30]} scrollH={c['scrollHeight']} clientH={c['clientHeight']}")

    if not containers:
        print("   No encontré contenedor scrollable")
        return 0

    best = containers[0]
    scroll_h = best["scrollHeight"]
    client_h = best["clientHeight"]
    total_scroll = scroll_h - client_h
    
    print(f"   Total scroll: {total_scroll}px")

    # Altura estimada por row (PowerBI usa ~36-42px por fila)
    row_height = 36
    step = max(client_h - row_height, row_height * 5)  # Avanzar casi un viewport
    
    pos = 0
    iterations = 0
    max_iter = max(total_scroll // step + 50, 100)
    prev_count = len(all_c)
    stall_count = 0
    max_stall = 8  # Parar si 8 iteraciones sin nuevos candidatos
    
    print(f"   Iteraciones max: {max_iter}")

    while iterations < max_iter:
        # Scroll al contenedor .mid-viewport
        current_scroll_h = await page.evaluate("""() => {
            const el = document.querySelector('.mid-viewport');
            if (!el) return 0;
            el.scrollTop = """ + str(pos) + """;
            return el.scrollHeight;
        }""")
        
        await page.wait_for_timeout(200)  # Esperar render virtual
        
        # Re-check scrollHeight (puede crecer)
        current_scroll_h = await page.evaluate("""() => {
            const el = document.querySelector('.mid-viewport');
            return el ? el.scrollHeight : 0;
        }""")
        
        rows = await extract_table_rows(page)
        new = parse_rows(rows)
        
        if new == 0:
            stall_count += 1
        else:
            stall_count = 0
        
        if iterations % 10 == 0 or new > 0:
            print(f"   [it={iterations:4d} pos={pos:6d}/{current_scroll_h}] visible={len(rows)} new={new} total={len(all_c)} stall={stall_count}")
        
        pos += step
        iterations += 1
        
        if len(all_c) >= 1221:
            print(f"   Alcanzado 1221 candidatos!")
            break
        
        if stall_count >= max_stall and pos > current_scroll_h:
            print(f"   Sin nuevos candidatos y al final del scroll. Deteniendo.")
            break
    
    return len(all_c) - prev_count


async def main():
    print("SERVEL 2025 - DOM Scraper Final (pixel scroll)")
    print("=" * 60)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False, args=["--no-sandbox"])
        ctx = await browser.new_context(
            viewport={"width": 1600, "height": 900}, locale="es-CL"
        )
        page = await ctx.new_page()

        # 1. Cargar
        print("1. Cargando reporte...")
        await page.goto(REPORT_URL, wait_until="domcontentloaded", timeout=60_000)
        try:
            await page.get_by_text("Presidencial").first.wait_for(
                state="visible", timeout=60_000
            )
        except Exception:
            pass
        await page.wait_for_timeout(4000)

        # 2. Ir a Buscar candidatos
        print("2. Tab 'Buscar candidatos'...")
        try:
            await page.get_by_text("Buscar candidatos", exact=True).first.click(
                force=True, timeout=5000
            )
        except Exception as e:
            print(f"   Error: {e}")

        try:
            await page.get_by_text("Diputado").first.wait_for(state="visible", timeout=30_000)
        except Exception:
            pass
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(SHOTS / "dom1_loaded.png"))
        
        # 3. Debug: ver estructura DOM
        print("3. Inspeccionando DOM...")
        row_sample = await extract_table_rows(page)
        print(f"   Filas visibles: {len(row_sample)}")
        if row_sample:
            print(f"   Ejemplo fila 0: {row_sample[0]}")
            print(f"   Ejemplo fila 1: {row_sample[1] if len(row_sample)>1 else 'N/A'}")

        containers = await find_scroll_container(page)
        print(f"   Contenedores: {len(containers)}")
        for c in containers[:3]:
            print(f"   -> {c['tag']} cls='{c['cls'][:40]}' scrollH={c['scrollHeight']} clientH={c['clientHeight']} w={c['width']:.0f}")

        # 4. Guardar screenshot para verificar
        await page.screenshot(path=str(SHOTS / "dom2_inspect.png"))

        # 5. Intentar extraccion con JS avanzado
        print("\n4. Extracción avanzada...")
        
        # Primero extraer las filas visibles iniciales
        rows = await extract_table_rows(page)
        new = parse_rows(rows)
        print(f"   Filas iniciales: {len(rows)}, nuevas: {new}")

        if new == 0:
            print("   Intentando selector alternativo...")
            # Intentar extraer directamente el texto de la tabla
            table_text = await page.evaluate("""() => {
                // Buscar cualquier elemento que tenga el texto "Diputado" y "Senador"
                const result = [];
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null
                );
                let node;
                while (node = walker.nextNode()) {
                    const text = node.textContent.trim();
                    if (text && (text.includes('Diputado') || text.includes('Senador'))) {
                        const parent = node.parentElement;
                        const grandparent = parent ? parent.parentElement : null;
                        if (parent) {
                            result.push({
                                text: text.substring(0, 100),
                                tag: parent.tagName,
                                cls: parent.className.substring(0, 50),
                                role: parent.getAttribute('role') || ''
                            });
                        }
                    }
                }
                return result.slice(0, 20);
            }""")
            print(f"   Textos con Diputado/Senador: {len(table_text)}")
            for t in table_text[:5]:
                print(f"   -> {t}")

        # 6. Scroll loop
        print("\n5. Scrolleando tabla...")
        total_new = await scroll_and_extract(page)
        print(f"   Total extraídos por scroll: {total_new}")

        await page.screenshot(path=str(SHOTS / "dom3_done.png"))
        await page.wait_for_timeout(2000)
        await browser.close()

    # 7. Guardar CSV
    all_c.sort(key=lambda x: (x["eleccion"], x["region"], x["territorio"], x["candidato"]))
    print(f"\nTotal candidatos: {len(all_c)} / 1221 esperados")
    
    if all_c:
        fieldnames = ["eleccion","numero","candidato","region","territorio","lista","partido_candidatura"]
        with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            w.writeheader()
            w.writerows(all_c)
        print(f"CSV: {OUT}")
        print("Muestra:")
        for r in all_c[:5]:
            print(f"  {r}")
    print("\nListo!")


if __name__ == "__main__":
    asyncio.run(main())
