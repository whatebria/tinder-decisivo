/**
 * Feed global de noticias con filtros.
 *
 * - Lista todas las noticias ordenadas por fecha desc.
 * - Filtro por candidato via chips seleccionables (0 o 1 seleccionado).
 * - Al tocar una noticia: abre la URL en el browser (Linking).
 *
 * Publica (no requiere auth) — cualquiera puede ver el feed.
 */

import React, { useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCandidatos, useNoticiasFeed } from "../api/hooks";
import { TextButton } from "../components/TextButton";
import type { RootStackScreenProps } from "../navigation/types";
import { useThemeColors } from "../theme/useTheme";

/** Cast local para acceder al campo enriquecido no reflejado aun en el schema
 *  autogenerado de OpenAPI. */
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

export function NoticiasScreen({ navigation }: RootStackScreenProps<"Noticias">) {
  const c = useThemeColors();
  const [candidatoId, setCandidatoId] = useState<number | null>(null);

  const candidatosQ = useCandidatos();
  const noticiasQ = useNoticiasFeed({ candidatoId });

  const candidatos = candidatosQ.data ?? [];
  const noticias = (noticiasQ.data ?? []) as unknown as NoticiaEnriquecida[];

  const chips = useMemo(() => {
    return [
      { id: null, label: "Todos" },
      ...candidatos
        .filter((c) => c.id != null)
        .map((c) => ({
          id: c.id!,
          label: `${c.nombre} ${c.apellido ?? ""}`.trim(),
        })),
    ];
  }, [candidatos]);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Noticias</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Ultimas noticias sobre los candidatos.
        </Text>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {chips.map((chip) => {
          const selected = chip.id === candidatoId;
          return (
            <Pressable
              key={String(chip.id)}
              onPress={() => setCandidatoId(chip.id)}
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
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 60 }}>
        {noticiasQ.isLoading ? (
          <Text style={{ color: c.textSecondary }}>Cargando noticias...</Text>
        ) : noticias.length === 0 ? (
          <View style={{ alignItems: "center", gap: 12, padding: 24 }}>
            <Text style={{ color: c.textSecondary, textAlign: "center" }}>
              No hay noticias que coincidan con el filtro.
            </Text>
            {candidatoId != null ? (
              <TextButton onPress={() => setCandidatoId(null)}>
                Ver todas
              </TextButton>
            ) : null}
          </View>
        ) : (
          noticias.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => n.url && Linking.openURL(n.url)}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
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
                {n.candidatos_mencionados_data && n.candidatos_mencionados_data.length > 0 ? (
                  <View style={styles.mencionRow}>
                    {n.candidatos_mencionados_data.map((cand) => (
                      <View
                        key={cand.id}
                        style={[styles.miniChip, { borderColor: c.border, backgroundColor: c.bg }]}
                      >
                        <Text style={{ fontSize: 11, color: c.textSecondary }}>
                          {cand.nombre} {cand.apellido ?? ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: 12 }} />
        <TextButton onPress={() => navigation.goBack()}>Volver</TextButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  header: { paddingHorizontal: 20, gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  chipsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  thumb: { width: 88, height: 88, borderRadius: 6, backgroundColor: "#00000010" },
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
