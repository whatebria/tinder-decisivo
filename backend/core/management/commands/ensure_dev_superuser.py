"""
Crea un superusuario de desarrollo si no existe ninguno.

Solo funciona con DEBUG=True. En produccion lanza error inmediato
para evitar que alguien lo ejecute por accidente.

Credenciales por defecto (sobreescribibles via env):
    DJANGO_DEV_SUPERUSER_USERNAME  (default: admin)
    DJANGO_DEV_SUPERUSER_EMAIL     (default: admin@localhost)
    DJANGO_DEV_SUPERUSER_PASSWORD  (default: admin1234)

Uso:
    python manage.py ensure_dev_superuser
    python manage.py ensure_dev_superuser --reset   # fuerza nueva password
"""
from __future__ import annotations

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from decouple import config as env_config

DEFAULT_USERNAME = "admin"
DEFAULT_EMAIL = "admin@localhost"
DEFAULT_PASSWORD = "admin1234"


class Command(BaseCommand):
    help = "Crea superusuario de desarrollo (solo DEBUG=True)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Si el superusuario ya existe, actualiza su password al default.",
        )

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError(
                "Este comando solo puede ejecutarse con DEBUG=True. "
                "Para crear un superusuario en produccion usa: "
                "python manage.py createsuperuser"
            )

        username = env_config("DJANGO_DEV_SUPERUSER_USERNAME", default=DEFAULT_USERNAME)
        email = env_config("DJANGO_DEV_SUPERUSER_EMAIL", default=DEFAULT_EMAIL)
        password = env_config("DJANGO_DEV_SUPERUSER_PASSWORD", default=DEFAULT_PASSWORD)

        user = User.objects.filter(username=username).first()

        if user is None:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(
                f"Superusuario creado: {username} / {password}"
            ))
        elif opts["reset"]:
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f"Password reseteada para '{username}': {password}"
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"El superusuario '{username}' ya existe. "
                "Usa --reset para regenerar la password."
            ))
