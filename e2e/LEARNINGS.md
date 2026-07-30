
# E2E Learnings and Patterns

Documento vivo con todos los hallazgos, patrones y gotchas descubiertos
mientras se armo la suite E2E de servel. Consultar antes de escribir un
spec nuevo. Ultima update: 2026-07-29 (post cobertura Bookmarks +
Cuestionario + Resultados + Candidatos + Comparar + Onboarding, 31/0/0 verde).

---

## 1. Arquitectura de la suite

### Stack
- Playwright ejecuta chromium contra Expo Web + backend Django local.
- Backend: `http://localhost:8010` (Django DRF), corriendo con
  `DRF_THROTTLE_DISABLED=1` durante tests para evitar 429s en reintentos.
- Frontend: Expo Web servido en el puerto que el playwright config apunte.

### Estructura de archivos

```
e2e/
  helpers/
    api.ts       # Setup rapido via HTTP directo al backend
    ui.ts        # Nav + acciones comunes en la UI (vRole, vLabel, ...)
    users.ts     # Factory de test users con IDs unicos
  tests/
    auth-*.spec.ts     # Flows de autenticacion
    noticias.spec.ts   # Flow publico de noticias
  README.md        # Estado actual del run + fixes aplicados
  LEARNINGS.md     # Este archivo
```

### Convenciones
- Un user nuevo por test (via `makeTestUser(prefix)`). Nunca reutilizar
  para evitar cascadas de estado.
- Helpers para todo lo comun. Si haces la misma cadena de clicks 2 veces,
  ya es helper.
- Preferir setup por API (`apiRegister`, `apiLogin`) y testear la UI
  solo en el flow bajo prueba. Ejemplo: para testear cambiar-password,
  no hace falta pasar por el UI de register cada vez.

---

## 2. React Native Web + Playwright: los 6 gotchas

RN Web renderiza los componentes RN a HTML, pero con particularidades
que rompen los patrones normales de Playwright. Estos son los que
descubrimos:

### 2.1 Strict-mode violation por Stack Navigator

Problema: react-navigation monta TODOS los screens del stack simultaneamente
en el DOM y los oculta con CSS (`display: none`). Entonces
`page.getByLabel("Email")` matchea el input de Login Y el de Register al
mismo tiempo -> "strict mode violation".

Solucion: usar `vLabel(page, "Email")` y `vRole(page, "button", ...)`
en vez de `page.getByLabel/getByRole`. Ambos helpers hacen
`.filter({ visible: true })` internamente.

```ts
// MAL:
await page.getByLabel("Contrasena actual").fill("x");

// BIEN:
await vLabel(page, "Contrasena actual").fill("x");
```

Excepcion: para assertions de `toBeHidden/toHaveCount(0)ces
necesitas contar solo los visibles. Usa `.filter({ visible: true })`
explicito para dejarlo claro.

### 2.2 Texto duplicado entre tab, heading y brand

Un mismo string ("Noticias", "Config", etc.) puede aparecer 3 veces en el
DOM simultaneamente:
- El tab del BottomNav (role="tab")
- El heading de la screen actual (role="heading")
- El brand del HomeTopBar (texto plano)

Solucion: siempre especifica el role. Nunca uses `getByText(str)`
salvo que sepas que es unico.

```ts
// MAL: matchea 3 elementos
await expect(page.getByText("Noticias")).toBeVisible();

// BIEN:
await expect(vRole(page, "heading", { name: "Noticias" })).toBeVisible();
```

### 2.3 Toasts pueden tener multiples instancias

El toast atom stackea instancias en el DOM (para animar entradas
sucesivas). `page.getByText(/toast msg/i)` puede matchear varios.

Solucion: `.filter({ visible: true })` + `.first()` si hace falta.

```ts
await expect(
  page.getByText(/contrasena actualizada/i).filter({ visible: true })
).toBeVisible({ timeout: 8_000 });
```

### 2.4 Botones RN pueden requerir exact:true en label

Algunos labels tienen sufijos que otros hermanos comparten. Por ejemplo
"Contrasena" (label del input) vs "Contrasena actual" (otro input)
matchean ambos con regex `/contrase/i`.

Solucion: `{ exact: true }` cuando el label es exacto y conocido.

```ts
await vLabel(page, "Contrasena", { exact: true }).fill(user.password);
```

### 2.5 CollapsibleFilterSection arranca colapsada

Componentes `<CollapsibleFilterSection>` en modales de filtro pueden estar
colapsados por defecto (segun logica interna, ej. "expandir si hay filtro
activo"). Los chips DENTRO estan en el DOM pero NO visibles.

Solucion: expandir la seccion primero clickeando el header.

```ts
// Modal se abre con "Fecha" colapsada por default (rangoId === "todo")
await vRole(page, "button", { name: /^filtros/i }).click();
await vRole(page, "button", { name: /^fecha/i }).click(); // expandir
await vRole(page, "button", { name: /^7 dias$/i }).click(); // chip
```

### 2.6 NewsCard es role="link", no button

Pressables de RN Web pueden mapear a diferentes roles segun el prop
`accessibilityRole`. Cards que navegan tipicamente son link, no button.

Ejemplo: NewsCard usa `role="link"` con label
`Noticia: {headline}. Fuente {source}.`

```ts
// MAL: rol equivocado
await vRole(page, "button", { name: /noticia:/i }).click();

// BIEN:
await vRole(page, "link", { name: /^noticia:/i }).first().click();
```

Como saber el role: `grep -n "accessibilityRole" src/components/**` en el
frontend. Convenciones tipicas del proyecto:
- Pressable de card que navega -> link
- Pressable de accion (submit, filtro, toggle) -> button
- Tab en BottomNav -> tab
- Chip removible -> button con label `Quitar filtro {label}`

---

## 3. Coach marks: el impostor silencioso

`CoachMarkTour` es un tour de onboarding que aparece automaticamente la
primera vez que un user entra a ciertos screens (home, noticias, etc.).

### Comportamiento
- Backdrop full-screen con `accessibilityLabel="Cerrar coach mark"`.
- Bloquea todos los clicks al contenido debajo.
- No se persiste entre sesiones (cada user fresh en tests lo vuelve a ver).
- Puede ser multi-step (varios coach marks encadenados).

### Solucion
Helper `dismissCoachMarks(page)` que:
1. Chequea si aparecio (timeout 3s inicial).
2. Si aparecio, hace click al backdrop hasta 8 veces (para tours multi-step).
3. Cada retry con timeout corto (500ms).

Cuando llamarlo:
- Despues de `uiLogin` -> ya esta en el helper.
- Despues de `goToConfigTab` -> ya esta en el helper.
- Despues de `goToPerfil` -> ya esta.
- Despues de `goToNoticias` -> ya esta.
- Defensivo en cualquier test que aterrice en un screen "nuevo" para el user.

---

## 4. Backend gotchas

### 4.1 Rate limiting cascada (Fix D lesson)

El backend usa `ScopedRateThrottle` con limits estrictos:
- `register: 10/hour`
- `login: 30/hour`
- `password_reset: 5/hour`

Con reintentos de Playwright + retries de tests, se queman los limites
rapido. El siguiente request devuelve 429 y el test falla silent
(el UI muestra un toast de error que el test no chequea explicitamente,
solo espera que la screen cambie).

Solucion: `DRF_THROTTLE_DISABLED=1` seteado en el env del backend
durante tests. PERO la logica original vaciaba `DEFAULT_THROTTLE_RATES`
lo que rompia views con `throttle_classes = [ScopedRateThrottle]`
hardcoded (`ImproperlyConfigured: No default throttle rate set for 'register'`).

Fix en `backend/api/settings.py`: cuando `DRF_THROTTLE_DISABLED=1`,
en vez de vaciar las rates, poner un numero enorme:

```python
if os.getenv("DRF_THROTTLE_DISABLED") == "1":
    for scope in ["anon", "user", "login", "register", "password_reset"]:
        DEFAULT_THROTTLE_RATES[scope] = "100000/hour"
```

Nota: al 2026-07-29 este fix vive en el working tree, no commiteado,
porque el archivo esta mezclado con WIP de otro puppy.

### 4.2 Password reset en DEBUG=True

En DEBUG, `POST /api/v1/password-reset/request/` devuelve el `reset_link`
directamente en la response (no manda email real). Los tests lo aprovechan
via `apiRequestPasswordReset()` que parsea el `?token=xxx` del link.

### 4.3 Noticias son publicas (GET) pero admin-only (POST)

`GET /api/v1/noticias/` es AllowAny. POST/PUT/DELETE requieren
`IsAdminUser`. Para tests que necesiten seed de noticias, usar Django ORM
directo o management command (`fetch_noticias`), NO API con usuario normal.

Al momento de escribir este doc, el DB tiene ~35 noticias seed del fetch
RSS. Los tests usan queries genericos (`\d+ resultados?`) para no depender
de contenido especifico.

---

## 5. Patrones de test que funcionan

### 5.1 Modo invitado para flows publicos

Para tests de flows que no requieren auth (Noticias, Candidatos, Comparar),
usar `enterGuestMode(page)` en vez de registrar + loguear. Ventajas:
- 0 llamadas al backend de auth (no toca throttle).
- 5-10s mas rapido por test.
- Menos superficie para flakes.

```ts
test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await enterGuestMode(page);
  await goToNoticias(page);
});
```

### 5.2 Setup via API, assert via UI

Para tests que necesitan un user autenticado (cambiar password, eliminar
cuenta, bookmarks), NO pasar por el UI de register. Usa:

```ts
const user = makeTestUser("prefix");
await apiRegister(user);       // setup por API
await gotoApp(page);
await uiLogin(page, user);     // login via UI (o apiLogin si tampoco importa)
await goToPerfil(page);
// ... test del flow especifico
```

### 5.3 Regex + .first() para elementos repetitivos

Para listas de cards/items donde no sabes el contenido exacto:

```ts
const primeraNoticia = vRole(page, "link", { name: /^noticia:/i }).first();
await expect(primeraNoticia).toBeVisible({ timeout: 10_000 });
await primeraNoticia.click();
```

### 5.4 Timeouts razonables

- Nav entre screens: 8-10s (Stack Navigator + query loading).
- Toasts: 8s (aparicion animada + fetch mutation).
- Elementos ya renderizados: 5s.
- Coach mark dismiss inicial: 3s (aparecen async).
- Fetch de data grande: 10s (feed de noticias, listas de candidatos).

---

## 6. Cobertura actual (2026-07-29)

20 tests / 0 skip / 0 fail en ~100s.

### Por flow

| Flow | Tests | Notas |
|------|-------|-------|
| Auth > Login | 4 | exito, error, regresion email-in-username, logout |
| Auth > Register | 4 | exito, boton disabled, duplicado, trim de espacios |
| Auth > Cambiar password | 2 | exito, error con pass actual invalida |
| Auth > Eliminar cuenta | 2 | palabra magica ELIMINAR, eliminacion completa |
| Auth > Password reset | 3 | flujo completo, token invalido, boton disabled |
| Noticias (publico) | 5 | feed, filtro fecha, filtro busqueda, empty, detalle |

### Por cubrir (backlog)
- Bookmarks de noticias (autenticado, toggle on/off).
- Cuestionario (respuestas, progreso, submit).
- Resultados / Match (top match, filtros).
- Candidatos (lista, filtros, detalle).
- Comparar (agregar candidatos, ver comparativa).
- Onboarding completo (5 slides, skip vs navegar).

---

## 7. Helpers disponibles

Ubicacion: `e2e/helpers/`.

### api.ts
- `apiRegister(user) -> { userId }` - registra via HTTP directo
- `apiLogin(user) -> token` - login via HTTP
- `apiRequestPasswordReset(email) -> { resetLink, token }`
- `apiCreateAuthenticatedUser(user) -> { userId, token }` - register + login

### ui.ts
- `vLabel(page, label, opts?)` - getByLabel + filter visible
- `vRole(page, role, opts?)` - getByRole + filter visible
- `gotoApp(page)` - abre `/`, skippea onboarding si aparece
- `uiLogin(page, user)` - login desde screen actual + dismiss coach marks
- `uiRegister(page, user)` - registro desde screen actual
- `gotoRegister(page)` - click link "Ir a registro" desde Login
- `gotoPasswordReset(page)` - click link "Recuperar contrasena" desde Login
- `enterGuestMode(page)` - click link "Probar sin cuenta" desde Login
- `goToConfigTab(page)` - click tab Config del BottomNav
- `goToPerfil(page)` - Config tab -> "Editar perfil"
- `goToNoticias(page)` - click tab Noticias del BottomNav
- `dismissCoachMarks(page)` - cierra tours defensivamente (no-op si no hay)

### users.ts
- `makeTestUser(prefix)` - genera user unico con `Test{stamp}!Aa1` password

---

## 8. Historial de fixes (2026-07-29)

### Sesion 1 (antes): 6/9/0
Suite inicial con 9 tests skippeados por triage.

### Fix A: 10/5/0 - Cambiar/Eliminar password
- Coach marks bloqueaban clicks -> helper `dismissCoachMarks`.
- Tab Config es role="tab" no button -> helper `goToConfigTab`.
- Screens cambiar/eliminar viven en PerfilScreen, no Config -> helper
  `goToPerfil`.
- Backend throttle bug fixeado (100k/hour cuando disabled).

### Fix B: 13/2/0 - Password reset
- Migrados todos `page.getBy*` a `vLabel/vRole` (visibility filter).
- Toast assertions con `.filter({ visible: true })`.

### Fix C: 14/1/0 - Logout desde perfil
- Reemplazado `test.skip` vacio con implementacion real usando `goToPerfil`
  + click NavRow "Cerrar sesion".

### Fix D: 15/0/0 - Register trim
- El test estaba OK, solo el throttle del backend lo hacia fallar.
- Remocion simple del `test.skip` post-fix del backend.

### Noticias flow: 20/0/0
- 5 tests nuevos del flujo publico.
- Nuevos helpers: `enterGuestMode`, `goToNoticias`.
- 3 aprendizajes de RN Web: heading vs tab conflict, CollapsibleFilterSection
  colapsada, NewsCard es link no button.

### Cobertura full: 31/0/0
- +11 tests nuevos en 6 archivos: bookmarks (dentro noticias), cuestionario,
  resultados, candidatos, comparar, onboarding.
- Nuevos helpers API: `apiGetPreguntas`, `apiCompletarCuestionario` (bulk
  POST /respuestas/ para skipppear cuestionario UI en tests downstream).
- Fix regresion `goToConfigTab`/`goToPerfil`: agregado retry loop igual
  que `goToNoticias` porque los coach marks post-login son async y pueden
  aparecer despues de `dismissCoachMarks` return.
- Fix cambiar-password test: en vez de esperar modal cierre (lento, 8s+
  con backend loaded), esperar toast de exito `Contrasena actualizada`.
- Aprendizajes nuevos:
  1. `filter({ hasText })` mira TEXTO VISIBLE, no `accessibleName`. Para
     matchear un `accessibilityLabel` que no aparece como texto visible
     (ej. "Nombre, Partido, match N%" donde el DOM muestra las palabras
     sin comas), usar `getByRole("button", { name: /.../ })`.
  2. En ScrollView horizontal (RN Web), TODOS los slides estan renderizados
     simultaneamente en el DOM. Playwright los ve como "visible" aunque
     esten fuera de viewport. Para saber que slide esta activo, buscar
     senales del render condicional (ej. Onboarding: boton `Siguiente`
     solo existe si `!isLastSlide`; loop hasta que desaparezca).
  3. Race condition coach marks post-login: aparecen async DESPUES de que
     `dismissCoachMarks` retorna. Todo helper que haga click a un tab o
     button post-login necesita retry pattern (5 intentos con
     dismissCoachMarks entre cada uno). Aplicado en: `goToConfigTab`,
     `goToPerfil`, `goToNoticias`, `goToComparar`, `goToCandidatos`.
  4. Modal cierre post-submit puede tardar (backend + toast anim).
     Estrategia robusta: assert el toast de exito directo, no el modal
     desaparecer.

---

## 9. Referencias

- README del e2e: `./README.md`
- Backend settings: `../backend/api/settings.py`
- Frontend components: `../frontend/src/components/`
- Coach marks store: `../frontend/src/store/coachMarks.ts`
- APP_TABS: `../frontend/src/navigation/tabs.ts`
