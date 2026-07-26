/**
 * Sombras sutiles con tinte azul del texto (mas suaves que negro puro).
 * En dark mode, el consumidor debe usar shadowsDark.
 *
 * Formato React Native (shadowOffset + shadowOpacity + shadowRadius).
 * En web/Tamagui, tambien se pueden usar como string CSS.
 */

import type { ViewStyle } from "react-native";

export const shadows = {
  shSm: {
    shadowColor: "#1A2B33",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } satisfies ViewStyle,
  shMd: {
    shadowColor: "#1A2B33",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } satisfies ViewStyle,
  shLg: {
    shadowColor: "#1A2B33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,
} as const;

export const shadowsDark = {
  shSm: { ...shadows.shSm, shadowColor: "#000000", shadowOpacity: 0.3 },
  shMd: { ...shadows.shMd, shadowColor: "#000000", shadowOpacity: 0.4 },
  shLg: { ...shadows.shLg, shadowColor: "#000000", shadowOpacity: 0.5 },
} as const;

export type ShadowKey = keyof typeof shadows;
