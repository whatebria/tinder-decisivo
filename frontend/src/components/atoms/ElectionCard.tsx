/**
 * ElectionCard: card de una eleccion activa en el Home HUB.
 *
 * Basado en design-system-lowfi.html \u00b7 Home HUB.
 * 3 variantes:
 *   - active: eleccion actualmente seleccionada (border-2 primary)
 *   - secondary: otra eleccion activa (border-1 gris)
 *   - pending: sin cuestionario respondido a\u00fan (progress 0%)
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Progress } from "./Progress";
import { Chip } from "./Chip";

export type ElectionCardVariant = "active" | "secondary" | "pending";

export interface ElectionCardProps {
  name: string;
  scope?: string;
  /** Ej: "42d", "180d" \u2014 corto para el chip. */
  daysLabel: string;
  /** 0\u2013100. `null` \u2192 sin cuestionario respondido. */
  matchPercent?: number | null;
  /** 0\u2013100 (progreso del cuestionario). */
  progressPercent: number;
  /** Texto alternativo cuando no hay matchPercent (ej: "6 preguntas extras pendientes"). */
  pendingLabel?: string;
  variant?: ElectionCardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const CARD_WIDTH = 180;

export function ElectionCard({
  name,
  scope,
  daysLabel,
  matchPercent,
  progressPercent,
  pendingLabel,
  variant = "secondary",
  onPress,
  style,
  accessibilityLabel,
}: ElectionCardProps) {
  const c = useThemeColors();
  const isActive = variant === "active";
  const isPending = variant === "pending" || matchPercent == null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          padding: spacing.sp3,
          borderRadius: radii.rLg,
          gap: spacing.sp2,
          backgroundColor: c.card,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? c.primary : c.border2,
          flexShrink: 0,
        },
        headRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing.sp2,
        },
        titleCol: { flex: 1, gap: 2 },
        name: {
          fontSize: 14,
          fontWeight: "600",
          color: c.text,
        },
        scope: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: c.textSecondary,
          fontWeight: "600",
        },
        matchRow: {
          flexDirection: "row",
          alignItems: "baseline",
          gap: spacing.sp1,
        },
        matchN: {
          fontSize: 22,
          fontWeight: "700",
          color: isActive ? c.primary : c.text,
        },
        matchPct: {
          fontSize: 12,
          color: c.textSecondary,
        },
        pendingText: {
          fontSize: 11,
          color: c.textSecondary,
        },
      }),
    [c, isActive],
  );

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.headRow}>
        <View style={styles.titleCol}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {scope ? <Text style={styles.scope}>{scope}</Text> : null}
        </View>
        <Chip>{daysLabel}</Chip>
      </View>

      {isPending ? (
        <Text style={styles.pendingText}>{pendingLabel ?? "Sin cuestionario"}</Text>
      ) : (
        <View style={styles.matchRow}>
          <Text style={styles.matchN}>{Math.round(matchPercent ?? 0)}</Text>
          <Text style={styles.matchPct}>%</Text>
        </View>
      )}

      <Progress value={Math.max(0, Math.min(100, progressPercent)) / 100} />
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Eleccion ${name}`}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      {content}
    </Pressable>
  );
}
