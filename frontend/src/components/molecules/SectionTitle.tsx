/**
 * SectionTitle: header de sección del Home. H2/H3 + link "Ver todos ›" opcional.
 *
 * Ref: design-exploration/design-system.html · .home-section-title
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

export interface SectionTitleProps {
  title: string;
  /** Tamaño del título. Default h2 (18px). */
  level?: "h2" | "h3";
  /** Label del link a la derecha. Si se omite, no se renderiza. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: spacing.sp3,
  },
  // fontSize computed inline based on `level` prop
  title: { fontWeight: "600" },
  link: { fontSize: 14, fontWeight: "600" },
  linkPressed: { opacity: 0.7 },
});

export function SectionTitle({ title, level = "h2", actionLabel, onAction, style }: SectionTitleProps) {
  const c = useThemeColors();
  // TASK-064: usar tokens de tipografia en lugar de fontSize hardcodeado.
  const titleFontSize = level === "h2" ? typography.h2.fontSize : typography.h3.fontSize;

  return (
    <View style={[styles.row, style]}>
      <Text
        style={[styles.title, { fontSize: titleFontSize, color: c.text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => (pressed ? styles.linkPressed : null)}
        >
          <Text style={[styles.link, { color: c.primary }]}>{`${actionLabel} ›`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
