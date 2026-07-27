/**
 * SubmitDoneScreen: pantalla de confirmacion post-cuestionario.
 *
 * Dos modos:
 * - "eleccion" (default): user termino un cuestionario de eleccion especifica.
 *   CTA principal: "Ver mis matches" -> Resultados.
 * - "base": user termino el cuestionario de un TipoEleccion con es_base=true
 *   (Preguntas generales). Sus respuestas se aplican transversalmente al match
 *   de cualquier eleccion, pero el tipo base no tiene candidatos propios.
 *   CTA principal:
 *     - si hay al menos una eleccion especifica activa: "Ver mis matches en <nombre>" -> Resultados
 *     - si no: "Activar una eleccion" -> GestionElecciones
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Link } from "../components";
import { useTiposEleccion } from "../api/hooks";
import { useElectionsPrefsStore } from "../store/electionsPrefs";
import { partitionTipos } from "../store/electionsPrefs";
import { useCuestionarioStore } from "../store/cuestionario";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useThemeColors } from "../theme/useTheme";
import type { RootStackScreenProps } from "../navigation/types";

export function SubmitDoneScreen({
  route,
  navigation,
}: RootStackScreenProps<"SubmitDone">) {
  const mode = route.params?.mode ?? "eleccion";
  const c = useThemeColors();
  const reset = useCuestionarioStore((s) => s.reset);
  const setTipoEleccion = useCuestionarioStore((s) => s.setTipoEleccion);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const activeIds = useElectionsPrefsStore((s) => s.activeIds);

  const { data: tipos = [] } = useTiposEleccion();

  // Para modo "base": ubicar la primera eleccion especifica activa (si hay)
  // para poder llevar al user directo a sus matches enriquecidos.
  const primeraEspecificaActiva = useMemo(() => {
    if (mode !== "base") return null;
    const { activas } = partitionTipos(tipos, activeIds);
    return activas.find((t) => !t.es_base && t.id != null) ?? null;
  }, [mode, tipos, activeIds]);

  function handleVolver() {
    reset();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  function handleCtaEleccion() {
    navigation.replace("Resultados");
  }

  async function handleCtaBase() {
    if (primeraEspecificaActiva?.id != null) {
      // Cargamos la eleccion especifica y vamos a Resultados con matches enriquecidos.
      try {
        setTipoEleccion(primeraEspecificaActiva.id);
        await loadForTipoEleccion(primeraEspecificaActiva.id);
      } catch {
        // Fail-safe: aunque falle la carga, navegamos igual (Resultados hace su propio fetch).
      }
      navigation.replace("Resultados");
    } else {
      navigation.replace("GestionElecciones");
    }
  }

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: "center",
          padding: spacing.sp6,
          gap: spacing.sp4,
          backgroundColor: c.bg,
        },
        title: {
          ...typography.h1,
          color: c.success,
        },
        lead: {
          ...typography.body,
          fontSize: 17,
          color: c.text,
        },
        subtle: {
          ...typography.body,
          color: c.textSecondary,
        },
      }),
    [c],
  );

  if (mode === "base") {
    const ctaLabel = primeraEspecificaActiva
      ? `Ver mis matches en ${primeraEspecificaActiva.nombre}`
      : "Activar una eleccion";
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Listo!</Text>
        <Text style={styles.lead}>Guardamos tus respuestas generales.</Text>
        <Text style={styles.subtle}>
          Estas respuestas se aplican automaticamente al match de todas las elecciones que
          actives. Cuanto mas contestes, mas precisos son tus matches.
        </Text>
        <Button onPress={handleCtaBase}>{ctaLabel}</Button>
        <Link block onPress={handleVolver}>
          Volver al inicio
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Listo!</Text>
      <Text style={styles.lead}>Guardamos tus respuestas.</Text>
      <Text style={styles.subtle}>
        Ahora puedes ver que candidatos coinciden mas con tu forma de pensar.
      </Text>
      <Button onPress={handleCtaEleccion}>Ver mis matches</Button>
      <Link block onPress={handleVolver}>
        Volver al inicio
      </Link>
    </View>
  );
}
