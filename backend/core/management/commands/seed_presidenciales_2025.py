"""
Seed idempotente de PRESIDENCIALES 2025 (Chile).

Crea:
- 1 TipoEleccion "Presidencial 2025" con anio=2025
- Los 8 candidatos oficiales inscritos ante Servel (agosto 2025)
- Posturas base de cada uno, inferidas por posicionamiento publico y linea del partido.

Uso:
    uv run python manage.py seed_presidenciales_2025
    uv run python manage.py seed_presidenciales_2025 --reset

Data source: perfil publico oficial de cada candidato + linea del partido.
El mapping de posturas es una aproximacion editorial defendible desde
programas publicos y declaraciones, no medicion emprica de cada candidato.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    Candidato,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)

NOMBRE_TIPO = "Presidencial 2025"
NOMBRE_TIPO_BASE = "Preguntas generales"

# Los 8 candidatos oficiales presidenciales 2025.
# posturas_base = [P1, P2, P3, P4, P5, P6, P7, P8] segun orden en seed_preguntas_base:
# 1: Estado interviene economia | 2: Impuestos progresivos | 3: Aborto libre
# 4: Matrimonio igualitario | 5: Mano dura | 6: Ambiente > crecimiento
# 7: Descentralizacion | 8: Migracion restrictiva
# Escala 1-5: 1=muy en desacuerdo, 5=muy de acuerdo.
CANDIDATOS = [
    {
        "nombre": "Jeannette", "apellido": "Jara",
        "partido": "Partido Comunista (Unidad por Chile)",
        "bio": "Abogada, ex-Ministra del Trabajo del gobierno de Boric.",
        "propuesta": "Reforma tributaria progresiva, salario minimo real, "
                     "expansion del sistema publico y de proteccion social.",
        "posturas": [5, 5, 5, 5, 2, 5, 4, 2],
    },
    {
        "nombre": "Jose Antonio", "apellido": "Kast",
        "partido": "Partido Republicano",
        "bio": "Abogado, ex-diputado UDI, fundador del Partido Republicano.",
        "propuesta": "Reduccion del gasto publico, mano dura contra el crimen "
                     "y la migracion irregular, valores tradicionales.",
        "posturas": [1, 2, 1, 1, 5, 2, 3, 5],
    },
    {
        "nombre": "Evelyn", "apellido": "Matthei",
        "partido": "UDI (Chile Vamos)",
        "bio": "Economista, ex-Ministra del Trabajo y ex-alcaldesa de Providencia.",
        "propuesta": "Estabilidad macroeconomica, seguridad, crecimiento "
                     "sostenido y modernizacion del Estado.",
        "posturas": [2, 3, 2, 2, 5, 3, 3, 5],
    },
    {
        "nombre": "Franco", "apellido": "Parisi",
        "partido": "Partido de la Gente (PDG)",
        "bio": "Economista y academico, fundador del PDG.",
        "propuesta": "Anti-elite, reforma tributaria a las grandes empresas, "
                     "control migratorio y descentralizacion regional.",
        "posturas": [2, 3, 3, 4, 4, 2, 5, 5],
    },
    {
        "nombre": "Johannes", "apellido": "Kaiser",
        "partido": "Partido Nacional Libertario",
        "bio": "Ex-diputado, fundador del Partido Nacional Libertario.",
        "propuesta": "Reduccion drastica del Estado, libertad economica, "
                     "seguridad y defensa de la propiedad privada.",
        "posturas": [1, 2, 2, 2, 5, 1, 3, 5],
    },
    {
        "nombre": "Marco", "apellido": "Enriquez-Ominami",
        "partido": "Independiente (progresista)",
        "bio": "Cineasta y ex-diputado, cuarta candidatura presidencial.",
        "propuesta": "Reforma constitucional, agenda ambiental fuerte, "
                     "modernizacion democratica y regionalizacion.",
        "posturas": [4, 4, 5, 5, 2, 5, 5, 2],
    },
    {
        "nombre": "Harold", "apellido": "Mayne-Nicholls",
        "partido": "Independiente (centro)",
        "bio": "Ex-presidente de la ANFP, dirigente deportivo.",
        "propuesta": "Renovacion politica, transparencia, foco en educacion y "
                     "cohesion social desde una posicion centrista.",
        "posturas": [3, 3, 3, 4, 3, 4, 4, 3],
    },
    {
        "nombre": "Eduardo", "apellido": "Artes",
        "partido": "Union Patriotica",
        "bio": "Profesor y dirigente sindical, candidato por la Union Patriotica.",
        "propuesta": "Nacionalizacion de recursos estrategicos, soberania "
                     "economica y ruptura con el modelo neoliberal.",
        "posturas": [5, 5, 4, 3, 2, 5, 3, 2],
    },
]

OPCIONES = [
    ("Muy en desacuerdo", 1, False),
    ("En desacuerdo", 2, False),
    ("Neutral", 3, False),
    ("De acuerdo", 4, False),
    ("Muy de acuerdo", 5, False),
    ("No se / Prefiero no responder", 0, True),
]


class Command(BaseCommand):
    help = "Crea el TipoEleccion 'Presidencial 2025' con los 8 candidatos oficiales y posturas base."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Borra el TipoEleccion 'Presidencial 2025' y todo lo asociado antes de crearlo.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = TipoEleccion.objects.filter(nombre=NOMBRE_TIPO).delete()
            if deleted:
                self.stdout.write(self.style.WARNING(
                    f"[reset] TipoEleccion '{NOMBRE_TIPO}' borrado ({deleted} objetos)."
                ))

        # Requerimos que existan las preguntas base sembradas.
        tipo_base = TipoEleccion.objects.filter(
            nombre=NOMBRE_TIPO_BASE, es_base=True
        ).first()
        if not tipo_base:
            self.stdout.write(self.style.ERROR(
                f"Falta el TipoEleccion base '{NOMBRE_TIPO_BASE}'. "
                "Corre 'seed_preguntas_base' primero."
            ))
            return

        preguntas_base = list(
            Pregunta.objects.filter(tipo_eleccion=tipo_base).order_by("orden")
        )
        if len(preguntas_base) != 8:
            self.stdout.write(self.style.ERROR(
                f"Esperadas 8 preguntas base, hay {len(preguntas_base)}."
            ))
            return

        # Crear/actualizar TipoEleccion.
        tipo, tipo_created = TipoEleccion.objects.update_or_create(
            nombre=NOMBRE_TIPO,
            defaults={
                "descripcion": "Eleccion presidencial de Chile, noviembre 2025.",
                "anio": 2025,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"TipoEleccion {'creado' if tipo_created else 'actualizado'}: {tipo.nombre}"
        ))

        # Crear candidatos + posturas.
        creados = 0
        actualizados = 0
        posturas_creadas = 0
        for c in CANDIDATOS:
            candidato, cand_created = Candidato.objects.update_or_create(
                nombre=c["nombre"], apellido=c["apellido"],
                defaults={
                    "partido": c["partido"],
                    "bio": c["bio"],
                    "propuesta_electoral": c["propuesta"],
                },
            )
            candidato.tipos_eleccion.add(tipo)
            if cand_created:
                creados += 1
            else:
                actualizados += 1

            # Posturas base
            for pregunta, valor in zip(preguntas_base, c["posturas"]):
                opcion = OpcionRespuesta.objects.get(
                    pregunta=pregunta, valor=valor, es_no_se=False,
                )
                _, created = PosturaCandidato.objects.update_or_create(
                    candidato=candidato, pregunta=pregunta,
                    defaults={"opcion_respuesta": opcion},
                )
                if created:
                    posturas_creadas += 1

            self.stdout.write(
                f"  = {candidato.nombre} {candidato.apellido} [{candidato.partido}]"
            )

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. '{tipo.nombre}' tiene {tipo.candidatos.count()} candidatos "
            f"({creados} creados, {actualizados} actualizados, {posturas_creadas} posturas nuevas)."
        ))
