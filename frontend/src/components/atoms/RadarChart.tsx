/**
 * RadarChart: poligono SVG que muestra el score por eje tematico.
 *
 * Sirve para visualizar el breakdown de match de un candidato.
 * Usa react-native-svg (funciona en iOS, Android y web).
 *
 * Props:
 * - data: Record<ejeName, percentage 0-100>
 * - size: pixels del poligono (el SVG renderiza mas grande cuando showLabels=true)
 * - color: color del poligono (default primary)
 * - showLabels: si muestra los nombres de los ejes alrededor
 */

import React, { useMemo } from "react";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

import { useThemeColors } from "../../theme/useTheme";
import { EJE_LABELS } from "../../domain/dimensiones";

// -- Constantes de layout (TASK-034) ------------------------------------------

/** El poligono ocupa este ratio de `size` desde el centro hacia cada vertice. */
const RADAR_POLYGON_RATIO         = 0.45;
/**
 * Distancia en px reales del borde del poligono al centro del label.
 * Espacio visual entre el poligono y el texto.
 */
const RADAR_LABEL_OFFSET_PX       = 20;
/**
 * Estimado de la mitad del ancho del label mas largo a fontSize=11.
 * "Institucional" @ 11px ~ 84px de ancho -> mitad ~ 42px.
 */
const RADAR_LABEL_HALF_WIDTH_PX   = 42;
/**
 * UX-061 (fix definitivo): padding fisico en cada lado del area de poligono.
 * El SVG se infla por este valor en cada borde cuando showLabels=true, de modo
 * que los labels tienen espacio real sin tricks de viewBox.
 *   svgSize = size + RADAR_LABEL_PAD * 2
 * Los llamadores reciben un SVG fisicamente mas grande.
 */
const RADAR_LABEL_PAD             = RADAR_LABEL_OFFSET_PX + RADAR_LABEL_HALF_WIDTH_PX; // 62px
/** Tamano de fuente visual de los labels (px reales, sin escalar). */
const RADAR_LABEL_FONT_PX         = 11;
/** Opacidad del fill del poligono (suave, no solido). */
const RADAR_FILL_OPACITY          = 0.25;
/** Longitud maxima de un label antes de truncar (cubre "Institucional" = 13 chars). */
const RADAR_LABEL_MAX_CHARS       = 14;

/**
 * UX-061: resuelve el label de un eje con normalizacion defensiva.
 *
 * 1. Busca en EJE_LABELS (preferencia, tiene labels curados).
 * 2. Si no encuentra, aplica sentence-case al raw key para evitar MAYUSCULAS.
 * 3. Si supera RADAR_LABEL_MAX_CHARS, trunca con "..." .
 */
function resolveEjeLabel(eje: string): string {
  const curated = EJE_LABELS[eje];
  if (curated) return curated;
  const normalized =
    eje.charAt(0).toUpperCase() + eje.slice(1).toLowerCase().replace(/_/g, " ");
  if (normalized.length > RADAR_LABEL_MAX_CHARS) {
    return normalized.slice(0, RADAR_LABEL_MAX_CHARS - 1) + "\u2026";
  }
  return normalized;
}

export interface RadarChartProps {
  data: Record<string, number>;
  size?: number;
  color?: string;
  showLabels?: boolean;
  levels?: number;
  /**
   * UX-038: alternativa textual para lectores de pantalla (WCAG 1.1.1 Nivel A).
   * Por defecto se genera automaticamente a partir de `data`.
   * Pasar string vacio o `null` para usos puramente decorativos (ej. RankingRow).
   */
  accessibilityLabel?: string | null;
}

interface Point {
  x: number;
  y: number;
}

/**
 * UX-038: genera un accessibilityLabel textual para lectores de pantalla.
 * WCAG 1.1.1 Nivel A: todo contenido no-texto necesita alternativa textual.
 */
function buildA11yLabel(data: Record<string, number>): string {
  const ejes = Object.entries(data)
    .map(([k, v]) => `${resolveEjeLabel(k)}: ${Math.round(v)}%`)
    .join(", ");
  return `Grafico de afinidad por eje tematico. ${ejes}.`;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): Point {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RadarChart({
  data,
  size = 240,
  color,
  showLabels = true,
  levels = 4,
  accessibilityLabel: accessibilityLabelProp,
}: RadarChartProps) {
  const c = useThemeColors();
  const strokeColor = color ?? c.primary;
  const ejes = useMemo(() => Object.keys(data), [data]);

  if (ejes.length < 3) {
    return null; // radar no tiene sentido con menos de 3 ejes
  }

  // El SVG fisico es mas grande que `size` cuando hay labels para que el
  // texto tenga espacio real sin viewBox tricks.
  const svgSize = showLabels ? size + RADAR_LABEL_PAD * 2 : size;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  // El radio del poligono se basa en `size`, no en `svgSize`.
  // El padding extra es exclusivamente para los labels.
  const radius = size * RADAR_POLYGON_RATIO;
  const step = (2 * Math.PI) / Math.max(ejes.length, 1);
  const startAngle = -Math.PI / 2; // arriba (12 en punto)

  // Grid: poligonos concentricos para look angular (no circulos).
  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const pts = ejes
      .map((_, j) => {
        const p = polarToCartesian(cx, cy, r, startAngle + j * step);
        return `${p.x},${p.y}`;
      })
      .join(" ");
    return (
      <Polygon
        key={i}
        points={pts}
        stroke={c.border}
        strokeWidth={1}
        fill="none"
      />
    );
  });

  // Lineas radiales desde el centro a cada vertice.
  const gridLines = ejes.map((_, i) => {
    const angle = startAngle + i * step;
    const p = polarToCartesian(cx, cy, radius, angle);
    return (
      <Line
        key={i}
        x1={cx}
        y1={cy}
        x2={p.x}
        y2={p.y}
        stroke={c.border}
        strokeWidth={1}
      />
    );
  });

  // Poligono de datos.
  const dataPoints: Point[] = ejes.map((eje, i) => {
    const angle = startAngle + i * step;
    const value = Math.max(0, Math.min(100, data[eje] ?? 0));
    const r = (value / 100) * radius;
    return polarToCartesian(cx, cy, r, angle);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Vertices marcados con un punto.
  const vertexDots = dataPoints.map((p, i) => (
    <Circle key={i} cx={p.x} cy={p.y} r={3} fill={strokeColor} />
  ));

  // Labels de los ejes — posicionados en el area de padding exterior al poligono.
  const labels = showLabels
    ? ejes.map((eje, i) => {
        const angle = startAngle + i * step;
        const labelPos = polarToCartesian(
          cx,
          cy,
          radius + RADAR_LABEL_OFFSET_PX,
          angle
        );
        return (
          <SvgText
            key={i}
            x={labelPos.x}
            y={labelPos.y}
            fontSize={RADAR_LABEL_FONT_PX}
            fill={c.textSecondary}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {resolveEjeLabel(eje)}
          </SvgText>
        );
      })
    : null;

  return (
    <Svg
      width={svgSize}
      height={svgSize}
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabelProp != null
          ? accessibilityLabelProp
          : buildA11yLabel(data)
      }
    >
      <G>
        {gridPolygons}
        {gridLines}
        <Polygon
          points={polygonPoints}
          fill={strokeColor}
          fillOpacity={RADAR_FILL_OPACITY}
          stroke={strokeColor}
          strokeWidth={2}
        />
        {vertexDots}
        {labels}
      </G>
    </Svg>
  );
}
