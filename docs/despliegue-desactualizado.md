> **DOCUMENTO DESACTUALIZADO** - Foto historica; puede no reflejar el estado actual del codigo.

# Guía de Despliegue a Producción

> Este documento cubre todo lo necesario para llevar la aplicación de
> desarrollo local a un entorno productivo real.
>
> Incluye la configuración de variables de entorno, el manejo correcto
> de cookies de autenticación, CORS, HTTPS, y los dos escenarios de
> arquitectura posibles (mismo dominio vs dominios separados).
>
> **Audiencia**: desarrolladores con acceso al servidor y al repositorio.
> No asume conocimiento previo de deployment, pero sí de la arquitectura
> del proyecto (ver `docs/sistema-tecnico.md` para contexto).

---

## Índice

1. [Contexto: cómo funciona la autenticación web](#1-contexto-cómo-funciona-la-autenticación-web)
2. [El problema de SameSite y por qué importa en producción](#2-el-problema-de-samesite-y-por-qué-importa-en-producción)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Escenario A — mismo dominio (recomendado)](#4-escenario-a--mismo-dominio-recomendado)
5. [Escenario B — dominios distintos](#5-escenario-b--dominios-distintos)
6. [Configuración del servidor](#6-configuración-del-servidor)
7. [Checklist pre-deploy](#7-checklist-pre-deploy)
8. [Errores comunes y cómo diagnosticarlos](#8-errores-comunes-y-cómo-diagnosticarlos)

---

## 1. Contexto: cómo funciona la autenticación web

La app usa un sistema de autenticación **dual** según la plataforma:

| Plataforma | Mecanismo | Dónde vive el token |
|-----------|-----------|---------------------|
| Mobile (iOS/Android) | Header `Authorization: Token <key>` | `SecureStore` del dispositivo |
| Web (browser) | Cookie `httpOnly` llamada `auth_token` | Cookie del browser, inaccesible desde JS |

En web, el browser **envía automáticamente** la cookie en cada request.
El frontend no necesita leer el token — simplemente hace requests
con `withCredentials: true` y el browser se encarga.

El backend tiene dos clases de autenticación registradas en este orden:

```python
# backend/api/settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "core.authentication.CookieTokenAuthentication",   # web primero
        "core.authentication.ExpiringTokenAuthentication", # mobile fallback
    ],
}
```

Si ninguna encuentra credenciales válidas → 401.

---

## 2. El problema de SameSite y por qué importa en producción

### Qué es SameSite

`SameSite` es un atributo de las cookies que le dice al browser cuándo
incluirlas en los requests. La cookie de autenticación se configura así:

```python
# backend/core/authentication.py
response.set_cookie(
    "auth_token",
    token_key,
    samesite="Lax",   # ← el atributo clave
    httponly=True,
    secure=not DEBUG,
    ...
)
```

Con `SameSite=Lax`, el browser envía la cookie **solo cuando el origen
del request y el destino son del mismo "sitio"** (o cuando es una
navegación de nivel superior vía GET).

### Qué cuenta como "mismo sitio"

El browser determina "mismo sitio" por el **dominio registrable** (eTLD+1),
no por host ni puerto:

| Frontend | Backend | ¿Mismo sitio? | ¿Cookie enviada? |
|----------|---------|:-------------:|:----------------:|
| `localhost:8082` | `localhost:8010` | Sí |  |
| `localhost:8082` | `127.0.0.1:8010` | **No** |  |
| `VotoAFin.cl` | `api.VotoAFin.cl` | Sí |  |
| `VotoAFin.cl` | `backend.fly.dev` | **No** |  |
| `app.VotoAFin.cl` | `api.VotoAFin.cl` | Sí |  |

> **Por qué `localhost` ≠ `127.0.0.1`**: aunque ambos resuelven a la
> misma IP, son hostnames distintos. El browser los trata como sitios
> distintos para el propósito de SameSite. Esto causó el BUG-005
> en desarrollo (ver `issues/BUG-005-glitch-post-reset-login-vacio.md`).

### La regla de oro para este proyecto

> **El frontend y el backend deben compartir el mismo dominio registrable.**

Ejemplos válidos:
- `VotoAFin.cl` + `api.VotoAFin.cl`
- `www.VotoAFin.cl` + `api.VotoAFin.cl`
- `VotoAFin.cl` + `VotoAFin.cl/api/` (mismo host, rutas distintas)

Ejemplos inválidos (rompen la autenticación web):
- `VotoAFin.cl` + `mi-backend.fly.dev`
- `VotoAFin.cl` + `VotoAFin.vercel.app`
- `localhost:3000` + `127.0.0.1:8000`

---

## 3. Variables de entorno

### 3.1 Backend (`backend/.env`)

Crear el archivo `.env` en la raíz del backend. **Nunca commitear este
archivo** (está en `.gitignore`).

```bash
# ─── Seguridad ────────────────────────────────────────────────────────────────
# Generar con: python -c "import secrets; print(secrets.token_urlsafe(50))"
SECRET_KEY=<genera-una-clave-aleatoria-larga>

# En producción SIEMPRE False
DEBUG=False

# Dominios que Django acepta en el header Host
ALLOWED_HOSTS=VotoAFin.cl,api.VotoAFin.cl,www.VotoAFin.cl

# ─── Entorno ──────────────────────────────────────────────────────────────────
# Activa guards de seguridad (no permite DEBUG=True si es prod/production)
ENV=production

# ─── Base de datos ────────────────────────────────────────────────────────────
# SQLite solo para desarrollo. En producción, Postgres obligatorio.
DATABASE_URL=postgres://usuario:password@host:5432/nombre_db

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Exactamente el origen del frontend web. Sin trailing slash.
CORS_ALLOWED_ORIGINS=https://VotoAFin.cl,https://www.VotoAFin.cl

# ─── Autenticación ────────────────────────────────────────────────────────────
# Duración del token en días (7 es el default, no bajar de 1)
TOKEN_TTL_DAYS=7

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.tuproveedor.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=no-reply@VotoAFin.cl
EMAIL_HOST_PASSWORD=<password-del-smtp>
DEFAULT_FROM_EMAIL=no-reply@VotoAFin.cl

# URL base que se incluye en el email de "olvidé mi contraseña"
# Debe apuntar a donde corre el frontend en producción
PASSWORD_RESET_URL_BASE=https://VotoAFin.cl/reset-password

# ─── Zona horaria ─────────────────────────────────────────────────────────────
TIME_ZONE=America/Santiago
LANGUAGE_CODE=es-cl

# ─── Observabilidad (opcional) ────────────────────────────────────────────────
# SENTRY_DSN=https://...@sentry.io/...
# SENTRY_ENVIRONMENT=production
```

#### Variables críticas de seguridad

| Variable | Por qué es crítica |
|----------|-------------------|
| `SECRET_KEY` | Firma las sesiones y tokens CSRF. Si se filtra, hay que rotar inmediatamente. |
| `DEBUG=False` | Sin esto, Django expone stack traces completos, lista de URLs y configuración interna al público. |
| `DATABASE_URL` con Postgres | SQLite es single-writer: se cuelga con múltiples requests concurrentes. |
| `ENV=production` | Activa un guard que impide arrancar si `DEBUG=True` con `ENV=prod`. |

### 3.2 Frontend (variable de entorno de build)

La URL del backend se configura con `EXPO_PUBLIC_API_BASE`. Esta variable
se inyecta en el **tiempo de build**, no en runtime.

```bash
# Para build web (Expo)
EXPO_PUBLIC_API_BASE=https://api.VotoAFin.cl/api/v1
```

**Cómo setearla según la plataforma de deployment:**

```bash
# Si buildeás manualmente
EXPO_PUBLIC_API_BASE=https://api.VotoAFin.cl/api/v1 npx expo export -p web

# En un Dockerfile de frontend
ENV EXPO_PUBLIC_API_BASE=https://api.VotoAFin.cl/api/v1

# En GitHub Actions / CI
env:
  EXPO_PUBLIC_API_BASE: https://api.VotoAFin.cl/api/v1
```

> **Importante**: `EXPO_PUBLIC_*` es el prefijo que Expo usa para exponer
> variables al bundle del browser. Sin ese prefijo, la variable no llega
> al frontend. No usar para secretos (el bundle es público).

El valor default en el código (`localhost:8010`) solo aplica cuando la
variable no está seteada — es decir, exclusivamente en desarrollo local.
En producción siempre debe estar seteada.

---

## 4. Escenario A — mismo dominio (recomendado)

Este es el escenario recomendado. Frontend y backend comparten el mismo
dominio raíz (`VotoAFin.cl`). La cookie `SameSite=Lax` funciona
sin cambios en el código.

### Arquitectura

```
Usuario
  │
  ├─ https://VotoAFin.cl          → Expo Web (frontend estático)
  │                                          Servido por Nginx o CDN
  │
  └─ https://api.VotoAFin.cl      → Django (backend)
                                             Gunicorn detrás de Nginx
```

Ambos son subdominios de `VotoAFin.cl` → mismo sitio →
cookie enviada automáticamente en todos los requests.

### DNS

Crear dos registros A (o CNAME si usas un proxy como Cloudflare):

```
VotoAFin.cl      A    <IP del servidor frontend>
api.VotoAFin.cl  A    <IP del servidor backend>
```

Si ambos corren en el mismo servidor:

```
VotoAFin.cl      A    <IP del servidor>
api.VotoAFin.cl  A    <IP del servidor>
```

### Nginx — ejemplo de configuración

```nginx
# /etc/nginx/sites-available/VotoAFin

# Frontend (Expo Web — archivos estáticos)
server {
    listen 443 ssl;
    server_name VotoAFin.cl www.VotoAFin.cl;

    ssl_certificate     /etc/letsencrypt/live/VotoAFin.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/VotoAFin.cl/privkey.pem;

    root /var/www/VotoAFin/frontend/dist;
    index index.html;

    # SPA: cualquier ruta no encontrada sirve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos (Expo genera hashes en los nombres)
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend (Django vía Gunicorn)
server {
    listen 443 ssl;
    server_name api.VotoAFin.cl;

    ssl_certificate     /etc/letsencrypt/live/api.VotoAFin.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.VotoAFin.cl/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Archivos media (fotos de candidatos, etc.)
    location /media/ {
        alias /var/www/VotoAFin/backend/media/;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name VotoAFin.cl www.VotoAFin.cl api.VotoAFin.cl;
    return 301 https://$host$request_uri;
}
```

### Cambios en el código para este escenario

**Backend `.env`** (sin cambios en el código, solo configuración):

```bash
DEBUG=False
ALLOWED_HOSTS=VotoAFin.cl,www.VotoAFin.cl,api.VotoAFin.cl
CORS_ALLOWED_ORIGINS=https://VotoAFin.cl,https://www.VotoAFin.cl
```

**`backend/core/authentication.py`**: sin cambios.
`SameSite=Lax` funciona correctamente con este esquema de dominios.

**Frontend**: setear `EXPO_PUBLIC_API_BASE=https://api.VotoAFin.cl/api/v1`
en el proceso de build.

---

## 5. Escenario B — dominios distintos

Este escenario ocurre cuando el frontend y el backend están en dominios
completamente distintos (por ejemplo, frontend en Vercel y backend en
Fly.io, Railway, o un VPS).

```
Frontend:  https://VotoAFin.cl       (dominio propio)
Backend:   https://mi-backend.fly.dev       (dominio del proveedor)
```

### Por qué es problemático

Con `SameSite=Lax`, la cookie seteada por `fly.dev` **no se envía**
en requests XHR desde `VotoAFin.cl`. Son dominios distintos.
El backend recibe requests sin cookie → 401 → la app bota al login.

### Solución: SameSite=None + Secure

Si no es posible alinear los dominios, hay que cambiar el atributo
`SameSite` de la cookie:

```python
# backend/core/authentication.py

def set_auth_cookie(response, token_key: str) -> None:
    ttl_days = getattr(settings, "TOKEN_TTL_DAYS", 7)
    # Con SameSite=None, Secure es OBLIGATORIO (browsers lo ignoran sin él)
    response.set_cookie(
        AUTH_COOKIE_NAME,
        token_key,
        max_age=ttl_days * 24 * 60 * 60,
        httponly=True,
        samesite="None",   # ← cambio respecto al default
        secure=True,       # ← siempre True con SameSite=None
        path="/",
    )
```

**Advertencias importantes:**

| | SameSite=Lax (default) | SameSite=None |
|---|---|---|
| Requiere HTTPS | Solo en prod | **Siempre** |
| Protección CSRF | Alta (bloquea cross-site POST) | Baja (requiere CSRF token explícito) |
| Compatibilidad | Todos los browsers modernos | Todos los browsers modernos |
| Recomendado para este proyecto | **Sí** (mismo dominio) | Solo si mismo dominio es imposible |

Si usás `SameSite=None`, agregar protección CSRF explícita. Django
tiene soporte nativo, pero requiere que el frontend envíe el
`csrftoken` en el header `X-CSRFToken` en cada POST/PUT/DELETE.
Ver `backend/core/authentication.py` para el comentario sobre CSRF.

### Configuración CORS adicional para dominios distintos

Con dominios distintos también hay que configurar CORS correctamente.
Django-cors-headers ya está instalado, solo requiere configuración:

```bash
# backend/.env
CORS_ALLOWED_ORIGINS=https://VotoAFin.cl,https://www.VotoAFin.cl
```

Y verificar que `CORS_ALLOW_CREDENTIALS=True` esté en `settings.py`
(ya está; no hay que agregarlo).

---

## 6. Configuración del servidor

### 6.1 Backend — Gunicorn

En producción **nunca usar `python manage.py runserver`**. Usar Gunicorn:

```bash
# Instalar
pip install gunicorn

# Arrancar (desde el directorio backend/)
gunicorn api.wsgi:application \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/gunicorn/access.log \
    --error-logfile /var/log/gunicorn/error.log
```

**Cantidad de workers recomendada**: `2 × núcleos_CPU + 1`.
Para un VPS de 2 núcleos: 5 workers.

### 6.2 Backend — Systemd (para que sobreviva reinicios)

```ini
# /etc/systemd/system/VotoAFin-backend.service

[Unit]
Description=VotoAFin Backend (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/VotoAFin/backend
EnvironmentFile=/var/www/VotoAFin/backend/.env
ExecStart=/var/www/VotoAFin/backend/.venv/bin/gunicorn \
    api.wsgi:application \
    --workers 3 \
    --bind 127.0.0.1:8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable VotoAFin-backend
sudo systemctl start VotoAFin-backend
```

### 6.3 Frontend — Build de Expo Web

```bash
cd frontend/

# Instalar dependencias
npm install

# Build de producción
EXPO_PUBLIC_API_BASE=https://api.VotoAFin.cl/api/v1 \
    npx expo export -p web

# El output queda en frontend/dist/
# Copiar al servidor:
rsync -av dist/ usuario@servidor:/var/www/VotoAFin/frontend/dist/
```

### 6.4 HTTPS con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Emitir certificados
sudo certbot --nginx \
    -d VotoAFin.cl \
    -d www.VotoAFin.cl \
    -d api.VotoAFin.cl

# Auto-renovación (certbot lo configura automáticamente vía cron)
sudo certbot renew --dry-run
```

### 6.5 Django — collectstatic y migraciones

Cada deploy debe ejecutar:

```bash
cd backend/

# Aplicar migraciones pendientes
python manage.py migrate

# Recolectar archivos estáticos (admin de Django, drf-spectacular, etc.)
python manage.py collectstatic --no-input

# Reiniciar Gunicorn para cargar el código nuevo
sudo systemctl restart VotoAFin-backend
```

---

## 7. Checklist pre-deploy

Usar esta lista antes de cada deploy a producción.

### Seguridad

- [ ] `DEBUG=False` en `.env` del backend
- [ ] `ENV=production` en `.env` del backend
- [ ] `SECRET_KEY` es aleatoria y no está en el repositorio
- [ ] `ALLOWED_HOSTS` solo contiene los dominios reales (sin `*`)
- [ ] `CORS_ALLOWED_ORIGINS` solo contiene los orígenes del frontend real
- [ ] HTTPS activo en ambos dominios (frontend y backend)
- [ ] Certificados SSL válidos y con auto-renovación configurada
- [ ] `.env` está en `.gitignore` y no fue commiteado nunca

### Base de datos

- [ ] `DATABASE_URL` apunta a Postgres (no a SQLite)
- [ ] `python manage.py migrate` ejecutado en el servidor
- [ ] Backup de la base de datos antes del deploy

### Frontend

- [ ] `EXPO_PUBLIC_API_BASE` seteado con la URL de producción del backend
- [ ] Build generado con `npx expo export -p web`
- [ ] Nginx configurado con `try_files $uri /index.html` para el SPA

### Autenticación web (cookies)

- [ ] Frontend y backend comparten el mismo dominio raíz **O** se cambió
      `SameSite=Lax` a `SameSite=None` con `secure=True`
- [ ] `CORS_ALLOW_CREDENTIALS=True` está en `settings.py` (ya está)
- [ ] Verificar manualmente: login en web → navegar a Home → no aparece
      401 en la consola del browser

### Email

- [ ] `EMAIL_BACKEND` es SMTP (no console)
- [ ] `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` configurados
- [ ] `PASSWORD_RESET_URL_BASE` apunta al frontend de producción
- [ ] Probar manualmente el flujo "olvidé mi contraseña" en producción

### Servidor

- [ ] Gunicorn corriendo como servicio systemd (no proceso manual)
- [ ] Nginx activo y con configuración correcta
- [ ] `python manage.py collectstatic` ejecutado
- [ ] Logs accesibles y con rotación configurada

---

## 8. Errores comunes y cómo diagnosticarlos

### "401 en mi-progreso o perfil inmediatamente después de login"

**Síntoma**: login funciona, pero HomeScreen muestra 401 en la consola
del browser al cargar `/api/v1/mi-progreso/` o `/api/v1/perfil/`.
La app vuelve al login con los campos vacíos.

**Causa**: la cookie de autenticación no se está enviando con los requests.
Casi siempre es un problema de `SameSite`.

**Diagnóstico**:
1. Abrir DevTools → Application → Cookies
2. Hacer login
3. Verificar que existe la cookie `auth_token` para el dominio del backend
4. Hacer un request a `/api/v1/mi-progreso/`
5. En la pestaña Network → verificar que el request incluye el header
   `Cookie: auth_token=...`

**Si la cookie existe pero no se envía**: el frontend y el backend están
en dominios distintos y `SameSite=Lax` está bloqueando la cookie.
Ver [Escenario B](#5-escenario-b--dominios-distintos).

**Si la cookie no existe**: el login response no está seteando la cookie.
Verificar que el response del login incluye el header
`Set-Cookie: auth_token=...`.

---

### "CORS error al hacer login"

**Síntoma**: la consola muestra algo como:
```
Access to XMLHttpRequest at 'https://api.VotoAFin.cl/api/v1/token-auth/'
from origin 'https://VotoAFin.cl' has been blocked by CORS policy
```

**Causa**: el origen del frontend no está en `CORS_ALLOWED_ORIGINS`.

**Fix**: agregar el origen exacto al `.env` del backend:
```bash
CORS_ALLOWED_ORIGINS=https://VotoAFin.cl,https://www.VotoAFin.cl
```

Reiniciar Gunicorn después del cambio.

---

### "DisallowedHost" (Django 400)

**Síntoma**: todas las requests al backend devuelven 400 con el mensaje
`Invalid HTTP_HOST header`.

**Causa**: el dominio del servidor no está en `ALLOWED_HOSTS`.

**Fix**: agregar el dominio al `.env`:
```bash
ALLOWED_HOSTS=api.VotoAFin.cl,VotoAFin.cl
```

---

### "La app carga pero las rutas directas dan 404"

**Síntoma**: entrar a `https://VotoAFin.cl` funciona, pero ir
directamente a `https://VotoAFin.cl/resultados` da 404.

**Causa**: Nginx no está configurado para servir `index.html` como
fallback para rutas del SPA.

**Fix**: agregar `try_files $uri $uri/ /index.html;` en el bloque
`location /` del Nginx del frontend (ya incluido en el ejemplo de
la sección 6.1).

---

### "Token expirado después de X días"

**Síntoma**: usuarios reportan que son deslogueados automáticamente.

**Causa esperada y normal**: el `TOKEN_TTL_DAYS` configurado expiró.
El sistema lo invalida y fuerza re-login. Es comportamiento correcto.

**Si ocurre antes del TTL**: revisar si hay algo que llama `logout()`
inesperadamente (interceptor de 401, ver arriba).

**Ajustar TTL**:
```bash
# backend/.env
TOKEN_TTL_DAYS=30  # días antes de forzar re-login
```

---

_Última actualización: 2026-07-30_
_Contexto: BUG-005 (SameSite mismatch localhost vs 127.0.0.1 en dev) documentó la_
_necesidad de esta guía. Ver `issues/BUG-005-glitch-post-reset-login-vacio.md`._
