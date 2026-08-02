/**
 * EmptyState: placeholder cuando no hay datos. Icono + titulo + descripcion + CTA opcional.
 * "Nunca aburrido, siempre proactivo" — del design system.
 *
 * Movido de organisms/ a molecules/ (TASK-063): composicion simple de atoms, sin fetch propio.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Button } from "../atoms/Button";
import { Icon, type IconName } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

export interface EmptyStateProps {
  /** Icono central. Default: "search". */
  icon?: IconName;
  title: string;
  description?: string;
  /** Label del CTA. Si se omite, no se renderiza el boton. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = "search",
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignItems: "center",
          padding: spacing.sp6,
          gap: spacing.sp3,
        },
        iconBg: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: c.accent2,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.sp2,
        },
        title: {
          fontSize: 18,
          fontWeight: "600",
          color: c.text,
          textAlign: "center",
        },
        desc: {
          fontSize: 14,
          color: c.textSecondary,
          textAlign: "center",
          lineHeight: 20,
          maxWidth: 320,
        },
        cta: { marginTop: spacing.sp3, minWidth: 200 },
      }),
    [c],
  );

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconBg}>
        <Icon name={icon} color={c.primary} size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.cta}>
          <Button variant="primary" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
