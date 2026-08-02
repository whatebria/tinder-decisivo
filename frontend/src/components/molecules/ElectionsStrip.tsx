/**
 * ElectionsStrip: scroll horizontal de ElectionCards + card "+ Activar" al final.
 * Basado en design-system-lowfi.html - Home HUB > Tus elecciones.
 *
 * Movido de organisms/ a molecules/ (TASK-063): thin wrapper sin logica propia.
 */

import React, { useMemo } from "react";
import { ScrollView, StyleSheet, type ViewStyle } from "react-native";

import { spacing } from "../../theme/spacing";
import { ElectionCard, type ElectionCardProps } from "../atoms/ElectionCard";
import { ElectionCardAdd } from "../atoms/ElectionCardAdd";

export interface ElectionsStripProps {
  elections: Array<ElectionCardProps & { key: string | number }>;
  /** Cards dashed "+ Activar {tipo}" al final del strip. */
  addOptions?: Array<{ key: string | number; label: string; onPress?: () => void }>;
  style?: ViewStyle;
}

export function ElectionsStrip({ elections, addOptions = [], style }: ElectionsStripProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: "row", gap: spacing.sp2, paddingBottom: 4 },
      }),
    [],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={style}
    >
      {elections.map(({ key, ...props }) => (
        <ElectionCard key={key} {...props} />
      ))}
      {addOptions.map((opt) => (
        <ElectionCardAdd key={opt.key} label={opt.label} onPress={opt.onPress} />
      ))}
    </ScrollView>
  );
}
