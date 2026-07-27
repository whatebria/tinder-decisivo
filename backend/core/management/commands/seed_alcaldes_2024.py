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
    UnidadTerritorial,
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

        # ---- OPTIMIZACION: cargar todo en memoria y hacer bulk ops ----
        # 1. Indice de opciones por (pregunta_id, valor) para O(1) lookup.
        opciones_por_pregunta = {}
        for op in OpcionRespuesta.objects.filter(
            pregunta__in=preguntas_base, es_no_se=False,
        ):
            opciones_por_pregunta[(op.pregunta_id, op.valor)] = op

        # 2. Indice UnidadTerritorial por codigo_ine (metadata o parseando codigo).
        #    Se calcula antes que 'existentes' porque el dedup ahora usa ut_id.
        ut_por_codigo_ine = {}
        for ut in UnidadTerritorial.objects.filter(nivel="comunal"):
            codigo_ine = ut.metadata.get("codigo_ine") or ut.codigo.replace("COM-", "")
            ut_por_codigo_ine[codigo_ine] = ut

        # Mapa comuna.codigo (INE) -> UT.id, usado para dedup y M2M lookups.
        ut_id_por_comuna_codigo = {
            codigo: ut.id for codigo, ut in ut_por_codigo_ine.items()
        }
        # IDs UT de las comunas de este seed (para filtrar querys downstream).
        ut_ids_de_comunas = [
            ut_id_por_comuna_codigo[c.codigo]
            for c in comunas
            if c.codigo in ut_id_por_comuna_codigo
        ]

        # 3. Indice de candidatos existentes (para idempotencia). Ahora por UT.
        existentes = {
            (c.nombre, c.apellido, c.unidad_territorial_id): c
            for c in Candidato.objects.filter(
                unidad_territorial_id__in=ut_ids_de_comunas,
            )
        }

        # 4. Preparar lote de candidatos nuevos y datos de posturas.
        candidatos_nuevos = []
        plan_posturas = []  # list of (candidato_key, posturas_valores)

        for comuna in comunas:
            seed_int = int(comuna.codigo)
            ut = ut_por_codigo_ine.get(comuna.codigo)
            partidos = elegir_partidos(
                seed_int, CANDIDATOS_POR_COMUNA, DISTRIBUCION_ALCALDES,
            )
            for idx, partido in enumerate(partidos):
                data = generar_candidato(seed_int, idx, partido)
                key = (data["nombre"], data["apellido"], ut.id if ut else None)
                if key not in existentes:
                    candidatos_nuevos.append(Candidato(
                        nombre=data["nombre"],
                        apellido=data["apellido"],
                        unidad_territorial=ut,
                        partido=data["partido"],
                        bio=f"Candidato/a a alcalde/sa de {comuna.nombre}.",
                        propuesta_electoral=(
                            f"Trabajar por los vecinos y vecinas de "
                            f"{comuna.nombre} desde el {data['partido']}."
                        ),
                    ))
                plan_posturas.append((key, data["posturas"]))

        # 5. Bulk create candidatos nuevos (1 query en vez de N).
        Candidato.objects.bulk_create(candidatos_nuevos)
        creados = len(candidatos_nuevos)

        # 6. Refrescar indice con los recien creados.
        todos = {
            (c.nombre, c.apellido, c.unidad_territorial_id): c
            for c in Candidato.objects.filter(
                unidad_territorial_id__in=ut_ids_de_comunas,
            )
        }

        # 7. Bulk M2M add tipo_eleccion. Usamos through directamente para
        #    evitar N queries de .add().
        Through = Candidato.tipos_eleccion.through
        m2m_existentes = set(
            Through.objects.filter(
                candidato__unidad_territorial_id__in=ut_ids_de_comunas,
                tipoeleccion=tipo,
            ).values_list("candidato_id", flat=True)
        )
        m2m_nuevos = [
            Through(candidato_id=c.id, tipoeleccion_id=tipo.id)
            for c in todos.values() if c.id not in m2m_existentes
        ]
        Through.objects.bulk_create(m2m_nuevos, ignore_conflicts=True)

        # 8. Bulk crear posturas nuevas. Primero indexar posturas existentes.
        posturas_existentes = {
            (p.candidato_id, p.pregunta_id)
            for p in PosturaCandidato.objects.filter(
                candidato__unidad_territorial_id__in=ut_ids_de_comunas,
                pregunta__in=preguntas_base,
            )
        }
        posturas_a_crear = []
        for key, posturas_valores in plan_posturas:
            candidato = todos[key]
            for pregunta, valor in zip(preguntas_base, posturas_valores):
                if (candidato.id, pregunta.id) in posturas_existentes:
                    continue
                opcion = opciones_por_pregunta[(pregunta.id, valor)]
                posturas_a_crear.append(PosturaCandidato(
                    candidato=candidato, pregunta=pregunta,
                    opcion_respuesta=opcion,
                ))
        PosturaCandidato.objects.bulk_create(posturas_a_crear, ignore_conflicts=True)
        posturas_creadas = len(posturas_a_crear)

        total = tipo.candidatos.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nListo. '{tipo.nombre}' tiene {total} alcaldes "
            f"({creados} creados, {posturas_creadas} posturas nuevas)."
        ))
