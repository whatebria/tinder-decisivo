"""
Seed idempotente de PREGUNTAS BASE (transversales).

Crea:
- 1 TipoEleccion "Preguntas generales" con es_base=True
- 8 preguntas transversales cubriendo los ejes canonicos de VAAs:
  economia, sociedad (valores), seguridad/DDHH, ambiente, institucional, migracion
- Posturas de TODOS los candidatos existentes (Presidencial + Parlamentaria)

Como es_base=True, estas preguntas se agregan automaticamente a cualquier
tipo de eleccion pedido en el endpoint /preguntas/. El user las responde
una sola vez y cuentan para el match de todas las elecciones.

Uso:
    uv run python manage.py seed_preguntas_base
    uv run python manage.py seed_preguntas_base --reset

Es idempotente: correr 2 veces no duplica nada.
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

NOMBRE_TIPO = "Preguntas generales"

OPCIONES = [
    ("Muy en desacuerdo", 1, False),
    ("En desacuerdo", 2, False),
    ("Neutral", 3, False),
    ("De acuerdo", 4, False),
    ("Muy de acuerdo", 5, False),
    ("No se / Prefiero no responder", 0, True),
]

# 8 preguntas base, ordenadas por eje. Cada una viene con explicacion neutra
# y repercusiones dimensionales (mismo formato que las otras preguntas).
PREGUNTAS = [
    {
        "texto": (
            "El Estado debe intervenir activamente en la economia para reducir "
            "las desigualdades sociales."
        ),
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Debate clasico sobre el rol del Estado: mercado libre versus Estado "
            "regulador y redistribuidor."
        ),
        "repercusiones": {
            "economico": "Mas regulacion puede frenar inversion o corregir fallas de mercado.",
            "social": "Politicas redistributivas afectan pobreza y desigualdad.",
            "institucional": "Requiere burocracia estatal capacitada.",
        },
    },
    {
        "texto": (
            "Los impuestos deben ser mas progresivos: quienes tienen mayores "
            "ingresos deben pagar una tasa proporcionalmente mucho mayor."
        ),
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Discusion sobre estructura tributaria. Progresividad busca redistribuir "
            "carga fiscal segun capacidad contributiva."
        ),
        "repercusiones": {
            "economico": "Cambia incentivos al ingreso y al ahorro.",
            "social": "Financia servicios publicos con aporte de sectores altos.",
            "institucional": "Requiere fiscalizacion tributaria fuerte.",
        },
    },
    {
        "texto": (
            "La mujer debe poder decidir libremente sobre la interrupcion del "
            "embarazo dentro de un plazo determinado."
        ),
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "Debate valorico sobre autonomia reproductiva versus proteccion del "
            "no nacido. Actualmente Chile permite aborto por tres causales."
        ),
        "repercusiones": {
            "social": "Autonomia corporal y salud reproductiva de la mujer.",
            "cultural": "Tension con posiciones religiosas o conservadoras.",
            "institucional": "Requiere garantizar acceso en el sistema publico.",
        },
    },
    {
        "texto": (
            "El matrimonio y la adopcion entre parejas del mismo sexo deben "
            "tener los mismos derechos que las parejas heterosexuales."
        ),
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "Igualdad legal para familias homoparentales. Chile aprobo el "
            "matrimonio igualitario en 2022, pero persisten debates sobre adopcion."
        ),
        "repercusiones": {
            "social": "Reconocimiento pleno de diversidad familiar.",
            "cultural": "Tension con sectores religiosos o tradicionales.",
            "institucional": "Ajustes en el codigo civil y en instituciones de proteccion infantil.",
        },
    },
    {
        "texto": (
            "La prioridad ante el crimen debe ser mano dura, aunque implique "
            "acotar algunas garantias procesales de los imputados."
        ),
        "eje": Pregunta.EJE_SEGURIDAD,
        "explicacion": (
            "Tension clasica entre seguridad publica y derechos individuales. "
            "Incluye debates sobre prision preventiva y penas mas severas."
        ),
        "repercusiones": {
            "social": "Percepcion de seguridad versus derechos de personas acusadas.",
            "institucional": "Presion sobre el sistema judicial y penitenciario.",
            "cultural": "Ideas sobre castigo, rehabilitacion y justicia.",
        },
    },
    {
        "texto": (
            "Se debe priorizar la proteccion del medio ambiente por sobre el "
            "crecimiento economico cuando ambos entren en conflicto."
        ),
        "eje": Pregunta.EJE_AMBIENTE,
        "explicacion": (
            "Dilema entre desarrollo productivo (mineria, energia, forestal) y "
            "preservacion de ecosistemas y comunidades locales."
        ),
        "repercusiones": {
            "economico": "Puede frenar proyectos productivos y empleo asociado.",
            "ambiental": "Reduce degradacion de ecosistemas y contaminacion.",
            "social": "Afecta comunidades dependientes de industrias extractivas.",
        },
    },
    {
        "texto": (
            "Los gobiernos regionales deben tener mas atribuciones y "
            "presupuesto propio, reduciendo el poder del gobierno central."
        ),
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Descentralizacion politica: transferir decisiones y recursos desde "
            "Santiago hacia las regiones y municipios."
        ),
        "repercusiones": {
            "institucional": "Cambia el balance de poder territorial.",
            "economico": "Mayor autonomia fiscal regional.",
            "social": "Politicas mas cercanas a realidades locales.",
        },
    },
    {
        "texto": (
            "Chile debe tener politicas migratorias mas restrictivas y un "
            "control mas estricto de sus fronteras."
        ),
        "eje": Pregunta.EJE_SEGURIDAD,
        "explicacion": (
            "Debate sobre apertura versus control migratorio, en un contexto "
            "de aumento de flujos irregulares y de presion sobre servicios publicos."
        ),
        "repercusiones": {
            "social": "Impacta acceso a salud, educacion y trabajo de migrantes.",
            "economico": "Efectos en mercado laboral y demografia.",
            "institucional": "Requiere capacidad de gestion fronteriza y de asilo.",
        },
    },
]

assert len(PREGUNTAS) == 8, "Se esperan 8 preguntas base."

# Respuestas por candidato. Key = (nombre, apellido) para match exacto en DB.
RESPUESTAS = {
    # --- Presidenciales ---
    ("Gabriel", "Boric"): [5, 5, 5, 5, 2, 5, 4, 2],
    ("Jose Antonio", "Kast"): [1, 2, 1, 1, 5, 2, 3, 5],
    ("Yasna", "Provoste"): [4, 4, 2, 3, 3, 4, 4, 3],
    ("Franco", "Parisi"): [2, 3, 3, 4, 4, 2, 4, 5],
    ("Michelle", "Bachelet"): [4, 4, 5, 5, 2, 4, 3, 2],
    ("Sebastian", "Sichel"): [2, 3, 3, 4, 4, 3, 4, 4],
    # --- Parlamentaria (ficticios) ---
    ("Camila", "Rojas"): [5, 5, 5, 5, 1, 5, 4, 1],
    ("Diego", "Vergara"): [2, 2, 4, 5, 3, 2, 3, 3],
    ("Fernanda", "Muñoz"): [2, 2, 1, 1, 5, 2, 2, 5],
    ("Matias", "Contreras"): [3, 4, 3, 4, 4, 4, 5, 4],
}


class Command(BaseCommand):
    help = "Crea/actualiza el set de PREGUNTAS BASE (transversales) + posturas."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Borra el TipoEleccion base y todos sus datos antes de crearlo.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = TipoEleccion.objects.filter(nombre=NOMBRE_TIPO).delete()
            if deleted:
                self.stdout.write(self.style.WARNING(
                    f"[reset] TipoEleccion '{NOMBRE_TIPO}' borrado ({deleted} objetos)."
                ))

        tipo, tipo_created = TipoEleccion.objects.update_or_create(
            nombre=NOMBRE_TIPO,
            defaults={
                "descripcion": (
                    "Preguntas transversales de valores e ideologia. Se responden "
                    "una sola vez y cuentan para el match de todas las elecciones."
                ),
                "fecha_eleccion": None,
                "es_base": True,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"TipoEleccion {'creado' if tipo_created else 'actualizado'}: "
            f"{tipo.nombre} (es_base={tipo.es_base})"
        ))

        # --- Preguntas + opciones ---
        preguntas_objs: list[Pregunta] = []
        for orden, p in enumerate(PREGUNTAS, start=1):
            pregunta, _ = Pregunta.objects.update_or_create(
                texto=p["texto"],
                tipo_eleccion=tipo,
                defaults={
                    "eje_tematico": p["eje"],
                    "orden": orden,
                    "explicacion": p["explicacion"],
                    "repercusiones": p["repercusiones"],
                },
            )
            preguntas_objs.append(pregunta)

            for texto, valor, es_no_se in OPCIONES:
                OpcionRespuesta.objects.get_or_create(
                    pregunta=pregunta,
                    texto=texto,
                    defaults={"valor": valor, "es_no_se": es_no_se},
                )
        self.stdout.write(self.style.SUCCESS(
            f"  {len(preguntas_objs)} preguntas base + opciones Likert listas."
        ))

        # --- Posturas de candidatos existentes ---
        posturas_creadas = 0
        candidatos_afectados = 0
        for (nombre, apellido), respuestas in RESPUESTAS.items():
            candidato = Candidato.objects.filter(
                nombre=nombre, apellido=apellido
            ).first()
            if not candidato:
                self.stdout.write(self.style.WARNING(
                    f"  ! Candidato '{nombre} {apellido}' no existe, se ignora."
                ))
                continue

            for pregunta, valor in zip(preguntas_objs, respuestas):
                opcion = OpcionRespuesta.objects.get(
                    pregunta=pregunta, valor=valor, es_no_se=False
                )
                _, created = PosturaCandidato.objects.update_or_create(
                    candidato=candidato,
                    pregunta=pregunta,
                    defaults={"opcion_respuesta": opcion},
                )
                if created:
                    posturas_creadas += 1
            candidatos_afectados += 1
            self.stdout.write(
                f"  = {candidato.nombre} {candidato.apellido} - 8 posturas base"
            )

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. '{tipo.nombre}' tiene {tipo.preguntas.count()} preguntas y "
            f"{candidatos_afectados} candidatos con postura ({posturas_creadas} nuevas)."
        ))
