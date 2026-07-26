/**
 * Screen de Login: username + password.
 */

import React, { useState } from "react";
import { H1, Paragraph, YStack } from "tamagui";

import { login } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { Input } from "../components";
import { Button } from "../components";
import { Link } from "../components";
import { ThemeToggle } from "../components";
import { useToast } from "../components";
import { useAuthStore } from "../store/auth";
import type { RootStackScreenProps } from "../navigation/types";

export function LoginScreen({ navigation }: RootStackScreenProps<"Login">) {
  const setSession = useAuthStore((s) => s.setSession);
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = username.length > 0 && password.length > 0 && !loading;

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await login({ username, password });
      await setSession(res.token, res.user_id, res.email);
    } catch (err) {
      toast.error("No pudimos iniciar sesion", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack flex={1} padding="$6" gap="$4" backgroundColor="$background" justifyContent="center">
      <H1 color="$text">Servel</H1>
      <Paragraph color="$textSecondary">
        Ingresa a tu cuenta para encontrar tu candidato ideal.
      </Paragraph>

      <YStack gap="$3">
        <Input
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Usuario"
        />
        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Contraseña"
        />
      </YStack>

      <Button
        onPress={handleLogin}
        disabled={!canSubmit}
        loading={loading}
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </Button>

      <Link block
        onPress={() => navigation.navigate("Register")}
        accessibilityLabel="Ir a registro"
      >
        No tengo cuenta — Registrarme
      </Link>

      <Link block
        onPress={() => navigation.navigate("PasswordResetRequest")}
        accessibilityLabel="Recuperar contraseña"
      >
        Olvidé mi contraseña
      </Link>

      <Link block
        onPress={enterGuestMode}
        accessibilityLabel="Probar sin cuenta"
      >
        Probar sin cuenta →
      </Link>

      <YStack alignItems="center" marginTop="$4">
        <ThemeToggle />
      </YStack>
    </YStack>
  );
}
