"""
Genera posturas sinteticas para TODOS los candidatos en las preguntas base.

Util para desarrollo y testing: sin este seed, los candidatos no aparecen
en el ranking cuando el usuario solo ha respondido preguntas generales.

Las posturas se generan de forma determinista usando un hash del apellido
del candidato y el id de la pregunta, para que:
  - El mismo candidato siempre tenga la misma postura en dev (reproducible)
  - Distintos candidatos tengan distintas posturas (variedad en el ranking)
  - Los valores cubran todo el espectro 1..5 (evita que todos rankeen igual)

IMPORTANTE:
  - Solo funciona con DEBUG=True.
  - Marca cada postura con justificacion "[SEED-DEBUG] ..." para distinguirlas.
  - Usa --update para sobreescribir si ya existen posturas seed previas.
  - En produccion, reemplazar con posturas reales via import_posturas --update.

Uso:
    python manage.py seed_posturas_base               # genera sin pisar existentes
    python manage.py seed_posturas_base --update      # sobreescribe todo
    python manage.py seed_posturas_base --dry-run     # cuantas se generarian
    python manage.py seed_posturas_base --tipo-eleccion "Presidencial 2025"  # solo un tipo
"""
from __future__ import annotations

import hashlib
from itertools import islice

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato, OpcionRespuesta, PosturaCandidato, Pregunta, TipoEleccion

JUSTIFICACION_SEED = "[SEED-DEBUG] Postura sintetica generada automaticamente para desarrollo."


def _valor_deterministico(candidato: Candidato, pregunta: Pregunta) -> int:
    """Devuelve un valor 1..5 reproducible basado en candidato + pregunta."""
    seed = f"{candidato.apellido.lower()}-{candidato.nombre.lower()}-{pregunta.id}"
    digest = int(hashlib.md5(seed.encode()).hexdigest(), 16)  # noqa: S324 (dev-only)
    return (digest % 5) + 1  # 1..5 uniforme


class Command(BaseCommand):
    help = "Genera posturas sinteticas en preguntas base para todos los candidatos (DEBUG only)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Cuenta cuantas posturas se generarian sin escribir.",
        )
        parser.add_argument(
            "--update",
            action="store_true",
            help="Sobreescribe posturas seed ya existentes.",
        )
        parser.add_argument(
            "--tipo-eleccion",
            type=str,
            default=None,
            help=(
                "Si se especifica, solo genera posturas para candidatos de ese tipo de eleccion. "
                "Por defecto genera para TODOS los candidatos."
            ),
        )

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError(
                "Este comando solo puede ejecutarse con DEBUG=True. "
                "En produccion carga posturas reales con import_posturas."
            )

        dry = opts["dry_run"]
        update = opts["update"]
        tipo_filtro = opts.get("tipo_eleccion")

        self.stdout.write(self.style.WARNING(
            "[SEED-DEBUG] Generando posturas sinteticas para desarrollo. "
            "NO usar esta base en produccion."
        ))

        # Preguntas base
        try:
            tipo_base = TipoEleccion.objects.get(es_base=True)
        except TipoEleccion.DoesNotExist:
            raise CommandError("No existe un TipoEleccion con es_base=True.")

        preguntas_base = list(Pregunta.objects.filter(tipo_eleccion=tipo_base).order_by("orden"))
        if not preguntas_base:
            raise CommandError("No hay preguntas en el tipo base. Importa preguntas primero.")

        self.stdout.write(f"Preguntas base encontradas: {len(preguntas_base)}")

        # Cache de opciones: pregunta_id -> {valor: OpcionRespuesta}
        opciones_cache: dict[int, dict[int, OpcionRespuesta]] = {}
        for p in preguntas_base:
            opciones_cache[p.id] = {
                op.valor: op
                for op in p.opciones_respuesta.filter(es_no_se=False)
            }

        # Candidatos
        candidatos_qs = Candidato.objects.all()
        if tipo_filtro:
            try:
                tipo_obj = TipoEleccion.objects.get(nombre=tipo_filtro)
            except TipoEleccion.DoesNotExist:
                raise CommandError(f"TipoEleccion '{tipo_filtro}' no encontrado.")
            candidatos_qs = candidatos_qs.filter(tipos_eleccion=tipo_obj)

        candidatos = list(candidatos_qs)
        total_esperado = len(candidatos) * len(preguntas_base)
        self.stdout.write(
            f"Candidatos: {len(candidatos)} | "
            f"Preguntas base: {len(preguntas_base)} | "
            f"Posturas a generar: {total_esperado}"
        )

        if dry:
            # Contar existentes
            existentes = PosturaCandidato.objects.filter(
                pregunta__tipo_eleccion=tipo_base,
                candidato__in=candidatos,
            ).count()
            self.stdout.write(f"Ya existentes: {existentes}")
            self.stdout.write(f"A crear (estimado): {total_esperado - existentes}")
            self.stdout.write(self.style.WARNING("Dry-run: no se escribio nada."))
            return

        # Cache de posturas existentes para evitar N+1
        existentes_set: set[tuple[int, int]] = set(
            PosturaCandidato.objects.filter(
                pregunta__tipo_eleccion=tipo_base,
                candidato__in=candidatos,
            ).values_list("candidato_id", "pregunta_id")
        )

        stats = {"creadas": 0, "actualizadas": 0, "saltadas": 0, "sin_opcion": 0}

        with transaction.atomic():
            bulk_create_batch: list[PosturaCandidato] = []

            for candidato in candidatos:
                for pregunta in preguntas_base:
                    valor = _valor_deterministico(candidato, pregunta)
                    opcion = opciones_cache.get(pregunta.id, {}).get(valor)

                    if opcion is None:
                        # Fallback: tomar cualquier opcion no-no_se
                        opciones_fallback = list(
                            opciones_cache.get(pregunta.id, {}).values()
                        )
                        if not opciones_fallback:
                            stats["sin_opcion"] += 1
                            continue
                        opcion = opciones_fallback[0]

                    existe = (candidato.id, pregunta.id) in existentes_set

                    if existe:
                        if update:
                            PosturaCandidato.objects.filter(
                                candidato=candidato, pregunta=pregunta
                            ).update(
                                opcion_respuesta=opcion,
                                justificacion=JUSTIFICACION_SEED,
                            )
                            stats["actualizadas"] += 1
                        else:
                            stats["saltadas"] += 1
                    else:
                        bulk_create_batch.append(
                            PosturaCandidato(
                                candidato=candidato,
                                pregunta=pregunta,
                                opcion_respuesta=opcion,
                                justificacion=JUSTIFICACION_SEED,
                            )
                        )

                # Flush en batches de 500 para no explotar la memoria
                if len(bulk_create_batch) >= 500:
                    PosturaCandidato.objects.bulk_create(bulk_create_batch)
                    stats["creadas"] += len(bulk_create_batch)
                    bulk_create_batch.clear()
                    self.stdout.write(f"  ... {stats['creadas']} creadas", ending="\r")

            # Flush final
            if bulk_create_batch:
                PosturaCandidato.objects.bulk_create(bulk_create_batch)
                stats["creadas"] += len(bulk_create_batch)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Creadas:     {stats['creadas']}"))
        self.stdout.write(f"Actualizadas: {stats['actualizadas']}")
        self.stdout.write(f"Saltadas:     {stats['saltadas']} (ya existian, usa --update para pisar)")
        if stats["sin_opcion"]:
            self.stdout.write(self.style.WARNING(f"Sin opcion:  {stats['sin_opcion']}"))
        self.stdout.write(self.style.SUCCESS("Seed completado."))
