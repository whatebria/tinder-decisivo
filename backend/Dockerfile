# syntax=docker/dockerfile:1.7
# Multi-stage build para produccion. Imagen final ~150MB.
#
# Build local:
#   docker build -t votoafin-backend:local -f backend/Dockerfile backend/
# Run local:
#   docker run --rm -p 8000:8000 -e SECRET_KEY=dev -e DEBUG=False \
#       -e DATABASE_URL=sqlite:///db.sqlite3 votoafin-backend:local

# ---------- Stage 1: builder ----------
FROM python:3.13-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# Dependencias de sistema para compilar psycopg y Pillow.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev libjpeg-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .
RUN pip install --user -r requirements.txt gunicorn

# ---------- Stage 2: runtime ----------
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/home/app/.local/bin:$PATH

# Runtime libs (sin dev headers, mucho mas chico).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 libjpeg62-turbo zlib1g \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash app

WORKDIR /app

# Copia solo los site-packages del builder.
COPY --from=builder --chown=app:app /root/.local /home/app/.local
COPY --chown=app:app . .

USER app

# collectstatic para servir con WhiteNoise / behind Nginx.
RUN python manage.py collectstatic --noinput --clear || true

EXPOSE 8000

# Healthcheck usando el endpoint que ya existe (chequea DB).
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health/', timeout=3)" || exit 1

# gunicorn con 3 workers (ajustar segun CPUs disponibles: 2*CPU+1).
# --preload comparte codigo entre workers = menos RAM.
CMD ["gunicorn", "api.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "60", \
     "--preload", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
