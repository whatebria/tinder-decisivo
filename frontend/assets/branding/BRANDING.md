# Branding — tinder-decisivo

## App Icon

El icono oficial de la aplicacion fue aprobado y adoptado como activo grafico oficial.

### Descripcion visual

Radar chart pentagonal (5 ejes) + silueta de persona centrada.
Representa: voto, posiciones de politica publica, comparacion de candidatos, matching por afinidad.

### Paleta de colores

| Token          | Light mode | Dark mode  | Referencia                     |
|----------------|------------|------------|-------------------------------|
| Principal A    | `#5A87A5`  | `#9BC7DF`  | `colors.primary400` / `primaryHover` |
| Principal B    | `#2E5F7E`  | `#7BB5D4`  | `colors.primary` (primary600)  |
| Secundario     | `#7BA098`  | `#9BC0B5`  | `colors.secondary`             |
| Grilla A       | `#82A6BF`  | `#9BC7DF`  | `colors.primary300`            |
| Grilla B       | `#9BC0B5`  | `#9BC0B5`  | `colors.secondary` dark        |

### Geometria (viewBox 512x512)

- **Centro:** cx=256, cy=256
- **Radio exterior:** R=190
- **Anillos:** 60% (R=114), 35% (R=66.5)
- **Pesos de trazo:** pentagon=15, data polygon=12, persona=13, anillos=4-5

### Archivos

```
assets/
  icon.svg                       Icono de produccion (con prefers-color-scheme)
  icon.png                       PNG 1024x1024 (Expo icon.png)
  favicon.png                    PNG 48x48 (web favicon)
  android-icon-foreground.png    PNG 1024x1024 (icono sobre transparente)
  android-icon-background.png    PNG 1024x1024 (fondo solido #F5F7F5)
  android-icon-monochrome.png    PNG 1024x1024 (monocromo negro/alpha)
  branding/
    app-icon.svg                 Copia de produccion (para referencia de branding)
    app-icon-original.svg        Version original aprobada (no modificar)
    app-icon-editable.svg        Fuente anotada con tokens y geometria (editar aqui)

src/
  components/atoms/AppIcon.tsx   Componente React Native (usa react-native-svg)
```

### Como regenerar los PNGs

```bash
cd frontend
node scripts/generate-icons.js
```

Requiere: `@resvg/resvg-js` (ya en devDependencies).

### Como editar el icono

1. Abrir `assets/branding/app-icon-editable.svg` en Inkscape, Figma o cualquier editor SVG.
2. Mantener los tokens en sinconia con `src/theme/colors.ts`.
3. Al aprobar cambios, copiar el resultado a `assets/icon.svg` y `assets/branding/app-icon.svg`.
4. Ejecutar `node scripts/generate-icons.js` para regenerar todos los PNGs.
5. Actualizar el componente `src/components/atoms/AppIcon.tsx` si cambian formas o colores.
6. Crear un nuevo issue en `match-private` documentando el cambio.

### Usos en la aplicacion

| Lugar                              | Componente              | Notas                          |
|------------------------------------|-------------------------|--------------------------------|
| Barra superior Home                | `HomeTopBar`            | Usa `AppIcon` como brand mark  |
| Icono de la app (iOS/Android/Web)  | `assets/icon.png`       | Generado desde `icon.svg`      |
| Favicon web                        | `assets/favicon.png`    | Generado desde `icon.svg`      |

### Historial

| Fecha      | Cambio                                                     |
|------------|------------------------------------------------------------|
| 2026-07-31 | Icono aprobado. Reemplaza el corazon como marca principal. |
