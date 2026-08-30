"""Adapta candidatos_servel_2025.csv al formato del importer del backend.

Input:  candidatos_servel_2025.csv  (columnas: eleccion, nro_lista, candidato,
        region, territorio, lista, partido)
Output: candidatos_parlamentaria_2025.csv  (columnas: nombre, apellido, partido,
        ciudad, bio, propuesta_electoral, tipos_eleccion, lista_electoral,
        territorio, region, eleccion, nro_lista)

**tipos_eleccion**: se setea SEGUN el campo `eleccion` del CSV original:
    - eleccion="Diputado"  -> tipos_eleccion="Diputados 2025"
    - eleccion="Senador"   -> tipos_eleccion="Senadores 2025"
Esto alinea los candidatos con los cuestionarios respectivos
(preguntas_diputados_2025.csv y preguntas_senadores_2025.csv).

Reglas de split nombre/apellido (para 'candidato'):
- 2 tokens:   nombre=[0], apellido=[1]
- 3 tokens:   nombre=[0], apellido=[1:]  (patron chileno tipico)
- 4+ tokens:  nombre=[0:2], apellido=[2:]  (2 nombres + apellidos)
- Particulas 'de', 'del', 'de la', 'van', 'von', 'y' que aparezcan como token
  medial se pegan al apellido siguiente.

Se agrega el flag `revision_apellido` cuando el split es dudoso.
"""
from __future__ import annotations

import csv
from pathlib import Path

DATASET = Path(r"C:\Users\vn5ai5n\Documents\puppy_workspace\servel_extract\servel-main\dataset")
IN = DATASET / "candidatos_servel_2025.csv"
OUT = DATASET / "candidatos_parlamentaria_2025.csv"

PARTICULAS = {"de", "del", "la", "van", "von", "y", "san"}


def split_nombre(full: str) -> tuple[str, str, bool]:
    """Retorna (nombre, apellido, revision_manual_recomendada)."""
    tokens = full.strip().split()
    if not tokens:
        return "", "", True

    # Detectar particulas en el medio (potencial ambiguedad)
    tiene_particulas = any(t.lower() in PARTICULAS for t in tokens[1:-1])

    n = len(tokens)
    if n == 1:
        return tokens[0], "", True
    if n == 2:
        return tokens[0], tokens[1], False
    if n == 3:
        # 1 nombre + 2 apellidos (patron chileno)
        return tokens[0], " ".join(tokens[1:]), tiene_particulas
    # 4+
    # Si el token[2] es particula, ponerlo con el apellido (empezar apellido en 2)
    # Default: 2 nombres + resto apellido
    return " ".join(tokens[:2]), " ".join(tokens[2:]), tiene_particulas or n >= 5


TIPO_ELECCION_POR_ELECCION = {
    "Diputado": "Diputados 2025",
    "Senador": "Senadores 2025",
}


def main() -> None:
    with IN.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    out_rows = []
    revisiones = 0
    tipos_no_mapeados = set()
    for r in rows:
        nombre, apellido, revisar = split_nombre(r["candidato"])
        if revisar:
            revisiones += 1
        eleccion = r["eleccion"].strip()
        tipo_eleccion = TIPO_ELECCION_POR_ELECCION.get(eleccion)
        if tipo_eleccion is None:
            tipos_no_mapeados.add(eleccion)
            continue  # Skip filas con eleccion desconocida
        out_rows.append(
            {
                "nombre": nombre,
                "apellido": apellido,
                "partido": r["partido"].strip(),
                "ciudad": "",
                "bio": "",
                "propuesta_electoral": "",
                "tipos_eleccion": tipo_eleccion,
                # Metadata extra (el importer las ignora, quedan como referencia)
                "lista_electoral": r["lista"].strip(),
                "territorio": r["territorio"].strip(),
                "region": r["region"].strip(),
                "eleccion": eleccion,
                "nro_lista": r["nro_lista"].strip(),
                "revision_apellido": "1" if revisar else "",
            }
        )

    fieldnames = [
        "nombre",
        "apellido",
        "partido",
        "ciudad",
        "bio",
        "propuesta_electoral",
        "tipos_eleccion",
        "lista_electoral",
        "territorio",
        "region",
        "eleccion",
        "nro_lista",
        "revision_apellido",
    ]
    with OUT.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(out_rows)

    print(f"Leidas   : {len(rows)}")
    print(f"Escritas : {len(out_rows)}")
    if tipos_no_mapeados:
        print(f"ADVERTENCIA - elecciones no mapeadas (skip): {tipos_no_mapeados}")
    print(f"Con flag revision_apellido: {revisiones} ({revisiones * 100 / len(out_rows):.1f}%)")
    print(f"Output   : {OUT}")

    # Split por tipo_eleccion
    from collections import Counter
    por_tipo = Counter(r["tipos_eleccion"] for r in out_rows)
    print(f"\nDistribucion por tipos_eleccion:")
    for tipo, n in sorted(por_tipo.items()):
        print(f"  {tipo}: {n:,}")

    # Chequeo de duplicados por (nombre, apellido, partido)
    keys = Counter((r["nombre"], r["apellido"], r["partido"]) for r in out_rows)
    dupes = [(k, c) for k, c in keys.items() if c > 1]
    print(f"\nDuplicados por (nombre, apellido, partido): {len(dupes)}")
    for k, c in dupes[:10]:
        print(f"  x{c}  {k}")

    # Sample
    print(f"\nPrimeras 3 filas:")
    for r in out_rows[:3]:
        print(f"  {dict(r)}")


if __name__ == "__main__":
    main()
