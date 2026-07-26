/**
 * MisFavoritosScreen: lista los candidatos que el usuario marco como favoritos.
 * Tap en la card -> DetalleCandidato. Boton "Quitar" -> deshace el favorito.
 */

import React from "react";
import { Pressable, ScrollView } from "react-native";
import { H1, Paragraph, Separator, Spinner, YStack } from "tamagui";

import { getErrorMessage } from "../api/client";
import { useFavoritos, useToggleFavorito } from "../api/hooks";
import { EmptyState, FavoriteCard, Link, useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";

function initialsOf(nombre?: string, apellido?: string): string {
  return `${(nombre ?? "?")[0] ?? "?"}${(apellido ?? "")[0] ?? ""}`.toUpperCase();
}

export function MisFavoritosScreen({
  navigation,
}: RootStackScreenProps<"MisFavoritos">) {
  const favoritosQ = useFavoritos();
  const toggleFav = useToggleFavorito();
  const toast = useToast();

  const items = favoritosQ.data ?? [];

  function handleQuitar(candidatoId: number) {
    toggleFav.mutate(candidatoId, {
      onSuccess: () =>
        toast.success("Quitado de favoritos", "El candidato ya no esta en tu lista."),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <YStack gap="$2">
          <H1 color="$text">Mis favoritos</H1>
          <Paragraph color="$textSecondary">
            Los candidatos que marcaste con favorito. Tap para ver el detalle.
          </Paragraph>
        </YStack>

        <Separator />

        {favoritosQ.isLoading ? (
          <YStack alignItems="center" padding="$4">
            <Spinner size="large" />
          </YStack>
        ) : items.length === 0 ? (
          <EmptyState
            icon="heart"
            title="Aun no tienes favoritos"
            description="Vuelve al ranking y toca Favorito en las cards que te interesen."
            actionLabel="Ver ranking"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <YStack gap="$3">
            {items.map((f) => {
              const c = f.candidato_data;
              if (!c || c.id == null) return null;
              return (
                <Pressable
                  key={f.id}
                  onPress={() =>
                    navigation.navigate("DetalleCandidato", {
                      candidatoId: c.id!,
                      breakdown: null,
                      matchPct: 0,
                      confianza: "TENTATIVA",
                    })
                  }
                >
                  <FavoriteCard
                    name={`${c.nombre ?? ""} ${c.apellido ?? ""}`.trim()}
                    partido={c.partido ?? ""}
                    matchPercent={0}
                    addedAt=""
                    onRemove={() => handleQuitar(c.id!)}
                  />
                </Pressable>
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
