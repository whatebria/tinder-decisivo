/**
 * Hooks reactivos al tema para acceder a tokens dependientes del modo (light/dark).
 *
 * Uso:
 *   function MyComponent() {
 *     const c = useThemeColors();
 *     const styles = useMemo(() => StyleSheet.create({ box: { backgroundColor: c.bg } }), [c]);
 *     return <View style={styles.box} />;
 *   }
 *
 * Por que existen: los componentes que hacen `import { colors }` a nivel modulo
 * capturan el theme light UNA sola vez al bundling. Estos hooks re-renderean
 * cuando el ThemeStore cambia el modo.
 */

import { useMemo } from "react";

import { colors, colorsDark, type ColorKey } from "./colors";
import { shadows, shadowsDark, type ShadowKey } from "./shadows";
import { useThemeStore } from "../store/theme";

export type ThemeColors = Record<ColorKey, string>;
export type ThemeShadows = Record<ShadowKey, (typeof shadows)[ShadowKey]>;

/** Colores del tema activo. Cambia entre light y dark automaticamente. */
export function useThemeColors(): ThemeColors {
  const effective = useThemeStore((s) => s.effective);
  return effective === "dark" ? (colorsDark as ThemeColors) : (colors as ThemeColors);
}

/** Sombras del tema activo (mas fuertes en dark mode para compensar el fondo). */
export function useThemeShadows(): ThemeShadows {
  const effective = useThemeStore((s) => s.effective);
  return effective === "dark" ? shadowsDark : shadows;
}

/** True si el modo efectivo es dark. Util para logica condicional. */
export function useIsDark(): boolean {
  return useThemeStore((s) => s.effective) === "dark";
}
