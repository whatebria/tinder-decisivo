# Arquitectura de componentes

## Capas (Atomic Design)

```
atoms/       → Primitivos sin lógica de dominio (Button, Icon, Avatar, Toggle…)
molecules/   → Composiciones de atoms reutilizadas en ≥2 pantallas (ProgressSplit, MatchTier…)
organisms/   → Bloques funcionales completos con estado/fetch propios (CuestionarioHeader, ResultadoHero…)
```

## Regla de co-localización ⭐

> **Un componente que solo se usa en UNA pantalla vive al lado de esa pantalla.**

Patrón de referencia: `screens/DetalleCandidato/`

```
screens/
  DetalleCandidato/
    DetalleCandidatoScreen.tsx   ← screen principal
    ResumenTab.tsx               ← sub-componente co-localizado
    NoticiasTab.tsx              ← sub-componente co-localizado
```

### Señales de que un componente debería co-localizarse

- Su nombre empieza con el nombre de la pantalla (`HomeElectionItem`, `OnboardingPreguntaDemo`).
- Solo aparece en imports de una sola pantalla.
- No tiene sentido fuera de ese contexto.

### Criterio de ascenso

| Cuántos screens lo usan | Dónde vive |
|---|---|
| 1 | Al lado de la pantalla (`screens/MiPantalla/`) |
| 2+ sin fetch | `molecules/` |
| 2+ con fetch/estado complejo | `organisms/` |

## Convención de styles

**Preferir `StyleSheet.create` a nivel de módulo** (fuera del componente):

```tsx
//  Correcto — se crea una sola vez en toda la vida de la app
const styles = StyleSheet.create({
  container: { padding: spacing.sp4, borderRadius: radii.rMd },
});

export function MiComponente() {
  const c = useThemeColors();
  return <View style={[styles.container, { backgroundColor: c.bg }]} />;
}

//  Evitar — useMemo([c]) recrea el StyleSheet en cada cambio de tema
export function MiComponente() {
  const c = useThemeColors();
  const styles = useMemo(() => StyleSheet.create({ container: { backgroundColor: c.bg } }), [c]);
  return <View style={styles.container} />;
}
```

**Excepción documentada:** si el StyleSheet depende de props dinámicas (no solo del tema),
`useMemo` con las props como deps puede ser correcto.

## Convención de átomos

Un atom **no debe** importar de `domain/`, `services/` ni `screens/`.
Si un componente necesita lógica de dominio, es molecule u organism.

Ver: [TASK-060] ElectionCard — migración atom → molecule por importar `domain/eleccion.ts`.
