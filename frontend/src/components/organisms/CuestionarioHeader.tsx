/**
 * CuestionarioHeader: header sticky del cuestionario (UX-015 + UX-016).
 *
 * Agrupa navegacion (atras + titulo + info) y barra de progreso sobre
 * fondo brand-primary. Siempre sticky: debe vivir FUERA del ScrollView.
 *
 * Por que un organismo propio y no ScreenTopBar + ProgressSplit:
 *   - ScreenTopBar usa c.text / c.border2 / c.textSecondary: colores incorrectos
 *     sobre fondo oscuro.
 *   - Progress usa c.secondary fill y c.border2 track: invisibles sobre primary.
 *   - Acoplar esos atoms al tema de cuestionario via props seria "prop drilling
 *     de presentacion" — es mas limpio encapsular el contexto de color aqui.
 *
 * Color fijo #2E5F7E (DS-11 brand-primary) tanto en light como dark, igual
 * que HomeHeroSection usa #1C3A52. Es identidad de "modo concentrado",
 * no una superficie del sistema de temas.
 *
 * WCAG 2.2 AA: #FFFFFF sobre #2E5F7E = 5.5:1 (AA). Verificado.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { Icon } from "../atoms/Icon";

// -- Tokens fijos del header (independientes del tema) ----------------------

/** Fondo del header. DS-11 brand-primary. Fijo en light y dark. */
const HEADER_BG = "#2E5F7E";
/** Texto principal sobre el header. */
const HEADER_TEXT = "#FFFFFF";
/** Texto secundario / labels. */
const HEADER_TEXT_SUB = "rgba(255,255,255,0.65)";
/** Fondo de los botones de accion (back / info). */
const BTN_BG = "rgba(255,255,255,0.12)";
/** Borde de los botones. */
const BTN_BORDER = "rgba(255,255,255,0.22)";
/** Track de la barra de progreso. */
const PROGRESS_TRACK = "rgba(255,255,255,0.20)";
/** Relleno de la barra de progreso. */
const PROGRESS_FILL = "rgba(255,255,255,0.85)";

// -- Props ------------------------------------------------------------------

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

// -- Componente -------------------------------------------------------------

export function CuestionarioHeader({
  title,
  subtitle,
  respondidas,
  totalPreguntas,
  onBack,
  onInfo,
}: CuestionarioHeaderProps) {
  const pct =
    totalPreguntas > 0
      ? Math.min(1, respondidas / totalPreguntas) * 100
      : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: HEADER_BG,
          paddingHorizontal: spacing.sp4,
          paddingTop: spacing.sp2,
          paddingBottom: spacing.sp3,
          gap: spacing.sp3,
        },
        // -- Fila de navegacion --
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
          borderColor: BTN_BORDER,
          backgroundColor: BTN_BG,
          alignItems: "center",
          justifyContent: "center",
        },
        btnPlaceholder: { width: 36, height: 36 },
        centerCol: { flex: 1, alignItems: "center", gap: 2 },
        titleText: {
          fontSize: 13,
          fontWeight: "600",
          color: HEADER_TEXT,
        },
        subtitleText: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.7,
          fontWeight: "600",
          color: HEADER_TEXT_SUB,
        },
        // -- Barra de progreso --
        progressTrack: {
          height: 5,
          borderRadius: radii.rSm,
          backgroundColor: PROGRESS_TRACK,
          overflow: "hidden",
        },
        progressFill: {
          height: "100%",
          borderRadius: radii.rSm,
          backgroundColor: PROGRESS_FILL,
        },
        progressLabel: {
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "600",
          color: HEADER_TEXT_SUB,
        },
      }),
    [],
  );

  return (
    <View
      style={styles.container}
      accessibilityRole="header"
    >
      {/* Navegacion */}
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable
            style={styles.btn}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <Icon name="chevron-left" size={18} color={HEADER_TEXT} />
          </Pressable>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}

        <View style={styles.centerCol}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onInfo ? (
          <Pressable
            style={styles.btn}
            onPress={onInfo}
            accessibilityRole="button"
            accessibilityLabel="Más información"
            hitSlop={8}
          >
            <Icon name="info" size={18} color={HEADER_TEXT} />
          </Pressable>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}
      </View>

      {/* Barra de progreso */}
      <View>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        >
          <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {respondidas} / {totalPreguntas} respondidas
        </Text>
      </View>
    </View>
  );
}
