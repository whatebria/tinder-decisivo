/**
 * QuestionCard: corazon del cuestionario.
 * Header (Pregunta N de M + Badge de categoria) + Progress + titulo + RadioGroup + footer.
 *
 * Composicion pura de atoms/molecules. La logica de negocio queda en la screen.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Progress } from "../atoms/Progress";
import { RadioGroup, type RadioOption } from "../molecules/RadioGroup";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface QuestionCardProps<T extends string | number = string> {
  /** Numero de la pregunta actual (1-based). */
  questionNumber: number;
  /** Total de preguntas. */
  totalQuestions: number;
  /** Categoria (ej. "Educacion"). Se muestra como Badge. Opcional. */
  category?: string;
  /** Enunciado de la pregunta. */
  question: string;
  /** Opciones para el RadioGroup. */
  options: ReadonlyArray<RadioOption<T>>;
  /** Valor seleccionado. */
  value: T | null;
  onChange: (v: T) => void;
  onSkip?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  /** Habilita el boton "Volver" (default: true si onPrev existe). */
  canGoBack?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function QuestionCard<T extends string | number = string>({
  questionNumber,
  totalQuestions,
  category,
  question,
  options,
  value,
  onChange,
  onSkip,
  onPrev,
  onNext,
  nextDisabled,
  canGoBack = true,
  style,
}: QuestionCardProps<T>) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          padding: spacing.sp6,
          ...shadows.shSm,
          gap: spacing.sp4,
        },
        head: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        headText: { fontSize: 13, color: c.textSecondary, fontWeight: "500" },
        question: {
          fontSize: 20,
          fontWeight: "600",
          color: c.text,
          lineHeight: 28,
          marginTop: spacing.sp2,
        },
        foot: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: spacing.sp3,
        },
        footRight: { flexDirection: "row", gap: spacing.sp2, flexShrink: 1 },
      }),
    [c, shadows],
  );

  const progress = totalQuestions > 0 ? questionNumber / totalQuestions : 0;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.head}>
        <Text style={styles.headText}>
          Pregunta {questionNumber} de {totalQuestions}
        </Text>
        {category ? <Badge variant="info">{category}</Badge> : null}
      </View>
      <Progress value={progress} />
      <Text style={styles.question}>{question}</Text>
      <RadioGroup
        options={options}
        value={value}
        onChange={onChange}
        accessibilityLabel="Opciones de respuesta"
      />
      <View style={styles.foot}>
        {onSkip ? (
          <Button variant="ghost" size="sm" fullWidth={false} onPress={onSkip}>
            No se
          </Button>
        ) : (
          <View />
        )}
        <View style={styles.footRight}>
          {onPrev ? (
            <Button
              variant="secondary"
              size="sm"
              fullWidth={false}
              disabled={!canGoBack}
              onPress={onPrev}
            >
              Volver
            </Button>
          ) : null}
          {onNext ? (
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              disabled={nextDisabled}
              onPress={onNext}
            >
              Siguiente
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}
