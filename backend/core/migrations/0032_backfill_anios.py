"""Backfill: asigna anio a los TipoEleccion existentes."""

from django.db import migrations


def asignar_anios(apps, schema_editor):
    TipoEleccion = apps.get_model("core", "TipoEleccion")
    # Heuristica por nombre; si el nombre contiene ano, usar ese. Si no, defaults.
    mapping = {
        "Presidencial": 2021,          # se creo con los candidatos 2021
        "Parlamentaria 2025": 2025,
    }
    for tipo in TipoEleccion.objects.all():
        # Si el nombre tiene un ano explicito (4 digitos), usarlo.
        for token in tipo.nombre.split():
            if token.isdigit() and len(token) == 4:
                tipo.anio = int(token)
                break
        else:
            tipo.anio = mapping.get(tipo.nombre)
        tipo.save(update_fields=["anio"])


def limpiar_anios(apps, schema_editor):
    TipoEleccion = apps.get_model("core", "TipoEleccion")
    TipoEleccion.objects.update(anio=None)


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0031_tipoeleccion_anio"),
    ]
    operations = [
        migrations.RunPython(asignar_anios, limpiar_anios),
    ]
