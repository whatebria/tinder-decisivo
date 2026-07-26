"""Catalogo electoral: tipos de eleccion y candidatos."""

from django.db import models


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

    class Meta:
        app_label = "core"
        verbose_name_plural = "Candidatos"

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
