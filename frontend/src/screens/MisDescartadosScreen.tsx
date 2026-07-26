/**
 * MisDescartadosScreen: lista los candidatos que el usuario descarto.
 * Un tap en el boton restaura el candidato al ranking (des-descarta).
 */

import React from "react";
import { ScrollView } from "react-native";
import {
  Card,
  H1,
  Paragraph,
  Separator,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from "tamagui";

import { getErrorMessage } from "../api/client";
import { useDescartados, useToggleDescartado } from "../api/hooks";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";

export function MisDescartadosScreen({
  navigation,
}: RootStackScreenProps<"MisDescartados">) {
  const descartadosQ = useDescartados();
  const toggleDesc = useToggleDescartado();
  const toast = useToast();

  const items = descartadosQ.data ?? [];

  function handleRestore(candidatoId: number) {
    toggleDesc.mutate(candidatoId, {
      onSuccess: () => toast.success("Restaurado", "El candidato vuelve al ranking."),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <YStack gap="$2">
          <H1 color="$text">Mis descartados</H1>
          <Paragraph color="$textSecondary">
            Estos candidatos no aparecen en tu ranking. Puedes restaurarlos.
          </Paragraph>
        </YStack>

        <Separator />

        {descartadosQ.isLoading ? (
          <YStack alignItems="center" padding="$4">
            <Spinner size="large" />
          </YStack>
        ) : items.length === 0 ? (
          <Paragraph color="$textSecondary">
            No has descartado ningun candidato aun.
          </Paragraph>
        ) : (
          <YStack gap="$3">
            {items.map((d) => {
              const c = d.candidato_data;
              if (!c) return null;
              return (
                <Card key={d.id} padding="$4" borderWidth={1} borderColor="$border">
                  <XStack gap="$3" alignItems="center">
                    <YStack flex={1} gap="$1" alignItems="flex-start">
                      <SizableText size="$5" fontWeight="700" color="$text" numberOfLines={2}>
                        {c.nombre} {c.apellido}
                      </SizableText>
                      {c.partido ? <Badge variant="neutral">{c.partido}</Badge> : null}
                    </YStack>
                    <Button
                      variant="primary"
                      fullWidth={false}
                      onPress={() => c.id != null && handleRestore(c.id)}
                      loading={toggleDesc.isPending}
                    >
                      Restaurar
                    </Button>
                  </XStack>
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
