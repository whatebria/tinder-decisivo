"""
Resuelve el duplicado de ordenes 1-8 en el tipo de eleccion base.

Analisis de los pares duplicados:
  REWRITES (misma pregunta, mejor redaccion):
    id=1 -> id=14  (Estado/economia: reducir vs corregir desigualdades)
    id=2 -> id=15  (impuestos progresivos)
    id=3 -> id=16  (aborto libre / interrupcion embarazo)
    id=4 -> id=17  (matrimonio y adopcion mismo sexo)
    id=6 -> id=19  (priorizar medio ambiente)

  PREGUNTAS DIFERENTES que colisionaron en el mismo orden por error:
    id=5  (orden=5, SEGURIDAD: mano dura ante crimen)
    id=18 (orden=5, SOCIEDAD: eutanasia)  <- se renumera a orden 18

    id=7  (orden=7, INSTITUCIONAL: descentralizacion regional)
    id=20 (orden=7, SEGURIDAD: rehabilitacion penal)  <- se renumera a orden 19

    id=8  (orden=8, SEGURIDAD: migracion restrictiva)
    id=21 (orden=8, SEGURIDAD: armas civiles)  <- se renumera a orden 20

Acciones:
  REWRITES: migra RespuestaUsuario/PosturaCandidato de vieja -> nueva,
             luego borra la pregunta vieja (y sus opciones).
  COLISIONES: renumera la segunda pregunta a un orden libre (18, 19, 20).
              Las respuestas existentes se quedan donde estan.

Solo funciona en DEBUG=True para evitar accidentes en produccion.

Uso:
    python manage.py dedup_preguntas_base --dry-run
    python manage.py dedup_preguntas_base
"""
from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

# (id_viejo, id_nuevo, es_rewrite)
# es_rewrite=True  -> misma pregunta, se migran respuestas y se borra la vieja
# es_rewrite=False -> temas distintos; solo se renumera el id_nuevo a un orden libre
PARES: list[tuple[int, int, bool]] = [
    (1,  14, True),
    (2,  15, True),
    (3,  16, True),
    (4,  17, True),
    (5,  18, False),  # mano dura vs eutanasia: totalmente diferentes
    (6,  19, True),
    (7,  20, False),  # descentralizacion vs rehabilitacion penal: diferentes
    (8,  21, False),  # migracion vs armas civiles: diferentes
]
# Nuevos ordenes para las preguntas que colisionaron (sin rewrite)
NUEVOS_ORDENES = {18: 18, 20: 19, 21: 20}


class Command(BaseCommand):
    help = "Corrige ordenes duplicados en preguntas base: migra rewrites, renumera colisiones."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Muestra que haria sin escribir nada.",
        )

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError(
                "Comando de mantenimiento: solo disponible con DEBUG=True. "
                "En produccion ejecuta la migracion con supervision directa de DB."
            )

        from core.models import OpcionRespuesta, PosturaCandidato, Pregunta, RespuestaUsuario

        dry = opts["dry_run"]
        stats = {
            "resp_migradas": 0,
            "post_migradas": 0,
            "pregs_borradas": 0,
            "pregs_renumeradas": 0,
        }

        with transaction.atomic():
            for old_id, new_id, es_rewrite in PARES:
                try:
                    old_preg = Pregunta.objects.get(id=old_id)
                    new_preg = Pregunta.objects.get(id=new_id)
                except Pregunta.DoesNotExist as e:
                    self.stdout.write(self.style.WARNING(f"Pregunta no encontrada: {e}. Saltando."))
                    continue

                if es_rewrite:
                    self._procesar_rewrite(old_preg, new_preg, dry, stats)
                else:
                    self._procesar_colision(old_preg, new_preg, dry, stats)

            if dry:
                transaction.set_rollback(True)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Preguntas borradas (rewrites):     {stats['pregs_borradas']}"))
        self.stdout.write(self.style.SUCCESS(f"Preguntas renumeradas (colision):   {stats['pregs_renumeradas']}"))
        self.stdout.write(self.style.SUCCESS(f"RespuestaUsuario migradas:          {stats['resp_migradas']}"))
        self.stdout.write(self.style.SUCCESS(f"PosturaCandidato migradas:          {stats['post_migradas']}"))
        if dry:
            self.stdout.write(self.style.WARNING("Dry-run: no se escribio nada."))
        else:
            self.stdout.write(self.style.SUCCESS("Deduplicacion completada."))

    # ------------------------------------------------------------------
    def _procesar_rewrite(self, old_preg, new_preg, dry, stats):
        """Mismo tema, mejor redaccion. Migra respuestas a la nueva, borra la vieja."""
        self.stdout.write(
            f"\n[REWRITE] orden={old_preg.orden}"
            f"\n  VIEJA id={old_preg.id}: {old_preg.texto[:70]}"
            f"\n  NUEVA id={new_preg.id}: {new_preg.texto[:70]}"
        )

        from core.models import PosturaCandidato, RespuestaUsuario

        # RespuestaUsuario
        resps = list(RespuestaUsuario.objects.filter(pregunta=old_preg))
        if resps:
            self.stdout.write(f"  -> Migrar {len(resps)} RespuestaUsuario")
            if not dry:
                # Ids de usuarios que ya respondieron la nueva pregunta
                ya_en_nueva = set(
                    RespuestaUsuario.objects.filter(pregunta=new_preg)
                    .values_list("user_id", flat=True)
                )
                for resp in resps:
                    if resp.user_id in ya_en_nueva:
                        # El usuario ya tiene respuesta en la nueva: la vieja es redundante
                        self.stdout.write(
                            f"    user_id={resp.user_id} ya respondio la nueva. Borrando vieja."
                        )
                        resp.delete()
                        continue
                    nueva_op = new_preg.opciones_respuesta.filter(
                        valor=resp.opcion_elegida.valor,
                        es_no_se=resp.opcion_elegida.es_no_se,
                    ).first()
                    if nueva_op:
                        resp.pregunta = new_preg
                        resp.opcion_elegida = nueva_op
                        resp.save()
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  Sin opcion valor={resp.opcion_elegida.valor} en id={new_preg.id}. Borrada."
                            )
                        )
                        resp.delete()
            stats["resp_migradas"] += len(resps)

        # PosturaCandidato
        posts = list(PosturaCandidato.objects.filter(pregunta=old_preg))
        if posts:
            self.stdout.write(f"  -> Migrar {len(posts)} PosturaCandidato")
            if not dry:
                for post in posts:
                    nueva_op = new_preg.opciones_respuesta.filter(
                        valor=post.opcion_respuesta.valor, es_no_se=False
                    ).first()
                    if nueva_op:
                        post.pregunta = new_preg
                        post.opcion_respuesta = nueva_op
                        post.save()
                    else:
                        post.delete()
            stats["post_migradas"] += len(posts)

        # Borrar vieja
        self.stdout.write(f"  -> {'[DRY] ' if dry else ''}Borrar pregunta vieja id={old_preg.id}")
        if not dry:
            old_preg.opciones_respuesta.all().delete()
            old_preg.delete()
        stats["pregs_borradas"] += 1

    # ------------------------------------------------------------------
    def _procesar_colision(self, old_preg, new_preg, dry, stats):
        """Temas diferentes que colisionaron en el mismo orden. Renumera la nueva."""
        nuevo_orden = NUEVOS_ORDENES[new_preg.id]
        self.stdout.write(
            f"\n[COLISION] orden={old_preg.orden} tiene dos preguntas de temas distintos:"
            f"\n  MANTENER id={old_preg.id} orden={old_preg.orden}: {old_preg.texto[:70]}"
            f"\n  RENUMERAR id={new_preg.id} -> orden={nuevo_orden}: {new_preg.texto[:70]}"
        )
        if not dry:
            new_preg.orden = nuevo_orden
            new_preg.save(update_fields=["orden"])
        stats["pregs_renumeradas"] += 1
