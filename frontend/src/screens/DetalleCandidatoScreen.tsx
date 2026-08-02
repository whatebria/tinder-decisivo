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
 *   - NewsCard (molecule) en la tab Noticias
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
  useNoticiasCandidato,
  usePosturasCandidato,
  useTiposEleccion,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import type { Candidato, PosturaCandidatoDetalle } from "../api/endpoints";
import type { Sentiment } from "../components";
import {
  Button,
  CandidatoPosturas,
  EmptyState,
  IconButton,
  Icon,
  MatchExplanation,
  MatchTier,
  Modal,
  NewsCard,
  NoticiaDetailSheet,
  ProfileHero,
  RadarChart,
  ScreenChrome,
  ScreenTopBar,
  ShareModal,
  Spinner,
  Tabs,
  CoachMarkTour,
  useToast,
  type NoticiaDetail,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { iniciales, nombreCompleto } from "../utils/candidato";
import { NoticiasTab } from "./DetalleCandidato/NoticiasTab";
import { ResumenTab } from "./DetalleCandidato/ResumenTab";
import { SHOW_NOTICIAS } from "../constants/features";

type PerfilTab = "resumen" | "posturas" | "noticias";

/** Mapea el string de confianza del backend al tier del DS. */
function confianzaToTier(confianza: string | null): "high" | "mid" | "low" {
  const v = (confianza ?? "").toUpperCase();
  if (v === "ALTA") return "high";
  if (v === "BAJA") return "low";
  return "mid";
}

export function DetalleCandidatoScreen({
  route,
  navigation,
}: RootStackScreenProps<"DetalleCandidato">) {
  const c = useThemeColors();
  const { candidatoId, breakdown, matchPct, confianza } = route.params;

  const isGuest = useAuthStore((s) => s.isGuest);
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const toast = useToast();

  const [tab, setTab] = useState<PerfilTab>("resumen");
  const [shareOpen, setShareOpen] = useState(false);
  const [confianzaInfoOpen, setConfianzaInfoOpen] = useState(false);

  const candidatoQ = useCandidato(candidatoId);
  const noticiasQ = useNoticiasCandidato(candidatoId);
  const posturasQ = usePosturasCandidato(candidatoId, tipoEleccionId);
  // BUG-030: guests no usan favoritos/descartados (ActionRow no renderiza para ellos).
  // Evita 2 requests de red por visita en modo invitado.
  const favoritosQ = useFavoritos({ enabled: !isGuest });
  const descartadosQ = useDescartados({ enabled: !isGuest });
  const tiposQ = useTiposEleccion();
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();

  const candidato = candidatoQ.data ?? null;
  const posturas = posturasQ.data ?? [];
  const noticias = noticiasQ.data ?? [];

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
            onToggleFav={() =>
              toggleFav.mutate(candidatoId, {
                onError: (e) => toast.error("Error", getErrorMessage(e)),
              })
            }
            onToggleDesc={() =>
              toggleDesc.mutate(candidatoId, {
                onError: (e) => toast.error("Error", getErrorMessage(e)),
              })
            }
            onShare={() => setShareOpen(true)}
          />
        ) : null}

        <Tabs<PerfilTab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "resumen", label: "Resumen" },
            { value: "posturas", label: "Posturas", count: posturas.length },
            ...(SHOW_NOTICIAS
              ? [{ value: "noticias" as const, label: "Noticias", count: noticias.length }]
              : []),
          ]}
          style={styles.tabsStretch}
        />

        {tab === "resumen" ? (
          <ResumenTab
            candidato={candidato}
            hasMatch={hasMatch}
            chartData={chartData}
            scoreCol={scoreCol}
            posturas={posturas}
            isGuest={isGuest}
            onVerTodasPosturas={() => setTab("posturas")}
          />
        ) : tab === "posturas" ? (
          <CandidatoPosturas
            posturas={posturas}
            loading={posturasQ.isLoading}
          />
        ) : tab === "noticias" && SHOW_NOTICIAS ? (
          <NoticiasTab noticias={noticias} />
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
            label={`Confianza ${confianza.toLowerCase()}`}
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

  // Noticias tab — estilos en DetalleCandidato/NoticiasTab.tsx
  // Resumen tab — estilos en DetalleCandidato/ResumenTab.tsx

  // paragraph se mantiene aqui: usado en el modal de confianza y en el
  // estado de error ("Candidato no encontrado").
  paragraph: { ...typography.small },
});
