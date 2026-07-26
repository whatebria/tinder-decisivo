"""Cuestionario: preguntas, opciones y respuestas del usuario."""

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver

from .eje import Eje
from .electoral import TipoEleccion


class Pregunta(models.Model):
    # Ejes tematicos para agrupar preguntas y calcular match por dimension.
    EJE_ECONOMIA = "ECONOMIA"
    EJE_SOCIEDAD = "SOCIEDAD"
    EJE_AMBIENTE = "AMBIENTE"
    EJE_SEGURIDAD = "SEGURIDAD"
    EJE_DDHH = "DDHH"
    EJE_INTERNACIONAL = "INTERNACIONAL"
    EJE_INSTITUCIONAL = "INSTITUCIONAL"
    EJE_OTRO = "OTRO"
    EJES_CHOICES = [
        (EJE_ECONOMIA, "Economia"),
        (EJE_SOCIEDAD, "Sociedad"),
        (EJE_AMBIENTE, "Ambiente"),
        (EJE_SEGURIDAD, "Seguridad"),
        (EJE_DDHH, "Derechos Humanos"),
        (EJE_INTERNACIONAL, "Politica Internacional"),
        (EJE_INSTITUCIONAL, "Reforma Institucional"),
        (EJE_OTRO, "Otro"),
    ]

    texto = models.TextField()
    tipo_eleccion = models.ForeignKey(
        TipoEleccion, on_delete=models.CASCADE, related_name="preguntas"
    )
    orden = models.IntegerField(default=0)
    eje_tematico = models.CharField(
        max_length=20, choices=EJES_CHOICES, default=EJE_OTRO,
        help_text="Categoria tematica de la pregunta. Sirve para el match por eje.",
    )
    # FK opcional al catalogo Eje. Se auto-popula desde eje_tematico via signal
    # (o al reves si se setea manualmente). Permite metadata rica: color, orden, icono.
    eje = models.ForeignKey(
        Eje, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="preguntas",
        help_text=(
            "Referencia al catalogo Eje. Se sincroniza automaticamente con "
            "eje_tematico. Setealo aca si querés override o dejalo vacio y el "
            "signal lo resuelve por codigo."
        ),
    )
    explicacion = models.TextField(
        blank=True, default="",
        help_text="Contexto educativo neutro sobre que trata la pregunta (2-3 lineas).",
    )
    repercusiones = models.JSONField(
        default=dict, blank=True,
        help_text=(
            "Dict con keys: economico, social, cultural, ambiental, institucional. "
            "Cada valor es un texto breve explicando el impacto en esa dimension."
        ),
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Preguntas"
        ordering = ["orden"]

    def __str__(self):
        return f"[{self.tipo_eleccion.nombre}] {self.texto[:50]}..."


class OpcionRespuesta(models.Model):
    pregunta = models.ForeignKey(
        Pregunta, on_delete=models.CASCADE, related_name="opciones_respuesta"
    )
    texto = models.CharField(max_length=255)
    valor = models.IntegerField(
        help_text="Valor numérico de la opción (ej. 1 al 5 para escalas, 0/1 para sí/no)."
    )
    es_no_se = models.BooleanField(
        default=False,
        help_text=(
            "Si es True, esta opcion representa 'No se / Prefiero no responder' "
            "y se excluye del calculo de match."
        ),
    )

    class Meta:
        app_label = "core"
        verbose_name_plural = "Opciones de respuesta"
        unique_together = ("pregunta", "texto")

    def __str__(self):
        return f"{self.pregunta.texto[:30]}... - {self.texto} (Valor: {self.valor})"


# ------------------------------------------------------------
# Opciones estandar (Likert 5) — usadas por comando admin
# ------------------------------------------------------------
OPCION_MUY_DE_ACUERDO = "Muy de acuerdo"
OPCION_DE_ACUERDO = "De acuerdo"
OPCION_NEUTRAL = "Neutral"
OPCION_EN_DESACUERDO = "En desacuerdo"
OPCION_MUY_EN_DESACUERDO = "Muy en desacuerdo"

OPCIONES_ACUERDO_DESACUERDO = [
    (OPCION_MUY_DE_ACUERDO, 5),
    (OPCION_DE_ACUERDO, 4),
    (OPCION_NEUTRAL, 3),
    (OPCION_EN_DESACUERDO, 2),
    (OPCION_MUY_EN_DESACUERDO, 1),
]


def crear_opciones_acuerdo_desacuerdo(pregunta):
    """Crea las opciones estándar de 'acuerdo/desacuerdo' para una pregunta."""
    opciones = [
        OpcionRespuesta(pregunta=pregunta, texto=texto, valor=valor)
        for texto, valor in OPCIONES_ACUERDO_DESACUERDO
    ]
    OpcionRespuesta.objects.bulk_create(opciones)


class RespuestaUsuario(models.Model):
    # Peso declarado por el usuario: cuanto le importa el tema.
    PESO_NO_IMPORTA = 0
    PESO_POCO = 1
    PESO_MEDIO = 2
    PESO_MUCHO = 3
    PESO_CHOICES = [
        (PESO_NO_IMPORTA, "No me importa"),
        (PESO_POCO, "Poco importante"),
        (PESO_MEDIO, "Importante"),
        (PESO_MUCHO, "Muy importante"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="respuestas_usuario")
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE)
    opcion_elegida = models.ForeignKey(OpcionRespuesta, on_delete=models.CASCADE)
    peso = models.IntegerField(
        choices=PESO_CHOICES, default=PESO_POCO,
        help_text="Cuanto le importa al usuario este tema. Multiplica el peso de la pregunta en el match.",
    )
    fecha_respuesta = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"
        verbose_name_plural = "Respuestas de Usuarios"
        unique_together = ("user", "pregunta")  # una respuesta por (user, pregunta)

    def __str__(self):
        return (
            f"{self.user.username} respondió '{self.opcion_elegida.texto}' "
            f"a '{self.pregunta.texto[:30]}...'"
        )


# ----------------------------------------------------------------------------
# Signal: mantener Pregunta.eje (FK) sincronizado con Pregunta.eje_tematico (str).
# ----------------------------------------------------------------------------
# Estrategia bi-direccional:
#   - Si se setea `eje` (FK): copiar eje.codigo -> eje_tematico.
#   - Si se setea solo `eje_tematico` y `eje` es None: buscar/crear Eje por codigo
#     y setear el FK. Case-insensitive.
# Asi el matching (que usa eje_tematico string) sigue funcionando, y los nuevos
# clients (frontend) pueden usar el FK con metadata rica.
@receiver(pre_save, sender=Pregunta)
def _sincronizar_pregunta_eje(sender, instance, **kwargs):
    if instance.eje_id is not None:
        # FK setea el string.
        if instance.eje.codigo.upper() != (instance.eje_tematico or "").upper():
            instance.eje_tematico = instance.eje.codigo
    elif instance.eje_tematico:
        # String busca/crea el FK.
        eje_obj = Eje.objects.filter(
            codigo__iexact=instance.eje_tematico,
        ).first()
        if eje_obj is None:
            # Auto-crear con nombre = codigo capitalizado.
            eje_obj = Eje.objects.create(
                codigo=instance.eje_tematico.upper(),
                nombre=instance.eje_tematico.capitalize(),
            )
        instance.eje = eje_obj
