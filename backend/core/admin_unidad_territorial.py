"""Admin de UnidadTerritorial."""

from django.contrib import admin

from .models import UnidadTerritorial


@admin.register(UnidadTerritorial)
class UnidadTerritorialAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "nivel", "padre", "num_candidatos")
    list_filter = ("nivel",)
    search_fields = ("codigo", "nombre")
    ordering = ("nivel", "nombre")
    autocomplete_fields = ("padre",)

    @admin.display(description="# Candidatos")
    def num_candidatos(self, obj):
        return obj.candidatos.count()
