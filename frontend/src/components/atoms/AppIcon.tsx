/**
 * AppIcon: icono oficial de tinder-decisivo como componente React Native.
 *
 * Radar chart pentagonal (5 ejes) + silueta de persona centrada.
 * Paleta: design-system Paleta A (primary #2E5F7E / secondary #7BA098).
 * Adapta automaticamente al tema light/dark mediante useThemeColors().
 *
 * Uso:
 *   <AppIcon size={24} />
 *   <AppIcon size={48} />
 *
 * Fuente de diseno: assets/branding/app-icon-editable.svg
 * Generacion de PNGs: node scripts/generate-icons.js
 */

import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

import { useIsDark, useThemeColors } from "../../theme/useTheme";

export interface AppIconProps {
  /** Tamano del icono en px. Cuadrado. Default 24. */
  size?: number;
}

/**
 * Calcula los puntos del pentagon para un radio y centro dados.
 * Angulo inicial: arriba (12 en punto), sentido horario.
 */
function pentagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, k) => {
    const a = (k * 72 - 90) * (Math.PI / 180);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}

// Geometria fija (viewBox 512x512, escalado por SVG width/height)
const CX = 256;
const CY = 256;
const R  = 190;

// Vertices del pentagon exterior
const OUTER = pentagonPoints(CX, CY, R);
// Anillo 60%
const RING60 = pentagonPoints(CX, CY, R * 0.60);
// Anillo 35%
const RING35 = pentagonPoints(CX, CY, R * 0.35);

// Puntos del data polygon (scores: 85% 75% 90% 65% 80%)
const SCORES = [0.85, 0.75, 0.90, 0.65, 0.80];
const DATA_POINTS = SCORES.map((s, k) => {
  const a = (k * 72 - 90) * (Math.PI / 180);
  return { x: CX + R * s * Math.cos(a), y: CY + R * s * Math.sin(a) };
});
const DATA_POLY = DATA_POINTS.map((p) => `${p.x},${p.y}`).join(" ");

// Spokes: centro -> cada vertice exterior
const SPOKE_ENDS = Array.from({ length: 5 }, (_, k) => {
  const a = (k * 72 - 90) * (Math.PI / 180);
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
});

// Colores fijos aprobados en icon-preview.html
// Light grid end: dark.secondary usado como tono suave — no existe en light tokens
const GRID_END_LIGHT = "#9BC0B5";

export function AppIcon({ size = 24 }: AppIconProps) {
  const c      = useThemeColors();
  const isDark = useIsDark();

  // Gradiente principal — coincide exactamente con icon-preview.html
  // Light: primary400 (#5A87A5) -> primary (#2E5F7E) -> secondary (#7BA098)
  // Dark:  primaryHover (#9BC7DF) -> primary (#7BB5D4) -> secondary (#9BC0B5)
  const colorA = isDark ? c.primaryHover : c.primary400;  // #9BC7DF / #5A87A5
  const colorB = c.primary;                               // #7BB5D4 / #2E5F7E
  const colorC = c.secondary;                             // #9BC0B5 / #7BA098

  // Gradiente de grilla (anillos y spokes) — mas suave
  // Light: primary300 (#82A6BF) -> #9BC0B5
  // Dark:  primaryHover (#9BC7DF) -> secondary (#9BC0B5)
  const gridA = isDark ? c.primaryHover : c.primary300;  // #9BC7DF / #82A6BF
  const gridB = isDark ? c.secondary    : GRID_END_LIGHT; // #9BC0B5 / #9BC0B5

  const personStroke = c.primary;

  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        {/* Gradiente principal */}
        <LinearGradient id="apig" x1="76" y1="66" x2="438" y2="410" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={colorA}/>
          <Stop offset="55%"  stopColor={colorB}/>
          <Stop offset="100%" stopColor={colorC}/>
        </LinearGradient>
        {/* Gradiente de grilla (mas suave) */}
        <LinearGradient id="apig2" x1="76" y1="66" x2="438" y2="410" gradientUnits="userSpaceOnUse">
          <Stop offset="0%"   stopColor={gridA}/>
          <Stop offset="100%" stopColor={gridB}/>
        </LinearGradient>
        {/* Mascara: oculta las lineas de grilla detras de la persona */}
        <Mask id="apimp">
          <Rect width="512" height="512" fill="white"/>
          {/* Cabeza */}
          <Circle cx={CX} cy={224} r={42} fill="black"/>
          {/* Hombros */}
          <Path d="M 196,306 C 196,254 316,254 316,306 Z" fill="black"/>
        </Mask>
      </Defs>

      {/* Spokes (mascarados) */}
      <G mask="url(#apimp)" strokeLinecap="round" opacity={0.45}>
        {SPOKE_ENDS.map((p, i) => (
          <Line
            key={i}
            x1={CX} y1={CY} x2={p.x} y2={p.y}
            stroke={gridA}
            strokeWidth={5}
          />
        ))}
      </G>

      {/* Anillo 35% (mascarado) */}
      <Polygon
        mask="url(#apimp)"
        points={RING35}
        fill="none"
        stroke={gridA}
        strokeWidth={4}
        strokeLinejoin="round"
        opacity={0.40}
      />

      {/* Anillo 60% (mascarado) */}
      <Polygon
        mask="url(#apimp)"
        points={RING60}
        fill="none"
        stroke={gridA}
        strokeWidth={5}
        strokeLinejoin="round"
        opacity={0.55}
      />

      {/* Data polygon */}
      <Polygon
        points={DATA_POLY}
        fill="none"
        stroke="url(#apig)"
        strokeWidth={12}
        strokeLinejoin="round"
      />

      {/* Pentagon exterior */}
      <Polygon
        points={OUTER}
        fill="none"
        stroke="url(#apig)"
        strokeWidth={15}
        strokeLinejoin="round"
      />

      {/* Puntos en vertices del data polygon */}
      {DATA_POINTS.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={10} fill="url(#apig)"/>
      ))}

      {/* Persona (sobre todo, sin mascara) */}
      <G fill="none" stroke={personStroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={13}>
        <Circle cx={CX} cy={224} r={28}/>
        <Path d="M 208,294 C 208,270 304,270 304,294"/>
      </G>
    </Svg>
  );
}
