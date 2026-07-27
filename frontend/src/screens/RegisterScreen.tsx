/**
 * Screen de registro: username + email + password.
 * Al exito, hace login automatico.
 *
 * Migrado a design system nativo (RN + tokens). Antes usaba Tamagui.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { login, register } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { Button, Input, Link, useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function RegisterScreen({ navigation }: RootStackScreenProps<"Register">) {
  const c = useThemeColors();
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
        title: { ...typography.h1, color: c.text },
        subtitle: { ...typography.body, color: c.textSecondary },
        inputs: { gap: spacing.sp3 },
      }),
    [c],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Necesitamos algunos datos basicos.</Text>

      <View style={styles.inputs}>
        <Input
          placeholder="Usuario (mínimo 3 caracteres)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Usuario"
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
        />
        <Input
          placeholder="Contraseña (mínimo 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Contraseña"
        />
      </View>

      <Button onPress={handleRegister} disabled={!canSubmit} loading={loading}>
        {loading ? "Creando cuenta..." : "Registrarme"}
      </Button>

      <Link block onPress={() => navigation.goBack()}>
        Ya tengo cuenta — Volver
      </Link>
    </ScrollView>
  );
}
