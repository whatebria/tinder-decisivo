/**
 * CompararScreen: comparador side-by-side de 2 candidatos.
 *
 * Basado en design-system-lowfi.html Template #15 Comparador.
 *
 * Layout:
 *   - HomeTopBar (tab principal — no hay back button)
 *   - Header sticky con avatares fijos (col A, col B) + match%
 *   - Chips de filtro: Todas / Identicas / Cercanas / Opuestas
 *   - Resumen (% coincidencia + Badges de counts) cuando ambos elegidos
 *   - Filas por eje > preguntas (granularidad mantenida por decision de diseno)
 *
 * Composicion via design system:
 *   - AppShell / HomeTopBar / Avatar / Badge (atom + molecule + organism)
 *   - CandidatoPickerModal con filtro por tipoEleccion (molecule)
 *   - Todos los styles usan tokens spacing/radii/typography
 *
 * Alcance actual: 2 candidatos (YAGNI). El wireframe habla de "hasta 3"; se
 * extendera cuando aparezca la necesidad.
 *
 * Sobre FilaComparacion: se evaluo reusar el molecule `PosturaItem` pero
 * (a) sus labels "Tu voto" vs "Candidato" no calzan (aqui es A vs B),
 * (b) su enum de match (match/partial/no-match) no cubre "solo_uno".
 * Se mantiene inline con tokens.
 */

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useCandidatos,
  useMatchesQuery,
  usePosturasCandidato,
  useTiposEleccion,
} from "../api/hooks";
import type { Candidato, MatchResult } from "../api/endpoints";
import {
  AppShell,
  Avatar,
  Badge,
  type BadgeVariant,
  CoachMarkTour,
  HomeTopBar,
  Spinner,
} from "../components";
import { CandidatoPickerModal } from "../components/molecules/CandidatoPickerModal";
import type { RootStackScreenProps } from "../navigation/types";
import {
  calcularResumen,
  compararPosturas,
  type ItemComparacion,
  type NivelCoincidencia,
} from "../services/comparar";
import { getMatchColor } from "../services/matching";
import { useCuestionarioStore } from "../store/cuestionario";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { iniciales, nombreCompleto } from "../utils/candidato";

type Slot = "A" | "B";

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

function badgeVariantNivel(nivel: NivelCoincidencia): BadgeVariant {
  switch (nivel) {
    case "identica":
      return "success";
    case "cercana":
      return "warning";
    case "opuesta":
      return "danger";
    default:
      return "neutral";
  }
}

/**
 * Filtro de nivel de coincidencia para el comparador.
 * Deriva de NivelCoincidencia excluyendo los valores que no tienen sentido
 * como filtro standalone (solo_uno y ninguno quedan cubiertos por "todas").
 */
type NivelFiltro = "todas" | Exclude<NivelCoincidencia, "solo_uno" | "ninguno">;

// Constante de filtros con label accesible -- evita el inline en JSX y
// da a VoiceOver un string limpio en lugar de "equis Opuestas" (UX-031).
const FILTROS_NIVEL: Array<{ value: NivelFiltro; label: string; labelA11y: string }> = [
  { value: "todas",    label: "Todas",        labelA11y: "todas las posturas" },
  { value: "identica", label: "= Idénticas",  labelA11y: "posturas idénticas" },
  { value: "cercana",  label: "\u007e Cercanas",   labelA11y: "posturas cercanas" },
  { value: "opuesta",  label: "X Opuestas",   labelA11y: "posturas opuestas" },
];

export function CompararScreen({
  navigation,
}: RootStackScreenProps<"Comparar">) {
  const c = useThemeColors();
  const tipoEleccionId = useCuestionarioStore((s) => s.tipoEleccionId);
  const [candidatoA, setCandidatoA] = useState<Candidato | null>(null);
  const [candidatoB, setCandidatoB] = useState<Candidato | null>(null);
  const [pickerOpen, setPickerOpen] = useState<Slot | null>(null);
  const [nivelFiltro, setNivelFiltro] = useState<NivelFiltro>("todas");

  const candidatosQ = useCandidatos();
  const candidatos = candidatosQ.data ?? [];
  const tiposQ = useTiposEleccion();
  const matchesQ = useMatchesQuery(tipoEleccionId);

  const posturasAQ = usePosturasCandidato(candidatoA?.id, tipoEleccionId);
  const posturasBQ = usePosturasCandidato(candidatoB?.id, tipoEleccionId);

  const gruposCompletos = useMemo(() => {
    if (!candidatoA || !candidatoB) return [];
    return compararPosturas(posturasAQ.data ?? [], posturasBQ.data ?? []);
  }, [candidatoA, candidatoB, posturasAQ.data, posturasBQ.data]);

  const grupos = useMemo(() => {
    if (nivelFiltro === "todas") return gruposCompletos;
    return gruposCompletos
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => it.nivel === nivelFiltro),
      }))
      .filter((g) => g.items.length > 0);
  }, [gruposCompletos, nivelFiltro]);

  const resumen = useMemo(
    () => calcularResumen(gruposCompletos),
    [gruposCompletos],
  );

  // Map id->pct O(1) -- reemplaza Array.find O(n) x2 por render (TASK-024)
  const matchByCandidatoId = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of matchesQ.data ?? []) {
      const id = m.candidato_data?.id;
      const n = parseFloat(m.match_percentage);
      if (id != null && Number.isFinite(n)) map.set(id, Math.round(n));
    }
    return map;
  }, [matchesQ.data]);

  const loading = posturasAQ.isLoading || posturasBQ.isLoading;
  const ambosSeleccionados = !!candidatoA && !!candidatoB;

  const matchPctA = candidatoA ? (matchByCandidatoId.get(candidatoA.id) ?? null) : null;
  const matchPctB = candidatoB ? (matchByCandidatoId.get(candidatoB.id) ?? null) : null;

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
          <HomeTopBar brand="Comparar" style={styles.topBar} />

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
            {FILTROS_NIVEL.map((opt) => {
              const active = nivelFiltro === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setNivelFiltro(active && opt.value !== "todas" ? "todas" : opt.value)
                  }
                  disabled={!ambosSeleccionados}
                  style={[
                    styles.filterChip,
                    { borderColor: c.border, backgroundColor: c.bg },
                    active && { borderColor: c.primary, backgroundColor: c.primary },
                    !ambosSeleccionados && { opacity: 0.4 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${opt.labelA11y}`}
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: c.textSecondary },
                      active && { color: c.textOnPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
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
                <Badge variant="success">{`= ${resumen.identicas} identicas`}</Badge>
                <Badge variant="warning">{`~ ${resumen.cercanas} cercanas`}</Badge>
                <Badge variant="danger">{`X ${resumen.opuestas} opuestas`}</Badge>
                {resumen.soloUno > 0 ? (
                  <Badge variant="neutral">{`- ${resumen.soloUno} solo uno`}</Badge>
                ) : null}
              </View>
            </View>
          ) : null}

          {!ambosSeleccionados ? (
            <Text style={[styles.empty, { color: c.textSecondary }]}>
              Elige ambos candidatos para ver la comparacion.
            </Text>
          ) : loading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
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
          pickerOpen === "A" ? "Elegir candidato A" : "Elegir candidato B"
        }
        candidatos={candidatos}
        tiposEleccion={tiposQ.data ?? []}
        excluirId={pickerOpen === "A" ? candidatoB?.id : candidatoA?.id}
        onSelect={handleSelectPicker}
        onClose={() => setPickerOpen(null)}
      />

      <CoachMarkTour tourId="comparador" />
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
  // DS-11: el % de afinidad usa el color del tier, no c.primary (UX-028)
  const matchColor = matchPct != null ? getMatchColor(matchPct) : c.textSecondary;
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
      <Text style={[styles.candMatch, { color: matchColor }]}>
        {matchPct != null ? `${matchPct}%` : "—"}
      </Text>
    </Pressable>
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
        <Text
          style={[styles.filaNivel, { color }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
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
          {/* DS-11: texto de postura siempre en c.text -- el color del nivel
              queda solo en el icono, no sangra al contenido politico (UX-029) */}
          <Text
            style={[
              styles.colValor,
              { color: item.posturaA ? c.text : c.textSecondary },
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
              { color: item.posturaB ? c.text : c.textSecondary },
            ]}
          >
            {item.posturaB?.opcion_respuesta_texto ?? "Sin postura"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Se conserva la funcion aunque no se use directamente en el JSX: mapea
// nivel -> variante de Badge y sirve como single source of truth por si
// aparece otro consumidor (p.ej. lista alternativa) sin duplicar el switch.
void badgeVariantNivel;

// ---------- Styles ----------
//
// Reglas: TODOS los valores dimensionales vienen de tokens del DS.
// Excepciones documentadas donde aplica.

// Las columnas de candidatos se distribuyen simétricamente — sin gutter
// de compensacion ya que Comparar es un tab primario sin back button.
const RIGHT_GUTTER = 0;

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp3,
  },

  stickyHead: { gap: spacing.sp2, paddingBottom: spacing.sp2 },
  topBar: { marginHorizontal: spacing.sp4, marginTop: spacing.sp3 },

  candHeader: {
    flexDirection: "row",
    gap: spacing.sp2,
    padding: spacing.sp3,
    borderRadius: radii.rLg,
    alignItems: "flex-start",
  },
  leftGutter: { width: 0 },
  rightGutter: { width: RIGHT_GUTTER },
  candSlot: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sp1,
    paddingVertical: spacing.sp1,
  },
  candNombre: {
    ...typography.overline,
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: 0,
    textAlign: "center",
  },
  candMatch: {
    ...typography.body,
    fontWeight: "800",
  },

  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp2,
    paddingHorizontal: spacing.sp1,
    paddingVertical: spacing.sp2,
  },
  filterChip: {
    paddingVertical: spacing.sp1,
    paddingHorizontal: spacing.sp3,
    borderRadius: radii.rFull,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  body: { gap: spacing.sp4 },

  resumenCard: {
    borderRadius: radii.rLg,
    borderWidth: 1,
    padding: spacing.sp4,
    gap: spacing.sp2,
  },
  resumenTitulo: {
    ...typography.lead,
    fontWeight: "800",
  },
  resumenChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp2,
  },

  empty: {
    padding: spacing.sp6,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingBox: {
    alignItems: "center" as const,
    padding: spacing.sp6,
  },
  paragraph: typography.small,

  ejeBlock: { gap: spacing.sp2 },
  ejeTitulo: {
    ...typography.small,
    fontWeight: "700",
    textTransform: "capitalize",
    marginTop: spacing.sp1,
  },

  fila: {
    borderWidth: 1,
    borderRadius: radii.rMd,
    padding: spacing.sp3,
    gap: spacing.sp2,
  },
  filaHeader: {
    flexDirection: "row",
    gap: spacing.sp2,
    alignItems: "flex-start",
  },
  filaNivel: {
    ...typography.body,
    fontWeight: "900",
    width: spacing.sp5,
    textAlign: "center",
  },
  filaPregunta: {
    flex: 1,
    ...typography.small,
    fontWeight: "600",
  },
  filaBody: { flexDirection: "row", gap: spacing.sp2 },
  col: { flex: 1, gap: spacing.sp1 },
  colLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  colValor: {
    ...typography.small,
    fontWeight: "600",
  },
});
