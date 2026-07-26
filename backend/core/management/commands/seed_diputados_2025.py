"""
Seed idempotente de DIPUTADOS 2025 (ficticios pero coherentes).

Crea:
- 1 TipoEleccion "Diputados 2025" con anio=2025
- 5 candidatos por cada uno de los 28 distritos = 140 candidatos
- Cada candidato con partido real chileno + posturas base inferidas del partido

Data source: partidos y posturas son reales; nombres son ficticios generados
deterministicamente. Ideal para demo, testing y tesis.

Uso:
    uv run python manage.py seed_diputados_2025
    uv run python manage.py seed_diputados_2025 --reset

Requiere: seed_territorio_chile + seed_preguntas_base.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    Candidato,
    Distrito,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
    UnidadTerritorial,
)

from ._data_candidatos_ficticios import (
    DISTRIBUCION_DIPUTADOS,
    elegir_partidos,
    generar_candidato,
)

NOMBRE_TIPO = "Diputados 2025"
NOMBRE_TIPO_BASE = "Preguntas generales"
CANDIDATOS_POR_DISTRITO = 5


class Command(BaseCommand):
    help = "Crea 140 diputados ficticios (5 por distrito x 28) con posturas por partido."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Borra el TipoEleccion 'Diputados 2025' y sus candidatos antes de crearlo.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            tipo_existente = TipoEleccion.objects.filter(nombre=NOMBRE_TIPO).first()
            if tipo_existente:
                # Borra explicitamente los candidatos SOLO de este tipo antes
                # de borrar el tipo (asi no dejamos huerfanos).
                cands = tipo_existente.candidatos.all()
                for c in cands:
                    if c.tipos_eleccion.count() == 1:
                        c.delete()
                tipo_existente.delete()
                self.stdout.write(self.style.WARNING(
                    f"[reset] TipoEleccion '{NOMBRE_TIPO}' y sus candidatos borrados."
                ))

        # Preguntas base ya deben existir.
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

        # Distritos ya deben existir.
        distritos = list(Distrito.objects.order_by("numero"))
        if len(distritos) != 28:
            self.stdout.write(self.style.ERROR(
                f"Esperados 28 distritos, hay {len(distritos)}. "
                "Corre seed_territorio_chile primero."
            ))
            return

        tipo, tipo_created = TipoEleccion.objects.update_or_create(
            nombre=NOMBRE_TIPO,
            defaults={
                "descripcion": "Eleccion de diputados 2025 (candidatos ficticios).",
                "anio": 2025,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"TipoEleccion {'creado' if tipo_created else 'actualizado'}: {tipo.nombre}"
        ))

        creados = 0
        posturas_creadas = 0
        # Indice UT por numero de distrito (para asignar en cada candidato).
        ut_por_distrito = {
            ut.metadata.get("numero_distrito"): ut
            for ut in UnidadTerritorial.objects.filter(nivel="distrital")
            if ut.metadata.get("numero_distrito")
        }
        for distrito in distritos:
            ut = ut_por_distrito.get(distrito.numero)
            partidos = elegir_partidos(
                distrito.numero, CANDIDATOS_POR_DISTRITO, DISTRIBUCION_DIPUTADOS,
            )
            for idx, partido in enumerate(partidos):
                data = generar_candidato(distrito.numero, idx, partido)
                # Idempotencia: buscamos por (nombre, apellido, distrito).
                candidato, cand_created = Candidato.objects.update_or_create(
                    nombre=data["nombre"], apellido=data["apellido"],
                    distrito=distrito,
                    defaults={
                        "partido": data["partido"],
                        "bio": f"Candidato/a a diputado/a por {distrito.nombre}.",
                        "propuesta_electoral": (
                            f"Representar los intereses del {distrito.nombre} "
                            f"desde los valores del {data['partido']}."
                        ),
                        "unidad_territorial": ut,
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

        total = tipo.candidatos.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nListo. '{tipo.nombre}' tiene {total} diputados "
            f"({creados} creados, {posturas_creadas} posturas nuevas)."
        ))
