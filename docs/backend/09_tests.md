# 9. Tests (`core/test_*.py`)

25 archivos de tests con pytest + pytest-django. Convencion: 1 archivo por feature/dominio. Todos usan `@pytest.mark.django_db` explicito o el fixture `db`. Muchos usan `datos_pesados` (seeds pesados via 6 management commands, function-scoped, ~10s) o fixtures locales mas livianas.

Los docstrings de modulo estan bien mantenidos y son la fuente primaria de este resumen.

## Tests de dominio / servicios (unitarios)

### `test_services_matching.py`
Tests unitarios PUROS para `services/matching.py` -- no tocan DB ni levantan DRF. Testean `score_pregunta` y `confianza_por_n`. Comentario documenta que antes de mover el algoritmo a services/ estas funciones vivian dentro de `views.py` como privadas y no eran testeables sin levantar todo el stack. Ahora si.

### `test_services_tipos.py`
Cache de tipos base (`services/tipos.py`): cache hit/miss, invalidacion por signal (`post_save`/`post_delete` en `TipoEleccion`), invalidacion manual (`invalidar_cache_tipos_base()`). Usa `CaptureQueriesContext` para verificar cero queries en hit.

## Tests del algoritmo de matching (integracion)

### `test_algoritmo_matching.py` (12.8 KB, el mas grande)
Tests del algoritmo robusto end-to-end + permisos de endpoints sensibles. Cubre calculo de score con distintos escenarios (todos de acuerdo, todos en desacuerdo, mix), confianza, top candidatos, filtro territorial, permisos (`IsAuthenticated`, admin-only).

### `test_match_anonimo.py` (8.3 KB)
Endpoint de match anonimo (guest mode). Tests: `test_no_requiere_auth`, `test_ranking_correcto`, `test_no_persiste_nada`, `test_payload_invalido_400`, `test_tipo_eleccion_inexistente_404`, `test_tipo_base_devuelve_400_con_code`, `test_respuestas_invalidas_se_ignoran`, y para catalogo publico `test_tipos_eleccion_publico`, `test_candidatos_publico`, `test_preguntas_publico`, `test_preguntas_guest_no_filtra_por_respondidas`.

### `test_match_detalle.py`
Endpoint de explicacion del match (match-detalle) -- muestra por candidato el desglose pregunta a pregunta con respuesta del user vs postura del candidato.

### `test_matching_territorial.py` (8.4 KB)
Filtro territorial del matching: usuario con `comuna=X` ve solo alcaldes de X + diputados del distrito de X + presidenciales nacionales. Sin comuna = ve TODOS (fallback fail-open). Match anonimo puede recibir opcionalmente una comuna.

## Tests de cuestionario / respuestas

### `test_editar_respuestas.py` (9.3 KB)
Editar respuestas individuales (service + API). Cubre `PATCH /respuestas/{id}/` o similar y el recalculo inline del match.

### `test_reiniciar.py` (7.4 KB)
Reset del cuestionario. Tests: `test_borra_respuestas_del_tipo`, `test_borra_matches_del_tipo`, `test_no_toca_respuestas_de_otro_tipo`, `test_no_toca_bookmarks`, `test_tipo_eleccion_inexistente_error`, `test_reset_sin_respuestas_no_falla`, y variantes API con `test_endpoint_*`.

### `test_preguntas_base.py`
Feature PREGUNTAS BASE (`TipoEleccion.es_base=True`): endpoint `/preguntas/` combina preguntas base + del tipo pedido. Respuestas a base cuentan para el match de cualquier eleccion. Base ya respondidas se excluyen del "pendiente" en otra eleccion.

## Tests de candidatos / posturas

### `test_candidato_posturas.py`
GET `/candidatos/<id>/posturas/`: lista de posturas del candidato con opcion + justificacion.

### `test_candidato_detail_territorial.py`
Endpoint `CandidatoDetailView` con info territorial expandida (comuna_nombre, distrito_numero, alcance_territorial derivados).

### `test_candidato_territorial.py`
Scope territorial polimorfico del modelo Candidato: presidencial puede tener `unidad_territorial=null`, alcalde nivel comunal, diputado nivel distrital, property `alcance_territorial` devuelve etiqueta correcta, reverse relations desde UT siguen funcionando.

## Tests de perfil / auth

### `test_perfil.py`
Perfil de usuario: info, cambio password, eliminar cuenta.

### `test_perfil_territorial.py` (7.9 KB)
UserProfile + endpoints `/perfil/comuna/`, `/regiones/`, `/comunas/`. Verifica que cambio de comuna invalida matches viejos.

### `test_password_reset.py`
Flujo de password reset (service + API). Cubre `request_reset` -> email enviado, `confirm_reset` con token valido/invalido/expirado, anti user-enumeration (`ResetError` generico).

### `test_bookmarks_contenido.py`
Bookmarks: noticias y posturas guardadas por user. Cubre CRUD del bookmarking generico.

## Tests de noticias

### `test_noticias.py`
Noticias por candidato: modelo, endpoint y management command `fetch_noticias` (con `unittest.mock.patch` para feedparser).

### `test_noticias_feed.py`
Feed global de noticias (`GET /api/v1/noticias/` con filtros basicos).

### `test_noticias_filtros.py`
Nuevos filtros del feed: `q` (busqueda full-text en titulo/descripcion) y `dias` (ventana temporal). Usa `timezone.now() - timedelta(days=N)`.

## Tests de territorio

### `test_territorio.py`
Integridad del modelo territorial legacy: 16/28/346, cada comuna tiene region+distrito consistente, distrito y comunas de la misma region, restricciones unique activas, RM tiene 52 comunas, distrito 10 incluye Nunoa + Santiago, seed idempotente.

### `test_unidad_territorial.py` (7.1 KB)
Refactor UnidadTerritorial (polimorfico). Tests: `test_migration_materializo_jerarquia`, `test_ancestros_correctos`, `test_descendientes_ids`, `test_crear_candidato_con_ut_explicita`, `test_ut_null_cuando_no_se_setea`, `test_votante_ve_ancestros`, `test_votante_ve_candidatos_regionales_futuros`, `test_setear_comuna_auto_setea_ut`, `test_lista_todas`, `test_filtra_por_nivel`, `test_filtra_por_padre`, `test_busqueda_por_nombre`.

## Tests de seeds

### `test_seeds_ficticios.py`
Seeds ficticios de Diputados 2025 y Alcaldes 2024. Todos los checks territoriales pasan por `unidad_territorial` (fuente unica de verdad).

### `test_presidenciales_2025.py`
Seed de presidenciales 2025 + campo `anio` en TipoEleccion. Tests: `test_crea_tipo_eleccion_con_anio`, `test_crea_los_8_candidatos_oficiales`, `test_todos_tienen_8_posturas_base`, `test_kast_puede_ser_multi_eleccion`, `test_es_idempotente`, `test_campo_anio_acepta_valores`, `test_puede_filtrar_por_anio`.

### `test_preguntas_por_tipo.py`
Seed de preguntas especificas por tipo. Test principal: `test_presi_2025_tiene_5_preguntas_especificas` (verifica cardinalidad 5 y que cada pregunta tenga sus opciones + posturas para todos los candidatos del tipo).

## Tests de refactors especificos

### `test_eje_refactor.py`
Refactor Eje: modelo, signal (invalidacion cache tipos base?), endpoint `/ejes/`, admin extensibility. Verifica migration creo 8 ejes canonicos con codigos exactos.

### `test_mi_progreso.py` (9.4 KB)
Endpoint agregador `GET /api/v1/mi-progreso/`. Reemplaza patron N+M del HomeHUB. Cubre: auth required, devuelve todos los tipos no-base (aunque el user no haya respondido nada), `total_preguntas` incluye base+tipo, `respondidas` incluye respuestas del tipo+base, `completa=True` solo cuando `respondidas >= total`, `top_match` poblado cuando hay `MatchCandidato` **Y el cuestionario esta completo**, `top_match=None` cuando no hay match calculado aunque `completa=True`, tipos base NO aparecen en la respuesta. Incluye regresion `test_top_match_no_leakea_por_candidato_multi_tipo`: candidato en M2M con varios tipos + user solo completo uno -> los otros tipos siguen con `top_match=None` (evita el bug de "matches fantasma" donde el % de un tipo se atribuia a otro).

## Tests de importers

### `test_importers.py` (6.8 KB)
Management commands de import (`import_candidatos`, `import_preguntas`, `import_posturas`). Usa `tmp_path` para generar CSVs, `call_command(...)` para invocar, verifica counts y `--dry-run` no persiste.
