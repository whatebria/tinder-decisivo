/**
 * PosturaItem: compara tu respuesta con la del candidato en una pregunta.
 * Border-left semantico: verde = match total, amarillo = parcial, rojo = no coincide.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export type PosturaMatch = "match" | "partial" | "no-match";

export interface PosturaItemProps {
  /** Pregunta original. */
  question: string;
  /** Respuesta del usuario. */
  userAnswer: string;
  /** Respuesta del candidato. */
  candidateAnswer: string;
  /** Nombre corto del candidato para la columna. Default: "Candidato". */
  candidateName?: string;
  match: PosturaMatch;
  /** Texto custom debajo. Default segun match. */
  matchLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LABEL: Record<PosturaMatch, string> = {
  match: "Coinciden completamente",
  partial: "Coinciden parcialmente",
  "no-match": "No coinciden",
};

export function PosturaItem({
  question,
  userAnswer,
  candidateAnswer,
  candidateName = "Candidato",
  match,
  matchLabel,
  style,
}: PosturaItemProps) {
  const c = useThemeColors();

  const styles = useMemo(() => {
    const palette: Record<PosturaMatch, string> = {
      match: c.success,
      partial: c.warning,
      "no-match": c.danger,
    };
    return StyleSheet.create({
      card: {
        backgroundColor: c.card,
        borderRadius: radii.rMd,
        padding: spacing.sp4,
        borderLeftWidth: 4,
        borderLeftColor: palette[match],
        gap: spacing.sp3,
      },
      question: { fontSize: 15, fontWeight: "500", color: c.text, lineHeight: 22 },
      votes: { flexDirection: "row", gap: spacing.sp4 },
      voteCell: { flex: 1 },
      lbl: { fontSize: 11, color: c.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 },
      val: { fontSize: 14, fontWeight: "600", color: c.text, marginTop: spacing.sp1 },
      indicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sp2,
        marginTop: spacing.sp2,
      },
      dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: palette[match],
      },
      indicatorText: { fontSize: 13, color: palette[match], fontWeight: "600" },
    });
  }, [c, match]);

  return (
    <View style={[styles.card, style]} accessibilityRole="none">
      <Text style={styles.question}>{question}</Text>
      <View style={styles.votes}>
        <View style={styles.voteCell}>
          <Text style={styles.lbl}>Tu voto</Text>
          <Text style={styles.val}>{userAnswer}</Text>
        </View>
        <View style={styles.voteCell}>
          <Text style={styles.lbl}>{candidateName}</Text>
          <Text style={styles.val}>{candidateAnswer}</Text>
        </View>
      </View>
      <View style={styles.indicator}>
        <View style={styles.dot} />
        <Text style={styles.indicatorText}>{matchLabel ?? DEFAULT_LABEL[match]}</Text>
      </View>
    </View>
  );
}
