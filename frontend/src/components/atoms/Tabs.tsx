/**
 * Tabs: segmented control con contador opcional. Reactivo al tema.
 *
 * Props:
 *   - `items`      lista de tabs con value, label y count opcional.
 *   - `value`      tab activo (controlled).
 *   - `onChange`   callback al cambiar de tab.
 *   - `scrollable` (false por defecto) envuelve los tabs en un ScrollView
 *                  horizontal. Usar cuando la suma de labels puede superar
 *                  el ancho de pantalla en dispositivos pequenos (ej: 3+ tabs
 *                  con labels largos como "Descartados" / "Posturas").
 */

import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";

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
  /**
   * Si es `true`, los tabs se envuelven en un ScrollView horizontal.
   * Util cuando el numero de tabs o la longitud de los labels puede
   * superar el ancho disponible en pantallas pequenas.
   */
  scrollable?: boolean;
  /**
   * TASK-031: color del tab activo. Default: `c.primary` (azul).
   * Usar `c.secondary` (verde) para toggles de estado activo (DS-11 P8).
   */
  activeColor?: string;
}

export function Tabs<T extends string = string>({
  value,
  onChange,
  items,
  style,
  scrollable = false,
  activeColor,
}: TabsProps<T>) {
  const c = useThemeColors();
  // TASK-031: usa activeColor si se provee, fallback a c.primary.
  const resolvedActiveColor = activeColor ?? c.primary;

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
        labelActive: { color: resolvedActiveColor },
        count: {
          minWidth: 20,
          height: 20,
          paddingHorizontal: 6,
          borderRadius: radii.rFull,
          backgroundColor: c.border,
          alignItems: "center",
          justifyContent: "center",
        },
        countActive: { backgroundColor: resolvedActiveColor },
        countText: { fontSize: 11, fontWeight: "600", color: c.textSecondary },
        countTextActive: { color: c.textOnPrimary },
      }),
    [c, resolvedActiveColor]
  );

  const inner = (
    <View style={[s.container, !scrollable && style]}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            accessibilityRole="tab"
            style={[s.tab, active && s.tabActive]}
          >
            <Text style={[s.label, active && s.labelActive]}>{it.label}</Text>
            {typeof it.count === "number" ? (
              <View style={[s.count, active && s.countActive]}>
                <Text style={[s.countText, active && s.countTextActive]}>
                  {it.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style}
        contentContainerStyle={{ flexGrow: 0 }}
      >
        {inner}
      </ScrollView>
    );
  }

  return inner;
}
