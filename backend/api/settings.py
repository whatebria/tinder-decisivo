"""
Django settings for api project.

Docs: https://docs.djangoproject.com/en/5.2/topics/settings/
"""

from pathlib import Path

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------------
# Seguridad basica (todo desde .env)
# ------------------------------------------------------------
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="127.0.0.1,localhost",
    cast=Csv(),
)


# ------------------------------------------------------------
# Apps
# ------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceros
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "drf_spectacular",
    # Local
    "core",
    # Debe ir al final para escuchar signals de todas las apps
    "django_cleanup.apps.CleanupConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # antes de CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "api.wsgi.application"


# ------------------------------------------------------------
# Base de datos
# ------------------------------------------------------------
# Configurable via DATABASE_URL. Default: SQLite local (dev/tests).
# Prod: setear DATABASE_URL=postgres://user:pass@host:5432/dbname
# Ejemplos: postgres://... (Postgres), mysql://... (MySQL), sqlite:///... (SQLite)
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,          # reusa conexiones 10 min (irrelevante para SQLite)
        conn_health_checks=True,   # ping antes de usar conexion reciclada
    )
}


# ------------------------------------------------------------
# Validadores de password
# ------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        # NIST 800-63B recomienda 8+ chars como piso; subimos a 10 para agregar margen
        # sin volverlo hostil para el user. La longitud pesa mas que la complejidad.
        "OPTIONS": {"min_length": 10},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ------------------------------------------------------------
# i18n / tz  (app chilena)
# ------------------------------------------------------------
LANGUAGE_CODE = config("LANGUAGE_CODE", default="es-cl")
TIME_ZONE = config("TIME_ZONE", default="America/Santiago")
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------
# Static / Media
# ------------------------------------------------------------
STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ------------------------------------------------------------
# Email (para password reset)
# ------------------------------------------------------------
# En dev: console backend (imprime al stdout).
# En prod: setear EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend + SMTP config.
EMAIL_BACKEND = config(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL", default="no-reply@tinder-decisivo.cl"
)

# URL base a la que apunta el link del email de reset (front-end web).
PASSWORD_RESET_URL_BASE = config(
    "PASSWORD_RESET_URL_BASE", default="http://localhost:8081/reset-password"
)


# ------------------------------------------------------------
# DRF
# ------------------------------------------------------------
# TTL de tokens en dias. Tokens mas viejos son rechazados por
# ExpiringTokenAuthentication (fuerza re-login). Configurable via env.
TOKEN_TTL_DAYS = config("TOKEN_TTL_DAYS", default=30, cast=int)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # Reemplaza TokenAuthentication default para agregar expiracion.
        "core.authentication.ExpiringTokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Throttling: limita brute-force en endpoints sensibles.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",              # requests anonimos genericos
        "user": "300/min",             # requests autenticados genericos
        "login": "5/min",              # scope custom para login (brute-force)
        "register": "10/hour",         # scope custom para registro
        "password_reset": "3/hour",    # scope custom para reset password
    },
}

# ------------------------------------------------------------
# OpenAPI schema (drf-spectacular)
# ------------------------------------------------------------
SPECTACULAR_SETTINGS = {
    "TITLE": "Servel API",
    "DESCRIPTION": (
        "API REST del proyecto Servel: matching votante/candidato, cuestionarios, "
        "favoritos y noticias por candidato."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/v1",
}


# ------------------------------------------------------------
# CORS  (para que la app React Native / Expo pueda hablar con el backend)
# ------------------------------------------------------------
# NUNCA acoplar CORS_ALLOW_ALL_ORIGINS a DEBUG: si un deploy accidental queda
# con DEBUG=True, CORS se abre a todo internet. Siempre lista explicita.
# En dev, agregar en .env los origenes de Expo web (19006) y Metro (8081).
# Para React Native nativo (iOS/Android) el request sale sin Origin, asi que
# CORS no aplica; no hace falta agregar nada.
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="",
    cast=Csv(),
)
CORS_ALLOWED_ORIGIN_REGEXES = config(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    default="",
    cast=Csv(),
)

# ------------------------------------------------------------
# Hardening de seguridad para produccion (activo solo si DEBUG=False)
# ------------------------------------------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
    SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=31536000, cast=int)  # 1 anio
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Si estas detras de un proxy que hace HTTPS termination (Nginx, Cloudflare, etc.)
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # HttpOnly + SameSite para las cookies (defensa profunda vs XSS/CSRF)
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"
    # No exponer la version de Django en errores.
    X_FRAME_OPTIONS = "DENY"


# ------------------------------------------------------------
# Observabilidad: Sentry (opcional, se activa si hay SENTRY_DSN)
# ------------------------------------------------------------
SENTRY_DSN = config("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            LoggingIntegration(level=None, event_level=None),  # solo captura via logger.exception
        ],
        # Sample rate: 100% de errores, 10% de traces (baja este ultimo si te comes la quota)
        traces_sample_rate=config("SENTRY_TRACES_SAMPLE_RATE", default=0.1, cast=float),
        send_default_pii=False,  # no mandar emails/IPs del user sin consentimiento
        environment=config("SENTRY_ENVIRONMENT", default="development" if DEBUG else "production"),
        release=config("SENTRY_RELEASE", default=None),
    )


# ------------------------------------------------------------
# Logging
# ------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "core": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}
