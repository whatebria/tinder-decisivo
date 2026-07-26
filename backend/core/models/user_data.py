"""Bookmarking del usuario: favoritos, descartados, decision final."""

from django.contrib.auth.models import User
from django.db import models

from .electoral import Candidato, TipoEleccion


class CandidatoFavorito(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favoritos")
    candidato = models.ForeignKey(Candidato, on_delete=models.CASCADE)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Candidatos Favoritos"
        unique_together = ("user", "candidato")

    def __str__(self):
        return (
            f"{self.user.username} - Favorito: "
            f"{self.candidato.nombre} {self.candidato.apellido}"
        )


class CandidatoDescartado(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="descartados")
    candidato = models.ForeignKey(Candidato, on_delete=models.CASCADE)
    fecha_descartado = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Candidatos Descartados"
        unique_together = ("user", "candidato")

    def __str__(self):
        return (
            f"{self.user.username} - Descartado: "
            f"{self.candidato.nombre} {self.candidato.apellido}"
        )


class DecisionFinal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="decisiones_finales")
    candidato_elegido = models.ForeignKey(
        Candidato, on_delete=models.CASCADE, related_name="elegido_por_usuarios"
    )
    tipo_eleccion = models.ForeignKey(TipoEleccion, on_delete=models.CASCADE)
    fecha_decision = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Decisiones Finales"
        unique_together = ("user", "tipo_eleccion")

    def __str__(self):
        return (
            f"{self.user.username} eligió a {self.candidato_elegido.nombre} "
            f"para {self.tipo_eleccion.nombre}"
        )
