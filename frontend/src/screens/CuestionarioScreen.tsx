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

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getErrorMessage } from "../api/client";
// BUG-026: useTiposEleccion eliminado de CuestionarioScreen -- esTipoBase viene del store.
import {
  Button,
  Chip,
  CoachMarkTour,
  CuestionarioHeader,
  Divider,
  ScreenChrome,
  PreguntaInfoModal,
  RadioGroup,
  Spinner,
  useToast,
} from "../components";
import type { RootStackScreenProps } from "../navigation/types";
import {
  debeMostrarPeso,
  esPrimeraPregunta,
  esUltimaPregunta,
  formatSubtitleCuestionario,
  MIN_RESPUESTAS_PARA_RESULTADO,
  PESOS,
  puedeEnviar,
  separarOpciones,
} from "../services/cuestionario";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore, type RespuestaLocal } from "../store/cuestionario";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useIsDark, useThemeColors } from "../theme/useTheme";
import { getDimensionColorsForEje } from "../domain/dimensiones";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryClient";

/** Delay para que el layout del nuevo contenido se calcule antes de hacer
 *  scroll. Menos de ~100ms puede resultar en scrollToEnd calculando la
 *  posicion antes de que los chips de peso se hayan renderizado. */
const SCROLL_AFTER_LAYOUT_MS = 150;

export function CuestionarioScreen({
  navigation,
}: RootStackScreenProps<"Cuestionario">) {
  const c = useThemeColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const isGuest = useAuthStore((s) => s.isGuest);
  const {
    preguntas,
    currentIndex,
    respuestas,
    submitting,
    loading,
    tipoEleccionId,
    setRespuesta,
    setPeso,
    next,
    prev,
    submit,
  } = useCuestionarioStore();

  // BUG-026: esTipoBase viene del store (seteado en loadForTipoEleccion por el
  // caller que ya tiene el TipoEleccion completo). Elimina race condition con
  // useTiposEleccion() que podia devolver [] si el cache estaba vacio al submit.
  const esTipoBase = useCuestionarioStore((s) => s.esTipoBase);

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
          flexWrap: "wrap",
          gap: spacing.sp2,
          paddingHorizontal: spacing.sp4,
          paddingTop: spacing.sp3,
          paddingBottom: Math.max(insets.bottom, spacing.sp4),
          backgroundColor: c.bg,
        },
        backSlot: { flex: 1 },
        primarySlot: { flex: 2 },
        // Boton de resultados parciales: ocupa el ancho completo de la segunda
        // fila (gracias a flexWrap en footer) y centra el contenido.
        partialSlot: { width: "100%", alignItems: "center" },
      }),
    [c, insets.bottom],
  );

  // Interceptar back gesture/hardware back: pedir confirmacion si hay respuestas.
  // Sin esto, el usuario pierde el progreso de la sesion sin advertencia.
  const respondidas = Object.keys(respuestas).length;
  useEffect(() => {
    if (respondidas === 0) return;
    const unsub = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert(
        "\u00bfSalir del cuestionario?",
        "Tienes respuestas sin enviar. Si sales, tu progreso no se guardar\u00e1 en el servidor hasta que presiones Enviar.",
        [
          { text: "Seguir respondiendo", style: "cancel" },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsub;
  }, [navigation, respondidas]);

  if (loading) {
    return (
      <ScreenChrome>
        <View style={styles.emptyBox}>
          <Spinner size="large" />
          <Text style={styles.emptyText}>Cargando preguntas...</Text>
        </View>
      </ScreenChrome>
    );
  }

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
  // puedeEnviar valida TODAS las preguntas -- no solo la actual.
  // Necesario para que Enviar quede deshabilitado si el usuario volvio atras
  // y dejo una pregunta intermedia sin responder (BUG-012).
  const canSubmit = puedeEnviar(preguntas, respuestas);

  // TODO: cuando el backend exponga preguntas base vs extras por tipoEleccion,
  // reemplazar por la particion real. Por ahora todo es "base".
  const totalPreguntas = preguntas.length;
  // respondidas: definido antes del useEffect de beforeRemove (comparten scope).

  // Con 10 respuestas el backend ya puede calcular match con confianza media.
  // Solo aplica en cuestionarios especificos: en modo base el boton conduciria
  // a resultados de OTRA eleccion, lo cual es confuso (PRODUCT-001).
  const puedeVerResultadosParciales =
    !isGuest && !esTipoBase && respondidas >= MIN_RESPUESTAS_PARA_RESULTADO && !isLast;

  // Separo regulares y "No se" para poder insertar un Divider entre ellos
  // (UX-017). Ambos grupos comparten value / onChange para estado unificado.
  const opcionesLikertRegulares = opcionesRegulares
    .filter((op) => op.id != null)
    .map((op) => ({ value: op.id as number, label: op.texto ?? "" }));

  const opcionNoSeMapped =
    opcionNoSe?.id != null
      ? { value: opcionNoSe.id as number, label: opcionNoSe.texto ?? "No sé" }
      : null;

  // TASK-056: useCallback -- pantalla mas interactiva de la app, re-renders frecuentes.
  const handleSubmit = useCallback(async () => {
    try {
      await submit({ skipServer: isGuest });
      // BUG-043: invalidar cache de progreso + respuestas inmediatamente tras
      // submit para que el Home refleje el estado correcto al volver, sin
      // esperar a que el usuario navegue y regrese (que forzaba un refetch).
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: queryKeys.miProgreso });
        qc.invalidateQueries({ queryKey: queryKeys.misRespuestasAll });
      }
      navigation.replace("SubmitDone", { mode: esTipoBase ? "base" : "eleccion" });
    } catch (err) {
      toast.error("No pudimos guardar tus respuestas", getErrorMessage(err));
    }
  }, [submit, isGuest, qc, navigation, esTipoBase, toast]);

  /**
   * Selecciona una opcion de respuesta y, si va a aparecer la seccion de
   * importancia, hace scroll automatico para que sea visible sin que el
   * usuario tenga que bajar manualmente.
   *
   * El delay de 150ms deja que React termine el re-render (y el layout
   * recalcule la altura del ScrollView) antes de ejecutar el scroll.
   */
  const handleSelectRespuesta = useCallback((opcionId: number) => {
    setRespuesta(pregunta.id, opcionId);
    const vaAMostrarPeso = debeMostrarPeso(pregunta.opciones_respuesta, opcionId);
    if (vaAMostrarPeso) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, SCROLL_AFTER_LAYOUT_MS);
    }
  }, [setRespuesta, pregunta.id, pregunta.opciones_respuesta]);

  /** Vuelve al tope del scroll al cambiar de pregunta. Animado para una
   *  transicion suave; el cambio de contenido ocurre simultaneamente pero
   *  el retorno al tope con animacion mejora la orientacion espacial. */
  function scrollToTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <>
      <ScreenChrome>
      <View style={styles.root}>

        {/* Header sticky fuera del ScrollView (UX-015 + UX-016) */}
        <CuestionarioHeader
          title={pregunta.tipo_eleccion_nombre ?? "Cuestionario"}
          subtitle={formatSubtitleCuestionario(currentIndex, totalPreguntas)}
          respondidas={respondidas}
          totalPreguntas={totalPreguntas}
          onBack={() => navigation.goBack()}
          onInfo={() => setInfoOpen(true)}
        />

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={{ gap: spacing.sp2 }}>
          {pregunta.eje_tematico_display ? (
            <Text
              style={[
                styles.ejeLabel,
                // TASK-057: color semantico por eje (DS-08 getDimensionColorsForEje)
                // -- coherencia visual con el radar chart de DetalleCandidato.
                // Fallback a c.primary si el eje no tiene color en el DS.
                { color: getDimensionColorsForEje(pregunta.eje_tematico ?? "", isDark)?.text ?? c.primary },
              ]}
            >
              {pregunta.eje_tematico_display}
            </Text>
          ) : null}
          <Text style={styles.enunciado}>{pregunta.texto}</Text>
        </View>

        <View style={{ gap: spacing.sp2 }}>
          <Text style={styles.sectionLabel}>Tu postura</Text>

          {/* Opciones Likert regulares */}
          <RadioGroup<number>
            options={opcionesLikertRegulares}
            value={respuesta?.opcionElegidaId ?? null}
            onChange={handleSelectRespuesta}
            accessibilityLabel="Opciones de respuesta"
          />

          {/* UX-065: separador sutil, sin header extra para no parecer pregunta
              distinta. El Divider indica que "No se" es opcion especial dentro
              del mismo grupo (no escala Likert, sino abstencion). */}
          {opcionNoSeMapped ? (
            <>
              <Divider style={{ marginTop: spacing.sp2, marginBottom: spacing.sp1 }} />
              <RadioGroup<number>
                options={[opcionNoSeMapped]}
                value={respuesta?.opcionElegidaId ?? null}
                onChange={handleSelectRespuesta}
              />
            </>
          ) : null}
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
          <Button
            variant="secondary"
            onPress={() => { prev(); scrollToTop(); }}
            disabled={isFirst}
            accessibilityLabel="Atras"
            accessibilityHint="Vuelve a la pregunta anterior"
          >
            Atras
          </Button>
        </View>
        <View style={styles.primarySlot}>
          {isLast ? (
            <Button
              variant="success"
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              loading={submitting}
              accessibilityLabel="Enviar respuestas"
              accessibilityHint="Envia todas tus respuestas y calcula tu resultado"
            >
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
          ) : (
            <Button
              onPress={() => { next(); scrollToTop(); }}
              disabled={!canAdvance}
              accessibilityLabel="Siguiente pregunta"
              accessibilityHint="Guarda tu respuesta y avanza a la siguiente pregunta"
            >
              Siguiente
            </Button>
          )}
        </View>
        {puedeVerResultadosParciales ? (
          <View style={styles.partialSlot}>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
            >
              {`Ver resultados (${respondidas})`}
            </Button>
          </View>
        ) : null}
      </View>
      </View>
      </ScreenChrome>

      <PreguntaInfoModal
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        pregunta={pregunta}
      />

      <CoachMarkTour tourId="cuestionario" />
    </>
  );
}
