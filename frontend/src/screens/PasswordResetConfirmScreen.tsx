/**
 * PasswordResetConfirmScreen: usuario pega el token + escribe nueva password.
 * El token puede venir por route param (deep link) o pegarse a mano.
 */

import React, { useState } from "react";
import { ScrollView } from "react-native";
import { H1, Paragraph, YStack } from "tamagui";

import { getErrorMessage } from "../api/client";
import { useConfirmPasswordReset } from "../api/hooks";
import { FormInput } from "../components";
import { Button } from "../components";
import { TextButton } from "../components";
import { useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";

export function PasswordResetConfirmScreen({
  route,
  navigation,
}: RootStackScreenProps<"PasswordResetConfirm">) {
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack
        flex={1}
        padding="$6"
        gap="$4"
        backgroundColor="$background"
        justifyContent="center"
      >
        <H1 color="$text">Nueva contrasena</H1>
        <Paragraph color="$textSecondary">
          Pega el token del email y elige una nueva contrasena.
        </Paragraph>

        <FormInput
          placeholder="Token"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Token"
        />
        <FormInput
          placeholder="Nueva contrasena (min. 8 caracteres)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          accessibilityLabel="Nueva contrasena"
        />
        <FormInput
          placeholder="Confirma tu nueva contrasena"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          accessibilityLabel="Confirmar contrasena"
        />
        {confirmPassword.length > 0 && !passwordsMatch ? (
          <Paragraph size="$2" color="$danger">
            Las contrasenas no coinciden.
          </Paragraph>
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={confirmReset.isPending}
        >
          Cambiar contrasena
        </Button>

        <TextButton onPress={() => navigation.replace("Login")}>
          Volver al login
        </TextButton>
      </YStack>
    </ScrollView>
  );
}
