/**
 * SentimentBadge: indicador de tono de una noticia. Reactivo al tema.
 * Puntito de color + label (a11y: no depende solo del color).
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../theme/radii";
import { useThemeColors } from "../theme/useTheme";

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

export function SentimentBadge({ sentiment, label, style }: SentimentBadgeProps) {
  const c = useThemeColors();

  const s = useMemo(() => {
    const CONFIG = {
      positive: { bg: c.success100, fg: c.success700, dot: c.success500 },
      neutral: { bg: c.gray100, fg: c.gray700, dot: c.gray500 },
      negative: { bg: c.danger100, fg: c.danger700, dot: c.danger500 },
    } as const;
    const cfg = CONFIG[sentiment];
    return StyleSheet.create({
      container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: radii.rFull,
        alignSelf: "flex-start",
        backgroundColor: cfg.bg,
      },
      dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot },
      text: {
        color: cfg.fg,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.4,
      },
    });
  }, [c, sentiment]);

  return (
    <View style={[s.container, style]}>
      <View style={s.dot} />
      <Text style={s.text}>{label ?? DEFAULT_LABEL[sentiment]}</Text>
    </View>
  );
}
