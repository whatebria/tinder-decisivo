"""
fetch_senado.py — Correr FUERA del VPN de Walmart.

Fetchea senadores_vigentes.php del Senado de Chile, parsea el XML
y guarda dos archivos:
  - senadores_senado.xml  (XML original)
  - senadores_senado.csv  (datos parseados, listos para enrich_senadores)

Uso:
    python fetch_senado.py
    python fetch_senado.py --out-dir /ruta/alternativa
"""

import argparse
import csv
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Instala requests primero:  pip install requests")

URL = "http://tramitacion.senado.cl/wspublico/senadores_vigentes.php"
FIELDS = [
    "parlid",
    "nombre",
    "apellido_paterno",
    "apellido_materno",
    "region",
    "circunscripcion",
    "partido",
    "fono",
    "email",
    "curriculum_url",
]


def fetch_xml(url: str) -> str:
    print(f"Fetching {url} ...")
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    # El Senado suele responder en ISO-8859-1
    r.encoding = r.apparent_encoding or "iso-8859-1"
    print(f"  Status {r.status_code} | encoding={r.encoding} | {len(r.text)} chars")
    return r.text


def parse_xml(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text.encode("utf-8"))
    rows = []
    for sen in root.findall("senador"):
        def g(tag: str) -> str:
            el = sen.find(tag)
            return (el.text or "").strip() if el is not None else ""

        rows.append({
            "parlid":           g("PARLID"),
            "nombre":           g("PARLNOMBRE"),
            "apellido_paterno": g("PARLAPELLIDOPATERNO"),
            "apellido_materno": g("PARLAPELLIDOMATERNO"),
            "region":           g("REGION"),
            "circunscripcion":  g("CIRCUNSCRIPCION"),
            "partido":          g("PARTIDO"),
            "fono":             g("FONO"),
            "email":            g("EMAIL"),
            "curriculum_url":   g("CURRICULUM"),
        })
    return rows


def save_csv(rows: list[dict], path: Path) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    print(f"  CSV guardado: {path}  ({len(rows)} filas)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", default=".", help="Directorio de salida")
    args = parser.parse_args()

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    xml_text = fetch_xml(URL)

    # Guardar XML original
    xml_path = out / "senadores_senado.xml"
    xml_path.write_text(xml_text, encoding="utf-8")
    print(f"  XML guardado: {xml_path}")

    rows = parse_xml(xml_text)
    print(f"\nSenadores parseados: {len(rows)}")

    save_csv(rows, out / "senadores_senado.csv")

    # Preview
    print("\nMuestra (3 primeros):")
    for r in rows[:3]:
        print(f"  {r['nombre']} {r['apellido_paterno']} | circ={r['circunscripcion']} | email={r['email']}")

    print("\nListo! Copia senadores_senado.csv al directorio dataset/ del proyecto")
    print("y corre:  uv run python manage.py enrich_senadores")


if __name__ == "__main__":
    main()
