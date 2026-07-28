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
      // Trim defensivo: consistente con LoginScreen. Si el user pega el
      // username con espacios, register + login automático usan el mismo
      // valor y evitamos el drift "registrado con espacios / login falla".
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();
      await register({ username: cleanUsername, email: cleanEmail, password });
      // Login automatico tras registro exitoso
      const loginRes = await login({ username: cleanUsername, password });
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
        inputs: { gap: spacing.sp4 },
        field: { gap: spacing.sp2 },
        label: { ...typography.small, color: c.text, fontWeight: "600" },
        hint: { ...typography.small, color: c.textSecondary },
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
        <View style={styles.field}>
          <Text nativeID="reg-username-label" style={styles.label}>
            Nombre de usuario
          </Text>
          <Text style={styles.hint}>
            El que usarás para entrar después. No es tu email.
          </Text>
          <Input
            placeholder="mínimo 3 caracteres"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username-new"
            textContentType="username"
            accessibilityLabel="Nombre de usuario"
            aria-labelledby="reg-username-label"
          />
        </View>
        <View style={styles.field}>
          <Text nativeID="reg-email-label" style={styles.label}>
            Email
          </Text>
          <Text style={styles.hint}>
            Lo usamos para recuperar tu contraseña si la olvidas.
          </Text>
          <Input
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            accessibilityLabel="Email"
            aria-labelledby="reg-email-label"
          />
        </View>
        <View style={styles.field}>
          <Text nativeID="reg-password-label" style={styles.label}>
            Contraseña
          </Text>
          <Input
            placeholder="mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            accessibilityLabel="Contraseña"
            aria-labelledby="reg-password-label"
          />
        </View>
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
