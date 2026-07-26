from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0018_noticia_actualizado_en"),
    ]

    operations = [
        migrations.RenameField(
            model_name="candidato",
            old_name="perfile_picture",
            new_name="profile_picture",
        ),
        migrations.AlterUniqueTogether(
            name="noticia",
            unique_together=set(),
        ),
    ]
