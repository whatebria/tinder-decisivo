"""
Seed idempotente de PREGUNTAS ESPECIFICAS por tipo de eleccion.

Crea 5 preguntas para cada uno de los 3 tipos electorales:
- Presidencial 2025
- Diputados 2025
- Alcaldes 2024

Y genera posturas para todos los candidatos ya sembrados usando el mapping
partido -> posturas del modulo _preguntas_por_tipo.

Uso:
    uv run python manage.py seed_preguntas_por_tipo
    uv run python manage.py seed_preguntas_por_tipo --reset

Requiere: seed_presidenciales_2025, seed_diputados_2025, seed_alcaldes_2024.
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
    PREGUNTAS_ALC_2024,
    PREGUNTAS_DIP_2025,
    PREGUNTAS_PRESI_2025,
)

# Mapping: (nombre_tipo_eleccion, preguntas, clave_postura_en_partido)
SETS = [
    ("Presidencial 2025", PREGUNTAS_PRESI_2025, "presi"),
    ("Diputados 2025",    PREGUNTAS_DIP_2025,   "dip"),
    ("Alcaldes 2024",     PREGUNTAS_ALC_2024,   "alc"),
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

            for orden_idx, p_data in enumerate(preguntas_data, start=100):
                pregunta, p_created = Pregunta.objects.update_or_create(
                    tipo_eleccion=tipo, texto=p_data["texto"],
                    defaults={
                        "eje_tematico": p_data["eje"],
                        "explicacion": p_data.get("explicacion", ""),
                        "repercusiones": p_data.get("repercusiones", {}),
                        "orden": orden_idx,  # a partir de 100 para no chocar con base
                    },
                )
                if p_created:
                    total_preg += 1

                # Crear las 6 opciones
                for texto_op, valor, es_no_se in OPCIONES:
                    _, op_created = OpcionRespuesta.objects.update_or_create(
                        pregunta=pregunta, valor=valor,
                        defaults={"texto": texto_op, "es_no_se": es_no_se},
                    )
                    if op_created:
                        total_op += 1

                # Generar postura para cada candidato del tipo
                # segun su partido. La pregunta es indice = orden_idx - 100.
                idx_pregunta = orden_idx - 100
                for candidato in tipo.candidatos.all():
                    posturas_partido = _match_partido(candidato.partido)
                    if posturas_partido is None:
                        valor = fallback[idx_pregunta]
                    else:
                        valor = posturas_partido[clave_postura][idx_pregunta]

                    opcion = OpcionRespuesta.objects.get(
                        pregunta=pregunta, valor=valor, es_no_se=False,
                    )
                    _, post_created = PosturaCandidato.objects.update_or_create(
                        candidato=candidato, pregunta=pregunta,
                        defaults={"opcion_respuesta": opcion},
                    )
                    if post_created:
                        total_post += 1

                self.stdout.write(f"  = {p_data['texto'][:60]}...")

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. {total_preg} preguntas nuevas, {total_op} opciones, "
            f"{total_post} posturas nuevas."
        ))
