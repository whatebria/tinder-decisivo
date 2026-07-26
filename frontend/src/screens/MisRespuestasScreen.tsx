/**
 * MisRespuestasScreen: lista todas las respuestas del user para un tipo de
 * eleccion, agrupadas por eje tematico. Tap en una card abre modal de edicion.
 *
 * Recibe { tipoEleccionId } por route params. Si no hay respuestas todavia,
 * muestra empty state con CTA a completar el cuestionario.
 *
 * Migrado a Fase 5:
 *   - Fuera Tamagui, todo con React Native + DS + tokens
 *   - AppShell con active=null (screen polimorfica accedida desde Config)
 *   - ScreenTopBar con back button + subtitle dinamico con conteo
 *   - EmptyState (organism) para caso sin respuestas
 *   - Cards inline (patron unico de "respuesta editable", no reusable)
 */

import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "../api/client";
import type { MiRespuesta } from "../api/endpoints";
import { useMisRespuestas, useUpdateRespuesta } from "../api/hooks";
import {
  AppShell,
  EditarRespuestaModal,
  EmptyState,
  ScreenTopBar,
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

export function MisRespuestasScreen({
  navigation,
  route,
}: RootStackScreenProps<"MisRespuestas">) {
  const { tipoEleccionId } = route.params;
  const c = useThemeColors();
  const respuestasQ = useMisRespuestas(tipoEleccionId);
  const update = useUpdateRespuesta(tipoEleccionId);
  const toast = useToast();
  const [editando, setEditando] = useState<MiRespuesta | null>(null);

  // Agrupamos por eje para la UI.
  const agrupadas = useMemo(() => {
    const items = respuestasQ.data ?? [];
    const map = new Map<string, { display: string; items: MiRespuesta[] }>();
    for (const r of items) {
      const key = r.eje_tematico;
      if (!map.has(key)) {
        map.set(key, { display: r.eje_tematico_display || key, items: [] });
      }
      map.get(key)!.items.push(r);
    }
    return Array.from(map.values());
  }, [respuestasQ.data]);

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

  const total = respuestasQ.data?.length ?? 0;
  const subtitle =
    total > 0
      ? `${total} pregunta${total === 1 ? "" : "s"} respondida${total === 1 ? "" : "s"}`
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

          {respuestasQ.isLoading ? (
            <View style={styles.loadingBox}>
              <Spinner size="large" />
            </View>
          ) : total === 0 ? (
            <EmptyState
              icon="info"
              title="Todavia no respondiste esta eleccion"
              description="Completa el cuestionario para ver y editar tus respuestas aqui."
              actionLabel="Volver al inicio"
              onAction={() => navigation.goBack()}
            />
          ) : (
            <>
              <Text style={[styles.intro, { color: c.textSecondary }]}>
                Toca cualquier pregunta para modificar tu respuesta.
              </Text>

              <View style={styles.groups}>
                {agrupadas.map((grupo) => (
                  <View key={grupo.display} style={styles.group}>
                    <Text
                      style={[styles.groupTitle, { color: c.textSecondary }]}
                    >
                      {grupo.display}
                    </Text>
                    <View style={styles.groupItems}>
                      {grupo.items.map((r) => {
                        const opActual = r.opciones.find(
                          (o) => o.id === r.opcion_elegida,
                        );
                        return (
                          <Pressable
                            key={r.id}
                            style={({ pressed }) => [
                              styles.card,
                              {
                                backgroundColor: c.card,
                                borderColor: c.border,
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                            onPress={() => setEditando(r)}
                            accessibilityLabel={`Editar respuesta: ${r.pregunta_texto}`}
                            accessibilityRole="button"
                          >
                            <Text
                              style={[styles.pregunta, { color: c.text }]}
                            >
                              {r.pregunta_texto}
                            </Text>
                            <View style={styles.metaRow}>
                              <Text
                                style={[styles.opActual, { color: c.primary }]}
                              >
                                {opActual?.texto ?? "(opcion desconocida)"}
                              </Text>
                              <Text
                                style={[styles.metaSep, { color: c.textTertiary }]}
                              >
                                ·
                              </Text>
                              <Text
                                style={[styles.metaPeso, { color: c.textSecondary }]}
                              >
                                {PESO_LABELS[r.peso] ?? `peso ${r.peso}`}
                              </Text>
                            </View>
                            <Text
                              style={[styles.hint, { color: c.textTertiary }]}
                            >
                              Toca para editar
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
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
      </View>
    </AppShell>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: spacing.sp4,
    paddingBottom: spacing.sp7,
    gap: spacing.sp4,
  },
  intro: typography.small,

  loadingBox: {
    alignItems: "center",
    padding: spacing.sp5,
  },

  groups: { gap: spacing.sp5 },
  group: { gap: spacing.sp2 },
  groupTitle: {
    ...typography.overline,
    fontWeight: "600",
  },
  groupItems: { gap: spacing.sp2 },

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
