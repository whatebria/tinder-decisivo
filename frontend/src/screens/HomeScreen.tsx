/**
 * Home HUB: dashboard central de la app.
 *
 * Basado en design-system-lowfi.html · Home HUB.
 * Estructura:
 *   1. TopBar (brand + notif)
 *   2. Greeting (title + subtitle)
 *   3. Section "Tus elecciones" + strip horizontal + link "Gestionar"
 *   4. Divider
 *   5. Section "Novedades" (feed mixto: noticias + acciones sugeridas)
 *
 * Multi-eleccion first-class: cada tipo activo es una card con match% + progreso.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import type { TipoEleccion } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import {
  useMatchesQuery,
  useNoticiasFeed,
  useReiniciarCuestionario,
  useTiposEleccion,
} from "../api/hooks";
import {
  AppShell,
  ConfirmModal,
  ElectionCard,
  ElectionCardAdd,
  HomeGreeting,
  HomeTopBar,
  NoticiaDetailSheet,
  NovedadesFeed,
  SectionTitle,
  Spinner,
  useToast,
  type NoticiaDetail,
  type NovedadFeedItem,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { partitionTipos, useElectionsPrefsStore } from "../store/electionsPrefs";
import { spacing } from "../theme/spacing";
import { useThemeColors } from "../theme/useTheme";
import { sanitizeSnippet } from "../utils/text";
import { noticiaToDetail } from "../utils/noticia";

// -- Helpers --------------------------------------------------------------

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function whenLabel(dateIso?: string): string {
  if (!dateIso) return "";
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  if (h < 1) return "hace un momento";
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  return `hace ${d}d`;
}

// -- Election card conectado (hace el query de matches por tipo) -----------

interface ConnectedCardProps {
  tipo: TipoEleccion;
  isActive: boolean;
  onPress: () => void;
}

function ElectionCardConnected({ tipo, isActive, onPress }: ConnectedCardProps) {
  const { data: matches = [], isLoading } = useMatchesQuery(tipo.id);
  const topMatch = matches[0];
  const matchPct = topMatch ? Number(topMatch.match_percentage) : null;
  const isCompleted = matches.length > 0;
  const progress = isCompleted ? 100 : 0;

  return (
    <ElectionCard
      name={tipo.nombre}
      isCompleted={isLoading ? undefined : isCompleted}
      matchPercent={isLoading ? null : matchPct}
      progressPercent={progress}
      pendingLabel={isLoading ? "Cargando…" : "Cuestionario pendiente"}
      variant={isActive ? "active" : isCompleted ? "secondary" : "pending"}
      onPress={onPress}
    />
  );
}

// -- Screen ----------------------------------------------------------------

export function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  const c = useThemeColors();
  const email = useAuthStore((s) => s.email);
  const isGuest = useAuthStore((s) => s.isGuest);
  const activeTipoId = useCuestionarioStore((s) => s.tipoEleccionId);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const electionsActiveIds = useElectionsPrefsStore((s) => s.activeIds);
  const toast = useToast();

  const { data: tipos = [], isLoading: tiposLoading, error } = useTiposEleccion();
  const { data: noticias = [] } = useNoticiasFeed();
  const reiniciar = useReiniciarCuestionario();

  const [tipoAReiniciar, setTipoAReiniciar] = useState<TipoEleccion | null>(null);
  const [selectedNoticia, setSelectedNoticia] = useState<NoticiaDetail | null>(null);

  const saludo = useMemo(() => {
    const base = greetingByHour();
    if (isGuest) return `${base}, invitado`;
    if (email) return `${base}, ${email.split("@")[0]}`;
    return base;
  }, [email, isGuest]);

  React.useEffect(() => {
    if (error) toast.error("Error cargando elecciones", getErrorMessage(error));
  }, [error, toast]);

  // "activo" = el que está en el store, o el primero si no hay ninguno.
  // Solo elecciones activadas por el user (client-side pref).
  const { activas: tiposActivos } = useMemo(
    () => partitionTipos(tipos, electionsActiveIds),
    [tipos, electionsActiveIds],
  );

  const activeId = activeTipoId ?? tiposActivos[0]?.id ?? null;

  // Al tocar una card: carga las preguntas y decide destino.
  //   - Si el user ya respondio todas (preguntas.length === 0 en auth), va a Resultados.
  //   - Si faltan preguntas (o es guest), va a Cuestionario.
  async function iniciarCuestionario(tipo: TipoEleccion) {
    if (!tipo.id) return;
    try {
      await loadForTipoEleccion(tipo.id);
      const preguntas = useCuestionarioStore.getState().preguntas;
      if (!isGuest && preguntas.length === 0) {
        navigation.navigate("Resultados");
      } else {
        navigation.navigate("Cuestionario");
      }
    } catch (err) {
      toast.error("No pudimos cargar las preguntas", getErrorMessage(err));
    }
  }

  async function handleConfirmReiniciar() {
    if (!tipoAReiniciar?.id) return;
    try {
      await reiniciar.mutateAsync(tipoAReiniciar.id);
      toast.success("Cuestionario reiniciado");
      setTipoAReiniciar(null);
    } catch (err) {
      toast.error("No pudimos reiniciar", getErrorMessage(err));
    }
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: c.bg },
        content: {
          padding: spacing.sp4,
          paddingBottom: spacing.sp8,
          gap: spacing.sp5,
        },
        loading: { paddingTop: spacing.sp8, alignItems: "center" },
        strip: { flexDirection: "row", gap: spacing.sp3, paddingBottom: 4 },
        divider: { height: 1, backgroundColor: c.border2, marginVertical: spacing.sp2 },
      }),
    [c],
  );

  if (tiposLoading) {
    return (
      <AppShell active="home" navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.loading}>
            <Spinner size="large" />
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  // Construyo Novedades: por ahora accion sugerida (si hay tipo sin cuestionario) + noticias reales.
  const tipoSinCuestionario = tiposActivos.find((t) => t.id && t.id !== activeId);
  const novedades: NovedadFeedItem[] = [];

  if (tipoSinCuestionario) {
    novedades.push({
      key: `action-${tipoSinCuestionario.id}`,
      kind: "action",
      icon: "bell",
      title: `Responde el cuestionario de ${tipoSinCuestionario.nombre}`,
      subtitle: "Descubre tu top match",
      ctaLabel: "Ir",
      onCta: () => iniciarCuestionario(tipoSinCuestionario),
    });
  }

  noticias.slice(0, 4).forEach((n) => {
    novedades.push({
      key: `noticia-${n.id}`,
      kind: "noticia",
      imageUrl: n.imagen_url,
      title: sanitizeSnippet(n.titulo),
      snippet: sanitizeSnippet(n.descripcion),
      category: n.fuente,
      when: whenLabel(n.fecha_publicacion),
      onPress: () =>
        setSelectedNoticia(
          noticiaToDetail(n, {
            when: whenLabel(n.fecha_publicacion),
            sentiment: "neutral",
          }),
        ),
    });
  });

  return (
    <>
      <AppShell active="home" navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <HomeTopBar
          brand="Tinder Decisivo"
          onNotifications={() => navigation.navigate("Noticias")}
        />

        <HomeGreeting
          title={saludo}
          subtitle="Explora las elecciones activas."
        />

        {tiposActivos.length === 0 ? (
          <HomeGreeting
            title=""
            subtitle="Aún no hay elecciones disponibles."
          />
        ) : (
          <View>
            <SectionTitle
              title={`Tus elecciones (${tiposActivos.length})`}
              actionLabel="Gestionar"
              onAction={() => navigation.navigate("GestionElecciones")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.strip}
              style={{ marginTop: spacing.sp3 }}
            >
              {tiposActivos.map((tipo) => (
                <ElectionCardConnected
                  key={tipo.id}
                  tipo={tipo}
                  isActive={tipo.id === activeId}
                  onPress={() => iniciarCuestionario(tipo)}
                />
              ))}
              <ElectionCardAdd
                label="+ Activar otra elección"
                onPress={() => navigation.navigate("GestionElecciones")}
              />
            </ScrollView>
          </View>
        )}

        {novedades.length > 0 ? (
          <>
            <View style={styles.divider} />
            <View>
              <SectionTitle
                title="Novedades"
                actionLabel="Ver todas"
                onAction={() => navigation.navigate("Noticias")}
              />
              <View style={{ marginTop: spacing.sp3 }}>
                <NovedadesFeed items={novedades} />
              </View>
            </View>
          </>
        ) : null}
        </ScrollView>
      </AppShell>

      <ConfirmModal
        visible={!!tipoAReiniciar}
        title="¿Reiniciar cuestionario?"
        message={`Vas a borrar tus respuestas de ${tipoAReiniciar?.nombre ?? ""}. No se puede deshacer.`}
        confirmLabel="Sí, reiniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmReiniciar}
        onCancel={() => setTipoAReiniciar(null)}
        variant="danger"
      />

      <NoticiaDetailSheet
        visible={selectedNoticia !== null}
        onClose={() => setSelectedNoticia(null)}
        noticia={selectedNoticia}
      />
    </>
  );
}
