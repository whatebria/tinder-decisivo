/**
 * CollapsibleFilterSection: seccion colapsable para bottom sheets de filtros.
 *
 * Header con titulo + summary del estado + chevron. Border inferior para
 * separar de la siguiente. Se usa dentro de un BottomSheet con multiples
 * secciones (fecha, partido, region, etc).
 *
 * A11y: expone accessibilityState.expanded y accessibilityLabel con el
 * summary para que screen readers sepan que valor tiene el filtro sin
 * necesidad de expandirlo.
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";
import { Icon } from "../atoms/Icon";

export interface CollapsibleFilterSectionProps {
  title: string;
  /** Resumen del estado del filtro (ej: "Todos", "2 seleccionados", "7 dias"). */
  summary: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleFilterSection({
  title,
  summary,
  defaultExpanded = false,
  children,
}: CollapsibleFilterSectionProps) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.wrap, { borderBottomColor: c.border }]}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${summary}`}
        style={styles.header}
      >
        <View style={styles.titles}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <Text style={[styles.summary, { color: c.textSecondary }]}>
            {summary}
          </Text>
        </View>
        <Icon
          name={expanded ? "chevron-left" : "chevron-right"}
          size={16}
          color={c.textSecondary}
        />
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sp3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp3,
  },
  titles: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sp2,
    flexShrink: 1,
  },
  title: { ...typography.body, fontWeight: "600" },
  summary: { ...typography.small },
  body: { paddingTop: spacing.sp2 },
});
