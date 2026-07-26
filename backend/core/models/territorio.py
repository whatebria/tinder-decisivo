"""Modelo territorial de Chile: regiones, distritos electorales y comunas.

Base para filtrar candidatos por elecciones territoriales (Diputados por
distrito, Alcaldes por comuna). No incluye circunscripciones senatoriales
ni provinciales del CORE (fuera de scope del MVP: solo cubrimos Presidencial
+ Diputados + Alcalde).

Fuente de datos:
- Regiones: DL 575 (division politica administrativa de Chile).
- Distritos electorales: Ley 20.840 de 2015 + Ley 21.073 de 2018.
- Comunas: catalogo INE / codigos Servel.
"""

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Region(models.Model):
    """Region politica-administrativa de Chile (16 en total)."""

    numero_romano = models.CharField(
        max_length=5, unique=True,
        help_text="I, II, III... o 'RM' para Region Metropolitana.",
    )
    codigo = models.CharField(
        max_length=2, unique=True,
        help_text="Codigo oficial INE de 2 digitos (ej. '01', '13').",
    )
    nombre = models.CharField(max_length=100, unique=True)
    nombre_corto = models.CharField(
        max_length=20, blank=True, default="",
        help_text="Abreviatura para UI (ej. 'AyP', 'RM', 'BioBio').",
    )
    orden = models.IntegerField(
        default=0,
        help_text="Orden geografico norte-sur para presentacion en UI.",
    )

    class Meta:
        app_label = "core"
        verbose_name = "Region"
        verbose_name_plural = "Regiones"
        ordering = ["orden"]

    def __str__(self):
        return self.nombre


class Distrito(models.Model):
    """Distrito electoral para eleccion de Diputados (28 distritos)."""

    numero = models.IntegerField(
        unique=True,
        help_text="Numero oficial del distrito (1 al 28).",
    )
    nombre = models.CharField(
        max_length=100,
        help_text="Nombre descriptivo (ej. 'Distrito 10 - Santiago Centro').",
    )
    region = models.ForeignKey(
        Region, on_delete=models.PROTECT, related_name="distritos",
        help_text="Region a la que pertenece. Un distrito no cruza regiones.",
    )
    escanos = models.IntegerField(
        default=0,
        help_text="Cantidad de diputados que elige este distrito.",
    )

    class Meta:
        app_label = "core"
        verbose_name = "Distrito electoral"
        verbose_name_plural = "Distritos electorales"
        ordering = ["numero"]

    def __str__(self):
        return f"D{self.numero} - {self.nombre}"


class Comuna(models.Model):
    """Comuna: 346 en Chile, cada una pertenece a una region y un distrito."""

    codigo = models.CharField(
        max_length=5, unique=True,
        help_text="Codigo oficial de comuna (5 digitos SUBDERE).",
    )
    nombre = models.CharField(max_length=100)
    region = models.ForeignKey(
        Region, on_delete=models.PROTECT, related_name="comunas",
    )
    distrito = models.ForeignKey(
        Distrito, on_delete=models.PROTECT, related_name="comunas",
        help_text="Distrito electoral al que pertenece la comuna.",
    )

    class Meta:
        app_label = "core"
        verbose_name = "Comuna"
        verbose_name_plural = "Comunas"
        ordering = ["region__orden", "nombre"]
        constraints = [
            # No puede haber dos comunas con el mismo nombre en la misma region.
            # (Nombres duplicados entre regiones si existen, ej. 'Los Angeles'.)
            models.UniqueConstraint(
                fields=["nombre", "region"], name="unique_comuna_por_region"
            ),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.region.nombre_corto or self.region.numero_romano})"


# ----------------------------------------------------------------------------
# Signals: mantener UnidadTerritorial sincronizada con Region/Distrito/Comuna.
# ----------------------------------------------------------------------------
# Cuando el seed_territorio_chile crea las 16+28+346 filas, estos signals
# crean automaticamente la UT correspondiente con jerarquia. Idempotente.
@receiver(post_save, sender=Region)
def _upsert_ut_region(sender, instance, created, **kwargs):
    # Solo crear/actualizar UT si es una fila nueva. Para updates de metadata
    # del Region, correr el mgmt command 'sync_unidades_territoriales'.
    if not created:
        return
    from .unidad_territorial import UnidadTerritorial
    nacional, _ = UnidadTerritorial.objects.get_or_create(
        codigo="NACIONAL",
        defaults={"nombre": "Chile", "nivel": "nacional"},
    )
    UnidadTerritorial.objects.get_or_create(
        codigo=f"REG-{instance.numero_romano}",
        defaults={
            "nombre": instance.nombre,
            "nivel": "regional",
            "padre": nacional,
            "metadata": {"codigo_region": instance.codigo},
        },
    )


@receiver(post_save, sender=Distrito)
def _upsert_ut_distrito(sender, instance, created, **kwargs):
    if not created:
        return
    from .unidad_territorial import UnidadTerritorial
    padre_ut = UnidadTerritorial.objects.filter(
        codigo=f"REG-{instance.region.numero_romano}",
    ).first()
    UnidadTerritorial.objects.get_or_create(
        codigo=f"D-{instance.numero}",
        defaults={
            "nombre": instance.nombre,
            "nivel": "distrital",
            "padre": padre_ut,
            "metadata": {"numero_distrito": instance.numero},
        },
    )


@receiver(post_save, sender=Comuna)
def _upsert_ut_comuna(sender, instance, created, **kwargs):
    if not created:
        return
    from .unidad_territorial import UnidadTerritorial
    padre_ut = UnidadTerritorial.objects.filter(
        codigo=f"D-{instance.distrito.numero}",
    ).first()
    UnidadTerritorial.objects.get_or_create(
        codigo=f"COM-{instance.codigo}",
        defaults={
            "nombre": instance.nombre,
            "nivel": "comunal",
            "padre": padre_ut,
            "metadata": {"codigo_ine": instance.codigo},
        },
    )
