/**
 * Config Tamagui — integra los tokens del design system (Paleta A).
 *
 * Estrategia:
 * - Extiende @tamagui/config/v3 (aporta spacing, radii, fontSizes, breakpoints default).
 * - Override completo de themes.light y themes.dark con nuestros colors.
 * - Los tokens se pueden usar en Tamagui como `$primary`, `$bg`, `$success`, `$gray100`, etc.
 */

import { config as configBase } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

import { colors, colorsDark } from "./src/theme/colors";

const appConfig = createTamagui({
  ...configBase,
  themes: {
    ...configBase.themes,
    light: {
      ...configBase.themes.light,
      ...colors,
      // Aliases que Tamagui espera por convencion
      background: colors.bg,
      color: colors.text,
      borderColor: colors.border,
      placeholderColor: colors.textTertiary,
    },
    dark: {
      ...configBase.themes.dark,
      ...colorsDark,
      background: colorsDark.bg,
      color: colorsDark.text,
      borderColor: colorsDark.border,
      placeholderColor: colorsDark.textTertiary,
    },
  },
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
