"""Matching: posturas de candidatos y resultado del calculo."""

from django.contrib.auth.models import User
from django.db import models

from .cuestionario import OpcionRespuesta, Pregunta
from .electoral import Candidato


class PosturaCandidato(models.Model):
    candidato = models.ForeignKey(
        Candidato, on_delete=models.CASCADE, related_name="posturas_candidato"
    )
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE)
    opcion_respuesta = models.ForeignKey(OpcionRespuesta, on_delete=models.CASCADE)
    justificacion = models.TextField(
        blank=True, null=True,
        help_text="Breve justificación de la postura del candidato sobre el tema.",
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Posturas de Candidatos"
        unique_together = ("candidato", "pregunta")  # una postura por (candidato, pregunta)

    def __str__(self):
        return (
            f"{self.candidato.apellido} - {self.pregunta.texto[:30]}... "
            f"({self.opcion_respuesta.texto})"
        )


class MatchCandidato(models.Model):
    CONFIANZA_TENTATIVA = "tentativa"
    CONFIANZA_MEDIA = "media"
    CONFIANZA_ALTA = "alta"
    CONFIANZA_CHOICES = [
        (CONFIANZA_TENTATIVA, "Tentativa (pocos datos)"),
        (CONFIANZA_MEDIA, "Confianza media"),
        (CONFIANZA_ALTA, "Confianza alta"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_candidato")
    candidato = models.ForeignKey(Candidato, on_delete=models.CASCADE)
    match_percentage_value = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    num_preguntas_consideradas = models.IntegerField(default=0)
    breakdown_por_eje = models.JSONField(
        default=dict, blank=True,
        help_text="Dict eje -> {'porcentaje': X, 'preguntas': N}. Para radar chart en el frontend.",
    )
    confianza = models.CharField(
        max_length=15, choices=CONFIANZA_CHOICES, default=CONFIANZA_TENTATIVA
    )
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Matches de Candidatos"
        unique_together = ("user", "candidato")

    def __str__(self):
        return (
            f"Match de {self.user.username} con "
            f"{self.candidato.nombre} {self.candidato.apellido}: {self.match_percentage_value}%"
        )
