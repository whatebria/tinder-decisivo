"""
Enriquece candidatos Senadores 2025 con datos oficiales del Senado.

Lee senadores_senado.csv (generado por scripts/fetch_senado.py) y actualiza
los campos parlid, email, curriculum_url y fono en los Candidato existentes.

Matching: apellido_paterno + nombre (case-insensitive, normalize spaces).
Si hay ambiguedad o no se encuentra, lo reporta pero no falla.

Uso:
    uv run python manage.py enrich_senadores
    uv run python manage.py enrich_senadores --csv ruta/alternativa.csv
    uv run python manage.py enrich_senadores --dry-run
"""
from __future__ import annotations

import csv
import unicodedata
from pathlib import Path

from django.core.management.base import BaseCommand

from core.models import Candidato

DEFAULT_CSV = (
    Path(__file__).resolve().parents[4] / "dataset" / "senadores_senado.csv"
)


def normalize(s: str) -> str:
    """Minusculas, sin tildes, sin espacios extras."""
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_ = nfkd.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_.lower().split())


class Command(BaseCommand):
    help = "Enriquece senadores con parlid, email, curriculum_url y fono desde CSV del Senado."

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv", dest="csv_path", default=str(DEFAULT_CSV),
            help=f"Ruta al CSV (default: {DEFAULT_CSV})",
        )
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Muestra matches sin guardar en DB.",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"])
        if not csv_path.exists():
            self.stderr.write(self.style.ERROR(
                f"CSV no encontrado: {csv_path}\n"
                f"Corre primero:  python scripts/fetch_senado.py --out-dir dataset/"
            ))
            return

        with csv_path.open(encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        self.stdout.write(f"CSV cargado: {len(rows)} senadores")

        # Pre-cargar candidatos senadores con su normalizacion
        senadores_qs = Candidato.objects.filter(
            tipos_eleccion__nombre="Senadores 2025"
        ).distinct()
        # Indice: (norm_apellido, norm_nombre) -> Candidato
        idx: dict[tuple[str, str], Candidato] = {}
        for c in senadores_qs:
            key = (normalize(c.apellido), normalize(c.nombre))
            idx[key] = c
        self.stdout.write(f"Senadores en DB: {len(idx)}")

        stats = {"match": 0, "no_match": 0, "actualizado": 0}
        dry = options["dry_run"]

        for row in rows:
            # Construir apellido completo para buscar (paterno + materno)
            ap = normalize(row.get("apellido_paterno", ""))
            am = normalize(row.get("apellido_materno", ""))
            nom = normalize(row.get("nombre", ""))
            apellido_full = f"{ap} {am}".strip()

            # Intentar match por (apellido_completo, nombre) y luego solo paterno
            cand = idx.get((apellido_full, nom)) or idx.get((ap, nom))

            if cand is None:
                stats["no_match"] += 1
                self.stdout.write(self.style.WARNING(
                    f"  NO MATCH: {row['nombre']} {row['apellido_paterno']} {row['apellido_materno']}"
                ))
                continue

            stats["match"] += 1
            self.stdout.write(
                f"  OK  {cand.nombre} {cand.apellido} "
                f"→ parlid={row['parlid']} email={row['email']}"
            )

            if not dry:
                cand.parlid = row.get("parlid", "").strip()
                cand.email = row.get("email", "").strip()
                cand.curriculum_url = row.get("curriculum_url", "").strip()
                cand.fono = row.get("fono", "").strip()
                cand.save(update_fields=["parlid", "email", "curriculum_url", "fono"])
                stats["actualizado"] += 1

        prefix = "[DRY-RUN] " if dry else ""
        self.stdout.write(self.style.SUCCESS(
            f"\n{prefix}Resultado: {stats['match']} matches | "
            f"{stats['no_match']} sin match | {stats['actualizado']} actualizados en DB"
        ))
