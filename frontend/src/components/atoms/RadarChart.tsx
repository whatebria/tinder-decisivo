/**
 * RadarChart: poligono SVG que muestra el score por eje tematico.
 *
 * Usa react-native-svg (funciona en iOS, Android y web).
 *
 * CONTRATO DE LA PROP `size`:
 *   `size` es el footprint total del SVG en px — incluyendo el espacio para
 *   labels cuando showLabels=true. El llamador siempre sabe exactamente
 *   cuanto espacio ocupa el componente: width = height = size.
 *   El radio del poligono se calcula internamente para caber dentro de ese
 *   espacio dejando margen para los labels.
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

/** Tamano de fuente visual de los labels en px. */
const RADAR_LABEL_FONT_PX         = 11;
/** Longitud maxima de un label antes de truncar. */
const RADAR_LABEL_MAX_CHARS       = 14;
/**
 * Estimado del ancho de un caracter a RADAR_LABEL_FONT_PX.
 * 0.55 es un ratio conservador para la mayoria de fuentes sans-serif.
 * Si cambia RADAR_LABEL_FONT_PX, este estimado escala automaticamente.
 */
const RADAR_CHAR_WIDTH_RATIO      = 0.55;
/**
 * Mitad del ancho del label mas largo posible (RADAR_LABEL_MAX_CHARS chars).
 * Se deriva de las constantes anteriores — no es un numero magico standalone.
 * Cambia automaticamente si se ajusta el font size o el max chars.
 */
const RADAR_LABEL_HALF_WIDTH_PX   =
  Math.ceil((RADAR_LABEL_MAX_CHARS * RADAR_LABEL_FONT_PX * RADAR_CHAR_WIDTH_RATIO) / 2);
/** Distancia en px del borde del poligono al centro del label. */
const RADAR_LABEL_OFFSET_PX       = 48;
/**
 * Padding total reservado en cada lado del SVG para los labels cuando
 * showLabels=true. El radio del poligono = (size/2) - RADAR_LABEL_PAD.
 * Derivado: no agregar numeros aqui, agregar en las constantes de arriba.
 */
const RADAR_LABEL_PAD             = RADAR_LABEL_OFFSET_PX + RADAR_LABEL_HALF_WIDTH_PX;
/** Opacidad del fill del poligono. */
const RADAR_FILL_OPACITY          = 0.25;
/**
 * Cuando showLabels=false el poligono puede ocupar mas del area disponible
 * (no necesita dejar margen para texto). Este ratio extra se aplica sobre
 * el radio base calculado sin labels.
 */
const RADAR_NO_LABEL_RADIUS_BONUS = 1.1;

/**
 * UX-061: resuelve el label de un eje con normalizacion defensiva.
 * 1. Busca en EJE_LABELS (fuente de verdad curada).
 * 2. Fallback: sentence-case del raw key.
 * 3. Trunca si supera RADAR_LABEL_MAX_CHARS.
 */
function resolveEjeLabel(eje: string): string {
  const curated = EJE_LABELS[eje];
  if (curated) return curated;
  const normalized =
    eje.charAt(0).toUpperCase() +
    eje.slice(1).toLowerCase().replace(/_/g, " ");
  if (normalized.length > RADAR_LABEL_MAX_CHARS) {
    return normalized.slice(0, RADAR_LABEL_MAX_CHARS - 1) + "\u2026";
  }
  return normalized;
}

export interface RadarChartProps {
  /**
   * Footprint total del SVG en px (width = height = size).
   * El llamador siempre sabe exactamente cuanto espacio ocupa el componente.
   * El radio del poligono se calcula internamente.
   */
  data: Record<string, number>;
  size?: number;
  color?: string;
  showLabels?: boolean;
  levels?: number;
  /**
   * UX-038: alternativa textual para lectores de pantalla (WCAG 1.1.1 Nivel A).
   * Default: descripcion automatica generada desde `data`.
   * null o "" -> decorativo, lector de pantalla ignora el elemento.
   */
  accessibilityLabel?: string | null;
}

interface Point { x: number; y: number; }

function buildA11yLabel(data: Record<string, number>): string {
  const ejes = Object.entries(data)
    .map(([k, v]) => `${resolveEjeLabel(k)}: ${Math.round(v)}%`)
    .join(", ");
  return `Grafico de afinidad por eje tematico. ${ejes}.`;
}

function polarToCartesian(cx: number, cy: number, r: number, a: number): Point {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function RadarChart({
  data,
  size = 280,
  color,
  showLabels = true,
  levels = 4,
  accessibilityLabel: accessibilityLabelProp,
}: RadarChartProps) {
  const c = useThemeColors();
  const strokeColor = color ?? c.primary;
  const ejes = useMemo(() => Object.keys(data), [data]);

  if (ejes.length < 3) return null;

  // Centro del SVG — siempre el centro geometrico de `size`.
  const cx = size / 2;
  const cy = size / 2;

  // Radio del poligono: se calcula desde el centro descontando el margen
  // necesario para los labels. Si no hay labels, el poligono puede crecer.
  const baseRadius = cx - (showLabels ? RADAR_LABEL_PAD : 0);
  const radius = showLabels ? baseRadius : baseRadius * RADAR_NO_LABEL_RADIUS_BONUS;

  const step = (2 * Math.PI) / Math.max(ejes.length, 1);
  const startAngle = -Math.PI / 2; // 12 en punto

  // Grid: poligonos concentricos (look angular, no circulos).
  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const pts = ejes
      .map((_, j) => {
        const p = polarToCartesian(cx, cy, r, startAngle + j * step);
        return `${p.x},${p.y}`;
      })
      .join(" ");
    return <Polygon key={i} points={pts} stroke={c.border} strokeWidth={1} fill="none" />;
  });

  // Lineas radiales.
  const gridLines = ejes.map((_, i) => {
    const angle = startAngle + i * step;
    const p = polarToCartesian(cx, cy, radius, angle);
    return (
      <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={c.border} strokeWidth={1} />
    );
  });

  // Poligono de datos.
  const dataPoints: Point[] = ejes.map((eje, i) => {
    const angle = startAngle + i * step;
    const value = Math.max(0, Math.min(100, data[eje] ?? 0));
    return polarToCartesian(cx, cy, (value / 100) * radius, angle);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Vertices.
  const vertexDots = dataPoints.map((p, i) => (
    <Circle key={i} cx={p.x} cy={p.y} r={3} fill={strokeColor} />
  ));

  // Labels — posicionados en el area de padding exterior al poligono.
  const labels = showLabels
    ? ejes.map((eje, i) => {
        const angle = startAngle + i * step;
        const labelPos = polarToCartesian(cx, cy, radius + RADAR_LABEL_OFFSET_PX, angle);
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
      width={size}
      height={size}
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabelProp != null ? accessibilityLabelProp : buildA11yLabel(data)
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
