/**
 * DesignSystemToolbar: header con busqueda + toggle light/dark + boton volver.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeStore } from "../../../store/theme";
import { useThemeColors, useIsDark } from "../../../theme/useTheme";

interface DesignSystemToolbarProps {
  totalCount: number;
  filteredCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  onBack: () => void;
}

export function DesignSystemToolbar({
  totalCount,
  filteredCount,
  search,
  onSearchChange,
  onBack,
}: DesignSystemToolbarProps) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const setMode = useThemeStore((s) => s.setMode);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
          paddingVertical: spacing.sp3,
          paddingHorizontal: spacing.sp4,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          backgroundColor: c.card,
        },
        backBtn: {
          paddingVertical: 6,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rSm,
          borderWidth: 1,
          borderColor: c.border,
        },
        backText: {
          fontSize: 13,
          color: c.text,
          fontWeight: "500",
        },
        searchWrap: {
          flex: 1,
          maxWidth: 400,
          height: 36,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rSm,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.bg,
          justifyContent: "center",
        },
        input: {
          fontSize: 14,
          color: c.text,
          outlineStyle: "none",
        } as unknown as import("react-native").TextStyle,
        count: {
          fontSize: 12,
          color: c.textSecondary,
        },
        spacer: { flex: 1 },
        themeBtn: {
          paddingVertical: 6,
          paddingHorizontal: spacing.sp3,
          borderRadius: radii.rSm,
          backgroundColor: c.accent2,
        },
        themeBtnText: {
          fontSize: 13,
          color: c.text,
          fontWeight: "500",
        },
      }),
    [c],
  );

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.backBtn} onPress={onBack} accessibilityRole="button">
        <Text style={styles.backText}>{"\u2190 Volver"}</Text>
      </Pressable>
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Buscar componente..."
          placeholderTextColor={c.textTertiary}
          style={styles.input}
          accessibilityLabel="Buscar componente"
        />
      </View>
      <Text style={styles.count}>
        {search ? `${filteredCount} de ${totalCount}` : `${totalCount} componentes`}
      </Text>
      <View style={styles.spacer} />
      <Pressable
        onPress={() => setMode(isDark ? "light" : "dark")}
        accessibilityRole="button"
        accessibilityLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        style={styles.themeBtn}
      >
        <Text style={styles.themeBtnText}>{isDark ? "\u2600 Claro" : "\u263D Oscuro"}</Text>
      </Pressable>
    </View>
  );
}
