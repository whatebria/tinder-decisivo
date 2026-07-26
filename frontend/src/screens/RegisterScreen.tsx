/**
 * Screen de registro: username + email + password.
 * Al exito, hace login automatico.
 */

import React, { useState } from "react";
import { H1, Paragraph, YStack } from "tamagui";

import { login, register } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { FormInput } from "../components/FormInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import { useAuthStore } from "../store/auth";
import type { RootStackScreenProps } from "../navigation/types";

export function RegisterScreen({ navigation }: RootStackScreenProps<"Register">) {
  const setSession = useAuthStore((s) => s.setSession);
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    username.length >= 3 &&
    email.includes("@") &&
    password.length >= 8 &&
    !loading;

  async function handleRegister() {
    setLoading(true);
    try {
      await register({ username, email, password });
      // Login automatico tras registro exitoso
      const loginRes = await login({ username, password });
      await setSession(loginRes.token, loginRes.user_id, loginRes.email);
    } catch (err) {
      toast.error("No pudimos crear tu cuenta", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$6" gap="$4" backgroundColor="$background" justifyContent="center">
      <H1 color="$text">Crear cuenta</H1>
      <Paragraph color="$textSecondary">
        Necesitamos algunos datos basicos.
      </Paragraph>

      <YStack gap="$3">
        <FormInput
          placeholder="Usuario (mínimo 3 caracteres)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Usuario"
        />
        <FormInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
        />
        <FormInput
          placeholder="Contraseña (mínimo 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Contraseña"
        />
      </YStack>

      <PrimaryButton
        onPress={handleRegister}
        disabled={!canSubmit}
        loading={loading}
      >
        {loading ? "Creando cuenta..." : "Registrarme"}
      </PrimaryButton>

      <TextButton onPress={() => navigation.goBack()}>
        Ya tengo cuenta — Volver
      </TextButton>
    </YStack>
  );
}
