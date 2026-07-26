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
import { SwipeCard } from "../components/organisms/SwipeCard";
import { useToast } from "../components/molecules/Toast";
import { Link } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { formatMatchPercentage, getMatchColor } from "../services/matching";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { useThemeColors } from "../theme/useTheme";

// Cuantas cards "de fondo" pre-renderizar detras de la activa.
const STACK_PEEK = 1;

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
      onError: (e) => toast.error("No pudimos guardar el favorito", getErrorMessage(e)),
    });
    setUltimaAccion({ candidato: cand, tipo: "like" });
    advance();
  }

  function handleNope(cand: Candidato) {
    if (cand.id == null) return;
    toggleDesc.mutate(cand.id, {
      onError: (e) => toast.error("No pudimos descartar", getErrorMessage(e)),
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
      `Deshecho: ${candidato.nombre} ${candidato.apellido ?? ""}`.trim()
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
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>
          Modo invitado
        </Text>
        <Text style={[styles.emptyBody, { color: c.textSecondary }]}>
          El swipe usa tus favoritos y descartados. Crea una cuenta para
          usarlo.
        </Text>
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </View>
    );
  }

  if (candidatosQ.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Text style={{ color: c.textSecondary }}>Cargando candidatos...</Text>
      </View>
    );
  }

  const remaining = pool.slice(index);
  if (remaining.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>
          Ya viste a todos
        </Text>
        <Text style={[styles.emptyBody, { color: c.textSecondary }]}>
          Ya evaluaste a todos los candidatos disponibles para esta eleccion.
        </Text>
        <View style={{ gap: 8, marginTop: 12 }}>
          <Link block onPress={() => navigation.navigate("MisFavoritos")}>
            Ver mis favoritos
          </Link>
          <Link block onPress={() => navigation.navigate("Resultados")}>
            Ver mi ranking
          </Link>
          <Link block onPress={() => navigation.goBack()}>Volver</Link>
        </View>
      </View>
    );
  }

  // Cards a renderizar (de atras hacia adelante para z-index correcto)
  const visibles = remaining.slice(0, STACK_PEEK + 1);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Swipe</Text>
        <View style={styles.headerRight}>
          {ultimaAccion ? (
            <Pressable
              onPress={handleUndo}
              style={({ pressed }) => [
                styles.undoBtn,
                { borderColor: c.primary, opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Deshacer ultima accion"
            >
              <Text style={{ color: c.primary, fontWeight: "700", fontSize: 12 }}>
                Deshacer
              </Text>
            </Pressable>
          ) : null}
          <Text style={[styles.counter, { color: c.textSecondary }]}>
            {remaining.length} por evaluar
          </Text>
        </View>
      </View>

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
                <CandidatoCard candidato={cand} matchPct={pct} colors={c} />
              </SwipeCard>
            );
          })}
      </View>

      {/* Botones alternativos (para desktop/mouse sin gesto) */}
      <View style={styles.actions}>
        <RoundBtn
          label="X"
          color={c.danger}
          onPress={() => handleNope(remaining[0])}
        />
        <RoundBtn
          label="i"
          color={c.primary}
          onPress={() => handleTap(remaining[0])}
        />
        <RoundBtn
          label="OK"
          color={c.success}
          onPress={() => handleLike(remaining[0])}
        />
      </View>

      <View style={{ padding: 12, alignItems: "center" }}>
        <Link block onPress={() => navigation.goBack()}>Salir</Link>
      </View>
    </View>
  );
}

// ---------- Sub-componentes ----------

interface CandidatoCardProps {
  candidato: Candidato;
  matchPct?: number;
  colors: ReturnType<typeof useThemeColors>;
}

function CandidatoCard({ candidato, matchPct, colors: c }: CandidatoCardProps) {
  const scoreCol = matchPct != null ? getMatchColor(matchPct, c) : c.textSecondary;

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
          <Text style={[styles.propuesta, { color: c.text }]} numberOfLines={5}>
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

function RoundBtn({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
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
      <Text style={{ color, fontSize: 18, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

const CARD_HEIGHT = 520;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  undoBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  title: { fontSize: 24, fontWeight: "800" },
  counter: { fontSize: 12, fontWeight: "600" },

  stackArea: {
    height: CARD_HEIGHT,
    marginHorizontal: 16,
    position: "relative",
  },

  candidatoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  info: { padding: 14, gap: 6 },
  nombre: { fontSize: 20, fontWeight: "800" },
  partido: { fontSize: 13, fontWeight: "600" },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  matchLabel: { fontSize: 12, fontWeight: "600" },
  matchValor: { fontSize: 16, fontWeight: "800" },
  propuesta: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  hint: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 6,
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    padding: 16,
    marginTop: 12,
  },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyBody: { fontSize: 14, textAlign: "center" },
});
