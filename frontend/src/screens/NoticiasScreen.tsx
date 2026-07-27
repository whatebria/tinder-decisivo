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
  BottomSheet,
  Button,
  Chip,
  ChipActivo,
  CollapsibleFilterSection,
  EmptyState,
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
      <FiltrosSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        query={query}
        onQueryChange={setQuery}
        rangoId={rangoId}
        onRangoChange={setRangoId}
        candidatoId={candidatoId}
        onCandidatoChange={setCandidatoId}
        candidatos={candidatos}
        tiposEleccion={tiposEleccion}
        fuente={fuente}
        onFuenteChange={setFuente}
        fuentesDisponibles={fuentesDisponibles}
        onLimpiar={limpiarTodo}
        filtrosActivosCount={filtrosActivosCount}
        resultadosCount={totalNoticias}
        rangoLabel={rango.label}
        candidatoNombre={candidatoNombre}
      />

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
  );
}

// -- Sub-componentes locales ------------------------------------------------

interface FiltrosSheetProps {
  visible: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  rangoId: string;
  onRangoChange: (id: string) => void;
  candidatoId: number | null;
  onCandidatoChange: (id: number | null) => void;
  candidatos: ReturnType<typeof useCandidatos>["data"];
  tiposEleccion: ReturnType<typeof useTiposEleccion>["data"];
  fuente: string | null;
  onFuenteChange: (f: string | null) => void;
  fuentesDisponibles: string[];
  onLimpiar: () => void;
  filtrosActivosCount: number;
  resultadosCount: number;
  rangoLabel: string;
  candidatoNombre: string | null;
}

/**
 * Bottom sheet con filtros expandidos siguiendo tpl-filtros (Template 22):
 * secciones colapsables con summary del estado, footer sticky con
 * "Limpiar todo" + "Aplicar (N)" con contador de resultados en vivo.
 *
 * Los cambios se aplican en vivo (no draft/committed): tap en un chip
 * actualiza el fetch inmediatamente, y el contador del boton "Aplicar"
 * refleja ese cambio. "Aplicar" solo cierra el sheet.
 */
function FiltrosSheet({
  visible,
  onClose,
  query,
  onQueryChange,
  rangoId,
  onRangoChange,
  candidatoId,
  onCandidatoChange,
  candidatos,
  tiposEleccion,
  fuente,
  onFuenteChange,
  fuentesDisponibles,
  onLimpiar,
  filtrosActivosCount,
  resultadosCount,
  rangoLabel,
  candidatoNombre,
}: FiltrosSheetProps) {
  const c = useThemeColors();

  const trailing =
    filtrosActivosCount > 0 ? (
      <View
        style={[styles.contadorPill, { backgroundColor: c.primary }]}
      >
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

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filtros"
      titleTrailing={trailing}
      footer={footer}
    >
      {/* Busqueda: no colapsable (input necesita estar siempre visible) */}
      <View style={styles.sheetSearchBlock}>
        <Text style={[styles.sheetSectionLabel, { color: c.textSecondary }]}>
          Buscar
        </Text>
        <Input
          value={query}
          onChangeText={onQueryChange}
          placeholder="Buscar en titulo o descripcion..."
          accessibilityLabel="Buscar noticias"
          returnKeyType="search"
        />
      </View>

      <CollapsibleFilterSection
        title="Fecha"
        summary={rangoId === "todo" ? "Todo" : rangoLabel}
        defaultExpanded={rangoId !== "todo"}
      >
        <View style={styles.chipsGrid}>
          {RANGOS_FECHA.map((r) => (
            <Chip
              key={r.id}
              active={r.id === rangoId}
              onPress={() => onRangoChange(r.id)}
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
          candidatos={candidatos ?? []}
          tiposEleccion={tiposEleccion ?? []}
          selectedId={candidatoId}
          onSelect={onCandidatoChange}
        />
      </CollapsibleFilterSection>

      {fuentesDisponibles.length > 0 ? (
        <CollapsibleFilterSection
          title="Fuente"
          summary={fuente ?? "Todas"}
          defaultExpanded={fuente !== null}
        >
          <View style={styles.chipsGrid}>
            <Chip
              active={fuente === null}
              onPress={() => onFuenteChange(null)}
            >
              Todas
            </Chip>
            {fuentesDisponibles.map((f) => (
              <Chip
                key={f}
                active={fuente === f}
                onPress={() => onFuenteChange(f)}
              >
                {f}
              </Chip>
            ))}
          </View>
        </CollapsibleFilterSection>
      ) : null}
    </BottomSheet>
  );
}

interface CandidatoPickerProps {
  candidatos: NonNullable<ReturnType<typeof useCandidatos>["data"]>;
  tiposEleccion: NonNullable<ReturnType<typeof useTiposEleccion>["data"]>;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

/**
 * Sub-picker de candidato con filtros propios: eleccion y partido.
 *
 * El schema de Candidato que llega al frontend NO incluye region/comuna
 * (aunque el backend los tiene). Filtrar por territorio requiere extender
 * el CandidatoSerializer y regenerar types — pendiente cuando Jenny lo
 * confirme. Por ahora, solo elecccion + partido.
 *
 * Los sub-filtros son locales al picker (no afectan el feed principal).
 * Solo reducen que chips de candidato son visibles.
 */
function CandidatoPicker({
  candidatos,
  tiposEleccion,
  selectedId,
  onSelect,
}: CandidatoPickerProps) {
  const c = useThemeColors();
  const [tipoEleccionId, setTipoEleccionId] = useState<number | null>(null);
  const [partido, setPartido] = useState<string | null>(null);

  // Partidos derivados del data (evita sostener otra fuente de verdad).
  const partidos = useMemo(() => {
    const set = new Set<string>();
    for (const cand of candidatos) if (cand.partido) set.add(cand.partido);
    return Array.from(set).sort();
  }, [candidatos]);

  // Candidatos filtrados por eleccion + partido.
  const filtrados = useMemo(() => {
    return candidatos.filter((cand) => {
      if (cand.id == null) return false;
      if (
        tipoEleccionId != null &&
        !(cand.tipos_eleccion ?? []).includes(tipoEleccionId)
      ) {
        return false;
      }
      if (partido != null && cand.partido !== partido) return false;
      return true;
    });
  }, [candidatos, tipoEleccionId, partido]);

  return (
    <View style={styles.pickerWrap}>
      {/* Sub-filtro: Eleccion */}
      <Text style={[styles.pickerSubLabel, { color: c.textSecondary }]}>
        Eleccion
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickerSubRow}
      >
        <Chip
          active={tipoEleccionId === null}
          onPress={() => setTipoEleccionId(null)}
        >
          Todas
        </Chip>
        {tiposEleccion
          .filter((t) => t.id != null)
          .map((t) => (
            <Chip
              key={t.id}
              active={tipoEleccionId === t.id}
              onPress={() => setTipoEleccionId(t.id!)}
            >
              {t.nombre}
            </Chip>
          ))}
      </ScrollView>

      {/* Sub-filtro: Partido (solo si hay 2+) */}
      {partidos.length > 1 ? (
        <>
          <Text style={[styles.pickerSubLabel, { color: c.textSecondary }]}>
            Partido
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pickerSubRow}
          >
            <Chip
              active={partido === null}
              onPress={() => setPartido(null)}
            >
              Todos
            </Chip>
            {partidos.map((p) => (
              <Chip
                key={p}
                active={partido === p}
                onPress={() => setPartido(p)}
              >
                {p}
              </Chip>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Divider visual entre sub-filtros y la lista */}
      <View style={[styles.pickerDivider, { backgroundColor: c.border }]} />

      {/* Lista de candidatos filtrada */}
      <Text style={[styles.pickerSubLabel, { color: c.textSecondary }]}>
        {filtrados.length === candidatos.length
          ? `Todos (${filtrados.length})`
          : `${filtrados.length} de ${candidatos.length}`}
      </Text>
      <View style={styles.chipsGrid}>
        <Chip active={selectedId === null} onPress={() => onSelect(null)}>
          Todos
        </Chip>
        {filtrados.map((cand) => (
          <Chip
            key={cand.id}
            active={selectedId === cand.id}
            onPress={() => onSelect(cand.id!)}
          >
            {`${cand.nombre} ${cand.apellido ?? ""}`.trim()}
          </Chip>
        ))}
      </View>
    </View>
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

  // CandidatoPicker
  pickerWrap: {
    gap: spacing.sp2,
  },
  pickerSubLabel: {
    ...typography.overline,
    fontWeight: "700",
  },
  pickerSubRow: {
    gap: spacing.sp2,
    alignItems: "center",
    paddingVertical: spacing.sp1,
  },
  pickerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sp2,
  },
});
