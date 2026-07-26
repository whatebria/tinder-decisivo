"""Backfill: crea UserProfile para todos los users que ya existen en DB.

El signal de 0029 solo dispara en nuevos users. Este data-migration cierra
la brecha para cuentas creadas antes de la feature.
"""

from django.db import migrations


def crear_profiles_faltantes(apps, schema_editor):
    User = apps.get_model("auth", "User")
    UserProfile = apps.get_model("core", "UserProfile")
    for user in User.objects.all():
        UserProfile.objects.get_or_create(user=user)


def borrar_profiles(apps, schema_editor):
    UserProfile = apps.get_model("core", "UserProfile")
    UserProfile.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0029_userprofile"),
    ]
    operations = [
        migrations.RunPython(crear_profiles_faltantes, borrar_profiles),
    ]
