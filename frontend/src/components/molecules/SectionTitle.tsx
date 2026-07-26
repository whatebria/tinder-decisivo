/**
 * SectionTitle: header de secci\u00f3n del Home. H2/H3 + link "Ver todos \u203a" opcional.
 *
 * Ref: design-exploration/design-system.html \u00b7 .home-section-title
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface SectionTitleProps {
  title: string;
  /** Tama\u00f1o del t\u00edtulo. Default h2 (18px). */
  level?: "h2" | "h3";
  /** Label del link a la derecha. Si se omite, no se renderiza. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({ title, level = "h2", actionLabel, onAction, style }: SectionTitleProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: spacing.sp3,
        },
        title: {
          fontSize: level === "h2" ? 18 : 16,
          fontWeight: "600",
          color: c.text,
        },
        link: {
          fontSize: 14,
          color: c.primary,
          fontWeight: "600",
        },
        linkPressed: { opacity: 0.7 },
      }),
    [c, level],
  );

  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => (pressed ? styles.linkPressed : null)}
        >
          <Text style={styles.link}>{`${actionLabel} ›`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
