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
import { Button, FormField, Heading, Link, useToast } from "../components";
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
    password.length >= 10 &&
    !loading;

  async function handleRegister() {
    setLoading(true);
    try {
      // Trim defensivo: consistente con LoginScreen. Si el user pega el
      // username con espacios, register + login automático usan el mismo
      // valor y evitamos el drift "registrado con espacios / login falla".
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();
      await register({ username: cleanUsername, email: cleanEmail, password });
      // Login automatico tras registro exitoso.
      // Nota: LoginResponse no incluye email (F18 - privacy minimization).
      // El email se obtiene via GET /api/v1/perfil/ una vez autenticado.
      const loginRes = await login({ username: cleanUsername, password });
      await setSession(loginRes.token, loginRes.user_id);
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
      <Heading level={1}>Crear cuenta</Heading>
      <Text style={styles.subtitle}>Necesitamos algunos datos basicos.</Text>

      <View>
        <FormField
          label="Nombre de usuario"
          helper="El que usarás para entrar después. No es tu email. Mínimo 3 caracteres."
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
          textContentType="username"
        />
        <FormField
          label="Email"
          helper="Lo usamos para recuperar tu contraseña si la olvidas."
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormField
          label="Contraseña"
          helper="Mínimo 10 caracteres."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
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
