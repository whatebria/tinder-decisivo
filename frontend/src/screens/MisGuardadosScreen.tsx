/**
 * MisGuardadosScreen: lista noticias y posturas guardadas del user.
 *
 * Dos secciones (no tabs por simplicidad). Cada item con boton para desguardar.
 */
import React, { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useNoticiasBookmarks,
  usePosturasBookmarks,
  useToggleNoticiaBookmark,
  useTogglePosturaBookmark,
} from "../api/hooks";
import { BookmarkButton, Link, Tabs } from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useThemeColors } from "../theme/useTheme";

type Tab = "noticias" | "posturas";

export function MisGuardadosScreen({ navigation }: RootStackScreenProps<"MisGuardados">) {
  const c = useThemeColors();
  const [tab, setTab] = useState<Tab>("noticias");

  const noticiasQ = useNoticiasBookmarks();
  const posturasQ = usePosturasBookmarks();
  const toggleNoticia = useToggleNoticiaBookmark();
  const togglePostura = useTogglePosturaBookmark();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, paddingTop: 48, backgroundColor: c.bg },
        header: { paddingHorizontal: 20, gap: 4, marginBottom: 12 },
        title: { fontSize: 28, fontWeight: "800", color: c.text },
        subtitle: { fontSize: 13, color: c.textSecondary },
        content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
        card: {
          backgroundColor: c.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: c.border,
          gap: 8,
        },
        cardTitle: { fontSize: 15, fontWeight: "700", color: c.text },
        cardMeta: { fontSize: 12, color: c.textSecondary },
        cardBody: { fontSize: 13, color: c.textSecondary, lineHeight: 18 },
        empty: { padding: 24, alignItems: "center" },
        emptyText: { fontSize: 14, color: c.textSecondary, textAlign: "center" },
        row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
      }),
    [c]
  );

  const noticias = noticiasQ.data ?? [];
  const posturas = posturasQ.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis guardados</Text>
        <Text style={styles.subtitle}>Noticias y posturas que marcaste para leer despues.</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Tabs<Tab>
          items={[
            { value: "noticias", label: "Noticias", count: noticias.length },
            { value: "posturas", label: "Posturas", count: posturas.length },
          ]}
          value={tab}
          onChange={(v) => setTab(v)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === "noticias" ? (
          noticiasQ.isLoading ? (
            <Text style={{ color: c.textSecondary }}>Cargando...</Text>
          ) : noticias.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Aun no guardaste noticias. Toca "Guardar" en el feed de noticias.
              </Text>
            </View>
          ) : (
            noticias.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => b.noticia_data.url && Linking.openURL(b.noticia_data.url)}
                style={styles.card}
                accessibilityRole="link"
                accessibilityLabel={`Abrir noticia: ${b.noticia_data.titulo}`}
              >
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {b.noticia_data.titulo}
                </Text>
                {b.noticia_data.descripcion ? (
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {b.noticia_data.descripcion}
                  </Text>
                ) : null}
                <View style={styles.row}>
                  <Text style={styles.cardMeta}>{b.noticia_data.fuente ?? ""}</Text>
                  <BookmarkButton
                    saved
                    onPress={() => toggleNoticia.mutate(b.noticia)}
                    loading={toggleNoticia.isPending}
                    accessibilityLabel={`Quitar noticia guardada: ${b.noticia_data.titulo}`}
                  />
                </View>
              </Pressable>
            ))
          )
        ) : posturasQ.isLoading ? (
          <Text style={{ color: c.textSecondary }}>Cargando...</Text>
        ) : posturas.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Aun no guardaste posturas. Entra a un candidato y toca "Guardar" en una postura.
            </Text>
          </View>
        ) : (
          posturas.map((b) => (
            <View key={b.id} style={styles.card}>
              <Text style={styles.cardMeta}>
                {b.postura_data.candidato_nombre_completo ?? "Candidato"}
                {b.postura_data.eje_tematico_display
                  ? ` \u00b7 ${b.postura_data.eje_tematico_display}`
                  : ""}
              </Text>
              <Text style={styles.cardTitle}>{b.postura_data.pregunta_texto}</Text>
              <Text style={styles.cardBody}>
                Respondio: <Text style={{ color: c.text, fontWeight: "600" }}>
                  {b.postura_data.opcion_respuesta_texto}
                </Text>
              </Text>
              <View style={styles.row}>
                <View />
                <BookmarkButton
                  saved
                  onPress={() => togglePostura.mutate(b.postura)}
                  loading={togglePostura.isPending}
                  accessibilityLabel="Quitar postura guardada"
                />
              </View>
            </View>
          ))
        )}

        <View style={{ height: 12 }} />
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </ScrollView>
    </View>
  );
}
