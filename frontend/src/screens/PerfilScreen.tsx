/**
 * PerfilScreen: info del usuario + contadores + acciones (cambiar password,
 * eliminar cuenta).
 *
 * REFACTOR-005: ThemeToggle y Cerrar sesion se eliminaron de esta pantalla
 * (ambos ya estan en ConfiguracionScreen). PerfilScreen retiene solo lo que
 * es especifico del perfil: ubicacion electoral, cambiar contrasena y
 * eliminar cuenta.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import {
  useActualizarComuna,
  useCambiarPassword,
  useEliminarCuenta,
  usePerfil,
} from "../api/hooks";
import {
  AppShell,
  CambiarPasswordModal,
  Divider,
  EliminarCuentaModal,
  NavRow,
  ScreenTopBar,
  SectionTitle,
  Spinner,
  UbicacionPicker,
  useToast,
} from "../components";
import type { ComunaInline } from "../api/endpoints";
import { logoutApi } from "../api/endpoints";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function PerfilScreen({ navigation }: RootStackScreenProps<"Perfil">) {
  const c = useThemeColors();
  const logout = useAuthStore((s) => s.logout);
  const perfilQ = usePerfil();
  const cambiar = useCambiarPassword();
  const eliminar = useEliminarCuenta();
  const actualizarComuna = useActualizarComuna();
  const toast = useToast();
  const [passOpen, setPassOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleUbicacion(comuna: ComunaInline | null) {
    try {
      await actualizarComuna.mutateAsync(comuna?.id ?? null);
      toast.success(
        comuna ? "Ubicacion actualizada" : "Ubicacion eliminada",
        comuna
          ? `Ahora ves los candidatos de ${comuna.nombre}.`
          : "Vuelves a ver todos los candidatos.",
      );
    } catch (err) {
      toast.error(
        "No pudimos actualizar tu ubicacion",
        getErrorMessage(err),
      );
    }
  }

  async function handleCambiarPass(current: string, next: string) {
    try {
      await cambiar.mutateAsync({
        currentPassword: current,
        newPassword: next,
      });
      // UX-002: cerrar el modal ANTES de emitir el toast.
      // setPassOpen(false) arranca la animacion de close en el siguiente frame.
      // El toast se encola despues de ese frame para no bloquear la animacion
      // con las invalidaciones pesadas de React Query que vienen a continuacion.
      setPassOpen(false);
      requestAnimationFrame(() => {
        toast.success(
          "Contraseña actualizada",
          "Tu nueva contraseña ya está activa.",
        );
      });
    } catch (err) {
      toast.error("No pudimos cambiar la contraseña", getErrorMessage(err));
    }
  }

  async function handleEliminar(password: string) {
    try {
      await eliminar.mutateAsync(password);
      toast.success("Cuenta eliminada", "Adios!");
      // Al eliminar la cuenta, tambien hay que limpiar la cookie web.
      try { await logoutApi(); } catch { /* ignorar: cuenta ya eliminada */ }
      await logout();
    } catch (err) {
      toast.error("No pudimos eliminar la cuenta", getErrorMessage(err));
    }
  }

  const perfil = perfilQ.data;

  return (
    <AppShell active={null} navigation={navigation}>
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenTopBar
            title="Mi perfil"
            subtitle={perfil?.username}
            onBack={() => navigation.goBack()}
          />

          {perfilQ.isLoading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
          ) : perfil ? (
            <>
              {/* Info basica */}
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <InfoRow
                  label="Usuario"
                  value={perfil.username}
                  valueStyle={typography.h3}
                />
                <InfoRow
                  label="Email"
                  value={perfil.email || "(sin email registrado)"}
                  valueStyle={typography.body}
                />
                <InfoRow
                  label="Miembro desde"
                  value={new Date(perfil.fecha_registro).toLocaleDateString(
                    "es-CL",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                  valueStyle={typography.small}
                  valueMuted
                />
              </View>

              {/* Contadores */}
              <SectionTitle title="Mi actividad" />
              <View style={styles.statsRow}>
                <StatBadge
                  label="Respuestas"
                  value={perfil.contadores.respuestas}
                />
                <StatBadge
                  label="Favoritos"
                  value={perfil.contadores.favoritos}
                />
                <StatBadge
                  label="Descartados"
                  value={perfil.contadores.descartados}
                />
              </View>
            </>
          ) : (
            <Text style={[styles.errorText, { color: c.textSecondary }]}>
              No pudimos cargar tu perfil.
            </Text>
          )}

          <Divider />

          {/* Ubicacion (comuna donde vota) */}
          <SectionTitle title="Donde votas" />
          <View
            style={[
              styles.infoCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.helpText, { color: c.textSecondary }]}>
              Setea tu comuna para ver solo los candidatos que puedes votar
              (alcaldes de tu comuna, diputados de tu distrito, presidenciales).
              Puedes cambiarla o quitarla cuando quieras.
            </Text>
            <UbicacionPicker
              value={perfil?.comuna ?? null}
              onChange={handleUbicacion}
              disabled={actualizarComuna.isPending}
            />
          </View>

          <Divider />

          {/* Acciones especificas del perfil (REFACTOR-005: logout movido a Config) */}
          <SectionTitle title="Cuenta" />
          <View style={styles.actions}>
            <NavRow
              label="Cambiar mi contraseña"
              onPress={() => setPassOpen(true)}
            />
            <NavRow
              label="Eliminar mi cuenta"
              variant="danger"
              onPress={() => setDeleteOpen(true)}
            />
          </View>
        </ScrollView>

        <CambiarPasswordModal
          visible={passOpen}
          onCancel={() => setPassOpen(false)}
          onSubmit={handleCambiarPass}
          loading={cambiar.isPending}
        />
        <EliminarCuentaModal
          visible={deleteOpen}
          onCancel={() => setDeleteOpen(false)}
          onSubmit={handleEliminar}
          loading={eliminar.isPending}
        />
      </View>
    </AppShell>
  );
}

// ---------- Sub-componentes locales ----------
// InfoRow y StatBadge quedan aca porque son patrones especificos de este
// screen. Si aparecen en 3+ lugares, promover a molecule.

interface InfoRowProps {
  label: string;
  value: string;
  valueStyle?: object;
  valueMuted?: boolean;
}

function InfoRow({ label, value, valueStyle, valueMuted }: InfoRowProps) {
  const c = useThemeColors();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          valueStyle,
          { color: valueMuted ? c.textSecondary : c.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.statBadge,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <Text style={[styles.statValue, { color: c.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp4,
  },

  loadingBox: {
    alignItems: "center",
    padding: spacing.sp5,
  },

  errorText: typography.body,

  infoCard: {
    padding: spacing.sp4,
    borderRadius: radii.rMd,
    borderWidth: 1,
    gap: spacing.sp3,
  },
  infoRow: { gap: spacing.sp1 },
  infoLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  helpText: { ...typography.small, lineHeight: 20 },

  statsRow: {
    flexDirection: "row",
    gap: spacing.sp3,
    flexWrap: "wrap",
  },
  statBadge: {
    padding: spacing.sp3,
    borderRadius: radii.rMd,
    borderWidth: 1,
    minWidth: 110,
    alignItems: "center",
    flexGrow: 1,
    flexBasis: 110,
  },
  statValue: {
    ...typography.display,
    fontWeight: "800",
  },
  statLabel: typography.overline,

  actions: { gap: spacing.sp2 },
});
