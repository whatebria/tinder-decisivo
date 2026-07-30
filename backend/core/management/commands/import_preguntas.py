"""
Importador de preguntas del cuestionario desde CSV.

Formato:
    texto            (requerido)
    tipo_eleccion    (requerido) - nombre del TipoEleccion
    eje_tematico     (requerido) - ver EJES_CHOICES en Pregunta
    orden            (opcional, default 0)

Al importar cada pregunta, se auto-crean las 6 opciones de respuesta estandar:
    - Muy en desacuerdo (1)
    - En desacuerdo (2)
    - Neutral (3)
    - De acuerdo (4)
    - Muy de acuerdo (5)
    - No se / Prefiero no responder (0, es_no_se=True)

Uso:
    uv run python manage.py import_preguntas ruta/al/archivo.csv
"""

import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Eje, OpcionRespuesta, Pregunta, TipoEleccion

REQUIRED_COLUMNS = {"texto", "tipo_eleccion", "eje_tematico"}

OPCIONES_ESTANDAR = [
    ("Muy en desacuerdo", 1, False),
    ("En desacuerdo", 2, False),
    ("Neutral", 3, False),
    ("De acuerdo", 4, False),
    ("Muy de acuerdo", 5, False),
    ("No se / Prefiero no responder", 0, True),
]

EJES_VALIDOS_STATIC = {choice[0] for choice in Pregunta.EJES_CHOICES}


def ejes_validos() -> set[str]:
    """Union entre choices hardcoded del modelo y el catalogo dinamico Eje."""
    return EJES_VALIDOS_STATIC | set(Eje.objects.values_list("codigo", flat=True))


class Command(BaseCommand):
    help = "Importa preguntas y auto-genera sus opciones de respuesta estandar."

    def add_arguments(self, parser):
        parser.add_argument("archivo", type=str)
        parser.add_argument("--delimiter", type=str, default=",")
        parser.add_argument("--encoding", type=str, default="utf-8")
        parser.add_argument("--dry-run", action="store_true")

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
                    f"Columnas requeridas faltantes: {sorted(missing)}. "
                    f"Encontradas: {sorted(columns)}"
                )
            rows = list(reader)

        stats = {"creadas": 0, "actualizadas": 0, "opciones_creadas": 0, "errores": 0}

        with transaction.atomic():
            sp = transaction.savepoint()
            for idx, row in enumerate(rows, start=2):
                try:
                    resultado, n_opciones = self._importar_pregunta(row)
                    stats[resultado] += 1
                    stats["opciones_creadas"] += n_opciones
                except Exception as exc:
                    self.stderr.write(self.style.ERROR(
                        f"Linea {idx} ('{row.get('texto', '?')[:40]}...'): {exc}"
                    ))
                    stats["errores"] += 1

            if options["dry_run"]:
                transaction.savepoint_rollback(sp)
                self.stdout.write(self.style.WARNING("DRY-RUN: cambios revertidos."))
            else:
                transaction.savepoint_commit(sp)

        self._resumen(stats, len(rows), options["dry_run"])

    def _importar_pregunta(self, row: dict) -> tuple[str, int]:
        texto = (row.get("texto") or "").strip()
        tipo_nombre = (row.get("tipo_eleccion") or "").strip()
        eje = (row.get("eje_tematico") or "").strip().upper()
        orden = int((row.get("orden") or "0").strip())

        if not (texto and tipo_nombre and eje):
            raise ValueError("texto, tipo_eleccion y eje_tematico son obligatorios")
        validos = ejes_validos()
        if eje not in validos:
            raise ValueError(f"eje_tematico invalido: {eje}. Validos: {sorted(validos)}")

        tipo, _ = TipoEleccion.objects.get_or_create(nombre=tipo_nombre)

        pregunta, created = Pregunta.objects.update_or_create(
            texto=texto, tipo_eleccion=tipo,
            defaults={"eje_tematico": eje, "orden": orden},
        )

        # Crear opciones estandar si no existen (idempotente)
        opciones_creadas = 0
        for texto_op, valor, es_no_se in OPCIONES_ESTANDAR:
            _, op_created = OpcionRespuesta.objects.get_or_create(
                pregunta=pregunta, texto=texto_op,
                defaults={"valor": valor, "es_no_se": es_no_se},
            )
            if op_created:
                opciones_creadas += 1

        return ("creadas" if created else "actualizadas", opciones_creadas)

    def _resumen(self, stats: dict, total: int, dry_run: bool):
        prefix = "[DRY-RUN] " if dry_run else ""
        self.stdout.write(self.style.SUCCESS(
            f"\n{prefix}Import completo. Total filas: {total}"
        ))
        self.stdout.write(f"  Preguntas creadas:     {stats['creadas']}")
        self.stdout.write(f"  Preguntas actualizadas: {stats['actualizadas']}")
        self.stdout.write(f"  Opciones auto-creadas:  {stats['opciones_creadas']}")
        self.stdout.write(f"  Errores:                {stats['errores']}")
