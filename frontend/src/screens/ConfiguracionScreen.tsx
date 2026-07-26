/**
 * ConfiguracionScreen: hub de ajustes de la app.
 *
 * Layout basado en design-system-lowfi.html `tpl-config` (Template 17).
 * Secciones (solo las que tienen backend/feature real hoy — NO invento):
 *
 *   1. Cuenta       (auth)  — Card con avatar + username + email + "Editar perfil"
 *   2. Mis datos    (auth)  — NavRow por tipo de eleccion (editar respuestas)
 *   3. Elecciones           — NavRow a GestionElecciones
 *   4. Mi voto              (auth) — NavRow a MiDecision
 *   5. Apariencia           — ThemeToggle
 *   6. Reiniciar    (auth)  — NavRow variant="danger" por tipo (dispara ConfirmModal)
 *   7. Cerrar sesion (auth) — Button secondary full-width
 *
 * Modo invitado: en vez de las secciones auth, muestra CTA para crear cuenta.
 *
 * Fuera de scope (aparecen en wireframe pero sin backend): Ubicacion,
 * Notificaciones, Privacidad · Exportar, Sobre la app, Version.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { useReiniciarCuestionario, useTiposEleccion } from "../api/hooks";
import type { TipoEleccion } from "../api/endpoints";
import {
  AppShell,
  Avatar,
  Button,
  ConfirmModal,
  HomeTopBar,
  Link,
  NavRow,
  SectionTitle,
  ThemeToggle,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
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

  const { data: tipos = [] } = useTiposEleccion();
  const reiniciar = useReiniciarCuestionario();
  const toast = useToast();
  const [tipoAReiniciar, setTipoAReiniciar] = useState<TipoEleccion | null>(
    null,
  );

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

  async function handleConfirmReiniciar() {
    if (!tipoAReiniciar?.id) return;
    try {
      const result = await reiniciar.mutateAsync(tipoAReiniciar.id);
      toast.success(
        "Cuestionario reiniciado",
        `Se borraron ${result.respuestas_borradas} respuestas. Tus favoritos y voto siguen ahí.`,
      );
      setTipoAReiniciar(null);
    } catch (err) {
      toast.error(
        "No pudimos reiniciar el cuestionario",
        getErrorMessage(err),
      );
    }
  }

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

        {/* 2. Mis datos (respuestas por tipo de eleccion) */}
        {!isGuest && tipos.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle title="Mis datos" />
            {tipos.map((tipo) => (
              <NavRow
                key={`resp-${tipo.id}`}
                label={`Respuestas · ${tipo.nombre}`}
                subtitle="Ver o editar mis respuestas"
                onPress={() =>
                  tipo.id &&
                  navigation.navigate("MisRespuestas", {
                    tipoEleccionId: tipo.id,
                  })
                }
                accessibilityLabel={`Ver o editar mis respuestas de ${tipo.nombre}`}
              />
            ))}
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

        {/* 4. Mi voto */}
        {!isGuest ? (
          <View style={styles.section}>
            <SectionTitle title="Mi voto" />
            <NavRow
              label="Mi voto final"
              subtitle="Ver o cambiar el candidato que elegiste"
              onPress={() => navigation.navigate("MiDecision")}
            />
          </View>
        ) : null}

        {/* 5. Apariencia */}
        <View style={styles.section}>
          <SectionTitle title="Apariencia" />
          <ThemeToggle />
        </View>

        {/* 6. Reiniciar cuestionario (destructivo) */}
        {!isGuest && tipos.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle title="Reiniciar cuestionario" />
            {tipos.map((tipo) => (
              <NavRow
                key={`reset-${tipo.id}`}
                label={`Empezar de nuevo: ${tipo.nombre}`}
                subtitle="Borra tus respuestas y ranking calculado"
                variant="danger"
                onPress={() => setTipoAReiniciar(tipo)}
                accessibilityLabel={`Reiniciar cuestionario ${tipo.nombre}`}
              />
            ))}
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

        {/* 7. Cerrar sesion */}
        {!isGuest ? (
          <View style={styles.logoutWrap}>
            <Button variant="secondary" onPress={logout}>
              Cerrar sesión
            </Button>
          </View>
        ) : null}

        <ConfirmModal
          visible={tipoAReiniciar !== null}
          title="¿Empezar de nuevo?"
          message={
            tipoAReiniciar
              ? `Esto borra tus respuestas y tu ranking calculado para "${tipoAReiniciar.nombre}". Tus favoritos, descartados y voto final se mantienen.`
              : ""
          }
          confirmLabel="Sí, borrar y empezar de nuevo"
          cancelLabel="Cancelar"
          variant="danger"
          loading={reiniciar.isPending}
          onConfirm={handleConfirmReiniciar}
          onCancel={() => setTipoAReiniciar(null)}
        />
      </ScrollView>
    </AppShell>
  );
}
