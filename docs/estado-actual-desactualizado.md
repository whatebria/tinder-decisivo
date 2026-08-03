# Estado actual de la app

> Foto honesta a fecha 2026-07-25.
>
> Este documento responde tres preguntas:
> 1. Que funcionalidades ya funcionan de punta a punta
> 2. Que falta para tener un MVP publicable
> 3. Que tan modular y escalable esta hoy la arquitectura
>
> No es marketing. Es una radiografia — con lo que anda y lo que no.

---

## 1. Estado por feature

### Leyenda

| Simbolo | Significado |
|---------|-------------|
| OK | Funciona end-to-end (backend + UI + tests) |
| PARCIAL | Backend listo pero sin UI, o UI sin backend |
| FALTA | No existe todavia |

### Tabla de features

| # | Feature | Backend | UI | Tests | Estado |
|---|---------|---------|----|----|--------|
| 1 | Registro de usuario | OK | OK | OK | **OK** |
| 2 | Login / Logout | OK | OK | OK | **OK** |
| 3 | Ver tipos de eleccion (Home) | OK | OK | - | **OK** |
| 4 | Ver preguntas pendientes del cuestionario | OK | OK | OK | **OK** |
| 5 | Responder pregunta (opcion + peso) | OK | OK | OK | **OK** |
| 6 | Enviar cuestionario completo | OK | OK | OK | **OK** |
| 7 | Ver "cuestionario enviado" (SubmitDone) | - | OK | - | **OK** |
| 8 | Ver ranking de candidatos (Resultados) | OK | OK | OK | **OK** |
| 9 | Ver detalle de candidato con radar por eje | OK | OK | - | **OK** |
| 10 | Ver noticias de un candidato | OK | OK | OK | **OK** |
| 11 | Modal educativo con repercusiones | OK | OK | - | **OK** |
| 12 | Nivel de confianza en el match (alta/media/tentativa) | OK | OK | OK | **OK** |
| 13 | Marcar candidatos como **favoritos** | OK | FALTA | OK backend | **PARCIAL** |
| 14 | Marcar candidatos como **descartados** | OK | FALTA | OK backend | **PARCIAL** |
| 15 | Guardar **decision final** de voto | OK | FALTA | OK backend | **PARCIAL** |
| 16 | Ver historial de mis respuestas | FALTA | FALTA | - | **FALTA** |
| 17 | Editar/rehacer respuestas ya enviadas | FALTA | FALTA | - | **FALTA** |
| 18 | "Olvide mi contrasena" (reset por email) | FALTA | FALTA | - | **FALTA** |
| 19 | Pantalla de perfil/settings | FALTA | FALTA | - | **FALTA** |
| 20 | Onboarding / tour inicial | FALTA | FALTA | - | **FALTA** |
| 21 | Compartir resultado (link o imagen) | FALTA | FALTA | - | **FALTA** |
| 22 | Modo invitado (probar sin registrarse) | FALTA | FALTA | - | **FALTA** |
| 23 | Panel admin para editar posturas via web | Django admin | - | - | Basico via Django admin |
| 24 | Auditoria de cambios de posturas | FALTA | - | - | **FALTA** |

### Score de completitud

- **12 features OK** de punta a punta → ~50% del scope razonable
- **3 features PARCIAL** con backend construido pero sin UI (deuda visible)
- **8 features FALTAN** (algunas nice-to-have, otras bloqueantes para publicar)

---

## 2. Gap analysis — camino a MVP publicable

### 2.1 El elefante en la sala: features 13-15

**Backend tiene 3 features enteras que el usuario nunca ve**:

- `POST /candidatos/{id}/favoritos/` + `GET` + `DELETE`
- `POST /candidatos/{id}/descartados/` + `GET` + `DELETE`
- `POST /decision-final/` + `GET` + `PUT`

Los modelos, serializers, views, tests estan. Los tipos TypeScript estan
auto-generados (viven en `src/types/api.ts`). Pero cero llamadas desde
el frontend. Cero componentes que los consuman.

**Origen**: se construyeron en un sprint anticipando la UX. La UX
nunca llego.

**Consecuencia**: viola YAGNI ("You Aren't Gonna Need It"). Es codigo
muerto que ocupa migrations, tabla de tests que corre, y superficie de
mantenimiento.

**Dos caminos**:

- **Camino A (usar la deuda)**: agregar la UI. ~1 sprint. Botones
  "favorito" / "descartar" en `ResultadosScreen`, screen nueva
  `MiDecisionScreen`. Aprovecha lo hecho.
- **Camino B (borrar la deuda)**: eliminar los 3 modulos backend + 4
  migrations + tests asociados. ~1 dia. Deja el codebase mas honesto.

Recomendacion: **Camino A**. La feature aporta valor real (una VAA sin
"guarda tus favoritos" pierde retencion), y ya esta la mitad del trabajo.

### 2.2 Features criticas que si faltan y son bloqueantes

| Feature | Por que bloquea | Esfuerzo |
|---------|-----------------|----------|
| Olvide contrasena | Sin esto, un user que olvida su pass **pierde su historial** para siempre. Inaceptable para un producto real. | 1-2 dias |
| Modo invitado | Barrera de registro mata conversion. Un user tiene que responder 12 preguntas ANTES de ver si vale la pena registrarse. | 2-3 dias |
| Rehacer respuestas | Si te equivocaste en una pregunta o cambiaste de opinion, hoy no hay forma de corregir. UX inaceptable. | 2 dias |
| Compartir resultado | Los VAAs viven de que la gente comparta su match. Sin share, sin viralidad, sin traccion. | 1-2 dias |

### 2.3 Nice-to-have (post-MVP)

- Onboarding / tour (1 dia)
- Pantalla de perfil (1 dia)
- Historial de sesiones (2 dias)
- Auditoria de cambios de posturas (nunca — es admin)

### 2.4 Estimacion global a MVP publicable

Sumando 2.1 + 2.2:

**~3-4 sprints de 1 semana** para pasar de "app tesis" a "app que se
puede lanzar publicamente a los chilenos". Asumiendo 1 dev a tiempo
parcial.

---

## 3. Modularidad — analisis capa por capa

### 3.1 Frontend

**Estructura actual**:

```
src/
├── api/          <- capa de red aislada (axios + tipos + hooks React Query)
├── components/   <- 8 componentes reusables
├── navigation/   <- rutas + tipos
├── screens/      <- 7 pantallas
├── services/     <- logica pura testeable
├── store/        <- 2 stores Zustand (auth, cuestionario)
├── theme/        <- paleta centralizada
└── types/        <- tipos auto-generados desde OpenAPI
```

**Score de modularidad**: **8/10**

**Que esta bien**:

- **Capas bien separadas**: si manana cambio axios por fetch, toco solo
  `api/client.ts`. Si cambio Zustand por Redux, toco solo `store/`. Si
  cambio React Navigation por Expo Router, toco solo `navigation/`.
- **Services puros**: `matching.ts` y `cuestionario.ts` no importan
  React ni RN. Se testean sin renderizar nada.
- **Componentes reusables**: `PrimaryButton`, `SelectableButton`,
  `FormInput` viven en `components/` y las 7 screens los consumen. Cero
  duplicacion de estilos de boton.
- **Tipos auto-generados**: `src/types/api.ts` se regenera desde el
  schema OpenAPI. Un cambio de shape en el backend rompe TypeScript en
  compile-time, no en produccion.

**Que esta mal**:

- **`screens/` no tiene subcarpetas** aunque hay 7 pantallas. Si crece
  a 15 va a ser un mareo. Convencion sugerida: agrupar por feature
  (`screens/auth/`, `screens/cuestionario/`, `screens/resultados/`).
- **`store/cuestionario.ts` mezcla estado + logica de submit**. El
  `submit()` del store hace fetch + navegacion. Deberia extraerse a un
  hook o mutation de React Query para consistencia.
- **`DetalleCandidatoScreen` tiene 6.2 KB y muestra varias secciones**
  (info, radar, noticias). Se podria splittear en subcomponentes
  presentacionales (`CandidatoHeader`, `RadarSection`, `NoticiasSection`).

### 3.2 Backend

**Estructura post-refactor**:

```
backend/core/
├── models/         <- 5 submodulos por dominio (electoral, cuestionario, matching, user_data, content)
├── views/          <- 6 submodulos por dominio
├── serializers/    <- 6 submodulos por dominio
├── services/       <- logica de dominio pura (matching)
├── management/     <- comandos CLI (import, seed)
├── migrations/     <- 22 migrations
├── admin.py        <- registrations centralizadas
├── urls.py         <- ruteo centralizado
└── tests + test_services + test_importers + test_noticias
```

**Score de modularidad**: **8/10** (era 5/10 pre-refactor)

**Que esta bien**:

- **Cada archivo tiene una responsabilidad** (Single Responsibility).
  Ningun archivo > 250 lineas.
- **Capa de servicios existe**: la logica de matching vive en
  `services/matching.py`, aislada de HTTP. Se testea sin DRF.
- **Re-exports en `__init__.py`**: consumers externos (admin.py,
  management commands, tests) no tuvieron que cambiar imports. API
  publica estable.
- **Constants explicitas en modelos** (`MatchCandidato.CONFIANZA_ALTA`)
  — no hay magic strings.

**Que esta mal**:

- **`services/` tiene un solo modulo (matching)**. Cuando agreguemos
  features 13-15, va a haber `services/bookmarking.py`, y el patron va
  a probar su valor real recien ahi.
- **22 migrations para un MVP** es demasiado. Un `squashmigrations`
  post-v1.0 baja esto a 2-3.
- **Sin `services/` capa para auth, catalog, noticias**. Sus views son
  thin wrappers de DRF genericas, ok. Pero cuando la logica crezca (ej.
  ranking de noticias por relevancia), va a repetirse el pecado de
  antes.

### 3.3 Integracion backend-frontend

**Score**: **9/10**

**Que esta muy bien**:

- **Contract-first via OpenAPI**: schema es fuente de verdad. Frontend
  consume tipos autogenerados. Cambio de shape en backend = error de
  TypeScript en frontend. Es la barrera anti-drift mas importante del
  proyecto.
- **Un solo cliente HTTP** (`api/client.ts`) con interceptors para
  token + 401.
- **Un solo lugar** para configurar la base URL (`api/config.ts`).

**Lo unico chico que falta**:

- No hay validacion runtime del schema en frontend. Si el backend
  envia algo que TypeScript no espera (ej. campo nuevo tipeado mal), el
  frontend confia. Se resuelve agregando `zod` con esquemas derivados.
  Nice-to-have.

---

## 4. Escalabilidad — 3 escenarios concretos

Escalabilidad no es "sirve para N usuarios" a secas. Es "sirve para N
usuarios haciendo QUE cosa a QUE hora". Aca van tres escenarios reales
de una VAA en periodo electoral.

### Escenario A — 100 usuarios/dia, dia comun

**Ejemplo**: primer mes despues de lanzar, sin marketing.

- **Backend**: SQLite alcanza. Django dev server alcanza. Sin cache.
- **Costo estimado**: $0 (todo en un VPS de $5/mes).
- **Cuellos**: ninguno.
- **Estado hoy**: **listo**. Se puede lanzar manana y aguanta.

### Escenario B — 10.000 usuarios/dia, campana activa

**Ejemplo**: 2 semanas antes de la eleccion, con difusion en redes.

- **Trafico esperado**: pico de ~5-10 req/seg. La mayoria son GETs de
  catalogo (`/tipos-eleccion/`, `/candidatos/`, `/preguntas/`).
- **Endpoint critico**: `POST /match-candidatos/`. Hace hasta
  `N_candidatos × N_preguntas` iteraciones de query + `update_or_create`
  en loop.

**Que falta para aguantarlo**:

1. **Postgres en vez de SQLite** — SQLite es single-writer, se cuelga
   con concurrencia. **Bloqueante**.
2. **Cache de catalogos** (`tipos-eleccion`, `candidatos`,
   `preguntas`) con TTL de 5 min. Con Redis o LocMemCache. Los datos
   cambian una vez por eleccion, cachear es fruta baja.
3. **Rate limiting** en `/login/` y `/match-candidatos/` para frenar
   scrapers. DRF `AnonRateThrottle` + `UserRateThrottle`, 20 lineas.
4. **`bulk_create(update_conflicts=True)`** en `_persistir_matches`.
   Elimina el loop de `update_or_create`. Baja 12 queries a 1.
5. **Gunicorn + Nginx** — no `runserver` en prod. Workers = 2×CPU + 1.
6. **CDN para imagenes** de candidatos. Cloudflare gratis alcanza.

**Estado hoy**: **no lista**. Estas 6 cosas son un sprint entero. Todas
documentadas como deuda en `sistema-tecnico.md`.

### Escenario C — 100.000 usuarios/dia, semana previa a eleccion

**Ejemplo**: viralidad total, cobertura de prensa, ultimo empujon.

- **Trafico esperado**: pico de 50-100 req/seg. **Cuestionario simultaneo**
  masivo.

**Que falta para aguantarlo**:

1. Todo lo del escenario B, **mas**:
2. **Cache Redis del resultado del match** por (user_id, tipo_eleccion,
   version_posturas). Un match se calcula una vez y se sirve N veces.
3. **Postgres con read replicas** o al menos con connection pooling
   (PgBouncer).
4. **Load balancer** con 2+ instancias del backend.
5. **Auto-scaling** o al menos monitoring con alertas (Sentry / Grafana).
6. **CDN de nivel serio** (Cloudflare Pro o Fastly) para el bundle web
   del frontend.
7. **Background jobs con Celery** para lo pesado (envio de emails,
   recalculo bulk cuando cambian posturas).

**Estado hoy**: **muy lejos**. Es un mes o mas de deploy engineering,
no dev.

### Resumen de escalabilidad

| Escenario | Users/dia | Listo hoy | Sprint necesario |
|-----------|-----------|:---------:|------------------|
| A (baja) | 100 | SI | - |
| B (media) | 10.000 | NO | 1 sprint (6 items concretos) |
| C (alta) | 100.000 | NO | 1 mes+ (arquitectura distribuida) |

**Conclusion**: la app **soporta un lanzamiento controlado hoy mismo**.
Para escalar a viralidad electoral hay que hacer el sprint del escenario
B primero.

---

## 5. Deuda tecnica priorizada

Ordenada por relacion valor/esfuerzo:

### Alta prioridad (bloquea publicar)

1. **UI para favoritos/descartados/decision** (feature 13-15). Backend
   ya esta. ~1 sprint.
2. **Olvide mi contrasena**. Sin esto, un pass olvidado = user perdido.
   ~2 dias.
3. **Rehacer respuestas del cuestionario**. UX inaceptable sin esto.
   ~2 dias.
4. **Modo invitado** (o al menos "preview del match antes de submit").
   Baja friccion. ~2-3 dias.

### Media prioridad (bloquea escalar)

5. **Migrar dev a Postgres** (parity con prod). ~1 dia.
6. **Cache de catalogos + rate limiting**. ~2 dias.
7. **`bulk_create` en `_persistir_matches`**. ~2 horas.
8. **Deploy con Gunicorn + Nginx + docker-compose**. ~2 dias.

### Baja prioridad (nice-to-have)

9. Compartir resultado (imagen o link). ~2 dias.
10. Onboarding / tour. ~1 dia.
11. Squash de 22 migrations a 3. ~medio dia.
12. Tests de componentes React (con RNTL). ~1 sprint.
13. Logging estructurado + Sentry. ~1 dia.
14. GitHub Actions CI. ~1 dia.

### Nunca (YAGNI)

15. GraphQL. REST alcanza.
16. Microservicios. Un monolito bien modularizado escala hasta 100k
    users/dia sin problema.
17. Event sourcing / CQRS. Overkill.
18. Multi-tenancy. Es una app para Chile, no un SaaS.

---

## 6. Comparacion con VAAs internacionales

Ver `docs/comparacion-vaas.md` para el detalle. Resumen:

- En **algoritmo**: estamos a nivel Wahl-O-Mat / StemWijzer. Superamos
  a Voto Informado (nuestro competidor chileno).
- En **UX / diseno**: por debajo de Smartvote y Kieskompas. Nos falta
  el mapa 2D politico y las visualizaciones avanzadas.
- En **transparencia**: bien — todas las posturas tienen fuente
  obligatoria. Mejor que la mayoria.
- En **retencion post-cuestionario**: mal. Sin favoritos, sin decision
  guardada, sin compartir, el user llega al ranking y se va. Feature
  13-15 + share es lo que cierra este gap.

---

## 7. Recomendacion final

**Si el objetivo es la tesis**: la app ya cumple. Tiene UX end-to-end,
algoritmo defendible academicamente, arquitectura modular limpia,
tests, docs. Se puede defender manana.

**Si el objetivo es publicar**: hay 2-3 sprints por delante. En orden:

1. Sprint publicabilidad: features 13-15 UI + olvide contrasena +
   rehacer respuestas + modo invitado.
2. Sprint escalabilidad: Postgres + cache + rate limiting + bulk +
   deploy real.
3. Sprint retencion: compartir + onboarding + pantalla perfil.

Con eso listo, la app compite con VAAs internacionales.

---

_Este documento debe actualizarse cada 2-3 sprints o cuando un ordenamiento
de prioridades cambie significativamente. Ultima revision: 2026-07-25._
