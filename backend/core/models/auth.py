"""Modelos de autenticacion adicionales (tokens de reset de password)."""

from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class PasswordResetToken(models.Model):
    """Token single-use para reset de password.

    - Expira a las TTL horas de creado.
    - Se marca como usado despues del reset (no se borra: audit trail).
    - Un mismo user puede tener multiples tokens activos, pero solo el mas
      reciente es "el vigente" (los otros quedan huerfanos, expiran solos).
    """

    TTL_HOURS = 1

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Password Reset Tokens"
        ordering = ["-created_at"]

    def __str__(self):
        estado = "usado" if self.used_at else ("expirado" if self.is_expired else "vigente")
        return f"Reset token de {self.user.username} ({estado})"

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @property
    def is_used(self) -> bool:
        return self.used_at is not None

    @property
    def is_valid(self) -> bool:
        return not self.is_used and not self.is_expired

    @classmethod
    def default_expires_at(cls):
        return timezone.now() + timedelta(hours=cls.TTL_HOURS)
