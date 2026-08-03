import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")
django.setup()

from core.models import Candidato, TipoEleccion

print("=== TipoEleccion con 'residen' o 'Presiden' ===")
for t in TipoEleccion.objects.filter(nombre__icontains="presiden"):
    print(f"  [{t.id}] {t.nombre!r} | candidatos={t.candidatos.count()}")

print("\n=== Candidatos presidenciales y sus tipos ===")
for c in Candidato.objects.filter(nombre__in=["Jose Antonio", "Jeannette", "Evelyn", "Franco", "Johannes", "Harold", "Marco", "Eduardo"]).order_by("nombre"):
    tipos = list(c.tipos_eleccion.values_list("nombre", flat=True))
    print(f"  {c.nombre} {c.apellido} | lista={c.lista_electoral!r} | tipos={tipos}")
