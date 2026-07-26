/**
 * SwipeScreen: stack estilo Tinder para descubrir candidatos rapido.
 *
 * - Pool: todos los candidatos del tipo de eleccion activo.
 * - Excluye los que ya son favoritos, descartados o el voto final
 *   (para no repetir).
 * - Swipe RIGHT / boton verde -> agrega a favoritos.
 * - Swipe LEFT  / boton rojo  -> agrega a descartados.
 * - Tap / boton info -> abre DetalleCandidato.
 * - Al vaciar el pool: pantalla "ya viste a todos" con CTAs.
 *
 * Requiere auth (favoritos/descartados necesitan user). Guest ve un CTA.
 *
 * Migrado a Fase 5:
 *   - AppShell con active=null (accedido desde Home, screen polimorfica)
 *   - HomeTopBar con subtitle dinamico ("N por evaluar")
 *   - Empty states via EmptyState (organism)
 *   - Iconos reales (Icon atom) en botones de accion en vez de "X"/"OK"/"i"
 *   - Deshacer usa Button variant="secondary" size="sm"
 *   - Cero hardcodes: todo via spacing/radii/typography tokens
 */

import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import type { Candidato } from "../api/endpoints";
import {
  useCandidatos,
  useDescartados,
  useFavoritos,
  useMatchCandidatos,
  useToggleDescartado,
  useToggleFavorito,
} from "../api/hooks";
import {
  AppShell,
  Button,
  EmptyState,
  HomeTopBar,
  Icon,
  Spinner,
  useToast,
} from "../components";
import { SwipeCard } from "../components/organisms/SwipeCard";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

// Cuantas cards "de fondo" pre-renderizar detras de la activa.
const STACK_PEEK = 1;

// Altura del stack. Es un caso de "canvas fija" (patron Tinder): la card
// no responde a contenido variable, sino que el contenido se recorta. No
// se puede tokenizar sin agregar un token semantico ('cardCanvas') que
// hoy solo se usa aca -> YAGNI.
const CARD_CANVAS_HEIGHT = 520;
const CARD_PHOTO_HEIGHT = 260;
const ROUND_BTN_SIZE = 56;

export function SwipeScreen({ navigation }: RootStackScreenProps<"Swipe">) {
  const c = useThemeColors();
  const isGuest = useAuthStore((s) => s.isGuest);
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const toast = useToast();

  const candidatosQ = useCandidatos();
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const matchesQ = useMatchCandidatos();
  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();

  // Pool filtrado:
  // - Por tipo de eleccion activo
  // - Excluye favoritos y descartados existentes
  const pool = useMemo(() => {
    if (isGuest) return [];
    const todos = candidatosQ.data ?? [];
    const favIds = new Set((favoritosQ.data ?? []).map((f) => f.candidato));
    const descIds = new Set((descartadosQ.data ?? []).map((d) => d.candidato));
    return todos.filter((cand) => {
      if (cand.id == null) return false;
      if (favIds.has(cand.id) || descIds.has(cand.id)) return false;
      if (tipoEleccionId != null) {
        const tipos = (cand.tipos_eleccion ?? []) as unknown as number[];
        if (tipos.length > 0 && !tipos.includes(tipoEleccionId)) return false;
      }
      return true;
    });
  }, [
    isGuest,
    candidatosQ.data,
    favoritosQ.data,
    descartadosQ.data,
    tipoEleccionId,
  ]);

  // Mapa de match% por candidato (opcional, si el user ya calculo matches)
  const matchPctById = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of matchesQ.data ?? []) {
      const id = r.candidato_data?.id;
      if (id != null) m.set(id, Number(r.match_percentage));
    }
    return m;
  }, [matchesQ.data]);

  const [index, setIndex] = useState(0);
  const [ultimaAccion, setUltimaAccion] = useState<{
    candidato: Candidato;
    tipo: "like" | "nope";
  } | null>(null);

  function advance() {
    setIndex((i) => i + 1);
  }

  function handleLike(cand: Candidato) {
    if (cand.id == null) return;
    toggleFav.mutate(cand.id, {
      onError: (e) =>
        toast.error("No pudimos guardar el favorito", getErrorMessage(e)),
    });
    setUltimaAccion({ candidato: cand, tipo: "like" });
    advance();
  }

  function handleNope(cand: Candidato) {
    if (cand.id == null) return;
    toggleDesc.mutate(cand.id, {
      onError: (e) =>
        toast.error("No pudimos descartar", getErrorMessage(e)),
    });
    setUltimaAccion({ candidato: cand, tipo: "nope" });
    advance();
  }

  function handleUndo() {
    if (!ultimaAccion) return;
    const { candidato, tipo } = ultimaAccion;
    if (candidato.id == null) return;
    // Los toggles son idempotentes: llamarlos de nuevo revierte la accion.
    if (tipo === "like") {
      toggleFav.mutate(candidato.id, {
        onError: (e) =>
          toast.error("No pudimos deshacer el favorito", getErrorMessage(e)),
      });
    } else {
      toggleDesc.mutate(candidato.id, {
        onError: (e) =>
          toast.error("No pudimos deshacer el descarte", getErrorMessage(e)),
      });
    }
    setIndex((i) => Math.max(0, i - 1));
    setUltimaAccion(null);
    toast.success(
      `Deshecho: ${candidato.nombre} ${candidato.apellido ?? ""}`.trim(),
    );
  }

  function handleTap(cand: Candidato) {
    if (cand.id == null) return;
    const pct = matchPctById.get(cand.id) ?? 0;
    navigation.navigate("DetalleCandidato", {
      candidatoId: cand.id,
      breakdown: null,
      matchPct: pct,
      confianza: "TENTATIVA",
    });
  }

  // ---------- Estados ----------

  if (isGuest) {
    return (
      <AppShell active={null} navigation={navigation}>
        <View style={[styles.stateWrap, { backgroundColor: c.bg }]}>
          <EmptyState
            icon="user"
            title="Modo invitado"
            description="El swipe usa tus favoritos y descartados. Crea una cuenta para usarlo."
            actionLabel="Volver"
            onAction={() => navigation.goBack()}
          />
        </View>
      </AppShell>
    );
  }

  if (candidatosQ.isLoading) {
    return (
      <AppShell active={null} navigation={navigation}>
        <View style={[styles.stateWrap, { backgroundColor: c.bg }]}>
          <Spinner size="large" />
        </View>
      </AppShell>
    );
  }

  const remaining = pool.slice(index);
  if (remaining.length === 0) {
    return (
      <AppShell active={null} navigation={navigation}>
        <View style={[styles.stateWrap, { backgroundColor: c.bg }]}>
          <EmptyState
            icon="check"
            title="Ya viste a todos"
            description="Ya evaluaste a todos los candidatos disponibles para esta eleccion."
            actionLabel="Ver mi ranking"
            onAction={() => navigation.navigate("Resultados")}
          />
        </View>
      </AppShell>
    );
  }

  // Cards a renderizar (de atras hacia adelante para z-index correcto)
  const visibles = remaining.slice(0, STACK_PEEK + 1);

  return (
    <AppShell active={null} navigation={navigation}>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <HomeTopBar brand="Swipe" />
        <Text style={[styles.counter, { color: c.textSecondary }]}>
          {`${remaining.length} por evaluar`}
        </Text>

        {ultimaAccion ? (
          <View style={styles.undoRow}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={handleUndo}
            >
              Deshacer
            </Button>
          </View>
        ) : null}

        <View style={styles.stackArea}>
          {/* Renderizo de atras a adelante */}
          {visibles
            .slice()
            .reverse()
            .map((cand, idxRev) => {
              const relIdx = visibles.length - 1 - idxRev; // 0 = activa
              const esActiva = relIdx === 0;
              const pct = cand.id != null ? matchPctById.get(cand.id) : undefined;

              return (
                <SwipeCard
                  key={cand.id}
                  onSwipedLeft={() => handleNope(cand)}
                  onSwipedRight={() => handleLike(cand)}
                  onTap={() => handleTap(cand)}
                  disabled={!esActiva}
                  scaleBelow={esActiva ? 1 : 0.96}
                >
                  <CandidatoCard candidato={cand} matchPct={pct} />
                </SwipeCard>
              );
            })}
        </View>

        {/* Botones alternativos (para desktop/mouse sin gesto) */}
        <View style={styles.actions}>
          <RoundBtn
            iconName="close"
            color={c.danger}
            label="Descartar"
            onPress={() => handleNope(remaining[0])}
          />
          <RoundBtn
            iconName="info"
            color={c.primary}
            label="Ver detalle"
            onPress={() => handleTap(remaining[0])}
          />
          <RoundBtn
            iconName="check"
            color={c.success}
            label="Agregar a favoritos"
            onPress={() => handleLike(remaining[0])}
          />
        </View>
      </View>
    </AppShell>
  );
}

// ---------- Sub-componentes locales ----------

interface CandidatoCardProps {
  candidato: Candidato;
  matchPct?: number;
}

function CandidatoCard({ candidato, matchPct }: CandidatoCardProps) {
  const c = useThemeColors();
  const scoreCol =
    matchPct != null ? getMatchColor(matchPct, c) : c.textSecondary;

  return (
    <View
      style={[
        styles.candidatoCard,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      {candidato.profile_picture ? (
        <Image
          source={{ uri: candidato.profile_picture }}
          style={styles.foto}
          accessibilityLabel={`Foto de ${candidato.nombre}`}
        />
      ) : (
        <View style={[styles.foto, { backgroundColor: c.border }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.nombre, { color: c.text }]} numberOfLines={2}>
          {candidato.nombre} {candidato.apellido ?? ""}
        </Text>
        {candidato.partido ? (
          <Text style={[styles.partido, { color: c.textSecondary }]}>
            {candidato.partido}
          </Text>
        ) : null}
        {matchPct != null && matchPct > 0 ? (
          <View style={styles.matchRow}>
            <Text style={[styles.matchLabel, { color: c.textSecondary }]}>
              Match:
            </Text>
            <Text style={[styles.matchValor, { color: scoreCol }]}>
              {formatMatchPercentage(matchPct)}
            </Text>
          </View>
        ) : null}
        {candidato.propuesta_electoral ? (
          <Text
            style={[styles.propuesta, { color: c.text }]}
            numberOfLines={5}
          >
            {candidato.propuesta_electoral}
          </Text>
        ) : candidato.bio ? (
          <Text
            style={[styles.propuesta, { color: c.text }]}
            numberOfLines={5}
          >
            {candidato.bio}
          </Text>
        ) : null}
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          Toca para ver mas
        </Text>
      </View>
    </View>
  );
}

interface RoundBtnProps {
  iconName: React.ComponentProps<typeof Icon>["name"];
  color: string;
  label: string;
  onPress: () => void;
}

function RoundBtn({ iconName, color, label, onPress }: RoundBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundBtn,
        { borderColor: color, opacity: pressed ? 0.6 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={iconName} size={24} color={color} />
    </Pressable>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: { flex: 1 },
  stateWrap: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.sp5,
  },

  counter: {
    ...typography.small,
    fontWeight: "600",
    paddingHorizontal: spacing.sp5,
    marginTop: -spacing.sp1,
    marginBottom: spacing.sp2,
  },

  undoRow: {
    paddingHorizontal: spacing.sp5,
    alignItems: "flex-end",
    marginBottom: spacing.sp2,
  },

  stackArea: {
    height: CARD_CANVAS_HEIGHT,
    marginHorizontal: spacing.sp4,
    position: "relative",
  },

  candidatoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.rLg,
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    height: CARD_PHOTO_HEIGHT,
    resizeMode: "cover",
  },
  info: { padding: spacing.sp4, gap: spacing.sp2 },
  nombre: {
    ...typography.h2,
    fontWeight: "800",
  },
  partido: {
    ...typography.small,
    fontWeight: "600",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
    marginTop: spacing.sp1,
  },
  matchLabel: {
    ...typography.overline,
    fontWeight: "600",
  },
  matchValor: {
    ...typography.h3,
    fontWeight: "800",
  },
  propuesta: {
    ...typography.small,
    marginTop: spacing.sp1,
  },
  hint: {
    ...typography.overline,
    fontStyle: "italic",
    marginTop: spacing.sp2,
    textAlign: "center",
    textTransform: "none",
    letterSpacing: 0,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sp5,
    padding: spacing.sp4,
    marginTop: spacing.sp3,
  },
  roundBtn: {
    width: ROUND_BTN_SIZE,
    height: ROUND_BTN_SIZE,
    borderRadius: ROUND_BTN_SIZE / 2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
