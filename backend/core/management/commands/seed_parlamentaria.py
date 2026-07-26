"""
Seed idempotente de una eleccion Parlamentaria 2025 de ejemplo.

Crea:
- 1 TipoEleccion ("Parlamentaria 2025")
- 8 preguntas con eje tematico + explicacion + repercusiones + opciones Likert 5
- 4 candidatos ficticios con perfiles ideologicos distintos
- Posturas de cada candidato a cada pregunta (para que el matching funcione)

Uso:
    uv run python manage.py seed_parlamentaria
    uv run python manage.py seed_parlamentaria --reset   # borra la eleccion primero

Es idempotente: correr 2 veces no duplica nada.
"""

from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    Candidato,
    OpcionRespuesta,
    PosturaCandidato,
    Pregunta,
    TipoEleccion,
)

NOMBRE_ELECCION = "Parlamentaria 2025"
FECHA_ELECCION = date(2025, 11, 16)

# --- Opciones Likert 5 estandar ---------------------------------------------
OPCIONES = [
    ("Muy en desacuerdo", 1, False),
    ("En desacuerdo", 2, False),
    ("Neutral", 3, False),
    ("De acuerdo", 4, False),
    ("Muy de acuerdo", 5, False),
    ("No se / Prefiero no responder", 0, True),
]

# --- Preguntas ---------------------------------------------------------------
# Cada dict: texto, eje, explicacion, repercusiones (dict con impactos).
PREGUNTAS = [
    {
        "texto": "El Estado debe subir impuestos a las grandes empresas para financiar mas servicios sociales.",
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Debate central sobre carga tributaria corporativa. Impacta la recaudacion fiscal, "
            "la inversion privada y el gasto social."
        ),
        "repercusiones": {
            "economico": "Mas recaudacion pero posible menor inversion privada.",
            "social": "Financiamiento adicional para salud, educacion o pensiones.",
            "institucional": "Requiere reforma tributaria aprobada en el Congreso.",
        },
    },
    {
        "texto": "Se debe fortalecer el sistema de pensiones con un pilar solidario obligatorio.",
        "eje": Pregunta.EJE_ECONOMIA,
        "explicacion": (
            "Reforma previsional: sumar cotizacion adicional con administracion publica versus "
            "mantener el sistema de capitalizacion individual actual."
        ),
        "repercusiones": {
            "economico": "Aumenta el costo laboral formal.",
            "social": "Mejora pensiones bajas actuales.",
            "institucional": "Cambio estructural del sistema previsional.",
        },
    },
    {
        "texto": "El aborto debe estar permitido por libre decision de la mujer hasta las 14 semanas.",
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "Discusion sobre ampliar las causales actuales (riesgo vital, inviabilidad fetal, "
            "violacion) hacia un modelo de libre decision temprana."
        ),
        "repercusiones": {
            "social": "Autonomia reproductiva de la mujer.",
            "cultural": "Debate valorico profundo en la sociedad.",
            "institucional": "Requiere reforma legal aprobada por el Congreso.",
        },
    },
    {
        "texto": "Se debe legalizar el matrimonio igualitario con derechos de adopcion plenos.",
        "eje": Pregunta.EJE_SOCIEDAD,
        "explicacion": (
            "En Chile ya existe matrimonio igualitario desde 2022; el debate actual gira en torno "
            "a la adopcion homoparental y derechos derivados."
        ),
        "repercusiones": {
            "social": "Igualdad de derechos para parejas del mismo sexo.",
            "cultural": "Cambio de paradigma familiar.",
            "institucional": "Ajustes al Codigo Civil.",
        },
    },
    {
        "texto": "Chile debe transitar hacia una matriz 100% renovable antes de 2040.",
        "eje": Pregunta.EJE_AMBIENTE,
        "explicacion": (
            "Meta de descarbonizacion acelerada del sistema electrico. Involucra cerrar termoelectricas "
            "a carbon e invertir masivamente en solar, eolico y almacenamiento."
        ),
        "repercusiones": {
            "ambiental": "Reduccion drastica de emisiones de CO2.",
            "economico": "Alto costo de transicion pero menor precio a largo plazo.",
            "social": "Reconversion laboral de zonas mineras y de sacrificio.",
        },
    },
    {
        "texto": "Se deben endurecer las penas por delitos violentos y aumentar la dotacion policial.",
        "eje": Pregunta.EJE_SEGURIDAD,
        "explicacion": (
            "Enfoque punitivo versus preventivo en seguridad publica. Aumenta el uso de carcel efectiva "
            "y expande Carabineros/PDI."
        ),
        "repercusiones": {
            "social": "Percepcion de mayor seguridad.",
            "economico": "Mayor gasto en carceles y policia.",
            "institucional": "Posible saturacion del sistema penitenciario.",
        },
    },
    {
        "texto": "Chile debe adoptar una politica migratoria mas restrictiva con control fronterizo militar.",
        "eje": Pregunta.EJE_DDHH,
        "explicacion": (
            "Debate sobre el rol de las FF.AA. en el control migratorio y expulsiones administrativas "
            "aceleradas versus procesos con debido proceso."
        ),
        "repercusiones": {
            "social": "Menor migracion irregular pero mayor tension humanitaria.",
            "institucional": "Roce con tratados internacionales de DD.HH.",
            "cultural": "Impacto en relaciones diplomaticas con paises vecinos.",
        },
    },
    {
        "texto": "El Congreso debe reducirse en tamano y bajar sus sueldos a la mitad.",
        "eje": Pregunta.EJE_INSTITUCIONAL,
        "explicacion": (
            "Reforma politica orientada a bajar el costo de la actividad parlamentaria y mejorar la "
            "percepcion ciudadana sobre la clase politica."
        ),
        "repercusiones": {
            "institucional": "Menor representatividad territorial vs. mayor eficiencia.",
            "economico": "Ahorro fiscal marginal pero simbolico.",
            "social": "Podria mejorar la confianza en el Congreso.",
        },
    },
]

# --- Candidatos con perfil ideologico ----------------------------------------
# Para cada candidato mapeamos qué valor (1-5) responderia a cada pregunta.
# Indices coinciden con el orden de PREGUNTAS arriba.
CANDIDATOS = [
    {
        "nombre": "Camila",
        "apellido": "Rojas",
        "partido": "Movimiento Progresista",
        "ciudad": "Santiago",
        "bio": "Diputada por Santiago, abogada, foco en derechos sociales y medio ambiente.",
        "propuesta_electoral": (
            "Impulsar una reforma tributaria progresiva, ampliar el aborto libre y acelerar "
            "la transicion energetica renovable."
        ),
        # perfil: izquierda progresista
        "respuestas": [5, 5, 5, 5, 5, 2, 1, 3],
    },
    {
        "nombre": "Diego",
        "apellido": "Vergara",
        "partido": "Frente Liberal",
        "ciudad": "Valparaiso",
        "bio": "Economista, ex-consultor internacional, foco en modernizacion del Estado.",
        "propuesta_electoral": (
            "Estado eficiente y ligero: bajar impuestos empresariales, libertad de eleccion en "
            "pensiones y salud, y reforma politica que reduzca el Congreso."
        ),
        # perfil: centro-derecha liberal
        "respuestas": [1, 2, 3, 4, 3, 4, 3, 5],
    },
    {
        "nombre": "Fernanda",
        "apellido": "Muñoz",
        "partido": "Union Democrata Social",
        "ciudad": "Concepcion",
        "bio": "Trabajadora social, dirigente vecinal, enfocada en seguridad y familia.",
        "propuesta_electoral": (
            "Seguridad primero: mano dura con la delincuencia, control migratorio estricto y "
            "defensa de la familia tradicional."
        ),
        # perfil: derecha conservadora
        "respuestas": [2, 3, 1, 2, 2, 5, 5, 4],
    },
    {
        "nombre": "Matias",
        "apellido": "Contreras",
        "partido": "Independiente Regional",
        "ciudad": "Antofagasta",
        "bio": "Ingeniero civil, ex-alcalde, foco en desarrollo regional y descentralizacion.",
        "propuesta_electoral": (
            "Descentralizar de verdad: mas recursos a regiones, mineria responsable con "
            "comunidades y ampliar energias renovables en el norte."
        ),
        # perfil: centro pragmatico regionalista
        "respuestas": [3, 4, 3, 4, 5, 3, 3, 4],
    },
]


class Command(BaseCommand):
    help = "Crea datos de ejemplo para una eleccion Parlamentaria 2025."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Borra la eleccion y todos sus datos asociados antes de crearla.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = TipoEleccion.objects.filter(nombre=NOMBRE_ELECCION).delete()
            if deleted:
                self.stdout.write(self.style.WARNING(
                    f"[reset] Eleccion '{NOMBRE_ELECCION}' borrada ({deleted} objetos)."
                ))

        tipo, tipo_created = TipoEleccion.objects.update_or_create(
            nombre=NOMBRE_ELECCION,
            defaults={
                "descripcion": (
                    "Eleccion parlamentaria de ejemplo con 8 preguntas y 4 candidatos "
                    "de distintos perfiles ideologicos."
                ),
                "fecha_eleccion": FECHA_ELECCION,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"TipoEleccion {'creado' if tipo_created else 'actualizado'}: {tipo.nombre}"
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
            f"  {len(preguntas_objs)} preguntas + opciones Likert listas."
        ))

        # --- Candidatos + posturas ---
        for c in CANDIDATOS:
            candidato, cand_created = Candidato.objects.update_or_create(
                nombre=c["nombre"],
                apellido=c["apellido"],
                defaults={
                    "partido": c["partido"],
                    "ciudad": c["ciudad"],
                    "bio": c["bio"],
                    "propuesta_electoral": c["propuesta_electoral"],
                },
            )
            candidato.tipos_eleccion.add(tipo)

            # Posturas: para cada pregunta, buscar la opcion cuyo valor coincida con la respuesta.
            for pregunta, valor_respuesta in zip(preguntas_objs, c["respuestas"]):
                opcion = OpcionRespuesta.objects.get(
                    pregunta=pregunta, valor=valor_respuesta, es_no_se=False
                )
                PosturaCandidato.objects.update_or_create(
                    candidato=candidato,
                    pregunta=pregunta,
                    defaults={"opcion_respuesta": opcion},
                )
            self.stdout.write(
                f"  {'+' if cand_created else '='} {candidato.nombre} {candidato.apellido} "
                f"({candidato.partido}) - {len(c['respuestas'])} posturas"
            )

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. Eleccion '{tipo.nombre}' tiene "
            f"{tipo.preguntas.count()} preguntas y {tipo.candidatos.count()} candidatos."
        ))
