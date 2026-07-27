/**
 * CandidatosScreen: lista de todos los candidatos con filtros.
 *
 * Vista exploratoria — el user puede navegar por candidatos sin haber hecho
 * el cuestionario. Si lo hizo (tipoEleccionId en cuestionarioStore),
 * enriquecemos las cards con % de match.
 *
 * Layout basado en NoticiasScreen para consistencia:
 *   - Header con titulo + contador
 *   - Filter bar compacto en 1 row horizontal:
 *       [Button Filtros (N)] [ChipActivo x] ... [Limpiar]
 *   - Lista de CandidateCards
 *   - BottomSheet de filtros expandidos (Search, Partido, Tipo eleccion, Region)
 *
 * Filtros:
 *   - Search: matchea nombre, apellido, partido (case-insensitive, sin acentos).
 *   - Partido: multi-select. Chips en el sheet.
 *   - Tipo eleccion: single-select. Chips en el sheet.
 *   - Region: single-select. Chips en el sheet (extraida de comuna_region_nombre).
 *
 * Sin cuestionario:
 *   - Cards sin match %, y un banner arriba invitando a hacer el cuestionario.
 */

import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCandidatos,
  useMatchesQuery,
  useTiposEleccion,
} from "../api/hooks";
import type { Candidato, MatchResult, TipoEleccion } from "../api/endpoints";
import {
  AppShell,
  BottomSheet,
  Button,
  CandidateCard,
  Chip,
  ChipActivo,
  CollapsibleFilterSection,
  EmptyState,
  HomeTopBar,
  Icon,
  Input,
  Spinner,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useCuestionarioStore } from "../store/cuestionario";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import {
  iniciales,
  nombreCompleto,
  sublabelCandidato,
} from "../utils/candidato";

// -- Helpers ----------------------------------------------------------------

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// -- Screen -----------------------------------------------------------------

export function CandidatosScreen({
  navigation,
}: RootStackScreenProps<"Candidatos">) {
  const c = useThemeColors();

  const [query, setQuery] = useState("");
  const [partidosSel, setPartidosSel] = useState<ReadonlySet<string>>(new Set());
  const [tipoEleccionSel, setTipoEleccionSel] = useState<number | null>(null);
  const [regionSel, setRegionSel] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data
  const candidatosQ = useCandidatos();
  const tiposEleccionQ = useTiposEleccion();

  // Match: solo si el user tiene cuestionario asociado a un tipoEleccion.
  const tipoEleccionCuestionario = useCuestionarioStore(
    (s) => s.tipoEleccionId,
  );
  const matchesQ = useMatchesQuery(tipoEleccionCuestionario);

  const candidatos = candidatosQ.data ?? [];
  const tiposEleccion = tiposEleccionQ.data ?? [];
  const matches = matchesQ.data ?? [];

  const tieneMatch = tipoEleccionCuestionario != null && matches.length > 0;

  // -- Derivados: opciones de filtros -----------------------------------

  const partidosDisponibles = useMemo(() => {
    const set = new Set<string>();
    for (const cand of candidatos) if (cand.partido) set.add(cand.partido);
    return Array.from(set).sort();
  }, [candidatos]);

  const regionesDisponibles = useMemo(() => {
    const set = new Set<string>();
    for (const cand of candidatos) {
      if (cand.comuna_region_nombre) set.add(cand.comuna_region_nombre);
    }
    return Array.from(set).sort();
  }, [candidatos]);

  // -- Match map ---------------------------------------------------------

  const matchByCandidato = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of matches as MatchResult[]) {
      const id = m.candidato_data?.id;
      if (id != null) {
        map.set(id, parseFloat(m.match_percentage));
      }
    }
    return map;
  }, [matches]);

  // -- Filtrado ---------------------------------------------------------

  const candidatosFiltrados = useMemo(() => {
    const q = normalizar(query.trim());
    const filtrados = candidatos.filter((cand) => {
      if (q) {
        const haystack = normalizar(
          `${cand.nombre} ${cand.apellido ?? ""} ${cand.partido}`,
        );
        if (!haystack.includes(q)) return false;
      }
      if (partidosSel.size > 0 && !partidosSel.has(cand.partido)) return false;
      if (
        tipoEleccionSel !== null &&
        !(cand.tipos_eleccion ?? []).includes(tipoEleccionSel)
      ) {
        return false;
      }
      if (regionSel !== null && cand.comuna_region_nombre !== regionSel) {
        return false;
      }
      return true;
    });

    // Si hay match, ordenar por match desc. Si no, alfabetico.
    if (tieneMatch) {
      return [...filtrados].sort((a, b) => {
        const ma = matchByCandidato.get(a.id) ?? -1;
        const mb = matchByCandidato.get(b.id) ?? -1;
        return mb - ma;
      });
    }
    return [...filtrados].sort((a, b) =>
      nombreCompleto(a).localeCompare(nombreCompleto(b), "es"),
    );
  }, [
    candidatos,
    query,
    partidosSel,
    tipoEleccionSel,
    regionSel,
    tieneMatch,
    matchByCandidato,
  ]);

  // -- Filtros activos / chips -----------------------------------------

  const filtrosActivosCount =
    (query.trim() ? 1 : 0) +
    partidosSel.size +
    (tipoEleccionSel !== null ? 1 : 0) +
    (regionSel !== null ? 1 : 0);

  const hayFiltroActivo = filtrosActivosCount > 0;

  const chipsActivos = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (query.trim()) {
      chips.push({
        id: "q",
        label: `"${query.trim()}"`,
        onRemove: () => setQuery(""),
      });
    }
    for (const partido of partidosSel) {
      chips.push({
        id: `p-${partido}`,
        label: partido,
        onRemove: () =>
          setPartidosSel((prev) => {
            const next = new Set(prev);
            next.delete(partido);
            return next;
          }),
      });
    }
    if (tipoEleccionSel !== null) {
      const tipo = tiposEleccion.find((t) => t.id === tipoEleccionSel);
      chips.push({
        id: `te-${tipoEleccionSel}`,
        label: tipo?.nombre ?? "Tipo eleccion",
        onRemove: () => setTipoEleccionSel(null),
      });
    }
    if (regionSel !== null) {
      chips.push({
        id: `r-${regionSel}`,
        label: regionSel,
        onRemove: () => setRegionSel(null),
      });
    }
    return chips;
  }, [query, partidosSel, tipoEleccionSel, regionSel, tiposEleccion]);

  const limpiarTodo = () => {
    setQuery("");
    setPartidosSel(new Set());
    setTipoEleccionSel(null);
    setRegionSel(null);
  };

  // -- Handlers cards ---------------------------------------------------

  const openDetalle = (cand: Candidato) => {
    const matchPct = matchByCandidato.get(cand.id) ?? null;
    navigation.navigate("DetalleCandidato", {
      candidatoId: cand.id,
      breakdown: null,
      matchPct,
      confianza: null,
    });
  };

  // -- Render -----------------------------------------------------------

  const total = candidatosFiltrados.length;
  const contadorLabel = candidatosQ.isLoading
    ? "Cargando..."
    : `${total} candidato${total === 1 ? "" : "s"}`;

  return (
    <AppShell active="candidatos" navigation={navigation}>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <HomeTopBar brand="Candidatos" style={styles.topBar} />

        <View style={styles.headerRow}>
          <Text style={[styles.h1, { color: c.text }]}>Candidatos</Text>
          <Text style={[styles.contador, { color: c.textSecondary }]}>
            {contadorLabel}
          </Text>
        </View>

        <View style={styles.filterBarWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBarRow}
          >
            <Button
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => setFiltersOpen(true)}
            >
              {filtrosActivosCount > 0
                ? `Filtros (${filtrosActivosCount})`
                : "Filtros"}
            </Button>

            {chipsActivos.map((chip) => (
              <ChipActivo
                key={chip.id}
                label={chip.label}
                onRemove={chip.onRemove}
              />
            ))}

            {hayFiltroActivo ? (
              <View style={styles.limpiarBtn}>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  onPress={limpiarTodo}
                >
                  Limpiar
                </Button>
              </View>
            ) : null}
          </ScrollView>
        </View>

        {/* Banner "Haz el cuestionario" si no hay match */}
        {!tieneMatch ? (
          <Pressable
            onPress={() => navigation.navigate("Cuestionario")}
            style={[
              styles.matchBanner,
              { backgroundColor: c.accent2, borderColor: c.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Haz el cuestionario para ver tu match con cada candidato"
          >
            <Icon name="info" size={16} color={c.primary} />
            <Text style={[styles.matchBannerText, { color: c.text }]}>
              Haz el cuestionario para ver tu match con cada candidato
            </Text>
            <Icon name="chevron-right" size={16} color={c.textSecondary} />
          </Pressable>
        ) : null}

        <ScrollView contentContainerStyle={styles.listWrap}>
          {candidatosQ.isLoading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
          ) : candidatosFiltrados.length === 0 ? (
            <EmptyState
              icon="info"
              title="No hay candidatos que coincidan"
              description={
                hayFiltroActivo
                  ? "Prueba ajustando los filtros o limpiando la busqueda."
                  : "Aun no hay candidatos disponibles."
              }
              actionLabel={hayFiltroActivo ? "Limpiar filtros" : undefined}
              onAction={hayFiltroActivo ? limpiarTodo : undefined}
            />
          ) : (
            candidatosFiltrados.map((cand) => (
              <CandidateCard
                key={cand.id}
                name={nombreCompleto(cand)}
                partido={cand.partido}
                initials={iniciales(cand)}
                matchPercent={matchByCandidato.get(cand.id) ?? null}
                sublabel={sublabelCandidato(cand)}
                onPress={() => openDetalle(cand)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <FiltrosSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        query={query}
        onQueryChange={setQuery}
        partidosSel={partidosSel}
        onPartidoToggle={(p) =>
          setPartidosSel((prev) => {
            const next = new Set(prev);
            if (next.has(p)) next.delete(p);
            else next.add(p);
            return next;
          })
        }
        partidosDisponibles={partidosDisponibles}
        tipoEleccionSel={tipoEleccionSel}
        onTipoEleccionChange={setTipoEleccionSel}
        tiposEleccion={tiposEleccion}
        regionSel={regionSel}
        onRegionChange={setRegionSel}
        regionesDisponibles={regionesDisponibles}
        onLimpiar={limpiarTodo}
        filtrosActivosCount={filtrosActivosCount}
        resultadosCount={total}
      />
    </AppShell>
  );
}

// -- FiltrosSheet --------------------------------------------------------

interface FiltrosSheetProps {
  visible: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  partidosSel: ReadonlySet<string>;
  onPartidoToggle: (p: string) => void;
  partidosDisponibles: string[];
  tipoEleccionSel: number | null;
  onTipoEleccionChange: (id: number | null) => void;
  tiposEleccion: TipoEleccion[];
  regionSel: string | null;
  onRegionChange: (r: string | null) => void;
  regionesDisponibles: string[];
  onLimpiar: () => void;
  filtrosActivosCount: number;
  resultadosCount: number;
}

function FiltrosSheet({
  visible,
  onClose,
  query,
  onQueryChange,
  partidosSel,
  onPartidoToggle,
  partidosDisponibles,
  tipoEleccionSel,
  onTipoEleccionChange,
  tiposEleccion,
  regionSel,
  onRegionChange,
  regionesDisponibles,
  onLimpiar,
  filtrosActivosCount,
  resultadosCount,
}: FiltrosSheetProps) {
  const c = useThemeColors();

  const trailing =
    filtrosActivosCount > 0 ? (
      <View style={[styles.contadorPill, { backgroundColor: c.primary }]}>
        <Text style={[styles.contadorPillText, { color: c.textOnPrimary }]}>
          {filtrosActivosCount} activo{filtrosActivosCount === 1 ? "" : "s"}
        </Text>
      </View>
    ) : null;

  const footer = (
    <>
      <View style={styles.footerBtnLimpiar}>
        <Button variant="ghost" onPress={onLimpiar}>
          Limpiar todo
        </Button>
      </View>
      <View style={styles.footerBtnAplicar}>
        <Button variant="primary" onPress={onClose}>
          {`Aplicar (${resultadosCount})`}
        </Button>
      </View>
    </>
  );

  const partidoSummary =
    partidosSel.size === 0
      ? "Todos"
      : partidosSel.size === 1
        ? Array.from(partidosSel)[0]
        : `${partidosSel.size} partidos`;
  const tipoSummary =
    tipoEleccionSel === null
      ? "Todos"
      : (tiposEleccion.find((t) => t.id === tipoEleccionSel)?.nombre ?? "Todos");
  const regionSummary = regionSel ?? "Todas";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filtros"
      titleTrailing={trailing}
      footer={footer}
    >
      <View style={styles.sheetSearchBlock}>
        <Text style={[styles.sheetSectionLabel, { color: c.textSecondary }]}>
          Buscar
        </Text>
        <Input
          value={query}
          onChangeText={onQueryChange}
          placeholder="Nombre, apellido o partido..."
          accessibilityLabel="Buscar candidatos"
          returnKeyType="search"
        />
      </View>

      <CollapsibleFilterSection
        title="Partido"
        summary={partidoSummary}
        defaultExpanded={partidosSel.size > 0}
      >
        {partidosDisponibles.length === 0 ? (
          <Text style={{ color: c.textSecondary, fontSize: 13 }}>
            Sin partidos disponibles.
          </Text>
        ) : (
          <View style={styles.chipsGrid}>
            {partidosDisponibles.map((p) => (
              <Chip
                key={p}
                active={partidosSel.has(p)}
                onPress={() => onPartidoToggle(p)}
              >
                {p}
              </Chip>
            ))}
          </View>
        )}
      </CollapsibleFilterSection>

      <CollapsibleFilterSection
        title="Tipo de eleccion"
        summary={tipoSummary}
        defaultExpanded={tipoEleccionSel !== null}
      >
        <View style={styles.chipsGrid}>
          <Chip
            active={tipoEleccionSel === null}
            onPress={() => onTipoEleccionChange(null)}
          >
            Todos
          </Chip>
          {tiposEleccion.map((tipo) => (
            <Chip
              key={tipo.id}
              active={tipoEleccionSel === tipo.id}
              onPress={() =>
                onTipoEleccionChange(tipoEleccionSel === tipo.id ? null : tipo.id)
              }
            >
              {tipo.nombre}
            </Chip>
          ))}
        </View>
      </CollapsibleFilterSection>

      <CollapsibleFilterSection
        title="Region"
        summary={regionSummary}
        defaultExpanded={regionSel !== null}
      >
        {regionesDisponibles.length === 0 ? (
          <Text style={{ color: c.textSecondary, fontSize: 13 }}>
            Sin regiones disponibles (todos los candidatos son nacionales).
          </Text>
        ) : (
          <View style={styles.chipsGrid}>
            <Chip active={regionSel === null} onPress={() => onRegionChange(null)}>
              Todas
            </Chip>
            {regionesDisponibles.map((r) => (
              <Chip
                key={r}
                active={regionSel === r}
                onPress={() => onRegionChange(regionSel === r ? null : r)}
              >
                {r}
              </Chip>
            ))}
          </View>
        )}
      </CollapsibleFilterSection>
    </BottomSheet>
  );
}

// -- Styles -------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    marginHorizontal: spacing.sp4,
    marginTop: spacing.sp3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp5,
    marginTop: spacing.sp2,
    marginBottom: spacing.sp2,
    gap: spacing.sp3,
  },
  h1: { ...typography.h2, fontWeight: "800" },
  contador: { ...typography.small, fontWeight: "600" },

  filterBarWrap: { marginBottom: spacing.sp2 },
  filterBarRow: {
    paddingHorizontal: spacing.sp4,
    gap: spacing.sp2,
    alignItems: "center",
  },

  limpiarBtn: { marginLeft: spacing.sp2 },

  matchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
    marginHorizontal: spacing.sp4,
    marginBottom: spacing.sp2,
    padding: spacing.sp3,
    borderRadius: radii.rMd,
    borderWidth: 1,
  },
  matchBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },

  listWrap: {
    padding: spacing.sp4,
    gap: spacing.sp3,
    paddingBottom: spacing.sp9,
  },

  loadingBox: { alignItems: "center", padding: spacing.sp6 },

  // Sheet
  sheetSearchBlock: {
    gap: spacing.sp2,
    paddingBottom: spacing.sp3,
  },
  sheetSectionLabel: { ...typography.overline, fontWeight: "700" },

  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp2,
  },

  contadorPill: {
    paddingHorizontal: spacing.sp2,
    paddingVertical: 2,
    borderRadius: radii.rFull,
  },
  contadorPillText: {
    ...typography.overline,
    fontWeight: "700",
    textTransform: "none",
    letterSpacing: 0,
  },

  footerBtnLimpiar: { flex: 1 },
  footerBtnAplicar: { flex: 2 },
});
