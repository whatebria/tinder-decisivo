"""
Importa PosturaCandidato desde un CSV con posturas verificables.

Formato esperado (formato largo, 1 fila = 1 postura):
    candidato_apellido,pregunta_orden,valor,justificacion,fuente_url

- candidato_apellido: apellido exacto (matchea case-insensitive, unico por eleccion)
- pregunta_orden:     orden de la pregunta en el cuestionario (1..N)
- valor:              1..5 (1=Muy en desacuerdo, 5=Muy de acuerdo)
- justificacion:      texto que respalde la postura (obligatorio, min 20 chars)
- fuente_url:         URL a declaracion publica, entrevista, ley, plataforma (obligatorio)

Filas con celdas vacias se saltan (permite CSV parcial mientras se investiga).

Uso:
    python manage.py import_posturas fixtures/posturas_2025.csv
    python manage.py import_posturas fixtures/posturas_2025.csv --dry-run
    python manage.py import_posturas fixtures/posturas_2025.csv --update  # sobreescribe
"""
from __future__ import annotations

import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato, OpcionRespuesta, PosturaCandidato, Pregunta

REQUIRED_COLUMNS = {
    "candidato_apellido",
    "pregunta_orden",
    "valor",
    "justificacion",
    "fuente_url",
}
MIN_JUSTIFICACION = 20


class Command(BaseCommand):
    help = "Importa posturas de candidatos desde CSV verificable (justificacion + fuente_url obligatorias)."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str, help="Ruta al CSV de posturas.")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Valida sin escribir en DB.",
        )
        parser.add_argument(
            "--update",
            action="store_true",
            help="Si la postura ya existe, la sobreescribe. Si no, ignora duplicados.",
        )

    def handle(self, *args, **opts):
        path = Path(opts["csv_path"])
        if not path.exists():
            raise CommandError(f"No existe: {path}")

        dry = opts["dry_run"]
        update = opts["update"]

        with path.open(newline="", encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
            if missing:
                raise CommandError(f"Faltan columnas: {sorted(missing)}")
            rows = list(reader)

        # Cache de lookups
        candidatos_by_apellido = {
            c.apellido.strip().lower(): c for c in Candidato.objects.all()
        }
        preguntas_by_orden = {p.orden: p for p in Pregunta.objects.all()}

        stats = {"creadas": 0, "actualizadas": 0, "saltadas_vacias": 0, "duplicadas": 0, "errores": 0}
        errores_detalle = []

        with transaction.atomic():
            for i, row in enumerate(rows, start=2):  # linea 2 = primera de datos
                # Skip filas con celdas obligatorias vacias (CSV parcial)
                if not row.get("valor") or not row.get("candidato_apellido"):
                    stats["saltadas_vacias"] += 1
                    continue

                try:
                    self._procesar_fila(
                        row, candidatos_by_apellido, preguntas_by_orden, stats, update
                    )
                except ValueError as e:
                    stats["errores"] += 1
                    errores_detalle.append(f"  linea {i}: {e}")

            if dry or stats["errores"]:
                transaction.set_rollback(True)

        # Reporte
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Creadas:       {stats['creadas']}"))
        self.stdout.write(f"Actualizadas:  {stats['actualizadas']}")
        self.stdout.write(f"Duplicadas:    {stats['duplicadas']} (usa --update para sobreescribir)")
        self.stdout.write(f"Saltadas:      {stats['saltadas_vacias']} (celdas vacias)")
        if stats["errores"]:
            self.stdout.write(self.style.ERROR(f"Errores:       {stats['errores']}"))
            for e in errores_detalle[:20]:
                self.stdout.write(self.style.ERROR(e))
            if len(errores_detalle) > 20:
                self.stdout.write(self.style.ERROR(f"  ... y {len(errores_detalle)-20} mas"))
        if dry:
            self.stdout.write(self.style.WARNING("Dry-run: no se guardo nada."))
        elif stats["errores"]:
            self.stdout.write(self.style.ERROR("Rollback: hubo errores, no se guardo nada."))

    def _procesar_fila(self, row, candidatos_map, preguntas_map, stats, update):
        apellido = row["candidato_apellido"].strip().lower()
        candidato = candidatos_map.get(apellido)
        if not candidato:
            raise ValueError(f"candidato '{apellido}' no existe")

        try:
            orden = int(row["pregunta_orden"])
        except (TypeError, ValueError):
            raise ValueError(f"pregunta_orden no es entero: {row['pregunta_orden']!r}")
        pregunta = preguntas_map.get(orden)
        if not pregunta:
            raise ValueError(f"pregunta orden={orden} no existe")

        try:
            valor = int(row["valor"])
        except (TypeError, ValueError):
            raise ValueError(f"valor no es entero: {row['valor']!r}")
        if valor < 1 or valor > 5:
            raise ValueError(f"valor debe estar en 1..5, no {valor}")

        justificacion = (row.get("justificacion") or "").strip()
        if len(justificacion) < MIN_JUSTIFICACION:
            raise ValueError(
                f"justificacion muy corta ({len(justificacion)} chars, min {MIN_JUSTIFICACION})"
            )

        fuente_url = (row.get("fuente_url") or "").strip()
        if not fuente_url.startswith(("http://", "https://")):
            raise ValueError(f"fuente_url invalida: {fuente_url!r}")

        # Busca la opcion con ese valor para esta pregunta
        opcion = OpcionRespuesta.objects.filter(
            pregunta=pregunta, valor=valor, es_no_se=False
        ).first()
        if not opcion:
            raise ValueError(f"pregunta orden={orden} no tiene opcion con valor={valor}")

        # Guardamos la fuente como parte de la justificacion (el modelo no tiene campo aparte)
        justificacion_final = f"{justificacion}\n\nFuente: {fuente_url}"

        existente = PosturaCandidato.objects.filter(
            candidato=candidato, pregunta=pregunta
        ).first()

        if existente:
            if not update:
                stats["duplicadas"] += 1
                return
            existente.opcion_respuesta = opcion
            existente.justificacion = justificacion_final
            existente.save()
            stats["actualizadas"] += 1
        else:
            PosturaCandidato.objects.create(
                candidato=candidato,
                pregunta=pregunta,
                opcion_respuesta=opcion,
                justificacion=justificacion_final,
            )
            stats["creadas"] += 1
