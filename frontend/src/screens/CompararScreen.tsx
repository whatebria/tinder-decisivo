/**
 * CompararScreen: comparador side-by-side de 2 candidatos.
 *
 * Basado en design-system-lowfi.html Template #15 Comparador.
 *
 * Layout:
 *   - ScreenTopBar (back + titulo + subtitulo con eleccion)
 *   - Header sticky con avatares fijos (col A, col B) + match%
 *   - Toggle "Solo mostrar diferencias"
 *   - Resumen (% coincidencia + Badges de counts) cuando ambos elegidos
 *   - Filas por eje > preguntas (granularidad mantenida por decision de diseno)
 *
 * Composicion via design system:
 *   - AppShell / ScreenTopBar / Avatar / Toggle / Badge (atom + molecule + organism)
 *   - CandidatoPickerModal (molecule)
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
  CoachMark,
  ScreenTopBar,
  Toggle,
} from "../components";
import { CandidatoPickerModal } from "../components/molecules/CandidatoPickerModal";
import { useCoachMarkTour } from "../hooks/useCoachMarkTour";
import type { RootStackScreenProps } from "../navigation/types";
import {
  calcularResumen,
  compararPosturas,
  type ItemComparacion,
  type NivelCoincidencia,
} from "../services/comparar";
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
  const comparadorTour = useCoachMarkTour("comparador");

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
            <Text style={[styles.paragraph, { color: c.textSecondary }]}>
              Cargando posturas...
            </Text>
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

      <CoachMark
        visible={comparadorTour.visible}
        step={comparadorTour.step}
        currentIndex={comparadorTour.currentIndex}
        total={comparadorTour.total}
        onNext={comparadorTour.next}
        onBack={comparadorTour.back}
        onSkip={comparadorTour.skip}
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

// Se conserva la funcion aunque no se use directamente en el JSX: mapea
// nivel -> variante de Badge y sirve como single source of truth por si
// aparece otro consumidor (p.ej. lista alternativa) sin duplicar el switch.
void badgeVariantNivel;

// ---------- Styles ----------
//
// Reglas: TODOS los valores dimensionales vienen de tokens del DS.
// Excepciones documentadas donde aplica.

const RIGHT_GUTTER = spacing.sp7; // 32, compensa el back button del ScreenTopBar

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp3,
  },

  stickyHead: { gap: spacing.sp2, paddingBottom: spacing.sp2 },

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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp1,
    paddingVertical: spacing.sp2,
  },
  toggleLabel: {
    ...typography.overline,
    fontWeight: "500",
    textTransform: "none",
    letterSpacing: 0,
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
