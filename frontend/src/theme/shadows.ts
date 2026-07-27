/**
 * Sombras sutiles con tinte azul del texto (mas suaves que negro puro).
 * En dark mode, el consumidor debe usar shadowsDark.
 *
 * Formato adaptativo:
 *   - **Native (iOS/Android)**: shadowColor + shadowOffset + shadowOpacity +
 *     shadowRadius + elevation (Android).
 *   - **Web**: boxShadow CSS (los shadow* props estan deprecados en RN Web
 *     y disparan warnings de consola).
 *
 * Cada key exporta el shape correcto segun Platform.OS para que las StyleSheet
 * consumidoras no repitan la conversion.
 */

import { Platform, type ViewStyle } from "react-native";

interface ShadowSpec {
  color: string;
  /** 0..1 */
  opacity: number;
  offsetY: number;
  /** shadowRadius nativo = blur CSS. */
  blur: number;
  elevation: number;
}

/**
 * Convierte hex + opacity a rgba CSS. Solo hex de 6 caracteres (#RRGGBB).
 * Uso interno para generar boxShadow.
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildShadow(spec: ShadowSpec): ViewStyle {
  return Platform.select({
    web: {
      boxShadow: `0 ${spec.offsetY}px ${spec.blur}px ${hexToRgba(spec.color, spec.opacity)}`,
    },
    default: {
      shadowColor: spec.color,
      shadowOffset: { width: 0, height: spec.offsetY },
      shadowOpacity: spec.opacity,
      shadowRadius: spec.blur,
      elevation: spec.elevation,
    },
  }) as ViewStyle;
}

// -- Especificaciones (single source of truth) ---------------------------------
const SPEC = {
  shSm: { color: "#1A2B33", opacity: 0.05, offsetY: 1, blur: 2, elevation: 1 },
  shMd: { color: "#1A2B33", opacity: 0.08, offsetY: 2, blur: 8, elevation: 3 },
  shLg: { color: "#1A2B33", opacity: 0.12, offsetY: 8, blur: 24, elevation: 8 },
} as const satisfies Record<string, ShadowSpec>;

const SPEC_DARK = {
  shSm: { ...SPEC.shSm, color: "#000000", opacity: 0.3 },
  shMd: { ...SPEC.shMd, color: "#000000", opacity: 0.4 },
  shLg: { ...SPEC.shLg, color: "#000000", opacity: 0.5 },
} as const satisfies Record<string, ShadowSpec>;

export const shadows = {
  shSm: buildShadow(SPEC.shSm),
  shMd: buildShadow(SPEC.shMd),
  shLg: buildShadow(SPEC.shLg),
} as const;

export const shadowsDark = {
  shSm: buildShadow(SPEC_DARK.shSm),
  shMd: buildShadow(SPEC_DARK.shMd),
  shLg: buildShadow(SPEC_DARK.shLg),
} as const;

export type ShadowKey = keyof typeof shadows;
