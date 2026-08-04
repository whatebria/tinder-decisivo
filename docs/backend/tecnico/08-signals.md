# 08 - Signals

> **Para quien**: devs que se preguntan "por que se creo eso solo".
> **Para que sirve**: mapear todos los `pre_save`/`post_save` y sus intenciones.

---

## Filosofia

Django signals son un arma de doble filo:
- **Bueno**: mantener invariantes cross-modelo sin acoplar codigo.
- **Malo**: efectos ocultos, orden no predecible, dificiles de testear en aislado.

**Regla en este proyecto**: usar signals **solo** para invariantes que **deben**
mantenerse pase lo que pase con la data. Lo demas va a services o al call site.

En particular:
- **SI** usamos signal para "crear UT cuando se crea Region" (invariante estructural).
- **NO** usamos signal para "recalcular match cuando cambia una postura" (eso lo
  invoca la view/service explicitamente).

---

## Signals activos

### 1. `User` -> `UserProfile` (auto-crear perfil)

**Archivo**: `models/perfil.py`.

```python
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def crear_profile_al_registrar_user(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
```

**Que hace**: cada vez que se crea un `User` nuevo (registro o admin), auto-crea
su `UserProfile` asociado. Idempotente via `get_or_create`.

**Por que**: garantizar que **todo user tiene profile**. Elimina el bug de
"user existe pero no tiene profile".

**Backfill**: migration `0030_backfill_userprofile` para users creados antes
de este signal.

---

### 2. `UserProfile.comuna` -> `UserProfile.unidad_territorial` (sync unidireccional)

**Archivo**: `models/perfil.py`.

```python
@receiver(pre_save, sender=UserProfile)
def _sincronizar_perfil_ut(sender, instance, **kwargs):
    if instance.comuna_id:
        ut = UnidadTerritorial.objects.filter(codigo=f"COM-{instance.comuna.codigo}").first()
        instance.unidad_territorial = ut
    else:
        instance.unidad_territorial = None
```

**Que hace**: cuando el user setea/limpia su comuna, sincroniza el FK
`unidad_territorial` correspondiente.

**Por que unidireccional?**: hacer el reverso (UT -> comuna) causa bugs al
limpiar: si el user manda `PATCH comuna=null`, la UT vieja backpropaga y
restaura la comuna. La direccion `comuna -> UT` es la que usa la UI real.

---

### 3. `Pregunta.eje_tematico` <-> `Pregunta.eje` (sync bi-direccional)

**Archivo**: `models/cuestionario.py`.

```python
@receiver(pre_save, sender=Pregunta)
def _sincronizar_pregunta_eje(sender, instance, **kwargs):
    if instance.eje_id is not None:
        # FK setea el string
        if instance.eje.codigo.upper() != (instance.eje_tematico or "").upper():
            instance.eje_tematico = instance.eje.codigo
    elif instance.eje_tematico:
        # String busca/crea el FK (case-insensitive)
        eje_obj = Eje.objects.filter(codigo__iexact=instance.eje_tematico).first()
        if eje_obj is None:
            eje_obj = Eje.objects.create(
                codigo=instance.eje_tematico.upper(),
                nombre=instance.eje_tematico.capitalize(),
            )
        instance.eje = eje_obj
```

**Que hace**: mantiene consistencia entre el string legacy `eje_tematico`
(usado por el matching) y el FK canonico `eje` (usado por el frontend).

**Bidireccional** porque:
- Codigo viejo (importers, seeds) setea `eje_tematico` string -> signal crea/vincula Eje.
- Codigo nuevo (admin, API) setea `eje` FK -> signal actualiza el string.

**Auto-crea Ejes**: si el importer usa un codigo desconocido, se crea un Eje
minimo (color default `#666666`). El admin puede completar despues.

---

### 4. `Region` / `Distrito` / `Comuna` -> `UnidadTerritorial` (crear UT jerarquica)

**Archivo**: `models/territorio.py`.

```python
@receiver(post_save, sender=Region)
def _upsert_ut_region(sender, instance, created, **kwargs):
    if not created:
        return  # Solo en creates, no en updates
    from .unidad_territorial import UnidadTerritorial
    nacional, _ = UnidadTerritorial.objects.get_or_create(
        codigo="NACIONAL",
        defaults={"nombre": "Chile", "nivel": "nacional"},
    )
    UnidadTerritorial.objects.get_or_create(
        codigo=f"REG-{instance.numero_romano}",
        defaults={
            "nombre": instance.nombre,
            "nivel": "regional",
            "padre": nacional,
            "metadata": {"codigo_region": instance.codigo},
        },
    )
```

(Analogo para Distrito y Comuna, con codigos `D-{numero}` y `COM-{codigo}`.)

**Que hace**: cuando se seed el territorio, auto-materializa las
`UnidadTerritorial` correspondientes con jerarquia (comuna -> distrito -> region -> nacional).

**Guard `if not created`**: solo actua en creates para performance. Updates
de Region/Distrito/Comuna no re-crean UT (evitar overhead en seeds idempotentes).

**Para actualizaciones masivas**: correr el mgmt command `sync_unidades_territoriales`
(cuando exista) o hacer un data migration manual.

---

### 5. `TipoEleccion` -> invalidar cache de tipos base

**Archivo**: `models/electoral.py`.

```python
@receiver(post_save, sender=TipoEleccion)
@receiver(post_delete, sender=TipoEleccion)
def _invalidar_cache_tipos_base(sender, instance, **kwargs):
    from ..services.tipos import invalidar_cache_base_tipo_ids
    invalidar_cache_base_tipo_ids()
```

**Que hace**: invalida el cache de `get_base_tipo_ids()` en `services/tipos.py`
cada vez que un `TipoEleccion` se crea, actualiza o borra.

**Por que**: `get_base_tipo_ids()` cachea por 1h para evitar 1 query por request.
Sin este signal, un cambio en el admin (ej. marcar un tipo como base) no se
propagaria hasta que el TTL expire. Con el signal: zero staleness garantizado.

**Trade-off**: se dispara en CUALQUIER save de TipoEleccion, aunque `es_base`
no haya cambiado. Costo: 1 cache delete. Justificado: TipoEleccion cambia
una vez cada anios; el overhead es despreciable.

---

## Signals que NO existen (decision consciente)

### Candidato -> unidad_territorial (removido)

Antes teniamos:

```python
@receiver(pre_save, sender=Candidato)
def _sincronizar_candidato_ut(sender, instance, **kwargs):
    if instance.comuna_id:
        instance.unidad_territorial = UnidadTerritorial.objects.filter(...).first()
    ...
```

**Por que se removio**: performance. Cada `Candidato.save()` disparaba una
query extra. Con 1200 candidatos en seeds, sumaba mucho.

**Reemplazo**: los seeds setean `unidad_territorial` **explicitamente** al
crear candidatos (pre-indexan la UT correspondiente y la pasan al constructor).

**Consecuencia**: si creas un `Candidato` a mano en shell/admin sin setear
`unidad_territorial`, quedara en None (equivale a `alcance_territorial="nacional"`).
Para poblarlo despues:

```python
from core.models import Candidato, UnidadTerritorial
c = Candidato.objects.get(id=x)
c.unidad_territorial = UnidadTerritorial.objects.get(codigo="COM-13120")  # Nunoa
c.save()
```

### Postura/Respuesta -> recalcular Match

**Por que no**: recalcular es caro (~200ms por user) y no siempre urgente.

**Cuando pasa entonces**: lazy. Al cambiar una respuesta (`editar_respuesta`
service), se **borran** los MatchCandidato afectados. Cuando el user visita
Resultados, la view invoca `calcular_match` que recrea los borrados.

Beneficio: si el user cambia 5 respuestas seguidas y nunca visita Resultados,
no pagamos el costo.

---

## Como testear signals

Los signals se ejecutan **siempre** que el modelo se guarda via ORM. En tests:

```python
def test_crear_region_crea_ut(self, db):
    reg = Region.objects.create(
        numero_romano="XVI", codigo="16", nombre="TestRegion", orden=99,
    )
    ut = UnidadTerritorial.objects.get(codigo="REG-XVI")
    assert ut.nivel == "regional"
    assert ut.padre.codigo == "NACIONAL"
```

**Nota `bulk_create` bypassea signals**. Si tenes un test que hace
`Model.objects.bulk_create([...])` y esperas que el signal actue, no va a pasar.
Solucion: crear los objetos con `.create()` uno por uno, o pre-computar el
efecto secundario y agregarlo al bulk.

---

## Como agregar un signal nuevo

1. En el archivo del modelo destino (no del emisor):
   ```python
   from django.db.models.signals import post_save
   from django.dispatch import receiver

   @receiver(post_save, sender=Emisor)
   def mi_signal(sender, instance, created, **kwargs):
       ...
   ```

2. Escribir el test que verifica que el signal actua cuando debe.

3. Documentarlo en este archivo.

4. Si tiene guards de performance (`if not created`, etc.), justificarlos en un comment.

---

## Siguiente lectura

- `02-modelos.md` - los modelos que emiten/reciben signals.
- `07-migraciones.md#refactor-territorio-polimorfico` - contexto de por que existen los signals de UT.
- `10-tests.md` - fixtures y estrategias para testear signals.
