"""
Seed idempotente de la estructura territorial de Chile.

Crea:
- 16 Regiones (DL 575)
- 28 Distritos electorales (Ley 21.073)
- 346 Comunas (codigos SUBDERE), mapeadas a region + distrito.

Uso:
    uv run python manage.py seed_territorio_chile
    uv run python manage.py seed_territorio_chile --reset

Es idempotente: correr 2 veces no duplica nada.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Comuna, Distrito, Region

from ._data_chile import COMUNAS, DISTRITOS, REGIONES


class Command(BaseCommand):
    help = "Carga la estructura territorial chilena: regiones, distritos y comunas."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Borra TODAS las regiones, distritos y comunas antes de crearlos.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            comunas_del = Comuna.objects.all().delete()[0]
            distritos_del = Distrito.objects.all().delete()[0]
            regiones_del = Region.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(
                f"[reset] Borradas {comunas_del} comunas, "
                f"{distritos_del} distritos, {regiones_del} regiones."
            ))

        # --- Regiones ---
        regiones_por_codigo: dict[str, Region] = {}
        creadas_r = 0
        for numero_romano, codigo, nombre, nombre_corto, orden in REGIONES:
            r, created = Region.objects.update_or_create(
                codigo=codigo,
                defaults={
                    "numero_romano": numero_romano,
                    "nombre": nombre,
                    "nombre_corto": nombre_corto,
                    "orden": orden,
                },
            )
            regiones_por_codigo[codigo] = r
            if created:
                creadas_r += 1
        self.stdout.write(self.style.SUCCESS(
            f"Regiones: {len(REGIONES)} totales, {creadas_r} creadas."
        ))

        # --- Distritos ---
        distritos_por_numero: dict[int, Distrito] = {}
        creadas_d = 0
        for numero, nombre, region_codigo, escanos in DISTRITOS:
            region = regiones_por_codigo[region_codigo]
            d, created = Distrito.objects.update_or_create(
                numero=numero,
                defaults={
                    "nombre": nombre,
                    "region": region,
                    "escanos": escanos,
                },
            )
            distritos_por_numero[numero] = d
            if created:
                creadas_d += 1
        self.stdout.write(self.style.SUCCESS(
            f"Distritos: {len(DISTRITOS)} totales, {creadas_d} creados."
        ))

        # --- Comunas ---
        creadas_c = 0
        for codigo, nombre, region_codigo, distrito_numero in COMUNAS:
            region = regiones_por_codigo[region_codigo]
            distrito = distritos_por_numero[distrito_numero]
            _, created = Comuna.objects.update_or_create(
                codigo=codigo,
                defaults={
                    "nombre": nombre,
                    "region": region,
                    "distrito": distrito,
                },
            )
            if created:
                creadas_c += 1
        self.stdout.write(self.style.SUCCESS(
            f"Comunas: {len(COMUNAS)} totales, {creadas_c} creadas."
        ))

        self.stdout.write(self.style.SUCCESS(
            f"\nListo. DB tiene {Region.objects.count()} regiones, "
            f"{Distrito.objects.count()} distritos, {Comuna.objects.count()} comunas."
        ))
