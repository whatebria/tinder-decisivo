/**
 * Ranking de candidatos post-submit.
 *
 * En modo auth:  llama POST /match-candidatos/ (persiste).
 * En modo guest: llama POST /match-anonimo/ con respuestas locales (no persiste).
 *
 * Ademas filtra descartados y marca al candidato de la decision final.
 * Guests no ven bookmarks (los reemplaza un CTA de registrarse).
 */

import React, { useEffect, useMemo, useState } from "react";
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
  useMatchAnonimo,
  useMatchCandidatos,
  useTiposEleccion,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import { BookmarkActions } from "../components/BookmarkActions";
import { Badge, type BadgeVariant } from "../components/Badge";
import { Button } from "../components/Button";
import { RadarChart } from "../components/RadarChart";
import { ShareModal } from "../components/ShareModal";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";
import {
  formatMatchPercentage,
  getConfianzaBadge,
  getMatchColor,
  sortByMatchDesc,
} from "../services/matching";
import { buildShareText, fromMatchResults } from "../services/share";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { colors } from "../theme/colors";

/** Mapea el nivel de confianza del backend a la variante de Badge correcta. */
function confianzaToBadge(confianza: string | undefined): BadgeVariant {
  const key = (confianza ?? "TENTATIVA").toUpperCase();
  if (key === "ALTA") return "success";
  if (key === "MEDIA") return "warning";
  return "danger";
}

export function ResultadosScreen({
  navigation,
}: RootStackScreenProps<"Resultados">) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const reset = useCuestionarioStore((s) => s.reset);
  const getRespuestasParaAnonimo = useCuestionarioStore(
    (s) => s.getRespuestasParaAnonimo
  );
  const toast = useToast();

  // Dos mutations distintas. Solo se ejecuta la que corresponde al modo.
  const authMutation = useMatchCandidatos();
  const guestMutation = useMatchAnonimo();
  const activeMutation = isGuest ? guestMutation : authMutation;
  const tiposQ = useTiposEleccion();
  const [shareOpen, setShareOpen] = useState(false);

  // Bookmarking solo en modo auth. Los queries no se ejecutan si no hay token
  // porque el backend devuelve 401 (los hooks van a mostrar error, pero el UI
  // no los renderiza si isGuest).
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const decisionQ = useDecisionActual(tipoEleccionId);
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();

  const allResults = activeMutation.data ? sortByMatchDesc(activeMutation.data) : [];
  const loading = activeMutation.isPending;

  // Filtra descartados del ranking (por decisión de UX). Solo en auth.
  const descartadoIds = useMemo(
    () =>
      isGuest ? new Set<number>() : new Set((descartadosQ.data ?? []).map((d) => d.candidato)),
    [descartadosQ.data, isGuest]
  );
  const visibleResults = useMemo(
    () =>
      allResults.filter(
        (r) => r.candidato_data.id != null && !descartadoIds.has(r.candidato_data.id)
      ),
    [allResults, descartadoIds]
  );
  const hiddenCount = allResults.length - visibleResults.length;

  const favoritoIds = useMemo(
    () =>
      isGuest ? new Set<number>() : new Set((favoritosQ.data ?? []).map((f) => f.candidato)),
    [favoritosQ.data, isGuest]
  );
  const decisionCandidatoId = isGuest ? undefined : decisionQ.data?.candidato_elegido;

  useEffect(() => {
    if (!tipoEleccionId) return;
    if (isGuest) {
      guestMutation.mutate({
        tipoEleccionId,
        respuestas: getRespuestasParaAnonimo(),
      });
    } else {
      authMutation.mutate(tipoEleccionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEleccionId, isGuest]);

  useEffect(() => {
    if (activeMutation.error) {
      toast.error("No pudimos calcular tus matches", getErrorMessage(activeMutation.error));
    }
  }, [activeMutation.error, toast]);

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
          {isGuest ? (
            <Card
              padding="$3"
              borderWidth={2}
              borderColor={colors.primary as any}
              backgroundColor="$backgroundHover"
            >
              <YStack gap="$2">
                <SizableText size="$3" color="$text" fontWeight="700">
                  * Modo invitado
                </SizableText>
                <SizableText size="$2" color="$textSecondary">
                  Tu match no se guardo. Crea una cuenta para conservarlo,
                  marcar favoritos y elegir tu voto final.
                </SizableText>
                <Button onPress={exitGuestMode}>
                  Crear una cuenta
                </Button>
              </YStack>
            </Card>
          ) : null}
          {hiddenCount > 0 ? (
            <TextButton onPress={() => navigation.navigate("MisDescartados")}>
              {`${hiddenCount} candidato(s) descartado(s). Ver lista`}
            </TextButton>
          ) : null}
          {!isGuest && decisionQ.data ? (
            <TextButton onPress={() => navigation.navigate("MiDecision")}>
              Ya tienes una decision guardada. Ver mi voto
            </TextButton>
          ) : null}
        </YStack>

        <Separator />

        {visibleResults.length === 0 ? (
          <Paragraph color="$textSecondary">
            No hay candidatos para mostrar. Intenta nuevamente mas tarde.
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
                  key={r.id ?? candId}
                  padding="$4"
                  borderWidth={isDecision ? 2 : 1}
                  borderColor={isDecision ? (colors.primary as any) : "$border"}
                >
                  <XStack gap="$4" alignItems="center">
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
                        <YStack alignItems="flex-start">
                          <Badge variant="neutral">{candidato.partido}</Badge>
                        </YStack>
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
                        <Badge variant={confianzaToBadge(r.confianza)}>
                          {`${conf.label} (${r.preguntas_consideradas}p)`}
                        </Badge>
                      </XStack>
                    </YStack>
                    {Object.keys(chartData).length >= 3 ? (
                      <RadarChart data={chartData} size={110} showLabels={false} color={scoreCol} />
                    ) : null}
                  </XStack>

                  {/* Acciones solo en modo auth */}
                  {!isGuest ? (
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
                  ) : null}
                </Card>
              );
            })}
          </YStack>
        )}

        <YStack flex={1} />
        {visibleResults.length > 0 ? (
          <Button onPress={() => setShareOpen(true)} variant="secondary">
            Compartir mi ranking
          </Button>
        ) : null}
        <TextButton onPress={handleVolver}>Volver al inicio</TextButton>
      </YStack>

      <ShareModal
        visible={shareOpen}
        text={buildShareText({
          tipoNombre:
            (tiposQ.data ?? []).find((t) => t.id === tipoEleccionId)?.nombre ??
            "Eleccion",
          matches: fromMatchResults(visibleResults),
        })}
        onClose={() => setShareOpen(false)}
      />
    </ScrollView>
  );
}
