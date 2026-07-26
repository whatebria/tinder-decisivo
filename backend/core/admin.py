from django.contrib import admin
from .models import (
    TipoEleccion,
    Candidato,
    Pregunta,
    OpcionRespuesta,
    PosturaCandidato,
    CandidatoFavorito,
    CandidatoDescartado,
    DecisionFinal,
    OPCIONES_ACUERDO_DESACUERDO,
    crear_opciones_acuerdo_desacuerdo,
    RespuestaUsuario,
    Noticia
)

# --- Define OpcionRespuestaInline PRIMERO ---
#  Mostrar las OpcionRespuesta directamente dentro de la vista de Pregunta
class OpcionRespuestaInline(admin.TabularInline):
    model = OpcionRespuesta
    extra = 0 # No añade campos vacíos extra para nuevas opciones por defecto

admin.site.register(TipoEleccion)
admin.site.register(RespuestaUsuario)


@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'fuente', 'fecha_publicacion')
    list_filter = ('fuente', 'candidatos_mencionados')
    search_fields = ('titulo', 'descripcion')
    filter_horizontal = ('candidatos_mencionados',)
    readonly_fields = ('fecha_publicacion', 'actualizado_en')

@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'ciudad', 'get_tipos_eleccion') # Columnas a mostrar en la lista
    search_fields = ('nombre', 'apellido', 'ciudad') # Campos para búsqueda
    list_filter = ('tipos_eleccion',) # Filtros en la barra lateral

    def get_tipos_eleccion(self, obj):
        return ", ".join([te.nombre for te in obj.tipos_eleccion.all()])
    get_tipos_eleccion.short_description = "Tipos de Elección" # Nombre de la columna

@admin.register(Pregunta) # <--- Aquí registramos PreguntaAdmin UNA SOLA VEZ
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ('texto', 'tipo_eleccion', 'eje_tematico', 'orden')
    list_filter = ('tipo_eleccion', 'eje_tematico')
    list_editable = ('eje_tematico',)
    search_fields = ('texto',)
    ordering = ('tipo_eleccion', 'orden')
    inlines = [OpcionRespuestaInline]

    actions = ['crear_opciones_estandar']

    def crear_opciones_estandar(self, request, queryset):
        """
        Crea las opciones estándar de 'acuerdo/desacuerdo' para las preguntas seleccionadas.
        Elimina las opciones existentes primero para evitar duplicados.
        """
        for pregunta in queryset:
            # Eliminar opciones existentes antes de crear las nuevas para evitar duplicados.
            # Esto es importante si el usuario ejecuta la acción varias veces.
            OpcionRespuesta.objects.filter(pregunta=pregunta).delete()
            crear_opciones_acuerdo_desacuerdo(pregunta)
        self.message_user(request, f"Opciones estándar creadas/actualizadas para {queryset.count()} preguntas.")
    crear_opciones_estandar.short_description = "Crear/Actualizar opciones estándar (Muy de acuerdo...Muy en desacuerdo)"

@admin.register(OpcionRespuesta) # <--- Aquí registramos OpcionRespuestaAdmin
class OpcionRespuestaAdmin(admin.ModelAdmin):
    list_display = ('texto', 'valor', 'es_no_se', 'pregunta')
    list_filter = ('pregunta__tipo_eleccion', 'es_no_se', 'pregunta')
    search_fields = ('texto', 'pregunta__texto')
    list_editable = ('valor', 'es_no_se')
    ordering = ('pregunta__orden', 'valor')

@admin.register(PosturaCandidato)
class PosturaCandidatoAdmin(admin.ModelAdmin):
    list_display = ('candidato', 'pregunta', 'opcion_respuesta')
    list_filter = ('candidato__tipos_eleccion', 'pregunta__tipo_eleccion', 'candidato', 'pregunta') # Filtros útiles
    search_fields = ('candidato__nombre', 'candidato__apellido', 'pregunta__texto', 'justificacion')
    raw_id_fields = ('candidato', 'pregunta', 'opcion_respuesta') # Para selección más fácil con muchos objetos

@admin.register(CandidatoFavorito)
class CandidatoFavoritoAdmin(admin.ModelAdmin):
    list_display = ('user', 'candidato', 'fecha_agregado')
    list_filter = ('user', 'candidato__tipos_eleccion')
    search_fields = ('user__username', 'candidato__nombre', 'candidato__apellido')

@admin.register(CandidatoDescartado)
class CandidatoDescartadoAdmin(admin.ModelAdmin):
    list_display = ('user', 'candidato', 'fecha_descartado')
    list_filter = ('user', 'candidato__tipos_eleccion')
    search_fields = ('user__username', 'candidato__nombre', 'candidato__apellido')

@admin.register(DecisionFinal)
class DecisionFinalAdmin(admin.ModelAdmin):
    list_display = ('user', 'candidato_elegido', 'tipo_eleccion', 'fecha_decision')
    list_filter = ('user', 'tipo_eleccion', 'candidato_elegido__tipos_eleccion')
    search_fields = ('user__username', 'candidato_elegido__nombre', 'candidato_elegido__apellido')