<div align="center">

# Tinder Decisivo

**Find your ideal candidate. Swipe through positions, not faces.**

Voter-matching web app for Chilean elections. Answer 12 policy questions, get ranked matches with 6 candidates across 7 policy axes.

[Español](README.es.md) · [Live demo](#) · [Report bug](https://github.com/whatebria/tinder-decisivo/issues)

![Status](https://img.shields.io/badge/status-MVP-orange) ![License](https://img.shields.io/badge/license-AGPL--3.0-blue) ![Backend](https://img.shields.io/badge/backend-Django%205.2-092E20) ![Frontend](https://img.shields.io/badge/frontend-Expo%20SDK%2057-000020)

</div>

---

## Why this exists

Chile votes. A lot. Between plebiscites, presidential elections, senators, deputies, and municipal councils, an average voter faces thousands of decisions per decade — often with limited context on where each candidate actually stands.

Traditional voter guides fail because they're either **too long** (200-page PDFs nobody reads) or **too shallow** (one-line party summaries). Existing "voter matcher" tools in Chile are outdated, unmaintained, or driven by opaque scoring.

**Tinder Decisivo** is a mobile-first, transparent matcher: you answer 12 weighted Likert questions across 7 policy axes, and the app ranks candidates by measurable agreement — with a confidence score and per-axis breakdown so you understand *why* a match is high or low.

## What it does

- **12 policy questions** across 7 axes (Economy, Society, Environment, Security, Human Rights, International, Institutional)
- **Weighted answers**: you tell the app which questions matter more to you
- **Confidence scoring**: matches based on 3 questions are flagged tentative; matches based on 10+ are marked high-confidence
- **Radar visualization** of your agreement per axis with each candidate
- **Candidate detail** with recent news, biography, and per-question positions with justifications
- **Cross-platform**: runs on web (progressive web app), iOS, and Android from a single codebase

## Screenshots

_Coming soon — MVP screenshots pending._

## Tech stack

We picked boring, proven tools that get out of the way:

| Layer | Choice | Why |
|---|---|---|
| **Backend** | Django 5.2 + DRF | Battle-tested, admin panel for free, DRF for typed APIs |
| **Auth** | DRF Token Auth | Simple, sessionless, mobile-friendly |
| **DB** | SQLite (dev) / PostgreSQL (prod) | Zero config in dev, standard in prod |
| **API contract** | OpenAPI 3.1 via drf-spectacular | Auto-generates TypeScript types for the frontend |
| **Frontend** | Expo SDK 57 + React Native + Tamagui | One codebase for web + iOS + Android |
| **Data fetching** | TanStack Query v5 | Cache, retry, dedup out of the box |
| **State** | Zustand | Simpler than Redux, no boilerplate |
| **Types** | TypeScript strict + OpenAPI codegen | Backend contract = frontend truth |

## Architecture

```
                 +------------------+          +---------------------+
                 |  Expo Web / iOS  | <------> |  Django REST API    |
                 |  React Native    |  HTTPS   |  Token auth         |
                 |  Tamagui UI      |          |  DRF + spectacular  |
                 +------------------+          +---------------------+
                          |                             |
                          v                             v
                  +---------------+             +---------------+
                  |  IndexedDB /  |             |  PostgreSQL   |
                  |  SecureStore  |             |  (SQLite dev) |
                  +---------------+             +---------------+
```

**Frontend layers** (post-refactor):

- `src/api/` — typed endpoints + React Query hooks + query client
- `src/services/` — pure business logic (matching, questionnaire) — no React, fully unit-testable
- `src/store/` — Zustand for auth + questionnaire form state
- `src/components/` — primitive UI (Pressable-based, no leaky abstractions)
- `src/screens/` — thin: read hooks, render, dispatch actions

**Backend layers**:

- `core/models.py` — 8 models: `TipoEleccion`, `Candidato`, `Pregunta`, `OpcionRespuesta`, `RespuestaUsuario`, `PosturaCandidato`, `MatchCandidato`, `Noticia`
- `core/views.py` — DRF viewsets + custom `MatchCandidatoView` (the actual algorithm)
- `core/management/commands/` — 4 idempotent CSV importers
- `fixtures/` — sample data + template CSVs for candidates, questions, and positions

## Getting started (dev)

### Prerequisites

- **Python 3.10+** with [uv](https://github.com/astral-sh/uv)
- **Node.js 20.19.4+** (older versions warn but may work)
- **Git**

### Backend

```bash
cd backend
uv venv
uv sync
cp .env.example .env                        # generate a SECRET_KEY and paste it
uv run python manage.py migrate
uv run python manage.py createsuperuser

# Seed data (idempotent, safe to re-run)
uv run python manage.py import_preguntas fixtures/preguntas_ejemplo.csv
uv run python manage.py import_candidatos fixtures/candidatos_ejemplo.csv
uv run python manage.py import_posturas   fixtures/posturas_draft_verificar.csv
uv run python manage.py fetch_noticias    # optional: fetches recent news per candidate

uv run python manage.py runserver 0.0.0.0:8010
```

Backend is now on http://localhost:8010. Admin at http://localhost:8010/admin/.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npx expo start --web --port 8081
```

Open http://localhost:8081. First bundle takes 40-60s.

For iOS/Android: scan the QR with the Expo Go app, or press `i` / `a` in the terminal.

### Environment variables

| Variable | Description | Default (dev) |
|---|---|---|
| `SECRET_KEY` | Django signing key | **required** |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated | `127.0.0.1,localhost` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated | (empty) |

## Data disclaimer

The current candidate positions in `fixtures/posturas_draft_verificar.csv` are **draft data pending source verification**. Each row is annotated with a confidence level (`HIGH` / `MEDIUM` / `LOW`) in its `justificacion` field. Rows marked `LOW` should not be trusted for real voting decisions.

Verified positions require:

- Public candidate statements (interviews, press releases)
- Registered congressional votes
- Signed / vetoed legislation
- Official campaign platforms

Contributions with sourced, verified positions are welcome — see [Contributing](#contributing).

## Roadmap

**v0.1 — MVP (current)**
- Full E2E flow: register → questionnaire → match → candidate detail
- 12 questions, 6 candidates, 72 draft positions
- Chilean presidential election (2025-2026 context)

**v0.2 — Verified data (Q1 2026)**
- All 72 positions verified with primary sources
- Add positions for parliamentary candidates (senators, deputies)
- Public verification changelog

**v0.3 — Explainability (Q2 2026)**
- Show *which* questions caused a candidate to rank high/low
- "Change my answer" simulator to see how sensitive the match is
- Share match card as PNG for social

**v0.4 — Beyond presidential**
- Municipal and regional elections
- Personalized notifications on candidate news
- Candidate-side onboarding (self-service position updates with proof)

**v1.0 — Public launch**
- Hosted on tinder-decisivo.cl
- Load-tested for election-day traffic
- Multi-language (Spanish + Mapuzugun / Aymara for regional accessibility)

## Contributing

We're in MVP stage — contributions welcome, especially:

1. **Verified positions**: pick a candidate row from the CSV, replace the draft justification with a sourced one, open a PR with the source URL
2. **New questions**: suggest questions for underrepresented axes (currently light on `INTERNATIONAL` and `INSTITUCIONAL`)
3. **UI improvements**: WCAG 2.2 AA fixes, mobile ergonomics
4. **Translations**: Mapuzugun, Aymara, English for expat voters

Please open an issue first for large changes. See the [`docs/`](docs/) folder for architecture deep-dives:

- [`sprints.md`](docs/sprints.md) — full project history by sprint
- [`algoritmo-tecnico.md`](docs/algoritmo-tecnico.md) — matching algorithm reference (formulas, API, complexity)
- [`algoritmo-simple.md`](docs/algoritmo-simple.md) — same algorithm without math, for non-technical readers
- [`doc-tecnica.md`](docs/doc-tecnica.md) — legacy system-wide architecture doc (pre-refactor)

## Status

**Actively developed.** Not production-ready. No SLA. Do not rely on this for actual voting decisions until v0.2 (verified data) ships.

## License

AGPL-3.0. If you deploy a modified version publicly, you must share your changes.

Chose AGPL because voter-tech is public-interest infrastructure and forks should stay open.

## Author

Built by [@whatebria](https://github.com/whatebria) — Jenifer Castillo.

Started as an undergraduate mobile-apps thesis, now growing into something real.
