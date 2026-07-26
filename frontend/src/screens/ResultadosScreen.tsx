/**
 * Ranking de candidatos post-submit.
 * Llama POST /match-candidatos/ y muestra cards ordenadas por match_percentage.
 */

import React, { useEffect } from "react";
import { ScrollView } from "react-native";
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
  type BreakdownPorEje,
} from "../api/endpoints";
import { useMatchCandidatos } from "../api/hooks";
import { RadarChart } from "../components/RadarChart";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";
import {
  formatMatchPercentage,
  getConfianzaBadge,
  getMatchColor,
  sortByMatchDesc,
} from "../services/matching";
import { useCuestionarioStore } from "../store/cuestionario";

export function ResultadosScreen({
  navigation,
}: RootStackScreenProps<"Resultados">) {
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const reset = useCuestionarioStore((s) => s.reset);
  const toast = useToast();
  const matchMutation = useMatchCandidatos();
  const results = matchMutation.data ? sortByMatchDesc(matchMutation.data) : [];
  const loading = matchMutation.isPending;

  useEffect(() => {
    if (tipoEleccionId) matchMutation.mutate(tipoEleccionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEleccionId]);

  useEffect(() => {
    if (matchMutation.error) {
      toast.error("No pudimos calcular tus matches", getErrorMessage(matchMutation.error));
    }
  }, [matchMutation.error, toast]);

  function handleVolver() {
    reset();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background" gap="$3">
        <Spinner size="large" />
        <Paragraph color="$textSecondary">Calculando tus matches...</Paragraph>
      </YStack>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <YStack gap="$2">
          <H1 color="$text">Tus matches</H1>
          <Paragraph color="$textSecondary">
            Ordenados de mayor a menor afinidad. Tap para ver el detalle.
          </Paragraph>
        </YStack>

        <Separator />

        {results.length === 0 ? (
          <Paragraph color="$textSecondary">
            No pudimos calcular matches. Volve a intentarlo mas tarde.
          </Paragraph>
        ) : (
          <YStack gap="$3">
            {results.map((r, idx) => {
              const pct = Number(r.match_percentage);
              const scoreCol = getMatchColor(pct);
              const conf = getConfianzaBadge(r.confianza);
              const chartData = breakdownToChartData(
                r.breakdown_por_eje as BreakdownPorEje | null | undefined
              );
              const candidato = r.candidato_data;
              return (
                <Card
                  key={r.id}
                  padding="$4"
                  borderWidth={1}
                  borderColor="$border"
                  pressStyle={{ scale: 0.98 }}
                  onPress={() =>
                    candidato.id &&
                    navigation.navigate("DetalleCandidato", {
                      candidatoId: candidato.id,
                      breakdown: r.breakdown_por_eje as BreakdownPorEje | null,
                      matchPct: pct,
                      confianza: r.confianza ?? "TENTATIVA",
                    })
                  }
                >
                  <XStack gap="$4" alignItems="center">
                    {/* Info */}
                    <YStack flex={1} gap="$1">
                      <XStack alignItems="baseline" gap="$2">
                        <SizableText size="$2" color="$textSecondary">
                          #{idx + 1}
                        </SizableText>
                        <H3 color="$text" flex={1} numberOfLines={2}>
                          {candidato.nombre} {candidato.apellido}
                        </H3>
                      </XStack>
                      {candidato.partido ? (
                        <SizableText size="$3" color="$textSecondary">
                          {candidato.partido}
                        </SizableText>
                      ) : null}
                      <XStack gap="$2" marginTop="$2" alignItems="center">
                        <SizableText size="$8" fontWeight="800" color={scoreCol as any}>
                          {formatMatchPercentage(pct)}
                        </SizableText>
                        <SizableText size="$2" color={conf.color as any}>
                          {conf.label} ({r.preguntas_consideradas}p)
                        </SizableText>
                      </XStack>
                    </YStack>
                    {/* Mini radar */}
                    {Object.keys(chartData).length >= 3 ? (
                      <RadarChart data={chartData} size={110} showLabels={false} color={scoreCol} />
                    ) : null}
                  </XStack>
                </Card>
              );
            })}
          </YStack>
        )}

        <YStack flex={1} />
        <TextButton onPress={handleVolver}>Volver al inicio</TextButton>
      </YStack>
    </ScrollView>
  );
}
