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

import { useThemeColors } from "../theme/useTheme";

export interface RadarChartProps {
  data: Record<string, number>;
  size?: number;
  color?: string;
  showLabels?: boolean;
  levels?: number;
}

interface Point {
  x: number;
  y: number;
}

const LABEL_MAP: Record<string, string> = {
  ECONOMIA: "Economia",
  SOCIEDAD: "Sociedad",
  AMBIENTE: "Ambiente",
  SEGURIDAD: "Seguridad",
  DDHH: "DDHH",
  INTERNACIONAL: "Internac.",
  INSTITUCIONAL: "Institucional",
  OTRO: "Otro",
};

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
}: RadarChartProps) {
  const c = useThemeColors();
  const strokeColor = color ?? c.primary;
  const ejes = useMemo(() => Object.keys(data), [data]);
  const cx = size / 2;
  const cy = size / 2;
  // Deja margen para labels
  const radius = showLabels ? size * 0.35 : size * 0.45;
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
        const labelPos = polarToCartesian(cx, cy, radius + 18, angle);
        const label = LABEL_MAP[eje] ?? eje;
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

  return (
    <Svg width={size} height={size}>
      <G>
        {gridCircles}
        {gridLines}
        <Polygon
          points={polygonPoints}
          fill={strokeColor}
          fillOpacity={0.25}
          stroke={strokeColor}
          strokeWidth={2}
        />
        {vertexDots}
        {labels}
      </G>
    </Svg>
  );
}
