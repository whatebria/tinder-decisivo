> **Este documento reemplaza a `doc-tecnica-desactualizado.md`.**
> Para el algoritmo de matching, ver `docs/sistema-tecnico.md`.
> Para el estado operativo actual, ver `docs/estado-actual.md`.

# Documentacion tecnica — Tinder Decisivo (VotoAFin)

**Version**: 0.2.0
**Ultima actualizacion**: 2026-08-30
**Stack**: Django 5.2 + DRF + SQLite (dev) / PostgreSQL (prod) | React Native + Expo SDK 57 + TypeScript 6.0 strict
**Repo**: https://github.com/whatebria/tinder-decisivo

---

## 1. Overview

Tinder Decisivo es una **Voting Advice Application (VAA)** mobile-first para elecciones chilenas.
Los usuarios responden un cuestionario de 12 preguntas ponderadas en 7 ejes tematicos y el sistema calcula un porcentaje de afinidad contra cada candidato registrado, con desglose por eje y nivel de confianza.

### Arquitectura de alto nivel

```
+---------------------------+           +----------------------------+
|  Cliente: Expo / RN Web   |  HTTPS    |  Servidor: Django + DRF    |
|  - React 19 + TypeScript  | <-------> |  - Python 3.10+            |
|  - Tamagui UI             |  Token    |  - PostgreSQL (prod)       |
|  - TanStack Query 5       |  Auth     |  - SQLite (dev)            |
|  - Zustand                |           |  - drf-spectacular         |
+---------------------------+           +----------------------------+
```

**Contrato**: OpenAPI 3.1 auto-generado por `drf-spectacular`. El frontend nunca inventa un shape — consume los tipos via `openapi-typescript`.

**Puertos por defecto en dev**:
- Backend: `:8010`
- Frontend Metro: `:8081`

---

## 2. Stack y dependencias

### Backend

| Paquete | Version | Rol |
|---|---|---|
| `Django` | `>=5.2,<5.3` | Framework web |
| `djangorestframework` | `>=3.15` | API REST + Token auth |
| `django-cors-headers` | `>=4.4` | CORS para la app RN |
| `drf-spectacular` | `>=0.27` | OpenAPI 3.1 schema |
| `python-decouple` | `>=3.8` | Config desde `.env` |
| `Pillow` | `>=10.3` | ImageField |
| `dj-database-url` | `>=2.2` | DATABASE_URL env var |
| `psycopg[binary]` | `>=3.2` | Driver PostgreSQL |
| `sentry-sdk` | `>=2.18` | Error tracking |

**Dev**:

| Paquete | Version | Rol |
|---|---|---|
| `pytest` | `>=8.3` | Test runner |
| `pytest-django` | `>=4.9` | Integracion Django/pytest |
| `pytest-cov` | `>=5.0` | Coverage |

**Package manager**: `uv` (Astral). No usar `pip` directamente.

### Frontend

| Componente | Version | Rol |
|---|---|---|
| Node.js | LTS v24.19.0+ | Runtime (npm, npx, Metro) |
| Expo SDK | 57 | Runtime cross-platform |
| React | 19.2 | Framework UI |
| React Native | 0.86 | Renderer nativo + web |
| TypeScript | 6.0 strict | Tipos |
| TanStack Query | 5.101 | Data fetching + cache |
| Zustand | 5.0 | State local (auth, form) |
| axios | 1.18 | HTTP client |
| React Navigation | 7 native-stack | Routing |
| expo-secure-store | 57 | Token storage nativo |
| openapi-typescript | 7.13 | Types desde el backend |

---

## 3. Configuracion de entorno

### Variables `.env` (backend)

| Variable | Tipo | Default | Descripcion |
|---|---|---|---|
| `SECRET_KEY` | str | (obligatoria) | Clave de firma de Django |
| `DEBUG` | bool | `False` | Modo debug |
| `ALLOWED_HOSTS` | csv | `127.0.0.1,localhost` | Hosts validos |
| `CORS_ALLOWED_ORIGINS` | csv | `""` | Origenes CORS (produccion) |
| `DATABASE_URL` | str | (SQLite si omitida) | URL de base de datos |
| `TIME_ZONE` | str | `America/Santiago` | TZ para timestamps |
| `LANGUAGE_CODE` | str | `es-cl` | Idioma del admin |

### Variables frontend (Expo)

| Variable | Default dev | Descripcion |
|---|---|---|
| `EXPO_PUBLIC_API_BASE` | `http://localhost:8010/api/v1` | URL base del backend |

---

## 4. Pipeline de inicializacion

### Backend (primera vez)

```bash
cd backend
cp .env.example .env           # editar SECRET_KEY
uv cache clean
uv sync --upgrade --default-index https://pypi.org/simple
uv run python manage.py migrate
uv run python manage.py check
uv run python manage.py createsuperuser

# Seed data (idempotente)
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv
uv run python manage.py import_posturas   fixtures/posturas_draft_verificar.csv

uv run python manage.py runserver 0.0.0.0:8010
```

### Frontend (primera vez)

```bash
cd frontend

# Borrar lockfile si fue generado en una red corporativa
Remove-Item package-lock.json -ErrorAction SilentlyContinue   # PowerShell
# rm package-lock.json                                          # bash/zsh

# Recargar variables de entorno en la sesion activa de PowerShell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Instalar dependencias desde el registry publico
npm install --legacy-peer-deps --registry=https://registry.npmjs.org/

# Sincronizar tipos de entorno de Expo (genera expo-env.d.ts)
npx expo customize tsconfig.json

# Verificar tipado — DEBE salir con 0 errores
npx tsc --noEmit

# Arrancar
npx expo start --web --port 8081
```

---

## 5. Configuracion canonica de TypeScript

`frontend/tsconfig.json` para Expo SDK 57 con tipado estricto:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["jest", "node"]
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js",
    "scripts/lib/__fixtures__"
  ]
}
```

**Invariantes**:
- `expo/tsconfig.base` vive en `node_modules/expo/tsconfig.base.json` — requiere `expo` instalado.
- `scripts/lib/__fixtures__` excluido explicitamente: los showcase files de dev referencian componentes que no existen en el bundle de produccion y causarian errores de compilacion.
- `npx tsc --noEmit` debe pasar con 0 errores antes de cada commit (ver `npm run typecheck`).

---

## 6. Estructura del repositorio

```
tinder-decisivo/
├── backend/                     # Django project
│   ├── api/                     # settings, wsgi, urls raiz
│   ├── core/                    # unica app funcional
│   │   ├── models/              # 19 modelos en submodulos
│   │   ├── views/               # DRF viewsets por dominio
│   │   ├── services/            # logica de negocio pura
│   │   ├── serializers/
│   │   ├── management/commands/ # 16 comandos idempotentes
│   │   └── migrations/          # 42 migraciones
│   ├── fixtures/                # CSVs de datos de ejemplo
│   ├── .env.example
│   ├── pyproject.toml
│   └── manage.py
├── frontend/                    # Expo SDK 57 app
│   ├── src/
│   │   ├── api/                 # axios + React Query hooks
│   │   ├── components/          # atoms / molecules / organisms
│   │   ├── screens/             # 17 pantallas
│   │   ├── services/            # logica pura testeable
│   │   ├── store/               # Zustand (auth + cuestionario)
│   │   ├── theme/               # tokens de diseno
│   │   └── types/               # api.ts (auto-generado)
│   ├── tsconfig.json
│   └── package.json
└── docs/                        # documentacion tecnica y operativa
```

---

## 7. Troubleshooting de entorno

### Error "Incompatible React versions" (`react-dom@19.2.8` vs `react@19.2.3`)

En React 19, `react` y `react-dom` requieren exactamente la misma versión. Si `react-dom` usa un rango como `"^19.2.3"`, npm puede instalar parches superiores (ej. `19.2.8`) causando fallos de runtime.

**Mitigación**:
1. Fijar en `frontend/package.json` las dependencias exactas:
   ```json
   "dependencies": {
     "react": "19.2.3",
     "react-dom": "19.2.3"
   }
   ```
2. Añadir el bloque `"overrides"` para forzar paridad en dependencias transitivas:
   ```json
   "overrides": {
     "react": "19.2.3",
     "react-dom": "19.2.3"
   }
   ```
3. Ejecutar `npm install --legacy-peer-deps --registry=https://registry.npmjs.org/`.
4. Reiniciar Metro Bundler usando la bandera `-c` (`--clear`) para purgar la caché de transformación.

### Purga de caché en Metro Bundler (`-c` / `--clear`)

Al modificar `package.json` o actualizar paquetes en `node_modules`, Metro puede mantener módulos transformados previos en caché. Utilizar siempre:
```bash
npx expo start --web --port 8081 -c
```

### `File 'expo/tsconfig.base' not found`

`node_modules/expo` no existe. Causa mas comun: nunca se corrio `npm install`, o el `package-lock.json` apunta a un registry corporativo inaccesible.

```powershell
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps --registry=https://registry.npmjs.org/
npx expo customize tsconfig.json
```

### `npm` o `node` no reconocido en Windows

Node.js LTS (v24.19.0+ / v20.x+) en perfil de usuario (`%LOCALAPPDATA%\Programs\nodejs`).

```powershell
winget install OpenJS.NodeJS.LTS --scope user --accept-source-agreements --accept-package-agreements
# Recargar variables de entorno en la sesión activa de PowerShell:
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### `npm install` falla con DNS error (OS 11001) contra `artifacts.walmart.com`

El `package-lock.json` fue generado en una red Walmart con registry privado. Ese registry no es accesible fuera de la VPN.

```powershell
Remove-Item frontend\package-lock.json -Force
cd frontend
npm install --legacy-peer-deps --registry=https://registry.npmjs.org/
```

### `uv sync` falla con DNS error contra `pypi.ci.artifacts.walmart.com`

El `uv.lock` tiene URLs del registry privado de Walmart. Regenerar el lockfile contra PyPI publico:

```bash
uv cache clean
uv sync --upgrade --default-index https://pypi.org/simple
```

---

_Ultima revision: 2026-08-30 (post sprint 9)._
