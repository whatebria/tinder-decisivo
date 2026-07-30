# 8. Migraciones (`core/migrations/`)

39 archivos totales (incluyendo `__init__.py` vacio y el squash). Sqlite es el motor por defecto (`.env.example`), Postgres soportado via `DATABASE_URL`.

## Squash inicial

### `0001_squashed_0025_tipoeleccion_es_base.py` (15.6 KB)
Squashea las migraciones `0001_initial` .. `0025_tipoeleccion_es_base`. `replaces = [...]` con las 25 originales listadas explicitamente. Es la migration efectiva "inicial" del proyecto: crea `Candidato`, `TipoEleccion`, `Pregunta`, `OpcionRespuesta`, `PosturaCandidato`, `RespuestaUsuario`, `MatchCandidato`, `Profile`, `Noticia`, `PasswordResetToken`, `NoticiaBookmark`, `PosturaBookmark`, y el flag `TipoEleccion.es_base`. Las 25 individuales siguen en el folder por si Django ve una DB vieja sin la squash aplicada.

## Migraciones post-squash (0026 .. 0038)

Nomenclatura: cuando el nombre empieza con `alter_`, `add_`, `rename_`, `delete_`, es schema-only. Cuando empieza con `backfill_`, `seed_`, `materializar_`, es data migration (`RunPython`).

### `0026_region_distrito_comuna.py`
Schema: crea los 3 modelos territoriales legacy (`Region`, `Distrito`, `Comuna`) con sus FKs y constraints (`Comuna.codigo unique`, `Distrito.numero unique`, etc.).

### `0027_candidato_comuna_candidato_distrito.py`
Schema: agrega FKs `Candidato.comuna` y `Candidato.distrito` (both `null=True, on_delete=SET_NULL`).

### `0028_candidato_candidato_no_comuna_y_distrito_a_la_vez.py`
Schema: `AddConstraint(CheckConstraint(check=~(Q(comuna__isnull=False) & Q(distrito__isnull=False)), name="candidato_no_comuna_y_distrito_a_la_vez"))`. Impide setear ambos FKs a la vez.

### `0029_userprofile.py`
Schema: crea `UserProfile` (OneToOne con `User`) con campos `bio`, `foto`, `comuna` (FK nullable).

### `0030_backfill_userprofile.py` (RunPython)
Crea un `UserProfile` para cada `User` que ya existia en DB. El signal `post_save` de `0029` solo dispara en users nuevos; esta migration cierra la brecha para cuentas creadas antes de la feature. Reversible: borra todos los `UserProfile`.

### `0031_tipoeleccion_anio.py`
Schema: agrega `TipoEleccion.anio` (`IntegerField(null=True, blank=True)`).

### `0032_backfill_anios.py` (RunPython)
Data: asigna `anio` a los `TipoEleccion` existentes. Heuristica: si el `nombre` contiene un token de 4 digitos, usa ese anio. Si no, usa un mapping hardcoded (`{"Presidencial": 2021, "Parlamentaria 2025": 2025}`). Los que no matchean quedan en `None`. Reversible: setea todos a `None`.

### `0033_eje_pregunta_eje.py`
Schema: crea el modelo `Eje` (catalogo gestionable desde admin) + agrega FK `Pregunta.eje` (`null=True, blank=True`).

### `0034_seed_ejes_canonicos.py` (RunPython)
Data:
1. Crea los 8 ejes canonicos (`ECONOMIA`, `SOCIEDAD`, `AMBIENTE`, `SEGURIDAD`, `DDHH`, `INTERNACIONAL`, `INSTITUCIONAL`, `OTRO`) con codigo, nombre, color hex y orden. Idempotente (`update_or_create`).
2. Auto-crea ejes desde strings arbitrarios que ya existan en `Pregunta.eje_tematico` (ej. si un test seeding uso `"cultural"` en minuscula).
3. Backfill: por cada `Pregunta` setea `eje_id` mapeando `eje_tematico.upper() -> Eje.codigo`, con fallback a `OTRO`.

Reversible: borra todos los `Eje`.

### `0035_unidadterritorial_candidato_unidad_territorial_and_more.py`
Schema: crea el modelo polimorfico `UnidadTerritorial` (con `nivel`, `padre` autoref, `metadata` JSONField, `codigo` unique). Agrega FK `Candidato.unidad_territorial` y `UserProfile.unidad_territorial`, ambos nullable.

### `0036_materializar_unidad_territorial.py` (RunPython)
Data (la mas compleja del refactor territorial):
1. Crea raiz `UT(codigo="NACIONAL", nivel="nacional")`.
2. Por cada `Region` -> crea `UT(codigo="REG-{numero_romano}", nivel="regional", padre=nacional, metadata={"codigo_region"})`.
3. Por cada `Distrito` -> `UT(codigo="D-{numero}", nivel="distrital", padre=UT-region, metadata={"numero_distrito"})`.
4. Por cada `Comuna` -> `UT(codigo="COM-{codigo}", nivel="comunal", padre=UT-distrito, metadata={"codigo_ine"})`.
5. Backfill `Candidato.unidad_territorial` desde su `comuna_id` o `distrito_id` con `bulk_update`.
6. Backfill `UserProfile.unidad_territorial` desde `comuna_id`.

Reversible: null los FKs primero (para evitar PROTECT), luego `UT.objects.all().delete()`.

### `0037_delete_decisionfinal.py`
Schema: `DeleteModel("DecisionFinal")`. Modelo legacy (aparentemente no referenciado en el codigo actual, era del prototipo pre-refactor de matching).

### `0038_drop_candidato_comuna_distrito.py`
Schema: parece intencion de dropear las FKs legacy (Fase 3 del plan documentado en `backend/docs/MIGRATION_TERRITORIAL.md`), pero solo pesa 608 bytes -- puede que sea intermedio (revisar contenido antes de asumir).

> **Nota drift**: `backend/docs/MIGRATION_TERRITORIAL.md` describe un plan de 3 fases para completar el refactor territorial. Fase 3 (drop columns) sigue en progreso segun ese doc, pero la migration `0038` sugiere que ya se aplico. Verificar consistencia entre codigo (`matching.py` sigue con fallback a `comuna_id`/`distrito_id`?) y estado real de la tabla.
