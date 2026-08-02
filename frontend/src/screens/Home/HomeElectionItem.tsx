/**
 * HomeElectionItem: card vertical full-width de eleccion para el Home HUB.
 *
 * Reemplaza el layout horizontal-scroll de ElectionCard en la seccion Home.
 * Patron: mini progress ring inline (48x48) + info + CTA contextual.
 *
 * Tres estados visuales:
 *   - sin_empezar: ring vacio (gris), CTA "Empezar" (secondary)
 *   - en_curso:    ring parcial (primary), CTA "Continuar" (primary)
 *   - completa:    ring lleno (success) + check, CTA "Ver resultados" (ghost)
 *
 * Referencia: home-redesign-proposal.html seccion "ELECTIONS SECTION".
 * DS-11 Pantalla 1: progress bar usa --color-brand-secondary.
 * DS-11 Pantalla 1: completado usa --color-success.
 *
 * WCAG 2.2 AA: el Pressable de la card cumple minHeight 44px.
 * Accesibilidad: la card entera es el unico elemento interactivo.
 *   El CtaBadge es visual-only (importantForAccessibility="no") para
 *   evitar <button> anidado en web — el accessibilityLabel del Pressable
 *   ya describe la accion completa.
 *
 * Co-localizado en screens/Home/ (TASK-061): solo se usa en HomeScreen.
 */

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import {
  computeProgresoRatio,
  deriveEleccionEstado,
  type EleccionEstado,
} from "../../domain/eleccion";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Progress } from "../../components/atoms/Progress";
import { ProgressRing } from "../../components/atoms/ProgressRing";

export interface HomeElectionItemProps {
  /** Nombre legible del tipo de eleccion. */
  name: string;
  /** Subtitulo: circunscripcion o region. Opcional. */
  scope?: string;
  /** Tiempo estimado de completar el cuestionario. Ej: "~8 min". Opcional. */
  estimatedTime?: string;
  /** Respuestas ya completadas por el user. */
  respondidas: number;
  /** Total de preguntas del cuestionario. */
  totalPreguntas: number;
  /** Callbacks de accion segun estado. */
  onEmpezar?: () => void;
  onContinuar?: () => void;
  onVerResultados?: () => void;
  /** Estilo externo opcional. */
  style?: ViewStyle;
  /** Deshabilitar la interaccion (ej. eleccion cerrada). */
  disabled?: boolean;
}

/** Etiqueta y variante del CTA segun estado del cuestionario. Exportada para testing. */
export function ctaForEstado(
  estado: EleccionEstado,
  props: Pick<HomeElectionItemProps, "onEmpezar" | "onContinuar" | "onVerResultados">,
): { label: string; onPress?: () => void; variant: "primary" | "secondary" | "ghost" } {
  switch (estado) {
    case "sin_empezar":
      return { label: "Empezar", onPress: props.onEmpezar, variant: "secondary" };
    case "en_curso":
      return { label: "Continuar", onPress: props.onContinuar, variant: "primary" };
    case "completa":
      return { label: "Ver resultados", onPress: props.onVerResultados, variant: "ghost" };
  }
}

// TASK-066 + fix nested-button: StyleSheet a nivel de modulo.
// Colores dinamicos (estado, isDone) se aplican inline.
const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp3,
    borderRadius: radii.rLg,
    borderWidth: 1,
    padding: spacing.sp4,
  },
  infoCol: {
    flex: 1,
    gap: spacing.sp2,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
  },
  progressBar: {
    marginTop: spacing.sp1,
  },
  ctaWrap: {
    flexShrink: 0,
  },
  // Badge visual (no Pressable) que reemplaza al Button para evitar
  // <button> anidado en web. El Pressable padre es el unico interactivo.
  ctaBadge: {
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp4,
    borderRadius: radii.rMd,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  ctaLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

/**
 * Badge visual para el CTA de la card.
 * NO es interactivo (sin Pressable): el Pressable de la card entera lo maneja.
 * Esto evita el error de hidratacion "<button> dentro de <button>" en web.
 */
function CtaBadge({
  label,
  variant,
  disabled,
  c,
}: {
  label: string;
  variant: "primary" | "secondary" | "ghost";
  disabled: boolean;
  c: ReturnType<typeof useThemeColors>;
}) {
  const bg =
    variant === "primary"
      ? c.primary
      : variant === "secondary"
      ? "transparent"
      : "transparent";
  const border =
    variant === "ghost" ? c.border : c.primary;
  const color =
    variant === "primary" ? c.textOnPrimary : c.primary;

  return (
    <View
      style={[s.ctaBadge, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1 }]}
      // Visual-only: el Pressable padre tiene el accessibilityLabel con la accion.
      importantForAccessibility="no"
      accessibilityElementsHidden
    >
      <Text style={[s.ctaLabel, { color }]}>{label}</Text>
    </View>
  );
}

export function HomeElectionItem({
  name,
  scope,
  estimatedTime,
  respondidas,
  totalPreguntas,
  onEmpezar,
  onContinuar,
  onVerResultados,
  style,
  disabled = false,
}: HomeElectionItemProps) {
  const c = useThemeColors();

  const estado = deriveEleccionEstado({ respondidas, total: totalPreguntas });
  const ratio = computeProgresoRatio(respondidas, totalPreguntas);
  const isDone = estado === "completa";

  const cta = ctaForEstado(estado, { onEmpezar, onContinuar, onVerResultados });
  const isDisabled = disabled || !cta.onPress;

  const progresoText =
    isDone
      ? "Completado"
      : totalPreguntas > 0
      ? `${Math.min(respondidas, totalPreguntas)} de ${totalPreguntas} preguntas`
      : estimatedTime
      ? `Sin empezar · ${estimatedTime}`
      : "Sin empezar";

  const a11yLabel = `${name}. ${progresoText}. ${cta.label}`;

  // UX-055: c.secondary (verde = activo/en progreso), no c.primary (azul = accion).
  const borderColor = estado === "en_curso" ? c.secondary : c.border2;

  return (
    <Pressable
      onPress={cta.onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => [
        s.card,
        { backgroundColor: c.card, borderColor },
        style,
        pressed && !isDisabled ? { opacity: 0.85 } : undefined,
      ]}
    >
      <ProgressRing
        value={ratio}
        size="sm"
        progressColor={c.primary}
        doneColor={c.success}
      />

      <View style={s.infoCol}>
        <Text
          style={[s.name, { color: isDone ? c.textSecondary : c.text }]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <Text
          style={[
            s.meta,
            { color: isDone ? c.success : c.textSecondary, fontWeight: isDone ? "700" : "400" },
          ]}
        >
          {progresoText}
        </Text>
        {scope && !isDone ? (
          <Text style={{ fontSize: 10, color: c.textTertiary, lineHeight: 13 }}>
            {scope}
          </Text>
        ) : null}
        {!isDone && (
          <Progress value={ratio} height={3} style={s.progressBar} />
        )}
      </View>

      <View style={s.ctaWrap}>
        <CtaBadge label={cta.label} variant={cta.variant} disabled={isDisabled} c={c} />
      </View>
    </Pressable>
  );
}
