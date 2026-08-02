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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";

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
  CollapsibleFilterSection,
  Icon,
  Link,
  RankingCard,
  ResultadoHero,
  ScreenTopBar,
  ShareModal,
  Spinner,
  TopMatchSection,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  formatMatchPercentage,
  getMatchColor,
  sortByMatchDesc,
} from "../services/matching";
import { withAlpha } from "../theme/utils";
import { buildShareText, fromMatchResults } from "../services/share";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { partitionTipos, useElectionsPrefsStore } from "../store/electionsPrefs";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { requiereFiltroTerritorial } from "../domain/eleccion";

export function ResultadosScreen({
  navigation,
}: RootStackScreenProps<"Resultados">) {
  const c = useThemeColors();
  const isFocused = useIsFocused(); // BUG-037: guard toast solo cuando el screen esta visible.
  const { width: screenWidth } = useWindowDimensions();
  // Grid del ranking: 1 col en pantallas apretadas (iPhone SE-ish),
  // 2 col en telefonos normales, 3 en tablets, 4 en desktop. Los
  // breakpoints son intencionalmente conservadores (>=1000 recien tres
  // columnas) porque cada card lleva un radar 140px + labels; con menos
  // ancho la card se aprieta y el radar pierde legibilidad.
  const rankingCols = useMemo(
    () => screenWidth < 400 ? 1 : screenWidth < 720 ? 2 : screenWidth < 1000 ? 3 : 4,
    [screenWidth]
  );
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

  const allResults = useMemo(
    () => activeMutation.data ? sortByMatchDesc(activeMutation.data) : [],
    [activeMutation.data]
  );
  const loading = activeMutation.isPending;

  const cardFlexBasis = useMemo(() => {
    if (rankingCols === 1) return "100%" as const;
    const gapTotal = (rankingCols - 1) * spacing.sp2;
    return (screenWidth - gapTotal - spacing.sp4 * 2) / rankingCols;
  }, [rankingCols, screenWidth]);

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

  // Derivaciones del top match, fuera del IIFE (REFACTOR-004).
  // Viven aqui (post-filteredResults) para que el JSX no contenga logica de derivacion.
  const top = filteredResults[0] ?? null;
  const topPct = top ? Number(top.match_percentage) : null;
  const topColor = topPct != null ? getMatchColor(topPct) : null;
  const topChart = top ? breakdownToChartData(top.breakdown_por_eje) : null;
  const rest = top ? filteredResults.slice(1) : filteredResults;

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

  // BUG-038: las elecciones presidenciales y plebiscitos tienen candidatos nacionales;
  // el banner de "setea tu comuna" es incorrecto para ellas. Si el nombre no esta
  // en la lista filtrada (tipo base, deep link roto, etc.) somos conservadores: true.
  const requiereFiltro = useMemo(
    () => requiereFiltroTerritorial(tipoNombre),
    [tipoNombre],
  );

  // BUG-036: useTiposEleccion filtra es_base=true en su selector, entonces
  // tiposQ.data nunca contiene el tipo base y esTipoBase siempre evaluaria false.
  // Leemos el flag directamente del store donde loadForTipoEleccion lo setea
  // con el valor correcto ANTES de que se monte este screen.
  const esTipoBase = useCuestionarioStore((s) => s.esTipoBase);

  // Para CTA de redireccion dentro del guard de tipo base.
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
    // BUG-032: mutate y getRespuestasParaAnonimo son referencias estables.
    // React Query garantiza estabilidad de mutate entre renders.
    // getRespuestasParaAnonimo es un selector de Zustand con referencia estable.
    // Se omiten intencionalmente para que el efecto solo re-ejecute cuando
    // cambia la eleccion activa o el modo (autenticado vs. invitado).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEleccionId, isGuest, esTipoBase]);

  useEffect(() => {
    if (!activeMutation.error) return;
    // BUG-037: si el screen no esta en foco (ej. el user volvio al cuestionario
    // con el back button), no mostramos el toast para no interrumpir la UX.
    if (!isFocused) return;
    // Silenciamos el toast si el error viene del guardia backend (ya tenemos UI dedicada).
    const errAny = activeMutation.error as { response?: { data?: { code?: string } } };
    if (errAny?.response?.data?.code === "tipo_base_sin_candidatos") return;
    toast.error("No pudimos calcular tus matches", getErrorMessage(activeMutation.error));
  }, [activeMutation.error, isFocused, toast]);

  // BUG-033: ctaLoading para prevenir doble-press durante el await.
  const [ctaBaseLoading, setCtaBaseLoading] = useState(false);

  // BUG-033: useCallback + loading state (mismo patron que BUG-029 en SubmitDoneScreen).
  const handleCtaTipoBase = useCallback(async () => {
    setCtaBaseLoading(true);
    try {
      if (primeraEspecificaActiva?.id != null) {
        setTipoEleccion(primeraEspecificaActiva.id);
        await loadForTipoEleccion(primeraEspecificaActiva.id);
      } else {
        navigation.replace("GestionElecciones");
      }
    } catch {
      toast.error("No pudimos cargar los datos");
    } finally {
      setCtaBaseLoading(false);
    }
  }, [primeraEspecificaActiva, setTipoEleccion, loadForTipoEleccion, navigation, toast]);

  function handleVolver() {
    reset();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  function handleToggleFav(candidatoId: number) {
    const eraFavorito = favoritoIds.has(candidatoId);
    toggleFav.mutate(candidatoId, {
      onSuccess: () => {
        if (eraFavorito) toast.info("Eliminado de favoritos");
        else toast.success("Agregado a favoritos");
      },
      onError: (e) => toast.error("No pudimos actualizar favoritos", getErrorMessage(e)),
    });
  }

  function handleToggleDesc(candidatoId: number) {
    const eraDescartado = descartadoIds.has(candidatoId);
    toggleDesc.mutate(candidatoId, {
      onSuccess: () => {
        if (eraDescartado) toast.info("Descarte eliminado");
        else toast.success("Candidato descartado");
      },
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
      <AppShell active={null} navigation={navigation}>
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
      <AppShell active={null} navigation={navigation}>
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
            <Button
              onPress={handleCtaTipoBase}
              loading={ctaBaseLoading}
              disabled={ctaBaseLoading}
            >
              {ctaLabel}
            </Button>
            <Link block onPress={handleVolver}>
              Volver al inicio
            </Link>
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  // top, topPct, topColor, topChart, rest: derivados antes del return
  // en el cuerpo del componente (fuera del IIFE, REFACTOR-004).

  // BUG-035: si la mutation fallo y no hay datos previos, mostramos un empty
  // state dedicado en lugar del ranking vacio + toast generico. Mensaje
  // contextual: el user necesita completar el cuestionario de ESTA eleccion.
  if (activeMutation.error && !activeMutation.data) {
    return (
      <AppShell active={null} navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenTopBar
            title={tipoNombre}
            subtitle="Tus resultados"
            onBack={() => navigation.goBack()}
          />
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              Aún no hay suficientes respuestas
            </Text>
            <Text style={styles.emptyText}>
              Para calcular tus matches en {tipoNombre} necesitas responder
              las preguntas de esa eleccion. Las preguntas generales ayudan,
              pero no alcanzan solas.
            </Text>
            <Button onPress={handleVolver}>Volver al inicio</Button>
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell active={null} navigation={navigation}>
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

        {!isGuest && !comunaUsuario && requiereFiltro ? (
          <View
            style={[
              styles.ubicacionCard,
              { backgroundColor: withAlpha(c.warning, 0.09), borderColor: c.warning },
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

        {!isGuest && comunaUsuario && requiereFiltro ? (
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
            {`${hiddenCount} candidato${hiddenCount === 1 ? "" : "s"} descartado${hiddenCount === 1 ? "" : "s"}. Ver lista`}
          </Link>
        ) : null}

        {partidosDisponibles.length > 1 ? (
          // UX-060: filtro de partido colapsado por defecto para no ocupar espacio
          // cuando el usuario no lo necesita. summary muestra el estado actual.
          <CollapsibleFilterSection
            title="Filtrar por partido"
            summary={partidoFiltro ?? "Todos"}
            defaultExpanded={false}
          >
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
          </CollapsibleFilterSection>
        ) : null}

        {top && topColor && topChart ? (
          <TopMatchSection
            result={top}
            matchColor={topColor}
            chartData={topChart}
            isFavorito={favoritoIds.has(top.candidato_data.id!)}
            isGuest={isGuest}
            onDetalle={() => goToDetalle(top)}
            onToggleFav={handleToggleFav}
            onToggleDesc={handleToggleDesc}
            loadingBookmarks={toggleFav.isPending || toggleDesc.isPending}
          />
        ) : partidoFiltro ? (
          // UX-058: empty state especifico cuando el filtro de partido elimina todos los
          // resultados. Informamos al user y damos salida directa para limpiar el filtro.
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No hay candidatos de {partidoFiltro} en tu ranking visible.
            </Text>
            <Button variant="ghost" onPress={() => setPartidoFiltro(null)}>
              Ver todos los partidos
            </Button>
          </View>
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
                // flexBasis: calculado en el cuerpo del componente (cardFlexBasis)
                // para no re-ejecutar el calculo por cada item del map.
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
