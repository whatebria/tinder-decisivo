"""Catalogo electoral: tipos de eleccion y candidatos."""

from django.core.exceptions import ValidationError
from django.db import models

from .territorio import Comuna, Distrito


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
    profile_picture = models.ImageField(default="assets/default.avif", upload_to="profiles/")
    tipos_eleccion = models.ManyToManyField(TipoEleccion, related_name="candidatos")

    # Scope territorial. Nulos = candidato nacional (ej. Presidencial).
    # Alcaldes usan `comuna`. Diputados usan `distrito`. Un candidato solo
    # deberia tener uno de los dos, o ninguno para nacional.
    comuna = models.ForeignKey(
        Comuna, on_delete=models.PROTECT, related_name="candidatos",
        null=True, blank=True,
        help_text="Comuna en la que compite (alcaldes/concejales). Null si es nacional o distrital.",
    )
    distrito = models.ForeignKey(
        Distrito, on_delete=models.PROTECT, related_name="candidatos",
        null=True, blank=True,
        help_text="Distrito en el que compite (diputados). Null si es nacional o comunal.",
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Candidatos"
        constraints = [
            # Un candidato compite en un solo territorio: nacional, distrito o
            # comuna. Nunca dos a la vez.
            models.CheckConstraint(
                condition=~(
                    models.Q(comuna__isnull=False) & models.Q(distrito__isnull=False)
                ),
                name="candidato_no_comuna_y_distrito_a_la_vez",
            ),
        ]

    def clean(self):
        # Redundante con el CheckConstraint pero da un mensaje amigable
        # en el admin/forms antes de golpear la DB.
        if self.comuna_id and self.distrito_id:
            raise ValidationError(
                "Un candidato no puede tener comuna Y distrito al mismo tiempo. "
                "Usa comuna para alcaldes, distrito para diputados, ninguno para presidenciales."
            )

    @property
    def alcance_territorial(self) -> str:
        """Etiqueta legible del alcance: 'nacional', 'distrital' o 'comunal'."""
        if self.comuna_id:
            return "comunal"
        if self.distrito_id:
            return "distrital"
        return "nacional"

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
