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
 * WCAG 2.2 AA: todos los CTAs tienen minHeight 44px.
 * Accesibilidad: toda la card es Pressable con accessibilityLabel compuesto.
 */

import React, { useMemo } from "react";
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
import { Button } from "../atoms/Button";
import { Progress } from "../atoms/Progress";
import { ProgressRing } from "../atoms/ProgressRing";

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

  // Label del progreso
  const progresoText =
    isDone
      ? "Completado"
      : totalPreguntas > 0
      ? `${Math.min(respondidas, totalPreguntas)} de ${totalPreguntas} preguntas`
      : estimatedTime
      ? `Sin empezar${estimatedTime ? ` \u00b7 ${estimatedTime}` : ""}`
      : "Sin empezar";

  const a11yLabel = `${name}. ${progresoText}. ${cta.label}`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: estado === "en_curso" ? c.primary : c.border2,
          padding: spacing.sp4,
        },
        infoCol: {
          flex: 1,
          gap: spacing.sp2,
        },
        name: {
          fontSize: 13,
          fontWeight: "700",
          color: isDone ? c.textSecondary : c.text,
          lineHeight: 17,
        },
        meta: {
          fontSize: 11,
          color: isDone ? c.success : c.textSecondary,
          fontWeight: isDone ? "700" : "400",
          lineHeight: 14,
        },
        progressBar: {
          marginTop: spacing.sp1,
        },
        cta: {
          flexShrink: 0,
        },
      }),
    [c, estado, isDone],
  );

  const cardContent = (
    <View style={[styles.card, style]}>
      <ProgressRing
        value={ratio}
        size="sm"
        progressColor={c.primary}
        doneColor={c.success}
      />

      <View style={styles.infoCol}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.meta}>{progresoText}</Text>
        {scope && !isDone ? (
          <Text
            style={{ fontSize: 10, color: c.textTertiary, lineHeight: 13 }}
          >
            {scope}
          </Text>
        ) : null}
        {!isDone && (
          <Progress
            value={ratio}
            height={3}
            style={styles.progressBar}
          />
        )}
      </View>

      <View style={styles.cta}>
        <Button
          variant={cta.variant}
          size="sm"
          fullWidth={false}
          onPress={cta.onPress}
          disabled={disabled || !cta.onPress}
          accessibilityLabel={cta.label}
        >
          {cta.label}
        </Button>
      </View>
    </View>
  );

  // Toda la card es pressable para UX de touch mas generosa
  return (
    <Pressable
      onPress={cta.onPress}
      disabled={disabled || !cta.onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) =>
        pressed && !disabled ? { opacity: 0.85 } : undefined
      }
    >
      {cardContent}
    </Pressable>
  );
}
