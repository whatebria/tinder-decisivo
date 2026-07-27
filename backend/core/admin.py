"""
Django admin: registro de todos los modelos con filters, search e inlines.

Convenciones:
- list_display: columnas utiles en la lista
- list_filter: filtros en el sidebar
- search_fields: input de busqueda
- autocomplete_fields: FK con muchos objetos (evita <select> gigante)
- inlines: crear objetos relacionados desde el mismo formulario
"""

from django.contrib import admin
from django.db.models import Count

# Importa el admin territorial (regiones, distritos, comunas) para que Django lo
# autoregistre. Vive en modulo aparte por cohesion, no por tamano.
from . import admin_eje  # noqa: F401
from . import admin_territorio  # noqa: F401
from . import admin_unidad_territorial  # noqa: F401

from .models import (
    OPCIONES_ACUERDO_DESACUERDO,
    Candidato,
    CandidatoDescartado,
    CandidatoFavorito,
    Comuna,
    Distrito,
    Noticia,
    NoticiaBookmark,
    OpcionRespuesta,
    PosturaBookmark,
    PosturaCandidato,
    Pregunta,
    Region,
    RespuestaUsuario,
    TipoEleccion,
    crear_opciones_acuerdo_desacuerdo,
)

# ---------------------------------------------------------------------------
# Inlines (declarados primero porque los usan los admins de abajo)
# ---------------------------------------------------------------------------

class OpcionRespuestaInline(admin.TabularInline):
    """Editar las opciones directamente desde la vista de Pregunta."""
    model = OpcionRespuesta
    extra = 0
    fields = ("texto", "valor", "es_no_se")
    ordering = ("valor",)


class PreguntaInline(admin.TabularInline):
    """Ver preguntas asociadas desde la vista de TipoEleccion (solo lectura)."""
    model = Pregunta
    extra = 0
    fields = ("orden", "texto", "eje_tematico")
    ordering = ("orden",)
    show_change_link = True
    readonly_fields = ("texto",)
    can_delete = False


# ---------------------------------------------------------------------------
# TipoEleccion
# ---------------------------------------------------------------------------

@admin.register(TipoEleccion)
class TipoEleccionAdmin(admin.ModelAdmin):
    list_display = ("nombre", "anio", "fecha_eleccion", "es_base", "num_preguntas", "num_candidatos")
    list_filter = ("es_base", "anio")
    search_fields = ("nombre", "descripcion")
    ordering = ("-es_base", "-anio", "-fecha_eleccion", "nombre")
    inlines = [PreguntaInline]

    def get_queryset(self, request):
        # Anota conteos para evitar N+1 en la lista.
        return (
            super().get_queryset(request)
            .annotate(_num_pregs=Count("preguntas", distinct=True))
            .annotate(_num_cands=Count("candidatos", distinct=True))
        )

    @admin.display(description="Preguntas", ordering="_num_pregs")
    def num_preguntas(self, obj):
        return obj._num_pregs

    @admin.display(description="Candidatos", ordering="_num_cands")
    def num_candidatos(self, obj):
        return obj._num_cands


# ---------------------------------------------------------------------------
# Candidato
# ---------------------------------------------------------------------------

@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre", "apellido", "partido", "alcance_territorial",
        "unidad_territorial", "get_tipos_eleccion",
    )
    list_filter = ("tipos_eleccion", "partido", "unidad_territorial__nivel")
    search_fields = (
        "nombre", "apellido", "partido", "ciudad",
        "unidad_territorial__nombre", "unidad_territorial__codigo",
    )
    filter_horizontal = ("tipos_eleccion",)
    autocomplete_fields = ("unidad_territorial",)
    ordering = ("apellido", "nombre")

    @admin.display(description="Tipos de Eleccion")
    def get_tipos_eleccion(self, obj):
        return ", ".join(t.nombre for t in obj.tipos_eleccion.all())

    @admin.display(description="Alcance", ordering="unidad_territorial__nivel")
    def alcance_territorial(self, obj):
        return obj.alcance_territorial


# ---------------------------------------------------------------------------
# Pregunta + OpcionRespuesta
# ---------------------------------------------------------------------------

@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ("texto_corto", "tipo_eleccion", "eje_tematico", "orden")
    list_filter = ("tipo_eleccion", "eje_tematico")
    list_editable = ("eje_tematico",)
    search_fields = ("texto",)
    ordering = ("tipo_eleccion", "orden")
    autocomplete_fields = ("tipo_eleccion",)
    inlines = [OpcionRespuestaInline]
    actions = ["crear_opciones_estandar"]

    @admin.display(description="Texto")
    def texto_corto(self, obj):
        return obj.texto[:80] + ("..." if len(obj.texto) > 80 else "")

    @admin.action(description="Crear/Actualizar opciones Likert 5 (Muy de acuerdo...Muy en desacuerdo)")
    def crear_opciones_estandar(self, request, queryset):
        for pregunta in queryset:
            OpcionRespuesta.objects.filter(pregunta=pregunta).delete()
            crear_opciones_acuerdo_desacuerdo(pregunta)
        self.message_user(
            request,
            f"Opciones estandar creadas/actualizadas para {queryset.count()} preguntas.",
        )


@admin.register(OpcionRespuesta)
class OpcionRespuestaAdmin(admin.ModelAdmin):
    list_display = ("texto", "valor", "es_no_se", "pregunta")
    list_filter = ("pregunta__tipo_eleccion", "es_no_se")
    search_fields = ("texto", "pregunta__texto")
    list_editable = ("valor", "es_no_se")
    ordering = ("pregunta__orden", "valor")
    autocomplete_fields = ("pregunta",)


# ---------------------------------------------------------------------------
# PosturaCandidato
# ---------------------------------------------------------------------------

@admin.register(PosturaCandidato)
class PosturaCandidatoAdmin(admin.ModelAdmin):
    list_display = ("candidato", "pregunta_corta", "opcion_respuesta")
    list_filter = ("candidato__tipos_eleccion", "pregunta__eje_tematico")
    search_fields = (
        "candidato__nombre",
        "candidato__apellido",
        "pregunta__texto",
        "justificacion",
    )
    autocomplete_fields = ("candidato", "pregunta", "opcion_respuesta")

    @admin.display(description="Pregunta", ordering="pregunta__orden")
    def pregunta_corta(self, obj):
        return obj.pregunta.texto[:60] + ("..." if len(obj.pregunta.texto) > 60 else "")


# ---------------------------------------------------------------------------
# Datos de usuario
# ---------------------------------------------------------------------------

@admin.register(RespuestaUsuario)
class RespuestaUsuarioAdmin(admin.ModelAdmin):
    list_display = ("user", "pregunta", "opcion_elegida", "peso", "fecha_respuesta")
    list_filter = ("peso", "pregunta__tipo_eleccion", "pregunta__eje_tematico")
    search_fields = ("user__username", "pregunta__texto")
    autocomplete_fields = ("user", "pregunta", "opcion_elegida")
    date_hierarchy = "fecha_respuesta"


@admin.register(CandidatoFavorito)
class CandidatoFavoritoAdmin(admin.ModelAdmin):
    list_display = ("user", "candidato", "fecha_agregado")
    list_filter = ("candidato__tipos_eleccion",)
    search_fields = ("user__username", "candidato__nombre", "candidato__apellido")
    autocomplete_fields = ("user", "candidato")
    date_hierarchy = "fecha_agregado"


@admin.register(CandidatoDescartado)
class CandidatoDescartadoAdmin(admin.ModelAdmin):
    list_display = ("user", "candidato", "fecha_descartado")
    list_filter = ("candidato__tipos_eleccion",)
    search_fields = ("user__username", "candidato__nombre", "candidato__apellido")
    autocomplete_fields = ("user", "candidato")
    date_hierarchy = "fecha_descartado"


# ---------------------------------------------------------------------------
# Contenido y bookmarks
# ---------------------------------------------------------------------------

@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "fuente", "fecha_publicacion")
    list_filter = ("fuente",)
    search_fields = ("titulo", "descripcion")
    filter_horizontal = ("candidatos_mencionados",)
    readonly_fields = ("fecha_publicacion", "actualizado_en")
    date_hierarchy = "fecha_publicacion"


@admin.register(NoticiaBookmark)
class NoticiaBookmarkAdmin(admin.ModelAdmin):
    list_display = ("user", "noticia", "fecha_agregado")
    search_fields = ("user__username", "noticia__titulo")
    autocomplete_fields = ("user", "noticia")
    date_hierarchy = "fecha_agregado"


@admin.register(PosturaBookmark)
class PosturaBookmarkAdmin(admin.ModelAdmin):
    list_display = ("user", "postura", "fecha_agregado")
    search_fields = ("user__username", "postura__candidato__apellido")
    autocomplete_fields = ("user", "postura")
    date_hierarchy = "fecha_agregado"

