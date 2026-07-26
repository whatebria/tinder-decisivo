/**
 * ConfiguracionScreen: cajon de acciones que no entran en el template Home.
 *
 * - Auth user: Mi perfil, Mi voto final, Ver/editar respuestas (por eleccion),
 *   Reiniciar cuestionario, cambiar tema, cerrar sesion.
 * - Guest:     Crear cuenta, cambiar tema, salir del modo invitado.
 *
 * Se accede desde el tile "Configuracion" del Home.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { useReiniciarCuestionario, useTiposEleccion } from "../api/hooks";
import type { TipoEleccion } from "../api/endpoints";
import {
  AppShell,
  ConfirmModal,
  Divider,
  HomeTopBar,
  Link,
  SectionTitle,
  ThemeToggle,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function ConfiguracionScreen({ navigation }: RootStackScreenProps<"Configuracion">) {
  const c = useThemeColors();
  const email = useAuthStore((s) => s.email);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);

  const { data: tipos = [] } = useTiposEleccion();
  const reiniciar = useReiniciarCuestionario();
  const toast = useToast();
  const [tipoAReiniciar, setTipoAReiniciar] = useState<TipoEleccion | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { backgroundColor: c.bg, flex: 1 },
        content: {
          padding: spacing.sp4,
          paddingBottom: spacing.sp8,
          gap: spacing.sp5,
        },
        emailWrap: { gap: spacing.sp1 },
        emailLabel: {
          ...typography.overline,
          color: c.textTertiary,
        },
        emailText: {
          ...typography.small,
          fontWeight: "600",
          color: c.text,
        },
        block: { gap: spacing.sp2 },
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
      toast.error("No pudimos reiniciar el cuestionario", getErrorMessage(err));
    }
  }

  return (
    <AppShell active="config" navigation={navigation}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <HomeTopBar brand="Configuración" />

      {!isGuest && email ? (
        <View style={styles.emailWrap}>
            <Text style={styles.emailLabel}>Sesión</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>
      ) : null}

      {!isGuest ? (
        <>
          <View style={styles.block}>
            <SectionTitle title="Cuenta" />
            <Link block onPress={() => navigation.navigate("Perfil")}>
              Mi perfil
            </Link>
            <Link block onPress={() => navigation.navigate("MiDecision")}>
              Mi voto final
            </Link>
          </View>

          {tipos.length > 0 ? (
            <View style={styles.block}>
              <SectionTitle title="Mis respuestas" />
              {tipos.map((tipo) => (
                <Link
                  key={tipo.id}
                  block
                  onPress={() =>
                    tipo.id && navigation.navigate("MisRespuestas", { tipoEleccionId: tipo.id })
                  }
                  accessibilityLabel={`Ver o editar mis respuestas de ${tipo.nombre}`}
                >
                  {tipo.nombre}
                </Link>
              ))}
            </View>
          ) : null}

          {tipos.length > 0 ? (
            <View style={styles.block}>
              <SectionTitle title="Reiniciar cuestionario" />
              {tipos.map((tipo) => (
                <Link
                  key={tipo.id}
                  block
                  onPress={() => setTipoAReiniciar(tipo)}
                  color={c.danger}
                  accessibilityLabel={`Reiniciar cuestionario ${tipo.nombre}`}
                >
                  {`Empezar de nuevo: ${tipo.nombre}`}
                </Link>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.block}>
          <SectionTitle title="Modo invitado" />
          <Link block onPress={exitGuestMode} color={c.primary}>
            Crear una cuenta para guardar mi match
          </Link>
          <Link block onPress={exitGuestMode} color={c.danger}>
            Salir del modo invitado
          </Link>
        </View>
      )}

      <Divider />

      <View style={styles.block}>
        <SectionTitle title="Apariencia" />
        <ThemeToggle />
      </View>

      {!isGuest ? (
        <>
          <Divider />
          <Link block onPress={logout} color={c.danger}>
            Cerrar sesión
          </Link>
        </>
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
