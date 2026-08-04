"""
PowerBI Inspector - v1
Diagnostico de la estructura real del DOM incluyendo iframes.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL = (
    "https://app.powerbi.com/view"
    "?r=eyJrIjoiNGM3NzczMTMtZTE4OS00ZmE4LWI4OTQtNjRjNzQwM2QzNWU0IiwidCI6"
    "IjI0ODMxZWJlLWQyNmQtNGQzMC05ZmE4LWVmM2MwMjQzYjMyZSIsImMiOjR9"
)

SHOTS = Path("screenshots")
SHOTS.mkdir(exist_ok=True)


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 1600, "height": 900})
        page = await ctx.new_page()

        # Esperar carga
        print("Cargando...")
        await page.goto(URL, wait_until="domcontentloaded", timeout=60_000)

        # Esperar que el tab Presidencial sea visible
        await page.get_by_text("Presidencial").first.wait_for(
            state="visible", timeout=60_000
        )
        await page.wait_for_timeout(2000)

        # Screenshot inmediato
        await page.screenshot(path=str(SHOTS / "A_loaded.png"), full_page=False)
        print("[shot] A_loaded.png")

        # Detectar todos los frames
        print(f"\nFrames: {len(page.frames)}")
        for i, f in enumerate(page.frames):
            print(f"  [{i}] name='{f.name}' url={f.url[:100]}")

        # Buscar "Buscar candidatos" en TODOS los frames
        print("\nBuscando 'Buscar candidatos' en todos los frames...")
        for i, frame in enumerate(page.frames):
            try:
                # JavaScript con innerText
                result = await frame.evaluate("""() => {
                    const candidates = [];
                    const all = document.querySelectorAll('*');
                    for (const el of all) {
                        const t = (el.innerText || el.textContent || '').trim();
                        if (t === 'Buscar candidatos') {
                            const rect = el.getBoundingClientRect();
                            const style = window.getComputedStyle(el);
                            candidates.push({
                                tag: el.tagName,
                                classes: el.className,
                                rect: {x: rect.x, y: rect.y, w: rect.width, h: rect.height},
                                display: style.display,
                                visibility: style.visibility,
                                overflow: style.overflow,
                                id: el.id || '',
                                aria: el.getAttribute('aria-label') || ''
                            });
                        }
                    }
                    return candidates;
                }""")
                if result:
                    print(f"  Frame [{i}] - encontrados {len(result)} elementos:")
                    for r in result:
                        print(f"    {r}")
            except Exception as e:
                print(f"  Frame [{i}] error: {e}")

        # Buscar por aria-label en todos los frames
        print("\nBuscando aria-label='Buscar candidatos'...")
        for i, frame in enumerate(page.frames):
            try:
                result = await frame.evaluate("""() => {
                    const el = document.querySelector('[aria-label=\"Buscar candidatos\"]');
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        classes: el.className,
                        rect: {x: rect.x, y: rect.y, w: rect.width, h: rect.height},
                        display: style.display,
                        visibility: style.visibility,
                        parentTag: el.parentElement?.tagName,
                        parentClass: el.parentElement?.className
                    };
                }""")
                if result:
                    print(f"  Frame [{i}]: {result}")
            except Exception as e:
                print(f"  Frame [{i}] error: {e}")

        # Listar TODOS los sectionItem buttons
        print("\nListando todos los section items en todos los frames...")
        for i, frame in enumerate(page.frames):
            try:
                result = await frame.evaluate("""() => {
                    const items = document.querySelectorAll(
                        'button.sectionItem, [class*=\"sectionItem\"], [role=\"tab\"]'
                    );
                    return [...items].map(el => {
                        const rect = el.getBoundingClientRect();
                        const style = window.getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            text: (el.innerText || el.textContent || '').trim().slice(0,30),
                            aria: el.getAttribute('aria-label') || '',
                            rect: {x: rect.x.toFixed(0), y: rect.y.toFixed(0),
                                   w: rect.width.toFixed(0), h: rect.height.toFixed(0)},
                            display: style.display,
                            visibility: style.visibility
                        };
                    });
                }""")
                if result:
                    print(f"  Frame [{i}] - {len(result)} sectionItems:")
                    for r in result:
                        print(f"    {r}")
            except Exception as e:
                print(f"  Frame [{i}] error: {e}")

        # Buscar el contenedor de navegacion del reporte
        print("\nContenedor de navegacion (header con tabs)...")
        for i, frame in enumerate(page.frames):
            try:
                result = await frame.evaluate("""() => {
                    // Buscar cualquier elemento con 4 hijos que tengan textos de tabs
                    const tabTexts = ['Presidencial', 'Senatorial', 'Diputados', 'Buscar candidatos'];
                    const all = document.querySelectorAll('*');
                    const results = [];
                    for (const el of all) {
                        const texts = [...el.querySelectorAll('*')]
                            .map(c => (c.innerText || c.textContent || '').trim())
                            .filter(t => tabTexts.includes(t));
                        if (texts.length >= 3) {
                            const rect = el.getBoundingClientRect();
                            results.push({
                                tag: el.tagName,
                                classes: el.className.slice(0, 60),
                                tabsFound: texts,
                                rect: {x: rect.x.toFixed(0), y: rect.y.toFixed(0),
                                       w: rect.width.toFixed(0), h: rect.height.toFixed(0)}
                            });
                        }
                    }
                    return results.slice(0, 5);
                }""")
                if result:
                    print(f"  Frame [{i}] nav containers:")
                    for r in result:
                        print(f"    {r}")
            except Exception as e:
                print(f"  Frame [{i}] error: {e}")

        print("\nListo. Cerrando en 3s...")
        await page.wait_for_timeout(3000)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
