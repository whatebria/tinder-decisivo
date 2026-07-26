/**
 * MisDescartadosScreen: lista los candidatos que el usuario descarto.
 * Un tap en el boton restaura el candidato al ranking (des-descarta).
 */

import React from "react";
import { ScrollView } from "react-native";
import { H1, Paragraph, Separator, Spinner, YStack } from "tamagui";

import { getErrorMessage } from "../api/client";
import { useDescartados, useToggleDescartado } from "../api/hooks";
import { DiscardedCard, EmptyState, Link, useToast } from "../components";
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
          <EmptyState
            icon="close"
            title="No hay descartados"
            description="Aun no has descartado ningun candidato."
          />
        ) : (
          <YStack gap="$3">
            {items.map((d) => {
              const c = d.candidato_data;
              if (!c || c.id == null) return null;
              return (
                <DiscardedCard
                  key={d.id}
                  name={`${c.nombre ?? ""} ${c.apellido ?? ""}`.trim()}
                  partido={c.partido ?? ""}
                  matchPercent={0}
                  onRestore={() => handleRestore(c.id!)}
                />
              );
            })}
          </YStack>
        )}

        <YStack flex={1} />
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </YStack>
    </ScrollView>
  );
}
