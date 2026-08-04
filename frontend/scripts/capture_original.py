"""Captura screenshots del design ORIGINAL para comparativa."""
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8085"
OUT_DIR = Path(__file__).parent.parent / "audit_screenshots"
OUT_DIR.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 430, "height": 932})
    page.goto(BASE_URL, timeout=20000)
    time.sleep(3)
    out = OUT_DIR / "01_onboarding_original.png"
    page.screenshot(path=str(out), full_page=True)
    print(f"saved: {out.name} ({out.stat().st_size} bytes)")
    browser.close()

print("Done.")
