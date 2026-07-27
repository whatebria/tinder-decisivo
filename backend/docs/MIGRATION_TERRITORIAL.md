# Plan de migracion: FKs territoriales legacy -> UnidadTerritorial

**Estado actual:** deuda tecnica de migracion a medio hacer.
**Riesgo si no se completa:** codigo de matching debe soportar 2 fuentes de verdad (comuna/distrito legacy Y unidad_territorial), aumenta complejidad y probabilidad de bugs.
**Prioridad:** MEDIA — funciona, pero cada feature nueva paga el impuesto.

---

## Contexto

El modelo `Candidato` tiene TRES FKs territoriales simultaneas:

```python
comuna = FK(Comuna, null=True)              # legacy: alcaldes
distrito = FK(Distrito, null=True)          # legacy: diputados
unidad_territorial = FK(UnidadTerritorial)  # nuevo: polimorfico
```

Y un `CheckConstraint` que impide que `comuna` y `distrito` sean no-null a la vez.

`UnidadTerritorial` es un modelo polimorfico jerarquico (nivel: pais/region/provincia/distrito/comuna, con padre auto-referencial) que permite escalar a senadores (regional), CORE (provincial), etc. sin agregar FKs nuevos.

El servicio de matching (`services/matching.py`) filtra candidatos por territorio del user usando UT como fuente primaria y **fallback** a los FKs legacy si UT esta null.

## Plan de migracion (3 fases)

### Fase 1 — Backfill (SEGURO, cero downtime)

1. Correr `python manage.py sync_candidatos_ut` (si existe; si no, crearlo).
   - Para cada Candidato con `unidad_territorial=None` pero `comuna` o `distrito` seteado, popular UT correspondiente.
   - Idempotente: safe correrlo varias veces.
2. Verificar cobertura: `Candidato.objects.filter(unidad_territorial__isnull=True, comuna__isnull=False).count()` deberia ser 0.
3. Verificar lo mismo para distrito: `.filter(unidad_territorial__isnull=True, distrito__isnull=False).count()` == 0.

**Rollback:** ninguno necesario, solo lee y llena UT.

### Fase 2 — Simplificar codigo (DEUDA REAL DEL REFACTOR)

Una vez que TODOS los candidatos tienen `unidad_territorial` seteado:

1. **`services/matching.py`**: eliminar el fallback a `comuna`/`distrito`. Filtrar solo por UT.
   - Buscar los strings `.comuna_id` y `.distrito_id` en el archivo, evaluar caso por caso.
2. **`serializers/catalog.py::CandidatoSerializer`**: seguir exponiendo `comuna_nombre` / `distrito_numero` como campos read-only DERIVADOS de UT (frontend no rompe).
3. **`admin.py::CandidatoAdmin`**: cambiar `list_filter = ("comuna__region", "distrito", ...)` por filtros basados en UT.
4. **Tests**: correr toda la suite territorial (`test_candidato_territorial.py`, `test_matching_territorial.py`, `test_perfil_territorial.py`). Ninguno deberia romperse.

**Rollback:** revertir el commit. Los FKs legacy siguen existiendo, cero perdida de datos.

### Fase 3 — Drop columns (PUNTO DE NO RETORNO)

Solo hacerlo cuando Fase 2 lleva minimo 2 semanas en produccion sin issues:

1. Crear migration data que verifica una ultima vez que UT esta poblado para el 100% de candidatos.
2. Crear migration schema:
   ```python
   migrations.RemoveField("Candidato", "comuna")
   migrations.RemoveField("Candidato", "distrito")
   migrations.RemoveConstraint("Candidato", "candidato_no_comuna_y_distrito_a_la_vez")
   ```
3. Actualizar `CandidatoAdmin.autocomplete_fields`, `list_display`, etc. — eliminar cualquier referencia a `comuna`/`distrito` a nivel campo (los serializers pueden seguir exponiendo los nombres derivados).
4. Actualizar la property `alcance_territorial` para leer solo de UT.
5. Actualizar todos los importers (`seed_alcaldes_2024.py`, `seed_diputados_2025.py`, `import_candidatos.py`) para setear `unidad_territorial` directo en vez de comuna/distrito.

**Rollback:** aca ya no es trivial. Hay que restaurar la columna Y repoblarla desde UT (posible pero doloroso). Por eso pedimos 2 semanas de burn-in de Fase 2.

## Checklist pre-Fase 3

- [ ] Ningun test importa `Candidato.comuna` o `Candidato.distrito` directamente.
- [ ] Ningun serializer output rompe si esos campos ya no existen (el frontend consume `comuna_nombre`, no `comuna_id`, correcto).
- [ ] Los admins de Region/Distrito/Comuna tienen sus signals para auto-crear UT en `post_save` (verificado — ver `models/territorio.py`).
- [ ] Hay un management command `sync_ut` para sincronizar UT desde los modelos legacy cuando alguien renombra una comuna en el admin (pendiente — ver hallazgo M6 del audit).
- [ ] Backup de la DB tomado antes de correr Fase 3.

## Referencias del audit

- Hallazgo **H2** del reporte de audit del 2026-07-25 (severidad alta).
- Hallazgo **M6** (signals solo en `created=True`) — resolver antes o durante Fase 2.
