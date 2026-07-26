/**
 * Ranking de candidatos post-submit.
 * Llama POST /match-candidatos/ y muestra cards ordenadas por match_percentage.
 * Filtra descartados (no aparecen en el ranking; se pueden recuperar desde
 * MisDescartadosScreen).
 * Marca con badge al candidato elegido como decision final.
 */

import React, { useEffect, useMemo } from "react";
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
import {
  breakdownToChartData,
  type BreakdownPorEje,
} from "../api/endpoints";
import {
  useDecisionActual,
  useDescartados,
  useFavoritos,
  useMatchCandidatos,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import { BookmarkActions } from "../components/BookmarkActions";
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
import { colors } from "../theme/colors";

export function ResultadosScreen({
  navigation,
}: RootStackScreenProps<"Resultados">) {
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const reset = useCuestionarioStore((s) => s.reset);
  const toast = useToast();

  const matchMutation = useMatchCandidatos();
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const decisionQ = useDecisionActual(tipoEleccionId);
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();

  const allResults = matchMutation.data ? sortByMatchDesc(matchMutation.data) : [];
  const loading = matchMutation.isPending;

  // Filtra descartados del ranking (por decisión de UX)
  const descartadoIds = useMemo(
    () => new Set((descartadosQ.data ?? []).map((d) => d.candidato)),
    [descartadosQ.data]
  );
  const visibleResults = useMemo(
    () =>
      allResults.filter((r) => r.candidato_data.id != null && !descartadoIds.has(r.candidato_data.id)),
    [allResults, descartadoIds]
  );
  const hiddenCount = allResults.length - visibleResults.length;

  const favoritoIds = useMemo(
    () => new Set((favoritosQ.data ?? []).map((f) => f.candidato)),
    [favoritosQ.data]
  );
  const decisionCandidatoId = decisionQ.data?.candidato_elegido;

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

  function handleToggleFav(candidatoId: number) {
    toggleFav.mutate(candidatoId, {
      onError: (e) => toast.error("No pudimos actualizar favoritos", getErrorMessage(e)),
    });
  }

  function handleToggleDesc(candidatoId: number) {
    toggleDesc.mutate(candidatoId, {
      onError: (e) => toast.error("No pudimos actualizar descartados", getErrorMessage(e)),
    });
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
            Ordenados de mayor a menor afinidad. Tap en el nombre para ver el detalle.
          </Paragraph>
          {hiddenCount > 0 ? (
            <TextButton onPress={() => navigation.navigate("MisDescartados")}>
              {`${hiddenCount} candidato(s) descartado(s). Ver lista`}
            </TextButton>
          ) : null}
          {decisionQ.data ? (
            <TextButton onPress={() => navigation.navigate("MiDecision")}>
              Ya tienes una decision guardada. Ver mi voto
            </TextButton>
          ) : null}
        </YStack>

        <Separator />

        {visibleResults.length === 0 ? (
          <Paragraph color="$textSecondary">
            No hay candidatos para mostrar. Volve a intentarlo mas tarde.
          </Paragraph>
        ) : (
          <YStack gap="$3">
            {visibleResults.map((r, idx) => {
              const pct = Number(r.match_percentage);
              const scoreCol = getMatchColor(pct);
              const conf = getConfianzaBadge(r.confianza);
              const chartData = breakdownToChartData(
                r.breakdown_por_eje as BreakdownPorEje | null | undefined
              );
              const candidato = r.candidato_data;
              const candId = candidato.id!;
              const isFav = favoritoIds.has(candId);
              const isDecision = decisionCandidatoId === candId;

              return (
                <Card
                  key={r.id}
                  padding="$4"
                  borderWidth={isDecision ? 2 : 1}
                  borderColor={isDecision ? (colors.primary as any) : "$border"}
                >
                  <XStack gap="$4" alignItems="center">
                    {/* Info */}
                    <YStack
                      flex={1}
                      gap="$1"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() =>
                        navigation.navigate("DetalleCandidato", {
                          candidatoId: candId,
                          breakdown: r.breakdown_por_eje as BreakdownPorEje | null,
                          matchPct: pct,
                          confianza: r.confianza ?? "TENTATIVA",
                        })
                      }
                    >
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
                      {isDecision ? (
                        <SizableText size="$2" color={colors.primary} fontWeight="700">
                          * Tu voto
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

                  {/* Acciones */}
                  <YStack marginTop="$3">
                    <BookmarkActions
                      isFavorito={isFav}
                      isDescartado={false}
                      onToggleFavorito={() => handleToggleFav(candId)}
                      onToggleDescartado={() => handleToggleDesc(candId)}
                      loading={toggleFav.isPending || toggleDesc.isPending}
                      size="sm"
                    />
                  </YStack>
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
