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

import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { ADMIN_URL } from "../api/config";
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
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function ConfiguracionScreen({
  navigation,
}: RootStackScreenProps<"Configuracion">) {
  const c = useThemeColors();
  const email = useAuthStore((s) => s.email);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const resetCoachMarks = useCoachMarksStore((s) => s.resetAll);
  const toast = useToast();

  async function handleReactivarTours() {
    resetCoachMarks();
    toast.info(
      "Tours reactivados",
      "Volver\u00e1n a aparecer en cada pantalla clave.",
    );
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { backgroundColor: c.bg, flex: 1 },
        content: {
          padding: spacing.sp4,
          paddingBottom: spacing.sp8,
          gap: spacing.sp5,
        },

        // Cuenta card (patron wireframe: avatar centrado + info + CTA)
        accountCard: {
          padding: spacing.sp4,
          borderRadius: radii.rLg,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          alignItems: "center",
          gap: spacing.sp2,
        },
        accountName: {
          ...typography.h3,
          fontWeight: "700",
          color: c.text,
          textAlign: "center",
        },
        accountEmail: {
          ...typography.small,
          color: c.textSecondary,
          textAlign: "center",
        },
        accountCta: { marginTop: spacing.sp2, alignSelf: "stretch" },

        // Bloques de secciones
        section: { gap: spacing.sp2 },

        // Footer (cerrar sesion)
        logoutWrap: { marginTop: spacing.sp3 },
      }),
    [c],
  );

  // Nombre "corto" derivado del email (parte antes del @). No es identidad
  // real (no tenemos first/last name en el store todavia) pero evita mostrar
  // el email dos veces.
  const shortName = email ? email.split("@")[0] : "Mi cuenta";
  const initials =
    shortName.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "ME";

  return (
    <AppShell active="config" navigation={navigation}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <HomeTopBar brand="Configuración" />

        {/* 1. Cuenta */}
        {!isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Cuenta" />
            <View style={styles.accountCard}>
              <Avatar initials={initials} size="lg" />
              <Text style={styles.accountName} numberOfLines={1}>
                {shortName}
              </Text>
              {email ? (
                <Text style={styles.accountEmail} numberOfLines={1}>
                  {email}
                </Text>
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
              subtitle="Favoritos, descartados, posturas y noticias guardadas"
              onPress={() => navigation.navigate("MisGuardados")}
            />
            <NavRow
              label="Mis respuestas"
              subtitle="Ver, editar o reiniciar tus respuestas del cuestionario"
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
            onPress={handleReactivarTours}
          />
        </View>

        {/* 5. Debug (solo dev builds) */}
        {__DEV__ ? (
          <View style={styles.section}>
            <SectionTitle title="Debug" />
            <NavRow
              label="Design System"
              subtitle="Catalogo interno de atoms, molecules y organisms"
              onPress={() => navigation.navigate("DesignSystem")}
            />
            <NavRow
              label="Django Admin"
              subtitle={ADMIN_URL}
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

        {/* Bloque modo invitado */}
        {isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Modo invitado" />
            <NavRow
              label="Crear una cuenta"
              subtitle="Guarda tus favoritos y match entre dispositivos"
              onPress={exitGuestMode}
            />
            <Link block onPress={exitGuestMode} color={c.danger}>
              Salir del modo invitado
            </Link>
          </View>
        ) : null}

        {/* 5. Cerrar sesion */}
        {!isGuest ? (
          <View style={styles.logoutWrap}>
            <Button variant="secondary" onPress={logout}>
              Cerrar sesión
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
