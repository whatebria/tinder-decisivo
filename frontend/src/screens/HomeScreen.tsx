/**
 * Home HUB: dashboard central de la app (rediseno Sprint UX-Auditoria).
 *
 * Cambios respecto a la version anterior:
 *   - HomeTopBar + HomeGreeting reemplazados por HomeHeroSection (organismo
 *     con hero oscuro #1C3A52 + saludo + CTA accent + trust meta row).
 *   - ElectionCard en scroll horizontal -> HomeElectionItem en lista vertical.
 *   - MatchSummaryCard en scroll horizontal -> card full-width con estado
 *     bloqueado (HomeMatchLocked) cuando no hay matches.
 *   - HomeTrustSection visible para usuarios nuevos / sin cuestionario.
 *   - MatchSummaryCard: color del porcentaje corregido a affinity tier (C-03).
 *
 * Arquitectura:
 *   - Hero section fuera del scroll (sticky) para mantener el CTA visible.
 *   - ScrollView con gap entre secciones y padding propio.
 *   - Todos los componentes reciben props derivados aca (sin logica en atoms).
 *
 * Data model sin cambios: 1 sola query agregada (useMisElecciones).
 * Modo guest: catalogo sin progreso persistido, CTA siempre "Empezar".
 */

import { SHOW_NOTICIAS } from "../constants/features";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import type { BreakdownPorEje, MiProgresoItem, TipoEleccion } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import {
  useMisElecciones,
  useNoticiasFeed,
  usePerfil,
  useReiniciarCuestionario,
  useTiposEleccion,
} from "../api/hooks";
import {
  AppShell,
  CoachMarkTour,
  ConfirmModal,
  ElectionCardAdd,
  EmptyState,
  HomeElectionItem,
  HomeHeroSection,
  HomeMatchLocked,
  HomeTrustSection,
  MatchSummaryCard,
  NoticiaDetailSheet,
  NovedadesFeed,
  SectionTitle,
  Spinner,
  useToast,
  type NoticiaDetail,
  type NovedadFeedItem,
} from "../components";
import { computeDiasRestantes } from "../domain/eleccion";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { partitionTipos, useElectionsPrefsStore } from "../store/electionsPrefs";
import { spacing } from "../theme/spacing";
import { useThemeColors } from "../theme/useTheme";
import { sanitizeSnippet } from "../utils/text";
import { noticiaToDetail } from "../utils/noticia";
import { deriveInitials, deriveDisplayName } from "../utils/user";

// -- Helpers ------------------------------------------------------------------

/**
 * Indexa el resumen del backend por tipo_eleccion_id. Puro y O(N).
 */
function indexProgresoByTipo(
  items: MiProgresoItem[] | undefined,
): Map<number, MiProgresoItem> {
  const m = new Map<number, MiProgresoItem>();
  if (!items) return m;
  for (const it of items) m.set(it.tipo_eleccion_id, it);
  return m;
}

function whenLabel(dateIso?: string): string {
  if (!dateIso) return "";
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  if (h < 1) return "hace un momento";
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  return `hace ${d}d`;
}

// -- Screen -------------------------------------------------------------------

export function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  const c = useThemeColors();
  const perfilQ = usePerfil();
  const email = perfilQ.data?.email ?? null;
  const isGuest = useAuthStore((s) => s.isGuest);
  const activeTipoId = useCuestionarioStore((s) => s.tipoEleccionId);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const electionsActiveIds = useElectionsPrefsStore((s) => s.activeIds);
  const toast = useToast();

  const tiposQuery = useTiposEleccion();
  const { data: tipos = [], isLoading: tiposLoading, error } = tiposQuery;
  const { data: progresoItems } = useMisElecciones();
  // BUG-024: deshabilitar el fetch cuando SHOW_NOTICIAS=false -- request desperdiciada.
  const { data: noticias = [] } = useNoticiasFeed({}, { enabled: SHOW_NOTICIAS });
  const reiniciar = useReiniciarCuestionario();

  const [tipoAReiniciar, setTipoAReiniciar] = useState<TipoEleccion | null>(null);
  const [selectedNoticia, setSelectedNoticia] = useState<NoticiaDetail | null>(null);

  React.useEffect(() => {
    if (error) toast.error("Error cargando elecciones", getErrorMessage(error));
  }, [error, toast]);

  // Datos derivados del perfil
  const emailPrefix = email ? email.split("@")[0] : null;
  const displayName = emailPrefix ? deriveDisplayName(emailPrefix) : undefined;
  const userInitials = emailPrefix ? deriveInitials(emailPrefix) : undefined;

  // Solo elecciones activadas por el user
  const { activas: tiposActivos } = useMemo(
    () => partitionTipos(tipos, electionsActiveIds),
    [tipos, electionsActiveIds],
  );

  const activeId = activeTipoId ?? tiposActivos[0]?.id ?? null;

  const progresoByTipo = useMemo(
    () => indexProgresoByTipo(progresoItems),
    [progresoItems],
  );

  // Matches: solo cuestionarios completos con top_match resuelto
  const mejoresMatches = useMemo(() => {
    if (!progresoItems) return [];
    return progresoItems.filter(
      (it) =>
        it.completa === true &&
        it.top_match !== null &&
        (electionsActiveIds === null ||
          electionsActiveIds.includes(it.tipo_eleccion_id)),
    );
  }, [progresoItems, electionsActiveIds]);

  // Progreso global: ratio de la eleccion activa (para el ring del hero)
  const heroProgress = useMemo(() => {
    if (isGuest || !activeId) return 0;
    const p = progresoByTipo.get(activeId);
    if (!p || !p.total_preguntas) return 0;
    return Math.min(p.respondidas / p.total_preguntas, 1);
  }, [isGuest, activeId, progresoByTipo]);

  // TASK-050 + BUG-023: useCallback para estabilizar props y corregir stale closures.
  // ORDEN IMPORTANTE: iniciarCuestionario antes de handleHeroCta (dependencia).
  const iniciarCuestionario = useCallback(
    async (tipo: TipoEleccion) => {
      if (!tipo.id) return;
      const progreso = progresoByTipo.get(tipo.id);
      const yaCompleto = !isGuest && progreso?.completa === true;
      try {
        if (yaCompleto) {
          await loadForTipoEleccion(tipo.id);
          navigation.navigate("Resultados");
          return;
        }
        await loadForTipoEleccion(tipo.id);
        navigation.navigate("Cuestionario");
      } catch (err) {
        toast.error("No pudimos cargar las preguntas", getErrorMessage(err));
      }
    },
    [loadForTipoEleccion, progresoByTipo, navigation, isGuest, toast],
  );

  const handleHeroCta = useCallback(() => {
    if (mejoresMatches.length > 0) {
      navigation.navigate("Resultados");
      return;
    }
    const tipo = tiposActivos.find((t) => t.id === activeId) ?? tiposActivos[0];
    if (tipo) void iniciarCuestionario(tipo);
  }, [mejoresMatches.length, navigation, tiposActivos, activeId, iniciarCuestionario]);

  const handleConfirmReiniciar = useCallback(async () => {
    if (!tipoAReiniciar?.id) return;
    try {
      await reiniciar.mutateAsync(tipoAReiniciar.id);
      toast.success("Cuestionario reiniciado");
      setTipoAReiniciar(null);
    } catch (err) {
      toast.error("No pudimos reiniciar", getErrorMessage(err));
    }
  }, [reiniciar, tipoAReiniciar, toast]);

  // Novedades: accion sugerida + noticias.
  // BUG-023: iniciarCuestionario incluida en deps -- elimina el eslint-disable.
  const novedades: NovedadFeedItem[] = useMemo(() => {
    const items: NovedadFeedItem[] = [];
    const tipoSinCuestionario = tiposActivos.find((t) => t.id && t.id !== activeId);
    if (tipoSinCuestionario) {
      items.push({
        key: `action-${tipoSinCuestionario.id}`,
        kind: "action",
        icon: "bell",
        title: `Responde el cuestionario de ${tipoSinCuestionario.nombre}`,
        subtitle: "Descubre tu top match",
        ctaLabel: "Ir",
        onCta: () => void iniciarCuestionario(tipoSinCuestionario),
      });
    }
    if (SHOW_NOTICIAS) {
      noticias.slice(0, 4).forEach((n) => {
        items.push({
          key: `noticia-${n.id}`,
          kind: "noticia",
          imageUrl: n.imagen_url,
          title: sanitizeSnippet(n.titulo),
          snippet: sanitizeSnippet(n.descripcion),
          category: n.fuente,
          when: whenLabel(n.fecha_publicacion),
          onPress: () =>
            setSelectedNoticia(
              noticiaToDetail(n, {
                when: whenLabel(n.fecha_publicacion),
                sentiment: "neutral",
              }),
            ),
        });
      });
    }
    return items;
  }, [tiposActivos, activeId, noticias, iniciarCuestionario]);

  // CTA del hero segun estado global
  const heroCta = useMemo(() => {
    if (mejoresMatches.length > 0) return "Ver mis matches";
    if (heroProgress > 0) return "Continuar cuestionario";
    return "Empezar cuestionario";
  }, [mejoresMatches.length, heroProgress]);

  // Countdown: dias hasta la eleccion con fecha mas proxima
  const countdownDays = useMemo(() => {
    const fechas = tiposActivos
      .map((t) => computeDiasRestantes(t.fecha_eleccion ?? null))
      .filter((d): d is number => d !== null && d >= 0);
    if (fechas.length === 0) return null;
    return Math.min(...fechas);
  }, [tiposActivos]);

  // Si el user NO tiene ninguna eleccion completa -> mostrar lock
  const sinMatches = mejoresMatches.length === 0 && tiposActivos.length > 0;

  // Cuerpo del mensaje en la lock card
  const lockBody = useMemo(() => {
    if (!activeId) return "Completa el cuestionario para ver tu candidato";
    const p = progresoByTipo.get(activeId);
    if (!p) return "Completa el cuestionario para ver tu candidato";
    const faltan = p.total_preguntas - p.respondidas;
    const tipo = tiposActivos.find((t) => t.id === activeId);
    return `Faltan ${faltan} pregunta${faltan !== 1 ? "s" : ""} en ${tipo?.nombre ?? "el cuestionario"}`;
  }, [activeId, progresoByTipo, tiposActivos]);

  // Mostrar trust section solo para usuarios sin ningun cuestionario iniciado
  const showTrust = !isGuest && mejoresMatches.length === 0 && heroProgress === 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: c.bg },
        scroll: { flex: 1 },
        scrollContent: {
          paddingHorizontal: spacing.sp4,
          paddingTop: spacing.sp5,
          paddingBottom: spacing.sp8,
          gap: spacing.sp5,
        },
        loadingContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: spacing.sp8,
        },
      }),
    [c],
  );

  // BUG-025: separar carga de error -- spinner infinito cuando tiposLoading=true pero error != null.
  if (tiposLoading && !error) {
    return (
      <AppShell active="home" navigation={navigation}>
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell active="home" navigation={navigation}>
        <View style={styles.loadingContainer}>
          <EmptyState
            icon="info"
            title="No pudimos cargar las elecciones"
            description="Revisa tu conexion a internet e intenta de nuevo."
            actionLabel="Intentar de nuevo"
            onAction={() => { void tiposQuery.refetch(); }}
          />
        </View>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell active="home" navigation={navigation}>
        <View style={styles.screen}>
          <HomeHeroSection
            displayName={isGuest ? undefined : displayName}
            userInitials={isGuest ? undefined : userInitials}
            countdownDays={countdownDays}
            progressValue={heroProgress}
            ctaLabel={heroCta}
            onCta={handleHeroCta}
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {tiposActivos.length === 0 ? null : (
              <View>
                <SectionTitle
                  title={`Tus elecciones (${tiposActivos.length})`}
                  actionLabel="Gestionar"
                  onAction={() => navigation.navigate("GestionElecciones")}
                />
                <View style={{ gap: spacing.sp3, marginTop: spacing.sp3 }}>
                  {tiposActivos.map((tipo) => {
                    const progreso = tipo.id ? progresoByTipo.get(tipo.id) : undefined;
                    const yaCompleto = !isGuest && progreso?.completa === true;
                    return (
                      <HomeElectionItem
                        key={tipo.id}
                        name={tipo.nombre}
                        scope={tipo.descripcion ?? undefined}
                        respondidas={progreso?.respondidas ?? 0}
                        totalPreguntas={progreso?.total_preguntas ?? 0}
                        onEmpezar={() => iniciarCuestionario(tipo)}
                        onContinuar={() => iniciarCuestionario(tipo)}
                        onVerResultados={
                          yaCompleto
                            ? async () => {
                                await loadForTipoEleccion(tipo.id!);
                                navigation.navigate("Resultados");
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                  <ElectionCardAdd
                    label="+ Activar otra eleccion"
                    onPress={() => navigation.navigate("GestionElecciones")}
                  />
                </View>
              </View>
            )}

            {tiposActivos.length > 0 ? (
              <View>
                <SectionTitle title="Tu mejor match" />
                <View style={{ marginTop: spacing.sp3 }}>
                  {sinMatches ? (
                    <HomeMatchLocked
                      body={lockBody}
                      onContinuar={() => {
                        const tipo =
                          tiposActivos.find((t) => t.id === activeId) ?? tiposActivos[0];
                        if (tipo) iniciarCuestionario(tipo);
                      }}
                    />
                  ) : (
                    mejoresMatches.map((item) => {
                      const top = item.top_match!;
                      const candidato = top.candidato;
                      const nombre = `${candidato.nombre} ${candidato.apellido ?? ""}`.trim();
                      return (
                        <MatchSummaryCard
                          key={item.tipo_eleccion_id}
                          candidatoNombre={nombre}
                          candidatoFotoUrl={candidato.profile_picture ?? null}
                          tipoEleccionNombre={item.tipo_eleccion_nombre}
                          matchPercent={Number(top.match_percentage)}
                          preguntasConsideradas={top.preguntas_consideradas}
                          totalPreguntas={item.total_preguntas}
                          style={{ marginBottom: spacing.sp3 }}
                          onVerPerfil={() =>
                            navigation.navigate("DetalleCandidato", {
                              candidatoId: candidato.id!,
                              breakdown:
                                (top.breakdown_por_eje as BreakdownPorEje | null) ?? null,
                              matchPct: Number(top.match_percentage),
                              confianza: top.confianza ?? null,
                            })
                          }
                        />
                      );
                    })
                  )}
                </View>
              </View>
            ) : null}

            {novedades.length > 0 ? (
              <View>
                <SectionTitle
                  title="Novedades"
                  actionLabel={SHOW_NOTICIAS ? "Ver todas" : undefined}
                  onAction={SHOW_NOTICIAS ? () => navigation.navigate("Noticias") : undefined}
                />
                <View style={{ marginTop: spacing.sp3 }}>
                  <NovedadesFeed items={novedades} />
                </View>
              </View>
            ) : null}

            {showTrust ? <HomeTrustSection /> : null}
          </ScrollView>
        </View>
      </AppShell>

      <ConfirmModal
        visible={!!tipoAReiniciar}
        title="Reiniciar cuestionario?"
        message={`Vas a borrar tus respuestas de ${tipoAReiniciar?.nombre ?? ""}. No se puede deshacer.`}
        confirmLabel="Si, reiniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmReiniciar}
        onCancel={() => setTipoAReiniciar(null)}
        variant="danger"
      />

      <NoticiaDetailSheet
        visible={selectedNoticia !== null}
        onClose={() => setSelectedNoticia(null)}
        noticia={selectedNoticia}
      />

      <CoachMarkTour tourId="home" />
    </>
  );
}
