"""Perfil extendido del usuario.

OneToOne con `auth.User` para agregar datos que no viven en el core de auth,
en particular la `comuna` donde vota. La comuna determina que candidatos
(alcalde, diputado, etc.) le corresponden al usuario.

Se crea automaticamente via signal cuando se registra un User nuevo.
"""

from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from .territorio import Comuna


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    comuna = models.ForeignKey(
        Comuna,
        on_delete=models.SET_NULL,
        related_name="votantes",
        null=True, blank=True,
        help_text=(
            "Comuna en la que vota el usuario. Determina que alcaldes y "
            "diputados le corresponden en el matching."
        ),
    )
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "core"
        verbose_name = "Perfil de usuario"
        verbose_name_plural = "Perfiles de usuario"

    def __str__(self):
        return f"Perfil de {self.user.username}"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def crear_profile_al_registrar_user(sender, instance, created, **kwargs):
    """Auto-crea UserProfile cuando se crea un User."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
