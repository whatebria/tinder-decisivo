# Servel

Aplicacion movil para el ramo de Apps Moviles. Sistema tipo "Tinder electoral"
que permite a votantes chilenos encontrar afinidad con candidatos segun
respuestas a preguntas politicas.

## Arquitectura

- **Backend**: Django 5.2 + Django REST Framework (Token auth)
- **Frontend**: React Native + Expo + Tamagui + TypeScript
- **DB**: SQLite (dev) / Postgres (prod recomendado)

## Documentacion

- [`docs/guia-simple.md`](docs/guia-simple.md) - Que hace la app, explicado sin tecnicismos.
- [`docs/doc-tecnica.md`](docs/doc-tecnica.md) - Arquitectura, modelos, endpoints, algoritmo, seguridad y roadmap.

```
servel/
|-- backend/    Django REST API
`-- frontend/   React Native app (Expo)
```

## Backend (Django)

### Requisitos

- Python 3.10+
- `uv` (recomendado) o `pip`

### Setup

```bash
cd backend
uv venv
uv sync                          # o: pip install -r requirements.txt
cp .env.example .env             # editar SECRET_KEY y ALLOWED_HOSTS
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver 0.0.0.0:8000
```

### Variables de entorno (.env)

| Variable          | Descripcion                             | Default (dev)   |
| ----------------- | --------------------------------------- | --------------- |
| `SECRET_KEY`      | Clave de firma de Django                | (obligatoria)   |
| `DEBUG`           | Modo debug                              | `False`         |
| `ALLOWED_HOSTS`   | Lista separada por comas                | `127.0.0.1,localhost` |
| `CORS_ALLOWED_ORIGINS` | Origenes permitidos para CORS      | vacio           |

### Endpoints principales

| Metodo | Ruta                              | Auth            |
| ------ | --------------------------------- | --------------- |
| POST   | `/api/register/`                  | Publico         |
| POST   | `/api/login/`                     | Publico         |
| GET    | `/api/tipos-eleccion/`            | Token           |
| GET    | `/api/candidatos/`                | Token           |
| GET    | `/api/candidatos/<id>/`           | Token           |
| GET    | `/api/preguntas/?tipo_eleccion_id=` | Token         |
| POST   | `/api/respuestas/`                | Token           |
| POST   | `/api/match-candidatos/`          | Token           |
| CRUD   | `/api/candidatos-favoritos/`      | Token           |
| CRUD   | `/api/descartados/`               | Token           |
| CRUD   | `/api/decision-final/`            | Token           |
| GET    | `/api/noticias/`                  | Publico         |
| POST/PUT/DELETE | `/api/noticias/...`      | Admin           |

### Tests

```bash
cd backend
uv run pytest
```

## Frontend (React Native)

Ver [`frontend/README.md`](frontend/README.md).

## Licencia

Uso academico. Proyecto del ramo de Apps Moviles.
