/**
 * MiDecisionScreen: muestra la(s) decision(es) final(es) del usuario por
 * tipo de eleccion. Permite eliminar la decision para cambiarla.
 */

import React from "react";
import { ScrollView } from "react-native";
import {
  Card,
  H1,
  H3,
  Paragraph,
  Separator,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from "tamagui";

import { getErrorMessage } from "../api/client";
import { useDecisiones, useDeleteDecision } from "../api/hooks";
import { Button } from "../components";
import { TextButton } from "../components";
import { useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useThemeColors } from "../theme/useTheme";

export function MiDecisionScreen({
  navigation,
}: RootStackScreenProps<"MiDecision">) {
  const theme = useThemeColors();
  const decisionesQ = useDecisiones();
  const deleteDecision = useDeleteDecision();
  const toast = useToast();

  const items = decisionesQ.data ?? [];

  function handleDelete(id: number) {
    deleteDecision.mutate(id, {
      onSuccess: () =>
        toast.success("Decision eliminada", "Puedes elegir un nuevo candidato."),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <YStack gap="$2">
          <H1 color="$text">Mi voto final</H1>
          <Paragraph color="$textSecondary">
            Este es el candidato que elegiste para cada eleccion. Puedes cambiar
            tu decision cuando quieras.
          </Paragraph>
        </YStack>

        <Separator />

        {decisionesQ.isLoading ? (
          <YStack alignItems="center" padding="$4">
            <Spinner size="large" />
          </YStack>
        ) : items.length === 0 ? (
          <YStack gap="$3">
            <Paragraph color="$textSecondary">
              Todavia no elegiste un voto final. Vuelve al ranking, entra al
              detalle de un candidato y toca "Este es mi voto final".
            </Paragraph>
          </YStack>
        ) : (
          <YStack gap="$3">
            {items.map((d) => {
              const c = d.candidato_data;
              if (!c) return null;
              return (
                <Card
                  key={d.id}
                  padding="$4"
                  borderWidth={2}
                  borderColor={theme.primary}
                >
                  <YStack gap="$3">
                    <YStack gap="$1">
                      <SizableText size="$2" color="$textSecondary">
                        {d.tipo_eleccion_nombre}
                      </SizableText>
                      <H3 color="$text" numberOfLines={2}>
                        {c.nombre} {c.apellido}
                      </H3>
                      {c.partido ? (
                        <SizableText size="$3" color="$textSecondary">
                          {c.partido}
                        </SizableText>
                      ) : null}
                    </YStack>
                    <XStack gap="$2">
                      <Button
                        variant="danger"
                        fullWidth={false}
                        onPress={() => d.id != null && handleDelete(d.id)}
                        loading={deleteDecision.isPending}
                      >
                        Cambiar mi voto
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              );
            })}
          </YStack>
        )}

        <YStack flex={1} />
        <TextButton onPress={() => navigation.goBack()}>Volver</TextButton>
      </YStack>
    </ScrollView>
  );
}
