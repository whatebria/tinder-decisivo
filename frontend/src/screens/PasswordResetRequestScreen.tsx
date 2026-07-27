/**
 * PasswordResetRequestScreen: usuario ingresa su email para recibir el link.
 * NO revela si el email existe (siempre muestra el mismo mensaje).
 *
 * Migrado a design system nativo (RN + tokens). Antes usaba Tamagui.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { useRequestPasswordReset } from "../api/hooks";
import { Button, Input, Link, useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function PasswordResetRequestScreen({
  navigation,
}: RootStackScreenProps<"PasswordResetRequest">) {
  const c = useThemeColors();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const requestReset = useRequestPasswordReset();
  const toast = useToast();

  const canSubmit = email.length > 3 && !requestReset.isPending;

  async function handleSubmit() {
    try {
      const result = await requestReset.mutateAsync(email);
      setSent(true);
      // En DEBUG=True el backend nos devuelve el link (para testing).
      setDevLink(result.reset_link ?? null);
    } catch (err) {
      toast.error("No pudimos procesar tu solicitud", getErrorMessage(err));
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
        titleSuccess: { ...typography.h1, color: c.success },
        title: { ...typography.h1, color: c.text },
        body: { ...typography.body, color: c.text },
        subtle: { ...typography.small, color: c.textSecondary },
        subtitle: { ...typography.body, color: c.textSecondary },
        devBox: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          gap: spacing.sp2,
        },
        devLabel: {
          ...typography.small,
          color: c.textSecondary,
          fontWeight: "700",
        },
        devLink: {
          ...typography.small,
          color: c.primary,
        },
      }),
    [c],
  );

  if (sent) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titleSuccess}>Revisa tu email</Text>
        <Text style={styles.body}>
          Si esa direccion tiene una cuenta, te enviamos un link para
          restablecer tu contrasena. El link expira en 1 hora.
        </Text>
        <Text style={styles.subtle}>No aparece? Revisa la carpeta de spam.</Text>

        {devLink ? (
          <View style={styles.devBox}>
            <Text style={styles.devLabel}>
              Link de desarrollo (solo visible en DEBUG=True):
            </Text>
            <Text style={styles.devLink}>{devLink}</Text>
            <Button
              onPress={() => {
                const url = new URL(devLink);
                const token = url.searchParams.get("token") ?? "";
                navigation.replace("PasswordResetConfirm", { token });
              }}
            >
              Continuar con este link
            </Button>
          </View>
        ) : null}

        <Link block onPress={() => navigation.replace("Login")}>
          Volver al login
        </Link>
        <Link
          block
          onPress={() =>
            navigation.navigate("PasswordResetConfirm", { token: "" })
          }
        >
          Ya tengo un token
        </Link>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Olvidaste tu contrasena?</Text>
      <Text style={styles.subtitle}>
        Ingresa el email con el que te registraste. Te enviaremos un link para
        crear una nueva.
      </Text>

      <Input
        placeholder="tu@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessibilityLabel="Email"
      />

      <Button
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={requestReset.isPending}
      >
        Enviar link
      </Button>

      <Link block onPress={() => navigation.replace("Login")}>
        Volver al login
      </Link>
    </ScrollView>
  );
}
