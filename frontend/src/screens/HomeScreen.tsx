/**
 * Home HUB: dashboard central de la app.
 *
 * Basado en design-system-lowfi.html · Home HUB (rediseno 2026-07-28).
 * Estructura:
 *   1. TopBar (brand + notif)
 *   2. Greeting (title + subtitle)
 *   3. Section "Tus elecciones" — cards de progreso del cuestionario
 *   4. Section "Tus mejores matches" — hero cards por eleccion completada
 *   5. Divider
 *   6. Section "Novedades" (feed mixto: noticias + acciones sugeridas)
 *
 * Data model: 1 sola query agregada (`useMisElecciones`) trae total/respondidas/
 * completa + top_match por cada tipo. Antes hacia N queries de matches + M de
 * preguntas — escalaba mal con el numero de elecciones.
 *
 * Modo guest: no llama al endpoint agregado (requiere auth). Se apoya en el
 * catalogo (`useTiposEleccion`) y en el flujo local del cuestionario para
 * responder + calcular match anonimo.
 */

import { SHOW_NOTICIAS } from "../constants/features";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import type { BreakdownPorEje, MiProgresoItem, TipoEleccion } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import {
  useMisElecciones,
  useNoticiasFeed,
  usePerfil,
  useReiniciarCuestionario,
  useTiposEleccion,
} from "../api/hooks";
import {
  AppShell,
  CoachMarkTour,
  ConfirmModal,
  ElectionCard,
  ElectionCardAdd,
  HomeGreeting,
  HomeTopBar,
  MatchSummaryCard,
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

/**
 * Indexa el resumen del backend por tipo_eleccion_id. Puro y O(N).
 * Devuelve un Map porque la lookup posterior por id es O(1).
 */
function indexProgresoByTipo(
  items: MiProgresoItem[] | undefined,
): Map<number, MiProgresoItem> {
  const m = new Map<number, MiProgresoItem>();
  if (!items) return m;
  for (const it of items) m.set(it.tipo_eleccion_id, it);
  return m;
}

// -- Screen ----------------------------------------------------------------

export function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  const c = useThemeColors();
  // F18: email ya no viene en el login response. Lo obtenemos de usePerfil().
  // React Query lo cachea, asi que el GET /perfil/ que ya hace PerfilScreen
  // alimenta este saludo sin request adicional en la mayoria de los casos.
  const perfilQ = usePerfil();
  const email = perfilQ.data?.email ?? null;
  const isGuest = useAuthStore((s) => s.isGuest);
  const activeTipoId = useCuestionarioStore((s) => s.tipoEleccionId);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const electionsActiveIds = useElectionsPrefsStore((s) => s.activeIds);
  const toast = useToast();

  const { data: tipos = [], isLoading: tiposLoading, error } = useTiposEleccion();
  // Guest no dispara el query (enabled: isAuth). En modo guest el Home muestra
  // solo el catalogo + el CTA para responder — no hay resumen persistido.
  const { data: progresoItems } = useMisElecciones();
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

  // Solo elecciones activadas por el user (client-side pref sobre catalogo).
  const { activas: tiposActivos } = useMemo(
    () => partitionTipos(tipos, electionsActiveIds),
    [tipos, electionsActiveIds],
  );

  const activeId = activeTipoId ?? tiposActivos[0]?.id ?? null;

  // Indexa el resumen por tipoId para lookup O(1) al pintar cada card.
  const progresoByTipo = useMemo(
    () => indexProgresoByTipo(progresoItems),
    [progresoItems],
  );

  // Lista de hero cards "Tus mejores matches": solo items del user con
  // cuestionario COMPLETO y top_match resuelto, filtrados por elecciones
  // activas. El backend ya filtra los top_match por completitud (ver
  // mi_progreso.py), pero repetimos el chequeo aca como defense in depth:
  // si algun dev toca el endpoint sin cuidado, la UI no vuelve a mostrar
  // "matches fantasma" en cuestionarios no contestados. activeIds=null
  // significa "todas activas" (default pre-primera edicion del user).
  const mejoresMatches = useMemo(() => {
    if (!progresoItems) return [];
    return progresoItems.filter(
      (it) =>
        it.completa === true &&
        it.top_match !== null &&
        (electionsActiveIds === null ||
          electionsActiveIds.includes(it.tipo_eleccion_id)),
    );
  }, [progresoItems, electionsActiveIds]);

  // Al tocar una card: carga preguntas y decide destino.
  //   - Auth + completa: va directo a Resultados (evita cuestionario vacio).
  //   - Guest o incompleta: va al Cuestionario.
  //
  // Antes se derivaba de `preguntas.length === 0` post-load. Ahora usamos el
  // flag `completa` del backend que es la fuente de verdad y evita el race
  // condition donde el store aun no habia cargado.
  async function iniciarCuestionario(tipo: TipoEleccion) {
    if (!tipo.id) return;
    const progreso = progresoByTipo.get(tipo.id);
    const yaCompleto = !isGuest && progreso?.completa === true;
    try {
      if (yaCompleto) {
        await loadForTipoEleccion(tipo.id);
        navigation.navigate("Resultados");
        return;
      }
      await loadForTipoEleccion(tipo.id);
      navigation.navigate("Cuestionario");
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

  // Construyo Novedades: accion sugerida (si hay tipo sin cuestionario) + noticias reales.
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

  if (SHOW_NOTICIAS) {
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
  }); // end noticias.slice
  } // end if (SHOW_NOTICIAS)

  return (
    <>
      <AppShell active="home" navigation={navigation}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <HomeTopBar
            brand="Tinder Decisivo"
            onNotifications={SHOW_NOTICIAS ? () => navigation.navigate("Noticias") : undefined}
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
                {tiposActivos.map((tipo) => {
                  const progreso = tipo.id
                    ? progresoByTipo.get(tipo.id)
                    : undefined;
                  const isActive = tipo.id === activeId;
                  // Modo auth: usamos progreso agregado (respondidas + total).
                  // Modo guest: no hay progreso persistido -> card pending.
                  const isCompleted = progreso?.completa;
                  return (
                    <ElectionCard
                      key={tipo.id}
                      name={tipo.nombre}
                      isCompleted={isCompleted}
                      respondidas={progreso?.respondidas}
                      totalPreguntas={progreso?.total_preguntas}
                      variant={
                        isActive
                          ? "active"
                          : isCompleted
                            ? "secondary"
                            : "pending"
                      }
                      onPress={() => iniciarCuestionario(tipo)}
                    />
                  );
                })}
                <ElectionCardAdd
                  label="+ Activar otra elección"
                  onPress={() => navigation.navigate("GestionElecciones")}
                />
              </ScrollView>
            </View>
          )}

          {mejoresMatches.length > 0 ? (
            <View>
              <SectionTitle title="Tus mejores matches" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.strip}
                style={{ marginTop: spacing.sp3 }}
              >
                {mejoresMatches.map((item) => {
                  const top = item.top_match!;
                  const candidato = top.candidato;
                  const nombre = `${candidato.nombre} ${candidato.apellido ?? ""}`.trim();
                  return (
                    <MatchSummaryCard
                      key={item.tipo_eleccion_id}
                      candidatoNombre={nombre}
                      candidatoFotoUrl={candidato.profile_picture ?? null}
                      tipoEleccionNombre={item.tipo_eleccion_nombre}
                      matchPercent={Number(top.match_percentage)}
                      preguntasConsideradas={top.preguntas_consideradas}
                      totalPreguntas={item.total_preguntas}
                      onVerPerfil={() =>
                        navigation.navigate("DetalleCandidato", {
                          candidatoId: candidato.id!,
                          breakdown:
                            (top.breakdown_por_eje as BreakdownPorEje | null) ??
                            null,
                          matchPct: Number(top.match_percentage),
                          confianza: top.confianza ?? null,
                        })
                      }
                    />
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {novedades.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View>
                <SectionTitle
                  title="Novedades"
                  actionLabel={SHOW_NOTICIAS ? "Ver todas" : undefined}
                  onAction={SHOW_NOTICIAS ? () => navigation.navigate("Noticias") : undefined}
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

      <CoachMarkTour tourId="home" />
    </>
  );
}
