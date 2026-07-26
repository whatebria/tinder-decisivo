/**
 * CompararScreen: comparador side-by-side de 2 candidatos.
 *
 * Basado en design-system-lowfi.html · Template 15 · Comparador.
 *
 * Layout:
 *   - ScreenTopBar (back + titulo "Comparar candidatos" + subtitulo con eleccion)
 *   - Header sticky-ish con avatares fijos (col A, col B) + match%
 *   - Toggle "Solo mostrar diferencias"
 *   - Resumen (% coincidencia + chips de counts) cuando ambos elegidos
 *   - Filas por eje > preguntas (granularidad mantenida por decision de diseno)
 *
 * Alcance actual: 2 candidatos (YAGNI). El wireframe habla de "hasta 3"; se
 * extendera cuando aparezca la necesidad.
 */

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useCandidatos,
  useMatchesQuery,
  usePosturasCandidato,
} from "../api/hooks";
import type { Candidato, MatchResult } from "../api/endpoints";
import {
  AppShell,
  Avatar,
  ScreenTopBar,
  Toggle,
} from "../components";
import { CandidatoPickerModal } from "../components/molecules/CandidatoPickerModal";
import type { RootStackScreenProps } from "../navigation/types";
import {
  calcularResumen,
  compararPosturas,
  type ItemComparacion,
  type NivelCoincidencia,
} from "../services/comparar";
import { useCuestionarioStore } from "../store/cuestionario";
import { useTiposEleccion } from "../api/hooks";
import { useThemeColors } from "../theme/useTheme";

type Slot = "A" | "B";

function nombreCompleto(c: Candidato | null): string {
  if (!c) return "";
  return `${c.nombre} ${c.apellido ?? ""}`.trim();
}

function iniciales(c: Candidato | null): string {
  if (!c) return "?";
  const n = c.nombre?.[0] ?? "";
  const a = c.apellido?.[0] ?? "";
  return (n + a).toUpperCase() || "?";
}

function colorNivel(
  nivel: NivelCoincidencia,
  c: ReturnType<typeof useThemeColors>,
): string {
  switch (nivel) {
    case "identica":
      return c.success;
    case "cercana":
      return c.warning ?? "#B45309";
    case "opuesta":
      return c.danger;
    default:
      return c.textSecondary;
  }
}

function iconoNivel(nivel: NivelCoincidencia): string {
  switch (nivel) {
    case "identica":
      return "=";
    case "cercana":
      return "~";
    case "opuesta":
      return "X";
    case "solo_uno":
      return "-";
    default:
      return "?";
  }
}

function matchPctPara(
  candidatoId: number | undefined,
  matches: MatchResult[] | undefined,
): number | null {
  if (!candidatoId || !matches) return null;
  const m = matches.find((r) => r.candidato_data?.id === candidatoId);
  if (!m) return null;
  const n = Number.parseFloat(m.match_percentage);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function CompararScreen({
  navigation,
}: RootStackScreenProps<"Comparar">) {
  const c = useThemeColors();
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);

  const [candidatoA, setCandidatoA] = useState<Candidato | null>(null);
  const [candidatoB, setCandidatoB] = useState<Candidato | null>(null);
  const [pickerOpen, setPickerOpen] = useState<Slot | null>(null);
  const [soloDiferencias, setSoloDiferencias] = useState(false);

  const candidatosQ = useCandidatos();
  const candidatos = candidatosQ.data ?? [];
  const tiposQ = useTiposEleccion();
  const matchesQ = useMatchesQuery(tipoEleccionId);

  const posturasAQ = usePosturasCandidato(candidatoA?.id, tipoEleccionId);
  const posturasBQ = usePosturasCandidato(candidatoB?.id, tipoEleccionId);

  const eleccionNombre = useMemo(() => {
    if (!tipoEleccionId) return "Sin eleccion";
    return (
      (tiposQ.data ?? []).find((t) => t.id === tipoEleccionId)?.nombre ??
      "Eleccion"
    );
  }, [tiposQ.data, tipoEleccionId]);

  const gruposCompletos = useMemo(() => {
    if (!candidatoA || !candidatoB) return [];
    return compararPosturas(posturasAQ.data ?? [], posturasBQ.data ?? []);
  }, [candidatoA, candidatoB, posturasAQ.data, posturasBQ.data]);

  const grupos = useMemo(() => {
    if (!soloDiferencias) return gruposCompletos;
    return gruposCompletos
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => it.nivel !== "identica"),
      }))
      .filter((g) => g.items.length > 0);
  }, [gruposCompletos, soloDiferencias]);

  const resumen = useMemo(
    () => calcularResumen(gruposCompletos),
    [gruposCompletos],
  );

  const loading = posturasAQ.isLoading || posturasBQ.isLoading;
  const ambosSeleccionados = !!candidatoA && !!candidatoB;

  const matchPctA = matchPctPara(candidatoA?.id, matchesQ.data);
  const matchPctB = matchPctPara(candidatoB?.id, matchesQ.data);

  function handleSelectPicker(cand: Candidato) {
    if (pickerOpen === "A") setCandidatoA(cand);
    else if (pickerOpen === "B") setCandidatoB(cand);
    setPickerOpen(null);
  }

  return (
    <AppShell active="comparar" navigation={navigation}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.stickyHead, { backgroundColor: c.bg }]}>
          <ScreenTopBar
            title="Comparar candidatos"
            subtitle={eleccionNombre}
            onBack={() => navigation.goBack()}
          />

          <View style={[styles.candHeader, { backgroundColor: c.card }]}>
            <View style={styles.leftGutter} />
            <CandidatoHeaderSlot
              slot="A"
              candidato={candidatoA}
              matchPct={matchPctA}
              onPress={() => setPickerOpen("A")}
            />
            <CandidatoHeaderSlot
              slot="B"
              candidato={candidatoB}
              matchPct={matchPctB}
              onPress={() => setPickerOpen("B")}
            />
            <View style={styles.rightGutter} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: c.text }]}>
              Solo mostrar diferencias
            </Text>
            <Toggle
              value={soloDiferencias}
              onPress={() => setSoloDiferencias((v) => !v)}
              accessibilityLabel="Filtrar solo diferencias"
              disabled={!ambosSeleccionados}
            />
          </View>
        </View>

        <View style={styles.body}>
          {ambosSeleccionados && !loading && gruposCompletos.length > 0 ? (
            <View
              style={[
                styles.resumenCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={[styles.resumenTitulo, { color: c.text }]}>
                Coincidencia: {resumen.porcentajeCoincidencia}%
              </Text>
              <View style={styles.resumenChips}>
                <StatChip
                  icon="="
                  label={`${resumen.identicas} identicas`}
                  color={c.success}
                />
                <StatChip
                  icon="~"
                  label={`${resumen.cercanas} cercanas`}
                  color={c.warning ?? "#B45309"}
                />
                <StatChip
                  icon="X"
                  label={`${resumen.opuestas} opuestas`}
                  color={c.danger}
                />
                {resumen.soloUno > 0 ? (
                  <StatChip
                    icon="-"
                    label={`${resumen.soloUno} solo uno`}
                    color={c.textSecondary}
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {!ambosSeleccionados ? (
            <Text style={[styles.empty, { color: c.textSecondary }]}>
              Elige ambos candidatos para ver la comparacion.
            </Text>
          ) : loading ? (
            <Text style={{ color: c.textSecondary }}>Cargando posturas...</Text>
          ) : gruposCompletos.length === 0 ? (
            <Text style={[styles.empty, { color: c.textSecondary }]}>
              Ninguno de los dos tiene posturas cargadas para este tipo de
              eleccion.
            </Text>
          ) : grupos.length === 0 ? (
            <Text style={[styles.empty, { color: c.textSecondary }]}>
              No hay diferencias. Coinciden en todas las preguntas comparables.
            </Text>
          ) : (
            grupos.map((g) => (
              <View key={g.eje} style={styles.ejeBlock}>
                <Text style={[styles.ejeTitulo, { color: c.text }]}>
                  {g.ejeDisplay}
                </Text>
                {g.items.map((it) => (
                  <FilaComparacion key={it.preguntaId} item={it} colors={c} />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <CandidatoPickerModal
        visible={pickerOpen !== null}
        title={
          pickerOpen === "A" ? "Elegir Candidato A" : "Elegir Candidato B"
        }
        candidatos={candidatos}
        excluirId={pickerOpen === "A" ? candidatoB?.id : candidatoA?.id}
        onSelect={handleSelectPicker}
        onClose={() => setPickerOpen(null)}
      />
    </AppShell>
  );
}

// ---------- Sub-componentes ----------

interface CandidatoHeaderSlotProps {
  slot: Slot;
  candidato: Candidato | null;
  matchPct: number | null;
  onPress: () => void;
}

function CandidatoHeaderSlot({
  slot,
  candidato,
  matchPct,
  onPress,
}: CandidatoHeaderSlotProps) {
  const c = useThemeColors();
  const filled = !!candidato;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        filled
          ? `Cambiar candidato ${slot}: ${nombreCompleto(candidato)}`
          : `Elegir candidato ${slot}`
      }
      style={({ pressed }) => [
        styles.candSlot,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Avatar
        size="md"
        initials={iniciales(candidato)}
        backgroundColor={filled ? c.primary : c.border}
      />
      <Text
        style={[styles.candNombre, { color: filled ? c.text : c.textSecondary }]}
        numberOfLines={1}
      >
        {filled ? nombreCompleto(candidato) : `Elegir ${slot}`}
      </Text>
      {filled && matchPct != null ? (
        <Text style={[styles.candMatch, { color: c.primary }]}>
          {matchPct}%
        </Text>
      ) : (
        <Text style={[styles.candMatch, { color: c.textSecondary }]}>—</Text>
      )}
    </Pressable>
  );
}

function StatChip({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.statChip, { borderColor: color }]}>
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>
        {icon} {label}
      </Text>
    </View>
  );
}

function FilaComparacion({
  item,
  colors: c,
}: {
  item: ItemComparacion;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const color = colorNivel(item.nivel, c);
  return (
    <View
      style={[
        styles.fila,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={styles.filaHeader}>
        <Text style={[styles.filaNivel, { color }]}>
          {iconoNivel(item.nivel)}
        </Text>
        <Text
          style={[styles.filaPregunta, { color: c.text }]}
          numberOfLines={3}
        >
          {item.preguntaTexto}
        </Text>
      </View>
      <View style={styles.filaBody}>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textSecondary }]}>A</Text>
          <Text
            style={[
              styles.colValor,
              { color: item.posturaA ? color : c.textSecondary },
            ]}
          >
            {item.posturaA?.opcion_respuesta_texto ?? "Sin postura"}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textSecondary }]}>B</Text>
          <Text
            style={[
              styles.colValor,
              { color: item.posturaB ? color : c.textSecondary },
            ]}
          >
            {item.posturaB?.opcion_respuesta_texto ?? "Sin postura"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------- Styles ----------

const LEFT_GUTTER = 0; // el ScreenTopBar ya tiene su back button
const RIGHT_GUTTER = 32;

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },

  stickyHead: { gap: 8, paddingBottom: 8 },

  candHeader: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  leftGutter: { width: LEFT_GUTTER },
  rightGutter: { width: RIGHT_GUTTER },
  candSlot: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  candNombre: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  candMatch: {
    fontSize: 16,
    fontWeight: "800",
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  toggleLabel: { fontSize: 12 },

  body: { gap: 16 },

  resumenCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  resumenTitulo: { fontSize: 18, fontWeight: "800" },
  resumenChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  statChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  empty: { padding: 24, textAlign: "center", fontStyle: "italic" },

  ejeBlock: { gap: 6 },
  ejeTitulo: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
    marginTop: 4,
  },

  fila: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 8 },
  filaHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  filaNivel: {
    fontSize: 16,
    fontWeight: "900",
    width: 20,
    textAlign: "center",
  },
  filaPregunta: { flex: 1, fontSize: 13, fontWeight: "600" },
  filaBody: { flexDirection: "row", gap: 8 },
  col: { flex: 1, gap: 2 },
  colLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colValor: { fontSize: 13, fontWeight: "600" },
});
