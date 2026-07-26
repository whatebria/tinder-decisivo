"""Contenido asociado a candidatos: noticias."""

from django.db import models


class Noticia(models.Model):
    titulo = models.CharField(max_length=300)
    descripcion = models.TextField()
    url = models.URLField(
        max_length=1000, blank=True, default="",
        help_text="Link al articulo original. Se usa como clave logica para dedup.",
    )
    fuente = models.CharField(
        max_length=200, blank=True, default="",
        help_text="Medio de origen: 'Google News', 'La Tercera', 'Emol', etc.",
    )
    imagen_url = models.URLField(
        max_length=1000, blank=True, default="",
        help_text="URL del thumbnail (opcional).",
    )
    candidatos_mencionados = models.ManyToManyField(
        "core.Candidato", related_name="noticias", blank=True,
        help_text="Candidatos referenciados por esta noticia.",
    )
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Noticias"
        ordering = ["-fecha_publicacion"]
        constraints = [
            models.UniqueConstraint(
                fields=["url"],
                condition=~models.Q(url=""),
                name="noticia_url_unique_when_not_empty",
            ),
        ]

    def __str__(self):
        return self.titulo
