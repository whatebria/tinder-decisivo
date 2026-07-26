"""Modelo Eje: catalogo de ejes tematicos, gestionable desde admin sin migration.

Reemplaza el hardcoded EJES_CHOICES de Pregunta con un modelo real. El campo
`Pregunta.eje_tematico` (string) sigue siendo la fuente para el matching por
simplicidad, pero se sincroniza automaticamente con `Pregunta.eje` (FK) via signal.

Asi ganas:
- Agregar/editar ejes desde admin sin tocar codigo.
- Metadata rica: color (para radar chart), icono, orden, activo.
- Endpoint /ejes/ para el frontend.

Sin perder:
- Compat total con matching existente (usa string).
- Compat con serializers y tests que asumen eje_tematico string.
"""

from django.db import models


class Eje(models.Model):
    codigo = models.CharField(
        max_length=32, unique=True,
        help_text="Slug canonico. Ej: 'ECONOMIA', 'SALUD'. Se compara case-insensitive.",
    )
    nombre = models.CharField(
        max_length=64,
        help_text="Nombre para mostrar. Ej: 'Economia', 'Salud'.",
    )
    color = models.CharField(
        max_length=7, default="#666666",
        help_text="Color hex para el radar chart y badges. Ej: '#FFC220'.",
    )
    icono = models.CharField(
        max_length=32, blank=True, default="",
        help_text="Nombre de icono (Ionicons/Lucide). Opcional.",
    )
    orden = models.IntegerField(
        default=0,
        help_text="Orden de aparicion en el radar/UI.",
    )
    activo = models.BooleanField(
        default=True,
        help_text="Si esta desactivado, el eje sigue en DB pero no se muestra al usuario.",
    )
    descripcion = models.TextField(
        blank=True, default="",
        help_text="Descripcion educativa del eje. Se muestra en tooltips.",
    )

    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "Eje tematico"
        verbose_name_plural = "Ejes tematicos"

    def __str__(self):
        return f"{self.codigo} ({self.nombre})"
