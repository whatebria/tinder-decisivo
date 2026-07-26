"""
Fetch de noticias por candidato desde Google News RSS.

Google News expone un RSS de busqueda publico (sin API key ni registro):

    https://news.google.com/rss/search?q=<query>&hl=es-CL&gl=CL&ceid=CL:es-419

Este comando itera sobre los candidatos (todos o solo el especificado con --candidato-id),
arma un query por candidato, parsea el RSS con feedparser, y crea/actualiza `Noticia`s
en la DB linkeadas al candidato via el M2M `candidatos_mencionados`.

Idempotente por `url` (unique constraint parcial).

Uso:
    uv run python manage.py fetch_noticias
    uv run python manage.py fetch_noticias --candidato-id 3
    uv run python manage.py fetch_noticias --max 5
    uv run python manage.py fetch_noticias --dry-run
"""

import logging
from urllib.parse import quote_plus

import feedparser
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato, Noticia

logger = logging.getLogger(__name__)

GOOGLE_NEWS_RSS = (
    "https://news.google.com/rss/search"
    "?q={query}&hl=es-CL&gl=CL&ceid=CL:es-419"
)


class Command(BaseCommand):
    help = "Fetch de noticias por candidato desde Google News RSS."

    def add_arguments(self, parser):
        parser.add_argument(
            "--candidato-id", type=int, default=None,
            help="Solo procesar el candidato con este id (default: todos).",
        )
        parser.add_argument(
            "--max", type=int, default=10,
            help="Maximo de noticias a guardar por candidato (default: 10).",
        )
        parser.add_argument(
            "--extra-keyword", type=str, default="candidato",
            help="Palabra extra al buscar. Reduce falsos positivos (default: 'candidato').",
        )
        parser.add_argument(
            "--dry-run", action="store_true",
            help="No escribe en DB. Solo reporta lo que haria.",
        )

    def handle(self, *args, **options):
        cand_id = options["candidato_id"]
        candidatos = (
            Candidato.objects.filter(id=cand_id)
            if cand_id else Candidato.objects.all()
        )
        if not candidatos.exists():
            raise CommandError("No hay candidatos que procesar.")

        stats = {"total_procesados": 0, "creadas": 0, "actualizadas": 0, "linkeadas": 0}

        with transaction.atomic():
            sp = transaction.savepoint()
            for candidato in candidatos:
                created, linked = self._fetch_para_candidato(
                    candidato,
                    max_items=options["max"],
                    extra_keyword=options["extra_keyword"],
                )
                stats["total_procesados"] += 1
                stats["creadas"] += created["creadas"]
                stats["actualizadas"] += created["actualizadas"]
                stats["linkeadas"] += linked

            if options["dry_run"]:
                transaction.savepoint_rollback(sp)
                self.stdout.write(self.style.WARNING("DRY-RUN: cambios revertidos."))
            else:
                transaction.savepoint_commit(sp)

        self._resumen(stats)

    # ---------------------------------------------------------
    def _fetch_para_candidato(self, candidato, max_items, extra_keyword):
        query = f'"{candidato.nombre} {candidato.apellido}" {extra_keyword}'.strip()
        url = GOOGLE_NEWS_RSS.format(query=quote_plus(query))

        self.stdout.write(f"-> {candidato}: fetching '{query}'...")

        feed = feedparser.parse(url)
        if feed.bozo and not feed.entries:
            self.stderr.write(self.style.WARNING(
                f"   Sin resultados o feed invalido para {candidato}"
            ))
            return {"creadas": 0, "actualizadas": 0}, 0

        entries = feed.entries[:max_items]
        creadas = 0
        actualizadas = 0
        linkeadas = 0

        for entry in entries:
            noticia_url = getattr(entry, "link", "").strip()
            titulo = getattr(entry, "title", "").strip()[:300]
            descripcion = getattr(entry, "summary", "").strip() or titulo
            fuente = ""
            if hasattr(entry, "source") and hasattr(entry.source, "title"):
                fuente = entry.source.title[:200]
            else:
                fuente = "Google News"

            if not noticia_url or not titulo:
                continue

            noticia, created = Noticia.objects.update_or_create(
                url=noticia_url,
                defaults={
                    "titulo": titulo,
                    "descripcion": descripcion,
                    "fuente": fuente,
                },
            )
            if created:
                creadas += 1
            else:
                actualizadas += 1

            # Idempotente: add() no duplica en M2M
            if not noticia.candidatos_mencionados.filter(pk=candidato.pk).exists():
                noticia.candidatos_mencionados.add(candidato)
                linkeadas += 1

        return {"creadas": creadas, "actualizadas": actualizadas}, linkeadas

    def _resumen(self, stats):
        self.stdout.write(self.style.SUCCESS("\nFetch completo."))
        self.stdout.write(f"  Candidatos procesados: {stats['total_procesados']}")
        self.stdout.write(f"  Noticias creadas:      {stats['creadas']}")
        self.stdout.write(f"  Noticias actualizadas: {stats['actualizadas']}")
        self.stdout.write(f"  Links candidato-noticia creados: {stats['linkeadas']}")
