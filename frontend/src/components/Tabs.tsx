/**
 * Tabs: segmented control con contador opcional. Reactivo al tema.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { useThemeColors } from "../theme/useTheme";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
  style?: ViewStyle;
}

export function Tabs<T extends string = string>({
  value,
  onChange,
  items,
  style,
}: TabsProps<T>) {
  const c = useThemeColors();

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          padding: 4,
          backgroundColor: c.border2,
          borderRadius: radii.rMd,
          gap: 2,
          alignSelf: "flex-start",
        },
        tab: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          paddingVertical: spacing.sp2,
          paddingHorizontal: spacing.sp4,
          borderRadius: radii.rSm,
        },
        tabActive: { backgroundColor: c.card },
        label: { fontSize: 14, fontWeight: "500", color: c.textSecondary },
        labelActive: { color: c.primary },
        count: {
          minWidth: 20,
          height: 20,
          paddingHorizontal: 6,
          borderRadius: radii.rFull,
          backgroundColor: c.border,
          alignItems: "center",
          justifyContent: "center",
        },
        countActive: { backgroundColor: c.primary },
        countText: { fontSize: 11, fontWeight: "600", color: c.textSecondary },
        countTextActive: { color: c.textOnPrimary },
      }),
    [c]
  );

  return (
    <View style={[s.container, style]}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[s.tab, active && s.tabActive]}
          >
            <Text style={[s.label, active && s.labelActive]}>{it.label}</Text>
            {typeof it.count === "number" ? (
              <View style={[s.count, active && s.countActive]}>
                <Text style={[s.countText, active && s.countTextActive]}>{it.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
