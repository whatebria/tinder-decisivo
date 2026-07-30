# Changelog

Todos los cambios notables de Tinder Decisivo (matchVote) se documentan aca.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado segun [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Docs
- Analisis EGTAI v2 con evidencia real de `docs/` + `README.md` (~63% compliance)
- Analisis de robustez detallado (R2 = 78%, 25 tests documentados)
- Plan de inclusion de pueblos originarios y minorias (5 preguntas propuestas + 6 stakeholders)
- Bibliografia con 8 resumenes de papers VAA (Garzia, Velez, Buryakov, Stockinger, Stadelmann, Tromborg, Bachmann)
- Documentacion narrativa completa (nueva serie de 3 docs simple/tecnica/narrativa)
- Docs backend internos: fixtures, migraciones, docs_internos
- CONTRIBUTING.md, SECURITY.md, PRIVACY.md, LICENSE fisico agregados al root

### Added
- Frontend: `welcomeTour.ts` (onboarding slides, se muestra una vez por device)
- Frontend: 8 coach marks contextuales (home, cuestionario, resultados, perfilCandidato, guardados, noticias, comparador, gestionElecciones)
- Dataset publico con CSVs de candidatos y posturas 2025 + scripts de generacion

### Changed
- Refactor backend: modelos territoriales polimorficos, imports actualizados, settings mejorados
- Frontend: updates en `AppNavigator`, `DetalleCandidatoScreen`, `GestionEleccionesScreen`, `MisGuardadosScreen`, `NoticiasScreen`, `onboarding.ts`

### Removed
- `backend/docs/MIGRATION_TERRITORIAL.md` (obsoleto post-refactor)

### Security
- Auditoria interna 2026-07-26: 13 findings identificados (en tratamiento en repo privado)
- No hay vulnerabilidades criticas publicamente conocidas al momento

## [0.1.0] - 2026-07-XX (MVP)

Primera version funcional end-to-end.

### Added
- Flujo completo: registro -> cuestionario 12 preguntas -> match -> detalle candidato
- 6 candidatos presidenciales con 72 posturas draft
- 7 ejes: Economico, Social, Ambiental, Seguridad, Derechos Humanos, Internacional, Institucional
- Algoritmo de matching cuadratico con pesos por importancia
- Confianza del match: badges ALTA/MEDIA/TENTATIVA
- Modal educativo con 5 dimensiones de repercusiones por pregunta
- Filtro territorial polimorfico (16 regiones, 28 distritos, 346 comunas)
- Guest mode (match sin crear cuenta)
- Radar chart por eje en detalle de candidato
- Sistema de favoritos y descartados
- Feed de noticias por candidato (fetch via RSS)
- WCAG 2.2 AA target (docs/accesibilidad.md, 26 KB)

### Security
- Passwords hasheadas con PBKDF2
- HTTPS obligatorio en produccion, HSTS 1 año
- Rate limiting DRF (login 5/min, register 10/hour, password_reset 3/hour)
- Password reset con anti user-enumeration + tokens single-use TTL=1h
- Token authentication custom con TTL configurable
- Sentry con `send_default_pii=False`

### Testing
- 25 archivos de tests backend (pytest-django)
- Cobertura completa de endpoints, refactors, seeds, signals
- Frontend: 0% cobertura (planeado Sprint 10)

### Docs
- README completo con setup en 5 comandos
- `docs/` con 34 archivos MD (472 KB): arquitectura, algoritmo, tests, accesibilidad, comparacion VAAs, buenas practicas, sprints, estado actual

[Unreleased]: https://github.com/whatebria/tinder-decisivo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/whatebria/tinder-decisivo/releases/tag/v0.1.0
