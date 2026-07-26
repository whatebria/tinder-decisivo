/**
 * MisRespuestasScreen: HUB de todas las respuestas del cuestionario, agrupadas
 * por tipo de eleccion y por eje tematico dentro de cada tipo.
 *
 * Layout basado en design-system-lowfi.html `tpl-respuestas` (Template 10):
 *   - ScreenTopBar con back + subtitle con conteo total
 *   - Chips filtro por tipo de eleccion (Todas / Presidencial / Municipal / ...)
 *   - Por cada tipo: seccion con grupos por eje, cada respuesta como card
 *     tap-able que abre EditarRespuestaModal
 *   - Seccion final "Reiniciar cuestionario" con NavRow variant="danger" por
 *     tipo (accion destructiva, dispara ConfirmModal). Movido desde
 *     ConfiguracionScreen para consolidar todas las acciones de respuestas
 *     en un solo lugar.
 *
 * Fetch: usa `useMisRespuestasMultiple` (useQueries por tipo). Como el
 * backend no expone un endpoint agregado, corremos 1 fetch por tipo en
 * paralelo. React Query los cachea y desduplica.
 *
 * Fuera de scope: progress bars por bloque (requeririan saber "total de
 * preguntas por tipo", metadata que hoy no viaja al frontend). Chips filtro
 * por bloque (base/extras) — nuestro backend no distingue, solo agrupa por
 * eje tematico.
 */

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import type { MiRespuesta, TipoEleccion } from "../api/endpoints";
import {
  useMisRespuestasMultiple,
  useReiniciarCuestionario,
  useTiposEleccion,
  useUpdateRespuesta,
} from "../api/hooks";
import {
  AppShell,
  Button,
  Chip,
  ConfirmModal,
  EditarRespuestaModal,
  EmptyState,
  ScreenTopBar,
  SectionTitle,
  Spinner,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

const PESO_LABELS: Record<number, string> = {
  0: "No me importa",
  1: "Poco importante",
  2: "Importante",
  3: "Muy importante",
};

/** "Todas" cuando no hay filtro por tipo. */
const FILTRO_TODAS: number | "todas" = "todas";

export function MisRespuestasScreen({
  navigation,
}: RootStackScreenProps<"MisRespuestas">) {
  const c = useThemeColors();
  const toast = useToast();

  const { data: tipos = [] } = useTiposEleccion();
  const tipoIds = useMemo(
    () => tipos.map((t) => t.id).filter((id): id is number => id != null),
    [tipos],
  );
  const respuestasPorTipo = useMisRespuestasMultiple(tipoIds);
  const update = useUpdateRespuesta();
  const reiniciar = useReiniciarCuestionario();

  const [filtroTipo, setFiltroTipo] = useState<number | "todas">(FILTRO_TODAS);
  const [editando, setEditando] = useState<MiRespuesta | null>(null);
  const [tipoAReiniciar, setTipoAReiniciar] = useState<TipoEleccion | null>(
    null,
  );

  // -- Derivados ------------------------------------------------------------

  const isLoading = respuestasPorTipo.some((r) => r.isLoading);
  const totalRespuestas = respuestasPorTipo.reduce(
    (acc, r) => acc + (r.data?.length ?? 0),
    0,
  );

  /** Tipos visibles segun el filtro. Cada uno con sus respuestas cargadas. */
  const tiposVisibles = useMemo(() => {
    return tipos
      .filter((t) => t.id != null)
      .filter((t) => filtroTipo === FILTRO_TODAS || t.id === filtroTipo)
      .map((tipo) => {
        const bucket = respuestasPorTipo.find(
          (r) => r.tipoEleccionId === tipo.id,
        );
        return {
          tipo,
          respuestas: bucket?.data ?? [],
        };
      })
      .filter((entry) => entry.respuestas.length > 0);
  }, [tipos, filtroTipo, respuestasPorTipo]);

  /**
   * Tipo elegible para reiniciar desde el header. Es "claro" cuando:
   *   - el user filtro por un tipo especifico, o
   *   - solo hay un tipo con respuestas.
   * Si esta en "Todas" y hay 2+ tipos con datos, no mostramos el boton
   * (seria ambiguo cual reiniciar sin agregar un modal selector).
   */
  const tipoActivoParaReiniciar = useMemo<TipoEleccion | null>(() => {
    if (filtroTipo !== FILTRO_TODAS) {
      return tipos.find((t) => t.id === filtroTipo) ?? null;
    }
    if (tiposVisibles.length === 1) {
      return tiposVisibles[0].tipo;
    }
    return null;
  }, [filtroTipo, tipos, tiposVisibles]);

  // -- Handlers -------------------------------------------------------------

  async function handleSave(opcionId: number, peso: number) {
    if (!editando) return;
    try {
      await update.mutateAsync({
        respuestaId: editando.id,
        opcionId,
        peso,
      });
      toast.success(
        "Respuesta actualizada",
        "Tu ranking se va a recalcular la proxima vez que veas tus matches.",
      );
      setEditando(null);
    } catch (err) {
      toast.error("No pudimos guardar", getErrorMessage(err));
    }
  }

  async function handleConfirmReiniciar() {
    if (!tipoAReiniciar?.id) return;
    try {
      const result = await reiniciar.mutateAsync(tipoAReiniciar.id);
      toast.success(
        "Cuestionario reiniciado",
        `Se borraron ${result.respuestas_borradas} respuestas. Tus favoritos y voto siguen ahí.`,
      );
      setTipoAReiniciar(null);
    } catch (err) {
      toast.error(
        "No pudimos reiniciar el cuestionario",
        getErrorMessage(err),
      );
    }
  }

  // -- Render ---------------------------------------------------------------

  const subtitle =
    totalRespuestas > 0
      ? `${totalRespuestas} pregunta${totalRespuestas === 1 ? "" : "s"} respondida${totalRespuestas === 1 ? "" : "s"}`
      : "Sin respuestas todavia";

  return (
    <AppShell active={null} navigation={navigation}>
      <View style={[styles.root, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenTopBar
            title="Mis respuestas"
            subtitle={subtitle}
            onBack={() => navigation.goBack()}
          />

          {isLoading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
          ) : totalRespuestas === 0 ? (
            <EmptyState
              icon="info"
              title="Todavia no respondiste ningun cuestionario"
              description="Completa un cuestionario desde el inicio para ver y editar tus respuestas aqui."
              actionLabel="Ir al inicio"
              onAction={() => navigation.navigate("Home")}
            />
          ) : (
            <>
              {/* Chips filtro por tipo */}
              {tipos.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsRow}
                >
                  <Chip
                    active={filtroTipo === FILTRO_TODAS}
                    onPress={() => setFiltroTipo(FILTRO_TODAS)}
                  >
                    Todas
                  </Chip>
                  {tipos.map((t) =>
                    t.id != null ? (
                      <Chip
                        key={t.id}
                        active={filtroTipo === t.id}
                        onPress={() => setFiltroTipo(t.id!)}
                      >
                        {t.nombre}
                      </Chip>
                    ) : null,
                  )}
                </ScrollView>
              ) : null}

              <View style={styles.introRow}>
                <Text style={[styles.intro, { color: c.textSecondary }]}>
                  Toca cualquier pregunta para modificar tu respuesta.
                </Text>
                {tipoActivoParaReiniciar ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setTipoAReiniciar(tipoActivoParaReiniciar)}
                    accessibilityLabel={`Reiniciar cuestionario ${tipoActivoParaReiniciar.nombre}`}
                  >
                    Reiniciar cuestionario
                  </Button>
                ) : null}
              </View>

              {/* Secciones por tipo -> grupos por eje -> cards */}
              <View style={styles.tipos}>
                {tiposVisibles.map(({ tipo, respuestas }) => (
                  <TipoSeccion
                    key={tipo.id}
                    tipoNombre={tipo.nombre}
                    respuestas={respuestas}
                    onEditar={setEditando}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <EditarRespuestaModal
          visible={editando !== null}
          respuesta={editando}
          loading={update.isPending}
          onCancel={() => setEditando(null)}
          onSubmit={handleSave}
        />

        <ConfirmModal
          visible={tipoAReiniciar !== null}
          title="¿Empezar de nuevo?"
          message={
            tipoAReiniciar
              ? `Esto borra tus respuestas y tu ranking calculado para "${tipoAReiniciar.nombre}". Tus favoritos, descartados y voto final se mantienen.`
              : ""
          }
          confirmLabel="Sí, borrar y empezar de nuevo"
          cancelLabel="Cancelar"
          variant="danger"
          loading={reiniciar.isPending}
          onConfirm={handleConfirmReiniciar}
          onCancel={() => setTipoAReiniciar(null)}
        />
      </View>
    </AppShell>
  );
}

// ---------- Sub-componentes locales --------------------------------------

interface TipoSeccionProps {
  tipoNombre: string;
  respuestas: MiRespuesta[];
  onEditar: (r: MiRespuesta) => void;
}

/**
 * Renderiza una seccion de un tipo de eleccion: cabecera con el nombre del
 * tipo + grupos internos por eje tematico + cards editables. La accion de
 * reiniciar vive en el header global (junto al texto intro), no aca —
 * evita que se repita 1 vez por seccion cuando hay varios tipos.
 */
function TipoSeccion({ tipoNombre, respuestas, onEditar }: TipoSeccionProps) {
  const c = useThemeColors();

  // Agrupamos por eje dentro del tipo.
  const grupos = useMemo(() => {
    const map = new Map<string, { display: string; items: MiRespuesta[] }>();
    for (const r of respuestas) {
      const key = r.eje_tematico;
      if (!map.has(key)) {
        map.set(key, { display: r.eje_tematico_display || key, items: [] });
      }
      map.get(key)!.items.push(r);
    }
    return Array.from(map.values());
  }, [respuestas]);

  return (
    <View style={styles.tipoBlock}>
      <SectionTitle title={tipoNombre} />
      <View style={styles.gruposEje}>
        {grupos.map((grupo) => (
          <View key={grupo.display} style={styles.grupoEje}>
            <Text style={[styles.grupoEjeTitle, { color: c.textSecondary }]}>
              {grupo.display}
            </Text>
            <View style={styles.grupoItems}>
              {grupo.items.map((r) => (
                <RespuestaCard
                  key={r.id}
                  respuesta={r}
                  onPress={() => onEditar(r)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface RespuestaCardProps {
  respuesta: MiRespuesta;
  onPress: () => void;
}

/**
 * Card individual de una respuesta editable. Muestra pregunta + opcion
 * actual + peso. Tap abre el modal de edicion.
 *
 * Patron unico (no reusable) — no promuevo a molecule sin un segundo uso.
 */
function RespuestaCard({ respuesta, onPress }: RespuestaCardProps) {
  const c = useThemeColors();
  const opActual = respuesta.opciones.find(
    (o) => o.id === respuesta.opcion_elegida,
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      accessibilityLabel={`Editar respuesta: ${respuesta.pregunta_texto}`}
      accessibilityRole="button"
    >
      <Text style={[styles.pregunta, { color: c.text }]}>
        {respuesta.pregunta_texto}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.opActual, { color: c.primary }]}>
          {opActual?.texto ?? "(opcion desconocida)"}
        </Text>
        <Text style={[styles.metaSep, { color: c.textTertiary }]}>·</Text>
        <Text style={[styles.metaPeso, { color: c.textSecondary }]}>
          {PESO_LABELS[respuesta.peso] ?? `peso ${respuesta.peso}`}
        </Text>
      </View>
      <Text style={[styles.hint, { color: c.textTertiary }]}>
        Toca para editar
      </Text>
    </Pressable>
  );
}

// ---------- Styles -------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp4,
  },
  intro: {
    ...typography.small,
    flexShrink: 1,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sp3,
  },

  loadingBox: {
    alignItems: "center",
    padding: spacing.sp5,
  },

  chipsRow: {
    gap: spacing.sp2,
    paddingVertical: spacing.sp1,
  },

  tipos: { gap: spacing.sp6 },
  tipoBlock: { gap: spacing.sp3 },
  gruposEje: { gap: spacing.sp4 },
  grupoEje: { gap: spacing.sp2 },
  grupoEjeTitle: {
    ...typography.overline,
    fontWeight: "600",
  },
  grupoItems: { gap: spacing.sp2 },

  card: {
    padding: spacing.sp4,
    borderRadius: radii.rMd,
    borderWidth: 1,
    gap: spacing.sp2,
  },
  pregunta: {
    ...typography.body,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sp2,
    alignItems: "center",
    flexWrap: "wrap",
  },
  opActual: {
    ...typography.small,
    fontWeight: "700",
  },
  metaSep: typography.small,
  metaPeso: typography.small,
  hint: typography.overline,
});
