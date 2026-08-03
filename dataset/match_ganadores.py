"""
match_ganadores.py
Compara los XML vigentes del Congreso con nuestro CSV de candidatos SERVEL 2025
y produce:
  - ganadores_senadores.csv
  - ganadores_diputados.csv
  - candidatos_con_resultado.csv  (todos + columna 'gano')

Uso:
    python match_ganadores.py
"""
from __future__ import annotations

import csv
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

# Forzar stdout UTF-8 en Windows (evita UnicodeEncodeError con caracteres especiales)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DATASET = Path(__file__).parent

SEN_XML   = DATASET / "senadores_senado.xml"
DIP_XML   = DATASET / "diputados.xml"
CANDS_CSV = DATASET / "candidatos_servel_2025.csv"

OUT_SEN   = DATASET / "ganadores_senadores.csv"
OUT_DIP   = DATASET / "ganadores_diputados.csv"
OUT_ALL   = DATASET / "candidatos_con_resultado.csv"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def norm(s: str) -> str:
    """Minúsculas, sin tildes, sin espacios extras."""
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_ = nfkd.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_.lower().split())


def nombre_completo_norm(nombre: str, ap: str, am: str = "") -> str:
    return norm(f"{nombre} {ap} {am}".strip())


# ---------------------------------------------------------------------------
# Parsers XML
# ---------------------------------------------------------------------------

def parse_senadores(path: Path) -> list[dict]:
    root = ET.parse(path).getroot()
    rows = []
    for sen in root.findall("senador"):
        def g(tag):
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


def parse_diputados(path: Path) -> list[dict]:
    # Namespace xmlns="http://tempuri.org/"
    NS = "http://tempuri.org/"
    root = ET.parse(path).getroot()
    rows = []
    for dip in root.findall(f"{{{NS}}}Diputado"):
        def g(tag):
            el = dip.find(f"{{{NS}}}{tag}")
            return (el.text or "").strip() if el is not None else ""
        rows.append({
            "dipid":            g("DIPID"),
            "nombre":           g("Nombre").strip() + (" " + g("Nombre2").strip()).rstrip(),
            "apellido_paterno": g("Apellido_Paterno"),
            "apellido_materno": g("Apellido_Materno"),
            "fecha_nacimiento": g("Fecha_Nacimiento")[:10],  # solo fecha
            "sexo":             dip.find(f"{{{NS}}}Sexo").text.strip()
                                if dip.find(f"{{{NS}}}Sexo") is not None else "",
        })
    return rows


# ---------------------------------------------------------------------------
# Match
# ---------------------------------------------------------------------------

def build_name_index(candidatos: list[dict]) -> dict[str, list[dict]]:
    """Índice: nombre_completo_norm -> lista de candidatos (puede haber homónimos)."""
    idx: dict[str, list[dict]] = defaultdict(list)
    for c in candidatos:
        key = norm(c["candidato"])
        idx[key].append(c)
    return idx


def match_vigentes(vigentes: list[dict], idx: dict, tipo: str) -> list[dict]:
    """
    Para cada parlamentario vigente, busca en el índice de candidatos.
    Retorna lista de ganadores enriquecidos.
    """
    ganadores = []
    no_match = []

    for v in vigentes:
        nombre = v["nombre"].strip()
        ap = v["apellido_paterno"].strip()
        am = v.get("apellido_materno", "").strip()

        # Intentar varias combinaciones de nombre
        claves = [
            nombre_completo_norm(nombre, ap, am),
            nombre_completo_norm(nombre, ap),
            nombre_completo_norm(nombre.split()[0], ap, am),
            nombre_completo_norm(nombre.split()[0], ap),
        ]

        matched = None
        for clave in claves:
            hits = idx.get(clave, [])
            if len(hits) == 1:
                matched = hits[0]
                break
            elif len(hits) > 1:
                # Homónimos: filtrar por tipo eleccion
                filtrados = [h for h in hits if tipo.lower() in h["eleccion"].lower()]
                if filtrados:
                    matched = filtrados[0]
                    break

        if matched:
            ganadores.append({
                **matched,
                "parlid":         v.get("parlid", v.get("dipid", "")),
                "email":          v.get("email", ""),
                "curriculum_url": v.get("curriculum_url", ""),
                "fono":           v.get("fono", ""),
                "circunscripcion": v.get("circunscripcion", ""),
                "partido_congreso": v.get("partido", ""),
            })
        else:
            no_match.append(v)

    print(f"\n  [{tipo}] Vigentes: {len(vigentes)} | Match: {len(ganadores)} | Sin match: {len(no_match)}")
    if no_match:
        print(f"  Sin match ({tipo}):")
        for v in no_match:
            print(f"    - {v['nombre']} {v['apellido_paterno']} {v.get('apellido_materno','')}")

    return ganadores


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=== Match Ganadores 2025 ===\n")

    # Cargar candidatos
    candidatos = list(csv.DictReader(CANDS_CSV.open(encoding="utf-8-sig")))
    print(f"Candidatos SERVEL: {len(candidatos)}")
    idx = build_name_index(candidatos)

    # Parsear XMLs
    senadores = parse_senadores(SEN_XML)
    diputados = parse_diputados(DIP_XML)
    print(f"Senadores vigentes: {len(senadores)}")
    print(f"Diputados vigentes: {len(diputados)}")

    # Match
    gan_sen = match_vigentes(senadores, idx, "Senador")
    gan_dip = match_vigentes(diputados, idx, "Diputado")
    ganadores_all = {norm(g["candidato"]) for g in gan_sen + gan_dip}

    # Guardar ganadores senadores
    COLS_SEN = [
        "eleccion","nro_lista","candidato","region","territorio","lista","partido",
        "parlid","email","curriculum_url","fono","circunscripcion","partido_congreso",
    ]
    with OUT_SEN.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS_SEN, extrasaction="ignore")
        w.writeheader()
        w.writerows(gan_sen)
    print(f"\nGanadores senadores -> {OUT_SEN.name} ({len(gan_sen)} filas)")

    # Guardar ganadores diputados
    COLS_DIP = [
        "eleccion","nro_lista","candidato","region","territorio","lista","partido",
        "parlid",
    ]
    with OUT_DIP.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS_DIP, extrasaction="ignore")
        w.writeheader()
        w.writerows(gan_dip)
    print(f"Ganadores diputados -> {OUT_DIP.name} ({len(gan_dip)} filas)")

    # CSV completo con columna 'gano'
    COLS_ALL = [
        "eleccion","nro_lista","candidato","region","territorio","lista","partido","gano",
    ]
    with OUT_ALL.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS_ALL, extrasaction="ignore")
        w.writeheader()
        for c in candidatos:
            w.writerow({**c, "gano": "SI" if norm(c["candidato"]) in ganadores_all else "NO"})
    print(f"Todos los candidatos -> {OUT_ALL.name} ({len(candidatos)} filas)")

    # Resumen
    total_gan = len(gan_sen) + len(gan_dip)
    print(f"\n{'='*50}")
    print(f"  GANADORES TOTALES : {total_gan} / {len(candidatos)} candidatos")
    print(f"  Senadores         : {len(gan_sen)}")
    print(f"  Diputados         : {len(gan_dip)}")
    print(f"  Sin resultado     : {len(candidatos) - total_gan}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
