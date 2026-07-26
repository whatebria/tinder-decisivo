"""
Reemplaza todos los escapes \\uXXXX literales en archivos .ts/.tsx por su
caracter real. Necesario porque JSX no interpreta escapes unicode dentro de
JSX text ni de JSX attributes -- los pasa como los 6 caracteres literales
(bug tipico que rompe acentos en la app).

Uso:
    python scripts/fix_unicode_escapes.py [--dry-run] <root_dir>

Ejemplo:
    python scripts/fix_unicode_escapes.py --dry-run frontend/src
    python scripts/fix_unicode_escapes.py frontend/src
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Solo BMP: \uXXXX (4 hex). No tocamos surrogates ni \UXXXXXXXX porque no los
# usamos en este codebase.
ESCAPE_RE = re.compile(r"\\u([0-9a-fA-F]{4})")


def fix_content(text: str) -> tuple[str, int]:
    """Devuelve (texto_nuevo, cantidad_de_reemplazos)."""
    matches = list(ESCAPE_RE.finditer(text))
    if not matches:
        return text, 0

    def repl(m: re.Match[str]) -> str:
        cp = int(m.group(1), 16)
        return chr(cp)

    return ESCAPE_RE.sub(repl, text), len(matches)


def iter_source_files(root: Path):
    for ext in ("*.ts", "*.tsx"):
        yield from root.rglob(ext)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("root", type=Path, help="Directorio raiz a procesar")
    ap.add_argument("--dry-run", action="store_true", help="No escribe, solo reporta")
    args = ap.parse_args()

    if not args.root.is_dir():
        print(f"error: {args.root} no es un directorio", file=sys.stderr)
        return 2

    total_files = 0
    total_replacements = 0
    changed_files: list[Path] = []

    for path in iter_source_files(args.root):
        # Skip node_modules por si acaso
        if "node_modules" in path.parts:
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print(f"skip (no UTF-8): {path}", file=sys.stderr)
            continue

        new_text, count = fix_content(original)
        if count == 0:
            continue

        total_files += 1
        total_replacements += count
        changed_files.append(path)
        rel = path.relative_to(args.root)
        print(f"  {rel}: {count} escapes")

        if not args.dry_run:
            path.write_text(new_text, encoding="utf-8", newline="\n")

    verb = "encontrados" if args.dry_run else "reemplazados"
    print(
        f"\n{total_replacements} escapes {verb} en {total_files} archivos."
    )
    if args.dry_run and total_files:
        print("(dry-run: no se escribio nada. Corre sin --dry-run para aplicar.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
