/**
 * CuestionarioHeader: header sticky del cuestionario (UX-015 + UX-016).
 *
 * Agrupa navegacion (atras + titulo + info) y barra de progreso.
 * UX-064: fondo transparente (c.bg) para reducir peso visual -- la progress
 * bar es el unico elemento de color (c.primary) y el protagonista del header.
 *
 * Por que usamos c.bg y no HEADER_BG fijo:
 *   - La barra de progreso en c.primary ya identifica el "modo concentrado".
 *   - Un fondo azul oscuro fijo compite con la pregunta en lugar de contextualizarla.
 *   - Transparente/bg simplifica el contraste y soporta dark mode sin tokens duplicados.
 *
 * WCAG 2.2 AA: c.text sobre c.bg cumple en ambos temas. Verificado por DS.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

export interface CuestionarioHeaderProps {
  /** Nombre del tipo de eleccion. Ej: "Diputados 2025". */
  title: string;
  /** "N de M · base". Precomputado por el screen. */
  subtitle?: string;
  /** Preguntas respondidas hasta ahora (para la barra). */
  respondidas: number;
  /** Total de preguntas del cuestionario. */
  totalPreguntas: number;
  onBack?: () => void;
  onInfo?: () => void;
}

/**
 * TASK-058: styles a nivel de modulo.
 * Los valores de color dinamicos (tema) van inline en el JSX.
 */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sp4,
    paddingTop: spacing.sp2,
    paddingBottom: spacing.sp3,
    gap: spacing.sp2,
    borderBottomWidth: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp2,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radii.rSm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlaceholder: { width: 36, height: 36 },
  centerCol: { flex: 1, alignItems: "center", gap: 2 },
  titleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  subtitleText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "600",
  },
  // Barra de progreso -- protagonista visual (UX-064).
  progressTrack: {
    height: 5,
    borderRadius: radii.rSm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.rSm,
  },
  progressLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    marginTop: 4,
  },
});

export function CuestionarioHeader({
  title,
  subtitle,
  respondidas,
  totalPreguntas,
  onBack,
  onInfo,
}: CuestionarioHeaderProps) {
  const c = useThemeColors();
  const pct =
    totalPreguntas > 0
      ? Math.min(1, respondidas / totalPreguntas) * 100
      : 0;

  return (
    <View
      style={[styles.container, { backgroundColor: c.bg, borderBottomColor: c.border }]}
      accessibilityRole="header"
    >
      {/* Navegacion */}
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable
            style={[styles.btn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <Icon name="chevron-left" size={18} color={c.text} />
          </Pressable>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}

        <View style={styles.centerCol}>
          <Text style={[styles.titleText, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitleText, { color: c.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onInfo ? (
          <Pressable
            style={[styles.btn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={onInfo}
            accessibilityRole="button"
            accessibilityLabel="Más información"
            hitSlop={8}
          >
            <Icon name="info" size={18} color={c.text} />
          </Pressable>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}
      </View>

      {/* Barra de progreso -- protagonista visual (UX-064) */}
      <View>
        <View
          style={[styles.progressTrack, { backgroundColor: c.border }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        >
          <View style={[styles.progressFill, { width: `${pct}%` as `${number}%`, backgroundColor: c.primary }]} />
        </View>
        <Text style={[styles.progressLabel, { color: c.textSecondary }]}>
          {respondidas} / {totalPreguntas} respondidas
        </Text>
      </View>
    </View>
  );
}
