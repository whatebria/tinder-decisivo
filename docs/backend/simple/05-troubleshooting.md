# 05 - Troubleshooting

> **Para quien**: cualquiera que necesita levantar el backend en local, o depurar problemas comunes.
> **Para que sirve**: soluciones a errores frecuentes, en modo receta.

---

## Levantar el backend por primera vez

### 1. Requisitos previos

- Python 3.10+ instalado (`python --version`).
- `uv` instalado (gestor de paquetes rapido).
  - Instalar: `pip install uv`.
- Git.

### 2. Clonar y setup

```bash
git clone https://github.com/whatebria/tinder-decisivo.git
cd tinder-decisivo/backend

# Instalar dependencias (crea .venv automaticamente)
uv sync

# Copiar el .env de ejemplo
cp .env.example .env
# Editar .env: al menos setear SECRET_KEY (cualquier string largo random)
```

### 3. Migrar la DB

```bash
uv run python manage.py migrate
```

Deberia mostrar 36 migrations aplicadas.

### 4. Sembrar datos

Correr en este orden:

```bash
uv run python manage.py seed_territorio_chile
uv run python manage.py seed_preguntas_base
uv run python manage.py seed_presidenciales_2025
uv run python manage.py seed_diputados_2025
uv run python manage.py seed_alcaldes_2024
uv run python manage.py seed_preguntas_por_tipo
```

Tiempo total: ~20 seg.

### 5. Crear superuser (para el admin)

```bash
uv run python manage.py createsuperuser
```

Setea username, email, password.

### 6. Correr el servidor

```bash
uv run python manage.py runserver 8010
```

Verificar:
- Health: <http://127.0.0.1:8010/api/health/>
- Admin: <http://127.0.0.1:8010/admin/>
- Docs API: <http://127.0.0.1:8010/api/v1/docs/>

---

## Problemas comunes

### "No such file or directory: .env"

Solucion: copia el ejemplo.
```bash
cp .env.example .env
```

Setear al menos `SECRET_KEY=algo-largo-random-aca`.

### "SECRET_KEY not set"

Setear en el `.env`. Cualquier string largo random sirve para dev. En prod,
generar con:
```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### "Table doesn't exist" al correr un seed

Faltan migrations. Corre:
```bash
uv run python manage.py migrate
```

### El seed tarda muchisimo (>1 min)

- `seed_territorio_chile`: **debe** ser <2 seg.
- `seed_alcaldes_2024`: **debe** ser <10 seg.
- Si es mas: reset la DB y reintenta.
  ```bash
  # WARNING: borra todos los datos
  del db.sqlite3        # Windows
  # rm db.sqlite3       # Mac/Linux
  uv run python manage.py migrate
  # ... y re-seedear
  ```

### "Address already in use" al `runserver`

Otro proceso esta usando el puerto 8010. Opciones:
1. Cambiar puerto: `uv run python manage.py runserver 8020`.
2. Matar el proceso viejo:
   - Windows: `netstat -ano | findstr :8010` -> `taskkill /PID <pid> /F`.
   - Mac/Linux: `lsof -i :8010 | grep LISTEN` -> `kill <pid>`.

### "You need to enable JavaScript to run this app" al hacer login desde app

El backend no tiene nada de eso, es un mensaje del frontend web. Confirma que
estas apuntando la app al backend correcto (variable `EXPO_PUBLIC_API_URL` en
el frontend).

### "Authentication credentials were not provided"

Falta el header `Authorization: Token <tu-token>` en la peticion.

Para obtener el token:
```bash
curl -X POST http://127.0.0.1:8010/api/v1/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"tu-pw"}'
```

Response: `{"token":"abc123..."}`. Usarlo como:
```bash
curl -H "Authorization: Token abc123..." http://127.0.0.1:8010/api/v1/perfil/
```

### "IntegrityError: UNIQUE constraint failed"

Alguien intento crear algo que ya existe. Ejemplos:
- Registrar un usuario con username ya usado.
- Crear un candidato duplicado (nombre + apellido + comuna).
- Sembrar 2 veces sin migration path.

Solucion: usa los mensajes de error del admin/API. Todos los seeds son
idempotentes: correrlos 2 veces no debe fallar.

### El match devuelve `null` o vacio

Chequear:
1. El usuario tiene **al menos** una respuesta valida (no "no lo se") -> `RespuestaUsuario.objects.filter(user=x)`.
2. Hay candidatos del tipo pedido -> `Candidato.objects.filter(tipos_eleccion__id=y).count()`.
3. Los candidatos tienen posturas -> `PosturaCandidato.objects.filter(candidato__tipos_eleccion__id=y).count()`.
4. Las preguntas del usuario coinciden con las de los candidatos:
   - Si preguntas del user son de tipo A, pero el candidato solo tiene posturas
     de tipo B, no hay overlap -> match vacio.

Fix: correr `seed_preguntas_por_tipo` para asegurar que todos los candidatos
tienen posturas para todas las preguntas de su tipo.

### El match no incluye a un candidato que "deberia"

Muy probable: **filtro territorial**. El candidato es de otra comuna/distrito
que la del user.

Chequear:
1. Que tiene seteado el user: `user.profile.comuna` y `user.profile.unidad_territorial`.
2. Que tiene el candidato: `candidato.unidad_territorial`.
3. Los ancestros del user: `user.profile.unidad_territorial.ancestros()`.
4. El id del candidato deberia estar en `{ut_user.id} | {a.id for a in ut_user.ancestros()}`.

Si el candidato no tiene `unidad_territorial` seteada (queda como "nacional"),
aparece para todos.

### `IntegrityError: no comuna_y_distrito_a_la_vez`

Trataste de crear un Candidato con **ambos** FKs. Solo uno. Deja el otro en `NULL`.

### El admin no me deja logear

- El user creado con `createsuperuser` tiene `is_staff=True`?
- Sino, ir a shell:
  ```bash
  uv run python manage.py shell
  ```
  ```python
  from django.contrib.auth.models import User
  u = User.objects.get(username="tu-user")
  u.is_staff = True
  u.is_superuser = True
  u.save()
  ```

### Los emails de reset no se envian (dev)

En dev, `EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"`.
No envia emails reales: los **imprime al stdout** de `runserver`.

Buscar en la terminal donde corre `runserver`:
```
From: no-reply@tinder-decisivo.cl
To: juan@example.cl
Subject: VotoAFin - Restablecer tu contrasena
...
http://localhost:8081/reset-password?token=abc123...
```

En prod, configurar SMTP en `.env`:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.cl
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
```

### El frontend no puede hablar con el backend (CORS)

En dev, CORS esta abierto (`DEBUG=True` permite todo).

En prod: setear en `.env`:
```
CORS_ALLOWED_ORIGINS=https://app.votoafin.cl,https://votoafin.cl
```

### Los tests se cuelgan / tardan una eternidad

- Suite completa (~276 tests): normal ~7 min en un laptop moderno.
- Si tarda mas: puede haber un proceso Python zombie del run anterior. Matarlos.
  - Windows: `taskkill /F /IM python.exe` (cuidado, mata todos).
  - Mac/Linux: `pkill -f pytest`.

Correr un subset para debug:
```bash
uv run pytest -k "not (alcaldes or diputados)" --tb=short
```

---

## Comandos utiles de debug

### Contar filas en tablas

```bash
uv run python manage.py shell -c "
from core.models import Candidato, Pregunta, RespuestaUsuario, MatchCandidato
print('Candidatos:', Candidato.objects.count())
print('Preguntas:', Pregunta.objects.count())
print('Respuestas:', RespuestaUsuario.objects.count())
print('Matches:', MatchCandidato.objects.count())
"
```

### Ver que candidatos filtra por comuna

```bash
uv run python manage.py shell -c "
from core.models import Comuna
from core.services.matching import _filtrar_candidatos_por_territorio
from core.models import Candidato
nunoa = Comuna.objects.get(nombre='Nunoa')
qs = Candidato.objects.all()
filtrados = _filtrar_candidatos_por_territorio(qs, nunoa)
print('Total:', qs.count(), '/ Filtrados:', filtrados.count())
"
```

### Reset total (peligroso)

```bash
# Borra la DB entera. Solo en dev.
del db.sqlite3          # Windows
# rm db.sqlite3         # Mac/Linux
uv run python manage.py migrate
uv run python manage.py seed_territorio_chile
# ... resto de seeds
uv run python manage.py createsuperuser
```

---

## Si nada funciona

1. Chequea las docs generales: [`../../estado-actual.md`](../../estado-actual.md), [`../../buenas-practicas.md`](../../buenas-practicas.md).
2. Chequea que `git status` este limpio (a veces la DB queda inconsistente si mergeas mal).
3. Chequea versiones: `python --version`, `uv --version`, `pip list | grep -i django`.
4. Pide ayuda con:
   - **Error exacto** (copiar el traceback completo).
   - **Comando que corriste**.
   - **`git log --oneline -5`**.
   - **`python --version` + `uv --version`**.

---

## Siguiente lectura

- [`04-como-agregar-cosas.md`](04-como-agregar-cosas.md) - una vez que funciona, agregar contenido.
- [`../tecnico/01-arquitectura.md`](../tecnico/01-arquitectura.md) - version tecnica del setup.
- [`../tecnico/10-tests.md`](../tecnico/10-tests.md) - como correr y escribir tests.
