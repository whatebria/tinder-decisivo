# 09 - Auth y perfil

> **Para quien**: devs que trabajan con auth, registro, reset de password o perfil territorial.
> **Para que sirve**: entender el flujo completo end-to-end.

---

## Modelo de auth

Usamos **DRF Token Authentication** built-in. No JWT (no lo necesitamos: la app
es mobile-first y los tokens de DRF no expiran, lo que simplifica el estado).

Configuracion (`api/settings.py`):

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

Endpoints publicos usan `permission_classes = [AllowAny]` explicito en la view.

---

## Registro

**Endpoint**: `POST /api/v1/register/`

**Flujo**:
1. Frontend manda `{username, password, email}`.
2. View valida via `UserRegistrationSerializer`.
3. Crea `User` con `User.objects.create_user` (que hashea el password).
4. **Signal `post_save(User)` auto-crea el `UserProfile`** (ver `08-signals.md`).
5. Genera token con `Token.objects.create(user=user)`.
6. Devuelve `{id, username, email, token}` con status 201.

**Errores comunes**:
- `400` password muy corta o vacia.
- `400` username ya existe.
- `400` email invalido (validator DRF).

**Notas**:
- El password se hashea con el default de Django (`PBKDF2` con SHA-256).
- El email NO se valida via email de confirmacion (out of scope MVP).

---

## Login

**Endpoint**: `POST /api/v1/login/`

Usa una subclase de `ObtainAuthToken` (DRF) llamada `CustomAuthToken`:

```python
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user_id": user.pk,
            "username": user.username,
        })
```

**Body**: `{username, password}`
**Response**: `{token, user_id, username}`
**Errores**: `400` credenciales invalidas (mensaje generico para no filtrar info).

**Notas**:
- **Token no expira**. Vive hasta que el user lo revoque (o admin lo borre).
- `get_or_create` evita generar tokens duplicados: si el user ya tiene uno, se reusa.
- Para "cerrar sesion" -> el frontend simplemente descarta el token localmente.
  Opcionalmente, borrar el token de la DB (endpoint no expuesto en este MVP).

---

## Reset de password

**Motivacion**: users olvidadizos.

**Flujo completo**:

```
1. User: "olvide mi password" -> POST /api/v1/password-reset/request/
   body: {"email": "juan@example.cl"}
2. Backend genera token (64 chars) + envia email con link:
   {PASSWORD_RESET_URL_BASE}?token=<token>
3. User: abre el link -> frontend web parsea query param
4. User: elige nueva password -> POST /api/v1/password-reset/confirm/
   body: {"token": "abc...", "new_password": "..."}
5. Backend valida token + cambia password
```

### Detalles de seguridad

- **No revela existencia del email**: siempre responde 200 con mensaje generico.
  Si el email no existe en DB, se loguea a nivel INFO pero no hay senal al user.
- **Tokens single-use**: al confirmar, se marca `used_at = now()`. No se puede reusar.
- **TTL 1 hora**: `PasswordResetToken.TTL_HOURS = 1`. Despues, invalido.
- **Multi-token permitido**: un mismo user puede pedir varios resets sin invalidar los anteriores. Los viejos expiran solos. Simplifica la logica y no compromete seguridad (siguen siendo single-use + con TTL).
- **Audit trail**: los tokens usados NO se borran (para auditoria).
- **Password validators**: `validate_password()` corre los validators de Django (min length, no comun, no numeric, no similar al username).

### Detalles del service

Ver `05-servicios.md#services/password_reset.py`.

`request_reset(email) -> ResetRequestResult`:
- En `DEBUG=True`, `reset_link` viene populado en la response (facil testing).
- En prod, `reset_link` siempre `None`.

`confirm_reset(token_str, new_password) -> User`:
- Raise `ResetError` con mensaje descriptivo si algo falla.

### Email

Configuracion en settings:
- `EMAIL_BACKEND` = `console` en dev (imprime al stdout), `smtp` en prod.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`.
- `DEFAULT_FROM_EMAIL` = `no-reply@tinder-decisivo.cl`.

Template del email en `services/password_reset.py::_send_reset_email`. Contenido:

```
Hola {username},

Recibimos una solicitud para restablecer tu contrasena. Abre el siguiente link
para elegir una nueva:

{reset_link}

Este link expira en 1 hora(s). Si no fuiste tu, ignora este email.
```

Formato plain text (sin HTML) para simplicidad y compatibilidad universal.

---

## Perfil del usuario

### Modelo

`UserProfile` (OneToOne con `User`). Ver `02-modelos.md#userprofile`.

Campos: `user`, `comuna`, `unidad_territorial`, `fecha_actualizacion`.

Auto-creado via signal cuando se crea el `User`.

### Endpoints

#### `GET /api/v1/perfil/`
Devuelve el perfil del user autenticado.

```json
{
  "id": 1,
  "username": "juan",
  "email": "juan@example.cl",
  "comuna": {
    "id": 102,
    "codigo": "13120",
    "nombre": "Nunoa",
    "region_nombre": "Metropolitana de Santiago",
    "distrito_numero": 10
  }
}
```

#### `PATCH /api/v1/perfil/comuna/`
Actualiza (o limpia) la comuna del user.

Body: `{"comuna_id": 102}` o `{"comuna_id": null}`.

Efecto lateral (via signal): `unidad_territorial` se actualiza automaticamente.
Ver `08-signals.md#userprofilecomuna---userprofileunidad_territorial-sync-unidireccional`.

#### `POST /api/v1/perfil/cambiar-password/`
Cambia el password del user autenticado. Requiere password actual.

Body: `{"password_actual": "...", "password_nuevo": "..."}`.

Valida:
- Password actual correcta.
- Password nueva pasa validators de Django.
- Password nueva distinta de la actual.

Delega en `services/perfil.py::cambiar_password`.

### Por que existe UserProfile (vs custom User model)

Alternativa considerada: heredar `AbstractUser` y agregar campos.

Elegimos `OneToOne`:
- **Menos invasivo**: `auth.User` sigue siendo el standard de Django.
- **Facil de rollback**: si un dia decidimos usar otro sistema (SSO, etc.), no
  hay que migrar el modelo core.
- **Modularidad**: la logica de "perfil territorial" vive en su propio archivo.

Trade-off: 1 join extra al leer datos combinados. Aceptable.

---

## Filtro territorial en matching

`user.profile.comuna` se usa para filtrar candidatos en el matching.
Detalles en `04-algoritmo-matching.md#filtro-territorial-polimorfico`.

Si el user no tiene comuna seteada, el filtro no se aplica: ve **todos** los
candidatos del tipo de eleccion. Util para guest / users nuevos que aun no
completaron perfil.

---

## Testeando

Archivos relevantes:
- `test_auth.py` (embebido en `tests.py`) - registro, login, endpoints protegidos.
- `test_password_reset.py` - flujo completo, casos de error.
- `test_perfil.py` - endpoints del perfil.
- `test_perfil_territorial.py` - actualizacion de comuna, sync con UT.

Ejemplos:

```python
def test_register_crea_profile(self):
    resp = client.post(reverse("register"), {
        "username": "u", "password": "p", "email": "u@x.cl",
    })
    assert resp.status_code == 201
    user = User.objects.get(username="u")
    assert hasattr(user, "profile")  # signal creo el profile


def test_reset_password_flow(self):
    user = User.objects.create_user("juan", "old_pw", "j@x.cl")
    result = request_reset("j@x.cl")
    assert result.email_sent
    # Extraer token del reset_link (solo disponible en DEBUG)
    token = result.reset_link.split("token=")[1]
    confirm_reset(token, "new_password123")
    user.refresh_from_db()
    assert user.check_password("new_password123")
```

---

## Siguiente lectura

- `03-api-endpoints.md#auth` - especificacion completa de endpoints.
- `05-servicios.md#services/password_reset.py` - detalle del service.
- `08-signals.md` - los signals que soportan este flujo.
