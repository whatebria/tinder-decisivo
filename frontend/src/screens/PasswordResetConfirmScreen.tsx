/**
 * PasswordResetConfirmScreen: usuario pega el token + escribe nueva password.
 * El token puede venir por route param (deep link) o pegarse a mano.
 *
 * Migrado a design system nativo (RN + tokens + atoms/molecules del DS).
 * Antes usaba Tamagui (H1, Paragraph, YStack) — reemplazado por View + Text
 * con typography, siguiendo el patrón de LoginScreen/RegisterScreen.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { useConfirmPasswordReset } from "../api/hooks";
import { Button, FormField, Heading, Link, useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function PasswordResetConfirmScreen({
  route,
  navigation,
}: RootStackScreenProps<"PasswordResetConfirm">) {
  const c = useThemeColors();
  const initialToken = route.params?.token ?? "";
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const confirmReset = useConfirmPasswordReset();
  const toast = useToast();

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    token.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    !confirmReset.isPending;

  async function handleSubmit() {
    if (!passwordsMatch) {
      toast.error("Las contrasenas no coinciden", "Revisa ambos campos.");
      return;
    }
    try {
      await confirmReset.mutateAsync({ token, newPassword });
      toast.success(
        "Contrasena actualizada",
        "Ya puedes iniciar sesion con tu nueva contrasena."
      );
      navigation.replace("Login");
    } catch (err) {
      toast.error("No pudimos cambiar tu contrasena", getErrorMessage(err));
    }
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { backgroundColor: c.bg, flexGrow: 1 },
        content: {
          padding: spacing.sp5,
          gap: spacing.sp4,
          flexGrow: 1,
          justifyContent: "center",
        },
        subtitle: { ...typography.body, color: c.textSecondary },
      }),
    [c],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Heading level={1}>Nueva contrasena</Heading>
      <Text style={styles.subtitle}>
        Pega el token del email y elige una nueva contrasena.
      </Text>

      <View>
        <FormField
          label="Token"
          helper="Pégalo del email que recibiste."
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormField
          label="Nueva contrasena"
          helper="Mínimo 8 caracteres."
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormField
          label="Confirmar nueva contrasena"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={
            confirmPassword.length > 0 && !passwordsMatch
              ? "Las contrasenas no coinciden."
              : undefined
          }
        />
      </View>

      <Button
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={confirmReset.isPending}
      >
        Cambiar contrasena
      </Button>

      <Link block onPress={() => navigation.replace("Login")}>
        Volver al login
      </Link>
    </ScrollView>
  );
}
