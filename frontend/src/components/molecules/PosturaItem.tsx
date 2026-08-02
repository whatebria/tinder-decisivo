/**
 * PosturaItem: compara tu respuesta con la del candidato en una pregunta.
 *
 * Layout: pregunta arriba + match badge pill destacado + 2 columnas comparativas
 * ("Tu voto" | "Candidato") con divider central. Border-left semantico segun match.
 *
 * Reactivo al tema (light/dark) via useThemeColors + useIsDark.
 */

import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useIsDark, useThemeColors } from "../../theme/useTheme";
import { BookmarkButton } from "../atoms/BookmarkButton";

export type PosturaMatch = "match" | "partial" | "no-match";

export interface PosturaItemProps {
  question: string;
  userAnswer: string;
  candidateAnswer: string;
  candidateName?: string;
  match: PosturaMatch;
  matchLabel?: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  bookmarkLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LABEL: Record<PosturaMatch, string> = {
  match: "Coinciden",
  partial: "Coinciden parcialmente",
  "no-match": "No coinciden",
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.rMd,
    padding: spacing.sp4,
    borderLeftWidth: 4,
    gap: spacing.sp4,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sp3 },
  question: { flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sp3,
    paddingVertical: 4,
    borderRadius: radii.rFull,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  columns: { flexDirection: "row", alignItems: "stretch", gap: spacing.sp3 },
  col: { flex: 1, gap: 4 },
  colLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colValue: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  divider: { width: 1, alignSelf: "stretch" },
  bookmarkRow: { marginTop: spacing.sp1 },
});

type MatchColors = { bar: string; badgeBg: string; badgeFg: string };

export function PosturaItem({
  question,
  userAnswer,
  candidateAnswer,
  candidateName = "Candidato",
  match,
  matchLabel,
  bookmarked,
  onToggleBookmark,
  bookmarkLoading = false,
  style,
}: PosturaItemProps) {
  const c = useThemeColors();
  const isDark = useIsDark();

  // Paleta por tipo de match. En dark invertimos (bg oscuro + fg claro).
  const darkPalette: Record<PosturaMatch, MatchColors> = {
    match:      { bar: c.success500, badgeBg: c.success800, badgeFg: c.success100 },
    partial:    { bar: c.warning500, badgeBg: c.warning800, badgeFg: c.warning100 },
    "no-match": { bar: c.danger500,  badgeBg: c.danger800,  badgeFg: c.danger100  },
  };
  const lightPalette: Record<PosturaMatch, MatchColors> = {
    match:      { bar: c.success,  badgeBg: c.success100, badgeFg: c.success700 },
    partial:    { bar: c.warning,  badgeBg: c.warning100, badgeFg: c.warning700 },
    "no-match": { bar: c.danger,   badgeBg: c.danger100,  badgeFg: c.danger700  },
  };
  const p = (isDark ? darkPalette : lightPalette)[match];

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderLeftColor: p.bar }, style]}
      accessibilityRole="none"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.question, { color: c.text }]}>{question}</Text>
        <View style={[styles.badge, { backgroundColor: p.badgeBg }]} accessibilityRole="text">
          <Text style={[styles.badgeText, { color: p.badgeFg }]}>
            {matchLabel ?? DEFAULT_LABEL[match]}
          </Text>
        </View>
      </View>

      <View style={styles.columns}>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textTertiary }]}>Tu voto</Text>
          <Text style={[styles.colValue, { color: c.text }]}>{userAnswer}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textTertiary }]}>{candidateName}</Text>
          <Text style={[styles.colValue, { color: c.text }]}>{candidateAnswer}</Text>
        </View>
      </View>

      {onToggleBookmark != null && bookmarked != null ? (
        <View style={styles.bookmarkRow}>
          <BookmarkButton
            saved={bookmarked}
            onPress={onToggleBookmark}
            loading={bookmarkLoading}
            accessibilityLabel={
              bookmarked
                ? `Quitar postura guardada: ${question}`
                : `Guardar postura: ${question}`
            }
          />
        </View>
      ) : null}
    </View>
  );
}
