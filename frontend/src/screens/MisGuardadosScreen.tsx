/**
 * MisGuardadosScreen: vista consolidada de TODO lo que el usuario guardo.
 *
 * Basado en wireframe #11 (design-system-lowfi.html tpl-guardados) + decision
 * de producto: incluye Noticias como 4to tab (el wireframe original solo
 * mencionaba 3, pero mantenemos noticias descubribles aca).
 *
 * Tabs:
 *   - Favoritos: candidatos marcados como interesantes
 *   - Descartados: candidatos ocultos del ranking (con opcion restaurar)
 *   - Posturas: posturas puntuales de candidatos que guardaste
 *   - Noticias: articulos guardados del feed
 *
 * Filtro por eleccion (chips) encima de los tabs. Por ahora solo "Todas"
 * tiene efecto; el filtrado por tipo de eleccion queda como TODO cuando el
 * backend exponga el field consistentemente en todas las shapes.
 */

import React, { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { SHOW_NOTICIAS } from "../constants/features";
import {
  useDescartados,
  useFavoritos,
  useNoticiasBookmarks,
  usePosturasBookmarks,
  useToggleDescartado,
  useToggleFavorito,
  useToggleNoticiaBookmark,
  useTogglePosturaBookmark,
  useTiposEleccion,
} from "../api/hooks";
import {
  AppShell,
  Avatar,
  BookmarkButton,
  Button,
  Chip,
  CoachMarkTour,
  EmptyState,
  ScreenTopBar,
  Spinner,
  Tabs,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import { iniciales, nombreCompleto } from "../utils/candidato";

type GuardadoTab = "favoritos" | "descartados" | "posturas" | "noticias";

/** Filtro por eleccion. `null` = "Todas". */
type EleccionFilter = number | null;

/**
 * Shape local (subset del modelo Candidato) porque los bookmarks traen los
 * datos embebidos con campos opcionales. Compatible con el `CandidatoLike`
 * del helper `utils/candidato`.
 */
interface CandidatoLike {
  id?: number;
  nombre?: string;
  apellido?: string;
  partido?: string | null;
}

/**
 * Wrap del helper compartido con fallback UX-friendly para esta screen:
 * si el bookmark no trajo nombre/apellido, mostramos "Candidato" en vez
 * de string vacio (evita labels de accesibilidad como "Ver detalle de ").
 */
function nombreParaCard(c: CandidatoLike): string {
  return nombreCompleto(c) || "Candidato";
}

export function MisGuardadosScreen({
  navigation,
}: RootStackScreenProps<"MisGuardados">) {
  const c = useThemeColors();
  const toast = useToast();

  const [tab, setTab] = useState<GuardadoTab>("favoritos");
  const [eleccionFilter, setEleccionFilter] = useState<EleccionFilter>(null);

  const tiposQ = useTiposEleccion();
  const favoritosQ = useFavoritos();
  const descartadosQ = useDescartados();
  const posturasQ = usePosturasBookmarks();
  const noticiasQ = useNoticiasBookmarks();

  const toggleFav = useToggleFavorito();
  const toggleDesc = useToggleDescartado();
  const togglePos = useTogglePosturaBookmark();
  const toggleNot = useToggleNoticiaBookmark();

  const favoritos = favoritosQ.data ?? [];
  const descartados = descartadosQ.data ?? [];
  const posturas = posturasQ.data ?? [];
  const noticias = noticiasQ.data ?? [];

  // Elecciones para el filtro (chips). "Todas" siempre visible.
  const eleccionesChips = useMemo(
    () => tiposQ.data ?? [],
    [tiposQ.data],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: c.bg },
        topBarWrapper: { paddingHorizontal: spacing.sp4 },
        content: {
          paddingHorizontal: spacing.sp4,
          paddingBottom: spacing.sp7,
          gap: spacing.sp3,
        },
        filterRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp2,
          paddingVertical: spacing.sp2,
        },
        filterLabel: { ...typography.overline, textTransform: "none", letterSpacing: 0, color: c.textSecondary },
        filterChips: {
          flexDirection: "row",
          gap: spacing.sp1,
          flex: 1,
        },
        card: {
          backgroundColor: c.card,
          borderRadius: radii.rMd,
          padding: spacing.sp3,
          borderWidth: 1,
          borderColor: c.border,
          gap: spacing.sp2,
        },
        candidatoRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp3,
        },
        candidatoCol: { flex: 1, gap: spacing.sp1 },
        candidatoName: { ...typography.body, fontWeight: "700", color: c.text },
        candidatoMeta: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sp1,
        },
        candidatoMetaText: { ...typography.overline, textTransform: "none", letterSpacing: 0, color: c.textSecondary },
        cardTitle: { ...typography.body, fontWeight: "700", color: c.text },
        cardMeta: { ...typography.overline, textTransform: "none", letterSpacing: 0, color: c.textSecondary },
        cardBody: { ...typography.small, color: c.textSecondary },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.sp2,
        },
        loadingBox: { alignItems: "center", padding: spacing.sp5 },
      }),
    [c],
  );

  function initials(nombre?: string, apellido?: string): string {
    return iniciales({ nombre, apellido });
  }
  function renderCandidatoCard(
    key: string,
    cand: CandidatoLike,
    trailing: React.ReactNode,
  ) {
    return (
      <View key={key} style={styles.card}>
        <View style={styles.candidatoRow}>
          <Avatar size="md" initials={initials(cand.nombre, cand.apellido)} />
          <Pressable
            style={styles.candidatoCol}
            onPress={() =>
              cand.id != null &&
              navigation.navigate("DetalleCandidato", {
                candidatoId: cand.id,
                breakdown: null,
                // Desde Mis guardados no traemos el match calculado; el detalle
                // muestra el empty state (o dispara el calculo el mismo).
                matchPct: null,
                confianza: null,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${nombreParaCard(cand)}`}
          >
            <Text style={styles.candidatoName} numberOfLines={1}>
              {nombreParaCard(cand)}
            </Text>
            {cand.partido ? (
              <View style={styles.candidatoMeta}>
                <Text style={styles.candidatoMetaText}>{cand.partido}</Text>
              </View>
            ) : null}
          </Pressable>
          {trailing}
        </View>
      </View>
    );
  }

  function renderFavoritos() {
    if (favoritosQ.isLoading) return <Spinner size="large" />;
    if (favoritos.length === 0) {
      return (
        <EmptyState
          icon="heart"
          title="Aun no tienes favoritos"
          description="Toca Favorito en el ranking para guardar candidatos aca."
          actionLabel="Ver ranking"
          onAction={() => navigation.goBack()}
        />
      );
    }
    return favoritos.map((f) => {
      const cand = f.candidato_data ?? {};
      if (cand.id == null) return null;
      return renderCandidatoCard(
        `fav-${f.id}`,
        cand,
        <BookmarkButton
          saved
          onPress={() => cand.id != null && handleQuitarFav(cand.id)}
          loading={toggleFav.isPending}
          accessibilityLabel={`Quitar de favoritos: ${nombreParaCard(cand)}`}
        />,
      );
    });
  }

  function renderDescartados() {
    if (descartadosQ.isLoading) return <Spinner size="large" />;
    if (descartados.length === 0) {
      return (
        <EmptyState
          icon="close"
          title="No hay descartados"
          description="Aca aparecen los candidatos que ocultaste del ranking."
        />
      );
    }
    return descartados.map((d) => {
      const cand = d.candidato_data ?? {};
      if (cand.id == null) return null;
      return renderCandidatoCard(
        `desc-${d.id}`,
        cand,
        <Button
          variant="secondary"
          size="sm"
          onPress={() => cand.id != null && handleRestoreDesc(cand.id)}
          accessibilityLabel={`Restaurar ${nombreParaCard(cand)} al ranking`}
        >
          Restaurar
        </Button>,
      );
    });
  }

  function renderPosturas() {
    if (posturasQ.isLoading) return <Spinner size="large" />;
    if (posturas.length === 0) {
      return (
        <EmptyState
          icon="bookmark"
          title="Sin posturas guardadas"
          description="Entra a un candidato y toca Guardar en una postura para verla aca."
        />
      );
    }
    return posturas.map((b) => (
      <View key={`pos-${b.id}`} style={styles.card}>
        <Text style={styles.cardMeta}>
          {b.postura_data.candidato_nombre_completo ?? "Candidato"}
          {b.postura_data.eje_tematico_display
            ? ` · ${b.postura_data.eje_tematico_display}`
            : ""}
        </Text>
        <Text style={styles.cardTitle}>{b.postura_data.pregunta_texto}</Text>
        <Text style={styles.cardBody}>
          Respondio:{" "}
          <Text style={{ color: c.text, fontWeight: "600" }}>
            {b.postura_data.opcion_respuesta_texto}
          </Text>
        </Text>
        <View style={styles.row}>
          <View />
          <BookmarkButton
            saved
            onPress={() =>
              // BUG-022: callbacks de toast para no fallar silenciosamente
              togglePos.mutate(b.postura, {
                onSuccess: () => toast.success("Postura eliminada", "Se quitó de tus guardados."),
                onError: (e) => toast.error("No pudimos quitar la postura", getErrorMessage(e)),
              })
            }
            loading={togglePos.isPending}
            accessibilityLabel="Quitar postura guardada"
          />
        </View>
      </View>
    ));
  }

  function renderNoticias() {
    if (noticiasQ.isLoading) return <Spinner size="large" />;
    if (noticias.length === 0) {
      return (
        <EmptyState
          icon="news"
          title="Sin noticias guardadas"
          description="Toca Guardar en el feed de noticias para leerlas despues."
          actionLabel="Ir a noticias"
          onAction={() => navigation.navigate("Noticias")}
        />
      );
    }
    return noticias.map((b) => (
      <Pressable
        key={`not-${b.id}`}
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
            onPress={() =>
              // BUG-022: callbacks de toast para no fallar silenciosamente
              toggleNot.mutate(b.noticia, {
                onSuccess: () => toast.success("Noticia eliminada", "Se quitó de tus guardados."),
                onError: (e) => toast.error("No pudimos quitar la noticia", getErrorMessage(e)),
              })
            }
            loading={toggleNot.isPending}
            accessibilityLabel={`Quitar noticia guardada: ${b.noticia_data.titulo}`}
          />
        </View>
      </Pressable>
    ));
  }

  function handleQuitarFav(candidatoId: number) {
    toggleFav.mutate(candidatoId, {
      onSuccess: () => toast.success("Quitado de favoritos"),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  function handleRestoreDesc(candidatoId: number) {
    toggleDesc.mutate(candidatoId, {
      onSuccess: () => toast.success("Restaurado", "El candidato vuelve al ranking."),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  const currentBody = (() => {
    switch (tab) {
      case "favoritos":
        return renderFavoritos();
      case "descartados":
        return renderDescartados();
      case "posturas":
        return renderPosturas();
      case "noticias":
        return SHOW_NOTICIAS ? renderNoticias() : null;
    }
  })();

  return (
    <>
    <AppShell active={null} navigation={navigation}>
      <View style={styles.topBarWrapper}>
        <ScreenTopBar
          title="Mis guardados"
          subtitle="Todo lo que guardaste en un solo lugar."
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* BUG-021: chips de eleccion ocultados hasta que el backend exponga
            tipo_eleccion consistentemente en todos los bookmarks shapes.
            El estado eleccionFilter y la logica se conservan para cuando
            el filtrado este implementado. Ver BUG-021. */}

        <Tabs<GuardadoTab>
          scrollable
          items={[
            { value: "favoritos", label: "Favoritos", count: favoritos.length },
            { value: "descartados", label: "Descartados", count: descartados.length },
            { value: "posturas", label: "Posturas", count: posturas.length },
            ...(SHOW_NOTICIAS
              ? [{ value: "noticias" as const, label: "Noticias", count: noticias.length }]
              : []),
          ]}
          value={tab}
          onChange={(v) => setTab(v)}
        />

        {currentBody}
      </ScrollView>
    </AppShell>

      <CoachMarkTour tourId="guardados" />
    </>
  );
}
