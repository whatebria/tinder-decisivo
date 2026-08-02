/**
 * NovedadItem: item del feed "Novedades" en el Home HUB.
 *
 * Basado en design-system-lowfi.html · Home HUB > Novedades.
 * 2 kinds:
 *   - action: acción sugerida (icon + title + sub + button "Ir")
 *   - update: avatar + title + subtitle (sin CTA)
 *
 * TASK-070: kind "noticia" eliminado tras TASK-039 (YAGNI).
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon, type IconName } from "../atoms/Icon";
import { Avatar } from "../atoms/Avatar";
import { Button } from "../atoms/Button";

export type NovedadKind = "action" | "update";

export type NovedadItemProps =
  | ActionProps
  | UpdateProps;

interface CommonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

interface ActionProps extends CommonProps {
  kind: "action";
  icon?: IconName;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

interface UpdateProps extends CommonProps {
  kind: "update";
  avatarInitials?: string;
  title: string;
  subtitle?: string;
}

export function NovedadItem(props: NovedadItemProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
        },
        row: { flexDirection: "row", gap: spacing.sp2, alignItems: "center" },
        body: { flex: 1, gap: 2 },
        title: {
          fontSize: 14,
          fontWeight: "600",
          color: c.text,
        },
        subtitle: {
          fontSize: 12,
          color: c.textSecondary,
        },
        actionCard: {
          borderColor: c.primary,
        },
      }),
    [c],
  );

  let inner: React.ReactNode;
  let cardExtra: ViewStyle | undefined;

  if (props.kind === "action") {
    cardExtra = styles.actionCard;
    inner = (
      <View style={styles.row}>
        <Icon name={props.icon ?? "bell"} size={20} color={c.primary} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {props.title}
          </Text>
          {props.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {props.subtitle}
            </Text>
          ) : null}
        </View>
        {props.onCta ? (
          <Button size="sm" onPress={props.onCta}>
            {props.ctaLabel ?? "Ir"}
          </Button>
        ) : null}
      </View>
    );
  } else {
    inner = (
      <View style={styles.row}>
        <Avatar
          size="sm"
          initials={props.avatarInitials ?? "??"}
        />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {props.title}
          </Text>
          {props.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {props.subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (!props.onPress) {
    return <View style={[styles.card, cardExtra, props.style]}>{inner}</View>;
  }
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        cardExtra,
        props.style,
        pressed ? { opacity: 0.85 } : null,
      ]}
    >
      {inner}
    </Pressable>
  );
}
