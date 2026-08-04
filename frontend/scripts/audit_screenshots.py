"""
Captura screenshots de las pantallas principales tras el rebrand.
Genera comparativas para el reporte de auditoría visual.
"""
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8085"
OUT_DIR = Path(__file__).parent.parent / "audit_screenshots"
OUT_DIR.mkdir(exist_ok=True)

# Pantallas a capturar (ruta hash + nombre)
SCREENS = [
    ("", "01_home"),
    ("/onboarding", "02_onboarding"),
    ("/login", "03_login"),
    ("/register", "04_register"),
]

def take_screenshot(page, name: str, path: str) -> None:
    try:
        page.goto(f"{BASE_URL}{path}", timeout=15000)
        time.sleep(2)
        out = OUT_DIR / f"{name}_rebrand.png"
        page.screenshot(path=str(out), full_page=True)
        print(f"  [OK] {name} -> {out.name}")
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")

def main():
    print(f"Capturas en: {OUT_DIR}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 430, "height": 932})

        # Pantallas principales
        for path, name in SCREENS:
            take_screenshot(page, name, path)

        # Home con ancho diferente (tablet)
        try:
            page2 = browser.new_page(viewport={"width": 768, "height": 1024})
            page2.goto(BASE_URL, timeout=15000)
            time.sleep(2)
            page2.screenshot(path=str(OUT_DIR / "01_home_tablet_rebrand.png"), full_page=True)
            print("  [OK] home_tablet")
            page2.close()
        except Exception as e:
            print(f"  [FAIL] tablet: {e}")

        browser.close()
    print("Capturas terminadas.")

if __name__ == "__main__":
    main()
