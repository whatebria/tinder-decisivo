"""Materializa UnidadTerritorial desde Region/Distrito/Comuna + backfill de FKs.

Estrategia:
1. Crea 1 UnidadTerritorial "NACIONAL" (raiz).
2. Por cada Region existente, crea UT nivel=regional con padre=NACIONAL.
3. Por cada Distrito, crea UT nivel=distrital con padre=UT-de-la-region.
4. Por cada Comuna, crea UT nivel=comunal con padre=UT-del-distrito.
5. Backfill Candidato.unidad_territorial desde comuna/distrito.
6. Backfill UserProfile.unidad_territorial desde comuna.

Convencion de codigos:
- NACIONAL
- REG-{numero_romano}  (ej. REG-XIII para region 13)
- D-{numero}           (ej. D-10 para distrito 10)
- COM-{codigo}         (ej. COM-13120 para Nunoa)
"""

from django.db import migrations


def crear_ut_y_backfill(apps, schema_editor):
    UT = apps.get_model("core", "UnidadTerritorial")
    Region = apps.get_model("core", "Region")
    Distrito = apps.get_model("core", "Distrito")
    Comuna = apps.get_model("core", "Comuna")
    Candidato = apps.get_model("core", "Candidato")
    UserProfile = apps.get_model("core", "UserProfile")

    # 1. Raiz nacional.
    nacional, _ = UT.objects.get_or_create(
        codigo="NACIONAL",
        defaults={"nombre": "Chile", "nivel": "nacional", "padre": None},
    )

    # 2. Regiones.
    ut_por_region = {}
    for region in Region.objects.all():
        ut, _ = UT.objects.update_or_create(
            codigo=f"REG-{region.numero_romano}",
            defaults={
                "nombre": region.nombre,
                "nivel": "regional",
                "padre": nacional,
                "metadata": {"codigo_region": region.codigo},
            },
        )
        ut_por_region[region.id] = ut

    # 3. Distritos.
    ut_por_distrito = {}
    for distrito in Distrito.objects.select_related("region"):
        ut, _ = UT.objects.update_or_create(
            codigo=f"D-{distrito.numero}",
            defaults={
                "nombre": distrito.nombre,
                "nivel": "distrital",
                "padre": ut_por_region.get(distrito.region_id, nacional),
                "metadata": {"numero_distrito": distrito.numero},
            },
        )
        ut_por_distrito[distrito.id] = ut

    # 4. Comunas.
    ut_por_comuna = {}
    for comuna in Comuna.objects.select_related("region", "distrito"):
        padre_ut = (
            ut_por_distrito.get(comuna.distrito_id)
            or ut_por_region.get(comuna.region_id)
            or nacional
        )
        ut, _ = UT.objects.update_or_create(
            codigo=f"COM-{comuna.codigo}",
            defaults={
                "nombre": comuna.nombre,
                "nivel": "comunal",
                "padre": padre_ut,
                "metadata": {"codigo_ine": comuna.codigo},
            },
        )
        ut_por_comuna[comuna.id] = ut

    # 5. Backfill Candidato.unidad_territorial.
    #    Usamos bulk_update pcia (podria ser 1200+ candidatos).
    candidatos_a_updatear = []
    for candidato in Candidato.objects.filter(unidad_territorial__isnull=True):
        if candidato.comuna_id:
            candidato.unidad_territorial = ut_por_comuna.get(candidato.comuna_id)
        elif candidato.distrito_id:
            candidato.unidad_territorial = ut_por_distrito.get(candidato.distrito_id)
        # Sin comuna ni distrito = nacional. Dejamos null por ahora
        # (representa "sin territorio especifico" = nacional).
        if candidato.unidad_territorial_id:
            candidatos_a_updatear.append(candidato)
    if candidatos_a_updatear:
        Candidato.objects.bulk_update(candidatos_a_updatear, ["unidad_territorial"])

    # 6. Backfill UserProfile.unidad_territorial desde comuna.
    perfiles_a_updatear = []
    for perfil in UserProfile.objects.filter(
        unidad_territorial__isnull=True, comuna__isnull=False,
    ):
        perfil.unidad_territorial = ut_por_comuna.get(perfil.comuna_id)
        if perfil.unidad_territorial_id:
            perfiles_a_updatear.append(perfil)
    if perfiles_a_updatear:
        UserProfile.objects.bulk_update(perfiles_a_updatear, ["unidad_territorial"])


def limpiar_ut(apps, schema_editor):
    UT = apps.get_model("core", "UnidadTerritorial")
    Candidato = apps.get_model("core", "Candidato")
    UserProfile = apps.get_model("core", "UserProfile")
    # Null los FKs primero para evitar PROTECT.
    Candidato.objects.update(unidad_territorial=None)
    UserProfile.objects.update(unidad_territorial=None)
    UT.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0035_unidadterritorial_candidato_unidad_territorial_and_more"),
    ]
    operations = [
        migrations.RunPython(crear_ut_y_backfill, limpiar_ut),
    ]
