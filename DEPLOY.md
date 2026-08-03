# Guia de Deploy: Vercel (frontend) + Railway (backend)

Esta guia lleva la app de correr solo en tu computador a estar en internet,
accesible desde cualquier parte. Se hace en dos partes:

- **Railway** aloja el backend (Django + base de datos Postgres)
- **Vercel** aloja el frontend (Expo Web)

Tiempo estimado: 1 a 2 horas la primera vez.

---

## Antes de empezar

Necesitas:
- Una cuenta en GitHub con el proyecto subido
- Acceso a [railway.app](https://railway.app) (gratis, requiere cuenta)
- Acceso a [vercel.com](https://vercel.com) (gratis, requiere cuenta)
- Estar FUERA de la VPN de Walmart (estas dos plataformas estan bloqueadas en la red)

---

## PARTE 1: Backend en Railway

### Paso 1 — Agregar gunicorn y whitenoise al proyecto

Abri una terminal en la carpeta `backend/` y ejecuta:

```bash
uv add gunicorn whitenoise
```

Eso actualiza `pyproject.toml` y `uv.lock`. Despues regenera `requirements.txt`:

```bash
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
```

Verifica que `requirements.txt` ahora incluya `gunicorn` y `whitenoise`.

---

### Paso 2 — Agregar whitenoise a settings.py

Abri el archivo `backend/api/settings.py`. Busca la seccion `MIDDLEWARE` y agrega
`whitenoise` en la segunda posicion (despues de SecurityMiddleware):

```python
MIDDLEWARE = [
    "api.middleware.ContentSecurityPolicyMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # <-- agregar esta linea
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

En la misma seccion `Static / Media`, agrega `STATIC_ROOT`:

```python
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"   # <-- agregar esta linea
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"  # <-- y esta
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

---

### Paso 3 — Crear el Procfile

En la carpeta `backend/`, crea un archivo que se llame exactamente `Procfile`
(sin extension, con P mayuscula). Su contenido:

```
web: gunicorn api.wsgi:application --bind 0.0.0.0:$PORT --workers 2
release: python manage.py migrate --noinput
```

La linea `web` es el comando que arranca el servidor.
La linea `release` corre las migraciones automaticamente en cada deploy.

---

### Paso 4 — Crear railway.toml

En la misma carpeta `backend/`, crea un archivo `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "gunicorn api.wsgi:application --bind 0.0.0.0:$PORT --workers 2"
restartPolicyType = "on_failure"
```

Este archivo le dice a Railway como construir y arrancar la app.

---

### Paso 5 — Commit y push

```bash
cd ..  # ir a la raiz del proyecto
git add backend/Procfile backend/railway.toml backend/api/settings.py backend/requirements.txt backend/pyproject.toml
git commit -m "chore: configuracion de deploy para Railway"
git push
```

---

### Paso 6 — Crear el proyecto en Railway

1. Entra a [railway.app](https://railway.app) y crea una cuenta (podes usar tu cuenta de GitHub)
2. Click en **"New Project"**
3. Elige **"Deploy from GitHub repo"**
4. Selecciona el repositorio de la app
5. Railway va a detectar el proyecto. Cuando te pregunte, indicale que la app esta en la carpeta **`backend/`**

---

### Paso 7 — Agregar Postgres

Dentro de tu proyecto en Railway:
1. Click en **"+ New"** > **"Database"** > **"Add PostgreSQL"**
2. Railway crea la base de datos y automaticamente agrega la variable `DATABASE_URL` a tu proyecto
3. No necesitas copiarla ni configurarla — Railway la inyecta sola

---

### Paso 8 — Configurar las variables de entorno en Railway

En tu proyecto de Railway, ve a la seccion **"Variables"** y agrega estas:

| Variable | Valor |
|---|---|
| `SECRET_KEY` | Una clave larga y random. Generala con: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` |
| `ENV` | `production` |
| `ALLOWED_HOSTS` | El dominio que Railway te asigna, ejemplo: `mi-app.up.railway.app` (lo ves en Settings > Domains) |
| `CORS_ALLOWED_ORIGINS` | La URL de tu frontend en Vercel (la agregas despues, cuando tengas el dominio de Vercel) |
| `DJANGO_ADMIN_URL` | Una ruta secreta, ejemplo: `panel-secreto-2025/` |
| `PASSWORD_RESET_URL_BASE` | La URL de tu frontend en Vercel + `/reset-password`, ejemplo: `https://mi-app.vercel.app/reset-password` |
| `TIME_ZONE` | `America/Santiago` |
| `LANGUAGE_CODE` | `es-cl` |

---

### Paso 9 — Primer deploy

Railway arranca el deploy automaticamente cuando haceis push. Para ver el progreso:
1. Click en tu servicio dentro de Railway
2. Ve a la pestana **"Deployments"**
3. Click en el deploy activo para ver los logs en vivo

Si todo va bien, vas a ver algo como:

```
Running migrations...
Starting gunicorn...
Listening at: http://0.0.0.0:XXXX
```

---

### Paso 10 — Poblar la base de datos (seeders)

El primer deploy arranca con una base de datos vacia. Tenes que correr los seeders.

En Railway, ve a tu servicio > pestana **"Settings"** > seccion **"Railway CLI"** para
conectarte, O usa la interfaz web: ve a **"Deploy"** > **"Railway Shell"** y ejecuta:

```bash
python manage.py seed_territorio_chile
python manage.py seed_preguntas_base
python manage.py seed_presidenciales_2025
python manage.py seed_diputados_2025
python manage.py seed_posturas_base
```

Esto puede tardar varios minutos.

---

## PARTE 2: Frontend en Vercel

### Paso 11 — Crear vercel.json

En la carpeta `frontend/`, crea un archivo `vercel.json`:

```json
{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- `buildCommand`: el comando que genera los archivos estaticos del frontend
- `outputDirectory`: la carpeta donde Expo pone el resultado
- `rewrites`: necesario para que la navegacion interna de la app funcione (SPA routing)

---

### Paso 12 — Commit y push

```bash
git add frontend/vercel.json
git commit -m "chore: configuracion de deploy para Vercel"
git push
```

---

### Paso 13 — Crear el proyecto en Vercel

1. Entra a [vercel.com](https://vercel.com) y crea una cuenta con GitHub
2. Click en **"Add New"** > **"Project"**
3. Selecciona el repositorio de la app
4. En **"Root Directory"**, escribe `frontend`
5. Vercel va a detectar el `vercel.json` automaticamente

---

### Paso 14 — Configurar variables de entorno en Vercel

En la misma pantalla de configuracion del proyecto, antes de hacer deploy, agrega:

| Variable | Valor |
|---|---|
| `EXPO_PUBLIC_API_BASE` | La URL de tu backend en Railway + `/api/v1`, ejemplo: `https://mi-app.up.railway.app/api/v1` |

Esta variable le dice al frontend donde esta el backend. Sin esto, el frontend
sigue apuntando a `localhost:8010` (tu computadora) y no va a funcionar en internet.

---

### Paso 15 — Deploy

Click en **"Deploy"**. Vercel va a:
1. Clonar el repo
2. Correr `npx expo export -p web` (tarda 2-3 minutos la primera vez)
3. Subir los archivos a su CDN global
4. Darte una URL como `https://mi-app.vercel.app`

---

### Paso 16 — Conectar Vercel con Railway (CORS)

Ahora que tenes la URL de Vercel, vuelve a Railway y actualiza la variable:

| Variable | Valor nuevo |
|---|---|
| `CORS_ALLOWED_ORIGINS` | `https://mi-app.vercel.app` |
| `PASSWORD_RESET_URL_BASE` | `https://mi-app.vercel.app/reset-password` |
| `ALLOWED_HOSTS` | `mi-app.up.railway.app` |

Railway va a reiniciar automaticamente con los nuevos valores.

---

## Verificacion final

Abri `https://mi-app.vercel.app` en el browser. La app deberia:
- Cargar sin errores
- Mostrar el cuestionario y los candidatos
- Permitir crear cuenta y loguearse

Si ves errores de CORS en la consola del browser, revisa que `CORS_ALLOWED_ORIGINS`
en Railway tenga exactamente la URL de Vercel (sin slash al final).

---

## Deploys futuros

Una vez configurado, cualquier push a la rama `main` va a:
- Triggerear un nuevo deploy automatico en Vercel (frontend)
- Triggerear un nuevo deploy automatico en Railway (backend)

No necesitas hacer nada manual.

---

## Costos

| Servicio | Plan gratuito |
|---|---|
| Railway | 5 USD de credito por mes (suficiente para un proyecto chico con trafico bajo) |
| Vercel | Gratis sin limite para proyectos personales |
| Postgres en Railway | Incluido en el credito de 5 USD |

Si el credito de Railway se agota, Railway pausa el servicio hasta el proximo mes.
Para un proyecto de tesis o demo, generalmente alcanza.
