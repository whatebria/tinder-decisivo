# 05 - Capa de servicios (`services/`)

> **Para quien**: devs que quieren agregar/modificar logica de negocio.
> **Para que sirve**: entender el patron "views delgadas, services gordos" y donde
> vive cada operacion no trivial.

---

## Principio general

**Views orquestan, services deciden.**

Una view DRF hace:
1. Parsear input (via serializer).
2. Chequear permisos.
3. Delegar la logica a un service.
4. Serializar respuesta.

Todo el "cómo lo hago" vive en `core/services/*.py`, que son modulos Python
puros: no importan DRF ni HTTP. Testeables sin `Client()`.

Beneficio:
- **Cambiar el transporte** (REST -> GraphQL, o management command) sin tocar la logica.
- **Testear rapido** sin levantar el request/response cycle.
- **Reusar** entre views distintas (ej. `calcular_match` usado tanto por auth como anonimo).

---

## Modulos disponibles

```
core/services/
|-- __init__.py       (re-exports opcional, hoy vacio)
|-- matching.py       (algoritmo de match)  <- ver 04-algoritmo-matching.md
|-- respuestas.py     (reiniciar, editar respuestas)
|-- perfil.py         (cambiar password, eliminar cuenta)
`-- password_reset.py (flujo de reset con email)
```

---

## `services/matching.py`

Cubierto en detalle en [`04-algoritmo-matching.md`](04-algoritmo-matching.md).

API publica:

```python
calcular_match(user, tipo_eleccion) -> list[MatchCandidato] | None
calcular_match_detalle(user, candidato) -> dict | None
calcular_match_anonimo(respuestas, tipo, comuna) -> list[ScoreCandidato]
```

Helpers puros (testeables sin DB):

```python
score_pregunta(diff) -> Decimal
confianza_por_n(n) -> str
```

---

## `services/respuestas.py`

Lifecycle de las respuestas del user (fuera de "responder", que es create directo).

### `reiniciar_cuestionario(user, tipo_eleccion_id) -> ReiniciarResult`

Borra respuestas + matches del user **para un tipo de eleccion**.

Sobreviven al reset:
- `CandidatoFavorito`
- `CandidatoDescartado`
- `DecisionFinal`
- Datos de otros tipos de eleccion

Motivacion UX: si el user cambia de opinion y quiere responder de nuevo, no
queremos perder los candidatos que ya marco como interesantes.

Devuelve un `ReiniciarResult(respuestas_borradas, matches_borrados)` frozen dataclass.

Raises `ReiniciarError` si el tipo no existe.

### `editar_respuesta(user, respuesta_id, opcion_id, peso) -> EditarRespuestaResult`

Actualiza `opcion_elegida` + `peso` de una respuesta existente.

**Efecto lateral**: **invalida** los `MatchCandidato` del user contra
candidatos del mismo tipo de eleccion. Se recalculan lazy: la proxima vez que
el user visite Resultados. Asi no pagamos el costo si nunca lo pide.

Valida:
- La respuesta pertenece al user.
- La `OpcionRespuesta` pertenece a la misma pregunta.
- El peso esta en `0..3`.

Raises `EditarRespuestaError` con mensaje descriptivo.

Todo dentro de `transaction.atomic()` para consistencia.

---

## `services/perfil.py`

###ar_password(user, current_password, new_password) -> None`

Cambia la password del usuario. Requiere el password actual para prevenir
"cambio ajeno con token robado" (si alguien tuvo acceso al token, todavia no
puede cambiar la password sin conocer la actual).

Validaciones:
- Password actual correcta.
- Password nueva pasa `django.contrib.auth.password_validation` (min length,
  no muy comun, no numerica, no similar al username, etc.).
- Password nueva distinta de la actual.

Raises `PerfilError` con mensaje amigable en cualquier caso.

### `eliminar_cuenta(user, password) -> None`

Borra la cuenta del usuario. Requiere password como confirmacion.

**CASCADE de Django** todos los objetos relacionados:
`RespuestaUsuario`, `MatchCandidato`, `CandidatoFavorito`, `CandidatoDescartado`,
`DecisionFinal`, `PasswordResetToken`, `Token` (DRF auth).

Todo dentro de `transaction.atomic()`.

---

## `services/password_reset.py`

Flujo completo de reset de password (dominio puro, sin HTTP).

### `request_reset(email) -> ResetRequestult`

Genera token + envia email. Es **idempotente por email**: cada llamada crea
un token nuevo, los anteriores quedan huerfanos (expiran solos).

**Security by obscurity**: NO revela si el email existe. Siempre retorna
`email_sent=True`. Loguea a nivel INFO cuando el email no existe (para
investigacion, no para el user).

Devuelve `ResetRequestResult(email_sent, reset_link)`. En `DEBUG=True`,
`reset_link` viene populado (util para testing). En prod, siempre `None`.

Raises `ResetError` si el email es vacio.

### `confirm_reset(token_str, new_password) -> User`

Confirma el reset y cambia la password.

Valida:
- Token existe.
- No esta usado.
- No esta expirado (TTL 1h por default, en `PasswordResetToken.TTL_HOURS`).
- Password nueva pasa validators de Django.

Efectos:
- `user.set_password(new_password) + save`.
- Token: `used_at = now()`.
- No borra el token (audit trail).

Raises `ResetError` con mensaje descriptivo en cualquier caso.

Devuelve el `User` actualizado (util para que la view regenere sesion).

### Helpers privados

- `_create_token(user)`: genera token de 64 chars via `secrets.token_urlsafe(48)`.
- `_build_reset_link(token)`: `PASSWORD_RESET_URL_BASE + "?token=" + token`.
- `_send_reset_email(user, link)`: usa `django.core.mail.send_mail`.
  En dev: `console` backend. En prod: SMTP configurado por `.env`.

---

## Patron dataclass para results

Todos los services que devuelven multiples valores usan **frozen dataclasses**
en vez de tuplas o dicts:

```python
@dataclass(frozen=True)
class ReiniciarResult:
    respuestas_borradas: int
    matches_borrados: int
```

Ventajas:
- **Auto-documentado**: el consumer sabe que espera.
- **Inmutable**: previene mutacion accidental.
- **Type-friendly**: mypy y IDEs lo entienden.

---

## Patron exception para errores de dominio

Cada service define **sus propias excepciones** (no reusa `ValueError` o
`Exception` genericas):

```python
class ReiniciarError(Exception): ...
class EditarRespuestaError(Exception): ...
class PerfilError(Exception): ...
class ResetError(Exception): ...
```

La view captura la excepcion propia del service y traduce a HTTP:

```python
try:
    reiniciar_cuestionario(user, tipo_id)
except ReiniciarError as e:
    return Response({"detail": str(e)}, status=400)
```

Ventaja: la logica de negocio no sabe nada de HTTP status codes.

---

## Testing de services

Los tests de services **no usan `APIClient`**. Llaman las funciones directamente:

```python
def test_reiniciar_borra_respuestas(self, user, seed_chile):
    RespuestaUsuario.objects.create(...)
    result = reiniciar_cuestionario(user, tipo.id)
    assert result.respuestas_borradas == 1
```

Los tests de endpoints (que usan `APIClient`) siguen existiendo, pero cubren
el "wiring" (URL -> view -> service), no la logica de negocio.

Archivos relevantes:
- `test_services_matching.py`
- `test_matching_territorial.py`
- `test_password_reset.py`
- `test_reiniciar.py`
- `test_editar_respuestas.py`
- `test_perfil.py`

---

## Cuando crear un service nuevo

Regla: si la operacion tiene mas de 5 lineas de logica **fuera de**
parseo/permisos/serializacion, sacala a un service.

Signals de mal olor si te resistis:
- Views con `try/except` largos, transacciones anidadas, calculos.
- Duplicacion entre `POST` y management command para lo mismo.
- Tests de views que hacen mock del ORM.

---

## Siguiente lectura

- `06-comandos-seeds.md` - los management commands (otra forma de invocar services).
- `08-signals.md` - efectos secundarios que NO viven en services.
- `10-tests.md` - fixtures y estrategia.
