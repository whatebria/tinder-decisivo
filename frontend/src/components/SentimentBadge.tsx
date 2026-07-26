/**
 * SentimentBadge: indicador de tono de una noticia.
 * Positivo / Neutral / Negativo — con puntito de color al inicio (a11y: no depende solo del color).
 */

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";

export type Sentiment = "positive" | "neutral" | "negative";

export interface SentimentBadgeProps {
  sentiment: Sentiment;
  label?: string;
  style?: ViewStyle;
}

const CONFIG: Record<Sentiment, { bg: string; fg: string; dot: string; label: string }> = {
  positive: {
    bg: colors.success100,
    fg: colors.success700,
    dot: colors.success500,
    label: "Positivo",
  },
  neutral: {
    bg: colors.gray100,
    fg: colors.gray700,
    dot: colors.gray500,
    label: "Neutral",
  },
  negative: {
    bg: colors.danger100,
    fg: colors.danger700,
    dot: colors.danger500,
    label: "Negativo",
  },
};

export function SentimentBadge({ sentiment, label, style }: SentimentBadgeProps) {
  const c = CONFIG[sentiment];
  return (
    <View style={[styles.container, { backgroundColor: c.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.fg }]}>{label ?? c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
