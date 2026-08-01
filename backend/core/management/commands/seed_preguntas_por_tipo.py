"""
Seed idempotente de PREGUNTAS ESPECIFICAS por tipo de eleccion.

Crea 5 preguntas para cada uno de los 2 tipos electorales:
- Presidencial 2025
- Diputados 2025

Y genera posturas para todos los candidatos ya sembrados usando el mapping
partido -> posturas del modulo _preguntas_por_tipo.

Uso:
    uv run python manage.py seed_preguntas_por_tipo
    uv run python manage.py seed_preguntas_por_tipo --reset

Requiere: seed_presidenciales_2025, seed_diputados_2025.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)

from ._preguntas_por_tipo import (
    POSTURAS_ESPECIFICAS,
    PREGUNTAS_DIP_2025,
    PREGUNTAS_PRESI_2025,
)

# Mapping: (nombre_tipo_eleccion, preguntas, clave_postura_en_partido)
SETS = [
    ("Presidencial 2025", PREGUNTAS_PRESI_2025, "presi"),
    ("Diputados 2025",    PREGUNTAS_DIP_2025,   "dip"),
]

# Opciones 1-5 (mismas que el resto del cuestionario).
OPCIONES = [
    ("Muy en desacuerdo", 1, False),
    ("En desacuerdo", 2, False),
    ("Neutral", 3, False),
    ("De acuerdo", 4, False),
    ("Muy de acuerdo", 5, False),
    ("No se / Prefiero no responder", 0, True),
]


def _match_partido(partido_candidato: str):
    """Devuelve el dict de posturas del partido, con matching parcial.

    Ej. 'Partido Comunista (Unidad por Chile)' matchea 'Partido Comunista'.
    Prioriza el match mas largo (mas especifico primero).
    """
    keys_ordenadas = sorted(POSTURAS_ESPECIFICAS.keys(), key=len, reverse=True)
    for key in keys_ordenadas:
        if key.lower() in partido_candidato.lower():
            return POSTURAS_ESPECIFICAS[key]
    return None


class Command(BaseCommand):
    help = "Crea preguntas especificas por tipo + genera posturas para todos los candidatos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Borra las preguntas especificas antes de crearlas.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        total_preg = 0
        total_op = 0
        total_post = 0

        for nombre_tipo, preguntas_data, clave_postura in SETS:
            tipo = TipoEleccion.objects.filter(nombre=nombre_tipo).first()
            if not tipo:
                self.stdout.write(self.style.ERROR(
                    f"Falta TipoEleccion '{nombre_tipo}'. Salteando..."
                ))
                continue

            if options["reset"]:
                # Borra solo las preguntas que coincidan por texto (idempotente).
                textos = [p["texto"] for p in preguntas_data]
                Pregunta.objects.filter(
                    tipo_eleccion=tipo, texto__in=textos,
                ).delete()

            self.stdout.write(self.style.MIGRATE_HEADING(
                f"\n== {nombre_tipo} =="
            ))

            fallback = POSTURAS_ESPECIFICAS["Independiente"][clave_postura]

            # OPTIMIZACION: precargar candidatos del tipo una sola vez.
            candidatos_del_tipo = list(tipo.candidatos.all())

            # Pre-crear preguntas + opciones (rapido, poca cantidad).
            preguntas_creadas = []  # list of (pregunta, idx_pregunta)
            for orden_idx, p_data in enumerate(preguntas_data, start=100):
                pregunta, p_created = Pregunta.objects.update_or_create(
                    tipo_eleccion=tipo, texto=p_data["texto"],
                    defaults={
                        "eje_tematico": p_data["eje"],
                        "explicacion": p_data.get("explicacion", ""),
                        "repercusiones": p_data.get("repercusiones", {}),
                        "orden": orden_idx,
                    },
                )
                if p_created:
                    total_preg += 1
                for texto_op, valor, es_no_se in OPCIONES:
                    _, op_created = OpcionRespuesta.objects.update_or_create(
                        pregunta=pregunta, valor=valor,
                        defaults={"texto": texto_op, "es_no_se": es_no_se},
                    )
                    if op_created:
                        total_op += 1
                preguntas_creadas.append((pregunta, orden_idx - 100))
                self.stdout.write(f"  = {p_data['texto'][:60]}...")

            # Indexar opciones por (pregunta_id, valor) para lookup O(1).
            opciones_idx = {}
            for op in OpcionRespuesta.objects.filter(
                pregunta__in=[p for p, _ in preguntas_creadas], es_no_se=False,
            ):
                opciones_idx[(op.pregunta_id, op.valor)] = op

            # Indexar posturas existentes para skip.
            posturas_existentes = {
                (p.candidato_id, p.pregunta_id)
                for p in PosturaCandidato.objects.filter(
                    candidato__in=candidatos_del_tipo,
                    pregunta__in=[p for p, _ in preguntas_creadas],
                )
            }

            # Bulk build de posturas nuevas.
            posturas_a_crear = []
            for pregunta, idx_pregunta in preguntas_creadas:
                for candidato in candidatos_del_tipo:
                    if (candidato.id, pregunta.id) in posturas_existentes:
                        continue
                    posturas_partido = _match_partido(candidato.partido)
                    if posturas_partido is None:
                        valor = fallback[idx_pregunta]
                    else:
                        valor = posturas_partido[clave_postura][idx_pregunta]
                    opcion = opciones_idx[(pregunta.id, valor)]
                    posturas_a_crear.append(PosturaCandidato(
                        candidato=candidato, pregunta=pregunta,
                        opcion_respuesta=opcion,
                    ))
            PosturaCandidato.objects.bulk_create(
                posturas_a_crear, ignore_conflicts=True,
            )
            total_post += len(posturas_a_crear)

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. {total_preg} preguntas nuevas, {total_op} opciones, "
            f"{total_post} posturas nuevas."
        ))
