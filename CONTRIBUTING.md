# Guia para contribuir - Tinder Decisivo

Gracias por querer aportar. Este documento tiene lo minimo para que tu contribucion se merge rapido.

## Contexto rapido

Tinder Decisivo (matchVote) es un VAA (Voting Advice Application) para elecciones chilenas. Backend Django+DRF, frontend Expo/RN, licencia AGPL-3.0. Estamos en **MVP** (v0.1) — no es production-ready.

## Formas de contribuir

### 1. Posturas verificadas de candidatos (la mas util)

Las posturas actuales en `dataset/posturas_*.csv` son **draft**. Cada fila tiene un nivel de confianza (`HIGH`/`MEDIUM`/`LOW`) en su justificacion.

Como contribuir:
- Elegi una postura marcada `LOW` o `MEDIUM`
- Buscas una fuente publica verificable (declaracion en prensa, voto en el Congreso, ley firmada/vetada, programa oficial)
- Reemplazas la justificacion con la version verificada
- Cambias el nivel a `HIGH`
- Abris un PR con el link de la fuente en el commit

Requerimientos:
- Fuente **publica y trazable** (URL permanente ideal, o cita de medio con fecha)
- Sin editorial personal sobre el candidato — solo la postura

### 2. Nuevas preguntas

Especialmente para ejes subrepresentados: **INTERNATIONAL** e **INSTITUCIONAL**. Ver `documentacion_tesis/inclusion_pueblos_originarios_minorias.html` para propuestas sobre pueblos originarios y minorias.

Formato: pregunta Likert-5 clara, sin ambiguedad, polemica (que discrimine entre candidatos).

### 3. Traducciones

Roadmap v1.0 incluye Mapuzugun, Aymara e Ingles. Contactanos si podes traducir profesionalmente.

### 4. Bugs y mejoras de UI

- Bugs: **https://github.com/whatebria/tinder-decisivo/issues**
- Vulnerabilidades: NO usar issues publicos, ver `SECURITY.md`
- Mejoras WCAG 2.2 AA: siempre bienvenidas, ver `docs/accesibilidad.md`

## Flujo de PR

1. Fork del repo
2. Rama con nombre descriptivo (`feat/xxx`, `fix/xxx`, `docs/xxx`)
3. Commits atomicos con [Conventional Commits](https://www.conventionalcommits.org/)
4. Correr tests locales:
   ```bash
   cd backend && uv run pytest
   ```
5. PR con descripcion clara: que problema resuelve, que cambia, como probaste

## Estilo de codigo

- **Backend (Python)**: PEP 8, PEP 20 (Zen of Python), type hints donde ayude
- **Frontend (TypeScript)**: strict mode, hooks funcionales, sin `any`
- **Docs**: markdown en español latinoamericano neutro (tuteo)

Detalle completo en `docs/buenas-practicas.md`.

## Cosas que NO aceptamos

- Endorsements de candidatos ("X es la mejor opcion")
- Preguntas cargadas retoricamente ("estas de acuerdo con destruir el pais?")
- Editorial sobre partidos politicos
- Codigo que rompa AGPL-3.0 (dependencias con licencias incompatibles)
- Tracking, ads, telemetria no consentida

## Codigo de conducta

Sin acoso, sin discriminacion, sin ataques ad-hominem. Este es un proyecto de infraestructura civica — se espera profesionalismo, especialmente en temas politicos sensibles.

Reportes de mal comportamiento: contactar a @whatebria via GitHub.

## Licencia

Al contribuir, aceptas que tu aporte se licencie bajo AGPL-3.0. Si trabajaste bajo contrato de trabajo, asegurate de tener autorizacion para contribuir.

## Contacto

- Issues publicos: https://github.com/whatebria/tinder-decisivo/issues
- Security: ver `SECURITY.md`
- Mantenedora: Jenifer Castillo (@whatebria)
