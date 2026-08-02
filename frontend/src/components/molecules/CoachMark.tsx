/**
 * CoachMark: overlay contextual educativo.
 *
 * Se muestra la primera vez que el usuario entra a una pantalla clave para
 * explicar los elementos más importantes. NO es un modal bloqueante: aparece
 * abajo en la pantalla (bottom sheet ligero) para dejar visible el área a la
 * que se refiere.
 *
 * Es un componente puramente presentacional — la lógica de estado vive en
 * `useCoachMarkTour`. Esto permite testear ambos aisladamente y reutilizar
 * el visual con otras fuentes de datos si algún día hace falta.
 *
 * Accesibilidad: `accessibilityRole="alertdialog"` para que screen readers lo
 * anuncien, hit slop generoso en los botones y contraste WCAG AA verificado.
 */

import React, { useEffect, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { CoachStep } from "../../content/coachMarks";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";
import { Button } from "../atoms/Button";

export interface CoachMarkProps {
  /** Si el overlay debe renderizarse. */
  visible: boolean;
  /** Contenido del paso actual. Ignorado si `visible` es false. */
  step: CoachStep | null;
  /** Índice del paso actual (0-based). */
  currentIndex: number;
  /** Cantidad total de pasos del tour. */
  total: number;
  /** Avanza al siguiente paso o completa el tour. */
  onNext: () => void;
  /** Vuelve al paso anterior. Solo se muestra si `currentIndex > 0`. */
  onBack: () => void;
  /** Descarta y marca el tour como visto. Solo se muestra si `total > 1`. */
  onSkip: () => void;
}

const HIGHLIGHT_LABEL = "Fíjate en";
const STEP_LABEL_SEPARATOR = "de";

// TASK-066: valores estaticos a nivel de modulo.
// Colores dinamicos (c.card, c.accent2, c.primary, c.text, shadows.shLg)
// se aplican inline en el JSX para evitar StyleSheet.create en cada render.
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: spacing.sp4,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radii.rLg,
    padding: spacing.sp5,
    marginBottom: spacing.sp6,
    gap: spacing.sp3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 20,
  },
  stepChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
    borderRadius: radii.rFull,
  },
  stepChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  highlightBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sp2,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp2,
    borderRadius: radii.rSm,
    borderLeftWidth: 3,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sp3,
    marginTop: spacing.sp2,
  },
  actionSlot: {
    flex: 1,
  },
});

export function CoachMark({
  visible,
  step,
  currentIndex,
  total,
  onNext,
  onBack,
  onSkip,
}: CoachMarkProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  // UX-001: deshabilitar el backdrop durante el fade-in (~500ms) para evitar
  // que el overlay capture clicks del usuario antes de que sea consciente de
  // que aparecio. Cuando visible pasa a false, se resetea para el proximo show.
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    if (!visible) {
      setInteractive(false);
      return;
    }
    const t = setTimeout(() => setInteractive(true), 500);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible || !step) return null;

  const showBack = currentIndex > 0;
  const showSkip = total > 1;
  const isLast = currentIndex === total - 1;
  const nextLabel = isLast ? "Entendido" : "Siguiente";
  const stepLabel = `${currentIndex + 1} ${STEP_LABEL_SEPARATOR} ${total}`;

  return (
    <RNModal
      visible
      transparent
      animationType="fade"
      onRequestClose={onSkip}
      accessibilityViewIsModal
    >
      {/* Backdrop clickeable = skip (sin bloquear la pantalla completa). */}
      {/* disabled=true los primeros 500ms (fade-in) para no interceptar clicks */}
      <Pressable
        style={s.backdrop}
        onPress={showSkip ? onSkip : onNext}
        accessibilityLabel="Cerrar coach mark"
        disabled={!interactive}
      >
        {/* Card centrada abajo — Pressable interno frena la propagación. */}
        <Pressable
          onPress={() => {}}
          disabled={!interactive}
          style={[s.card, { backgroundColor: c.card }, shadows.shLg]}
          accessibilityRole="alert"
          accessibilityLabel={`${step.title}. ${step.description}`}
        >
          <View style={s.header}>
            {total > 1 ? (
              <View style={[s.stepChip, { backgroundColor: c.accent2 }]}>
                <Text style={[s.stepChipText, { color: c.primary }]}>{stepLabel}</Text>
              </View>
            ) : (
              <View />
            )}
          </View>

          <Text style={[s.title, { color: c.text }]}>{step.title}</Text>
          <Text style={[s.description, { color: c.textSecondary }]}>{step.description}</Text>

          <View
            style={[
              s.highlightBadge,
              { backgroundColor: c.accent2, borderLeftColor: c.primary },
            ]}
          >
            <Text style={[s.highlightLabel, { color: c.primary }]}>{HIGHLIGHT_LABEL}</Text>
            <Text style={[s.highlightText, { color: c.text }]}>{step.highlight}</Text>
          </View>

          <View style={s.actions}>
            {showBack ? (
              <View style={s.actionSlot}>
                <Button variant="ghost" size="md" onPress={onBack}>
                  Atrás
                </Button>
              </View>
            ) : showSkip ? (
              <View style={s.actionSlot}>
                <Button variant="ghost" size="md" onPress={onSkip}>
                  Cerrar
                </Button>
              </View>
            ) : null}
            <View style={s.actionSlot}>
              <Button variant="primary" size="md" onPress={onNext}>
                {nextLabel}
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
