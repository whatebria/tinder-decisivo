/**
 * Feed global de noticias con filtros.
 *
 * Filtros disponibles:
 * - Busqueda de texto (client-side + backend con debounce implicito via query key)
 * - Candidato mencionado (chips)
 * - Fuente / medio (chips, dinamico segun data)
 * - Rango de fecha (chips: Todo / 7d / 30d / 90d)
 *
 * Publica — no requiere auth.
 */

import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCandidatos, useNoticiasBookmarks, useNoticiasFeed, useToggleNoticiaBookmark } from "../api/hooks";
import { BookmarkButton, Link } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
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

interface ChipRowProps {
  items: Array<{ id: string | number | null; label: string }>;
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
  colors: ReturnType<typeof useThemeColors>;
}

function ChipRow({ items, selectedId, onSelect, colors: c }: ChipRowProps) {
  return (
    <View style={styles.chipsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <Pressable
              key={String(item.id)}
              onPress={() => onSelect(item.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? c.primary : c.card,
                  borderColor: selected ? c.primary : c.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={{
                  color: selected ? "#FFFFFF" : c.text,
                  fontWeight: selected ? "700" : "500",
                  fontSize: 13,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
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
    [bookmarksQ.data]
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
        .filter((c) => c.id != null)
        .map((c) => ({
          id: c.id!,
          label: `${c.nombre} ${c.apellido ?? ""}`.trim(),
        })),
    ],
    [candidatos]
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
    candidatoId != null || fuente != null || rangoId !== "todo" || query.length > 0;

  function limpiarTodo() {
    setCandidatoId(null);
    setFuente(null);
    setRangoId("todo");
    setQuery("");
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Noticias</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Ultimas noticias sobre los candidatos.
        </Text>
      </View>

      {/* Busqueda */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en titulo o descripcion..."
          placeholderTextColor={c.textSecondary}
          style={[
            styles.searchInput,
            { backgroundColor: c.card, borderColor: c.border, color: c.text },
          ]}
          accessibilityLabel="Buscar noticias"
          returnKeyType="search"
        />
      </View>

      {/* Filtros: Fecha */}
      <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
        Fecha
      </Text>
      <ChipRow
        items={RANGOS_FECHA.map((r) => ({ id: r.id, label: r.label }))}
        selectedId={rangoId}
        onSelect={(id) => setRangoId(String(id))}
        colors={c}
      />

      {/* Filtros: Candidato */}
      <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
        Candidato
      </Text>
      <ChipRow
        items={chipsCandidatos}
        selectedId={candidatoId}
        onSelect={(id) => setCandidatoId(id as number | null)}
        colors={c}
      />

      {/* Filtros: Fuente */}
      {chipsFuentes.length > 1 ? (
        <>
          <Text style={[styles.filtroLabel, { color: c.textSecondary }]}>
            Fuente
          </Text>
          <ChipRow
            items={chipsFuentes}
            selectedId={fuente}
            onSelect={(id) => setFuente(id as string | null)}
            colors={c}
          />
        </>
      ) : null}

      {/* Boton limpiar filtros */}
      {hayFiltroActivo ? (
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <Link block onPress={limpiarTodo} color={c.danger}>
            Limpiar filtros
          </Link>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 60 }}
      >
        {noticiasQ.isLoading ? (
          <Text style={{ color: c.textSecondary }}>Cargando noticias...</Text>
        ) : noticias.length === 0 ? (
          <View style={{ alignItems: "center", gap: 12, padding: 24 }}>
            <Text
              style={{ color: c.textSecondary, textAlign: "center" }}
            >
              No hay noticias que coincidan con los filtros.
            </Text>
            {hayFiltroActivo ? (
              <Link block onPress={limpiarTodo}>Ver todas</Link>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={[styles.contador, { color: c.textSecondary }]}>
              {noticias.length} noticia(s)
            </Text>
            {noticias.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => n.url && Linking.openURL(n.url)}
                style={[
                  styles.card,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
                accessibilityLabel={`Abrir noticia: ${n.titulo}`}
              >
                {n.imagen_url ? (
                  <Image
                    source={{ uri: n.imagen_url }}
                    style={styles.thumb}
                    accessibilityIgnoresInvertColors
                  />
                ) : null}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={[styles.titulo, { color: c.text }]}
                    numberOfLines={2}
                  >
                    {n.titulo}
                  </Text>
                  <View style={styles.metaRow}>
                    {n.fuente ? (
                      <Text style={[styles.fuente, { color: c.primary }]}>
                        {n.fuente}
                      </Text>
                    ) : null}
                    <Text style={[styles.fecha, { color: c.textSecondary }]}>
                      {formatearFecha(n.fecha_publicacion)}
                    </Text>
                  </View>
                  {n.descripcion ? (
                    <Text
                      style={[styles.desc, { color: c.textSecondary }]}
                      numberOfLines={2}
                    >
                      {n.descripcion}
                    </Text>
                  ) : null}
                  {n.candidatos_mencionados_data &&
                  n.candidatos_mencionados_data.length > 0 ? (
                    <View style={styles.mencionRow}>
                      {n.candidatos_mencionados_data.map((cand) => (
                        <View
                          key={cand.id}
                          style={[
                            styles.miniChip,
                            { borderColor: c.border, backgroundColor: c.bg },
                          ]}
                        >
                          <Text style={{ fontSize: 11, color: c.textSecondary }}>
                            {cand.nombre} {cand.apellido ?? ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {!isGuest ? (
                    <BookmarkButton
                      saved={bookmarkedIds.has(n.id!)}
                      onPress={() => n.id != null && toggleBookmark.mutate(n.id)}
                      loading={toggleBookmark.isPending}
                      accessibilityLabel={
                        bookmarkedIds.has(n.id!)
                          ? `Quitar de guardadas: ${n.titulo}`
                          : `Guardar noticia: ${n.titulo}`
                      }
                    />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: 12 }} />
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  header: { paddingHorizontal: 20, gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 13 },

  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },

  filtroLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  chipsWrap: { height: 44 },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    paddingVertical: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  contador: { fontSize: 11, fontStyle: "italic", marginBottom: 4 },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 6,
    backgroundColor: "#00000010",
  },
  titulo: { fontSize: 15, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  fuente: { fontSize: 12, fontWeight: "600" },
  fecha: { fontSize: 11 },
  desc: { fontSize: 12, lineHeight: 16 },
  mencionRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  miniChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
});
