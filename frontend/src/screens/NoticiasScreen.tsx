/**
 * Feed global de noticias con filtros.
 *
 * Layout basado en design-system-lowfi.html `tpl-noticias` (Template 12):
 *   - Header con titulo "Noticias" + contador "N resultados" a la derecha
 *   - Filter bar compacto en 1 sola row scroll horizontal:
 *       [Button Filtros (N)] [ChipActivo X] [ChipActivo X] ... [Limpiar]
 *   - Lista de NewsCards en 1 columna
 *   - Modal "Filtros" con secciones expandidas (Search, Fecha, Candidato, Fuente)
 *
 * Publica — no requiere auth. Los bookmarks solo aparecen si hay sesion.
 *
 * Fuera de scope del wireframe (no invento):
 *   - "Cargar mas": backend no pagina hoy
 *   - TopNav con "Presidencial 2026": no hay estado global de eleccion activa
 *   - Icono derecho del topnav sin accion definida
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useCandidatos,
  useNoticiasBookmarks,
  useNoticiasFeed,
  useTiposEleccion,
  useToggleNoticiaBookmark,
} from "../api/hooks";
import {
  AppShell,
  Button,
  CandidatoPicker,
  Chip,
  ChipActivo,
  CoachMarkTour,
  CollapsibleFilterSection,
  EmptyState,
  FilterBottomSheet,
  HomeTopBar,
  Input,
  NewsCard,
  NoticiaDetailSheet,
  Spinner,
  type NoticiaDetail,
  type Sentiment,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { sanitizeSnippet } from "../utils/text";

// -- Tipos y constantes ------------------------------------------------------

interface NoticiaEnriquecida {
  id?: number;
  titulo?: string;
  descripcion?: string;
  url?: string;
  fuente?: string;
  imagen_url?: string;
  fecha_publicacion?: string;
  candidatos_mencionados_data?: Array<{
    id: number;
    nombre: string;
    apellido?: string;
    partido?: string;
  }>;
}

interface RangoFecha {
  id: string;
  label: string;
  dias: number | null;
}

const RANGOS_FECHA: RangoFecha[] = [
  { id: "todo", label: "Todo", dias: null },
  { id: "7d", label: "7 dias", dias: 7 },
  { id: "30d", label: "30 dias", dias: 30 },
  { id: "90d", label: "90 dias", dias: 90 },
];

function formatearFecha(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// -- Screen -----------------------------------------------------------------

export function NoticiasScreen({
  navigation,
}: RootStackScreenProps<"Noticias">) {
  const c = useThemeColors();
  const isGuest = useAuthStore((s) => s.isGuest);
  const bookmarksQ = useNoticiasBookmarks();
  const toggleBookmark = useToggleNoticiaBookmark();
  const bookmarkedIds = useMemo(
    () => new Set((bookmarksQ.data ?? []).map((b) => b.noticia)),
    [bookmarksQ.data],
  );

  const [candidatoId, setCandidatoId] = useState<number | null>(null);
  const [fuente, setFuente] = useState<string | null>(null);
  const [rangoId, setRangoId] = useState<string>("todo");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<NoticiaDetail | null>(null);

  const rango = RANGOS_FECHA.find((r) => r.id === rangoId) ?? RANGOS_FECHA[0];

  const candidatosQ = useCandidatos();
  const tiposEleccionQ = useTiposEleccion();
  const noticiasQ = useNoticiasFeed({
    candidatoId,
    fuente,
    dias: rango.dias,
    q: query,
  });

  const candidatos = candidatosQ.data ?? [];
  const tiposEleccion = tiposEleccionQ.data ?? [];
  const noticias = (noticiasQ.data ?? []) as unknown as NoticiaEnriquecida[];

  // -- Derivados -----------------------------------------------------------

  const candidatoNombre = useMemo(() => {
    if (candidatoId == null) return null;
    const cand = candidatos.find((c) => c.id === candidatoId);
    return cand ? `${cand.nombre} ${cand.apellido ?? ""}`.trim() : null;
  }, [candidatoId, candidatos]);

  // Fuentes dinamicas: extraidas del data que ya tenemos.
  // Nota: si aplico filtro de fuente, la lista se colapsa a esa sola
  // (efecto secundario natural). YAGNI cachear la lista completa.
  const fuentesDisponibles = useMemo(() => {
    const set = new Set<string>();
    for (const n of noticias) if (n.fuente) set.add(n.fuente);
    return Array.from(set).sort();
  }, [noticias]);

  const rangoActivo = rangoId !== "todo" ? rango : null;

  // Chips activos que se muestran en el filter bar (removibles). El search no
  // se cuenta como chip porque no tiene una representacion corta razonable;
  // vive dentro del modal.
  const chipsActivos = useMemo(() => {
    const items: Array<{ id: string; label: string; onRemove: () => void }> =
      [];
    if (candidatoNombre) {
      items.push({
        id: "candidato",
        label: candidatoNombre,
        onRemove: () => setCandidatoId(null),
      });
    }
    if (fuente) {
      items.push({
        id: "fuente",
        label: fuente,
        onRemove: () => setFuente(null),
      });
    }
    if (rangoActivo) {
      items.push({
        id: "rango",
        label: rangoActivo.label,
        onRemove: () => setRangoId("todo"),
      });
    }
    return items;
  }, [candidatoNombre, fuente, rangoActivo]);

  // Contador de filtros activos (incluye el search si tiene texto).
  const filtrosActivosCount =
    chipsActivos.length + (query.trim().length > 0 ? 1 : 0);
  const hayFiltroActivo = filtrosActivosCount > 0;

  function limpiarTodo() {
    setCandidatoId(null);
    setFuente(null);
    setRangoId("todo");
    setQuery("");
  }

  // -- Render --------------------------------------------------------------

  const totalNoticias = noticias.length;
  const contadorLabel = noticiasQ.isLoading
    ? "Cargando..."
    : `${totalNoticias} resultado${totalNoticias === 1 ? "" : "s"}`;

  return (
    <>
    <AppShell active="noticias" navigation={navigation}>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <HomeTopBar brand="Noticias" style={styles.topBar} />

        {/* Header con contador */}
        <View style={styles.headerRow}>
          <Text style={[styles.h1, { color: c.text }]}>Noticias</Text>
          <Text style={[styles.contador, { color: c.textSecondary }]}>
            {contadorLabel}
          </Text>
        </View>

        {/* Filter bar compacto */}
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

            {chipsActivos.map((item) => (
              <ChipActivo
                key={item.id}
                label={item.label}
                onRemove={item.onRemove}
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

        {/* Lista */}
        <ScrollView contentContainerStyle={styles.listWrap}>
          {noticiasQ.isLoading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
          ) : noticias.length === 0 ? (
            <EmptyState
              icon="info"
              title="No hay noticias que coincidan"
              description={
                hayFiltroActivo
                  ? "Prueba ajustando los filtros o limpiando la busqueda."
                  : "Aun no hay noticias disponibles."
              }
              actionLabel={hayFiltroActivo ? "Limpiar filtros" : undefined}
              onAction={hayFiltroActivo ? limpiarTodo : undefined}
            />
          ) : (
            noticias.map((n) => {
              const id = n.id;
              if (id == null) return null;
              const isBookmarked = bookmarkedIds.has(id);
              const source = n.fuente ?? "Fuente";
              const when = formatearFecha(n.fecha_publicacion);
              const sentiment: Sentiment = "neutral";
              const openDetail = () =>
                setSelectedNoticia({
                  id,
                  titulo: sanitizeSnippet(n.titulo),
                  descripcion: sanitizeSnippet(n.descripcion),
                  url: n.url,
                  fuente: n.fuente,
                  imagenUrl: n.imagen_url,
                  fechaFormateada: when,
                  sentiment,
                  candidatosMencionados: n.candidatos_mencionados_data,
                });
              return (
                <NewsCard
                  key={id}
                  headline={sanitizeSnippet(n.titulo)}
                  snippet={sanitizeSnippet(n.descripcion)}
                  source={source}
                  when={when}
                  sentiment={sentiment}
                  mentionedCandidates={n.candidatos_mencionados_data}
                  onPress={openDetail}
                  bookmarked={!isGuest ? isBookmarked : undefined}
                  onToggleBookmark={
                    !isGuest ? () => toggleBookmark.mutate(id) : undefined
                  }
                  bookmarkLoading={toggleBookmark.isPending}
                />
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Bottom sheet de filtros expandidos */}
      <FilterBottomSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filtrosActivosCount={filtrosActivosCount}
        resultadosCount={totalNoticias}
        onLimpiar={limpiarTodo}
      >
        {/* Busqueda: no colapsable (input necesita estar siempre visible) */}
        <View style={styles.sheetSearchBlock}>
          <Text style={[styles.sheetSectionLabel, { color: c.textSecondary }]}>
            Buscar
          </Text>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar en titulo o descripcion..."
            accessibilityLabel="Buscar noticias"
            returnKeyType="search"
          />
        </View>

        <CollapsibleFilterSection
          title="Fecha"
          summary={rangoId === "todo" ? "Todo" : rango.label}
          defaultExpanded={rangoId !== "todo"}
        >
          <View style={styles.chipsGrid}>
            {RANGOS_FECHA.map((r) => (
              <Chip
                key={r.id}
                active={r.id === rangoId}
                onPress={() => setRangoId(r.id)}
              >
                {r.label}
              </Chip>
            ))}
          </View>
        </CollapsibleFilterSection>

        <CollapsibleFilterSection
          title="Candidato"
          summary={candidatoNombre ?? "Todos"}
          defaultExpanded={candidatoId !== null}
        >
          <CandidatoPicker
            candidatos={candidatos}
            tiposEleccion={tiposEleccion}
            selectedId={candidatoId}
            onSelect={setCandidatoId}
          />
        </CollapsibleFilterSection>

        {fuentesDisponibles.length > 0 ? (
          <CollapsibleFilterSection
            title="Fuente"
            summary={fuente ?? "Todas"}
            defaultExpanded={fuente !== null}
          >
            <View style={styles.chipsGrid}>
              <Chip active={fuente === null} onPress={() => setFuente(null)}>
                Todas
              </Chip>
              {fuentesDisponibles.map((f) => (
                <Chip
                  key={f}
                  active={fuente === f}
                  onPress={() => setFuente(f)}
                >
                  {f}
                </Chip>
              ))}
            </View>
          </CollapsibleFilterSection>
        ) : null}
      </FilterBottomSheet>

      {/* Preview de detalle de noticia (bottom sheet). */}
      <NoticiaDetailSheet
        visible={selectedNoticia !== null}
        onClose={() => setSelectedNoticia(null)}
        noticia={selectedNoticia}
        bookmarked={
          !isGuest && selectedNoticia
            ? bookmarkedIds.has(selectedNoticia.id)
            : undefined
        }
        onToggleBookmark={
          !isGuest && selectedNoticia
            ? () => toggleBookmark.mutate(selectedNoticia.id)
            : undefined
        }
        bookmarkLoading={toggleBookmark.isPending}
      />
    </AppShell>

      <CoachMarkTour tourId="noticias" />
    </>
  );
}
// -- Styles -----------------------------------------------------------------

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
  h1: {
    ...typography.h2,
    fontWeight: "800",
  },
  contador: {
    ...typography.small,
    fontWeight: "600",
  },

  filterBarWrap: {
    marginBottom: spacing.sp2,
  },
  filterBarRow: {
    paddingHorizontal: spacing.sp4,
    gap: spacing.sp2,
    alignItems: "center",
  },

  limpiarBtn: {
    marginLeft: spacing.sp2,
  },

  listWrap: {
    padding: spacing.sp4,
    gap: spacing.sp3,
    paddingBottom: spacing.sp9,
  },

  loadingBox: {
    alignItems: "center",
    padding: spacing.sp6,
  },


  // Sheet content
  sheetSearchBlock: {
    gap: spacing.sp2,
    paddingBottom: spacing.sp3,
  },
  sheetSectionLabel: {
    ...typography.overline,
    fontWeight: "700",
  },

  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp2,
  },
});
