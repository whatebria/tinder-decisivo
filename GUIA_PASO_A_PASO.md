# 🚀 Guía Paso a Paso: Cómo levantar "Tinder Decisivo"

¡Hola! 👋 Esta es una guía detallada, clara y muy amigable donde te explico **exactamente qué hago y cómo levanto toda la aplicación** (tanto el Backend como el Frontend) paso a paso.

---

## 🧭 Resumen de la Arquitectura

**Tinder Decisivo** es una aplicación compuesta por dos partes principales que trabajan juntas:

```
           ┌────────────────────────┐
           │   Frontend (Expo Web)  │
           │  http://localhost:8081 │
           └───────────┬────────────┘
                       │ Peticiones API (JSON)
                       ▼
           ┌────────────────────────┐
           │   Backend (Django DRF) │
           │  http://localhost:8000 │
           └────────────────────────┘
```

1. **Backend (Servidor de Datos)**: Hecho en **Django 5.2 + Django REST Framework** con base de datos **SQLite**. Maneja preguntas, candidatos, algoritmos de cálculo de coincidencia (match) y noticias.
2. **Frontend (Interfaz de Usuario)**: Hecho en **React Native con Expo SDK 57** (para Web). Es la pantalla interactiva donde juegas a responder preguntas y ver a tus candidatos afines.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado en tu computadora:

- **Python 3.10+** y la herramienta [`uv`](https://github.com/astral-sh/uv) (un gestor de paquetes de Python ultra rápido).
- **Node.js LTS (v24+)** y `npm`.
- **Git**.

---

## 🛠️ Paso 1: Limpieza de Procesos Previos y Puertos

Para evitar el famoso error de *"El puerto ya está ocupado"* o *"Permiso denegado por archivo bloqueado"*:

1. **Revisar o cerrar procesos viejos de Python o Node:**
   ```powershell
   Get-Process -Name python, node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```
2. **Verificar que los puertos 8000 y 8081 estén libres:**
   ```powershell
   netstat -ano | findstr "8000 8081"
   ```
   *(Si no sale ningún resultado, ¡los puertos están 100% disponibles!)*

---

## ⚙️ Paso 2: Preparar y Levantar el Backend (Django)

Entramos a la carpeta `backend/`:

```powershell
cd backend
```

### 2.1 Crear el entorno virtual y sincronizar dependencias
Usamos `uv`, que instala y actualiza todas las librerías necesarias súper rápido:
```powershell
uv venv
uv sync
```

### 2.2 Preparar la Base de Datos (Migraciones)
Django necesita estructurar las tablas de la base de datos (SQLite en desarrollo):
```powershell
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### 2.3 Cargar datos de prueba (Opcional si es la primera vez)
Si la base de datos está vacía, podemos importar los datos iniciales de preguntas y candidatos:
```powershell
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv
uv run python manage.py import_posturas   fixtures/posturas_draft_verificar.csv
```

### 2.4 Encender el servidor Backend 🟢
Iniciamos Django escuchando en el puerto `8000`:
```powershell
uv run python manage.py runserver 0.0.0.0:8000
```
> **¿Qué pasa aquí?** El backend queda corriendo en segundo plano en `http://localhost:8000`.

---

## 🎨 Paso 3: Preparar y Levantar el Frontend (Expo Web)

Entramos a la carpeta `frontend/`:

```powershell
cd ../frontend
```

### 3.1 Comprobar que los tipos de TypeScript estén correctos
Corremos una verificación estática para asegurarnos de que no existan errores de código:
```powershell
npm run typecheck
```

### 3.2 Encender el servidor del Frontend 🟢
Iniciamos Expo en modo Web fijando el puerto en `8081`:
```powershell
npx expo start --web --port 8081
```
> **¿Qué pasa aquí?** Metro Bundler compila la aplicación web y la sirve en `http://localhost:8081`. La primera compilación suele tardar entre 30 y 60 segundos.

---

## ✅ Paso 4: Verificación de Funcionamiento

Una vez lanzados ambos comandos, probamos que todo responda correctamente:

1. **Health Check del Backend:**
   Entra en tu navegador o haz una petición a:
   👉 **[http://localhost:8000/api/health/](http://localhost:8000/api/health/)**
   Debe responderte un JSON amigable como este:
   ```json
   {
     "status": "ok",
     "api_version": "1.0.0",
     "django_version": "5.2.17",
     "debug": true,
     "checks": { "database": "ok" }
   }
   ```

2. **Documentación interactiva Swagger / OpenAPI:**
   👉 **[http://localhost:8000/api/v1/docs/](http://localhost:8000/api/v1/docs/)**

3. **Aplicación Web (Frontend):**
   Abre en tu navegador:
   👉 **[http://localhost:8081](http://localhost:8081)**

---

## 💡 Consejos y Solución de Problemas Frecuentes

- 🔒 **Error `Access is denied (os error 5)` al ejecutar `uv sync`:**
  Ocurre cuando hay un proceso de Python en segundo plano bloqueando la carpeta `.venv`. Cierra Python con `Stop-Process -Name python -Force` y vuelve a ejecutar `uv sync`.
- 🌐 **El Frontend no se conecta con el Backend:**
  Verifica en el archivo `backend/.env` que la variable `CORS_ALLOWED_ORIGINS` contenga `http://localhost:8081`.
- 📱 **¿Quieres probarlo en celular?**
  Descarga la app **Expo Go** en tu Android o iPhone y escanea el código QR que muestra la terminal al ejecutar `npx expo start`.

---

¡Y listo! 🎉 Con estos pasos simples la aplicación queda 100% operativa y lista para usar.
