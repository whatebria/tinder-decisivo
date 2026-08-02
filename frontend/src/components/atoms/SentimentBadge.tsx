/**
 * SentimentBadge: indicador de tono de una noticia. Reactivo al tema.
 * Puntito de color + label (a11y: no depende solo del color).
 */

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { useIsDark, useThemeColors } from "../../theme/useTheme";

export type Sentiment = "positive" | "neutral" | "negative";

export interface SentimentBadgeProps {
  sentiment: Sentiment;
  label?: string;
  style?: ViewStyle;
}

const DEFAULT_LABEL: Record<Sentiment, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

// TASK-066: valores estaticos a nivel de modulo. Colores dinamicos inline.
const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.rFull,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

export function SentimentBadge({ sentiment, label, style }: SentimentBadgeProps) {
  const c = useThemeColors();
  const isDark = useIsDark();

  const CONFIG = isDark
    ? {
        positive: { bg: c.success800, fg: c.success100, dot: c.success300 },
        neutral: { bg: c.gray800, fg: c.gray100, dot: c.gray400 },
        negative: { bg: c.danger800, fg: c.danger100, dot: c.danger300 },
      }
    : ({
        positive: { bg: c.success100, fg: c.success700, dot: c.success500 },
        neutral: { bg: c.gray100, fg: c.gray700, dot: c.gray500 },
        negative: { bg: c.danger100, fg: c.danger700, dot: c.danger500 },
      } as const);
  const cfg = CONFIG[sentiment];

  return (
    <View style={[s.container, { backgroundColor: cfg.bg }, style]}>
      <View style={[s.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[s.text, { color: cfg.fg }]}>{label ?? DEFAULT_LABEL[sentiment]}</Text>
    </View>
  );
}
