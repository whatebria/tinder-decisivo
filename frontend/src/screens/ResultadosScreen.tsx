/**
 * Resultados: ranking de candidatos post-cuestionario.
 *
 * Basado en design-system-lowfi.html · Resultados.
 * Estructura:
 *   1. ScreenTopBar (back + eleccion + "Tus resultados")
 *   2. Guest CTA (si corresponde) + shortcuts (descartados, decision)
 *   3. Filtro por partido (chips) - opcional
 *   4. ResultadoHero (top match) con radar grande + labels
 *   5. Ranking en GRID (RankingCard desde #2 en adelante) con radar mediano.
 *      Grid responsive: 1 columna en pantallas <400px, 2+ arriba.
 *   6. Footer: compartir, comparar, volver
 *
 * En modo auth:  POST /match-candidatos/ (persiste).
 * En modo guest: POST /match-anonimo/ con respuestas locales (no persiste).
 */

import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { getErrorMessage } from "../api/client";
import { breakdownToChartData, type BreakdownPorEje } from "../api/endpoints";
import {
  useDescartados,
  useFavoritos,
  useMatchAnonimo,
  useMatchCandidatos,
  usePerfil,
  useTiposEleccion,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import {
  Badge,
  type BadgeVariant,
  BookmarkActions,
  AppShell,
  Button,
  Chip,
  CoachMarkTour,
  Link,
  RankingCard,
  ResultadoHero,
  ScreenTopBar,
  ShareModal,
  Spinner,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  formatMatchPercentage,
  getConfianzaBadge,
  getConfianzaBadgeVariant,
  getMatchColor,
  sortByMatchDesc,
} from "../services/matching";
import { buildShareText, fromMatchResults } from "../services/share";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { partitionTipos, useElectionsPrefsStore } from "../store/electionsPrefs";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function ResultadosScreen({
  navigation,
}: RootStackScreenProps<"Resultados">) {
  const c = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  // Grid del ranking: 1 col en pantallas apretadas (iPhone SE-ish),
  // 2 col en telefonos normales, 3 en tablets, 4 en desktop. Los
  // breakpoints son intencionalmente conservadores (>=1000 recien tres
  // columnas) porque cada card lleva un radar 140px + labels; con menos
  // ancho la card se aprieta y el radar pierde legibilidad.
  const rankingCols = screenWidth < 400 ? 1 : screenWidth < 720 ? 2 : screenWidth < 1000 ? 3 : 4;
  const isGuest = useAuthStore((s) => s.isGuest);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const perfilQ = usePerfil();
  const comunaUsuario = perfilQ.data?.comuna ?? null;
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const reset = useCuestionarioStore((s) => s.reset);
  const getRespuestasParaAnonimo = useCuestionarioStore(
    (s) => s.getRespuestasParaAnonimo,
  );
  const toast = useToast();
  const authMutation = useMatchCandidatos();
  const guestMutation = useMatchAnonimo();
  const activeMutation = isGuest ? guestMutation : authMutation;
  const tiposQ = useTiposEleccion();
  const [shareOpen, setShareOpen] = useState(false);

  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();

  const allResults = activeMutation.data ? sortByMatchDesc(activeMutation.data) : [];
  const loading = activeMutation.isPending;

  const descartadoIds = useMemo(
    () =>
      isGuest
        ? new Set<number>()
        : new Set((descartadosQ.data ?? []).map((d) => d.candidato)),
    [descartadosQ.data, isGuest],
  );
  const visibleResults = useMemo(
    () =>
      allResults.filter(
        (r) => r.candidato_data.id != null && !descartadoIds.has(r.candidato_data.id),
      ),
    [allResults, descartadoIds],
  );
  const hiddenCount = allResults.length - visibleResults.length;

  const [partidoFiltro, setPartidoFiltro] = useState<string | null>(null);
  const partidosDisponibles = useMemo(() => {
    const set = new Set<string>();
    visibleResults.forEach((r) => {
      const p = r.candidato_data.partido;
      if (p && p.trim()) set.add(p);
    });
    return Array.from(set).sort();
  }, [visibleResults]);

  const filteredResults = useMemo(() => {
    if (!partidoFiltro) return visibleResults;
    return visibleResults.filter((r) => r.candidato_data.partido === partidoFiltro);
  }, [visibleResults, partidoFiltro]);

  const favoritoIds = useMemo(
    () =>
      isGuest
        ? new Set<number>()
        : new Set((favoritosQ.data ?? []).map((f) => f.candidato)),
    [favoritosQ.data, isGuest],
  );

  const tipoNombre = useMemo(
    () =>
      (tiposQ.data ?? []).find((t) => t.id === tipoEleccionId)?.nombre ?? "Elección",
    [tiposQ.data, tipoEleccionId],
  );

  // Guardia: los tipos con es_base=true (Preguntas generales) no tienen candidatos propios.
  // Sus respuestas se aplican transversalmente al match de otras elecciones. Aterrizar
  // en Resultados con un tipo base es un caso de borde (back button, deep link viejo,
  // navegacion inconsistente) que resolvemos con UI dedicada + CTA para redirigir.
  const esTipoBase = useMemo(
    () => (tiposQ.data ?? []).find((t) => t.id === tipoEleccionId)?.es_base ?? false,
    [tiposQ.data, tipoEleccionId],
  );
  const activeIds = useElectionsPrefsStore((s) => s.activeIds);
  const setTipoEleccion = useCuestionarioStore((s) => s.setTipoEleccion);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const primeraEspecificaActiva = useMemo(() => {
    if (!esTipoBase) return null;
    const { activas } = partitionTipos(tiposQ.data ?? [], activeIds);
    return activas.find((t) => !t.es_base && t.id != null) ?? null;
  }, [esTipoBase, tiposQ.data, activeIds]);

  useEffect(() => {
    if (!tipoEleccionId) return;
    if (esTipoBase) return; // Skip el fetch: sabemos que devolvera 400.
    if (isGuest) {
      guestMutation.mutate({
        tipoEleccionId,
        respuestas: getRespuestasParaAnonimo(),
      });
    } else {
      authMutation.mutate(tipoEleccionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEleccionId, isGuest, esTipoBase]);

  useEffect(() => {
    if (!activeMutation.error) return;
    // Silenciamos el toast si el error viene del guardia backend (ya tenemos UI dedicada).
    const errAny = activeMutation.error as { response?: { data?: { code?: string } } };
    if (errAny?.response?.data?.code === "tipo_base_sin_candidatos") return;
    toast.error("No pudimos calcular tus matches", getErrorMessage(activeMutation.error));
  }, [activeMutation.error, toast]);

  async function handleCtaTipoBase() {
    if (primeraEspecificaActiva?.id != null) {
      try {
        setTipoEleccion(primeraEspecificaActiva.id);
        await loadForTipoEleccion(primeraEspecificaActiva.id);
      } catch {
        // Fail-safe: el proximo render intentara el match igual.
      }
    } else {
      navigation.replace("GestionElecciones");
    }
  }

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

  function goToDetalle(r: (typeof filteredResults)[number]) {
    const candId = r.candidato_data.id!;
    const pct = Number(r.match_percentage);
    navigation.navigate("DetalleCandidato", {
      candidatoId: candId,
      breakdown: r.breakdown_por_eje as BreakdownPorEje | null,
      matchPct: pct,
      confianza: r.confianza ?? "TENTATIVA",
    });
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: c.bg },
        content: {
          padding: spacing.sp4,
          paddingBottom: spacing.sp8,
          gap: spacing.sp4,
        },
        loadingBox: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sp3,
          paddingTop: spacing.sp8,
        },
        loadingText: { color: c.textSecondary },
        guestCard: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 2,
          borderColor: c.primary,
          backgroundColor: c.card,
          gap: spacing.sp2,
        },
        guestTitle: { ...typography.small, fontWeight: "700", color: c.text },
        guestBody: { ...typography.overline, textTransform: "none", letterSpacing: 0, color: c.textSecondary },
        ubicacionCard: {
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
          gap: spacing.sp2,
        },
        ubicacionTitle: { ...typography.small, fontWeight: "700" },
        ubicacionBody: { ...typography.overline, textTransform: "none", letterSpacing: 0, lineHeight: 18 },
        sectionLabel: {
          ...typography.overline,
          color: c.textSecondary,
          fontWeight: "600",
        },
        chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sp1 },
        rankList: { gap: spacing.sp2 },
        rankGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sp2,
        },
        emptyText: {
          ...typography.small,
          color: c.textSecondary,
          textAlign: "center",
          paddingVertical: spacing.sp5,
        },
        emptyBox: {
          gap: spacing.sp4,
          paddingVertical: spacing.sp6,
          alignItems: "stretch",
        },
        emptyTitle: {
          ...typography.h2,
          textAlign: "center",
        },
        footerCol: { gap: spacing.sp2, marginTop: spacing.sp3 },
        // Banner de cobertura baja: visible cuando confianza == TENTATIVA.
        coverageBanner: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.sp3,
          padding: spacing.sp3,
          borderRadius: radii.rMd,
          borderWidth: 1,
        },
        coverageBannerText: {
          flex: 1,
          ...typography.small,
          lineHeight: 18,
        },
      }),
    [c],
  );

  if (loading) {
    return (
      <AppShell active="home" navigation={navigation}>
        <View style={[styles.scroll, styles.loadingBox]}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Calculando tus matches…</Text>
        </View>
      </AppShell>
    );
  }

  // Guardia dedicada: el tipo actual es es_base (Preguntas generales). Sus preguntas
  // se aplican transversalmente al match de OTRAS elecciones, entonces aca no hay
  // ranking que mostrar. Ofrecemos redirigir al user a activar (o abrir) una eleccion
  // especifica en vez del empty state generico 'no hay candidatos'.
  if (esTipoBase) {
    const ctaLabel = primeraEspecificaActiva
      ? `Ver mis matches en ${primeraEspecificaActiva.nombre}`
      : "Activar una elección";
    return (
      <AppShell active="home" navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenTopBar
            title={tipoNombre}
            subtitle="Tus resultados"
            onBack={() => navigation.goBack()}
          />
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              Estas preguntas no tienen candidatos propios
            </Text>
            <Text style={styles.emptyText}>
              Las respuestas del cuestionario "{tipoNombre}" se aplican automaticamente
              al match de todas las elecciones que actives. Cuanto mas contestes, mas
              precisos son tus matches especificos.
            </Text>
            <Button onPress={handleCtaTipoBase}>{ctaLabel}</Button>
            <Link block onPress={handleVolver}>
              Volver al inicio
            </Link>
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  const top = filteredResults[0];
  const rest = filteredResults.slice(1);

  return (
    <>
      <AppShell active="home" navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenTopBar
          title={tipoNombre}
          subtitle="Tus resultados"
          onBack={() => navigation.goBack()}
        />

        {isGuest ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Modo invitado</Text>
            <Text style={styles.guestBody}>
              Tu match no se guardó. Crea una cuenta para conservarlo, marcar favoritos y elegir tu voto final.
            </Text>
            <Button onPress={exitGuestMode}>Crear una cuenta</Button>
          </View>
        ) : null}

        {!isGuest && !comunaUsuario ? (
          <View
            style={[
              styles.ubicacionCard,
              { backgroundColor: c.warning + "18", borderColor: c.warning },
            ]}
          >
            <Text style={[styles.ubicacionTitle, { color: c.text }]}>
              Estas viendo TODOS los candidatos del pais
            </Text>
            <Text style={[styles.ubicacionBody, { color: c.textSecondary }]}>
              Setea tu comuna en Perfil y solo veras a quienes puedes votar
              (alcaldes de tu comuna, diputados de tu distrito).
            </Text>
            <Link block onPress={() => navigation.navigate("Perfil")}>
              Ir a configurar mi comuna
            </Link>
          </View>
        ) : null}

        {!isGuest && comunaUsuario ? (
          <View
            style={[
              styles.ubicacionCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.ubicacionBody, { color: c.textSecondary }]}>
              Mostrando candidatos filtrados para {comunaUsuario.nombre}, Distrito{" "}
              {comunaUsuario.distrito_numero}.
            </Text>
            <Link block onPress={() => navigation.navigate("Perfil")}>
              Cambiar mi comuna
            </Link>
          </View>
        ) : null}

        {hiddenCount > 0 ? (
          <Link block onPress={() => navigation.navigate("MisGuardados")}>
            {`${hiddenCount} candidato(s) descartado(s). Ver lista`}
          </Link>
        ) : null}

        {partidosDisponibles.length > 1 ? (
          <View style={{ gap: spacing.sp2 }}>
            <Text style={styles.sectionLabel}>Filtrar por partido</Text>
            <View style={styles.chipRow}>
              <Chip
                active={partidoFiltro === null}
                onPress={() => setPartidoFiltro(null)}
                accessibilityLabel="Todos los partidos"
              >
                Todos
              </Chip>
              {partidosDisponibles.map((p) => (
                <Chip
                  key={p}
                  active={partidoFiltro === p}
                  onPress={() => setPartidoFiltro(p)}
                  accessibilityLabel={`Filtrar por ${p}`}
                >
                  {p}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}

        {top ? (
          (() => {
            const pct = Number(top.match_percentage);
            const scoreCol = getMatchColor(pct);
            const conf = getConfianzaBadge(top.confianza);
            const chartData = breakdownToChartData(top.breakdown_por_eje);
            const candidato = top.candidato_data;
            const candId = candidato.id!;
            const isFav = favoritoIds.has(candId);
            const esTentativa = (top.confianza ?? "TENTATIVA").toUpperCase() === "TENTATIVA";
            return (
              <View style={{ gap: spacing.sp3 }}>
                {esTentativa ? (
                  <View
                    style={[
                      styles.coverageBanner,
                      { backgroundColor: c.warning + "22", borderColor: c.warning },
                    ]}
                  >
                    <Text style={{ fontSize: 16, lineHeight: 20 }}>(!)</Text>
                    <Text style={[styles.coverageBannerText, { color: c.text }]}>
                      <Text style={{ fontWeight: "700" }}>Resultado preliminar. </Text>
                      Solo se compararon{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {top.preguntas_consideradas}{" "}
                        {top.preguntas_consideradas === 1 ? "pregunta" : "preguntas"}
                      </Text>
                      . Responde más para afinar tu afinidad.
                    </Text>
                  </View>
                ) : null}
                <ResultadoHero
                  nombre={candidato.nombre}
                  apellido={candidato.apellido}
                  partido={candidato.partido}
                  imageUrl={candidato.profile_picture}
                  matchPct={pct}
                  matchColor={scoreCol}
                  ejeScores={chartData}
                  confianzaLabel={`Confianza ${conf.label.toLowerCase()}`}
                  confianzaVariant={getConfianzaBadgeVariant(top.confianza ?? undefined)}
                  confianzaSubtext={`${top.preguntas_consideradas} ${top.preguntas_consideradas === 1 ? "pregunta coincide" : "preguntas coinciden"}`}
                  onCta={() => goToDetalle(top)}
                />
                {!isGuest ? (
                  <BookmarkActions
                    isFavorito={isFav}
                    isDescartado={false}
                    onToggleFavorito={() => handleToggleFav(candId)}
                    onToggleDescartado={() => handleToggleDesc(candId)}
                    loading={toggleFav.isPending || toggleDesc.isPending}
                    size="sm"
                  />
                ) : null}
              </View>
            );
          })()
        ) : (
          <Text style={styles.emptyText}>
            No hay candidatos para mostrar. Intenta nuevamente más tarde.
          </Text>
        )}

        {rest.length > 0 ? (
          <View style={{ gap: spacing.sp2 }}>
            <Text style={styles.sectionLabel}>Ranking completo</Text>
            <View style={styles.rankGrid}>
              {rest.map((r, idx) => {
                const pct = Number(r.match_percentage);
                const scoreCol = getMatchColor(pct);
                const chartData = breakdownToChartData(r.breakdown_por_eje);
                const candidato = r.candidato_data;
                const candId = candidato.id!;
                const isFav = favoritoIds.has(candId);
                // Width del card: distribuye el ancho disponible entre las
                // columnas del grid dejando espacio para los gaps horizontales.
                // En 1-col ocupa el 100% (flexBasis con string es OK en RN Web,
                // en RN nativo tomamos numero calculado con screenWidth).
                const gapTotal = (rankingCols - 1) * spacing.sp2;
                const cardFlexBasis =
                  rankingCols === 1
                    ? ("100%" as unknown as number)
                    : (screenWidth - gapTotal - spacing.sp4 * 2) / rankingCols;
                return (
                  <RankingCard
                    key={r.id ?? candId}
                    rank={idx + 2}
                    nombre={candidato.nombre}
                    apellido={candidato.apellido}
                    partido={candidato.partido}
                    imageUrl={candidato.profile_picture}
                    matchPct={pct}
                    matchColor={scoreCol}
                    ejeScores={chartData}
                    preguntasConsideradas={r.preguntas_consideradas}
                    onPress={() => goToDetalle(r)}
                    style={{ flexBasis: cardFlexBasis, flexGrow: 1, minWidth: 0 }}
                    actions={
                      !isGuest ? (
                        <BookmarkActions
                          isFavorito={isFav}
                          isDescartado={false}
                          onToggleFavorito={() => handleToggleFav(candId)}
                          onToggleDescartado={() => handleToggleDesc(candId)}
                          loading={toggleFav.isPending || toggleDesc.isPending}
                          size="sm"
                        />
                      ) : null
                    }
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.footerCol}>
          {filteredResults.length > 0 ? (
            <Button variant="accent" onPress={() => setShareOpen(true)}>
              Compartir mi ranking
            </Button>
          ) : null}
          <Link block onPress={() => navigation.navigate("Comparar")}>
            Comparar candidatos
          </Link>
          <Link block onPress={handleVolver}>
            Volver al inicio
          </Link>
        </View>
      </ScrollView>
      </AppShell>

      <ShareModal
        visible={shareOpen}
        text={buildShareText({
          tipoNombre,
          matches: fromMatchResults(filteredResults),
        })}
        onClose={() => setShareOpen(false)}
      />

      <CoachMarkTour tourId="resultados" />
    </>
  );
}
