from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self) -> None:
        # WAL (Write-Ahead Logging): permite reads concurrentes durante escrituras.
        # Sin WAL, SQLite bloquea TODOS los readers mientras hay un writer activo,
        # lo que provoca "database is locked" bajo carga concurrente minima (ej: dev server
        # con hot-reload + request en vuelo).
        #
        # PRAGMA synchronous=NORMAL: reduce fsync a lo necesario sin sacrificar
        # durabilidad ante fallo de proceso (solo falla ante crash del OS, aceptable en dev).
        #
        # Referencia: https://www.sqlite.org/wal.html
        from django.db.backends.signals import connection_created

        def _activate_wal(sender, connection, **kwargs):
            if connection.vendor == "sqlite":
                cursor = connection.cursor()
                cursor.execute("PRAGMA journal_mode=WAL;")
                cursor.execute("PRAGMA synchronous=NORMAL;")

        connection_created.connect(_activate_wal)
