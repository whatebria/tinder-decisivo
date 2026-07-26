/**
 * PasswordResetRequestScreen: usuario ingresa su email para recibir el link.
 * NO revela si el email existe (siempre muestra el mismo mensaje).
 */

import React, { useState } from "react";
import { ScrollView } from "react-native";
import { H1, Paragraph, SizableText, YStack } from "tamagui";

import { getErrorMessage } from "../api/client";
import { useRequestPasswordReset } from "../api/hooks";
import { FormInput } from "../components/FormInput";
import { Button } from "../components/Button";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";

export function PasswordResetRequestScreen({
  navigation,
}: RootStackScreenProps<"PasswordResetRequest">) {
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

  if (sent) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack
          flex={1}
          padding="$6"
          gap="$4"
          backgroundColor="$background"
          justifyContent="center"
        >
          <H1 color="$success">Revisa tu email</H1>
          <Paragraph color="$text">
            Si esa direccion tiene una cuenta, te enviamos un link para
            restablecer tu contrasena. El link expira en 1 hora.
          </Paragraph>
          <Paragraph color="$textSecondary" size="$2">
            No aparece? Revisa la carpeta de spam.
          </Paragraph>

          {devLink ? (
            <YStack
              padding="$3"
              backgroundColor="$backgroundHover"
              borderRadius="$3"
              gap="$2"
            >
              <SizableText size="$2" color="$textSecondary" fontWeight="700">
                Link de desarrollo (solo visible en DEBUG=True):
              </SizableText>
              <SizableText size="$2" fontFamily="$mono" color="$primary">
                {devLink}
              </SizableText>
              <Button
                fullWidth
                onPress={() => {
                  const url = new URL(devLink);
                  const token = url.searchParams.get("token") ?? "";
                  navigation.replace("PasswordResetConfirm", { token });
                }}
              >
                Continuar con este link
              </Button>
            </YStack>
          ) : null}

          <TextButton onPress={() => navigation.replace("Login")}>
            Volver al login
          </TextButton>
          <TextButton
            onPress={() => navigation.navigate("PasswordResetConfirm", { token: "" })}
          >
            Ya tengo un token
          </TextButton>
        </YStack>
      </ScrollView>
    );
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
        <H1 color="$text">Olvidaste tu contrasena?</H1>
        <Paragraph color="$textSecondary">
          Ingresa el email con el que te registraste. Te enviaremos un link para
          crear una nueva.
        </Paragraph>

        <FormInput
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

        <TextButton onPress={() => navigation.replace("Login")}>
          Volver al login
        </TextButton>
      </YStack>
    </ScrollView>
  );
}
