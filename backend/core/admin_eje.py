"""Admin del catalogo Eje."""

from django.contrib import admin

from .models import Eje


@admin.register(Eje)
class EjeAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "color", "orden", "activo", "num_preguntas")
    list_editable = ("color", "orden", "activo")
    list_filter = ("activo",)
    search_fields = ("codigo", "nombre")
    ordering = ("orden", "nombre")

    @admin.display(description="# Preguntas")
    def num_preguntas(self, obj):
        return obj.preguntas.count()
