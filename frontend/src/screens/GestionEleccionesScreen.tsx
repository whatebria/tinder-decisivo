/**
 * Gesti\u00f3n de elecciones: cat\u00e1logo con toggle activar/desactivar por tipo.
 *
 * Basado en design-system-lowfi.html \u00b7 Gesti\u00f3n de elecciones.
 * El backend a\u00fan no expone "activo por usuario"; persistimos preferencia
 * client-side v\u00eda `useElectionsPrefsStore` (secureStorage).
 */

import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTiposEleccion } from "../api/hooks";
import { BottomNav, Icon, Spinner, Toggle } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  partitionTipos,
  useElectionsPrefsStore,
} from "../store/electionsPrefs";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { useThemeColors } from "../theme/useTheme";

function daysUntil(dateIso?: string | null): string {
  if (!dateIso) return "sin fecha";
  const days = Math.max(
    0,
    Math.ceil((new Date(dateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  return `${days} días`;
}

export function GestionEleccionesScreen({
  navigation,
}: RootStackScreenProps<"GestionElecciones">) {
  const c = useThemeColors();
  const { data: tipos = [], isLoading } = useTiposEleccion();
  const activeIds = useElectionsPrefsStore((s) => s.activeIds);
  const toggle = useElectionsPrefsStore((s) => s.toggle);

  const allIds = useMemo(
    () => tipos.map((t) => t.id).filter((id): id is number => id != null),
    [tipos],
  );

  const { activas, disponibles } = useMemo(
    () => partitionTipos(tipos, activeIds),
    [tipos, activeIds],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: c.bg },
        outer: { flex: 1, backgroundColor: c.bg },
        content: { padding: spacing.sp4, gap: spacing.sp4, paddingBottom: spacing.sp8 },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.sp2,
        },
        topBarTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: c.text,
        },
        heroCol: { gap: 4 },
        heroTitle: { fontSize: 20, fontWeight: "700", color: c.text },
        heroSubtitle: { fontSize: 13, color: c.textSecondary },
        section: { gap: spacing.sp2 },
        sectionLabel: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: c.textSecondary,
          fontWeight: "600",
        },
        card: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.sp3,
        },
        cardCol: { flex: 1, gap: 2 },
        cardName: { fontSize: 14, fontWeight: "600", color: c.text },
        cardMeta: {
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: c.textSecondary,
          fontWeight: "600",
        },
        emptyText: {
          fontSize: 12,
          color: c.textSecondary,
          fontStyle: "italic",
        },
        infoBox: {
          flexDirection: "row",
          gap: spacing.sp2,
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
          borderColor: c.border2,
          backgroundColor: c.card,
          alignItems: "flex-start",
        },
        infoTextCol: { flex: 1, gap: 2 },
        infoTitle: { fontSize: 12, fontWeight: "600", color: c.text },
        infoBody: { fontSize: 11, color: c.textSecondary },
        backBtn: {
          width: 36,
          height: 36,
          borderRadius: radii.rSm,
          borderWidth: 1,
          borderColor: c.border2,
          alignItems: "center",
          justifyContent: "center",
        },
        loadingBox: { paddingTop: spacing.sp8, alignItems: "center" },
      }),
    [c],
  );

  if (isLoading) {
    return (
      <View style={styles.outer}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.loadingBox}>
            <Spinner size="large" />
          </View>
        </ScrollView>
        <BottomNav active="home" navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* TopBar breadcrumb */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-left" size={18} color={c.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>Tus elecciones</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero */}
      <View style={styles.heroCol}>
        <Text style={styles.heroTitle}>Catálogo</Text>
        <Text style={styles.heroSubtitle}>
          Activa las elecciones que te interesan. Puedes cambiarlas cuando quieras.
        </Text>
      </View>

      {/* Activas */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Activas</Text>
        {activas.length === 0 ? (
          <Text style={styles.emptyText}>Ninguna activa por ahora.</Text>
        ) : (
          activas.map((tipo) => (
            <View key={tipo.id} style={styles.card}>
              <View style={styles.cardCol}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {tipo.nombre}
                </Text>
                <Text style={styles.cardMeta}>{daysUntil(tipo.fecha_eleccion)}</Text>
              </View>
              <Toggle
                value
                onPress={() => tipo.id && toggle(tipo.id, allIds)}
                accessibilityLabel={`Desactivar ${tipo.nombre}`}
              />
            </View>
          ))
        )}
      </View>

      {/* Disponibles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Disponibles</Text>
        {disponibles.length === 0 ? (
          <Text style={styles.emptyText}>Ya activaste todas las disponibles.</Text>
        ) : (
          disponibles.map((tipo) => (
            <View key={tipo.id} style={styles.card}>
              <View style={styles.cardCol}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {tipo.nombre}
                </Text>
                <Text style={styles.cardMeta}>{daysUntil(tipo.fecha_eleccion)}</Text>
              </View>
              <Toggle
                value={false}
                onPress={() => tipo.id && toggle(tipo.id, allIds)}
                accessibilityLabel={`Activar ${tipo.nombre}`}
              />
            </View>
          ))
        )}
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Icon name="info" size={16} color={c.primary} />
        <View style={styles.infoTextCol}>
          <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
          <Text style={styles.infoBody}>
            Las elecciones activas aparecen en tu Home. Puedes tener varias al mismo tiempo.
          </Text>
        </View>
      </View>
    </ScrollView>
    <BottomNav active="home" navigation={navigation} />
  </View>
  );
}
