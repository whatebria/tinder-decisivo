/**
 * NovedadesFeed: lista vertical de NovedadItems (feed mixto del HUB).
 * Basado en design-system-lowfi.html - Home HUB > Novedades.
 *
 * Movido de organisms/ a molecules/ (TASK-063): thin wrapper sin logica propia.
 */

import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { NovedadItem, type NovedadItemProps } from "../molecules/NovedadItem";

export type NovedadFeedItem = NovedadItemProps & { key: string | number };

export interface NovedadesFeedProps {
  items: NovedadFeedItem[];
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  container: { gap: spacing.sp2 },
});

export function NovedadesFeed({ items, style }: NovedadesFeedProps) {
  return (
    <View style={[styles.container, style]}>
      {items.map(({ key, ...props }) => (
        <NovedadItem key={key} {...(props as NovedadItemProps)} />
      ))}
    </View>
  );
}
