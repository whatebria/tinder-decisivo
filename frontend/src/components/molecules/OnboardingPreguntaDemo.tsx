/**
 * OnboardingPreguntaDemo: demo del cuestionario para slide 3 del welcome tour
 * ("Responde preguntas simples").
 *
 * Muestra 1 pregunta de ejemplo con escala Likert de 5 opciones, reutilizando
 * `RadioGroup`. El estado de seleccion es local y no persiste.
 * Zero API calls.
 *
 * La pregunta y las opciones son inventadas para ilustrar el formato.
 * El titulo de la card incluye "Ejemplo" para que el usuario no confunda
 * esto con una pregunta real.
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "../atoms/Badge";
import { Progress } from "../atoms/Progress";
import { RadioGroup, type RadioOption } from "./RadioGroup";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

type LikertValue = 1 | 2 | 3 | 4 | 5;

const DEMO_OPCIONES: ReadonlyArray<RadioOption<LikertValue>> = [
  { value: 1, label: "Muy de acuerdo" },
  { value: 2, label: "De acuerdo" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "En desacuerdo" },
  { value: 5, label: "Muy en desacuerdo" },
];

const DEMO_PREGUNTA =
  "¿El Estado debería financiar educación superior gratuita para todos?";

export function OnboardingPreguntaDemo() {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [selected, setSelected] = useState<LikertValue | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rLg,
          padding: spacing.sp4,
          gap: spacing.sp3,
          width: "100%",
          maxWidth: 360,
          ...shadows.shSm,
        },
        head: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        headText: {
          fontSize: 13,
          color: c.textSecondary,
          fontWeight: "500",
        },
        question: {
          fontSize: 17,
          fontWeight: "600",
          color: c.text,
          lineHeight: 24,
        },
      }),
    [c, shadows],
  );

  return (
    <View
      style={styles.card}
      accessibilityRole="group"
      accessibilityLabel="Ejemplo de pregunta del cuestionario"
    >
      <View style={styles.head}>
        <Text style={styles.headText}>Pregunta 1 de 12</Text>
        <Badge variant="info">Educación</Badge>
      </View>

      {/* Progress al ~8% para ilustrar inicio del cuestionario */}
      <Progress value={0.08} />

      <Text style={styles.question}>{DEMO_PREGUNTA}</Text>

      <RadioGroup
        options={DEMO_OPCIONES}
        value={selected}
        onChange={setSelected}
        accessibilityLabel="Opciones de respuesta de ejemplo"
      />
    </View>
  );
}
