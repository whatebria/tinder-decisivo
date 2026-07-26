/**
 * Detalle del candidato: info + radar grande + noticias recientes.
 * Recibe candidatoId y breakdown por route params.
 */

import React, { useEffect } from "react";
import { Image, Linking, ScrollView } from "react-native";
import {
  Button,
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
import {
  breakdownToChartData,
} from "../api/endpoints";
import { useCandidato, useNoticiasCandidato } from "../api/hooks";
import { RadarChart } from "../components/RadarChart";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";

export function DetalleCandidatoScreen({
  route,
  navigation,
}: RootStackScreenProps<"DetalleCandidato">) {
  const { candidatoId, breakdown, matchPct, confianza } = route.params;
  const toast = useToast();
  const candidatoQuery = useCandidato(candidatoId);
  const noticiasQuery = useNoticiasCandidato(candidatoId);
  const candidato = candidatoQuery.data ?? null;
  const noticias = noticiasQuery.data ?? [];
  const loading = candidatoQuery.isLoading;

  useEffect(() => {
    if (candidatoQuery.error) {
      toast.error("Error cargando candidato", getErrorMessage(candidatoQuery.error));
    }
  }, [candidatoQuery.error, toast]);

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (!candidato) {
    return (
      <YStack flex={1} padding="$5" justifyContent="center" alignItems="center" backgroundColor="$background" gap="$3">
        <Paragraph color="$textSecondary">Candidato no encontrado.</Paragraph>
        <Button onPress={() => navigation.goBack()}>Volver</Button>
      </YStack>
    );
  }

  const chartData = breakdownToChartData(breakdown);
  const scoreCol = getMatchColor(matchPct);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        {/* Header */}
        <XStack gap="$4" alignItems="center">
          {candidato.profile_picture ? (
            <Image
              source={{ uri: candidato.profile_picture }}
              style={{ width: 72, height: 72, borderRadius: 36 }}
              accessibilityLabel={`Foto de ${candidato.nombre}`}
            />
          ) : null}
          <YStack flex={1}>
            <H1 color="$text" numberOfLines={2}>
              {candidato.nombre} {candidato.apellido}
            </H1>
            {candidato.partido ? (
              <Paragraph color="$textSecondary">{candidato.partido}</Paragraph>
            ) : null}
          </YStack>
        </XStack>

        {/* Score */}
        <Card padding="$4" borderWidth={1} borderColor="$border">
          <XStack alignItems="center" gap="$3">
            <SizableText size="$10" fontWeight="800" color={scoreCol as any}>
              {formatMatchPercentage(matchPct)}
            </SizableText>
            <YStack flex={1}>
              <SizableText size="$4" color="$text" fontWeight="700">
                de afinidad
              </SizableText>
              <SizableText size="$2" color="$textSecondary">
                Confianza: {confianza}
              </SizableText>
            </YStack>
          </XStack>
        </Card>

        {/* Radar grande */}
        {Object.keys(chartData).length >= 3 ? (
          <YStack alignItems="center" gap="$2" paddingVertical="$3">
            <H3 color="$text">Afinidad por eje tematico</H3>
            <RadarChart data={chartData} size={280} color={scoreCol} />
          </YStack>
        ) : null}

        {/* Bio */}
        {candidato.bio ? (
          <YStack gap="$2">
            <H3 color="$text">Sobre {candidato.nombre}</H3>
            <Paragraph color="$textSecondary">{candidato.bio}</Paragraph>
          </YStack>
        ) : null}

        <Separator />

        {/* Noticias */}
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="baseline">
            <H3 color="$text">Noticias recientes</H3>
            <SizableText size="$2" color="$textSecondary">
              {noticias.length} items
            </SizableText>
          </XStack>
          {noticias.length === 0 ? (
            <Paragraph color="$textSecondary">
              Aun no hay noticias cargadas para este candidato. Corre en el backend:
              {"\n"}
              <SizableText fontFamily="$mono" size="$2">
                uv run python manage.py fetch_noticias
              </SizableText>
            </Paragraph>
          ) : (
            <YStack gap="$3">
              {noticias.slice(0, 10).map((n) => (
                <Card
                  key={n.id}
                  padding="$3"
                  borderWidth={1}
                  borderColor="$border"
                  pressStyle={{ scale: 0.98 }}
                  onPress={() => n.url && Linking.openURL(n.url)}
                  accessibilityLabel={`Abrir noticia: ${n.titulo}`}
                >
                  <YStack gap="$1">
                    <SizableText size="$4" fontWeight="700" color="$text" numberOfLines={2}>
                      {n.titulo}
                    </SizableText>
                    {n.fuente ? (
                      <SizableText size="$2" color="$primary">
                        {n.fuente}
                      </SizableText>
                    ) : null}
                    {n.descripcion ? (
                      <Paragraph size="$2" color="$textSecondary" numberOfLines={3}>
                        {n.descripcion}
                      </Paragraph>
                    ) : null}
                  </YStack>
                </Card>
              ))}
            </YStack>
          )}
        </YStack>

        <YStack flex={1} />
        <TextButton onPress={() => navigation.goBack()}>
          Volver al ranking
        </TextButton>
      </YStack>
    </ScrollView>
  );
}
