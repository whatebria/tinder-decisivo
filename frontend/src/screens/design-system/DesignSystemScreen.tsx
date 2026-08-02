/**
 * DesignSystemScreen: visualizador interno de componentes.
 *
 * Layout:
 *   [ Toolbar (busqueda + toggle tema + volver) ]
 *   [ Sidebar categorias ] [ Main scroll con ComponentShowcase por cada entry ]
 *
 * Solo se registra en la navigation si __DEV__ === true (ver AppNavigator).
 * En viewport chico el sidebar se convierte en select colapsable arriba.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { catalog } from "./catalog";
import { ComponentShowcase } from "./showcase/ComponentShowcase";
import { DesignSystemToolbar } from "./showcase/DesignSystemToolbar";
import { Sidebar } from "./showcase/Sidebar";
import type { RootStackScreenProps } from "../../navigation/types";

const SIDEBAR_BREAKPOINT = 900;
const COLLAPSED_STORAGE_KEY = "ds-sidebar-collapsed";

function readCollapsedFromStorage(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsedToStorage(collapsed: boolean) {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // ignore quota / private mode errors
  }
}

type Props = RootStackScreenProps<"DesignSystem">;

export function DesignSystemScreen({ navigation }: Props) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(readCollapsedFromStorage);

  useEffect(() => {
    writeCollapsedToStorage(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const showSidebar = width >= SIDEBAR_BREAKPOINT && Platform.OS === "web";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {
      tokens: [],
      atoms: [],
      molecules: [],
      organisms: [],
      templates: [],
      patterns: [],
    };
    for (const e of filtered) {
      if (map[e.category]) map[e.category].push(e);
    }
    return map;
  }, [filtered]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: c.bg },
        body: { flex: 1, flexDirection: "row" },
        main: { flex: 1 },
        mainContent: {
          padding: spacing.sp5,
          maxWidth: 1100,
          alignSelf: "center",
          width: "100%",
        },
        emptyState: {
          padding: spacing.sp7,
          alignItems: "center",
        },
        emptyStateTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: c.text,
          marginBottom: spacing.sp2,
        },
        emptyStateBody: {
          fontSize: 14,
          color: c.textSecondary,
          textAlign: "center",
          maxWidth: 400,
        },
        categoryHeader: {
          fontSize: 12,
          fontWeight: "700",
          color: c.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginTop: spacing.sp5,
          marginBottom: spacing.sp3,
        },
        firstCategoryHeader: {
          marginTop: 0,
        },
      }),
    [c],
  );

  const CATEGORY_LABELS: Record<string, string> = {
    tokens: "Tokens",
    atoms: "Atomos",
    molecules: "Moleculas",
    organisms: "Organismos",
    templates: "Templates",
    patterns: "Patrones UX",
  };
  const CATEGORY_ORDER = ["tokens", "atoms", "molecules", "organisms", "templates", "patterns"] as const;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <DesignSystemToolbar
        totalCount={catalog.length}
        filteredCount={filtered.length}
        search={search}
        onSearchChange={setSearch}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.body}>
        {showSidebar ? (
          <Sidebar
            entries={filtered}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          />
        ) : null}
        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
          {catalog.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Catalogo vacio</Text>
              <Text style={styles.emptyStateBody}>
                Agrega entries en src/screens/design-system/catalog/&#123;atoms|molecules|organisms|templates&#125;.tsx
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Sin resultados</Text>
              <Text style={styles.emptyStateBody}>
                Nada coincide con "{search}". Prueba con otro termino.
              </Text>
            </View>
          ) : (
            CATEGORY_ORDER.map((cat, catIdx) => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              return (
                <View key={cat}>
                  <Text
                    style={[
                      styles.categoryHeader,
                      catIdx === 0 && styles.firstCategoryHeader,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]} ({items.length})
                  </Text>
                  {items.map((entry) => (
                    <ComponentShowcase key={`${entry.category}-${entry.name}`} entry={entry} />
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
