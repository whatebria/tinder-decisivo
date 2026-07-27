# Reglas para agentes AI que tocan este frontend

## 1. Expo/RN version drift

Expo evoluciona rapido. Antes de escribir codigo nuevo con APIs de Expo
o React Native, consulta la doc VERSIONADA correcta:

- Expo SDK 57: https://docs.expo.dev/versions/v57.0.0/
- React Native 0.86: https://reactnative.dev/docs/0.86/

No asumas que APIs vistas en otros proyectos siguen igual aca.

## 2. Design tokens (NO literales)

Nunca hardcodees colores, spacing, radios o tipografia en un component.
Usa los tokens de `src/theme/`:

- Colores: `useThemeColors()` (reactivo al store), NO `import { colors }`
- Sombras: `useThemeShadows()`
- Dark mode check: `useIsDark()`
- Spacing: `spacing.sp1..sp9` (base 4)
- Radios: `radii.rSm/rMd/rLg/rXl/rFull`
- Tipografia: `typography.display/h1..h3/lead/body/small/overline`

Si un token no existe para lo que necesitas, agregalo al theme primero,
no lo inlinees.

## 3. React Query — usar `queryKeys` centralizado

Nunca pases un array literal como `queryKey`. Toda entrada nueva DEBE
registrarse en `src/api/queryClient.ts` y consumirse via el helper
`queryKeys`. Por que:

- Typos silenciosos (`["match"]` vs `["matches"]`) rompen invalidacion
  sin warning
- Colisiones por prefix son invisibles hasta que alguien invalida y no
  entiende por que refetchea todo

Convencion de namespaces cuando un recurso tiene mas de una variante:

```
["noticias", "feed", ...filtros]        <- feed global
["noticias", "porCandidato", id]        <- noticias de UN candidato
["matches", tipoEleccionId]             <- ranking del user
["match-detalle", candidatoId]          <- explicacion por pregunta
```

## 4. Tipos del backend — autogenerados

`src/types/api.ts` es OUTPUT de `npm run types:gen` (drf-spectacular ->
openapi-typescript). Nunca lo edites a mano. Si cambias un serializer en
el backend, corre el comando y TypeScript te avisa que rompio.

Cuando declares un tipo nuevo en `src/api/endpoints.ts`, primero chequea
si ya existe en `Schemas["X"]` del schema autogenerado. Preferir siempre
el alias autogenerado sobre una interface manual (que no se actualiza).

## 5. Helpers compartidos (DRY)

Antes de escribir `nombreCompleto`, `iniciales`, `fullName`, etc.
para un candidato, mira `src/utils/candidato.ts`. Ya existe y acepta
un shape laxo (`CandidatoLike`) que cubre bookmarks, listados y detalle.

Para fechas de noticias mira `src/utils/noticia.ts`.

Todo helper nuevo va en `src/utils/` con JSDoc y tipos exportados.

## 6. Idioma

Espanol neutro (tuteo). Nada de voseo rioplatense ni modismos regionales.
Formas correctas: "tienes", "puedes", "haz", "eres", "elige", "pon".
Aplica a UI copy, labels, mensajes de error, seed data, comentarios en
codigo. Nombres de funciones y variables en espanol cuando refieren a
conceptos del dominio (candidato, cuestionario, matching), en ingles
cuando son tecnicos (fetch, mount, cache).

## 7. Auth guard en interceptors

`src/api/client.ts` tiene un interceptor 401 que dispara logout. Ojo:
solo debe hacerlo si HABIA token — sino el modo `guest` (usuario sin
registrar) se rompe. Si tocas ese interceptor, preserva ese guard.

## 8. Screens grandes

Regla del proyecto: archivos < 600 lineas. Si una screen crece mas
alla, extraer:

- Custom hooks para state complejo (`useNoticiasFilters`, etc.)
- Sub-componentes por tab/seccion
- Sheets/modals a molecules dedicados

Ver `docs/audit-2026-07-26.html` para el mapeo de screens que ya rompen
el limite.

## 9. Accesibilidad

Cualquier `<Pressable>`, `<Button>`, `<Modal>` DEBE tener:

- `accessibilityLabel` descriptivo (no "boton" — "Ver detalle de {nombre}")
- `accessibilityRole` correcto ("button", "link", "header", ...)
- `accessibilityHint` cuando la accion no es obvia

Target: WCAG 2.2 nivel AA. Los contrast ratios ya estan documentados
en `src/theme/colors.ts`.

## 10. Tests

Cobertura actual esta limitada a `src/services/`. Cuando toques o
crees algo en `utils/`, `store/` o components complejos, considera
agregar test (`__tests__/` local o `X.test.ts` colocado). Framework:
Jest + jest-expo preset.

## 11. Antes de commitear

```bash
npm run typecheck    # DEBE pasar
npm test             # DEBE pasar los que existen
```

No commitees si `tsc` esta rojo, aunque sea "solo el archivo que no
tocaste" — casi siempre es efecto colateral de tu cambio.
