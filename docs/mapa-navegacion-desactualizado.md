# Mapa de navegación · Tinder-Decisivo

> Referencia canonica del flujo de navegación de la app.
> Ultima revisión: 2026-07-26 · Vive junto al design system en `frontend/design-exploration/design-system-lowfi.html`.
> Ver tambien: `docs/accesibilidad.md` (requisitos WCAG por pantalla).

---

## 1. Patrón de navegación

**PWA responsive** con dos variantes del mismo componente `AppNav`:

- **Mobile (<900px)**: bottom navigation fija con 5 items
- **Desktop (>=900px)**: sidebar izquierdo colapsable con los mismos 5 items

Los 5 items del nav principal:

| # | Item | Icono sugerido | Ruta |
|---|---|---|---|
| 1 | Home | house | `/` |
| 2 | Guardados | bookmark | `/guardados` |
| 3 | Comparar | columns | `/comparar` |
| 4 | Noticias | newspaper | `/noticias` |
| 5 | Config | gear | `/config` |

## 2. Estructura de pantallas

### 2.1 Pre-auth (sin nav)

```
Splash → Welcome tour (5 slides) → [Login | Signup]
                                          │
                                          ↓
                              Ubicacion (skippable)
                                          │
                                          ↓
                              Home HUB (primer login)
                                          │
                                          ↓
                              Coach mark 1 (Home) - solo primera vez
```

**Welcome tour** (`#tpl-onboarding`): 5 slides secuenciales presentando la app.

| Slide | Foco | Demo interactivo |
|---|---|---|
| 1/5 | Que es (matching electoral) | — (texto) |
| 2/5 | Elecciones disponibles | 3 rows con Toggle activar/desactivar (estado local, decorativo) |
| 3/5 | Cuestionario de preguntas | 1 pregunta Likert de ejemplo con RadioGroup interactivo |
| 4/5 | Ranking de resultados | 3 candidatos ficticios con barra de match% |
| 5/5 | CTAs finales | Crear cuenta / Ya tengo cuenta / Explorar sin cuenta |

**Navegacion entre slides**: boton ← Atras en slides 2-5 (izquierda del topBar).
**Saltar** disponible en slides 1-4 (derecha del topBar). Solo se muestra al primer arranque; se puede volver a ver desde Config → "Ver tour de nuevo".

_Implementacion: `OnboardingScreen.tsx` + demos en `components/molecules/Onboarding*Demo.tsx`._
_Actualizacion: 2026-07-30 (UX-008, UX-009)._

### 2.2 Pantallas raíz (con AppNav)

Accesibles desde cualquier lugar via bottom nav / sidebar:

- **Home HUB** (`#tpl-home`) — 3 variantes: 1 elección, 3 elecciones, sin novedades
- **Mis Guardados** (`#tpl-guardados`) — tabs Favoritos / Descartados / Posturas
- **Comparador** (`#tpl-comparador`)
- **Noticias** (`#tpl-noticias`)
- **Configuración** (`#tpl-config`)

### 2.3 Sub-pantallas (con back button)

Se acceden desde una pantalla raíz o desde otra sub-pantalla. **Casi todas llevan el AppNav visible** (criterio Instagram/Twitter/Spotify: nav siempre visible salvo excepciones puntuales).

| Sub-pantalla | Entry points | AppNav | Item activo |
|---|---|---|---|
| **Cuestionario** | Home HUB (election-card CTA) · Config → Mis Respuestas → Ir | NO | — (flujo lineal con foco, tiene "Guardar y salir") |
| **Resultados** | Auto al terminar cuestionario · Home HUB election-card completada → "Ver mis resultados" | SI | Home |
| **Perfil candidato** | Resultados (ranking) · Guardados (favoritos) · Comparador · Noticias (mencion) · Home HUB election-card → "Ver candidatos" | SI | ninguno (viene de múltiples rutas) |
| **Perfil empty** | Igual que Perfil pero cuando aun no hay match calculado | SI | ninguno |
| **Ubicacion** | Post-signup (obligatoria/skippable) · Config → Ubicacion → editar | NO | — (pre-auth o flujo de edicion) |
| **Gestión elecciones** | Config → Elecciones · Home HUB → "Gestionar" · Election-card "+ Activar" | SI | Home |
| **Mis Respuestas** | Config → Mis datos → Mis respuestas | SI | Config |
| **Editar Perfil** | Config → Cuenta → "Editar perfil" | SI | Config |

### 2.4 Modales

| Modal | Trigger | Tipo |
|---|---|---|
| **Share** | Boton share (topnav) en Perfil, Resultados, Home HUB, Comparador | Bottom sheet |
| **Saber mas** | Link "Saber mas" en cada pregunta del Cuestionario | Bottom sheet |

### 2.5 Coach marks contextuales

Overlays que aparecen la **primera vez** que el usuario llega a una pantalla clave. Ver `#tpl-coach-marks` en el design system.

| Coach | Pantalla | Highlight | Pasos |
|---|---|---|---|
| 1 | Home HUB | Election card | 1 de 2 |
| 2 | Cuestionario | Link "Saber mas" | 1 de 1 |
| 3 | Resultados | Radar chart | 1 de 3 |
| 4 | Ranking (Resultados) | Barrita de cobertura | 2 de 3 |
| 5 | Comparador | Toggle "Solo diferencias" | 1 de 1 |

### 2.6 Empty states

Variantes educativas de pantallas raiz cuando no hay datos. Ver `#tpl-empty-states`.

| Empty state | Pantalla | CTA principal |
|---|---|---|
| Guardados sin favoritos | Mis Guardados (tab Favoritos) | "Ver candidatos" |
| Comparador vacio | Comparador | "Ver ranking" |
| Noticias filtradas sin resultados | Noticias con filtro activo | "Quitar filtros" |
| Resultados sin cuestionario | Resultados (cuestionario incompleto) | "Continuar cuestionario" + "Explorar candidatos igual" |

## 3. Comportamiento del `election-card` (Home HUB)

Cada card en el hub responde segun el estado del cuestionario para esa eleccion:

| Estado | CTA principal | CTA secundario | Contenido card |
|---|---|---|---|
| **No empezado** (0%) | "Empezar cuestionario" | — | Nombre + scope + dias + progress vacio |
| **En progreso** (>0% y <100%) | "Continuar cuestionario" | — | Nombre + scope + dias + progress parcial + "X de N preguntas" |
| **Completado** (100%) | "Ver mis resultados" | "Ver candidatos" | Nombre + scope + dias + match% del top + progress lleno |
| **Empty state (+ activar)** | "Activar" | — | Placeholder dashed con nombre de la eleccion sugerida |

**Tap sobre la card (fuera de los botones)**: navega al detalle contextual = mismo destino que el CTA principal.

## 4. Reglas de navegación

### 4.1 Back button

- Toda sub-pantalla tiene un back button en el topnav breadcrumb (izquierda)
- El back siempre lleva a la pantalla desde donde se navegó (stack navigation)
- Excepcion: desde Resultados post-cuestionario, el back va al Home HUB (no al Cuestionario) para evitar loops

### 4.2 Deep links

Toda pantalla debe ser accesible por URL directa para soportar:

- Compartir un candidato via `share`
- Notificaciones push que abren una pantalla especifica
- SEO basico (aunque sea PWA, algunas rutas indexables)

Rutas propuestas:

```
/                                → Home HUB (si logged) o Splash
/onboarding                      → Welcome tour (5 slides)
/login                           → Login
/signup                          → Signup
/ubicacion                       → Ubicacion (post-signup)
/guardados                       → Mis Guardados (tab Favoritos por defecto)
/guardados/posturas              → Mis Guardados tab Posturas
/comparar                        → Comparador vacio
/comparar/:candidato1/:candidato2 → Comparador precargado
/noticias                        → Noticias (todas las elecciones)
/noticias?eleccion=presidencial  → Noticias filtradas
/config                          → Config
/config/perfil                   → Editar perfil
/config/ubicacion                → Editar ubicacion
/config/elecciones               → Gestion elecciones
/config/mis-respuestas           → Mis Respuestas
/config/ayuda                    → Ver tour de nuevo + FAQs
/elecciones/:slug/cuestionario   → Cuestionario de esa eleccion
/elecciones/:slug/resultados     → Resultados de esa eleccion
/candidatos/:slug                → Perfil de candidato
```

**Rutas sin URL propia** (renderizan sobre otra pantalla):

- Coach marks - se disparan por logica de "primera visita", no por ruta
- Empty states - son variantes de la ruta base (`/guardados`, `/comparar`, etc.) cuando no hay datos
- Modales (Share, Saber mas) - se abren como overlay sobre la ruta base, no cambian URL

### 4.3 Contexto de eleccion en topnav

Toda sub-pantalla que sea especifica a una eleccion muestra en el topnav breadcrumb:

```
[<] Presidencial 2026
    Ñuñoa · 42 dias
```

Pantallas que llevan este breadcrumb:

- Cuestionario, Resultados, Perfil candidato, Perfil empty, Comparador, Noticias (cuando esta filtrada)

Pantallas que NO llevan breadcrumb (son globales/multi-eleccion):

- Home HUB (topnav simple con brand), Guardados, Config, Mis Respuestas

### 4.4 Trigger y persistencia de coach marks

Cada coach mark se dispara la **primera vez** que el usuario llega a la pantalla correspondiente y se persiste como visto:

```
localStorage.setItem('coach-shown-<pantalla>', 'true')
```

Alternativa server-side: campo `user.coach_marks_seen: string[]` para sincronizar entre devices.

**Reglas**:

1. **No cascadear**: solo un coach mark visible a la vez. Si el usuario recibe una notificacion mientras esta abierto, cerrar el coach primero
2. **Saltables**: boton "Saltar tour" siempre visible; marca TODOS los coach marks como vistos
3. **Reproducibles**: en `Config → Ayuda → Ver tour de nuevo` el usuario puede resetear los flags
4. **No en resize/orientation change**: si el usuario rota o cambia el zoom, el coach mark se reposiciona pero no reinicia
5. **Focus trap**: mientras esta abierto, el resto de la pantalla es inerte (`aria-hidden` + `pointer-events: none`)
6. **Escape cierra**: y guarda como visto

### 4.5 Deteccion de empty states

Una pantalla decide mostrar empty state cuando la coleccion principal de datos esta vacia:

| Pantalla | Condicion empty | Fallback |
|---|---|---|
| Mis Guardados (Favoritos) | `favoritos.length === 0` | Empty educativo |
| Comparador | `candidatosSeleccionados.length < 2` | Empty educativo con avatares dashed |
| Noticias | `noticias.filter(f).length === 0 && filtrosActivos` | Empty con CTA "Quitar filtros" |
| Noticias | `noticias.length === 0 && !filtrosActivos` | Empty distinto: "Sin novedades aun" (no CTA) |
| Resultados | `!cuestionarioCompleto` | Empty con CTA a Cuestionario |

## 5. Puntos muertos evitados

Auditoria realizada 2026-07-26. Cada pantalla verificada por tener al menos 1 entry point:

| Pantalla | Entry points | OK |
|---|---|---|
| Splash | Cold start |  |
| Welcome tour | Post-Splash (primer arranque) · Config → Ayuda → Ver tour |  (agregado 2026-07-26) |
| Login | Post-Onboarding |  |
| Signup | Post-Onboarding |  |
| Ubicacion | Post-Signup · Config → Ubicacion |  |
| Home HUB | Post-Login · Bottom nav |  |
| Cuestionario | Home HUB CTA · Config → Mis Respuestas |  |
| Resultados | Post-Cuestionario · Home HUB card completada |  (agregado 2026-07-26) |
| Perfil candidato | Ranking · Guardados · Comparador · Noticias · Home HUB card |  (agregado 2026-07-26) |
| Perfil empty | Igual que Perfil pero sin match |  |
| Guardados | Bottom nav · Config → Mis datos |  |
| Mis Respuestas | Config → Mis datos |  |
| Comparador | Bottom nav · Perfil "Comparar con" |  |
| Noticias | Bottom nav · Home HUB Novedades "Ver todas" |  |
| Config | Bottom nav |  |
| Editar Perfil | Config → Cuenta → "Editar perfil" |  (agregado 2026-07-26) |
| Gestion elecciones | Config · Home HUB "Gestionar" · Card "+ Activar" |  |
| Coach marks (5) | Auto-triggered en primera visita de la pantalla asociada |  (agregado 2026-07-26) |
| Empty states (4) | Auto-renderizados cuando la coleccion esta vacia |  (agregado 2026-07-26) |
| Modal Share | Boton share en Perfil/Resultados/Home HUB/Comparador |  |
| Modal Saber mas | Link "Saber mas" en cada pregunta del Cuestionario |  (agregado 2026-07-26) |

## 6. Pendientes de decision

- **Nav en desktop**: el sidebar colapsable puede empezar expandido (con labels) o colapsado (solo iconos). Pendiente definir default.
- **Interaccion con election-card**: swipe horizontal para reordenar priorities? O drag & drop desde Gestion?
- **Nav en pantallas pre-auth**: el link "Registrarse" en Login y "Iniciar sesion" en Signup son los unicos cross-links. Suficiente?
- **Coach marks: momento del disparo**: ¿al aterrizar en la pantalla, o despues de N segundos, o al primer scroll?
- **Coach marks: agrupacion**: los 5 coach marks estan asociados a 4 pantallas distintas. ¿Todos se muestran progresivamente cuando el usuario navega, o hay uno "tour completo" opcional desde Config?
- **Welcome tour: obligatorio o skippable-desde-slide-1**: hoy es skippable desde slide 1. ¿Confirmamos?

---

_Este doc se debe actualizar cada vez que se agregue/quite una pantalla o cambie un flujo de navegacion._
