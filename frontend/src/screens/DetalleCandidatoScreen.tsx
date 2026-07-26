/**
 * DetalleCandidatoScreen: perfil completo del candidato.
 *
 * Basado en design-system-lowfi.html · Template 13 (Perfil de candidato) +
 * Template 14 (Perfil · empty state · sin match).
 *
 * Layout:
 *   - ScreenTopBar (back + titulo "Perfil de candidato" + subtitulo con tipo eleccion)
 *   - Hero centrado (avatar XL + nombre + partido + match% + chip confianza)
 *     - Empty variant (matchPct == null): sin match%, con CTA "Empezar cuestionario"
 *   - CTA "Marcar como mi elegido" (rename de "Este es mi voto final")
 *   - ActionRow (3 IconButton: favorito, descartar, compartir)
 *   - Tabs: Resumen / Posturas (N) / Noticias (N)
 *   - Contenido por tab
 *
 * No usa AppShell porque es una detail screen accesible desde 4 origenes
 * distintos (Resultados, Guardados, Comparar, Swipe) y no pertenece a un
 * tab especifico.
 */

import React, { useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
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
import type { Candidato, Noticia } from "../api/endpoints";
import {
  Avatar,
  Button,
  CandidatoPosturas,
  Chip,
  IconButton,
  Icon,
  MatchExplanation,
  RadarChart,
  ScreenTopBar,
  ShareModal,
  Spinner,
  Tabs,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { useThemeColors } from "../theme/useTheme";

type PerfilTab = "resumen" | "posturas" | "noticias";

function fullName(c: Candidato): string {
  return `${c.nombre} ${c.apellido ?? ""}`.trim();
}

function initials(c: Candidato): string {
  const n = c.nombre?.[0] ?? "";
  const a = c.apellido?.[0] ?? "";
  return (n + a).toUpperCase() || "?";
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

  function handleGoToCuestionario() {
    navigation.navigate("Cuestionario");
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
        <Text style={{ color: c.textSecondary, marginBottom: 12 }}>
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

        <Hero
          candidato={candidato}
          matchPct={matchPct}
          confianza={confianza}
          scoreCol={scoreCol}
          isMyVote={isMyVote}
          onOpenConfianzaInfo={() => setConfianzaInfoOpen(true)}
          onEmptyCta={handleGoToCuestionario}
        />

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
          style={{ alignSelf: "stretch" }}
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

      <ConfianzaInfoModal
        visible={confianzaInfoOpen}
        onClose={() => setConfianzaInfoOpen(false)}
      />
    </View>
  );
}

// ---------- Sub-componentes ----------

interface HeroProps {
  candidato: Candidato;
  matchPct: number | null;
  confianza: string | null;
  scoreCol: string;
  isMyVote: boolean;
  onOpenConfianzaInfo: () => void;
  onEmptyCta: () => void;
}

function Hero({
  candidato,
  matchPct,
  confianza,
  scoreCol,
  isMyVote,
  onOpenConfianzaInfo,
  onEmptyCta,
}: HeroProps) {
  const c = useThemeColors();
  const hasMatch = matchPct != null;

  return (
    <View style={styles.hero}>
      <Avatar
        size="xl"
        initials={initials(candidato)}
        backgroundColor={c.primary}
      />
      <Text style={[styles.heroName, { color: c.text }]} numberOfLines={2}>
        {fullName(candidato)}
      </Text>
      {candidato.partido ? (
        <Text style={[styles.heroPartido, { color: c.textSecondary }]}>
          {candidato.partido}
        </Text>
      ) : null}

      {hasMatch ? (
        <>
          <Text style={[styles.matchBig, { color: scoreCol }]}>
            {formatMatchPercentage(matchPct)}
          </Text>
          <Text style={[styles.matchCaption, { color: c.textSecondary }]}>
            Compatibilidad
          </Text>
          {confianza ? (
            <View style={styles.confianzaRow}>
              <Chip>{`Confianza ${confianza.toLowerCase()}`}</Chip>
              <Pressable
                onPress={onOpenConfianzaInfo}
                accessibilityRole="button"
                accessibilityLabel="Que significa la confianza"
                hitSlop={8}
                style={[
                  styles.infoBtn,
                  { borderColor: c.border, backgroundColor: c.card },
                ]}
              >
                <Text style={[styles.infoBtnText, { color: c.textSecondary }]}>
                  ?
                </Text>
              </Pressable>
            </View>
          ) : null}
          {isMyVote ? (
            <Text
              style={[
                styles.myVoteBadge,
                { color: c.primary, borderColor: c.primary },
              ]}
            >
              Marcado como tu elegido
            </Text>
          ) : null}
        </>
      ) : (
        <View style={[styles.emptyBox, { borderColor: c.border, backgroundColor: c.card }]}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>
            Aun no tienes match calculado
          </Text>
          <Text style={[styles.emptyBody, { color: c.textSecondary }]}>
            Responde el cuestionario para ver tu porcentaje de afinidad con este
            candidato.
          </Text>
          <Button onPress={onEmptyCta}>Empezar cuestionario</Button>
        </View>
      )}
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
        accessibilityLabel={
          isDescartado ? "Restaurar" : "Descartar"
        }
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
  posturas: ReturnType<typeof usePosturasCandidato>["data"] extends
    | infer T
    | undefined
    ? NonNullable<T>
    : never;
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
  const posturasDestacadas = (posturas ?? []).slice(0, 3);

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
      ) : null}

      {!isGuest && hasMatch ? (
        <View style={styles.section}>
          <MatchExplanation candidatoId={candidato.id} />
        </View>
      ) : null}
    </View>
  );
}

function NoticiasTab({ noticias }: { noticias: Noticia[] }) {
  const c = useThemeColors();
  if (noticias.length === 0) {
    return (
      <Text
        style={[styles.empty, { color: c.textSecondary }]}
      >
        Aun no hay noticias cargadas para este candidato.
      </Text>
    );
  }
  return (
    <View style={styles.tabBody}>
      {noticias.map((n) => (
        <Pressable
          key={n.id}
          onPress={() => n.url && Linking.openURL(n.url)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir noticia: ${n.titulo}`}
          style={({ pressed }) => [
            styles.noticiaCard,
            {
              backgroundColor: c.card,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[styles.noticiaTitulo, { color: c.text }]}
            numberOfLines={2}
          >
            {n.titulo}
          </Text>
          {n.fuente ? (
            <Text style={[styles.noticiaFuente, { color: c.primary }]}>
              {n.fuente}
            </Text>
          ) : null}
          {n.descripcion ? (
            <Text
              style={[styles.noticiaDesc, { color: c.textSecondary }]}
              numberOfLines={3}
            >
              {n.descripcion}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

function ConfianzaInfoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const c = useThemeColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.modalCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.modalTitle, { color: c.text }]}>
            Que significa la confianza
          </Text>
          <Text style={[styles.paragraph, { color: c.textSecondary }]}>
            Es que tan seguro es este porcentaje. Depende de cuantas preguntas
            respondiste y de cuantas tiene contestadas el candidato en su
            perfil.
          </Text>
          <Text style={[styles.paragraph, { color: c.textSecondary }]}>
            Mientras mas preguntas coincidan en ambos, mayor confianza.
          </Text>
          <Button variant="ghost" onPress={onClose}>
            Entendido
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Helpers ----------

function buildShareText(cand: Candidato, matchPct: number | null): string {
  const pct = matchPct != null ? `${Math.round(matchPct)}%` : "?";
  return `${fullName(cand)} — ${pct} de afinidad conmigo segun mi cuestionario en TinderPolitico.`;
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },

  hero: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  heroPartido: { fontSize: 13 },
  matchBig: {
    fontSize: 44,
    fontWeight: "900",
    marginTop: 4,
    lineHeight: 48,
  },
  matchCaption: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "600",
  },
  confianzaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  infoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: { fontSize: 11, fontWeight: "700" },
  myVoteBadge: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "stretch",
    gap: 8,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  emptyBody: { fontSize: 13, textAlign: "center" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },

  tabBody: { gap: 16, marginTop: 4 },

  section: { gap: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paragraph: { fontSize: 14, lineHeight: 20 },

  radarWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },

  posturaCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  posturaPregunta: { fontSize: 13, fontWeight: "700" },
  posturaRespuesta: { fontSize: 13 },

  noticiaCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  noticiaTitulo: { fontSize: 15, fontWeight: "700" },
  noticiaFuente: { fontSize: 12, fontWeight: "600" },
  noticiaDesc: { fontSize: 13, lineHeight: 18 },

  empty: {
    padding: 24,
    textAlign: "center",
    fontStyle: "italic",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: "800" },
});
