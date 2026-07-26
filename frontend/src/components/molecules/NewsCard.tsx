/**
 * NewsCard: item de noticia con thumb (tinted segun sentiment), headline
 * (max 2 lineas), snippet (max 2 lineas) y meta (fuente + fecha + sentiment).
 *
 * Sin gradient (RN no lo soporta nativo). Solid tint por sentiment.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { SentimentBadge, type Sentiment } from "../atoms/SentimentBadge";
import { BookmarkButton } from "../atoms/BookmarkButton";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface NewsCardProps {
  headline: string;
  snippet: string;
  source: string;
  /** Timestamp ya formateado ("hace 3 horas", "ayer", "hace 2 dias"). */
  when: string;
  sentiment: Sentiment;
  onPress?: () => void;
  /** Si esta definido, se muestra el chip de bookmark. */
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  bookmarkLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NewsCard({
  headline,
  snippet,
  source,
  when,
  sentiment,
  onPress,
  bookmarked,
  onToggleBookmark,
  bookmarkLoading = false,
  style,
}: NewsCardProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();

  const styles = useMemo(() => {
    const thumbBg: Record<Sentiment, string> = {
      positive: c.accent2,
      neutral: c.border2,
      negative: c.card,
    };
    return StyleSheet.create({
      card: {
        flexDirection: "row",
        gap: spacing.sp4,
        backgroundColor: c.card,
        borderRadius: radii.rLg,
        padding: spacing.sp4,
        ...shadows.shSm,
      },
      thumb: {
        width: 72,
        height: 72,
        borderRadius: radii.rMd,
        backgroundColor: thumbBg[sentiment],
        alignItems: "center",
        justifyContent: "center",
      },
      thumbGlyph: {
        width: 32,
        height: 24,
        borderWidth: 2,
        borderColor: c.textSecondary,
        borderRadius: 2,
      },
      body: { flex: 1, gap: spacing.sp2 },
      headline: { fontSize: 15, fontWeight: "600", color: c.text, lineHeight: 20 },
      snippet: { fontSize: 13, color: c.textSecondary, lineHeight: 18 },
      meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sp2 },
      source: { fontSize: 12, fontWeight: "600", color: c.text },
      dot: { fontSize: 12, color: c.textTertiary },
      when: { fontSize: 12, color: c.textSecondary },
      pressed: { opacity: 0.85 },
    });
  }, [c, shadows, sentiment]);

  const content = (
    <>
      <View style={styles.thumb}>
        <View style={styles.thumbGlyph} />
      </View>
      <View style={styles.body}>
        <Text style={styles.headline} numberOfLines={2}>
          {headline}
        </Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {snippet}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.source}>{source}</Text>
          <Text style={styles.dot}>{"·"}</Text>
          <Text style={styles.when}>{when}</Text>
          <Text style={styles.dot}>{"·"}</Text>
          <SentimentBadge sentiment={sentiment} />
        </View>
        {onToggleBookmark != null && bookmarked != null ? (
          <BookmarkButton
            saved={bookmarked}
            onPress={onToggleBookmark}
            loading={bookmarkLoading}
            accessibilityLabel={
              bookmarked
                ? `Quitar de guardadas: ${headline}`
                : `Guardar noticia: ${headline}`
            }
            style={{ marginTop: spacing.sp2 }}
          />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={`Noticia: ${headline}. Fuente ${source}.`}
        style={(s) => [styles.card, s.pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{content}</View>;
}
