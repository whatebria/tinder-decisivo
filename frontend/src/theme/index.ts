/**
 * Barrel export para todos los tokens del design system.
 *
 * Uso:
 *   import { colors, spacing, radii, shadows, motion } from "@/theme";
 */

export { colors, colorsDark, type ColorKey } from "./colors";
export { spacing, type SpacingKey } from "./spacing";
export { radii, type RadiusKey } from "./radii";
export { shadows, shadowsDark, type ShadowKey } from "./shadows";
export { motion, easeBezier, type MotionKey } from "./motion";
export {
  useThemeColors,
  useThemeShadows,
  useIsDark,
  type ThemeColors,
  type ThemeShadows,
} from "./useTheme";
