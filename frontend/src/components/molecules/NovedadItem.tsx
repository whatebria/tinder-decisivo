/**
 * NovedadItem: item del feed "Novedades" en el Home HUB.
 *
 * Basado en design-system-lowfi.html \u00b7 Home HUB > Novedades.
 * 3 kinds:
 *   - action: acci\u00f3n sugerida (icon + title + sub + button "Ir")
 *   - noticia: thumb + title + snippet + chip categoria + when
 *   - update: avatar + title + subtitle (sin CTA)
 */

import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { Icon, type IconName } from "../atoms/Icon";
import { Avatar } from "../atoms/Avatar";
import { Chip } from "../atoms/Chip";
import { Button } from "../atoms/Button";

export type NovedadKind = "action" | "noticia" | "update";

export type NovedadItemProps =
  | ActionProps
  | NoticiaProps
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

interface NoticiaProps extends CommonProps {
  kind: "noticia";
  imageUrl?: string;
  title: string;
  snippet?: string;
  category?: string;
  when?: string;
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
        thumb: {
          width: 60,
          height: 60,
          borderRadius: radii.rSm,
          backgroundColor: c.bg,
        },
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
        metaRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          marginTop: 4,
        },
        when: { fontSize: 10, color: c.textSecondary },
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
  } else if (props.kind === "noticia") {
    inner = (
      <View style={styles.row}>
        {props.imageUrl ? (
          <Image source={{ uri: props.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={styles.thumb} />
        )}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {props.title}
          </Text>
          {props.snippet ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {props.snippet}
            </Text>
          ) : null}
          {(props.category || props.when) ? (
            <View style={styles.metaRow}>
              {props.category ? <Chip>{props.category}</Chip> : null}
              {props.when ? <Text style={styles.when}>{props.when}</Text> : null}
            </View>
          ) : null}
        </View>
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
