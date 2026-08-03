/**
 * Screen de Login: username + password.
 *
 * Migrado a design system nativo (RN + tokens). Antes usaba Tamagui
 * (H1, Paragraph, YStack) — reemplazado por View + Text con typography.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { login } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import {
  Button,
  FormField,
  Heading,
  Link,
  ThemeToggle,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function LoginScreen({ navigation }: RootStackScreenProps<"Login">) {
  const c = useThemeColors();
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
      // Defensive trim: paste desde password manager puede meter espacios.
      // NO trimeamos la password (espacios pueden ser legitimos).
      const cleanUsername = username.trim();
      const res = await login({ username: cleanUsername, password });
      // F18: email ya no viene en el login response (privacy minimization).
      // Se obtiene via GET /perfil/ cuando se necesita (ej. HomeScreen saludo).
      await setSession(res.token, res.user_id);
    } catch (err) {
      toast.error("No pudimos iniciar sesion", getErrorMessage(err));
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
        themeWrap: { alignItems: "center", marginTop: spacing.sp4 },
      }),
    [c],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Heading level={1}>VotoAFin</Heading>
      <Text style={styles.subtitle}>
        Ingresa a tu cuenta para encontrar tu candidato ideal.
      </Text>

      <View>
        <FormField
          label="Nombre de usuario"
          helper="No es tu email — es el usuario que elegiste al registrarte."
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
        />
        <FormField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
        />
      </View>

      <Button onPress={handleLogin} disabled={!canSubmit} loading={loading}>
        {loading ? "Entrando..." : "Iniciar sesión"}
      </Button>

      <Link
        block
        onPress={() => navigation.navigate("Register")}
        accessibilityLabel="Ir a registro"
      >
        No tengo cuenta — Registrarme
      </Link>

      <Link
        block
        onPress={() => navigation.navigate("PasswordResetRequest")}
        accessibilityLabel="Recuperar contraseña"
      >
        Olvidé mi contraseña
      </Link>

      <Link
        block
        onPress={enterGuestMode}
        accessibilityLabel="Probar sin cuenta"
      >
        Probar sin cuenta →
      </Link>

      <View style={styles.themeWrap}>
        <ThemeToggle />
      </View>
    </ScrollView>
  );
}
