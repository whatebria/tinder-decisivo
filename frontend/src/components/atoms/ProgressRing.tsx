/**
 * ProgressRing: anillo de progreso SVG circular.
 *
 * Usado en HomeHeroSection (hero grande) y HomeElectionItem (mini inline).
 *
 * Variantes:
 *   - size="hero"  72x72 con label de porcentaje centrado
 *   - size="sm"    48x48 con label o icono de check
 *
 * Colores según estado:
 *   - pending:   stroke c.border2 (sin progreso)
 *   - progress:  stroke c.primary (#2E5F7E)
 *   - done:      stroke c.success (#6B9B7A) + icono check
 *
 * Token: --color-brand-primary, --color-brand-secondary, --color-success
 *
 * Nota: No usa Animated. El anillo es estático (sin transición CSS en RN SVG).
 * Si se necesita animación de fill, upgradar a react-native-reanimated + SVG.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useThemeColors } from "../../theme/useTheme";

export type ProgressRingSize = "hero" | "sm";
export type ProgressRingState = "pending" | "progress" | "done";

export interface ProgressRingProps {
  /** Valor entre 0 y 1. */
  value: number;
  size?: ProgressRingSize;
  /** Calculado automáticamente si no se pasa. */
  state?: ProgressRingState;
  /** Label central (ej. "68%"). Solo visible en size="hero". */
  label?: string;
  /** Sub-label debajo del label (ej. "listo"). Solo en size="hero". */
  sublabel?: string;
  /** Si true, fuerza el icono check (estado done). */
  showCheck?: boolean;
  /** Color del stroke cuando state="done". Default: c.success. */
  doneColor?: string;
  /** Color del stroke cuando state="progress". Default: c.primary. */
  progressColor?: string;
}

const CONFIGS = {
  hero: { dim: 72, r: 30, strokeWidth: 5.5 },
  sm:   { dim: 48, r: 19, strokeWidth: 4.5 },
} as const;

function deriveState(value: number, explicit?: ProgressRingState): ProgressRingState {
  if (explicit) return explicit;
  if (value >= 1) return "done";
  if (value > 0) return "progress";
  return "pending";
}

export function ProgressRing({
  value,
  size = "sm",
  state: stateProp,
  label,
  sublabel,
  showCheck,
  doneColor,
  progressColor,
}: ProgressRingProps) {
  const c = useThemeColors();
  const { dim, r, strokeWidth } = CONFIGS[size];
  const state = deriveState(Math.min(1, Math.max(0, value)), stateProp);

  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)));

  const strokeActive = state === "done"
    ? (doneColor ?? c.success)
    : (progressColor ?? c.primary);

  const isDone = state === "done";
  const isHero = size === "hero";

  return (
    <View style={{ width: dim, height: dim, position: "relative", flexShrink: 0 }}>
      <Svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Track */}
        <Circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke={c.border2}
          fill="none"
          rotation="-90"
          origin={`${dim / 2}, ${dim / 2}`}
        />
        {/* Fill */}
        {value > 0 && (
          <Circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            strokeWidth={strokeWidth}
            stroke={strokeActive}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            rotation="-90"
            origin={`${dim / 2}, ${dim / 2}`}
          />
        )}
      </Svg>

      {/* Centro — label o check */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
        ]}
        pointerEvents="none"
      >
        {isDone || showCheck ? (
          // Checkmark U+2713 — texto plano, no emoji
          <Text
            style={{ fontSize: isHero ? 18 : 13, color: strokeActive, fontWeight: "800" }}
            accessible={false}
          >
            {"\u2713"}
          </Text>
        ) : isHero && label ? (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{ fontSize: 15, fontWeight: "900", color: c.textOnPrimary, lineHeight: 18 }}
            >
              {label}
            </Text>
            {sublabel ? (
              <Text
                style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 1 }}
              >
                {sublabel}
              </Text>
            ) : null}
          </View>
        ) : !isDone && !isHero ? (
          <Text
            style={{ fontSize: 10, fontWeight: "900", color: c.textSecondary }}
          >
            {Math.round(value * 100)}%
          </Text>
        ) : null}
      </View>
    </View>
  );
}
