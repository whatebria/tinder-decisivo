/**
 * DetalleCandidatoScreen: perfil completo del candidato.
 *
 * Basado en design-system-lowfi.html Templates #13 (con match) y #14 (empty).
 *
 * Composicion via design system (atoms/molecules/organisms):
 *   - ScreenTopBar (molecule)
 *   - ProfileHero (organism) para avatar + partido + nombre + subtitle
 *   - MatchTier (molecule) para el chip de confianza
 *   - Tabs (atom) con contadores
 *   - CandidatoPosturas (organism) en la tab Posturas
 *   - MatchExplanation (organism) en el resumen
 *   - Modal (molecule) para el info modal de confianza
 *   - Button / IconButton / Icon / Chip / Spinner (atoms)
 *
 * Todos los estilos usan tokens de spacing / radii / typography. Sin
 * hardcodes de padding, gap, fontSize ni borderRadius (ver seccion Styles).
 *
 * No usa AppShell porque es una detail screen accesible desde 4 origenes
 * distintos (Resultados, Guardados, Comparar).
 */

import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "../api/client";
import { breakdownToChartData } from "../api/endpoints";
import {
  useCandidato,
  useDescartados,
  useFavoritos,
  usePosturasCandidato,
  usePosturasBookmarks,
  useTiposEleccion,
  useToggleDescartado,
  useToggleFavorito,
  useTogglePosturaBookmark,
  type FavToggleVars,
  type DescToggleVars,
} from "../api/hooks";
import type { Candidato, PosturaCandidatoDetalle } from "../api/endpoints";
import type { Sentiment } from "../components";
import {
  Button,
  CandidatoPosturas,
  EmptyState,
  IconButton,
  Icon,
  MatchTier,
  Modal,
  ProfileHero,
  RadarChart,
  ScreenChrome,
  ScreenTopBar,
  ShareModal,
  Spinner,
  Tabs,
  CoachMarkTour,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { confianzaToTier, formatMatchPercentage, getConfianzaBadge, getMatchColor } from "../services/matching";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { iniciales, nombreCompleto } from "../utils/candidato";
import { ResumenTab } from "./DetalleCandidato/ResumenTab";
import { AfinidadTab } from "./DetalleCandidato/AfinidadTab";

// UX-059: agregado "afinidad" como tercer tab (solo visible cuando hay match).
type PerfilTab = "resumen" | "posturas" | "afinidad";

/** Mapea el string de confianza del backend al tier del DS. */
// (confianzaToTier migrado a services/matching -- TASK-035)


export function DetalleCandidatoScreen({
  route,
  navigation,
}: RootStackScreenProps<"DetalleCandidato">) {
  const c = useThemeColors();
  const { candidatoId, breakdown, matchPct, confianza } = route.params;

  const isGuest = useAuthStore((s) => s.isGuest);
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const toast = useToast();

  // UX-070: AfinidadTab es la tab por defecto cuando hay match.
  // ResumenTab esta temporalmente oculta (pendiente rediseño + noticias).
  const [tab, setTab] = useState<PerfilTab>(matchPct != null ? "afinidad" : "posturas");
  const [shareOpen, setShareOpen] = useState(false);
  const [confianzaInfoOpen, setConfianzaInfoOpen] = useState(false);

  const candidatoQ = useCandidato(candidatoId);
  const posturasQ = usePosturasCandidato(candidatoId, tipoEleccionId);
  // BUG-030: guests no usan favoritos/descartados (ActionRow no renderiza para ellos).
  // Evita 2 requests de red por visita en modo invitado.
  const favoritosQ = useFavoritos({ enabled: !isGuest });
  const descartadosQ = useDescartados({ enabled: !isGuest });
  const tiposQ = useTiposEleccion();
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();
  // UX-080: bookmarks de posturas (lazy: solo se activa en tab posturas).
  const posturasBookQ = usePosturasBookmarks({ enabled: !isGuest && tab === "posturas" });
  const togglePosturaBook = useTogglePosturaBookmark();
  const bookmarkedPosturaIds = useMemo(
    () => new Set((posturasBookQ.data ?? []).map((b) => b.postura)),
    [posturasBookQ.data],
  );


  const candidato = candidatoQ.data ?? null;
  const posturas = posturasQ.data ?? [];

  const isFavorito = (favoritosQ.data ?? []).some(
    (f) => f.candidato === candidatoId,
  );
  const isDescartado = (descartadosQ.data ?? []).some(
    (d) => d.candidato === candidatoId,
  );
  const hasMatch = matchPct != null;

  const eleccionNombre = useMemo(() => {
    if (!tipoEleccionId) return "";
    return (
      (tiposQ.data ?? []).find((t) => t.id === tipoEleccionId)?.nombre ??
      "Eleccion"
    );
  }, [tiposQ.data, tipoEleccionId]);

  const chartData = useMemo(
    () => breakdownToChartData(breakdown),
    [breakdown],
  );
  const scoreCol = getMatchColor(matchPct ?? 0);

  if (candidatoQ.isLoading) {
    return (
      <ScreenChrome>
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      </ScreenChrome>
    );
  }

  if (!candidato) {
    // BUG-031: distinguir error de red (retry disponible) de candidato no encontrado (404).
    if (candidatoQ.isError) {
      return (
        <ScreenChrome>
          <EmptyState
            icon="alert"
            title="No pudimos cargar el perfil"
            description="Revisa tu conexion e intentalo de nuevo."
            actionLabel="Reintentar"
            onAction={() => { void candidatoQ.refetch(); }}
          />
        </ScreenChrome>
      );
    }
    return (
      <ScreenChrome>
        <EmptyState
          icon="search"
          title="Candidato no encontrado"
        />
      </ScreenChrome>
    );
  }

  const shareText = buildShareText(candidato, matchPct);

  return (
    <>
    <ScreenChrome>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTopBar
          title="Perfil de candidato"
          subtitle={eleccionNombre}
          onBack={() => navigation.goBack()}
        />

        <ProfileHero
          name={nombreCompleto(candidato)}
          initials={iniciales(candidato)}
          partido={candidato.partido ?? "Independiente"}
          subtitle={hasMatch ? "Perfil basado en tus respuestas" : "Aun sin match calculado"}
          tilt="default"
        />

        {hasMatch ? (
          <MatchBlock
            matchPct={matchPct}
            confianza={confianza}
            scoreCol={scoreCol}
            onOpenInfo={() => setConfianzaInfoOpen(true)}
          />
        ) : (
          <EmptyMatchBlock
            onStart={() => navigation.navigate("Cuestionario")}
          />
        )}

        {!isGuest ? (
          <ActionRow
            isFavorito={isFavorito}
            isDescartado={isDescartado}
            loadingFav={toggleFav.isPending}
            loadingDesc={toggleDesc.isPending}
            onToggleFav={() => {
              const eraFavorito = isFavorito;
              const vars: FavToggleVars = {
                candidatoId,
                existingFavId: favoritosQ.data?.find((f) => f.candidato === candidatoId)?.id,
                existingDescId: descartadosQ.data?.find((d) => d.candidato === candidatoId)?.id,
              };
              toggleFav.mutate(vars, {
                onSuccess: () => eraFavorito
                  ? toast.info("Quitado de favoritos")
                  : toast.success("Guardado en favoritos"),
                onError: (e) => toast.error("Error", getErrorMessage(e)),
              });
            }}
            onToggleDesc={() => {
              const eraDescartado = isDescartado;
              const vars: DescToggleVars = {
                candidatoId,
                existingDescId: descartadosQ.data?.find((d) => d.candidato === candidatoId)?.id,
                existingFavId: favoritosQ.data?.find((f) => f.candidato === candidatoId)?.id,
              };
              toggleDesc.mutate(vars, {
                onSuccess: () => eraDescartado
                  ? toast.info("Candidato restaurado")
                  : toast.info("Candidato descartado"),
                onError: (e) => toast.error("Error", getErrorMessage(e)),
              });
            }}
            onShare={() => setShareOpen(true)}
          />
        ) : null}

        <Tabs<PerfilTab>
          value={tab}
          onChange={setTab}
          items={[
            // UX-070: ResumenTab oculta hasta rediseño + noticias.
            // Reactivar quitando el comentario. Ver UX-067.
            // { value: "resumen", label: "Resumen" },
            { value: "posturas", label: "Posturas", count: posturas.length },
            // UX-059: tab Afinidad solo cuando hay match -- evita confusion
            // con pantalla vacia si el user no hizo el cuestionario.
            ...(hasMatch
              ? [{ value: "afinidad" as const, label: "Afinidad" }]
              : []),
          ]}
          style={styles.tabsStretch}
        />

        {tab === "resumen" ? (
          <ResumenTab
            candidato={candidato}
            posturas={posturas}
            onVerTodasPosturas={() => setTab("posturas")}
          />
        ) : tab === "posturas" ? (
          <CandidatoPosturas
            posturas={posturas}
            loading={posturasQ.isLoading}
            bookmarkedIds={isGuest ? undefined : bookmarkedPosturaIds}
            onToggleBookmark={isGuest ? undefined : (id) => {
              togglePosturaBook.mutate(id, {
                onSuccess: () => toast.success(
                  bookmarkedPosturaIds.has(id) ? "Postura quitada" : "Postura guardada",
                  bookmarkedPosturaIds.has(id) ? undefined : "La verás en Mis Guardados → Posturas.",
                ),
                onError: (e) => toast.error("No pudimos guardar la postura", String(e)),
              });
            }}
            bookmarkLoading={togglePosturaBook.isPending}
          />
        ) : tab === "afinidad" && hasMatch ? (
          <AfinidadTab
            candidatoId={candidatoId}
            chartData={chartData}
            scoreCol={scoreCol}
            isAuthenticated={!isGuest}
          />
        ) : null}
      </ScrollView>

      <ShareModal
        visible={shareOpen}
        text={shareText}
        onClose={() => setShareOpen(false)}
      />

      <Modal
        visible={confianzaInfoOpen}
        onClose={() => setConfianzaInfoOpen(false)}
        title="Que significa la confianza"
        footer={
          <Button variant="ghost" fullWidth={false} onPress={() => setConfianzaInfoOpen(false)}>
            Entendido
          </Button>
        }
      >
        <Text style={[styles.paragraph, { color: c.textSecondary, marginBottom: spacing.sp3 }]}>
          Es que tan seguro es este porcentaje. Depende de cuantas preguntas
          respondiste y de cuantas tiene contestadas el candidato en su perfil.
        </Text>
        <Text style={[styles.paragraph, { color: c.textSecondary }]}>
          Mientras mas preguntas coincidan en ambos, mayor confianza.
        </Text>
      </Modal>
    </ScreenChrome>

      <CoachMarkTour tourId="perfilCandidato" />
    </>
  );
}

// ---------- Sub-componentes ----------

interface MatchBlockProps {
  matchPct: number;
  confianza: string | null;
  scoreCol: string;
  onOpenInfo: () => void;
}

function MatchBlock({
  matchPct,
  confianza,
  scoreCol,
  onOpenInfo,
}: MatchBlockProps) {
  const c = useThemeColors();
  return (
    <View style={styles.matchBlock}>
      <Text style={[styles.matchBig, { color: scoreCol }]}>
        {formatMatchPercentage(matchPct)}
      </Text>
      <Text style={[styles.matchCaption, { color: c.textSecondary }]}>
        Compatibilidad
      </Text>
      {confianza ? (
        <View style={styles.confianzaRow}>
          <MatchTier
            tier={confianzaToTier(confianza)}
            label={getConfianzaBadge(confianza ?? undefined).label}
          />
          <IconButton
            variant="ghost"
            size="sm"
            onPress={onOpenInfo}
            accessibilityLabel="Que significa la confianza"
          >
            <Icon name="info" size={16} color={c.textSecondary} />
          </IconButton>
        </View>
      ) : null}
    </View>
  );
}

function EmptyMatchBlock({ onStart }: { onStart: () => void }) {
  const c = useThemeColors();
  return (
    <View style={[styles.emptyBox, { borderColor: c.border, backgroundColor: c.card }]}>
      <Text style={[styles.emptyTitle, { color: c.text }]}>
        Aun no tienes match calculado
      </Text>
      <Text style={[styles.paragraph, styles.emptyBody, { color: c.textSecondary }]}>
        Responde el cuestionario para ver tu porcentaje de afinidad con este
        candidato.
      </Text>
      <Button onPress={onStart}>Empezar cuestionario</Button>
    </View>
  );
}

interface ActionRowProps {
  isFavorito: boolean;
  isDescartado: boolean;
  loadingFav: boolean;
  loadingDesc: boolean;
  onToggleFav: () => void;
  onToggleDesc: () => void;
  onShare: () => void;
}

function ActionRow({
  isFavorito,
  isDescartado,
  loadingFav,
  loadingDesc,
  onToggleFav,
  onToggleDesc,
  onShare,
}: ActionRowProps) {
  const c = useThemeColors();
  return (
    <View style={styles.actionRow}>
      <IconButton
        onPress={onToggleFav}
        disabled={loadingFav}
        accessibilityLabel={
          isFavorito ? "Quitar de favoritos" : "Marcar como favorito"
        }
        variant={isFavorito ? "solid" : "soft"}
      >
        <Icon
          name="heart"
          size={20}
          color={isFavorito ? c.textOnPrimary : c.primary}
        />
      </IconButton>
      <IconButton
        onPress={onToggleDesc}
        disabled={loadingDesc}
        accessibilityLabel={isDescartado ? "Restaurar" : "Descartar"}
        variant={isDescartado ? "danger-solid" : "soft"}
      >
        <Icon
          name="close"
          size={20}
          color={isDescartado ? "#FFFFFF" : c.danger}
        />
      </IconButton>
      <IconButton
        onPress={onShare}
        accessibilityLabel="Compartir"
        variant="soft"
      >
        <Icon name="link" size={20} color={c.primary} />
      </IconButton>
    </View>
  );
}

// ---------- Helpers ----------

function buildShareText(cand: Candidato, matchPct: number | null): string {
  // TASK-038: usar formatMatchPercentage para consistencia con la UI (DRY).
  const pct = matchPct != null ? formatMatchPercentage(matchPct) : "?";
  return `${nombreCompleto(cand)} - ${pct} de afinidad conmigo segun mi cuestionario en TinderPolitico.`;
}

// ---------- Styles ----------
//
// Reglas: TODOS los valores dimensionales vienen de tokens del DS:
//   - spacing.sp1..sp9 para padding/margin/gap
//   - radii.rSm..rFull para borderRadius
//   - typography.* para fontSize/fontWeight/lineHeight
//
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sp6,
    gap: spacing.sp3,
  },
  centerMuted: { textAlign: "center" },
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp4,
  },

  // Match block (bloque debajo del ProfileHero cuando hay match)
  matchBlock: {
    alignItems: "center",
    gap: spacing.sp2,
    paddingVertical: spacing.sp2,
  },
  matchBig: {
    // TASK-037: typography.display2 -- fontSize:40 ahora en el sistema.
    ...typography.display2,
  },
  matchCaption: {
    ...typography.overline,
    fontWeight: "600",
  },
  confianzaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
  },

  // Empty state (sin match)
  emptyBox: {
    padding: spacing.sp4,
    borderRadius: radii.rLg,
    borderWidth: 1,
    gap: spacing.sp2,
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.h3,
    textAlign: "center",
  },
  emptyBody: { textAlign: "center" },

  // Actions
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sp3,
  },

  // Tabs
  tabsStretch: { alignSelf: "stretch" },

  // Resumen tab — estilos en DetalleCandidato/ResumenTab.tsx

  // paragraph se mantiene aqui: usado en el modal de confianza y en el
  // estado de error ("Candidato no encontrado").
  paragraph: { ...typography.small },
});
