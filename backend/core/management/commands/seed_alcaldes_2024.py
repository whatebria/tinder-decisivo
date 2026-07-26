"""
Seed idempotente de ALCALDES 2024 (ficticios pero coherentes).

Crea:
- 1 TipoEleccion "Alcaldes 2024" con anio=2024
- 3 candidatos por cada una de las 346 comunas = 1038 candidatos
- Cada candidato con partido real chileno + posturas base inferidas del partido

Uso:
    uv run python manage.py seed_alcaldes_2024
    uv run python manage.py seed_alcaldes_2024 --reset

Requiere: seed_territorio_chile + seed_preguntas_base.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    Candidato,
    Comuna,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)

from ._data_candidatos_ficticios import (
    DISTRIBUCION_ALCALDES,
    elegir_partidos,
    generar_candidato,
)

NOMBRE_TIPO = "Alcaldes 2024"
NOMBRE_TIPO_BASE = "Preguntas generales"
CANDIDATOS_POR_COMUNA = 3


class Command(BaseCommand):
    help = "Crea 1038 alcaldes ficticios (3 por comuna x 346) con posturas por partido."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Borra el TipoEleccion 'Alcaldes 2024' y sus candidatos.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            tipo_existente = TipoEleccion.objects.filter(nombre=NOMBRE_TIPO).first()
            if tipo_existente:
                for c in tipo_existente.candidatos.all():
                    if c.tipos_eleccion.count() == 1:
                        c.delete()
                tipo_existente.delete()
                self.stdout.write(self.style.WARNING(
                    f"[reset] '{NOMBRE_TIPO}' y candidatos exclusivos borrados."
                ))

        tipo_base = TipoEleccion.objects.filter(
            nombre=NOMBRE_TIPO_BASE, es_base=True,
        ).first()
        if not tipo_base:
            self.stdout.write(self.style.ERROR(
                "Falta 'Preguntas generales'. Corre seed_preguntas_base primero."
            ))
            return

        preguntas_base = list(
            Pregunta.objects.filter(tipo_eleccion=tipo_base).order_by("orden")
        )
        assert len(preguntas_base) == 8

        comunas = list(Comuna.objects.select_related("region", "distrito"))
        if len(comunas) != 346:
            self.stdout.write(self.style.ERROR(
                f"Esperadas 346 comunas, hay {len(comunas)}. "
                "Corre seed_territorio_chile primero."
            ))
            return

        tipo, tipo_created = TipoEleccion.objects.update_or_create(
            nombre=NOMBRE_TIPO,
            defaults={
                "descripcion": "Eleccion de alcaldes 2024 (candidatos ficticios).",
                "anio": 2024,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"TipoEleccion {'creado' if tipo_created else 'actualizado'}: {tipo.nombre}"
        ))
        self.stdout.write(f"Generando {len(comunas)} x {CANDIDATOS_POR_COMUNA} candidatos...")

        creados = 0
        posturas_creadas = 0
        for i, comuna in enumerate(comunas, 1):
            # Semilla int a partir del codigo de comuna (unica).
            seed_int = int(comuna.codigo)
            partidos = elegir_partidos(
                seed_int, CANDIDATOS_POR_COMUNA, DISTRIBUCION_ALCALDES,
            )
            for idx, partido in enumerate(partidos):
                data = generar_candidato(seed_int, idx, partido)
                candidato, cand_created = Candidato.objects.update_or_create(
                    nombre=data["nombre"], apellido=data["apellido"],
                    comuna=comuna,
                    defaults={
                        "partido": data["partido"],
                        "bio": f"Candidato/a a alcalde/sa de {comuna.nombre}.",
                        "propuesta_electoral": (
                            f"Trabajar por los vecinos y vecinas de "
                            f"{comuna.nombre} desde el {data['partido']}."
                        ),
                    },
                )
                candidato.tipos_eleccion.add(tipo)
                if cand_created:
                    creados += 1

                for pregunta, valor in zip(preguntas_base, data["posturas"]):
                    opcion = OpcionRespuesta.objects.get(
                        pregunta=pregunta, valor=valor, es_no_se=False,
                    )
                    _, p_created = PosturaCandidato.objects.update_or_create(
                        candidato=candidato, pregunta=pregunta,
                        defaults={"opcion_respuesta": opcion},
                    )
                    if p_created:
                        posturas_creadas += 1

            # Progreso cada 50 comunas.
            if i % 50 == 0:
                self.stdout.write(f"  {i}/{len(comunas)} comunas procesadas...")

        total = tipo.candidatos.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nListo. '{tipo.nombre}' tiene {total} alcaldes "
            f"({creados} creados, {posturas_creadas} posturas nuevas)."
        ))
