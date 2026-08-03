/**
 * RadarChart: polígono SVG que muestra el score por eje temático.
 *
 * Sirve para visualizar el breakdown de match de un candidato.
 * Usa react-native-svg (funciona en iOS, Android y web).
 *
 * Props:
 * - data: Record<ejeName, percentage 0-100>
 * - size: pixels del cuadrado contenedor
 * - color: color del polígono (default primary)
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

// -- Constantes de layout (TASK-034) -----------------------------------------
/**
 * Ratio radio/size cuando los labels estan visibles.
 * Valor mas alto que antes (0.35 -> 0.42) porque el viewBox con padding
 * reduce el area visual; subimos el ratio para compensar y mantener el
 * poligono a un tamano razonable.
 */
const RADAR_RADIUS_RATIO_LABELED   = 0.42;
/** Ratio radio/size sin labels (ocupa mas espacio disponible). */
const RADAR_RADIUS_RATIO_UNLABELED = 0.45;
/** Distancia en coordenadas del label al borde exterior del radar. */
const RADAR_LABEL_OFFSET_PX        = 14;
/** Opacidad del fill del poligono (suave, no solido). */
const RADAR_FILL_OPACITY           = 0.25;
/** Longitud maxima de un label antes de truncar (cubre "Institucional" = 13 chars). */
const RADAR_LABEL_MAX_CHARS        = 14;
/**
 * UX-061 (fix definitivo): padding extra en el sistema de coordenadas del
 * viewBox de la SVG. Permite que los labels que caen cerca del borde no
 * queden cortados por el viewport de la SVG, sin cambiar el tamano visual
 * del componente (width/height siguen siendo `size`).
 */
const RADAR_LABEL_PAD              = 40;

/**
 * UX-061: resuelve el label de un eje con normalizacion defensiva.
 *
 * 1. Busca en EJE_LABELS (preferencia, tiene labels curados).
 * 2. Si no encuentra, aplica sentence-case al raw key para evitar MAYUSCULAS.
 * 3. Si el resultado supera RADAR_LABEL_MAX_CHARS, trunca con "..." para que
 *    no salga del viewport SVG.
 */
function resolveEjeLabel(eje: string): string {
  const curated = EJE_LABELS[eje];
  if (curated) return curated;
  // Fallback: sentence-case del raw key (ej. "MEDIO_AMBIENTE" -> "Medio ambiente")
  const normalized = eje.charAt(0).toUpperCase() + eje.slice(1).toLowerCase().replace(/_/g, " ");
  if (normalized.length > RADAR_LABEL_MAX_CHARS) {
    return normalized.slice(0, RADAR_LABEL_MAX_CHARS - 1) + "\u2026"; // ellipsis
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
 *
 * Ejemplo: "Grafico de afinidad por eje tematico. Economia: 72%, Sociedad: 85%."
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
  const cx = size / 2;
  const cy = size / 2;
  // Deja margen para labels
  const radius = showLabels ? size * RADAR_RADIUS_RATIO_LABELED : size * RADAR_RADIUS_RATIO_UNLABELED;
  const step = (2 * Math.PI) / Math.max(ejes.length, 1);
  // Angulo inicial: arriba (12 en punto)
  const startAngle = -Math.PI / 2;

  if (ejes.length < 3) {
    return null; // radar no tiene sentido con menos de 3 ejes
  }

  // Grid: circulos concentricos + lineas radiales
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    return <Circle key={i} cx={cx} cy={cy} r={r} stroke={c.border} strokeWidth={1} fill="none" />;
  });

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

  // Polígono de datos
  const dataPoints: Point[] = ejes.map((eje, i) => {
    const angle = startAngle + i * step;
    const value = Math.max(0, Math.min(100, data[eje] ?? 0));
    const r = (value / 100) * radius;
    return polarToCartesian(cx, cy, r, angle);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Vertices marcados
  const vertexDots = dataPoints.map((p, i) => (
    <Circle key={i} cx={p.x} cy={p.y} r={3} fill={strokeColor} />
  ));

  // Labels de los ejes
  const labels = showLabels
    ? ejes.map((eje, i) => {
        const angle = startAngle + i * step;
        const labelPos = polarToCartesian(cx, cy, radius + RADAR_LABEL_OFFSET_PX, angle);
        const label = resolveEjeLabel(eje);
        return (
          <SvgText
            key={i}
            x={labelPos.x}
            y={labelPos.y}
            fontSize={11}
            fill={c.textSecondary}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        );
      })
    : null;

  // UX-061: el viewBox se extiende RADAR_LABEL_PAD unidades extra en cada
  // lado cuando hay labels. El SVG sigue renderizandose a `size x size` px,
  // pero el sistema de coordenadas interno es mas amplio, por lo que los
  // labels cercanos al borde no quedan cortados por el viewport.
  const svgPad = showLabels ? RADAR_LABEL_PAD : 0;
  const vbSize = size + svgPad * 2;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`${-svgPad} ${-svgPad} ${vbSize} ${vbSize}`}
      accessibilityRole="image"
      accessibilityLabel={
        // null o "" -> decorativo, no anuncia nada al lector de pantalla.
        // undefined -> genera la descripcion automatica a partir de los datos.
        accessibilityLabelProp != null
          ? accessibilityLabelProp
          : buildA11yLabel(data)
      }
    >
      <G>
        {gridCircles}
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
