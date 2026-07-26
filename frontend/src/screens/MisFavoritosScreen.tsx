/**
 * MisFavoritosScreen: lista los candidatos que el usuario marco como favoritos.
 * Tap en la card -> DetalleCandidato. Boton "Quitar" -> deshace el favorito.
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
import { useFavoritos, useToggleFavorito } from "../api/hooks";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";

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
          <Paragraph color="$textSecondary">
            Todavia no marcaste ningun candidato como favorito. Vuelve al
            ranking y toca "Favorito" en las cards que te interesen.
          </Paragraph>
        ) : (
          <YStack gap="$3">
            {items.map((f) => {
              const c = f.candidato_data;
              if (!c || c.id == null) return null;
              return (
                <Card
                  key={f.id}
                  padding="$4"
                  borderWidth={1}
                  borderColor="$border"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() =>
                    navigation.navigate("DetalleCandidato", {
                      candidatoId: c.id!,
                      breakdown: null,
                      matchPct: 0,
                      confianza: "TENTATIVA",
                    })
                  }
                >
                  <XStack gap="$3" alignItems="center">
                    <YStack flex={1} gap="$1" alignItems="flex-start">
                      <SizableText size="$5" fontWeight="700" color="$text" numberOfLines={2}>
                        {c.nombre} {c.apellido}
                      </SizableText>
                      {c.partido ? <Badge variant="neutral">{c.partido}</Badge> : null}
                    </YStack>
                    <Button
                      variant="danger"
                      fullWidth={false}
                      onPress={() => handleQuitar(c.id!)}
                      loading={toggleFav.isPending}
                    >
                      Quitar
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
