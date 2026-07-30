# Politica de seguridad - Tinder Decisivo

## Reportar vulnerabilidades

Si encontraste una vulnerabilidad, **NO abras un issue publico** en el repositorio. Reportalos de forma privada.

### Opcion A: GitHub Security Advisory (preferida)

1. Ir a https://github.com/whatebria/tinder-decisivo/security/advisories
2. Click "Report a vulnerability"
3. Llenar el formulario. Todo queda privado hasta que decidamos publicarlo.

### Opcion B: Email

Enviar a la autora del proyecto via GitHub (perfil publico @whatebria).

Ideal incluir:
- Descripcion de la vulnerabilidad
- Pasos para reproducirla
- Impacto esperado (que puede hacer un atacante)
- Sugerencia de fix (opcional)

## Que esperar de nuestra parte

- **Acuse de recibo**: dentro de 7 dias (best-effort, es un proyecto de una persona).
- **Diagnostico inicial**: dentro de 14 dias.
- **Fix**: prioridad segun severidad:
  - CRIT: mejor esfuerzo dentro de 7 dias
  - HIGH: 30 dias
  - MED: 90 dias
  - LOW: proximo release

No hay bug bounty economico — es un proyecto sin fines de lucro. Se acredita al reporter en el changelog si asi lo prefiere.

## Alcance

- `backend/` (Django + DRF)
- `frontend/` (Expo + React Native + web)
- Endpoints publicos en produccion (cuando este deployed)

**Fuera de alcance**:
- Data del cuestionario (posturas de candidatos) — se acepta que sean draft y con confidence `LOW` en las fixtures iniciales.
- Vulnerabilidades en dependencias upstream sin patch disponible (se manejan via Dependabot).
- Ataques de denegacion de servicio (DoS).
- Social engineering.

## Medidas de seguridad existentes

Documentadas en `docs/buenas-practicas.md` seccion 13.

- Passwords hasheadas con PBKDF2 (Django default)
- HTTPS obligatorio en produccion (`SECURE_SSL_REDIRECT`, HSTS 1 año)
- Rate limiting DRF (login 5/min, register 10/hour, password reset 3/hour)
- CORS lista blanca explicita
- Anti user-enumeration en password reset
- Token TTL con `ExpiringTokenAuthentication` (custom, rota en cada login)
- Password reset tokens single-use con `secrets.token_urlsafe(48)`
- Sentry con `send_default_pii=False`

## Coordinacion de divulgacion

Se acuerda con el reporter una fecha razonable de divulgacion (usualmente 90 dias post-fix). El fix se publica primero en el codigo, despues en el CHANGELOG con credito al reporter.

## Auditoria

Se realizo una revision estatica interna en 2026-07-26 (13 findings, hoy en tratamiento en repo privado). Auditoria externa formal esta pendiente.
