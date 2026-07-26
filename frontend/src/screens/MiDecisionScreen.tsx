/**
 * MiDecisionScreen: muestra la(s) decision(es) final(es) del usuario por
 * tipo de eleccion. Permite eliminar la decision para cambiarla.
 *
 * Basado en design-system-lowfi.html — no tiene wireframe propio pero
 * sigue el patron de detail screen accedida desde Perfil / Configuracion:
 *   - ScreenTopBar (back + titulo)
 *   - Intro + lista de cards (una por eleccion) o EmptyState
 *   - Cada card muestra nombre eleccion + candidato + partido + CTA cambiar
 *
 * NO usa AppShell (no es un tab, se accede via nav desde Perfil).
 * Composicion 100% via DS + tokens (sin Tamagui).
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "../api/client";
import { useDecisiones, useDeleteDecision } from "../api/hooks";
import {
  Button,
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

export function MiDecisionScreen({
  navigation,
}: RootStackScreenProps<"MiDecision">) {
  const c = useThemeColors();
  const decisionesQ = useDecisiones();
  const deleteDecision = useDeleteDecision();
  const toast = useToast();

  const items = decisionesQ.data ?? [];

  function handleDelete(id: number) {
    deleteDecision.mutate(id, {
      onSuccess: () =>
        toast.success(
          "Decision eliminada",
          "Puedes elegir un nuevo candidato.",
        ),
      onError: (e) => toast.error("Error", getErrorMessage(e)),
    });
  }

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTopBar
          title="Mi voto final"
          subtitle="Tu decision guardada"
          onBack={() => navigation.goBack()}
        />

        <Text style={[styles.intro, { color: c.textSecondary }]}>
          Este es el candidato que elegiste para cada eleccion. Puedes cambiar
          tu decision cuando quieras.
        </Text>

        {decisionesQ.isLoading ? (
          <View style={styles.loadingBox}>
            <Spinner size="large" />
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            icon="check"
            title="Aun no elegiste un voto final"
            description={
              "Vuelve al ranking, entra al detalle de un candidato y toca " +
              '"Marcar como mi elegido".'
            }
            actionLabel="Ver ranking"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <View style={styles.list}>
            {items.map((d) => {
              const cand = d.candidato_data;
              if (!cand) return null;
              return (
                <View
                  key={d.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: c.card,
                      borderColor: c.primary,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.eleccionLabel, { color: c.textSecondary }]}>
                      {d.tipo_eleccion_nombre}
                    </Text>
                    <Text
                      style={[styles.candidatoName, { color: c.text }]}
                      numberOfLines={2}
                    >
                      {cand.nombre} {cand.apellido ?? ""}
                    </Text>
                    {cand.partido ? (
                      <Text style={[styles.partido, { color: c.textSecondary }]}>
                        {cand.partido}
                      </Text>
                    ) : null}
                  </View>
                  <Button
                    variant="danger"
                    fullWidth={false}
                    size="sm"
                    onPress={() => d.id != null && handleDelete(d.id)}
                    loading={deleteDecision.isPending}
                  >
                    Cambiar mi voto
                  </Button>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ---------- Styles ----------
// Todos los valores dimensionales vienen de tokens del DS.

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

  list: { gap: spacing.sp3 },

  card: {
    padding: spacing.sp4,
    borderRadius: radii.rLg,
    borderWidth: 2,
    gap: spacing.sp3,
  },
  cardHeader: { gap: spacing.sp1 },
  eleccionLabel: {
    ...typography.overline,
    fontWeight: "600",
  },
  candidatoName: {
    ...typography.h3,
    fontWeight: "700",
  },
  partido: typography.small,
});
