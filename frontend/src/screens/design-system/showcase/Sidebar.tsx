/**
 * Sidebar: navegacion sticky con anchors por seccion.
 *
 * En web: scroll a la seccion via `window.location.hash`.
 * En native: no hay anchors, se muestra el listado pero el tap solo hace scroll
 * local si esta implementado (por ahora solo web).
 */

import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { useThemeColors } from "../../../theme/useTheme";
import type { CatalogEntry } from "./types";

interface SidebarProps {
  entries: CatalogEntry[];
  activeName?: string;
  onNavigate?: (entry: CatalogEntry) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const CATEGORIES: { key: CatalogEntry["category"]; label: string }[] = [
  { key: "tokens", label: "Tokens" },
  { key: "atoms", label: "Atomos" },
  { key: "molecules", label: "Moleculas" },
  { key: "organisms", label: "Organismos" },
  { key: "templates", label: "Templates" },
];

export function Sidebar({ entries, activeName, onNavigate, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const c = useThemeColors();

  const grouped = useMemo(() => {
    const map: Record<string, CatalogEntry[]> = {};
    for (const cat of CATEGORIES) map[cat.key] = [];
    for (const e of entries) map[e.category].push(e);
    return map;
  }, [entries]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: 200,
          backgroundColor: c.card,
          borderRightWidth: 1,
          borderRightColor: c.border,
          paddingVertical: spacing.sp3,
        },
        wrapCollapsed: {
          width: 40,
          backgroundColor: c.card,
          borderRightWidth: 1,
          borderRightColor: c.border,
          paddingVertical: spacing.sp3,
          alignItems: "center",
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.sp3,
          marginBottom: spacing.sp3,
          gap: spacing.sp2,
        },
        title: {
          fontSize: 15,
          fontWeight: "700",
          color: c.text,
          flex: 1,
        },
        toggleBtn: {
          width: 28,
          height: 28,
          borderRadius: radii.rSm,
          alignItems: "center",
          justifyContent: "center",
        },
        toggleBtnHover: {
          backgroundColor: c.accent2,
        },
        toggleChar: {
          fontSize: 16,
          color: c.textSecondary,
          fontWeight: "700",
          lineHeight: 18,
        },
        group: {
          fontSize: 10,
          fontWeight: "700",
          color: c.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          paddingHorizontal: spacing.sp3,
          marginTop: spacing.sp3,
          marginBottom: spacing.sp2,
        },
        link: {
          paddingVertical: 6,
          paddingHorizontal: spacing.sp3,
          borderLeftWidth: 3,
          borderLeftColor: "transparent",
        },
        linkActive: {
          backgroundColor: c.accent2,
          borderLeftColor: c.primary,
        },
        linkText: {
          fontSize: 13,
          color: c.textSecondary,
        },
        linkTextActive: {
          color: c.text,
          fontWeight: "600",
        },
        emptyGroup: {
          paddingHorizontal: spacing.sp3,
          fontSize: 12,
          fontStyle: "italic",
          color: c.textTertiary,
        },
      }),
    [c],
  );

  const handleNavigate = (entry: CatalogEntry) => {
    onNavigate?.(entry);
    if (Platform.OS === "web") {
      const anchorId = `ds-${entry.category}-${entry.name.toLowerCase()}`;
      const el = typeof document !== "undefined" ? document.getElementById(anchorId) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (collapsed) {
    return (
      <View style={styles.wrapCollapsed}>
        <Pressable
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityLabel="Expandir sidebar"
          style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnHover]}
        >
          <Text style={styles.toggleChar}>{"\u203A"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: spacing.sp7 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Design System</Text>
        {onToggleCollapsed ? (
          <Pressable
            onPress={onToggleCollapsed}
            accessibilityRole="button"
            accessibilityLabel="Colapsar sidebar"
            style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnHover]}
          >
            <Text style={styles.toggleChar}>{"\u2039"}</Text>
          </Pressable>
        ) : null}
      </View>
      {CATEGORIES.map((cat) => {
        const items = grouped[cat.key];
        return (
          <View key={cat.key}>
            <Text style={styles.group}>
              {cat.label} ({items.length})
            </Text>
            {items.length === 0 ? (
              <Text style={styles.emptyGroup}>vacio</Text>
            ) : (
              items.map((entry) => {
                const isActive = entry.name === activeName;
                return (
                  <Pressable
                    key={entry.name}
                    onPress={() => handleNavigate(entry)}
                    accessibilityRole="link"
                    style={[styles.link, isActive && styles.linkActive]}
                  >
                    <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                      {entry.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
