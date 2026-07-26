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
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCandidatos,
  useNoticiasBookmarks,
  useNoticiasFeed,
  useToggleNoticiaBookmark,
} from "../api/hooks";
import {
  AppShell,
  Badge,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  HomeTopBar,
  Icon,
  Input,
  NewsCard,
  Spinner,
  type Sentiment,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

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

  const rango = RANGOS_FECHA.find((r) => r.id === rangoId) ?? RANGOS_FECHA[0];

  const candidatosQ = useCandidatos();
  const noticiasQ = useNoticiasFeed({
    candidatoId,
    fuente,
    dias: rango.dias,
    q: query,
  });

  const candidatos = candidatosQ.data ?? [];
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
        <HomeTopBar brand="Noticias" />

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
              return (
                <View key={id} style={styles.newsCardWrap}>
                  <NewsCard
                    headline={n.titulo ?? ""}
                    snippet={n.descripcion ?? ""}
                    source={source}
                    when={when}
                    sentiment={sentiment}
                    onPress={n.url ? () => Linking.openURL(n.url!) : undefined}
                    bookmarked={!isGuest ? isBookmarked : undefined}
                    onToggleBookmark={
                      !isGuest ? () => toggleBookmark.mutate(id) : undefined
                    }
                    bookmarkLoading={toggleBookmark.isPending}
                  />
                  {n.candidatos_mencionados_data &&
                  n.candidatos_mencionados_data.length > 0 ? (
                    <View style={styles.mencionRow}>
                      {n.candidatos_mencionados_data.map((cand) => (
                        <Badge key={cand.id} variant="neutral">
                          {`${cand.nombre} ${cand.apellido ?? ""}`.trim()}
                        </Badge>
                      ))}
                    </View>
                  ) : null}
                </View>
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
        fuente={fuente}
        onFuenteChange={setFuente}
        fuentesDisponibles={fuentesDisponibles}
        onLimpiar={limpiarTodo}
        filtrosActivosCount={filtrosActivosCount}
        resultadosCount={totalNoticias}
        rangoLabel={rango.label}
        candidatoNombre={candidatoNombre}
      />
    </AppShell>
  );
}

// -- Sub-componentes locales ------------------------------------------------

interface ChipActivoProps {
  label: string;
  onRemove: () => void;
}

/**
 * Chip "activo" removible del filter bar. Muestra el valor del filtro con un
 * icono X a la derecha. Al presionar, quita el filtro sin abrir el modal.
 *
 * Patron unico de este screen — no promuevo a molecule sin un segundo uso.
 */
function ChipActivo({ label, onRemove }: ChipActivoProps) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`Quitar filtro ${label}`}
      style={({ pressed }) => [
        styles.chipActivo,
        {
          backgroundColor: c.primary,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.chipActivoText, { color: c.textOnPrimary }]}>
        {label}
      </Text>
      <Icon name="close" size={14} color={c.textOnPrimary} />
    </Pressable>
  );
}

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
  const candidatosList = candidatos ?? [];

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
        <View style={styles.chipsGrid}>
          <Chip
            active={candidatoId === null}
            onPress={() => onCandidatoChange(null)}
          >
            Todos
          </Chip>
          {candidatosList
            .filter((cand) => cand.id != null)
            .map((cand) => (
              <Chip
                key={cand.id}
                active={candidatoId === cand.id}
                onPress={() => onCandidatoChange(cand.id!)}
              >
                {`${cand.nombre} ${cand.apellido ?? ""}`.trim()}
              </Chip>
            ))}
        </View>
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

interface CollapsibleFilterSectionProps {
  title: string;
  /** Resumen del estado (ej: "Todos", "2 seleccionados", "7 dias"). */
  summary: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

/**
 * Seccion colapsable del bottom sheet de filtros. Header con titulo +
 * summary + chevron (v cuando expandida, > cuando colapsada). Border
 * inferior para separar de la siguiente.
 *
 * Patron unico del sheet de filtros por ahora — si aparece un segundo caso
 * (ej. sheet de settings), promuevo a molecule.
 */
function CollapsibleFilterSection({
  title,
  summary,
  defaultExpanded = false,
  children,
}: CollapsibleFilterSectionProps) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.collapsibleWrap, { borderBottomColor: c.border }]}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${summary}`}
        style={styles.collapsibleHeader}
      >
        <View style={styles.collapsibleTitles}>
          <Text style={[styles.collapsibleTitle, { color: c.text }]}>
            {title}
          </Text>
          <Text style={[styles.collapsibleSummary, { color: c.textSecondary }]}>
            {summary}
          </Text>
        </View>
        <Icon
          name={expanded ? "chevron-left" : "chevron-right"}
          size={16}
          color={c.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.collapsibleBody}>{children}</View>
      ) : null}
    </View>
  );
}

// -- Styles -----------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

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

  chipActivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp1,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
    borderRadius: radii.rFull,
  },
  chipActivoText: {
    ...typography.overline,
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: 0,
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

  newsCardWrap: { gap: spacing.sp2 },
  mencionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp1,
    paddingHorizontal: spacing.sp2,
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

  collapsibleWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sp3,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp3,
  },
  collapsibleTitles: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sp2,
    flexShrink: 1,
  },
  collapsibleTitle: {
    ...typography.body,
    fontWeight: "600",
  },
  collapsibleSummary: {
    ...typography.small,
  },
  collapsibleBody: {
    paddingTop: spacing.sp2,
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
});
