"""
Importador de candidatos desde CSV.

Compatible con exports de opendata.servel.cl (formato SERVEL) y con un formato
propio simplificado para carga manual desde el admin.

Formato esperado (encabezados requeridos entre parentesis):

    nombre           (requerido)
    apellido         (requerido)
    partido          (requerido)
    tipos_eleccion   (requerido) - lista separada por | ej: "Presidencial|Parlamentaria"
    ciudad           (opcional)
    bio              (opcional)
    propuesta_electoral (opcional)

Uso:
    uv run python manage.py import_candidatos ruta/al/archivo.csv
    uv run python manage.py import_candidatos ruta/al/archivo.csv --dry-run
    uv run python manage.py import_candidatos ruta/al/archivo.csv --delimiter ";"

El importador es **idempotente**: si ya existe un candidato con el mismo
(nombre, apellido, partido), lo actualiza en vez de duplicar.
"""

import csv
import logging
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato, TipoEleccion

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {"nombre", "apellido", "partido", "tipos_eleccion"}
OPTIONAL_COLUMNS = {"ciudad", "bio", "propuesta_electoral", "lista_electoral"}


class Command(BaseCommand):
    help = "Importa candidatos desde un archivo CSV. Idempotente por (nombre, apellido, partido)."

    def add_arguments(self, parser):
        parser.add_argument("archivo", type=str, help="Ruta al archivo CSV")
        parser.add_argument(
            "--delimiter", type=str, default=",",
            help="Delimitador del CSV (default: ',')",
        )
        parser.add_argument(
            "--encoding", type=str, default="utf-8",
            help="Encoding del archivo (default: utf-8)",
        )
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Simula el import sin escribir en la DB.",
        )

    def handle(self, *args, **options):
        path = Path(options["archivo"])
        if not path.is_file():
            raise CommandError(f"Archivo no encontrado: {path}")

        with path.open(encoding=options["encoding"], newline="") as fh:
            reader = csv.DictReader(fh, delimiter=options["delimiter"])
            columns = set(reader.fieldnames or [])
            missing = REQUIRED_COLUMNS - columns
            if missing:
                raise CommandError(
                    f"Columnas requeridas faltantes en el CSV: {sorted(missing)}. "
                    f"Encontradas: {sorted(columns)}"
                )
            rows = list(reader)

        stats = {"creados": 0, "actualizados": 0, "errores": 0, "tipos_eleccion_creados": 0}
        dry_run = options["dry_run"]

        # Django's transaction.atomic con savepoint por fila para que un error
        # no aborte todo el import.
        with transaction.atomic():
            sp = transaction.savepoint()
            for idx, row in enumerate(rows, start=2):  # linea 2 = primera fila de datos
                try:
                    resultado, tipos_creados = self._importar_fila(row, dry_run=dry_run)
                    stats[resultado] += 1
                    stats["tipos_eleccion_creados"] += tipos_creados
                except Exception as exc:
                    self.stderr.write(self.style.ERROR(
                        f"Linea {idx} fallo ({row.get('nombre', '?')} {row.get('apellido', '?')}): {exc}"
                    ))
                    stats["errores"] += 1

            if dry_run:
                transaction.savepoint_rollback(sp)
                self.stdout.write(self.style.WARNING("DRY-RUN: cambios revertidos."))
            else:
                transaction.savepoint_commit(sp)

        self._resumen(stats, total=len(rows), dry_run=dry_run)

    # ---------------------------------------------------------
    def _importar_fila(self, row: dict, dry_run: bool) -> tuple[str, int]:
        """Procesa una fila del CSV.

        Devuelve (resultado, tipos_eleccion_creados_en_esta_fila).
        resultado in {'creados', 'actualizados', 'errores'}.
        """
        nombre = (row.get("nombre") or "").strip()
        apellido = (row.get("apellido") or "").strip()
        partido = (row.get("partido") or "").strip()
        if not (nombre and partido):
            raise ValueError("nombre y partido son obligatorios")

        tipos_raw = (row.get("tipos_eleccion") or "").strip()
        if not tipos_raw:
            raise ValueError("tipos_eleccion no puede estar vacio")

        # Resolver / crear tipos de eleccion referenciados
        tipos_creados_local = 0
        tipos_obj = []
        for nombre_tipo in [t.strip() for t in tipos_raw.split("|") if t.strip()]:
            tipo, created = TipoEleccion.objects.get_or_create(nombre=nombre_tipo)
            if created:
                tipos_creados_local += 1
            tipos_obj.append(tipo)

        defaults = {
            "ciudad": (row.get("ciudad") or "").strip(),
            "bio": (row.get("bio") or "").strip() or None,
            "propuesta_electoral": (row.get("propuesta_electoral") or "").strip(),
            "lista_electoral": (row.get("lista_electoral") or "").strip(),
        }

        candidato, created = Candidato.objects.update_or_create(
            nombre=nombre, apellido=apellido, partido=partido,
            defaults=defaults,
        )
        # M2M debe setearse despues del save
        candidato.tipos_eleccion.set(tipos_obj)

        return ("creados" if created else "actualizados", tipos_creados_local)

    def _resumen(self, stats: dict, total: int, dry_run: bool):
        prefix = "[DRY-RUN] " if dry_run else ""
        self.stdout.write(self.style.SUCCESS(
            f"\n{prefix}Import completo. Total filas: {total}"
        ))
        self.stdout.write(f"  Creados:                  {stats['creados']}")
        self.stdout.write(f"  Actualizados:             {stats['actualizados']}")
        self.stdout.write(f"  Errores:                  {stats['errores']}")
        self.stdout.write(f"  Tipos eleccion creados:   {stats['tipos_eleccion_creados']}")
