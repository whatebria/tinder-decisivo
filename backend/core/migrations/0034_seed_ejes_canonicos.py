"""Poblar catalogo Eje con los 8 canonicos + backfill Pregunta.eje_id."""

from django.db import migrations

EJES_CANONICOS = [
    # (codigo, nombre, color, orden)
    ("ECONOMIA", "Economia", "#F59E0B", 1),
    ("SOCIEDAD", "Sociedad", "#8B5CF6", 2),
    ("AMBIENTE", "Ambiente", "#10B981", 3),
    ("SEGURIDAD", "Seguridad", "#EF4444", 4),
    ("DDHH", "Derechos Humanos", "#EC4899", 5),
    ("INTERNACIONAL", "Politica Internacional", "#3B82F6", 6),
    ("INSTITUCIONAL", "Reforma Institucional", "#6366F1", 7),
    ("OTRO", "Otro", "#6B7280", 99),
]


def crear_ejes_y_backfill(apps, schema_editor):
    Eje = apps.get_model("core", "Eje")
    Pregunta = apps.get_model("core", "Pregunta")

    # 1. Crear los 8 ejes canonicos (idempotente).
    ejes_por_codigo = {}
    for codigo, nombre, color, orden in EJES_CANONICOS:
        eje, _ = Eje.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "color": color, "orden": orden},
        )
        ejes_por_codigo[codigo.upper()] = eje

    # 2. Auto-crear ejes desde strings arbitrarios existentes (ej. tests con
    #    "economia" en minuscula, "cultural", etc.).
    codigos_en_uso = set(
        Pregunta.objects.exclude(eje_tematico__in=("", None))
        .values_list("eje_tematico", flat=True)
        .distinct()
    )
    for c in codigos_en_uso:
        key = c.upper()
        if key not in ejes_por_codigo:
            eje, _ = Eje.objects.get_or_create(
                codigo=key,
                defaults={"nombre": c.capitalize(), "color": "#666666", "orden": 50},
            )
            ejes_por_codigo[key] = eje

    # 3. Backfill Pregunta.eje_id.
    for pregunta in Pregunta.objects.all():
        key = (pregunta.eje_tematico or "OTRO").upper()
        eje = ejes_por_codigo.get(key) or ejes_por_codigo["OTRO"]
        pregunta.eje_id = eje.id
        pregunta.save(update_fields=["eje"])


def limpiar_ejes(apps, schema_editor):
    Eje = apps.get_model("core", "Eje")
    Eje.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0033_eje_pregunta_eje"),
    ]
    operations = [
        migrations.RunPython(crear_ejes_y_backfill, limpiar_ejes),
    ]
