"""Limpia tokens de auth vencidos (mas viejos que TOKEN_TTL_DAYS).

Para correr como cron / task periodica (diario o semanal es suficiente).

Uso:
    python manage.py limpiar_tokens_viejos
    python manage.py limpiar_tokens_viejos --dry-run
    python manage.py limpiar_tokens_viejos --ttl 60
"""

from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = "Borra tokens de auth con `created` anterior al TTL configurado."

    def add_arguments(self, parser):
        parser.add_argument(
            "--ttl",
            type=int,
            default=None,
            help="Override de TOKEN_TTL_DAYS (default: settings.TOKEN_TTL_DAYS o 30).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Solo reporta cuantos se borrarian, no borra.",
        )

    def handle(self, *args, **options):
        ttl = options["ttl"] or getattr(settings, "TOKEN_TTL_DAYS", 30)
        limite = timezone.now() - timedelta(days=ttl)

        qs = Token.objects.filter(created__lt=limite)
        count = qs.count()

        if options["dry_run"]:
            self.stdout.write(
                self.style.WARNING(
                    f"[dry-run] Se borrarian {count} tokens creados antes de {limite:%Y-%m-%d %H:%M}."
                )
            )
            return

        deleted, _ = qs.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Borrados {deleted} tokens vencidos (TTL={ttl} dias)."
            )
        )
