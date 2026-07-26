/**
 * SwipeCard: card estilo Tinder para explorar candidatos.
 * Avatar grande + nombre + partido + quote + chips de temas + 4 action buttons.
 *
 * Composicion de atoms/molecules. Las acciones se disparan via callbacks.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ActionButton, useActionColors } from "../atoms/ActionButton";
import { Avatar } from "../atoms/Avatar";
import { Chip } from "../atoms/Chip";
import { Icon } from "../atoms/Icon";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export interface SwipeCardProps {
  name: string;
  partido: string;
  /** Iniciales del candidato (2-3 caracteres). */
  initials: string;
  quote?: string;
  /** Chips de temas/tags. */
  topics?: ReadonlyArray<string>;
  onUndo?: () => void;
  onDislike?: () => void;
  onLike?: () => void;
  onInfo?: () => void;
  /** Deshabilita undo cuando no hay historial. */
  canUndo?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SwipeCard({
  name,
  partido,
  initials,
  quote,
  topics,
  onUndo,
  onDislike,
  onLike,
  onInfo,
  canUndo = true,
  style,
}: SwipeCardProps) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const actionColors = useActionColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rXl,
          padding: spacing.sp6,
          alignItems: "center",
          ...shadows.shMd,
        },
        name: {
          fontSize: 24,
          fontWeight: "600",
          color: c.text,
          marginTop: spacing.sp3,
          textAlign: "center",
        },
        partido: {
          fontSize: 14,
          color: c.textSecondary,
          marginTop: spacing.sp1,
          textAlign: "center",
        },
        quote: {
          fontSize: 16,
          fontStyle: "italic",
          color: c.text,
          textAlign: "center",
          marginTop: spacing.sp5,
          lineHeight: 24,
        },
        topics: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: spacing.sp2,
          marginTop: spacing.sp5,
        },
        actions: {
          flexDirection: "row",
          justifyContent: "center",
          gap: spacing.sp5,
          marginTop: spacing.sp6,
        },
      }),
    [c, shadows],
  );

  return (
    <View style={[styles.card, style]} accessibilityRole="none">
      <Avatar initials={initials} size="lg" backgroundColor={c.accent2} color={c.primary} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.partido}>{partido}</Text>
      {quote ? <Text style={styles.quote}>&ldquo;{quote}&rdquo;</Text> : null}
      {topics && topics.length > 0 ? (
        <View style={styles.topics}>
          {topics.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        {onUndo ? (
          <ActionButton variant="undo" onPress={onUndo} disabled={!canUndo} accessibilityLabel="Deshacer">
            <Icon name="undo" color={actionColors.undo} size={22} />
          </ActionButton>
        ) : null}
        {onDislike ? (
          <ActionButton variant="dislike" onPress={onDislike} accessibilityLabel="Descartar">
            <Icon name="close" color={actionColors.dislike} size={28} />
          </ActionButton>
        ) : null}
        {onLike ? (
          <ActionButton variant="like" onPress={onLike} accessibilityLabel="Agregar a favoritos">
            <Icon name="heart" color={actionColors.like} size={28} />
          </ActionButton>
        ) : null}
        {onInfo ? (
          <ActionButton variant="info" onPress={onInfo} accessibilityLabel="Mas informacion">
            <Icon name="info" color={actionColors.info} size={22} />
          </ActionButton>
        ) : null}
      </View>
    </View>
  );
}
