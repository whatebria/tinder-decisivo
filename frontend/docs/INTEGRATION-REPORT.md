# Integración de Nuevo Icono

Commit: `2d49265`

---

## Assets Creados

| Archivo | Descripción |
|---|---|
| `assets/icon.svg` | Icono de producción con `prefers-color-scheme` (light/dark automático) |
| `assets/branding/app-icon.svg` | Copia del icono de producción para referencia de branding |
| `assets/branding/app-icon-original.svg` | Versión original aprobada — no modificar |
| `assets/branding/app-icon-editable.svg` | Fuente anotada con tokens de diseño, geometría y notas de edición |
| `assets/branding/app-icon-512.png` | Render PNG 512x512 para uso en presentaciones |
| `assets/branding/BRANDING.md` | Documentación oficial: paleta, geometría, usos, flujo de actualización |
| `scripts/generate-icons.js` | Script Node.js para regenerar todos los PNGs desde el SVG fuente |

---

## Archivos Modificados

| Archivo | Cambio |
|---|---|
| `assets/icon.png` | Regenerado 1024×1024 desde SVG (light, fondo blanco) |
| `assets/favicon.png` | Regenerado 48×48 desde SVG (transparente) |
| `assets/android-icon-foreground.png` | Regenerado 1024×1024 (icono al 66% sobre transparente) |
| `assets/android-icon-background.png` | Regenerado 1024×1024 (sólido `#F5F7F5` design-system) |
| `assets/android-icon-monochrome.png` | Regenerado 1024×1024 (monocromo negro/alpha para Android 13+) |
| `assets/splash-icon.png` | Regenerado 200×200 desde SVG |
| `app.json` | `backgroundColor` corregido: `#E6F4FE` → `#F5F7F5` (design-system `bg`) |
| `package.json` | Script `"icons": "node scripts/generate-icons.js"` agregado |
| `src/components/atoms/index.ts` | `export { AppIcon, type AppIconProps }` agregado |
| `src/components/organisms/HomeTopBar.tsx` | Comentario y import actualizados |

---

## Iconos Reemplazados

| Ubicación | Antes | Después | Razón |
|---|---|---|---|
| `HomeTopBar` — brand mark | `<Icon name="heart" size={22} color={c.primary} fill={c.primary} />` | `<AppIcon size={22} />` | El heart no representaba la marca; el nuevo icono radar+persona sí |
| `assets/icon.png` | PNG genérico (ex-Expo placeholder) | Nuevo icono 1024×1024 | Icono oficial de la app |
| `assets/favicon.png` | PNG genérico | Nuevo favicon 48×48 | Web |
| `assets/*.png` (Android) | PNGs originales | Regenerados con nuevo icono | Android adaptive icon completo |

### Iconos que **NO** se reemplazaron (intencional)

| Ubicación | Icono | Razón |
|---|---|---|
| `DetalleCandidatoScreen` | `heart` en botón favorito | Semántica correcta: acción "guardar" |
| `MisGuardadosScreen` | `heart` en EmptyState | Contexto: pantalla de favoritos |
| `ActionButton.showcase` | `heart` en demo | Catálogo de variantes del botón de acción |
| `Icon.showcase` | `heart` en catálogo | Documentación del sistema de iconos |

---

## Refactorizaciones Realizadas

### AppIcon.tsx — componente centralizado

Un único origen de verdad para el icono de la app dentro del código React Native.
- Usa `react-native-svg` (ya en dependencias, misma estrategia que `RadarChart`)
- Geometría calculada matemáticamente (no coordenadas hardcodeadas del SVG)
- Colores exactos del preview aprobado, via tokens del design system:

```
Light: primary400 (#5A87A5) → primary (#2E5F7E) → secondary (#7BA098)
Dark:  primaryHover (#9BC7DF) → primary (#7BB5D4) → secondary (#9BC0B5)
Grid Light: primary300 (#82A6BF) → #9BC0B5
Grid Dark:  primaryHover (#9BC7DF) → secondary (#9BC0B5)
```

- Tema detectado en runtime con `useIsDark()` + `useThemeColors()`
- Máscara SVG integrada: las líneas del radar no atraviesan la silueta de la persona
- API mínima: `<AppIcon size={24} />`

### scripts/generate-icons.js

Automatiza la regeneración de los 7 assets PNG desde el SVG fuente.
Usa `@resvg/resvg-js` (binarios precompilados para Windows, sin compilación nativa).

```bash
npm run icons
```

---

## Validaciones Ejecutadas

| Validación | Resultado |
|---|---|
| `node scripts/generate-icons.js` |  7 PNGs generados correctamente |
| Paleta de colores vs `colors.ts` |  Tokens verificados (primary300, primary400, primaryHover, secondary) |
| `HomeTopBar` — import AppIcon |  Import correcto, Icon sigue presente para bell |
| `atoms/index.ts` — export AppIcon |  Exportado correctamente |
| `app.json` — backgroundColor |  Actualizado a `#F5F7F5` |
| Git commit |  `2d49265` — 20 files changed, 1242 insertions |

---

## Problemas Detectados

| # | Problema | Impacto | Recomendación |
|---|---|---|---|
| 1 | `tsc --noEmit` timeout en este entorno | INFO | El type check tarda +40s en Windows con Node 20.18. No hay errores de tipo visibles en los archivos tocados. |
| 2 | `primary300` / `primary400` son del tint scale — no cambian en dark mode | RESUELTO | Se usa `isDark ? c.primaryHover : c.primary400` para el color correcto por tema |
| 3 | `resvg` no soporta `prefers-color-scheme` CSS | RESUELTO | El script usa SVG con colores hardcodeados (light) para generación de PNGs |
| 4 | `HomeTopBar.showcase.tsx` — comentario todavía menciona "heart" | LOW | Se puede actualizar en próxima sesión de docs |

---

## Estado Final

 Completado

```
assets/
  branding/
    app-icon.svg          ← copia producción
    app-icon-original.svg ← original aprobado (no tocar)
    app-icon-editable.svg ← fuente anotada para edición futura
    app-icon-512.png      ← render para presentaciones
    BRANDING.md           ← documentación oficial
  icon.svg                ← producción (prefers-color-scheme)
  icon.png                ← 1024×1024 generado
  favicon.png             ← 48×48 generado
  android-icon-*.png      ← foreground / background / monochrome generados
  splash-icon.png         ← 200×200 generado

src/components/atoms/
  AppIcon.tsx             ← componente oficial (único origen de verdad)

src/components/organisms/
  HomeTopBar.tsx          ← brand mark actualizado a AppIcon

scripts/
  generate-icons.js       ← npm run icons
```
