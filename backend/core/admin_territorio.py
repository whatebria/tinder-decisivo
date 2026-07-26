"""Admin del modelo territorial (regiones, distritos, comunas).

Separado de core/admin.py para mantener ese archivo enfocado en el dominio
electoral. Django autodescubre este modulo si lo importamos desde admin.py.
"""

from django.contrib import admin
from django.db.models import Count

from .models import Comuna, Distrito, Region, UserProfile


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("orden", "numero_romano", "codigo", "nombre", "num_comunas")
    ordering = ("orden",)
    search_fields = ("nombre", "numero_romano", "codigo")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_num_com=Count("comunas"))

    @admin.display(description="Comunas", ordering="_num_com")
    def num_comunas(self, obj):
        return obj._num_com


@admin.register(Distrito)
class DistritoAdmin(admin.ModelAdmin):
    list_display = ("numero", "nombre", "region", "escanos", "num_comunas")
    list_filter = ("region",)
    ordering = ("numero",)
    search_fields = ("nombre",)
    autocomplete_fields = ("region",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_num_com=Count("comunas"))

    @admin.display(description="Comunas", ordering="_num_com")
    def num_comunas(self, obj):
        return obj._num_com


@admin.register(Comuna)
class ComunaAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "region", "distrito")
    list_filter = ("region", "distrito")
    ordering = ("region__orden", "nombre")
    search_fields = ("nombre", "codigo")
    autocomplete_fields = ("region", "distrito")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "comuna", "get_region", "fecha_actualizacion")
    list_filter = ("comuna__region",)
    search_fields = ("user__username", "user__email", "comuna__nombre")
    autocomplete_fields = ("user", "comuna")

    @admin.display(description="Region", ordering="comuna__region__orden")
    def get_region(self, obj):
        return obj.comuna.region.nombre if obj.comuna_id else "-"
