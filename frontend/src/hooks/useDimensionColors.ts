/**
 * useDimensionColors: thin wrapper que resuelve `isDark` automaticamente
 * desde el theme y delega a `getDimensionColors` del domain.
 *
 * Se separa del domain para no acoplar `src/domain/` a React — el domain
 * es logica pura y testeable sin renderer.
 */
import {
  getDimensionColors,
  type DimensionColors,
  type DimensionKey,
} from "../domain/dimensiones";
import { useIsDark } from "../theme/useTheme";

export function useDimensionColors(key: DimensionKey): DimensionColors {
  const isDark = useIsDark();
  return getDimensionColors(key, isDark);
}
