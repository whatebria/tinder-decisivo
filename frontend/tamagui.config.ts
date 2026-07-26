/**
 * Config Tamagui: version minima usando @tamagui/config default + overrides de tokens Walmart.
 *
 * Filosofia: no reinventar el design system. Tamagui default tiene todo (spacing, radii,
 * fontSizes, breakpoints). Solo overrideamos colors para que matcheen la marca.
 */

import { config as configBase } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

import { colors } from "./src/theme/colors";

const brandColors = {
  primary: colors.primary,
  primaryDark: colors.primaryDark,
  accent: colors.accent,
  background: colors.background,
  surface: colors.surface,
  border: colors.border,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textOnPrimary: colors.textOnPrimary,
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  matchHigh: colors.matchHigh,
  matchMedium: colors.matchMedium,
  matchLow: colors.matchLow,
};

const appConfig = createTamagui({
  ...configBase,
  themes: {
    ...configBase.themes,
    light: {
      ...configBase.themes.light,
      ...brandColors,
    },
    dark: {
      ...configBase.themes.dark,
      ...brandColors,
      background: "#0F1419",
      surface: "#1A2332",
      text: "#F5F7FA",
      textSecondary: "#A0AEC0",
      border: "#2D3748",
    },
  },
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
