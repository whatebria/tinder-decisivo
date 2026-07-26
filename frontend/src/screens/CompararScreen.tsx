/**
 * CompararScreen: comparador side-by-side de 2 candidatos.
 *
 * - Header con 2 slots. Cada slot es un boton que abre el CandidatoPickerModal.
 * - Cuando ambos estan elegidos: muestra resumen (% coincidencia + contadores)
 *   y tabla agrupada por eje tematico.
 * - Cada fila: enunciado (columna izquierda) + respuesta A (medio) + respuesta B (derecha).
 * - Cada respuesta viene coloreada segun nivel de coincidencia (verde/amarillo/rojo/gris).
 */

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCandidatos, usePosturasCandidato } from "../api/hooks";
import type { Candidato } from "../api/endpoints";
import { Link } from "../components";
import { CandidatoPickerModal } from "../components/molecules/CandidatoPickerModal";
import type { RootStackScreenProps } from "../navigation/types";
import {
  calcularResumen,
  compararPosturas,
  type ItemComparacion,
  type NivelCoincidencia,
} from "../services/comparar";
import { useCuestionarioStore } from "../store/cuestionario";
import { useThemeColors } from "../theme/useTheme";

type Slot = "A" | "B";

function nombreCompleto(c: Candidato | null): string {
  if (!c) return "";
  return `${c.nombre} ${c.apellido ?? ""}`.trim();
}

function colorNivel(nivel: NivelCoincidencia, c: ReturnType<typeof useThemeColors>): string {
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
      return "="; // identicos
    case "cercana":
      return "~"; // similares
    case "opuesta":
      return "X"; // opuestos
    case "solo_uno":
      return "-";
    default:
      return "?";
  }
}

export function CompararScreen({ navigation }: RootStackScreenProps<"Comparar">) {
  const c = useThemeColors();
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);

  const [candidatoA, setCandidatoA] = useState<Candidato | null>(null);
  const [candidatoB, setCandidatoB] = useState<Candidato | null>(null);
  const [pickerOpen, setPickerOpen] = useState<Slot | null>(null);

  const candidatosQ = useCandidatos();
  const candidatos = candidatosQ.data ?? [];

  const posturasAQ = usePosturasCandidato(candidatoA?.id, tipoEleccionId);
  const posturasBQ = usePosturasCandidato(candidatoB?.id, tipoEleccionId);

  const grupos = useMemo(() => {
    if (!candidatoA || !candidatoB) return [];
    return compararPosturas(posturasAQ.data ?? [], posturasBQ.data ?? []);
  }, [candidatoA, candidatoB, posturasAQ.data, posturasBQ.data]);

  const resumen = useMemo(() => calcularResumen(grupos), [grupos]);

  const loading = posturasAQ.isLoading || posturasBQ.isLoading;
  const ambosSeleccionados = candidatoA && candidatoB;

  function handleSelectPicker(cand: Candidato) {
    if (pickerOpen === "A") setCandidatoA(cand);
    else if (pickerOpen === "B") setCandidatoB(cand);
    setPickerOpen(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48, paddingBottom: 60, gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.title, { color: c.text }]}>Comparar candidatos</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Elige 2 candidatos y mira lado a lado que dicen sobre cada tema.
          </Text>
        </View>

        {/* Slots de seleccion */}
        <View style={styles.slotsRow}>
          <SlotButton
            label="Candidato A"
            candidato={candidatoA}
            onPress={() => setPickerOpen("A")}
            colors={c}
          />
          <View style={styles.vsWrap}>
            <Text style={[styles.vs, { color: c.primary }]}>VS</Text>
          </View>
          <SlotButton
            label="Candidato B"
            candidato={candidatoB}
            onPress={() => setPickerOpen("B")}
            colors={c}
          />
        </View>

        {/* Resumen (solo si ambos elegidos y hay data) */}
        {ambosSeleccionados && !loading && grupos.length > 0 ? (
          <View style={[styles.resumenCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.resumenTitulo, { color: c.text }]}>
              Coincidencia: {resumen.porcentajeCoincidencia}%
            </Text>
            <View style={styles.resumenChips}>
              <StatChip icon="=" label={`${resumen.identicas} identicas`} color={c.success} />
              <StatChip icon="~" label={`${resumen.cercanas} cercanas`} color={c.warning ?? "#B45309"} />
              <StatChip icon="X" label={`${resumen.opuestas} opuestas`} color={c.danger} />
              {resumen.soloUno > 0 ? (
                <StatChip icon="-" label={`${resumen.soloUno} solo uno`} color={c.textSecondary} />
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Estados */}
        {!ambosSeleccionados ? (
          <Text style={[styles.empty, { color: c.textSecondary }]}>
            Elige ambos candidatos para ver la comparacion.
          </Text>
        ) : loading ? (
          <Text style={{ color: c.textSecondary }}>Cargando posturas...</Text>
        ) : grupos.length === 0 ? (
          <Text style={[styles.empty, { color: c.textSecondary }]}>
            Ninguno de los dos tiene posturas cargadas para este tipo de eleccion.
          </Text>
        ) : (
          grupos.map((g) => (
            <View key={g.eje} style={{ gap: 6 }}>
              <Text style={[styles.ejeTitulo, { color: c.text }]}>{g.ejeDisplay}</Text>
              {g.items.map((it) => (
                <FilaComparacion
                  key={it.preguntaId}
                  item={it}
                  colors={c}
                />
              ))}
            </View>
          ))
        )}

        <View style={{ height: 8 }} />
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </ScrollView>

      <CandidatoPickerModal
        visible={pickerOpen !== null}
        title={pickerOpen === "A" ? "Elegir Candidato A" : "Elegir Candidato B"}
        candidatos={candidatos}
        excluirId={pickerOpen === "A" ? candidatoB?.id : candidatoA?.id}
        onSelect={handleSelectPicker}
        onClose={() => setPickerOpen(null)}
      />
    </View>
  );
}

// ---------- Sub-componentes ----------

interface SlotButtonProps {
  label: string;
  candidato: Candidato | null;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}

function SlotButton({ label, candidato, onPress, colors: c }: SlotButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        {
          backgroundColor: pressed ? c.bg : c.card,
          borderColor: candidato ? c.primary : c.border,
        },
      ]}
    >
      <Text style={[styles.slotLabel, { color: c.textSecondary }]}>{label}</Text>
      {candidato ? (
        <>
          <Text style={[styles.slotNombre, { color: c.text }]} numberOfLines={1}>
            {nombreCompleto(candidato)}
          </Text>
          {candidato.partido ? (
            <Text style={[styles.slotMeta, { color: c.textSecondary }]} numberOfLines={1}>
              {candidato.partido}
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={[styles.slotEmpty, { color: c.primary }]}>Elegir...</Text>
      )}
    </Pressable>
  );
}

function StatChip({ icon, label, color }: { icon: string; label: string; color: string }) {
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
    <View style={[styles.fila, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.filaHeader}>
        <Text style={[styles.filaNivel, { color }]}>{iconoNivel(item.nivel)}</Text>
        <Text style={[styles.filaPregunta, { color: c.text }]} numberOfLines={3}>
          {item.preguntaTexto}
        </Text>
      </View>
      <View style={styles.filaBody}>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textSecondary }]}>A</Text>
          <Text style={[styles.colValor, { color: item.posturaA ? color : c.textSecondary }]}>
            {item.posturaA?.opcion_respuesta_texto ?? "Sin postura"}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: c.textSecondary }]}>B</Text>
          <Text style={[styles.colValor, { color: item.posturaB ? color : c.textSecondary }]}>
            {item.posturaB?.opcion_respuesta_texto ?? "Sin postura"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13 },

  slotsRow: { flexDirection: "row", gap: 8, alignItems: "stretch" },
  slot: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    gap: 2,
    minHeight: 84,
  },
  slotLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  slotNombre: { fontSize: 15, fontWeight: "700" },
  slotMeta: { fontSize: 11 },
  slotEmpty: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  vsWrap: { justifyContent: "center", paddingHorizontal: 4 },
  vs: { fontSize: 16, fontWeight: "800" },

  resumenCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  resumenTitulo: { fontSize: 18, fontWeight: "800" },
  resumenChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  statChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  empty: { padding: 24, textAlign: "center", fontStyle: "italic" },

  ejeTitulo: { fontSize: 15, fontWeight: "700", textTransform: "capitalize", marginTop: 4 },

  fila: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 8 },
  filaHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  filaNivel: { fontSize: 16, fontWeight: "900", width: 20, textAlign: "center" },
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
