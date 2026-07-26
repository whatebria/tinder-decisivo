"""
Django settings for api project.

Docs: https://docs.djangoproject.com/en/5.2/topics/settings/
"""

from pathlib import Path
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
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ------------------------------------------------------------
# Validadores de password
# ------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
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
# DRF
# ------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# ------------------------------------------------------------
# OpenAPI schema (drf-spectacular)
# ------------------------------------------------------------
SPECTACULAR_SETTINGS = {
    "TITLE": "Servel API",
    "DESCRIPTION": (
        "API REST del proyecto Servel: matching votante/candidato, cuestionarios, "
        "favoritos, decisiones finales y noticias por candidato."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/v1",
}


# ------------------------------------------------------------
# CORS  (para que la app React Native / Expo pueda hablar con el backend)
# ------------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="",
    cast=Csv(),
)
# En dev + Expo mobile los requests salen sin Origin, asi que en dev abrimos todo.
CORS_ALLOW_ALL_ORIGINS = DEBUG


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
