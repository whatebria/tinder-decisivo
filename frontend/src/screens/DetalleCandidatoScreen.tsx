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
 * distintos (Resultados, Guardados, Comparar, Swipe).
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
  useDecisionActual,
  useDescartados,
  useFavoritos,
  useNoticiasCandidato,
  usePosturasCandidato,
  useSaveDecision,
  useTiposEleccion,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import type { Candidato, Noticia, PosturaCandidatoDetalle } from "../api/endpoints";
import type { Sentiment } from "../components";
import {
  Button,
  CandidatoPosturas,
  IconButton,
  Icon,
  MatchExplanation,
  MatchTier,
  Modal,
  NewsCard,
  NoticiaDetailSheet,
  ProfileHero,
  RadarChart,
  ScreenTopBar,
  ShareModal,
  Spinner,
  Tabs,
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
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const decisionQ = useDecisionActual(tipoEleccionId);
  const tiposQ = useTiposEleccion();
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();
  const saveDecision = useSaveDecision();

  const candidato = candidatoQ.data ?? null;
  const posturas = posturasQ.data ?? [];
  const noticias = noticiasQ.data ?? [];

  const isFavorito = (favoritosQ.data ?? []).some(
    (f) => f.candidato === candidatoId,
  );
  const isDescartado = (descartadosQ.data ?? []).some(
    (d) => d.candidato === candidatoId,
  );
  const isMyVote = decisionQ.data?.candidato_elegido === candidatoId;
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
  const scoreCol = getMatchColor(matchPct ?? 0, c);

  function handleSaveDecision() {
    if (!tipoEleccionId) {
      toast.error(
        "Falta el tipo de eleccion",
        "Vuelve al inicio y elige un cuestionario.",
      );
      return;
    }
    saveDecision.mutate(
      { candidatoId, tipoEleccionId },
      {
        onSuccess: () =>
          toast.success("Marcado como tu elegido", "Guardamos tu preferencia."),
        onError: (e) =>
          toast.error("No pudimos guardar", getErrorMessage(e)),
      },
    );
  }

  if (candidatoQ.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Spinner size="large" />
      </View>
    );
  }

  if (!candidato) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Text style={[styles.paragraph, styles.centerMuted, { color: c.textSecondary }]}>
          Candidato no encontrado.
        </Text>
        <Button variant="ghost" onPress={() => navigation.goBack()}>
          Volver
        </Button>
      </View>
    );
  }

  const shareText = buildShareText(candidato, matchPct);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
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
            isMyVote={isMyVote}
            onOpenInfo={() => setConfianzaInfoOpen(true)}
          />
        ) : (
          <EmptyMatchBlock
            onStart={() => navigation.navigate("Cuestionario")}
          />
        )}

        {!isGuest && hasMatch && !isMyVote && !isDescartado ? (
          <Button
            variant="secondary"
            onPress={handleSaveDecision}
            loading={saveDecision.isPending}
            leftIcon={<Icon name="check" size={18} color={c.primary} />}
          >
            Marcar como mi elegido
          </Button>
        ) : null}

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
            { value: "noticias", label: "Noticias", count: noticias.length },
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
          />
        ) : tab === "posturas" ? (
          <CandidatoPosturas
            posturas={posturas}
            loading={posturasQ.isLoading}
          />
        ) : (
          <NoticiasTab noticias={noticias} />
        )}
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
    </View>
  );
}

// ---------- Sub-componentes ----------

interface MatchBlockProps {
  matchPct: number;
  confianza: string | null;
  scoreCol: string;
  isMyVote: boolean;
  onOpenInfo: () => void;
}

function MatchBlock({
  matchPct,
  confianza,
  scoreCol,
  isMyVote,
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
      {isMyVote ? (
        <View style={[styles.myVoteBadge, { borderColor: c.primary }]}>
          <Text style={[styles.myVoteText, { color: c.primary }]}>
            Marcado como tu elegido
          </Text>
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
        variant={isDescartado ? "solid" : "soft"}
      >
        <Icon
          name="close"
          size={20}
          color={isDescartado ? c.textOnPrimary : c.danger}
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

interface ResumenTabProps {
  candidato: Candidato;
  hasMatch: boolean;
  chartData: Record<string, number>;
  scoreCol: string;
  posturas: PosturaCandidatoDetalle[];
  isGuest: boolean;
}

function ResumenTab({
  candidato,
  hasMatch,
  chartData,
  scoreCol,
  posturas,
  isGuest,
}: ResumenTabProps) {
  const c = useThemeColors();
  const posturasDestacadas = posturas.slice(0, 3);

  return (
    <View style={styles.tabBody}>
      {candidato.bio ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Sobre el candidato
          </Text>
          <Text style={[styles.paragraph, { color: c.text }]}>
            {candidato.bio}
          </Text>
        </View>
      ) : null}

      {candidato.propuesta_electoral ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Propuesta electoral
          </Text>
          <Text style={[styles.paragraph, { color: c.text }]}>
            {candidato.propuesta_electoral}
          </Text>
        </View>
      ) : null}

      {hasMatch && Object.keys(chartData).length >= 3 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Afinidad por eje tematico
          </Text>
          <View style={styles.radarWrap}>
            <RadarChart data={chartData} size={260} color={scoreCol} />
          </View>
        </View>
      ) : null}

      {posturasDestacadas.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
            Posturas destacadas
          </Text>
          <View style={styles.posturasList}>
            {posturasDestacadas.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.posturaCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text
                  style={[styles.posturaPregunta, { color: c.text }]}
                  numberOfLines={2}
                >
                  {p.pregunta_texto ?? "Pregunta"}
                </Text>
                <Text style={[styles.posturaRespuesta, { color: c.textSecondary }]}>
                  {p.opcion_respuesta_texto ?? ""}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {!isGuest && hasMatch ? (
        <View style={styles.section}>
          <MatchExplanation candidatoId={candidato.id} />
        </View>
      ) : null}
    </View>
  );
}

/** Mapea el modelo Noticia a NewsCard. Sin sentiment del backend usamos "neutral". */
function noticiaToNewsCardProps(n: Noticia) {
  const when = formatWhen(n);
  const sentiment: Sentiment = "neutral";
  return {
    headline: n.titulo,
    snippet: n.descripcion ?? "",
    source: n.fuente ?? "Fuente",
    when,
    sentiment,
  };
}

function formatWhen(n: Noticia): string {
  const raw =
    (n as unknown as { fecha_publicacion?: string; fecha?: string; created_at?: string })
      .fecha_publicacion ??
    (n as unknown as { fecha?: string }).fecha ??
    (n as unknown as { created_at?: string }).created_at ??
    "";
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NoticiasTab({ noticias }: { noticias: Noticia[] }) {
  const c = useThemeColors();
  const [selected, setSelected] = React.useState<NoticiaDetail | null>(null);

  if (noticias.length === 0) {
    return (
      <Text style={[styles.empty, { color: c.textSecondary }]}>
        Aun no hay noticias cargadas para este candidato.
      </Text>
    );
  }
  return (
    <View style={styles.noticiasList}>
      {noticias.map((n) => {
        const cardProps = noticiaToNewsCardProps(n);
        return (
          <NewsCard
            key={n.id}
            {...cardProps}
            onPress={() =>
              setSelected({
                id: n.id,
                titulo: n.titulo,
                descripcion: n.descripcion ?? "",
                url: n.url,
                fuente: n.fuente,
                imagenUrl: (n as unknown as { imagen_url?: string | null }).imagen_url ?? null,
                fechaFormateada: cardProps.when,
                sentiment: cardProps.sentiment,
              })
            }
          />
        );
      })}
      <NoticiaDetailSheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        noticia={selected}
      />
    </View>
  );
}

// ---------- Helpers ----------

function buildShareText(cand: Candidato, matchPct: number | null): string {
  const pct = matchPct != null ? `${Math.round(matchPct)}%` : "?";
  return `${nombreCompleto(cand)} — ${pct} de afinidad conmigo segun mi cuestionario en TinderPolitico.`;
}

// ---------- Styles ----------
//
// Reglas: TODOS los valores dimensionales vienen de tokens del DS:
//   - spacing.sp1..sp9 para padding/margin/gap
//   - radii.rSm..rFull para borderRadius
//   - typography.* para fontSize/fontWeight/lineHeight
//
// Excepcion documentada: styles.matchBig usa un fontSize 40 fuera de la
// escala tipografica estandar, por diseno explicito del wireframe #13
// (numero de compatibilidad ultra prominente). Es el UNICO hardcode.

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    // Excepcion: 40 no esta en typography (max display=34), pero el
    // wireframe pide un numero muy prominente. Documentado arriba.
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 44,
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
  myVoteBadge: {
    marginTop: spacing.sp2,
    borderWidth: 1,
    borderRadius: radii.rFull,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
  },
  myVoteText: {
    ...typography.overline,
    fontWeight: "700",
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

  // Tab body wrapper
  tabBody: { gap: spacing.sp4, marginTop: spacing.sp1 },
  section: { gap: spacing.sp2 },
  sectionLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  paragraph: typography.small,

  radarWrap: {
    alignItems: "center",
    paddingVertical: spacing.sp2,
  },

  // Posturas destacadas (Resumen)
  posturasList: { gap: spacing.sp4, marginTop: spacing.sp1 },
  posturaCard: {
    borderWidth: 1,
    borderRadius: radii.rMd,
    padding: spacing.sp3,
    gap: spacing.sp1,
  },
  posturaPregunta: {
    ...typography.small,
    fontWeight: "700",
  },
  posturaRespuesta: typography.small,

  // Noticias tab
  noticiasList: { gap: spacing.sp3, marginTop: spacing.sp1 },
  empty: {
    padding: spacing.sp6,
    textAlign: "center",
    fontStyle: "italic",
  },
});
