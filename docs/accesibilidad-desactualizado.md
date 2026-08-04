# Accesibilidad - VotoAFin

> Requisitos WCAG 2.2 Nivel AA por componente y por pantalla.
> Documento vivo. Ultima revision: 2026-07-28.
> Complementa: `docs/mapa-navegacion.md` (flujos) y `frontend/design-exploration/design-system-lowfi.html` (wireframes con landmarks/aria ya aplicados).

---

## 1. Alcance y meta

**Estandar objetivo**: WCAG 2.2 Nivel AA (Walmart standard, aplicable a apps chilenas para votantes con discapacidad visual/motora/cognitiva).

**Tecnologia asistiva soportada**:

| Producto | Plataforma | Prioridad |
|---|---|---|
| VoiceOver | iOS / macOS | Alta |
| TalkBack | Android | Alta |
| NVDA | Windows (PWA) | Media |
| JAWS | Windows (PWA) | Media |
| Zoom del sistema | Todos | Alta |
| Voice Control | iOS / macOS | Media |

**Keyboard-only**: la app debe ser 100% operable con teclado (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys).

---

## 2. Checklist por criterio WCAG

Marca el estado al implementar cada pantalla:

| Criterio | Que verificar | Estado wireframe |
|---|---|---|
| **1.1.1 Non-text content** | Imagenes con alt, iconos decorativos con `aria-hidden`, avatares con nombre | Parcial |
| **1.3.1 Info & relationships** | `<label for>` en inputs, encabezados jerarquicos, landmarks | Parcial |
| **1.3.5 Identify input purpose** | `autocomplete="email/name/tel"` en form fields | Pendiente prod |
| **1.4.3 Contrast (min)** | Texto normal >= 4.5:1, grande >= 3:1 | OK (Tanda 1) |
| **1.4.4 Resize text** | Zoom 200% sin scroll horizontal ni contenido cortado | Verificar |
| **1.4.10 Reflow** | 320 CSS px de ancho sin scroll horizontal | OK |
| **1.4.11 Non-text contrast** | Bordes de inputs, iconos, estados focus >= 3:1 | OK |
| **1.4.12 Text spacing** | Tolerar aumento de line-height 1.5, letter-spacing 0.12em | Verificar |
| **1.4.13 Content on hover/focus** | Tooltips dismissible (Escape), persistent, hoverable | Verificar en prod |
| **2.1.1 Keyboard** | Todo activable con teclado, sin trap | OK (Tanda 2) |
| **2.1.4 Character key shortcuts** | Shortcuts de una tecla deben poder desactivarse | N/A por ahora |
| **2.4.1 Bypass blocks** | Skip link a main | OK (Tanda 2) |
| **2.4.3 Focus order** | Orden logico del tab | OK visual |
| **2.4.4 Link purpose (in context)** | Cada link/button dice que hace | Parcial |
| **2.4.6 Headings and labels** | Titulos descriptivos, labels descriptivos | OK |
| **2.4.7 Focus visible** | Outline visible en focus | OK (Tanda 1) |
| **2.4.11 Focus not obscured (min)** | Focus no queda tapado por sticky nav/toast | Verificar |
| **2.5.3 Label in name** | El texto visible del boton debe estar en su accessible name | OK |
| **2.5.5 Target size (enhanced)** | 44x44 CSS px minimo (AAA, pero ideal) | Parcial |
| **2.5.8 Target size (minimum)** | 24x24 CSS px minimo | OK (Tanda 1) |
| **3.1.1 Language of page** | `<html lang="es">` | OK |
| **3.2.2 On input** | Cambiar valor de un input no cambia contexto sin aviso | OK |
| **3.3.1 Error identification** | Errores de form identificados en texto | Verificar en prod |
| **3.3.2 Labels or instructions** | Cada input tiene label | Parcial |
| **3.3.7 Redundant entry (2.2 nuevo)** | No pedir el mismo dato dos veces (ej. ubicacion) | OK por diseño |
| **3.3.8 Accessible auth (2.2 nuevo)** | No obligar cognitive test (captcha), permitir password managers | Verificar en prod |
| **4.1.2 Name, role, value** | `<button>` semantico, aria-label en icon-only | OK (Tanda 2) |
| **4.1.3 Status messages** | Toasts con `role="status"` o `aria-live` | Pendiente prod |

---

## 3. Requisitos por componente

### 3.1 AppNav (bottom nav / sidebar)

**Wireframe**: `#tpl-home` y todas las pantallas con nav.

| Requisito | Implementacion |
|---|---|
| Landmark | `<nav aria-label="Navegacion principal">` (OK) |
| Items focuseables | Cada item es `<button>` o `<a>` (OK) |
| Item activo | `aria-current="page"` en el item de la pantalla actual (OK) |
| Target size | Cada item >= 44x44 CSS px (verificar en breakpoint mobile) |
| Icono decorativo | Icono con `aria-hidden="true"`, texto visible es el accessible name |
| Orden Tab | Home -> Guardados -> Comparar -> Noticias -> Config |
| Contraste texto | `.wf-bottomnav-item` gris #6E6E6E sobre #FAFAFA = 4.88:1 (OK) |

**Codigo React esperado**:

```tsx
<nav aria-label="Navegacion principal" role="navigation">
  <NavLink to="/" end>
    {({ isActive }) => (
      <button aria-current={isActive ? 'page' : undefined}>
        <HomeIcon aria-hidden="true" />
        Home
      </button>
    )}
  </NavLink>
</nav>
```

### 3.2 Botones (primary, ghost, icon)

**Wireframe**: `<button class="wf-btn">`, `.wf-btn.icon`, `.wf-btn.primary`

| Requisito | Implementacion |
|---|---|
| Etiqueta HTML | `<button type="button">` siempre (excepto en form submit -> `type="submit"`) |
| Icon-only | `aria-label` con verbo + objeto ("Cerrar modal", "Compartir candidato", "Volver") |
| Estado disabled | `disabled` attribute + contraste que igual pase 3:1 |
| Estado loading | `aria-busy="true"` + spinner con `aria-label="Cargando"` |
| Focus | Outline 2px visible (OK global) |
| Target size | primary/ghost >= 44x44, icon actualmente 36x36 - **subir a 44x44 en prod** |
| Reduce motion | Sin bouncing/scale animations si `prefers-reduced-motion: reduce` |

**Icon buttons - accessible names por contexto**:

| Ubicacion | Icono | aria-label |
|---|---|---|
| Topnav breadcrumb (izq) | flecha | "Volver a pantalla anterior" |
| Topnav (der) share | share | "Compartir" |
| Modal Share cerrar | X | "Cerrar" |
| Bottom sheet cerrar | X | "Cerrar" |
| Card 3-dots menu | dots | "Mas opciones" |
| Cuestionario "?" | ? | "Saber mas sobre este tema" |
| Chip confianza "?" | ? | "Que significa la confianza del match" |

### 3.3 Formularios (Login, Signup, Editar Perfil, Ubicacion)

| Requisito | Implementacion |
|---|---|
| Label asociada | `<label for="email">` + `<input id="email">` (o wrap `<label>...<input></label>`) |
| Autocomplete | `autocomplete="email"`, `"current-password"`, `"new-password"`, `"tel"`, `"name"` |
| Errores | `aria-invalid="true"` en el input + `aria-describedby` a un `<span id="err-x">` con el error |
| Required | `required` HTML nativo (no solo asterisco visual) |
| Placeholder | NO usar como label. Solo como ejemplo. Contraste >= 4.5:1 |
| Grouping | Campos relacionados en `<fieldset><legend>` (ej. "Fecha de nacimiento" con dia/mes/año) |
| Focus | Al enviar con error, mover focus al primer campo invalido |

### 3.4 Modales (Share, Saber mas)

**Wireframe**: `#tpl-share`, `#tpl-saber-mas`

| Requisito | Implementacion |
|---|---|
| Rol | `role="dialog" aria-modal="true"` (OK) |
| Titulo | `aria-labelledby` apuntando al `<h2 id="...">` del modal |
| Descripcion | `aria-describedby` apuntando al parrafo intro si hay |
| Focus inicial | Al abrir, focus va al primer elemento interactivo (o al boton cerrar) |
| Focus trap | Tab loop dentro del modal, no escapa al fondo |
| Escape | Escape cierra el modal y devuelve focus al trigger |
| Body scroll lock | `body { overflow: hidden }` mientras esta abierto |
| Backdrop | Click en backdrop cierra (opcional, no requerido) |
| Restore focus | Al cerrar, focus vuelve al elemento que lo abrio |

**Codigo React esperado (con radix o headless-ui)**:

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <button>Saber mas</button>
  </Dialog.Trigger>
  <Dialog.Overlay className="backdrop" />
  <Dialog.Content aria-labelledby="titulo" aria-describedby="desc">
    <Dialog.Title id="titulo">Reforma educacional</Dialog.Title>
    <Dialog.Description id="desc">Sobre esta pregunta...</Dialog.Description>
    ...
    <Dialog.Close aria-label="Cerrar" />
  </Dialog.Content>
</Dialog.Root>
```

### 3.5 Bottom sheet (Saber mas)

Ademas de lo del modal:

| Requisito | Implementacion |
|---|---|
| Gesture alternativo | Swipe-down para cerrar, pero tambien boton cerrar visible siempre |
| Drag handle decorativo | `aria-hidden="true"` en la barrita gris de arriba |
| Anuncio al abrir | `aria-live="polite"` en un heading interno o el propio `aria-labelledby` basta |

### 3.6 Radar chart

**Wireframe**: `.wf-img` con texto "Radar" en Resultados

| Requisito | Implementacion |
|---|---|
| Descripcion textual | `role="img" aria-label="Radar de compatibilidad: Educacion 90%, Salud 75%, Pensiones 60%, ..."` |
| Tabla alternativa | Debajo del SVG, `<table>` con los mismos datos, visible o `class="sr-only"` |
| Colores | No solo depender del color para distinguir ejes; usar tambien labels textuales visibles |
| Interactividad | Si es interactivo (hover en punto muestra valor), debe ser accesible con teclado (arrows) |

**Codigo React esperado**:

```tsx
<div role="img" aria-labelledby="radar-title" aria-describedby="radar-desc">
  <span id="radar-title" className="sr-only">Radar de compatibilidad</span>
  <span id="radar-desc" className="sr-only">
    Boric: Educacion 90 por ciento, Salud 75 por ciento, ...
  </span>
  <svg aria-hidden="true">...</svg>
  <table className="sr-only"><!-- datos tabulares --></table>
</div>
```

### 3.7 Progress bar

**Wireframe**: `.wf-progress` en Cuestionario y en election cards

| Requisito | Implementacion |
|---|---|
| Rol | `role="progressbar"` |
| Valores | `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` |
| Label | `aria-label="Progreso del cuestionario"` o `aria-labelledby` |
| Texto alternativo | "3 de 12 preguntas" visible cerca (OK) |

### 3.8 Tabs

**Wireframe**: `.wf-tabs` en Perfil candidato (Resumen / Posturas / Noticias) y Comparador

| Requisito | Implementacion |
|---|---|
| Contenedor | `<div role="tablist" aria-label="Secciones del perfil">` |
| Tab | `<button role="tab" aria-selected="true|false" aria-controls="panel-x" id="tab-x">` |
| Panel | `<div role="tabpanel" id="panel-x" aria-labelledby="tab-x" tabindex="0">` |
| Keyboard | Arrow left/right cambia tab, Enter/Space activa, Home/End va al primero/ultimo |
| Focus | Solo el tab activo esta en el tab order (`tabindex="0"`), inactivos `tabindex="-1"` |

### 3.9 Tooltip (Confianza del match)

**Wireframe**: `.wf-tooltip` en `#tpl-resultados` variante

| Requisito | Implementacion |
|---|---|
| Trigger | `<button aria-describedby="tooltip-id">` |
| Contenido | `<div role="tooltip" id="tooltip-id">` |
| Trigger | Aparece con `:focus-visible` (teclado) y `onClick` (tap) - NO solo hover |
| Dismiss | Escape lo cierra, y click fuera lo cierra |
| Hoverable | Si aparece por hover, se debe poder mover el mouse encima sin que desaparezca |
| Persistente | No debe desaparecer solo por timeout |

### 3.10 Chips (filtros, confianza, importancia)

**Wireframe**: `.wf-chip`, `.wf-chip.active`

| Requisito | Implementacion |
|---|---|
| Filtro seleccionable | `<button role="switch" aria-checked="true|false">` para toggle unico |
| Grupo de filtros | `role="group" aria-label="Filtros"` alrededor |
| Filtro exclusivo (radio) | `<button role="radio" aria-checked="true|false">` dentro de `role="radiogroup"` |
| Estado activo | No solo color - agregar checkmark visible o texto ("Activo") |

### 3.11 Election card

**Wireframe**: `.wf-election-card` (`#election-card` en hi-fi)

| Requisito | Implementacion |
|---|---|
| Contenedor | Si toda la card es clickeable: `<a>` o `<button>` que envuelve todo |
| Titulo | `<h3>` con el nombre de la eleccion |
| CTAs | Botones dentro no anidados dentro del button de la card (usar Card Pattern con link overlay) |
| Estado active | `aria-current` no aplica aca (no es nav) - solo estilo visual + border |
| Empty state ("+ Activar") | `<button>Activar eleccion regional</button>` (verbo claro) |

### 3.12 Avatares

**Wireframe**: `.wf-avatar` (todos los tamaños)

| Requisito | Implementacion |
|---|---|
| Con foto | `<img alt="Foto de Gabriel Boric">` |
| Sin foto (iniciales) | `<div role="img" aria-label="Foto de Gabriel Boric">GB</div>` |
| Decorativo (junto al nombre) | `aria-hidden="true"` para no repetir el nombre |

---

## 4. Requisitos por pantalla

### 4.1 Cuestionario (`#tpl-cuestionario`) - CRITICO

Es el flujo mas largo (12+ pantallas seguidas). La accesibilidad aqui hace o rompe la experiencia.

| Requisito | Implementacion |
|---|---|
| Anunciar progreso | Al avanzar, screen reader dice "Pregunta 4 de 12" (via `aria-live="polite"` region) |
| Preguntas con `<fieldset><legend>` | Cada pregunta es un fieldset, la pregunta es el legend |
| Opciones como radio group | `role="radiogroup"` + `<input type="radio">` visualmente estilizados |
| Nav dentro del cuestionario | `aria-label="Navegacion del cuestionario"` en el bloque Atras/Siguiente |
| Guardar y salir | Boton explicito ademas del back del sistema |
| Focus al avanzar | Focus va al legend de la nueva pregunta (no al primer input, para escuchar la pregunta primero) |
| Peso e importancia | Radio group secundario con label "Que tan importante es este tema" |
| Saber mas | Trigger tooltip/modal con aria-expanded si es collapse, o Dialog si es modal |

### 4.2 Resultados (`#tpl-resultados`) - CRITICO

| Requisito | Implementacion |
|---|---|
| Anunciar match principal | Al llegar, focus en el heading "Tu match: 87% con Boric" |
| Radar accesible | Ver 3.6 |
| Ranking | `<ol>` (lista ordenada) con items - cada item es link al perfil |
| Cobertura | La barrita y "10/12" debe ser leida por SR como "10 de 12 preguntas coinciden" |
| Confianza | Chip anuncia "Confianza alta" + tooltip con explicacion |

### 4.3 Comparador (`#tpl-comparador`) - CRITICO

Comparaciones lado-a-lado son historicamente hostiles para SR.

| Requisito | Implementacion |
|---|---|
| Estructura | `<table>` semantico con `<caption>` "Comparacion entre Boric y Kast" |
| Headers | `<th scope="col">` para candidatos, `<th scope="row">` para ejes |
| Toggle "solo diferencias" | Aria-live que anuncia "Mostrando solo 3 diferencias" al activarse |
| Cambiar candidato | Boton "Cambiar candidato" abre selector, no swipe-only |

### 4.4 Home HUB (`#tpl-home`)

| Requisito | Implementacion |
|---|---|
| Election cards scrollables | Horizontal scroll debe ser navegable con arrow keys (JS custom) |
| Novedades | `<section aria-labelledby="novedades-titulo">` con `<h2 id="novedades-titulo">Novedades</h2>` |
| Empty state | Mensaje claro + CTA como boton, no solo icono |

### 4.5 Login / Signup

| Requisito | Implementacion |
|---|---|
| Autocomplete | Ver 3.3 |
| Show password | Boton `aria-pressed="true|false"` + aria-label "Mostrar/Ocultar contraseña" |
| OAuth buttons | Cada uno con `aria-label="Continuar con Google"` (no solo icono) |
| Error de login | `role="alert"` en el mensaje "Credenciales incorrectas" |

---

## 5. Keyboard shortcuts globales

Documentar en la pagina de ayuda:

| Tecla | Accion |
|---|---|
| `Tab` / `Shift+Tab` | Siguiente/anterior focuseable |
| `Escape` | Cerrar modal / tooltip / dropdown |
| `Enter` / `Space` | Activar boton/link |
| `Arrow up/down` | Navegar dentro de listas y tabs |
| `Arrow left/right` | Cambiar tab en tablist |
| `Home` / `End` | Primer/ultimo item de lista |
| `/` (opcional) | Focus en buscador global (si existe) |

**Regla**: NO usar shortcuts de una sola letra sin modifier (WCAG 2.1.4). Si se implementan, ofrecer setting para desactivar.

---

## 6. Testing antes de release

Cada pantalla debe pasar este checklist manual antes de mergear a main.

### 6.1 Manual - keyboard only

- [ ] Cargar la pantalla, presionar Tab hasta llegar al final. Todo focuseable, orden logico
- [ ] Ningun elemento con `outline: none` sin reemplazo visible
- [ ] Focus nunca queda tapado por sticky nav/toast
- [ ] Escape cierra modales y devuelve focus al trigger
- [ ] Enter/Space activan cada boton/link
- [ ] Skip link funciona (Tab en pagina fresca -> Enter salta a main)

### 6.2 Manual - screen reader (VoiceOver o NVDA)

- [ ] Cada control anuncia rol + nombre + estado (ej. "Boton, Volver, colapsado")
- [ ] Landmarks reconocidos: main, nav, dialog
- [ ] Encabezados en orden logico (h1 -> h2 -> h3, sin saltos)
- [ ] Icon-only buttons anuncian su proposito, no "boton unnamed"
- [ ] Tablas anuncian celdas con contexto ("Educacion, Boric, 90 por ciento")

### 6.3 Automatizado - axe-core

Instalar `@axe-core/react` en dev y `axe-playwright` para E2E:

```bash
npm install --save-dev @axe-core/react axe-playwright
```

En cada test E2E de pantalla:

```ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('Cuestionario es accesible', async ({ page }) => {
  await page.goto('/elecciones/presidencial/cuestionario');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
      },
    },
  });
});
```

### 6.4 Contraste - herramientas

- **Diseño**: Contrast Ratio (contrast-ratio.com) al elegir cada color
- **Runtime**: Chrome DevTools > Rendering > "Emulate CSS media prefers-contrast" para probar high-contrast
- **PWA**: Lighthouse accessibility audit (mira 4.5:1 y otros basicos)

### 6.5 Zoom y reflow

- [ ] Zoom 200% sin scroll horizontal en 320px de ancho
- [ ] Zoom 400% (WCAG 1.4.4) contenido sigue accesible con scroll en un solo eje
- [ ] Rotar de portrait a landscape no rompe layout

### 6.6 Motion

- [ ] `prefers-reduced-motion: reduce` colapsa transitions (OK en Tanda 1)
- [ ] Sin autoplaying video/audio
- [ ] Sin contenido parpadeante > 3 veces por segundo (WCAG 2.3.1)

---

## 7. Recursos y librerias recomendadas

Para no reinventar patrones de a11y:

| Necesidad | Libreria |
|---|---|
| Componentes headless con a11y correcta | Radix UI, Headless UI, React Aria |
| Dialog / bottom sheet | Radix Dialog o `@react-aria/overlays` |
| Tabs | Radix Tabs |
| Combobox / autocomplete | Downshift o Radix |
| Focus trap | `focus-trap-react` |
| Live regions | `react-aria-live` |
| Icon buttons | Usar `aria-label` manualmente, no hay libreria mas alla |
| Testing automatizado | axe-core + jest-axe + axe-playwright |

**Regla de oro**: nunca escribir un dropdown, dialog, tabs, etc. desde cero. Usar una libreria headless probada.

---

## 8. Consideraciones especificas Chile / audiencia

- **Lector de pantalla en español**: probar con voces en `es-CL` (Sofia, Diego). Algunas abreviaturas como "d." (dias) o "art." (articulo) pueden leerse mal - preferir palabra completa
- **Adultos mayores**: proporcion importante del padron. Considerar font-size base 16px minimo, boton tap-target 44px minimo
- **Baja alfabetizacion digital**: iconos deben tener texto complementario, no solo simbolos
- **Discapacidad visual en Chile**: ~1.9M personas segun ENDISC 2015. Alta relevancia de esta app para politica publica -> a11y es requisito legal y etico
- **Zonas con poca conectividad**: la app debe funcionar sin JS activado en modo lectura basica (SEO/SSR benefit tambien)

---

## 9. Cambio log

- **2026-07-28** - v1.1 - Focus management en overlays (seccion 10). Fix del warning WCAG 2.4.3 "Blocked aria-hidden on an element because its descendant retained focus". Trilogia de helpers (`blurActiveElement`, `useBlurringPress`, `installAriaHiddenFocusGuard`), patron backdrop-no-button para modals, y guia para escribir componentes overlay-safe.
- **2026-07-26** - v1.0 - Documento inicial. Recoge Tanda 1 (CSS quick wins) y Tanda 2 (semantica HTML) ya aplicadas al lowfi. Documenta requisitos para Tanda 3 (implementacion en produccion).

---

## 10. Focus management en overlays (WCAG 2.4.3)

> Seccion agregada en v1.1 despues del fix sistematico de aria-hidden. Es el
> contrato que TODOS los componentes clickeables y overlays del proyecto
> deben respetar.

### 10.1. El problema

Chromium emite el warning

```
Blocked aria-hidden on an element because its descendant retained focus.
The focus must not be hidden from assistive technology users.
```

cada vez que `setAttribute('aria-hidden', 'true')` se aplica en un elemento
que contiene al `document.activeElement`. Es violacion directa de WCAG 2.4.3
(Focus Order): un lector de pantalla se pierde si el foco esta en un nodo
que acaba de declararse invisible.

En React Native Web esto pasa **muy seguido** de forma implicita:

| Situacion | Quien aplica aria-hidden |
|---|---|
| Cambio de screen | React Navigation esconde la screen saliente |
| Cierre de `<Modal>` | RN Web esconde el portal |
| `BottomSheet` cerrandose | Wrapper del modal nativo |
| `Toast` que desaparece | Portal del toast |
| `Tooltip` que se dismissea | Portal del tooltip |
| Cualquier overlay futuro | Idem |

Fixear componente por componente (blur explicito en cada `onPress`) es
insostenible: siempre queda alguno afuera y cada `<Pressable>` nuevo
reintroduce el bug.

### 10.2. Defense in depth (3 capas)

El proyecto usa **tres helpers coordinados**, del mas quirurgico al mas
general:

#### Capa 1 - `blurActiveElement()` (helper puro)

Ubicacion: `frontend/src/hooks/blurActiveElement.ts`.

Funcion sincrona sin dependencias que hace `document.activeElement.blur()`
si hay un elemento activo distinto de `<body>`. En native es no-op
(no existe `document`).

Usala **inline** cuando escribas manualmente un callback que va a disparar
un cambio de aria-hidden (cerrar modal, confirmar accion, submit).

```ts
import { blurActiveElement } from "@/hooks/blurActiveElement";

function handleConfirm() {
  blurActiveElement();
  onConfirm();  // cierra el modal via setState en el padre
}
```

Casos actuales que la usan asi: `ConfirmModal`, `EditarRespuestaModal`,
`CambiarPasswordModal`, `EliminarCuentaModal`.

#### Capa 2 - `useBlurringPress(onPress)` (hook para atomos)

Ubicacion: `frontend/src/hooks/useBlurringPress.ts`.

Envuelve un handler de `Pressable` con blur automatico. Ideal para atomos
clickeables reutilizables.

```tsx
import { useBlurringPress } from "@/hooks/useBlurringPress";

export function MyButton({ onPress, ...rest }: Props) {
  const handlePress = useBlurringPress(onPress);
  return <Pressable {...rest} onPress={handlePress} />;
}
```

Atomos que ya la usan: `Button`, `Link`, `IconButton`, `NavRow`, `TabBarItem`.

**Regla**: **todo atomo clickeable nuevo** debe usar este hook. Si esta
revisando un PR y ves un `<Pressable>` directo sin `useBlurringPress`,
pedir el cambio (salvo Radio/Checkbox/Toggle, ver §10.4).

#### Capa 3 - `installAriaHiddenFocusGuard()` (safety net global)

Ubicacion: `frontend/src/utils/installAriaHiddenFocusGuard.ts`.

Monkey-patch de `Element.prototype.setAttribute` que se instala **una sola
vez** desde `App.tsx` (solo en web). Cuando cualquier codigo aplica
`aria-hidden="true"` a un elemento que contiene al `activeElement`,
bluerea el activeElement ANTES de dejar pasar el `setAttribute` original.

Es el backstop que atrapa cualquier caso que se escape a las capas 1 y 2:
componentes de terceros, futuros overlays, o descuidos.

**No hace falta llamarlo manualmente**. Ya esta instalado. Si alguien
renombra o borra el archivo por accidente, el warning va a reaparecer
en los flows de navegacion.

### 10.3. Patron backdrop de modals (NO botones anidados)

HTML no permite un `<button>` dentro de otro `<button>`. En RN Web, poner
`accessibilityRole="button"` a un `<Pressable>` lo renderiza como
`<button>`. Entonces, **los backdrops de modals que dismissean al tocar
afuera NO deben tener `accessibilityRole="button"`**, porque el contenido
del modal casi siempre incluye un IconButton "Cerrar" u otros botones.

Antes (bug):

```tsx
<Pressable
  style={styles.backdrop}
  onPress={handleClose}
  accessibilityRole="button"       // <- rompe HTML validity
  accessibilityLabel="Cerrar"
>
  <IconButton onPress={handleClose} ... />  // <- button dentro de button
</Pressable>
```

Despues (correcto):

```tsx
<Pressable
  style={styles.backdrop}
  onPress={handleClose}
  // Sin accessibilityRole="button": es un backdrop, no un boton.
>
  <IconButton onPress={handleClose} ... />
</Pressable>
```

La accesibilidad del cierre esta cubierta por:
1. `RNModal.onRequestClose` -> tecla Escape
2. El `IconButton` "Cerrar" visible en el header

Este es el patron WAI-ARIA canonico para `dialog`.

Caso actual que lo aplica: `BottomSheet.tsx` (fix aplicado en 2026-07-28).

### 10.4. Excepciones - cuando NO blurear

Algunos atomos son toggles con estado visual (radio button, checkbox,
switch). En estos, mantener el foco tras el press es correcto: el usuario
esta editando un valor, no navegando. Por eso:

- `Radio`, `Checkbox`, `Toggle` -> NO usan `useBlurringPress`
- Botones dentro de `<form>` que quieren dejar el foco en el proximo
  input -> manejar con `useRef` explicito, no con blur

### 10.5. Checklist para PR de componente nuevo

- [ ] Si es un atomo clickeable que dispara navegacion o cierre de overlay
      -> usa `useBlurringPress`
- [ ] Si escribiste un handler manual (`onConfirm`, `handleSubmit`) que
      dispara aria-hidden -> llama `blurActiveElement()` al inicio
- [ ] Si tu componente tiene un backdrop dismisseable -> `<Pressable>` del
      backdrop SIN `accessibilityRole="button"` ni `accessibilityLabel`
- [ ] Si es un toggle con estado (radio/check/switch) -> NO uses
      `useBlurringPress`
- [ ] Corriste `npm test` -> los 4 tests de `blurActiveElement.test.ts`
      y los 6 de `useBlurBeforeClose.test.ts` siguen en verde

### 10.6. Diagnostico rapido

Si el warning reaparece en algun flow:

1. Reproduci el warning en DevTools. Anota el `activeElement` (clases CSS
   del elemento que quedo focused).
2. Identifica el componente. Los `r-cursor-1loqt21` + `r-touchAction` son
   `<Pressable>` de RN Web. Las clases con `borderRadius` y `minHeight`
   te dan pistas del atomo (Button md = minHeight 48).
3. Si es un `<Pressable>` directo (no atomo del design system) -> mudar
   a Button/Link/IconButton, o wrappear el `onPress` con
   `useBlurringPress`.
4. Si el guard global no lo esta agarrando -> chequear que
   `installAriaHiddenFocusGuard()` sigue instalado en `App.tsx`.
5. Si el warning viene de un cambio de screen y el atomo YA usa
   `useBlurringPress` -> revisar si React Navigation esta esperando un
   `beforeRemove` o un focus custom.

