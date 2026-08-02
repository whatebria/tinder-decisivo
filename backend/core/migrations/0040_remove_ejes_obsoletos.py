"""Elimina los ejes OTRO, PUEBLOS_ORIGINARIOS y DISCAPACIDAD.

Esos ejes fueron borrados del producto. Las preguntas que tenian esos
ejes ya fueron reasignadas a los ejes canonicos restantes antes de
correr esta migracion:
  - DISCAPACIDAD  -> ECONOMIA
  - PUEBLOS_ORIGINARIOS -> DDHH / SOCIEDAD
  - OTRO          -> (sin preguntas activas)
"""

from django.db import migrations, models


EJES_A_BORRAR = {"OTRO", "PUEBLOS_ORIGINARIOS", "DISCAPACIDAD"}


def eliminar_ejes_obsoletos(apps, schema_editor):
    Eje = apps.get_model("core", "Eje")
    deleted, _ = Eje.objects.filter(codigo__in=EJES_A_BORRAR).delete()
    if deleted:
        print(f"  Ejes eliminados: {deleted}")


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0039_add_pueblos_originarios_discapacidad_ejes"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pregunta",
            name="eje_tematico",
            field=models.CharField(
                choices=[
                    ("ECONOMIA", "Economia"),
                    ("SOCIEDAD", "Sociedad"),
                    ("AMBIENTE", "Ambiente"),
                    ("SEGURIDAD", "Seguridad"),
                    ("DDHH", "Derechos Humanos"),
                    ("INTERNACIONAL", "Politica Internacional"),
                    ("INSTITUCIONAL", "Reforma Institucional"),
                ],
                default="INSTITUCIONAL",
                help_text="Categoria tematica de la pregunta. Sirve para el match por eje.",
                max_length=24,
            ),
        ),
        migrations.RunPython(eliminar_ejes_obsoletos, migrations.RunPython.noop),
    ]
