/**
 * NovedadesFeed: lista vertical de NovedadItems (feed mixto del HUB).
 * Basado en design-system-lowfi.html \u00b7 Home HUB > Novedades.
 */

import React, { useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { NovedadItem, type NovedadItemProps } from "../molecules/NovedadItem";

export type NovedadFeedItem = NovedadItemProps & { key: string | number };

export interface NovedadesFeedProps {
  items: NovedadFeedItem[];
  style?: ViewStyle;
}

export function NovedadesFeed({ items, style }: NovedadesFeedProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.sp2 },
      }),
    [],
  );

  return (
    <View style={[styles.container, style]}>
      {items.map(({ key, ...props }) => (
        <NovedadItem key={key} {...(props as NovedadItemProps)} />
      ))}
    </View>
  );
}
