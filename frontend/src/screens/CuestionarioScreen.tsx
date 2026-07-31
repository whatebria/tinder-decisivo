/**
 * Cuestionario: una pregunta por vez, con topnav breadcrumb + progress split.
 *
 * Basado en design-system-lowfi.html · Cuestionario.
 * Estructura:
 *   1. CuestionarioTopBar (back + eleccion + "N de M · base" + info)
 *   2. ProgressSplit (base / extras)
 *   3. Eje temático label + enunciado
 *   4. Opciones (RadioGroup)
 *   5. Selector de peso (chips)
 *   6. Footer: Atrás / Siguiente (o Enviar en la última)
 *
 * Nota: el backend no distingue preguntas base/extras. Modelamos todo como
 * "base" hasta que exista el flag. Cuando llegue, cambiamos la partición aquí.
 */

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getErrorMessage } from "../api/client";
import { useTiposEleccion } from "../api/hooks";
import {
  Button,
  Chip,
  CoachMarkTour,
  ScreenChrome,
  ScreenTopBar,
  PreguntaInfoModal,
  ProgressSplit,
  RadioGroup,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  debeMostrarPeso,
  esPrimeraPregunta,
  esUltimaPregunta,
  PESOS,
  separarOpciones,
} from "../services/cuestionario";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore, type RespuestaLocal } from "../store/cuestionario";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";

export function CuestionarioScreen({
  navigation,
}: RootStackScreenProps<"Cuestionario">) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [infoOpen, setInfoOpen] = useState(false);
  const isGuest = useAuthStore((s) => s.isGuest);
  const {
    preguntas,
    currentIndex,
    respuestas,
    submitting,
    tipoEleccionId,
    setRespuesta,
    setPeso,
    next,
    prev,
    submit,
  } = useCuestionarioStore();

  // Necesitamos saber si el tipo actual es es_base para redirigir al SubmitDone
  // en modo correcto (los tipos base no tienen candidatos propios).
  const { data: tipos = [] } = useTiposEleccion();
  const esTipoBase = useMemo(() => {
    if (tipoEleccionId == null) return false;
    return tipos.find((t) => t.id === tipoEleccionId)?.es_base ?? false;
  }, [tipos, tipoEleccionId]);

  const pregunta = preguntas[currentIndex];
  const isLast = esUltimaPregunta(currentIndex, preguntas.length);
  const isFirst = esPrimeraPregunta(currentIndex);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1 },
        scroll: { flex: 1, backgroundColor: c.bg },
        content: {
          padding: spacing.sp4,
          // paddingBottom generoso para que el ultimo elemento (chips de peso)
          // no quede tapado por el footer sticky al llegar al final del scroll.
          paddingBottom: spacing.sp9,
          gap: spacing.sp4,
        },
        emptyBox: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.sp5,
          gap: spacing.sp3,
        },
        emptyText: { color: c.textSecondary, textAlign: "center" },
        ejeLabel: {
          ...typography.overline,
          fontWeight: "700",
          color: c.primary,
        },
        enunciado: {
          ...typography.h2,
          fontWeight: "700",
          color: c.text,
        },
        sectionLabel: {
          ...typography.overline,
          textTransform: "none",
          letterSpacing: 0,
          color: c.textSecondary,
          fontWeight: "500",
        },
        weightRow: {
          flexDirection: "row",
          gap: spacing.sp2,
          flexWrap: "wrap",
        },
        // Footer sticky: siempre visible, nunca dentro del ScrollView.
        footer: {
          flexDirection: "row",
          gap: spacing.sp2,
          paddingHorizontal: spacing.sp4,
          paddingTop: spacing.sp3,
          // safe-area bottom: respeta el home indicator de iPhone.
          // Math.max garantiza padding minimo incluso en Android (insets.bottom = 0).
          paddingBottom: Math.max(insets.bottom, spacing.sp4),
          backgroundColor: c.bg,
        },
        backSlot: { flex: 1 },
        primarySlot: { flex: 2 },
      }),
    [c, insets.bottom],
  );

  if (!pregunta) {
    return (
      <ScreenChrome>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.emptyBox}>
          <Text style={styles.emptyText}>No hay preguntas cargadas.</Text>
          <Button onPress={() => navigation.goBack()}>Volver</Button>
        </ScrollView>
      </ScreenChrome>
    );
  }

  const respuesta: RespuestaLocal | undefined = respuestas[pregunta.id];
  const { regulares: opcionesRegulares, noSe: opcionNoSe } = separarOpciones(
    pregunta.opciones_respuesta,
  );
  const mostrarPeso = debeMostrarPeso(
    pregunta.opciones_respuesta,
    respuesta?.opcionElegidaId,
  );
  const canAdvance = Boolean(respuesta);

  // TODO: cuando el backend exponga preguntas base vs extras por tipoEleccion,
  // reemplazar por la particion real. Por ahora todo es "base".
  const totalPreguntas = preguntas.length;
  const respondidas = Object.keys(respuestas).length;

  const opcionesLikert = [
    ...opcionesRegulares
      .filter((op) => op.id != null)
      .map((op) => ({ value: op.id as number, label: op.texto ?? "" })),
    ...(opcionNoSe && opcionNoSe.id != null
      ? [{ value: opcionNoSe.id, label: opcionNoSe.texto ?? "No sé" }]
      : []),
  ];

  async function handleSubmit() {
    try {
      await submit({ skipServer: isGuest });
      navigation.replace("SubmitDone", { mode: esTipoBase ? "base" : "eleccion" });
    } catch (err) {
      toast.error("No pudimos guardar tus respuestas", getErrorMessage(err));
    }
  }

  return (
    <>
      <ScreenChrome>
      <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenTopBar
          title={pregunta.tipo_eleccion_nombre ?? "Cuestionario"}
          subtitle={`${currentIndex + 1} de ${totalPreguntas} · base`}
          onBack={() => navigation.goBack()}
          onInfo={() => setInfoOpen(true)}
        />

        <ProgressSplit
          baseDone={respondidas}
          baseTotal={totalPreguntas}
          extrasDone={0}
          extrasTotal={0}
          baseLabel={`Base (${totalPreguntas} preguntas)`}
          extrasLabel="Extras (próximamente)"
        />

        <View style={{ gap: spacing.sp2 }}>
          {pregunta.eje_tematico_display ? (
            <Text style={styles.ejeLabel}>{pregunta.eje_tematico_display}</Text>
          ) : null}
          <Text style={styles.enunciado}>{pregunta.texto}</Text>
        </View>

        <View style={{ gap: spacing.sp2 }}>
          <Text style={styles.sectionLabel}>Tu postura</Text>
          <RadioGroup<number>
            options={opcionesLikert}
            value={respuesta?.opcionElegidaId ?? null}
            onChange={(v) => setRespuesta(pregunta.id, v)}
            accessibilityLabel="Opciones de respuesta"
          />
        </View>

        {mostrarPeso && respuesta ? (
          <View style={{ gap: spacing.sp2 }}>
            <Text style={styles.sectionLabel}>¿Qué tan importante?</Text>
            <View style={styles.weightRow}>
              {PESOS.map((p) => (
                <Chip
                  key={p.value}
                  active={respuesta.peso === p.value}
                  onPress={() => setPeso(pregunta.id, p.value)}
                  accessibilityLabel={`Peso: ${p.label}`}
                >
                  {p.label}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer fuera del ScrollView: siempre visible, sin necesidad de scrollear.
           UX-014: mover aqui resuelve que los chips de peso empujen los botones
           fuera de pantalla. */}
      <View style={styles.footer}>
        <View style={styles.backSlot}>
          <Button variant="secondary" onPress={prev} disabled={isFirst}>
            Atrás
          </Button>
        </View>
        <View style={styles.primarySlot}>
          {isLast ? (
            <Button
              variant="success"
              onPress={handleSubmit}
              disabled={!canAdvance || submitting}
              loading={submitting}
            >
              {submitting ? "Enviando…" : "Enviar"}
            </Button>
          ) : (
            <Button onPress={next} disabled={!canAdvance}>
              Siguiente
            </Button>
          )}
        </View>
      </View>
      </View>
      </ScreenChrome>

      <PreguntaInfoModal
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        pregunta={pregunta as any}
      />

      <CoachMarkTour tourId="cuestionario" />
    </>
  );
}
