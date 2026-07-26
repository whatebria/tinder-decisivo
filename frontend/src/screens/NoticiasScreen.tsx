/**
 * Feed global de noticias con filtros.
 *
 * Filtros disponibles:
 * - Busqueda de texto (client-side + backend con debounce implicito via query key)
 * - Candidato mencionado (Chip atoms)
 * - Fuente / medio (Chip atoms, dinamico segun data)
 * - Rango de fecha (Chip atoms: Todo / 7d / 30d / 90d)
 *
 * Publica — no requiere auth.
 *
 * Migrado a Fase 5:
 *   - AppShell con active='noticias' (es tab del BottomNav)
 *   - HomeTopBar reemplaza el header custom (title + subtitle)
 *   - Elimina paddingTop 48 (ahora hay shell con safe area)
 *   - Elimina Link 'Volver' final (es tab, no detail)
 */

import React, { useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useCandidatos,
  useNoticiasBookmarks,
  useNoticiasFeed,
  useToggleNoticiaBookmark,
} from "../api/hooks";
import {
  AppShell,
  Badge,
  Chip,
  HomeTopBar,
  Input,
  Link,
  NewsCard,
  type Sentiment,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

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

interface ChipRowProps<T extends string | number | null> {
  items: Array<{ id: T; label: string }>;
  selectedId: T;
  onSelect: (id: T) => void;
}

function ChipRow<T extends string | number | null>({
  items,
  selectedId,
  onSelect,
}: ChipRowProps<T>) {
  return (
    <View style={styles.chipsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {items.map((item) => (
          <Chip
            key={String(item.id)}
            active={item.id === selectedId}
            onPress={() => onSelect(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

export function NoticiasScreen({ navigation }: RootStackScreenProps<"Noticias">) {
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

  const chipsCandidatos = useMemo(
    () => [
      { id: null as number | null, label: "Todos" },
      ...candidatos
        .filter((cand) => cand.id != null)
        .map((cand) => ({
          id: cand.id!,
          label: `${cand.nombre} ${cand.apellido ?? ""}`.trim(),
        })),
    ],
    [candidatos],
  );

  // Fuentes dinamicas: extraidas del data que ya tenemos.
  // Nota: si aplico filtro de fuente, la lista se colapsa a esa sola
  // (efecto secundario natural). Se puede mejorar cacheando la lista completa
  // pero YAGNI por ahora.
  const chipsFuentes = useMemo(() => {
    const set = new Set<string>();
    for (const n of noticias) {
      if (n.fuente) set.add(n.fuente);
    }
    return [
      { id: null as string | null, label: "Todas" },
      ...Array.from(set)
        .sort()
        .map((f) => ({ id: f, label: f })),
    ];
  }, [noticias]);

  const hayFiltroActivo =
    candidatoId != null ||
    fuente != null ||
    rangoId !== "todo" ||
    query.length > 0;

  function limpiarTodo() {
    setCandidatoId(null);
    setFuente(null);
    setRangoId("todo");
    setQuery("");
  }

  const rangosItems = RANGOS_FECHA.map((r) => ({ id: r.id, label: r.label }));

  return (
    <AppShell active="noticias" navigation={navigation}>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <HomeTopBar brand="Noticias" />
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Ultimas noticias sobre los candidatos.
        </Text>

      {/* Busqueda */}
      <View style={styles.searchWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en titulo o descripcion..."
          accessibilityLabel="Buscar noticias"
          returnKeyType="search"
        />
      </View>

      {/* Filtros: Fecha */}
      <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
        Fecha
      </Text>
      <ChipRow<string>
        items={rangosItems}
        selectedId={rangoId}
        onSelect={setRangoId}
      />

      {/* Filtros: Candidato */}
      <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
        Candidato
      </Text>
      <ChipRow<number | null>
        items={chipsCandidatos}
        selectedId={candidatoId}
        onSelect={setCandidatoId}
      />

      {/* Filtros: Fuente */}
      {chipsFuentes.length > 1 ? (
        <>
          <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
            Fuente
          </Text>
          <ChipRow<string | null>
            items={chipsFuentes}
            selectedId={fuente}
            onSelect={setFuente}
          />
        </>
      ) : null}

      {/* Boton limpiar filtros */}
      {hayFiltroActivo ? (
        <View style={styles.clearWrap}>
          <Link block onPress={limpiarTodo} color={c.danger}>
            Limpiar filtros
          </Link>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.listWrap}>
        {noticiasQ.isLoading ? (
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>
            Cargando noticias...
          </Text>
        ) : noticias.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              No hay noticias que coincidan con los filtros.
            </Text>
            {hayFiltroActivo ? (
              <Link block onPress={limpiarTodo}>
                Ver todas
              </Link>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={[styles.contador, { color: c.textSecondary }]}>
              {noticias.length} noticia(s)
            </Text>
            {noticias.map((n) => {
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
            })}
          </>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
      </View>
    </AppShell>
  );
}

// ---------- Styles ----------
//
// Todos los valores dimensionales vienen de tokens del DS.

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: {
    ...typography.small,
    paddingHorizontal: spacing.sp5,
    marginBottom: spacing.sp2,
  },

  searchWrap: {
    paddingHorizontal: spacing.sp4,
    marginBottom: spacing.sp2,
  },

  filtroLabel: {
    ...typography.overline,
    fontWeight: "700",
    paddingHorizontal: spacing.sp5,
    marginTop: spacing.sp2,
  },
  chipsWrap: { height: spacing.sp9 - spacing.sp3 }, // ~44
  chipsRow: {
    paddingHorizontal: spacing.sp4,
    gap: spacing.sp2,
    alignItems: "center",
    paddingVertical: spacing.sp2,
  },

  clearWrap: {
    paddingHorizontal: spacing.sp4,
    marginBottom: spacing.sp1,
  },

  listWrap: {
    padding: spacing.sp4,
    gap: spacing.sp3,
    paddingBottom: spacing.sp9,
  },
  loadingText: typography.small,
  emptyBlock: {
    alignItems: "center",
    gap: spacing.sp3,
    padding: spacing.sp6,
  },
  emptyText: {
    ...typography.small,
    textAlign: "center",
  },

  contador: {
    ...typography.overline,
    fontStyle: "italic",
    marginBottom: spacing.sp1,
    textTransform: "none",
    letterSpacing: 0,
  },

  newsCardWrap: { gap: spacing.sp2 },
  mencionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sp1,
    paddingHorizontal: spacing.sp2,
  },

  footerSpacer: { height: spacing.sp3 },
});
