"""
Importa PosturaCandidato desde un CSV con posturas verificables.

Formato esperado (formato largo, 1 fila = 1 postura):
    candidato_apellido,pregunta_orden,valor,justificacion,fuente_url

- candidato_apellido: apellido exacto (matchea case-insensitive, unico por eleccion)
- pregunta_orden:     orden de la pregunta en el cuestionario (1..N)
- valor:              1..5 (1=Muy en desacuerdo, 5=Muy de acuerdo)
- justificacion:      texto que respalde la postura (obligatorio en produccion, min 20 chars)
- fuente_url:         URL a declaracion publica, entrevista, ley, plataforma (obligatorio en produccion)

Filas con celdas vacias se saltan (permite CSV parcial mientras se investiga).

MODO DEBUG (settings.DEBUG=True):
  Las validaciones de justificacion y fuente_url se relajan automaticamente.
  Los CSV pueden omitir esas columnas o dejarlas vacias. Util para cargar
  datos de prueba sin tener que inventar fuentes.
  NUNCA usar datos cargados en debug en una base de produccion.

Uso:
    python manage.py import_posturas fixtures/posturas_2025.csv
    python manage.py import_posturas fixtures/posturas_2025.csv --dry-run
    python manage.py import_posturas fixtures/posturas_2025.csv --update  # sobreescribe
"""
from __future__ import annotations

import csv
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato, OpcionRespuesta, PosturaCandidato, Pregunta

REQUIRED_COLUMNS_PROD = {
    "candidato_apellido",
    "pregunta_orden",
    "valor",
    "justificacion",
    "fuente_url",
}
# En debug solo los campos de datos son obligatorios; justificacion y fuente son opcionales.
REQUIRED_COLUMNS_DEBUG = {
    "candidato_apellido",
    "pregunta_orden",
    "valor",
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
        parser.add_argument(
            "--tipo-eleccion",
            type=str,
            default=None,
            help=(
                "Nombre del TipoEleccion para filtrar preguntas al mapear por 'orden'. "
                "Obligatorio cuando existen preguntas de multiples tipos que comparten "
                "valores de 'orden' (evita que las posturas caigan en la pregunta equivocada)."
            ),
        )

    def handle(self, *args, **opts):
        path = Path(opts["csv_path"])
        if not path.exists():
            raise CommandError(f"No existe: {path}")

        dry = opts["dry_run"]
        update = opts["update"]

        is_debug = settings.DEBUG
        required_cols = REQUIRED_COLUMNS_DEBUG if is_debug else REQUIRED_COLUMNS_PROD

        if is_debug:
            self.stdout.write(self.style.WARNING(
                "[DEBUG] Modo debug activo: justificacion y fuente_url son opcionales. "
                "NO uses esta base en produccion."
            ))

        with path.open(newline="", encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            missing = required_cols - set(reader.fieldnames or [])
            if missing:
                raise CommandError(f"Faltan columnas: {sorted(missing)}")
            rows = list(reader)

        # Cache de lookups
        # Dos mapas para manejar apellidos duplicados sin perder posturas:
        #   * by_apellido_nombre: (apellido_lower, nombre_lower) -> Candidato
        #     (desambiguacion cuando el CSV trae la columna opcional 'candidato_nombre')
        #   * by_apellido_unico:  apellido_lower -> Candidato SOLO si es unico
        #     (fallback para CSVs viejos sin nombre; falla explicito si hay ambiguedad)
        candidatos_all = list(Candidato.objects.all())
        by_apellido_nombre: dict[tuple[str, str], Candidato] = {}
        apellido_counts: dict[str, int] = {}
        for c in candidatos_all:
            ap = c.apellido.strip().lower()
            no = c.nombre.strip().lower()
            by_apellido_nombre[(ap, no)] = c
            apellido_counts[ap] = apellido_counts.get(ap, 0) + 1
        by_apellido_unico: dict[str, Candidato] = {
            c.apellido.strip().lower(): c
            for c in candidatos_all
            if apellido_counts[c.apellido.strip().lower()] == 1
        }
        ambiguos = {ap for ap, n in apellido_counts.items() if n > 1}
        preguntas_qs = Pregunta.objects.all()
        tipo_nombre = opts.get("tipo_eleccion")
        if tipo_nombre:
            preguntas_qs = preguntas_qs.filter(tipo_eleccion__nombre=tipo_nombre)
            if not preguntas_qs.exists():
                raise CommandError(
                    f"No hay preguntas para tipo_eleccion={tipo_nombre!r}. "
                    "Importa primero las preguntas de ese tipo."
                )
        preguntas_by_orden = {p.orden: p for p in preguntas_qs}
        csv_has_nombre = "candidato_nombre" in (reader.fieldnames or [])

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
                        row,
                        by_apellido_nombre,
                        by_apellido_unico,
                        ambiguos,
                        csv_has_nombre,
                        preguntas_by_orden,
                        stats,
                        update,
                        is_debug=is_debug,
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

    def _procesar_fila(
        self,
        row,
        by_apellido_nombre,
        by_apellido_unico,
        ambiguos,
        csv_has_nombre,
        preguntas_map,
        stats,
        update,
        is_debug: bool = False,
    ):
        apellido = row["candidato_apellido"].strip().lower()
        nombre_csv = (row.get("candidato_nombre") or "").strip().lower() if csv_has_nombre else ""

        if nombre_csv:
            candidato = by_apellido_nombre.get((apellido, nombre_csv))
            if not candidato:
                raise ValueError(
                    f"candidato '{nombre_csv} {apellido}' no existe (match por nombre+apellido)"
                )
        else:
            if apellido in ambiguos:
                raise ValueError(
                    f"apellido '{apellido}' es ambiguo (hay varios candidatos); "
                    "agrega la columna 'candidato_nombre' al CSV para desambiguar"
                )
            candidato = by_apellido_unico.get(apellido)
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
        if not is_debug and len(justificacion) < MIN_JUSTIFICACION:
            raise ValueError(
                f"justificacion muy corta ({len(justificacion)} chars, min {MIN_JUSTIFICACION})"
            )

        fuente_url = (row.get("fuente_url") or "").strip()
        if not is_debug and not fuente_url.startswith(("http://", "https://")):
            raise ValueError(f"fuente_url invalida: {fuente_url!r}")

        # Busca la opcion con ese valor para esta pregunta
        opcion = OpcionRespuesta.objects.filter(
            pregunta=pregunta, valor=valor, es_no_se=False
        ).first()
        if not opcion:
            raise ValueError(f"pregunta orden={orden} no tiene opcion con valor={valor}")

        # Construir justificacion final segun modo
        if is_debug:
            justificacion_final = justificacion or "[DEBUG - sin justificacion]"
            if fuente_url:
                justificacion_final += f"\n\nFuente: {fuente_url}"
        else:
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
