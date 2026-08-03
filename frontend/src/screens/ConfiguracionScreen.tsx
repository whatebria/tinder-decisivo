/**
 * ConfiguracionScreen: hub de ajustes de la app.
 *
 * Layout basado en design-system-lowfi.html `tpl-config` (Template 17).
 * Secciones (solo las que tienen backend/feature real hoy — NO invento):
 *
 *   1. Cuenta       (auth)  — Card con avatar + shortName + email + "Editar perfil"
 *   2. Mis datos    (auth)  — NavRow a MisRespuestas (hub) con reiniciar/editar dentro
 *   3. Elecciones           — NavRow a GestionElecciones
 *   4. Apariencia           — ThemeToggle
 *   5. Debug        (dev)   — NavRow al DesignSystem + Django Admin (solo __DEV__)
 *   6. Cerrar sesion (auth) — Button secondary full-width
 *
 * Modo invitado: en vez de las secciones auth, muestra CTA para crear cuenta.
 *
 * Fuera de scope (aparecen en wireframe pero sin backend): Ubicacion,
 * Notificaciones, Privacidad · Exportar, Sobre la app, Version.
 */

import React, { useCallback, useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { ADMIN_URL } from "../api/config";
import { logoutApi } from "../api/endpoints";
import {
  AppShell,
  Avatar,
  Button,
  HomeTopBar,
  Link,
  NavRow,
  SectionTitle,
  ThemeToggle,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { useCoachMarksStore } from "../store/coachMarks";
import { useOnboardingStore } from "../store/onboarding";
import { usePerfil } from "../api/hooks";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

// -- Estilos estaticos (sin dependencia de tema) -- nivel modulo para que
// Fast Refresh los recargue siempre, sin quedar atrapados en useMemo([c]).
// UX-063: topBar identico a CandidatosScreen y CompararScreen.
const styles = StyleSheet.create({
  // paddingHorizontal: sp4 alinea el topBar con Candidatos/Comparar
  // (ambos tienen padding: sp4 en su contenedor de scroll/FlatList).
  content: { paddingHorizontal: spacing.sp4, paddingBottom: spacing.sp8, gap: spacing.sp5 },
  // UX-063: flat — sin card, sin marginHorizontal, separador inferior.
  topBar:  { marginTop: spacing.sp3 },
  // Sin paddingHorizontal propio — lo hereda del contenedor (content).
  section: { gap: spacing.sp2 },
  accountCta: { marginTop: spacing.sp2, alignSelf: "stretch" },
  statItem:   { alignItems: "center", gap: spacing.sp1 },
  guestCta:   { alignSelf: "stretch" },
});

export function ConfiguracionScreen({
  navigation,
}: RootStackScreenProps<"Configuracion">) {
  const c = useThemeColors();
  // F18: email ya no está en AuthState. Se obtiene de usePerfil() (misma fuente
  // que HomeScreen / PerfilScreen). React Query lo cachea sin request adicional.
  const perfilQ = usePerfil();
  const email    = perfilQ.data?.email ?? null;
  // UX-032: usar el username real del backend, no el prefijo del email.
  const username = perfilQ.data?.username ?? "Mi cuenta";
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const resetCoachMarks = useCoachMarksStore((s) => s.resetAll);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const toast = useToast();

  // TASK-030: useCallback para estabilizar las props onPress pasadas a NavRow/Button.
  const handleLogout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignorar: token ya expirado o red */ }
    await logout();
  }, [logout]);

  const handleReactivarTours = useCallback(async () => {
    await resetCoachMarks();
    toast.info(
      "Tours reactivados",
      "Volver\u00e1n a aparecer en cada pantalla clave.",
    );
  }, [resetCoachMarks, toast]);

  const dynStyles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { backgroundColor: c.bg, flex: 1 },
        // Cuenta card
        accountCard: {
          padding: spacing.sp4,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          alignItems: "center",
          gap: spacing.sp2,
        },
        accountName: { ...typography.h3, fontWeight: "700", color: c.text, textAlign: "center" },
        accountEmail: { ...typography.small, color: c.textSecondary, textAlign: "center" },
        // UX-034: stats
        statRow: {
          flexDirection: "row",
          justifyContent: "space-around",
          alignSelf: "stretch",
          borderTopWidth: 1,
          borderTopColor: c.border2,
          marginTop: spacing.sp2,
          paddingTop: spacing.sp3,
        },
        statValue: { ...typography.h3, fontWeight: "700", color: c.primary, textAlign: "center" },
        statLabel: {
          ...typography.overline,
          textTransform: "none",
          letterSpacing: 0,
          color: c.textSecondary,
          textAlign: "center",
        },
        // UX-035: guest
        guestCard: {
          padding: spacing.sp5,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          alignItems: "center",
          gap: spacing.sp3,
        },
        guestTitle: { ...typography.h3, fontWeight: "700", color: c.text, textAlign: "center" },
        guestSubtitle: { ...typography.small, color: c.textSecondary, textAlign: "center" },
        // UX-033/076: DangerZone
        dangerZone: { borderRadius: radii.rLg, borderWidth: 1.5, borderColor: c.danger, overflow: "hidden" },
      }),
    [c],
  );

  // UX-032: iniciales del username real (no del email).
  const initials =
    username.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "ME";

  return (
    <AppShell active="config" navigation={navigation}>
      <ScrollView style={dynStyles.scroll} contentContainerStyle={styles.content}>
        <HomeTopBar
          brand="Configuración"
          variant="flat"
          style={styles.topBar}
        />

        {/* 1. Cuenta */}
        {!isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Cuenta" />
            <View style={dynStyles.accountCard}>
              <Avatar initials={initials} size="lg" />
              <Text style={dynStyles.accountName} numberOfLines={1}>
                {username}
              </Text>
              {email ? (
                <Text style={dynStyles.accountEmail} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {/* UX-034: contadores de actividad — datos reales del backend. */}
              {perfilQ.data?.contadores ? (
                <View style={dynStyles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={dynStyles.statValue}>
                      {perfilQ.data.contadores.respuestas}
                    </Text>
                    <Text style={dynStyles.statLabel}>Respuestas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={dynStyles.statValue}>
                      {perfilQ.data.contadores.favoritos}
                    </Text>
                    <Text style={dynStyles.statLabel}>Favoritos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={dynStyles.statValue}>
                      {perfilQ.data.contadores.descartados}
                    </Text>
                    <Text style={dynStyles.statLabel}>Descartados</Text>
                  </View>
                </View>
              ) : null}
              <View style={styles.accountCta}>
                <Button
                  variant="secondary"
                  onPress={() => navigation.navigate("Perfil")}
                >
                  Editar perfil
                </Button>
              </View>
            </View>
          </View>
        ) : null}

        {/* 2. Mis datos */}
        {!isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Mis datos" />
            <NavRow
              label="Mis guardados"
              subtitle="Favoritos, descartados y posturas guardadas"
              iconLeading="bookmark"
              onPress={() => navigation.navigate("MisGuardados")}
            />
            <NavRow
              label="Mis respuestas"
              subtitle="Ver, editar o reiniciar tus respuestas del cuestionario"
              iconLeading="check"
              onPress={() => navigation.navigate("MisRespuestas")}
            />
          </View>
        ) : null}

        {/* 3. Elecciones */}
        <View style={styles.section}>
          <SectionTitle title="Elecciones" />
          <NavRow
            label="Gestión de elecciones"
            subtitle="Activa o desactiva las elecciones que sigues"
            iconLeading="bell"
            onPress={() => navigation.navigate("GestionElecciones")}
          />
        </View>

        {/* 4. Apariencia */}
        <View style={styles.section}>
          <SectionTitle title="Apariencia" />
          <ThemeToggle />
        </View>

        {/* 5. Ayuda */}
        <View style={styles.section}>
          <SectionTitle title="Ayuda" />
          <NavRow
            label="Ver tours de nuevo"
            subtitle="Reactiva los coach marks explicativos de cada pantalla"
            iconLeading="info"
            onPress={handleReactivarTours}
          />
        </View>

        {/* 5. Debug (solo dev builds) */}
        {__DEV__ ? (
          <View style={styles.section}>
            <SectionTitle title="Debug" />
            <NavRow
              label="Ver Onboarding"
              subtitle="Preview del welcome tour sin efectos en la sesion"
              iconLeading="info"
              onPress={() => navigation.navigate("OnboardingPreview")}
            />
            <NavRow
              label="Resetear onboarding"
              subtitle="La proxima vez que abras la app veran los slides de nuevo"
              iconLeading="undo"
              onPress={async () => {
                await resetOnboarding();
                toast.info("Onboarding reseteado", "Cierra sesion o recarga para verlo.");
              }}
            />
            <NavRow
              label="Design System"
              subtitle="Catalogo interno de atoms, molecules y organisms"
              iconLeading="columns"
              onPress={() => navigation.navigate("DesignSystem")}
            />
            <NavRow
              label="Django Admin"
              subtitle={ADMIN_URL}
              iconLeading="gear"
              onPress={() => {
                Linking.openURL(ADMIN_URL).catch(() => {
                  // Sin toast global aca — el error mas comun es que el
                  // browser no pueda abrir la URL (ej. hostname invalido
                  // desde el emulador). Fallamos en silencio.
                });
              }}
            />
          </View>
        ) : null}

        {/* UX-035: modo invitado — un solo hero card con CTA acento + link discreto. */}
        {isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Modo invitado" />
            <View style={dynStyles.guestCard}>
              <Text style={dynStyles.guestTitle}>
                ¿Listo para guardar tu progreso?
              </Text>
              <Text style={dynStyles.guestSubtitle}>
                Crea una cuenta gratis para guardar favoritos, descartados y
                comparar tu match entre dispositivos.
              </Text>
              <View style={styles.guestCta}>
                <Button variant="accent" onPress={exitGuestMode}>
                  Crear una cuenta
                </Button>
              </View>
              <Link block onPress={exitGuestMode} color={c.textSecondary}>
                Salir del modo invitado
              </Link>
            </View>
          </View>
        ) : null}

        {/* UX-033: Zona de peligro (DS-11 P8) -- agrupa acciones destructivas. */}
        {/* UX-076: sin fondo rojo ni header -- el borde danger comunica suficiente. */}
        {!isGuest ? (
          <View style={[styles.section, { marginTop: spacing.sp3 }]}>
            <View style={dynStyles.dangerZone}>
              <NavRow
                label="Cerrar sesión"
                variant="danger"
                iconLeading="log-out"
                onPress={handleLogout}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
