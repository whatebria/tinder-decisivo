/**
 * PerfilScreen: info del usuario + contadores + acciones (cambiar password,
 * eliminar cuenta, cerrar sesion).
 */

import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  Card,
  H1,
  H3,
  Paragraph,
  Separator,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from "tamagui";

import { getErrorMessage } from "../api/client";
import {
  useCambiarPassword,
  useEliminarCuenta,
  usePerfil,
} from "../api/hooks";
import { CambiarPasswordModal } from "../components/CambiarPasswordModal";
import { EliminarCuentaModal } from "../components/EliminarCuentaModal";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { useThemeStore, type ThemeMode } from "../store/theme";
import { useThemeColors } from "../theme/useTheme";

export function PerfilScreen({ navigation }: RootStackScreenProps<"Perfil">) {
  const c = useThemeColors();
  const logout = useAuthStore((s) => s.logout);
  const perfilQ = usePerfil();
  const cambiar = useCambiarPassword();
  const eliminar = useEliminarCuenta();
  const toast = useToast();
  const [passOpen, setPassOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleCambiarPass(current: string, next: string) {
    try {
      await cambiar.mutateAsync({ currentPassword: current, newPassword: next });
      toast.success("Contrasena actualizada", "Tu nueva contrasena ya esta activa.");
      setPassOpen(false);
    } catch (err) {
      toast.error("No pudimos cambiar la contrasena", getErrorMessage(err));
    }
  }

  async function handleEliminar(password: string) {
    try {
      await eliminar.mutateAsync(password);
      toast.success("Cuenta eliminada", "Adios!");
      // Al deslogear, AppNavigator swap a auth stack.
      await logout();
    } catch (err) {
      toast.error("No pudimos eliminar la cuenta", getErrorMessage(err));
    }
  }

  if (perfilQ.isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    );
  }

  const perfil = perfilQ.data;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <H1 color="$text">Mi perfil</H1>

        {perfil ? (
          <>
            {/* Info basica */}
            <Card padding="$4" gap="$2" borderWidth={1} borderColor="$border">
              <YStack gap="$1">
                <SizableText size="$2" color="$textSecondary" fontWeight="700">
                  USUARIO
                </SizableText>
                <SizableText size="$5" color="$text">
                  {perfil.username}
                </SizableText>
              </YStack>
              <YStack gap="$1">
                <SizableText size="$2" color="$textSecondary" fontWeight="700">
                  EMAIL
                </SizableText>
                <SizableText size="$4" color="$text">
                  {perfil.email || "(sin email registrado)"}
                </SizableText>
              </YStack>
              <YStack gap="$1">
                <SizableText size="$2" color="$textSecondary" fontWeight="700">
                  MIEMBRO DESDE
                </SizableText>
                <SizableText size="$3" color="$textSecondary">
                  {new Date(perfil.fecha_registro).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </SizableText>
              </YStack>
            </Card>

            {/* Contadores */}
            <H3 color="$text">Mi actividad</H3>
            <XStack gap="$3" flexWrap="wrap">
              <StatBadge label="Respuestas" value={perfil.contadores.respuestas} />
              <StatBadge label="Favoritos" value={perfil.contadores.favoritos} />
              <StatBadge label="Descartados" value={perfil.contadores.descartados} />
              <StatBadge label="Votos guardados" value={perfil.contadores.decisiones} />
            </XStack>
          </>
        ) : (
          <Paragraph color="$textSecondary">No pudimos cargar tu perfil.</Paragraph>
        )}

        <Separator />

        {/* Apariencia */}
        <H3 color="$text">Apariencia</H3>
        <ThemeSelector />

        <Separator />

        {/* Acciones */}
        <H3 color="$text">Cuenta</H3>
        <YStack gap="$2">
          <TextButton onPress={() => setPassOpen(true)}>
            Cambiar mi contrasena
          </TextButton>
          <TextButton onPress={logout}>Cerrar sesion</TextButton>
          <TextButton onPress={() => setDeleteOpen(true)} color={c.danger}>
            Eliminar mi cuenta
          </TextButton>
        </YStack>

        <YStack flex={1} />
        <TextButton onPress={() => navigation.goBack()}>Volver</TextButton>
      </YStack>

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
    </ScrollView>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <Card padding="$3" borderWidth={1} borderColor="$border" minWidth={110} alignItems="center">
      <SizableText size="$8" fontWeight="800" color="$primary">
        {value}
      </SizableText>
      <SizableText size="$2" color="$textSecondary">
        {label}
      </SizableText>
    </Card>
  );
}

function ThemeSelector() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const options: Array<{ value: ThemeMode; label: string }> = [
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
    { value: "system", label: "Sistema" },
  ];

  return (
    <XStack gap="$2" flexWrap="wrap">
      {options.map((opt) => {
        const selected = mode === opt.value;
        return (
          <Card
            key={opt.value}
            padding="$3"
            borderWidth={selected ? 2 : 1}
            borderColor={selected ? "$primary" : "$border"}
            backgroundColor={selected ? "$primary" : "$background"}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setMode(opt.value)}
            flex={1}
            minWidth={90}
            alignItems="center"
            accessibilityLabel={`Modo ${opt.label}`}
          >
            <SizableText
              size="$3"
              fontWeight="700"
              color={selected ? "$textOnPrimary" : "$text"}
            >
              {opt.label}
            </SizableText>
          </Card>
        );
      })}
    </XStack>
  );
}
