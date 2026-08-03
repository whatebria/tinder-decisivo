"""Catalogo electoral: tipos de eleccion y candidatos."""

from django.db import models
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class TipoEleccion(models.Model):
    nombre = models.CharField(
        max_length=100, unique=True,
        help_text="Ej: Presidencial, Parlamentaria , Regional, Municipal",
    )
    descripcion = models.TextField(
        blank=True, null=True,
        help_text="Descripciòn breve del tipo de eleccion",
    )
    fecha_eleccion = models.DateField(
        null=True, blank=True,
        help_text="Fecha oficial de la eleccion",
    )
    anio = models.IntegerField(
        null=True, blank=True,
        help_text=(
            "Ano electoral (ej. 2021, 2025). Permite tener multiples versiones "
            "del mismo tipo (Presidencial 2021 vs Presidencial 2025) y filtrar."
        ),
    )
    es_base = models.BooleanField(
        default=False,
        help_text=(
            "Si es True, las preguntas de este tipo se agregan a TODAS las elecciones. "
            "Usado para preguntas transversales de valores/ideologia que se responden una sola vez."
        ),
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Tipos de elección"

    def __str__(self):
        return self.nombre


class Candidato(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True, default="")
    partido = models.CharField(max_length=200, help_text="Nombre del partido politico")
    bio = models.TextField(blank=True, null=True, help_text="Breve descripción")
    ciudad = models.CharField(max_length=100, blank=True, default="")
    propuesta_electoral = models.TextField(
        help_text="Resumen o texto principal de su propuesta electoral."
    )
    lista_electoral = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Pacto o lista electoral a la que pertenece el candidato (ej. 'C. Unidad por Chile').",
    )
    # --- Datos oficiales (enriquecidos desde API Senado / fuentes externas) ---
    parlid = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="ID oficial del parlamentario en el sistema del Senado/Camara.",
    )
    email = models.EmailField(
        blank=True,
        default="",
        help_text="Email de contacto oficial.",
    )
    curriculum_url = models.URLField(
        blank=True,
        default="",
        help_text="URL al curriculum oficial en senado.cl o camara.cl.",
    )
    fono = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Teléfono de contacto oficial.",
    )
    profile_picture = models.ImageField(default="assets/default.avif", upload_to="profiles/")
    tipos_eleccion = models.ManyToManyField(TipoEleccion, related_name="candidatos")

    # Scope territorial polimorfico. Nulo = candidato nacional (ej. Presidencial).
    # Alcaldes usan UT nivel=comunal, diputados UT nivel=distrital, senadores
    # (a futuro) UT nivel=regional. Un solo FK para todos los niveles.
    unidad_territorial = models.ForeignKey(
        "UnidadTerritorial", on_delete=models.PROTECT,
        related_name="candidatos",
        null=True, blank=True,
        help_text=(
            "Unidad territorial polimorfica. Permite escalar a senadores "
            "(regional), CORE (provincial), etc. sin agregar FKs nuevos."
        ),
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Candidatos"

    @property
    def alcance_territorial(self) -> str:
        """Etiqueta legible del alcance: 'nacional', 'comunal', 'distrital', etc.

        Lee del nivel de `unidad_territorial`. Sin UT = nacional.
        """
        if not self.unidad_territorial_id:
            return "nacional"
        # nivel es 'comunal'/'distrital'/'regional'/'provincial'/'nacional'
        # y ya sirve como etiqueta legible directa.
        return self.unidad_territorial.nivel

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


# NOTA: no hay signal Candidato.pre_save para sincronizar unidad_territorial.
# Los seeds y los importers setean el FK explicitamente. Si se crea un
# Candidato manualmente desde el admin sin UT, queda con
# `alcance_territorial="nacional"`.


# ----------------------------------------------------------------------------
# Signal: invalidar cache de tipos base cuando TipoEleccion cambia.
# ----------------------------------------------------------------------------
# El cache de `get_base_tipo_ids()` tiene TTL 1h. Este signal lo tira antes
# si alguien crea/edita/borra un TipoEleccion, garantizando cero staleness.
# Se dispara para TODO save/delete (aunque es_base no haya cambiado): es mas
# barato que trackear el diff y correcto siempre. Los TipoEleccion se editan
# una vez cada anios, no es hot path.
@receiver(post_save, sender=TipoEleccion)
@receiver(post_delete, sender=TipoEleccion)
def _invalidar_cache_tipos_base(sender, instance, **kwargs):
    # Import local para evitar circular (services -> models -> services).
    from ..services.tipos import invalidar_cache_base_tipo_ids
    invalidar_cache_base_tipo_ids()
