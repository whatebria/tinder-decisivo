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
 *
 * Co-localizado en screens/Onboarding/ (TASK-062): solo se usa en OnboardingScreen.
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "../../components/atoms/Badge";
import { Progress } from "../../components/atoms/Progress";
import { RadioGroup, type RadioOption } from "../../components/molecules/RadioGroup";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

type LikertValue = 1 | 2 | 3 | 4 | 5;

/** 3 opciones representativas para que la card quepa sin scroll (UX-011). */
const DEMO_OPCIONES: ReadonlyArray<RadioOption<LikertValue>> = [
  { value: 1, label: "De acuerdo" },
  { value: 3, label: "Neutral" },
  { value: 5, label: "En desacuerdo" },
];

const DEMO_PREGUNTA =
  "El Estado deberia financiar educacion superior gratuita para todos?";

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
          padding: spacing.sp3,
          gap: spacing.sp2,
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
      accessibilityRole="none"
      accessibilityLabel="Ejemplo de pregunta del cuestionario"
    >
      <View style={styles.head}>
        <Text style={styles.headText}>Pregunta 1 de 12</Text>
        <Badge variant="info">Educacion</Badge>
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
