"""Modelo UnidadTerritorial: catalogo polimorfico de unidades electorales.

Reemplaza el zoologico de FKs especificas (Candidato.comuna, Candidato.distrito,
futuro Candidato.region para senadores, Candidato.provincia para CORE) con un
unico FK a UnidadTerritorial.

Ventajas:
- Agregar un nuevo nivel electoral = crear filas en UnidadTerritorial. Cero
  migrations de schema.
- Jerarquia navegable via `padre` (comuna -> distrito -> region -> nacional).
- El filtro de matching territorial se generaliza: candidatos de mi comuna
  + de cualquier padre-de-mi-comuna + nacionales.

Convivencia con modelos concretos:
- Region, Distrito, Comuna siguen existiendo (utiles para queries especificas
  y admin). Se sincronizan via signals con la UnidadTerritorial correspondiente.
- Los FKs Candidato.comuna/distrito quedan como DEPRECATED pero funcionales.
"""

from django.db import models


class UnidadTerritorial(models.Model):
    NIVEL_NACIONAL = "nacional"
    NIVEL_REGIONAL = "regional"
    NIVEL_PROVINCIAL = "provincial"
    NIVEL_DISTRITAL = "distrital"
    NIVEL_COMUNAL = "comunal"
    NIVEL_CHOICES = [
        (NIVEL_NACIONAL, "Nacional"),
        (NIVEL_REGIONAL, "Regional"),
        (NIVEL_PROVINCIAL, "Provincial"),
        (NIVEL_DISTRITAL, "Distrital"),
        (NIVEL_COMUNAL, "Comunal"),
    ]

    codigo = models.CharField(
        max_length=32, unique=True,
        help_text="Codigo canonico. Ej: 'NACIONAL', 'REG-13', 'D-10', 'COM-13120'.",
    )
    nombre = models.CharField(max_length=128)
    nivel = models.CharField(max_length=16, choices=NIVEL_CHOICES)
    padre = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.PROTECT,
        related_name="hijos",
        help_text="Unidad de nivel superior. Ej: comuna -> distrito, distrito -> region.",
    )
    metadata = models.JSONField(
        default=dict, blank=True,
        help_text="Data extra: 'poblacion', 'codigo_ine', 'circunscripcion_senatorial', etc.",
    )

    class Meta:
        ordering = ["nivel", "nombre"]
        verbose_name = "Unidad territorial"
        verbose_name_plural = "Unidades territoriales"
        indexes = [
            models.Index(fields=["nivel"]),
            models.Index(fields=["padre"]),
        ]

    def __str__(self):
        return f"[{self.nivel}] {self.nombre}"

    def ancestros(self):
        """Devuelve la lista de padres desde el inmediato hasta la raiz.

        Ej: comuna Nunoa -> [distrito 10, region metropolitana, nacional].
        Util para el filtro de matching territorial.
        """
        ancestros = []
        actual = self.padre
        while actual is not None:
            ancestros.append(actual)
            actual = actual.padre
        return ancestros

    def descendientes_ids(self):
        """Devuelve set con los ids de todos los descendientes (recursivo).

        Ej: region metropolitana -> ids de todos sus distritos y comunas.
        """
        ids = set()
        stack = list(self.hijos.values_list("id", flat=True))
        while stack:
            hijo_id = stack.pop()
            if hijo_id in ids:
                continue
            ids.add(hijo_id)
            stack.extend(
                UnidadTerritorial.objects.filter(padre_id=hijo_id)
                .values_list("id", flat=True)
            )
        return ids
