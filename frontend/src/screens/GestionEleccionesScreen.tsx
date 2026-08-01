/**
 * Gestión de elecciones: catálogo con toggle activar/desactivar por tipo.
 *
 * Basado en design-system-lowfi.html · Gestión de elecciones.
 * El backend aún no expone "activo por usuario"; persistimos preferencia
 * client-side vía `useElectionsPrefsStore` (secureStorage).
 */

import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTiposEleccion } from "../api/hooks";
import { AppShell, CoachMarkTour, Icon, ScreenTopBar, Spinner, Toggle, useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  partitionTipos,
  useElectionsPrefsStore,
} from "../store/electionsPrefs";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
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
  const toast = useToast();
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

  // UX-047: handler con feedback de persistencia.
  // isNowActive se calcula ANTES del toggle (activeIds aun no cambia en este frame).
  const handleToggle = useCallback(
    async (tipo: { id?: number | null; nombre?: string | null }) => {
      if (tipo.id == null) return;
      const isNowActive = !(activeIds ?? []).includes(tipo.id);
      const nombre = tipo.nombre ?? "la eleccion";
      try {
        await toggle(tipo.id, allIds);
        if (isNowActive) {
          toast.success("Eleccion activada", `${nombre} aparecerá en tu Home.`);
        } else {
          toast.info("Eleccion desactivada", `${nombre} ya no aparecerá en tu Home.`);
        }
      } catch {
        toast.error("No pudimos guardar tu preferencia", "Intenta de nuevo.");
      }
    },
    [toggle, allIds, activeIds, toast],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: c.bg },
        content: {
          padding: spacing.sp4,
          gap: spacing.sp4,
          paddingBottom: spacing.sp8,
        },
        heroCol: { gap: spacing.sp1 },
        heroTitle: {
          ...typography.h3,
          fontWeight: "700",
          color: c.text,
        },
        heroSubtitle: {
          ...typography.small,
          color: c.textSecondary,
        },
        section: { gap: spacing.sp2 },
        sectionLabel: {
          ...typography.overline,
          fontWeight: "600",
          color: c.textSecondary,
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
        cardCol: { flex: 1, gap: spacing.sp1 },
        cardName: {
          ...typography.small,
          fontWeight: "600",
          color: c.text,
        },
        cardMeta: {
          ...typography.overline,
          fontWeight: "600",
          color: c.textSecondary,
        },
        emptyText: {
          ...typography.overline,
          textTransform: "none",
          letterSpacing: 0,
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
        infoTextCol: { flex: 1, gap: spacing.sp1 },
        infoTitle: {
          ...typography.overline,
          textTransform: "none",
          letterSpacing: 0,
          fontWeight: "600",
          color: c.text,
        },
        infoBody: {
          ...typography.overline,
          textTransform: "none",
          letterSpacing: 0,
          color: c.textSecondary,
        },
        loadingBox: { paddingTop: spacing.sp8, alignItems: "center" },
      }),
    [c],
  );

  if (isLoading) {
    return (
      <AppShell active={null} navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.loadingBox}>
            <Spinner size="large" />
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  return (
    <>
    <AppShell active={null} navigation={navigation}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* TopBar breadcrumb */}
      <ScreenTopBar
        title="Tus elecciones"
        onBack={() => navigation.goBack()}
      />

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
                onPress={() => handleToggle(tipo)}
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
                onPress={() => handleToggle(tipo)}
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
    </AppShell>

      <CoachMarkTour tourId="gestionElecciones" />
    </>
  );
}
