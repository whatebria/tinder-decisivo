/**
 * Tabs: segmented control con contador opcional.
 *
 * Uso:
 *   const [tab, setTab] = useState("favoritos");
 *   <Tabs
 *     value={tab}
 *     onChange={setTab}
 *     items={[
 *       { value: "favoritos", label: "Favoritos", count: 3 },
 *       { value: "descartados", label: "Descartados", count: 5 },
 *     ]}
 *   />
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

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
  return (
    <View style={[styles.container, style]}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
            {typeof it.count === "number" ? (
              <View style={[styles.count, active && styles.countActive]}>
                <Text style={[styles.countText, active && styles.countTextActive]}>
                  {it.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: colors.border2,
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
  tabActive: { backgroundColor: colors.card },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  labelActive: { color: colors.primary },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radii.rFull,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  countActive: { backgroundColor: colors.primary },
  countText: { fontSize: 11, fontWeight: "600", color: colors.textSecondary },
  countTextActive: { color: "#FFFFFF" },
});
