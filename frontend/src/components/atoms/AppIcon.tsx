/**
 * AppIcon: icono oficial de tinder-decisivo como componente React Native.
 *
 * Pentagon (= marco del radar) + silueta de persona centrada.
 * viewBox 24x24 — los stroke widths son screen-pixels reales, sin escalar.
 * No usa gradientes en stroke ni Mask (soporte inconsistente en react-native-svg).
 *
 * Uso:
 *   <AppIcon size={22} />   // solo pentagon + persona (limpio, como un heart)
 *   <AppIcon size={48} />   // agrega data polygon relleno
 *
 * Fuente: assets/branding/app-icon-editable.svg
 */

import React from "react";
import Svg, { Circle, Path, Polygon } from "react-native-svg";

import { useIsDark, useThemeColors } from "../../theme/useTheme";

export interface AppIconProps {
  /** Tamano cuadrado en px. Default 24. */
  size?: number;
}

// viewBox 24x24 — centro (12,12), radio pentagon R=10
const CX = 12;
const CY = 12;
const R  = 10;

/** Vertices del pentagon. Angulo 0 = arriba (12 en punto), horario. */
function mkPentagon(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, k) => {
    const a = (k * 72 - 90) * (Math.PI / 180);
    return `${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`;
  }).join(" ");
}

/** Data polygon con scores fijos de ejemplo (no cruza el area de la persona). */
function mkDataPolygon(cx: number, cy: number, r: number): string {
  // scores verificados: bordes a minimo 5.6u del centro, persona a max 4.2u
  const scores = [0.85, 0.78, 0.88, 0.72, 0.82];
  return scores.map((s, k) => {
    const a = (k * 72 - 90) * (Math.PI / 180);
    return `${(cx + r * s * Math.cos(a)).toFixed(3)},${(cy + r * s * Math.sin(a)).toFixed(3)}`;
  }).join(" ");
}

const PENTAGON = mkPentagon(CX, CY, R);
const DATA_POLY = mkDataPolygon(CX, CY, R);

// Persona: cabeza en (12, 9.5) r=2, hombros arco debajo
// Posicionada en el interior del pentagon, sin tocar los bordes del data polygon
const HEAD_CX = CX;
const HEAD_CY = 9.5;
const HEAD_R  = 2;
const SHOULDERS = "M 8,15 C 8,12 16,12 16,15";

export function AppIcon({ size = 24 }: AppIconProps) {
  const c      = useThemeColors();
  const isDark = useIsDark();

  // Colores exactos del preview aprobado (solid — sin gradientes en stroke)
  // Light: primary #2E5F7E  |  Dark: primary #7BB5D4
  const color = c.primary;

  // Data polygon solo visible en tamanos donde tiene sentido
  const showDataPoly = size >= 32;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">

      {/* Pentagon — marco del radar */}
      <Polygon
        points={PENTAGON}
        fill={color}
        fillOpacity={isDark ? 0.12 : 0.07}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data polygon — solo en tamanos grandes */}
      {showDataPoly && (
        <Polygon
          points={DATA_POLY}
          fill={color}
          fillOpacity={0.18}
          stroke={color}
          strokeOpacity={0.65}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      )}

      {/* Persona: cabeza */}
      <Circle
        cx={HEAD_CX}
        cy={HEAD_CY}
        r={HEAD_R}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
      />

      {/* Persona: hombros */}
      <Path
        d={SHOULDERS}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />

    </Svg>
  );
}
