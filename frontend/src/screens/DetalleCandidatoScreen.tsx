/**
 * Detalle del candidato: info + radar grande + acciones (favorito, descartar,
 * marcar como voto final) + noticias recientes.
 * Recibe candidatoId y breakdown por route params.
 */

import React, { useEffect } from "react";
import { Image, Linking, ScrollView } from "react-native";
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
import { breakdownToChartData } from "../api/endpoints";
import {
  useCandidato,
  useDecisionActual,
  useDescartados,
  useFavoritos,
  useNoticiasCandidato,
  usePosturasCandidato,
  useSaveDecision,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import { BookmarkActions } from "../components";
import { Button } from "../components";
import { CandidatoPosturas } from "../components";
import { RadarChart } from "../components";
import { TextButton } from "../components";
import { useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";
import { useCuestionarioStore } from "../store/cuestionario";
import { useAuthStore } from "../store/auth";
import { useThemeColors } from "../theme/useTheme";

export function DetalleCandidatoScreen({
  route,
  navigation,
}: RootStackScreenProps<"DetalleCandidato">) {
  const c = useThemeColors();
  const { candidatoId, breakdown, matchPct, confianza } = route.params;
  const isGuest = useAuthStore((s) => s.isGuest);
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const toast = useToast();

  const candidatoQuery = useCandidato(candidatoId);
  const noticiasQuery = useNoticiasCandidato(candidatoId);
  const posturasQuery = usePosturasCandidato(candidatoId, tipoEleccionId);
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const decisionQ = useDecisionActual(tipoEleccionId);
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();
  const saveDecision = useSaveDecision();

  const candidato = candidatoQuery.data ?? null;
  const noticias = noticiasQuery.data ?? [];
  const loading = candidatoQuery.isLoading;

  const isFavorito = (favoritosQ.data ?? []).some(
    (f) => f.candidato === candidatoId
  );
  const isDescartado = (descartadosQ.data ?? []).some(
    (d) => d.candidato === candidatoId
  );
  const isMyVote = decisionQ.data?.candidato_elegido === candidatoId;

  useEffect(() => {
    if (candidatoQuery.error) {
      toast.error("Error cargando candidato", getErrorMessage(candidatoQuery.error));
    }
  }, [candidatoQuery.error, toast]);

  function handleSaveDecision() {
    if (!tipoEleccionId) {
      toast.error("Falta el tipo de eleccion", "Vuelve al inicio y elige un cuestionario.");
      return;
    }
    saveDecision.mutate(
      { candidatoId, tipoEleccionId },
      {
        onSuccess: () => toast.success("Voto guardado", "Guardamos tu decision final."),
        onError: (e) =>
          toast.error("No pudimos guardar tu voto", getErrorMessage(e)),
      }
    );
  }

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
        <TextButton onPress={() => navigation.goBack()}>Volver</TextButton>
      </YStack>
    );
  }

  const chartData = breakdownToChartData(breakdown);
  const scoreCol = getMatchColor(matchPct, c);

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
        <Card
          padding="$4"
          borderWidth={isMyVote ? 2 : 1}
          borderColor={isMyVote ? c.primary : "$border"}
        >
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
              {isMyVote ? (
                <SizableText size="$3" color={c.primary} fontWeight="700" marginTop="$1">
                  * Este es tu voto final
                </SizableText>
              ) : null}
            </YStack>
          </XStack>
        </Card>

        {/* Acciones (solo modo auth) */}
        {!isGuest ? (
          <YStack gap="$3">
            <BookmarkActions
              isFavorito={isFavorito}
              isDescartado={isDescartado}
              onToggleFavorito={() =>
                toggleFav.mutate(candidatoId, {
                  onError: (e) => toast.error("Error", getErrorMessage(e)),
                })
              }
              onToggleDescartado={() =>
                toggleDesc.mutate(candidatoId, {
                  onError: (e) => toast.error("Error", getErrorMessage(e)),
                })
              }
              loading={toggleFav.isPending || toggleDesc.isPending}
              size="lg"
            />
            {!isMyVote && !isDescartado ? (
              <Button
                variant="success"
                onPress={handleSaveDecision}
                loading={saveDecision.isPending}
              >
                Este es mi voto final
              </Button>
            ) : null}
          </YStack>
        ) : null}

        {/* Radar grande */}
        {Object.keys(chartData).length >= 3 ? (
          <YStack alignItems="center" gap="$2" paddingVertical="$3">
            <H3 color="$text">Afinidad por eje tematico</H3>
            <RadarChart data={chartData} size={280} color={scoreCol} />
          </YStack>
        ) : null}

        {/* Resumen: bio + propuesta electoral */}
        {candidato.bio || candidato.propuesta_electoral ? (
          <YStack gap="$2">
            <H3 color="$text">Sobre {candidato.nombre}</H3>
            {candidato.bio ? (
              <Paragraph color="$textSecondary">{candidato.bio}</Paragraph>
            ) : null}
            {candidato.propuesta_electoral ? (
              <YStack gap="$1" marginTop="$2">
                <SizableText size="$3" color="$text" fontWeight="700">
                  Propuesta electoral
                </SizableText>
                <Paragraph color="$textSecondary">
                  {candidato.propuesta_electoral}
                </Paragraph>
              </YStack>
            ) : null}
          </YStack>
        ) : null}

        <Separator />

        {/* Posturas por eje */}
        <YStack gap="$3">
          <H3 color="$text">Posturas por tema</H3>
          <CandidatoPosturas
            posturas={posturasQuery.data ?? []}
            loading={posturasQuery.isLoading}
          />
        </YStack>

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
              Aun no hay noticias cargadas para este candidato.
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
